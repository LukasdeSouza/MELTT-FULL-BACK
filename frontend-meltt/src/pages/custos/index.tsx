

import React, { useEffect, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { Box, IconButton, Stack, Tooltip, Button, TextField, MenuItem, Card, Divider, Typography, Collapse } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CustomModal from '../../components/modal';
import { useNavigate } from 'react-router-dom';
import CustomCard from '../../components/card';
import { apiDeleteData, apiGetData, apiPostData } from '../../services/api';
import formatDateToDDMMYYYY from '../../utils/functions/formatDate';
import { Custos } from '../../types';
import toast from 'react-hot-toast';
import { BiCalculator } from 'react-icons/bi';
import { IoTrashOutline } from 'react-icons/io5';
import { getToken } from '../../utils/token';
import { jwtDecode } from 'jwt-decode';
import { CustomJwtPayload } from '../../components/customDrawer';
import formatCentavosToBRL from '../../utils/functions/formatCentavosToBRL';

const initialForm = {
  tipo_custo: '',
  turma_id: null,
  evento: '',
  fornecedor_id: '',
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
  { value: 'pago', label: 'Pago' },
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
  const [openModal, setOpenModal] = React.useState(false);
  const [form, setForm] = React.useState(initialForm);
  const [loading, setLoading] = React.useState(false);
  const [totalizadorExpanded, setTotalizadorExpanded] = React.useState(false);

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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    const valorNumero = parseFloat(form.valor.replace(/\./g, '').replace('R$', '').replace(',', '.'));
    const valorCentavos = Math.round(valorNumero * 100);
    const valorPagoParcialNumero = parseFloat(form.valor_pago_parcial.replace(/\./g, '').replace('R$', '').replace(',', '.'));
    const valorPagoParcialCentavos = Math.round(valorPagoParcialNumero * 100);
    console.log("Turma id: ", form.turma_id);
    const dataObj = {
      ...form,
      valor: valorCentavos,
      valor_pago_parcial: valorPagoParcialCentavos ?? 0,
    };
    console.log(dataObj);
    try {
      const response = await apiPostData('academic', '/custos', dataObj);
      if (response.affectedRows > 0) {
        toast.success('Informação salva com sucesso')
        await fetchAll();
      }
    } catch (error) {
      console.error('Error creating custo:', error);
    } finally {
      setLoading(false);
      setOpenModal(false);
      setForm(initialForm);
    }
  };

  const handleDelete = async (id: number) => {
    const response = await apiDeleteData('academic', `/custos/${id}`);
    if (response.message.includes('sucesso')) {
      toast.success('Registro excluído com sucesso')
    }
    await fetchAll();
  };

  const fetchTurmas = async () => {
    const response = await apiGetData('academic', '/turmas?all=true');
    setTurmas(response.data || []);
  };

  const fetchFornecedores = async () => {
    const response = await apiGetData('academic', '/fornecedores?all=true');
    setFornecedores(response.data || []);
  };

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

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#F6F7FB', p: { xs: 2, md: 6 }, pb: '140px' }}>
      <Stack width={'100%'} direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
        <Typography
          color='secondary'
          variant='h5'
          fontFamily={'Poppins'}
          fontWeight={600}
        >
          Centro de Custos
        </Typography>
        <Stack direction={'row'} alignItems={'center'} gap={2}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate('/fornecedores')}
            sx={{ mb: 2, borderRadius: 2 }}
          >
            Cadastrar Fornecedor
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleOpenModal}
            sx={{ mb: 2, borderRadius: 2 }}
          >
            Novo custo
          </Button>
        </Stack>
      </Stack>
      <Stack direction="row" spacing={4} sx={{ height: 'calc(65vh - 48px)' }}>
        <CustomCard
          title="Pré-Eventos"
          sxProps={{
            flex: 1,
            maxHeight: '500px',
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
          }}
          headerActionContent={
            <Tooltip title="Ver detalhes de custos de pré-eventos">
              <IconButton color="primary" onClick={() => navigate('/custos/pre-eventos')}>
                <InfoOutlinedIcon />
              </IconButton>
            </Tooltip>
          }
        >{custosPreEvento.map((custo: Custos) =>
          <Card
            key={custo.id_custo}
            sx={{
              m: 1,
              p: 2,
              boxShadow: 1,
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              minHeight: "60px",
              flexShrink: 0
            }}>
            <div className='flex flex-col'>
              <div className='flex flex-col'>
                <Stack direction={'column'} fontFamily={'Poppins'}>
                  <small className='text-sm text-secondary' style={{fontFamily:'Poppins'}}>Categoria, Vencimento e Valor</small>
                  <p className='font-medium' style={{fontFamily:'Poppins'}}>{custo.evento} - {formatDateToDDMMYYYY(custo.vencimento)}</p>
                </Stack>
                {custo.turma_nome && (
                  <Stack alignItems={'center'} direction={'row'} gap={1} fontFamily={'Poppins'}>
                    <small className='text-sm text-gray-500' style={{fontFamily:'Poppins'}}>Turma:</small>
                    <p className='text-sm' style={{fontFamily:'Poppins', fontWeight: 600}}>{custo.turma_nome}</p>
                  </Stack>
                )}
                <Stack alignItems={'center'} direction={'row'} gap={1} fontFamily={'Poppins'}>
                  <small className='text-sm text-gray-500' style={{fontFamily:'Poppins'}}>Valor:</small>
                  <p style={{fontFamily:'Poppins'}}>{custo.valor ? `R$ ${formatCentavosToBRL(custo.valor)}` : 'R$ 0,00'}</p>
                </Stack>
                {custo.chave_pix && (
                  <Stack alignItems={'center'} direction={'row'} gap={1} fontFamily={'Poppins'}>
                    <small className='text-sm text-gray-500' style={{fontFamily:'Poppins'}}>Chave Pix:</small>
                    <p className='text-sm' style={{fontFamily:'Poppins'}}>{custo.chave_pix}</p>
                  </Stack>
                )}
              </div>
            </div>
            <IoTrashOutline className='text-red-700' style={{ cursor: 'pointer' }} onClick={() => handleDelete(custo.id_custo)} />
          </Card>
        )}
        </CustomCard>
        <CustomCard
          title="Temporada"
          sxProps={{
            flex: 1,
            maxHeight: '500px',
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
          }}
          headerActionContent={
            <IconButton color="primary" onClick={() => navigate('/custos/temporada')}>
              <InfoOutlinedIcon />
            </IconButton>
          }
        >{custosTemporada.map((custo: Custos) =>
          <Card sx={{
            m: 1,
            p: 2,
            boxShadow: 1,
            borderRadius: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: "60px",
            flexShrink: 0
          }} key={custo.id_custo}>
            <div className='flex flex-col'>
              <div className='flex flex-col'>
                <small className='text-sm text-secondary' style={{fontFamily:'Poppins'}}>Categoria, Vencimento e Valor</small>
                <p className='font-medium' style={{fontFamily:'Poppins'}}>{custo.evento} - {formatDateToDDMMYYYY(custo.vencimento)}</p>
                {custo.turma_nome && (
                  <Stack alignItems={'center'} direction={'row'} gap={1} fontFamily={'Poppins'}>
                    <small className='text-sm text-gray-500' style={{fontFamily:'Poppins'}}>Turma:</small>
                    <p className='text-sm' style={{fontFamily:'Poppins', fontWeight: 600}}>{custo.turma_nome}</p>
                  </Stack>
                )}
                <Stack direction={'row'} alignItems={'center'} gap={1}>
                  <small className='text-sm text-gray-500' style={{fontFamily:'Poppins'}}>Valor:</small>
                  <p style={{fontFamily:'Poppins'}}>{custo.valor ? `R$ ${formatCentavosToBRL(custo.valor)}` : 'R$ 0,00'}</p>
                </Stack>
                {custo.chave_pix && (
                  <Stack alignItems={'center'} direction={'row'} gap={1}>
                    <small className='text-sm text-gray-500' style={{fontFamily:'Poppins'}}>Chave Pix:</small>
                    <p className='text-sm' style={{fontFamily:'Poppins'}}>{custo.chave_pix}</p>
                  </Stack>
                )}
              </div>
            </div>
            <IoTrashOutline className='text-red-700' style={{ cursor: 'pointer' }} onClick={() => handleDelete(custo.id_custo)} />
          </Card>
        )}
        </CustomCard>
        {decoded?.tipo !== 'GESTAO_PRODUCAO' && (
          <CustomCard
            title="Fixos"
            sxProps={{
              flex: 1,
              maxHeight: '500px',
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
            }}
            headerActionContent={
              <Tooltip title="Ver detalhes de custos fixos">
                <IconButton color="primary" onClick={() => navigate('/custos/fixos')}>
                  <InfoOutlinedIcon />
                </IconButton>
              </Tooltip>
            }
          >{custosFixo.map((custo: Custos) =>
            <Card sx={{
              m: 1,
              p: 2,
              boxShadow: 1,
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              minHeight: "60px",
              flexShrink: 0
            }} key={custo.id_custo}>
              <div className='flex flex-col'>
                <div className='flex flex-col'>
                  <small className='text-sm text-secondary' style={{fontFamily:'Poppins'}}>Categoria, Vencimento e Valor</small>
                  <p className='font-medium' style={{fontFamily:'Poppins'}}>{custo.evento} - {formatDateToDDMMYYYY(custo.vencimento)}</p>
                  {custo.turma_nome && (
                    <Stack alignItems={'center'} direction={'row'} gap={1} fontFamily={'Poppins'}>
                      <small className='text-sm text-gray-500' style={{fontFamily:'Poppins'}}>Turma:</small>
                      <p className='text-sm' style={{fontFamily:'Poppins', fontWeight: 600}}>{custo.turma_nome}</p>
                    </Stack>
                  )}
                  <Stack direction={'row'} alignItems={'center'} gap={1}>
                    <small className='text-sm text-gray-500' style={{fontFamily:'Poppins'}}>Valor:</small>
                    <p style={{fontFamily:'Poppins'}}>{custo.valor ? `R$ ${formatCentavosToBRL(custo.valor)}` : 'R$ 0,00'}</p>
                  </Stack>
                  {custo.chave_pix && (
                    <Stack alignItems={'center'} direction={'row'} gap={1}>
                      <small className='text-sm text-gray-500' style={{fontFamily:'Poppins'}}>Chave Pix:</small>
                      <p className='text-sm' style={{fontFamily:'Poppins'}}>{custo.chave_pix}</p>
                    </Stack>
                  )}
                </div>
              </div>
              <IoTrashOutline className='text-red-700' style={{ cursor: 'pointer' }} onClick={() => handleDelete(custo.id_custo)} />
            </Card>
          )}
          </CustomCard>
        )}
      </Stack>
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
          {/* <Stack direction={'column'} spacing={0.5} mb={2}>
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
          </Stack> */}

          {/* Temporada */}
          {/* <Stack direction={'column'} spacing={0.5} mb={2}>
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
          </Stack> */}

          {/* Fixos */}
          {/* {decoded?.tipo !== 'GESTAO_PRODUCAO' && (
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
          )} */}
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
            {form.situacao.includes('Parcialmente') && (
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