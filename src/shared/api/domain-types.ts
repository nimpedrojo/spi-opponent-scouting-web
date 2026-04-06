export type ScoutingReportStatus = 'draft' | 'published';

export function getScoutingReportStatusLabel(
  status: ScoutingReportStatus,
): string {
  switch (status) {
    case 'draft':
      return 'Borrador';
    case 'published':
      return 'Publicado';
  }
}
