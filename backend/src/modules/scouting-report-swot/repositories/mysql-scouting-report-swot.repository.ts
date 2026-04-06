import type {
  DatabaseConnection,
  DatabaseMutationResult,
  DatabasePool,
  DatabaseRow,
} from '../../../shared/database/database.types.js';
import type { ScoutingReportSwotRepository } from './scouting-report-swot.repository.js';
import type {
  ScoutingReportSwotReportRecord,
  SwotItemRecord,
  SwotItemType,
} from '../types/scouting-report-swot.types.js';

interface ReportRow extends DatabaseRow {
  id: number;
  status: 'draft' | 'published';
}

interface SwotRow extends DatabaseRow {
  item_type: SwotItemType;
  item_text: string;
  display_order: number;
}

interface SwotPayload {
  description: string;
  priority?: number;
}

export class MysqlScoutingReportSwotRepository implements ScoutingReportSwotRepository {
  constructor(private readonly databasePool: DatabasePool) {}

  async findReportById(
    reportId: number,
  ): Promise<ScoutingReportSwotReportRecord | null> {
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

  async getItemsByReportId(reportId: number): Promise<SwotItemRecord[]> {
    const [rows] = await this.databasePool.execute<SwotRow[]>(
      `
        SELECT
          osi.item_type,
          osi.item_text,
          osi.display_order
        FROM opponent_swot_items osi
        WHERE osi.scouting_report_id = ?
        ORDER BY osi.display_order ASC, osi.id ASC
      `,
      [reportId],
    );

    return rows.map(mapSwotRow);
  }

  async replaceItemsByReportId(
    reportId: number,
    items: SwotItemRecord[],
  ): Promise<void> {
    const connection = await this.databasePool.getConnection();

    try {
      await connection.beginTransaction();

      await connection.execute<DatabaseMutationResult>(
        `
          DELETE FROM opponent_swot_items
          WHERE scouting_report_id = ?
        `,
        [reportId],
      );

      for (const [index, item] of items.entries()) {
        await connection.execute<DatabaseMutationResult>(
          `
            INSERT INTO opponent_swot_items (
              scouting_report_id,
              item_type,
              item_text,
              display_order
            ) VALUES (?, ?, ?, ?)
          `,
          [reportId, item.swotType, serializeSwotText(item), index + 1],
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

function mapSwotRow(row: SwotRow): SwotItemRecord {
  const payload = parseSwotText(row.item_text);

  return {
    swotType: row.item_type,
    description: payload.description,
    priority: payload.priority ?? null,
  };
}

function serializeSwotText(item: SwotItemRecord): string {
  const payload: SwotPayload = {
    description: item.description,
  };

  if (item.priority !== null) {
    payload.priority = item.priority;
  }

  return JSON.stringify(payload);
}

function parseSwotText(itemText: string): SwotPayload {
  try {
    const parsedValue = JSON.parse(itemText) as SwotPayload;

    if (
      typeof parsedValue === 'object' &&
      parsedValue !== null &&
      typeof parsedValue.description === 'string'
    ) {
      return {
        description: parsedValue.description,
        ...(typeof parsedValue.priority === 'number'
          ? { priority: parsedValue.priority }
          : {}),
      };
    }
  } catch {
    return {
      description: itemText,
    };
  }

  return {
    description: itemText,
  };
}
