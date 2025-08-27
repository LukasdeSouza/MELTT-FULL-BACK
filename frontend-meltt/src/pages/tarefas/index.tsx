import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Slide,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
} from "@mui/material";
import BasicTable from "../../components/table";
import { useEffect, useState } from "react";
import { Tarefa } from "../../providers/tarefaContext";
import { useNavigate } from "react-router-dom";
import { apiDeleteData, apiGetData } from "../../services/api";
import { IoMdAdd, IoMdTrash } from "react-icons/io";
import toast from "react-hot-toast";
import NoTableData from "../../components/noData";
import LoadingTable from "../../components/loadingTable";
import { format, parseISO } from 'date-fns';

import { tarefasColumns } from "./table/columns";
import { useTarefaContext } from "../../providers/tarefaContext";
import { getToken } from "../../utils/token";
import { jwtDecode } from "jwt-decode";
import { CustomJwtPayload } from "../../components/customDrawer";

const TarefasPage = () => {
  const navigate = useNavigate();
  const { dispatchTarefa } = useTarefaContext();
  const [page, setPage] = useState(1);
  const [onLoad, setOnLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tarefas, setTarefas] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const token = getToken();
  const decoded = token ? jwtDecode<CustomJwtPayload>(token) : null;
  // const [responsaveis, setResponsaveis] = useState<{ tarefa_id: number; usuario_nome: string }[]>([]);
  // const [usuarios, setUsuarios] = useState([]);


  // const fetchResponsaveis = async () => {
  //   try {
  //     const response = await apiGetData("academic", "/tarefas/responsaveis");
  //     // setResponsaveis(response);
  //   } catch (error) {
  //     toast.error("Erro ao buscar responsáveis");
  //   }
  // }

  // useEffect(() => {
  //   fetchResponsaveis();
  // }, []);

  // const fetchUsuarios = async () => {
  //   try {
  //     const response = await apiGetData("academic", "/usuarios");
  //     setUsuarios(response.data)
  //   } catch (error) {
  //     toast.error("Erro ao buscar responsáveis");
  //   }
  // }

  const fetchTarefas = async (page: number) => {
    setLoading(true);
    try {
      const response = await apiGetData("academic", `/tarefas?page=${page}`);
      setTotalPages(response.totalPages);
      setTarefas(response.data);
    } catch (error) {
      toast.error("Erro ao buscar tarefas");
    }

    setLoading(false);
  };

  // useEffect(() => {
  //   fetchUsuarios();
  //   fetchResponsaveis();
  // }, [])

  const handleChangePagination = (_: React.ChangeEvent<unknown>, value: number) => {
    try {
      fetchTarefas(value);
    } catch (error) {
      toast.error("Erro ao buscar Turmas");
    }
    setPage(value);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDeleteData("academic", `/tarefas/desvincular-responsavel`, {
        tarefa_id: id,
        usuario_id: decoded?.id
      });
      await apiDeleteData("academic", `/tarefas/${id}`);
      await fetchTarefas(page);
      toast.success("Tarefa excluída com sucesso");
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
      toast.error("Erro ao excluir tarefa");
    }
  };

  const dataRow = (row: Tarefa) => {
    return (
      <TableRow
        key={row.id}
        sx={{
          "&:last-child td, &:last-child th": { border: 0 },
          " &:hover": { bgcolor: "#F7F7F7", cursor: "pointer" },
        }}
      >
        <TableCell component="th" scope="row">
          <Stack direction={"row"} alignItems={"center"} gap={1}>
            {row.nome}
          </Stack>
        </TableCell>
        <TableCell align="left">
          <Chip
            label={row.status === 1 ? 'Ativa' : 'Inativa'}
            color={row.status === 1 ? 'success' : 'warning'}
            sx={{
              mt: 0.5,
              fontWeight: 500,
            }}
          />
        </TableCell>
        <TableCell align="left">
          {row.atribuido_por}
        </TableCell>
        <TableCell align="left">
          {row?.criado_em ? format(parseISO(row?.criado_em), "dd/MM/yyyy") : "N/As"}
        </TableCell>
        <TableCell align="left">
          <Stack direction={"row"}>
            <Box sx={{ display: "flex", gap: 1 }}>
              {/* <Tooltip title="Editar Tarefa" arrow>
                <IconButton onClick={() => {
                  dispatchTarefa({ type: "SET_TAREFA_SELECIONADA", payload: row });
                  navigate(`/processos-internos/tarefas/edit/${row.id}`)
                }}>
                  <MdModeEdit color="#2d1c63" size={22} />
                </IconButton>
              </Tooltip> */}
              <Tooltip title="Desativar Tarefa" arrow>
                <IconButton onClick={() => handleDelete(row.id)}>
                  <IoMdTrash className="text-red-600" size={22} />
                </IconButton>
              </Tooltip>
            </Box>
          </Stack>
        </TableCell>
      </TableRow>
    );
  };


  useEffect(() => {
    fetchTarefas(1);
    setOnLoad(true);
  }, []);

  return (
    <Stack width={"calc(100% - 64px)"}>
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
        my={2}
      >
        <h2 className="text-2xl text-default font-extrabold"></h2>
        <Button
          color="secondary"
          variant="contained"
          endIcon={<IoMdAdd />}
          onClick={() => {
            dispatchTarefa({ type: "SET_TAREFA_SELECIONADA", payload: null });
            navigate("/processos-internos/tarefas/new");
          }}
          sx={{ borderRadius: 2 }}
        >
          Adicionar
        </Button>
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
            ) : tarefas?.length > 0 ? (
              <BasicTable
                totalPages={totalPages}
                columns={tarefasColumns}
                rows={tarefas}
                loading={loading}
                dataRow={dataRow}
                page={page}
                handleChangePagination={handleChangePagination}
              />
            ) : (
              <NoTableData
                pronoum={"he"}
                pageName="tarefas"
                disabledButton={false}
                onClickAction={() => navigate("/processos-internos/tarefas/new")}
              />
            )}
          </Paper>
        </Paper>
      </Slide>
    </Stack>
  );
};

export default TarefasPage;
