import type {
  CreateScoutingReportInput,
  ListScoutingReportsFilters,
  ScoutingReportRecord,
  UpdateScoutingReportMetadataInput,
} from '../types/scouting-report.types.js';

export interface ScoutingReportRepository {
  create(input: CreateScoutingReportInput): Promise<ScoutingReportRecord>;
  findById(reportId: number): Promise<ScoutingReportRecord | null>;
  list(filters: ListScoutingReportsFilters): Promise<ScoutingReportRecord[]>;
  delete(reportId: number): Promise<boolean>;
  updateMetadata(
    reportId: number,
    input: UpdateScoutingReportMetadataInput,
  ): Promise<ScoutingReportRecord | null>;
  publish(
    reportId: number,
    publishedAt: Date,
  ): Promise<ScoutingReportRecord | null>;
  getNextVersionNumber(opponentId: number): Promise<number>;
  opponentExists(opponentId: number): Promise<boolean>;
}
