import { EntityNotFoundError } from '../../../shared/http/errors.js';
import { ensureReportIsEditable } from '../../../shared/report-lifecycle/report-lifecycle.js';
import type { ReplaceScoutingReportTacticalAnalysisBodyDto } from '../dtos/scouting-report-tactical-analysis-request.dto.js';
import type {
  ScoutingReportTacticalAnalysisResponseDto,
  TacticalAnalysisItemResponseDto,
} from '../dtos/scouting-report-tactical-analysis-response.dto.js';
import type { ScoutingReportTacticalAnalysisRepository } from '../repositories/scouting-report-tactical-analysis.repository.js';
import type {
  TacticalAnalysisBlockType,
  TacticalAnalysisItemRecord,
} from '../types/scouting-report-tactical-analysis.types.js';
import type { PitchPlayerPosition } from '../../../shared/pitch/pitch-player-position.js';

export class ScoutingReportTacticalAnalysisService {
  constructor(
    private readonly scoutingReportTacticalAnalysisRepository: ScoutingReportTacticalAnalysisRepository,
  ) {}

  async getItemsByReportId(
    reportId: number,
  ): Promise<ScoutingReportTacticalAnalysisResponseDto> {
    await this.getExistingReport(reportId);

    const items =
      await this.scoutingReportTacticalAnalysisRepository.getItemsByReportId(
        reportId,
      );

    return {
      items: items.map(mapItemToResponseDto),
    };
  }

  async replaceItemsByReportId(
    reportId: number,
    input: ReplaceScoutingReportTacticalAnalysisBodyDto,
  ): Promise<ScoutingReportTacticalAnalysisResponseDto> {
    const report = await this.getExistingReport(reportId);
    ensureReportIsEditable(reportId, report.status);

    const normalizedItems = input.items.map((item) => ({
      phaseType: item.phaseType,
      blockType: normalizeBlockType(item.phaseType, item.blockType),
      narrative: item.narrative.trim(),
      keyPoints: normalizeKeyPoints(item.keyPoints),
      playerPositions: normalizePlayerPositions(item.playerPositions),
    }));

    await this.scoutingReportTacticalAnalysisRepository.replaceItemsByReportId(
      reportId,
      normalizedItems,
    );

    return this.getItemsByReportId(reportId);
  }

  private async getExistingReport(reportId: number) {
    const report =
      await this.scoutingReportTacticalAnalysisRepository.findReportById(
        reportId,
      );

    if (report === null) {
      throw new EntityNotFoundError('ScoutingReport', reportId);
    }

    return report;
  }
}

function mapItemToResponseDto(
  item: TacticalAnalysisItemRecord,
): TacticalAnalysisItemResponseDto {
  return {
    phaseType: item.phaseType,
    blockType: item.blockType,
    narrative: item.narrative,
    keyPoints: item.keyPoints,
    playerPositions: item.playerPositions,
  };
}

function normalizeKeyPoints(keyPoints: string[] | undefined): string[] {
  return (keyPoints ?? []).map((keyPoint) => keyPoint.trim());
}

function normalizePlayerPositions(
  playerPositions: PitchPlayerPosition[] | undefined,
): PitchPlayerPosition[] {
  return (playerPositions ?? []).map((position) => ({
    playerNumber: position.playerNumber,
    x: position.x,
    y: position.y,
  }));
}

function normalizeBlockType(
  phaseType: TacticalAnalysisItemRecord['phaseType'],
  blockType: TacticalAnalysisBlockType | null,
): TacticalAnalysisBlockType | null {
  if (blockType === null) {
    return null;
  }

  if (phaseType === 'set_piece') {
    return isSetPieceType(blockType) ? blockType : null;
  }

  return isGeneralBlockType(blockType) ? blockType : null;
}

function isGeneralBlockType(
  blockType: TacticalAnalysisBlockType,
): blockType is 'high_block' | 'mid_block' | 'low_block' {
  return (
    blockType === 'high_block' ||
    blockType === 'mid_block' ||
    blockType === 'low_block'
  );
}

function isSetPieceType(
  blockType: TacticalAnalysisBlockType,
): blockType is
  | 'corner'
  | 'wide_free_kick'
  | 'central_free_kick'
  | 'throw_in'
  | 'other' {
  return (
    blockType === 'corner' ||
    blockType === 'wide_free_kick' ||
    blockType === 'central_free_kick' ||
    blockType === 'throw_in' ||
    blockType === 'other'
  );
}
