export type ScoutingReportStatus = 'draft' | 'published';
export type ScoutingReportSource = 'video_analysis' | 'scouting' | 'references';

export interface PitchPlayerPositionDto {
  playerNumber: number;
  x: number;
  y: number;
}

export function getScoutingReportStatusLabel(
  status: ScoutingReportStatus,
): string {
  switch (status) {
    case 'draft':
      return 'Borrador';
    case 'published':
      return 'Publicado';
  }
}

export function getScoutingReportSourceLabel(
  source: ScoutingReportSource,
): string {
  switch (source) {
    case 'video_analysis':
      return 'Analisis de video';
    case 'scouting':
      return 'Scouting';
    case 'references':
      return 'Referencias';
  }
}
