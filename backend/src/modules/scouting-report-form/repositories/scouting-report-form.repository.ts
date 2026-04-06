import type {
  OpponentFormRecord,
  ScoutingReportFormReportRecord,
} from '../types/scouting-report-form.types.js';

export interface ScoutingReportFormRepository {
  findReportById(
    reportId: number,
  ): Promise<ScoutingReportFormReportRecord | null>;
  findFormByReportId(reportId: number): Promise<OpponentFormRecord | null>;
  upsertFormByReportId(
    reportId: number,
    form: OpponentFormRecord,
  ): Promise<OpponentFormRecord>;
}
