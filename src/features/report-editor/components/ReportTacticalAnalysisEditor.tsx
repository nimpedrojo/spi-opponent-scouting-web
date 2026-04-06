import { useEffect, useState, type JSX } from 'react';

import { ApiError } from '../../../shared/api/api-client';
import type { ScoutingReportResponseDto } from '../../reports/api/reportsApi';
import {
  useReplaceScoutingReportTacticalAnalysisMutation,
  useScoutingReportTacticalAnalysisQuery,
  type ReplaceScoutingReportTacticalAnalysisBodyDto,
  type TacticalAnalysisBlockType,
  type TacticalAnalysisItemResponseDto,
  type TacticalAnalysisPhaseType,
} from '../api/tacticalAnalysisApi';

interface ReportTacticalAnalysisEditorProps {
  report: ScoutingReportResponseDto | null;
}

interface TacticalAnalysisEditorItem {
  phaseType: TacticalAnalysisPhaseType;
  blockType: TacticalAnalysisBlockType | '';
  narrative: string;
  keyPoints: string;
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

export function ReportTacticalAnalysisEditor({
  report,
}: ReportTacticalAnalysisEditorProps): JSX.Element {
  const reportId = report?.id ?? 0;
  const isReadOnly = report?.status === 'published';
  const tacticalAnalysisQuery =
    useScoutingReportTacticalAnalysisQuery(reportId);
  const replaceTacticalAnalysisMutation =
    useReplaceScoutingReportTacticalAnalysisMutation();
  const [items, setItems] = useState<TacticalAnalysisEditorItem[]>([
    createEmptyItem(),
  ]);

  useEffect(() => {
    if (tacticalAnalysisQuery.data === undefined) {
      return;
    }

    if (tacticalAnalysisQuery.data.items.length === 0) {
      setItems([createEmptyItem()]);
      return;
    }

    setItems(tacticalAnalysisQuery.data.items.map(mapResponseItemToEditorItem));
  }, [tacticalAnalysisQuery.data]);

  if (report === null) {
    return (
      <section className="panel">
        <div className="empty-state">
          <h3>No hay ningun informe seleccionado</h3>
          <p>Abre primero un informe para editar el analisis tactico.</p>
        </div>
      </section>
    );
  }

  const activeReport = report;

  async function handleSave(): Promise<void> {
    const body: ReplaceScoutingReportTacticalAnalysisBodyDto = {
      items: items.map((item) => ({
        phaseType: item.phaseType,
        blockType: item.blockType === '' ? null : item.blockType,
        narrative: item.narrative.trim(),
        keyPoints: parseKeyPoints(item.keyPoints),
      })),
    };

    const savedTacticalAnalysis =
      await replaceTacticalAnalysisMutation.mutateAsync({
        reportId: activeReport.id,
        body,
      });

    if (savedTacticalAnalysis.items.length === 0) {
      setItems([createEmptyItem()]);
      return;
    }

    setItems(savedTacticalAnalysis.items.map(mapResponseItemToEditorItem));
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <span className="page-header__eyebrow">Analisis tactico</span>
          <h3>Items de analisis por fase</h3>
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
        <p className="muted-text">Cargando analisis tactico...</p>
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
                <label className="field">
                  <span className="field__label">Fase</span>
                  <select
                    value={item.phaseType}
                    disabled={isReadOnly}
                    onChange={(event) =>
                      updateItem(index, 'phaseType', event.target.value)
                    }
                  >
                    {phaseTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span className="field__label">Tipo de bloque</span>
                  <select
                    value={item.blockType}
                    disabled={isReadOnly}
                    onChange={(event) =>
                      updateItem(index, 'blockType', event.target.value)
                    }
                  >
                    <option value="">Sin tipo de bloque</option>
                    {blockTypeOptions.map((option) => (
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
          Manten una idea tactica por item para que el informe siga siendo facil
          de revisar.
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
              : 'Guardar analisis tactico'}
          </button>
        </div>
      </div>
    </section>
  );

  function addItem(): void {
    setItems((currentItems) => [...currentItems, createEmptyItem()]);
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
    value: string,
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

function createEmptyItem(): TacticalAnalysisEditorItem {
  return {
    phaseType: 'attack',
    blockType: '',
    narrative: '',
    keyPoints: '',
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
    blockTypeOptions.find((option) => option.value === value)?.label ?? value
  );
}

function getErrorMessage(error: Error): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return error.message;
}
