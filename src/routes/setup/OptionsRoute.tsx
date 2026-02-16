import { Link, useLocation, useNavigate } from "react-router";

import { OptionsStep } from "../../features/options/components/OptionsStep";

type OptionsRouteLocationState = {
  guardMessage?: string;
};

export const OptionsRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as OptionsRouteLocationState | null;
  const guardMessage =
    typeof locationState?.guardMessage === "string"
      ? locationState.guardMessage
      : undefined;

  return (
    <section aria-labelledby="options-heading">
      <h2 id="options-heading">Options</h2>
      <p>Define at least two options before moving to criteria.</p>
      <p>
        Back to <Link to="/setup/decision">Decision setup</Link>
      </p>
      <OptionsStep
        guardMessage={guardMessage}
        onContinue={() => navigate("/criteria")}
      />
    </section>
  );
};
