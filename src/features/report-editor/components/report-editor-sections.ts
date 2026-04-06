export interface ReportEditorSection {
  id: string;
  label: string;
  description: string;
}

export const reportEditorSections: ReportEditorSection[] = [
  {
    id: 'form',
    label: 'Form',
    description: 'Recent dynamics and contextual notes.',
  },
  {
    id: 'systems',
    label: 'Systems',
    description: 'Primary and alternate tactical systems.',
  },
  {
    id: 'tactical-analysis',
    label: 'Tactical Analysis',
    description: 'Phase-based tactical observations.',
  },
  {
    id: 'swot',
    label: 'SWOT',
    description: 'Structured strengths, risks, and opportunities.',
  },
  {
    id: 'preview',
    label: 'Preview',
    description: 'Read-oriented review before publication.',
  },
];
