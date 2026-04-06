export type ScoutingReportStatus = 'draft' | 'published';

export interface OpponentRecord {
  id: number;
  name: string;
  countryName: string | null;
  competitionName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OpponentReportFilterContext {
  season: number | null;
  status: ScoutingReportStatus | null;
}

export interface CreateOpponentInput {
  name: string;
  countryName: string | null;
  competitionName: string | null;
}

export interface UpdateOpponentInput {
  name: string;
  countryName: string | null;
  competitionName: string | null;
}

export interface OpponentListFilters {
  category: string | null;
  season: number | null;
  status: ScoutingReportStatus | null;
  search: string | null;
}

export interface OpponentListRecord extends OpponentRecord {}
