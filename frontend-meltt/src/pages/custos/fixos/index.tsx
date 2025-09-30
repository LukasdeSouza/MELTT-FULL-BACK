
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Collapse,
  Divider,
  Paper,
  Stack,
  MenuItem,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { BiArrowBack } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { apiGetData, apiPutData } from '../../../services/api';
import formatDateToDDMMYYYY from '../../../utils/functions/formatDate';
import formatCentavosToBRL from '../../../utils/functions/formatCentavosToBRL';
import { Custos } from '../../../types';
import toast from 'react-hot-toast';

const situacoes = [
  { value: 'Pendente', label: 'Pendente' },
  { value: 'pago', label: 'Pago' },
  { value: 'Parcialmente Pago', label: 'Pago Parcial' },
  { value: 'Vencido', label: 'Vencido' },
];

const CustosFixosPage = () => {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState('');
  const [expandido, setExpandido] = useState<number | null>(null);
  const [custosFixo, setCustosFixo] = useState([]);
  const [editando, setEditando] = useState<number | null>(null);
  const [novaSituacao, setNovaSituacao] = useState('');

  const fetchCustosFixo = async (searchTerm = '') => {
    const url = searchTerm
      ? `/custos?tipo_custo=Fixo&evento=${encodeURIComponent(searchTerm)}`
      : '/custos?tipo_custo=Fixo';

    const response = await apiGetData('academic', url);
    setCustosFixo(response.data || []);
  };

  // const fetchFornecedores = async () => {
  //   const response = await apiGetData('academic', '/fornecedores?all=true');
  //   setFornecedores(response.data || []);
  // };

  const handleEditarSituacao = (custo: Custos) => {
    setEditando(custo.id_custo);
    setNovaSituacao(custo.situacao);
  };

  console.log('custosFixo', custosFixo)

  const handleSalvarSituacao = async (custo: Custos) => {
    try {
      const body = {
        id_custo: custo.id_custo,
        tipo_custo: custo.tipo_custo,
        turma_id: custo.turma_id,
        evento: custo.evento,
        fornecedor_id: custo.fornecedor_id,
        beneficiario: custo.beneficiario,
        categoria: custo.categoria,
        valor: custo.valor,
        valor_pago_parcial: custo.valor_pago_parcial,
        vencimento: custo.vencimento,
        situacao: novaSituacao,
      };

      await apiPutData('academic', '/custos', body);
      toast.success('Situação atualizada com sucesso!');
      setEditando(null);
      setNovaSituacao('');
      fetchCustosFixo(filtro);
    } catch (error) {
      toast.error('Erro ao atualizar situação');
      console.error('Erro ao atualizar situação:', error);
    }
  };

  const handleCancelarEdicao = () => {
    setEditando(null);
    setNovaSituacao('');
  };

  useEffect(() => {
    fetchCustosFixo();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchCustosFixo(filtro);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [filtro]);

  return (
    <Box sx={{ width: '100%', mx: 'auto', mt: 4 }}>
      <IconButton color='secondary' size='small' onClick={() => navigate('/custos')}>
        <BiArrowBack />
      </IconButton>
      <Typography color='primary' variant="h5" fontWeight={700} mb={2}>
        Custos Fixos
      </Typography>
      <TextField
        label="Filtrar por nome do custo"
        variant="outlined"
        size="small"
        placeholder='busque pelo nome atribuído ao custo'
        value={filtro}
        onChange={e => setFiltro(e.target.value)}
        sx={{ mb: 3, width: '40%' }}
      />
      <Paper elevation={2}>
        <List>
          {custosFixo.map((custo: Custos) => (
            <React.Fragment key={custo.id_custo}>
              <ListItem
                secondaryAction={
                  <IconButton edge="end" onClick={() => setExpandido(expandido === custo.id_custo ? null : custo.id_custo)}>
                    {expandido === custo.id_custo ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                }
                sx={{ cursor: 'pointer' }}
                onClick={() => setExpandido(expandido === custo.id_custo ? null : custo.id_custo)}
              >
                <ListItemText
                  primary={custo.evento}
                  secondary={`Valor: R$ ${formatCentavosToBRL(custo.valor)} | Pago Parcial: ${custo.valor_pago_parcial} | Vencimento: ${formatDateToDDMMYYYY(custo.vencimento)} | Criado em: ${formatDateToDDMMYYYY(custo.criado_em)}`}
                  primaryTypographyProps={{
                    fontFamily: "Poppins",
                    fontWeight: 600,
                    color: 'secondary'
                  }}
                />
              </ListItem>
              <Collapse in={expandido === custo.id_custo} timeout="auto" unmountOnExit>
                <Box sx={{ px: 3, py: 2, bgcolor: '#F6F7FB' }}>
                  <Stack direction={'column'} spacing={2}>
                    <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                      <Typography variant="body2" color="text.secondary">
                        Categoria: {custo.categoria}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Beneficiario: {custo.beneficiario}
                      </Typography>
                    </Stack>

                    <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                      <Stack direction={'row'} alignItems={'center'} spacing={2}>
                        <Typography variant="body2" color="text.secondary">
                          Situação:
                        </Typography>
                        {editando === custo.id_custo ? (
                          <TextField
                            select
                            size="small"
                            value={novaSituacao}
                            onChange={(e) => setNovaSituacao(e.target.value)}
                            sx={{ minWidth: 150 }}
                          >
                            {situacoes.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            {custo.situacao}
                          </Typography>
                        )}
                      </Stack>

                      <Stack direction={'row'} spacing={1}>
                        {editando === custo.id_custo ? (
                          <>
                            <Button
                              size="small"
                              startIcon={<SaveIcon />}
                              onClick={() => handleSalvarSituacao(custo)}
                              color="primary"
                            >
                              Salvar
                            </Button>
                            <Button
                              size="small"
                              startIcon={<CancelIcon />}
                              onClick={handleCancelarEdicao}
                              color="secondary"
                            >
                              Cancelar
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleEditarSituacao(custo)}
                            color="primary"
                          >
                            Editar Situação
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </Stack>
                </Box>
              </Collapse>
              <Divider />
            </React.Fragment>
          ))}
          {custosFixo.length === 0 && (
            <ListItem>
              <ListItemText primary="Nenhum custo fixo encontrado." />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default CustosFixosPage;