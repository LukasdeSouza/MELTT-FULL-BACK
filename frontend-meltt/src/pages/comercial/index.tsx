import React, { useEffect, useMemo, useState } from 'react';
import { useComercialStore, TurmaComercial } from '../../stores/comercialStore';
import { Box, Button, CircularProgress, Paper, Typography, Grid, TextField, MenuItem } from '@mui/material';
import TurmaComercialList from './TurmaComercialList';
import TurmaComercialModal from './TurmaComercialModal';
import StatsModal from './StatsModal';
import { exportToCsv } from '../../utils/functions/export';
import phoneMask from '../../utils/functions/phoneMask';
import usuarioStore from '../../stores/usuarioStore';
import { toJS } from 'mobx';

const pipelineStatus: TurmaComercial['status'][] = ['contato', 'reuniao', 'proposta', 'negociacao', 'fechada', 'perdida'];

export const statusLabels: Record<TurmaComercial['status'], string> = {
  contato: 'Em Contato',
  reuniao: 'Reunião Agendada',
  proposta: 'Proposta Enviada',
  negociacao: 'Em Negociação',
  fechada: 'Fechada',
  perdida: 'Perdida',
};

const ComercialPage = () => {
  const { turmas, loading, loadingStats, fetchTurmas, addTurma, updateStatus, fetchStats } = useComercialStore();
  const [statusFilter, setStatusFilter] = useState<TurmaComercial['status'] | null>(null);
  const [selectedTurma, setSelectedTurma] = useState<TurmaComercial | null>(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const { usuarioLogado } = usuarioStore;
  const [stats, setStats] = useState<{
    stats: Record<string, number>;
    conversionRates: Record<string, number>;
  } | null>(null);
  const [formData, setFormData] = useState({
    nomeTurma: '',
    instituicao: '',
    contatoPrincipal: '',
    telefone: '',
    statusInicial: 'Em Contato',
  });

  useEffect(() => {
    fetchStatus();
    fetchTurmas();
  }, []);

  const fetchStatus = async () => {
    const response = await fetchStats();
    setStats(response);
  };

  useEffect(() => {
    if (stats) {
      console.log("Stats atualizadas:", stats);
    }
  }, [stats]);

  const pipelineCounts = useMemo(() => {
    const data = stats?.stats;
    if (!data) {
      return {
        contato: 0,
        reuniao: 0,
        proposta: 0,
        negociacao: 0,
        fechada: 0,
        perdida: 0,
      };
    }
    return {
      contato: data.contato ?? 0,
      reuniao: data.reuniao ?? 0,
      proposta: data.proposta ?? 0,
      negociacao: data.negociacao ?? 0,
      fechada: data.fechada ?? 0,
      perdida: data.perdida ?? 0,
    };
  }, [stats]);

  const filteredTurmas = useMemo(() => {
    if (!statusFilter) {
      return turmas;
    }
    return turmas.filter(turma => turma.status === statusFilter);
  }, [turmas, statusFilter]);

  const handleTurmaClick = (turma: TurmaComercial) => {
    setSelectedTurma(turma);
  };

  const handleCloseModal = () => {
    setSelectedTurma(null);
  };

  const handleUpdateStatus = async (id: string, status: string, acao: string) => {
    const responsavel = toJS(usuarioLogado.id);
    await updateStatus(id, status, acao, responsavel);
    handleCloseModal();
    window.location.reload();
  };

  const handleExport = () => {
    const dataToExport = statusFilter ? filteredTurmas : turmas;
    exportToCsv(`pipeline-comercial-${new Date().toLocaleDateString()}.csv`, dataToExport);
  };

  const handleOpenStatsModal = () => {
    fetchStats();
    setIsStatsModalOpen(true);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePhone = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    const maskedValue = name === "telefone" ? phoneMask(value) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: maskedValue,
    }));
  };

  const handleAddTurma = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const statusMap = {
      'Em Contato': 'contato',
      'Reunião Agendada': 'reuniao',
      'Proposta Enviada': 'proposta',
      'Em Negociação': 'negociacao',
      'Fechada': 'fechada',
      'Perdida': 'perdida',
    };

    const statusApi = statusMap[formData.statusInicial];

    const data = {
      nome: formData.nomeTurma,
      instituicao: formData.instituicao,
      contatoPrincipal: formData.contatoPrincipal,
      telefone: formData.telefone,
      status: statusApi,
    };

    await addTurma(data);
    await fetchStats();
    window.location.reload();
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
                <Typography variant="h3" fontFamily={'Poppins'}>{pipelineCounts?.[status] ?? 0}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Add Turma Form */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 3 }}>
        <Typography
          variant="h6"
          color="primary"
          fontFamily="Poppins"
          sx={{ mb: 2 }}
        >
          Nova Turma no Pipeline
        </Typography>

        <form onSubmit={handleAddTurma}>
          <Grid container spacing={2}>
            {/* Nome e Instituição */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="nomeTurma"
                label="Nome da Turma"
                fullWidth
                required
                variant="outlined"
                value={formData.nomeTurma}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="instituicao"
                label="Instituição"
                fullWidth
                required
                variant="outlined"
                value={formData.instituicao}
                onChange={handleChange}
              />
            </Grid>

            {/* Restante dos campos */}
            <Grid item xs={12} sm={3.5}>
              <TextField
                select
                name="statusInicial"
                label="Status Inicial"
                fullWidth
                value={formData.statusInicial}
                onChange={handleChange}
              >
                <MenuItem value="Em Contato">Em Contato</MenuItem>
                <MenuItem value="Reunião Agendada">Reunião Agendada</MenuItem>
                <MenuItem value="Proposta Enviada">Proposta Enviada</MenuItem>
                <MenuItem value="Fechada">Fechada</MenuItem>
                <MenuItem value="Perdida">Perdida</MenuItem>
                <MenuItem value="Em Negociação">Em Negociação</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={5}>
              <TextField
                name="contatoPrincipal"
                label="Nome do Contato Principal"
                fullWidth
                required
                variant="outlined"
                value={formData.contatoPrincipal}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={3.5}>
              <TextField
                name="telefone"
                label="Telefone"
                fullWidth
                variant="outlined"
                value={formData.telefone}
                onChange={handleChangePhone}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Adicionar"}
          </Button>
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