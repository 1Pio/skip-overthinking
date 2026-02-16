import { Link, useNavigate } from 'react-router';

export const OptionsRoute = () => {
  const navigate = useNavigate();

  return (
    <section aria-labelledby="options-heading">
      <h2 id="options-heading">Options</h2>
      <p>Placeholder for option authoring and reorder controls.</p>
      <p>
        Back to <Link to="/setup/decision">Decision setup</Link>
      </p>
      <button type="button" onClick={() => navigate('/criteria')}>
        Continue to criteria
      </button>
    </section>
  );
};
