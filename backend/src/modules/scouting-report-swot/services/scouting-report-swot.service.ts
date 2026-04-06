import {
  EntityNotFoundError,
  PublishedReportModificationError,
} from '../../../shared/http/errors.js';
import type { ReplaceScoutingReportSwotBodyDto } from '../dtos/scouting-report-swot-request.dto.js';
import type {
  ScoutingReportSwotResponseDto,
  SwotItemResponseDto,
} from '../dtos/scouting-report-swot-response.dto.js';
import type { ScoutingReportSwotRepository } from '../repositories/scouting-report-swot.repository.js';
import type { SwotItemRecord } from '../types/scouting-report-swot.types.js';

export class ScoutingReportSwotService {
  constructor(
    private readonly scoutingReportSwotRepository: ScoutingReportSwotRepository,
  ) {}

  async getItemsByReportId(
    reportId: number,
  ): Promise<ScoutingReportSwotResponseDto> {
    await this.getExistingReport(reportId);

    const items =
      await this.scoutingReportSwotRepository.getItemsByReportId(reportId);

    return {
      items: items.map(mapSwotItemToResponseDto),
    };
  }

  async replaceItemsByReportId(
    reportId: number,
    input: ReplaceScoutingReportSwotBodyDto,
  ): Promise<ScoutingReportSwotResponseDto> {
    const report = await this.getExistingReport(reportId);

    if (report.status === 'published') {
      throw new PublishedReportModificationError(reportId);
    }

    const normalizedItems = input.items.map((item) => ({
      swotType: item.swotType,
      description: item.description.trim(),
      priority: item.priority ?? null,
    }));

    // SWOT deserves a dedicated section because these items are decision-support
    // signals with different semantics than narrative report prose.
    await this.scoutingReportSwotRepository.replaceItemsByReportId(
      reportId,
      normalizedItems,
    );

    return this.getItemsByReportId(reportId);
  }

  private async getExistingReport(reportId: number) {
    const report =
      await this.scoutingReportSwotRepository.findReportById(reportId);

    if (report === null) {
      throw new EntityNotFoundError('ScoutingReport', reportId);
    }

    return report;
  }
}

function mapSwotItemToResponseDto(item: SwotItemRecord): SwotItemResponseDto {
  return {
    swotType: item.swotType,
    description: item.description,
    priority: item.priority,
  };
}
