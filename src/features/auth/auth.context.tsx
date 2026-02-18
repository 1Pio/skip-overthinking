import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { useConvexAuth } from "convex/react";

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

type AuthContextValue = {
    /** True when Convex auth reports the user is signed in. */
    isAuthenticated: boolean;
    /** True while the initial auth check is still in flight. */
    isLoading: boolean;

    // Modal controls -----------------------------------------------------------
    isSignInModalOpen: boolean;
    openSignInModal: () => void;
    closeSignInModal: () => void;

    isSettingsModalOpen: boolean;
    openSettingsModal: () => void;
    closeSettingsModal: () => void;

    // Sync error ---------------------------------------------------------------
    syncError: Error | null;
    clearSyncError: () => void;
    isSyncing: boolean;
    setSyncing: (v: boolean) => void;
    setSyncError: (err: Error | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useConvexAuth();

    // Modal state
    const [isSignInModalOpen, setSignInModalOpen] = useState(false);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);

    // Sync state
    const [syncError, setSyncError] = useState<Error | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const openSignInModal = useCallback(() => setSignInModalOpen(true), []);
    const closeSignInModal = useCallback(() => setSignInModalOpen(false), []);
    const openSettingsModal = useCallback(() => setSettingsModalOpen(true), []);
    const closeSettingsModal = useCallback(() => setSettingsModalOpen(false), []);
    const clearSyncError = useCallback(() => setSyncError(null), []);
    const setSyncing = useCallback((v: boolean) => setIsSyncing(v), []);

    const value = useMemo<AuthContextValue>(
        () => ({
            isAuthenticated,
            isLoading,
            isSignInModalOpen,
            openSignInModal,
            closeSignInModal,
            isSettingsModalOpen,
            openSettingsModal,
            closeSettingsModal,
            syncError,
            clearSyncError,
            isSyncing,
            setSyncing,
            setSyncError,
        }),
        [
            isAuthenticated,
            isLoading,
            isSignInModalOpen,
            openSignInModal,
            closeSignInModal,
            isSettingsModalOpen,
            openSettingsModal,
            closeSettingsModal,
            syncError,
            clearSyncError,
            isSyncing,
            setSyncing,
        ]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
}
