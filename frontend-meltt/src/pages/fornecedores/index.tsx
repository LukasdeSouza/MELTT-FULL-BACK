import {
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Slide,
  Stack,
  TableCell,
  TableRow,
  TextField,
} from "@mui/material";
import BasicTable from "../../components/table";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiDeleteData, apiGetData } from "../../services/api";
import { IoMdAdd } from "react-icons/io";
import toast from "react-hot-toast";
import NoTableData from "../../components/noData";
import LoadingTable from "../../components/loadingTable";
import { MdModeEdit } from "react-icons/md";
import { fornecedoresColumns } from "./table/columns";
import { FaSearch, FaTimes, FaTrashAlt } from "react-icons/fa";
import { useFornecedorContext } from "../../providers/fornecedorContext";

interface Fornecedor {
  id: number;
  nome: string;
  telefone: string;
  cnpj: string;
  responsavel: string;
}

const FornecedoresPage = () => {
  const navigate = useNavigate();
  const { dispatchFornecedor } = useFornecedorContext();
  const [loading, setLoading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [pages, setPages] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [fornecedores, setFornecedores] = useState([]);
  const [onLoad, setOnLoad] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchFornecedores = async (page: number, nome?: string) => {
    setLoading(true);
    try {
      let url = `/fornecedores`;
      const params = new URLSearchParams();

      if (page > 1) {
        params.append('page', page.toString());
      }

      if (nome && nome.trim()) {
        params.append('nome', nome.trim());
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await apiGetData("academic", url);
      setTotalPages(response.totalPages);
      setPages(response.page);
      setFornecedores(response.data);
    } catch (error) {
      toast.error("Erro ao buscar fornecedores");
    }
    setLoading(false);
  };

  const handleSearch = (searchValue: string) => {
    setSearchTerm(searchValue);
    setPages(1); // Reset para primeira página ao buscar
    fetchFornecedores(1, searchValue);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setPages(1);
    fetchFornecedores(1);
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
      if (response.message.includes("deletado")) {
        fetchFornecedores(1);
        toast.success("Fornecedor excluído com sucesso");
      }
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
        <TableCell align="left">{row.nome}</TableCell>
        <TableCell align="left">{row.responsavel}</TableCell>
        <TableCell align="left">{row.telefone}</TableCell>
        <TableCell align="left">{row.cnpj}</TableCell>
        <TableCell>
          <Stack direction={"row"} alignItems={"center"} justifyContent={"center"}>
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
    fetchFornecedores(1);
    setOnLoad(true);
  }, []);

  return (
    <Stack width={"calc(100% - 64px)"}>
      <Stack my={2} width={'100%'} direction="row" alignItems={"center"} justifyContent={"space-between"}>
        <TextField
          size="small"
          placeholder="Buscar fornecedor por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch(searchTerm);
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FaSearch color="#666" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={clearSearch}
                  sx={{ p: 0.5 }}
                >
                  <FaTimes color="#666" size={14} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            flex: 1,
            maxWidth: 400,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />
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
            height: {
              xs: "400px", // Altura fixa no mobile
              sm: "500px", // Altura fixa no tablet
              md: "calc(100vh - 200px)", // Dinâmica no desktop
            },
            minHeight: "300px",
            borderRadius: 4,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              height: {
                xs: "400px", // Altura fixa no mobile
                sm: "500px", // Altura fixa no tablet
                md: "calc(100vh - 200px)", // Dinâmica no desktop
              },
              minHeight: "300px",
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
                page={pages}
                totalPages={totalPages}
                handleChangePagination={(_, page) => {
                  setPages(page)
                  fetchFornecedores(page)
                }}
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
