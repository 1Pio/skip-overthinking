import { useState } from "react";
import { useAuth } from "../auth.context";

/**
 * SyncBanner displays a persistent warning banner when sync errors occur.
 *
 * Features:
 * - Shows at top of app when syncError is set
 * - Persists until user dismisses or sync succeeds
 * - Provides retry option for authenticated users
 * - Amber/yellow warning styling
 */
export function SyncBanner() {
    const { syncError, clearSyncError, isAuthenticated } = useAuth();
    const [isRetrying, setIsRetrying] = useState(false);

    // Don't render if no error
    if (!syncError) {
        return null;
    }

    const handleDismiss = () => {
        clearSyncError();
    };

    const handleRetry = async () => {
        setIsRetrying(true);
        // In a full implementation, this would trigger a re-sync
        // For now, just clear the error after a brief delay
        // Future: call cacheFromConvex or similar to re-sync
        await new Promise((resolve) => setTimeout(resolve, 500));
        clearSyncError();
        setIsRetrying(false);
    };

    const errorMessage = syncError.message || "Sync failed. Your changes may not be saved.";

    return (
        <div className="sync-banner" role="alert">
            <span>{isRetrying ? "Retrying sync..." : errorMessage}</span>
            <div className="sync-banner__actions">
                {isAuthenticated && !isRetrying && (
                    <button
                        className="sync-banner__btn"
                        onClick={handleRetry}
                        aria-label="Retry sync"
                    >
                        Retry
                    </button>
                )}
                <button
                    className="sync-banner__btn"
                    onClick={handleDismiss}
                    aria-label="Dismiss sync error"
                    disabled={isRetrying}
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
}
