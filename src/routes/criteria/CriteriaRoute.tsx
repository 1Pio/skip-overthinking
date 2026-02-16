import { Link, Navigate, useNavigate } from "react-router";

import { CriteriaStep } from "../../features/criteria/components/CriteriaStep";
import { useDraft } from "../../features/decision/state/DraftProvider";
import { hasMinimumOptions } from "../../features/options/state/optionPrereq";

export const CriteriaRoute = () => {
  const navigate = useNavigate();
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
        Back to <Link to="/setup/options">Options</Link>
      </p>
      <CriteriaStep onContinue={() => navigate("/ratings")} />
    </section>
  );
};
