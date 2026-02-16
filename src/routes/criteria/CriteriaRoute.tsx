import { Link, Navigate } from "react-router";

import { useDraft } from "../../features/decision/state/DraftProvider";
import { hasMinimumOptions } from "../../features/options/state/optionPrereq";

export const CriteriaRoute = () => {
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
      <p>Placeholder for criteria authoring and desirability configuration.</p>
      <p>
        Back to <Link to="/setup/options">Options</Link>
      </p>
      <p>
        Next: <Link to="/ratings">Ratings</Link>
      </p>
    </section>
  );
};
