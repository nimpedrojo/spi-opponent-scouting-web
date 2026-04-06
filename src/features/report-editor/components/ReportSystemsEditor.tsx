import { useEffect, useState, type JSX } from 'react';

import { ApiError } from '../../../shared/api/api-client';
import type { PitchPlayerPositionDto } from '../../../shared/api/domain-types';
import {
  createFormationPlayerPositions,
  normalizePitchPlayerPositions,
} from '../../../shared/lib/pitch/pitch-player-positions';
import { PitchPositionBoard } from '../../../shared/ui/PitchPositionBoard';
import type { ScoutingReportResponseDto } from '../../reports/api/reportsApi';
import {
  useReplaceScoutingReportSystemsMutation,
  useScoutingReportSystemsQuery,
  type ReplaceScoutingReportSystemsBodyDto,
  type ScoutingReportSystemSelectionDto,
} from '../api/systemsApi';

interface ReportSystemsEditorProps {
  report: ScoutingReportResponseDto | null;
}

export function ReportSystemsEditor({
  report,
}: ReportSystemsEditorProps): JSX.Element {
  const reportId = report?.id ?? 0;
  const isReadOnly = report?.status === 'published';
  const systemsQuery = useScoutingReportSystemsQuery(reportId);
  const replaceSystemsMutation = useReplaceScoutingReportSystemsMutation();
  const [primarySystem, setPrimarySystem] =
    useState<ScoutingReportSystemSelectionDto>({
      systemCode: '',
      playerPositions: [],
    });
  const [alternateSystems, setAlternateSystems] = useState<
    ScoutingReportSystemSelectionDto[]
  >([]);

  useEffect(() => {
    if (systemsQuery.data === undefined) {
      return;
    }

    setPrimarySystem(
      systemsQuery.data.primarySystem ?? {
        systemCode: '',
        playerPositions: [],
      },
    );
    setAlternateSystems(systemsQuery.data.alternateSystems);
  }, [systemsQuery.data]);

  if (report === null) {
    return (
      <section className="panel">
        <div className="empty-state">
          <h3>No hay ningun informe seleccionado</h3>
          <p>Abre primero un informe para gestionar los sistemas tacticos.</p>
        </div>
      </section>
    );
  }

  const activeReport = report;

  async function handleSave(): Promise<void> {
    const body: ReplaceScoutingReportSystemsBodyDto = {
      primarySystem: {
        systemCode: primarySystem.systemCode.trim(),
        playerPositions: normalizePitchPlayerPositions(
          primarySystem.playerPositions,
        ),
      },
      alternateSystems: alternateSystems
        .map((system) => ({
          systemCode: system.systemCode.trim(),
          playerPositions: normalizePitchPlayerPositions(
            system.playerPositions,
          ),
        }))
        .filter((system) => system.systemCode.length > 0),
    };

    const savedSystems = await replaceSystemsMutation.mutateAsync({
      reportId: activeReport.id,
      body,
    });

    setPrimarySystem(
      savedSystems.primarySystem ?? {
        systemCode: '',
        playerPositions: [],
      },
    );
    setAlternateSystems(savedSystems.alternateSystems);
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <span className="page-header__eyebrow">Sistemas</span>
          <h3>Sistema principal y sistemas alternativos</h3>
        </div>
        <div className="status-strip">
          <span
            className={
              isReadOnly ? 'status-pill status-pill--published' : 'status-pill'
            }
          >
            {isReadOnly ? 'Solo lectura' : 'Borrador editable'}
          </span>
        </div>
      </div>

      {systemsQuery.isLoading ? (
        <p className="muted-text">Cargando seccion de sistemas...</p>
      ) : null}

      <div className="stack">
        <section className="editor-item-card">
          <div className="panel__header">
            <div>
              <span className="page-header__eyebrow">Sistema principal</span>
              <h3>
                {primarySystem.systemCode || 'Configura la estructura base'}
              </h3>
            </div>
            {!isReadOnly ? (
              <button
                type="button"
                className="button button--ghost"
                onClick={() => {
                  setPrimarySystem((currentSystem) => ({
                    ...currentSystem,
                    playerPositions: createFormationPlayerPositions(
                      currentSystem.systemCode,
                    ),
                  }));
                }}
              >
                Recolocar jugadores
              </button>
            ) : null}
          </div>

          <div className="stack">
            <label className="field">
              <span className="field__label">Codigo del sistema principal</span>
              <input
                value={primarySystem.systemCode}
                placeholder="1-4-3-3"
                disabled={isReadOnly}
                onChange={(event) => {
                  const systemCode = event.target.value;

                  setPrimarySystem({
                    systemCode,
                    playerPositions: createFormationPlayerPositions(systemCode),
                  });
                }}
              />
            </label>

            <PitchPositionBoard
              positions={primarySystem.playerPositions}
              readOnly={isReadOnly}
              onChange={(nextPositions) => {
                setPrimarySystem((currentSystem) => ({
                  ...currentSystem,
                  playerPositions: nextPositions,
                }));
              }}
            />
          </div>
        </section>

        <section className="editor-item-card">
          <div className="panel__header">
            <div>
              <span className="page-header__eyebrow">
                Sistemas alternativos
              </span>
              <h3>Variantes tacticas y ajustes posibles</h3>
            </div>
            {!isReadOnly ? (
              <button
                type="button"
                className="button button--ghost"
                onClick={() => {
                  setAlternateSystems((currentSystems) => [
                    ...currentSystems,
                    {
                      systemCode: '',
                      playerPositions: [],
                    },
                  ]);
                }}
              >
                Agregar alternativo
              </button>
            ) : null}
          </div>

          <div className="stack">
            {alternateSystems.length > 0 ? (
              alternateSystems.map((system, index) => (
                <article key={index} className="editor-subitem">
                  <div className="panel__header">
                    <div>
                      <span className="page-header__eyebrow">
                        Alternativo {index + 1}
                      </span>
                      <h3>{system.systemCode || 'Sin definir'}</h3>
                    </div>
                    {!isReadOnly ? (
                      <div className="button-row">
                        <button
                          type="button"
                          className="button button--ghost"
                          onClick={() => {
                            updateAlternateSystem(index, {
                              ...system,
                              playerPositions: createFormationPlayerPositions(
                                system.systemCode,
                              ),
                            });
                          }}
                        >
                          Recolocar
                        </button>
                        <button
                          type="button"
                          className="button button--ghost"
                          onClick={() => {
                            setAlternateSystems((currentSystems) =>
                              currentSystems.filter(
                                (_, systemIndex) => systemIndex !== index,
                              ),
                            );
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <div className="stack">
                    <label className="field">
                      <span className="field__label">Codigo del sistema</span>
                      <input
                        value={system.systemCode}
                        placeholder="1-4-4-2"
                        disabled={isReadOnly}
                        onChange={(event) => {
                          const systemCode = event.target.value;

                          updateAlternateSystem(index, {
                            systemCode,
                            playerPositions:
                              createFormationPlayerPositions(systemCode),
                          });
                        }}
                      />
                    </label>

                    <PitchPositionBoard
                      positions={system.playerPositions}
                      readOnly={isReadOnly}
                      onChange={(nextPositions) => {
                        updateAlternateSystem(index, {
                          ...system,
                          playerPositions: nextPositions,
                        });
                      }}
                    />
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <p>
                  No hay sistemas alternativos definidos. Puedes agregar uno
                  para reflejar variantes de partido.
                </p>
              </div>
            )}
          </div>
        </section>

        <p className="muted-text">
          Puedes arrastrar libremente los jugadores en cada campograma para
          ajustar la estructura real observada.
        </p>

        {systemsQuery.error instanceof Error ? (
          <p className="feedback-message feedback-message--error">
            {systemsQuery.error.message}
          </p>
        ) : null}

        {replaceSystemsMutation.error instanceof Error ? (
          <p className="feedback-message feedback-message--error">
            {getErrorMessage(replaceSystemsMutation.error)}
          </p>
        ) : null}

        <div className="button-row">
          <button
            type="button"
            className="button"
            disabled={
              isReadOnly ||
              replaceSystemsMutation.isPending ||
              primarySystem.systemCode.trim().length === 0
            }
            onClick={() => void handleSave()}
          >
            {replaceSystemsMutation.isPending
              ? 'Guardando...'
              : 'Guardar sistemas'}
          </button>
        </div>
      </div>
    </section>
  );

  function updateAlternateSystem(
    index: number,
    nextSystem: ScoutingReportSystemSelectionDto,
  ): void {
    setAlternateSystems((currentSystems) =>
      currentSystems.map((currentSystem, systemIndex) =>
        systemIndex === index ? nextSystem : currentSystem,
      ),
    );
  }
}

function getErrorMessage(error: Error): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return error.message;
}
