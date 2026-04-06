import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import { apiClient, buildQueryString } from '../../../shared/api/api-client';
import type { ScoutingReportStatus } from '../../../shared/api/domain-types';
import { queryKeys } from '../../../shared/lib/query/query-keys';

export interface CreateOpponentBodyDto {
  name: string;
  countryName?: string;
  competitionName?: string;
}

export interface UpdateOpponentBodyDto {
  name: string;
  countryName?: string;
  competitionName?: string;
}

export interface ListOpponentsQueryDto {
  category?: string;
  season?: number;
  status?: ScoutingReportStatus;
  search?: string;
}

export interface OpponentResponseDto {
  id: number;
  name: string;
  countryName: string | null;
  competitionName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OpponentListResponseDto {
  items: OpponentResponseDto[];
}

export interface UpdateOpponentMutationVariables {
  opponentId: number;
  body: UpdateOpponentBodyDto;
}

export function listOpponents(
  query: ListOpponentsQueryDto = {},
): Promise<OpponentListResponseDto> {
  return apiClient.get<OpponentListResponseDto>(
    `/opponents${buildQueryString(query)}`,
  );
}

export function getOpponentById(
  opponentId: number,
): Promise<OpponentResponseDto> {
  return apiClient.get<OpponentResponseDto>(`/opponents/${opponentId}`);
}

export function createOpponent(
  body: CreateOpponentBodyDto,
): Promise<OpponentResponseDto> {
  return apiClient.post<OpponentResponseDto, CreateOpponentBodyDto>(
    '/opponents',
    body,
  );
}

export function updateOpponent({
  opponentId,
  body,
}: UpdateOpponentMutationVariables): Promise<OpponentResponseDto> {
  return apiClient.put<OpponentResponseDto, UpdateOpponentBodyDto>(
    `/opponents/${opponentId}`,
    body,
  );
}

export function useOpponentsQuery(
  query: ListOpponentsQueryDto = {},
): UseQueryResult<OpponentListResponseDto> {
  return useQuery({
    queryKey: queryKeys.opponents.list(query),
    queryFn: () => listOpponents(query),
  });
}

export function useOpponentQuery(
  opponentId: number,
): UseQueryResult<OpponentResponseDto> {
  return useQuery({
    queryKey: queryKeys.opponents.detail(opponentId),
    queryFn: () => getOpponentById(opponentId),
    enabled: opponentId > 0,
  });
}

export function useCreateOpponentMutation(): UseMutationResult<
  OpponentResponseDto,
  Error,
  CreateOpponentBodyDto
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOpponent,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.opponents.all,
      });
    },
  });
}

export function useUpdateOpponentMutation(): UseMutationResult<
  OpponentResponseDto,
  Error,
  UpdateOpponentMutationVariables
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOpponent,
    onSuccess: (updatedOpponent) => {
      queryClient.setQueryData(
        queryKeys.opponents.detail(updatedOpponent.id),
        updatedOpponent,
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.opponents.all,
      });
    },
  });
}
