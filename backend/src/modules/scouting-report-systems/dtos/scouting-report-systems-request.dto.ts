export interface ScoutingReportSystemsParamsDto {
  id: number;
}

export interface ReplaceScoutingReportSystemsBodyDto {
  primarySystem: string;
  alternateSystems: string[];
}
