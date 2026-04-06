import { vi } from 'vitest';

type RouteHandler = (input: {
  method: string;
  url: URL;
  body: unknown;
}) => Response | Promise<Response>;

export function mockFetch(routes: Record<string, RouteHandler>) {
  return vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async (input, init) => {
      const requestUrl = toUrl(input);
      const method =
        init?.method ?? (input instanceof Request ? input.method : 'GET');
      const routeKey = `${method.toUpperCase()} ${requestUrl.pathname}${requestUrl.search}`;
      const fallbackRouteKey = `${method.toUpperCase()} ${requestUrl.pathname}`;
      const handler = routes[routeKey] ?? routes[fallbackRouteKey];

      if (handler === undefined) {
        throw new Error(`Unhandled fetch request: ${routeKey}`);
      }

      const body = parseBody(init?.body);

      return handler({
        method: method.toUpperCase(),
        url: requestUrl,
        body,
      });
    });
}

function parseBody(body: BodyInit | null | undefined): unknown {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (typeof body === 'string') {
    return JSON.parse(body);
  }

  return undefined;
}

function toUrl(input: RequestInfo | URL): URL {
  if (input instanceof Request) {
    return new URL(input.url);
  }

  if (input instanceof URL) {
    return input;
  }

  return new URL(input, 'http://localhost:3000');
}
