import { Link, Navigate } from "react-router";

import { useDraft } from "../../features/decision/state/DraftProvider";
import { hasMinimumOptions } from "../../features/options/state/optionPrereq";

export const ResultsRoute = () => {
  const {
    draft: { options },
  } = useDraft();

  if (!hasMinimumOptions(options)) {
    return (
      <Navigate
        replace
        to="/setup/options"
        state={{ guardMessage: "Add at least 2 options to continue." }}
      />
    );
  }

  return (
    <section aria-labelledby="results-heading">
      <h2 id="results-heading">Results</h2>
      <p>Placeholder for rankings, explainability, and chart outputs.</p>
      <p>
        Back to <Link to="/ratings">Ratings</Link>
      </p>
    </section>
  );
};
