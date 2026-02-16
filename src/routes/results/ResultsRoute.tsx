import { Link, Navigate } from "react-router";

import { useDraft } from "../../features/decision/state/DraftProvider";
import { hasMinimumCriteria } from "../../features/criteria/state/criterionPrereq";
import { hasMinimumOptions } from "../../features/options/state/optionPrereq";

export const ResultsRoute = () => {
  const {
    draft: { options, criteria },
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

  if (!hasMinimumCriteria(criteria)) {
    return (
      <Navigate
        replace
        to="/criteria"
        state={{
          guardMessage:
            "Add at least 1 criterion and finish its type setup before viewing results.",
        }}
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
