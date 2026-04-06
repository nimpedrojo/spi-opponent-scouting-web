export interface AppNavigationItem {
  to: string;
  label: string;
  description: string;
}

export const appNavigationItems: AppNavigationItem[] = [
  {
    to: '/opponents',
    label: 'Opponents',
    description: 'Directory and scouting targets',
  },
  {
    to: '/reports',
    label: 'Reports',
    description: 'Report listing and status overview',
  },
  {
    to: '/report-editor',
    label: 'Report Editor',
    description: 'Section-based scouting workflow',
  },
  {
    to: '/report-preview',
    label: 'Report Preview',
    description: 'Coach-facing review and handoff',
  },
];
