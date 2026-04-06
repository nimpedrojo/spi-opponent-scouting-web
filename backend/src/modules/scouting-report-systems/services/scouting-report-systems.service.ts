import {
  EntityNotFoundError,
  InvalidSystemCodeError,
  InvalidSystemSelectionError,
} from '../../../shared/http/errors.js';
import { ensureReportIsEditable } from '../../../shared/report-lifecycle/report-lifecycle.js';
import type { ReplaceScoutingReportSystemsBodyDto } from '../dtos/scouting-report-systems-request.dto.js';
import type { ScoutingReportSystemsResponseDto } from '../dtos/scouting-report-systems-response.dto.js';
import type { ScoutingReportSystemsRepository } from '../repositories/scouting-report-systems.repository.js';
import type { PitchPlayerPosition } from '../../../shared/pitch/pitch-player-position.js';

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
      primarySystem: mapSelectionToResponseDto(
        selections.find((selection) => selection.usageRole === 'primary') ??
          null,
      ),
      alternateSystems: selections
        .filter((selection) => selection.usageRole === 'secondary')
        .map(mapSelectionToResponseDto)
        .filter((selection) => selection !== null),
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
      input.primarySystem.systemCode,
      ...input.alternateSystems.map((system) => system.systemCode),
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
        primarySystem: {
          systemCode: input.primarySystem.systemCode,
          playerPositions: normalizePlayerPositions(
            input.primarySystem.playerPositions,
          ),
        },
        alternateSystems: input.alternateSystems.map((system) => ({
          systemCode: system.systemCode,
          playerPositions: normalizePlayerPositions(system.playerPositions),
        })),
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
  primarySystem: ReplaceScoutingReportSystemsBodyDto['primarySystem'],
  alternateSystems: ReplaceScoutingReportSystemsBodyDto['alternateSystems'],
): void {
  const primarySystemCode = primarySystem.systemCode;
  const alternateSystemCodes = alternateSystems.map(
    (system) => system.systemCode,
  );
  const duplicateAlternateSystems = alternateSystems.filter(
    (system, index) =>
      alternateSystemCodes.indexOf(system.systemCode) !== index,
  );

  if (duplicateAlternateSystems.length > 0) {
    throw new InvalidSystemSelectionError(
      `Duplicate alternate systems are not allowed: ${[
        ...new Set(
          duplicateAlternateSystems.map((system) => system.systemCode),
        ),
      ].join(', ')}`,
    );
  }

  if (alternateSystemCodes.includes(primarySystemCode)) {
    throw new InvalidSystemSelectionError(
      'Primary system cannot also appear in alternateSystems',
    );
  }
}

function mapSelectionToResponseDto(
  selection:
    | Awaited<
        ReturnType<ScoutingReportSystemsRepository['getSystemsForReport']>
      >[number]
    | null,
) {
  if (selection === null) {
    return null;
  }

  return {
    systemCode: selection.systemCode,
    playerPositions: selection.playerPositions,
  };
}

function normalizePlayerPositions(
  playerPositions: PitchPlayerPosition[],
): PitchPlayerPosition[] {
  return playerPositions.map((position) => ({
    playerNumber: position.playerNumber,
    x: position.x,
    y: position.y,
  }));
}
