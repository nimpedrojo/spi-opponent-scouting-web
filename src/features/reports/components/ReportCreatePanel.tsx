import type { JSX } from 'react';

import type { OpponentResponseDto } from '../../opponents/api/opponentsApi';
import type { CreateScoutingReportBodyDto } from '../api/reportsApi';
import { useAppForm } from '../../../shared/forms/useAppForm';

interface ReportCreateFormValues {
  opponentId: string;
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
      reportDate: '',
    },
  });

  async function submitForm(values: ReportCreateFormValues): Promise<void> {
    const nextOpponentId = Number(values.opponentId);

    await onSubmit({
      opponentId: nextOpponentId,
      ...(values.reportDate.trim() === ''
        ? {}
        : { reportDate: values.reportDate }),
    });

    reset({
      opponentId: '',
      reportDate: '',
    });
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <span className="page-header__eyebrow">Create Report</span>
          <h3>Start a new scouting draft</h3>
        </div>
      </div>

      <form
        className="stack"
        onSubmit={(event) => {
          void handleSubmit(submitForm)(event);
        }}
      >
        <label className="field">
          <span className="field__label">Opponent</span>
          <select
            {...register('opponentId', {
              required: 'Opponent is required.',
            })}
          >
            <option value="">Select an opponent</option>
            {opponents.map((opponent) => (
              <option key={opponent.id} value={opponent.id}>
                {opponent.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Report date</span>
          <input {...register('reportDate')} type="date" />
        </label>

        <p className="muted-text">
          New reports start as draft. Publishing stays an explicit next step.
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
            {isSubmitting ? 'Creating...' : 'Create report'}
          </button>
        </div>
      </form>
    </section>
  );
}
