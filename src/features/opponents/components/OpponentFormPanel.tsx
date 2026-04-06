import { useEffect, type JSX } from 'react';

import {
  type CreateOpponentBodyDto,
  type OpponentResponseDto,
} from '../api/opponentsApi';
import { useAppForm } from '../../../shared/forms/useAppForm';

interface OpponentFormValues {
  name: string;
  countryName: string;
  competitionName: string;
}

interface OpponentFormPanelProps {
  selectedOpponent: OpponentResponseDto | null;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (values: CreateOpponentBodyDto) => Promise<void>;
  onCancelEdit: () => void;
}

const emptyFormValues: OpponentFormValues = {
  name: '',
  countryName: '',
  competitionName: '',
};

export function OpponentFormPanel({
  selectedOpponent,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancelEdit,
}: OpponentFormPanelProps): JSX.Element {
  const isEditMode = selectedOpponent !== null;
  const { handleSubmit, register, reset } = useAppForm<OpponentFormValues>({
    defaultValues: emptyFormValues,
  });

  useEffect(() => {
    if (selectedOpponent === null) {
      reset(emptyFormValues);
      return;
    }

    reset({
      name: selectedOpponent.name,
      countryName: selectedOpponent.countryName ?? '',
      competitionName: selectedOpponent.competitionName ?? '',
    });
  }, [reset, selectedOpponent]);

  async function submitForm(values: OpponentFormValues): Promise<void> {
    const normalizedCountryName = normalizeOptionalText(values.countryName);
    const normalizedCompetitionName = normalizeOptionalText(
      values.competitionName,
    );

    await onSubmit({
      name: values.name.trim(),
      ...(normalizedCountryName === undefined
        ? {}
        : { countryName: normalizedCountryName }),
      ...(normalizedCompetitionName === undefined
        ? {}
        : { competitionName: normalizedCompetitionName }),
    });

    if (!isEditMode) {
      reset(emptyFormValues);
    }
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <span className="page-header__eyebrow">
            {isEditMode ? 'Edit Opponent' : 'Create Opponent'}
          </span>
          <h3>
            {isEditMode ? selectedOpponent.name : 'Add a scouting target'}
          </h3>
        </div>
        {isEditMode ? (
          <button
            type="button"
            className="button button--ghost"
            onClick={onCancelEdit}
          >
            Cancel edit
          </button>
        ) : null}
      </div>

      <form
        className="stack"
        onSubmit={(event) => {
          void handleSubmit(submitForm)(event);
        }}
      >
        <label className="field">
          <span className="field__label">Opponent name</span>
          <input
            {...register('name', {
              required: 'Opponent name is required.',
            })}
            placeholder="Real Madrid"
          />
        </label>

        <label className="field">
          <span className="field__label">Country</span>
          <input {...register('countryName')} placeholder="Spain" />
        </label>

        <label className="field">
          <span className="field__label">Competition</span>
          <input {...register('competitionName')} placeholder="LaLiga" />
        </label>

        {errorMessage !== null ? (
          <p className="feedback-message feedback-message--error">
            {errorMessage}
          </p>
        ) : null}

        <div className="button-row">
          <button type="submit" className="button" disabled={isSubmitting}>
            {isSubmitting
              ? 'Saving...'
              : isEditMode
                ? 'Save changes'
                : 'Create opponent'}
          </button>
        </div>
      </form>
    </section>
  );
}

function normalizeOptionalText(value: string): string | undefined {
  const normalizedValue = value.trim();

  return normalizedValue === '' ? undefined : normalizedValue;
}
