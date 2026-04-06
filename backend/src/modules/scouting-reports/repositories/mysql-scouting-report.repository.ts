import type {
  DatabaseMutationResult,
  DatabasePool,
  DatabaseRow,
} from '../../../shared/database/database.types.js';
import type { ScoutingReportRepository } from './scouting-report.repository.js';
import type {
  CreateScoutingReportInput,
  ListScoutingReportsFilters,
  ScoutingReportRecord,
  UpdateScoutingReportMetadataInput,
} from '../types/scouting-report.types.js';

interface ScoutingReportRow extends DatabaseRow {
  id: number;
  opponent_id: number;
  version_number: number;
  status: 'draft' | 'published';
  report_date: Date | null;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface AggregateRow extends DatabaseRow {
  next_version_number: number | null;
  count: number;
}

export class MysqlScoutingReportRepository implements ScoutingReportRepository {
  constructor(private readonly databasePool: DatabasePool) {}

  async create(
    input: CreateScoutingReportInput,
  ): Promise<ScoutingReportRecord> {
    const [result] = await this.databasePool.execute<DatabaseMutationResult>(
      `
        INSERT INTO scouting_reports (
          opponent_id,
          version_number,
          status,
          report_date
        ) VALUES (?, ?, ?, ?)
      `,
      [input.opponentId, input.versionNumber, input.status, input.reportDate],
    );

    const createdReport = await this.findById(Number(result.insertId));

    if (createdReport === null) {
      throw new Error('Created scouting report could not be loaded');
    }

    return createdReport;
  }

  async findById(reportId: number): Promise<ScoutingReportRecord | null> {
    const [rows] = await this.databasePool.execute<ScoutingReportRow[]>(
      `
        SELECT
          sr.id,
          sr.opponent_id,
          sr.version_number,
          sr.status,
          sr.report_date,
          sr.published_at,
          sr.created_at,
          sr.updated_at
        FROM scouting_reports sr
        WHERE sr.id = ?
      `,
      [reportId],
    );

    const reportRow = rows[0];

    return reportRow === undefined ? null : mapScoutingReportRow(reportRow);
  }

  async list(
    filters: ListScoutingReportsFilters,
  ): Promise<ScoutingReportRecord[]> {
    const conditions: string[] = [];
    const values: Array<number | string> = [];

    if (filters.opponentId !== null) {
      conditions.push('sr.opponent_id = ?');
      values.push(filters.opponentId);
    }

    if (filters.status !== null) {
      conditions.push('sr.status = ?');
      values.push(filters.status);
    }

    if (filters.season !== null) {
      conditions.push('sr.report_date IS NOT NULL');
      conditions.push('YEAR(sr.report_date) = ?');
      values.push(filters.season);
    }

    const whereClause =
      conditions.length === 0 ? '' : `WHERE ${conditions.join(' AND ')}`;

    const [rows] = await this.databasePool.execute<ScoutingReportRow[]>(
      `
        SELECT
          sr.id,
          sr.opponent_id,
          sr.version_number,
          sr.status,
          sr.report_date,
          sr.published_at,
          sr.created_at,
          sr.updated_at
        FROM scouting_reports sr
        ${whereClause}
        ORDER BY sr.created_at DESC, sr.id DESC
      `,
      values,
    );

    return rows.map(mapScoutingReportRow);
  }

  async updateMetadata(
    reportId: number,
    input: UpdateScoutingReportMetadataInput,
  ): Promise<ScoutingReportRecord | null> {
    const [result] = await this.databasePool.execute<DatabaseMutationResult>(
      `
        UPDATE scouting_reports
        SET
          opponent_id = ?,
          report_date = ?,
          updated_at = CURRENT_TIMESTAMP(3)
        WHERE id = ?
      `,
      [input.opponentId, input.reportDate, reportId],
    );

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(reportId);
  }

  async publish(
    reportId: number,
    publishedAt: Date,
  ): Promise<ScoutingReportRecord | null> {
    const [result] = await this.databasePool.execute<DatabaseMutationResult>(
      `
        UPDATE scouting_reports
        SET
          status = 'published',
          published_at = ?,
          updated_at = CURRENT_TIMESTAMP(3)
        WHERE id = ?
      `,
      [publishedAt, reportId],
    );

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(reportId);
  }

  async getNextVersionNumber(opponentId: number): Promise<number> {
    const [rows] = await this.databasePool.execute<AggregateRow[]>(
      `
        SELECT MAX(sr.version_number) + 1 AS next_version_number
        FROM scouting_reports sr
        WHERE sr.opponent_id = ?
      `,
      [opponentId],
    );

    const row = rows[0];

    return row?.next_version_number ?? 1;
  }

  async opponentExists(opponentId: number): Promise<boolean> {
    const [rows] = await this.databasePool.execute<AggregateRow[]>(
      `
        SELECT COUNT(*) AS count
        FROM opponents o
        WHERE o.id = ?
      `,
      [opponentId],
    );

    return (rows[0]?.count ?? 0) > 0;
  }
}

function mapScoutingReportRow(row: ScoutingReportRow): ScoutingReportRecord {
  return {
    id: row.id,
    opponentId: row.opponent_id,
    versionNumber: row.version_number,
    status: row.status,
    reportDate: row.report_date,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
