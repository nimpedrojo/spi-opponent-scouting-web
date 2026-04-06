import type { JSX } from 'react';

import { PageHeader } from '../../../shared/ui/PageHeader';
import { PlaceholderCard } from '../../../shared/ui/PlaceholderCard';

export function OpponentsPage(): JSX.Element {
  return (
    <section className="page">
      <PageHeader
        eyebrow="Opponent Directory"
        title="Opponents"
        description="This area is ready for searchable opponent records, category filters, and future links into scouting reports."
      />

      <div className="status-strip">
        <span className="status-pill">Feature shell ready</span>
        <span className="status-pill">API integration prepared</span>
      </div>

      <div className="placeholder-grid">
        <PlaceholderCard
          title="Planned capabilities"
          description="The first implementation can focus on explicit opponent records instead of generic data tables."
          items={[
            'Opponent list',
            'Create opponent flow',
            'Search and filters',
          ]}
        />
        <PlaceholderCard
          title="Integration notes"
          description="This feature is ready to consume backend endpoints through the shared API client when the opponent module exists."
        />
      </div>
    </section>
  );
}
