import { useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { DecisionDraft } from "../../decision/state/draft.types";
import { useAuth } from "../../auth/auth.context";
import { toast } from "sonner";
import {
    draftToDecision,
    isDraftEmpty,
} from "../../auth/storage/decision.utils";
import {
    saveDecision as saveLocalDecision,
    loadDecision as loadLocalDecision,
} from "../../auth/storage/local.storage";
import { LocalStorageKeys } from "../../auth/storage/local.types";

export type SaveDecisionResult = {
    success: boolean;
    decisionId: string;
    isNewDecision: boolean;
};

/**
 * Hook for saving decisions with dual-mode support (localStorage + Convex).
 *
 * - Anonymous users: Saves to localStorage only
 * - Authenticated users: Saves to Convex and caches to localStorage
 * - Editing: Updates existing decision if ID is tracked
 * - Creating: Generates new ID if no ID is tracked
 *
 * @returns Object with saveDecision function
 */
export function useSaveDecision() {
    const { isAuthenticated, user, setSyncing, setSyncError } = useAuth();
    const createDecisionMutation = useMutation(api.decisions.create);
    const updateDecisionMutation = useMutation(api.decisions.update);

    const saveDecision = useCallback(
        async (draft: DecisionDraft): Promise<SaveDecisionResult> => {
            // Check if draft is empty
            if (isDraftEmpty(draft)) {
                toast.error("Please add a title or some content before saving.");
                return {
                    success: false,
                    decisionId: "",
                    isNewDecision: false,
                };
            }

            // Get current draft ID to determine if we're creating or updating
            const currentDraftId = localStorage.getItem(
                LocalStorageKeys.CURRENT_DRAFT_ID
            );

            const isNewDecision = !currentDraftId;

            // Convert draft to decision format
            let savedDecision: ReturnType<typeof draftToDecision>;

            if (currentDraftId) {
                // Editing existing decision - load it to preserve createdAt
                const existingDecision = loadLocalDecision(currentDraftId);
                if (existingDecision) {
                    savedDecision = draftToDecision(
                        draft,
                        currentDraftId,
                        existingDecision.createdAt
                    );
                } else {
                    // Existing ID but not found in storage - treat as new
                    savedDecision = draftToDecision(draft);
                }
            } else {
                // Creating new decision
                savedDecision = draftToDecision(draft);
            }

            // Save to localStorage (always, for offline access)
            saveLocalDecision(savedDecision);

            // Save to Convex if authenticated
            if (isAuthenticated && user?.id) {
                setSyncing(true);
                try {
                    const convexPayload = {
                        title: savedDecision.decision.title,
                        description: savedDecision.decision.description,
                        icon: savedDecision.decision.icon,
                        options: savedDecision.options,
                        criteria: savedDecision.criteria,
                        ratingsMatrix: savedDecision.ratingsMatrix,
                        ratingInputMode: savedDecision.ratingInputMode,
                        criterionWeights: savedDecision.criterionWeights,
                    };

                    if (isNewDecision) {
                        // Create new decision in Convex
                        await createDecisionMutation(convexPayload);
                    } else {
                        // Update existing decision in Convex
                        await updateDecisionMutation({
                            id: savedDecision.id,
                            ...convexPayload,
                        });
                    }

                    setSyncError(null);
                } catch (error) {
                    console.error("Failed to save decision to Convex:", error);
                    setSyncError(
                        error instanceof Error
                            ? error
                            : new Error("Failed to save to cloud")
                    );
                    toast.error(
                        "Saved locally, but failed to sync to cloud. Check your connection."
                    );
                    // Still return success since localStorage save succeeded
                } finally {
                    setSyncing(false);
                }
            }

            // Update the current draft ID
            localStorage.setItem(
                LocalStorageKeys.CURRENT_DRAFT_ID,
                savedDecision.id
            );

            // Show success toast
            if (isNewDecision) {
                toast.success("Decision saved successfully!");
            } else {
                toast.success("Decision updated successfully!");
            }

            return {
                success: true,
                decisionId: savedDecision.id,
                isNewDecision,
            };
        },
        [
            isAuthenticated,
            user,
            createDecisionMutation,
            updateDecisionMutation,
            setSyncing,
            setSyncError,
        ]
    );

    return { saveDecision };
}
