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
          <span className="page-header__eyebrow">Directorio de rivales</span>
          <h3>{items.length} rivales</h3>
        </div>
      </div>

      {isLoading ? <p className="muted-text">Cargando rivales...</p> : null}

      {!isLoading && items.length === 0 ? (
        <div className="empty-state">
          <h3>No hay rivales para los filtros actuales</h3>
          <p>
            Prueba ampliando la busqueda o crea un nuevo rival para iniciar un
            flujo de scouting.
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
                    <span className="status-pill">Editando</span>
                  ) : null}
                </div>

                <div className="status-strip">
                  <span className="status-pill">
                    {opponent.competitionName ?? 'Competicion pendiente'}
                  </span>
                  <span className="status-pill">
                    {opponent.countryName ?? 'Pais pendiente'}
                  </span>
                </div>
              </div>

              <div className="button-row">
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => onEdit(opponent)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="button"
                  disabled={isCreatingReport}
                  onClick={() => void onCreateScoutingReport(opponent)}
                >
                  {isCreatingReport
                    ? 'Creando informe...'
                    : 'Crear informe de scouting'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
