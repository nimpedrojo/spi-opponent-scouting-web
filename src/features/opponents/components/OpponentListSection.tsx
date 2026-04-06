import type { JSX } from 'react';

import type { OpponentResponseDto } from '../api/opponentsApi';

interface OpponentListSectionProps {
  items: OpponentResponseDto[];
  isLoading: boolean;
  activeOpponentId: number | null;
  creatingReportForOpponentId: number | null;
  onEdit: (opponent: OpponentResponseDto) => void;
  onCreateScoutingReport: (opponent: OpponentResponseDto) => Promise<void>;
}

export function OpponentListSection({
  items,
  isLoading,
  activeOpponentId,
  creatingReportForOpponentId,
  onEdit,
  onCreateScoutingReport,
}: OpponentListSectionProps): JSX.Element {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <span className="page-header__eyebrow">Opponent Directory</span>
          <h3>{items.length} opponents</h3>
        </div>
      </div>

      {isLoading ? <p className="muted-text">Loading opponents...</p> : null}

      {!isLoading && items.length === 0 ? (
        <div className="empty-state">
          <h3>No opponents match the current filters</h3>
          <p>
            Try broadening the search or create a new opponent to start a
            scouting workflow.
          </p>
        </div>
      ) : null}

      <div className="opponent-list">
        {items.map((opponent) => {
          const isCreatingReport = creatingReportForOpponentId === opponent.id;

          return (
            <article key={opponent.id} className="opponent-card">
              <div className="opponent-card__content">
                <div className="opponent-card__heading">
                  <h4>{opponent.name}</h4>
                  {activeOpponentId === opponent.id ? (
                    <span className="status-pill">Editing</span>
                  ) : null}
                </div>

                <div className="status-strip">
                  <span className="status-pill">
                    {opponent.competitionName ?? 'Competition pending'}
                  </span>
                  <span className="status-pill">
                    {opponent.countryName ?? 'Country pending'}
                  </span>
                </div>
              </div>

              <div className="button-row">
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => onEdit(opponent)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="button"
                  disabled={isCreatingReport}
                  onClick={() => void onCreateScoutingReport(opponent)}
                >
                  {isCreatingReport
                    ? 'Creating report...'
                    : 'Create scouting report'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
