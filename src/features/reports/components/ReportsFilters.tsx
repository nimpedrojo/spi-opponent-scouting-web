import type { ChangeEvent, JSX } from 'react';

import type { OpponentResponseDto } from '../../opponents/api/opponentsApi';
import type { ListScoutingReportsQueryDto } from '../api/reportsApi';

interface ReportsFiltersProps {
  filters: ListScoutingReportsQueryDto;
  opponents: OpponentResponseDto[];
  onChange: (nextFilters: ListScoutingReportsQueryDto) => void;
  onReset: () => void;
}

export function ReportsFilters({
  filters,
  opponents,
  onChange,
  onReset,
}: ReportsFiltersProps): JSX.Element {
  function updateFilter<Key extends keyof ListScoutingReportsQueryDto>(
    key: Key,
    value: ListScoutingReportsQueryDto[Key],
  ): void {
    onChange({
      ...filters,
      [key]: value,
    });
  }

  function handleSeasonChange(event: ChangeEvent<HTMLInputElement>): void {
    const nextValue = event.target.value.trim();

    updateFilter('season', nextValue === '' ? undefined : Number(nextValue));
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <span className="page-header__eyebrow">Report Filters</span>
          <h3>Track draft and published reports clearly</h3>
        </div>
        <button
          type="button"
          className="button button--ghost"
          onClick={onReset}
        >
          Reset filters
        </button>
      </div>

      <div className="filter-grid">
        <label className="field">
          <span className="field__label">Opponent</span>
          <select
            value={filters.opponentId ?? ''}
            onChange={(event) =>
              updateFilter(
                'opponentId',
                event.target.value === ''
                  ? undefined
                  : Number(event.target.value),
              )
            }
          >
            <option value="">All opponents</option>
            {opponents.map((opponent) => (
              <option key={opponent.id} value={opponent.id}>
                {opponent.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Status</span>
          <select
            value={filters.status ?? ''}
            onChange={(event) =>
              updateFilter(
                'status',
                event.target.value === ''
                  ? undefined
                  : (event.target
                      .value as ListScoutingReportsQueryDto['status']),
              )
            }
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>

        <label className="field">
          <span className="field__label">Season</span>
          <input
            type="number"
            min="2000"
            max="2100"
            value={filters.season ?? ''}
            onChange={handleSeasonChange}
            placeholder="2025"
          />
        </label>
      </div>
    </section>
  );
}
