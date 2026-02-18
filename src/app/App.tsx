import { RouterProvider } from 'react-router';

import { DraftProvider } from '../features/decision/state/DraftProvider';
import { appRouter } from './router';
import { AuthProvider } from '../features/auth/auth.context';
import { SyncBanner } from '../features/auth/sync/SyncBanner';
import { Toaster } from 'sonner';

const App = () => {
  return (
    <AuthProvider>
      <SyncBanner />
      <DraftProvider>
        <RouterProvider router={appRouter} />
      </DraftProvider>
      <Toaster />
    </AuthProvider>
  );
};

export default App;
