import type {
  ScoutingReportSource,
  ScoutingReportStatus,
} from '../types/scouting-report.types.js';

export interface ScoutingReportResponseDto {
  id: number;
  opponentId: number;
  versionNumber: number;
  reportSource: ScoutingReportSource;
  status: ScoutingReportStatus;
  reportDate: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScoutingReportListResponseDto {
  items: ScoutingReportResponseDto[];
}
