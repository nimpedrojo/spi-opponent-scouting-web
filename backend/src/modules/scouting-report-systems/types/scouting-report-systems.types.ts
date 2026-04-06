import type { ScoutingReportStatus } from '../../scouting-reports/types/scouting-report.types.js';

export interface ScoutingReportSystemsReportRecord {
  id: number;
  status: ScoutingReportStatus;
}

export interface SystemCatalogRecord {
  id: number;
  systemCode: string;
  displayName: string;
  displayOrder: number;
  isActive: boolean;
}

export interface ScoutingReportSystemSelectionRecord {
  systemCode: string;
  displayName: string;
  usageRole: 'primary' | 'secondary';
  displayOrder: number;
}

export interface ReplaceScoutingReportSystemsInput {
  primarySystemCode: string;
  alternateSystemCodes: string[];
}
