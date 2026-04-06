import assert from 'node:assert/strict';
import test from 'node:test';

import { buildApp } from '../../src/app.js';
import type { OpponentRepository } from '../../src/modules/opponents/repositories/opponent.repository.js';
import type { ScoutingReportFormRepository } from '../../src/modules/scouting-report-form/repositories/scouting-report-form.repository.js';
import type { ScoutingReportTacticalAnalysisRepository } from '../../src/modules/scouting-report-tactical-analysis/repositories/scouting-report-tactical-analysis.repository.js';
import type { ScoutingReportSwotRepository } from '../../src/modules/scouting-report-swot/repositories/scouting-report-swot.repository.js';
import type {
  CreateOpponentInput,
  OpponentListFilters,
  OpponentListRecord,
  OpponentRecord,
  UpdateOpponentInput,
} from '../../src/modules/opponents/types/opponent.types.js';
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
  OpponentFormRecord,
  ScoutingReportFormReportRecord,
} from '../../src/modules/scouting-report-form/types/scouting-report-form.types.js';
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
    throw new Error('Not implemented for systems route tests');
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
    throw new Error('Not implemented for systems route tests');
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

class InMemoryScoutingReportSystemsRepository implements ScoutingReportSystemsRepository {
  private readonly reports = new Map<
    number,
    ScoutingReportSystemsReportRecord
  >();
  private readonly catalogByCode = new Map<string, SystemCatalogRecord>();
  private readonly selectionsByReportId = new Map<
    number,
    ScoutingReportSystemSelectionRecord[]
  >();

  constructor(options: {
    reports?: ScoutingReportSystemsReportRecord[];
    catalog?: SystemCatalogRecord[];
    selectionsByReportId?: Record<
      number,
      ScoutingReportSystemSelectionRecord[]
    >;
  }) {
    for (const report of options.reports ?? []) {
      this.reports.set(report.id, report);
    }

    for (const system of options.catalog ?? []) {
      this.catalogByCode.set(system.systemCode, system);
    }

    for (const [reportId, selections] of Object.entries(
      options.selectionsByReportId ?? {},
    )) {
      this.selectionsByReportId.set(Number(reportId), [...selections]);
    }
  }

  async findReportById(
    reportId: number,
  ): Promise<ScoutingReportSystemsReportRecord | null> {
    return this.reports.get(reportId) ?? null;
  }

  async findCatalogSystemsByCodes(
    systemCodes: string[],
  ): Promise<SystemCatalogRecord[]> {
    return systemCodes
      .map((systemCode) => this.catalogByCode.get(systemCode) ?? null)
      .filter((system): system is SystemCatalogRecord => system !== null);
  }

  async getSystemsForReport(
    reportId: number,
  ): Promise<ScoutingReportSystemSelectionRecord[]> {
    return [...(this.selectionsByReportId.get(reportId) ?? [])];
  }

