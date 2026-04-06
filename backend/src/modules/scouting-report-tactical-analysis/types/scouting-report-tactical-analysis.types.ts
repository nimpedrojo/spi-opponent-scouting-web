import type { ScoutingReportStatus } from '../../scouting-reports/types/scouting-report.types.js';

export type TacticalAnalysisPhaseType =
  | 'attack'
  | 'defense'
  | 'attacking_transition'
  | 'defensive_transition'
  | 'set_piece';

export type TacticalAnalysisBlockType =
  | 'high_block'
  | 'mid_block'
  | 'low_block';

export interface ScoutingReportTacticalAnalysisReportRecord {
  id: number;
  status: ScoutingReportStatus;
}

export interface TacticalAnalysisItemRecord {
  phaseType: TacticalAnalysisPhaseType;
  blockType: TacticalAnalysisBlockType | null;
  narrative: string;
  keyPoints: string[];
}
