import type { JSX } from 'react';

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
          <span className="page-header__eyebrow">Report Lifecycle</span>
          <h3>{reports.length} reports</h3>
        </div>
      </div>

      {errorMessage !== null ? (
        <p className="feedback-message feedback-message--error">
          {errorMessage}
        </p>
      ) : null}

      {isLoading ? <p className="muted-text">Loading reports...</p> : null}

      {!isLoading && reports.length === 0 ? (
        <div className="empty-state">
          <h3>No reports found</h3>
          <p>
            Create a draft report or adjust the filters to review a different
            lifecycle state.
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
                    <h4>
                      {opponent?.name ?? `Opponent #${report.opponentId}`}
                    </h4>
                    <p className="muted-text">
                      Report #{report.id} • Version {report.versionNumber}
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
                      {report.status}
                    </span>
                    <span className="status-pill">
                      {report.reportDate ?? 'No report date'}
                    </span>
                  </div>
                </div>

                <div className="status-strip">
                  <span className="status-pill">
                    Opponent: {opponent?.name ?? report.opponentId}
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
                  {isPublished ? 'Open preview' : 'Open report'}
                </button>
                <button
                  type="button"
                  className="button button--ghost"
                  disabled={isDuplicatePending}
                  onClick={() => void onDuplicateReport(report)}
                >
                  {isDuplicatePending ? 'Duplicating...' : 'Duplicate'}
                </button>
                <button
                  type="button"
                  className="button"
                  disabled={isPublished || isPublishPending}
                  onClick={() => void onPublishReport(report)}
                >
                  {isPublishPending ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
