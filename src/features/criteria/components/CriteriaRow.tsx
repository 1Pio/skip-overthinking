import type { DraftCriterion } from "../state/criterion.types";

type CriteriaRowViewMode = "compact" | "rich";

type CriteriaRowProps = {
  criterion: DraftCriterion;
  index: number;
  total: number;
  viewMode: CriteriaRowViewMode;
  isSelecting: boolean;
  isSelected: boolean;
  onToggleSelected: (criterionId: string) => void;
  onEdit: (criterionId: string) => void;
  onDelete: (criterionId: string) => void;
  onMove: (criterionId: string, direction: "up" | "down") => void;
};

const criterionTypeLabel = (criterion: DraftCriterion): string =>
  criterion.type === "rating_1_20" ? "Rating (1-20)" : "Numeric measured";

const mappingStatusLabel = (criterion: DraftCriterion): string => {
  if (criterion.type === "rating_1_20") {
    return "Direct 1-20 desirability input";
  }

  const directionLabel =
    criterion.rawDirection === "lower_raw_better"
      ? "lower raw is better"
      : "higher raw is better";

  if (criterion.unit) {
    return `Raw values convert to desirability (${directionLabel}, unit: ${criterion.unit})`;
  }

  return `Raw values convert to desirability (${directionLabel})`;
};

export const CriteriaRow = ({
  criterion,
  index,
  total,
  viewMode,
  isSelecting,
  isSelected,
  onToggleSelected,
  onEdit,
  onDelete,
  onMove,
}: CriteriaRowProps) => {
  return (
    <li>
      <article aria-label={`Criterion ${index + 1}: ${criterion.title}`}>
        <header>
          <h4>
            {index + 1}. {criterion.title}
          </h4>
          <p>
            <strong>Type:</strong> {criterionTypeLabel(criterion)}
          </p>
          <p>
            <strong>Mapping:</strong> {mappingStatusLabel(criterion)}
          </p>
        </header>

        {viewMode === "rich" ? (
          <section aria-label={`Criterion details for ${criterion.title}`}>
            <p>{criterion.description ?? "No description provided."}</p>
            {criterion.type === "numeric_measured" ? (
              <p>
                <strong>Raw direction:</strong>{" "}
                {criterion.rawDirection === "lower_raw_better"
                  ? "Lower raw is better"
                  : "Higher raw is better"}
              </p>
            ) : null}
          </section>
        ) : null}

        {isSelecting ? (
          <label>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelected(criterion.id)}
            />
            Select {criterion.title}
          </label>
        ) : null}

        <div aria-label={`Reorder ${criterion.title}`}>
          <button
            type="button"
            onClick={() => onMove(criterion.id, "up")}
            disabled={index === 0 || isSelecting}
          >
            Move up
          </button>
          <button
            type="button"
            onClick={() => onMove(criterion.id, "down")}
            disabled={index === total - 1 || isSelecting}
          >
            Move down
          </button>
        </div>

        <div>
          <button
            type="button"
            onClick={() => onEdit(criterion.id)}
            disabled={isSelecting}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(criterion.id)}
            disabled={isSelecting}
          >
            Delete
          </button>
        </div>
      </article>
    </li>
  );
};
