import { useState } from "react";

import type { OptionMoveDirection } from "../state/option.actions";
import type { OptionDraftInput, DraftOption } from "../state/option.types";
import { OptionForm } from "./OptionForm";

type OptionListProps = {
  options: DraftOption[];
  onEdit: (optionId: string, input: OptionDraftInput) => void;
  onDelete: (optionId: string) => void;
  onMove: (optionId: string, direction: OptionMoveDirection) => void;
};

export const OptionList = ({ options, onEdit, onDelete, onMove }: OptionListProps) => {
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const orderedOptions = [...options].sort((a, b) => a.order - b.order);

  return (
    <ol>
      {orderedOptions.map((option, index) => {
        const isEditing = editingOptionId === option.id;

        return (
          <li key={option.id}>
            <article>
              <h4>
                {index + 1}. {option.title}
              </h4>
              {option.description ? <p>{option.description}</p> : null}
              {option.icon ? <p>Icon: {option.icon}</p> : null}

              <div aria-label={`Reorder ${option.title}`}>
                <button
                  type="button"
                  onClick={() => onMove(option.id, "top")}
                  disabled={index === 0}
                >
                  Move to top
                </button>
                <button
                  type="button"
                  onClick={() => onMove(option.id, "up")}
                  disabled={index === 0}
                >
                  Move up
                </button>
                <button
                  type="button"
                  onClick={() => onMove(option.id, "down")}
                  disabled={index === orderedOptions.length - 1}
                >
                  Move down
                </button>
                <button
                  type="button"
                  onClick={() => onMove(option.id, "bottom")}
                  disabled={index === orderedOptions.length - 1}
                >
                  Move to bottom
                </button>
              </div>

              {isEditing ? (
                <OptionForm
                  legend={`Edit option ${index + 1}`}
                  submitLabel="Save option"
                  initialValues={{
                    title: option.title,
                    description: option.description,
                    icon: option.icon,
                  }}
                  onSubmit={(input) => {
                    onEdit(option.id, input);
                    setEditingOptionId(null);
                  }}
                  onCancel={() => setEditingOptionId(null)}
                />
              ) : (
                <div>
                  <button type="button" onClick={() => setEditingOptionId(option.id)}>
                    Edit option
                  </button>
                  <button type="button" onClick={() => onDelete(option.id)}>
                    Delete option permanently
                  </button>
                </div>
              )}
            </article>
          </li>
        );
      })}
    </ol>
  );
};
