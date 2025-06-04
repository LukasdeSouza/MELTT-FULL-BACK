import {
  Slide,
  Stack,
  Typography,
  TextField,
  Autocomplete,
} from "@mui/material";
import { useEffect, useState } from "react";
import { apiGetData } from "../../services/api";
import BoxDashboardValues from "../../components/box/dashboardValues";
import CustomLineChart from "../../components/charts/line";
import toast from "react-hot-toast";
import dayjs from "dayjs";

type ChartDataArray = Array<{
  data_valor: string;
  valor_pago: number;
}>

interface ChartData {
  data_valor: string;
  valor_pago: number;
}

const DashboardPagamentosPage = () => {
  // const [loading, setLoading] = useState(false);
  const [onLoad, setOnLoad] = useState(false);

  const [valorEmAberto, setValorEmAberto] = useState(0);
  const [valorRecebido, setValorRecebido] = useState(0);
  const [valorCancelado, setvalorCancelado] = useState(0);

  const [listAbertos, setListAbertos] = useState<ChartDataArray>([]);
  const [listRecebido, setListRecebido] = useState<ChartDataArray>([]);
  const [listCancelado, setListCancelado] = useState<ChartDataArray>([]);

  const [periodo, setPeriodo] = useState<any>(null);

  const handleChange = (_: any, newValue: any) => {
    console.log(newValue);
    setPeriodo(newValue);
  };

  // Opções do filtro com suas respectivas datas
  const options = [
    { label: "Uma semana atrás", value: dayjs().subtract(7, "day").startOf("day") },
    { label: "Duas semanas atrás", value: dayjs().subtract(14, "day").startOf("day") },
    { label: "Últimos 30 dias", value: dayjs().subtract(30, "day").startOf("day") },
    { label: "Últimos 60 dias", value: dayjs().subtract(60, "day").startOf("day") },
  ];

  const fetchPagamentosBySituacao = async (situacao: number) => {
    try {
      let response;


      response = await apiGetData("academic", `/pagamentos/situacao/${situacao}`);

      if (periodo !== null) {
        const periodoFormatado = periodo ? periodo.value.toISOString().split("T") : null;
        console.log(periodoFormatado[0]);
        response = await apiGetData("academic", `/pagamentos/situacao/${situacao}?periodo=${periodoFormatado[0]}`);
      }

      const total = response.reduce((acc: number, pagamento: any) => {
        const valor = parseFloat(pagamento.valor);
        return acc + (isNaN(valor) ? 0 : valor);
      }, 0);

      const chartData: ChartData[] = response.map((pagamento: any) => ({
        data_valor: pagamento.vencimento,
        valor_pago: parseFloat(pagamento.valor) || 0
      }));

      const groupedData = chartData.reduce((acc: Record<string, number>, current) => {
        const date = current.data_valor;
        acc[date] = (acc[date] || 0) + current.valor_pago;
        return acc;
      }, {});

      const finalData = Object.entries(groupedData).map(([data_valor, valor_pago]) => ({
        data_valor,
        valor_pago
      }));

      finalData.sort((a, b) => new Date(a.data_valor).getTime() - new Date(b.data_valor).getTime());


      switch (situacao) {
        case 1:
          setValorEmAberto(total);
          setListAbertos(finalData);
          break;
        case 2:
          setValorRecebido(total);
          setListRecebido(finalData);
          break;
        case 5:
          setvalorCancelado(total);
          setListCancelado(finalData);
          break;
        default:
          break;
      }

      return {
        ...response,
        total,
        chartData: finalData
      };

    } catch (error) {
      toast.error("Erro ao buscar pagamentos");
      throw error;
    }
  }

  useEffect(() => {
    Promise.all([
      fetchPagamentosBySituacao(1),
      fetchPagamentosBySituacao(2),
      fetchPagamentosBySituacao(5)
    ])
  }, [periodo]);

  useEffect(() => {

    setOnLoad(true);
  }, []);

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
            <Stack direction="row" spacing={2} py={2}>
              <Autocomplete
                sx={{ width: "25%" }}
                size="small"
                options={options}
                getOptionLabel={(option) => option.label}
                value={periodo || null}
                onChange={handleChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Filtrar por Período"
                    inputProps={{ ...params.inputProps, readOnly: true }} // Prevent typing
                  />
                )}
              />
            </Stack>
            <Stack direction={"row"} gap={2} justifyContent={"space-between"}>
              <BoxDashboardValues title="Total Pago" valor={valorRecebido} />
              <BoxDashboardValues title="Total a receber" valor={valorEmAberto} />
              <BoxDashboardValues title="Total Cancelado" valor={valorCancelado} />
            </Stack>
          </Stack>
        </Slide>
        <Slide direction="right" in={onLoad} mountOnEnter>
          <Stack direction={"column"}>
            <Typography color="primary" fontFamily={'Poppins'} sx={{fontWeight: 600}}>Em Aberto</Typography>
            <CustomLineChart
              data={listAbertos}
            />
            <Stack direction={"row"} gap={4}>
            </Stack>
          </Stack>
        </Slide>
        <Slide direction="right" in={onLoad} mountOnEnter>
          <Stack direction={"column"}>
            <Typography color="primary" fontFamily={'Poppins'} sx={{fontWeight: 600}}>Pagamento efetuado</Typography>
            <CustomLineChart
              data={listRecebido}
            />
            <Stack direction={"row"} gap={4}>

            </Stack>
          </Stack>
        </Slide>
        <Slide direction="right" in={onLoad} mountOnEnter>
          <Stack direction={"column"}>
            <Typography color="primary" fontFamily={'Poppins'}>Pagamento Cancelado</Typography>
            <CustomLineChart
              data={listCancelado}
            />
            <Stack direction={"row"} gap={4}>

            </Stack>
          </Stack>
        </Slide>
      </Stack>
    </Stack>
  );
};

export default DashboardPagamentosPage;
