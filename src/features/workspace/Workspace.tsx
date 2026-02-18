import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useDraft } from "../../decision/state/DraftProvider";
import { clearDraftStorage } from "../../decision/state/draft.storage";
import { loadDecisions } from "../../auth/storage/local.storage";
import type { LocalDecision } from "../../auth/storage/local.types";
import { DecisionCard } from "./DecisionCard";
import { NewDecisionButton } from "./NewDecisionButton";

/**
 * Workspace component - displays all stored decisions in a grid layout.
 *
 * Features:
 * - Loads decisions from localStorage (authenticated mode: loads from Convex cache)
 * - Displays decisions as cards in a responsive grid
 * - New Decision button creates fresh decisions
 * - Clicking a decision card loads it into DraftProvider and navigates to wizard
 *
 * For MVP: Loads from localStorage only. Full Convex integration deferred.
 */
export function Workspace() {
    const { setDraft } = useDraft();
    const navigate = useNavigate();
    const [decisions, setDecisions] = useState<LocalDecision[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load decisions from localStorage on mount
    useEffect(() => {
        setIsLoading(true);
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
        } catch {
            // If storage fails, show empty workspace
            setDecisions([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Handle clicking on a decision card
    const handleDecisionClick = useCallback(
        (decisionId: string) => {
            const decision = decisions.find((d) => d.id === decisionId);
            if (!decision) return;

            // Clear existing draft storage
            clearDraftStorage();

            // Load decision into DraftProvider
            const { id, createdAt, updatedAt, ...draftData } = decision;
            setDraft(draftData);

            // Navigate to options step (or appropriate step based on completion)
            // For MVP, always start at /setup/options
            navigate("/setup/options");
        },
        [decisions, setDraft, navigate]
    );

    // Handle creating a new decision
    const handleNewDecision = useCallback(() => {
        // Clear existing draft storage
        clearDraftStorage();

        // Navigate to decision setup
        navigate("/setup/decision");
    }, [navigate]);

    // Handle deleting a decision (optional - not required for MVP)
    const handleDeleteDecision = useCallback(
        (decisionId: string) => {
            // For MVP, delete can be implemented later
            console.log("Delete decision:", decisionId);
        },
        []
    );

    if (isLoading) {
        return (
            <div className="workspace workspace--loading">
                <p>Loading decisions...</p>
            </div>
        );
    }

    const hasDecisions = decisions.length > 0;

    return (
        <div className="workspace">
            <header className="workspace__header">
                <h1>Decisions</h1>
                {hasDecisions && <p>{decisions.length} decision{decisions.length !== 1 ? "s" : ""}</p>}
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
        </div>
    );
}
