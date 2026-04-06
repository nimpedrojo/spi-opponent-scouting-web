import type { JSX } from 'react';
import { useSearchParams } from 'react-router-dom';

import { PageHeader } from '../../../shared/ui/PageHeader';
import { PlaceholderCard } from '../../../shared/ui/PlaceholderCard';
import { useAppForm } from '../../../shared/forms/useAppForm';

interface ReportEditorPlaceholderValues {
  opponentName: string;
}

export function ReportEditorPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const { register } = useAppForm<ReportEditorPlaceholderValues>({
    defaultValues: {
      opponentName: '',
    },
  });
  const reportId = searchParams.get('reportId');
  const opponentId = searchParams.get('opponentId');

  return (
    <section className="page">
      <PageHeader
        eyebrow="Report Workflow"
        title="Report Editor"
        description="This route is prepared for section-based editing, draft saves, and explicit report status handling."
      />

      {reportId !== null ? (
        <div className="status-strip">
          <span className="status-pill">Draft report #{reportId}</span>
          {opponentId !== null ? (
            <span className="status-pill">Opponent #{opponentId}</span>
          ) : null}
        </div>
      ) : null}

      <div className="placeholder-grid">
        <PlaceholderCard
          title="Form foundation"
          description="React Hook Form is already wired so future report sections can be added without changing the app shell."
        >
          <label>
            <span className="page-header__eyebrow">Sample field</span>
            <input
              {...register('opponentName')}
              placeholder="Opponent name"
              style={{
                width: '100%',
                marginTop: '0.5rem',
                padding: '0.75rem 0.9rem',
                borderRadius: '12px',
                border: '1px solid rgba(16, 35, 26, 0.14)',
                background: '#fff',
              }}
            />
          </label>
        </PlaceholderCard>
        <PlaceholderCard
          title="Planned sections"
          description="Use this page for systems, tactical analysis, strategy recommendations, and SWOT editing in clear modules."
        />
      </div>
    </section>
  );
}
