import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";
import "dayjs/locale/pt-br";
import LoadingBackdrop from "../../../components/loadingBackdrop";
import { apiGetData } from "../../../services/api";
import { useAlunoContext } from "../../../providers/alunoContext";
import TextDetails from "../../../components/textDetails";
import { BiArrowBack, BiBook, BiBuilding, BiEnvelope, BiGroup, BiIdCard, BiPhone, BiUser, BiUserCircle } from "react-icons/bi";

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

const UsuariosPageView = () => {
  const navigate = useNavigate();
  const { stateAluno } = useAlunoContext();

  const [turma, setTurma] = useState<
    {
      faculdade_id: any;
      nome: string;
    }[]
  >([]);

  const [openLoadingBackdrop, setOpenLoadingBackdrop] = useState(false);
  const [loadingTurma, setLoadingTurma] = useState(false);


  const fetchTurma = async () => {
    setLoadingTurma(true);
    await apiGetData(
      "academic",
      `/turmas/${stateAluno.alunoSelecionado?.turma_id}`
    ).then((data) => setTurma(data));
    setLoadingTurma(false);
  };


  useEffect(() => {
    fetchTurma();
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
      Detalhes do Aluno
      <Typography variant="body2" color="text.secondary" mt={1}>
        Informações completas do cadastro do aluno
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
      <Box sx={{ p: 3 }}>
        {/* Seção de Informações Pessoais */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} color="primary" mb={2}>
            <BiUserCircle style={{ marginRight: 8 }} />
            Dados Pessoais
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={3}>
              <TextDetails
                text="Nome Completo"
                details={stateAluno.alunoSelecionado?.nome}
                icon={<BiUser />}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <TextDetails
                text="E-mail"
                details={stateAluno.alunoSelecionado?.email}
                icon={<BiEnvelope />}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <TextDetails
                text="Telefone"
                details={stateAluno.alunoSelecionado?.telefone}
                icon={<BiPhone />}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <TextDetails
                text="Documento"
                details={stateAluno.alunoSelecionado?.documento}
                icon={<BiIdCard />}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Seção de Informações Acadêmicas */}
        {stateAluno.alunoSelecionado?.tipo === "ALUNO" && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={600} color="primary" mb={2}>
              <BiBook style={{ marginRight: 8 }} />
              Dados Acadêmicos
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} lg={4}>
                <TextDetails
                  text="Nível de Acesso"
                  details={
                    <Chip 
                      label={stateAluno.alunoSelecionado?.tipo} 
                      size="small" 
                      sx={{ 
                        bgcolor: 'primary.light', 
                        color: 'white',
                        textTransform: 'capitalize'
                      }} 
                    />
                  }
                />
              </Grid>
              <Grid item xs={12} md={6} lg={4}>
                <TextDetails
                  text="Faculdade"
                  details={stateAluno.alunoSelecionado?.faculdade}
                  icon={<BiBuilding />}
                />
              </Grid>
              <Grid item xs={12} md={6} lg={4}>
                <TextDetails
                  text="Turma"
                  details={loadingTurma ? 
                    <CircularProgress size={20} /> : 
                    turma[0]?.nome
                  }
                  icon={<BiGroup />}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Status de Pagamento (Exemplo comentado)
        {stateAluno.alunoSelecionado?.tipo === "ALUNO" && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={600} color="primary" mb={2}>
              <BiWallet style={{ marginRight: 8 }} />
              Status Financeiro
            </Typography>
            <TextDetails
              text="Status de Pagamento"
              details={
                <Chip 
                  label={stateAluno.alunoSelecionado?.formatura_paga ? "Pago" : "Pendente"} 
                  color={stateAluno.alunoSelecionado?.formatura_paga ? "success" : "warning"} 
                />
              }
            />
          </Box>
        )} */}
      </Box>

      {/* Botão de Voltar */}
      <Box sx={{ 
        position: 'sticky', 
        bottom: 0, 
        bgcolor: 'background.paper', 
        pt: 2,
        borderTop: '1px solid',
        borderColor: 'divider'
      }}>
        <Button
          variant="outlined"
          onClick={() => navigate("/usuarios")}
          startIcon={<BiArrowBack />}
          sx={{
            px: 4,
            borderRadius: 2,
            textTransform: 'none',
            '&:hover': {
              borderWidth: 2,
              bgcolor: 'primary.light',
              color: 'white'
            }
          }}
        >
          Voltar para Listagem
        </Button>
      </Box>
    </Paper>
  </Stack>
  <LoadingBackdrop
    open={openLoadingBackdrop}
    handleClose={() => setOpenLoadingBackdrop(false)}
  />
</Stack>
  );
};

export default UsuariosPageView;
