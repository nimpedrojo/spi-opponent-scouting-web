import {
  EntityNotFoundError,
  RelatedEntityNotFoundError,
  ReportAlreadyPublishedError,
} from '../../../shared/http/errors.js';
import { ensureReportIsEditable } from '../../../shared/report-lifecycle/report-lifecycle.js';
import type {
  CreateScoutingReportBodyDto,
  ListScoutingReportsQueryDto,
  UpdateScoutingReportBodyDto,
} from '../dtos/scouting-report-request.dto.js';
import type {
  ScoutingReportListResponseDto,
  ScoutingReportResponseDto,
} from '../dtos/scouting-report-response.dto.js';
import type { ScoutingReportRepository } from '../repositories/scouting-report.repository.js';
import type {
  ListScoutingReportsFilters,
  ScoutingReportRecord,
} from '../types/scouting-report.types.js';

export class ScoutingReportService {
  constructor(
    private readonly scoutingReportRepository: ScoutingReportRepository,
  ) {}

  async createReport(
    input: CreateScoutingReportBodyDto,
  ): Promise<ScoutingReportResponseDto> {
    await ensureOpponentExists(this.scoutingReportRepository, input.opponentId);

    const versionNumber =
      await this.scoutingReportRepository.getNextVersionNumber(
        input.opponentId,
      );

    const createdReport = await this.scoutingReportRepository.create({
      opponentId: input.opponentId,
      versionNumber,
      reportSource: input.reportSource,
      status: 'draft',
      reportDate: normalizeOptionalDate(input.reportDate),
    });

    return mapScoutingReportToResponseDto(createdReport);
  }

  async getReportById(reportId: number): Promise<ScoutingReportResponseDto> {
    const report = await this.scoutingReportRepository.findById(reportId);

    if (report === null) {
      throw new EntityNotFoundError('ScoutingReport', reportId);
    }

    return mapScoutingReportToResponseDto(report);
  }

  async listReports(
    query: ListScoutingReportsQueryDto,
  ): Promise<ScoutingReportListResponseDto> {
    const filters: ListScoutingReportsFilters = {
      opponentId: query.opponentId ?? null,
      status: query.status ?? null,
      season: query.season ?? null,
    };

    const reports = await this.scoutingReportRepository.list(filters);

    return {
      items: reports.map(mapScoutingReportToResponseDto),
    };
  }

  async updateReportMetadata(
    reportId: number,
    input: UpdateScoutingReportBodyDto,
  ): Promise<ScoutingReportResponseDto> {
    const existingReport = await this.getExistingReport(reportId);
    ensureReportIsEditable(reportId, existingReport.status);

    const nextOpponentId = input.opponentId ?? existingReport.opponentId;

    await ensureOpponentExists(this.scoutingReportRepository, nextOpponentId);

    const updatedReport = await this.scoutingReportRepository.updateMetadata(
      reportId,
      {
        opponentId: nextOpponentId,
        reportDate:
          input.reportDate === undefined
            ? existingReport.reportDate
            : normalizeNullableDate(input.reportDate),
      },
    );

    if (updatedReport === null) {
      throw new EntityNotFoundError('ScoutingReport', reportId);
    }

    return mapScoutingReportToResponseDto(updatedReport);
  }

  async duplicateReport(reportId: number): Promise<ScoutingReportResponseDto> {
    const existingReport = await this.getExistingReport(reportId);

    const versionNumber =
      await this.scoutingReportRepository.getNextVersionNumber(
        existingReport.opponentId,
      );

    const duplicatedReport = await this.scoutingReportRepository.create({
      opponentId: existingReport.opponentId,
      versionNumber,
      reportSource: existingReport.reportSource,
      status: 'draft',
      reportDate: existingReport.reportDate,
    });

    return mapScoutingReportToResponseDto(duplicatedReport);
  }

  async publishReport(reportId: number): Promise<ScoutingReportResponseDto> {
    const existingReport = await this.getExistingReport(reportId);

    if (existingReport.status === 'published') {
      throw new ReportAlreadyPublishedError(reportId);
    }

    const publishedReport = await this.scoutingReportRepository.publish(
      reportId,
      new Date(),
    );

    if (publishedReport === null) {
      throw new EntityNotFoundError('ScoutingReport', reportId);
    }

    return mapScoutingReportToResponseDto(publishedReport);
  }

  async deleteReport(reportId: number): Promise<void> {
    const deleted = await this.scoutingReportRepository.delete(reportId);

    if (!deleted) {
      throw new EntityNotFoundError('ScoutingReport', reportId);
    }
  }

  private async getExistingReport(
    reportId: number,
  ): Promise<ScoutingReportRecord> {
    const report = await this.scoutingReportRepository.findById(reportId);

    if (report === null) {
      throw new EntityNotFoundError('ScoutingReport', reportId);
    }

    return report;
  }
}

async function ensureOpponentExists(
  repository: ScoutingReportRepository,
  opponentId: number,
): Promise<void> {
  const exists = await repository.opponentExists(opponentId);

  if (!exists) {
    throw new RelatedEntityNotFoundError(
      'Opponent',
      'ScoutingReport',
      opponentId,
    );
  }
}

function mapScoutingReportToResponseDto(
  report: ScoutingReportRecord,
): ScoutingReportResponseDto {
  return {
    id: report.id,
    opponentId: report.opponentId,
    versionNumber: report.versionNumber,
    reportSource: report.reportSource,
    status: report.status,
    reportDate: report.reportDate?.toISOString().slice(0, 10) ?? null,
    publishedAt: report.publishedAt?.toISOString() ?? null,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
  };
}

function normalizeOptionalDate(value: string | undefined): Date | null {
  return value === undefined ? null : new Date(`${value}T00:00:00.000Z`);
}

function normalizeNullableDate(value: string | null): Date | null {
  return value === null ? null : new Date(`${value}T00:00:00.000Z`);
}
