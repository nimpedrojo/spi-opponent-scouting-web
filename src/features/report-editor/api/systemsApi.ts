import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import { apiClient } from '../../../shared/api/api-client';
import type { PitchPlayerPositionDto } from '../../../shared/api/domain-types';
import { queryKeys } from '../../../shared/lib/query/query-keys';

export interface ScoutingReportSystemSelectionDto {
  systemCode: string;
  playerPositions: PitchPlayerPositionDto[];
}

export interface ReplaceScoutingReportSystemsBodyDto {
  primarySystem: ScoutingReportSystemSelectionDto;
  alternateSystems: ScoutingReportSystemSelectionDto[];
}

export interface ScoutingReportSystemsResponseDto {
  primarySystem: ScoutingReportSystemSelectionDto | null;
  alternateSystems: ScoutingReportSystemSelectionDto[];
}

export interface ReplaceScoutingReportSystemsMutationVariables {
  reportId: number;
  body: ReplaceScoutingReportSystemsBodyDto;
}

export function getScoutingReportSystems(
  reportId: number,
): Promise<ScoutingReportSystemsResponseDto> {
  return apiClient.get<ScoutingReportSystemsResponseDto>(
    `/scouting-reports/${reportId}/systems`,
  );
}

export function replaceScoutingReportSystems({
  reportId,
  body,
}: ReplaceScoutingReportSystemsMutationVariables): Promise<ScoutingReportSystemsResponseDto> {
  return apiClient.put<
    ScoutingReportSystemsResponseDto,
    ReplaceScoutingReportSystemsBodyDto
  >(`/scouting-reports/${reportId}/systems`, body);
}

export function useScoutingReportSystemsQuery(
  reportId: number,
): UseQueryResult<ScoutingReportSystemsResponseDto> {
  return useQuery({
    queryKey: queryKeys.scoutingReports.systems(reportId),
    queryFn: () => getScoutingReportSystems(reportId),
    enabled: reportId > 0,
  });
}

export function useReplaceScoutingReportSystemsMutation(): UseMutationResult<
  ScoutingReportSystemsResponseDto,
  Error,
  ReplaceScoutingReportSystemsMutationVariables
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: replaceScoutingReportSystems,
    onSuccess: (systems, variables) => {
      queryClient.setQueryData(
        queryKeys.scoutingReports.systems(variables.reportId),
        systems,
      );
    },
  });
}
