import type { JSX } from 'react';
import { Link } from 'react-router-dom';

import type { ScoutingReportResponseDto } from '../../reports/api/reportsApi';
import { ReportFormEditor } from './ReportFormEditor';
import { ReportSwotEditor } from './ReportSwotEditor';
import { ReportSystemsEditor } from './ReportSystemsEditor';
import { ReportTacticalAnalysisEditor } from './ReportTacticalAnalysisEditor';
import type { ReportEditorSection } from './report-editor-sections';

interface ReportEditorSectionPanelProps {
  section: ReportEditorSection;
  report: ScoutingReportResponseDto | null;
}

export function ReportEditorSectionPanel({
  section,
  report,
}: ReportEditorSectionPanelProps): JSX.Element {
  if (section.id === 'form') {
    return <ReportFormEditor report={report} />;
  }

  if (section.id === 'systems') {
    return <ReportSystemsEditor report={report} />;
  }

  if (section.id === 'tactical-analysis') {
    return <ReportTacticalAnalysisEditor report={report} />;
  }

  if (section.id === 'swot') {
    return <ReportSwotEditor report={report} />;
  }

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
            Abrir vista previa
          </Link>
        ) : null}
      </div>

      <div className="editor-section-placeholder">
        <p>
          {isPreviewSection
            ? 'Utiliza este paso para revisar el informe en un formato comodo para el cuerpo tecnico antes o despues de publicarlo.'
            : `El editor de ${section.label.toLowerCase()} vivira aqui. Esta base mantiene la seccion explicita y lista para una implementacion enfocada.`}
        </p>
        <div className="status-strip">
          <span className="status-pill">
            {report?.status === 'published'
              ? 'Informe de solo lectura'
              : 'Edicion de borrador'}
          </span>
          {report !== null ? (
            <span className="status-pill">Informe #{report.id}</span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
