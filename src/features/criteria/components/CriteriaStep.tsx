import { type FormEvent, useMemo, useState } from "react";

import { useDraft } from "../../decision/state/DraftProvider";
import {
  criterionAdded,
  criterionEdited,
  criterionMultiDeleted,
  criterionMultiDeleteUndone,
  criterionReordered,
  criterionSelectionModeCleared,
  criterionSelectionModeEntered,
} from "../state/criterion.actions";
import {
  hasMinimumCriteria,
  isCriteriaStepComplete,
} from "../state/criterionPrereq";
import type {
  CriterionDraftInput,
  DraftCriterion,
  DraftCriterionRawDirection,
  DraftCriterionType,
} from "../state/criterion.types";
import { CriteriaDeleteModal } from "./CriteriaDeleteModal";
import { CriteriaList } from "./CriteriaList";
import { CriteriaUndoToast } from "./CriteriaUndoToast";

type CriteriaStepProps = {
  onContinue: () => void;
};

type CriteriaFormState = {
  title: string;
  description: string;
  type: DraftCriterionType;
  rawDirection: DraftCriterionRawDirection;
  unit: string;
};

const minimumCriteriaMessage = "Add at least 1 criterion to continue.";

const createDefaultFormState = (): CriteriaFormState => ({
  title: "",
  description: "",
  type: "rating_1_20",
  rawDirection: "higher_raw_better",
  unit: "",
});

const createFormStateFromCriterion = (criterion: DraftCriterion): CriteriaFormState => ({
  title: criterion.title,
  description: criterion.description ?? "",
  type: criterion.type,
  rawDirection:
    criterion.type === "numeric_measured"
      ? criterion.rawDirection
      : "higher_raw_better",
  unit: criterion.type === "numeric_measured" ? criterion.unit ?? "" : "",
});

const toDraftInput = (form: CriteriaFormState): CriterionDraftInput => {
  if (form.type === "numeric_measured") {
    return {
      type: "numeric_measured",
      title: form.title,
      description: form.description,
      rawDirection: form.rawDirection,
      unit: form.unit,
    };
  }

  return {
    type: "rating_1_20",
    title: form.title,
    description: form.description,
  };
};

const selectionMessage = (count: number): string =>
  count === 1 ? "1 criterion selected" : `${count} criteria selected`;

type DeleteRequest = {
  criterionIds: string[];
};

