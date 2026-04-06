import type { JSX } from 'react';

import { PageHeader } from '../../../shared/ui/PageHeader';
import { PlaceholderCard } from '../../../shared/ui/PlaceholderCard';

export function ReportPreviewPage(): JSX.Element {
  return (
    <section className="page">
      <PageHeader
        eyebrow="Coach Review"
        title="Report Preview"
        description="This route is ready for read-focused report review, export preparation, and published presentation modes."
      />

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
