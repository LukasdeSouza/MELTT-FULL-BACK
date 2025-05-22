import {
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Slide,
  Stack,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import BasicTable from "../../components/table";
import { Key, useEffect, useState } from "react";
import { apiGetData, apiPostData } from "../../services/api";
import { EnumStudentBasicEducation } from "../../utils/enums";
import toast from "react-hot-toast";
import NoTableData from "../../components/noData";
import LoadingTable from "../../components/loadingTable";
import { MdOutlinePayments } from "react-icons/md";
import { FaEye, FaUserGraduate } from "react-icons/fa6";
import { pagamentosColumns, pagamentosStudentColumns } from "./table/columns";
import { format } from "date-fns";
import { BiSearch } from "react-icons/bi";
import { getToken } from "../../utils/token";
import { jwtDecode } from "jwt-decode";
import { CustomJwtPayload } from "../../components/customDrawer";
import CustomModal from "../../components/modal";
import { Turma } from "../../types";

interface Student {
  id: number;
  name: Key | null | undefined;
  numeroDocumento: string;
  valor: string;
  vencimento: string;
  situacao: number;
  plano: string;
  linkBoleto: string;
  educacao_basica: keyof typeof EnumStudentBasicEducation;
  formatura_paga: boolean;
  turma: string;
}

const PagamentosPage = () => {
  const token = getToken();
  const decoded = token ? jwtDecode<CustomJwtPayload>(token) : null;

  const [openModalCreateUser, setOpenModalCreateUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [payment, setPayment] = useState<Student | null>(null);
  const [turmas, setTurmas] = useState([]);

  const [turmaId, setTurmaId] = useState<number | null>(null);

  const [onLoad, setOnLoad] = useState(false);
  const [loadingSaveNewUser, setLoadingSaveNewUser] = useState(false);

  const [page, setPage] = useState(1);
  const [filterSituation, setFilterSituation] = useState<string | null>(null);

  const fetchPagamentos = async (page: number) => {
    setLoading(true);
    if (decoded?.tipo === 'ADMIN') {
      try {
        const params = new URLSearchParams();
        params.append("page", page.toString());

        const response = await apiGetData("academic", `/pagamentos?${params.toString()}`);
        setPayments(response.data);
      } catch (error) {
        toast.error("Erro ao buscar Pagamento");
      }
    } if (decoded?.tipo === 'ALUNO') {
      try {
        const params = new URLSearchParams();

        if (filterSituation) {
          params.append("situacoes", filterSituation);
        }

        const response = await apiGetData("academic", `/pagamentos/idBling/${decoded?.id_bling}`);
        setPayments(response);
      } catch (error) {
        toast.error("Erro ao buscar Pagamento");
      }
    }
    setLoading(false);
  };

  const fetchTurmas = async () => {
    try {
      let response = await apiGetData("academic", "/turmas");
      setTurmas(response.data);
    } catch (error) {
      toast.error("Erro ao buscar Turmas");
    }
  }

  const fetchWithFilters = async () => {
    setLoading(true);
    try {
      let situacao = filterSituation

      const response = await apiGetData("academic", `/pagamentos/situacao/${situacao}`);
      setPayments(response.data);
    } catch (error) {
      toast.error("Erro ao aplicar filtro");
    }
    setLoading(false);

  }

  const handleChangePagination = (_: React.ChangeEvent<unknown>, value: number) => {
    try {
      fetchPagamentos(value);
    } catch (error) {
      toast.error("Erro ao buscar Pagamentos");
    }
    setPage(value);
  };

  const onSubmitNewUser = async (_: Student) => {
    setLoadingSaveNewUser(true);

    let dataObj = {
      email: `${payment?.numeroDocumento}@meltt.com.br`,
      senha: payment?.id.toString(),
      tipo: "ALUNO",
      documento: payment?.numeroDocumento,
      nome: decoded?.nome,
      id_bling: payment?.id.toString(),
      ativo: 1,
      telefone: null,
      turma_id: turmaId,
    };

    try {
      const response = await apiPostData("academic", "/usuarios", { ...dataObj });
      if (response.id) {
        toast.success(`Usuário criado com sucesso. E-mail: ${payment?.numeroDocumento}@meltt.com.br  | Senha: ${payment?.id}`, {
          duration: 20000,
          icon: "👏",
        });
        setOpenModalCreateUser(false);
      }
    } catch (error) {
      console.log(error)
      toast.error("Erro ao criar usuário para aluno. Confira se o e-mail já não está cadastrado");
    }
    setLoadingSaveNewUser(false);
  }

  const dataRow = (row: Student) => {
    return (
      <TableRow
        key={row.id}
        sx={{
          "&:last-child td, &:last-child th": { border: 0 },
          " &:hover": { bgcolor: "#F7F7F7", cursor: "pointer" },
        }}
      >
        <TableCell component="th" scope="row">
          {row.numeroDocumento}
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          R$ {row.valor}
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          {row.vencimento ? format(new Date(row.vencimento), "dd/MM/yyyy") : ""}
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          <Chip
            label={row.situacao === 2 ? "Pago" : row.situacao === 1 ? 'Em Aberto' : 'Cancelado'}
            color={row.situacao === 2 ? "success" : row.situacao === 1 ? "warning" : "error"}
            variant="filled"
            icon={<MdOutlinePayments />}
            sx={{ padding: 1 }}
          />
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          <Stack direction={'row'} alignItems={'center'} gap={2}>
            <Tooltip title="Visualizar Boleto">
              <IconButton size="small" onClick={() => window.open(row.linkBoleto, "_blank")}>
                <FaEye color="#2d1c63" size={22} />
              </IconButton>
            </Tooltip>
            {decoded?.tipo === 'ADMIN' && (
              <Tooltip title="Criar Usuário para Aluno">
                <IconButton
                  size="small"
                  onClick={async () => {
                    setPayment(row)
                    await fetchTurmas()
                    setOpenModalCreateUser(true)
                  }}>
                  <FaUserGraduate size={20} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </TableCell>
      </TableRow>
    );
  };

  const dataRowStudent = (row: any) => {
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
            sx={{ fontFamily: "Poppins" }}
          >
            {row.id_bling}
          </Link>
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          R$ {row.valor}
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          {row.vencimento ? format(new Date(row.vencimento), "dd/MM/yyyy") : ""}
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          <Chip
            label={row.situacao === 2 ? "Pago" : row.situacao === 1 ? 'Em Aberto' : 'Cancelado'}
            color={row.situacao === 2 ? "success" : row.situacao === 1 ? "warning" : "error"}
            variant="filled"
            icon={<MdOutlinePayments />}
            sx={{ padding: 1 }}
          />
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          <Stack direction={'row'} alignItems={'center'} gap={2}>
            <Tooltip title="Visualizar Boleto">
              <IconButton size="small" onClick={() => window.open(row.linkBoleto, "_blank")}>
                <FaEye color="#2d1c63" size={22} />
              </IconButton>
            </Tooltip>
          </Stack>
        </TableCell>
      </TableRow>
    );
  }

  useEffect(() => {
    fetchPagamentos(1);
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
      </Stack>
      <Slide direction="right" in={onLoad} mountOnEnter>
        <Paper
          elevation={0}
          sx={{
            p: 1,
            flexGrow: 1,
            width: "100%",
            height: "calc(100vh - 70px)",
            borderRadius: 4,
          }}
        >
          {decoded?.tipo === 'ADMIN' && (
            <Stack direction={'row'} alignItems={'center'} gap={2} p={2}>
              <FormControl sx={{ width: '20%' }}>
                <InputLabel sx={{ p: 0.3, bgcolor: '#fff' }}>filtrar por Status</InputLabel>
                <Select
                  value={filterSituation}
                  label="status"
                  onChange={(e) => setFilterSituation(e.target.value)}
                >
                  <MenuItem value={2}>Pago</MenuItem>
                  <MenuItem value={1}>Em Aberto</MenuItem>
                  <MenuItem value={5}>Cancelado</MenuItem>
                </Select>
              </FormControl>
              <Button color="primary" size="small" startIcon={<BiSearch />} onClick={fetchWithFilters}>
                Buscar
              </Button>
            </Stack>
          )}
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
            ) : payments?.length > 0 ? (
              <BasicTable
                columns={decoded?.tipo === 'ADMIN' ? pagamentosColumns : pagamentosStudentColumns}
                rows={payments}
                loading={loading}
                dataRow={decoded?.tipo === 'ADMIN' ? dataRow : dataRowStudent}
                page={page}
                totalPages={80}
                handleChangePagination={handleChangePagination}
              />
            ) : (
              <NoTableData
                pronoum={"he"}
                pageName="pagamento"
                disabledButton={false}
                onClickAction={() => { }}
              />
            )}
          </Paper>
        </Paper>
      </Slide>
      <CustomModal
        title="Criar usuário para Aluno"
        subHeader="o documento e a senha usada aqui será para o aluno acessar o sistema"
        openModal={openModalCreateUser}
        onSubmit={onSubmitNewUser}
        loadingSave={loadingSaveNewUser}
        handleCloseModal={() => setOpenModalCreateUser(false)}
      >
        <Stack direction={"column"} gap={2}>
          <TextField
            label="Nome Completo"
            variant="outlined"
            focused
            fullWidth
            value={payment?.nome ?? ""}
            size="small"
            disabled
          />
          <TextField
            label="Documento(CPF)"
            variant="outlined"
            fullWidth
            size="small"
            value={payment?.numeroDocumento}
            disabled
          />
          <FormControl fullWidth>
            <InputLabel sx={{ p: 0.3, bgcolor: "#fff" }}>
              Turma do Aluno
            </InputLabel>
            <Select variant="outlined" value={turmaId} onChange={(e) => setTurmaId(e.target.value as number)}>
              {turmas.map((turma: Turma) => (
                <MenuItem key={turma.id} value={turma.id}>{turma.nome} - {turma.identificador}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Senha do Aluno"
            variant="outlined"
            fullWidth
            size="small"
            value={payment?.numeroDocumento}
            disabled
          />
          <TextField
            label="E-mail para acesso do usuário (ANOTE PARA NÃO PERDER)"
            variant="outlined"
            fullWidth
            size="small"
            value={`${payment?.numeroDocumento}@meltt.com.br`}
            disabled
          />
          <TextField
            label="Identificador Bling"
            variant="outlined"
            fullWidth
            size="small"
            value={payment?.id}
            disabled
          />
        </Stack>
      </CustomModal>
    </Stack>
  );
};

export default PagamentosPage;
