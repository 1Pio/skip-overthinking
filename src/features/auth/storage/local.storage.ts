import {
    LocalStorageKeys,
    StorageError,
    type LocalDecision,
    type LocalDecisions,
} from "./local.types";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function readStore(): LocalDecisions {
    try {
        const raw = localStorage.getItem(LocalStorageKeys.DECISIONS);
        if (!raw) return { decisions: {}, lastSyncedAt: null };
        const parsed = JSON.parse(raw) as LocalDecisions;
        if (!parsed || typeof parsed.decisions !== "object") {
            return { decisions: {}, lastSyncedAt: null };
        }
        return parsed;
    } catch {
        return { decisions: {}, lastSyncedAt: null };
    }
}

function writeStore(store: LocalDecisions): void {
    try {
        const serialized = JSON.stringify(store);
        localStorage.setItem(LocalStorageKeys.DECISIONS, serialized);
    } catch (err: unknown) {
        if (
            err instanceof DOMException &&
            (err.name === "QuotaExceededError" || err.code === 22)
        ) {
            throw new StorageError(
                "QUOTA_EXCEEDED",
                "localStorage quota exceeded. Delete older decisions or sign in for cloud storage."
            );
        }
        throw err;
    }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Load all stored decisions. Returns null if storage is empty or corrupt. */
export function loadDecisions(): LocalDecisions | null {
    const store = readStore();
    if (Object.keys(store.decisions).length === 0 && store.lastSyncedAt === null) {
        return null;
    }
    return store;
}

/** Load a single decision by ID. Returns null if not found. */
export function loadDecision(id: string): LocalDecision | null {
    const store = readStore();
    return store.decisions[id] ?? null;
}

/** Save (create or update) a decision. Updates the `updatedAt` timestamp. */
export function saveDecision(decision: LocalDecision): void {
    const store = readStore();
    store.decisions[decision.id] = {
        ...decision,
        updatedAt: Date.now(),
    };
    writeStore(store);
}

/** Delete a decision by ID. Returns true if it was found and deleted. */
export function deleteDecision(id: string): boolean {
    const store = readStore();
    if (!(id in store.decisions)) return false;
    delete store.decisions[id];
    writeStore(store);
    return true;
}

/** Remove all decisions and the current-draft pointer from localStorage. */
export function clearAll(): void {
    localStorage.removeItem(LocalStorageKeys.DECISIONS);
    localStorage.removeItem(LocalStorageKeys.CURRENT_DRAFT_ID);
}

/** Set the currently-active draft decision ID. Pass null to clear. */
export function setCurrentDraftId(id: string | null): void {
    if (id === null) {
        localStorage.removeItem(LocalStorageKeys.CURRENT_DRAFT_ID);
    } else {
        localStorage.setItem(LocalStorageKeys.CURRENT_DRAFT_ID, id);
    }
}

/** Get the currently-active draft decision ID, or null if none. */
export function getCurrentDraftId(): string | null {
    return localStorage.getItem(LocalStorageKeys.CURRENT_DRAFT_ID);
}
