import type { JSX } from 'react';
import { Link } from 'react-router-dom';

import type { ScoutingReportResponseDto } from '../../reports/api/reportsApi';
import type { ReportEditorSection } from './report-editor-sections';

interface ReportEditorSectionPanelProps {
  section: ReportEditorSection;
  report: ScoutingReportResponseDto | null;
}

export function ReportEditorSectionPanel({
  section,
  report,
}: ReportEditorSectionPanelProps): JSX.Element {
  const isPreviewSection = section.id === 'preview';
  const previewHref =
    report === null
      ? '/report-preview'
      : `/report-preview?reportId=${report.id}&opponentId=${report.opponentId}`;

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <span className="page-header__eyebrow">{section.label}</span>
          <h3>{section.description}</h3>
        </div>
        {isPreviewSection ? (
          <Link className="button button--ghost" to={previewHref}>
            Open preview
          </Link>
        ) : null}
      </div>

      <div className="editor-section-placeholder">
        <p>
          {isPreviewSection
            ? 'Use this step to review the report in a coach-friendly format before or after publication.'
            : `The ${section.label.toLowerCase()} editor will live here. This shell keeps the section explicit and ready for focused implementation.`}
        </p>
        <div className="status-strip">
          <span className="status-pill">
            {report?.status === 'published'
              ? 'Read-only report'
              : 'Draft editing'}
          </span>
          {report !== null ? (
            <span className="status-pill">Report #{report.id}</span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
