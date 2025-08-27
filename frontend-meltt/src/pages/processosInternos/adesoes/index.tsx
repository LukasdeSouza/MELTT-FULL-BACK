import {
  Box,
  Button,
  Chip,
  IconButton,
  Link,
  Paper,
  Slide,
  Stack,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdAdd } from "react-icons/io";
import toast from "react-hot-toast";
import { FaEye, FaFileSignature } from "react-icons/fa6";
import { adesoesColumns } from "./table/columns";
import { format } from 'date-fns';

import { IoWarning } from "react-icons/io5";
import LoadingTable from "../../../components/loadingTable";
import BasicTable from "../../../components/table";
import NoTableData from "../../../components/noData";
import { useAdesaoContext } from "../../../providers/adesaoContext";
import { apiGetData, apiPostData } from "../../../services/api";
import { PiSignature } from "react-icons/pi";
import CustomModal from "../../../components/modal";

interface Adesao {
  id: string | number;
  faculdade: string;
  aluno_id: string;
  turma_id: string;
  status: string;
  data_assinatura: any;
  file_uuid: string | null;
  observacoes: string;
}

const AdesoesPage = () => {
  const navigate = useNavigate();
  const { dispatchAdesao } = useAdesaoContext();
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);

  const [adesoes, setAdesoes] = useState<Adesao[]>([]);
  const [signer, setSigner] = useState<string>("");
  const [adesoesPendentes, setAdesoesPendentes] = useState<[]>([]);
  const [adesoesConcluidas, setAdesoesConcluidas] = useState<[]>([]);
  const [adesoesCanceladas, setAdesoesCanceladas] = useState<[]>([]);

  const [openModal, setOpenModal] = useState(false);
  const [uuidAdesao, setUuidAdesao] = useState<string | null>(null);

  const [onLoad, setOnLoad] = useState(false);

  const fetchAdesoes = async (page: number) => {
    setLoading(true);
    try {
      let response = await apiGetData("academic", `/adesoes?page=${page}`)
      setAdesoes(response.data);
      setAdesoesConcluidas(response.totalConcluidas)
      setAdesoesPendentes(response.totalPendentes)
      setAdesoesCanceladas(response.totalCancelado)
    } catch (error) {
      toast.error("Erro ao buscar adesões");
    }
    setLoading(false);
  };

  const onSendToSign = async () => {
    toast.loading("Enviando Adesão para Assinatura");

    let createListObj = {
      uuid_document: uuidAdesao,
      signers: [{
        email: signer, act: "1", foreign: "0", certificadoicpbr: "1"
      }]
    }

    let signerListObj = { message: "\"Olá! Segue ADESAO de formatura da MELTT para assinatura.\"", workflow: "0", skip_email: "0", uuid_document: uuidAdesao }

    try {
      const createList = await apiPostData("academic", "/d4sign/create-signature-list", createListObj)
      const sendSigner = await apiPostData("academic", "/d4sign/send-to-signer", signerListObj);
      console.log(createList)
      console.log(sendSigner)
      toast.dismiss()
      toast.success('Adesão Enviada com Sucesso')
    } catch (error) {
      toast.error('Erro ao enviar adesão para assinatura')
      toast.dismiss();
    } finally {
      toast.dismiss();
      setOpenModal(false)
    }

  }


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
    navigate(`/processos-internos/adesoes/edit/${row.id}`);
  };


  const dataRow = (row: Adesao) => {
    console.log(row);
    return (
      <TableRow
        key={row.id}
        sx={{
          "&:last-child td, &:last-child th": { border: 0 },
          " &:hover": { bgcolor: "#F7F7F7", cursor: "pointer" },
        }}
      >
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          {row.turma_id}
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          <Chip
            label={row.status}
            component={Link}
            color="primary"
            variant="outlined"
            sx={{ fontFamily: "Poppins" }}
          />
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          {row.data_assinatura
            ? format(new Date(row.data_assinatura), 'dd/MM/yyyy')
            : 'não informada'}
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          {row.observacoes}
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          <Tooltip title='Enviar para Assinatura'>
            <IconButton
              disabled={row.file_uuid === null}
              onClick={() => {
                setUuidAdesao(row.file_uuid)
                setOpenModal(true)
              }}
            >
              <PiSignature />
            </IconButton>
          </Tooltip>
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
    <Stack width={"calc(100% - 64px)"}>
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
            label={`Concluídas/Assinadas: ${adesoesConcluidas}`}
            icon={<FaFileSignature />}
            sx={{ p: 1 }}
          />
          <Chip
            variant="filled"
            color={"warning"}
            label={`Pendentes de Assinatura: ${adesoesPendentes}`}
            icon={<IoWarning />}
            sx={{ p: 1 }}
          />
          <Chip
            variant="filled"
            color={"error"}
            label={`Canceladas: ${adesoesCanceladas}`}
            icon={<IoWarning />}
            sx={{ p: 1 }}
          />
          <Button
            color="secondary"
            variant="contained"
            endIcon={<IoMdAdd />}
            onClick={() => {
              navigate("/processos-internos/adesoes/edit");
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
            ) : adesoes?.length > 0 ? (
              <BasicTable
                totalPages={adesoes?.length}
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
                onClickAction={() => navigate("/processos-internos/adesoes/edit")}
              />
            )}
          </Paper>
        </Paper>
      </Slide>
      <CustomModal
        title="Enviar Adesão para Assinatura"
        subHeader="preencha o email que receberá a proposta da turma para assinatura"
        openModal={openModal}
        handleCloseModal={() => {
          setOpenModal(false);
        }}
        onSubmit={onSendToSign}
      >
        <Box display={'flex'} flexDirection={'column'} component={'form'} sx={{ width: '100%' }}>
          <Stack width={'100%'} direction={'column'} gap={2}>
            <Stack direction={'row'} gap={1} alignItems={'center'}>
              <TextField
                fullWidth
                type="email"
                required
                label="E-mail que receberá a adesão"
                placeholder="email que receberá a adesão MELTT"
                value={signer}
                onChange={(e) =>
                  setSigner(e.target.value)
                }
              />
            </Stack>
          </Stack>
        </Box>
      </CustomModal>
    </Stack>
  );
};

export default AdesoesPage;
