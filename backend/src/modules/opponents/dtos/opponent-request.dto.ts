import type { ScoutingReportStatus } from '../types/opponent.types.js';

export interface CreateOpponentBodyDto {
  name: string;
  countryName?: string;
  competitionName?: string;
}

export interface UpdateOpponentParamsDto {
  opponentId: number;
}

export interface UpdateOpponentBodyDto {
  name: string;
  countryName?: string;
  competitionName?: string;
}

export interface GetOpponentByIdParamsDto {
  opponentId: number;
}

export interface ListOpponentsQueryDto {
  category?: string;
  season?: number;
  status?: ScoutingReportStatus;
  search?: string;
}
