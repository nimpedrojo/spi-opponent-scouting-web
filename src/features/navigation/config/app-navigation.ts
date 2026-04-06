export interface AppNavigationItem {
  to: string;
  label: string;
  description: string;
}

export const appNavigationItems: AppNavigationItem[] = [
  {
    to: '/opponents',
    label: 'Rivales',
    description: 'Directorio y objetivos de scouting',
  },
  {
    to: '/reports',
    label: 'Informes',
    description: 'Listado de informes y estados',
  },
  {
    to: '/report-editor',
    label: 'Editor de informes',
    description: 'Flujo de scouting por secciones',
  },
  {
    to: '/report-preview',
    label: 'Vista previa del informe',
    description: 'Revision y entrega para el cuerpo tecnico',
  },
];
