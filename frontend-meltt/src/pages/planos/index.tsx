import {
  Button,
  Chip,
  Paper,
  Slide,
  Stack,
  TableCell,
  TableRow,
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
import { planosFormaturaColumns } from "./table/columns";
import { BsCash } from "react-icons/bs";

const PlanosFormaturaPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [onLoad, setOnLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [planosFormatura, setPlanosFormatura] = useState([]);


  const fetchPlanosFormaturas = async (page: number) => {
    setLoading(true);
    try {
      const response = await apiGetData("academic", `/planos-formatura?page=${page}`);
      setTotalPages(response.totalPages);
      setPlanosFormatura(response.data);
    } catch (error) {
      toast.error("Erro ao buscar planos de formatura");
    }
    setLoading(false);
  }

  useEffect(() => {
    setOnLoad(true);
    fetchPlanosFormaturas(1);
  }, []);


  const handleChangePagination = (_: React.ChangeEvent<unknown>, value: number) => {
    try {
      fetchPlanosFormaturas(value);
    } catch (error) {
      toast.error("Erro ao buscar Planos de Formatura");
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
          <Chip
            label={`R$${row.valor}`}
            variant="outlined"
            icon={<BsCash />}
            sx={{ flexDirection: "row-reverse", paddingRight: 2 }}
          />
        </TableCell>
        <TableCell align="left">
          {row.incluso}
        </TableCell>
      </TableRow>
    );
  };


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
            navigate("/processos-internos/planos-formatura/new");
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
            ) : planosFormatura?.length > 0 ? (
              <BasicTable
                totalPages={totalPages}
                columns={planosFormaturaColumns}
                rows={planosFormatura}
                loading={loading}
                dataRow={dataRow}
                page={page}
                handleChangePagination={handleChangePagination}
              />
            ) : (
              <NoTableData
                pronoum={"he"}
                pageName="Plano de Formatura"
                disabledButton={false}
                onClickAction={() => navigate("/planos-formatura/new")}
              />
            )}
          </Paper>
        </Paper>
      </Slide>
    </Stack>
  );
};

export default PlanosFormaturaPage;
