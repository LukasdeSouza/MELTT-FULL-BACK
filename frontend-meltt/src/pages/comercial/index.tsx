import React, { useEffect, useMemo, useState } from 'react';
import { useComercialStore, TurmaComercial } from '../../stores/comercialStore';
import { Box, Button, CircularProgress, Paper, Typography, Grid, TextField } from '@mui/material';
import TurmaComercialList from './TurmaComercialList';
import TurmaComercialModal from './TurmaComercialModal';
import StatsModal from './StatsModal';
import { exportToCsv } from '../../utils/functions/export';

const pipelineStatus: TurmaComercial['status'][] = ['contato', 'reuniao', 'proposta', 'negociacao'];

export const statusLabels: Record<TurmaComercial['status'], string> = {
  contato: 'Em Contato',
  reuniao: 'Em Reunião',
  proposta: 'Proposta Enviada',
  negociacao: 'Em Negociação',
  fechada: 'Fechada',
  perdida: 'Perdida',
};

const ComercialPage = () => {
  const { turmas, stats, loading, loadingStats, fetchTurmas, addTurma, updateStatus, fetchStats } = useComercialStore();
  const [statusFilter, setStatusFilter] = useState<TurmaComercial['status'] | null>(null);
  const [selectedTurma, setSelectedTurma] = useState<TurmaComercial | null>(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  useEffect(() => {
    fetchTurmas();
  }, [fetchTurmas]);

  const pipelineCounts = useMemo(() => {
    const counts: Record<string, number> = {
      contato: 0,
      reuniao: 0,
      proposta: 0,
      negociacao: 0,
    };
    turmas.forEach(turma => {
      if (turma.status in counts) {
        counts[turma.status]++;
      }
    });
    return counts;
  }, [turmas]);

  const filteredTurmas = useMemo(() => {
    if (!statusFilter) {
      return turmas;
    }
    return turmas.filter(turma => turma.status === statusFilter);
  }, [turmas, statusFilter]);

  const handleAddTurma = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      turma_id: Number(formData.get('turma_id')),
      contatoPrincipal: formData.get('contatoPrincipal') as string,
      telefone: formData.get('telefone') as string,
      createdBy: 'user-id-placeholder', 
    };
    addTurma(data);
    event.currentTarget.reset();
  };

  const handleTurmaClick = (turma: TurmaComercial) => {
    setSelectedTurma(turma);
  };

  const handleCloseModal = () => {
    setSelectedTurma(null);
  };

  const handleUpdateStatus = async (id: string, status: string, acao: string) => {
    await updateStatus(id, status, acao);
    handleCloseModal();
  };

  const handleExport = () => {
    const dataToExport = statusFilter ? filteredTurmas : turmas;
    exportToCsv(`pipeline-comercial-${new Date().toLocaleDateString()}.csv`, dataToExport);
  };

  const handleOpenStatsModal = () => {
    fetchStats();
    setIsStatsModalOpen(true);
  };

  if (loading && turmas.length === 0) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography color='primary' variant="h5" fontFamily={'Poppins'} fontWeight={600} gutterBottom>
         CRM Comercial
      </Typography>

      {/* Pipeline Summary */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontFamily={'Poppins'}>Pipeline de Vendas</Typography>
          {statusFilter && (
            <Button onClick={() => setStatusFilter(null)}>Limpar Filtro</Button>
          )}
        </Box>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {pipelineStatus.map(status => (
            <Grid item xs={12} sm={6} md={3} key={status}>
              <Paper 
                elevation={statusFilter === status ? 8 : 3} 
                sx={{ p: 2, textAlign: 'center', cursor: 'pointer' }}
                onClick={() => setStatusFilter(status)}
              >
                <Typography variant="body1" fontFamily={'Poppins'}>{statusLabels[status]}</Typography>
                <Typography variant="h3" fontFamily={'Poppins'}>{pipelineCounts[status]}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Add Turma Form */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" color='primary' fontFamily={'Poppins'}>Nova Turma no Pipeline</Typography>
        <form onSubmit={handleAddTurma}>
          <Grid container spacing={2} sx={{ mt: 1, alignItems: 'center' }}>
            <Grid item xs={12} sm={3}>
              <TextField name="turma_id" label="ID da Turma" type="number" fullWidth required />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField name="contatoPrincipal" label="Contato Principal" fullWidth required />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField name="telefone" label="Telefone" fullWidth />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button type="submit" variant="contained" disabled={loading} fullWidth>
                {loading ? <CircularProgress size={24} /> : 'Adicionar'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Reports and Exporting */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" fontFamily={'Poppins'}>Relatórios e Exportação</Typography>
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={handleExport}>
            Exportar CSV
          </Button>
          <Button variant="outlined" onClick={handleOpenStatsModal}>
            Ver Estatísticas
          </Button>
        </Box>
      </Paper>

      {/* Turmas List */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom fontFamily={'Poppins'}>
          {statusFilter ? `Turmas em ${statusLabels[statusFilter]}` : 'Todas as Turmas no Pipeline'}
        </Typography>
        <TurmaComercialList turmas={filteredTurmas} onTurmaClick={handleTurmaClick} />
      </Paper>

      {/* Modals */}
      <TurmaComercialModal 
        turma={selectedTurma}
        onClose={handleCloseModal}
        onUpdateStatus={handleUpdateStatus}
      />
      <StatsModal 
        open={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        stats={stats}
        loading={loadingStats}
      />
    </Box>
  );
};

export default ComercialPage;