  async replaceSystemsForReport(
    reportId: number,
    input: ReplaceScoutingReportSystemsInput,
  ): Promise<void> {
    const primarySystem = this.catalogByCode.get(input.primarySystemCode);

    if (primarySystem === undefined) {
      throw new Error('Primary system catalog entry was not found');
    }

    const nextSelections: ScoutingReportSystemSelectionRecord[] = [
      {
        systemCode: primarySystem.systemCode,
        displayName: primarySystem.displayName,
        usageRole: 'primary',
        displayOrder: 1,
      },
      ...input.alternateSystemCodes.map((systemCode, index) => {
        const alternateSystem = this.catalogByCode.get(systemCode);

        if (alternateSystem === undefined) {
          throw new Error('Alternate system catalog entry was not found');
        }

        return {
          systemCode: alternateSystem.systemCode,
          displayName: alternateSystem.displayName,
          usageRole: 'secondary' as const,
          displayOrder: index + 1,
        };
      }),
    ];

    this.selectionsByReportId.set(reportId, nextSelections);
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
    throw new Error('Not implemented for systems route tests');
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

test('save systems stores primary and alternate systems', async (t) => {
  const app = buildApp({
    opponentRepository: new NoopOpponentRepository(),
    scoutingReportRepository: new NoopScoutingReportRepository(),
    scoutingReportSystemsRepository:
      new InMemoryScoutingReportSystemsRepository({
        reports: [{ id: 5, status: 'draft' }],
        catalog: [
          {
            id: 1,
            systemCode: '1-4-3-3',
            displayName: '1-4-3-3',
            displayOrder: 1,
            isActive: true,
          },
          {
            id: 2,
            systemCode: '1-4-4-2',
            displayName: '1-4-4-2',
            displayOrder: 2,
            isActive: true,
          },
        ],
      }),
    scoutingReportFormRepository: new NoopScoutingReportFormRepository(),
    scoutingReportTacticalAnalysisRepository:
      new NoopScoutingReportTacticalAnalysisRepository(),
    scoutingReportSwotRepository: new NoopScoutingReportSwotRepository(),
  });

  t.after(() => app.close());

  const response = await app.inject({
    method: 'PUT',
    url: '/scouting-reports/5/systems',
    payload: {
      primarySystem: '1-4-3-3',
      alternateSystems: ['1-4-4-2'],
    },
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), {
    primarySystem: '1-4-3-3',
    alternateSystems: ['1-4-4-2'],
  });
});

test('overwrite systems replaces existing selections', async (t) => {
  const repository = new InMemoryScoutingReportSystemsRepository({
    reports: [{ id: 7, status: 'draft' }],
    catalog: [
      {
        id: 1,
        systemCode: '1-4-3-3',
        displayName: '1-4-3-3',
        displayOrder: 1,
        isActive: true,
      },
      {
        id: 2,
        systemCode: '1-4-4-2',
        displayName: '1-4-4-2',
        displayOrder: 2,
        isActive: true,
      },
      {
        id: 3,
        systemCode: '1-3-4-3',
        displayName: '1-3-4-3',
        displayOrder: 3,
        isActive: true,
      },
    ],
    selectionsByReportId: {
      7: [
        {
          systemCode: '1-4-3-3',
          displayName: '1-4-3-3',
          usageRole: 'primary',
          displayOrder: 1,
        },
        {
          systemCode: '1-4-4-2',
          displayName: '1-4-4-2',
          usageRole: 'secondary',
          displayOrder: 1,
        },
      ],
    },
  });

  const app = buildApp({
    opponentRepository: new NoopOpponentRepository(),
    scoutingReportRepository: new NoopScoutingReportRepository(),
    scoutingReportSystemsRepository: repository,
    scoutingReportFormRepository: new NoopScoutingReportFormRepository(),
    scoutingReportTacticalAnalysisRepository:
      new NoopScoutingReportTacticalAnalysisRepository(),
    scoutingReportSwotRepository: new NoopScoutingReportSwotRepository(),
  });

  t.after(() => app.close());

  const updateResponse = await app.inject({
    method: 'PUT',
    url: '/scouting-reports/7/systems',
    payload: {
      primarySystem: '1-3-4-3',
      alternateSystems: [],
    },
  });

  assert.equal(updateResponse.statusCode, 200);
  assert.deepEqual(updateResponse.json(), {
    primarySystem: '1-3-4-3',
    alternateSystems: [],
  });

  const readResponse = await app.inject({
    method: 'GET',
    url: '/scouting-reports/7/systems',
  });

  assert.equal(readResponse.statusCode, 200);
  assert.deepEqual(readResponse.json(), {
    primarySystem: '1-3-4-3',
    alternateSystems: [],
  });
});

test('reject invalid system codes', async (t) => {
  const app = buildApp({
    opponentRepository: new NoopOpponentRepository(),
    scoutingReportRepository: new NoopScoutingReportRepository(),
    scoutingReportSystemsRepository:
      new InMemoryScoutingReportSystemsRepository({
        reports: [{ id: 8, status: 'draft' }],
        catalog: [
          {
            id: 1,
            systemCode: '1-4-3-3',
            displayName: '1-4-3-3',
            displayOrder: 1,
            isActive: true,
          },
        ],
      }),
    scoutingReportFormRepository: new NoopScoutingReportFormRepository(),
    scoutingReportTacticalAnalysisRepository:
      new NoopScoutingReportTacticalAnalysisRepository(),
    scoutingReportSwotRepository: new NoopScoutingReportSwotRepository(),
  });

  t.after(() => app.close());

  const response = await app.inject({
    method: 'PUT',
    url: '/scouting-reports/8/systems',
    payload: {
      primarySystem: '1-4-3-3',
      alternateSystems: ['9-9-9-9'],
    },
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.json().message, 'Invalid system codes: 9-9-9-9');
});

test('reject update on published report', async (t) => {
  const app = buildApp({
    opponentRepository: new NoopOpponentRepository(),
    scoutingReportRepository: new NoopScoutingReportRepository(),
    scoutingReportSystemsRepository:
      new InMemoryScoutingReportSystemsRepository({
        reports: [{ id: 9, status: 'published' }],
        catalog: [
          {
            id: 1,
            systemCode: '1-4-3-3',
            displayName: '1-4-3-3',
            displayOrder: 1,
            isActive: true,
          },
        ],
      }),
    scoutingReportFormRepository: new NoopScoutingReportFormRepository(),
    scoutingReportTacticalAnalysisRepository:
      new NoopScoutingReportTacticalAnalysisRepository(),
    scoutingReportSwotRepository: new NoopScoutingReportSwotRepository(),
  });

  t.after(() => app.close());

  const response = await app.inject({
    method: 'PUT',
    url: '/scouting-reports/9/systems',
    payload: {
      primarySystem: '1-4-3-3',
      alternateSystems: [],
    },
  });

  assert.equal(response.statusCode, 409);
  assert.equal(
    response.json().message,
    'ScoutingReport 9 is published and cannot be modified',
  );
});

test('published report systems can still be read', async (t) => {
  const app = buildApp({
    opponentRepository: new NoopOpponentRepository(),
    scoutingReportRepository: new NoopScoutingReportRepository(),
    scoutingReportSystemsRepository:
      new InMemoryScoutingReportSystemsRepository({
        reports: [{ id: 10, status: 'published' }],
        catalog: [
          {
            id: 1,
            systemCode: '1-4-3-3',
            displayName: '1-4-3-3',
            displayOrder: 1,
            isActive: true,
          },
        ],
        selectionsByReportId: {
          10: [
            {
              systemCode: '1-4-3-3',
              displayName: '1-4-3-3',
              usageRole: 'primary',
              displayOrder: 1,
            },
          ],
        },
      }),
    scoutingReportFormRepository: new NoopScoutingReportFormRepository(),
    scoutingReportTacticalAnalysisRepository:
      new NoopScoutingReportTacticalAnalysisRepository(),
    scoutingReportSwotRepository: new NoopScoutingReportSwotRepository(),
  });

  t.after(() => app.close());

  const response = await app.inject({
    method: 'GET',
    url: '/scouting-reports/10/systems',
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().primarySystem, '1-4-3-3');
});
