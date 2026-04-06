export interface OpponentResponseDto {
  id: number;
  name: string;
  countryName: string | null;
  competitionName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OpponentListResponseDto {
  items: OpponentResponseDto[];
}
