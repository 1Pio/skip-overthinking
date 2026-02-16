import { useMemo, useState } from "react";

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
import type { CriterionDraftInput, DraftCriterion } from "../state/criterion.types";
import { CriteriaDeleteModal } from "./CriteriaDeleteModal";
import { CriterionEditorPanel } from "./CriterionEditorPanel";
import { CriteriaList } from "./CriteriaList";
import { TemplatePicker } from "./TemplatePicker";
import { CriteriaUndoToast } from "./CriteriaUndoToast";

type CriteriaStepProps = {
  onContinue: () => void;
};

type DeleteRequest = {
  criterionIds: string[];
};

type EditorState =
  | {
      mode: "create";
      criterionId: null;
      input: CriterionDraftInput;
    }
  | {
      mode: "edit";
      criterionId: string;
      input: CriterionDraftInput;
    }
  | null;

const minimumCriteriaMessage = "Add at least 1 criterion to continue.";

const createDefaultCriterionInput = (): CriterionDraftInput => ({
  type: "rating_1_20",
  title: "",
  description: "",
});

const createDraftInputFromCriterion = (criterion: DraftCriterion): CriterionDraftInput => {
  if (criterion.type === "numeric_measured") {
    return {
      type: "numeric_measured",
      title: criterion.title,
      description: criterion.description ?? "",
      rawDirection: criterion.rawDirection,
      unit: criterion.unit ?? "",
    };
  }

  return {
    type: "rating_1_20",
    title: criterion.title,
    description: criterion.description ?? "",
  };
};

const selectionMessage = (count: number): string =>
  count === 1 ? "1 criterion selected" : `${count} criteria selected`;

export const CriteriaStep = ({ onContinue }: CriteriaStepProps) => {
  const {
    draft: { criteria, criteriaSelection, criteriaMultiDeleteUndo },
    dispatch,
  } = useDraft();
  const [viewMode, setViewMode] = useState<"compact" | "rich">("compact");
  const [deleteRequest, setDeleteRequest] = useState<DeleteRequest | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [editorState, setEditorState] = useState<EditorState>(null);

  const orderedCriteria = useMemo(
    () => [...criteria].sort((left, right) => left.order - right.order),
    [criteria],
  );
  const canContinue = hasMinimumCriteria(criteria) && isCriteriaStepComplete(criteria);
  const selectedCriterionIds = criteriaSelection.selectedCriterionIds;

  const closeEditor = () => {
    setEditorState(null);
  };

  const handleOpenCreateEditor = () => {
    setEditorState({
      mode: "create",
      criterionId: null,
      input: createDefaultCriterionInput(),
    });
  };

  const handleStartEdit = (criterionId: string) => {
    const criterion = criteria.find((item) => item.id === criterionId);
    if (!criterion) {
      return;
    }

    setEditorState({
      mode: "edit",
      criterionId,
      input: createDraftInputFromCriterion(criterion),
    });
  };

  const handleEditorSubmit = (input: CriterionDraftInput) => {
    if (editorState?.mode === "edit") {
      dispatch(
        criterionEdited(criteria, {
          id: editorState.criterionId,
          ...input,
        }),
      );
    } else {
      dispatch(criterionAdded(criteria, input));
    }

    closeEditor();
  };

  const handleTemplateCreateCriterion = (input: CriterionDraftInput) => {
    dispatch(criterionAdded(criteria, input));
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

    if (
      editorState?.mode === "edit" &&
      deleteRequest.criterionIds.includes(editorState.criterionId)
    ) {
      closeEditor();
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

      <TemplatePicker onTemplateConfirmed={handleTemplateCreateCriterion} />

      <div>
        <button type="button" onClick={handleOpenCreateEditor}>
          Add criterion
        </button>
      </div>

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

      <CriterionEditorPanel
        isOpen={editorState !== null}
        mode={editorState?.mode ?? "create"}
        initialInput={editorState?.input ?? createDefaultCriterionInput()}
        onCancel={closeEditor}
        onSubmit={handleEditorSubmit}
      />

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
