import type { LocalDecision } from "../auth/storage/local.types";

type DecisionCardProps = {
    decision: LocalDecision;
    onClick: (id: string) => void;
    onDelete?: (id: string) => void;
};

/**
 * Format a timestamp as a relative or absolute date string.
 */
function formatLastUpdated(timestamp: number): string {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    // For older dates, show actual date
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });
}

/**
 * Truncate a string to a maximum length with ellipsis.
 */
function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 1) + "…";
}

/**
 * Decision card component for displaying decision summaries in the workspace grid.
 *
 * Shows title, description, icon, and metadata (options/criteria counts, last updated).
 * Supports click to open and optional delete action.
 */
export function DecisionCard({
    decision,
    onClick,
    onDelete,
}: DecisionCardProps) {
    const { id, decision: details, options, criteria, updatedAt } = decision;

    const handleClick = () => {
        onClick(id);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        onDelete?.(id);
    };

    const displayTitle = details.title || "Untitled Decision";
    const displayDescription = details.description
        ? truncate(details.description, 80)
        : "";
    const displayIcon = details.icon || "📋";

    return (
        <article
            className="decision-card"
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleClick();
                }
            }}
            aria-label={`Open decision: ${displayTitle}`}
        >
            <h3 className="decision-card__title">
                <span className="decision-card__icon">{displayIcon}</span>
                {displayTitle}
            </h3>

            {displayDescription && (
                <p className="decision-card__description">{displayDescription}</p>
            )}

            <div className="decision-card__meta">
                <span>{options.length} options</span>
                <span>{criteria.length} criteria</span>
                <span>{formatLastUpdated(updatedAt)}</span>
            </div>

            {onDelete && (
                <button
                    type="button"
                    className="decision-card__delete"
                    onClick={handleDeleteClick}
                    aria-label={`Delete decision: ${displayTitle}`}
                >
                    Delete
                </button>
            )}
        </article>
    );
}
