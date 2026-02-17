import { Link, Navigate } from "react-router";

import { useDraft } from "../../features/decision/state/DraftProvider";
import { hasMinimumCriteria } from "../../features/criteria/state/criterionPrereq";
import { hasMinimumOptions } from "../../features/options/state/optionPrereq";
import { ResultsStep } from "../../features/results/components/ResultsStep";
import {
  canAccessResults,
  RESULTS_WEIGHTS_GUARD_MESSAGE,
} from "../../features/ratings/state/ratingPrereq";

export const ResultsRoute = () => {
  const {
    draft: { options, criteria, criterionWeights },
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

  if (!canAccessResults(criteria, criterionWeights)) {
    return (
      <Navigate
        replace
        to="/ratings"
        state={{
          guardMessage: RESULTS_WEIGHTS_GUARD_MESSAGE,
        }}
      />
    );
  }

  return (
    <section aria-labelledby="results-heading">
      <h2 id="results-heading">Results</h2>
      <p>
        Back to <Link to="/ratings">Ratings</Link>
      </p>
      <ResultsStep />
    </section>
  );
};
