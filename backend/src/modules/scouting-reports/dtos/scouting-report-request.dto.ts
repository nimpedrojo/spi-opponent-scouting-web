import type {
  ScoutingReportSource,
  ScoutingReportStatus,
} from '../types/scouting-report.types.js';

export interface CreateScoutingReportBodyDto {
  opponentId: number;
  reportSource: ScoutingReportSource;
  reportDate?: string;
}

export interface ScoutingReportIdParamsDto {
  id: number;
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
