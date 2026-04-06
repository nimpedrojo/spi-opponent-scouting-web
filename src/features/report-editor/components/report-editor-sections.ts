export interface ReportEditorSection {
  id: string;
  label: string;
  description: string;
}

export const reportEditorSections: ReportEditorSection[] = [
  {
    id: 'form',
    label: 'Dinamica',
    description: 'Dinamica reciente y notas de contexto.',
  },
  {
    id: 'systems',
    label: 'Sistemas',
    description: 'Sistema principal y sistemas alternativos.',
  },
  {
    id: 'tactical-analysis',
    label: 'Analisis tactico',
    description: 'Observaciones tacticas por fase.',
  },
  {
    id: 'swot',
    label: 'SWOT',
    description: 'Fortalezas, riesgos y oportunidades estructuradas.',
  },
  {
    id: 'preview',
    label: 'Vista previa',
    description: 'Revision de lectura antes de publicar.',
  },
];
