

import React, { useEffect, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { Box, IconButton, Stack, Tooltip, Button, TextField, MenuItem, Card } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CustomModal from '../../components/modal';
import { useNavigate } from 'react-router-dom';
import CustomCard from '../../components/card';
import { apiDeleteData, apiGetData, apiPostData } from '../../services/api';
import { IoMdTrash } from 'react-icons/io';
import formatDateToDDMMYYYY from '../../utils/functions/formatDate';
import { BsTrash2 } from 'react-icons/bs';
import { FaTrash } from 'react-icons/fa6';

const initialForm = {
  tipo_custo: '',
  turma_id: '',
  evento: '',
  fornecedor_id: '',
  beneficiario: '',
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

const categorias = [
  { value: 'aluguel', label: 'Aluguel' },
  { value: 'energia', label: 'Energia' },
  { value: 'alimentação', label: 'Alimentação' },
  { value: 'agua', label: 'Água' },
  { value: 'equipamentos_midia', label: 'Equipamentos de Mídia' },
  { value: 'equipe', label: 'Equipe' },
  { value: 'decoracao', label: 'Decoração' },
  { value: 'buffet', label: 'Buffet' },
];

const CustosPage = () => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = React.useState(false);
  const [form, setForm] = React.useState(initialForm);
  const [loading, setLoading] = React.useState(false);

  const [turmas, setTurmas] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [custosPreEvento, setCustosPreEvento] = useState([]);
  const [custosTemporada, setCustosTemporada] = useState([]);
  const [custosFixo, setCustosFixo] = useState([]);
  const [valorTotal, setValorTotal] = useState(0);

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
    const dataObj = {
      ...form,
      valor: valorCentavos,
      valor_pago_parcial: valorPagoParcialCentavos,
    };
    try {
      const response = await apiPostData('academic', '/custos', dataObj);
      console.log(response.status, "response.status");
      await fetchAll();
    } catch (error) {
      console.error('Error creating custo:', error);
    } finally {
      setLoading(false);
      setOpenModal(false);
      setForm(initialForm);
    }
  };

  const handleDelete = async (id: number) => {
    await apiDeleteData('academic', `/custos/${id}`);
    await fetchAll();
  };

  const fetchTurmas = async () => {
    const response = await apiGetData('academic', '/turmas');
    setTurmas(response.data || []);
  };

  const fetchFornecedores = async () => {
    const response = await apiGetData('academic', '/fornecedores');
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
    setValorTotal(response.total || 0);
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
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#F6F7FB', p: { xs: 2, md: 6 } }}>
      <Stack direction="row" justifyContent="flex-end" >
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleOpenModal}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          Criar novo custo
        </Button>
      </Stack>
      <Stack direction="row" spacing={4} sx={{ height: 'calc(65vh - 48px)' }}>
        <CustomCard
          title="Pré-Eventos"
          sxProps={{ flex: 1, height: '100%' }}
          headerActionContent={
            <Tooltip title="Ver detalhes de custos de pré-eventos">
              <IconButton color="primary" onClick={() => navigate('/custos/pre-eventos')}>
                <InfoOutlinedIcon />
              </IconButton>
            </Tooltip>
          }
        >{custosPreEvento.map((custo) =>
          <Card sx={{ m: 1, p: 1, borderRadius: "12px", bgcolor: "", display: "flex", justifyContent: "space-between", alignItems: "center" }} key={custo.id_custo}>
            <div className='flex flex-col'>
              <div className='flex flex-col'>
                <p className='text-sm text-gray-500'>Evento e data</p>
                <p className='font-medium'>{custo.evento} - {formatDateToDDMMYYYY(custo.vencimento)}</p>
                <p className='text-sm text-gray-500'>Valor</p>
                <p>{custo.valor ? `R$ ${parseFloat(custo.valor / 100).toFixed(2)}` : 'R$ 0,00'}</p>
              </div>
            </div>
            <FaTrash style={{ cursor: 'pointer' }} onClick={(e) => handleDelete(custo.id_custo)} />
          </Card>
        )}
        </CustomCard>
        <CustomCard
          title="Temporada"
          sxProps={{ flex: 1, height: '100%' }}
          headerActionContent={
            <Tooltip title="Ver detalhes de custos de temporada">
              <IconButton color="primary" onClick={() => navigate('/custos/temporada')}>
                <InfoOutlinedIcon />
              </IconButton>
            </Tooltip>
          }
        >{custosTemporada.map((custo) =>
          <Card sx={{ m: 1, p: 1, borderRadius: "12px", bgcolor: "", display: "flex", justifyContent: "space-between", alignItems: "center" }} key={custo.id_custo}>
            <div className='flex flex-col'>
              <div className='flex flex-col'>
                <p className='text-sm text-gray-500'>Evento e data</p>
                <p className='font-medium'>{custo.evento} - {formatDateToDDMMYYYY(custo.vencimento)}</p>
                <p className='text-sm text-gray-500'>Valor</p>
                <p>{custo.valor ? `R$ ${parseFloat(custo.valor / 100).toFixed(2)}` : 'R$ 0,00'}</p>
              </div>
            </div>
            <FaTrash style={{ cursor: 'pointer' }} onClick={(e) => handleDelete(custo.id_custo)} />
          </Card>
        )}
        </CustomCard>
        <CustomCard
          title="Fixos"
          sxProps={{ flex: 1, height: '100%' }}
          headerActionContent={
            <Tooltip title="Ver detalhes de custos fixos">
              <IconButton color="primary" onClick={() => navigate('/custos/fixos')}>
                <InfoOutlinedIcon />
              </IconButton>
            </Tooltip>
          }
        >{custosFixo.map((custo) =>
          <Card sx={{ m: 1, p: 1, borderRadius: "12px", bgcolor: "", display: "flex", justifyContent: "space-between", alignItems: "center" }} key={custo.id_custo}>
            <div className='flex flex-col'>
              <div className='flex flex-col'>
                <p className='text-sm text-gray-500'>Evento e data</p>
                <p className='font-medium'>{custo.evento} - {formatDateToDDMMYYYY(custo.vencimento)}</p>
                <p className='text-sm text-gray-500'>Valor</p>
                <p>{custo.valor ? `R$ ${parseFloat(custo.valor / 100).toFixed(2)}` : 'R$ 0,00'}</p>
              </div>
            </div>
            <FaTrash style={{ cursor: 'pointer' }} onClick={(e) => handleDelete(custo.id_custo)} />
          </Card>
        )}
        </CustomCard>
      </Stack>
      <Stack direction="row" display="flex" justifyContent="flex-end" sx={{ mt: 2 }}>
        <Box sx={{ maxWidth: 400, width: '100%' }}>
          <Card sx={{ p: 2, backgroundColor: "#fff", borderRadius: "12px", boxShadow: "none"}}>{`Totalizadores: ${valorTotal}`}</Card>
        </Box>
      </Stack>

      {/* Modal de criação de custo */}
      <CustomModal
        title="Criar novo custo"
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
          <TextField
            select
            label="Turma"
            name="turma_id"
            value={form.turma_id}
            onChange={handleChange}
            size='small'
            fullWidth
          >
            {turmas.map((turma: any) => (
              <MenuItem key={turma.id} value={turma.id}>{turma.nome}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Evento"
            name="evento"
            value={form.evento}
            onChange={handleChange}
            size='small'
            fullWidth
          />
          <TextField
            select
            label="Fornecedor"
            name="fornecedor_id"
            value={form.fornecedor_id}
            onChange={handleChange}
            size='small'
            fullWidth
          >
            {fornecedores.map((fornecedor: any) => (
              <MenuItem key={fornecedor.id} value={fornecedor.id}>{fornecedor.nome}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Beneficiário"
            name="beneficiario"
            value={form.beneficiario}
            onChange={handleChange}
            size='small'
            fullWidth
          />
          <TextField
            select
            label="Categoria"
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            size='small'
            fullWidth
          >
            {categorias.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
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
            onValueChange={(values) => {
              const { formattedValue, value } = values;
              setForm({ ...form, valor: formattedValue });
            }}
            size='small'
            fullWidth
          />
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
            onValueChange={(values) => {
              const { formattedValue, value } = values;
              setForm({ ...form, valor_pago_parcial: formattedValue });
            }}
            size='small'
            fullWidth
          />
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