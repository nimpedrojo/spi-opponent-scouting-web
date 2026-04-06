import { useEffect, useMemo, useState, type JSX } from 'react';
import { useSearchParams } from 'react-router-dom';

import { PageHeader } from '../../../shared/ui/PageHeader';
import { useOpponentQuery } from '../../opponents/api/opponentsApi';
import { useScoutingReportQuery } from '../../reports/api/reportsApi';
import {
  getReportEditorSection,
  ReportEditorSidebar,
} from '../components/ReportEditorSidebar';
import { ReportEditorHeader } from '../components/ReportEditorHeader';
import { ReportEditorSectionPanel } from '../components/ReportEditorSectionPanel';
import { reportEditorSections } from '../components/report-editor-sections';

export function ReportEditorPage(): JSX.Element {
  const defaultSection = reportEditorSections[0];
  const [searchParams] = useSearchParams();
  const reportId = Number(searchParams.get('reportId') ?? '0');
  const reportQuery = useScoutingReportQuery(reportId);
  const report = reportQuery.data ?? null;
  const fallbackOpponentId = Number(searchParams.get('opponentId') ?? '0');
  const resolvedOpponentId = report?.opponentId ?? fallbackOpponentId;
  const opponentQuery = useOpponentQuery(resolvedOpponentId);
  const opponent = opponentQuery.data ?? null;
  const [activeSectionId, setActiveSectionId] = useState<string>(
    defaultSection?.id ?? 'form',
  );

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

  return (
    <section className="page">
      <PageHeader
        eyebrow="Report Workflow"
        title="Report Editor"
        description="Section-based scouting workflow with clear report context, lifecycle visibility, and focused editing areas."
      />

      <ReportEditorHeader
        report={report}
        opponent={opponent}
        isLoading={reportQuery.isLoading || opponentQuery.isLoading}
      />

      <div className="editor-layout">
        {activeSection !== undefined ? (
          <>
            <ReportEditorSidebar
              activeSectionId={activeSection.id}
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
