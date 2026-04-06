import type {
  CreateOpponentInput,
  OpponentListFilters,
  OpponentListRecord,
  OpponentRecord,
  UpdateOpponentInput,
} from '../types/opponent.types.js';

export interface OpponentRepository {
  create(input: CreateOpponentInput): Promise<OpponentRecord>;
  update(
    opponentId: number,
    input: UpdateOpponentInput,
  ): Promise<OpponentRecord | null>;
  findById(opponentId: number): Promise<OpponentRecord | null>;
  list(filters: OpponentListFilters): Promise<OpponentListRecord[]>;
}
