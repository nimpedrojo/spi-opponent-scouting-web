import type { SwotItemType } from '../types/scouting-report-swot.types.js';

export interface ScoutingReportSwotParamsDto {
  id: number;
}

export interface UpsertSwotItemDto {
  swotType: SwotItemType;
  description: string;
  priority?: number | null;
}

export interface ReplaceScoutingReportSwotBodyDto {
  items: UpsertSwotItemDto[];
}
