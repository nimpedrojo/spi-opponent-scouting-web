import assert from 'node:assert/strict';
import test from 'node:test';

import { buildApp } from '../../src/app.js';
import type { OpponentRepository } from '../../src/modules/opponents/repositories/opponent.repository.js';
import type { ScoutingReportRepository } from '../../src/modules/scouting-reports/repositories/scouting-report.repository.js';
import type {
  CreateOpponentInput,
  OpponentListFilters,
  OpponentListRecord,
  OpponentRecord,
  UpdateOpponentInput,
} from '../../src/modules/opponents/types/opponent.types.js';
import type {
  CreateScoutingReportInput,
  ListScoutingReportsFilters,
  ScoutingReportRecord,
  UpdateScoutingReportMetadataInput,
} from '../../src/modules/scouting-reports/types/scouting-report.types.js';

interface OpponentReportFixture {
  season: number | null;
  status: 'draft' | 'published';
}

interface OpponentFixture extends OpponentRecord {
  reports: OpponentReportFixture[];
}

class InMemoryOpponentRepository implements OpponentRepository {
  private opponents: OpponentFixture[];
  private nextId: number;

  constructor(opponents: OpponentFixture[] = []) {
    this.opponents = opponents;
    this.nextId =
      opponents.reduce(
        (currentMaxId, opponent) => Math.max(currentMaxId, opponent.id),
        0,
      ) + 1;
  }

  async create(input: CreateOpponentInput): Promise<OpponentRecord> {
    const now = new Date('2026-04-06T10:00:00.000Z');
    const opponent: OpponentFixture = {
      id: this.nextId++,
      name: input.name,
      countryName: input.countryName,
      competitionName: input.competitionName,
      createdAt: now,
      updatedAt: now,
      reports: [],
    };

    this.opponents.push(opponent);

    return omitReports(opponent);
  }

  async update(
    opponentId: number,
    input: UpdateOpponentInput,
  ): Promise<OpponentRecord | null> {
    const opponent = this.opponents.find(
      (candidate) => candidate.id === opponentId,
    );

    if (opponent === undefined) {
      return null;
    }

    opponent.name = input.name;
    opponent.countryName = input.countryName;
    opponent.competitionName = input.competitionName;
    opponent.updatedAt = new Date('2026-04-06T11:00:00.000Z');

    return omitReports(opponent);
  }

  async findById(opponentId: number): Promise<OpponentRecord | null> {
    const opponent = this.opponents.find(
      (candidate) => candidate.id === opponentId,
    );

    return opponent === undefined ? null : omitReports(opponent);
  }

  async list(filters: OpponentListFilters): Promise<OpponentListRecord[]> {
    return this.opponents
      .filter((opponent) => {
        if (
          filters.search !== null &&
          !opponent.name.toLowerCase().includes(filters.search.toLowerCase())
        ) {
          return false;
        }

        if (
          filters.category !== null &&
          opponent.competitionName !== filters.category
        ) {
          return false;
        }

        if (
          filters.status !== null &&
          !opponent.reports.some((report) => report.status === filters.status)
        ) {
          return false;
        }

        if (
          filters.season !== null &&
          !opponent.reports.some((report) => report.season === filters.season)
        ) {
          return false;
        }

        return true;
      })
      .map(omitReports);
  }
}

class NoopScoutingReportRepository implements ScoutingReportRepository {
  async create(
    _input: CreateScoutingReportInput,
  ): Promise<ScoutingReportRecord> {
    throw new Error('Not implemented for opponent route tests');
  }

  async findById(_reportId: number): Promise<ScoutingReportRecord | null> {
    return null;
  }

  async list(
    _filters: ListScoutingReportsFilters,
  ): Promise<ScoutingReportRecord[]> {
    return [];
  }

  async updateMetadata(
    _reportId: number,
    _input: UpdateScoutingReportMetadataInput,
  ): Promise<ScoutingReportRecord | null> {
    return null;
  }

  async publish(
    _reportId: number,
    _publishedAt: Date,
  ): Promise<ScoutingReportRecord | null> {
    return null;
  }

  async getNextVersionNumber(_opponentId: number): Promise<number> {
    return 1;
  }

  async opponentExists(_opponentId: number): Promise<boolean> {
    return false;
  }
}

test('create opponent returns 201 and explicit response dto', async (t) => {
  const app = buildApp({
    opponentRepository: new InMemoryOpponentRepository(),
    scoutingReportRepository: new NoopScoutingReportRepository(),
  });

  t.after(() => app.close());

  const response = await app.inject({
    method: 'POST',
    url: '/opponents',
    payload: {
      name: ' Real Sociedad ',
      countryName: ' Spain ',
      competitionName: ' LaLiga ',
    },
  });

  assert.equal(response.statusCode, 201);
  assert.deepEqual(response.json(), {
    id: 1,
    name: 'Real Sociedad',
    countryName: 'Spain',
    competitionName: 'LaLiga',
    createdAt: '2026-04-06T10:00:00.000Z',
    updatedAt: '2026-04-06T10:00:00.000Z',
  });
});

test('create opponent returns 400 for invalid body', async (t) => {
  const app = buildApp({
    opponentRepository: new InMemoryOpponentRepository(),
    scoutingReportRepository: new NoopScoutingReportRepository(),
  });

  t.after(() => app.close());

  const response = await app.inject({
    method: 'POST',
    url: '/opponents',
    payload: {
      name: '   ',
    },
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.json().message, 'Request validation failed');
});

test('list opponents applies category, season, status, and search filters', async (t) => {
  const app = buildApp({
    opponentRepository: new InMemoryOpponentRepository([
      {
        id: 1,
        name: 'Atlhetic Bilbao',
        countryName: 'Spain',
        competitionName: 'LaLiga',
        createdAt: new Date('2026-04-05T10:00:00.000Z'),
        updatedAt: new Date('2026-04-05T10:00:00.000Z'),
        reports: [{ season: 2025, status: 'published' }],
      },
      {
        id: 2,
        name: 'Real Betis',
        countryName: 'Spain',
        competitionName: 'LaLiga',
        createdAt: new Date('2026-04-05T10:00:00.000Z'),
        updatedAt: new Date('2026-04-05T10:00:00.000Z'),
        reports: [{ season: 2025, status: 'draft' }],
      },
      {
        id: 3,
        name: 'Ajax',
        countryName: 'Netherlands',
        competitionName: 'Eredivisie',
        createdAt: new Date('2026-04-05T10:00:00.000Z'),
        updatedAt: new Date('2026-04-05T10:00:00.000Z'),
        reports: [{ season: 2025, status: 'published' }],
      },
    ]),
    scoutingReportRepository: new NoopScoutingReportRepository(),
  });

  t.after(() => app.close());

  const response = await app.inject({
    method: 'GET',
    url: '/opponents?category=LaLiga&season=2025&status=published&search=Bilbao',
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), {
    items: [
      {
        id: 1,
        name: 'Atlhetic Bilbao',
        countryName: 'Spain',
        competitionName: 'LaLiga',
        createdAt: '2026-04-05T10:00:00.000Z',
        updatedAt: '2026-04-05T10:00:00.000Z',
      },
    ],
  });
});

function omitReports(opponent: OpponentFixture): OpponentRecord {
  return {
    id: opponent.id,
    name: opponent.name,
    countryName: opponent.countryName,
    competitionName: opponent.competitionName,
    createdAt: opponent.createdAt,
    updatedAt: opponent.updatedAt,
  };
}
