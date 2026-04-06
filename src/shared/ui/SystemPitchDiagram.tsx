import type { JSX } from 'react';

import type { PitchPlayerPositionDto } from '../api/domain-types';
import { createFormationPlayerPositions } from '../lib/pitch/pitch-player-positions';
import { PitchPositionBoard } from './PitchPositionBoard';

interface SystemPitchDiagramProps {
  systemCode: string | null;
  title: string;
  subtitle?: string;
  playerPositions?: PitchPlayerPositionDto[];
}

export function SystemPitchDiagram({
  systemCode,
  title,
  subtitle,
  playerPositions,
}: SystemPitchDiagramProps): JSX.Element {
  const resolvedPlayerPositions =
    playerPositions !== undefined && playerPositions.length > 0
      ? playerPositions
      : createFormationPlayerPositions(systemCode);

  return (
    <article className="system-diagram-card">
      <div className="system-diagram-card__header">
        <div>
          <span className="page-header__eyebrow">{title}</span>
          <h4>{systemCode ?? 'Sin sistema definido'}</h4>
        </div>
        {subtitle !== undefined ? (
          <span className="status-pill">{subtitle}</span>
        ) : null}
      </div>

      {resolvedPlayerPositions.length === 0 ? (
        <div className="empty-state">
          <p>
            Introduce un sistema valido para mostrar el campograma de esta
            estructura.
          </p>
        </div>
      ) : (
        <PitchPositionBoard positions={resolvedPlayerPositions} />
      )}
    </article>
  );
}
