import { Link, Navigate, useLocation, useNavigate } from "react-router";

import { CriteriaStep } from "../../features/criteria/components/CriteriaStep";
import { useDraft } from "../../features/decision/state/DraftProvider";
import { hasMinimumOptions } from "../../features/options/state/optionPrereq";

type CriteriaRouteLocationState = {
  guardMessage?: string;
};

export const CriteriaRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as CriteriaRouteLocationState | null;
  const guardMessage =
    typeof locationState?.guardMessage === "string"
      ? locationState.guardMessage
      : undefined;
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
    <section aria-labelledby="criteria-heading">
      <h2 id="criteria-heading">Criteria</h2>
      <p>Define criteria before entering ratings.</p>
      <p>
        <Link to="/setup/options">Back to options</Link>
      </p>
      <CriteriaStep guardMessage={guardMessage} onContinue={() => navigate("/ratings")} />
    </section>
  );
};
