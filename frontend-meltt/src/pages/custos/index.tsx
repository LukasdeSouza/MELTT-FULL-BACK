

import React, { useEffect, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { Box, IconButton, Stack, Tooltip, Button, TextField, MenuItem } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CustomModal from '../../components/modal';
import { useNavigate } from 'react-router-dom';
import CustomCard from '../../components/card';
import { apiGetData } from '../../services/api';

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
  { value: 'pre-eventos', label: 'Pré-Eventos' },
  { value: 'temporada', label: 'Temporada' },
  { value: 'fixos', label: 'Fixos' },
];

const situacoes = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'pago', label: 'Pago' },
  { value: 'parcial', label: 'Pago Parcial' },
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
    const valorParcialNumero = parseFloat(form.valor.replace(/\./g, '').replace('R$', '').replace(',', '.'));
    const valorParcialCentavos = Math.round(valorParcialNumero * 100);
    const dataObj = {
      ...form,
      valor: valorCentavos,
      valor_pago_parcial: valorParcialCentavos,
      situacao: 'Pendente'
    };
    console.log('Submitting form data:', dataObj);
    // Aqui você faria a chamada para o backend, ex: apiPostData('academic', '/custos', form)
    setTimeout(() => {
      setLoading(false);
      setOpenModal(false);
      setForm(initialForm);
    }, 1200);
  };

  const fetchTurmas = async () => {
    const response = await apiGetData('academic', '/turmas');
    setTurmas(response.data || []);
  };

  const fetchFornecedores = async () => {
    const response = await apiGetData('academic', '/fornecedores');
    setFornecedores(response.data || []);
  };

  const fetchAll = async () => {
    await Promise.all([fetchTurmas(), fetchFornecedores()]);
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
        >{null}</CustomCard>
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
        >{null}</CustomCard>
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
        >{null}</CustomCard>
      </Stack>
      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
        <Box sx={{ maxWidth: 400, width: '100%' }}>
          <CustomCard title="Totalizadores">{null}</CustomCard>
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