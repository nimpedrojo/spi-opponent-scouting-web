import type { PitchPlayerPosition } from '../../../shared/pitch/pitch-player-position.js';

export interface ScoutingReportSystemSelectionResponseDto {
  systemCode: string;
  playerPositions: PitchPlayerPosition[];
}

export interface ScoutingReportSystemsResponseDto {
  primarySystem: ScoutingReportSystemSelectionResponseDto | null;
  alternateSystems: ScoutingReportSystemSelectionResponseDto[];
}
