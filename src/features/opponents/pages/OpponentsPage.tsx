import { useMemo, useState, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiError } from '../../../shared/api/api-client';
import { PageHeader } from '../../../shared/ui/PageHeader';
import {
  type CreateOpponentBodyDto,
  type ListOpponentsQueryDto,
  type OpponentResponseDto,
  useCreateOpponentMutation,
  useOpponentsQuery,
  useUpdateOpponentMutation,
} from '../api/opponentsApi';
import { useCreateScoutingReportMutation } from '../../reports/api/reportsApi';
import { OpponentFilters } from '../components/OpponentFilters';
import { OpponentFormPanel } from '../components/OpponentFormPanel';
import { OpponentListSection } from '../components/OpponentListSection';

export function OpponentsPage(): JSX.Element {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ListOpponentsQueryDto>({});
  const [selectedOpponent, setSelectedOpponent] =
    useState<OpponentResponseDto | null>(null);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
  const [reportErrorMessage, setReportErrorMessage] = useState<string | null>(
    null,
  );
  const [creatingReportForOpponentId, setCreatingReportForOpponentId] =
    useState<number | null>(null);

  const opponentsQuery = useOpponentsQuery(filters);
  const createOpponentMutation = useCreateOpponentMutation();
  const updateOpponentMutation = useUpdateOpponentMutation();
  const createScoutingReportMutation = useCreateScoutingReportMutation();

  const opponentItems = opponentsQuery.data?.items ?? [];
  const isSubmittingOpponent =
    createOpponentMutation.isPending || updateOpponentMutation.isPending;
  const pageDescription = useMemo(() => {
    if (selectedOpponent !== null) {
      return 'Actualiza los datos del rival y lanza un nuevo informe cuando el objetivo este listo para el analisis.';
    }

    return 'Gestiona objetivos de scouting, filtra el directorio y crea informes desde un unico flujo.';
  }, [selectedOpponent]);

  async function handleSubmitOpponent(
    values: CreateOpponentBodyDto,
  ): Promise<void> {
    setFormErrorMessage(null);

    try {
      if (selectedOpponent === null) {
        await createOpponentMutation.mutateAsync(values);
      } else {
        await updateOpponentMutation.mutateAsync({
          opponentId: selectedOpponent.id,
          body: values,
        });
        setSelectedOpponent(null);
      }
    } catch (error) {
      setFormErrorMessage(
        getErrorMessage(error, 'No se pudo guardar el rival.'),
      );
    }
  }

  async function handleCreateScoutingReport(
    opponent: OpponentResponseDto,
  ): Promise<void> {
    setReportErrorMessage(null);
    setCreatingReportForOpponentId(opponent.id);

    try {
      const report = await createScoutingReportMutation.mutateAsync({
        opponentId: opponent.id,
        reportSource: 'scouting',
      });

      void navigate(
        `/report-editor?reportId=${report.id}&opponentId=${opponent.id}`,
      );
    } catch (error) {
      setReportErrorMessage(
        getErrorMessage(error, 'No se pudo crear el informe de scouting.'),
      );
    } finally {
      setCreatingReportForOpponentId(null);
    }
  }

  return (
    <section className="page">
      <PageHeader
        eyebrow="Directorio de rivales"
        title="Rivales"
        description={pageDescription}
      />

      {reportErrorMessage !== null ? (
        <p className="feedback-message feedback-message--error">
          {reportErrorMessage}
        </p>
      ) : null}

      <OpponentFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters({})}
      />

      <div className="page-grid">
        <OpponentListSection
          items={opponentItems}
          isLoading={opponentsQuery.isLoading}
          activeOpponentId={selectedOpponent?.id ?? null}
          creatingReportForOpponentId={creatingReportForOpponentId}
          onEdit={setSelectedOpponent}
          onCreateScoutingReport={handleCreateScoutingReport}
        />

        <OpponentFormPanel
          selectedOpponent={selectedOpponent}
          isSubmitting={isSubmittingOpponent}
          errorMessage={formErrorMessage}
          onSubmit={handleSubmitOpponent}
          onCancelEdit={() => {
            setFormErrorMessage(null);
            setSelectedOpponent(null);
          }}
        />
      </div>
    </section>
  );
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}
