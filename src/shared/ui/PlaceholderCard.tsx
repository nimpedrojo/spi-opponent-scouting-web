import type { JSX, PropsWithChildren } from 'react';

interface PlaceholderCardProps extends PropsWithChildren {
  title: string;
  description: string;
  items?: string[];
}

export function PlaceholderCard({
  title,
  description,
  items,
  children,
}: PlaceholderCardProps): JSX.Element {
  return (
    <article className="placeholder-card">
      <h3>{title}</h3>
      <p>{description}</p>
      {items !== undefined ? (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {children}
    </article>
  );
}
