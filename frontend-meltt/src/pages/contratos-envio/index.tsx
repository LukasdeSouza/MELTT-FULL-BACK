import {
  Button,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slide,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import BasicTable from "../../components/table";
import { useCallback, useEffect, useState } from "react";
import { apiGetData } from "../../services/api";
import { contratosColumns } from "./columns";
import LoadingTable from "../../components/loadingTable";
import NoTableData from "../../components/noData";
import {format} from 'date-fns';

import CustomModal from "../../components/modal";
import { useDropzone } from "react-dropzone";
import IconUpload from "../../assets/icons/upload";
import { TbTrash } from "react-icons/tb";
import { SlMagnifier } from "react-icons/sl";
import toast from "react-hot-toast";
import { LoadingButton } from "@mui/lab";
import { FaFileSignature } from "react-icons/fa6";
import { MdError } from "react-icons/md";
import { PDFDocument } from "pdf-lib";


const ContratosEnvioPage = () => {
  const [onLoad, setOnLoad] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingSendFile, setLoadingSendFile] = useState(false);

  const [listContratos, setListContratos] = useState<any[]>([]);
  interface Associacao {
    id: string;
    nome: string;
  }

  const [associacao, setAssociacao] = useState<Associacao | null>(null);
  const [listAssociacoes, setListAssociacoes] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(acceptedFiles[0]);
      const reader = new FileReader();

      if (file.type.startsWith("image/")) {
        reader.readAsDataURL(file);
      } else if (file.type === "text/plain") {
        reader.readAsText(file);
      } else if (file.type === "application/pdf") {
        reader.readAsDataURL(file);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  const handleChangeAssociacao = (event: any) => {
    setAssociacao(event.target.value);
  };

  const fetchAssociacoes = async () => {
    setLoading(true);
    const response = await apiGetData(
      "authentication",
      `/users/getByTipo?tipo=ASSOCIACAO`
    );
    console.log("RESULT", response);
    setListAssociacoes(response.result);
    setLoading(false);
  };

  const fetchContratos = async () => {
    setLoading(true);
    const response = await apiGetData("academic", `/contratos`);
    console.log("RESULT", response);
    setListContratos(response);
    setLoading(false);
  };

  const dataRow = (row: any) => {
    return (
      <TableRow
        key={row.id}
        sx={{
          "&:last-child td, &:last-child th": { border: 0 },
          " &:hover": { bgcolor: "#F7F7F7", cursor: "pointer" },
        }}
      >
        <TableCell component="th" scope="row" sx={{ fontFamily: "Poppins" }}>
          {format(row.data_criacao, "dd/MM/yyyy HH:mm")}
        </TableCell>
        <TableCell component="th" scope="row" sx={{ fontFamily: "Poppins" }}>
          <Chip
            variant="filled"
            color={row.assinado == 0 ? "error" : "success"}
            label={row.assinado == 0 ? "Não foi assinado" : "Já foi assinado"}
            icon={row.assinado == 0 ? <MdError /> : <FaFileSignature />}
          />
        </TableCell>
        <TableCell component="th" scope="row" sx={{ fontFamily: "Poppins" }}>
          {row.associacao}
        </TableCell>
      </TableRow>
    );
  };

  const onSubmitFile = async () => {
    setLoadingSendFile(true);

    if (!file) {
      toast.error("Selecione um arquivo para enviar");
      setLoadingSendFile(false);
      return;
    }
    try {
      const fileArrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileArrayBuffer);

      pdfDoc.setTitle("");
      pdfDoc.setAuthor("");
      pdfDoc.setSubject("");
      pdfDoc.setKeywords([]);

      const compressedPdfBytes = await pdfDoc.save();
      const base64File = `data:application/pdf;base64,${btoa(
        String.fromCharCode(...new Uint8Array(compressedPdfBytes))
      )}`;

      console.log("BASE64", base64File);

      // const responseSaveContrato = await fetch(
      //   `${import.meta.env.VITE_ACADEMIC_API_URL}/contratos`,
      //   {
      //     method: "POST",
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify(dataObj),
      //   }
      // );

      // const responseData = await responseSaveContrato.json();
      // if (!responseData.id) {
      //   toast.error("Arquivo muito grande ou erro ao enviar contrato");
      //   setLoadingSendFile(false);
      //   return;
      // }

      toast.success("Contrato Enviado com Sucesso");
      await fetchContratos();
      setLoadingSendFile(false);
      setOpenModal(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar o arquivo PDF");
      setLoadingSendFile(false);
    }
  };
  // const onSubmitFile = async () => {
  //   setLoadingSendFile(true);

  //   if (!file) {
  //     toast.error("Selecione um arquivo para enviar");
  //     setLoadingSendFile(false);
  //     return;
  //   }

  //   const reader = new FileReader();
  //   reader.readAsDataURL(file);

  //   reader.onloadend = async () => {
  //     const base64File = reader.result;

  //     let dataObj = {
  //       user_id: associacao?.id,
  //       assinado: 0,
  //       associacao: associacao?.nome,
  //       contrato_pdf: base64File,
  //     };

  //     try {
  //       const responseSaveContrato = await fetch(
  //         `${import.meta.env.VITE_ACADEMIC_API_URL}/contratos`,
  //         {
  //           method: "POST",
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify(dataObj),
  //         }
  //       );

  //       const responseData = await responseSaveContrato.json();
  //       if (!responseData.id) {
  //         toast.error("Arquivo muito grande ou erro ao enviar contrato:");
  //         setLoadingSendFile(false);
  //         return;
  //       }

  //       toast.success("Contrato Enviado com Sucesso");
  //       await fetchContratos();
  //       setLoadingSendFile(false);
  //       setOpenModal(false);
  //     } catch (error) {
  //       console.error("Arquivo muito grande ou erro ao enviar contrato:", error);
  //       toast.error("Arquivo muito grande ou erro ao enviar contrato:");
  //       setLoadingSendFile(false);
  //     }
  //   };

  //   reader.onerror = (error) => {
  //     toast.error("Erro ao ler o arquivo");
  //     setLoadingSendFile(false);
  //   };
  // };

  useEffect(() => {
    fetchContratos();
    setOnLoad(true);
  }, []);

  return (
    <Stack width={"calc(100% - 64px)"}>
      <Stack direction={"row"} justifyContent={"space-between"} my={2}>
        <h2 className="text-2xl text-default font-extrabold"></h2>
        <LoadingButton
          color="secondary"
          variant="contained"
          endIcon={<FaFileSignature />}
          onClick={async () => {
            await fetchAssociacoes();
            setOpenModal(true);
          }}
          sx={{ fontFamily: "Poppins" }}
        >
          Enviar Contrato para Assinatura
        </LoadingButton>
      </Stack>
      <Slide direction="right" in={onLoad} mountOnEnter>
        <Paper
          elevation={0}
          sx={{
            p: 1,
            flexGrow: 1,
            width: "100%",
            height: "calc(100vh - 130px)",
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
            ) : listContratos?.length > 0 ? (
              <BasicTable
                columns={contratosColumns}
                rows={listContratos}
                loading={false}
                dataRow={dataRow}
                handleChangePagination={() => {}}
                page={1}
                totalPages={1}
              />
            ) : (
              <NoTableData
                pronoum={"he"}
                pageName="Contrato"
                disabledButton={true}
                onClickAction={() => {}}
              />
            )}
          </Paper>
        </Paper>
      </Slide>
      <CustomModal
        title="Enviar Arquivo"
        subHeader="suba um arquivo para compartilhar com os alunos"
        openModal={openModal}
        loadingSave={loadingSendFile}
        onSubmit={onSubmitFile}
        handleCloseModal={() => setOpenModal(false)}
      >
        <Stack direction={"column"} gap={1}>
          <div
            className="h-44 border-2 border-dashed border-default rounded-md"
            {...getRootProps()}
          >
            {file ? (
              <Stack
                height={"100%"}
                direction={"column"}
                justifyContent={"center"}
                alignItems={"center"}
                overflow={"hidden"}
                px={1}
              >
                <IconUpload />
                <Typography
                  variant="body1"
                  fontWeight={800}
                  textAlign={"center"}
                  color="primary"
                >
                  {file?.name}
                </Typography>
                <Typography variant="body2" color="primary">
                  {file?.type}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => {
                    setFile(null);
                  }}
                >
                  <TbTrash size={14} className="text-red-500" />
                </IconButton>
              </Stack>
            ) : (
              <>
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p className=" flex items-center justify-center text-default h-full text-center">
                    Solte seu arquivo aqui...
                  </p>
                ) : (
                  <Stack
                    width={"100%"}
                    height={"100%"}
                    alignItems={"center"}
                    justifyContent={"center"}
                  >
                    <Stack direction={"column"} alignItems={"center"} gap={1}>
                      <IconUpload />
                      <small
                        className="text-[#777] font-light text-xs"
                        style={{ fontFamily: "Poppins" }}
                      >
                        Arraste seu arquivo para iniciar o upload
                      </small>
                      <small
                        className="text-[#777] font-light text-xs"
                        style={{ fontFamily: "Poppins", fontSize: 10 }}
                      >
                        pdf/jpg/png
                      </small>
                      <Divider
                        orientation="horizontal"
                        flexItem
                        sx={{ color: "black", fontSize: 12 }}
                      >
                        ou
                      </Divider>
                      <Button
                        variant="outlined"
                        color="primary"
                        endIcon={<SlMagnifier size={14} color="#2d1c63" />}
                        style={{
                          borderRadius: "8px",
                          padding: "6px",
                          fontSize: 12,
                          width: 150,
                        }}
                      >
                        Buscar arquivo
                      </Button>
                    </Stack>
                  </Stack>
                )}
              </>
            )}
          </div>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel sx={{ p: 0.3, bgcolor: "#fff" }}>
              Associação que assinará o arquivo:
            </InputLabel>
            {listAssociacoes?.map((item) => (
              <Select
                fullWidth
                name="associacao"
                size="small"
                value={associacao}
                onChange={handleChangeAssociacao}
              >
                <MenuItem value={item}>{item?.nome}</MenuItem>
              </Select>
            ))}
          </FormControl>
        </Stack>
      </CustomModal>
    </Stack>
  );
};

export default ContratosEnvioPage;
