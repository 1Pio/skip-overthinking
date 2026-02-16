import { Link } from 'react-router';

export const ResultsRoute = () => {
  return (
    <section aria-labelledby="results-heading">
      <h2 id="results-heading">Results</h2>
      <p>Placeholder for rankings, explainability, and chart outputs.</p>
      <p>
        Back to <Link to="/ratings">Ratings</Link>
      </p>
    </section>
  );
};
