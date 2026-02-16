import { RouterProvider } from 'react-router';

import { DraftProvider } from '../features/decision/state/DraftProvider';
import { appRouter } from './router';

const App = () => {
  return (
    <DraftProvider>
      <RouterProvider router={appRouter} />
    </DraftProvider>
  );
};

export default App;
