import { PublishedReportModificationError } from '../http/errors.js';

export function ensureReportIsEditable(
  reportId: number,
  reportStatus: 'draft' | 'published',
): void {
  if (reportStatus === 'published') {
    throw new PublishedReportModificationError(reportId);
  }
}
