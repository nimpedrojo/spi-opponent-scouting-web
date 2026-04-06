import type {
  ScoutingReportSwotReportRecord,
  SwotItemRecord,
} from '../types/scouting-report-swot.types.js';

export interface ScoutingReportSwotRepository {
  findReportById(
    reportId: number,
  ): Promise<ScoutingReportSwotReportRecord | null>;
  getItemsByReportId(reportId: number): Promise<SwotItemRecord[]>;
  replaceItemsByReportId(
    reportId: number,
    items: SwotItemRecord[],
  ): Promise<void>;
}
