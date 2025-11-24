import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  LinearProgress,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { IoBarChartOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { apiGetData } from '../../services/api';

type SeasonStatus = 'planejamento' | 'andamento' | 'finalizando' | 'concluido';

interface SeasonClass {
  nome: string;
  progresso: number;
  receita: number;
  alunos: number;
}

interface Season {
  ano: number;
  status: SeasonStatus;
  turmas: SeasonClass[];
}

const INITIAL_SEASONS: Season[] = [
  {
    ano: 2025,
    status: 'finalizando',
    turmas: [
      { nome: 'Administração', progresso: 95, receita: 450_000, alunos: 120 },
      { nome: 'Engenharia Civil', progresso: 90, receita: 380_000, alunos: 95 },
      { nome: 'Medicina', progresso: 88, receita: 520_000, alunos: 80 }
    ]
  },
  {
    ano: 2026,
    status: 'andamento',
    turmas: [
      { nome: 'Direito', progresso: 75, receita: 420_000, alunos: 110 },
      { nome: 'Psicologia', progresso: 68, receita: 290_000, alunos: 85 },
      { nome: 'Arquitetura', progresso: 72, receita: 350_000, alunos: 70 }
    ]
  },
  {
    ano: 2027,
    status: 'andamento',
    turmas: [
      { nome: 'Enfermagem', progresso: 45, receita: 280_000, alunos: 90 },
      { nome: 'Fisioterapia', progresso: 52, receita: 240_000, alunos: 65 },
      { nome: 'Nutrição', progresso: 38, receita: 200_000, alunos: 55 }
    ]
  },
  {
    ano: 2028,
    status: 'planejamento',
    turmas: [
      { nome: 'Veterinária', progresso: 25, receita: 180_000, alunos: 60 },
      { nome: 'Farmácia', progresso: 30, receita: 220_000, alunos: 70 },
      { nome: 'Odontologia', progresso: 20, receita: 300_000, alunos: 50 }
    ]
  },
  {
    ano: 2029,
    status: 'planejamento',
    turmas: [
      { nome: 'Educação Física', progresso: 15, receita: 150_000, alunos: 80 },
      { nome: 'Pedagogia', progresso: 10, receita: 120_000, alunos: 90 },
      { nome: 'Letras', progresso: 8, receita: 100_000, alunos: 45 }
    ]
  },
  {
    ano: 2030,
    status: 'planejamento',
    turmas: [
      { nome: 'Ciências Contábeis', progresso: 5, receita: 80_000, alunos: 75 },
      { nome: 'Marketing', progresso: 3, receita: 60_000, alunos: 65 },
      { nome: 'Recursos Humanos', progresso: 2, receita: 50_000, alunos: 55 }
    ]
  }
];

const STATUS_CONFIG: Record<SeasonStatus, { label: string; color: string; emoji: string }> = {
  planejamento: { label: 'Em Planejamento', color: '#2563EB', emoji: '📋' },
  andamento: { label: 'Em Andamento', color: '#F97316', emoji: '⏳' },
  finalizando: { label: 'Finalizando', color: '#7C3AED', emoji: '🎯' },
  concluido: { label: 'Concluído', color: '#16A34A', emoji: '✅' }
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);

const calcSeasonProgress = (season: Season) => {
  if (!season.turmas.length) return 0;
  const total = season.turmas.reduce((acc, turma) => acc + turma.progresso, 0);
  return Math.round(total / season.turmas.length);
};

const calcSeasonRevenue = (season: Season) =>
  season.turmas.reduce((acc, turma) => acc + turma.receita, 0);

const calcSeasonStudents = (season: Season) =>
  season.turmas.reduce((acc, turma) => acc + turma.alunos, 0);

const CardContainer = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 24px 50px rgba(15, 23, 42, 0.12)'
}));

const SummaryCard = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(3),
  boxShadow: '0 16px 35px rgba(15, 23, 42, 0.08)'
}));

interface SeasonCardProps {
  season: Season;
  onViewDetails: (season: Season) => void;
}

