import type { PropsWithChildren, ReactElement } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import { appQueryClient } from '../../shared/lib/query/query-client';

export function AppProviders({ children }: PropsWithChildren): ReactElement {
  return (
    <QueryClientProvider client={appQueryClient}>
      {children}
    </QueryClientProvider>
  );
}
