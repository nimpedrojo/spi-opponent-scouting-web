const DEFAULT_API_BASE_URL = 'http://localhost:3000';

export interface ApiRequestOptions extends RequestInit {
  headers?: HeadersInit;
}

export class ApiClient {
  constructor(private readonly baseUrl: string) {}

  async get<TResponse>(
    path: string,
    options?: ApiRequestOptions,
  ): Promise<TResponse> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as TResponse;
  }
}

const apiBaseUrl =
  typeof import.meta.env.VITE_API_BASE_URL === 'string'
    ? import.meta.env.VITE_API_BASE_URL
    : DEFAULT_API_BASE_URL;

export const apiClient = new ApiClient(apiBaseUrl);
