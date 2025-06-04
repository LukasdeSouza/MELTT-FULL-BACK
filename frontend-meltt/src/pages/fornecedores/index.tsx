import {
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Slide,
  Stack,
  TableCell,
  TableRow,
} from "@mui/material";
import BasicTable from "../../components/table";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiDeleteData, apiGetData } from "../../services/api";
import { IoMdAdd } from "react-icons/io";
import toast from "react-hot-toast";
import NoTableData from "../../components/noData";
import LoadingTable from "../../components/loadingTable";
import { MdModeEdit, MdOutlinePayments } from "react-icons/md";
import { fornecedoresColumns } from "./table/columns";
import { FaTrashAlt } from "react-icons/fa";
import { useFornecedorContext } from "../../providers/fornecedorContext";

interface Fornecedor {
  id: number;
  nome: string;
  tipo_servico: string;
  telefone: string;
  valor_cotado: string;
  turma_nome: string;
  status: string;
}

const FornecedoresPage = () => {
  const navigate = useNavigate();
  const { dispatchFornecedor } = useFornecedorContext();
  const [loading, setLoading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [fornecedores, setFornecedores] = useState([]);
  const [onLoad, setOnLoad] = useState(false);
  //   const token = getToken();
  //   const decoded = token ? jwtDecode<CustomJwtPayload>(token) : null;

  const fetchFornecedores = async () => {
    setLoading(true);
    try {
      const response = await apiGetData("academic", "/fornecedores");
      setFornecedores(response.data);
    } catch (error) {
      toast.error("Erro ao buscar fornecedores");
    }
    setLoading(false);
  };

  const onClickRow = (row: any) => {
    dispatchFornecedor({ type: "SET_FORNECEDOR_SELECIONADO", payload: row });
    navigate(`/fornecedores/edit/${row.id}`);
  };

  const onClickDelete = async (row: Fornecedor) => {
    setLoadingDelete(true);
    try {
      const response = await apiDeleteData(
        "academic",
        `/fornecedores/${row.id}`
      );
      if (response.message.includes("deletadO")) {
        fetchFornecedores();
        toast.success("Fornecedor excluído com sucesso");
      }
      console.log("response", response);
    } catch (error) {
      toast.error("Erro ao excluir fornecedor");
    }
    setLoadingDelete(false);
  };

  const dataRow = (row: Fornecedor) => {
    return (
      <TableRow
        key={row.nome}
        sx={{
          "&:last-child td, &:last-child th": { border: 0 },
          " &:hover": { bgcolor: "#F7F7F7", cursor: "pointer" },
        }}
      >
        <TableCell component="th" scope="row">
          {row.nome}
        </TableCell>
        <TableCell align="left">{row.tipo_servico}</TableCell>
        <TableCell align="left">
          <Chip
            label={row.status}
            color={row.status.includes("não") ? "error" : "success"}
            variant="filled"
            icon={<MdOutlinePayments />}
            sx={{ padding: 1 }}
          />
        </TableCell>
        <TableCell align="left">{row.turma_nome}</TableCell>
        <TableCell align="left">
          <Chip
            label={`R$ ${row.valor_cotado}`}
            color="primary"
            variant="filled"
            icon={<MdOutlinePayments />}
            sx={{ padding: 1 }}
          />
        </TableCell>
        <TableCell align="left">
          <Stack direction={"row"}>
            <IconButton onClick={() => onClickRow(row)}>
              <MdModeEdit color="#2d1c63" size={22} />
            </IconButton>
            <IconButton onClick={() => onClickDelete(row)}>
              {loadingDelete ? (
                <CircularProgress color="secondary" size={12} />
              ) : (
                <FaTrashAlt size={20} className="text-red-600" />
              )}
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>
    );
  };

  useEffect(() => {
    fetchFornecedores();
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
            dispatchFornecedor({
              type: "SET_FORNECEDOR_SELECIONADO",
              payload: null,
            });
            navigate("/fornecedores/edit");
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
            ) : fornecedores?.length > 0 ? (
              <BasicTable
                columns={fornecedoresColumns}
                rows={fornecedores}
                loading={loading}
                dataRow={dataRow}
                page={1}
                totalPages={fornecedores?.length}
                handleChangePagination={() => {}}
              />
            ) : (
              <NoTableData
                pronoum={"he"}
                pageName="fornecedor"
                disabledButton={false}
                onClickAction={() => navigate("/fornecedores/edit")}
              />
            )}
          </Paper>
        </Paper>
      </Slide>
    </Stack>
  );
};

export default FornecedoresPage;
