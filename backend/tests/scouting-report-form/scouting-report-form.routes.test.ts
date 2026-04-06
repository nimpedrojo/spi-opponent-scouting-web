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
import type { ScoutingReportFormRepository } from '../../src/modules/scouting-report-form/repositories/scouting-report-form.repository.js';
import type { ScoutingReportTacticalAnalysisRepository } from '../../src/modules/scouting-report-tactical-analysis/repositories/scouting-report-tactical-analysis.repository.js';
import type { ScoutingReportSwotRepository } from '../../src/modules/scouting-report-swot/repositories/scouting-report-swot.repository.js';
import type {
  OpponentFormRecord,
  ScoutingReportFormReportRecord,
} from '../../src/modules/scouting-report-form/types/scouting-report-form.types.js';
import type { ScoutingReportSystemsRepository } from '../../src/modules/scouting-report-systems/repositories/scouting-report-systems.repository.js';
import type {
  ReplaceScoutingReportSystemsInput,
  ScoutingReportSystemSelectionRecord,
  ScoutingReportSystemsReportRecord,
  SystemCatalogRecord,
} from '../../src/modules/scouting-report-systems/types/scouting-report-systems.types.js';
import type { ScoutingReportRepository } from '../../src/modules/scouting-reports/repositories/scouting-report.repository.js';
import type {
  CreateScoutingReportInput,
  ListScoutingReportsFilters,
  ScoutingReportRecord,
  UpdateScoutingReportMetadataInput,
} from '../../src/modules/scouting-reports/types/scouting-report.types.js';
import type {
  ScoutingReportTacticalAnalysisReportRecord,
  TacticalAnalysisItemRecord,
} from '../../src/modules/scouting-report-tactical-analysis/types/scouting-report-tactical-analysis.types.js';
import type {
  ScoutingReportSwotReportRecord,
  SwotItemRecord,
} from '../../src/modules/scouting-report-swot/types/scouting-report-swot.types.js';

class NoopOpponentRepository implements OpponentRepository {
  async create(_input: CreateOpponentInput): Promise<OpponentRecord> {
    throw new Error('Not implemented for form route tests');
  }

  async update(
    _opponentId: number,
    _input: UpdateOpponentInput,
  ): Promise<OpponentRecord | null> {
    return null;
  }

  async findById(_opponentId: number): Promise<OpponentRecord | null> {
    return null;
  }

  async list(_filters: OpponentListFilters): Promise<OpponentListRecord[]> {
    return [];
  }
}

