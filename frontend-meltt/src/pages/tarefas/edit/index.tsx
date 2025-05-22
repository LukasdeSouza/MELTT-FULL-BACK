import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { Formik } from "formik";
import { validateTarefaSchema } from "../../../utils/validationSchemas";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import "dayjs/locale/pt-br";
import LoadingBackdrop from "../../../components/loadingBackdrop";
import { apiGetData, apiPatchData } from "../../../services/api";

import { BiSave } from "react-icons/bi";
import { LoadingButton } from "@mui/lab";
import { initialValuesTarefa } from "../../../initialValues";
import { useTarefaContext } from "../../../providers/tarefaContext";



const TarefasEditPage = () => {
  const {id} = useParams();
  const navigate = useNavigate();
  const {stateTarefa} = useTarefaContext();
  const [loadingSave, setLoadingSave] = useState(false);
  const [openLoadingBackdrop, setOpenLoadingBackdrop] = useState(false);

  const [responsaveis, setResponsaveis] = useState([]);

    const getTarefasInitialValue = Object.keys(initialValuesTarefa).reduce(
      (acc, key) => {
        const typedKey = key as keyof typeof initialValuesTarefa;
        acc[typedKey] = id
          ? stateTarefa.tarefaSelecionada?.[typedKey]
          : initialValuesTarefa[typedKey];
        return acc;
      },
      {} as any
    );

  const fetchResponsaveis = async () => {
    try {
      const response = await apiGetData("authentication", "/users/getByTipo?tipo=ADMIN");
      setResponsaveis(response.result)
    } catch (error) {
      toast.error("Erro ao buscar responsáveis");
    }
  }

  const onSubmitTarefa = async (values: any) => {
    setLoadingSave(true);

    toast.loading("Salvando Tarefa...");
    try {
      let response = await apiPatchData("academic", `/tarefas/${id}`, values)
      if (response.id) {
        toast.dismiss();
        toast.success("Tarefa atualizada com sucesso");
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
              ...getTarefasInitialValue,
            }}
            validationSchema={validateTarefaSchema}
            onSubmit={(values: any) => onSubmitTarefa(values)}
          >
            {({ values, errors, handleChange, handleSubmit }) => (
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
                        name="nome"
                        variant="outlined"
                        label="Nome da Tarefa"
                        value={values.nome}
                        onChange={handleChange}
                        placeholder="ex: preencher planilha ABC"
                      />
                      <FormControl fullWidth>
                        <InputLabel id="responsavel" sx={{ p: 0.5, bgcolor: "#fff" }}>
                          Responsável pela Tarefa
                        </InputLabel>
                        <Select
                          name="responsavel"
                          variant="outlined"
                          label="Data de Formatura da Turma"
                          value={values.responsavel}
                          error={errors.responsavel ? true : false}
                          onChange={handleChange}
                        >
                          {responsaveis.map((option: any) => (
                            <MenuItem key={option.nome} value={option.nome}>
                              {option.nome}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>
                    <TextField
                      fullWidth
                      name="atribuido_por"
                      variant="outlined"
                      label="Atribuído por"
                      value={values.atribuido_por}
                      onChange={handleChange}
                      placeholder="quem está criando essa tarefa ?"
                    />
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

export default TarefasEditPage;
