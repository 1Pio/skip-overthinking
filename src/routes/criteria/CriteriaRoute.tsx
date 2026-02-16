import { Link } from 'react-router';

export const CriteriaRoute = () => {
  return (
    <section aria-labelledby="criteria-heading">
      <h2 id="criteria-heading">Criteria</h2>
      <p>Placeholder for criteria authoring and desirability configuration.</p>
      <p>
        Back to <Link to="/setup/options">Options</Link>
      </p>
    </section>
  );
};
