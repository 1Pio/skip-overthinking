import { Link, Navigate } from "react-router";

import { useDraft } from "../../features/decision/state/DraftProvider";
import { hasMinimumOptions } from "../../features/options/state/optionPrereq";

export const RatingsRoute = () => {
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
    <section aria-labelledby="ratings-heading">
      <h2 id="ratings-heading">Ratings</h2>
      <p>Placeholder for ratings matrix inputs and weight controls.</p>
      <p>
        Back to <Link to="/criteria">Criteria</Link>
      </p>
      <p>
        Next: <Link to="/results">Results</Link>
      </p>
    </section>
  );
};
