import type { ScoutingReportStatus } from '../../scouting-reports/types/scouting-report.types.js';
import type { PitchPlayerPosition } from '../../../shared/pitch/pitch-player-position.js';

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
  playerPositions: PitchPlayerPosition[];
}

export interface ReplaceScoutingReportSystemsInput {
  primarySystem: ReplaceScoutingReportSystemSelectionInput;
  alternateSystems: ReplaceScoutingReportSystemSelectionInput[];
}

export interface ReplaceScoutingReportSystemSelectionInput {
  systemCode: string;
  playerPositions: PitchPlayerPosition[];
}
