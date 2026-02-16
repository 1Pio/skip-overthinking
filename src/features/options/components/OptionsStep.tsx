import { optionAdded, optionDeleted, optionEdited, optionReordered } from "../state/option.actions";
import type { OptionDraftInput } from "../state/option.types";
import { OptionForm } from "./OptionForm";
import { OptionList } from "./OptionList";
import { useDraft } from "../../decision/state/DraftProvider";

type OptionsStepProps = {
  onContinue: () => void;
};

export const OptionsStep = ({ onContinue }: OptionsStepProps) => {
  const {
    draft: { options },
    dispatch,
  } = useDraft();
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

      <button type="button" onClick={onContinue}>
        Continue to criteria
      </button>
    </section>
  );
};
