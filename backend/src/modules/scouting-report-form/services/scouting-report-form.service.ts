import {
  EntityNotFoundError,
  PublishedReportModificationError,
} from '../../../shared/http/errors.js';
import type { UpsertScoutingReportFormBodyDto } from '../dtos/scouting-report-form-request.dto.js';
import type { ScoutingReportFormResponseDto } from '../dtos/scouting-report-form-response.dto.js';
import type { ScoutingReportFormRepository } from '../repositories/scouting-report-form.repository.js';
import type { OpponentFormRecord } from '../types/scouting-report-form.types.js';

export class ScoutingReportFormService {
  constructor(
    private readonly scoutingReportFormRepository: ScoutingReportFormRepository,
  ) {}

  async getFormByReportId(
    reportId: number,
  ): Promise<ScoutingReportFormResponseDto> {
    await this.getExistingReport(reportId);

    const form =
      await this.scoutingReportFormRepository.findFormByReportId(reportId);

    return mapFormToResponseDto(
      form ?? {
        leaguePosition: null,
        points: null,
        recentFormText: null,
        notes: null,
      },
    );
  }

  async upsertFormByReportId(
    reportId: number,
    input: UpsertScoutingReportFormBodyDto,
  ): Promise<ScoutingReportFormResponseDto> {
    const report = await this.getExistingReport(reportId);

    if (report.status === 'published') {
      throw new PublishedReportModificationError(reportId);
    }

    const savedForm =
      await this.scoutingReportFormRepository.upsertFormByReportId(reportId, {
        leaguePosition: input.leaguePosition,
        points: input.points,
        recentFormText: normalizeOptionalText(input.recentFormText),
        notes: normalizeOptionalText(input.notes),
      });

    return mapFormToResponseDto(savedForm);
  }

  private async getExistingReport(reportId: number) {
    const report =
      await this.scoutingReportFormRepository.findReportById(reportId);

    if (report === null) {
      throw new EntityNotFoundError('ScoutingReport', reportId);
    }

    return report;
  }
}

function mapFormToResponseDto(
  form: OpponentFormRecord,
): ScoutingReportFormResponseDto {
  return {
    leaguePosition: form.leaguePosition,
    points: form.points,
    recentFormText: form.recentFormText,
    notes: form.notes,
  };
}

function normalizeOptionalText(value: string | null): string | null {
  const normalizedValue = value?.trim();

  return normalizedValue === undefined || normalizedValue.length === 0
    ? null
    : normalizedValue;
}
