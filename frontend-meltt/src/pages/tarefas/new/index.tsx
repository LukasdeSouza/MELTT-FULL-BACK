import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Formik } from "formik";
import { validateTarefaSchema } from "../../../utils/validationSchemas";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import "dayjs/locale/pt-br";
import LoadingBackdrop from "../../../components/loadingBackdrop";
import { apiGetData, apiPostData } from "../../../services/api";

import { BiSave } from "react-icons/bi";
import { LoadingButton } from "@mui/lab";
import { initialValuesTarefa } from "../../../initialValues";



const TarefasNewPage = () => {
  const navigate = useNavigate();
  const [loadingSave, setLoadingSave] = useState(false);
  const [openLoadingBackdrop, setOpenLoadingBackdrop] = useState(false);

  const [usuarios, setUsuarios] = useState([]);

  const fetchResponsaveis = async () => {
    try {
      const response = await apiGetData("authentication", "/users/getByTipo?tipo=ADMIN");
      setUsuarios(response.result)
    } catch (error) {
      toast.error("Erro ao buscar responsáveis");
    }
  }

  const onSubmitTarefa = async (values: any) => {
    const {responsaveis, ...tarefaValues} = values;
    console.log("responsaveis", responsaveis);
    setLoadingSave(true);

    toast.loading("Salvando Tarefa...");
    try {
      const response = await apiPostData("academic", "/tarefas", tarefaValues)
      console.log("response", response);
      if (response.id) {
        const requests = responsaveis.map((usuario: any) => {
          return apiPostData("academic", `/tarefas/vincular-responsavel`, {
            usuario_id: usuario.id,
            tarefa_id: response.id,
          });
        });

        // Aguarda todas as requisições serem concluídas
        await Promise.all(requests);

        toast.dismiss();
        toast.success("Tarefa salva com sucesso");
        navigate(-1);
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Erro ao salvar Tarefa");
    }
    setLoadingSave(false);
  };

  useEffect(() => {
    fetchResponsaveis();
  }, [])


  return (
    <Stack width={"100%"} height={"100%"} gap={10}>
      <Stack width={"calc(100% - 28px)"} direction={"column"}>
        <Typography
          color="primary"
          variant="h5"
          fontWeight={700}
          ml={4}
          mb={2}
        ></Typography>
        <Paper
          elevation={0}
          style={{
            fontFamily: "Poppins",
            position: "relative",
            padding: "12px",
            height: "calc(100vh - 132px)",
            overflowY: "auto",
            borderRadius: "24px",
            backgroundColor: "#fff",
          }}
        >
          <Formik
            initialValues={{
              ...initialValuesTarefa,
            }}
            validationSchema={validateTarefaSchema}
            onSubmit={(values: any) => onSubmitTarefa(values)}
          >
            {({ values, handleChange, handleSubmit, setFieldValue }) => (
              <form
                className="h-[100%]"
                onSubmit={handleSubmit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit(e);
                    () => { };
                  }
                }}
              >
                <Stack height={"100%"} overflow={"auto"}>
                  <Box
                    display={"flex"}
                    flexDirection={"column"}
                    gap={3}
                    p={2}
                    sx={{
                      maxHeight: "calc(85vh - 132px)",
                      overflowY: "auto",
                    }}
                  >
                    <Stack direction={"column"}>
                      <Typography
                        color="primary"
                        fontWeight={600}
                      >
                        Cadastrar Nova Tarefa
                      </Typography>
                      <Typography
                        variant="caption"
                        color="primary"
                      >
                        preencha as informações abaixo.
                      </Typography>
                    </Stack>
                    <Stack
                      direction={"row"}
                      justifyContent={"space-between"}
                      gap={2}
                    >
                      <TextField
                        fullWidth
                        size="small"
                        name="nome"
                        variant="outlined"
                        label="Nome da Tarefa"
                        value={values.nome}
                        onChange={handleChange}
                        placeholder="ex: preencher planilha ABC"
                      />
                      <TextField
                        fullWidth
                        size="small"
                        name="atribuido_por"
                        variant="outlined"
                        label="Atribuído por"
                        value={values.atribuido_por}
                        onChange={handleChange}
                        placeholder="quem está criando essa tarefa ?"
                      />
                    </Stack>
                    <FormControl fullWidth size="small">
                      <Autocomplete
                        multiple
                        size="small"
                        id="responsaveis"
                        onKeyDown={(e) => { e.preventDefault() }}
                        options={usuarios}
                        getOptionLabel={(option) => option.nome}
                        value={values.responsaveis} // Ensure this is an array
                        onChange={(_, newValue) => {
                          setFieldValue("responsaveis", newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Responsáveis"
                            variant="outlined"
                          />
                        )}
                      />
                    </FormControl>
                  </Box>
                  <Stack
                    width="100%"
                    justifyContent="flex-end"
                    direction="row"
                    gap={2}
                    px={2}
                    mt={1}
                    sx={{
                      position: "absolute",
                      bottom: 12,
                      left: 0,
                      right: 0,
                      backgroundColor: "white",
                      p: 2,
                    }}
                  >
                    <Button
                      color="primary"
                      variant="outlined"
                      size="small"
                      onClick={() => navigate("/tarefas")}
                      sx={{ width: 120, borderRadius: 2 }}
                    >
                      Voltar
                    </Button>
                    <LoadingButton
                      type="submit"
                      color="secondary"
                      variant="contained"
                      size="small"
                      endIcon={<BiSave />}
                      loading={loadingSave}
                      sx={{ width: 120, borderRadius: 2 }}
                    >
                      Salvar
                    </LoadingButton>
                  </Stack>
                </Stack>
              </form>
            )}
          </Formik>
        </Paper>
      </Stack>
      <LoadingBackdrop
        open={openLoadingBackdrop}
        handleClose={() => setOpenLoadingBackdrop(false)}
      />
    </Stack>
  );
};

export default TarefasNewPage;
