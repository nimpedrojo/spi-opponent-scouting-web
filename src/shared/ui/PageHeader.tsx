import type { JSX } from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: PageHeaderProps): JSX.Element {
  return (
    <header className="page-header">
      <span className="page-header__eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </header>
  );
}
