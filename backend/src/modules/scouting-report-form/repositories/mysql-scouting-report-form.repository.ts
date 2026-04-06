import type {
  DatabaseMutationResult,
  DatabasePool,
  DatabaseRow,
} from '../../../shared/database/database.types.js';
import type { ScoutingReportFormRepository } from './scouting-report-form.repository.js';
import type {
  OpponentFormRecord,
  ScoutingReportFormReportRecord,
} from '../types/scouting-report-form.types.js';

interface ReportRow extends DatabaseRow {
  id: number;
  status: 'draft' | 'published';
}

interface OpponentFormRow extends DatabaseRow {
  league_position: number | null;
  points: number | null;
  summary: string | null;
  notes: string | null;
}

export class MysqlScoutingReportFormRepository implements ScoutingReportFormRepository {
  constructor(private readonly databasePool: DatabasePool) {}

  async findReportById(
    reportId: number,
  ): Promise<ScoutingReportFormReportRecord | null> {
    const [rows] = await this.databasePool.execute<ReportRow[]>(
      `
        SELECT
          sr.id,
          sr.status
        FROM scouting_reports sr
        WHERE sr.id = ?
      `,
      [reportId],
    );

    const report = rows[0];

    return report === undefined
      ? null
      : {
          id: report.id,
          status: report.status,
        };
  }

  async findFormByReportId(
    reportId: number,
  ): Promise<OpponentFormRecord | null> {
    const [rows] = await this.databasePool.execute<OpponentFormRow[]>(
      `
        SELECT
          ofm.league_position,
          ofm.points,
          ofm.summary,
          ofm.notes
        FROM opponent_forms ofm
        WHERE ofm.scouting_report_id = ?
      `,
      [reportId],
    );

    const form = rows[0];

    return form === undefined ? null : mapOpponentFormRow(form);
  }

  async upsertFormByReportId(
    reportId: number,
    form: OpponentFormRecord,
  ): Promise<OpponentFormRecord> {
    await this.databasePool.execute<DatabaseMutationResult>(
      `
        INSERT INTO opponent_forms (
          scouting_report_id,
          league_position,
          points,
          summary,
          notes
        ) VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          league_position = VALUES(league_position),
          points = VALUES(points),
          summary = VALUES(summary),
          notes = VALUES(notes),
          updated_at = CURRENT_TIMESTAMP(3)
      `,
      [
        reportId,
        form.leaguePosition,
        form.points,
        form.recentFormText,
        form.notes,
      ],
    );

    const savedForm = await this.findFormByReportId(reportId);

    if (savedForm === null) {
      throw new Error('Saved form could not be loaded');
    }

    return savedForm;
  }
}

function mapOpponentFormRow(row: OpponentFormRow): OpponentFormRecord {
  return {
    leaguePosition: row.league_position,
    points: row.points,
    recentFormText: row.summary,
    notes: row.notes,
  };
}
