import type {
  Pool,
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise';

export type DatabasePool = Pick<Pool, 'execute' | 'getConnection'>;
export type DatabaseRow = RowDataPacket;
export type DatabaseMutationResult = ResultSetHeader;
export type DatabaseConnection = Pick<
  PoolConnection,
  'beginTransaction' | 'commit' | 'rollback' | 'release' | 'execute'
>;
