import {
  Button,
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
import { apiGetData } from "../../services/api";
import { IoMdAdd } from "react-icons/io";
import toast from "react-hot-toast";
import NoTableData from "../../components/noData";
import LoadingTable from "../../components/loadingTable";
import { format, parseISO } from 'date-fns';

import { MdModeEdit } from "react-icons/md";
import { tarefasColumns } from "./table/columns";
import { useTarefaContext } from "../../providers/tarefaContext";

const TarefasPage = () => {
  const navigate = useNavigate();
  const { dispatchTarefa } = useTarefaContext();
  const [page, setPage] = useState(1);
  const [onLoad, setOnLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tarefas, setTarefas] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
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
          {row.responsaveis}
        </TableCell>
        <TableCell align="left">
          {row.atribuido_por}
        </TableCell>
        <TableCell align="left">
          {row?.criado_em ? format(parseISO(row?.criado_em), "dd/MM/yyyy") : "N/As"}
        </TableCell>
        <TableCell align="left">
          <Stack direction={"row"}>
            <Tooltip title="Editar Tarefa" arrow>
              <IconButton onClick={() => {
                dispatchTarefa({ type: "SET_TAREFA_SELECIONADA", payload: row });
                navigate(`/processos-internos/tarefas/edit/${row.id}`)
              }}>
                <MdModeEdit color="#2d1c63" size={22} />
              </IconButton>
            </Tooltip>
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
    <Stack width={"calc(100% - 28px)"}>
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
