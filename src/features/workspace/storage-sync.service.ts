import type { LocalDecision } from "../auth/storage/local.types";
import { clearAll, saveDecision } from "../auth/storage/local.storage";

/**
 * Cache Convex decisions to localStorage for offline access.
 *
 * When signed in, Convex is the source of truth and localStorage is only a cache.
 * This function populates the cache from Convex data.
 *
 * @param convexDecisions - Array of decisions from Convex to cache locally.
 * @throws Error if saving to localStorage fails
 *
 * This function:
 * 1. Clears existing local cache
 * 2. Converts each Convex decision to LocalDecision format
 * 3. Saves to localStorage
 */
export function cacheFromConvex(convexDecisions: ConvexDecision[]): void {
    try {
        // Clear existing cache first
        clearAll();

        // Cache each Convex decision
        for (const convexDecision of convexDecisions) {
            const localDecision: LocalDecision = {
                id: convexDecision._id, // Use Convex ID for reference
                decision: {
                    title: convexDecision.title,
                    description: convexDecision.description ?? "",
                    icon: convexDecision.icon ?? "",
                },
                options: convexDecision.options,
                criteria: convexDecision.criteria,
                ratingsMatrix: convexDecision.ratingsMatrix,
                ratingInputMode: convexDecision.ratingInputMode,
                criterionWeights: convexDecision.criterionWeights,
                // Transient UI state - reset to defaults
                criteriaSelection: {
                    isSelecting: false,
                    selectedCriterionIds: [],
                },
                criteriaMultiDeleteUndo: null,
                createdAt: convexDecision.createdAt,
                updatedAt: convexDecision.updatedAt,
            };

            saveDecision(localDecision);
        }
    } catch (error) {
        console.error("Failed to cache Convex decisions:", error);
        throw new Error(
            error instanceof Error
                ? `Failed to cache decisions: ${error.message}`
                : "Failed to cache decisions"
        );
    }
}

/**
 * Clear the localStorage decision cache.
 *
 * Call this when signing out or when the cache needs to be invalidated.
 */
export function clearCache(): void {
    clearAll();
}

/**
 * Type representing a Convex decision document.
 * Matches the schema in convex/schema.ts.
 */
export type ConvexDecision = {
    _id: string;
    userId: string;
    title: string;
    description?: string;
    icon?: string;
    options: LocalDecision["options"];
    criteria: LocalDecision["criteria"];
    ratingsMatrix: LocalDecision["ratingsMatrix"];
    ratingInputMode: LocalDecision["ratingInputMode"];
    criterionWeights: LocalDecision["criterionWeights"];
    createdAt: number;
    updatedAt: number;
};
