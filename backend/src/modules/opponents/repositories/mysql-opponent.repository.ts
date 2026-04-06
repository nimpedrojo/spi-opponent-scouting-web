import type {
  DatabaseMutationResult,
  DatabasePool,
  DatabaseRow,
} from '../../../shared/database/database.types.js';
import type { OpponentRepository } from './opponent.repository.js';
import type {
  CreateOpponentInput,
  OpponentListFilters,
  OpponentListRecord,
  OpponentRecord,
  UpdateOpponentInput,
} from '../types/opponent.types.js';

interface OpponentRow extends DatabaseRow {
  id: number;
  name: string;
  country_name: string | null;
  competition_name: string | null;
  created_at: Date;
  updated_at: Date;
}

export class MysqlOpponentRepository implements OpponentRepository {
  constructor(private readonly databasePool: DatabasePool) {}

  async create(input: CreateOpponentInput): Promise<OpponentRecord> {
    const [result] = await this.databasePool.execute<DatabaseMutationResult>(
      `
        INSERT INTO opponents (
          name,
          country_name,
          competition_name
        ) VALUES (?, ?, ?)
      `,
      [input.name, input.countryName, input.competitionName],
    );

    const createdOpponent = await this.findById(Number(result.insertId));

    if (createdOpponent === null) {
      throw new Error('Created opponent could not be loaded');
    }

    return createdOpponent;
  }

  async update(
    opponentId: number,
    input: UpdateOpponentInput,
  ): Promise<OpponentRecord | null> {
    const [result] = await this.databasePool.execute<DatabaseMutationResult>(
      `
        UPDATE opponents
        SET
          name = ?,
          country_name = ?,
          competition_name = ?,
          updated_at = CURRENT_TIMESTAMP(3)
        WHERE id = ?
      `,
      [input.name, input.countryName, input.competitionName, opponentId],
    );

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(opponentId);
  }

  async findById(opponentId: number): Promise<OpponentRecord | null> {
    const [rows] = await this.databasePool.execute<OpponentRow[]>(
      `
        SELECT
          o.id,
          o.name,
          o.country_name,
          o.competition_name,
          o.created_at,
          o.updated_at
        FROM opponents o
        WHERE o.id = ?
      `,
      [opponentId],
    );

    const opponentRow = rows[0];

    return opponentRow === undefined ? null : mapOpponentRow(opponentRow);
  }

  async list(filters: OpponentListFilters): Promise<OpponentListRecord[]> {
    const conditions: string[] = [];
    const values: Array<number | string> = [];

    if (filters.search !== null) {
      conditions.push('o.name LIKE ?');
      values.push(`%${filters.search}%`);
    }

    if (filters.category !== null) {
      // The current schema has no dedicated category column, so MVP filtering
      // uses the opponent competition label until a shared category source exists.
      conditions.push('o.competition_name = ?');
      values.push(filters.category);
    }

    if (filters.status !== null) {
      conditions.push(
        `
          EXISTS (
            SELECT 1
            FROM scouting_reports sr
            WHERE sr.opponent_id = o.id
              AND sr.status = ?
          )
        `,
      );
      values.push(filters.status);
    }

    if (filters.season !== null) {
      conditions.push(
        `
          EXISTS (
            SELECT 1
            FROM scouting_reports sr
            WHERE sr.opponent_id = o.id
              AND sr.report_date IS NOT NULL
              AND YEAR(sr.report_date) = ?
          )
        `,
      );
      values.push(filters.season);
    }

    const whereClause =
      conditions.length === 0 ? '' : `WHERE ${conditions.join(' AND ')}`;

    const [rows] = await this.databasePool.execute<OpponentRow[]>(
      `
        SELECT
          o.id,
          o.name,
          o.country_name,
          o.competition_name,
          o.created_at,
          o.updated_at
        FROM opponents o
        ${whereClause}
        ORDER BY o.name ASC, o.id ASC
      `,
      values,
    );

    return rows.map(mapOpponentRow);
  }
}

function mapOpponentRow(row: OpponentRow): OpponentRecord {
  return {
    id: row.id,
    name: row.name,
    countryName: row.country_name,
    competitionName: row.competition_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
