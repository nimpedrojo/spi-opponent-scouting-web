import { useEffect, useRef, useState, type JSX } from 'react';

import type { PitchPlayerPositionDto } from '../api/domain-types';

interface PitchPositionBoardProps {
  positions: PitchPlayerPositionDto[];
  readOnly?: boolean;
  onChange?: (nextPositions: PitchPlayerPositionDto[]) => void;
  variant?: 'full' | 'half';
  showPlayerNumbers?: boolean;
}

export function PitchPositionBoard({
  positions,
  readOnly = true,
  onChange,
  variant = 'full',
  showPlayerNumbers = true,
}: PitchPositionBoardProps): JSX.Element {
  const surfaceReference = useRef<HTMLDivElement | null>(null);
  const [draggingPlayerNumber, setDraggingPlayerNumber] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (draggingPlayerNumber === null || readOnly || onChange === undefined) {
      return;
    }

    const handlePositionsChange = onChange;

    function handlePointerMove(event: PointerEvent): void {
      const surface = surfaceReference.current;

      if (surface === null) {
        return;
      }

      const bounds = surface.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 100;
      const y = ((event.clientY - bounds.top) / bounds.height) * 100;

      handlePositionsChange(
        positions.map((position) =>
          position.playerNumber === draggingPlayerNumber
            ? {
                ...position,
                x: clampCoordinate(x),
                y: clampCoordinate(y),
              }
            : position,
        ),
      );
    }

    function handlePointerUp(): void {
      setDraggingPlayerNumber(null);
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggingPlayerNumber, onChange, positions, readOnly]);

  return (
    <div
      className={
        variant === 'half' ? 'system-pitch system-pitch--half' : 'system-pitch'
      }
    >
      <div ref={surfaceReference} className="system-pitch__surface">
        <div className="system-pitch__line system-pitch__line--outline" />
        {variant === 'full' ? (
          <>
            <div className="system-pitch__line system-pitch__line--halfway" />
            <div className="system-pitch__circle" />
            <div className="system-pitch__box system-pitch__box--top" />
            <div className="system-pitch__box system-pitch__box--bottom" />
          </>
        ) : (
          <>
            <div className="system-pitch__line system-pitch__line--halfway system-pitch__line--halfway-top" />
            <div className="system-pitch__box system-pitch__box--bottom" />
            <div className="system-pitch__goal-area" />
            <div className="system-pitch__spot" />
            <div className="system-pitch__arc" />
          </>
        )}

        {positions.map((position) => (
          <button
            key={position.playerNumber}
            type="button"
            className={
              draggingPlayerNumber === position.playerNumber
                ? 'system-pitch__player system-pitch__player--dragging'
                : 'system-pitch__player'
            }
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
            }}
            disabled={readOnly}
            onPointerDown={() => {
              if (!readOnly) {
                setDraggingPlayerNumber(position.playerNumber);
              }
            }}
          >
            {showPlayerNumbers ? position.playerNumber : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function clampCoordinate(value: number): number {
  return Math.min(94, Math.max(6, value));
}
