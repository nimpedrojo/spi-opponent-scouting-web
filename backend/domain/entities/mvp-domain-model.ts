export type ScoutingReportStatus = 'draft' | 'published';

export type TacticalAnalysisPhase =
  | 'attack'
  | 'defense'
  | 'attacking_transition'
  | 'defensive_transition'
  | 'set_piece';

export type TacticalBlockType = 'high_block' | 'mid_block' | 'low_block';

export type SwotItemType = 'strength' | 'weakness' | 'opportunity' | 'threat';

export type SystemUsageRole = 'primary' | 'secondary' | 'situational';

export interface OpponentEntity {
  id: number;
  name: string;
  countryName: string | null;
  competitionName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScoutingReportEntity {
  id: number;
  opponentId: number;
  versionNumber: number;
  status: ScoutingReportStatus;
  reportDate: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SystemCatalogEntity {
  id: number;
  systemCode: string;
  displayName: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OpponentFormEntity {
  id: number;
  scoutingReportId: number;
  recentMatchesPlayed: number | null;
  wins: number | null;
  draws: number | null;
  losses: number | null;
  goalsFor: number | null;
  goalsAgainst: number | null;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OpponentSystemUsageEntity {
  id: number;
  scoutingReportId: number;
  systemCatalogId: number;
  usageRole: SystemUsageRole;
  displayOrder: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OpponentTacticalAnalysisEntity {
  id: number;
  scoutingReportId: number;
  phase: TacticalAnalysisPhase;
  blockType: TacticalBlockType | null;
  analysisText: string;
  createdAt: string;
  updatedAt: string;
}

export interface OpponentSwotItemEntity {
  id: number;
  scoutingReportId: number;
  itemType: SwotItemType;
  itemText: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}
