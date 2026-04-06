export type ScoutingReportStatus = 'draft' | 'published';

export interface ScoutingReportRecord {
  id: number;
  opponentId: number;
  versionNumber: number;
  status: ScoutingReportStatus;
  reportDate: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateScoutingReportInput {
  opponentId: number;
  versionNumber: number;
  status: 'draft';
  reportDate: Date | null;
}

export interface UpdateScoutingReportMetadataInput {
  opponentId: number;
  reportDate: Date | null;
}

export interface ListScoutingReportsFilters {
  opponentId: number | null;
  status: ScoutingReportStatus | null;
  season: number | null;
}
