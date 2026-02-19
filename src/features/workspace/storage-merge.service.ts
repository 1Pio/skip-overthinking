import type { LocalDecision } from "../auth/storage/local.types";
import { loadDecisions, clearAll, saveDecision } from "../auth/storage/local.storage";
import { generateDecisionId } from "../auth/storage/utils";

/**
 * Payload for creating a decision in Convex.
 * Contains only of fields that Convex stores (excludes transient UI state).
 */
export type ConvexDecisionPayload = {
    title: string;
    description?: string;
    icon?: string;
    options: LocalDecision["options"];
    criteria: LocalDecision["criteria"];
    ratingsMatrix: LocalDecision["ratingsMatrix"];
    ratingInputMode: LocalDecision["ratingInputMode"];
    criterionWeights: LocalDecision["criterionWeights"];
};

/**
 * Result of merging local decisions into an authenticated account.
 */
export type MergeResult = {
    mergedCount: number;
};

/**
 * Resolve a conflict where a local decision ID conflicts with an existing decision.
 * Regenerates a UUID to ensure uniqueness.
 *
 * @param localDecision - The local decision with a potentially conflicting ID.
 * @returns The decision with a new unique ID if there was a conflict.
 */
export function resolveConflict(localDecision: LocalDecision): LocalDecision {
    // Generate a new UUID for local decision
    return {
        ...localDecision,
        id: generateDecisionId(),
    };
}

/**
 * Represents a decision that exists in Convex (simplified comparison structure).
 * Used for comparing against local decisions.
 */
export type ExistingConvexDecision = {
    _id: string;
    title: string;
    updatedAt: number;
};

/**
 * Merge local anonymous decisions into a Convex-backed account by comparing.
 *
 * Compares local decisions with existing Convex decisions to determine which are new.
 * Only uploads decisions that don't already exist in Convex (based on title + content comparison).
 *
 * @param createDecision - Callback that creates a single decision in Convex.
 *                          Should call a Convex create mutation with a decision data.
 * @param existingDecisions - Array of existing decisions from Convex for comparison.
 * @returns Promise resolving to a count of merged decisions.
 *
 * This function:
 * 1. Loads all local decisions from localStorage
 * 2. Deduplicates by ID (regenerates UUIDs for duplicates)
 * 3. Compares each local decision against existing Convex decisions
 * 4. Only uploads decisions that are truly new (title + timestamp don't match)
 * 5. Updates localStorage to track Convex IDs for merged decisions
 * 6. Does NOT clear local storage - keeps all decisions with updated IDs
 */
export async function mergeDecisions(
    createDecision: (decision: ConvexDecisionPayload) => Promise<unknown>,
    existingDecisions: ExistingConvexDecision[]
): Promise<MergeResult> {
    const localDecisions = loadDecisions();

    if (!localDecisions || Object.keys(localDecisions.decisions).length === 0) {
        return { mergedCount: 0 };
    }

    const entries = Object.values(localDecisions.decisions);
    const seenIds = new Set<string>();
    const deduped: LocalDecision[] = [];

    // Deduplicate by ID — if two locals share an ID, regenerate a second
    for (const decision of entries) {
        if (seenIds.has(decision.id)) {
            deduped.push(resolveConflict(decision));
        } else {
            seenIds.add(decision.id);
            deduped.push(decision);
        }
    }

    // Create a set of existing decision signatures for O(1) lookup
    // Signature is based on title + updatedAt to detect duplicates
    const existingSignatures = new Set(
        existingDecisions.map(
            (d) => `${d.title.toLowerCase()}-${d.updatedAt}`
        )
    );

    let mergedCount = 0;
    const decisionsToKeep: LocalDecision[] = [];

    for (const decision of deduped) {
        const signature = `${decision.decision.title.toLowerCase()}-${decision.updatedAt}`;

        // Check if this decision already exists in Convex
        if (existingSignatures.has(signature)) {
            // Decision already exists in Convex - keep local version with Convex ID
            const matchingConvex = existingDecisions.find(
                (d) =>
                    d.title.toLowerCase() === decision.decision.title.toLowerCase() &&
                    d.updatedAt === decision.updatedAt
            );
            
            if (matchingConvex) {
                // Update local decision to use Convex ID
                decisionsToKeep.push({
                    ...decision,
                    id: matchingConvex._id,
                });
            }
        } else {
            // New decision - upload to Convex
            try {
                const convexId = await createDecision({
                    title: decision.decision.title,
                    description: decision.decision.description,
                    icon: decision.decision.icon,
                    options: decision.options,
                    criteria: decision.criteria,
                    ratingsMatrix: decision.ratingsMatrix,
                    ratingInputMode: decision.ratingInputMode,
                    criterionWeights: decision.criterionWeights,
                });
                mergedCount++;

                // Update local decision with Convex ID for future reference
                if (convexId && typeof convexId === "string") {
                    decisionsToKeep.push({
                        ...decision,
                        id: convexId,
                    });
                } else {
                    decisionsToKeep.push(decision);
                }
            } catch (error) {
                console.error("Failed to merge decision:", decision.decision.title, error);
                // Keep local decision even if merge fails - user can retry
                decisionsToKeep.push(decision);
            }
        }
    }

    // Clear all decisions from localStorage and save back with updated IDs
    clearAll();
    for (const decision of decisionsToKeep) {
        saveDecision(decision);
    }

    return { mergedCount };
}
