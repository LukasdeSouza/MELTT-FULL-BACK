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
import { dashboarStudentsColumns } from "./columns";
import LoadingTable from "../../../components/loadingTable";
import BoxDashboardValues from "../../../components/box/dashboardValues";
import toast from "react-hot-toast";
import CustomBarChart from "../../../components/charts/bar";
import { StatusDonutChart } from "../../../components/charts/statusDonut";

const DashboardAdesoesPage = () => {
  const [onLoad, setOnLoad] = useState(false);
  const [loading, setLoading] = useState(true);
  const [listAdesoes, setListAdesoes] = useState<any[]>([]);
  
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const [statusDistribution, setStatusDistribution] = useState<Record<string, number>>({
    concluidas: 0,
    pendentes: 0,
    cancelado: 0,
  });

  const dataRowAdesoes = (row: any) => {
    return (
      <TableRow
        key={row.id}
        sx={{
          "&:last-child td, &:last-child th": { border: 0 },
          "&:hover": { bgcolor: "#F7F7F7", cursor: "pointer" },
        }}
      >
        <TableCell component="th" scope="row">
          <Typography variant="body2" fontWeight={600}>
            Turma #{row.turma_id}
          </Typography>
        </TableCell>
        <TableCell align="left">
          <Typography 
            variant="caption" 
            sx={{
              color: 
                row.status === 'concluida' ? 'success.main' :
                row.status === 'pendente' ? 'warning.main' :
                'error.main',
              fontWeight: 500,
              textTransform: 'capitalize'
            }}
          >
            {row.status}
          </Typography>
        </TableCell>
        <TableCell align="left">
          {new Date(row.data_assinatura).toLocaleDateString('pt-BR')}
        </TableCell>
        <TableCell align="left">
          {new Date(row.created_at).toLocaleDateString('pt-BR')}
        </TableCell>
        <TableCell align="left">{row.observacoes || '-'}</TableCell>
      </TableRow>
    );
  };

  const fetchAdesoes = async (page = 1) => {
    try {
      const response = await apiGetData("academic", `/adesoes?page=${page}`);
      setListAdesoes(response.data);
      setPagination({
        page: response.data.page,
        totalPages: response.data.totalPages,
        totalItems: response.data.totalItems,
        itemsPerPage: response.data.itemsPerPage,
      });

      setStatusDistribution({
        concluidas: parseInt(response.data.totalConcluidas),
        pendentes: parseInt(response.data.totalPendentes),
        cancelado: parseInt(response.data.totalCancelado),
      });

    } catch (error) {
      toast.error("Erro ao buscar Adesões");
    } finally {
      setLoading(false);
      setOnLoad(true);
    }
  };

  useEffect(() => {
    fetchAdesoes();
  }, []);

  const handleChangePagination = (newPage: number) => {
    fetchAdesoes(newPage);
  };

  return (
    <Stack width={"calc(100% - 28px)"} height="100%">
      <Stack
        direction="column"
        height="calc(100vh - 100px)"
        overflow="auto"
        gap={4}
        sx={{
          '&::-webkit-scrollbar': { width: 8, height: 12 },
          '&::-webkit-scrollbar-thumb': { 
            backgroundColor: '#ddd', 
            borderRadius: '12px' 
          },
          '&::-webkit-scrollbar-track': { background: '#EFEFEF' },
        }}
      >
        <Slide direction="right" in={onLoad} mountOnEnter unmountOnExit timeout={300}>
          <Stack direction="row" gap={2} justifyContent="space-between">
            <BoxDashboardValues 
              title="Concluídas" 
              valor={statusDistribution.concluidas} 
            />
            <BoxDashboardValues 
              title="Pendentes" 
              valor={statusDistribution.pendentes}
            />
            <BoxDashboardValues 
              title="Canceladas" 
              valor={statusDistribution.cancelado}
            />
          </Stack>
        </Slide>

        <Slide direction="left" in={onLoad} mountOnEnter timeout={500}>
          <Stack direction="row" gap={4} sx={{ height: 400 }}>
            <Paper elevation={0} sx={{ 
              flex: 1, 
              p: 3, 
              borderRadius: 4,
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <StatusDonutChart 
                statusDistribution={statusDistribution}
                chartTitle="Distribuição de Status"
              />
            </Paper>
            
            <Paper elevation={0} sx={{ 
              flex: 1, 
              p: 3, 
              borderRadius: 4,
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <CustomBarChart
                data={Object.entries(statusDistribution).map(([name, value]) => ({
                  name: name.charAt(0).toUpperCase() + name.slice(1),
                  value
                }))}
              />
            </Paper>
          </Stack>
        </Slide>

        {/* Seção da Tabela */}
        <Slide direction="up" in={onLoad} mountOnEnter timeout={700}>
          <Paper elevation={0} sx={{ 
            p: 4, 
            borderRadius: 4,
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
              <Typography variant="h6" fontWeight={600}>
                Lista de Adesões
              </Typography>
              
              <Stack direction="row" alignItems="center" gap={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Total: {pagination.totalItems}
                </Typography>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  p: 1,
                }}>
                  <Typography variant="caption">
                    Página {pagination.page} de {pagination.totalPages}
                  </Typography>
                </Box>
              </Stack>
            </Stack>

            {loading ? (
              <LoadingTable />
            ) : listAdesoes.length > 0 ? (
              <BasicTable
                columns={dashboarStudentsColumns}
                rows={listAdesoes}
                loading={loading}
                dataRow={dataRowAdesoes}
                handleChangePagination={(_, newValue) => handleChangePagination(newValue)}
                page={pagination.page}
                totalPages={pagination.totalPages}
              />
            ) : (
              <Stack height={300} alignItems="center" justifyContent="center">
                <Typography variant="body1" color="textSecondary">
                  Nenhuma adesão encontrada
                </Typography>
              </Stack>
            )}
          </Paper>
        </Slide>
      </Stack>
    </Stack>
  );
};

export default DashboardAdesoesPage;