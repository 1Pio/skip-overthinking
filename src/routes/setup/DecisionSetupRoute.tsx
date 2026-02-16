import { useNavigate } from "react-router";

import { DecisionSetupForm } from "../../features/decision/setup/DecisionSetupForm";

export const DecisionSetupRoute = () => {
  const navigate = useNavigate();

  return (
    <section aria-labelledby="decision-setup-heading">
      <h2 id="decision-setup-heading">Decision setup</h2>
      <p>Define the decision details before moving to options.</p>
      <DecisionSetupForm onValidSubmit={() => navigate("/setup/options")} />
    </section>
  );
};
