import { LoadingButton } from '@mui/lab';
import { Button, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from '@mui/material';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import { BiSave } from 'react-icons/bi';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { initialValuesAdesao } from '../../../../initialValues';
import { useAdesaoContext } from '../../../../providers/adesaoContext';
import { apiGetData, apiPostData } from '../../../../services/api';
import { validateAdesaoSchema } from '../../../../utils/validationSchemas';

const AdesaoEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { stateAdesao } = useAdesaoContext();
  const [savingAdesao, setSavingAdesao] = useState(false);

  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);

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
    let dataObj = {
      ...values,
      usuario_id: values.aluno_id,
      data_assinatura: new Date().toISOString()
    };

    try {
      const response = await apiPostData("academic", "/adesoes", dataObj);
      if (response.id) {
        toast.success("Adesão salva com sucesso");
        navigate(-1);
      }
    } catch (error) {
      toast.error("Erro ao salvar adesão");
    }
    setSavingAdesao(false)
  }

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
                          {alunos.map((aluno:any) => (
                            <MenuItem key={aluno.id} value={aluno.id}>
                              {aluno.nome}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
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