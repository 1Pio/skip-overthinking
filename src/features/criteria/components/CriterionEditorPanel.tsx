import { useEffect, useMemo, useState, type FormEvent } from "react";

import type {
  CriterionDraftInput,
  DraftCriterionRawDirection,
  DraftCriterionType,
} from "../state/criterion.types";
import {
  applyPositivityHint,
  getPositivityHint,
} from "../utils/positivityHints";

type CriterionEditorPanelMode = "create" | "edit";

type CriterionEditorPanelProps = {
  isOpen: boolean;
  mode: CriterionEditorPanelMode;
  initialInput: CriterionDraftInput;
  onCancel: () => void;
  onSubmit: (input: CriterionDraftInput) => void;
};

type EditorFormState = {
  title: string;
  description: string;
  type: DraftCriterionType;
  rawDirection: DraftCriterionRawDirection | "";
  unit: string;
};

const toFormState = (input: CriterionDraftInput): EditorFormState => {
  if (input.type === "numeric_measured") {
    return {
      title: input.title,
      description: input.description ?? "",
      type: "numeric_measured",
      rawDirection: input.rawDirection,
      unit: input.unit ?? "",
    };
  }

  return {
    title: input.title,
    description: input.description ?? "",
    type: "rating_1_20",
    rawDirection: "",
    unit: "",
  };
};

const createDraftInput = (formState: EditorFormState): CriterionDraftInput | null => {
  if (!formState.title.trim()) {
    return null;
  }

  if (formState.type === "numeric_measured") {
    if (!formState.rawDirection) {
      return null;
    }

    return {
      type: "numeric_measured",
      title: formState.title,
      description: formState.description,
      rawDirection: formState.rawDirection,
      unit: formState.unit,
    };
  }

  return {
    type: "rating_1_20",
    title: formState.title,
    description: formState.description,
  };
};

export const CriterionEditorPanel = ({
  isOpen,
  mode,
  initialInput,
  onCancel,
  onSubmit,
}: CriterionEditorPanelProps) => {
  const [formState, setFormState] = useState<EditorFormState>(() => toFormState(initialInput));
  const [showDirectionError, setShowDirectionError] = useState(false);

  useEffect(() => {
    setFormState(toFormState(initialInput));
    setShowDirectionError(false);
  }, [initialInput, isOpen]);

  const positivityHint = useMemo(
    () => getPositivityHint(formState.title),
    [formState.title],
  );

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formState.type === "numeric_measured" && !formState.rawDirection) {
      setShowDirectionError(true);
      return;
    }

    const input = createDraftInput(formState);
    if (!input) {
      return;
    }

    onSubmit(input);
  };

  return (
    <section role="dialog" aria-modal="true" aria-labelledby="criterion-editor-heading">
      <h4 id="criterion-editor-heading">
        {mode === "create" ? "Add criterion" : "Edit criterion"}
      </h4>
      <p>
        Criteria stay on one desirability language: higher is always better on a 1-20 scale.
        Numeric measured criteria collect raw values and convert them into that same desirability
        scale.
      </p>

      <form onSubmit={handleSubmit}>
        <label>
          Title
          <input
            name="criterion-title"
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

        {positivityHint ? (
          <p>
            Try a desirability-forward wording: {positivityHint.suggestion}. {positivityHint.reason} <button
              type="button"
              onClick={() =>
                setFormState((current) => ({
                  ...current,
                  title: applyPositivityHint(current.title, positivityHint),
                }))
              }
            >
              Apply rewrite
            </button>
          </p>
        ) : null}

        <label>
          Description
          <textarea
            name="criterion-description"
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
            name="criterion-type"
            value={formState.type}
            onChange={(event) => {
              const nextType = event.target.value as DraftCriterionType;
              setFormState((current) => ({
                ...current,
                type: nextType,
                rawDirection:
                  nextType === "numeric_measured" ? current.rawDirection : "",
                unit: nextType === "numeric_measured" ? current.unit : "",
              }));
              setShowDirectionError(false);
            }}
          >
            <option value="rating_1_20">Rating 1-20</option>
            <option value="numeric_measured">Numeric measured</option>
          </select>
        </label>

        {formState.type === "numeric_measured" ? (
          <>
            <p>
              Raw values are only input context. Scoring and visuals still use derived 1-20
              desirability where higher is better.
            </p>
            <label>
              Raw direction
              <select
                name="criterion-raw-direction"
                value={formState.rawDirection}
                onChange={(event) => {
                  setFormState((current) => ({
                    ...current,
                    rawDirection: event.target.value as DraftCriterionRawDirection,
                  }));
                  setShowDirectionError(false);
                }}
                required
              >
                <option value="">Select raw direction</option>
                <option value="lower_raw_better">Lower raw is better</option>
                <option value="higher_raw_better">Higher raw is better</option>
              </select>
            </label>
            {showDirectionError ? (
              <p role="alert">Choose whether lower or higher raw values should score better.</p>
            ) : null}

            <label>
              Unit (optional)
              <input
                name="criterion-unit"
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

        <button type="submit">{mode === "create" ? "Add criterion" : "Save criterion"}</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </form>
    </section>
  );
};
