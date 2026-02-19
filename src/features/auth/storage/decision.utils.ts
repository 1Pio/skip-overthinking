import type { DecisionDraft } from "../../decision/state/draft.types";
import type { LocalDecision } from "../storage/local.types";
import { generateDecisionId } from "./utils";

/**
 * Convert a DecisionDraft to a LocalDecision by adding ID and timestamps.
 * Strips transient UI state that shouldn't be persisted.
 *
 * @param draft - The draft state to convert
 * @param existingId - Optional existing decision ID (for updates)
 * @param existingCreatedAt - Optional existing creation timestamp (for updates)
 * @returns A LocalDecision ready to be saved
 */
export function draftToDecision(
    draft: DecisionDraft,
    existingId?: string,
    existingCreatedAt?: number
): LocalDecision {
    const now = Date.now();
    const id = existingId ?? generateDecisionId();
    const createdAt = existingCreatedAt ?? now;

    return {
        ...draft,
        id,
        createdAt,
        updatedAt: now,
    };
}

/**
 * Check if a draft has meaningful content (beyond defaults).
 *
 * @param draft - The draft state to check
 * @returns True if the draft has at least a title or some options/criteria
 */
export function isDraftEmpty(draft: DecisionDraft): boolean {
    return (
        !draft.decision.title.trim() &&
        !draft.decision.description.trim() &&
        draft.options.length === 0 &&
        draft.criteria.length === 0
    );
}
