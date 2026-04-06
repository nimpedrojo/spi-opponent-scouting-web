const DEFAULT_API_BASE_URL = 'http://localhost:3000';

export interface ApiRequestOptions extends RequestInit {
  headers?: HeadersInit;
}

export interface ApiErrorPayload {
  message: string;
  issues?: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly issues?: unknown;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiError';
    this.status = status;
    this.issues = payload.issues;
  }
}

type QueryStringValue = string | number | boolean | null | undefined;

export function buildQueryString<TQuery extends object>(
  query?: TQuery,
): string {
  if (!query) {
    return '';
  }

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(
    query as Record<string, QueryStringValue>,
  )) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    searchParams.set(key, String(value));
  }

  const queryString = searchParams.toString();

  return queryString.length > 0 ? `?${queryString}` : '';
}

export class ApiClient {
  constructor(private readonly baseUrl: string) {}

  async get<TResponse>(
    path: string,
    options?: ApiRequestOptions,
  ): Promise<TResponse> {
    return this.request<TResponse>(path, {
      ...options,
      method: 'GET',
    });
  }

  async post<TResponse, TBody = undefined>(
    path: string,
    body?: TBody,
    options?: ApiRequestOptions,
  ): Promise<TResponse> {
    return this.request<TResponse>(path, {
      ...options,
      method: 'POST',
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  }

  async put<TResponse, TBody>(
    path: string,
    body: TBody,
    options?: ApiRequestOptions,
  ): Promise<TResponse> {
    return this.request<TResponse>(path, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async patch<TResponse, TBody>(
    path: string,
    body: TBody,
    options?: ApiRequestOptions,
  ): Promise<TResponse> {
    return this.request<TResponse>(path, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete<TResponse = void>(
    path: string,
    options?: ApiRequestOptions,
  ): Promise<TResponse> {
    return this.request<TResponse>(path, {
      ...options,
      method: 'DELETE',
    });
  }

  private async request<TResponse>(
    path: string,
    options?: ApiRequestOptions,
  ): Promise<TResponse> {
    const hasBody = options?.body !== undefined;

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw await this.createApiError(response);
    }

    if (response.status === 204) {
      return undefined as TResponse;
    }

    return (await response.json()) as TResponse;
  }

  private async createApiError(response: Response): Promise<ApiError> {
    let payload: ApiErrorPayload = {
      message: `Request failed with status ${response.status}`,
    };

    try {
      payload = (await response.json()) as ApiErrorPayload;
    } catch {
      payload = {
        message: `Request failed with status ${response.status}`,
      };
    }

    return new ApiError(response.status, payload);
  }
}

const apiBaseUrl =
  typeof import.meta.env.VITE_API_BASE_URL === 'string'
    ? import.meta.env.VITE_API_BASE_URL
    : DEFAULT_API_BASE_URL;

export const apiClient = new ApiClient(apiBaseUrl);
