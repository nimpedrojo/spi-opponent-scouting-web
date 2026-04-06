import { useEffect, useMemo, useState, type JSX } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { ApiError } from '../../../shared/api/api-client';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { useOpponentQuery } from '../../opponents/api/opponentsApi';
import {
  useDuplicateScoutingReportMutation,
  useScoutingReportQuery,
} from '../../reports/api/reportsApi';
import {
  getReportEditorSection,
  ReportEditorSidebar,
} from '../components/ReportEditorSidebar';
import { ReportEditorHeader } from '../components/ReportEditorHeader';
import { ReportEditorSectionPanel } from '../components/ReportEditorSectionPanel';
import { reportEditorSections } from '../components/report-editor-sections';

export function ReportEditorPage(): JSX.Element {
  const navigate = useNavigate();
  const defaultSection = reportEditorSections[0];
  const [searchParams] = useSearchParams();
  const reportId = Number(searchParams.get('reportId') ?? '0');
  const reportQuery = useScoutingReportQuery(reportId);
  const report = reportQuery.data ?? null;
  const fallbackOpponentId = Number(searchParams.get('opponentId') ?? '0');
  const resolvedOpponentId = report?.opponentId ?? fallbackOpponentId;
  const opponentQuery = useOpponentQuery(resolvedOpponentId);
  const opponent = opponentQuery.data ?? null;
  const duplicateScoutingReportMutation = useDuplicateScoutingReportMutation();
  const [activeSectionId, setActiveSectionId] = useState<string>(
    defaultSection?.id ?? 'form',
  );
  const [duplicateErrorMessage, setDuplicateErrorMessage] = useState<
    string | null
  >(null);

  const activeSection = useMemo(
    () => getReportEditorSection(activeSectionId) ?? defaultSection,
    [activeSectionId, defaultSection],
  );

  useEffect(() => {
    const nextSection = searchParams.get('section');

    if (nextSection === null) {
      return;
    }

    if (getReportEditorSection(nextSection) !== undefined) {
      setActiveSectionId(nextSection);
    }
  }, [searchParams]);

  async function handleDuplicateReport(): Promise<void> {
    if (report === null) {
      return;
    }

    setDuplicateErrorMessage(null);

    try {
      const duplicatedReport =
        await duplicateScoutingReportMutation.mutateAsync(report.id);

      void navigate(
        `/report-editor?reportId=${duplicatedReport.id}&opponentId=${duplicatedReport.opponentId}`,
      );
    } catch (error) {
      setDuplicateErrorMessage(
        getErrorMessage(error, 'No se pudo duplicar el informe.'),
      );
    }
  }

  return (
    <section className="page">
      <PageHeader
        eyebrow="Flujo del informe"
        title="Editor de informes"
        description="Flujo de scouting por secciones con contexto claro del informe, visibilidad del ciclo de vida y areas de edicion enfocadas."
      />

      <ReportEditorHeader
        report={report}
        opponent={opponent}
        isLoading={reportQuery.isLoading || opponentQuery.isLoading}
        isDuplicating={duplicateScoutingReportMutation.isPending}
        duplicateErrorMessage={duplicateErrorMessage}
        onDuplicateReport={handleDuplicateReport}
      />

      <div className="editor-layout">
        {activeSection !== undefined ? (
          <>
            <ReportEditorSidebar
              activeSectionId={activeSection.id}
              isReadOnly={report?.status === 'published'}
              onSelectSection={setActiveSectionId}
            />

            <div className="editor-content">
              <ReportEditorSectionPanel
                section={activeSection}
                report={report}
              />
            </div>
          </>
        ) : null}
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
