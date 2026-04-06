import { useEffect, type JSX } from 'react';

import { ApiError } from '../../../shared/api/api-client';
import { useAppForm } from '../../../shared/forms/useAppForm';
import type { ScoutingReportResponseDto } from '../../reports/api/reportsApi';
import {
  useScoutingReportFormQuery,
  useUpsertScoutingReportFormMutation,
  type UpsertScoutingReportFormBodyDto,
} from '../api/formApi';

interface ReportFormEditorProps {
  report: ScoutingReportResponseDto | null;
}

interface ReportFormValues {
  leaguePosition: string;
  points: string;
  recentFormText: string;
  notes: string;
}

const emptyFormValues: ReportFormValues = {
  leaguePosition: '',
  points: '',
  recentFormText: '',
  notes: '',
};

export function ReportFormEditor({
  report,
}: ReportFormEditorProps): JSX.Element {
  const reportId = report?.id ?? 0;
  const isReadOnly = report?.status === 'published';
  const formQuery = useScoutingReportFormQuery(reportId);
  const upsertFormMutation = useUpsertScoutingReportFormMutation();
  const { handleSubmit, register, reset } = useAppForm<ReportFormValues>({
    defaultValues: emptyFormValues,
  });

  useEffect(() => {
    if (formQuery.data === undefined) {
      return;
    }

    reset({
      leaguePosition: toInputValue(formQuery.data.leaguePosition),
      points: toInputValue(formQuery.data.points),
      recentFormText: formQuery.data.recentFormText ?? '',
      notes: formQuery.data.notes ?? '',
    });
  }, [formQuery.data, reset]);

  if (report === null) {
    return (
      <section className="panel">
        <div className="empty-state">
          <h3>No hay ningun informe seleccionado</h3>
          <p>Abre primero un informe para editar la dinamica del rival.</p>
        </div>
      </section>
    );
  }

  const activeReport = report;

  async function submitForm(values: ReportFormValues): Promise<void> {
    const body: UpsertScoutingReportFormBodyDto = {
      leaguePosition: toNullableNumber(values.leaguePosition),
      points: toNullableNumber(values.points),
      recentFormText: toNullableText(values.recentFormText),
      notes: toNullableText(values.notes),
    };

    const savedForm = await upsertFormMutation.mutateAsync({
      reportId: activeReport.id,
      body,
    });

    reset({
      leaguePosition: toInputValue(savedForm.leaguePosition),
      points: toInputValue(savedForm.points),
      recentFormText: savedForm.recentFormText ?? '',
      notes: savedForm.notes ?? '',
    });
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <span className="page-header__eyebrow">Dinamica</span>
          <h3>Dinamica reciente y contexto</h3>
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

      {formQuery.isLoading ? (
        <p className="muted-text">Cargando seccion de dinamica...</p>
      ) : null}

      <form
        className="stack"
        onSubmit={(event) => {
          void handleSubmit(submitForm)(event);
        }}
      >
        <div className="editor-form-grid">
          <label className="field">
            <span className="field__label">Posicion en liga</span>
            <input
              {...register('leaguePosition')}
              type="number"
              min="1"
              placeholder="1"
              disabled={isReadOnly}
            />
          </label>

          <label className="field">
            <span className="field__label">Puntos</span>
            <input
              {...register('points')}
              type="number"
              min="0"
              placeholder="68"
              disabled={isReadOnly}
            />
          </label>
        </div>

        <label className="field">
          <span className="field__label">Resumen de dinamica reciente</span>
          <textarea
            {...register('recentFormText')}
            rows={4}
            placeholder="Resume las tendencias recientes de rendimiento."
            disabled={isReadOnly}
          />
        </label>

        <label className="field">
          <span className="field__label">Notas</span>
          <textarea
            {...register('notes')}
            rows={5}
            placeholder="Agrega contexto para cuerpo tecnico y analistas."
            disabled={isReadOnly}
          />
        </label>

        {formQuery.error instanceof Error ? (
          <p className="feedback-message feedback-message--error">
            {formQuery.error.message}
          </p>
        ) : null}

        {upsertFormMutation.error instanceof Error ? (
          <p className="feedback-message feedback-message--error">
            {getErrorMessage(upsertFormMutation.error)}
          </p>
        ) : null}

        <div className="button-row">
          <button
            type="submit"
            className="button"
            disabled={isReadOnly || upsertFormMutation.isPending}
          >
            {upsertFormMutation.isPending ? 'Guardando...' : 'Guardar dinamica'}
          </button>
        </div>
      </form>
    </section>
  );
}

function toNullableNumber(value: string): number | null {
  const normalizedValue = value.trim();

  return normalizedValue === '' ? null : Number(normalizedValue);
}

function toNullableText(value: string): string | null {
  const normalizedValue = value.trim();

  return normalizedValue === '' ? null : normalizedValue;
}

function toInputValue(value: number | null): string {
  return value === null ? '' : String(value);
}

function getErrorMessage(error: Error): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return error.message;
}
