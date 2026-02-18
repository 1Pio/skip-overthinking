import type { DecisionDraft } from "../../decision/state/draft.types";

/** A persisted decision extending the draft state with identity and timestamps. */
export type LocalDecision = DecisionDraft & {
    /** Unique decision identifier (UUID). */
    id: string;
    /** ISO-epoch timestamp of initial creation. */
    createdAt: number;
    /** ISO-epoch timestamp of most recent update. */
    updatedAt: number;
};

/** Top-level localStorage structure for all stored decisions. */
export type LocalDecisions = {
    decisions: Record<string, LocalDecision>;
    lastSyncedAt: number | null;
};

/** Well-known localStorage key constants (versioned to allow migration). */
export const LocalStorageKeys = {
    DECISIONS: "skip-overthinking:decisions:v1",
    CURRENT_DRAFT_ID: "skip-overthinking:current-draft-id:v1",
} as const;

/** Discriminated storage error types for structured error handling. */
export type StorageErrorType = "QUOTA_EXCEEDED" | "NOT_FOUND" | "PARSE_ERROR";

export class StorageError extends Error {
    constructor(
        public readonly type: StorageErrorType,
        message: string
    ) {
        super(message);
        this.name = "StorageError";
    }
}
