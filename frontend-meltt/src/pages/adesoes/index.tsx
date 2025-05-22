import {
  Button,
  Chip,
  IconButton,
  Link,
  Paper,
  Slide,
  Stack,
  TableCell,
  TableRow,
} from "@mui/material";
import BasicTable from "../../components/table";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGetData } from "../../services/api";
import { IoMdAdd } from "react-icons/io";
import toast from "react-hot-toast";
import NoTableData from "../../components/noData";
import LoadingTable from "../../components/loadingTable";
import { FaEye, FaFileSignature } from "react-icons/fa6";
import { useAdesaoContext } from "../../providers/adesaoContext";
import { adesoesColumns } from "./table/columns";
import { format } from "date-fns";
import { IoWarning } from "react-icons/io5";

interface Adesao {
  id: string | number;
  aluno_id: string;
  turma_id: string;
  status: string;
  data_assinatura: string;
  observacoes: string;
}

const AdesoesPage = () => {
  const navigate = useNavigate();
  const { dispatchAdesao } = useAdesaoContext();
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);

  const [adesoes, setAdesoes] = useState<Adesao[]>([]);
  const [adesoesPendentes, setAdesoesPendentes] = useState<[]>([]);
  const [adesoesConcluidas, setAdesoesConcluidas] = useState<[]>([]);

  const [onLoad, setOnLoad] = useState(false);

  const fetchAdesoes = async (page: number) => {
    setLoading(true);
    try {
      let response = await apiGetData("academic", `/adesoes?page=${page}`)
      setAdesoes(response.data);
      setAdesoesConcluidas(response.totalConcluidas)
      setAdesoesPendentes(response.totalPendentes)
    } catch (error) {
      toast.error("Erro ao buscar adesões");
    }
    setLoading(false);
  };

  const handleChangePagination = (_: React.ChangeEvent<unknown>, value: number) => {
    try {
      fetchAdesoes(value);
    } catch (error) {
      toast.error("Erro ao buscar Turmas");
    }
    setPage(value);
  };

  const onClickRowView = (row: any) => {
    dispatchAdesao({ type: "SET_ADESAO_SELECIONADO", payload: row });
    navigate(`/adesoes/edit/${row.id}`);
  };


  const dataRow = (row: Adesao) => {
    return (
      <TableRow
        key={row.id}
        sx={{
          "&:last-child td, &:last-child th": { border: 0 },
          " &:hover": { bgcolor: "#F7F7F7", cursor: "pointer" },
        }}
      >
        <TableCell component="th" scope="row">
          <Link
            color="primary"
            underline="always"
            onClick={() => onClickRowView(row)}
            sx={{ fontFamily: "Poppins" }}
          >
            {row.aluno_id}
          </Link>
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          {row.turma_id}
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          {row.status}
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          {format(row.data_assinatura, 'dd/MM/yyyy')}
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          {row.observacoes}
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          <IconButton size="small" onClick={() => onClickRowView(row)}>
            <FaEye color="#2d1c63" size={22} />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  };

  useEffect(() => {
    fetchAdesoes(1);
    setOnLoad(true);
  }, []);

  return (
    <Stack width={"calc(100% - 28px)"}>
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
        my={2}
      >
        <h2 className="text-2xl text-default font-extrabold"></h2>
        <Stack direction={'row'} alignItems={'center'} gap={2}>
          <Chip
            variant="filled"
            color={"success"}
            label={`Concluídas: ${adesoesConcluidas}`}
            icon={<FaFileSignature />}
            sx={{ p: 1 }}
          />
          <Chip
            variant="filled"
            color={"warning"}
            label={`Pendentes: ${adesoesPendentes}`}
            icon={<IoWarning />}
            sx={{ p: 1 }}
          />
          <Button
            color="secondary"
            variant="contained"
            endIcon={<IoMdAdd />}
            onClick={() => {
              navigate("/adesoes/edit");
            }}
            sx={{ borderRadius: 2 }}
          >
            Adicionar
          </Button>
        </Stack>
      </Stack>
      <Slide direction="right" in={onLoad} mountOnEnter>
        <Paper
          elevation={0}
          sx={{
            p: 1,
            flexGrow: 1,
            width: "100%",
            height: "calc(100vh - 170px)",
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
            {loading ? (
              <LoadingTable />
            ) : adesoes.length > 0 ? (
              <BasicTable
                totalPages={adesoes.length}
                columns={adesoesColumns}
                rows={adesoes}
                loading={loading}
                dataRow={dataRow}
                page={page}
                handleChangePagination={handleChangePagination}
              />
            ) : (
              <NoTableData
                pronoum={"he"}
                pageName="aluno"
                disabledButton={false}
                onClickAction={() => navigate("/adesoes/edit")}
              />
            )}
          </Paper>
        </Paper>
      </Slide>
    </Stack>
  );
};

export default AdesoesPage;
