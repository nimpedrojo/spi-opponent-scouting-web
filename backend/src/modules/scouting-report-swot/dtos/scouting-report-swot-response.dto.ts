import type { SwotItemType } from '../types/scouting-report-swot.types.js';

export interface SwotItemResponseDto {
  swotType: SwotItemType;
  description: string;
  priority: number | null;
}

export interface ScoutingReportSwotResponseDto {
  items: SwotItemResponseDto[];
}
