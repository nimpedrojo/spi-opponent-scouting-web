import type { PropsWithChildren, ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import {
  MemoryRouter,
  Route,
  Routes,
  type MemoryRouterProps,
} from 'react-router-dom';

interface RenderRouteOptions {
  path: string;
  initialEntries: MemoryRouterProps['initialEntries'];
  additionalRoutes?: Array<{
    path: string;
    element: ReactElement;
  }>;
}

export function renderWithRoute(ui: ReactElement, options: RenderRouteOptions) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  function Wrapper({ children }: PropsWithChildren): ReactElement {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          {...(options.initialEntries === undefined
            ? {}
            : { initialEntries: options.initialEntries })}
        >
          <Routes>
            <Route path={options.path} element={children} />
            {options.additionalRoutes?.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
            <Route path="*" element={<div data-testid="route-fallback" />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  return render(ui, {
    wrapper: Wrapper,
  });
}

export function createJsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
