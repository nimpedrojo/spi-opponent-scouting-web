import type { PitchPlayerPosition } from '../../../shared/pitch/pitch-player-position.js';

export interface ScoutingReportSystemsParamsDto {
  id: number;
}

export interface ScoutingReportSystemSelectionDto {
  systemCode: string;
  playerPositions: PitchPlayerPosition[];
}

export interface ReplaceScoutingReportSystemsBodyDto {
  primarySystem: ScoutingReportSystemSelectionDto;
  alternateSystems: ScoutingReportSystemSelectionDto[];
}
