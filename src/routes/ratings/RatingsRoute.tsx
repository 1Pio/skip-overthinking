import { Link } from 'react-router';

export const RatingsRoute = () => {
  return (
    <section aria-labelledby="ratings-heading">
      <h2 id="ratings-heading">Ratings</h2>
      <p>Placeholder for ratings matrix inputs and weight controls.</p>
      <p>
        Back to <Link to="/criteria">Criteria</Link>
      </p>
    </section>
  );
};
