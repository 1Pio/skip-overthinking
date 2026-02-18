type NewDecisionButtonProps = {
    onClick: () => void;
};

/**
 * New decision button component for creating new decisions in the workspace.
 *
 * Displays a prominent dashed-border card with a plus icon and "New Decision" text.
 * Designed to stand out in the workspace grid and encourage decision creation.
 */
export function NewDecisionButton({ onClick }: NewDecisionButtonProps) {
    const handleClick = () => {
        onClick();
    };

    return (
        <button
            type="button"
            className="new-decision-btn"
            onClick={handleClick}
            aria-label="Create new decision"
        >
            <span className="new-decision-btn__icon" aria-hidden="true">
                +
            </span>
            <span>New Decision</span>
        </button>
    );
}
