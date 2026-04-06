import type {
  TacticalAnalysisBlockType,
  TacticalAnalysisPhaseType,
} from '../types/scouting-report-tactical-analysis.types.js';
import type { PitchPlayerPosition } from '../../../shared/pitch/pitch-player-position.js';

export interface ScoutingReportTacticalAnalysisParamsDto {
  id: number;
}

export interface UpsertTacticalAnalysisItemDto {
  phaseType: TacticalAnalysisPhaseType;
  blockType: TacticalAnalysisBlockType | null;
  narrative: string;
  keyPoints?: string[];
  playerPositions?: PitchPlayerPosition[];
}

export interface ReplaceScoutingReportTacticalAnalysisBodyDto {
  items: UpsertTacticalAnalysisItemDto[];
}
