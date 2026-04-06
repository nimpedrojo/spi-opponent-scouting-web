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
  summary: string | null;
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
          ofm.summary
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
          summary
        ) VALUES (?, ?)
        ON DUPLICATE KEY UPDATE
          summary = VALUES(summary),
          updated_at = CURRENT_TIMESTAMP(3)
      `,
      [reportId, serializeFormSummary(form)],
    );

    const savedForm = await this.findFormByReportId(reportId);

    if (savedForm === null) {
      throw new Error('Saved form could not be loaded');
    }

    return savedForm;
  }
}

function mapOpponentFormRow(row: OpponentFormRow): OpponentFormRecord {
  const parsedSummary = parseFormSummary(row.summary);

  return {
    leaguePosition: parsedSummary.leaguePosition,
    points: parsedSummary.points,
    recentFormText: parsedSummary.recentFormText,
    notes: parsedSummary.notes,
  };
}

function serializeFormSummary(form: OpponentFormRecord): string | null {
  const payload = {
    leaguePosition: form.leaguePosition,
    points: form.points,
    recentFormText: form.recentFormText,
    notes: form.notes,
  };

  if (
    payload.leaguePosition === null &&
    payload.points === null &&
    payload.recentFormText === null &&
    payload.notes === null
  ) {
    return null;
  }

  return JSON.stringify(payload);
}

function parseFormSummary(summary: string | null): OpponentFormRecord {
  if (summary === null) {
    return createEmptyForm();
  }

  try {
    const parsedValue = JSON.parse(summary) as Partial<OpponentFormRecord>;

    return {
      leaguePosition:
        typeof parsedValue.leaguePosition === 'number'
          ? parsedValue.leaguePosition
          : null,
      points:
        typeof parsedValue.points === 'number' ? parsedValue.points : null,
      recentFormText:
        typeof parsedValue.recentFormText === 'string'
          ? parsedValue.recentFormText
          : null,
      notes: typeof parsedValue.notes === 'string' ? parsedValue.notes : null,
    };
  } catch {
    return {
      leaguePosition: null,
      points: null,
      recentFormText: summary,
      notes: null,
    };
  }
}

function createEmptyForm(): OpponentFormRecord {
  return {
    leaguePosition: null,
    points: null,
    recentFormText: null,
    notes: null,
  };
}
