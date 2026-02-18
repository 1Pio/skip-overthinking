const STORAGE_LIMIT_BYTES = 5 * 1024 * 1024; // 5 MB

// ---------------------------------------------------------------------------
// UUID generation
// ---------------------------------------------------------------------------

/** Generate a unique decision ID using crypto.randomUUID with fallback. */
export function generateDecisionId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    // Fallback for older browsers
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// ---------------------------------------------------------------------------
// Storage usage
// ---------------------------------------------------------------------------

/** Calculate total bytes used across all localStorage keys (UTF-16 encoding). */
export function getStorageUsed(): number {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
            // UTF-16: each char = 2 bytes. Keys and values both count.
            total += (key.length + (localStorage.getItem(key)?.length ?? 0)) * 2;
        }
    }
    return total;
}

// ---------------------------------------------------------------------------
// Quota checking
// ---------------------------------------------------------------------------

export type QuotaInfo = {
    safe: boolean;
    used: number;
    limit: number;
    remaining: number;
};

/**
 * Check whether localStorage can safely accommodate additional bytes.
 * @param additionalBytes Projected bytes to be written (default 0).
 */
export function checkQuota(additionalBytes = 0): QuotaInfo {
    const used = getStorageUsed();
    const remaining = STORAGE_LIMIT_BYTES - (used + additionalBytes);
    return {
        safe: remaining >= 0,
        used,
        limit: STORAGE_LIMIT_BYTES,
        remaining: Math.max(0, remaining),
    };
}

// ---------------------------------------------------------------------------
// Storage warnings
// ---------------------------------------------------------------------------

export type StorageWarning = {
    showWarning: boolean;
    message: string;
};

/**
 * Returns a warning object when storage exceeds 80% or 90% of the 5 MB limit.
 * Returns null when usage is comfortable.
 */
export function getStorageWarning(): StorageWarning | null {
    const { used, limit } = checkQuota();
    const ratio = used / limit;

    if (ratio > 0.9) {
        return {
            showWarning: true,
            message:
                "Storage is nearly full. Delete older decisions or sign in for cloud storage.",
        };
    }
    if (ratio > 0.8) {
        return {
            showWarning: true,
            message: "Storage is getting full. Consider deleting older decisions.",
        };
    }
    return null;
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

/** Format a byte count into a human-readable string (KB / MB). */
export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