class NoopScoutingReportRepository implements ScoutingReportRepository {
  async create(
    _input: CreateScoutingReportInput,
  ): Promise<ScoutingReportRecord> {
    throw new Error('Not implemented for form route tests');
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

class NoopScoutingReportSystemsRepository implements ScoutingReportSystemsRepository {
  async findReportById(
    _reportId: number,
  ): Promise<ScoutingReportSystemsReportRecord | null> {
    return null;
  }

  async findCatalogSystemsByCodes(
    _systemCodes: string[],
  ): Promise<SystemCatalogRecord[]> {
    return [];
  }

  async getSystemsForReport(
    _reportId: number,
  ): Promise<ScoutingReportSystemSelectionRecord[]> {
    return [];
  }

  async replaceSystemsForReport(
    _reportId: number,
    _input: ReplaceScoutingReportSystemsInput,
  ): Promise<void> {
    return;
  }
}

class InMemoryScoutingReportFormRepository implements ScoutingReportFormRepository {
  private readonly reports = new Map<number, ScoutingReportFormReportRecord>();
  private readonly formsByReportId = new Map<number, OpponentFormRecord>();

  constructor(options: {
    reports?: ScoutingReportFormReportRecord[];
    formsByReportId?: Record<number, OpponentFormRecord>;
  }) {
    for (const report of options.reports ?? []) {
      this.reports.set(report.id, report);
    }

    for (const [reportId, form] of Object.entries(
      options.formsByReportId ?? {},
    )) {
      this.formsByReportId.set(Number(reportId), form);
    }
  }

  async findReportById(
    reportId: number,
  ): Promise<ScoutingReportFormReportRecord | null> {
    return this.reports.get(reportId) ?? null;
  }

  async findFormByReportId(
    reportId: number,
  ): Promise<OpponentFormRecord | null> {
    return this.formsByReportId.get(reportId) ?? null;
  }

  async upsertFormByReportId(
    reportId: number,
    form: OpponentFormRecord,
  ): Promise<OpponentFormRecord> {
    this.formsByReportId.set(reportId, form);
    return form;
  }
}

class NoopScoutingReportTacticalAnalysisRepository implements ScoutingReportTacticalAnalysisRepository {
  async findReportById(
    _reportId: number,
  ): Promise<ScoutingReportTacticalAnalysisReportRecord | null> {
    return null;
  }

  async getItemsByReportId(
    _reportId: number,
  ): Promise<TacticalAnalysisItemRecord[]> {
    return [];
  }

  async replaceItemsByReportId(
    _reportId: number,
    _items: TacticalAnalysisItemRecord[],
  ): Promise<void> {
    return;
  }
}

class NoopScoutingReportSwotRepository implements ScoutingReportSwotRepository {
  async findReportById(
    _reportId: number,
  ): Promise<ScoutingReportSwotReportRecord | null> {
    return null;
  }

  async getItemsByReportId(_reportId: number): Promise<SwotItemRecord[]> {
    return [];
  }

  async replaceItemsByReportId(
    _reportId: number,
    _items: SwotItemRecord[],
  ): Promise<void> {
    return;
  }
}

test('create form stores MVP form fields for a report', async (t) => {
  const app = buildApp({
    opponentRepository: new NoopOpponentRepository(),
    scoutingReportRepository: new NoopScoutingReportRepository(),
    scoutingReportSystemsRepository: new NoopScoutingReportSystemsRepository(),
    scoutingReportFormRepository: new InMemoryScoutingReportFormRepository({
      reports: [{ id: 3, status: 'draft' }],
    }),
    scoutingReportTacticalAnalysisRepository:
      new NoopScoutingReportTacticalAnalysisRepository(),
    scoutingReportSwotRepository: new NoopScoutingReportSwotRepository(),
  });

  t.after(() => app.close());

  const response = await app.inject({
    method: 'PUT',
    url: '/scouting-reports/3/form',
    payload: {
      leaguePosition: 2,
      points: 61,
      recentFormText: 'W-W-D-W-L',
      notes: 'Positive run before the next fixture.',
    },
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), {
    leaguePosition: 2,
    points: 61,
    recentFormText: 'W-W-D-W-L',
    notes: 'Positive run before the next fixture.',
  });
});

test('update form overwrites the current report form snapshot', async (t) => {
  const repository = new InMemoryScoutingReportFormRepository({
    reports: [{ id: 4, status: 'draft' }],
    formsByReportId: {
      4: {
        leaguePosition: 6,
        points: 44,
        recentFormText: 'W-D-L',
        notes: 'Old note',
      },
    },
  });

  const app = buildApp({
    opponentRepository: new NoopOpponentRepository(),
    scoutingReportRepository: new NoopScoutingReportRepository(),
    scoutingReportSystemsRepository: new NoopScoutingReportSystemsRepository(),
    scoutingReportFormRepository: repository,
    scoutingReportTacticalAnalysisRepository:
      new NoopScoutingReportTacticalAnalysisRepository(),
    scoutingReportSwotRepository: new NoopScoutingReportSwotRepository(),
  });

  t.after(() => app.close());

  const updateResponse = await app.inject({
    method: 'PUT',
    url: '/scouting-reports/4/form',
    payload: {
      leaguePosition: 5,
      points: 47,
      recentFormText: 'W-W-D-L-W',
      notes: 'Improved momentum on the road.',
    },
  });

  assert.equal(updateResponse.statusCode, 200);
  assert.deepEqual(updateResponse.json(), {
    leaguePosition: 5,
    points: 47,
    recentFormText: 'W-W-D-L-W',
    notes: 'Improved momentum on the road.',
  });

  const readResponse = await app.inject({
    method: 'GET',
    url: '/scouting-reports/4/form',
  });

  assert.equal(readResponse.statusCode, 200);
  assert.deepEqual(readResponse.json(), {
    leaguePosition: 5,
    points: 47,
    recentFormText: 'W-W-D-L-W',
    notes: 'Improved momentum on the road.',
  });
});

test('reject invalid form input', async (t) => {
  const app = buildApp({
    opponentRepository: new NoopOpponentRepository(),
    scoutingReportRepository: new NoopScoutingReportRepository(),
    scoutingReportSystemsRepository: new NoopScoutingReportSystemsRepository(),
    scoutingReportFormRepository: new InMemoryScoutingReportFormRepository({
      reports: [{ id: 5, status: 'draft' }],
    }),
    scoutingReportTacticalAnalysisRepository:
      new NoopScoutingReportTacticalAnalysisRepository(),
    scoutingReportSwotRepository: new NoopScoutingReportSwotRepository(),
  });

  t.after(() => app.close());

  const response = await app.inject({
    method: 'PUT',
    url: '/scouting-reports/5/form',
    payload: {
      leaguePosition: 0,
      points: 12,
      recentFormText: 'W-W-L',
      notes: null,
    },
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.json().message, 'Request validation failed');
});

test('reject form update on published report', async (t) => {
  const app = buildApp({
    opponentRepository: new NoopOpponentRepository(),
    scoutingReportRepository: new NoopScoutingReportRepository(),
    scoutingReportSystemsRepository: new NoopScoutingReportSystemsRepository(),
    scoutingReportFormRepository: new InMemoryScoutingReportFormRepository({
      reports: [{ id: 6, status: 'published' }],
    }),
    scoutingReportTacticalAnalysisRepository:
      new NoopScoutingReportTacticalAnalysisRepository(),
    scoutingReportSwotRepository: new NoopScoutingReportSwotRepository(),
  });

  t.after(() => app.close());

  const response = await app.inject({
    method: 'PUT',
    url: '/scouting-reports/6/form',
    payload: {
      leaguePosition: 1,
      points: 70,
      recentFormText: 'W-W-W-W-W',
      notes: 'Locked after publication.',
    },
  });

  assert.equal(response.statusCode, 409);
  assert.equal(
    response.json().message,
    'ScoutingReport 6 is published and cannot be modified',
  );
});

test('published report form can still be read', async (t) => {
  const app = buildApp({
    opponentRepository: new NoopOpponentRepository(),
    scoutingReportRepository: new NoopScoutingReportRepository(),
    scoutingReportSystemsRepository: new NoopScoutingReportSystemsRepository(),
    scoutingReportFormRepository: new InMemoryScoutingReportFormRepository({
      reports: [{ id: 7, status: 'published' }],
      formsByReportId: {
        7: {
          leaguePosition: 1,
          points: 70,
          recentFormText: 'W-W-W-W-W',
          notes: 'Still visible after publication.',
        },
      },
    }),
    scoutingReportTacticalAnalysisRepository:
      new NoopScoutingReportTacticalAnalysisRepository(),
    scoutingReportSwotRepository: new NoopScoutingReportSwotRepository(),
  });

  t.after(() => app.close());

  const response = await app.inject({
    method: 'GET',
    url: '/scouting-reports/7/form',
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().leaguePosition, 1);
});
