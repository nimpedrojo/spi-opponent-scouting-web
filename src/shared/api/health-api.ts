import { apiClient } from './api-client';

export interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

export function getApiHealth(): Promise<HealthResponse> {
  return apiClient.get<HealthResponse>('/health');
}
