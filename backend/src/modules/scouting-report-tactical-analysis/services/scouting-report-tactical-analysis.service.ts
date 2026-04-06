import {
  EntityNotFoundError,
  PublishedReportModificationError,
} from '../../../shared/http/errors.js';
import type { ReplaceScoutingReportTacticalAnalysisBodyDto } from '../dtos/scouting-report-tactical-analysis-request.dto.js';
import type {
  ScoutingReportTacticalAnalysisResponseDto,
  TacticalAnalysisItemResponseDto,
} from '../dtos/scouting-report-tactical-analysis-response.dto.js';
import type { ScoutingReportTacticalAnalysisRepository } from '../repositories/scouting-report-tactical-analysis.repository.js';
import type { TacticalAnalysisItemRecord } from '../types/scouting-report-tactical-analysis.types.js';

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

    if (report.status === 'published') {
      throw new PublishedReportModificationError(reportId);
    }

    const normalizedItems = input.items.map((item) => ({
      phaseType: item.phaseType,
      blockType: item.blockType,
      narrative: item.narrative.trim(),
      keyPoints: normalizeKeyPoints(item.keyPoints),
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
  };
}

function normalizeKeyPoints(keyPoints: string[] | undefined): string[] {
  return (keyPoints ?? []).map((keyPoint) => keyPoint.trim());
}
