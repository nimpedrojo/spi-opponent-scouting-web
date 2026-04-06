import type { JSX } from 'react';
import { useSearchParams } from 'react-router-dom';

import { getScoutingReportStatusLabel } from '../../../shared/api/domain-types';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { useOpponentQuery } from '../../opponents/api/opponentsApi';
import { useScoutingReportQuery } from '../../reports/api/reportsApi';
import { useScoutingReportFormQuery } from '../../report-editor/api/formApi';
import { useScoutingReportSystemsQuery } from '../../report-editor/api/systemsApi';
import {
  useScoutingReportTacticalAnalysisQuery,
  type TacticalAnalysisBlockType,
  type TacticalAnalysisPhaseType,
} from '../../report-editor/api/tacticalAnalysisApi';
import { useScoutingReportSwotQuery } from '../../report-editor/api/swotApi';

export function ReportPreviewPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const reportId = Number(searchParams.get('reportId') ?? '0');
  const reportQuery = useScoutingReportQuery(reportId);
  const report = reportQuery.data ?? null;
  const fallbackOpponentId = Number(searchParams.get('opponentId') ?? '0');
  const resolvedOpponentId = report?.opponentId ?? fallbackOpponentId;
  const opponentQuery = useOpponentQuery(resolvedOpponentId);
  const opponent = opponentQuery.data ?? null;
  const formQuery = useScoutingReportFormQuery(reportId);
  const systemsQuery = useScoutingReportSystemsQuery(reportId);
  const tacticalAnalysisQuery =
    useScoutingReportTacticalAnalysisQuery(reportId);
  const swotQuery = useScoutingReportSwotQuery(reportId);

  const swotGroups = {
    strength:
      swotQuery.data?.items.filter((item) => item.swotType === 'strength') ??
      [],
    weakness:
      swotQuery.data?.items.filter((item) => item.swotType === 'weakness') ??
      [],
    opportunity:
      swotQuery.data?.items.filter((item) => item.swotType === 'opportunity') ??
      [],
    threat:
      swotQuery.data?.items.filter((item) => item.swotType === 'threat') ?? [],
  };

  return (
    <section className="page preview-page">
      <PageHeader
        eyebrow="Revision tecnica"
        title="Vista previa del informe"
        description="Disposicion de informe de scouting en solo lectura para revision, entrega y validacion antes de publicar."
      />

      {reportQuery.isLoading || opponentQuery.isLoading ? (
        <section className="panel">
          <p className="muted-text">Cargando vista previa del informe...</p>
        </section>
      ) : null}

      {report !== null ? (
        <section className="preview-hero panel">
          <div className="preview-hero__header">
            <div>
              <span className="page-header__eyebrow">Informe de scouting</span>
              <h3>{opponent?.name ?? `Rival #${report.opponentId}`}</h3>
              <p className="muted-text">
                {opponent?.competitionName ?? 'Competicion pendiente'}
                {opponent?.countryName !== null &&
                opponent?.countryName !== undefined
                  ? ` • ${opponent.countryName}`
                  : ''}
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
                {getScoutingReportStatusLabel(report.status)}
              </span>
              <span className="status-pill">
                Version {report.versionNumber}
              </span>
              <span className="status-pill">
                {report.reportDate ?? 'Sin fecha de informe'}
              </span>
            </div>
          </div>
        </section>
      ) : (
        <section className="panel">
          <div className="empty-state">
            <h3>No hay ningun informe seleccionado</h3>
            <p>
              Abre un informe desde la pantalla de Informes para revisar su
              vista previa en solo lectura.
            </p>
          </div>
        </section>
      )}

      {report !== null ? (
        <div className="preview-layout">
          <aside className="preview-toc panel">
            <div className="panel__header">
              <div>
                <span className="page-header__eyebrow">Secciones</span>
                <h3>Contenido del informe</h3>
              </div>
            </div>

            <nav
              className="preview-toc__nav"
              aria-label="Secciones de la vista previa"
            >
              <a className="preview-toc__link" href="#preview-form">
                Dinamica
              </a>
              <a className="preview-toc__link" href="#preview-systems">
                Sistemas
              </a>
              <a
                className="preview-toc__link"
                href="#preview-tactical-analysis"
              >
                Analisis tactico
              </a>
              <a className="preview-toc__link" href="#preview-swot">
                SWOT
              </a>
            </nav>
          </aside>

          <div className="preview-content">
            <section id="preview-form" className="panel preview-section">
              <div className="panel__header">
                <div>
                  <span className="page-header__eyebrow">Dinamica</span>
                  <h3>Dinamica reciente y contexto</h3>
                </div>
              </div>

              {formQuery.data !== undefined ? (
                <div className="preview-grid">
                  <article className="preview-metric">
                    <span className="page-header__eyebrow">
                      Posicion en liga
                    </span>
                    <strong>
                      {formQuery.data.leaguePosition ?? 'Sin definir'}
                    </strong>
                  </article>
                  <article className="preview-metric">
                    <span className="page-header__eyebrow">Puntos</span>
                    <strong>{formQuery.data.points ?? 'Sin definir'}</strong>
                  </article>
                  <article className="preview-card preview-card--full">
                    <span className="page-header__eyebrow">
                      Resumen de dinamica reciente
                    </span>
                    <p>
                      {formQuery.data.recentFormText ??
                        'Todavia no hay resumen de dinamica reciente.'}
                    </p>
                  </article>
                  <article className="preview-card preview-card--full">
                    <span className="page-header__eyebrow">Notas</span>
                    <p>{formQuery.data.notes ?? 'Todavia no hay notas.'}</p>
                  </article>
                </div>
              ) : (
                <p className="muted-text">Cargando seccion de dinamica...</p>
              )}
            </section>

            <section id="preview-systems" className="panel preview-section">
              <div className="panel__header">
                <div>
                  <span className="page-header__eyebrow">Sistemas</span>
                  <h3>Sistema principal y sistemas alternativos</h3>
                </div>
              </div>

              {systemsQuery.data !== undefined ? (
                <div className="preview-grid">
                  <article className="preview-card">
                    <span className="page-header__eyebrow">
                      Sistema principal
                    </span>
                    <strong>
                      {systemsQuery.data.primarySystem ??
                        'No hay sistema principal guardado.'}
                    </strong>
                  </article>
                  <article className="preview-card">
                    <span className="page-header__eyebrow">
                      Sistemas alternativos
                    </span>
                    {systemsQuery.data.alternateSystems.length > 0 ? (
                      <ul className="preview-list">
                        {systemsQuery.data.alternateSystems.map(
                          (systemCode) => (
                            <li key={systemCode}>{systemCode}</li>
                          ),
                        )}
                      </ul>
                    ) : (
                      <p>No hay sistemas alternativos guardados.</p>
                    )}
                  </article>
                </div>
              ) : (
                <p className="muted-text">Cargando seccion de sistemas...</p>
              )}
            </section>

            <section
              id="preview-tactical-analysis"
              className="panel preview-section"
            >
              <div className="panel__header">
                <div>
                  <span className="page-header__eyebrow">Analisis tactico</span>
                  <h3>Revision por fases</h3>
                </div>
              </div>

              {tacticalAnalysisQuery.data !== undefined ? (
                tacticalAnalysisQuery.data.items.length > 0 ? (
                  <div className="stack">
                    {tacticalAnalysisQuery.data.items.map((item, index) => (
                      <article
                        key={`${item.phaseType}-${index}`}
                        className="preview-card"
                      >
                        <div className="panel__header">
                          <div>
                            <span className="page-header__eyebrow">
                              {getPhaseTypeLabel(item.phaseType)}
                            </span>
                            <h3>
                              {item.blockType !== null
                                ? getBlockTypeLabel(item.blockType)
                                : 'Vision general de la fase'}
                            </h3>
                          </div>
                        </div>
                        <p>{item.narrative}</p>
                        {item.keyPoints.length > 0 ? (
                          <>
                            <span className="page-header__eyebrow">
                              Puntos clave
                            </span>
                            <ul className="preview-list">
                              {item.keyPoints.map((keyPoint) => (
                                <li key={keyPoint}>{keyPoint}</li>
                              ))}
                            </ul>
                          </>
                        ) : null}
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="muted-text">
                    Todavia no hay items de analisis tactico guardados.
                  </p>
                )
              ) : (
                <p className="muted-text">Cargando analisis tactico...</p>
              )}
            </section>

            <section id="preview-swot" className="panel preview-section">
              <div className="panel__header">
                <div>
                  <span className="page-header__eyebrow">SWOT</span>
                  <h3>Revision agrupada por tipo</h3>
                </div>
              </div>

              {swotQuery.data !== undefined ? (
                <div className="preview-grid">
                  <SwotPreviewGroup
                    title="Fortalezas"
                    items={swotGroups.strength}
                  />
                  <SwotPreviewGroup
                    title="Debilidades"
                    items={swotGroups.weakness}
                  />
                  <SwotPreviewGroup
                    title="Oportunidades"
                    items={swotGroups.opportunity}
                  />
                  <SwotPreviewGroup
                    title="Amenazas"
                    items={swotGroups.threat}
                  />
                </div>
              ) : (
                <p className="muted-text">Cargando SWOT...</p>
              )}
            </section>
          </div>
        </div>
      ) : null}
    </section>
  );
}

interface SwotPreviewGroupProps {
  title: string;
  items: Array<{
    description: string;
    priority: number | null;
  }>;
}

function SwotPreviewGroup({
  title,
  items,
}: SwotPreviewGroupProps): JSX.Element {
  return (
    <article className="preview-card">
      <span className="page-header__eyebrow">{title}</span>
      {items.length > 0 ? (
        <ul className="preview-list">
          {items.map((item, index) => (
            <li key={`${title}-${index}`}>
              <span>{item.description}</span>
              {item.priority !== null ? (
                <small className="preview-inline-note">
                  Prioridad {item.priority}
                </small>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p>Todavia no hay items agregados.</p>
      )}
    </article>
  );
}

function getPhaseTypeLabel(value: TacticalAnalysisPhaseType): string {
  switch (value) {
    case 'attack':
      return 'Ataque';
    case 'defense':
      return 'Defensa';
    case 'attacking_transition':
      return 'Transicion ofensiva';
    case 'defensive_transition':
      return 'Transicion defensiva';
    case 'set_piece':
      return 'Balon parado';
  }
}

function getBlockTypeLabel(value: TacticalAnalysisBlockType): string {
  switch (value) {
    case 'high_block':
      return 'Bloque alto';
    case 'mid_block':
      return 'Bloque medio';
    case 'low_block':
      return 'Bloque bajo';
  }
}
