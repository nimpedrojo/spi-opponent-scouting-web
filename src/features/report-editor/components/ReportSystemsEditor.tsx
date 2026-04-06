import { useEffect, type JSX } from 'react';

import { ApiError } from '../../../shared/api/api-client';
import { useAppForm } from '../../../shared/forms/useAppForm';
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
  const { handleSubmit, register, reset } = useAppForm<ReportSystemsValues>({
    defaultValues: emptySystemsValues,
  });

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
          <h3>No report selected</h3>
          <p>Open a report first to manage tactical systems.</p>
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
          <span className="page-header__eyebrow">Systems</span>
          <h3>Primary and alternate systems</h3>
        </div>
        <div className="status-strip">
          <span
            className={
              isReadOnly ? 'status-pill status-pill--published' : 'status-pill'
            }
          >
            {isReadOnly ? 'Read-only' : 'Editable draft'}
          </span>
        </div>
      </div>

      {systemsQuery.isLoading ? (
        <p className="muted-text">Loading systems section...</p>
      ) : null}

      <form
        className="stack"
        onSubmit={(event) => {
          void handleSubmit(submitForm)(event);
        }}
      >
        <label className="field">
          <span className="field__label">Primary system</span>
          <input
            {...register('primarySystem', {
              required: 'Primary system is required.',
            })}
            placeholder="1-4-3-3"
            disabled={isReadOnly}
          />
        </label>

        <label className="field">
          <span className="field__label">Alternate systems</span>
          <textarea
            {...register('alternateSystems')}
            rows={5}
            placeholder={'1-4-4-2\n1-3-5-2'}
            disabled={isReadOnly}
          />
        </label>

        <p className="muted-text">
          Add one alternate system per line. The backend validates each system
          code against the catalog.
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
            type="submit"
            className="button"
            disabled={isReadOnly || replaceSystemsMutation.isPending}
          >
            {replaceSystemsMutation.isPending ? 'Saving...' : 'Save systems'}
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
