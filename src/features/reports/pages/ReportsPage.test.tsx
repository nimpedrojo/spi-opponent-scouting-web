import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { mockFetch } from '../../../test/mock-fetch';
import { renderWithRoute } from '../../../test/test-utils';
import type { ScoutingReportResponseDto } from '../api/reportsApi';
import { ReportsPage } from './ReportsPage';

function RouteMarker() {
  const location = useLocation();

  return <div>{`${location.pathname}${location.search}`}</div>;
}

describe('ReportsPage', () => {
  it('creates a report and opens the editor', async () => {
    mockFetch({
      'GET /opponents': () =>
        Response.json({
          items: [
            {
              id: 7,
              name: 'Atletico Demo',
              countryName: 'Spain',
              competitionName: 'LaLiga',
              createdAt: '2026-04-06T10:00:00.000Z',
              updatedAt: '2026-04-06T10:00:00.000Z',
            },
          ],
        }),
      'GET /scouting-reports': () => Response.json({ items: [] }),
      'POST /scouting-reports': () =>
        Response.json({
          id: 21,
          opponentId: 7,
          versionNumber: 1,
          reportSource: 'video_analysis',
          status: 'draft',
          reportDate: null,
          publishedAt: null,
          createdAt: '2026-04-06T10:00:00.000Z',
          updatedAt: '2026-04-06T10:00:00.000Z',
        }),
    });

    renderWithRoute(<ReportsPage />, {
      path: '/reports',
      initialEntries: ['/reports'],
      additionalRoutes: [
        {
          path: '/report-editor',
          element: <RouteMarker />,
        },
      ],
    });

    const user = userEvent.setup();

    const createReportPanel = screen
      .getByRole('heading', { name: 'Inicia un nuevo borrador de scouting' })
      .closest('section');

    if (createReportPanel === null) {
      throw new Error('No se encontro el panel de crear informe');
    }

    await within(createReportPanel).findByRole('option', {
      name: 'Atletico Demo',
    });

    await user.selectOptions(
      within(createReportPanel).getByLabelText('Rival'),
      '7',
    );
    await user.selectOptions(
      within(createReportPanel).getByLabelText('Origen del informe'),
      'video_analysis',
    );
    await user.click(screen.getByRole('button', { name: 'Crear informe' }));

    await screen.findByText('/report-editor?reportId=21&opponentId=7');
  });

  it('publishes a report and refreshes the lifecycle state in the list', async () => {
    const reports: ScoutingReportResponseDto[] = [
      {
        id: 14,
        opponentId: 4,
        versionNumber: 2,
        reportSource: 'scouting',
        status: 'draft',
        reportDate: '2026-04-06',
        publishedAt: null,
        createdAt: '2026-04-06T10:00:00.000Z',
        updatedAt: '2026-04-06T10:00:00.000Z',
      },
    ];

    mockFetch({
      'GET /opponents': () =>
        Response.json({
          items: [
            {
              id: 4,
              name: 'Valencia Demo',
              countryName: 'Spain',
              competitionName: 'LaLiga',
              createdAt: '2026-04-06T10:00:00.000Z',
              updatedAt: '2026-04-06T10:00:00.000Z',
            },
          ],
        }),
      'GET /scouting-reports': () => Response.json({ items: reports }),
      'POST /scouting-reports/14/publish': () => {
        const currentReport = reports[0];

        if (currentReport === undefined) {
          throw new Error('Expected an existing report to publish');
        }

        reports[0] = {
          ...currentReport,
          status: 'published',
          publishedAt: '2026-04-06T11:00:00.000Z',
          updatedAt: '2026-04-06T11:00:00.000Z',
        };

        return Response.json(reports[0]);
      },
    });

    renderWithRoute(<ReportsPage />, {
      path: '/reports',
      initialEntries: ['/reports'],
    });

    const user = userEvent.setup();

    await screen.findByRole('button', { name: 'Publicar' });
    await user.click(screen.getByRole('button', { name: 'Publicar' }));

    await waitFor(() => {
      expect(screen.getAllByText('Publicado').length).toBeGreaterThan(0);
    });
  });

  it('deletes a report from the list', async () => {
    const reports: ScoutingReportResponseDto[] = [
      {
        id: 18,
        opponentId: 4,
        versionNumber: 1,
        reportSource: 'scouting',
        status: 'draft',
        reportDate: '2026-04-06',
        publishedAt: null,
        createdAt: '2026-04-06T10:00:00.000Z',
        updatedAt: '2026-04-06T10:00:00.000Z',
      },
    ];

    mockFetch({
      'GET /opponents': () =>
        Response.json({
          items: [
            {
              id: 4,
              name: 'Valencia Demo',
              countryName: 'Spain',
              competitionName: 'LaLiga',
              createdAt: '2026-04-06T10:00:00.000Z',
              updatedAt: '2026-04-06T10:00:00.000Z',
            },
          ],
        }),
      'GET /scouting-reports': () => Response.json({ items: reports }),
      'DELETE /scouting-reports/18': () => {
        reports.splice(0, 1);
        return new Response(null, { status: 204 });
      },
    });

    renderWithRoute(<ReportsPage />, {
      path: '/reports',
      initialEntries: ['/reports'],
    });

    const user = userEvent.setup();

    await screen.findByRole('button', { name: 'Borrar' });
    await user.click(screen.getByRole('button', { name: 'Borrar' }));

    await waitFor(() => {
      expect(screen.getByText('No se encontraron informes')).toBeVisible();
    });
  });
});
