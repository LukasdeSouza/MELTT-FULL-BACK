import {
  Autocomplete,
  Box,
  Button,
  Chip,
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
import { useEffect, useRef, useState } from "react";
import "dayjs/locale/pt-br";
import LoadingBackdrop from "../../../components/loadingBackdrop";
import { apiGetData, apiPatchData, apiPutData } from "../../../services/api";

import { BiArrowBack, BiSave } from "react-icons/bi";
import { LoadingButton } from "@mui/lab";
import { initialValuesTurma } from "../../../initialValues";
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
    <Stack width="100%" height="100%" gap={4} px={1}>
      <Stack width="100%" direction="column">
        <Typography
          color="primary"
          variant="h4"
          fontWeight={800}
          mb={1}
          sx={{
            fontFamily: 'Poppins',
            background: 'linear-gradient(45deg, #2D1C63 30%, #4A3C8B 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            pb: 1,
            borderBottom: '2px solid',
            borderColor: 'primary.main'
          }}
        >
          Editar Turma
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Preencha as informações abaixo para criar uma nova associação
          </Typography>
        </Typography>

        <Paper
          elevation={4}
          sx={{
            position: 'relative',
            p: 3,
            height: 'calc(100vh - 160px)',
            overflowY: 'auto',
            borderRadius: 4,
            bgcolor: 'background.paper',
            '&::-webkit-scrollbar': { width: 10 },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'primary.light',
              borderRadius: 2
            }
          }}
        >
          <Formik
            innerRef={formikRef}
            initialValues={{ ...getTurmasInitialValue, planos_formatura: planosTurma }}
            validationSchema={validateTurmaSchema}
            onSubmit={(values: any) => onSubmitTurma(values)}
          >
            {({ values, handleChange, handleSubmit, setFieldValue }) => (
              <form
                onSubmit={handleSubmit}
                onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
              >
                <Stack height="100%" spacing={3} pb={10}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    gap={4}
                    sx={{
                      maxHeight: 'calc(85vh - 132px)',
                      overflowY: 'auto',
                      pr: 2
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <TextField
                        fullWidth
                        size="medium"
                        name="nome"
                        label="Nome da Turma"
                        value={values.nome}
                        onChange={handleChange}
                        placeholder="Ex: Turma 2024 - Engenharia Civil"
                        variant="filled"
                        InputProps={{
                          sx: {
                            borderRadius: 2,
                            '&:hover': { bgcolor: 'grey.50' },
                            '&.Mui-focused': { bgcolor: 'grey.100' }
                          }
                        }}
                      />

                      <FormControl fullWidth>
                        <InputLabel id="ano_formatura">Ano de Formatura</InputLabel>
                        <Select
                          name="ano_formatura"
                          label="Ano de Formatura"
                          value={values.ano_formatura}
                          onChange={handleChange}
                          variant="filled"
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                borderRadius: 2,
                                mt: 1,
                                '& .MuiMenuItem-root': {
                                  py: 1.5,
                                  '&:hover': { bgcolor: 'primary.light', color: 'white' }
                                }
                              }
                            }
                          }}
                        >
                          {graduationYearsList.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>

                    <Stack direction="row" spacing={2}>
                      <TextField
                        fullWidth
                        size="medium"
                        name="identificador"
                        label="Identificador da Turma"
                        value={values.identificador}
                        onChange={handleChange}
                        placeholder="Ex: ENG-CIV-2024"
                        variant="filled"
                        InputProps={{
                          sx: {
                            borderRadius: 2,
                            '&:hover': { bgcolor: 'grey.50' }
                          }
                        }}
                      />

                      <FormControl fullWidth>
                        <Autocomplete
                          multiple
                          size="medium"
                          id="planos_formatura"
                          options={planos}
                          getOptionLabel={(option) => option.nome}
                          value={planosTurma || []}
                          onChange={(_, newValue) => {
                            setPlanosTurma(newValue)
                            setFieldValue('planos_formatura', newValue)
                          }}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Planos de Formatura"
                              variant="filled"
                              placeholder="Selecione os planos"
                            />
                          )}
                          renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                              <Chip
                                {...getTagProps({ index })}
                                label={option.nome}
                                size="small"
                                sx={{
                                  borderRadius: 1,
                                  bgcolor: 'primary.light',
                                  color: 'white',
                                  mr: 0.5
                                }}
                              />
                            ))
                          }
                        />
                      </FormControl>
                    </Stack>

                    {['regras_adesao', 'regras_rescisao', 'regras_renegociacao'].map((field) => (
                      <TextField
                        key={field}
                        fullWidth
                        name={field}
                        label={field.split('_')[1].toUpperCase()}
                        multiline
                        rows={4}
                        value={values[field]}
                        onChange={handleChange}
                        variant="filled"
                        InputProps={{
                          sx: {
                            borderRadius: 2,
                            alignItems: 'flex-start',
                            '& textarea': { lineHeight: 1.6 }
                          }
                        }}
                        InputLabelProps={{ shrink: true }}
                      />
                    ))}
                  </Box>

                  <Stack
                    direction="row"
                    justifyContent="flex-end"
                    spacing={2}
                    sx={{
                      position: 'sticky',
                      bottom: 0,
                      bgcolor: 'background.paper',
                      pt: 2,
                      pb: 1,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/turmas')}
                      startIcon={<BiArrowBack />}
                      sx={{
                        px: 4,
                        borderRadius: 2,
                        textTransform: 'none',
                        '&:hover': { borderWidth: 2 }
                      }}
                    >
                      Voltar
                    </Button>
                    <LoadingButton
                      type="submit"
                      variant="contained"
                      loading={loadingSave}
                      endIcon={<BiSave />}
                      sx={{
                        px: 4,
                        borderRadius: 2,
                        textTransform: 'none',
                        background: 'linear-gradient(45deg, #2D1C63 30%, #4A3C8B 90%)',
                        '&:hover': { opacity: 0.9 }
                      }}
                    >
                      Salvar Turma
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
