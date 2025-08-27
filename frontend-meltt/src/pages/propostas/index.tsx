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
import { useNavigate } from "react-router-dom";
import { apiGetData, apiPostData } from "../../services/api";
import { IoMdAdd } from "react-icons/io";
import toast from "react-hot-toast";
import NoTableData from "../../components/noData";
import LoadingTable from "../../components/loadingTable";
import { format, parseISO } from 'date-fns';
import { propostasColumns } from "./table/columns";
import { PiSignature } from "react-icons/pi";
import CustomModal from "../../components/modal";
import { IoAdd, IoRemove } from "react-icons/io5";


const PropostasPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [onLoad, setOnLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [propostas, setPropostas] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const [uuidProposta, setUuidProposta] = useState<string | null>(null);

  const [signersList, setSignersList] = useState<string[]>(["emailexemplo@meltt.com.br"]);


  const fetchPropostas = async (page: number) => {
    setLoading(true);
    try {
      const response = await apiGetData("academic", `/propostas?page=${page}`);
      setPropostas(response.data);
      setPage(page);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error("Erro ao buscar propostas");
    }
    setLoading(false);
  }


  const handleChangePagination = (_: React.ChangeEvent<unknown>, value: number) => {
    try {
      fetchPropostas(value);
    } catch (error) {
      toast.error("Erro ao buscar Propostas");
    }
    setPage(value);
  };

  // const seePropostaDetails = (id: number) => {

  // }

  const onSendToSign = async () => {
    toast.loading("Enviando Proposta para Assinatura");

    let createListObj = {
      uuid_document: uuidProposta,
      signers: signersList.map((email) => ({
        email, act: "1", foreign: "0", certificadoicpbr: "1"
      }))
    }
    console.log('createListObj', createListObj);

    let signerListObj = { message: "\"Olá! Segue PROPOSTA de formatura da MELTT para assinatura.\"", workflow: "0", skip_email: "0", uuid_document: uuidProposta }

    try {
      const createList = await apiPostData("academic", "/d4sign/create-signature-list", createListObj)
      const sendSigner = await apiPostData("academic", "/d4sign/send-to-signer", signerListObj);
      console.log(createList)
      console.log(sendSigner)
      toast.dismiss()
      toast.success('Proposta Enviado com Sucesso')
    } catch (error) {
      toast.error('Erro ao enviar proposta para assinatura')
      toast.dismiss();
    } finally {
      toast.dismiss();
      setOpenModal(false)
    }

  }


  const dataRow = (row: any) => {
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
            {row.nome_proposta}
          </Stack>
        </TableCell>
        <TableCell align="left">
          {row.turma_id}
        </TableCell>
        <TableCell align="left">
          {row.enviado_por}
        </TableCell>
        <TableCell align="left">
          R${row.valor_proposta}
        </TableCell>
        <TableCell align="left">
          {row?.data_criacao ? format(parseISO(row?.data_criacao), "dd/MM/yyyy") : "N/As"}
        </TableCell>
        <TableCell align="center">
          <Tooltip title='Enviar para Assinatura'>
            <IconButton
              disabled={row.file_uuid === null}
              onClick={() => {
                setUuidProposta(row.file_uuid)
                setOpenModal(true)
              }}
            >
              <PiSignature />
            </IconButton>
          </Tooltip>
          {/* <IconButton>
            <FaEye color="#2d1c63" />
          </IconButton> */}
        </TableCell>
      </TableRow>
    );
  };


  useEffect(() => {
    fetchPropostas(1);
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
            navigate("/processos-internos/propostas/new");
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
            ) : propostas?.length > 0 ? (
              <BasicTable
                totalPages={totalPages}
                columns={propostasColumns}
                rows={propostas}
                loading={loading}
                dataRow={dataRow}
                page={page}
                handleChangePagination={handleChangePagination}
              />
            ) : (
              <NoTableData
                pronoum={"she"}
                pageName="proposta"
                disabledButton={false}
                onClickAction={() => navigate("/processos-internos/propostas/new")}
              />
            )}
          </Paper>
        </Paper>
      </Slide>
      <CustomModal
        title="Enviar Proposta para Assinatura"
        subHeader="preencha o email que receberá a proposta da turma para assinatura"
        openModal={openModal}
        handleCloseModal={() => {
          setOpenModal(false);
          setSignersList([""]);
        }}
        onSubmit={onSendToSign}
      >
        <Box display={'flex'} flexDirection={'column'} component={'form'} sx={{ width: '100%' }}>
          <Stack width={'100%'} direction={'column'} gap={2}>
            {signersList.map((signer, index) => (
              <Stack key={index} direction={'row'} gap={1} alignItems={'center'}>
                <TextField
                  key={index}
                  fullWidth
                  type="email"
                  required
                  label="E-mail que receberá a proposta"
                  placeholder="email que receberá a proposta"
                  value={signer}
                  onChange={(e) =>
                    setSignersList(prev =>
                      prev.map((item, i) => (i === index ? e.target.value : item))
                    )
                  }
                />
                {index > 0 && (
                  <IconButton
                    color="error"
                    onClick={() => {
                      setSignersList(prev => prev.filter((_, i) => i !== index));
                    }}>
                    <Tooltip title="Remover E-mail">
                      <IoRemove />
                    </Tooltip>
                  </IconButton>
                )}
              </Stack>
            ))}
          </Stack>
          <Button
            color="secondary"
            variant="outlined"
            endIcon={<IoAdd />}
            onClick={() => setSignersList(prev => [...prev, ""])}
            sx={{ mt: 3, width: 'fit-content' }}
          >
            Adicionar E-mail
          </Button>
        </Box>
      </CustomModal>
    </Stack>
  );
};

export default PropostasPage;
