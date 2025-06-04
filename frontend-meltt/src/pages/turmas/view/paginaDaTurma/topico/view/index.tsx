import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Aluno, Resposta, Topico } from "../../../../../../types";
import { apiGetData, apiPostData } from "../../../../../../services/api";
import toast from "react-hot-toast";
import {
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { IoMdArrowBack } from "react-icons/io";
import { IoChatbox } from "react-icons/io5";
import { Formik } from "formik";
import {format} from 'date-fns';

import { getToken } from "../../../../../../utils/token";
import { CustomJwtPayload } from "../../../../../../components/customDrawer";
import { jwtDecode } from "jwt-decode";

const TopicoViewPage = () => {
  const { topicoId } = useParams();
  const navigate = useNavigate();
  const token = getToken();
  const decoded = token ? jwtDecode<CustomJwtPayload>(token) : null;

  const [loadingTopicos, setLoadingTopicos] = useState(false);
  const [loadingSaveResposta, setLoadingSaveResposta] = useState(false);

  const [topico, setTopico] = useState<Topico[]>([]);
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [aluno, setAluno] = useState<Aluno[]>([]);

  const fetchTopico = async () => {
    setLoadingTopicos(true);
    try {
      await apiGetData("academic", `/topicos/${topicoId}`).then(
        (dataTopico) => {
          setTopico(dataTopico);
          apiGetData("academic", `/alunos/${dataTopico[0]?.aluno_id}`).then(
            (dataAluno) => {
              setAluno(dataAluno);
            }
          );
        }
      );
    } catch (error) {
      toast.error("Erro ao buscar topicos");
    }
    setLoadingTopicos(false);
  };

  const fetchRespostas = async () => {
    try {
      await apiGetData("academic", `/respostas/topico/${topicoId}`).then(
        (data) => {
          setRespostas(data);
        }
      );
    } catch (error) {
      toast.error("Erro ao buscar respostas");
    }
  };

  const fetchAll = async () => {
    await fetchTopico();
    await fetchRespostas();
  };

  const handleSaveResposta = async (values: any) => {
    setLoadingSaveResposta(true);

    const dataObj = {
      resposta: values.resposta,
      topico_id: topicoId,
      usuario_id:decoded?.id,
    };

    const response = await apiPostData("academic", "/respostas", dataObj);
    if (response.id) {
      toast.success("Resposta enviada com sucesso");
      fetchRespostas();
    } else {
      toast.error("Erro ao enviar resposta");
    }
    setLoadingSaveResposta(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <Stack width={"calc(100% - 28px)"}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          flexGrow: 1,
          width: "100%",
          height: "calc(100vh - 105px)",
          borderRadius: 4,
        }}
      >
        <Stack
          direction={"column"}
          sx={{ maxHeight: "250px", overflow: "auto" }}
        >
          <IconButton
            color="primary"
            size="small"
            onClick={() => navigate(-1)}
            sx={{ width: "28px", mb: 1 }}
          >
            <IoMdArrowBack />
          </IconButton>
          <Typography
            color="primary"
            variant="h6"
            fontWeight={600}
          >
            Título:{""}
            {loadingTopicos ? (
              <CircularProgress size={16} color="secondary" />
            ) : (
              topico[0]?.titulo
            )}
          </Typography>
          <Typography
            color="primary"
            variant="body1"
            fontWeight={400}
          >
            {loadingTopicos ? (
              <CircularProgress size={16} color="secondary" />
            ) : (
              topico[0]?.descricao
            )}
          </Typography>
          <Typography color="textSecondary" variant="caption">
            {aluno[0]?.nome} - {aluno[0]?.email}
          </Typography>
        </Stack>
        <Divider flexItem variant="middle" sx={{ my: 3 }} />
        <Formik initialValues={{ resposta: "" }} onSubmit={handleSaveResposta}>
          {({ values, handleSubmit, handleChange }) => (
            <form className="flex flex-row gap-2" onSubmit={handleSubmit}>
              <TextField
                name="resposta"
                color="primary"
                size="small"
                value={values.resposta}
                onChange={handleChange}
                label="Comentar"
                placeholder="ex: nada a ver este tópico...."
                sx={{ width: "60%", borderRadius: 2 }}
              />
              <Tooltip title="Enviar resposta" placement="top" arrow>
                <IconButton type="submit" sx={{ bgcolor: "#eee" }}>
                  {loadingSaveResposta ? (
                    <CircularProgress size={16} color="secondary" />
                  ) : (
                    <IoChatbox color="#db1f8d" size={22} />
                  )}
                </IconButton>
              </Tooltip>
            </form>
          )}
        </Formik>
        <Stack sx={{ height: "300px", overflow: "auto" }}>
          <List
            sx={{
              bgcolor: "background.paper",
              maxHeight: "300px",
              overflow: "auto",
              borderRadius: 2,
            }}
          >
            {respostas.length > 0 ? (
              respostas.map((item: Resposta, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton>
                    <ListItemIcon>
                      <IoChatbox color="#db1f8d" size={18} />
                    </ListItemIcon>
                    <ListItemText
                      primary={""}
                      secondary={`${item.resposta} - ${format(
                        item.data_criacao,
                        "dd/MM/yyyy"
                      )}`}
                      secondaryTypographyProps={{
                        fontSize: "12px",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <Stack
                height={"100%"}
                textAlign={"center"}
                justifyContent={"center"}
                alignItems={"center"}
                mt={2}
              >
                <Typography color="textSecondary" sx={{ ml: 2, fontSize: 14 }}>
                  nenhuma resposta enviada até o momento. ✍️
                </Typography>
              </Stack>
            )}
          </List>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default TopicoViewPage;
