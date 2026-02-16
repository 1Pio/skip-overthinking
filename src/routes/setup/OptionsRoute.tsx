import { Link, useNavigate } from "react-router";

import { OptionsStep } from "../../features/options/components/OptionsStep";

export const OptionsRoute = () => {
  const navigate = useNavigate();

  return (
    <section aria-labelledby="options-heading">
      <h2 id="options-heading">Options</h2>
      <p>Define at least two options before moving to criteria.</p>
      <p>
        Back to <Link to="/setup/decision">Decision setup</Link>
      </p>
      <OptionsStep onContinue={() => navigate("/criteria")} />
    </section>
  );
};
