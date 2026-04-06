import type {
  DatabaseConnection,
  DatabaseMutationResult,
  DatabasePool,
  DatabaseRow,
} from '../../../shared/database/database.types.js';
import type { ScoutingReportTacticalAnalysisRepository } from './scouting-report-tactical-analysis.repository.js';
import type {
  ScoutingReportTacticalAnalysisReportRecord,
  TacticalAnalysisBlockType,
  TacticalAnalysisItemRecord,
  TacticalAnalysisPhaseType,
} from '../types/scouting-report-tactical-analysis.types.js';

interface ReportRow extends DatabaseRow {
  id: number;
  status: 'draft' | 'published';
}

interface TacticalAnalysisRow extends DatabaseRow {
  phase: TacticalAnalysisPhaseType;
  block_type: TacticalAnalysisBlockType | null;
  analysis_text: string;
}

interface TacticalAnalysisPayload {
  narrative: string;
  keyPoints?: string[];
}

export class MysqlScoutingReportTacticalAnalysisRepository implements ScoutingReportTacticalAnalysisRepository {
  constructor(private readonly databasePool: DatabasePool) {}

  async findReportById(
    reportId: number,
  ): Promise<ScoutingReportTacticalAnalysisReportRecord | null> {
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

  async getItemsByReportId(
    reportId: number,
  ): Promise<TacticalAnalysisItemRecord[]> {
    const [rows] = await this.databasePool.execute<TacticalAnalysisRow[]>(
      `
        SELECT
          ota.phase,
          ota.block_type,
          ota.analysis_text
        FROM opponent_tactical_analyses ota
        WHERE ota.scouting_report_id = ?
        ORDER BY ota.id ASC
      `,
      [reportId],
    );

    return rows.map(mapTacticalAnalysisRow);
  }

  async replaceItemsByReportId(
    reportId: number,
    items: TacticalAnalysisItemRecord[],
  ): Promise<void> {
    const connection = await this.databasePool.getConnection();

    try {
      await connection.beginTransaction();

      await connection.execute<DatabaseMutationResult>(
        `
          DELETE FROM opponent_tactical_analyses
          WHERE scouting_report_id = ?
        `,
        [reportId],
      );

      for (const item of items) {
        await connection.execute<DatabaseMutationResult>(
          `
            INSERT INTO opponent_tactical_analyses (
              scouting_report_id,
              phase,
              block_type,
              analysis_text
            ) VALUES (?, ?, ?, ?)
          `,
          [
            reportId,
            item.phaseType,
            item.blockType,
            serializeAnalysisText(item),
          ],
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

function mapTacticalAnalysisRow(
  row: TacticalAnalysisRow,
): TacticalAnalysisItemRecord {
  const payload = parseAnalysisText(row.analysis_text);

  return {
    phaseType: row.phase,
    blockType: row.block_type,
    narrative: payload.narrative,
    keyPoints: payload.keyPoints ?? [],
  };
}

function serializeAnalysisText(item: TacticalAnalysisItemRecord): string {
  const payload: TacticalAnalysisPayload = {
    narrative: item.narrative,
  };

  if (item.keyPoints.length > 0) {
    payload.keyPoints = item.keyPoints;
  }

  return JSON.stringify(payload);
}

function parseAnalysisText(analysisText: string): TacticalAnalysisPayload {
  try {
    const parsedValue = JSON.parse(analysisText) as TacticalAnalysisPayload;

    if (
      typeof parsedValue === 'object' &&
      parsedValue !== null &&
      typeof parsedValue.narrative === 'string'
    ) {
      const sanitizedKeyPoints = Array.isArray(parsedValue.keyPoints)
        ? parsedValue.keyPoints.filter(
            (keyPoint): keyPoint is string => typeof keyPoint === 'string',
          )
        : null;

      return {
        narrative: parsedValue.narrative,
        ...(sanitizedKeyPoints !== null
          ? { keyPoints: sanitizedKeyPoints }
          : {}),
      };
    }
  } catch {
    return {
      narrative: analysisText,
      keyPoints: [],
    };
  }

  return {
    narrative: analysisText,
    keyPoints: [],
  };
}
