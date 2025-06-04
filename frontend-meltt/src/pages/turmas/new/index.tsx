import {
  Autocomplete,
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Formik } from "formik";
import { validateTurmaSchema } from "../../../utils/validationSchemas";
import toast from "react-hot-toast";
import { useCallback, useEffect, useState } from "react";
import "dayjs/locale/pt-br";
import LoadingBackdrop from "../../../components/loadingBackdrop";
import { apiGetData, apiPostData } from "../../../services/api";

import { BiArrowBack, BiSave } from "react-icons/bi";
import { LoadingButton } from "@mui/lab";
import { initialValuesTurma } from "../../../initialValues";
import { useDropzone } from "react-dropzone";
import IconUpload from "../../../assets/icons/upload";
import { TbTrash } from "react-icons/tb";
import { SlMagnifier } from "react-icons/sl";
import { graduationYearsList } from "../../../utils/arrays";


const uploadBoxStyles = {
  border: 2,
  borderColor: 'divider',
  borderRadius: 3,
  p: 2,
  transition: 'border-color 0.3s',
  '&:hover': { borderColor: 'primary.main' },
  bgcolor: 'grey.50'
};

const uploadButtonStyles = {
  mt: 1,
  color: 'primary.main',
  '&:hover': { bgcolor: 'transparent' }
};


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


