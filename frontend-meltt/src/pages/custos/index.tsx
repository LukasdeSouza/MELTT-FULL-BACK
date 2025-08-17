

import React, { useState } from 'react';
import { Box, IconButton, Stack, Tooltip, Button, TextField, MenuItem } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CustomModal from '../../components/modal';
import { useNavigate } from 'react-router-dom';
import CustomCard from '../../components/card';



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

const CustosPage = () => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = React.useState(false);
  const [form, setForm] = React.useState(initialForm);
  const [loading, setLoading] = React.useState(false);

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
    let dataObj = {
      ...form,
      situacao: 'Pendente'
    }
    // Aqui você faria a chamada para o backend, ex: apiPostData('academic', '/custos', form)
    setTimeout(() => {
      setLoading(false);
      setOpenModal(false);
      setForm(initialForm);
    }, 1200);
  };

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
            fullWidth
          >
            {tiposCusto.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Turma ID"
            name="turma_id"
            value={form.turma_id}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Evento"
            name="evento"
            value={form.evento}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Fornecedor ID"
            name="fornecedor_id"
            value={form.fornecedor_id}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Beneficiário"
            name="beneficiario"
            value={form.beneficiario}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Categoria"
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Valor"
            name="valor"
            value={form.valor}
            onChange={handleChange}
            type="number"
            fullWidth
          />
          <TextField
            label="Valor pago parcial"
            name="valor_pago_parcial"
            value={form.valor_pago_parcial}
            onChange={handleChange}
            type="number"
            fullWidth
          />
          <TextField
            label="Vencimento"
            name="vencimento"
            value={form.vencimento}
            onChange={handleChange}
            type="date"
            InputLabelProps={{ shrink: true }}
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