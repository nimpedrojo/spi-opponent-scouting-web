import type { JSX } from 'react';

import type { OpponentResponseDto } from '../../opponents/api/opponentsApi';
import type { CreateScoutingReportBodyDto } from '../api/reportsApi';
import { useAppForm } from '../../../shared/forms/useAppForm';

interface ReportCreateFormValues {
  opponentId: string;
  reportSource: 'video_analysis' | 'scouting' | 'references';
  reportDate: string;
}

interface ReportCreatePanelProps {
  opponents: OpponentResponseDto[];
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (values: CreateScoutingReportBodyDto) => Promise<void>;
}

export function ReportCreatePanel({
  opponents,
  isSubmitting,
  errorMessage,
  onSubmit,
}: ReportCreatePanelProps): JSX.Element {
  const { handleSubmit, register, reset } = useAppForm<ReportCreateFormValues>({
    defaultValues: {
      opponentId: '',
      reportSource: 'scouting',
      reportDate: '',
    },
  });

  async function submitForm(values: ReportCreateFormValues): Promise<void> {
    const nextOpponentId = Number(values.opponentId);

    await onSubmit({
      opponentId: nextOpponentId,
      reportSource: values.reportSource,
      ...(values.reportDate.trim() === ''
        ? {}
        : { reportDate: values.reportDate }),
    });

    reset({
      opponentId: '',
      reportSource: 'scouting',
      reportDate: '',
    });
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <span className="page-header__eyebrow">Crear informe</span>
          <h3>Inicia un nuevo borrador de scouting</h3>
        </div>
      </div>

      <form
        className="stack"
        onSubmit={(event) => {
          void handleSubmit(submitForm)(event);
        }}
      >
        <label className="field">
          <span className="field__label">Rival</span>
          <select
            {...register('opponentId', {
              required: 'El rival es obligatorio.',
            })}
          >
            <option value="">Selecciona un rival</option>
            {opponents.map((opponent) => (
              <option key={opponent.id} value={opponent.id}>
                {opponent.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Fecha del informe</span>
          <input {...register('reportDate')} type="date" />
        </label>

        <label className="field">
          <span className="field__label">Origen del informe</span>
          <select {...register('reportSource')}>
            <option value="video_analysis">Analisis de video</option>
            <option value="scouting">Scouting</option>
            <option value="references">Referencias</option>
          </select>
        </label>

        <p className="muted-text">
          Los nuevos informes comienzan como borrador. Publicar sigue siendo un
          paso explicito posterior.
        </p>

        {errorMessage !== null ? (
          <p className="feedback-message feedback-message--error">
            {errorMessage}
          </p>
        ) : null}

        <div className="button-row">
          <button
            type="submit"
            className="button"
            disabled={isSubmitting || opponents.length === 0}
          >
            {isSubmitting ? 'Creando...' : 'Crear informe'}
          </button>
        </div>
      </form>
    </section>
  );
}
