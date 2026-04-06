import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import { apiClient } from '../../../shared/api/api-client';
import { queryKeys } from '../../../shared/lib/query/query-keys';

export type SwotItemType = 'strength' | 'weakness' | 'opportunity' | 'threat';

export interface UpsertSwotItemDto {
  swotType: SwotItemType;
  description: string;
  priority?: number | null;
}

export interface ReplaceScoutingReportSwotBodyDto {
  items: UpsertSwotItemDto[];
}

export interface SwotItemResponseDto {
  swotType: SwotItemType;
  description: string;
  priority: number | null;
}

export interface ScoutingReportSwotResponseDto {
  items: SwotItemResponseDto[];
}

export interface ReplaceScoutingReportSwotMutationVariables {
  reportId: number;
  body: ReplaceScoutingReportSwotBodyDto;
}

export function getScoutingReportSwot(
  reportId: number,
): Promise<ScoutingReportSwotResponseDto> {
  return apiClient.get<ScoutingReportSwotResponseDto>(
    `/scouting-reports/${reportId}/swot`,
  );
}

export function replaceScoutingReportSwot({
  reportId,
  body,
}: ReplaceScoutingReportSwotMutationVariables): Promise<ScoutingReportSwotResponseDto> {
  return apiClient.put<
    ScoutingReportSwotResponseDto,
    ReplaceScoutingReportSwotBodyDto
  >(`/scouting-reports/${reportId}/swot`, body);
}

export function useScoutingReportSwotQuery(
  reportId: number,
): UseQueryResult<ScoutingReportSwotResponseDto> {
  return useQuery({
    queryKey: queryKeys.scoutingReports.swot(reportId),
    queryFn: () => getScoutingReportSwot(reportId),
    enabled: reportId > 0,
  });
}

export function useReplaceScoutingReportSwotMutation(): UseMutationResult<
  ScoutingReportSwotResponseDto,
  Error,
  ReplaceScoutingReportSwotMutationVariables
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: replaceScoutingReportSwot,
    onSuccess: (swot, variables) => {
      queryClient.setQueryData(
        queryKeys.scoutingReports.swot(variables.reportId),
        swot,
      );
    },
  });
}
