import type {
  TacticalAnalysisBlockType,
  TacticalAnalysisPhaseType,
} from '../types/scouting-report-tactical-analysis.types.js';

export interface ScoutingReportTacticalAnalysisParamsDto {
  id: number;
}

export interface UpsertTacticalAnalysisItemDto {
  phaseType: TacticalAnalysisPhaseType;
  blockType: TacticalAnalysisBlockType | null;
  narrative: string;
  keyPoints?: string[];
}

export interface ReplaceScoutingReportTacticalAnalysisBodyDto {
  items: UpsertTacticalAnalysisItemDto[];
}