const TurmasPageNew = () => {
  const navigate = useNavigate();
  const [loadingSave, setLoadingSave] = useState(false);
  const [openLoadingBackdrop, setOpenLoadingBackdrop] = useState(false);
  const [fileEstatuto, setFileEstatuto] = useState<File | null>(null);
  const [fileContratoMeltt, setFileContratoMeltt] = useState<File | null>(null);

  const [planos, setPlanos] = useState<any[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFileEstatuto(acceptedFiles[0]);
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

  const {
    getRootProps: getRootPropsContratoMeltt,
    getInputProps: getInputPropsContratoMeltt,
    isDragActive: isDragActiveContratoMeltt
  } = useDropzone({
    onDrop: useCallback((acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setFileContratoMeltt(file);
      }
    }, []),
    accept: { 'application/pdf': ['.pdf'] },
  });

  const onSubmitTurma = async (values: any) => {
    setLoadingSave(true);
    const { planos_formatura, ...turmaValues } = values;

    try {
      let estatutoUuid: string | null = null;
      let contratoMelttUuid: string | null = null;

      if (fileEstatuto instanceof File) {
        toast.loading("Enviando Estatuto para D4Sign...");

        const formData = new FormData();
        formData.append("file", fileEstatuto);

        const data = await apiPostData("academic", "/d4sign/upload", formData, {
          "Content-Type": "multipart/form-data"
        })
        estatutoUuid = data.uuid;
        toast.dismiss();
      }

      if (fileContratoMeltt instanceof File) {
        toast.loading("Enviando Contrato Meltt para D4Sign...");

        const formData = new FormData();
        formData.append("file", fileContratoMeltt);

        const data = await apiPostData("academic", "/d4sign/contrato-meltt", formData, {
          "Content-Type": "multipart/form-data"
        })
        contratoMelttUuid = data.uuid;
        toast.dismiss();
      }

      const dataObj = {
        ...turmaValues,
        estatuto_uuid: estatutoUuid,
        meltt_contrato_uuid: contratoMelttUuid
      };

      const response = await apiPostData("academic", "/turmas", dataObj);

      if (response.id) {
        await Promise.all(
          planos_formatura.map((plano: any) =>
            apiPostData("academic", `/turmas/vincular-planos`, {
              turma_id: response.id,
              plano_id: plano.id,
            })
          )
        );

        toast.success("Turma salva com sucesso!");
        navigate(-1);
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Erro ao salvar turma");
    } finally {
      toast.dismiss();
      setLoadingSave(false);
    }
  };

    useEffect(() => {
    const getPlanos = async () => {
      const response = await apiGetData("academic", "/planos-formatura");
      if (response.data) {
        setPlanos(response.data);
      }
    };
    getPlanos();
  }, []);

  return (
    <Stack width="100%" height="100%" gap={6} px={2}>
      <Stack width="100%" direction="column">
        <Typography
          variant="h4"
          fontWeight={800}
          mb={3}
          sx={{
            fontFamily: 'Poppins',
            background: 'linear-gradient(45deg, #2D1C63 30%, #4A3C8B 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            borderBottom: '2px solid',
            borderColor: 'divider',
            pb: 1.5
          }}
        >
          Nova Associação de Turma
          <Typography variant="body2" color="text.secondary" mt={1}>
            Preencha todos os campos obrigatórios para registrar a nova turma
          </Typography>
        </Typography>

        <Paper
          elevation={4}
          sx={{
            position: 'relative',
            p: 4,
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
            initialValues={{ ...initialValuesTurma }}
            validationSchema={validateTurmaSchema}
            onSubmit={(values: any) => onSubmitTurma(values)}
          >
            {({ values, handleChange, handleSubmit, setFieldValue }) => (
              <form onSubmit={handleSubmit} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}>
                <Stack height="100%" spacing={4} pb={10}>
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
                        label="Identificador Único"
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
                          value={values.planos_formatura}
                          onChange={(_, newValue) => setFieldValue("planos_formatura", newValue)}
                          onKeyDown={(e) => e.preventDefault()}
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
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Planos de Formatura"
                              variant="filled"
                              placeholder="Selecione os planos"
                            />
                          )}
                        />
                      </FormControl>
                    </Stack>

                    {/* FILE UPLOAD */}
                    <Box
                      sx={{
                        border: 2,
                        borderColor: 'divider',
                        borderRadius: 3,
                        p: 2,
                        transition: 'border-color 0.3s',
                        '&:hover': { borderColor: 'primary.main' },
                        bgcolor: 'grey.50'
                      }}
                      {...getRootProps()}
                    >
                      <input {...getInputProps()} />
                      <Stack
                        height={160}
                        justifyContent="center"
                        alignItems="center"
                        spacing={1}
                      >
                        {fileEstatuto ? (
                          <>
                            <IconUpload style={{ fontSize: 32 }} />
                            <Typography variant="h6" color="primary">
                              {fileEstatuto.name}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="caption" color="text.secondary">
                                {fileEstatuto.type}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFileEstatuto(null);
                                }}
                              >
                                <TbTrash size={16} style={{ color: '#ef5350' }} />
                              </IconButton>
                            </Stack>
                          </>
                        ) : (
                          <>
                            <IconUpload style={{ fontSize: 32 }} />
                            <Typography variant="body1" color="text.secondary">
                              {isDragActive ? 'Solte o arquivo aqui' : 'Arraste o Estatuto ou clique para enviar'}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                              Formatos suportados: PDF
                            </Typography>
                            <Button
                              variant="text"
                              size="small"
                              startIcon={<SlMagnifier />}
                              sx={{
                                mt: 1,
                                color: 'primary.main',
                                '&:hover': { bgcolor: 'transparent' }
                              }}
                            >
                              Procurar arquivo
                            </Button>
                          </>
                        )}
                      </Stack>
                    </Box>

                    {/* MELTT CONTRATO FILE UPLOAD */}
                    <Box {...getRootPropsContratoMeltt()} sx={uploadBoxStyles}>
                      <input {...getInputPropsContratoMeltt()} />
                      <Stack height={160} justifyContent="center" alignItems="center" spacing={1}>
                        {fileContratoMeltt ? (
                          <>
                            <IconUpload style={{ fontSize: 32 }} />
                            <Typography variant="h6" color="primary">
                              {fileContratoMeltt.name}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="caption" color="text.secondary">
                                {fileContratoMeltt.type}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFileContratoMeltt(null);
                                }}
                              >
                                <TbTrash size={16} style={{ color: '#ef5350' }} />
                              </IconButton>
                            </Stack>
                          </>
                        ) : (
                          <>
                            <IconUpload style={{ fontSize: 32 }} />
                            <Typography variant="body1" color="text.secondary">
                              {isDragActiveContratoMeltt ? 'Solte o arquivo aqui' : 'Arraste o Contrato de Prestação de Serviço MELTT ou clique para buscar'}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                              Apenas PDF
                            </Typography>
                            <Button
                              variant="text"
                              size="small"
                              startIcon={<SlMagnifier />}
                              sx={uploadButtonStyles}
                            >
                              Procurar arquivo
                            </Button>
                          </>
                        )}
                      </Stack>
                    </Box>

                    {['regras_adesao', 'regras_rescisao', 'regras_renegociacao'].map((field) => (
                      <TextField
                        key={field}
                        fullWidth
                        name={field}
                        label={`Regras de ${field.split('_')[1]}`}
                        multiline
                        rows={4}
                        value={values[field]}
                        onChange={handleChange}
                        variant="filled"
                        InputProps={{
                          sx: {
                            borderRadius: 2,
                            alignItems: 'flex-start',
                            bgcolor: 'grey.50',
                            '& textarea': {
                              lineHeight: 1.6,
                              py: 1.5
                            }
                          }
                        }}
                        InputLabelProps={{
                          shrink: true,
                          sx: { fontWeight: 600 }
                        }}
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
                      borderTop: '2px solid',
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
                        bgcolor: 'primary.main',
                        '&:hover': { bgcolor: 'primary.dark' }
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

export default TurmasPageNew;
