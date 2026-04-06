import assert from 'node:assert/strict';
import test from 'node:test';

import { buildApp } from '../../src/app.js';
import type { OpponentRepository } from '../../src/modules/opponents/repositories/opponent.repository.js';
import type {
  CreateOpponentInput,
  OpponentListFilters,
  OpponentListRecord,
  OpponentRecord,
  UpdateOpponentInput,
} from '../../src/modules/opponents/types/opponent.types.js';
import type { ScoutingReportRepository } from '../../src/modules/scouting-reports/repositories/scouting-report.repository.js';
import type {
  CreateScoutingReportInput,
  ListScoutingReportsFilters,
  ScoutingReportRecord,
  UpdateScoutingReportMetadataInput,
} from '../../src/modules/scouting-reports/types/scouting-report.types.js';

class InMemoryOpponentRepository implements OpponentRepository {
  constructor(private readonly opponents: OpponentRecord[]) {}

  async create(_input: CreateOpponentInput): Promise<OpponentRecord> {
    throw new Error('Not implemented for this test');
  }

  async update(
    _opponentId: number,
    _input: UpdateOpponentInput,
  ): Promise<OpponentRecord | null> {
    throw new Error('Not implemented for this test');
  }

  async findById(opponentId: number): Promise<OpponentRecord | null> {
    return (
      this.opponents.find((opponent) => opponent.id === opponentId) ?? null
    );
  }

  async list(_filters: OpponentListFilters): Promise<OpponentListRecord[]> {
    return this.opponents;
  }
}

class InMemoryScoutingReportRepository implements ScoutingReportRepository {
  private reports: ScoutingReportRecord[];
  private nextId: number;
  private readonly opponentIds: Set<number>;

  constructor(
    reports: ScoutingReportRecord[] = [],
    opponentIds: number[] = [],
  ) {
    this.reports = [...reports];
    this.nextId =
      reports.reduce(
        (currentMaxId, report) => Math.max(currentMaxId, report.id),
        0,
      ) + 1;
    this.opponentIds = new Set(opponentIds);
  }

