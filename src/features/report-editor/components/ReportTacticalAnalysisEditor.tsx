import { useEffect, useState, type JSX } from 'react';

import { ApiError } from '../../../shared/api/api-client';
import type { PitchPlayerPositionDto } from '../../../shared/api/domain-types';
import {
  createDefaultSetPiecePlayerPositions,
  createNextSetPiecePlayerPosition,
  normalizePitchPlayerPositions,
} from '../../../shared/lib/pitch/pitch-player-positions';
import { PitchPositionBoard } from '../../../shared/ui/PitchPositionBoard';
import type { ScoutingReportResponseDto } from '../../reports/api/reportsApi';
import {
  useReplaceScoutingReportTacticalAnalysisMutation,
  useScoutingReportTacticalAnalysisQuery,
  type ReplaceScoutingReportTacticalAnalysisBodyDto,
  type TacticalAnalysisBlockType,
  type TacticalAnalysisItemResponseDto,
  type TacticalAnalysisPhaseType,
} from '../api/tacticalAnalysisApi';

const MAX_SET_PIECE_PLAYERS = 11;

interface ReportTacticalAnalysisEditorProps {
  report: ScoutingReportResponseDto | null;
  sectionMode?: 'general' | 'set-piece';
}

interface TacticalAnalysisEditorItem {
  phaseType: TacticalAnalysisPhaseType;
  blockType: TacticalAnalysisBlockType | '';
  narrative: string;
  keyPoints: string;
  playerPositions: PitchPlayerPositionDto[];
}

const phaseTypeOptions: Array<{
  value: TacticalAnalysisPhaseType;
  label: string;
}> = [
  { value: 'attack', label: 'Ataque' },
  { value: 'defense', label: 'Defensa' },
  { value: 'attacking_transition', label: 'Transicion ofensiva' },
  { value: 'defensive_transition', label: 'Transicion defensiva' },
  { value: 'set_piece', label: 'Balon parado' },
];

const blockTypeOptions: Array<{
  value: TacticalAnalysisBlockType;
  label: string;
}> = [
  { value: 'high_block', label: 'Bloque alto' },
  { value: 'mid_block', label: 'Bloque medio' },
  { value: 'low_block', label: 'Bloque bajo' },
];

const setPieceTypeOptions: Array<{
  value: TacticalAnalysisBlockType;
  label: string;
}> = [
  { value: 'corner', label: 'Corner' },
  { value: 'wide_free_kick', label: 'Falta lateral' },
  { value: 'central_free_kick', label: 'Falta central' },
  { value: 'throw_in', label: 'Saque de banda' },
  { value: 'other', label: 'Otro' },
];

