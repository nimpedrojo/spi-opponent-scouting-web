import type { ScoutingReportStatus } from '../../scouting-reports/types/scouting-report.types.js';

export interface ScoutingReportFormReportRecord {
  id: number;
  status: ScoutingReportStatus;
}

export interface OpponentFormRecord {
  leaguePosition: number | null;
  points: number | null;
  recentFormText: string | null;
  notes: string | null;
}
