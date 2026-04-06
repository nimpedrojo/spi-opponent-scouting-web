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
  useDeleteScoutingReportMutation,
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
    'duplicate' | 'publish' | 'delete' | null
  >(null);

  const opponentsQuery = useOpponentsQuery();
  const reportsQuery = useScoutingReportsQuery(filters);
  const createScoutingReportMutation = useCreateScoutingReportMutation();
  const deleteScoutingReportMutation = useDeleteScoutingReportMutation();
  const duplicateScoutingReportMutation = useDuplicateScoutingReportMutation();
  const publishScoutingReportMutation = usePublishScoutingReportMutation();

  const opponents = opponentsQuery.data?.items ?? [];
  const reports = reportsQuery.data?.items ?? [];
  const reportsErrorMessage =
    actionErrorMessage ??
    (reportsQuery.error instanceof Error
      ? getErrorMessage(
          reportsQuery.error,
          'No se pudieron cargar los informes.',
        )
      : null);

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
      setCreateErrorMessage(
        getErrorMessage(error, 'No se pudo crear el informe.'),
      );
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
        getErrorMessage(error, 'No se pudo duplicar el informe.'),
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
        getErrorMessage(error, 'No se pudo publicar el informe.'),
      );
    } finally {
      setActiveMutationReportId(null);
      setActiveMutationLabel(null);
    }
  }

  async function handleDeleteReport(
    report: ScoutingReportResponseDto,
  ): Promise<void> {
    setActionErrorMessage(null);
    setActiveMutationReportId(report.id);
    setActiveMutationLabel('delete');

    try {
      await deleteScoutingReportMutation.mutateAsync(report.id);
    } catch (error) {
      setActionErrorMessage(
        getErrorMessage(error, 'No se pudo borrar el informe.'),
      );
    } finally {
      setActiveMutationReportId(null);
      setActiveMutationLabel(null);
    }
  }

  return (
    <section className="page">
      <PageHeader
        eyebrow="Informes de scouting"
        title="Informes"
        description="Gestiona con claridad el ciclo de vida del informe: crea borradores, abre trabajo en curso, duplica versiones y publica de forma intencional."
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
          errorMessage={reportsErrorMessage}
          onOpenReport={handleOpenReport}
          onDuplicateReport={handleDuplicateReport}
          onPublishReport={handlePublishReport}
          onDeleteReport={handleDeleteReport}
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
