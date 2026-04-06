import { useEffect, useState, type JSX } from 'react';

import { ApiError } from '../../../shared/api/api-client';
import type { ScoutingReportResponseDto } from '../../reports/api/reportsApi';
import {
  useReplaceScoutingReportSwotMutation,
  useScoutingReportSwotQuery,
  type ReplaceScoutingReportSwotBodyDto,
  type SwotItemResponseDto,
  type SwotItemType,
} from '../api/swotApi';

interface ReportSwotEditorProps {
  report: ScoutingReportResponseDto | null;
}

interface SwotEditorItem {
  description: string;
  priority: string;
}

type SwotGroups = Record<SwotItemType, SwotEditorItem[]>;

const swotTypeSections: Array<{
  type: SwotItemType;
  label: string;
  description: string;
}> = [
  {
    type: 'strength',
    label: 'Fortalezas',
    description: 'Lo que le da ventaja al rival.',
  },
  {
    type: 'weakness',
    label: 'Debilidades',
    description: 'Donde se puede atacar al rival.',
  },
  {
    type: 'opportunity',
    label: 'Oportunidades',
    description:
      'Situaciones que podemos explotar en la preparacion del partido.',
  },
  {
    type: 'threat',
    label: 'Amenazas',
    description: 'Riesgos que necesitan un plan de respuesta.',
  },
];

