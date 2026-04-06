import type { ScoutingReportStatus } from '../../scouting-reports/types/scouting-report.types.js';
import type { PitchPlayerPosition } from '../../../shared/pitch/pitch-player-position.js';

export type TacticalAnalysisPhaseType =
  | 'attack'
  | 'defense'
  | 'attacking_transition'
  | 'defensive_transition'
  | 'set_piece';

export type TacticalAnalysisBlockType =
  | 'high_block'
  | 'mid_block'
  | 'low_block'
  | 'corner'
  | 'wide_free_kick'
  | 'central_free_kick'
  | 'throw_in'
  | 'other';

export interface ScoutingReportTacticalAnalysisReportRecord {
  id: number;
  status: ScoutingReportStatus;
}

export interface TacticalAnalysisItemRecord {
  phaseType: TacticalAnalysisPhaseType;
  blockType: TacticalAnalysisBlockType | null;
  narrative: string;
  keyPoints: string[];
  playerPositions: PitchPlayerPosition[];
}
