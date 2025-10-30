
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
import { NumericFormat } from 'react-number-format';

const situacoes = [
  { value: 'Pendente', label: 'Pendente' },
  { value: 'Pago', label: 'Pago' },
  { value: 'Parcialmente Pago', label: 'Pago Parcial' },
  { value: 'Vencido', label: 'Vencido' },
];

const CustosTemporadaPage = () => {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState('');
  const [filtroTurma, setFiltroTurma] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [expandido, setExpandido] = useState<number | null>(null);
  const [custosTemporada, setCustosTemporada] = useState([]);
  const [editando, setEditando] = useState<number | null>(null);
  const [novaSituacao, setNovaSituacao] = useState('');
  const [editandoCompleto, setEditandoCompleto] = useState<number | null>(null);
  const [fornecedores, setFornecedores] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [dadosEdicao, setDadosEdicao] = useState<Custos | null>(null);

  const fetchCustosTemporada = async (searchTerm = '', turmaId = '', dataVencimento = '') => {
    let url = `/custos?limit=all&tipo_custo=Temporada`;

    if (searchTerm) {
      url += `&evento=${encodeURIComponent(searchTerm)}`;
    }
    if (turmaId) {
      url += `&turma_id=${turmaId}`;
    }
    if (dataVencimento) {
      url += `&vencimento=${dataVencimento}`;
    }

    const response = await apiGetData('academic', url);
    setCustosTemporada(response.data || []);
  };

  const fetchFornecedores = async () => {
    try {
      const response = await apiGetData('academic', '/fornecedores');
      setFornecedores(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
    }
  };

  const fetchTurmas = async () => {
    try {
      const response = await apiGetData('academic', '/turmas?all=true');
      setTurmas(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
    }
  };

  const handleEditarSituacao = (custo: Custos) => {
    setEditando(custo.id_custo);
    setNovaSituacao(custo.situacao);
  };

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

      await apiPutData('academic', `/custos/${custo.id_custo}`, body);
      toast.success('Situação atualizada com sucesso!');
      setEditando(null);
      setNovaSituacao('');
      fetchCustosTemporada(filtro);
    } catch (error) {
      toast.error('Erro ao atualizar situação');
      console.error('Erro ao atualizar situação:', error);
    }
  };

  const handleCancelarEdicao = () => {
    setEditando(null);
    setNovaSituacao('');
  };

  const handleEditarCompleto = (custo: Custos) => {
    setEditandoCompleto(custo.id_custo);
    setDadosEdicao({
      ...custo,
      vencimento: custo.vencimento ? new Date(custo.vencimento).toISOString().split('T')[0] : '',
    } as Custos);
  };

  const handleSalvarEdicaoCompleta = async () => {
    if (!dadosEdicao) return;

    try {
      const body = {
        id_custo: dadosEdicao.id_custo,
        tipo_custo: dadosEdicao.tipo_custo,
        turma_id: dadosEdicao.turma_id,
        evento: dadosEdicao.evento,
        fornecedor_id: dadosEdicao.fornecedor_id,
        beneficiario: dadosEdicao.beneficiario,
        categoria: dadosEdicao.categoria,
        valor: dadosEdicao.valor,
        valor_pago_parcial: dadosEdicao.valor_pago_parcial,
        vencimento: dadosEdicao.vencimento,
        situacao: dadosEdicao.situacao,
      };

      await apiPutData('academic', `/custos/${dadosEdicao.id_custo}`, body);
      toast.success('Custo atualizado com sucesso!');
      setEditandoCompleto(null);
      setDadosEdicao(null);
      fetchCustosTemporada(filtro);
    } catch (error) {
      toast.error('Erro ao atualizar custo');
      console.error('Erro ao atualizar custo:', error);
    }
  };

  const handleCancelarEdicaoCompleta = () => {
    setEditandoCompleto(null);
    setDadosEdicao(null);
  };

  const handleChangeDadosEdicao = (field: keyof Custos, value: any) => {
    if (dadosEdicao) {
      setDadosEdicao({ ...dadosEdicao, [field]: value });
    }
  };

  useEffect(() => {
    fetchCustosTemporada();
    fetchFornecedores();
    fetchTurmas();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchCustosTemporada(filtro, filtroTurma, filtroData);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [filtro, filtroTurma, filtroData]);

  return (
    <Box sx={{ width: '100%', mx: 'auto', mt: 4 }}>
      <IconButton color='secondary' size='small' onClick={() => navigate('/custos')}>
        <BiArrowBack />
      </IconButton>
      <Typography color='primary' variant="h5" fontWeight={700} mb={2}>
        Custos de Temporada
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Filtrar por nome do custo"
          variant="outlined"
          size="small"
          placeholder='busque pelo nome atribuído ao custo'
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          sx={{ flex: 1 }}
        />
        <TextField
          select
          label="Filtrar por Turma"
          variant="outlined"
          size="small"
          value={filtroTurma}
          onChange={e => setFiltroTurma(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {turmas.map((turma: any) => (
            <MenuItem key={turma.id} value={turma.id}>{turma.nome}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Filtrar por Data de Vencimento"
          variant="outlined"
          size="small"
          type="date"
          value={filtroData}
          onChange={e => setFiltroData(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 200 }}
        />
      </Stack>
      <Paper elevation={2} sx={{height: '60vh', overflow: 'auto'}}>
        <List>
          {custosTemporada.map((custo: Custos) => (
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
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography fontFamily="Poppins" fontWeight={600} color="secondary">
                        {custo.evento}
                      </Typography>
                      {custo.turma_nome && (
                        <Typography
                          variant="caption"
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontWeight: 600
                          }}
                        >
                          {custo.turma_nome}
                        </Typography>
                      )}
                    </Stack>
                  }
                  secondary={`Valor: R$ ${formatCentavosToBRL(custo.valor)} | Pago Parcial: R$ ${formatCentavosToBRL(custo.valor_pago_parcial) || "R$ 0.00"} | Vencimento: ${formatDateToDDMMYYYY(custo.vencimento)} | Criado em: ${formatDateToDDMMYYYY(custo.criado_em)}`}
                />
              </ListItem>
              <Collapse in={expandido === custo.id_custo} timeout="auto" unmountOnExit>
                <Box sx={{ px: 3, py: 2, bgcolor: '#F6F7FB' }}>
                  {editandoCompleto === custo.id_custo && dadosEdicao ? (
                    <Stack direction={'column'} spacing={2}>
                      <Typography variant="h6" color="primary" fontWeight={600}>
                        Editar Custo
                      </Typography>

                      <Stack direction={'row'} spacing={2}>
                        <TextField
                          label="Nome do Evento"
                          fullWidth
                          size="small"
                          value={dadosEdicao.evento}
                          onChange={(e) => handleChangeDadosEdicao('evento', e.target.value)}
                        />
                        <TextField
                          label="Categoria"
                          fullWidth
                          size="small"
                          value={dadosEdicao.categoria}
                          onChange={(e) => handleChangeDadosEdicao('categoria', e.target.value)}
                        />
                      </Stack>

                      <Stack direction={'row'} spacing={2}>
                        <TextField
                          label="Beneficiário"
                          fullWidth
                          size="small"
                          value={dadosEdicao.beneficiario}
                          onChange={(e) => handleChangeDadosEdicao('beneficiario', e.target.value)}
                        />
                        <TextField
                          select
                          label="Fornecedor"
                          fullWidth
                          size="small"
                          value={dadosEdicao.fornecedor_id || ''}
                          onChange={(e) => handleChangeDadosEdicao('fornecedor_id', e.target.value ? Number(e.target.value) : null)}
                        >
                          <MenuItem value="">Nenhum</MenuItem>
                          {fornecedores.map((fornecedor: any) => (
                            <MenuItem key={fornecedor.id} value={fornecedor.id}>
                              {fornecedor.nome}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Stack>

                      <Stack direction={'row'} spacing={2}>
                        <NumericFormat
                          value={(dadosEdicao.valor ?? 0) / 100}
                          allowLeadingZeros
                          thousandSeparator="."
                          allowNegative={false}
                          decimalSeparator=","
                          decimalScale={2}
                          fixedDecimalScale
                          prefix="R$"
                          customInput={TextField}
                          label="Valor (R$)"
                          name="valor"
                          size="small"
                          fullWidth
                          onValueChange={(values) => {
                            const { floatValue } = values;
                            const centavos = Math.round((floatValue || 0) * 100);

                            if (centavos !== dadosEdicao.valor) {
                              handleChangeDadosEdicao('valor', centavos);
                            }
                          }}
                        />
                        <NumericFormat
                          value={(dadosEdicao.valor_pago_parcial ?? 0) / 100}
                          allowLeadingZeros
                          thousandSeparator="."
                          allowNegative={false}
                          decimalSeparator=","
                          decimalScale={2}
                          fixedDecimalScale
                          prefix="R$"
                          customInput={TextField}
                          label="Valor Pago Parcial(R$)"
                          name="valor_pago_parcial"
                          size="small"
                          fullWidth
                          onValueChange={(values) => {
                            const { floatValue } = values;
                            const centavos = Math.round((floatValue || 0) * 100);

                            if (centavos !== dadosEdicao.valor) {
                              handleChangeDadosEdicao('valor_pago_parcial', centavos);
                            }
                          }}
                        />
                      </Stack>

                      <Stack direction={'row'} spacing={2}>
                        <TextField
                          label="Data de Vencimento"
                          fullWidth
                          size="small"
                          type="date"
                          slotProps={{ inputLabel: { shrink: true } }}
                          value={dadosEdicao.vencimento}
                          onChange={(e) => handleChangeDadosEdicao('vencimento', e.target.value)}
                        />
                        <TextField
                          select
                          label="Situação"
                          fullWidth
                          size="small"
                          value={dadosEdicao.situacao}
                          onChange={(e) => handleChangeDadosEdicao('situacao', e.target.value)}
                        >
                          {situacoes.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Stack>

                      <Stack direction={'row'} spacing={2} justifyContent={'flex-end'}>
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={handleSalvarEdicaoCompleta}
                          color="primary"
                        >
                          Salvar Alterações
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={handleCancelarEdicaoCompleta}
                          color="secondary"
                        >
                          Cancelar
                        </Button>
                      </Stack>
                    </Stack>
                  ) : (
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
                            <>
                              <Button
                                size="small"
                                startIcon={<EditIcon />}
                                onClick={() => handleEditarCompleto(custo)}
                                color="primary"
                                variant="contained"
                              >
                                Editar Registro
                              </Button>
                              <Button
                                size="small"
                                startIcon={<EditIcon />}
                                onClick={() => handleEditarSituacao(custo)}
                                color="secondary"
                                variant="outlined"
                              >
                                Editar Situação
                              </Button>
                            </>
                          )}
                        </Stack>
                      </Stack>
                    </Stack>
                  )}
                </Box>
              </Collapse>
              <Divider />
            </React.Fragment>
          ))}
          {custosTemporada.length === 0 && (
            <ListItem>
              <ListItemText primary="Nenhum custo de temporada encontrado." />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default CustosTemporadaPage;