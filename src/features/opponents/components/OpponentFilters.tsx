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
          <span className="page-header__eyebrow">Busqueda y filtros</span>
          <h3>Encuentra rapido el rival adecuado</h3>
        </div>
        <button
          type="button"
          className="button button--ghost"
          onClick={onReset}
        >
          Limpiar filtros
        </button>
      </div>

      <div className="filter-grid">
        <label className="field">
          <span className="field__label">Buscar por nombre</span>
          <input
            value={filters.search ?? ''}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder="Buscar nombre del rival"
          />
        </label>

        <label className="field">
          <span className="field__label">Categoria</span>
          <input
            value={filters.category ?? ''}
            onChange={(event) => updateFilter('category', event.target.value)}
            placeholder="Liga o competicion"
          />
        </label>

        <label className="field">
          <span className="field__label">Temporada</span>
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
          <span className="field__label">Estado del informe</span>
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
            <option value="">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
          </select>
        </label>
      </div>
    </section>
  );
}
