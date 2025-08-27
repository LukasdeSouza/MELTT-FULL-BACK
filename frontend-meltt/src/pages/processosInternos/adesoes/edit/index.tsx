import { LoadingButton } from '@mui/lab';
import { Box, Button, FormControl, Grid, IconButton, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from '@mui/material';
import { Formik } from 'formik';
import { useCallback, useEffect, useState } from 'react';
import { BiSave } from 'react-icons/bi';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { initialValuesAdesao } from '../../../../initialValues';
import { useAdesaoContext } from '../../../../providers/adesaoContext';
import { apiGetData, apiPostData } from '../../../../services/api';
import { validateAdesaoSchema } from '../../../../utils/validationSchemas';
import { useDropzone } from 'react-dropzone';
import IconUpload from '../../../../assets/icons/upload';
import { TbTrash } from 'react-icons/tb';
import { SlMagnifier } from 'react-icons/sl';

const AdesaoEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { stateAdesao } = useAdesaoContext();
  const [savingAdesao, setSavingAdesao] = useState(false);

  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);

  const [fileAdesao, setFileAdesao] = useState<File | null>(null);

  const getAdesaoInitialValue = Object.keys(initialValuesAdesao).reduce(
    (acc, key) => {
      const typedKey = key as keyof typeof initialValuesAdesao;
      acc[typedKey] = id
        ? stateAdesao.adesaoSelecionada?.[typedKey]
        : initialValuesAdesao[typedKey];
      return acc;
    },
    {} as any
  );

  const fetchAlunos = async () => {
    try {
      let response = await apiGetData("academic", "/usuarios");
      setAlunos(response.data);
    } catch (error) {
      toast.error("Erro ao buscar alunos");
    }
  }

  const fetchTurmas = async () => {
    try {
      let response = await apiGetData("academic", "/turmas");
      setTurmas(response.data);
    } catch (error) {
      toast.error("Erro ao buscar turmas");
    }
  }

  const fetchAllInfos = async () => {
    fetchAlunos();
    fetchTurmas();
  }

  const onSubmitAdesao = async (values: any) => {
    setSavingAdesao(true);
    toast.loading("Salvando Adesão...");

    try {
      let adesaoUuid: string | null = null;
      if (fileAdesao instanceof File) {
        toast.loading("Enviando Proposta para D4Sign...");

        const formData = new FormData();
        formData.append("file", fileAdesao);

        const data = await apiPostData("academic", "/d4sign/upload/adesao", formData, {
          "Content-Type": "multipart/form-data"
        })

        adesaoUuid = data.uuid;
        toast.dismiss();
      }
      let dataObj = {
        ...values,
        usuario_id: values.aluno_id,
        data_assinatura: new Date().toISOString(),
        file_uuid: adesaoUuid,
      };

      const response = await apiPostData("academic", "/adesoes", dataObj);
      if (response.id) {
        toast.dismiss();
        toast.success("Adesão salva com sucesso");
        navigate(-1);
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Erro ao salvar adesão. Envie um arquivo de no máximo 20MB e no formato PDF.");
    }
    setSavingAdesao(false)
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFileAdesao(acceptedFiles[0]);
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

  useEffect(() => {
    fetchAllInfos();
  }, [])



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
          Dados da Adesão
          <Typography variant="body2" color="text.secondary" mt={1}>
            Preencha as informações básicas para registro da adesão
          </Typography>
        </Typography>

        <Paper
          elevation={4}
          sx={{
            position: 'relative',
            p: 4,
            height: 'calc(100vh - 160px)',
            overflow: 'auto',
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
            initialValues={{ ...getAdesaoInitialValue }}
            validationSchema={validateAdesaoSchema}
            onSubmit={(values: any) => onSubmitAdesao(values)}
          >
            {({ values, errors, handleChange, handleSubmit }) => (
              <form onSubmit={handleSubmit} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}>
                <Stack spacing={4} pb={10}>
                  <Grid container spacing={3}>
                    {/* Seção de Seleções */}
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth variant="filled">
                        <InputLabel sx={{ fontFamily: 'Poppins', fontWeight: 500 }}>
                          Turma
                        </InputLabel>
                        <Select
                          name="turma_id"
                          value={values.turma_id}
                          disabled={!!id}
                          onChange={handleChange}
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
                          {turmas.map((turma: any) => (
                            <MenuItem key={turma.id} value={turma.id}>
                              {turma.nome}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth variant="filled">
                        <InputLabel sx={{ fontFamily: 'Poppins', fontWeight: 500 }}>
                          Aluno
                        </InputLabel>
                        <Select
                          name="aluno_id"
                          value={values.aluno_id}
                          disabled={!!id}
                          onChange={handleChange}
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
                          {alunos.map((aluno: any) => (
                            <MenuItem key={aluno.id} value={aluno.id}>
                              {aluno.nome}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={24}>
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
                          {fileAdesao ? (
                            <>
                              <IconUpload style={{ fontSize: 32 }} />
                              <Typography variant="h6" color="primary">
                                {fileAdesao.name}
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="caption" color="text.secondary">
                                  {fileAdesao.type}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFileAdesao(null);
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
                                {isDragActive ? 'Solte o arquivo aqui' : 'Arraste o Documento de Adesão ou clique para buscar'}
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
                    </Grid>

                    {/* Status da Adesão */}
                    <Grid item xs={12}>
                      <FormControl fullWidth variant="filled">
                        <InputLabel sx={{ fontFamily: 'Poppins', fontWeight: 500 }}>
                          Status da Adesão
                        </InputLabel>
                        <Select
                          name="status"
                          value={values.status}
                          disabled={!!id}
                          onChange={handleChange}
                          sx={{ textTransform: 'capitalize' }}
                        >
                          {['pendente', 'concluída', 'cancelado'].map((status) => (
                            <MenuItem
                              key={status}
                              value={status}
                              sx={{ textTransform: 'capitalize' }}
                            >
                              {status}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Instituição de Ensino */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        variant="filled"
                        label="Instituição de Ensino"
                        name="faculdade"
                        value={values.faculdade}
                        onChange={handleChange}
                        InputProps={{
                          sx: {
                            borderRadius: 2,
                            '&:hover': { bgcolor: 'grey.50' }
                          }
                        }}
                      />
                    </Grid>

                    {/* Observações */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        variant="filled"
                        label="Observações"
                        name="observacoes"
                        value={values.observacoes}
                        onChange={handleChange}
                        disabled={!!id}
                        multiline
                        rows={6}
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
                        error={Boolean(errors.observacoes)}
                      // helperText={errors.observacoes}
                      />
                    </Grid>
                  </Grid>

                  {/* Botões de Ação */}
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
                      onClick={() => navigate("/processos-internos/adesoes")}
                      sx={{
                        px: 4,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontFamily: 'Poppins',
                        '&:hover': { borderWidth: 2 }
                      }}
                    >
                      Voltar
                    </Button>
                    <LoadingButton
                      type="submit"
                      variant="contained"
                      color="primary"
                      loading={savingAdesao}
                      endIcon={<BiSave />}
                      sx={{
                        px: 4,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontFamily: 'Poppins',
                        background: 'linear-gradient(45deg, #2D1C63 30%, #4A3C8B 90%)',
                        '&:hover': { opacity: 0.9 }
                      }}
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
    </Stack>
  )
}

export default AdesaoEditPage