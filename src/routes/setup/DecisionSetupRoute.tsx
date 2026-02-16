import { Link } from 'react-router';

export const DecisionSetupRoute = () => {
  return (
    <section aria-labelledby="decision-setup-heading">
      <h2 id="decision-setup-heading">Decision setup</h2>
      <p>Placeholder for decision title, description, and icon inputs.</p>
      <p>
        Continue to <Link to="/setup/options">Options</Link> after setup details are complete.
      </p>
    </section>
  );
};
