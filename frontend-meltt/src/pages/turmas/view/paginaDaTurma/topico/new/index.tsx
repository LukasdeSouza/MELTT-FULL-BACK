import { LoadingButton } from "@mui/lab";
import {
  Button,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Formik } from "formik";
import { useState } from "react";
import { IoIosSend, IoMdArrowBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { apiPostData } from "../../../../../../services/api";
import { getToken } from "../../../../../../utils/token";
import { jwtDecode } from "jwt-decode";
import { CustomJwtPayload } from "../../../../../../components/customDrawer";
import toast from "react-hot-toast";

export type FormValuesTopicoType = {
  titulo: string;
  descricao: string;
};

const PaginadaTurmaCriarTopicoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = getToken();
  const decoded = token ? jwtDecode<CustomJwtPayload>(token) : null;

  const [loadingSendTopic, setLoadingSendTopic] = useState(false);

  const onSubmitTopic = async (values: FormValuesTopicoType) => {
    setLoadingSendTopic(true);

    const dataObj = {
      ...values,
      turma_id: id,
      usuario_id: decoded?.id,
    };

    const response = await apiPostData("academic", "/topicos", dataObj);
    if (response.id) {
      toast.success("Post criado com sucesso");
      navigate(`/turmas/view/${id}/pagina-turma`);
    } else {
      toast.error("Erro ao criar post");
      setLoadingSendTopic(false);
    }
    setLoadingSendTopic(false);
  };

  return (
    <Stack width={"calc(100% - 28px)"}>
      <Stack direction={"row"} alignItems={"center"} my={2} gap={2}>
        <IconButton size="small" onClick={() => navigate(`/turmas`)}>
          <IoMdArrowBack />
        </IconButton>
        <Stack direction={"column"}>
          <Typography
            color="primary"
            fontWeight={600}
            sx={{ fontSize: 20 }}
          >
            Criar Novo Tópico 🎉
          </Typography>
          <Typography color="textSecondary" variant="caption">
            escreva aquilo que você deseja compartilha com sua turma. Mas ei,
            não se esqueça de ser gentil e respeitoso.
          </Typography>
        </Stack>
      </Stack>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          flexGrow: 1,
          width: "100%",
          height: "calc(100vh - 200px)",
          borderRadius: 4,
        }}
      >
        <Formik
          initialValues={{ titulo: "", descricao: "" }}
          onSubmit={onSubmitTopic}
        >
          {({ values, handleSubmit, handleChange }) => (
            <Stack
              component={"form"}
              direction={"column"}
              justifyContent={"space-between"}
              height={"100%"}
              onSubmit={handleSubmit}
            >
              <Stack direction={"column"} gap={3}>
                <TextField
                  variant="outlined"
                  size="small"
                  name="titulo"
                  focused
                  value={values.titulo}
                  onChange={handleChange}
                  label="Título do tópico"
                  placeholder="ex: nótica nova!!!!!"
                  sx={{ maxWidth: "60%" }}
                />
                <TextField
                  variant="outlined"
                  multiline
                  name="descricao"
                  focused
                  value={values.descricao}
                  onChange={handleChange}
                  label="Descrição do tópico"
                  color="primary"
                  maxRows={10}
                  placeholder="ex: crie o texto que deseja enviar para a sua turma"
                />
              </Stack>
              <Stack
                width={"100%"}
                justifyContent={"flex-end"}
                direction={"row"}
                gap={2}
              >
                <Button
                  color="error"
                  variant="outlined"
                  onClick={() => navigate(`/turmas/view/${id}/pagina-turma`)}
                  sx={{ borderRadius: 2 }}
                >
                  Cancelar
                </Button>
                <LoadingButton
                  type="submit"
                  color="primary"
                  variant="contained"
                  loading={loadingSendTopic}
                  endIcon={<IoIosSend />}
                  sx={{ borderRadius: 2, width: 120 }}
                >
                  Enviar
                </LoadingButton>
              </Stack>
            </Stack>
          )}
        </Formik>
      </Paper>
    </Stack>
  );
};

export default PaginadaTurmaCriarTopicoPage;
