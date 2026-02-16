import { type FormEvent, useState } from "react";

import { optionInputSchema } from "../options.schema";
import type { OptionDraftInput } from "../state/option.types";

type OptionFormProps = {
  legend: string;
  submitLabel: string;
  initialValues?: OptionDraftInput;
  onSubmit: (input: OptionDraftInput) => void;
  onCancel?: () => void;
};

export const OptionForm = ({
  legend,
  submitLabel,
  initialValues,
  onSubmit,
  onCancel,
}: OptionFormProps) => {
  const fieldIdPrefix = legend.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [icon, setIcon] = useState(initialValues?.icon ?? "");
  const [titleError, setTitleError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = optionInputSchema.safeParse({
      title,
      description,
      icon,
    });

    if (!result.success) {
      const titleIssue = result.error.issues.find((issue) => issue.path[0] === "title");
      setTitleError(titleIssue?.message ?? "Option title is required");
      return;
    }

    setTitleError(null);
    onSubmit(result.data);

    if (!initialValues) {
      setTitle("");
      setDescription("");
      setIcon("");
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit}>
      <fieldset>
        <legend>{legend}</legend>

        <div>
          <label htmlFor={`${fieldIdPrefix}-title`}>Title</label>
          <input
            id={`${fieldIdPrefix}-title`}
            name="title"
            value={title}
            onChange={(event) => {
              const nextTitle = event.target.value;
              setTitle(nextTitle);
              if (titleError && nextTitle.trim()) {
                setTitleError(null);
              }
            }}
            aria-invalid={titleError ? true : undefined}
            aria-describedby={titleError ? `${fieldIdPrefix}-title-error` : undefined}
          />
          {titleError ? (
            <p id={`${fieldIdPrefix}-title-error`} role="alert">
              {titleError}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor={`${fieldIdPrefix}-description`}>Description (optional)</label>
          <textarea
            id={`${fieldIdPrefix}-description`}
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor={`${fieldIdPrefix}-icon`}>Icon string (optional)</label>
          <input
            id={`${fieldIdPrefix}-icon`}
            name="icon"
            value={icon}
            onChange={(event) => setIcon(event.target.value)}
          />
          {icon.trim() ? <p>Preview: {icon}</p> : null}
        </div>

        <div>
          <button type="submit">{submitLabel}</button>
          {onCancel ? (
            <button type="button" onClick={onCancel}>
              Cancel edit
            </button>
          ) : null}
        </div>
      </fieldset>
    </form>
  );
};
