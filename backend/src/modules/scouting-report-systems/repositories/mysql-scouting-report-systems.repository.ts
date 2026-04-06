import type {
  DatabaseConnection,
  DatabaseMutationResult,
  DatabasePool,
  DatabaseRow,
} from '../../../shared/database/database.types.js';
import type { ScoutingReportSystemsRepository } from './scouting-report-systems.repository.js';
import type {
  ReplaceScoutingReportSystemsInput,
  ScoutingReportSystemSelectionRecord,
  ScoutingReportSystemsReportRecord,
  SystemCatalogRecord,
} from '../types/scouting-report-systems.types.js';

interface ReportRow extends DatabaseRow {
  id: number;
  status: 'draft' | 'published';
}

interface SystemCatalogRow extends DatabaseRow {
  id: number;
  system_code: string;
  display_name: string;
  display_order: number;
  is_active: number;
}

interface SystemSelectionRow extends DatabaseRow {
  system_code: string;
  display_name: string;
  usage_role: 'primary' | 'secondary';
  display_order: number;
}

export class MysqlScoutingReportSystemsRepository
  implements ScoutingReportSystemsRepository
{
  constructor(private readonly databasePool: DatabasePool) {}

  async findReportById(
    reportId: number,
  ): Promise<ScoutingReportSystemsReportRecord | null> {
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

    const reportRow = rows[0];

    return reportRow === undefined
      ? null
      : {
          id: reportRow.id,
          status: reportRow.status,
        };
  }

  async findCatalogSystemsByCodes(
    systemCodes: string[],
  ): Promise<SystemCatalogRecord[]> {
    if (systemCodes.length === 0) {
      return [];
    }

    const placeholders = systemCodes.map(() => '?').join(', ');
    const [rows] = await this.databasePool.execute<SystemCatalogRow[]>(
      `
        SELECT
          sc.id,
          sc.system_code,
          sc.display_name,
          sc.display_order,
          sc.is_active
        FROM system_catalog sc
        WHERE sc.system_code IN (${placeholders})
          AND sc.is_active = 1
      `,
      systemCodes,
    );

    return rows.map(mapSystemCatalogRow);
  }

  async getSystemsForReport(
    reportId: number,
  ): Promise<ScoutingReportSystemSelectionRecord[]> {
    const [rows] = await this.databasePool.execute<SystemSelectionRow[]>(
      `
        SELECT
          sc.system_code,
          sc.display_name,
          osu.usage_role,
          osu.display_order
        FROM opponent_system_usages osu
        INNER JOIN system_catalog sc
          ON sc.id = osu.system_catalog_id
        WHERE osu.scouting_report_id = ?
          AND osu.usage_role IN ('primary', 'secondary')
        ORDER BY
          CASE osu.usage_role
            WHEN 'primary' THEN 0
            ELSE 1
          END ASC,
          osu.display_order ASC,
          osu.id ASC
      `,
      [reportId],
    );

    return rows.map((row) => ({
      systemCode: row.system_code,
      displayName: row.display_name,
      usageRole: row.usage_role,
      displayOrder: row.display_order,
    }));
  }

  async replaceSystemsForReport(
    reportId: number,
    input: ReplaceScoutingReportSystemsInput,
  ): Promise<void> {
    const connection = await this.databasePool.getConnection();

    try {
      await connection.beginTransaction();

      await connection.execute<DatabaseMutationResult>(
        `
          DELETE FROM opponent_system_usages
          WHERE scouting_report_id = ?
            AND usage_role IN ('primary', 'secondary')
        `,
        [reportId],
      );

      const catalogSystems = await this.findCatalogSystemsWithConnection(
        connection,
        [input.primarySystemCode, ...input.alternateSystemCodes],
      );
      const catalogByCode = new Map(
        catalogSystems.map((system) => [system.systemCode, system]),
      );

      const primarySystem = catalogByCode.get(input.primarySystemCode);

      if (primarySystem === undefined) {
        throw new Error('Primary system catalog entry was not found');
      }

      await connection.execute<DatabaseMutationResult>(
        `
          INSERT INTO opponent_system_usages (
            scouting_report_id,
            system_catalog_id,
            usage_role,
            display_order
          ) VALUES (?, ?, 'primary', 1)
        `,
        [reportId, primarySystem.id],
      );

      for (const [index, systemCode] of input.alternateSystemCodes.entries()) {
        const alternateSystem = catalogByCode.get(systemCode);

        if (alternateSystem === undefined) {
          throw new Error('Alternate system catalog entry was not found');
        }

        await connection.execute<DatabaseMutationResult>(
          `
            INSERT INTO opponent_system_usages (
              scouting_report_id,
              system_catalog_id,
              usage_role,
              display_order
            ) VALUES (?, ?, 'secondary', ?)
          `,
          [reportId, alternateSystem.id, index + 1],
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

  private async findCatalogSystemsWithConnection(
    connection: DatabaseConnection,
    systemCodes: string[],
  ): Promise<SystemCatalogRecord[]> {
    if (systemCodes.length === 0) {
      return [];
    }

    const placeholders = systemCodes.map(() => '?').join(', ');
    const [rows] = await connection.execute<SystemCatalogRow[]>(
      `
        SELECT
          sc.id,
          sc.system_code,
          sc.display_name,
          sc.display_order,
          sc.is_active
        FROM system_catalog sc
        WHERE sc.system_code IN (${placeholders})
          AND sc.is_active = 1
      `,
      systemCodes,
    );

    return rows.map(mapSystemCatalogRow);
  }
}

function mapSystemCatalogRow(row: SystemCatalogRow): SystemCatalogRecord {
  return {
    id: row.id,
    systemCode: row.system_code,
    displayName: row.display_name,
    displayOrder: row.display_order,
    isActive: row.is_active === 1,
  };
}
