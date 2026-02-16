import { useEffect, useState, type FormEvent } from "react";

import type {
  CriterionDraftInput,
  DraftCriterionRawDirection,
  DraftCriterionType,
} from "../state/criterion.types";
import type { CriterionTemplate } from "../templates";

type TemplateConfirmModalProps = {
  template: CriterionTemplate;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: (input: CriterionDraftInput) => void;
};

type ConfirmFormState = {
  title: string;
  description: string;
  type: DraftCriterionType;
  rawDirection: DraftCriterionRawDirection;
  unit: string;
};

const createFormStateFromDraft = (draft: CriterionDraftInput): ConfirmFormState => {
  if (draft.type === "numeric_measured") {
    return {
      title: draft.title,
      description: draft.description ?? "",
      type: "numeric_measured",
      rawDirection: draft.rawDirection,
      unit: draft.unit ?? "",
    };
  }

  return {
    title: draft.title,
    description: draft.description ?? "",
    type: "rating_1_20",
    rawDirection: "higher_raw_better",
    unit: "",
  };
};

const toDraftInput = (form: ConfirmFormState): CriterionDraftInput => {
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

export const TemplateConfirmModal = ({
  template,
  isOpen,
  onCancel,
  onConfirm,
}: TemplateConfirmModalProps) => {
  const [formState, setFormState] = useState<ConfirmFormState>(() =>
    createFormStateFromDraft(template.createDraft()),
  );

  useEffect(() => {
    setFormState(createFormStateFromDraft(template.createDraft()));
  }, [template]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onConfirm(toDraftInput(formState));
  };

  return (
    <section role="dialog" aria-modal="true" aria-labelledby="template-confirm-heading">
      <h4 id="template-confirm-heading">Customize template before add</h4>
      <p>
        {template.purpose} Confirm details below, then add a criterion that matches the same
        typed schema as manual entry.
      </p>

      <form onSubmit={handleSubmit}>
        <label>
          Title
          <input
            name="template-criterion-title"
            value={formState.title}
            onChange={(event) =>
              setFormState((current) => ({
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
            name="template-criterion-description"
            value={formState.description}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
          />
        </label>

        <label>
          Type
          <select
            name="template-criterion-type"
            value={formState.type}
            onChange={(event) => {
              const nextType = event.target.value as DraftCriterionType;
              setFormState((current) => ({
                ...current,
                type: nextType,
                rawDirection:
                  nextType === "numeric_measured"
                    ? current.rawDirection
                    : "higher_raw_better",
                unit: nextType === "numeric_measured" ? current.unit : "",
              }));
            }}
          >
            <option value="rating_1_20">Rating 1-20</option>
            <option value="numeric_measured">Numeric measured</option>
          </select>
        </label>

        {formState.type === "numeric_measured" ? (
          <>
            <label>
              Raw direction
              <select
                name="template-criterion-raw-direction"
                value={formState.rawDirection}
                onChange={(event) =>
                  setFormState((current) => ({
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
                name="template-criterion-unit"
                value={formState.unit}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    unit: event.target.value,
                  }))
                }
              />
            </label>
          </>
        ) : null}

        <button type="submit">Add criterion</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </form>
    </section>
  );
};
