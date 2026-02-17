import { Link, Navigate, useLocation, useNavigate } from "react-router";

import { useDraft } from "../../features/decision/state/DraftProvider";
import { hasMinimumCriteria } from "../../features/criteria/state/criterionPrereq";
import { hasMinimumOptions } from "../../features/options/state/optionPrereq";
import { RatingsStep } from "../../features/ratings/components/RatingsStep";

type RatingsRouteLocationState = {
  guardMessage?: string;
};

export const RatingsRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as RatingsRouteLocationState | null;
  const guardMessage =
    typeof locationState?.guardMessage === "string"
      ? locationState.guardMessage
      : undefined;

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
            "Add at least 1 criterion and finish its type setup before entering ratings.",
        }}
      />
    );
  }

  return (
    <section aria-labelledby="ratings-heading">
      <h2 id="ratings-heading">Ratings</h2>
      <p>
        Back to <Link to="/criteria">Criteria</Link>
      </p>
      <RatingsStep guardMessage={guardMessage} onContinue={() => navigate("/results")} />
    </section>
  );
};
