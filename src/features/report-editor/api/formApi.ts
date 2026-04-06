import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import { apiClient } from '../../../shared/api/api-client';
import { queryKeys } from '../../../shared/lib/query/query-keys';

export interface UpsertScoutingReportFormBodyDto {
  leaguePosition: number | null;
  points: number | null;
  recentFormText: string | null;
  notes: string | null;
}

export interface ScoutingReportFormResponseDto {
  leaguePosition: number | null;
  points: number | null;
  recentFormText: string | null;
  notes: string | null;
}

export interface UpsertScoutingReportFormMutationVariables {
  reportId: number;
  body: UpsertScoutingReportFormBodyDto;
}

export function getScoutingReportForm(
  reportId: number,
): Promise<ScoutingReportFormResponseDto> {
  return apiClient.get<ScoutingReportFormResponseDto>(
    `/scouting-reports/${reportId}/form`,
  );
}

export function upsertScoutingReportForm({
  reportId,
  body,
}: UpsertScoutingReportFormMutationVariables): Promise<ScoutingReportFormResponseDto> {
  return apiClient.put<
    ScoutingReportFormResponseDto,
    UpsertScoutingReportFormBodyDto
  >(`/scouting-reports/${reportId}/form`, body);
}

export function useScoutingReportFormQuery(
  reportId: number,
): UseQueryResult<ScoutingReportFormResponseDto> {
  return useQuery({
    queryKey: queryKeys.scoutingReports.form(reportId),
    queryFn: () => getScoutingReportForm(reportId),
    enabled: reportId > 0,
  });
}

export function useUpsertScoutingReportFormMutation(): UseMutationResult<
  ScoutingReportFormResponseDto,
  Error,
  UpsertScoutingReportFormMutationVariables
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertScoutingReportForm,
    onSuccess: (form, variables) => {
      queryClient.setQueryData(
        queryKeys.scoutingReports.form(variables.reportId),
        form,
      );
    },
  });
}
