import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

type User = { id: string } | null;

type AuthContextValue = {
    /** True when Convex auth reports the user is signed in. */
    isAuthenticated: boolean;
    /** True while the initial auth check is still in flight. */
    isLoading: boolean;
    /** Current user object with ID, or null if not authenticated. */
    user: User;

    // Auth actions -------------------------------------------------------------
    /** Opens the sign-in modal. */
    signIn: () => void;
    /** Signs out the current user from Convex. */
    signOut: () => void;
    /** Deletes the user's account and all associated data. */
    deleteAccount: () => Promise<void>;

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
    const { signOut: convexSignOut } = useAuthActions();

    // Query for current user (only when authenticated)
    const userQuery = useQuery(
        isAuthenticated ? api.users.getCurrentUser : "skip",
        {}
    );
    const user: User = isLoading ? null : (userQuery ?? null);

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

    // Auth action wrappers
    const signIn = useCallback(() => setSignInModalOpen(true), []);
    const signOut = useCallback(() => {
        void convexSignOut();
    }, [convexSignOut]);

    const deleteAccount = useCallback(async () => {
        // Account deletion is handled via the SettingsModal
        // which calls the deleteAccount mutation directly
        throw new Error("Use SettingsModal for account deletion");
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            isAuthenticated,
            isLoading,
            user,
            signIn,
            signOut,
            deleteAccount,
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
            user,
            signIn,
            signOut,
            deleteAccount,
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
