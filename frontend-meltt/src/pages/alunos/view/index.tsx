import {
  Button,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { Formik } from "formik";

import { validateStudentSchema } from "../../../utils/validationSchemas";
import { useEffect, useState } from "react";
import "dayjs/locale/pt-br";
import LoadingBackdrop from "../../../components/loadingBackdrop";
import { apiGetData } from "../../../services/api";
import { useAlunoContext } from "../../../providers/alunoContext";
import { initialValuesAluno } from "../../../initialValues";
import TextDetails from "../../../components/textDetails";

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

const AlunosPageView = () => {
  const navigate = useNavigate();
  const { stateAluno } = useAlunoContext();

  const { id } = useParams();

  const [faculdade, setFaculdade] = useState<{ nome: string }[]>([]);
  const [turma, setTurma] = useState<
    {
      faculdade_id: any;
      nome: string;
    }[]
  >([]);

  const [openLoadingBackdrop, setOpenLoadingBackdrop] = useState(false);
  const [loadingFaculdade, setLoadingFaculdade] = useState(false);
  const [loadingTurma, setLoadingTurma] = useState(false);
  const getAlunosInitialValue = Object.keys(initialValuesAluno).reduce(
    (acc: Record<string, any>, key) => {
      const typedKey = key as keyof typeof initialValuesAluno;
      acc[typedKey] = id
        ? stateAluno.alunoSelecionado?.[typedKey]
        : initialValuesAluno[typedKey];
      return acc;
    },
    {} as typeof initialValuesAluno
  );


  const fetchTurma = async () => {
    setLoadingTurma(true);
    await apiGetData(
      "academic",
      `/turmas/${stateAluno.alunoSelecionado?.turma_id}`
    ).then((data) => setTurma(data));
    setLoadingTurma(false);
  };

  const fetchFaculdade = async () => {
    setLoadingFaculdade(true);
    await apiGetData("academic", `/faculdades/${turma[0].faculdade_id}`).then(
      (data) => {
        console.log(data)
        setFaculdade(data)
      }
    );
    setLoadingFaculdade(false);
  };

  const onSubmitAluno = async () => {

  };

  useEffect(() => {
    fetchFaculdade();
    fetchTurma();
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
            }}
            validationSchema={validateStudentSchema}
            onSubmit={() => onSubmitAluno()}
          >
            {() => (
              <form className="h-[100%] flex flex-col justify-between">
                <Stack padding={2} gap={2} width={"100%"}>
                  <Stack direction={"column"}>
                    <Typography fontWeight={600}>
                      Dados do Usuário
                    </Typography>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                    >
                      visualize as informações abaixo referente ao aluno
                    </Typography>
                  </Stack>
                  <Stack width={"100%"} direction={"row"} gap={10}>
                    <TextDetails
                      
                      text="Nome Completo"
                      details={stateAluno.alunoSelecionado?.nome}
                    />
                    <TextDetails
                      text="E-mail"
                      details={stateAluno.alunoSelecionado?.email}
                    />
                    <TextDetails
                      text="Telefone Celular"
                      details={stateAluno.alunoSelecionado?.telefone}
                    />
                    <TextDetails
                      text="Documento"
                      details={stateAluno.alunoSelecionado?.documento}
                    />
                  </Stack>
                  <Stack width={"100%"} direction={"row"} gap={10}>
                    <TextDetails
                      text="Nível de Acesso"
                      details={stateAluno.alunoSelecionado?.tipo}
                    />
                    {stateAluno.alunoSelecionado?.tipo === "ALUNO" && (
                      <>
                        <TextDetails
                          text="Faculdade"
                          details={
                            loadingFaculdade ? "Carregando..." : faculdade[0]?.nome
                          }
                        />
                        <TextDetails
                          text="Turma"
                          details={loadingTurma ? "Carregando..." : turma[0]?.nome}
                        />
                        <TextDetails
                          text="Status de Pagamento"
                          details={
                            stateAluno.alunoSelecionado?.formatura_paga
                              ? "Formatura Paga"
                              : "Formatura em aberto"
                          }
                        />
                      </>
                    )}
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
                    onClick={() => navigate("/usuarios")}
                    sx={{ width: 120, borderRadius: 2, fontFamily: "Poppins" }}
                  >
                    Voltar
                  </Button>
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

export default AlunosPageView;
