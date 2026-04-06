import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { mockFetch } from '../../../test/mock-fetch';
import { renderWithRoute } from '../../../test/test-utils';
import { ReportEditorPage } from './ReportEditorPage';

describe('ReportEditorPage', () => {
  it('loads and saves form and systems sections', async () => {
    const putForm = vi.fn();
    const putSystems = vi.fn();

    mockFetch({
      'GET /scouting-reports/21': () =>
        Response.json({
          id: 21,
          opponentId: 7,
          versionNumber: 1,
          reportSource: 'scouting',
          status: 'draft',
          reportDate: '2026-04-06',
          publishedAt: null,
          createdAt: '2026-04-06T10:00:00.000Z',
          updatedAt: '2026-04-06T10:00:00.000Z',
        }),
      'GET /opponents/7': () =>
        Response.json({
          id: 7,
          name: 'Atletico Demo',
          countryName: 'Spain',
          competitionName: 'LaLiga',
          createdAt: '2026-04-06T10:00:00.000Z',
          updatedAt: '2026-04-06T10:00:00.000Z',
        }),
      'GET /scouting-reports/21/form': () =>
        Response.json({
          leaguePosition: 2,
          points: 61,
          recentFormText: 'Good momentum',
          notes: 'Initial note',
        }),
      'PUT /scouting-reports/21/form': ({ body }) => {
        putForm(body);
        return Response.json(body);
      },
      'GET /scouting-reports/21/systems': () =>
        Response.json({
          primarySystem: {
            systemCode: '1-4-3-3',
            playerPositions: [
              { playerNumber: 1, x: 50, y: 12 },
              { playerNumber: 2, x: 20, y: 32 },
            ],
          },
          alternateSystems: [
            {
              systemCode: '1-4-4-2',
              playerPositions: [{ playerNumber: 1, x: 50, y: 12 }],
            },
          ],
        }),
      'PUT /scouting-reports/21/systems': ({ body }) => {
        putSystems(body);
        return Response.json(body);
      },
    });

    renderWithRoute(<ReportEditorPage />, {
      path: '/report-editor',
      initialEntries: ['/report-editor?reportId=21&opponentId=7'],
    });

    const user = userEvent.setup();

    const notesField = await screen.findByLabelText('Notas');
    await waitFor(() => {
      expect(notesField).toHaveValue('Initial note');
    });
    fireEvent.change(notesField, {
      target: { value: 'Updated note' },
    });
    await user.click(screen.getByRole('button', { name: 'Guardar dinamica' }));

    await waitFor(() => {
      expect(putForm).toHaveBeenCalledWith({
        leaguePosition: 2,
        points: 61,
        recentFormText: 'Good momentum',
        notes: 'Updated note',
      });
    });

    await user.click(screen.getByRole('button', { name: /Sistemas/ }));

    const primarySystemField = await screen.findByLabelText(
      'Codigo del sistema principal',
    );
    await waitFor(() => {
      expect(primarySystemField).toHaveValue('1-4-3-3');
    });
    fireEvent.change(primarySystemField, {
      target: { value: '1-3-5-2' },
    });

    const alternateSystemField =
      await screen.findByLabelText('Codigo del sistema');
    fireEvent.change(alternateSystemField, {
      target: { value: '1-5-4-1' },
    });
    await user.click(screen.getByRole('button', { name: 'Guardar sistemas' }));

    await waitFor(() => {
      expect(putSystems).toHaveBeenCalledWith({
        primarySystem: {
          systemCode: '1-3-5-2',
          playerPositions: expect.any(Array),
        },
        alternateSystems: [
          {
            systemCode: '1-5-4-1',
            playerPositions: expect.any(Array),
          },
        ],
      });
    });
  });
});
