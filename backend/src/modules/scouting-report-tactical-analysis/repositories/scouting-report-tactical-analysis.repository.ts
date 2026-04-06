import type {
  ScoutingReportTacticalAnalysisReportRecord,
  TacticalAnalysisItemRecord,
} from '../types/scouting-report-tactical-analysis.types.js';

export interface ScoutingReportTacticalAnalysisRepository {
  findReportById(
    reportId: number,
  ): Promise<ScoutingReportTacticalAnalysisReportRecord | null>;
  getItemsByReportId(reportId: number): Promise<TacticalAnalysisItemRecord[]>;
  replaceItemsByReportId(
    reportId: number,
    items: TacticalAnalysisItemRecord[],
  ): Promise<void>;
}
