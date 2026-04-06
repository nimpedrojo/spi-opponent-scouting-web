import type { ScoutingReportStatus } from '../../scouting-reports/types/scouting-report.types.js';

export type SwotItemType = 'strength' | 'weakness' | 'opportunity' | 'threat';

export interface ScoutingReportSwotReportRecord {
  id: number;
  status: ScoutingReportStatus;
}

export interface SwotItemRecord {
  swotType: SwotItemType;
  description: string;
  priority: number | null;
}
