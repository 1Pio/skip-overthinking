import { optionAdded, optionDeleted, optionEdited, optionReordered } from "../state/option.actions";
import { hasMinimumOptions } from "../state/optionPrereq";
import type { OptionDraftInput } from "../state/option.types";
import { OptionForm } from "./OptionForm";
import { OptionList } from "./OptionList";
import { useDraft } from "../../decision/state/DraftProvider";

type OptionsStepProps = {
  onContinue: () => void;
  guardMessage?: string;
};

const minimumOptionsMessage = "Add at least 2 options to continue.";

export const OptionsStep = ({ onContinue, guardMessage }: OptionsStepProps) => {
  const {
    draft: { options },
    dispatch,
  } = useDraft();
  const canContinue = hasMinimumOptions(options);
  const orderedOptions = [...options].sort((a, b) => a.order - b.order);

  const handleCreate = (input: OptionDraftInput) => {
    dispatch(optionAdded(options, input));
  };

  const handleEdit = (optionId: string, input: OptionDraftInput) => {
    dispatch(optionEdited(options, { id: optionId, ...input }));
  };

  const handleDelete = (optionId: string) => {
    dispatch(optionDeleted(options, optionId));
  };

  const handleMove = (
    optionId: string,
    direction: "up" | "down" | "top" | "bottom",
  ) => {
    dispatch(optionReordered(options, { id: optionId, direction }));
  };

  return (
    <section aria-labelledby="options-step-heading">
      <h3 id="options-step-heading">Author options</h3>
      <p>Add, edit, remove, and reorder options before moving to criteria.</p>

      {guardMessage ? (
        <p role="alert">{guardMessage}</p>
      ) : !canContinue ? (
        <p role="status">{minimumOptionsMessage}</p>
      ) : null}

      <OptionForm legend="Add option" submitLabel="Add option" onSubmit={handleCreate} />

      {orderedOptions.length > 0 ? (
        <OptionList
          options={orderedOptions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onMove={handleMove}
        />
      ) : (
        <p>No options yet.</p>
      )}

      <button
        type="button"
        onClick={onContinue}
        disabled={!canContinue}
        aria-describedby={!canContinue ? "minimum-options-note" : undefined}
      >
        Continue to criteria
      </button>
      {!canContinue ? <p id="minimum-options-note">{minimumOptionsMessage}</p> : null}
    </section>
  );
};