const SeasonCard = ({ season, onViewDetails }: SeasonCardProps) => {
  const statusInfo = STATUS_CONFIG[season.status];
  const progress = calcSeasonProgress(season);
  const revenue = calcSeasonRevenue(season);
  const students = calcSeasonStudents(season);

  const [turmas, setTurmas] = useState([]);

  const fetchTurmas = async () => {
    try {
      const response = await apiGetData("academic", `/turmas`);
      setTurmas(response.data);
    } catch (error) {
      toast.error("Erro ao buscar turmas");
    }
  };

  useEffect(() => {
    fetchTurmas();
  }, []);

  return (
    <CardContainer>
      <Box
        sx={{
          background: `linear-gradient(135deg, ${statusInfo.color} 0%, ${statusInfo.color}99 100%)`,
          color: 'white',
          px: 3,
          py: 2
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={0.5}>
            <Typography variant="h6" fontWeight={700}>
              Temporada {season.ano}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {statusInfo.label}
            </Typography>
          </Stack>
          <Typography variant="h4" component="span">
            {statusInfo.emoji}
          </Typography>
        </Stack>
      </Box>

      <Stack spacing={3} sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, backgroundColor: '#F5F7FF' }}>
              <Typography variant="caption" color="text.secondary">Turmas</Typography>
              <Typography variant="h5" fontWeight={700}>{season.turmas.length}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, backgroundColor: '#F5F7FF' }}>
              <Typography variant="caption" color="text.secondary">Alunos</Typography>
              <Typography variant="h5" fontWeight={700}>{students}</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" fontWeight={600}>Progresso Geral</Typography>
            <Typography variant="body2" fontWeight={600}>{progress}%</Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 10, borderRadius: 5, backgroundColor: '#E5E7EB' }}
            color="primary"
          />
        </Stack>

        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary">Receita Estimada</Typography>
          <Typography variant="h5" color="success.main" fontWeight={700}>{formatCurrency(revenue)}</Typography>
        </Stack>

        <Stack spacing={1}>
          {season.turmas.slice(0, 3).map((turma) => (
            <Paper
              key={turma.nome}
              variant="outlined"
              sx={{
                borderRadius: 2,
                px: 2,
                py: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography variant="body2" fontWeight={600}>{turma.nome}</Typography>
              <Chip label={`${turma.progresso}%`} size="small" />
            </Paper>
          ))}
          {season.turmas.length > 3 && (
            <Typography variant="body2" color="text.secondary" textAlign="center">
              +{season.turmas.length - 3} turmas adicionais
            </Typography>
          )}
        </Stack>

        <Button variant="contained" fullWidth onClick={() => onViewDetails(season)} sx={{ borderRadius: 2 }}>
          Ver Detalhes Completos
        </Button>
      </Stack>
    </CardContainer>
  );
};

interface SeasonDetailsDialogProps {
  season: Season | null;
  onClose: () => void;
}

