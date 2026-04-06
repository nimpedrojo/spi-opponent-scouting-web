import type { JSX } from 'react';

interface SystemPitchDiagramProps {
  systemCode: string | null;
  title: string;
  subtitle?: string;
}

interface PlayerMarker {
  id: string;
  left: number;
  top: number;
}

export function SystemPitchDiagram({
  systemCode,
  title,
  subtitle,
}: SystemPitchDiagramProps): JSX.Element {
  const formationLines = parseSystemCode(systemCode);

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

      {formationLines === null ? (
        <div className="empty-state">
          <p>
            Introduce un sistema valido para mostrar el campograma de esta
            estructura.
          </p>
        </div>
      ) : (
        <div className="system-pitch">
          <div className="system-pitch__surface">
            <div className="system-pitch__line system-pitch__line--outline" />
            <div className="system-pitch__line system-pitch__line--halfway" />
            <div className="system-pitch__circle" />
            <div className="system-pitch__box system-pitch__box--top" />
            <div className="system-pitch__box system-pitch__box--bottom" />

            {createPlayerMarkers(formationLines).map((player) => (
              <span
                key={player.id}
                className="system-pitch__player"
                style={{
                  left: `${player.left}%`,
                  top: `${player.top}%`,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </article>
  );
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

function createPlayerMarkers(formationLines: number[]): PlayerMarker[] {
  const markers: PlayerMarker[] = [];
  const rowCount = formationLines.length;

  formationLines.forEach((playerCount, rowIndex) => {
    const top = rowCount === 1 ? 50 : 12 + (rowIndex * 76) / (rowCount - 1);

    for (let playerIndex = 0; playerIndex < playerCount; playerIndex += 1) {
      const left =
        playerCount === 1 ? 50 : 14 + (playerIndex * 72) / (playerCount - 1);

      markers.push({
        id: `${rowIndex}-${playerIndex}`,
        left,
        top,
      });
    }
  });

  return markers;
}
