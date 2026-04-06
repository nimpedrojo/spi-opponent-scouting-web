import type { JSX } from 'react';

import {
  reportEditorSections,
  type ReportEditorSection,
} from './report-editor-sections';

interface ReportEditorSidebarProps {
  activeSectionId: string;
  isReadOnly: boolean;
  onSelectSection: (sectionId: string) => void;
}

export function ReportEditorSidebar({
  activeSectionId,
  isReadOnly,
  onSelectSection,
}: ReportEditorSidebarProps): JSX.Element {
  return (
    <aside className="editor-sidebar panel">
      <div className="panel__header">
        <div>
          <span className="page-header__eyebrow">Secciones del informe</span>
          <h3>{isReadOnly ? 'Flujo de solo lectura' : 'Flujo de edicion'}</h3>
        </div>
      </div>

      {isReadOnly ? (
        <p className="muted-text">
          Los informes publicados permanecen en solo lectura en todas las
          secciones.
        </p>
      ) : null}

      <nav className="editor-sidebar__nav" aria-label="Secciones del informe">
        {reportEditorSections.map((section) => (
          <button
            key={section.id}
            type="button"
            className={
              section.id === activeSectionId
                ? 'editor-sidebar__link editor-sidebar__link--active'
                : 'editor-sidebar__link'
            }
            onClick={() => onSelectSection(section.id)}
          >
            <span>{section.label}</span>
            <small>{section.description}</small>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export function getReportEditorSection(
  sectionId: string,
): ReportEditorSection | undefined {
  return reportEditorSections.find((section) => section.id === sectionId);
}
