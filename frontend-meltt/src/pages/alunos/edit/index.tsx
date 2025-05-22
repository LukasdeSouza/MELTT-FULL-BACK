import {
  Button,
  FormControl,
  FormControlLabel,
  FormGroup,
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

import { validateStudentSchema, validateUpdateStudentSchema } from "../../../utils/validationSchemas";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import "dayjs/locale/pt-br";
import LoadingBackdrop from "../../../components/loadingBackdrop";
import { apiGetData, apiPostData, apiPutData } from "../../../services/api";
import { LoadingButton } from "@mui/lab";
import { BiSave } from "react-icons/bi";
import { useAlunoContext } from "../../../providers/alunoContext";
import { initialValuesAluno } from "../../../initialValues";
import formatPhoneNumber from "../../../utils/formatters/masks/phoneNumberMask.js";
import resetPhoneNumber from "../../../utils/formatters/masks/resetPhoneNumber.js";

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

const AlunosPageEdit = () => {
  const navigate = useNavigate();
  const { stateAluno } = useAlunoContext();
  const [tipoUsuario, setTipoUsuario] = useState(null);

  const { id } = useParams();

  const [turmas, setTurmas] = useState([]);

  const [openLoadingBackdrop, setOpenLoadingBackdrop] = useState(false);
  const [loadingAluno, setLoadingAluno] = useState(false);
  const [loadingTurmas, setLoadingTurmas] = useState(false);

  const tiposUsuario = ["ADMIN", "ALUNO", "ASSOCIACAO"];

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
    await apiGetData("academic", `/turmas`).then((response) => {
      console.log(response.data)
      setTurmas(response.data)
    });
    setLoadingTurmas(false);
  };

  const onSubmitAluno = async (values: any) => {
    try {
      if (id) {
        setLoadingAluno(true);
        const { telefone, nome, documento, ativo } = values;
        const telefoneApenasNumeros = resetPhoneNumber(telefone);
        const valuesToUpdate = { telefone: telefoneApenasNumeros, nome, documento, ativo };
        console.log("valuesToUpdate", valuesToUpdate);
        const response = await apiPutData("academic", `/usuarios/${id}`, valuesToUpdate);
        console.log("response", response);
        if (response !== null) {
          toast.success("Aluno atualizado com sucesso");
          navigate("/usuarios");
        }
      } else {
        console.log("aqui");
        let newTurma_id;

        const { senha, confirmar_senha, ativo, documento, tipo, turma_id, telefone, ...rest } = values;
        const telefoneApenasNumeros = resetPhoneNumber(telefone);
        if (senha !== confirmar_senha) {
          toast.error("As senhas não conferem");
        }
        if (turma_id === "") {
          newTurma_id = null;
          values = { ...rest, senha, documento, tipo, turma_id: newTurma_id, ativo: ativo ? 1 : 0, telefone: telefoneApenasNumeros };
        } else {
          values = { ...rest, senha, documento, tipo, turma_id, ativo: ativo ? 1 : 0, telefone: telefoneApenasNumeros };
        }
        console.log("values", values);
        setLoadingAluno(true);
        if (tipo === "ALUNO") {
          console.log(documento)
          const response = await apiGetData("academic", `/pagamentos/documentos?numeroDocumento=${documento}`);

          console.log("response", response);

          if (response.id === null) {
            toast.error("Este aluno não possui nem vínculo de pagamento no Bling");
          }

          if (response.id) {
            values.id_bling = response.id_bling;

            console.log("values2", values);
            const responseAluno = await apiPostData("academic", `/usuarios`, values);

            console.log("responseAluno", responseAluno);

            if (responseAluno.id) {
              toast.success("Aluno salvo com sucesso");
              navigate("/usuarios");
            }
          }
        } else {
          const response = await apiPostData("academic", "/usuarios", values);
          console.log("response", response);
          if (response.id) {
            toast.success("Usuário criado com sucesso");
            navigate("/usuarios");
          }
        }
      }
    } catch (error) {
      toast.error("Erro ao salvar aluno");
    } finally {
      setLoadingAluno(false);
    }
  };

  useEffect(() => {
    fetchTurmas();
  }, []);

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
              ...getAlunosInitialValue,
              telefone: formatPhoneNumber(getAlunosInitialValue.telefone),
            }}
            validationSchema={id ? validateUpdateStudentSchema : validateStudentSchema}
            onSubmit={(values: any) => {
              console.log(values)
              onSubmitAluno(values)
            }}
          >
            {({ values, errors, handleChange, handleSubmit, setFieldValue }) => (
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
                      Dados do Usuário
                    </Typography>
                    <Typography
                      fontFamily={"Poppins"}
                      variant="caption"
                      color="textSecondary"
                    >
                      preencha com as informações básicas do aluno, selecionando
                      faculdade e turma a qual ele é vinculado.
                    </Typography>
                  </Stack>
                  <Stack width={"100%"} direction={"row"} gap={2}>
                    <TextField
                      fullWidth
                      label="Nome"
                      name="nome"
                      placeholder="Digite seu nome"
                      size="small"
                      value={values.nome ?? ""}
                      error={Boolean(errors.nome)}
                      onChange={handleChange}
                    />
                    <TextField
                      fullWidth
                      label="Telefone Celular"
                      name="telefone"
                      placeholder="(XX) XXXXX-XXXX"
                      size="small"
                      value={values.telefone ?? ""}
                      error={Boolean(errors.telefone)}
                      onChange={(e) => {
                        const formattedValue = formatPhoneNumber(e.target.value);
                        setFieldValue("telefone", formattedValue);
                      }}
                      inputProps={{ maxLength: 15 }}
                    />
                  </Stack>
                  <Stack width={"100%"} direction={"row"} gap={2}>
                    {!id && (
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        placeholder="email@example.com"
                        size="small"
                        value={values.email ?? ""}
                        error={Boolean(errors.email)}
                        onChange={handleChange}
                      />
                    )}
                    <TextField
                      sx={{ width: id ? "50%" : "100%" }}
                      label="Documento"
                      name="documento"
                      placeholder="RG ou CPF"
                      size="small"
                      value={values.documento ?? ""}
                      error={Boolean(errors.documento)}
                      onChange={handleChange}
                    />
                  </Stack>
                  {!id && (
                    <Stack width={"100%"} direction={"row"} gap={2}>
                      <TextField
                        fullWidth
                        label="Senha"
                        name="senha"
                        placeholder="Digite sua senha"
                        size="small"
                        value={values.senha ?? ""}
                        error={Boolean(errors.senha)}
                        onChange={handleChange}
                      />
                      <TextField
                        sx={{ width: "100%" }}
                        label="Confirmar Senha"
                        name="confirmar_senha"
                        placeholder="Digite sua senha novamente"
                        size="small"
                        value={values.confirmar_senha ?? ""}
                        error={Boolean(errors.confirmar_senha)}
                        onChange={handleChange}
                      />
                    </Stack>
                  )}
                  {!id && (
                    <Stack width={"100%"} direction={"row"} gap={2}>
                      <FormControl sx={{ width: "50%" }} size="small">
                        <InputLabel
                          id="tipo"
                          sx={{
                            backgroundColor: "white",
                            px: 0.5,
                          }}
                        >
                          Tipo de Usuário
                        </InputLabel>
                        <Select
                          labelId="tipo"
                          name="tipo"
                          value={values.tipo ?? ""}
                          disabled={loadingTurmas}
                          onChange={(event) => {
                            handleChange(event); // Mantém a funcionalidade do Formik
                            setTipoUsuario(event.target.value); // Executa a outra função desejada
                          }}
                        >
                          {tiposUsuario.map((tipo: string) => (
                            <MenuItem key={tipo} value={tipo}>
                              {tipo}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl sx={{ width: "50%", visibility: tipoUsuario == "ALUNO" ? "visible" : "hidden" }} size="small">
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
                          value={turmas.some((t: { id: number }) => t.id === values.turma_id) ? values.turma_id : ""}
                          disabled={loadingTurmas}
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
                  )}
                  <Paper elevation={0} sx={{ width: "50%", padding: 0, margin: 0, alignSelf: "start" }}>
                    <FormControl component="fieldset">
                      <FormGroup aria-label="position" row>
                        <FormControlLabel
                          name="ativo"
                          control={<Switch checked={values.ativo}
                            onChange={(e) => setFieldValue('ativo', e.target.checked)} color="primary"
                          />}
                          label="Ativo"
                          labelPlacement="start"
                        />
                      </FormGroup>
                    </FormControl>
                  </Paper >
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
                    onClick={() => navigate("/usuarios")}
                    sx={{ width: 120, borderRadius: 2, fontFamily: "Poppins" }}
                  >
                    Voltar
                  </Button>
                  <LoadingButton
                    type="submit"
                    color="secondary"
                    variant="contained"
                    size="small"
                    loading={loadingAluno}
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
      <LoadingBackdrop
        open={openLoadingBackdrop}
        handleClose={() => setOpenLoadingBackdrop(false)}
      />
    </Stack>
  );
};

export default AlunosPageEdit;
