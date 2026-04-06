import type { ChangeEvent, JSX } from 'react';

import type { ListOpponentsQueryDto } from '../api/opponentsApi';

interface OpponentFiltersProps {
  filters: ListOpponentsQueryDto;
  onChange: (nextFilters: ListOpponentsQueryDto) => void;
  onReset: () => void;
}

export function OpponentFilters({
  filters,
  onChange,
  onReset,
}: OpponentFiltersProps): JSX.Element {
  function updateFilter<Key extends keyof ListOpponentsQueryDto>(
    key: Key,
    value: ListOpponentsQueryDto[Key],
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
          <span className="page-header__eyebrow">Search And Filters</span>
          <h3>Find the right opponent quickly</h3>
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
          <span className="field__label">Search by name</span>
          <input
            value={filters.search ?? ''}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder="Search opponent name"
          />
        </label>

        <label className="field">
          <span className="field__label">Category</span>
          <input
            value={filters.category ?? ''}
            onChange={(event) => updateFilter('category', event.target.value)}
            placeholder="League or competition"
          />
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

        <label className="field">
          <span className="field__label">Report status</span>
          <select
            value={filters.status ?? ''}
            onChange={(event) =>
              updateFilter(
                'status',
                event.target.value === ''
                  ? undefined
                  : (event.target.value as ListOpponentsQueryDto['status']),
              )
            }
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
      </div>
    </section>
  );
}
