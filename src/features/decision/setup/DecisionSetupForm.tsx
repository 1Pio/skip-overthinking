import { type FormEvent, useState } from "react";

import { useDraft } from "../state/DraftProvider";
import { decisionSetupSchema } from "./decision.schema";

type DecisionSetupFormProps = {
  onValidSubmit: () => void;
};

export const DecisionSetupForm = ({ onValidSubmit }: DecisionSetupFormProps) => {
  const {
    draft: { decision },
    updateDecision,
  } = useDraft();
  const [titleError, setTitleError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = decisionSetupSchema.safeParse(decision);
    if (!result.success) {
      const titleIssue = result.error.issues.find((issue) => issue.path[0] === "title");
      setTitleError(titleIssue?.message ?? "Decision title is required");
      return;
    }

    setTitleError(null);
    updateDecision(result.data);
    onValidSubmit();
  };

  return (
    <form noValidate onSubmit={handleSubmit}>
      <div>
        <label htmlFor="decision-title">Decision title</label>
        <input
          id="decision-title"
          name="title"
          value={decision.title}
          onChange={(event) => {
            const nextTitle = event.target.value;
            updateDecision({ title: nextTitle });
            if (titleError && nextTitle.trim().length > 0) {
              setTitleError(null);
            }
          }}
          aria-invalid={titleError ? true : undefined}
          aria-describedby={titleError ? "decision-title-error" : undefined}
        />
        {titleError ? (
          <p id="decision-title-error" role="alert">
            {titleError}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="decision-description">Description (optional)</label>
        <textarea
          id="decision-description"
          name="description"
          value={decision.description}
          onChange={(event) => updateDecision({ description: event.target.value })}
        />
      </div>

      <div>
        <label htmlFor="decision-icon">Icon string (optional)</label>
        <input
          id="decision-icon"
          name="icon"
          value={decision.icon}
          onChange={(event) => updateDecision({ icon: event.target.value })}
        />
        {decision.icon.trim() ? <p>Preview: {decision.icon}</p> : null}
      </div>

      <button type="submit">Continue to options</button>
    </form>
  );
};
