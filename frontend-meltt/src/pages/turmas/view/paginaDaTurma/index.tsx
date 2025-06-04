import {
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Modal,
  Stack,
  Tab,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoAdd } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { SlMagnifier } from "react-icons/sl";
import { apiGetData, apiPostData } from "../../../../services/api";
import { Topico, Turma } from "../../../../types";
import CustomModal from "../../../../components/modal";
import { useDropzone } from "react-dropzone";
import IconUpload from "../../../../assets/icons/upload";
import { TbTrash } from "react-icons/tb";
import { getToken } from "../../../../utils/token";
import { jwtDecode } from "jwt-decode";
import { CustomJwtPayload } from "../../../../components/customDrawer";
import { FiMessageCircle } from "react-icons/fi";
import { BiArrowBack, BiCloudDownload, BiImage } from "react-icons/bi";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { MdClose, MdCloudUpload, MdInsertDriveFile, MdPictureAsPdf, MdVisibility } from "react-icons/md";
import FileViewer from "../../../../components/fileViewer";


const PaginaDaTurmaPage = () => {
  const { id } = useParams();
  const token = getToken();
  const decoded = token ? jwtDecode<CustomJwtPayload>(token) : null;

  const navigate = useNavigate();

  const [tabView, setTabView] = useState("0");
  const [openModalAtas, setOpenModalAtas] = useState(false);
  const [openModalInformativos, setOpenModalInformativos] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingSendFile, setLoadingSendFile] = useState(false);

  const [turma, setTurma] = useState<Turma[]>([]);
  const [atas, setAtas] = useState([]);
  const [informativos, setInformativos] = useState([]);
  const [topicos, setTopicos] = useState([]);

  const [ataFile, setAtaFile] = useState<File | null>(null);
  const [fileTitleAta, setFileTitleAta] = useState<string>('');
  const [fileTitleInformativo, setFileTitleInformativo] = useState<string>('');
  const [informativoFile, setInformativoFile] = useState<File | null>(null);

  const [selectedFile, setSelectedFile] = useState<string | null>(null)


  const onChangeTab = (_: React.SyntheticEvent, newValue: string) => {
    setTabView(newValue)
  };

  const onDropAta = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setAtaFile(file);
      const reader = new FileReader();

      if (file.type.startsWith("image/")) {
        reader.readAsDataURL(file);
      } else if (file.type === "application/pdf") {
        reader.readAsDataURL(file);
      }
    }
  }, []);

  const onDropInformativo = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setInformativoFile(file);
      const reader = new FileReader();

      if (file.type.startsWith("image/")) {
        reader.readAsDataURL(file);
      } else if (file.type === "application/pdf") {
        reader.readAsDataURL(file);
      }
    }
  }, []);

  const {
    getRootProps: getAtaRootProps,
    getInputProps: getAtaInputProps,
    isDragActive: isAtaDragActive,
  } = useDropzone({
    onDrop: onDropAta,
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  const {
    getRootProps: getInformativoRootProps,
    getInputProps: getInformativoInputProps,
    isDragActive: isInformativoDragActive,
  } = useDropzone({
    onDrop: onDropInformativo,
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

  const fetchInformativos = async () => {
    setLoading(true);
    try {
      await apiGetData("academic", `/informativos/turma/${id}`).then((data) => {
        setInformativos(data);
      });
    } catch (error) {
      toast.error("Erro ao buscar Atas");
    }
    setLoading(false);
  };

  const fetchAtas = async () => {
    setLoading(true);
    try {
      await apiGetData("academic", `/atas/turma/${id}`).then((data) => {
        setAtas(data);
      });
    } catch (error) {
      toast.error("Erro ao buscar Atas");
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
      toast.error("Erro ao buscar tópicos");
    }
    setLoading(false);
  };

  const fetchAll = async () => {
    const [] = await Promise.all([fetchTurma(), fetchAtas(), fetchInformativos(), fetchTopicos()])
    // await fetchTurma();
    // await fetchAtas();
    // await fetchInformativos();
    // await fetchTopicos();
  };

  const onSubmitAtaFile = async () => {
    setLoadingSendFile(true);

    if (!ataFile) {
      toast.error("Selecione um arquivo para enviar");
      setLoadingSendFile(false);
      return;
    }

    try {
      const encodedFileName = encodeURIComponent(ataFile.name);
      const presignedUrl = await apiGetData(
        "academic",
        `/s3/uploads/turma/atas/pressignedUrl?fileName=${encodedFileName}&turmaId=${id}&fileType=${ataFile.type}`
      );

      if (!presignedUrl?.url) {
        throw new Error("Falha ao obter URL assinada");
      }

      const uploadResponse = await fetch(presignedUrl.url, {
        method: 'PUT',
        body: ataFile,
        headers: {
          'Content-Type': ataFile.type || 'application/octet-stream',
          'x-amz-meta-turmaId': id || ''
        }
      });

      if (!uploadResponse.ok) {
        throw new Error("Falha no upload para o S3");
      }

      const updateResponse = await apiPostData("academic", "/atas", {
        turma_id: id,
        file_name: fileTitleAta,
        url_arquivo: `https://meltt-turmas.s3.us-east-1.amazonaws.com/${presignedUrl.path}`
      });
      if (updateResponse.turma_id) {
        toast.success("Ata enviada com sucesso!");
        await fetchAtas()
        setAtaFile(null);
        setOpenModalAtas(false);
      }

    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Erro ao enviar arquivo de Ata");
    } finally {
      setLoadingSendFile(false);
    }
  };

  const onSubmitInformativoFile = async () => {
    setLoadingSendFile(true);

    if (!informativoFile) {
      toast.error("Selecione um arquivo para enviar");
      setLoadingSendFile(false);
      return;
    }

    try {
      const encodedFileName = encodeURIComponent(informativoFile.name);
      const presignedUrl = await apiGetData("academic",
        `/s3/uploads/turma/informativos/pressignedUrl?fileName=${encodedFileName}&turmaId=${id}&fileType=${informativoFile.type}`
      );

      if (!presignedUrl?.url) {
        throw new Error("Falha ao obter URL assinada");
      }

      const uploadResponse = await fetch(presignedUrl.url, {
        method: 'PUT',
        body: informativoFile,
        headers: {
          'Content-Type': informativoFile.type || 'application/octet-stream',
          'x-amz-meta-turmaId': id || ''
        }
      });

      if (!uploadResponse.ok) {
        throw new Error("Falha no upload para o S3");
      }

      const updateResponse = await apiPostData("academic", "/informativos", {
        turma_id: id,
        file_name: fileTitleInformativo,
        url_arquivo: `https://meltt-turmas.s3.us-east-1.amazonaws.com/turmas/informativos/${id}`
      });
      if (updateResponse.turma_id) {
        toast.success("Informativo enviado com sucesso!");
        await fetchInformativos();
        setInformativoFile(null);
        setOpenModalInformativos(false);
      }

    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Erro ao enviar informativo");
    } finally {
      setLoadingSendFile(false);
    }

  }

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
              Página da Turma
              {loading ? (
                <CircularProgress size={16} color="secondary" />
              ) : (
                <b>{turma[0]?.nome}</b>
              )}
            </Typography>
          </Stack>
          <TabContext value={tabView}>
            <TabList onChange={onChangeTab} aria-label="lab API tabs example">
              <Tab label="Postagens" value={"0"} sx={{ fontFamily: "Poppins", textTransform: "capitalize" }} />
              <Tab label="Atas" value={"1"} sx={{ fontFamily: "Poppins", textTransform: "capitalize" }} />
              <Tab label="Informativos" value={"2"} sx={{ fontFamily: "Poppins", textTransform: "capitalize" }} />
            </TabList>
            <TabPanel value={"0"} sx={{ mt: 4, p: 0 }}>
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
                  {(decoded?.tipo === "ADMIN" || decoded?.tipo === 'GESTAO_PRODUCAO') && (
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
                      postagens desta turma:
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
                    <Stack width={'100%'} height={'100%'} justifyContent={'center'} alignItems={'center'} gap={1}>
                      <img src="https://cdn.dribbble.com/userupload/8726277/file/still-90096ae0b20436af7d475737af5b86e5.gif?resize=400x0" alt="" width={220} />
                      <Typography
                        color="textSecondary"
                        sx={{ ml: 2, fontSize: 12, mt: -2 }}
                      >
                        Poxa, não encontramos nenhum Post nessa turma até o momento, seja o primeiro a criar!
                      </Typography>
                    </Stack>
                  )}
                </List>
              </Stack>
            </TabPanel>
            <TabPanel value={"1"} sx={{ mt: 4, p: 0 }}>
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
                  {(decoded?.tipo === "ADMIN" || decoded?.tipo === 'GESTAO_PRODUCAO') && (
                    <Button
                      color="secondary"
                      variant="contained"
                      size="small"
                      endIcon={<MdCloudUpload />}
                      onClick={() => setOpenModalAtas(true)}
                      sx={{ fontFamily: "Poppins" }}
                    >
                      Enviar Arquivo
                    </Button>
                  )}
                </Stack>
                <List
                  subheader={
                    <ListSubheader
                      component="div"
                      className="bg-pink-50 rounded-t-lg"
                      sx={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: 'text.primary',
                        py: 1.5,
                        px: 2
                      }}
                    >
                      ATAS DA TURMA
                    </ListSubheader>
                  }
                  sx={{
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    boxShadow: 1
                  }}
                >
                  {atas?.map((item: { file_name: string, url_arquivo: string }, index) => {
                    const fileName = item.url_arquivo.split('/').pop()?.split('?')[0] || `ata-${index + 1}`;
                    const fileType = fileName.split('.').pop()?.toLowerCase();

                    return (
                      <ListItem
                        key={index}
                        disablePadding
                        sx={{
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:last-child': { borderBottom: 'none' }
                        }}
                      >
                        <Card className="w-full m-2 hover:bg-gray-50 transition-colors">
                          <ListItemButton sx={{ px: 2, py: 1.5 }}>
                            <div className="flex items-center w-full">
                              <div className="mr-4 text-pink-600">
                                {fileType === 'pdf' ? <MdPictureAsPdf fontSize="medium" /> :
                                  ['jpg', 'png'].includes(fileType || '') ? <BiImage fontSize="medium" /> :
                                    <MdInsertDriveFile fontSize="medium" />}
                              </div>

                              <ListItemText
                                primary={
                                  <Typography variant="body1" className="font-medium">
                                    {item.file_name ?? 'nome do arquivo não informado'}
                                  </Typography>
                                }
                                secondary={
                                  <Stack direction={'column'}>
                                    {decodeURIComponent(fileName)}
                                    Enviado em {new Date().toLocaleDateString()}
                                  </Stack>
                                }
                                secondaryTypographyProps={{
                                  variant: 'caption',
                                  color: 'text.secondary'
                                }}
                              />

                              <div className="flex items-center gap-2 ml-auto">
                                <Tooltip title="Visualizar">
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedFile(item.url_arquivo)
                                    }}
                                    sx={{ color: 'primary.main' }}
                                  >
                                    <MdVisibility />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Download">
                                  <IconButton
                                    onClick={() => window.open(item.url_arquivo, '_blank')}
                                    sx={{ color: 'primary.main' }}
                                  >
                                    <BiCloudDownload />
                                  </IconButton>
                                </Tooltip>
                              </div>
                            </div>
                          </ListItemButton>
                        </Card>
                      </ListItem>
                    )
                  })}
                </List>

                {/* Modal para visualização */}
                <Modal
                  open={!!selectedFile}
                  onClose={() => setSelectedFile(null)}
                  className="flex items-center justify-center p-4"
                >
                  <div className="bg-white rounded-lg p-4 w-full max-w-4xl max-h-[90vh] overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                      <Typography variant="h6">
                        Visualização da Ata
                      </Typography>
                      <IconButton onClick={() => setSelectedFile(null)}>
                        <MdClose />
                      </IconButton>
                    </div>

                    <div className="h-[70vh]">
                      <FileViewer url={selectedFile ?? ''} />
                    </div>
                  </div>
                </Modal>
              </Stack>
            </TabPanel>
            <TabPanel value={"2"} sx={{ mt: 4, p: 0 }}>
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
                  {(decoded?.tipo === "ADMIN" || decoded?.tipo === 'GESTAO_PRODUCAO') && (
                    <Button
                      color="secondary"
                      variant="contained"
                      size="small"
                      endIcon={<MdCloudUpload />}
                      onClick={() => setOpenModalInformativos(true)}
                      sx={{ fontFamily: "Poppins" }}
                    >
                      Enviar Arquivo
                    </Button>
                  )}
                </Stack>
                <List
                  subheader={
                    <ListSubheader
                      component="div"
                      className="bg-pink-50 rounded-t-lg"
                      sx={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: 'text.primary',
                        py: 1.5,
                        px: 2
                      }}
                    >
                      INFORMATIVOS DA TURMA
                    </ListSubheader>
                  }
                  sx={{
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    boxShadow: 1
                  }}
                >
                  {informativos?.map((item: { file_name: string; url_arquivo: string }, index) => {
                    const fileName = item.url_arquivo.split('/').pop()?.split('?')[0] || `ata-${index + 1}`;
                    const fileType = fileName.split('.').pop()?.toLowerCase();

                    return (
                      <ListItem
                        key={index}
                        disablePadding
                        sx={{
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:last-child': { borderBottom: 'none' }
                        }}
                      >
                        <Card className="w-full m-2 hover:bg-gray-50 transition-colors">
                          <ListItemButton sx={{ px: 2, py: 1.5 }}>
                            <div className="flex items-center w-full">
                              <div className="mr-4 text-pink-600">
                                {fileType === 'pdf' ? <MdPictureAsPdf fontSize="medium" /> :
                                  ['jpg', 'png'].includes(fileType || '') ? <BiImage fontSize="medium" /> :
                                    <MdInsertDriveFile fontSize="medium" />}
                              </div>

                              <ListItemText
                                primary={
                                  <Typography variant="body1" className="font-medium">
                                    {item.file_name ?? 'nome do arquivo não informado'}
                                  </Typography>
                                }
                                secondary={
                                  <Stack direction={'column'}>
                                    {decodeURIComponent(fileName)}
                                    Enviado em {new Date().toLocaleDateString()}
                                  </Stack>
                                }
                                secondaryTypographyProps={{
                                  variant: 'caption',
                                  color: 'text.secondary'
                                }}
                              />

                              <div className="flex items-center gap-2 ml-auto">
                                <Tooltip title="Visualizar">
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedFile(item.url_arquivo)
                                    }}
                                    sx={{ color: 'primary.main' }}
                                  >
                                    <MdVisibility />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Download">
                                  <IconButton
                                    onClick={() => window.open(item.url_arquivo, '_blank')}
                                    sx={{ color: 'primary.main' }}
                                  >
                                    <BiCloudDownload />
                                  </IconButton>
                                </Tooltip>
                              </div>
                            </div>
                          </ListItemButton>
                        </Card>
                      </ListItem>
                    )
                  })}
                </List>
              </Stack>
            </TabPanel>
          </TabContext>
        </Box>
      </Stack>
      <CustomModal
        title="Enviar Nova Ata"
        subHeader="suba um arquivo para compartilhar com a turma"
        openModal={openModalAtas}
        loadingSave={loadingSendFile}
        onSubmit={onSubmitAtaFile}
        handleCloseModal={() => setOpenModalAtas(false)}
      >
        <Stack direction={"column"} gap={1}>
          <TextField
            name="file_name"
            required
            label="Nome do arquivo"
            focused
            value={fileTitleAta}
            onChange={(e) => setFileTitleAta(e.target.value)}
            sx={{ mb: 2 }}
          />
          <div
            className="h-44 border-2 border-dashed border-gray-300 rounded-md"
            {...getAtaRootProps()}
          >
            {ataFile ? (
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
                  {ataFile?.name}
                </Typography>
                <Typography variant="body2" color="primary">
                  {ataFile?.type}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => {
                    setAtaFile(null);
                  }}
                >
                  <TbTrash size={14} className="text-red-500" />
                </IconButton>
              </Stack>
            ) : (
              <>
                <input {...getAtaInputProps()} />
                {isAtaDragActive ? (
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
      <CustomModal
        title="Enviar Novo Informativo"
        subHeader="suba um arquivo para compartilhar com a turma"
        openModal={openModalInformativos}
        loadingSave={loadingSendFile}
        onSubmit={onSubmitInformativoFile}
        handleCloseModal={() => setOpenModalInformativos(false)}
      >
        <Stack direction={"column"} gap={1}>
          <TextField
            name="file_name"
            required
            label="Nome do arquivo"
            focused
            value={fileTitleInformativo}
            onChange={(e) => setFileTitleInformativo(e.target.value)}
            sx={{ mb: 2 }}
          />
          <div
            className="h-44 border-2 border-dashed border-gray-300 rounded-md"
            {...getInformativoRootProps()}
          >
            {informativoFile ? (
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
                  {informativoFile?.name}
                </Typography>
                <Typography variant="body2" color="primary">
                  {informativoFile?.type}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => {
                    setInformativoFile(null);
                  }}
                >
                  <TbTrash size={14} className="text-red-500" />
                </IconButton>
              </Stack>
            ) : (
              <>
                <input {...getInformativoInputProps()} />
                {isInformativoDragActive ? (
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
