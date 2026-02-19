import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useDraft } from "../decision/state/DraftProvider";
import { loadDecisions, deleteDecision } from "../auth/storage/local.storage";
import { getStorageWarning } from "../auth/storage/utils";
import { toast } from "sonner";
import type { LocalDecision } from "../auth/storage/local.types";
import { DecisionCard } from "./DecisionCard";
import { NewDecisionButton } from "./NewDecisionButton";
import { useAuth } from "../auth/auth.context";
import { useMergeOnSignIn } from "./hooks/useMergeOnSignIn";
import { SettingsModal } from "../auth/components/SettingsModal";
import { SignInModal } from "../auth/components/SignInModal";
import { User, LogIn } from "lucide-react";

/**
 * Workspace component - displays all stored decisions in a grid layout.
 *
 * Features:
 * - Loads decisions from Convex when authenticated, from localStorage otherwise
 * - Displays decisions as cards in a responsive grid
 * - New Decision button creates fresh decisions
 * - Clicking a decision card loads it into DraftProvider and navigates to wizard
 * - Sign-in/settings button at top right for auth state management
 * - Merges local decisions on sign-in
 */
export function Workspace() {
    const { initializeDraft, resetDraft } = useDraft();
    const navigate = useNavigate();
    const {
        isAuthenticated,
        isLoading: isAuthLoading,
        openSignInModal,
        openSettingsModal,
        closeSignInModal,
        closeSettingsModal,
        isSignInModalOpen,
        isSettingsModalOpen,
        user,
    } = useAuth();

    // Call merge-on-sign-in hook
    // This handles loading Convex decisions and caching them to localStorage
    useMergeOnSignIn();

    // Load decisions from localStorage or Convex
    const [decisions, setDecisions] = useState<LocalDecision[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        // If auth is still loading, wait
        if (isAuthLoading) return;

        // If authenticated, use Convex decisions (loaded via cacheFromConvex in useMergeOnSignIn)
        // If not authenticated, load from localStorage directly
        if (isAuthenticated) {
            // Decisions are cached from Convex by useMergeOnSignIn
            // Load from localStorage cache
            setIsLoading(true);
            setLoadError(null);
            try {
                const stored = loadDecisions();
                if (stored) {
                    const decisionList = Object.values(stored.decisions) as LocalDecision[];
                    // Sort by updatedAt (most recent first)
                    decisionList.sort((a, b) => b.updatedAt - a.updatedAt);
                    setDecisions(decisionList);
                } else {
                    setDecisions([]);
                }
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to load decisions:", error);
                setDecisions([]);
                setIsLoading(false);
                setLoadError("Failed to load decisions. Please refresh the page.");
            }
        } else if (!isAuthenticated) {
            // Load from localStorage for anonymous users
            setIsLoading(true);
            setLoadError(null);
            try {
                const stored = loadDecisions();
                if (stored) {
                    const decisionList = Object.values(stored.decisions) as LocalDecision[];
                    // Sort by updatedAt (most recent first)
                    decisionList.sort((a, b) => b.updatedAt - a.updatedAt);
                    setDecisions(decisionList);
                } else {
                    setDecisions([]);
                }
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to load decisions:", error);
                setDecisions([]);
                setIsLoading(false);
                setLoadError("Failed to load decisions. Please refresh the page.");
            }
        }
    }, [isAuthenticated, isAuthLoading]);

    // Check localStorage quota and show warning toast
    useEffect(() => {
        // Only check once per session
        const warningShownKey = "skip-overthinking:storage-warning-shown";
        const warningShown = sessionStorage.getItem(warningShownKey);

        if (warningShown) {
            return;
        }

        const warning = getStorageWarning();
        if (warning?.showWarning) {
            toast.warning(warning.message);
            sessionStorage.setItem(warningShownKey, "true");
        }
    }, []);

    // Handle clicking on a decision card
    const handleDecisionClick = useCallback(
        (decisionId: string) => {
            const decision = decisions.find((d) => d.id === decisionId);
            if (!decision) return;

            // Clear existing draft state
            resetDraft();

            // Load decision into DraftProvider
            const { id, createdAt, updatedAt, ...draftData } = decision;
            initializeDraft(draftData);

            // Set current draft ID for tracking
            localStorage.setItem("skip-overthinking:current-draft-id:v1", id);

            // Navigate to options step (or appropriate step based on completion)
            // For MVP, always start at /setup/options
            navigate("/setup/options");
        },
        [decisions, initializeDraft, navigate, resetDraft]
    );

    // Handle creating a new decision
    const handleNewDecision = useCallback(() => {
        // Clear existing draft state (both localStorage and in-memory)
        resetDraft();

        // Clear the current draft ID so we know we're creating new
        localStorage.removeItem("skip-overthinking:current-draft-id:v1");

        // Navigate to decision setup
        navigate("/setup/decision");
    }, [resetDraft, navigate]);

    // Handle deleting a decision
    const handleDeleteDecision = useCallback(
        (decisionId: string) => {
            const decision = decisions.find((d) => d.id === decisionId);
            if (!decision) return;

            const title = decision.decision.title || "Untitled Decision";

            // Confirm before deleting
            if (
                window.confirm(
                    `Are you sure you want to delete "${title}"? This action cannot be undone.`
                )
            ) {
                // Delete from localStorage
                deleteDecision(decisionId);

                // Refresh decisions list
                setDecisions((prev) => prev.filter((d) => d.id !== decisionId));

                toast.success(`Deleted "${title}"`);
            }
        },
        [decisions]
    );

    // Handle auth button click
    const handleAuthButtonClick = useCallback(() => {
        if (isAuthenticated) {
            openSettingsModal();
        } else {
            openSignInModal();
        }
    }, [isAuthenticated, openSettingsModal, openSignInModal]);

    if (isLoading || isAuthLoading) {
        return (
            <div className="workspace workspace--loading">
                <p>Loading decisions...</p>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="workspace workspace--error">
                <p>{loadError}</p>
                <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => window.location.reload()}
                >
                    Refresh Page
                </button>
            </div>
        );
    }

    const hasDecisions = decisions.length > 0;

    return (
        <div className="workspace">
            <div className="workspace__debug">
                <strong>Debug Info:</strong>
                <span>Auth State: {isAuthenticated ? 'Signed In' : 'Signed Out'}</span>
                <span>Auth Loading: {isAuthLoading ? 'Yes' : 'No'}</span>
                <span>User ID: {user?.id || 'N/A'}</span>
                <span>Decisions Count: {decisions.length}</span>
            </div>
            <header className="workspace__header">
                <div>
                    <h1>Decisions</h1>
                    {hasDecisions && <p>{decisions.length} decision{decisions.length !== 1 ? "s" : ""}</p>}
                </div>
                <button
                    type="button"
                    className="workspace__auth-btn"
                    onClick={handleAuthButtonClick}
                    aria-label={isAuthenticated ? "Open settings" : "Sign in"}
                >
                    {isAuthenticated ? (
                        <>
                            <User size={18} aria-hidden="true" />
                            <span>Settings</span>
                        </>
                    ) : (
                        <>
                            <LogIn size={18} aria-hidden="true" />
                            <span>Sign In</span>
                        </>
                    )}
                </button>
            </header>

            <div className="workspace__content">
                {hasDecisions ? (
                    <div className="workspace__grid">
                        {decisions.map((decision) => (
                            <DecisionCard
                                key={decision.id}
                                decision={decision}
                                onClick={handleDecisionClick}
                                onDelete={handleDeleteDecision}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="workspace__empty">
                        <p>No decisions yet. Create your first decision to get started.</p>
                    </div>
                )}

                <div className="workspace__actions">
                    <NewDecisionButton onClick={handleNewDecision} />
                </div>
            </div>

            {/* Auth modals */}
            <SignInModal isOpen={isSignInModalOpen} onClose={closeSignInModal} />
            <SettingsModal isOpen={isSettingsModalOpen} onClose={closeSettingsModal} />
        </div>
    );
}
