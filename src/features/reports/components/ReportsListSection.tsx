import type { JSX } from 'react';

import { getScoutingReportStatusLabel } from '../../../shared/api/domain-types';
import type { OpponentResponseDto } from '../../opponents/api/opponentsApi';
import type { ScoutingReportResponseDto } from '../api/reportsApi';

interface ReportsListSectionProps {
  reports: ScoutingReportResponseDto[];
  opponents: OpponentResponseDto[];
  isLoading: boolean;
  activeMutationReportId: number | null;
  activeMutationLabel: 'duplicate' | 'publish' | null;
  errorMessage: string | null;
  onOpenReport: (report: ScoutingReportResponseDto) => void;
  onDuplicateReport: (report: ScoutingReportResponseDto) => Promise<void>;
  onPublishReport: (report: ScoutingReportResponseDto) => Promise<void>;
}

export function ReportsListSection({
  reports,
  opponents,
  isLoading,
  activeMutationReportId,
  activeMutationLabel,
  errorMessage,
  onOpenReport,
  onDuplicateReport,
  onPublishReport,
}: ReportsListSectionProps): JSX.Element {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <span className="page-header__eyebrow">
            Ciclo de vida del informe
          </span>
          <h3>{reports.length} informes</h3>
        </div>
      </div>

      {errorMessage !== null ? (
        <p className="feedback-message feedback-message--error">
          {errorMessage}
        </p>
      ) : null}

      {isLoading ? <p className="muted-text">Cargando informes...</p> : null}

      {!isLoading && reports.length === 0 ? (
        <div className="empty-state">
          <h3>No se encontraron informes</h3>
          <p>
            Crea un informe en borrador o ajusta los filtros para revisar otro
            estado del ciclo de vida.
          </p>
        </div>
      ) : null}

      <div className="report-list">
        {reports.map((report) => {
          const opponent = opponents.find(
            (candidate) => candidate.id === report.opponentId,
          );
          const isDuplicatePending =
            activeMutationReportId === report.id &&
            activeMutationLabel === 'duplicate';
          const isPublishPending =
            activeMutationReportId === report.id &&
            activeMutationLabel === 'publish';
          const isPublished = report.status === 'published';

          return (
            <article key={report.id} className="report-card">
              <div className="report-card__content">
                <div className="report-card__header">
                  <div>
                    <h4>{opponent?.name ?? `Rival #${report.opponentId}`}</h4>
                    <p className="muted-text">
                      Informe #{report.id} • Version {report.versionNumber}
                    </p>
                  </div>

                  <div className="status-strip">
                    <span
                      className={
                        isPublished
                          ? 'status-pill status-pill--published'
                          : 'status-pill'
                      }
                    >
                      {getScoutingReportStatusLabel(report.status)}
                    </span>
                    <span className="status-pill">
                      {report.reportDate ?? 'Sin fecha de informe'}
                    </span>
                  </div>
                </div>

                <div className="status-strip">
                  <span className="status-pill">
                    Rival: {opponent?.name ?? report.opponentId}
                  </span>
                  {opponent?.competitionName !== null &&
                  opponent?.competitionName !== undefined ? (
                    <span className="status-pill">
                      {opponent.competitionName}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="button-row">
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => onOpenReport(report)}
                >
                  {isPublished ? 'Abrir vista previa' : 'Abrir informe'}
                </button>
                <button
                  type="button"
                  className="button button--ghost"
                  disabled={isDuplicatePending}
                  onClick={() => void onDuplicateReport(report)}
                >
                  {isDuplicatePending ? 'Duplicando...' : 'Duplicar'}
                </button>
                <button
                  type="button"
                  className="button"
                  disabled={isPublished || isPublishPending}
                  onClick={() => void onPublishReport(report)}
                >
                  {isPublishPending ? 'Publicando...' : 'Publicar'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
