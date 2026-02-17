import type { DraftCriterion } from "../../criteria/state/criterion.types";
import type { DraftOption } from "../../options/state/option.types";
import type { FillMissingReviewItem } from "../state/rating.types";

type FillMissingReviewPanelProps = {
  reviewItems: FillMissingReviewItem[];
  options: DraftOption[];
  criteria: DraftCriterion[];
  isOpen: boolean;
  onOpen: () => void;
  onCancel: () => void;
  onApply: () => void;
};

const findOptionTitle = (options: DraftOption[], optionId: string): string =>
  options.find((option) => option.id === optionId)?.title ?? optionId;

const findCriterionTitle = (criteria: DraftCriterion[], criterionId: string): string =>
  criteria.find((criterion) => criterion.id === criterionId)?.title ?? criterionId;

export const FillMissingReviewPanel = ({
  reviewItems,
  options,
  criteria,
  isOpen,
  onOpen,
  onCancel,
  onApply,
}: FillMissingReviewPanelProps) => {
  if (!isOpen) {
    return (
      <section className="fill-missing-panel" aria-label="Fill missing ratings">
        <button type="button" onClick={onOpen} disabled={reviewItems.length === 0}>
          Fill all missing with Neutral (10)
        </button>
        {reviewItems.length === 0 ? (
          <p role="status">No blank 1-20 rating cells to fill.</p>
        ) : (
          <p role="status">{reviewItems.length} blank 1-20 rating cells ready for review.</p>
        )}
      </section>
    );
  }

  return (
    <section className="fill-missing-panel fill-missing-panel--review" aria-label="Missing fill review">
      <p>
        Review {reviewItems.length} blank 1-20 cells before applying Neutral (10). Measured
        criteria are not auto-filled.
      </p>

      <ul className="fill-missing-panel__list">
        {reviewItems.map((item) => (
          <li key={`${item.optionId}:${item.criterionId}`}>
            <strong>{findOptionTitle(options, item.optionId)}</strong>
            <span> x </span>
            <span>{findCriterionTitle(criteria, item.criterionId)}</span>
          </li>
        ))}
      </ul>

      <div className="fill-missing-panel__actions">
        <button type="button" onClick={onApply}>
          Apply fill
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </section>
  );
};
