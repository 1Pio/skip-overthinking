import type { DraftCriterion } from "../state/criterion.types";

type CriteriaDeleteModalProps = {
  criteria: DraftCriterion[];
  targetCriterionIds: string[];
  onCancel: () => void;
  onConfirm: () => void;
};

const selectedCriteria = (
  criteria: DraftCriterion[],
  targetCriterionIds: string[],
): DraftCriterion[] => {
  const idSet = new Set(targetCriterionIds);
  return criteria.filter((criterion) => idSet.has(criterion.id));
};

export const CriteriaDeleteModal = ({
  criteria,
  targetCriterionIds,
  onCancel,
  onConfirm,
}: CriteriaDeleteModalProps) => {
  const matches = selectedCriteria(criteria, targetCriterionIds);

  if (matches.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="criteria-delete-heading" role="dialog" aria-modal="true">
      <h4 id="criteria-delete-heading">
        {matches.length === 1 ? "Delete criterion?" : `Delete ${matches.length} criteria?`}
      </h4>
      <p>
        {matches.length === 1
          ? "This criterion will be removed from this decision."
          : "These criteria will be removed from this decision."}
      </p>
      <p>
        You can undo this immediately after deleting. If you dismiss the undo toast, deletion is
        permanent.
      </p>

      <p>Preview:</p>
      <ul>
        {matches.map((criterion) => (
          <li key={criterion.id}>{criterion.title}</li>
        ))}
      </ul>

      <div>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" onClick={onConfirm}>
          Delete
        </button>
      </div>
    </section>
  );
};
