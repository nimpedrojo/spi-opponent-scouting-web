import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import { apiClient, buildQueryString } from '../../../shared/api/api-client';
import { queryKeys } from '../../../shared/lib/query/query-keys';

export type ScoutingReportStatus = 'draft' | 'published';

export interface CreateScoutingReportBodyDto {
  opponentId: number;
  reportDate?: string;
}

export interface UpdateScoutingReportBodyDto {
  opponentId?: number;
  reportDate?: string | null;
}

export interface ListScoutingReportsQueryDto {
  opponentId?: number;
  status?: ScoutingReportStatus;
  season?: number;
}

export interface ScoutingReportResponseDto {
  id: number;
  opponentId: number;
  versionNumber: number;
  status: ScoutingReportStatus;
  reportDate: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScoutingReportListResponseDto {
  items: ScoutingReportResponseDto[];
}

export interface UpdateScoutingReportMutationVariables {
  reportId: number;
  body: UpdateScoutingReportBodyDto;
}

export function listScoutingReports(
  query: ListScoutingReportsQueryDto = {},
): Promise<ScoutingReportListResponseDto> {
  return apiClient.get<ScoutingReportListResponseDto>(
    `/scouting-reports${buildQueryString(query)}`,
  );
}

export function getScoutingReportById(
  reportId: number,
): Promise<ScoutingReportResponseDto> {
  return apiClient.get<ScoutingReportResponseDto>(
    `/scouting-reports/${reportId}`,
  );
}

export function createScoutingReport(
  body: CreateScoutingReportBodyDto,
): Promise<ScoutingReportResponseDto> {
  return apiClient.post<ScoutingReportResponseDto, CreateScoutingReportBodyDto>(
    '/scouting-reports',
    body,
  );
}

export function updateScoutingReportMetadata({
  reportId,
  body,
}: UpdateScoutingReportMutationVariables): Promise<ScoutingReportResponseDto> {
  return apiClient.patch<
    ScoutingReportResponseDto,
    UpdateScoutingReportBodyDto
  >(`/scouting-reports/${reportId}`, body);
}

export function duplicateScoutingReport(
  reportId: number,
): Promise<ScoutingReportResponseDto> {
  return apiClient.post<ScoutingReportResponseDto>(
    `/scouting-reports/${reportId}/duplicate`,
  );
}

export function publishScoutingReport(
  reportId: number,
): Promise<ScoutingReportResponseDto> {
  return apiClient.post<ScoutingReportResponseDto>(
    `/scouting-reports/${reportId}/publish`,
  );
}

export function useScoutingReportsQuery(
  query: ListScoutingReportsQueryDto = {},
): UseQueryResult<ScoutingReportListResponseDto> {
  return useQuery({
    queryKey: queryKeys.scoutingReports.list(query),
    queryFn: () => listScoutingReports(query),
  });
}

export function useScoutingReportQuery(
  reportId: number,
): UseQueryResult<ScoutingReportResponseDto> {
  return useQuery({
    queryKey: queryKeys.scoutingReports.detail(reportId),
    queryFn: () => getScoutingReportById(reportId),
    enabled: reportId > 0,
  });
}

export function useCreateScoutingReportMutation(): UseMutationResult<
  ScoutingReportResponseDto,
  Error,
  CreateScoutingReportBodyDto
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createScoutingReport,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.scoutingReports.all,
      });
    },
  });
}

export function useUpdateScoutingReportMutation(): UseMutationResult<
  ScoutingReportResponseDto,
  Error,
  UpdateScoutingReportMutationVariables
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateScoutingReportMetadata,
    onSuccess: (updatedReport) => {
      queryClient.setQueryData(
        queryKeys.scoutingReports.detail(updatedReport.id),
        updatedReport,
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.scoutingReports.lists(),
      });
    },
  });
}

export function useDuplicateScoutingReportMutation(): UseMutationResult<
  ScoutingReportResponseDto,
  Error,
  number
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: duplicateScoutingReport,
    onSuccess: (duplicatedReport) => {
      queryClient.setQueryData(
        queryKeys.scoutingReports.detail(duplicatedReport.id),
        duplicatedReport,
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.scoutingReports.lists(),
      });
    },
  });
}

export function usePublishScoutingReportMutation(): UseMutationResult<
  ScoutingReportResponseDto,
  Error,
  number
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishScoutingReport,
    onSuccess: (publishedReport) => {
      queryClient.setQueryData(
        queryKeys.scoutingReports.detail(publishedReport.id),
        publishedReport,
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.scoutingReports.lists(),
      });
    },
  });
}