const SeasonDetailsDialog = ({ season, onClose }: SeasonDetailsDialogProps) => {
  if (!season) return null;

  const statusInfo = STATUS_CONFIG[season.status];

  return (
    <Dialog open={Boolean(season)} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight={700}>
          Temporada {season.ano} — Detalhes
        </Typography>
        <Button onClick={onClose} startIcon={<CloseIcon />} color="inherit">
          Fechar
        </Button>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, borderRadius: 2, background: '#EEF2FF' }}>
              <Typography variant="caption" color="text.secondary">Status</Typography>
              <Typography variant="h6" fontWeight={700}>
                {statusInfo.emoji} {statusInfo.label}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, borderRadius: 2, background: '#F0FDF4' }}>
              <Typography variant="caption" color="text.secondary">Receita Total</Typography>
              <Typography variant="h6" fontWeight={700} color="success.main">
                {formatCurrency(calcSeasonRevenue(season))}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, borderRadius: 2, background: '#ECFEFF' }}>
              <Typography variant="caption" color="text.secondary">Alunos Envolvidos</Typography>
              <Typography variant="h6" fontWeight={700} color="primary">{calcSeasonStudents(season)} alunos</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Panorama das Turmas
        </Typography>

        <Grid container spacing={2}>
          {season.turmas.map((turma) => (
            <Grid item xs={12} md={6} key={turma.nome}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" fontWeight={700}>{turma.nome}</Typography>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Progresso</Typography>
                    <Typography variant="body2" fontWeight={600}>{turma.progresso}%</Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={turma.progresso} sx={{ height: 8, borderRadius: 4 }} />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Receita</Typography>
                    <Typography variant="body2" fontWeight={600}>{formatCurrency(turma.receita)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Alunos</Typography>
                    <Typography variant="body2" fontWeight={600}>{turma.alunos}</Typography>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

interface CreateSeasonDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (season: Season) => void;
}

const CreateSeasonDialog = ({ open, onClose, onCreate }: CreateSeasonDialogProps) => {
  const [year, setYear] = useState<number>(2031);
  const [status, setStatus] = useState<SeasonStatus>('planejamento');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newSeason: Season = {
      ano: year,
      status,
      turmas: []
    };
    onCreate(newSeason);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Nova Temporada</DialogTitle>
      <DialogContent>
        <DialogContentText mb={2}>
          Preencha os dados iniciais para criar uma nova temporada no painel.
        </DialogContentText>
        <Box component="form" display="flex" flexDirection="column" gap={2} onSubmit={handleSubmit}>
          <TextField
            label="Ano da Temporada"
            type="number"
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            fullWidth
            inputProps={{ min: 2024, max: 2040 }}
            required
          />
          <TextField
            select
            label="Status"
            value={status}
            onChange={(event) => setStatus(event.target.value as SeasonStatus)}
            fullWidth
          >
            {Object.entries(STATUS_CONFIG).map(([key, value]) => (
              <MenuItem key={key} value={key}>
                {value.label}
              </MenuItem>
            ))}
          </TextField>
          <DialogActions sx={{ px: 0 }}>
            <Button onClick={onClose} color="inherit">
              Cancelar
            </Button>
            <Button type="submit" variant="contained">
              Criar Temporada
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const PainelTemporadaPage = () => {
  const [seasons, setSeasons] = useState<Season[]>(INITIAL_SEASONS);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [seasonFilter, setSeasonFilter] = useState<'todas' | string>('todas');
  const [statusFilter, setStatusFilter] = useState<'todos' | SeasonStatus>('todos');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const filteredSeasons = useMemo(() =>
    seasons.filter((season) => {
      const matchesSeason = seasonFilter === 'todas' || season.ano.toString() === seasonFilter;
      const matchesStatus = statusFilter === 'todos' || season.status === statusFilter;
      return matchesSeason && matchesStatus;
    }), [seasonFilter, statusFilter, seasons]
  );

  const overview = useMemo(() => {
    const totalTemporadas = seasons.length;
    const totalTurmas = seasons.reduce((acc, season) => acc + season.turmas.length, 0);
    const totalReceita = seasons.reduce((acc, season) => acc + calcSeasonRevenue(season), 0);
    const totalEmAndamento = seasons.filter((season) => season.status === 'andamento').length;
    const mediaProgresso = Math.round(
      seasons.reduce((acc, season) => acc + calcSeasonProgress(season), 0) / (seasons.length || 1)
    );
    return { totalTemporadas, totalTurmas, totalReceita, totalEmAndamento, mediaProgresso };
  }, [seasons]);

  const handleCreateSeason = (season: Season) => {
    setSeasons((prev) => [...prev, season]);
  };

  return (
    <Box sx={{ px: 3, py: 4 }}>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={700} color="primary">
            Painel de Controle — Jornadas Universitárias
          </Typography>
          <Typography color="text.secondary">
            Monitoramento integrado das temporadas, turmas e indicadores financeiros.
          </Typography>
          <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'text.secondary' }}>
            <Link underline="hover" color="inherit">Home</Link>
            <Link underline="hover" color="inherit">Dashboards</Link>
            <Typography color="primary">Painel Temporadas</Typography>
          </Breadcrumbs>
        </Stack>

        <Paper
          sx={{
            p: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(34,197,94,0.06) 0%, rgba(59,130,246,0.06) 100%)',
            boxShadow: '0 30px 60px rgba(15, 23, 42, 0.12)'
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }}>
            <Stack spacing={0.5}>
              <Typography variant="subtitle1" color="text.secondary">Estatísticas Gerais</Typography>
              {/* <Typography variant="h3" fontWeight={700}>{overview.mediaProgresso}% de progresso médio</Typography> */}
              <Stack direction="row" spacing={1}>
                <Chip icon={<IoBarChartOutline size={16} />} label={`${overview.totalTemporadas} temporadas`} color="primary" />
                <Chip label={`${overview.totalTurmas} turmas`} variant="outlined" color="primary" />
              </Stack>
            </Stack>
            <Box flexGrow={1} />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateModalOpen(true)}
              sx={{ alignSelf: { xs: 'stretch', md: 'center' }, borderRadius: 3 }}
            >
              Nova Temporada
            </Button>
          </Stack>

          <Grid container spacing={2} mt={2}>
            {/* <Grid item xs={12} sm={6} md={3}>
              <SummaryCard sx={{ borderLeft: '5px solid #16A34A' }}>
                <Typography variant="caption" color="text.secondary">Progresso médio</Typography>
                <Typography variant="h4" color="#16A34A">{overview.mediaProgresso}%</Typography>
              </SummaryCard>
            </Grid> */}
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard sx={{ borderLeft: '5px solid #2563EB' }}>
                <Typography variant="caption" color="text.secondary">Total de turmas</Typography>
                <Typography variant="h4" color="#2563EB">{overview.totalTurmas}</Typography>
              </SummaryCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard sx={{ borderLeft: '5px solid #F97316' }}>
                <Typography variant="caption" color="text.secondary">Em andamento</Typography>
                <Typography variant="h4" color="#F97316">{overview.totalEmAndamento}</Typography>
              </SummaryCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard sx={{ borderLeft: '5px solid #DB2777' }}>
                <Typography variant="caption" color="text.secondary">Receita total</Typography>
                <Typography variant="h5" color="#DB2777">{formatCurrency(overview.totalReceita)}</Typography>
              </SummaryCard>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 18px 45px rgba(15, 23, 42, 0.10)' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
            <Stack spacing={0.5}>
              <Typography variant="h6">Filtros</Typography>
              <Typography variant="body2" color="text.secondary">
                Selecione temporada e status para ajustar os indicadores apresentados.
              </Typography>
            </Stack>
            <Box flexGrow={1} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label="Temporada"
                value={seasonFilter}
                size="small"
                onChange={(event) => setSeasonFilter(event.target.value)}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="todas">Todas as Temporadas</MenuItem>
                {seasons.map((season) => (
                  <MenuItem key={season.ano} value={season.ano.toString()}>
                    Temporada {season.ano}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Status"
                value={statusFilter}
                size="small"
                onChange={(event) => setStatusFilter(event.target.value as SeasonStatus | 'todos')}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="todos">Todos os Status</MenuItem>
                {Object.entries(STATUS_CONFIG).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value.label}
                  </MenuItem>
                ))}
              </TextField>
              <Button variant="outlined" sx={{ borderRadius: 3 }}>
                Exportar Relatório
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Grid container spacing={3}>
          {filteredSeasons.map((season) => (
            <Grid item xs={12} md={6} xl={4} key={season.ano}>
              <SeasonCard season={season} onViewDetails={setSelectedSeason} />
            </Grid>
          ))}
          {filteredSeasons.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Nenhuma temporada encontrada.
                </Typography>
                <Typography color="text.secondary">
                  Ajuste os filtros ou crie uma nova temporada para visualizar os dados.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Stack>

      <SeasonDetailsDialog season={selectedSeason} onClose={() => setSelectedSeason(null)} />
      <CreateSeasonDialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} onCreate={handleCreateSeason} />
    </Box>
  );
};

export default PainelTemporadaPage;
