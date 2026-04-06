import mysql from 'mysql2/promise';

import { buildApp } from './app.js';
import { MysqlOpponentRepository } from './modules/opponents/repositories/mysql-opponent.repository.js';
import { MysqlScoutingReportFormRepository } from './modules/scouting-report-form/repositories/mysql-scouting-report-form.repository.js';
import { MysqlScoutingReportSystemsRepository } from './modules/scouting-report-systems/repositories/mysql-scouting-report-systems.repository.js';
import { MysqlScoutingReportRepository } from './modules/scouting-reports/repositories/mysql-scouting-report.repository.js';

async function startServer(): Promise<void> {
  const pool = mysql.createPool({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? '3306'),
    database: process.env.DB_NAME ?? 'spi_opponent_scouting',
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    connectionLimit: 10,
  });

  const opponentRepository = new MysqlOpponentRepository(pool);
  const scoutingReportRepository = new MysqlScoutingReportRepository(pool);
  const scoutingReportSystemsRepository =
    new MysqlScoutingReportSystemsRepository(pool);
  const scoutingReportFormRepository = new MysqlScoutingReportFormRepository(
    pool,
  );
  const app = buildApp({
    opponentRepository,
    scoutingReportRepository,
    scoutingReportSystemsRepository,
    scoutingReportFormRepository,
  });

  try {
    await app.listen({
      host: process.env.HOST ?? '0.0.0.0',
      port: Number(process.env.PORT ?? '3000'),
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void startServer();
