import type { ScoutingReportStatus } from '../types/scouting-report.types.js';

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