export function ReportSwotEditor({
  report,
}: ReportSwotEditorProps): JSX.Element {
  const reportId = report?.id ?? 0;
  const isReadOnly = report?.status === 'published';
  const swotQuery = useScoutingReportSwotQuery(reportId);
  const replaceSwotMutation = useReplaceScoutingReportSwotMutation();
  const [groups, setGroups] = useState<SwotGroups>(createEmptyGroups());

  useEffect(() => {
    if (swotQuery.data === undefined) {
      return;
    }

    setGroups(mapResponseItemsToGroups(swotQuery.data.items));
  }, [swotQuery.data]);

  if (report === null) {
    return (
      <section className="panel">
        <div className="empty-state">
          <h3>No hay ningun informe seleccionado</h3>
          <p>Abre primero un informe para editar el analisis DAFO.</p>
        </div>
      </section>
    );
  }

  const activeReport = report;

  async function handleSave(): Promise<void> {
    const body: ReplaceScoutingReportSwotBodyDto = {
      items: flattenGroups(groups),
    };

    const savedSwot = await replaceSwotMutation.mutateAsync({
      reportId: activeReport.id,
      body,
    });

    setGroups(mapResponseItemsToGroups(savedSwot.items));
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <span className="page-header__eyebrow">DAFO</span>
          <h3>Agrupado por significado tactico</h3>
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

      {swotQuery.isLoading ? (
        <p className="muted-text">Cargando DAFO...</p>
      ) : null}

      <div className="stack">
        {swotTypeSections.map((section) => (
          <article key={section.type} className="editor-item-card">
            <div className="panel__header">
              <div>
                <span className="page-header__eyebrow">{section.label}</span>
                <h3>{section.description}</h3>
              </div>
              {!isReadOnly ? (
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => addItem(section.type)}
                >
                  Agregar item
                </button>
              ) : null}
            </div>

            <div className="stack">
              {groups[section.type].map((item, index) => (
                <div
                  key={`${section.type}-${index}`}
                  className="editor-subitem"
                >
                  <div className="editor-form-grid">
                    <label className="field field--span-wide">
                      <span className="field__label">Descripcion</span>
                      <textarea
                        value={item.description}
                        rows={3}
                        placeholder={`Agrega un item de ${section.label.toLowerCase()}.`}
                        disabled={isReadOnly}
                        onChange={(event) =>
                          updateItem(
                            section.type,
                            index,
                            'description',
                            event.target.value,
                          )
                        }
                      />
                    </label>

                    <label className="field">
                      <span className="field__label">Prioridad</span>
                      <input
                        value={item.priority}
                        type="number"
                        min="1"
                        placeholder="1"
                        disabled={isReadOnly}
                        onChange={(event) =>
                          updateItem(
                            section.type,
                            index,
                            'priority',
                            event.target.value,
                          )
                        }
                      />
                    </label>
                  </div>

                  {!isReadOnly ? (
                    <div className="button-row">
                      <button
                        type="button"
                        className="button button--ghost"
                        onClick={() => removeItem(section.type, index)}
                        disabled={groups[section.type].length === 1}
                      >
                        Eliminar item
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </article>
        ))}

        <p className="muted-text">
          Manten los items cortos y especificos para que el DAFO agrupado siga
          siendo facil de revisar con el staff.
        </p>

        {swotQuery.error instanceof Error ? (
          <p className="feedback-message feedback-message--error">
            {swotQuery.error.message}
          </p>
        ) : null}

        {replaceSwotMutation.error instanceof Error ? (
          <p className="feedback-message feedback-message--error">
            {getErrorMessage(replaceSwotMutation.error)}
          </p>
        ) : null}

        <div className="button-row">
          <button
            type="button"
            className="button"
            disabled={isReadOnly || replaceSwotMutation.isPending}
            onClick={() => void handleSave()}
          >
            {replaceSwotMutation.isPending ? 'Guardando...' : 'Guardar DAFO'}
          </button>
        </div>
      </div>
    </section>
  );

  function addItem(swotType: SwotItemType): void {
    setGroups((currentGroups) => ({
      ...currentGroups,
      [swotType]: [...currentGroups[swotType], createEmptyItem()],
    }));
  }

  function removeItem(swotType: SwotItemType, index: number): void {
    setGroups((currentGroups) => {
      if (currentGroups[swotType].length === 1) {
        return currentGroups;
      }

      return {
        ...currentGroups,
        [swotType]: currentGroups[swotType].filter(
          (_, itemIndex) => itemIndex !== index,
        ),
      };
    });
  }

  function updateItem(
    swotType: SwotItemType,
    index: number,
    field: keyof SwotEditorItem,
    value: string,
  ): void {
    setGroups((currentGroups) => ({
      ...currentGroups,
      [swotType]: currentGroups[swotType].map((currentItem, itemIndex) =>
        itemIndex === index
          ? {
              ...currentItem,
              [field]: value,
            }
          : currentItem,
      ),
    }));
  }
}

function createEmptyGroups(): SwotGroups {
  return {
    strength: [createEmptyItem()],
    weakness: [createEmptyItem()],
    opportunity: [createEmptyItem()],
    threat: [createEmptyItem()],
  };
}

function createEmptyItem(): SwotEditorItem {
  return {
    description: '',
    priority: '',
  };
}

function mapResponseItemsToGroups(items: SwotItemResponseDto[]): SwotGroups {
  const groups = createEmptyGroups();

  if (items.length === 0) {
    return groups;
  }

  for (const section of swotTypeSections) {
    const matchingItems = items.filter(
      (item) => item.swotType === section.type,
    );

    groups[section.type] =
      matchingItems.length > 0
        ? matchingItems.map((item) => ({
            description: item.description,
            priority: item.priority === null ? '' : String(item.priority),
          }))
        : [createEmptyItem()];
  }

  return groups;
}

function flattenGroups(
  groups: SwotGroups,
): ReplaceScoutingReportSwotBodyDto['items'] {
  return swotTypeSections.flatMap((section) =>
    groups[section.type].map((item) => ({
      swotType: section.type,
      description: item.description.trim(),
      priority: toNullableNumber(item.priority),
    })),
  );
}

function toNullableNumber(value: string): number | null {
  const normalizedValue = value.trim();

  return normalizedValue === '' ? null : Number(normalizedValue);
}

function getErrorMessage(error: Error): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return error.message;
}
