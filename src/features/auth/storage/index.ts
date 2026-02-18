// Public API — local storage service
export {
    loadDecisions,
    loadDecision,
    saveDecision,
    deleteDecision,
    clearAll,
    setCurrentDraftId,
    getCurrentDraftId,
} from "./local.storage";

// Utilities
export {
    generateDecisionId,
    checkQuota,
    getStorageUsed,
    getStorageWarning,
    formatBytes,
} from "./utils";
export type { QuotaInfo, StorageWarning } from "./utils";

// Types
export type { LocalDecision, LocalDecisions, StorageErrorType } from "./local.types";
export { LocalStorageKeys, StorageError } from "./local.types";
