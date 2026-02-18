import type { LocalDecision } from "../auth/storage/local.types";
import { loadDecisions, clearAll } from "../auth/storage/local.storage";
import { generateDecisionId } from "../auth/storage/utils";

/**
 * Payload for creating a decision in Convex.
 * Contains only the fields that Convex stores (excludes transient UI state).
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
 * Regenerates the UUID to ensure uniqueness.
 *
 * @param localDecision - The local decision with a potentially conflicting ID.
 * @returns The decision with a new unique ID if there was a conflict.
 */
export function resolveConflict(localDecision: LocalDecision): LocalDecision {
    // Generate a new UUID for the local decision
    return {
        ...localDecision,
        id: generateDecisionId(),
    };
}

/**
 * Merge local anonymous decisions into a Convex-backed account.
 *
 * @param createDecision - Callback that creates a single decision in Convex.
 *                          Should call the Convex create mutation with the decision data.
 * @returns Promise resolving to the count of merged decisions.
 *
 * This function:
 * 1. Loads all local decisions from localStorage
 * 2. Deduplicates by ID (regenerates UUIDs for duplicates)
 * 3. Creates each decision in Convex via the provided callback
 * 4. Clears local storage after successful merge
 */
export async function mergeDecisions(
    createDecision: (decision: ConvexDecisionPayload) => Promise<unknown>
): Promise<MergeResult> {
    const localDecisions = loadDecisions();

    if (!localDecisions || Object.keys(localDecisions.decisions).length === 0) {
        return { mergedCount: 0 };
    }

    const entries = Object.values(localDecisions.decisions);
    const seenIds = new Set<string>();
    const deduped: LocalDecision[] = [];

    // Deduplicate by ID — if two locals share an ID, regenerate the second
    for (const decision of entries) {
        if (seenIds.has(decision.id)) {
            deduped.push(resolveConflict(decision));
        } else {
            seenIds.add(decision.id);
            deduped.push(decision);
        }
    }

    let mergedCount = 0;

    for (const decision of deduped) {
        try {
            // Create decision in Convex - pass all relevant fields
            // Note: Convex generates its own ID and timestamps
            // Map from LocalDecision.decision to Convex flat structure
            await createDecision({
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
        } catch (error) {
            console.error("Failed to merge decision:", decision.decision.title, error);
            // Continue with remaining decisions even if one fails
        }
    }

    // Clear local storage after successful merge
    if (mergedCount > 0) {
        clearAll();
    }

    return { mergedCount };
}
