import type { JSX } from 'react';

import { PageHeader } from '../../../shared/ui/PageHeader';
import { PlaceholderCard } from '../../../shared/ui/PlaceholderCard';

export function ReportsPage(): JSX.Element {
  return (
    <section className="page">
      <PageHeader
        eyebrow="Scouting Reports"
        title="Reports"
        description="A clean starting point for draft, published, and archived report lists without drifting into spreadsheet-style navigation."
      />

      <div className="placeholder-grid">
        <PlaceholderCard
          title="Planned views"
          description="Future list states can stay explicit around report status, opponent, and version history."
          items={['Draft reports', 'Published reports', 'Archived reports']}
        />
        <PlaceholderCard
          title="UX direction"
          description="The structure is ready for status filters, creation actions, and report duplication flows."
        />
      </div>
    </section>
  );
}
