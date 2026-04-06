import type {
  TacticalAnalysisBlockType,
  TacticalAnalysisPhaseType,
} from '../types/scouting-report-tactical-analysis.types.js';

export interface TacticalAnalysisItemResponseDto {
  phaseType: TacticalAnalysisPhaseType;
  blockType: TacticalAnalysisBlockType | null;
  narrative: string;
  keyPoints: string[];
}

export interface ScoutingReportTacticalAnalysisResponseDto {
  items: TacticalAnalysisItemResponseDto[];
}
