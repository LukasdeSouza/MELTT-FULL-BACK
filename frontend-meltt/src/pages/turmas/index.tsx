import {
  Box,
  Button,
  IconButton,
  Modal,
  Paper,
  Slide,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import BasicTable from "../../components/table";
import { useEffect, useState } from "react";
import { useTurmaContext, Turma } from "../../providers/turmaContext";
import { useNavigate } from "react-router-dom";
import { apiGetData } from "../../services/api";
import { IoIosDocument, IoMdAdd } from "react-icons/io";
import { jwtDecode } from "jwt-decode";
import { getToken } from "../../utils/token";
import { CustomJwtPayload } from "../../components/customDrawer";
import toast from "react-hot-toast";
import NoTableData from "../../components/noData";
import LoadingTable from "../../components/loadingTable";
import { turmasColumns } from "./table/columns";
import { format } from "date-fns";
import { FaEye } from "react-icons/fa6";
import { MdModeEdit } from "react-icons/md";


const TurmasPage = () => {
  const navigate = useNavigate();
  const { dispatchTurma } = useTurmaContext();
  const [page, setPage] = useState(1);
  const [onLoad, setOnLoad] = useState(false);
  const [loading, setLoading] = useState(false);

  const [turmas, setTurmas] = useState([]);
  const [totalPages, setTotalPages] = useState(0);

  const [openModalDetails, setOpenModalDetails] = useState(false);

  const token = getToken();
  const decoded = token ? jwtDecode<CustomJwtPayload>(token) : null;

  const fetchTurmas = async (page: number) => {
    setLoading(true);
    if (decoded?.tipo === "ADMIN") {
      try {
        const response = await apiGetData("academic", `/turmas?page=${page}`);
        setTotalPages(response.totalPages);
        setTurmas(response.data);
      } catch (error) {
        toast.error("Erro ao buscar turmas");
      }
    } if (decoded?.tipo === 'ALUNO') {
      try {
        const response = await apiGetData("academic", `/turmas/${decoded?.turma_id}`);
        setTurmas(response);
      } catch (error) {
        toast.error("Erro ao buscar turmas");
      }
    }

    setLoading(false);
  };

  const handleChangePagination = (_: React.ChangeEvent<unknown>, value: number) => {
    try {
      fetchTurmas(value);
    } catch (error) {
      toast.error("Erro ao buscar Turmas");
    }
    setPage(value);
  };


  const dataRowAdmin = (row: Turma) => {
    return (
      <TableRow
        key={row.nome}
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
        <TableCell align="left">{row.ano_formatura}</TableCell>
        <TableCell align="left">
          {row.criado_em ? format(row.criado_em, "dd/MM/yyyy") : "N/As"}
        </TableCell>
        <TableCell align="left">
          <Stack direction={"row"}>
            <Tooltip title="Editar Turma" arrow>
              <IconButton onClick={() => {
                dispatchTurma({ type: "SET_TURMA_SELECIONADA", payload: row });
                navigate(`/turmas/edit/${row.id}`)
              }}>
                <MdModeEdit color="#2d1c63" size={22} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Ver Estatuto">
              <IconButton onClick={() => window.open(row.arquivo_url, "_blank")}>
                <IoIosDocument color="#2d1c63" size={22} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Visualizar Turma" arrow>
              <IconButton
                onClick={() => navigate(`/turmas/view/${row.id}/pagina-turma`)}
              >
                <FaEye color="#2d1c63" size={22} />
              </IconButton>
            </Tooltip>
          </Stack>
        </TableCell>
      </TableRow>
    );
  };

  const dataRowStudent = (row: Turma) => {
    return (
      <TableRow
        key={row.nome}
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
        <TableCell align="left">{row.ano_formatura}</TableCell>
        <TableCell align="left">
          {row.criado_em ? format(row.criado_em, "dd/MM/yyyy") : "N/As"}
        </TableCell>
        <TableCell align="left">
          <Tooltip title="Ver Estatuto">
            <IconButton onClick={() => window.open(row.arquivo_url, "_blank")}>
              <IoIosDocument color="#2d1c63" size={22} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ver página da turma" arrow>
            <IconButton
              onClick={() => navigate(`/turmas/view/${row.id}/pagina-turma`)}
            >
              <FaEye color="#2d1c63" size={22} />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
    );
  };

  useEffect(() => {
    fetchTurmas(1);
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
            dispatchTurma({ type: "SET_TURMA_SELECIONADA", payload: null });
            navigate("/turmas/new");
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
            ) : turmas?.length > 0 ? (
              <BasicTable
                totalPages={totalPages}
                columns={turmasColumns}
                rows={turmas}
                loading={loading}
                dataRow={
                  decoded?.tipo === "ADMIN" ? dataRowAdmin : dataRowStudent
                }
                page={page}
                handleChangePagination={handleChangePagination}
              />
            ) : (
              <NoTableData
                pronoum={"he"}
                pageName="aluno"
                disabledButton={false}
                onClickAction={() => navigate("/turmas/edit")}
              />
            )}
          </Paper>
        </Paper>
      </Slide>
      <Modal
        open={openModalDetails}
        onClose={() => setOpenModalDetails(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
        }}>
          <Typography color="textPrimary" variant="h6" component="h2">
            Text in a modal
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
          </Typography>
        </Box>
      </Modal>
    </Stack>
  );
};

export default TurmasPage;
