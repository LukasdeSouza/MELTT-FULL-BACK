import {
  Button,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { Formik } from "formik";

import { validateStudentEditSchema } from "../../../utils/validationSchemas";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import "dayjs/locale/pt-br";
import LoadingBackdrop from "../../../components/loadingBackdrop";
import { apiGetData, apiPostData, apiPutData } from "../../../services/api";
import { LoadingButton } from "@mui/lab";
import { BiSave } from "react-icons/bi";
import { useAlunoContext } from "../../../providers/alunoContext";
import { initialValuesAluno } from "../../../initialValues";
import { tiposUsuario } from "../../../utils/arrays";

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

const UsuariosPageEdit = () => {
  const navigate = useNavigate();
  const { stateAluno } = useAlunoContext();
  const { id } = useParams();

  const [turmas, setTurmas] = useState([]);
  const [openLoadingBackdrop, setOpenLoadingBackdrop] = useState(false);
  const [loadingAluno, setLoadingAluno] = useState(false);
  const [loadingTurmas, setLoadingTurmas] = useState(false);

  const getAlunosInitialValue = Object.keys(initialValuesAluno).reduce(
    (acc, key) => {
      const typedKey = key as keyof typeof initialValuesAluno;
      acc[typedKey] = id
        ? stateAluno.alunoSelecionado?.[typedKey]
        : initialValuesAluno[typedKey];
      return acc;
    },
    {} as any
  );

  const fetchTurmas = async () => {
    setLoadingTurmas(true);
    await apiGetData("academic", `/turmas?limit=50`).then((response) => {
      console.log(response.data)
      setTurmas(response.data)
    });
    setLoadingTurmas(false);
  };

  const onSubmitUser = async (values: any) => {
    let { senha, confirmar_senha, ativo, ...rest } = values;

    if (!id) {
      if(values.tipo === "ALUNO") {
        senha = "senha123";
        confirmar_senha = "senha123";
      }
      if (senha !== confirmar_senha) {
        toast.error("As senhas não conferem");
        return;
      }
    }

    delete values.confirmar_senha;
    values = {
      ...rest,
      senha,
      ativo: ativo ? 1 : 0
    };
    setLoadingAluno(true);
    try {
      if (id) {
        const response = await apiPutData("academic", `/usuarios/${id}`, values);
        if (response.data?.id) {
          toast.success(response.message);
          navigate("/usuarios");
        }
      } else {
        const response = await apiPostData("academic", "/usuarios", values);

        if (response.id) {
          toast.success("Aluno salvo com sucesso");
          navigate("/usuarios");
        }
      }
    } catch (error) {
      toast.error("Erro ao salvar aluno");
    }
    setLoadingAluno(false);
  };

  useEffect(() => {
    fetchTurmas();
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
          Cadastro de Usuário
          <Typography variant="body2" color="text.secondary" mt={1}>
            Preencha os campos abaixo para registrar um novo aluno
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
            initialValues={{ ...getAlunosInitialValue }}
            validationSchema={validateStudentEditSchema}
            onSubmit={(values: any) => onSubmitUser(values)}
          >
            {({ values, errors, handleChange, handleSubmit }) => (
              <form onSubmit={handleSubmit} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}>
                <Stack spacing={4} pb={10}>
                  <Grid container spacing={3}>
                    {/* Seção de Dados Pessoais */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        variant="filled"
                        label="Nome Completo"
                        name="nome"
                        value={values.nome}
                        onChange={handleChange}
                        error={Boolean(errors.nome)}
                        InputProps={{
                          sx: {
                            borderRadius: 2,
                            '&:hover': { bgcolor: 'grey.50' }
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        variant="filled"
                        label="Telefone"
                        name="telefone"
                        value={values.telefone}
                        onChange={handleChange}
                        InputProps={{
                          sx: {
                            borderRadius: 2,
                            '&:hover': { bgcolor: 'grey.50' }
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        variant="filled"
                        label="E-mail"
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        error={Boolean(errors.email)}
                        InputProps={{
                          sx: {
                            borderRadius: 2,
                            '&:hover': { bgcolor: 'grey.50' }
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        variant="filled"
                        label="Documento"
                        name="documento"
                        value={values.documento}
                        onChange={handleChange}
                        error={Boolean(errors.documento)}
                        InputProps={{
                          sx: {
                            borderRadius: 2,
                            '&:hover': { bgcolor: 'grey.50' }
                          }
                        }}
                      />
                    </Grid>

                    {/* Seção de Segurança */}
                    {values.tipo !== "ALUNO" && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          disabled={id ? true : false}
                          variant="filled"
                          label="Senha"
                          name="senha"
                          type="password"
                          value={values.senha}
                          onChange={handleChange}
                          InputProps={{
                            sx: {
                              borderRadius: 2,
                              '&:hover': { bgcolor: 'grey.50' }
                            }
                          }}
                        />
                      </Grid>
                    )}
                    {values.tipo !== "ALUNO" && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        disabled={id ? true : false}
                        variant="filled"
                        label="Confirmar Senha"
                        name="confirmar_senha"
                        type="password"
                        value={values.confirmar_senha}
                        onChange={handleChange}
                        InputProps={{
                          sx: {
                            borderRadius: 2,
                            '&:hover': { bgcolor: 'grey.50' }
                          }
                        }}
                      />
                    </Grid>
                    )}

                    {/* Seção de Vinculação */}
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth variant="filled">
                        <InputLabel>Tipo de Usuário</InputLabel>
                        <Select
                          name="tipo"
                          value={values.tipo}
                          onChange={handleChange}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                borderRadius: 2,
                                '& .MuiMenuItem-root': {
                                  py: 1.5,
                                  '&:hover': { bgcolor: 'primary.light', color: 'white' }
                                }
                              }
                            }
                          }}
                        >
                          {tiposUsuario.map((tipo) => (
                            <MenuItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {values.tipo !== "ADMIN" && (
                      <>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth variant="filled">
                            <InputLabel>Turma</InputLabel>
                            <Select
                              name="turma_id"
                              value={values.turma_id}
                              onChange={handleChange}
                              disabled={loadingTurmas}
                              MenuProps={{
                                PaperProps: {
                                  sx: {
                                    borderRadius: 2,
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

                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            variant="filled"
                            label="Instituição de Ensino"
                            name="faculdade"
                            value={values.faculdade}
                            onChange={handleChange}
                          />
                        </Grid>
                      </>
                    )}

                    {/* Status do Usuário */}
                    <Grid item xs={12}>
                      <FormControl component="fieldset">
                        <FormGroup row>
                          <FormControlLabel
                            control={
                              <Switch
                                color="primary"
                                checked={values.ativo}
                                onChange={handleChange}
                                name="ativo"
                              />
                            }
                            label="Usuário Ativo"
                            labelPlacement="start"
                            sx={{
                              '& .MuiFormControlLabel-label': {
                                fontWeight: 500,
                                color: 'text.primary'
                              }
                            }}
                          />
                        </FormGroup>
                      </FormControl>
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
                      onClick={() => navigate("/usuarios")}
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
                      color="primary"
                      loading={loadingAluno}
                      endIcon={<BiSave />}
                      sx={{
                        px: 4,
                        borderRadius: 2,
                        textTransform: 'none',
                        background: 'linear-gradient(45deg, #2D1C63 30%, #4A3C8B 90%)',
                        '&:hover': { opacity: 0.9 }
                      }}
                    >
                      Salvar Cadastro
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

export default UsuariosPageEdit;
