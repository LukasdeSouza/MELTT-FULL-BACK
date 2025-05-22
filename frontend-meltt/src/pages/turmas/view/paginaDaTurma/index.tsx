import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Stack,
  Tab,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoAdd } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { SlMagnifier } from "react-icons/sl";
import { apiGetData } from "../../../../services/api";
import { Topico, Turma } from "../../../../types";
import CustomModal from "../../../../components/modal";
import { useDropzone } from "react-dropzone";
import IconUpload from "../../../../assets/icons/upload";
import { TbTrash } from "react-icons/tb";
import { getToken } from "../../../../utils/token";
import { jwtDecode } from "jwt-decode";
import { CustomJwtPayload } from "../../../../components/customDrawer";
import { FiMessageCircle } from "react-icons/fi";
import { BiArrowBack } from "react-icons/bi";
import { TabContext, TabList, TabPanel } from "@mui/lab";


const PaginaDaTurmaPage = () => {
  const { id } = useParams();
  const token = getToken();
  const decoded = token ? jwtDecode<CustomJwtPayload>(token) : null;

  const navigate = useNavigate();

  const [tabView, setTabView] = useState("0");
  const [openModal, setOpenModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingSendFile, setLoadingSendFile] = useState(false);

  const [turma, setTurma] = useState<Turma[]>([]);
  const [topicos, setTopicos] = useState([]);

  const [file, setFile] = useState<File | null>(null);

  const onChangeTab = (_: React.SyntheticEvent, newValue: string) => {
    setTabView(newValue)
  };

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
      "image/jpeg": [".jpg"],
      "image/png": [".png"],
    },
  });

  const fetchTurma = async () => {
    setLoading(true);
    try {
      await apiGetData("academic", `/turmas/${id}`).then((data) => {
        setTurma(data);
      });
    } catch (error) {
      toast.error("Erro ao buscar turma");
    }

    setLoading(false);
  };

  const fetchTopicos = async () => {
    setLoading(true);
    try {
      await apiGetData("academic", `/topicos/turma/${id}`).then((data) => {
        setTopicos(data);
      });
    } catch (error) {
      toast.error("Erro ao buscar topicos");
    }
    setLoading(false);
  };

  const fetchArquivos = async () => {
    try {
      await apiGetData("academic", `/turmas/arquivos/turma/${id}`).then(
        (data) => data
          // setArquivosTurmas(data);
        
      );
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  const fetchAll = async () => {
    await fetchTurma();
    await fetchTopicos();
    await fetchArquivos();
  };

  const onSubmitFile = async () => {
    setLoadingSendFile(true);

    if (!file) {
      toast.error("Selecione um arquivo para enviar");
      setLoadingSendFile(false);
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);
    if (id) {
      formData.append("id_turma", id.toString());
    }
    if (decoded && decoded.id) {
      formData.append("id_aluno", decoded.id.toString());
    }

    const responseSendFile = await fetch(
      `${import.meta.env.VITE_ACADEMIC_API_URL}/turmas/arquivos/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );
    const responseData = await responseSendFile.json();
    if (!responseData.arquivoId) {
      toast.error("Erro ao enviar arquivo");
      setLoadingSendFile(false);
      return;
    }
    if (responseData.arquivoId) {
      toast.success("Arquivo enviado com sucesso");
      fetchArquivos();
      setLoadingSendFile(false);
      setOpenModal(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <Stack width={"100%"} height={"100%"} gap={8}>
      <Stack width={"calc(100% - 28px)"} direction={"column"}>
        <Box padding={2}>
          <Stack direction={"row"} alignItems={"center"} gap={1}>
            <IconButton onClick={() => navigate(-1)} size="small">
              <BiArrowBack />
            </IconButton>
            <Typography
              color="primary"
              variant="h6"
              fontWeight={600}
            >
              Página da Turma -{" "}
              {loading ? (
                <CircularProgress size={16} color="secondary" />
              ) : (
                turma[0]?.nome
              )}
            </Typography>
          </Stack>
          <TabContext value={tabView}>
            <TabList onChange={onChangeTab} aria-label="lab API tabs example">
              <Tab label="Postagens" value={"0"} />
            </TabList>
            <TabPanel value={"0"} sx={{mt: 4}}>
              <Stack direction={"column"} mt={-4} gap={1}>
                <Stack
                  direction={"row"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                >
                  <Typography
                    color="primary"
                    variant="body2"
                  ></Typography>
                  {decoded?.tipo === "ADMIN" && (
                    <Button
                      color="secondary"
                      variant="contained"
                      size="small"
                      endIcon={<IoAdd />}
                      onClick={() => navigate("topico/new")}
                      sx={{ fontFamily: "Poppins" }}
                    >
                      Criar Post
                    </Button>
                  )}
                </Stack>
                <List
                  subheader={
                    <ListSubheader component="div">
                      postagens recentes
                    </ListSubheader>
                  }
                  sx={{
                    bgcolor: "background.paper",
                    maxHeight: "70%",
                    overflow: "auto",
                    borderRadius: 2,
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
                  {topicos.length > 0 ? (
                    topicos.map((item: Topico, index) => (
                      <ListItem key={index} disablePadding>
                        <ListItemButton
                          onClick={() => navigate(`topico/${item.id}`)}
                        >
                          <ListItemIcon>
                            <FiMessageCircle color="#db1f8d" size={27} />
                          </ListItemIcon>
                          <ListItemText
                            primary={`Título: ${item.titulo}`}
                            secondary={`Descrição: ${item.descricao}`}
                            primaryTypographyProps={{
                              color: "primary",
                              fontSize: "14px",
                              fontWeight: 600,
                            }}
                            secondaryTypographyProps={{
                              fontSize: "12px",
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))
                  ) : (
                    <Typography
                      color="textSecondary"
                      sx={{ ml: 2, fontSize: 12 }}
                    >
                      nenhum tópico criado
                    </Typography>
                  )}
                </List>
              </Stack>
            </TabPanel>
            {/* <TabPanel value={"1"}>
              <Stack direction={"column"} mt={-4} gap={1}>
                <Stack
                  direction={"row"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                >
                  <Typography
                    color="primary"
                    variant="body2"
                  ></Typography>
                  {decoded?.tipo === "ADMIN" ? (
                    <Button
                      color="secondary"
                      variant="contained"
                      size="small"
                      endIcon={<MdCloudUpload />}
                      onClick={() => setOpenModal(true)}
                      sx={{ fontFamily: "Poppins" }}
                    >
                      Enviar Arquivo
                    </Button>
                  ) : (
                    <LoadingButton
                      variant="contained"
                      color="primary"
                      endIcon={<FaSignature />}
                    >
                      Assinar Documento
                    </LoadingButton>
                  )}
                </Stack>
                <List
                  subheader={
                    <ListSubheader component="div">
                      arquivos da turma
                    </ListSubheader>
                  }
                  sx={{
                    bgcolor: "background.paper",
                    maxHeight: "220px",
                    overflow: "auto",
                    borderRadius: 2,
                  }}
                >
                  {arquivosTurmas?.map(
                    (
                      item: {
                        nome_arquivo: string;
                        tipo_mime: string;
                        dados: string;
                      },
                      index
                    ) => (
                      <ListItem
                        key={index}
                        disablePadding
                        secondaryAction={
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() =>
                              downloadArquivo(
                                item.nome_arquivo,
                                item.tipo_mime,
                                item.dados
                              )
                            }
                          >
                            <IoMdCloudDownload color="#db1f8d" />
                          </IconButton>
                        }
                      >
                        <ListItemButton>
                          <ListItemText
                            primary={item.nome_arquivo}
                            secondary={item.tipo_mime}
                            primaryTypographyProps={{
                              color: "primary",
                              fontSize: "14px",
                            }}
                            secondaryTypographyProps={{
                              fontSize: "12px",
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    )
                  )}
                </List>
              </Stack>
            </TabPanel> */}
          </TabContext>
        </Box>
      </Stack>
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
        </Stack>
      </CustomModal>
    </Stack>
  );
};

export default PaginaDaTurmaPage;
