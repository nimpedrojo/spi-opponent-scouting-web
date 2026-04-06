import type { JSX } from 'react';

import { getScoutingReportStatusLabel } from '../../../shared/api/domain-types';
import type { OpponentResponseDto } from '../../opponents/api/opponentsApi';
import type { ScoutingReportResponseDto } from '../../reports/api/reportsApi';

interface ReportEditorHeaderProps {
  report: ScoutingReportResponseDto | null;
  opponent: OpponentResponseDto | null;
  isLoading: boolean;
  isDuplicating: boolean;
  duplicateErrorMessage: string | null;
  onDuplicateReport: () => Promise<void>;
}

export function ReportEditorHeader({
  report,
  opponent,
  isLoading,
  isDuplicating,
  duplicateErrorMessage,
  onDuplicateReport,
}: ReportEditorHeaderProps): JSX.Element {
  if (isLoading) {
    return (
      <section className="panel">
        <p className="muted-text">Cargando contexto del informe...</p>
      </section>
    );
  }

  if (report === null) {
    return (
      <section className="panel">
        <div className="empty-state">
          <h3>Selecciona un informe para empezar a editar</h3>
          <p>
            Abre un informe en borrador desde la pantalla de Informes o crea uno
            nuevo desde el flujo de Rivales.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="editor-header">
        <div className="editor-header__identity">
          <span className="page-header__eyebrow">Informe activo</span>
          <h3>{opponent?.name ?? `Rival #${report.opponentId}`}</h3>
          <p className="muted-text">
            {report.status === 'published'
              ? 'Este informe esta publicado y es de solo lectura. Duplicalo para seguir editando en un nuevo borrador.'
              : 'Entorno de edicion por secciones para la preparacion de scouting.'}
          </p>
        </div>

        <div className="editor-header__actions">
          <div className="status-strip">
            <span
              className={
                report.status === 'published'
                  ? 'status-pill status-pill--published'
                  : 'status-pill'
              }
            >
              {getScoutingReportStatusLabel(report.status)}
            </span>
            <span className="status-pill">Version {report.versionNumber}</span>
            <span className="status-pill">
              Rival: {opponent?.name ?? report.opponentId}
            </span>
          </div>

          <div className="button-row">
            <button
              type="button"
              className="button button--ghost"
              disabled={isDuplicating}
              onClick={() => void onDuplicateReport()}
            >
              {isDuplicating ? 'Duplicando...' : 'Duplicar a borrador'}
            </button>
          </div>
        </div>
      </div>

      {report.status === 'published' ? (
        <p className="feedback-message feedback-message--info">
          La edicion esta deshabilitada para informes publicados. Revisa el
          contenido o duplica este informe para crear una nueva version editable
          en borrador.
        </p>
      ) : null}

      {duplicateErrorMessage !== null ? (
        <p className="feedback-message feedback-message--error">
          {duplicateErrorMessage}
        </p>
      ) : null}
    </section>
  );
}
