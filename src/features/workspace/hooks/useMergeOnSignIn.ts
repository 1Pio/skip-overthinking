import { useEffect, useRef } from "react";
import { useAuth } from "../../auth/auth.context";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { mergeDecisions, type ConvexDecisionPayload } from "../storage-merge.service";
import { cacheFromConvex, type ConvexDecision } from "../storage-sync.service";
import { toast } from "sonner";

/**
 * Hook that handles merging local decisions to Convex on sign-in
 * and caching Convex decisions for authenticated users.
 *
 * Behavior:
 * - When user signs in (transitions from not authenticated to authenticated):
 *   - Merges local decisions to Convex
 *   - Shows toast notification with merge count
 *   - Clears local storage after merge
 *
 * - For users already authenticated on load:
 *   - Caches Convex decisions to localStorage for offline access
 */
export function useMergeOnSignIn(): void {
    const { isAuthenticated, isLoading, user } = useAuth();

    // Track previous auth state to detect sign-in transition
    const wasAuthenticated = useRef(isAuthenticated);
    const hasMerged = useRef(false);
    const hasCached = useRef(false);

    // Mutation for creating decisions in Convex
    const createDecision = useMutation(api.decisions.create);

    // Query for listing decisions (only when authenticated)
    const convexDecisions = useQuery(
        api.decisions.list,
        isAuthenticated ? {} : "skip"
    );

    useEffect(() => {
        // Don't do anything while loading
        if (isLoading) return;

        // Handle sign-in transition (not authenticated -> authenticated)
        if (
            !wasAuthenticated.current &&
            isAuthenticated &&
            user?.id &&
            !hasMerged.current
        ) {
            hasMerged.current = true;

            // Merge local decisions to Convex
            mergeDecisions(async (decision: ConvexDecisionPayload) => {
                return createDecision(decision);
            })
                .then((result) => {
                    if (result.mergedCount > 0) {
                        toast.success(
                            `${result.mergedCount} decision${result.mergedCount === 1 ? "" : "s"} merged into your account`
                        );
                    }
                })
                .catch((error) => {
                    console.error("Merge failed:", error);
                    toast.error("Failed to merge decisions. Please try again.");
                });
        }

        // Update the ref for next render
        wasAuthenticated.current = isAuthenticated;
    }, [isAuthenticated, isLoading, user?.id, createDecision]);

    // Cache Convex decisions for authenticated users on load
    useEffect(() => {
        if (!isAuthenticated) {
            // Reset cache flag when signed out
            hasCached.current = false;
            return;
        }

        // Only cache if we have decisions and haven't cached yet
        if (convexDecisions && !hasCached.current) {
            try {
                cacheFromConvex(convexDecisions as ConvexDecision[]);
                hasCached.current = true;
            } catch (error) {
                console.error("Failed to cache Convex decisions:", error);
                toast.error("Failed to load decisions. Please refresh the page.");
            }
        }
    }, [isAuthenticated, convexDecisions]);
}