export function ReportTacticalAnalysisEditor({
  report,
  sectionMode = 'general',
}: ReportTacticalAnalysisEditorProps): JSX.Element {
  const reportId = report?.id ?? 0;
  const isReadOnly = report?.status === 'published';
  const tacticalAnalysisQuery =
    useScoutingReportTacticalAnalysisQuery(reportId);
  const replaceTacticalAnalysisMutation =
    useReplaceScoutingReportTacticalAnalysisMutation();
  const [items, setItems] = useState<TacticalAnalysisEditorItem[]>([
    createEmptyItem(sectionMode),
  ]);
  const isSetPieceSection = sectionMode === 'set-piece';

  useEffect(() => {
    if (tacticalAnalysisQuery.data === undefined) {
      return;
    }

    const filteredItems = tacticalAnalysisQuery.data.items.filter((item) =>
      isItemIncludedInSection(item.phaseType, sectionMode),
    );

    if (filteredItems.length === 0) {
      setItems([createEmptyItem(sectionMode)]);
      return;
    }

    setItems(filteredItems.map(mapResponseItemToEditorItem));
  }, [sectionMode, tacticalAnalysisQuery.data]);

  if (report === null) {
    return (
      <section className="panel">
        <div className="empty-state">
          <h3>No hay ningun informe seleccionado</h3>
          <p>
            Abre primero un informe para editar{' '}
            {isSetPieceSection ? 'el balon parado.' : 'el analisis tactico.'}
          </p>
        </div>
      </section>
    );
  }

  const activeReport = report;

  async function handleSave(): Promise<void> {
    const preservedItems =
      tacticalAnalysisQuery.data?.items.filter(
        (item) => !isItemIncludedInSection(item.phaseType, sectionMode),
      ) ?? [];

    const body: ReplaceScoutingReportTacticalAnalysisBodyDto = {
      items: [
        ...preservedItems,
        ...items.map((item) => ({
          phaseType: item.phaseType,
          blockType: item.blockType === '' ? null : item.blockType,
          narrative: item.narrative.trim(),
          keyPoints: parseKeyPoints(item.keyPoints),
          playerPositions: normalizePitchPlayerPositions(item.playerPositions),
        })),
      ],
    };

    const savedTacticalAnalysis =
      await replaceTacticalAnalysisMutation.mutateAsync({
        reportId: activeReport.id,
        body,
      });

    const filteredSavedItems = savedTacticalAnalysis.items.filter((item) =>
      isItemIncludedInSection(item.phaseType, sectionMode),
    );

    if (filteredSavedItems.length === 0) {
      setItems([createEmptyItem(sectionMode)]);
      return;
    }

    setItems(filteredSavedItems.map(mapResponseItemToEditorItem));
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <span className="page-header__eyebrow">
            {isSetPieceSection ? 'Balon parado' : 'Analisis tactico'}
          </span>
          <h3>
            {isSetPieceSection
              ? 'Acciones a balon parado y patrones de ejecucion'
              : 'Items de analisis por fase'}
          </h3>
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

      {tacticalAnalysisQuery.isLoading ? (
        <p className="muted-text">
          {isSetPieceSection
            ? 'Cargando balon parado...'
            : 'Cargando analisis tactico...'}
        </p>
      ) : null}

      <div className="stack">
        {items.map((item, index) => (
          <article key={index} className="editor-item-card">
            <div className="panel__header">
              <div>
                <span className="page-header__eyebrow">Item {index + 1}</span>
                <h3>
                  {getPhaseTypeLabel(item.phaseType)}
                  {item.blockType !== ''
                    ? ` • ${getBlockTypeLabel(item.blockType)}`
                    : ''}
                </h3>
              </div>
              {!isReadOnly ? (
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                >
                  Eliminar item
                </button>
              ) : null}
            </div>

            <div className="stack">
              <div className="editor-form-grid">
                {!isSetPieceSection ? (
                  <label className="field">
                    <span className="field__label">Fase</span>
                    <select
                      value={item.phaseType}
                      disabled={isReadOnly}
                      onChange={(event) =>
                        updateItem(index, 'phaseType', event.target.value)
                      }
                    >
                      {phaseTypeOptions
                        .filter((option) => option.value !== 'set_piece')
                        .map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                    </select>
                  </label>
                ) : null}

                <label className="field">
                  <span className="field__label">
                    {isSetPieceSection ? 'Tipo de accion' : 'Tipo de bloque'}
                  </span>
                  <select
                    value={item.blockType}
                    disabled={isReadOnly}
                    onChange={(event) =>
                      updateItem(index, 'blockType', event.target.value)
                    }
                  >
                    <option value="">
                      {isSetPieceSection
                        ? 'Sin tipo de accion'
                        : 'Sin tipo de bloque'}
                    </option>
                    {(isSetPieceSection
                      ? setPieceTypeOptions
                      : blockTypeOptions
                    ).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="field">
                <span className="field__label">Narrativa</span>
                <textarea
                  value={item.narrative}
                  rows={5}
                  placeholder="Describe el comportamiento tactico para esta fase."
                  disabled={isReadOnly}
                  onChange={(event) =>
                    updateItem(index, 'narrative', event.target.value)
                  }
                />
              </label>

              <label className="field">
                <span className="field__label">Puntos clave</span>
                <textarea
                  value={item.keyPoints}
                  rows={4}
                  placeholder={'Un punto clave por linea'}
                  disabled={isReadOnly}
                  onChange={(event) =>
                    updateItem(index, 'keyPoints', event.target.value)
                  }
                />
              </label>

              {isSetPieceSection ? (
                <div className="stack">
                  <div className="panel__header">
                    <div>
                      <span className="page-header__eyebrow">Campograma</span>
                      <h3>Colocacion libre de jugadores</h3>
                    </div>
                    {!isReadOnly ? (
                      <button
                        type="button"
                        className="button button--ghost"
                        onClick={() =>
                          updateItem(
                            index,
                            'playerPositions',
                            createDefaultSetPiecePlayerPositions(),
                          )
                        }
                      >
                        Reiniciar posiciones
                      </button>
                    ) : null}
                  </div>

                  <div className="pitch-board pitch-board--set-piece">
                    <PitchPositionBoard
                      positions={item.playerPositions}
                      readOnly={isReadOnly}
                      variant="half"
                      showPlayerNumbers={false}
                      onChange={(nextPositions) =>
                        updateItem(index, 'playerPositions', nextPositions)
                      }
                    />
                  </div>

                  {!isReadOnly ? (
                    <div className="button-row">
                      <button
                        type="button"
                        className="button button--ghost"
                        disabled={
                          item.playerPositions.length >= MAX_SET_PIECE_PLAYERS
                        }
                        onClick={() =>
                          updateItem(index, 'playerPositions', [
                            ...item.playerPositions,
                            createNextSetPiecePlayerPosition(
                              item.playerPositions,
                            ),
                          ])
                        }
                      >
                        Agregar jugador
                      </button>
                    </div>
                  ) : null}

                  <p className="muted-text">
                    {item.playerPositions.length >= MAX_SET_PIECE_PLAYERS
                      ? 'Ya has colocado los 11 jugadores disponibles.'
                      : `Jugadores colocados: ${item.playerPositions.length} de ${MAX_SET_PIECE_PLAYERS}.`}
                  </p>
                </div>
              ) : null}
            </div>
          </article>
        ))}

        {!isReadOnly ? (
          <div className="button-row">
            <button
              type="button"
              className="button button--ghost"
              onClick={addItem}
            >
              Agregar item
            </button>
          </div>
        ) : null}

        <p className="muted-text">
          {isSetPieceSection
            ? 'Manten una accion o patron por item para que el balon parado se revise con claridad.'
            : 'Manten una idea tactica por item para que el informe siga siendo facil de revisar.'}
        </p>

        {tacticalAnalysisQuery.error instanceof Error ? (
          <p className="feedback-message feedback-message--error">
            {tacticalAnalysisQuery.error.message}
          </p>
        ) : null}

        {replaceTacticalAnalysisMutation.error instanceof Error ? (
          <p className="feedback-message feedback-message--error">
            {getErrorMessage(replaceTacticalAnalysisMutation.error)}
          </p>
        ) : null}

        <div className="button-row">
          <button
            type="button"
            className="button"
            disabled={isReadOnly || replaceTacticalAnalysisMutation.isPending}
            onClick={() => void handleSave()}
          >
            {replaceTacticalAnalysisMutation.isPending
              ? 'Guardando...'
              : isSetPieceSection
                ? 'Guardar balon parado'
                : 'Guardar analisis tactico'}
          </button>
        </div>
      </div>
    </section>
  );

  function addItem(): void {
    setItems((currentItems) => [...currentItems, createEmptyItem(sectionMode)]);
  }

  function removeItem(index: number): void {
    setItems((currentItems) => {
      if (currentItems.length === 1) {
        return currentItems;
      }

      return currentItems.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  function updateItem(
    index: number,
    field: keyof TacticalAnalysisEditorItem,
    value: string | PitchPlayerPositionDto[],
  ): void {
    setItems((currentItems) =>
      currentItems.map((currentItem, itemIndex) =>
        itemIndex === index
          ? {
              ...currentItem,
              [field]: value,
            }
          : currentItem,
      ),
    );
  }
}

function createEmptyItem(
  sectionMode: 'general' | 'set-piece',
): TacticalAnalysisEditorItem {
  return {
    phaseType: sectionMode === 'set-piece' ? 'set_piece' : 'attack',
    blockType: '',
    narrative: '',
    keyPoints: '',
    playerPositions:
      sectionMode === 'set-piece' ? createDefaultSetPiecePlayerPositions() : [],
  };
}

function mapResponseItemToEditorItem(
  item: TacticalAnalysisItemResponseDto,
): TacticalAnalysisEditorItem {
  return {
    phaseType: item.phaseType,
    blockType: item.blockType ?? '',
    narrative: item.narrative,
    keyPoints: item.keyPoints.join('\n'),
    playerPositions: item.playerPositions,
  };
}

function parseKeyPoints(value: string): string[] {
  return value
    .split('\n')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function getPhaseTypeLabel(value: TacticalAnalysisPhaseType): string {
  return (
    phaseTypeOptions.find((option) => option.value === value)?.label ?? value
  );
}

function getBlockTypeLabel(value: TacticalAnalysisBlockType): string {
  return (
    [...blockTypeOptions, ...setPieceTypeOptions].find(
      (option) => option.value === value,
    )?.label ?? value
  );
}

function getErrorMessage(error: Error): string {
  if (error instanceof ApiError) {
    if (Array.isArray(error.issues) && error.issues.length > 0) {
      const firstIssue = error.issues[0] as {
        message?: string;
        path?: Array<string | number>;
      };

      if (typeof firstIssue?.message === 'string') {
        return firstIssue.message;
      }

      if (Array.isArray(firstIssue?.path) && firstIssue.path.length > 0) {
        return `Error de validacion en ${firstIssue.path.join('.')}.`;
      }
    }

    return error.message;
  }

  return error.message;
}

function isItemIncludedInSection(
  phaseType: TacticalAnalysisPhaseType,
  sectionMode: 'general' | 'set-piece',
): boolean {
  if (sectionMode === 'set-piece') {
    return phaseType === 'set_piece';
  }

  return phaseType !== 'set_piece';
}
