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

// Types
export type { LocalDecision, LocalDecisions, StorageErrorType } from "./local.types";
export { LocalStorageKeys, StorageError } from "./local.types";
