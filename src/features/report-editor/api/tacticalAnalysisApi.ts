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

export type TacticalAnalysisPhaseType =
  | 'attack'
  | 'defense'
  | 'attacking_transition'
  | 'defensive_transition'
  | 'set_piece';

export type TacticalAnalysisBlockType =
  | 'high_block'
  | 'mid_block'
  | 'low_block'
  | 'corner'
  | 'wide_free_kick'
  | 'central_free_kick'
  | 'throw_in'
  | 'other';

export interface UpsertTacticalAnalysisItemDto {
  phaseType: TacticalAnalysisPhaseType;
  blockType: TacticalAnalysisBlockType | null;
  narrative: string;
  keyPoints?: string[];
  playerPositions?: PitchPlayerPositionDto[];
}

export interface ReplaceScoutingReportTacticalAnalysisBodyDto {
  items: UpsertTacticalAnalysisItemDto[];
}

export interface TacticalAnalysisItemResponseDto {
  phaseType: TacticalAnalysisPhaseType;
  blockType: TacticalAnalysisBlockType | null;
  narrative: string;
  keyPoints: string[];
  playerPositions: PitchPlayerPositionDto[];
}

export interface ScoutingReportTacticalAnalysisResponseDto {
  items: TacticalAnalysisItemResponseDto[];
}

export interface ReplaceScoutingReportTacticalAnalysisMutationVariables {
  reportId: number;
  body: ReplaceScoutingReportTacticalAnalysisBodyDto;
}

export function getScoutingReportTacticalAnalysis(
  reportId: number,
): Promise<ScoutingReportTacticalAnalysisResponseDto> {
  return apiClient.get<ScoutingReportTacticalAnalysisResponseDto>(
    `/scouting-reports/${reportId}/tactical-analysis`,
  );
}

export function replaceScoutingReportTacticalAnalysis({
  reportId,
  body,
}: ReplaceScoutingReportTacticalAnalysisMutationVariables): Promise<ScoutingReportTacticalAnalysisResponseDto> {
  return apiClient.put<
    ScoutingReportTacticalAnalysisResponseDto,
    ReplaceScoutingReportTacticalAnalysisBodyDto
  >(`/scouting-reports/${reportId}/tactical-analysis`, body);
}

export function useScoutingReportTacticalAnalysisQuery(
  reportId: number,
): UseQueryResult<ScoutingReportTacticalAnalysisResponseDto> {
  return useQuery({
    queryKey: queryKeys.scoutingReports.tacticalAnalysis(reportId),
    queryFn: () => getScoutingReportTacticalAnalysis(reportId),
    enabled: reportId > 0,
  });
}

export function useReplaceScoutingReportTacticalAnalysisMutation(): UseMutationResult<
  ScoutingReportTacticalAnalysisResponseDto,
  Error,
  ReplaceScoutingReportTacticalAnalysisMutationVariables
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: replaceScoutingReportTacticalAnalysis,
    onSuccess: (tacticalAnalysis, variables) => {
      queryClient.setQueryData(
        queryKeys.scoutingReports.tacticalAnalysis(variables.reportId),
        tacticalAnalysis,
      );
    },
  });
}
