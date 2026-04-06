import { EntityNotFoundError } from '../../../shared/http/errors.js';
import type {
  CreateOpponentBodyDto,
  ListOpponentsQueryDto,
  UpdateOpponentBodyDto,
} from '../dtos/opponent-request.dto.js';
import type {
  OpponentListResponseDto,
  OpponentResponseDto,
} from '../dtos/opponent-response.dto.js';
import type { OpponentRepository } from '../repositories/opponent.repository.js';
import type {
  OpponentListFilters,
  OpponentRecord,
} from '../types/opponent.types.js';

export class OpponentService {
  constructor(private readonly opponentRepository: OpponentRepository) {}

  async createOpponent(
    input: CreateOpponentBodyDto,
  ): Promise<OpponentResponseDto> {
    const createdOpponent = await this.opponentRepository.create({
      name: normalizeRequiredText(input.name),
      countryName: normalizeOptionalText(input.countryName),
      competitionName: normalizeOptionalText(input.competitionName),
    });

    return mapOpponentToResponseDto(createdOpponent);
  }

  async updateOpponent(
    opponentId: number,
    input: UpdateOpponentBodyDto,
  ): Promise<OpponentResponseDto> {
    const updatedOpponent = await this.opponentRepository.update(opponentId, {
      name: normalizeRequiredText(input.name),
      countryName: normalizeOptionalText(input.countryName),
      competitionName: normalizeOptionalText(input.competitionName),
    });

    if (updatedOpponent === null) {
      throw new EntityNotFoundError('Opponent', opponentId);
    }

    return mapOpponentToResponseDto(updatedOpponent);
  }

  async getOpponentById(opponentId: number): Promise<OpponentResponseDto> {
    const opponent = await this.opponentRepository.findById(opponentId);

    if (opponent === null) {
      throw new EntityNotFoundError('Opponent', opponentId);
    }

    return mapOpponentToResponseDto(opponent);
  }

  async listOpponents(
    query: ListOpponentsQueryDto,
  ): Promise<OpponentListResponseDto> {
    const filters: OpponentListFilters = {
      category: normalizeOptionalText(query.category),
      season: query.season ?? null,
      status: query.status ?? null,
      search: normalizeOptionalText(query.search),
    };

    const opponents = await this.opponentRepository.list(filters);

    return {
      items: opponents.map(mapOpponentToResponseDto),
    };
  }
}

function mapOpponentToResponseDto(
  opponent: OpponentRecord,
): OpponentResponseDto {
  return {
    id: opponent.id,
    name: opponent.name,
    countryName: opponent.countryName,
    competitionName: opponent.competitionName,
    createdAt: opponent.createdAt.toISOString(),
    updatedAt: opponent.updatedAt.toISOString(),
  };
}

function normalizeRequiredText(value: string): string {
  return value.trim();
}

function normalizeOptionalText(value: string | undefined): string | null {
  const normalizedValue = value?.trim();

  return normalizedValue === undefined || normalizedValue.length === 0
    ? null
    : normalizedValue;
}
