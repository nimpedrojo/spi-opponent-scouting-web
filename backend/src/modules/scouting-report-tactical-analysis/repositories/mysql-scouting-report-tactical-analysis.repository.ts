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
import type { PitchPlayerPosition } from '../../../shared/pitch/pitch-player-position.js';

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
  setPieceType?: TacticalAnalysisBlockType | null;
  keyPoints?: string[];
  playerPositions?: PitchPlayerPosition[];
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
            item.phaseType === 'set_piece' ? null : item.blockType,
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
    blockType:
      row.phase === 'set_piece'
        ? (payload.setPieceType ?? null)
        : row.block_type,
    narrative: payload.narrative,
    keyPoints: payload.keyPoints ?? [],
    playerPositions: payload.playerPositions ?? [],
  };
}

function serializeAnalysisText(item: TacticalAnalysisItemRecord): string {
  const payload: TacticalAnalysisPayload = {
    narrative: item.narrative,
  };

  if (item.phaseType === 'set_piece') {
    payload.setPieceType = item.blockType;
  }

  if (item.keyPoints.length > 0) {
    payload.keyPoints = item.keyPoints;
  }

  if (item.playerPositions.length > 0) {
    payload.playerPositions = item.playerPositions;
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
      const sanitizedPlayerPositions = Array.isArray(
        parsedValue.playerPositions,
      )
        ? parsedValue.playerPositions.filter(isPitchPlayerPosition)
        : null;

      return {
        narrative: parsedValue.narrative,
        ...(parsedValue.setPieceType !== undefined
          ? {
              setPieceType:
                typeof parsedValue.setPieceType === 'string'
                  ? parsedValue.setPieceType
                  : null,
            }
          : {}),
        ...(sanitizedKeyPoints !== null
          ? { keyPoints: sanitizedKeyPoints }
          : {}),
        ...(sanitizedPlayerPositions !== null
          ? { playerPositions: sanitizedPlayerPositions }
          : {}),
      };
    }
  } catch {
    return {
      narrative: analysisText,
      keyPoints: [],
      playerPositions: [],
    };
  }

  return {
    narrative: analysisText,
    keyPoints: [],
    playerPositions: [],
  };
}

function isPitchPlayerPosition(value: unknown): value is PitchPlayerPosition {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<PitchPlayerPosition>;

  return (
    typeof candidate.playerNumber === 'number' &&
    typeof candidate.x === 'number' &&
    typeof candidate.y === 'number'
  );
}
