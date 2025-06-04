import {
  Paper,
  Slide,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import BasicTable from "../../../components/table";
import { apiGetData } from "../../../services/api";
import { dashboarStudentsColumns } from "./columns";
import LoadingTable from "../../../components/loadingTable";
import BoxDashboardValues from "../../../components/box/dashboardValues";
import toast from "react-hot-toast";
import CustomBarChart from "../../../components/charts/bar";

const DashboardFornecedoresPage = () => {
  const [onLoad, setOnLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listFornecedores, setListFornecedores] = useState<any[]>([]);

  const [totalPagamentosEfetuados, setTotalPagamentosEfetuados] = useState(0);
  const [totalPagamentosNaoEfetuados, setTotalPagamentosNaoEfetuados] = useState(0);

  const dataRowFornecedores = (row: any) => {
    return (
      <TableRow
        key={row.name}
        sx={{
          "&:last-child td, &:last-child th": { border: 0 },
          " &:hover": { bgcolor: "#F7F7F7", cursor: "pointer" },
        }}
      >
        <TableCell component="th" scope="row">
          <Stack direction={"column"} gap={0.5}>
            <Typography variant="body2" color="primary" fontWeight={600}>
              {row.nome}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell align="left">{row.tipo_servico}</TableCell>
      </TableRow>
    );
  };

  const fetchFornecedores = async () => {
    try {
      let response = await apiGetData("academic", `/fornecedores`);
      setListFornecedores(response.data);

      const { efetuados, naoEfetuados } = response.data.reduce(
        (acc: { efetuados: number; naoEfetuados: number; }, fornecedor: { valor_cotado: string; status: string; }) => {
          const valor = parseFloat(fornecedor.valor_cotado) || 0;
          if (fornecedor.status === "Pagamento efetuado") {
            acc.efetuados += valor;
          } else if (fornecedor.status === "Pagamento não efetuado") {
            acc.naoEfetuados += valor;
          }
          return acc;
        },
        { efetuados: 0, naoEfetuados: 0 }
      );

      setTotalPagamentosEfetuados(efetuados);
      setTotalPagamentosNaoEfetuados(naoEfetuados);
    } catch (error) {
      toast.error("Erro ao buscar fornecedores");
    }
  }

  useEffect(() => {
    setLoading(false);
    fetchFornecedores();
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
          <Stack direction={"row"} gap={2} justifyContent={"space-between"}>
            <BoxDashboardValues title="Valor Pago a Fornecedores" valor={totalPagamentosEfetuados} />
            <BoxDashboardValues title="Valor em Aberto" valor={totalPagamentosNaoEfetuados}/>
          </Stack>
        </Slide>
        <Slide direction="right" in={onLoad} mountOnEnter>
          <Stack direction={"column"}>
            <CustomBarChart
              data={listFornecedores.filter(f => f.valor_cotado && f.cnpj)}
            />
            <Stack direction={"row"} gap={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  flexGrow: 1,
                  width: "100%",
                  height: "calc(100vh - 200px)",
                  borderRadius: 4,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    overflow: "auto",
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
                  <Stack
                    direction={"row"}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                    mb={2}
                  >
                    <Typography
                      color="secondary"
                      variant="body1"
                      fontWeight={600}
                      fontFamily={'Poppins'}
                    >
                      Fornecedores Cadastrados
                    </Typography>
                    <Typography
                      color="textSecondary"
                      variant="subtitle2"
                      sx={{ mr: 2 }}
                    >
                      total de fornecedores: {listFornecedores?.length}
                    </Typography>
                  </Stack>
                  {loading ? (
                    <LoadingTable />
                  ) : listFornecedores.length > 0 ? (
                    <BasicTable
                      columns={dashboarStudentsColumns}
                      rows={listFornecedores}
                      loading={false}
                      dataRow={dataRowFornecedores}
                      handleChangePagination={() => { }}
                      page={1}
                      totalPages={1}
                    />
                  ) : (
                    <Stack
                      height={"100%"}
                      alignItems={"center"}
                      justifyContent={"center"}
                    >
                      <Typography
                        textAlign={"center"}
                        color="textSecondary"
                        variant="subtitle2"
                      >
                        Desculpe, nenhum fornecedor foi encontrado
                      </Typography>
                    </Stack>
                  )}
                </Paper>
              </Paper>
            </Stack>
          </Stack>
        </Slide>
      </Stack>
    </Stack>
  );
};

export default DashboardFornecedoresPage;
