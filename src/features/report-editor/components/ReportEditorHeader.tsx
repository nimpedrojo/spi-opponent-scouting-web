import type { JSX } from 'react';

import type { OpponentResponseDto } from '../../opponents/api/opponentsApi';
import type { ScoutingReportResponseDto } from '../../reports/api/reportsApi';

interface ReportEditorHeaderProps {
  report: ScoutingReportResponseDto | null;
  opponent: OpponentResponseDto | null;
  isLoading: boolean;
}

export function ReportEditorHeader({
  report,
  opponent,
  isLoading,
}: ReportEditorHeaderProps): JSX.Element {
  if (isLoading) {
    return (
      <section className="panel">
        <p className="muted-text">Loading report context...</p>
      </section>
    );
  }

  if (report === null) {
    return (
      <section className="panel">
        <div className="empty-state">
          <h3>Select a report to begin editing</h3>
          <p>
            Open a draft report from the Reports page or create a new one from
            the Opponents workflow.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="editor-header">
        <div className="editor-header__identity">
          <span className="page-header__eyebrow">Active Report</span>
          <h3>{opponent?.name ?? `Opponent #${report.opponentId}`}</h3>
          <p className="muted-text">
            Section-based editing shell for scouting preparation.
          </p>
        </div>

        <div className="status-strip">
          <span
            className={
              report.status === 'published'
                ? 'status-pill status-pill--published'
                : 'status-pill'
            }
          >
            {report.status}
          </span>
          <span className="status-pill">Version {report.versionNumber}</span>
          <span className="status-pill">
            Opponent: {opponent?.name ?? report.opponentId}
          </span>
        </div>
      </div>
    </section>
  );
}
