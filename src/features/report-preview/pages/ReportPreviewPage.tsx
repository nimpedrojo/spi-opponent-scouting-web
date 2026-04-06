import type { JSX } from 'react';
import { useSearchParams } from 'react-router-dom';

import { PageHeader } from '../../../shared/ui/PageHeader';
import { PlaceholderCard } from '../../../shared/ui/PlaceholderCard';

export function ReportPreviewPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('reportId');
  const opponentId = searchParams.get('opponentId');

  return (
    <section className="page">
      <PageHeader
        eyebrow="Coach Review"
        title="Report Preview"
        description="This route is ready for read-focused report review, export preparation, and published presentation modes."
      />

      {reportId !== null ? (
        <div className="status-strip">
          <span className="status-pill status-pill--published">
            Published report #{reportId}
          </span>
          {opponentId !== null ? (
            <span className="status-pill">Opponent #{opponentId}</span>
          ) : null}
        </div>
      ) : null}

      <div className="placeholder-grid">
        <PlaceholderCard
          title="Preview goals"
          description="Keep the future preview optimized for scanning, review, and decision support rather than editing."
          items={[
            'Section summaries',
            'Status visibility',
            'Export-oriented presentation',
          ]}
        />
        <PlaceholderCard
          title="Future backend usage"
          description="This page can fetch point-in-time report snapshots through the shared API client once report endpoints are available."
        />
      </div>
    </section>
  );
}
