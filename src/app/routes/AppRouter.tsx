import type { JSX } from 'react';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';

import { AppShellLayout } from '../layout/AppShellLayout';
import { OpponentsPage } from '../../features/opponents/pages/OpponentsPage';
import { ReportEditorPage } from '../../features/report-editor/pages/ReportEditorPage';
import { ReportPreviewPage } from '../../features/report-preview/pages/ReportPreviewPage';
import { ReportsPage } from '../../features/reports/pages/ReportsPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShellLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/opponents" replace />,
      },
      {
        path: 'opponents',
        element: <OpponentsPage />,
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      {
        path: 'report-editor',
        element: <ReportEditorPage />,
      },
      {
        path: 'report-preview',
        element: <ReportPreviewPage />,
      },
    ],
  },
]);

export function AppRouter(): JSX.Element {
  return <RouterProvider router={router} />;
}
