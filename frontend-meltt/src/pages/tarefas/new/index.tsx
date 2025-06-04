import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Formik } from "formik";
import { validateTarefaSchema } from "../../../utils/validationSchemas";
import toast from "react-hot-toast";
import { useState } from "react";
import "dayjs/locale/pt-br";
import LoadingBackdrop from "../../../components/loadingBackdrop";
import { apiPostData } from "../../../services/api";

import { BiArrowBack, BiSave } from "react-icons/bi";
import { LoadingButton } from "@mui/lab";
import { initialValuesTarefa } from "../../../initialValues";



const TarefasNewPage = () => {
  const navigate = useNavigate();
  const [loadingSave, setLoadingSave] = useState(false);
  const [openLoadingBackdrop, setOpenLoadingBackdrop] = useState(false);


  const onSubmitTarefa = async (values: any) => {
    const { responsaveis, ...tarefaValues } = values;
    console.log("responsaveis", responsaveis);
    setLoadingSave(true);

    toast.loading("Salvando Tarefa...");
    try {
      const response = await apiPostData("academic", "/tarefas", tarefaValues)
      console.log("response", response);
      if (response.id) {
        const requests = responsaveis.map((usuario: any) => {
          return apiPostData("academic", `/tarefas/vincular-responsavel`, {
            usuario_id: usuario.id,
            tarefa_id: response.id,
          });
        });

        // Aguarda todas as requisições serem concluídas
        await Promise.all(requests);

        toast.dismiss();
        toast.success("Tarefa salva com sucesso");
        navigate(-1);
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Erro ao salvar Tarefa");
    }
    setLoadingSave(false);
  };



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
          Cadastrar Nova Tarefa
          <Typography variant="body2" color="text.secondary" mt={1}>
            Preencha os campos abaixo para criar uma nova tarefa
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
            initialValues={{ ...initialValuesTarefa }}
            validationSchema={validateTarefaSchema}
            onSubmit={(values: any) => onSubmitTarefa(values)}
          >
            {({ values, handleChange, handleSubmit }) => (
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
                    <Stack direction="row" spacing={2}>
                      <TextField
                        fullWidth
                        size="medium"
                        name="nome"
                        label="Nome da Tarefa"
                        value={values.nome}
                        onChange={handleChange}
                        placeholder="Ex: Atualização de planilha de custos"
                        variant="filled"
                        InputProps={{
                          sx: {
                            borderRadius: 2,
                            '&:hover': { bgcolor: 'grey.50' },
                            '&.Mui-focused': { bgcolor: 'grey.100' }
                          }
                        }}
                      />

                      <TextField
                        fullWidth
                        size="medium"
                        name="atribuido_por"
                        label="Atribuído por"
                        value={values.atribuido_por}
                        onChange={handleChange}
                        placeholder="Ex: Departamento Financeiro"
                        variant="filled"
                        InputProps={{
                          sx: {
                            borderRadius: 2,
                            '&:hover': { bgcolor: 'grey.50' }
                          }
                        }}
                      />
                    </Stack>

                    <TextField
                      fullWidth
                      size="medium"
                      name="responsaveis"
                      label="Responsáveis"
                      value={values.responsaveis}
                      onChange={handleChange}
                      placeholder="Separe os nomes por vírgula (Ex: João, Maria, Carlos)"
                      variant="filled"
                      multiline
                      rows={2}
                      InputProps={{
                        sx: {
                          borderRadius: 2,
                          alignItems: 'flex-start',
                          '& textarea': { lineHeight: 1.6 }
                        }
                      }}
                      InputLabelProps={{ shrink: true }}
                    />
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
                      onClick={() => navigate("/processos-internos/tarefas")}
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
                      color="primary"
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
                      Salvar Tarefa
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

export default TarefasNewPage;
