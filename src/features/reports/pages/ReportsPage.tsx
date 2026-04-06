import { useState, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiError } from '../../../shared/api/api-client';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { useOpponentsQuery } from '../../opponents/api/opponentsApi';
import {
  type CreateScoutingReportBodyDto,
  type ListScoutingReportsQueryDto,
  type ScoutingReportResponseDto,
  useCreateScoutingReportMutation,
  useDuplicateScoutingReportMutation,
  usePublishScoutingReportMutation,
  useScoutingReportsQuery,
} from '../api/reportsApi';
import { ReportCreatePanel } from '../components/ReportCreatePanel';
import { ReportsFilters } from '../components/ReportsFilters';
import { ReportsListSection } from '../components/ReportsListSection';

export function ReportsPage(): JSX.Element {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ListScoutingReportsQueryDto>({});
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(
    null,
  );
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(
    null,
  );
  const [activeMutationReportId, setActiveMutationReportId] = useState<
    number | null
  >(null);
  const [activeMutationLabel, setActiveMutationLabel] = useState<
    'duplicate' | 'publish' | null
  >(null);

  const opponentsQuery = useOpponentsQuery();
  const reportsQuery = useScoutingReportsQuery(filters);
  const createScoutingReportMutation = useCreateScoutingReportMutation();
  const duplicateScoutingReportMutation = useDuplicateScoutingReportMutation();
  const publishScoutingReportMutation = usePublishScoutingReportMutation();

  const opponents = opponentsQuery.data?.items ?? [];
  const reports = reportsQuery.data?.items ?? [];

  async function handleCreateReport(
    values: CreateScoutingReportBodyDto,
  ): Promise<void> {
    setCreateErrorMessage(null);

    try {
      const report = await createScoutingReportMutation.mutateAsync(values);

      void navigate(
        `/report-editor?reportId=${report.id}&opponentId=${report.opponentId}`,
      );
    } catch (error) {
      setCreateErrorMessage(getErrorMessage(error, 'Unable to create report.'));
    }
  }

  function handleOpenReport(report: ScoutingReportResponseDto): void {
    const targetPath =
      report.status === 'published'
        ? `/report-preview?reportId=${report.id}&opponentId=${report.opponentId}`
        : `/report-editor?reportId=${report.id}&opponentId=${report.opponentId}`;

    void navigate(targetPath);
  }

  async function handleDuplicateReport(
    report: ScoutingReportResponseDto,
  ): Promise<void> {
    setActionErrorMessage(null);
    setActiveMutationReportId(report.id);
    setActiveMutationLabel('duplicate');

    try {
      const duplicatedReport =
        await duplicateScoutingReportMutation.mutateAsync(report.id);

      void navigate(
        `/report-editor?reportId=${duplicatedReport.id}&opponentId=${duplicatedReport.opponentId}`,
      );
    } catch (error) {
      setActionErrorMessage(
        getErrorMessage(error, 'Unable to duplicate report.'),
      );
    } finally {
      setActiveMutationReportId(null);
      setActiveMutationLabel(null);
    }
  }

  async function handlePublishReport(
    report: ScoutingReportResponseDto,
  ): Promise<void> {
    setActionErrorMessage(null);
    setActiveMutationReportId(report.id);
    setActiveMutationLabel('publish');

    try {
      await publishScoutingReportMutation.mutateAsync(report.id);
    } catch (error) {
      setActionErrorMessage(
        getErrorMessage(error, 'Unable to publish report.'),
      );
    } finally {
      setActiveMutationReportId(null);
      setActiveMutationLabel(null);
    }
  }

  return (
    <section className="page">
      <PageHeader
        eyebrow="Scouting Reports"
        title="Reports"
        description="Manage report lifecycle clearly: create drafts, open work in progress, duplicate versions, and publish intentionally."
      />

      <ReportsFilters
        filters={filters}
        opponents={opponents}
        onChange={setFilters}
        onReset={() => setFilters({})}
      />

      <div className="page-grid">
        <ReportsListSection
          reports={reports}
          opponents={opponents}
          isLoading={reportsQuery.isLoading}
          activeMutationReportId={activeMutationReportId}
          activeMutationLabel={activeMutationLabel}
          errorMessage={actionErrorMessage}
          onOpenReport={handleOpenReport}
          onDuplicateReport={handleDuplicateReport}
          onPublishReport={handlePublishReport}
        />

        <ReportCreatePanel
          opponents={opponents}
          isSubmitting={createScoutingReportMutation.isPending}
          errorMessage={createErrorMessage}
          onSubmit={handleCreateReport}
        />
      </div>
    </section>
  );
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}
