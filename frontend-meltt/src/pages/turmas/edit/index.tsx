import {
  Autocomplete,
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
import { Formik, FormikProps } from "formik";
import { validateTurmaSchema } from "../../../utils/validationSchemas";
import toast from "react-hot-toast";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "dayjs/locale/pt-br";
import LoadingBackdrop from "../../../components/loadingBackdrop";
import { apiGetData, apiPatchData, apiPutData } from "../../../services/api";

import { BiSave } from "react-icons/bi";
import { LoadingButton } from "@mui/lab";
import { initialValuesTurma } from "../../../initialValues";
import { useDropzone } from "react-dropzone";
import { graduationYearsList } from "../../../utils/arrays";
import { useTurmaContext } from "../../../providers/turmaContext";

export type StudentInfo = {
  educacao_basica: string | undefined;
  deficit_geral: string | undefined;
  tipo_aprendizagem: string | undefined;
};

export type StudentInitialValuesFn = (
  id: string | undefined,
  stateAluno: any,
  initialStudentValues: Record<string, any>
) => typeof initialStudentValues;

const TurmasEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { stateTurma } = useTurmaContext();
  const [loadingSave, setLoadingSave] = useState(false);
  const [openLoadingBackdrop, setOpenLoadingBackdrop] = useState(false);
  const [planos, setPlanos] = useState<any[]>([]);
  const [planosTurma, setPlanosTurma] = useState<any[]>([]);
  const formikRef = useRef<FormikProps<any>>(null); // Referência para Formik

  const getTurmasInitialValue = Object.keys(initialValuesTurma).reduce(
    (acc, key) => {
      const typedKey = key as keyof typeof initialValuesTurma;
      acc[typedKey] = id
        ? stateTurma.turmaSelecionada?.[typedKey]
        : initialValuesTurma[typedKey];
      return acc;
    },
    {} as any
  );

  const getPlanos = async () => {
    try {
      const response = await apiGetData("academic", `/planos-formatura`);
      // console.log("response planos", response);
      if (response) {
        setPlanos(response.data);
      }
    } catch (error) {
      console.error("Erro ao buscar planos", error);
    }
  };

  const getPlanosId = async () => {
    try {
      const response = await apiGetData("academic", `/planos-formatura/turma/${id}`);

      if (response) {
        console.log("response", response);

        setPlanosTurma(response);
      }
    } catch (error) {
      console.error("Erro ao buscar planos da turma", error);
    }
  };

  useEffect(() => {
    getPlanos();
    getPlanosId();
  }, []);


  const onSubmitTurma = async (values: any) => {
    console.log("values", values);
    setLoadingSave(true);

    try {
      if (!id) {
        throw new Error("ID da turma não encontrado");
      }

      const { planos_formatura, ...turmaValues } = values;

      await apiPatchData("academic", `/turmas/${id}`, turmaValues);

      await apiPutData("academic", "/turmas/atualizar-planos", {
        turma_id: id,
        planos_ids: planos_formatura.map((plano: any) => plano.id),
      });

      toast.success("Turma editada com sucesso");
      navigate(-1);

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao salvar turma");
    } finally {
      setLoadingSave(false);
    }
  };

  useEffect(() => {
    if (formikRef && planosTurma !== null) {
      formikRef.current?.setFieldValue("planos_formatura", planosTurma);
    }
  }, [planosTurma, formikRef]);

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
            innerRef={formikRef} // Captura a referência do Formik
            initialValues={{ ...getTurmasInitialValue, planos_formatura: planosTurma }}
            validationSchema={validateTurmaSchema}
            onSubmit={(values: any) => onSubmitTurma(values)}
          >
            {({ values, handleChange, handleSubmit, setFieldValue }) => (
              <form
                className="h-[100%]"
                onSubmit={handleSubmit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit(e);
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
                        Cadastrar Nova Turma (NOVA ASSOCIAÇÃO)
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
                        label="Nome da Turma"
                        value={values.nome}
                        onChange={handleChange}
                        placeholder="Qual o nome da sua turma ?"
                      />
                      <FormControl fullWidth size="small">
                        <InputLabel id="ano_formatura">Ano de Formatura</InputLabel>
                        <Select
                          name="ano_formatura"
                          variant="outlined"
                          label="Data de Formatura da Turma"
                          value={values.ano_formatura}
                          onChange={handleChange}
                        >
                          {graduationYearsList.map((option: any) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>
                    <Stack direction={"row"}
                      justifyContent={"space-between"}
                      gap={2}>
                      <TextField
                        fullWidth
                        size="small"
                        name="identificador"
                        variant="outlined"
                        label="Identificador da turma"
                        value={values.identificador}
                        onChange={handleChange}
                        placeholder="código único identificador da turma ?"
                      />
                      <FormControl fullWidth size="small">
                        <Autocomplete
                          multiple
                          size="small"
                          id="planos_formatura"
                          options={planos} // Os planos disponíveis
                          getOptionLabel={(option) => option.nome}
                          value={planosTurma || []} // Mantém a lista de selecionados atualizada
                          onChange={(_, newValue) => {
                            console.log("newValue", newValue);
                            setPlanosTurma(newValue);
                            setFieldValue("planos_formatura", newValue);
                          }}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          renderInput={(params) => (
                            <TextField {...params} label="Planos de Formatura" variant="outlined" />
                          )}
                        />
                      </FormControl>
                    </Stack>
                    <TextField
                      fullWidth
                      name="regras_adesao"
                      variant="outlined"
                      label="Regras de Adesão"
                      multiline
                      rows={3}
                      value={values.regras_adesao}
                      onChange={handleChange}
                      placeholder="descreva detalhamente as regras de adesão"
                    />
                    <TextField
                      fullWidth
                      name="regras_rescisao"
                      variant="outlined"
                      label="Regras de Rescisão"
                      multiline
                      rows={3}
                      value={values.regras_rescisao}
                      onChange={handleChange}
                      placeholder="descreva detalhadamento as regras de rescisão"
                    />
                    <TextField
                      fullWidth
                      name="regras_renegociacao"
                      variant="outlined"
                      label="Regras de Renegociação"
                      multiline
                      rows={3}
                      value={values.regras_renegociacao}
                      onChange={handleChange}
                      placeholder="descreva detalhadamente as regras de renegociação"
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
                      onClick={() => navigate("/turmas")}
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

export default TurmasEditPage;
