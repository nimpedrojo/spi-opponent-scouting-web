function removeUndefinedValues<TValue extends object>(value: TValue): TValue {
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      ([, entryValue]) => entryValue !== undefined,
    ),
  ) as TValue;
}

export const queryKeys = {
  opponents: {
    all: ['opponents'] as const,
    lists: () => [...queryKeys.opponents.all, 'list'] as const,
    list: <TFilters extends object>(filters: TFilters) =>
      [...queryKeys.opponents.lists(), removeUndefinedValues(filters)] as const,
    detail: (opponentId: number) =>
      [...queryKeys.opponents.all, 'detail', opponentId] as const,
  },
  scoutingReports: {
    all: ['scouting-reports'] as const,
    lists: () => [...queryKeys.scoutingReports.all, 'list'] as const,
    list: <TFilters extends object>(filters: TFilters) =>
      [
        ...queryKeys.scoutingReports.lists(),
        removeUndefinedValues(filters),
      ] as const,
    detail: (reportId: number) =>
      [...queryKeys.scoutingReports.all, 'detail', reportId] as const,
    systems: (reportId: number) =>
      [...queryKeys.scoutingReports.detail(reportId), 'systems'] as const,
    form: (reportId: number) =>
      [...queryKeys.scoutingReports.detail(reportId), 'form'] as const,
    tacticalAnalysis: (reportId: number) =>
      [
        ...queryKeys.scoutingReports.detail(reportId),
        'tactical-analysis',
      ] as const,
    swot: (reportId: number) =>
      [...queryKeys.scoutingReports.detail(reportId), 'swot'] as const,
  },
};
