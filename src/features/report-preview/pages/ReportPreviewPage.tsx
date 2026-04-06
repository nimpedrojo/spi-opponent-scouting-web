import type { JSX } from 'react';
import { useSearchParams } from 'react-router-dom';

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
        eyebrow="Coach Review"
        title="Report Preview"
        description="Read-only scouting report layout for review, handoff, and publication checks."
      />

      {reportQuery.isLoading || opponentQuery.isLoading ? (
        <section className="panel">
          <p className="muted-text">Loading report preview...</p>
        </section>
      ) : null}

      {report !== null ? (
        <section className="preview-hero panel">
          <div className="preview-hero__header">
            <div>
              <span className="page-header__eyebrow">Scouting Report</span>
              <h3>{opponent?.name ?? `Opponent #${report.opponentId}`}</h3>
              <p className="muted-text">
                {opponent?.competitionName ?? 'Competition pending'}
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
                {report.status}
              </span>
              <span className="status-pill">
                Version {report.versionNumber}
              </span>
              <span className="status-pill">
                {report.reportDate ?? 'No report date'}
              </span>
            </div>
          </div>
        </section>
      ) : (
        <section className="panel">
          <div className="empty-state">
            <h3>No report selected</h3>
            <p>
              Open a report from the Reports page to review its read-only
              preview.
            </p>
          </div>
        </section>
      )}

      {report !== null ? (
        <div className="preview-layout">
          <aside className="preview-toc panel">
            <div className="panel__header">
              <div>
                <span className="page-header__eyebrow">Sections</span>
                <h3>Report contents</h3>
              </div>
            </div>

            <nav className="preview-toc__nav" aria-label="Preview sections">
              <a className="preview-toc__link" href="#preview-form">
                Form
              </a>
              <a className="preview-toc__link" href="#preview-systems">
                Systems
              </a>
              <a
                className="preview-toc__link"
                href="#preview-tactical-analysis"
              >
                Tactical Analysis
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
                  <span className="page-header__eyebrow">Form</span>
                  <h3>Recent dynamics and context</h3>
                </div>
              </div>

              {formQuery.data !== undefined ? (
                <div className="preview-grid">
                  <article className="preview-metric">
                    <span className="page-header__eyebrow">
                      League Position
                    </span>
                    <strong>
                      {formQuery.data.leaguePosition ?? 'Not set'}
                    </strong>
                  </article>
                  <article className="preview-metric">
                    <span className="page-header__eyebrow">Points</span>
                    <strong>{formQuery.data.points ?? 'Not set'}</strong>
                  </article>
                  <article className="preview-card preview-card--full">
                    <span className="page-header__eyebrow">
                      Recent Form Text
                    </span>
                    <p>
                      {formQuery.data.recentFormText ??
                        'No recent form summary yet.'}
                    </p>
                  </article>
                  <article className="preview-card preview-card--full">
                    <span className="page-header__eyebrow">Notes</span>
                    <p>{formQuery.data.notes ?? 'No notes added yet.'}</p>
                  </article>
                </div>
              ) : (
                <p className="muted-text">Loading form section...</p>
              )}
            </section>

            <section id="preview-systems" className="panel preview-section">
              <div className="panel__header">
                <div>
                  <span className="page-header__eyebrow">Systems</span>
                  <h3>Primary and alternate systems</h3>
                </div>
              </div>

              {systemsQuery.data !== undefined ? (
                <div className="preview-grid">
                  <article className="preview-card">
                    <span className="page-header__eyebrow">Primary System</span>
                    <strong>
                      {systemsQuery.data.primarySystem ??
                        'No primary system saved.'}
                    </strong>
                  </article>
                  <article className="preview-card">
                    <span className="page-header__eyebrow">
                      Alternate Systems
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
                      <p>No alternate systems saved.</p>
                    )}
                  </article>
                </div>
              ) : (
                <p className="muted-text">Loading systems section...</p>
              )}
            </section>

            <section
              id="preview-tactical-analysis"
              className="panel preview-section"
            >
              <div className="panel__header">
                <div>
                  <span className="page-header__eyebrow">
                    Tactical Analysis
                  </span>
                  <h3>Phase-based review</h3>
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
                                : 'General phase view'}
                            </h3>
                          </div>
                        </div>
                        <p>{item.narrative}</p>
                        {item.keyPoints.length > 0 ? (
                          <>
                            <span className="page-header__eyebrow">
                              Key Points
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
                    No tactical analysis items saved yet.
                  </p>
                )
              ) : (
                <p className="muted-text">Loading tactical analysis...</p>
              )}
            </section>

            <section id="preview-swot" className="panel preview-section">
              <div className="panel__header">
                <div>
                  <span className="page-header__eyebrow">SWOT</span>
                  <h3>Grouped review by type</h3>
                </div>
              </div>

              {swotQuery.data !== undefined ? (
                <div className="preview-grid">
                  <SwotPreviewGroup
                    title="Strengths"
                    items={swotGroups.strength}
                  />
                  <SwotPreviewGroup
                    title="Weaknesses"
                    items={swotGroups.weakness}
                  />
                  <SwotPreviewGroup
                    title="Opportunities"
                    items={swotGroups.opportunity}
                  />
                  <SwotPreviewGroup title="Threats" items={swotGroups.threat} />
                </div>
              ) : (
                <p className="muted-text">Loading SWOT...</p>
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
                  Priority {item.priority}
                </small>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p>No items added yet.</p>
      )}
    </article>
  );
}

function getPhaseTypeLabel(value: TacticalAnalysisPhaseType): string {
  switch (value) {
    case 'attack':
      return 'Attack';
    case 'defense':
      return 'Defense';
    case 'attacking_transition':
      return 'Attacking Transition';
    case 'defensive_transition':
      return 'Defensive Transition';
    case 'set_piece':
      return 'Set Piece';
  }
}

function getBlockTypeLabel(value: TacticalAnalysisBlockType): string {
  switch (value) {
    case 'high_block':
      return 'High Block';
    case 'mid_block':
      return 'Mid Block';
    case 'low_block':
      return 'Low Block';
  }
}
