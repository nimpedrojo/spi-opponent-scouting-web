import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export type DatabasePool = Pick<Pool, 'execute'>;
export type DatabaseRow = RowDataPacket;
export type DatabaseMutationResult = ResultSetHeader;
