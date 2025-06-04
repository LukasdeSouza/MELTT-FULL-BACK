import {
  Box,
  Button,
  IconButton,
  Paper,
  Slide,
  Stack,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import BasicTable from "../../components/table";
import { useEffect, useState } from "react";
import { useTurmaContext, Turma } from "../../providers/turmaContext";
import { useNavigate } from "react-router-dom";
import { apiGetData, apiPostData } from "../../services/api";
import { IoIosDocument, IoMdAdd } from "react-icons/io";
import { jwtDecode } from "jwt-decode";
import { getToken } from "../../utils/token";
import { CustomJwtPayload } from "../../components/customDrawer";
import toast from "react-hot-toast";
import NoTableData from "../../components/noData";
import LoadingTable from "../../components/loadingTable";
import { turmasColumns } from "./table/columns";
import { format, parseISO } from 'date-fns';

import { FaEye } from "react-icons/fa6";
import CustomModal from "../../components/modal";
import { PiSignature } from "react-icons/pi";
import { MdOutlineModeEdit } from "react-icons/md";


const TurmasPage = () => {
  const navigate = useNavigate();
  const { dispatchTurma } = useTurmaContext();
  const token = getToken();
  const decoded = token ? jwtDecode<CustomJwtPayload>(token) : null;

  const [page, setPage] = useState(1);

  const [onLoad, setOnLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  const [openModal, setOpenModal] = useState(false);

  const [turmas, setTurmas] = useState<any>([]);

  const [uuidContrato, setUuidContrato] = useState("")
  const [emailToSign, setEmailToSign] = useState<string>("")


  const onSendToSign = async () => {
    toast.loading("Enviando documento para Assinatura");
    console.log('emailToSign', emailToSign)
    let createListObj = {
      signers: [{ email: emailToSign, act: "1", foreign: "0", certificadoicpbr: "1" }],
      uuid_document: uuidContrato
    }
    let signerListObj = { message: "\"Olá! Segue contrato MELTT para assinatura.\"", workflow: "0", skip_email: "0", uuid_document: uuidContrato }

    try {
      const createList = await apiPostData("academic", "/d4sign/create-signature-list", createListObj)
      const sendSigner = await apiPostData("academic", "/d4sign/send-to-signer", signerListObj);
      console.log(createList)
      console.log(sendSigner)
      toast.dismiss()
      toast.success('Contrato Enviado com Sucesso')
    } catch (error) {
      toast.error('Erro ao enviar arquivo para assinatura')
      toast.dismiss();
    } finally {
      toast.dismiss();
      setOpenModal(false)
    }

  }

  const onSendToSignStudentEstatuto = async () => {
    toast.loading("Enviando documento para Assinatura");

    let createListObj = {
      signers: [{ email: decoded?.email, act: "1", foreign: "0", certificadoicpbr: "1" }],
      uuid_document: turmas[0]?.estatuto_uuid
    }
    let signerListObj = { message: "\"Olá! Segue ESTATUTO MELTT para assinatura.\"", workflow: "0", skip_email: "0", uuid_document: turmas[0]?.estatuto_uuid }

    try {
      const createList = await apiPostData("academic", "/d4sign/create-signature-list", createListObj)
      const sendSigner = await apiPostData("academic", "/d4sign/send-to-signer", signerListObj);
      console.log(createList)
      console.log(sendSigner)
      toast.dismiss()
    } catch (error) {
      toast.error('Erro ao enviar arquivo para assinatura')
      toast.dismiss();
    } finally {
      toast.dismiss();
      toast.success(`Contrato Enviado com Sucesso. Confira seu Email: ${decoded?.email}`)
      setOpenModal(false)
    }
  }

  const fetchTurmas = async (page: number) => {
    setLoading(true);
    if (decoded?.tipo === 'ALUNO') {
      try {
        const response = await apiGetData("academic", `/turmas/${decoded?.turma_id}`);
        setTurmas(response.data);
      } catch (error) {
        toast.error("Erro ao buscar turmas");
      }
    }
    else {
      try {
        const response = await apiGetData("academic", `/turmas?page=${page}`);
        setTotalPages(response.totalPages);
        setTurmas(response.data);
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
    console.log('row', row.id)
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
          {row?.criado_em ? format(parseISO(row?.criado_em), "dd/MM/yyyy") : "N/As"}
        </TableCell>
        <TableCell align="left">
          <Tooltip title='Editar Turma'>
            <IconButton
              onClick={() => {
                dispatchTurma({ type: "SET_TURMA_SELECIONADA", payload: row });
                navigate(`/turmas/edit/${row.id}`)
              }}>
              <MdOutlineModeEdit />
            </IconButton>
          </Tooltip>
          <Tooltip title='Enviar para Assinatura'>
            <IconButton
              disabled={row.meltt_contrato_uuid === null}
              onClick={() => {
                setUuidContrato(row.meltt_contrato_uuid)
                setOpenModal(true)
              }}>
              <PiSignature />
            </IconButton>
          </Tooltip>
          <Tooltip title="Visualizar Turma">
            <IconButton
              onClick={() => {
                console.log('row', row.id)
                navigate(`/turmas/view/${row.id}/pagina-turma`)
              }}>
              <FaEye />
            </IconButton>
          </Tooltip>
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
          {row.criado_em ? format(parseISO(row.criado_em), "dd/MM/yyyy") : "N/A"}
        </TableCell>
        <TableCell align="left">
          <Tooltip title="Assinar Estatuto">
            <IconButton onClick={onSendToSignStudentEstatuto}>
              <IoIosDocument color="#2d1c63" size={22} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ver Página da Turma" arrow>
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
            ) : turmas.length > 0 ? (
              <BasicTable
                totalPages={totalPages}
                columns={turmasColumns}
                rows={turmas}
                loading={loading}
                dataRow={
                  decoded?.tipo === "ALUNO" ? dataRowStudent : dataRowAdmin
                }
                page={page}
                handleChangePagination={handleChangePagination}
              />
            ) : (
              <NoTableData
                pronoum={"he"}
                pageName="turma"
                disabledButton={false}
                onClickAction={() => navigate("/turmas/new")}
              />
            )}
          </Paper>
        </Paper>
      </Slide>
      <CustomModal
        title="Enviar Contrato para Assinatura"
        subHeader="preencha o email que receberá o contrato da turma para assinatura"
        openModal={openModal}
        handleCloseModal={() => setOpenModal(false)}
        onSubmit={onSendToSign}
      >
        <Box component={'form'} sx={{ width: '100%' }}>
          <TextField
            fullWidth
            label="E-mail que receberá o contrato"
            placeholder="email que receberá o contrato MELTT"
            value={emailToSign}
            onChange={(e) => setEmailToSign(e.target.value)}
          />
        </Box>
      </CustomModal>
    </Stack>
  );
};

export default TurmasPage;