  async create(
    input: CreateScoutingReportInput,
  ): Promise<ScoutingReportRecord> {
    const now = new Date('2026-04-06T10:00:00.000Z');
    const report: ScoutingReportRecord = {
      id: this.nextId++,
      opponentId: input.opponentId,
      versionNumber: input.versionNumber,
      status: input.status,
      reportDate: input.reportDate,
      publishedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    this.reports.push(report);

    return report;
  }

  async findById(reportId: number): Promise<ScoutingReportRecord | null> {
    return this.reports.find((report) => report.id === reportId) ?? null;
  }

  async list(
    filters: ListScoutingReportsFilters,
  ): Promise<ScoutingReportRecord[]> {
    return this.reports.filter((report) => {
      if (
        filters.opponentId !== null &&
        report.opponentId !== filters.opponentId
      ) {
        return false;
      }

      if (filters.status !== null && report.status !== filters.status) {
        return false;
      }

      if (
        filters.season !== null &&
        report.reportDate?.getUTCFullYear() !== filters.season
      ) {
        return false;
      }

      return true;
    });
  }

  async updateMetadata(
    reportId: number,
    input: UpdateScoutingReportMetadataInput,
  ): Promise<ScoutingReportRecord | null> {
    const report = this.reports.find((candidate) => candidate.id === reportId);

    if (report === undefined) {
      return null;
    }

    report.opponentId = input.opponentId;
    report.reportDate = input.reportDate;
    report.updatedAt = new Date('2026-04-06T11:00:00.000Z');

    return report;
  }

  async publish(
    reportId: number,
    publishedAt: Date,
  ): Promise<ScoutingReportRecord | null> {
    const report = this.reports.find((candidate) => candidate.id === reportId);

    if (report === undefined) {
      return null;
    }

    report.status = 'published';
    report.publishedAt = publishedAt;
    report.updatedAt = publishedAt;

    return report;
  }

  async getNextVersionNumber(opponentId: number): Promise<number> {
    const matchingReports = this.reports.filter(
      (report) => report.opponentId === opponentId,
    );
    const maxVersion = matchingReports.reduce(
      (currentMax, report) => Math.max(currentMax, report.versionNumber),
      0,
    );

    return maxVersion + 1;
  }

  async opponentExists(opponentId: number): Promise<boolean> {
    return this.opponentIds.has(opponentId);
  }
}

test('create scouting report creates a draft by default', async (t) => {
  const app = buildApp({
    opponentRepository: new InMemoryOpponentRepository([]),
    scoutingReportRepository: new InMemoryScoutingReportRepository([], [7]),
  });

  t.after(() => app.close());

  const response = await app.inject({
    method: 'POST',
    url: '/scouting-reports',
    payload: {
      opponentId: 7,
      reportDate: '2026-04-01',
    },
  });

  assert.equal(response.statusCode, 201);
  assert.deepEqual(response.json(), {
    id: 1,
    opponentId: 7,
    versionNumber: 1,
    status: 'draft',
    reportDate: '2026-04-01',
    publishedAt: null,
    createdAt: '2026-04-06T10:00:00.000Z',
    updatedAt: '2026-04-06T10:00:00.000Z',
  });
});

test('duplicate report creates a new draft version', async (t) => {
  const app = buildApp({
    opponentRepository: new InMemoryOpponentRepository([]),
    scoutingReportRepository: new InMemoryScoutingReportRepository(
      [
        {
          id: 5,
          opponentId: 3,
          versionNumber: 2,
          status: 'published',
          reportDate: new Date('2026-03-15T00:00:00.000Z'),
          publishedAt: new Date('2026-03-20T08:00:00.000Z'),
          createdAt: new Date('2026-03-15T09:00:00.000Z'),
          updatedAt: new Date('2026-03-20T08:00:00.000Z'),
        },
      ],
      [3],
    ),
  });

  t.after(() => app.close());

  const response = await app.inject({
    method: 'POST',
    url: '/scouting-reports/5/duplicate',
  });

  assert.equal(response.statusCode, 201);
  assert.deepEqual(response.json(), {
    id: 6,
    opponentId: 3,
    versionNumber: 3,
    status: 'draft',
    reportDate: '2026-03-15',
    publishedAt: null,
    createdAt: '2026-04-06T10:00:00.000Z',
    updatedAt: '2026-04-06T10:00:00.000Z',
  });
});

test('publish report is an explicit action that changes status', async (t) => {
  const app = buildApp({
    opponentRepository: new InMemoryOpponentRepository([]),
    scoutingReportRepository: new InMemoryScoutingReportRepository(
      [
        {
          id: 9,
          opponentId: 4,
          versionNumber: 1,
          status: 'draft',
          reportDate: new Date('2026-04-02T00:00:00.000Z'),
          publishedAt: null,
          createdAt: new Date('2026-04-02T09:00:00.000Z'),
          updatedAt: new Date('2026-04-02T09:00:00.000Z'),
        },
      ],
      [4],
    ),
  });

  t.after(() => app.close());

  const response = await app.inject({
    method: 'POST',
    url: '/scouting-reports/9/publish',
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().status, 'published');
  assert.ok(typeof response.json().publishedAt === 'string');
});

test('published reports cannot be edited', async (t) => {
  const app = buildApp({
    opponentRepository: new InMemoryOpponentRepository([]),
    scoutingReportRepository: new InMemoryScoutingReportRepository(
      [
        {
          id: 12,
          opponentId: 2,
          versionNumber: 1,
          status: 'published',
          reportDate: new Date('2026-04-02T00:00:00.000Z'),
          publishedAt: new Date('2026-04-05T10:00:00.000Z'),
          createdAt: new Date('2026-04-02T09:00:00.000Z'),
          updatedAt: new Date('2026-04-05T10:00:00.000Z'),
        },
      ],
      [2, 8],
    ),
  });

  t.after(() => app.close());

  const response = await app.inject({
    method: 'PATCH',
    url: '/scouting-reports/12',
    payload: {
      opponentId: 8,
    },
  });

  assert.equal(response.statusCode, 409);
  assert.equal(
    response.json().message,
    'ScoutingReport 12 is published and cannot be modified',
  );
});
