import {
  Box,
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
import { dashboarPropostasColumns } from "./columns";
import LoadingTable from "../../../components/loadingTable";
import BoxDashboardValues from "../../../components/box/dashboardValues";
import toast from "react-hot-toast";
import CustomBarChart from "../../../components/charts/bar";
import { MdDescription } from "react-icons/md";
import { StatusDonutChart } from "../../../components/charts/statusDonut";

const DashboardPropostasPage = () => {
  const [onLoad, setOnLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listPropostas, setListPropostas] = useState<any[]>([]);

  const [totalValorPropostas, setTotalValorPropostas] = useState(0);
  const [turmasUnicas, setTurmasUnicas] = useState<number>(0);
  const [enviadoPorDistribution, setEnviadoPorDistribution] = useState<Record<string, number>>({});
  const [totalPropostas, setTotalPropostas] = useState<number>(0);

  const dataRowPropostas = (row: any) => {
    return (
      <TableRow
        key={row.id}
        sx={{
          "&:last-child td, &:last-child th": { border: 0 },
          " &:hover": { bgcolor: "#F7F7F7", cursor: "pointer" },
        }}
      >
        <TableCell component="th" scope="row">
          <Typography variant="body2" fontWeight={600}>
            {row.nome_proposta}
          </Typography>
        </TableCell>
        <TableCell align="left">{row.turma_id}</TableCell>
        <TableCell align="left">{row.enviado_por}</TableCell>
        <TableCell align="left">{new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(parseFloat(row.valor_proposta))}</TableCell>
        <TableCell align="left">{new Date(row.data_criacao).toLocaleDateString()}</TableCell>
      </TableRow>
    );
  };

  const fetchPropostas = async () => {
    try {
      const response = await apiGetData("academic", `/propostas`);
      setListPropostas(response.data);

      const metrics = response.data.reduce((acc: any, item: any) => {
        // Valor total das propostas
        acc.totalValor += parseFloat(item.valor_proposta) || 0;
        // Turmas únicas
        acc.turmas.add(item.turma_id);
        // Distribuição por responsável
        acc.enviadoPor[item.enviado_por] = (acc.enviadoPor[item.enviado_por] || 0) + 1;
        return acc;
      }, {
        totalValor: 0,
        turmas: new Set<number>(),
        enviadoPor: {}
      });

      setTotalValorPropostas(metrics.totalValor);
      setTurmasUnicas(metrics.turmas.size);
      setEnviadoPorDistribution(metrics.enviadoPor);
      setTotalPropostas(response.data.length);
    } catch (error) {
      toast.error("Erro ao buscar propostas");
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchPropostas().finally(() => setLoading(false));
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
          "&::-webkit-scrollbar": { width: "8px", height: "12px" },
          "&::-webkit-scrollbar-thumb": { backgroundColor: "#ddd", borderRadius: "12px" },
          "&::-webkit-scrollbar-track": { background: "#EFEFEF" },
        }}
      >
        <Slide direction="right" in={onLoad} mountOnEnter unmountOnExit timeout={300}>
          <Stack direction={"row"} gap={2} justifyContent={"space-between"}>
            <BoxDashboardValues title="Valor Total das Propostas" valor={totalValorPropostas} />
            <BoxDashboardValues title="Turmas Únicas" valor={turmasUnicas} />
          </Stack>
        </Slide>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <StatusDonutChart
            statusDistribution={enviadoPorDistribution}
            chartTitle="Distribuição por Responsável"
          />
          <CustomBarChart
            data={Object.entries(enviadoPorDistribution).map(([name, value]) => ({
              name,
              value
            }))}
          />
        </div>

        <Stack direction={'row'} gap={2} justifyContent={"space-between"}>
          <Stack
            direction="column"
            flex={1}
            alignItems="center"
            p={2.5}
            bgcolor="background.paper"
            borderRadius={2}
            boxShadow={1}
            sx={{
              transition: 'all 0.2s ease',
              '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MdDescription fontSize="small" color="primary" />
              <Typography variant="overline" color="textSecondary" sx={{ letterSpacing: '0.5px' }}>
                Total de Propostas
              </Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: totalPropostas > 0 ? '#444' : 'red' }}>
              {totalPropostas.toLocaleString('pt-BR')}
            </Typography>
          </Stack>
        </Stack>

        <Slide direction="right" in={onLoad} mountOnEnter>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight={600}>
                Lista de Propostas
              </Typography>
              <Typography variant="subtitle2" color="textSecondary">
                Total: {listPropostas.length}
              </Typography>
            </Stack>
            
            {loading ? (
              <LoadingTable />
            ) : listPropostas.length > 0 ? (
              <BasicTable
                columns={dashboarPropostasColumns}
                rows={listPropostas}
                loading={false}
                dataRow={dataRowPropostas}
                handleChangePagination={() => { }}
                page={1}
                totalPages={1}
              />
            ) : (
              <Stack height={200} alignItems="center" justifyContent="center">
                <Typography variant="subtitle2" color="textSecondary">
                  Nenhuma proposta encontrada
                </Typography>
              </Stack>
            )}
          </Paper>
        </Slide>
      </Stack>
    </Stack>
  );
};

export default DashboardPropostasPage;