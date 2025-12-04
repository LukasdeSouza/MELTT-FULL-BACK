
import React, { useEffect, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { Box, Button, TextField, MenuItem, Card, Divider, Typography, Stack, Grid, Collapse, IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { BiCalculator, BiSend } from 'react-icons/bi';
import { MdEventNote, MdCalendarMonth } from 'react-icons/md';
import { FaMoneyBillWave } from 'react-icons/fa';
import CustomModal from '../../components/modal';
import { useNavigate } from 'react-router-dom';
import { apiGetData, apiPostData } from '../../services/api';
import toast from 'react-hot-toast';
import { getToken } from '../../utils/token';
import { jwtDecode } from 'jwt-decode';
import { CustomJwtPayload } from '../../components/customDrawer';

type CostForm = {
  tipo_custo: string;
  turma_id: number | null;
  evento: string;
  fornecedor_id: number | null;
  beneficiario: string;
  chave_pix: string | null;
  categoria: string;
  valor: string;
  valor_pago_parcial: string;
  vencimento: string;
  situacao: string;
};

const initialForm: CostForm = {
  tipo_custo: '',
  turma_id: null,
  evento: '',
  fornecedor_id: null,
  beneficiario: '',
  chave_pix: null,
  categoria: '',
  valor: '',
  valor_pago_parcial: '',
  vencimento: '',
  situacao: '',
};

const tiposCusto = [
  { value: 'Pre-evento', label: 'Pré-Eventos' },
  { value: 'Temporada', label: 'Temporada' },
  { value: 'Fixo', label: 'Fixos' },
];

const situacoes = [
  { value: 'Pendente', label: 'Pendente' },
  { value: 'Pago', label: 'Pago' },
  { value: 'Parcialmente Pago', label: 'Pago Parcial' },
  { value: 'Vencido', label: 'Vencido' },
];

// const categorias = [
//   { value: 'aluguel', label: 'Aluguel' },
//   { value: 'energia', label: 'Energia' },
//   { value: 'alimentação', label: 'Alimentação' },
//   { value: 'agua', label: 'Água' },
//   { value: 'equipamentos_midia', label: 'Equipamentos de Mídia' },
//   { value: 'equipe', label: 'Equipe/Time Interno' },
//   { value: 'decoracao', label: 'Decoração & Ambiente' },
//   { value: 'buffet', label: 'Buffet/Garçons' },
//   { value: 'som', label: 'Som/Banda/DJ' },
//   { value: 'bebida', label: 'Bebidas' },
//   { value: 'limpeza', label: 'Limpeza e Manutenção' },
//   { value: 'lembrancinha', label: 'Lembrancinhas' },
// ];

const CustosPage = () => {
  const token = getToken();
  const decoded = token ? jwtDecode<CustomJwtPayload>(token) : null;

  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState<CostForm>(initialForm);
  const [loading, setLoading] = useState(false);

  const [turmas, setTurmas] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  const [custosPreEvento, setCustosPreEvento] = useState([]);
  const [custosTemporada, setCustosTemporada] = useState([]);
  const [custosFixo, setCustosFixo] = useState([]);
  const [totais, setTotais] = useState<any>({
    geral: 'R$ 0,00',
    detalhamentoGeral: {
      pago: { formatado: 'R$ 0,00' },
      pendente: { formatado: 'R$ 0,00' },
      parcial: { formatado: 'R$ 0,00' },
      vencido: { formatado: 'R$ 0,00' }
    },
    totaisPorTipo: {
      fixo: {
        total: { formatado: 'R$ 0,00' },
        pago: { formatado: 'R$ 0,00' },
        pendente: { formatado: 'R$ 0,00' },
        parcial: { formatado: 'R$ 0,00' },
        vencido: { formatado: 'R$ 0,00' }
      },
      preEvento: {
        total: { formatado: 'R$ 0,00' },
        pago: { formatado: 'R$ 0,00' },
        pendente: { formatado: 'R$ 0,00' },
        parcial: { formatado: 'R$ 0,00' },
        vencido: { formatado: 'R$ 0,00' }
      },
      temporada: {
        total: { formatado: 'R$ 0,00' },
        pago: { formatado: 'R$ 0,00' },
        pendente: { formatado: 'R$ 0,00' },
        parcial: { formatado: 'R$ 0,00' },
        vencido: { formatado: 'R$ 0,00' }
      }
    }
  });


  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setForm(initialForm);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => {
      if (name === 'turma_id') {
        return { ...prev, turma_id: value ? Number(value) : null };
      }

      if (name === 'fornecedor_id') {
        return { ...prev, fornecedor_id: value ? Number(value) : null };
      }

      if (name === 'tipo_custo' && value === 'Fixo') {
        return { ...prev, tipo_custo: value, turma_id: null };
      }

      if (name === 'situacao') {
        return {
          ...prev,
          situacao: value,
          valor_pago_parcial: value === 'Parcialmente Pago' ? prev.valor_pago_parcial : '',
        };
      }

      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async () => {
    console.log(form.situacao);
    
    setLoading(true);
    const normalizeCurrencyField = (input: string) => {
      if (!input) return 0;

      const numeric = input
        .replace(/\s/g, '')
        .replace(/\./g, '')
        .replace('R$', '')
        .replace(',', '.');

      const parsed = Number(numeric);
      return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
    };

    const valorCentavos = normalizeCurrencyField(form.valor);
    const allowedSituacoes = ['Pendente', 'Pago', 'Parcialmente Pago', 'Vencido'];
    const situacao = allowedSituacoes.includes(form.situacao) ? form.situacao : 'Pendente';
    const valorPagoParcialCentavos =
      situacao === 'Parcialmente Pago' ? normalizeCurrencyField(form.valor_pago_parcial) : 0;

    const dataObj = {
      ...form,
      situacao,
      valor_pago_parcial: valorPagoParcialCentavos,
      valor_pago_total: situacao === 'Pago' ? valorCentavos : 0,
      turma_id: form.tipo_custo === 'Fixo' ? null : form.turma_id,
      fornecedor_id: form.fornecedor_id,
      valor: valorCentavos,
    };

    if (form.tipo_custo !== 'Fixo' && !dataObj.turma_id) {
      toast.error('Selecione uma turma antes de salvar o custo.');
      setLoading(false);
      return;
    }

    try {
      const response = await apiPostData('academic', '/custos', dataObj);
      if (response.affectedRows > 0) {
        toast.success('Custo cadastrado com sucesso!');
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error creating custo:', error);
      toast.error('Erro ao cadastrar custo');
    } finally {
      setLoading(false);
    }
  };

  const fetchTurmas = async () => {
    const response = await apiGetData('academic', '/turmas?all=true');
    setTurmas(response.data || []);
  };

  const fetchFornecedores = async () => {
    const response = await apiGetData('academic', '/fornecedores?all=true');
    setFornecedores(response.data || []);
  };

  React.useEffect(() => {
    fetchTurmas();
    fetchFornecedores();
  }, []);

  const fetchCustosPreEvento = async () => {
    const response = await apiGetData('academic', '/custos?tipo_custo=Pre-evento');
    setCustosPreEvento(response.data || []);
  };

  const fetchCustosTemporada = async () => {
    const response = await apiGetData('academic', '/custos?tipo_custo=Temporada');
    setCustosTemporada(response.data || []);
  };

  const fetchCustosFixo = async () => {
    const response = await apiGetData('academic', '/custos?tipo_custo=Fixo');
    setCustosFixo(response.data || []);
  };

  const fetchValorTotal = async () => {
    const response = await apiGetData('academic', '/custos/valor-total');

    setTotais({
      geral: response.totalGeral || 'R$ 0,00',
      detalhamentoGeral: response.detalhamentoGeral || {
        pago: { formatado: 'R$ 0,00' },
        pendente: { formatado: 'R$ 0,00' },
        parcial: { formatado: 'R$ 0,00' },
        vencido: { formatado: 'R$ 0,00' }
      },
      totaisPorTipo: response.totaisPorTipo || {
        fixo: {
          total: { formatado: 'R$ 0,00' },
          pago: { formatado: 'R$ 0,00' },
          pendente: { formatado: 'R$ 0,00' },
          parcial: { formatado: 'R$ 0,00' },
          vencido: { formatado: 'R$ 0,00' }
        },
        preEvento: {
          total: { formatado: 'R$ 0,00' },
          pago: { formatado: 'R$ 0,00' },
          pendente: { formatado: 'R$ 0,00' },
          parcial: { formatado: 'R$ 0,00' },
          vencido: { formatado: 'R$ 0,00' }
        },
        temporada: {
          total: { formatado: 'R$ 0,00' },
          pago: { formatado: 'R$ 0,00' },
          pendente: { formatado: 'R$ 0,00' },
          parcial: { formatado: 'R$ 0,00' },
          vencido: { formatado: 'R$ 0,00' }
        }
      }
    });
  };

  const fetchAll = async () => {
    await Promise.all([
      fetchTurmas(),
      fetchFornecedores(),
      fetchCustosPreEvento(),
      fetchCustosTemporada(),
      fetchCustosFixo(),
      fetchValorTotal()
    ]);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const custosPages = [
    {
      nome: 'Pré-Eventos',
      descricao: 'Gerencie custos relacionados a pré-eventos',
      icon: MdEventNote,
      link: '/custos/pre-eventos'
    },
    {
      nome: 'Temporada',
      descricao: 'Gerencie custos da temporada',
      icon: MdCalendarMonth,
      link: '/custos/temporada'
    },
    ...(decoded?.tipo !== 'GESTAO_PRODUCAO' ? [{
      nome: 'Custos Fixos',
      descricao: 'Gerencie custos fixos da organização',
      icon: FaMoneyBillWave,
      link: '/custos/fixos'
    }] : [])
  ];
  const [totalizadorExpanded, setTotalizadorExpanded] = useState<boolean>(false); return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#F6F7FB', p: { xs: 2, md: 2 } }}>
      <Stack width={'100%'} direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={2}>
        <Typography
          color='secondary'
          variant='h4'
          fontFamily={'Poppins'}
          fontWeight={700}
        >
          Centro de Custos
        </Typography>
        <Stack direction={'row'} alignItems={'center'} gap={2}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate('/fornecedores')}
            sx={{ borderRadius: 2 }}
          >
            Cadastrar Fornecedor
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleOpenModal}
            sx={{ borderRadius: 2 }}
          >
            Novo Custo
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3} justifyContent="center">
        {custosPages.map((pagina, index) => {
          const IconComponent = pagina.icon;
          return (
            <Grid key={index} item xs={12} sm={6} md={4} lg={3}>
              <Card
                sx={{
                  height: '75vh',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f7ff 100%)',
                  borderRadius: 4,
                  boxShadow: '0px 8px 24px rgba(45, 28, 99, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0px 12px 32px rgba(45, 28, 99, 0.2)',
                    '& .card-icon': {
                      transform: 'scale(1.1)',
                      filter: 'drop-shadow(0 4px 8px rgba(45, 28, 99, 0.15))'
                    }
                  }
                }}
              >
                <Stack
                  spacing={3}
                  justifyContent={'center'}
                  alignItems="center"
                  p={4}
                  sx={{ height: '100%' }}
                >
                  {/* Ícone decorativo */}
                  <Box
                    className="card-icon"
                    sx={{
                      width: 80,
                      height: 80,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'primary.light',
                      borderRadius: '50%',
                      transition: 'all 0.3s ease',
                      mb: 2
                    }}
                  >
                    <IconComponent size={32} color="#2D1C63" />
                  </Box>

                  {/* Conteúdo textual */}
                  <Stack textAlign="center" spacing={1}>
                    <Typography
                      variant="h5"
                      fontWeight={800}
                      fontFamily="Poppins"
                      sx={{
                        background: 'linear-gradient(45deg, #2D1C63 30%, #4A3C8B 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    >
                      {pagina.nome}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.6,
                        minHeight: 60,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {pagina.descricao}
                    </Typography>
                  </Stack>

                  {/* Botão de ação */}
                  <Button
                    variant="contained"
                    endIcon={<BiSend style={{ marginLeft: 8 }} />}
                    onClick={() => navigate(pagina.link)}
                    sx={{
                      mt: 'auto',
                      width: '100%',
                      maxWidth: 200,
                      borderRadius: 2,
                      py: 1.5,
                      background: 'linear-gradient(45deg, #2D1C63 30%, #4A3C8B 90%)',
                      '&:hover': {
                        opacity: 0.9,
                        transform: 'scale(1.02)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Acessar
                  </Button>
                </Stack>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Totalizador fixo na parte inferior */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          zIndex: 1000,
          p: 2,
          maxWidth: 500,
          width: '100%',
        }}
      >
        <Card
          sx={{
            p: 2,
            backgroundColor: "#fff",
            borderRadius: "12px 12px 0 0",
            boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
            border: "1px solid #e0e0e0",
            maxHeight: '80vh',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#c1c1c1',
              borderRadius: '4px',
            }
          }}>
          <Stack
            direction={'row'}
            gap={1}
            alignItems={'center'}
            mb={1}
            justifyContent={'space-between'}
            sx={{ cursor: 'pointer' }}
            onClick={() => setTotalizadorExpanded(!totalizadorExpanded)}
          >
            <Stack direction={'row'} gap={1} alignItems={'center'}>
              <BiCalculator className='text-secondary' />
              <Typography variant='body1' color='secondary' fontWeight={600} fontFamily={'Poppins'}>
                Totalizador de Custos
              </Typography>
            </Stack>
            <IconButton size="small">
              {totalizadorExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Stack>
          <Divider sx={{ mb: 1.5 }} />

          {/* Total Geral - Sempre visível */}
          <Stack direction={'column'} spacing={1} mb={2}>
            <Typography variant='subtitle2' color='primary' fontWeight={700} fontFamily={'Poppins'}>
              TOTAL GERAL: {totais.geral}
            </Typography>
            <Collapse in={totalizadorExpanded}>
              <Stack direction={'column'} spacing={0.5} pl={2}>
                <Stack direction={'row'} justifyContent={'space-between'}>
                  <Typography variant='caption' fontFamily={'Poppins'} sx={{ color: '#4caf50' }}>
                    Pago:
                  </Typography>
                  <Typography variant='caption' fontFamily={'Poppins'} fontWeight={600} sx={{ color: '#4caf50' }}>
                    {totais.detalhamentoGeral?.pago?.formatado || 'R$ 0,00'}
                  </Typography>
                </Stack>
                <Stack direction={'row'} justifyContent={'space-between'}>
                  <Typography variant='caption' fontFamily={'Poppins'} sx={{ color: '#ff9800' }}>
                    Pendente:
                  </Typography>
                  <Typography variant='caption' fontFamily={'Poppins'} fontWeight={600} sx={{ color: '#ff9800' }}>
                    {totais.detalhamentoGeral?.pendente?.formatado || 'R$ 0,00'}
                  </Typography>
                </Stack>
                <Stack direction={'row'} justifyContent={'space-between'}>
                  <Typography variant='caption' fontFamily={'Poppins'} sx={{ color: '#2196f3' }}>
                    Parcial:
                  </Typography>
                  <Typography variant='caption' fontFamily={'Poppins'} fontWeight={600} sx={{ color: '#2196f3' }}>
                    {totais.detalhamentoGeral?.parcial?.formatado || 'R$ 0,00'}
                  </Typography>
                </Stack>
                <Stack direction={'row'} justifyContent={'space-between'}>
                  <Typography variant='caption' fontFamily={'Poppins'} sx={{ color: '#f44336' }}>
                    Vencido:
                  </Typography>
                  <Typography variant='caption' fontFamily={'Poppins'} fontWeight={600} sx={{ color: '#f44336' }}>
                    {totais.detalhamentoGeral?.vencido?.formatado || 'R$ 0,00'}
                  </Typography>
                </Stack>
              </Stack>
            </Collapse>
          </Stack>

          <Collapse in={totalizadorExpanded}>
            <Divider sx={{ mb: 1.5 }} />

            {/* Pré-Eventos */}
            <Stack direction={'column'} spacing={0.5} mb={2}>
              <Typography variant='body2' fontWeight={600} fontFamily={'Poppins'}>
                Pré-Eventos: {totais.totaisPorTipo?.preEvento?.total?.formatado || 'R$ 0,00'}
              </Typography>
              <Stack direction={'column'} spacing={0.3} pl={2}>
                <Stack direction={'row'} justifyContent={'space-between'}>
                  <Typography variant='caption' fontFamily={'Poppins'} fontSize={'0.7rem'}>Pago:</Typography>
                  <Typography variant='caption' fontFamily={'Poppins'} fontSize={'0.7rem'} sx={{ color: '#4caf50' }}>
                    {totais.totaisPorTipo?.preEvento?.pago?.formatado || 'R$ 0,00'}
                  </Typography>
                </Stack>
                <Stack direction={'row'} justifyContent={'space-between'}>
                  <Typography variant='caption' fontFamily={'Poppins'} fontSize={'0.7rem'}>Pendente:</Typography>
                  <Typography variant='caption' fontFamily={'Poppins'} fontSize={'0.7rem'} sx={{ color: '#ff9800' }}>
                    {totais.totaisPorTipo?.preEvento?.pendente?.formatado || 'R$ 0,00'}
                  </Typography>
                </Stack>
                <Stack direction={'row'} justifyContent={'space-between'}>
                  <Typography variant='caption' fontFamily={'Poppins'} fontSize={'0.7rem'}>Parcial:</Typography>
                  <Typography variant='caption' fontFamily={'Poppins'} fontSize={'0.7rem'} sx={{ color: '#2196f3' }}>
                    {totais.totaisPorTipo?.preEvento?.parcial?.formatado || 'R$ 0,00'}
                  </Typography>
                </Stack>
                <Stack direction={'row'} justifyContent={'space-between'}>
                  <Typography variant='caption' fontFamily={'Poppins'} fontSize={'0.7rem'}>Vencido:</Typography>
                  <Typography variant='caption' fontFamily={'Poppins'} fontSize={'0.7rem'} sx={{ color: '#f44336' }}>
                    {totais.totaisPorTipo?.preEvento?.vencido?.formatado || 'R$ 0,00'}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>

            {/* Temporada */}
            <Stack direction={'column'} spacing={0.5} mb={2}>
              <Typography variant='body2' fontWeight={600} fontFamily={'Poppins'}>
                Temporada: {totais.totaisPorTipo?.temporada?.total?.formatado || 'R$ 0,00'}
              </Typography>
              <Stack direction={'column'} spacing={0.3} pl={2}>
                <Stack direction={'row'} justifyContent={'space-between'}>
                  <Typography variant='caption' fontFamily={'Poppins'} fontSize={'0.7rem'}>Pago:</Typography>
                  <Typography variant='caption' fontFamily={'Poppins'} fontSize={'0.7rem'} sx={{ color: '#4caf50' }}>
                    {totais.totaisPorTipo?.temporada?.pago?.formatado || 'R$ 0,00'}
                  </Typography>
                </Stack>
                <Stack direction={'row'} justifyContent={'space-between'}>
                  <Typography variant='caption' fontFamily={'Poppins'} fontSize={'0.7rem'}>Pendente:</Typography>
                  <Typography variant='caption' fontFamily={'Poppins'} fontSize={'0.7rem'} sx={{ color: '#ff9800' }}>
                    {totais.totaisPorTipo?.temporada?.pendente?.formatado || 'R$ 0,00'}
                  </Typography>
                </Stack>
                <Stack direction={'row'} justifyContent={'space-between'}>
                  <Typography variant='caption' fontFamily={'Poppins'} fontSize={'0.7rem'}>Parcial:</Typography>
                  <Typography variant='caption' fontFamily={'Poppins'} fontSize={'0.7rem'} sx={{ color: '#2196f3' }}>
                    {totais.totaisPorTipo?.temporada?.parcial?.formatado || 'R$ 0,00'}
                  </Typography>
                </Stack>
                <Stack direction={'row'} justifyContent={'space-between'}>
                  <Typography variant='caption' fontFamily={'Poppins'} fontSize={'0.7rem'}>Vencido:</Typography>
                  <Typography variant='caption' fontFamily={'Poppins'} fontSize={'0.7rem'} sx={{ color: '#f44336' }}>
                    {totais.totaisPorTipo?.temporada?.vencido?.formatado || 'R$ 0,00'}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>

            {/* Fixos */}
            {decoded?.tipo !== 'GESTAO_PRODUCAO' && (
              <Stack direction={'column'} spacing={0.5}>
                <Typography variant='body2' fontWeight={600} fontFamily={'Poppins'}>
                  Fixos: {totais.totaisPorTipo?.fixo?.total?.formatado || 'R$ 0,00'}
                </Typography>
                <Stack direction={'column'} spacing={0.3} pl={2}>
                  <Stack direction={'row'} justifyContent={'space-between'}>
                    <Typography variant='caption' fontFamily={'Poppins'} fontSize={'0.7rem'}>Pago:</Typography>
                    <Typography variant='caption' fontFamily={'Poppins'} fontSize={'0.7rem'} sx={{ color: '#4caf50' }}>
                      {totais.totaisPorTipo?.fixo?.pago?.formatado || 'R$ 0,00'}
                    </Typography>
                  </Stack>
                  <Stack direction={'row'} justifyContent={'space-between'}>
                    <Typography variant='caption' fontFamily={'Poppins'} fontSize={'0.7rem'}>Pendente:</Typography>
                    <Typography variant='caption' fontFamily={'Poppins'} fontSize={'0.7rem'} sx={{ color: '#ff9800' }}>
                      {totais.totaisPorTipo?.fixo?.pendente?.formatado || 'R$ 0,00'}
                    </Typography>
                  </Stack>
                  <Stack direction={'row'} justifyContent={'space-between'}>
                    <Typography variant='caption' fontFamily={'Poppins'} fontSize={'0.7rem'}>Parcial:</Typography>
                    <Typography variant='caption' fontFamily={'Poppins'} fontSize={'0.7rem'} sx={{ color: '#2196f3' }}>
                      {totais.totaisPorTipo?.fixo?.parcial?.formatado || 'R$ 0,00'}
                    </Typography>
                  </Stack>
                  <Stack direction={'row'} justifyContent={'space-between'}>
                    <Typography variant='caption' fontFamily={'Poppins'} fontSize={'0.7rem'}>Vencido:</Typography>
                    <Typography variant='caption' fontFamily={'Poppins'} fontSize={'0.7rem'} sx={{ color: '#f44336' }}>
                      {totais.totaisPorTipo?.fixo?.vencido?.formatado || 'R$ 0,00'}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            )}
          </Collapse>
        </Card>
      </Box>

      <CustomModal
        title="Novo custo"
        openModal={openModal}
        handleCloseModal={handleCloseModal}
        loadingSave={loading}
        onSubmit={handleSubmit}
      >
        <Stack spacing={2}>
          <TextField
            select
            label="Tipo de custo"
            name="tipo_custo"
            value={form.tipo_custo}
            onChange={handleChange}
            size='small'
            fullWidth
          >
            {tiposCusto.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
          <Divider>informações sobre o custo</Divider>
          <Stack
            spacing={2}
            direction={'column'}
            sx={{
              maxHeight: 300,
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#c1c1c1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#a8a8a8',
              },
            }}
          >
            {form.tipo_custo !== 'Fixo' && (
              <TextField
                select
                label="Turma"
                name="turma_id"
                value={form.turma_id}
                onChange={handleChange}
                size='small'
                fullWidth
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      style: {
                        maxHeight: 200
                      },
                    },
                  },
                }}
              >
                {turmas.map((turma: any) => (
                  <MenuItem key={turma.id} value={turma.id}>{turma.nome}</MenuItem>
                ))}
              </TextField>
            )}
            <TextField
              label="Nome do Evento/Custo"
              name="evento"
              placeholder='nome do evento/custo'
              value={form.evento}
              onChange={handleChange}
              size='small'
              fullWidth
            />
            <TextField
              select
              label="Fornecedor"
              name="fornecedor_id"
              placeholder='selecione um fornecedor'
              value={form.fornecedor_id}
              onChange={handleChange}
              size='small'
              fullWidth
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    style: {
                      maxHeight: 200
                    },
                  },
                },
              }}
            >
              {fornecedores.map((fornecedor: any) => (
                <MenuItem key={fornecedor.id} value={fornecedor.id}>{fornecedor.nome}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Beneficiário"
              name="beneficiario"
              placeholder='nome do beneficiário do custo'
              value={form.beneficiario}
              onChange={handleChange}
              size='small'
              fullWidth
            />
            <TextField
              label="Chave Pix"
              name="chave_pix"
              placeholder='chave pix do beneficiário '
              value={form.chave_pix}
              onChange={handleChange}
              size='small'
              fullWidth
            />
            <TextField
              // select
              label="Categoria"
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              size='small'
              fullWidth
            // SelectProps={{
            //   MenuProps: {
            //     PaperProps: {
            //       style: {
            //         maxHeight: 200
            //       },
            //     },
            //   },
            // }}
            />
            {/* {categorias.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))} */}
            {/* </TextField> */}
          </Stack>
          <Divider>informações sobre pagamento</Divider>
          <Stack
            spacing={2}
            direction={'column'}
            sx={{
              maxHeight: 300,
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#c1c1c1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#a8a8a8',
              },
            }}
          >
            <TextField
              select
              label="Situação"
              name="situacao"
              value={form.situacao}
              onChange={handleChange}
              size='small'
              fullWidth
            >
              {situacoes.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>
            <NumericFormat
              value={form.valor}
              allowLeadingZeros
              thousandSeparator="."
              allowNegative={false}
              decimalSeparator=","
              decimalScale={2}
              fixedDecimalScale
              prefix="R$"
              customInput={TextField}
              label="Valor"
              name="valor"
              onValueChange={(values: any) => {
                const { formattedValue } = values;
                setForm({ ...form, valor: formattedValue });
              }}
              size='small'
              fullWidth
            />
            {form.situacao === 'Parcialmente Pago' && (
              <NumericFormat
                value={form.valor_pago_parcial}
                allowLeadingZeros
                thousandSeparator="."
                allowNegative={false}
                decimalSeparator=","
                decimalScale={2}
                fixedDecimalScale
                prefix="R$"
                customInput={TextField}
                label="Valor Pago Parcial"
                name="valor_pago_parcial"
                onValueChange={(values: any) => {
                  const { formattedValue } = values;
                  setForm({ ...form, valor_pago_parcial: formattedValue });
                }}
                size='small'
                fullWidth
              />
            )}
            <TextField
              label="Vencimento"
              name="vencimento"
              value={form.vencimento}
              onChange={handleChange}
              type="date"
              InputLabelProps={{ shrink: true }}
              size='small'
              fullWidth
            />
          </Stack>
          {/* <TextField
            select
            label="Situação"
            name="situacao"
            value={form.situacao}
            onChange={handleChange}
            fullWidth
          >
            {situacoes.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField> */}
        </Stack>
      </CustomModal>
    </Box>
  );
};

export default CustosPage;
