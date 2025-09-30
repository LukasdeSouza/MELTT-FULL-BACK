import {
  Slide,
  Stack,
  Typography,
  TextField,
  Autocomplete,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState } from "react";
import BoxDashboardValues from "../../../components/box/dashboardValues";
import CustomLineChart from "../../../components/charts/line";
import CustomPieChart from "../../../components/charts/pie";
import toast from "react-hot-toast";
import { apiGetData } from "../../../services/api";

type ChartDataArray = Array<{
  data_valor: string;
  valor_pago: number;
}>;

interface TurmaOption {
  id: string;
  nome: string;
}

interface CustosData {
  preEvento: number;
  temporada: number;
  totalEntradas: number;
  totalSaidas: number;
  chartData: ChartDataArray;
}

interface MovimentacaoForm {
  tipo: 'entrada' | 'saida';
  categoria: string;
  descricao: string;
  valor: string;
  data: string;
}

const CentroCustosTurmaPage = () => {
  const [onLoad, setOnLoad] = useState(false);
  const [turmaSelected, setTurmaSelected] = useState<TurmaOption | null>(null);
  const [custosData, setCustosData] = useState<CustosData>({
    preEvento: 0,
    temporada: 0,
    totalEntradas: 0,
    totalSaidas: 0,
    chartData: []
  });
  const [turmas, setTurmas] = useState([])

  // Estados do modal
  const [modalOpen, setModalOpen] = useState(false);
  const [tipoModal, setTipoModal] = useState<'entrada' | 'saida'>('entrada');
  const [formData, setFormData] = useState<MovimentacaoForm>({
    tipo: 'entrada',
    categoria: '',
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0]
  });

  const fetchTurmas = async () => {
    try {
      const response = await apiGetData('academic', '/turmas')
      setTurmas(response.data)
    } catch (error) {
      toast.error('erro ao buscar turmas')
    }
  }

  const fetchCustosTotaisTurmaPreEventoTemporada = async (turmaId: string) => {
    try {
      const response = await apiGetData('academic', `/custos/valor-total/${turmaId}`)
      // Processar e definir os dados conforme a resposta da API
      console.log("fetchCustosTotaisTurma: ", response)
      return response
    } catch (error) {
      toast.error('Erro ao buscar dados de custos da turma')
    }
  }

  const fetchCustosTotaisTurmaEntradaSaida = async (turmaId: string) => {
    try {
      const response = await apiGetData('academic', `/custos-turma/valor-total/${turmaId}`)
      // Processar e definir os dados conforme a resposta da API
      console.log("fetchCustosTurma: ", response)
      return response
    } catch (error) {
      toast.error('Erro ao buscar dados de custos da turma')
    }
  }

  // Dados mockados das turmas
  // const turmasOptions: TurmaOption[] = [
  //   { id: "1", nome: "Turma A - 2024.1" },
  //   { id: "2", nome: "Turma B - 2024.1" },
  //   { id: "3", nome: "Turma C - 2024.1" },
  //   { id: "4", nome: "Turma D - 2024.2" },
  //   { id: "5", nome: "Turma E - 2024.2" },
  // ];

  // Dados mockados para gráfico de pizza - distribuição de custos
  const pieData = [
    { key: "Material", resultado: 30 },
    { key: "Alimentação", resultado: 25 },
    { key: "Transporte", resultado: 20 },
    { key: "Hospedagem", resultado: 15 },
    { key: "Outros", resultado: 10 },
  ];

  const pieColors = ["#DB1F8D", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];

  // Categorias para entradas e saídas
  const categoriasEntrada = [
    "Mensalidades",
    "Taxas de Inscrição",
    "Eventos Especiais",
    "Patrocínios",
    "Outros"
  ];

  const categoriasSaida = [
    "Material",
    "Alimentação",
    "Transporte",
    "Hospedagem",
    "Marketing",
    "Equipamentos",
    "Outros"
  ];

  // Dados mockados para gráfico de evolução temporal
  const generateMockChartData = (turmaId: string): ChartDataArray => {
    const baseData = [
      { data_valor: "2024-01-15", valor_pago: Math.random() * 5000 + 2000 },
      { data_valor: "2024-02-15", valor_pago: Math.random() * 7000 + 3000 },
      { data_valor: "2024-03-15", valor_pago: Math.random() * 6000 + 2500 },
      { data_valor: "2024-04-15", valor_pago: Math.random() * 8000 + 4000 },
      { data_valor: "2024-05-15", valor_pago: Math.random() * 5500 + 3500 },
      { data_valor: "2024-06-15", valor_pago: Math.random() * 7500 + 4500 },
    ];
    return baseData;
  };

  // Função para gerar dados mockados baseados na turma selecionada
  const generateMockData = (turmaId: string): CustosData => {
    const multiplier = parseInt(turmaId) * 0.8;
    return {
      preEvento: Math.round((Math.random() * 15000 + 10000) * multiplier),
      temporada: Math.round((Math.random() * 25000 + 15000) * multiplier),
      totalEntradas: Math.round((Math.random() * 50000 + 30000) * multiplier),
      totalSaidas: Math.round((Math.random() * 35000 + 20000) * multiplier),
      chartData: generateMockChartData(turmaId)
    };
  };

  const handleTurmaChange = async (_: any, newValue: TurmaOption | null) => {
    let custosTotaisTurmaEntradaSaida = 0;
    let custosTotaisTurmaPreEventoTemporada = 0;
    setTurmaSelected(newValue);
    custosTotaisTurmaEntradaSaida = await fetchCustosTotaisTurmaEntradaSaida(newValue?.id || '');
    custosTotaisTurmaPreEventoTemporada = await fetchCustosTotaisTurmaPreEventoTemporada(newValue?.id || '');
    const dataCustos = {
      preEvento: custosTotaisTurmaPreEventoTemporada.totaisPorTipo.preEvento.reais,
      temporada: custosTotaisTurmaPreEventoTemporada.totaisPorTipo.temporada.reais,
      totalEntradas: custosTotaisTurmaEntradaSaida.entradas.valor,
      totalSaidas: custosTotaisTurmaEntradaSaida.saidas.valor,
      chartData: generateMockChartData(newValue?.id || '')
    }

    if (newValue) {
      setCustosData(dataCustos);
      console.log("dataCustos: ", dataCustos);
      toast.success(`Dados carregados para ${newValue.nome}`);
    } else {
      setCustosData({
        preEvento: 0,
        temporada: 0,
        totalEntradas: 0,
        totalSaidas: 0,
        chartData: []
      });
    }
  };

  // Funções do modal
  const openModal = (tipo: 'entrada' | 'saida') => {
    setTipoModal(tipo);
    setFormData({
      tipo,
      categoria: '',
      descricao: '',
      valor: '',
      data: new Date().toISOString().split('T')[0]
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormData({
      tipo: 'entrada',
      categoria: '',
      descricao: '',
      valor: '',
      data: new Date().toISOString().split('T')[0]
    });
  };

  const handleInputChange = (field: keyof MovimentacaoForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.categoria || !formData.descricao || !formData.valor || !turmaSelected) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const valor = parseFloat(formData.valor.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) {
      toast.error('Digite um valor válido');
      return;
    }

    apiGetData('academic', '/custos-turma', {
      method: 'POST',
      data: {
        turmaId: turmaSelected.id,
        tipo: formData.tipo,
        categoria: formData.categoria,
        descricao: formData.descricao,
        valor: parseFloat(formData.valor.replace(',', '.')),
      }
    })
      .then(() => {
        toast.success('Movimentação adicionada com sucesso');
        // Opcional: atualizar dados após adicionar movimentação
        handleTurmaChange(null, turmaSelected);
      })
      .catch(() => {
        toast.error('Erro ao adicionar movimentação');
      });

    closeModal();
  };

  useEffect(() => {
    setOnLoad(true);
    fetchTurmas()
  }, []);

  const saldoFinal = custosData.totalEntradas - custosData.totalSaidas;

  return (
    <Stack width={"calc(100% - 28px)"} height={"100%"}>
      <Stack
        direction={"column"}
        height={"calc(100vh - 100px)"}
        overflow={"auto"}
        gap={4}
        sx={{
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "12px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#ddd",
            borderRadius: "12px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#EFEFEF",
          },
        }}
      >
        <Slide
          direction="right"
          in={onLoad}
          mountOnEnter
          unmountOnExit
          timeout={300}
        >
          <Stack direction={"column"} justifyContent={"space-between"}>
            <Typography
              variant="h4"
              color="primary"
              fontFamily={'Poppins'}
              sx={{ fontWeight: 600, mb: 3 }}
            >
              Centro de Custos por Turma
            </Typography>

            <Stack direction="row" spacing={2} py={2}>
              <Autocomplete
                sx={{ width: "30%" }}
                size="small"
                options={turmas}
                getOptionLabel={(option) => option.nome}
                value={turmaSelected}
                onChange={handleTurmaChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Selecionar Turma"
                    inputProps={{ ...params.inputProps, readOnly: true }}
                  />
                )}
              />
            </Stack>

            {turmaSelected && (
              <>
                {/* Botões de Ação */}
                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<AddIcon />}
                    onClick={() => openModal('entrada')}
                    sx={{ fontWeight: 600 }}
                  >
                    Adicionar Entrada
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<RemoveIcon />}
                    onClick={() => openModal('saida')}
                    sx={{ fontWeight: 600 }}
                  >
                    Adicionar Saída
                  </Button>
                </Stack>

                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={3}>
                    <BoxDashboardValues
                      title="Custos Pré-Eventos"
                      valor={custosData.preEvento}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <BoxDashboardValues
                      title="Custos Temporada"
                      valor={custosData.temporada}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <BoxDashboardValues
                      title="Total Entradas"
                      valor={custosData.totalEntradas}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <BoxDashboardValues
                      title="Total Saídas"
                      valor={custosData.totalSaidas}
                    />
                  </Grid>
                </Grid>

                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      color="primary"
                      fontFamily={'Poppins'}
                      sx={{ fontWeight: 600, mb: 2 }}
                    >
                      Saldo Final
                    </Typography>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        backgroundColor: saldoFinal > 0
                          ? '#E8F5E8'       // positivo -> verde claro
                          : saldoFinal < 0
                            ? '#FFE8E8'     // negativo -> vermelho claro
                            : '#F5F5F5',    // zero -> cinza
                        border: `2px solid ${saldoFinal > 0
                          ? '#4CAF50'       // positivo -> verde
                          : saldoFinal < 0
                            ? '#F44336'     // negativo -> vermelho
                            : '#BDBDBD'}`,  // zero -> cinza escuro
                      }}
                    >
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          color: saldoFinal > 0
                            ? '#2E7D32'       // positivo -> verde
                            : saldoFinal < 0
                              ? '#C62828'     // negativo -> vermelho
                              : '#BDBDBD',    // zero -> cinza escuro
                          textAlign: 'center'
                        }}
                      >
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(saldoFinal)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          textAlign: 'center',
                          color: saldoFinal > 0
                            ? '#2E7D32'       // positivo -> verde
                            : saldoFinal < 0
                              ? '#C62828'     // negativo -> vermelho
                              : '#BDBDBD',    // zero -> cinza escuro
                          mt: 1
                        }}
                      >
                        {saldoFinal > 0 ? 'Resultado Positivo' : saldoFinal < 0 ? 'Resultado Negativo' : 'Resultado Neutro'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </>
            )}
          </Stack>
        </Slide>

        {turmaSelected && (
          <>
            <Slide direction="right" in={onLoad} mountOnEnter>
              <Stack direction={"column"}>
                <Typography
                  color="primary"
                  fontFamily={'Poppins'}
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  Evolução dos Gastos ao Longo do Tempo
                </Typography>
                <CustomLineChart data={custosData.chartData} />
              </Stack>
            </Slide>

            <Slide direction="right" in={onLoad} mountOnEnter>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography
                        color="primary"
                        fontFamily={'Poppins'}
                        sx={{ fontWeight: 600, mb: 2 }}
                      >
                        Distribuição de Custos por Categoria
                      </Typography>
                      <Box display="flex" justifyContent="center">
                        <CustomPieChart data={pieData} COLORS={pieColors} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography
                        color="primary"
                        fontFamily={'Poppins'}
                        sx={{ fontWeight: 600, mb: 2 }}
                      >
                        Resumo Financeiro
                      </Typography>
                      <Stack spacing={2}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            p: 2,
                            backgroundColor: '#F5F5F5',
                            borderRadius: 1
                          }}
                        >
                          <Typography fontWeight={500}>Receitas Totais:</Typography>
                          <Typography
                            fontWeight={600}
                            color="success.main"
                          >
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(custosData.totalEntradas)}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            p: 2,
                            backgroundColor: '#F5F5F5',
                            borderRadius: 1
                          }}
                        >
                          <Typography fontWeight={500}>Despesas Totais:</Typography>
                          <Typography
                            fontWeight={600}
                            color="error.main"
                          >
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(custosData.totalSaidas)}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            p: 2,
                            backgroundColor: '#E3F2FD',
                            borderRadius: 1,
                            border: '1px solid #2196F3'
                          }}
                        >
                          <Typography fontWeight={600}>Saldo:</Typography>
                          <Typography
                            fontWeight={700}
                            color={saldoFinal >= 0 ? 'success.main' : 'error.main'}
                          >
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(saldoFinal)}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Slide>
          </>
        )}

        {!turmaSelected && (
          <Slide direction="right" in={onLoad} mountOnEnter>
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                color: 'text.secondary'
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Selecione uma turma para visualizar o centro de custos
              </Typography>
              <Typography variant="body2">
                Use o filtro acima para escolher a turma desejada
              </Typography>
            </Box>
          </Slide>
        )}

        {/* Modal para Adicionar Movimentações */}
        <Modal
          open={modalOpen}
          onClose={closeModal}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Card sx={{
            width: '90%',
            maxWidth: 500,
            maxHeight: '90vh',
            overflow: 'auto',
            outline: 'none'
          }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  color="primary"
                  fontFamily={'Poppins'}
                  sx={{ fontWeight: 600 }}
                >
                  {tipoModal === 'entrada' ? 'Adicionar Entrada' : 'Adicionar Saída'}
                </Typography>
                <IconButton onClick={closeModal} size="small">
                  <CloseIcon />
                </IconButton>
              </Stack>

              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={formData.categoria}
                    label="Categoria"
                    onChange={(e) => handleInputChange('categoria', e.target.value)}
                  >
                    {(tipoModal === 'entrada' ? categoriasEntrada : categoriasSaida).map((categoria) => (
                      <MenuItem key={categoria} value={categoria}>
                        {categoria}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Descrição"
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  multiline
                  rows={2}
                  placeholder="Digite uma descrição detalhada..."
                />

                <TextField
                  fullWidth
                  label="Valor"
                  value={formData.valor}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d,]/g, '');
                    handleInputChange('valor', value);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">R$</InputAdornment>
                    ),
                  }}
                  placeholder="0,00"
                />

                <TextField
                  fullWidth
                  label="Data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => handleInputChange('data', e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />

                <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={closeModal}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSubmit}
                    color={tipoModal === 'entrada' ? 'success' : 'error'}
                    sx={{ fontWeight: 600 }}
                  >
                    {tipoModal === 'entrada' ? 'Adicionar Entrada' : 'Adicionar Saída'}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Modal>
      </Stack>
    </Stack>
  );
};

export default CentroCustosTurmaPage;