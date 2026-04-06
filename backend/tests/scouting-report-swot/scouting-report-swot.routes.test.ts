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
import type { ScoutingReportSwotRepository } from '../../src/modules/scouting-report-swot/repositories/scouting-report-swot.repository.js';
import type {
  ScoutingReportSwotReportRecord,
  SwotItemRecord,
} from '../../src/modules/scouting-report-swot/types/scouting-report-swot.types.js';
import type { ScoutingReportTacticalAnalysisRepository } from '../../src/modules/scouting-report-tactical-analysis/repositories/scouting-report-tactical-analysis.repository.js';
import type {
  ScoutingReportTacticalAnalysisReportRecord,
  TacticalAnalysisItemRecord,
} from '../../src/modules/scouting-report-tactical-analysis/types/scouting-report-tactical-analysis.types.js';
import type { ScoutingReportRepository } from '../../src/modules/scouting-reports/repositories/scouting-report.repository.js';
import type {
  CreateScoutingReportInput,
  ListScoutingReportsFilters,
  ScoutingReportRecord,
  UpdateScoutingReportMetadataInput,
} from '../../src/modules/scouting-reports/types/scouting-report.types.js';

class NoopOpponentRepository implements OpponentRepository {
  async create(_input: CreateOpponentInput): Promise<OpponentRecord> {
    throw new Error('Not implemented for SWOT route tests');
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
    throw new Error('Not implemented for SWOT route tests');
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

class NoopScoutingReportFormRepository implements ScoutingReportFormRepository {
  async findReportById(
    _reportId: number,
  ): Promise<ScoutingReportFormReportRecord | null> {
    return null;
  }

  async findFormByReportId(
    _reportId: number,
  ): Promise<OpponentFormRecord | null> {
    return null;
  }

  async upsertFormByReportId(
    _reportId: number,
    _form: OpponentFormRecord,
  ): Promise<OpponentFormRecord> {
    throw new Error('Not implemented for SWOT route tests');
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

class InMemoryScoutingReportSwotRepository implements ScoutingReportSwotRepository {
  private readonly reports = new Map<number, ScoutingReportSwotReportRecord>();
  private readonly itemsByReportId = new Map<number, SwotItemRecord[]>();

  constructor(options: {
    reports?: ScoutingReportSwotReportRecord[];
    itemsByReportId?: Record<number, SwotItemRecord[]>;
  }) {
    for (const report of options.reports ?? []) {
      this.reports.set(report.id, report);
    }

    for (const [reportId, items] of Object.entries(
      options.itemsByReportId ?? {},
    )) {
      this.itemsByReportId.set(Number(reportId), [...items]);
    }
  }

  async findReportById(
    reportId: number,
  ): Promise<ScoutingReportSwotReportRecord | null> {
    return this.reports.get(reportId) ?? null;
  }

  async getItemsByReportId(reportId: number): Promise<SwotItemRecord[]> {
    return [...(this.itemsByReportId.get(reportId) ?? [])];
  }

  async replaceItemsByReportId(
    reportId: number,
    items: SwotItemRecord[],
  ): Promise<void> {
    this.itemsByReportId.set(reportId, [...items]);
  }
}

test('save SWOT items', async (t) => {
  const app = buildApp({
    opponentRepository: new NoopOpponentRepository(),
    scoutingReportRepository: new NoopScoutingReportRepository(),
    scoutingReportSystemsRepository: new NoopScoutingReportSystemsRepository(),
    scoutingReportFormRepository: new NoopScoutingReportFormRepository(),
    scoutingReportTacticalAnalysisRepository:
      new NoopScoutingReportTacticalAnalysisRepository(),
    scoutingReportSwotRepository: new InMemoryScoutingReportSwotRepository({
      reports: [{ id: 21, status: 'draft' }],
    }),
  });

  t.after(() => app.close());

  const response = await app.inject({
    method: 'PUT',
    url: '/scouting-reports/21/swot',
    payload: {
      items: [
        {
          swotType: 'strength',
          description: 'Strong central progression through midfield.',
          priority: 1,
        },
        {
          swotType: 'threat',
          description: 'Dangerous late runs into the box.',
          priority: 2,
        },
      ],
    },
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), {
    items: [
      {
        swotType: 'strength',
        description: 'Strong central progression through midfield.',
        priority: 1,
      },
      {
        swotType: 'threat',
        description: 'Dangerous late runs into the box.',
        priority: 2,
      },
    ],
  });
});

test('validate type', async (t) => {
  const app = buildApp({
    opponentRepository: new NoopOpponentRepository(),
    scoutingReportRepository: new NoopScoutingReportRepository(),
    scoutingReportSystemsRepository: new NoopScoutingReportSystemsRepository(),
    scoutingReportFormRepository: new NoopScoutingReportFormRepository(),
    scoutingReportTacticalAnalysisRepository:
      new NoopScoutingReportTacticalAnalysisRepository(),
    scoutingReportSwotRepository: new InMemoryScoutingReportSwotRepository({
      reports: [{ id: 22, status: 'draft' }],
    }),
  });

  t.after(() => app.close());

  const response = await app.inject({
    method: 'PUT',
    url: '/scouting-reports/22/swot',
    payload: {
      items: [
        {
          swotType: 'risk',
          description: 'Invalid SWOT type should fail.',
          priority: 1,
        },
      ],
    },
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.json().message, 'Request validation failed');
});

test('reject invalid input', async (t) => {
  const app = buildApp({
    opponentRepository: new NoopOpponentRepository(),
    scoutingReportRepository: new NoopScoutingReportRepository(),
    scoutingReportSystemsRepository: new NoopScoutingReportSystemsRepository(),
    scoutingReportFormRepository: new NoopScoutingReportFormRepository(),
    scoutingReportTacticalAnalysisRepository:
      new NoopScoutingReportTacticalAnalysisRepository(),
    scoutingReportSwotRepository: new InMemoryScoutingReportSwotRepository({
      reports: [{ id: 23, status: 'draft' }],
    }),
  });

  t.after(() => app.close());

  const response = await app.inject({
    method: 'PUT',
    url: '/scouting-reports/23/swot',
    payload: {
      items: [
        {
          swotType: 'weakness',
          description: '   ',
          priority: 1,
        },
      ],
    },
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.json().message, 'Request validation failed');
});

test('reject update on published report', async (t) => {
  const app = buildApp({
    opponentRepository: new NoopOpponentRepository(),
    scoutingReportRepository: new NoopScoutingReportRepository(),
    scoutingReportSystemsRepository: new NoopScoutingReportSystemsRepository(),
    scoutingReportFormRepository: new NoopScoutingReportFormRepository(),
    scoutingReportTacticalAnalysisRepository:
      new NoopScoutingReportTacticalAnalysisRepository(),
    scoutingReportSwotRepository: new InMemoryScoutingReportSwotRepository({
      reports: [{ id: 24, status: 'published' }],
    }),
  });

  t.after(() => app.close());

  const response = await app.inject({
    method: 'PUT',
    url: '/scouting-reports/24/swot',
    payload: {
      items: [
        {
          swotType: 'opportunity',
          description: 'Should not be editable after publish.',
          priority: 1,
        },
      ],
    },
  });

  assert.equal(response.statusCode, 409);
  assert.equal(
    response.json().message,
    'ScoutingReport 24 is published and cannot be modified',
  );
});
