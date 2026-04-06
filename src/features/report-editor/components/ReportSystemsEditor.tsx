import { useEffect, type JSX } from 'react';

import { ApiError } from '../../../shared/api/api-client';
import { useAppForm } from '../../../shared/forms/useAppForm';
import { SystemPitchDiagram } from '../../../shared/ui/SystemPitchDiagram';
import type { ScoutingReportResponseDto } from '../../reports/api/reportsApi';
import {
  useReplaceScoutingReportSystemsMutation,
  useScoutingReportSystemsQuery,
  type ReplaceScoutingReportSystemsBodyDto,
} from '../api/systemsApi';

interface ReportSystemsEditorProps {
  report: ScoutingReportResponseDto | null;
}

interface ReportSystemsValues {
  primarySystem: string;
  alternateSystems: string;
}

const emptySystemsValues: ReportSystemsValues = {
  primarySystem: '',
  alternateSystems: '',
};

export function ReportSystemsEditor({
  report,
}: ReportSystemsEditorProps): JSX.Element {
  const reportId = report?.id ?? 0;
  const isReadOnly = report?.status === 'published';
  const systemsQuery = useScoutingReportSystemsQuery(reportId);
  const replaceSystemsMutation = useReplaceScoutingReportSystemsMutation();
  const { handleSubmit, register, reset, watch } =
    useAppForm<ReportSystemsValues>({
      defaultValues: emptySystemsValues,
    });
  const watchedPrimarySystem = watch('primarySystem');
  const watchedAlternateSystems = watch('alternateSystems');

  useEffect(() => {
    if (systemsQuery.data === undefined) {
      return;
    }

    reset({
      primarySystem: systemsQuery.data.primarySystem ?? '',
      alternateSystems: systemsQuery.data.alternateSystems.join('\n'),
    });
  }, [reset, systemsQuery.data]);

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

  async function submitForm(values: ReportSystemsValues): Promise<void> {
    const body: ReplaceScoutingReportSystemsBodyDto = {
      primarySystem: values.primarySystem.trim(),
      alternateSystems: parseAlternateSystems(values.alternateSystems),
    };

    const savedSystems = await replaceSystemsMutation.mutateAsync({
      reportId: activeReport.id,
      body,
    });

    reset({
      primarySystem: savedSystems.primarySystem ?? '',
      alternateSystems: savedSystems.alternateSystems.join('\n'),
    });
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

      <form
        className="stack"
        onSubmit={(event) => {
          void handleSubmit(submitForm)(event);
        }}
      >
        <label className="field">
          <span className="field__label">Sistema principal</span>
          <input
            {...register('primarySystem', {
              required: 'El sistema principal es obligatorio.',
            })}
            placeholder="1-4-3-3"
            disabled={isReadOnly}
          />
        </label>

        <label className="field">
          <span className="field__label">Sistemas alternativos</span>
          <textarea
            {...register('alternateSystems')}
            rows={5}
            placeholder={'1-4-4-2\n1-3-5-2'}
            disabled={isReadOnly}
          />
        </label>

        <p className="muted-text">
          Agrega un sistema alternativo por linea. El backend valida cada codigo
          contra el catalogo.
        </p>

        <div className="system-diagram-grid">
          <SystemPitchDiagram
            title="Sistema principal"
            subtitle="Campograma"
            systemCode={watchedPrimarySystem ?? ''}
          />

          {parseAlternateSystems(watchedAlternateSystems ?? '').map(
            (systemCode, index) => (
              <SystemPitchDiagram
                key={`${systemCode}-${index}`}
                title={`Alternativo ${index + 1}`}
                subtitle="Campograma"
                systemCode={systemCode}
              />
            ),
          )}
        </div>

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
            type="submit"
            className="button"
            disabled={isReadOnly || replaceSystemsMutation.isPending}
          >
            {replaceSystemsMutation.isPending
              ? 'Guardando...'
              : 'Guardar sistemas'}
          </button>
        </div>
      </form>
    </section>
  );
}

function parseAlternateSystems(value: string): string[] {
  return value
    .split('\n')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function getErrorMessage(error: Error): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return error.message;
}