export const CriteriaStep = ({ onContinue }: CriteriaStepProps) => {
  const {
    draft: { criteria, criteriaSelection, criteriaMultiDeleteUndo },
    dispatch,
  } = useDraft();
  const [viewMode, setViewMode] = useState<"compact" | "rich">("compact");
  const [newCriterionForm, setNewCriterionForm] = useState<CriteriaFormState>(
    createDefaultFormState,
  );
  const [editingCriterionId, setEditingCriterionId] = useState<string | null>(null);
  const [editingCriterionForm, setEditingCriterionForm] =
    useState<CriteriaFormState>(createDefaultFormState);
  const [deleteRequest, setDeleteRequest] = useState<DeleteRequest | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);

  const orderedCriteria = useMemo(
    () => [...criteria].sort((left, right) => left.order - right.order),
    [criteria],
  );
  const canContinue = hasMinimumCriteria(criteria) && isCriteriaStepComplete(criteria);
  const selectedCriterionIds = criteriaSelection.selectedCriterionIds;

  const handleCreateCriterion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(criterionAdded(criteria, toDraftInput(newCriterionForm)));
    setNewCriterionForm(createDefaultFormState());
  };

  const handleStartEdit = (criterionId: string) => {
    const criterion = criteria.find((item) => item.id === criterionId);
    if (!criterion) {
      return;
    }

    setEditingCriterionId(criterionId);
    setEditingCriterionForm(createFormStateFromCriterion(criterion));
  };

  const handleSaveEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingCriterionId) {
      return;
    }

    const input = toDraftInput(editingCriterionForm);

    dispatch(
      criterionEdited(criteria, {
        id: editingCriterionId,
        ...input,
      }),
    );
    setEditingCriterionId(null);
  };

  const handleToggleSelectionMode = () => {
    if (criteriaSelection.isSelecting) {
      dispatch(criterionSelectionModeCleared());
      return;
    }

    dispatch(criterionSelectionModeEntered([]));
  };

  const handleToggleSelected = (criterionId: string) => {
    const isSelected = selectedCriterionIds.includes(criterionId);
    const nextIds = isSelected
      ? selectedCriterionIds.filter((id) => id !== criterionId)
      : [...selectedCriterionIds, criterionId];

    dispatch(criterionSelectionModeEntered(nextIds));
  };

  const handleSelectAll = () => {
    dispatch(criterionSelectionModeEntered(orderedCriteria.map((criterion) => criterion.id)));
  };

  const handleOpenDeleteModal = (criterionId: string) => {
    setDeleteRequest({ criterionIds: [criterionId] });
  };

  const handleOpenBulkDeleteModal = () => {
    if (selectedCriterionIds.length === 0) {
      return;
    }

    setDeleteRequest({ criterionIds: selectedCriterionIds });
  };

  const handleConfirmDelete = () => {
    if (!deleteRequest || deleteRequest.criterionIds.length === 0) {
      return;
    }

    dispatch(criterionMultiDeleted(criteria, deleteRequest.criterionIds));
    setDeleteRequest(null);
    setShowUndoToast(true);
    if (editingCriterionId && deleteRequest.criterionIds.includes(editingCriterionId)) {
      setEditingCriterionId(null);
    }
  };

  const handleUndoDelete = () => {
    if (!criteriaMultiDeleteUndo) {
      return;
    }

    dispatch(criterionMultiDeleteUndone(criteria, criteriaMultiDeleteUndo));
    setShowUndoToast(false);
  };

  return (
    <section aria-labelledby="criteria-step-heading">
      <h3 id="criteria-step-heading">Author criteria</h3>
      <p>
        Keep criteria phrased as desirability outcomes so higher always means better in the
        final ranking.
      </p>

      <div aria-label="Criteria display mode">
        <button
          type="button"
          onClick={() => setViewMode("compact")}
          disabled={viewMode === "compact"}
        >
          Compact rows
        </button>
        <button
          type="button"
          onClick={() => setViewMode("rich")}
          disabled={viewMode === "rich"}
        >
          Rich rows
        </button>
      </div>

      <div aria-label="Selection controls">
        <button type="button" onClick={handleToggleSelectionMode}>
          {criteriaSelection.isSelecting ? "Exit selection" : "Select multiple"}
        </button>
        {criteriaSelection.isSelecting ? (
          <>
            <button type="button" onClick={handleSelectAll} disabled={orderedCriteria.length === 0}>
              Select all
            </button>
            <button
              type="button"
              onClick={handleOpenBulkDeleteModal}
              disabled={selectedCriterionIds.length === 0}
            >
              Delete selected
            </button>
            <p>{selectionMessage(selectedCriterionIds.length)}</p>
          </>
        ) : null}
      </div>

      <form onSubmit={handleCreateCriterion}>
        <fieldset>
          <legend>Add criterion</legend>
          <label>
            Title
            <input
              name="new-criterion-title"
              value={newCriterionForm.title}
              onChange={(event) =>
                setNewCriterionForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              required
            />
          </label>
          <label>
            Description
            <textarea
              name="new-criterion-description"
              value={newCriterionForm.description}
              onChange={(event) =>
                setNewCriterionForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Type
            <select
              name="new-criterion-type"
              value={newCriterionForm.type}
              onChange={(event) => {
                const nextType = event.target.value as DraftCriterionType;
                setNewCriterionForm((current) => ({
                  ...current,
                  type: nextType,
                }));
              }}
            >
              <option value="rating_1_20">Rating 1-20</option>
              <option value="numeric_measured">Numeric measured</option>
            </select>
          </label>

          {newCriterionForm.type === "numeric_measured" ? (
            <>
              <label>
                Raw direction
                <select
                  name="new-criterion-raw-direction"
                  value={newCriterionForm.rawDirection}
                  onChange={(event) =>
                    setNewCriterionForm((current) => ({
                      ...current,
                      rawDirection: event.target.value as DraftCriterionRawDirection,
                    }))
                  }
                >
                  <option value="higher_raw_better">Higher raw is better</option>
                  <option value="lower_raw_better">Lower raw is better</option>
                </select>
              </label>
              <label>
                Unit (optional)
                <input
                  name="new-criterion-unit"
                  value={newCriterionForm.unit}
                  onChange={(event) =>
                    setNewCriterionForm((current) => ({
                      ...current,
                      unit: event.target.value,
                    }))
                  }
                />
              </label>
            </>
          ) : null}

          <button type="submit">Add criterion</button>
        </fieldset>
      </form>

      {editingCriterionId ? (
        <form onSubmit={handleSaveEdit}>
          <fieldset>
            <legend>Edit criterion</legend>
            <label>
              Title
              <input
                name="edit-criterion-title"
                value={editingCriterionForm.title}
                onChange={(event) =>
                  setEditingCriterionForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label>
              Description
              <textarea
                name="edit-criterion-description"
                value={editingCriterionForm.description}
                onChange={(event) =>
                  setEditingCriterionForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Type
              <select
                name="edit-criterion-type"
                value={editingCriterionForm.type}
                onChange={(event) => {
                  const nextType = event.target.value as DraftCriterionType;
                  setEditingCriterionForm((current) => ({
                    ...current,
                    type: nextType,
                  }));
                }}
              >
                <option value="rating_1_20">Rating 1-20</option>
                <option value="numeric_measured">Numeric measured</option>
              </select>
            </label>

            {editingCriterionForm.type === "numeric_measured" ? (
              <>
                <label>
                  Raw direction
                  <select
                    name="edit-criterion-raw-direction"
                    value={editingCriterionForm.rawDirection}
                    onChange={(event) =>
                      setEditingCriterionForm((current) => ({
                        ...current,
                        rawDirection: event.target.value as DraftCriterionRawDirection,
                      }))
                    }
                  >
                    <option value="higher_raw_better">Higher raw is better</option>
                    <option value="lower_raw_better">Lower raw is better</option>
                  </select>
                </label>
                <label>
                  Unit (optional)
                  <input
                    name="edit-criterion-unit"
                    value={editingCriterionForm.unit}
                    onChange={(event) =>
                      setEditingCriterionForm((current) => ({
                        ...current,
                        unit: event.target.value,
                      }))
                    }
                  />
                </label>
              </>
            ) : null}

            <button type="submit">Save criterion</button>
            <button type="button" onClick={() => setEditingCriterionId(null)}>
              Cancel
            </button>
          </fieldset>
        </form>
      ) : null}

      {orderedCriteria.length > 0 ? (
        <CriteriaList
          criteria={orderedCriteria}
          viewMode={viewMode}
          isSelecting={criteriaSelection.isSelecting}
          selectedCriterionIds={selectedCriterionIds}
          onToggleSelected={handleToggleSelected}
          onEdit={handleStartEdit}
          onDelete={handleOpenDeleteModal}
          onMove={(criterionId, direction) =>
            dispatch(criterionReordered(criteria, { id: criterionId, direction }))
          }
        />
      ) : (
        <p>No criteria yet.</p>
      )}

      {deleteRequest ? (
        <CriteriaDeleteModal
          criteria={orderedCriteria}
          targetCriterionIds={deleteRequest.criterionIds}
          onCancel={() => setDeleteRequest(null)}
          onConfirm={handleConfirmDelete}
        />
      ) : null}

      {showUndoToast && criteriaMultiDeleteUndo ? (
        <CriteriaUndoToast
          deletedCount={criteriaMultiDeleteUndo.deletedCriteria.length}
          onUndo={handleUndoDelete}
          onDismiss={() => setShowUndoToast(false)}
        />
      ) : null}

      <button
        type="button"
        onClick={onContinue}
        disabled={!canContinue}
        aria-describedby={!canContinue ? "minimum-criteria-note" : undefined}
      >
        Continue to ratings
      </button>
      {!canContinue ? <p id="minimum-criteria-note">{minimumCriteriaMessage}</p> : null}
    </section>
  );
};
