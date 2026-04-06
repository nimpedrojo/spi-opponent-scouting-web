import type { ReactElement } from 'react';

import { AppProviders } from './providers/AppProviders';
import { AppRouter } from './routes/AppRouter';

export function App(): ReactElement {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
