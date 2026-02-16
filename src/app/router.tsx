import { Link, Navigate, Outlet, createHashRouter } from 'react-router';

import { CriteriaRoute } from '../routes/criteria/CriteriaRoute';
import { RatingsRoute } from '../routes/ratings/RatingsRoute';
import { ResultsRoute } from '../routes/results/ResultsRoute';
import { DecisionSetupRoute } from '../routes/setup/DecisionSetupRoute';
import { OptionsRoute } from '../routes/setup/OptionsRoute';

const WizardLayout = () => {
  return (
    <main>
      <header>
        <h1>Skip Overthinking</h1>
        <nav aria-label="Wizard steps">
          <ul>
            <li>
              <Link to="/setup/decision">Decision</Link>
            </li>
            <li>
              <Link to="/setup/options">Options</Link>
            </li>
            <li>
              <Link to="/criteria">Criteria</Link>
            </li>
            <li>
              <Link to="/ratings">Ratings</Link>
            </li>
            <li>
              <Link to="/results">Results</Link>
            </li>
          </ul>
        </nav>
      </header>

      <Outlet />
    </main>
  );
};

export const appRouter = createHashRouter([
  {
    path: '/',
    element: <WizardLayout />,
    children: [
      {
        index: true,
        element: <Navigate replace to="/setup/decision" />,
      },
      {
        path: '/setup/decision',
        element: <DecisionSetupRoute />,
      },
      {
        path: '/setup/options',
        element: <OptionsRoute />,
      },
      {
        path: '/criteria',
        element: <CriteriaRoute />,
      },
      {
        path: '/ratings',
        element: <RatingsRoute />,
      },
      {
        path: '/results',
        element: <ResultsRoute />,
      },
      {
        path: '*',
        element: <Navigate replace to="/setup/decision" />,
      },
    ],
  },
]);
