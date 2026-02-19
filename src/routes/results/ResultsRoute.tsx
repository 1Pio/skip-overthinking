import { Link, Navigate, useNavigate } from "react-router";

import { useDraft } from "../../features/decision/state/DraftProvider";
import { hasMinimumCriteria } from "../../features/criteria/state/criterionPrereq";
import { hasMinimumOptions } from "../../features/options/state/optionPrereq";
import { ResultsStep } from "../../features/results/components/ResultsStep";
import {
  canAccessResults,
  RESULTS_WEIGHTS_GUARD_MESSAGE,
} from "../../features/ratings/state/ratingPrereq";
import { useSaveDecision } from "../../features/workspace/hooks/useSaveDecision";

export const ResultsRoute = () => {
  const navigate = useNavigate();
  const { draft, resetDraft } = useDraft();
  const { saveDecision } = useSaveDecision();

  const { options, criteria, criterionWeights } = draft;

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

  const handleSaveDecision = async () => {
    const result = await saveDecision(draft);

    if (result.success) {
      resetDraft();
      navigate("/");
    }
  };

  return (
    <section aria-labelledby="results-heading">
      <div className="results-route__header">
        <div>
          <h2 id="results-heading">Results</h2>
          <p>
            Back to <Link to="/ratings">Ratings</Link>
          </p>
        </div>
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleSaveDecision}
        >
          Save Decision
        </button>
      </div>
      <ResultsStep />
    </section>
  );
};
