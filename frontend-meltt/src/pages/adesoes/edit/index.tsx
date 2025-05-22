import { LoadingButton } from '@mui/lab';
import { Button, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from '@mui/material';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import { BiSave } from 'react-icons/bi';
import { useNavigate, useParams } from 'react-router-dom';
import { initialValuesAdesao } from '../../../initialValues';
import { useAdesaoContext } from '../../../providers/adesaoContext';
import { validateAdesaoSchema } from '../../../utils/validationSchemas';
import toast from 'react-hot-toast';
import { apiGetData, apiPostData } from '../../../services/api';

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
      let response = await apiGetData("academic", "/alunos");
      setAlunos(response.data);
    } catch (error) {
      toast.error("Erro ao buscar alunos");
    }
  }

  const fetchTurmas = async () => {
    try {
      let response = await apiGetData("academic", "/turmas");
      console.log('response', response)
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
            overflow: "auto",
            borderRadius: "24px",
            backgroundColor: "#fff",
          }}
        >
          <Formik
            initialValues={{
              ...getAdesaoInitialValue,
            }}
            validationSchema={validateAdesaoSchema}
            onSubmit={(values: any) => {
              onSubmitAdesao(values)
            }}
          >
            {({ values, errors, handleChange, handleSubmit }) => (
              <form
                className="h-[100%] flex flex-col justify-between"
                onSubmit={handleSubmit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              >
                <Stack padding={2} gap={2} width={"100%"}>
                  <Stack direction={"column"}>
                    <Typography fontFamily={"Poppins"} fontWeight={600}>
                      Dados da Adesão
                    </Typography>
                    <Typography
                      fontFamily={"Poppins"}
                      variant="caption"
                      color="textSecondary"
                    >
                      preencha com as informações básicas da adesão
                    </Typography>
                  </Stack>
                  <Stack width={"100%"} direction={"row"} gap={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel
                        id="turma-label"
                        sx={{
                          backgroundColor: "white",
                          px: 0.5,
                        }}
                      >
                        Aluno
                      </InputLabel>
                      <Select
                        labelId="aluno-label"
                        name="aluno_id"
                        value={values.aluno_id}
                        disabled={id ? true : false}
                        onChange={handleChange}
                      >
                        {alunos.map((aluno: { id: number, nome: string }) => (
                          <MenuItem key={aluno.id} value={aluno.id}>
                            {aluno.nome}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                      <InputLabel
                        id="turma-label"
                        sx={{
                          backgroundColor: "white",
                          px: 0.5,
                        }}
                      >
                        Turma
                      </InputLabel>
                      <Select
                        labelId="turma-label"
                        name="turma_id"
                        value={values.turma_id}
                        disabled={id ? true : false}
                        onChange={handleChange}
                      >
                        {turmas.map((turma: { id: number, nome: string }) => (
                          <MenuItem key={turma.id} value={turma.id}>
                            {turma.nome}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                  <FormControl fullWidth size="small">
                    <InputLabel
                      sx={{
                        backgroundColor: "white",
                        px: 0.5,
                      }}
                    >
                      Status da Adesão
                    </InputLabel>
                    <Select
                      labelId="status-label"
                      name="status"
                      value={values.status}
                      disabled={id ? true : false}
                      onChange={handleChange}
                    >
                      <MenuItem key={'pendente'} value={'pendente'}>
                        Pendente
                      </MenuItem>
                      <MenuItem key={'concluída'} value={'concluída'}>
                        Concluída
                      </MenuItem>
                      <MenuItem key={'analise'} value={'analise'}>
                        Em análise
                      </MenuItem>
                    </Select>
                  </FormControl>
                  <Stack width={"100%"} direction={"row"} gap={2}>
                    <TextField
                      fullWidth
                      label="Observações"
                      name="observacoes"
                      placeholder=""
                      disabled={id ? true : false}
                      size="small"
                      rows={10}
                      value={values.observacoes}
                      error={Boolean(errors.observacoes)}
                      onChange={handleChange}
                    />
                  </Stack>
                </Stack>
                <Stack
                  width={"100%"}
                  justifyContent={"flex-end"}
                  direction={"row"}
                  gap={2}
                  px={2}
                  mt={1}
                >
                  <Button
                    color="primary"
                    variant="outlined"
                    size="small"
                    onClick={() => navigate("/adesoes")}
                    sx={{ width: 120, borderRadius: 2, fontFamily: "Poppins" }}
                  >
                    Voltar
                  </Button>
                  <LoadingButton
                    type="submit"
                    color="secondary"
                    variant="contained"
                    size="small"
                    loading={savingAdesao}
                    endIcon={<BiSave />}
                    sx={{ width: 120, borderRadius: 2, fontFamily: "Poppins" }}
                  >
                    Salvar
                  </LoadingButton>
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