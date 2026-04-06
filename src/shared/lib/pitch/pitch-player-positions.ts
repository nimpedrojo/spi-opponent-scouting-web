import type { PitchPlayerPositionDto } from '../../api/domain-types';

export function createFormationPlayerPositions(
  systemCode: string | null,
): PitchPlayerPositionDto[] {
  const formationLines = parseSystemCode(systemCode);

  if (formationLines === null) {
    return [];
  }

  const positions: PitchPlayerPositionDto[] = [];
  const rowCount = formationLines.length;
  let playerNumber = 1;

  formationLines.forEach((playerCount, rowIndex) => {
    const y = rowCount === 1 ? 50 : 12 + (rowIndex * 76) / (rowCount - 1);

    for (let playerIndex = 0; playerIndex < playerCount; playerIndex += 1) {
      const x =
        playerCount === 1 ? 50 : 14 + (playerIndex * 72) / (playerCount - 1);

      positions.push({
        playerNumber,
        x,
        y,
      });
      playerNumber += 1;
    }
  });

  return positions;
}

export function createDefaultPitchPlayerPositions(): PitchPlayerPositionDto[] {
  return createFormationPlayerPositions('1-4-3-3');
}

export function createDefaultSetPiecePlayerPositions(): PitchPlayerPositionDto[] {
  return [
    { playerNumber: 1, x: 50, y: 84 },
    { playerNumber: 2, x: 28, y: 72 },
    { playerNumber: 3, x: 72, y: 72 },
    { playerNumber: 4, x: 20, y: 54 },
    { playerNumber: 5, x: 50, y: 46 },
    { playerNumber: 6, x: 80, y: 54 },
  ];
}

export function createNextSetPiecePlayerPosition(
  positions: PitchPlayerPositionDto[],
): PitchPlayerPositionDto {
  const nextPlayerNumber =
    positions.reduce(
      (highestPlayerNumber, position) =>
        Math.max(highestPlayerNumber, position.playerNumber),
      0,
    ) + 1;
  const nextTemplatePosition = setPieceExpansionPositions[positions.length] ?? {
    x: 50,
    y: 62,
  };

  return {
    playerNumber: nextPlayerNumber,
    ...nextTemplatePosition,
  };
}

export function normalizePitchPlayerPositions(
  positions: PitchPlayerPositionDto[],
): PitchPlayerPositionDto[] {
  return positions
    .map((position) => ({
      playerNumber: position.playerNumber,
      x: clampCoordinate(position.x),
      y: clampCoordinate(position.y),
    }))
    .sort((left, right) => left.playerNumber - right.playerNumber);
}

function parseSystemCode(systemCode: string | null): number[] | null {
  if (systemCode === null) {
    return null;
  }

  const normalizedValue = systemCode.trim();

  if (normalizedValue.length === 0) {
    return null;
  }

  const segments = normalizedValue.split('-').map((segment) => Number(segment));

  if (
    segments.length < 2 ||
    segments.some((segment) => Number.isNaN(segment) || segment <= 0)
  ) {
    return null;
  }

  return segments;
}

function clampCoordinate(value: number): number {
  return Math.min(94, Math.max(6, value));
}

const setPieceExpansionPositions: Array<{
  x: number;
  y: number;
}> = [
  { x: 36, y: 60 },
  { x: 64, y: 60 },
  { x: 12, y: 66 },
  { x: 88, y: 66 },
  { x: 50, y: 30 },
  { x: 34, y: 38 },
  { x: 66, y: 38 },
  { x: 50, y: 68 },
];
