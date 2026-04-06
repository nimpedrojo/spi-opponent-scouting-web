export interface ScoutingReportFormParamsDto {
  id: number;
}

export interface UpsertScoutingReportFormBodyDto {
  leaguePosition: number | null;
  points: number | null;
  recentFormText: string | null;
  notes: string | null;
}
