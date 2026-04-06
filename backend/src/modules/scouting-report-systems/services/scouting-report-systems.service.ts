import {
  EntityNotFoundError,
  InvalidSystemCodeError,
  InvalidSystemSelectionError,
} from '../../../shared/http/errors.js';
import { ensureReportIsEditable } from '../../../shared/report-lifecycle/report-lifecycle.js';
import type { ReplaceScoutingReportSystemsBodyDto } from '../dtos/scouting-report-systems-request.dto.js';
import type { ScoutingReportSystemsResponseDto } from '../dtos/scouting-report-systems-response.dto.js';
import type { ScoutingReportSystemsRepository } from '../repositories/scouting-report-systems.repository.js';

export class ScoutingReportSystemsService {
  constructor(
    private readonly scoutingReportSystemsRepository: ScoutingReportSystemsRepository,
  ) {}

  async getSystemsForReport(
    reportId: number,
  ): Promise<ScoutingReportSystemsResponseDto> {
    await this.getExistingReport(reportId);

    const selections =
      await this.scoutingReportSystemsRepository.getSystemsForReport(reportId);

    return {
      primarySystem:
        selections.find((selection) => selection.usageRole === 'primary')
          ?.systemCode ?? null,
      alternateSystems: selections
        .filter((selection) => selection.usageRole === 'secondary')
        .map((selection) => selection.systemCode),
    };
  }

  async replaceSystemsForReport(
    reportId: number,
    input: ReplaceScoutingReportSystemsBodyDto,
  ): Promise<ScoutingReportSystemsResponseDto> {
    const report = await this.getExistingReport(reportId);
    ensureReportIsEditable(reportId, report.status);

    ensureDistinctSystems(input.primarySystem, input.alternateSystems);

    const requestedSystemCodes = [
      input.primarySystem,
      ...input.alternateSystems,
    ];
    const catalogSystems =
      await this.scoutingReportSystemsRepository.findCatalogSystemsByCodes(
        requestedSystemCodes,
      );
    const catalogSystemCodes = new Set(
      catalogSystems.map((system) => system.systemCode),
    );
    const invalidSystemCodes = requestedSystemCodes.filter(
      (systemCode) => !catalogSystemCodes.has(systemCode),
    );

    if (invalidSystemCodes.length > 0) {
      throw new InvalidSystemCodeError(invalidSystemCodes);
    }

    await this.scoutingReportSystemsRepository.replaceSystemsForReport(
      reportId,
      {
        primarySystemCode: input.primarySystem,
        alternateSystemCodes: input.alternateSystems,
      },
    );

    return this.getSystemsForReport(reportId);
  }

  private async getExistingReport(reportId: number) {
    const report =
      await this.scoutingReportSystemsRepository.findReportById(reportId);

    if (report === null) {
      throw new EntityNotFoundError('ScoutingReport', reportId);
    }

    return report;
  }
}

function ensureDistinctSystems(
  primarySystem: string,
  alternateSystems: string[],
): void {
  const duplicateAlternateSystems = alternateSystems.filter(
    (systemCode, index) => alternateSystems.indexOf(systemCode) !== index,
  );

  if (duplicateAlternateSystems.length > 0) {
    throw new InvalidSystemSelectionError(
      `Duplicate alternate systems are not allowed: ${[
        ...new Set(duplicateAlternateSystems),
      ].join(', ')}`,
    );
  }

  if (alternateSystems.includes(primarySystem)) {
    throw new InvalidSystemSelectionError(
      'Primary system cannot also appear in alternateSystems',
    );
  }
}
