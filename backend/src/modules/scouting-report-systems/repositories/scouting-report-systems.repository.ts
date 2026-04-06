import type {
  ReplaceScoutingReportSystemsInput,
  ScoutingReportSystemSelectionRecord,
  ScoutingReportSystemsReportRecord,
  SystemCatalogRecord,
} from '../types/scouting-report-systems.types.js';

export interface ScoutingReportSystemsRepository {
  findReportById(
    reportId: number,
  ): Promise<ScoutingReportSystemsReportRecord | null>;
  findCatalogSystemsByCodes(
    systemCodes: string[],
  ): Promise<SystemCatalogRecord[]>;
  getSystemsForReport(
    reportId: number,
  ): Promise<ScoutingReportSystemSelectionRecord[]>;
  replaceSystemsForReport(
    reportId: number,
    input: ReplaceScoutingReportSystemsInput,
  ): Promise<void>;
}
