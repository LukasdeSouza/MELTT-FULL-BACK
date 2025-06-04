import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { Formik } from "formik";
import { validateTarefaSchema } from "../../../utils/validationSchemas";
import toast from "react-hot-toast";
import { useState } from "react";
import "dayjs/locale/pt-br";
import LoadingBackdrop from "../../../components/loadingBackdrop";
import { apiPatchData } from "../../../services/api";

import { BiArrowBack, BiSave } from "react-icons/bi";
import { LoadingButton } from "@mui/lab";
import { initialValuesTarefa } from "../../../initialValues";
import { useTarefaContext } from "../../../providers/tarefaContext";



const TarefasEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { stateTarefa } = useTarefaContext();
  const [loadingSave, setLoadingSave] = useState(false);
  const [openLoadingBackdrop, setOpenLoadingBackdrop] = useState(false);


  const getTarefasInitialValue = Object.keys(initialValuesTarefa).reduce(
    (acc, key) => {
      const typedKey = key as keyof typeof initialValuesTarefa;
      acc[typedKey] = id
        ? stateTarefa.tarefaSelecionada?.[typedKey]
        : initialValuesTarefa[typedKey];
      return acc;
    },
    {} as any
  );

  const onSubmitTarefa = async (values: any) => {
    setLoadingSave(true);

    toast.loading("Salvando Tarefa...");
    try {
      let response = await apiPatchData("academic", `/tarefas/${id}`, values)
      if (response.id) {
        toast.dismiss();
        toast.success("Tarefa atualizada com sucesso");
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
          Editar Tarefa
          <Typography variant="body2" color="text.secondary" mt={1}>
            Preencha os campos obrigatórios para criar uma nova tarefa
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
            initialValues={{ ...getTarefasInitialValue }}
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
                        name="nome"
                        label="Nome da Tarefa"
                        value={values.nome}
                        onChange={handleChange}
                        placeholder="Ex: Revisão de documentos contratuais"
                        variant="filled"
                        InputProps={{
                          sx: {
                            borderRadius: 2,
                            '&:hover': { bgcolor: 'grey.50' },
                            '&.Mui-focused': { bgcolor: 'grey.100' }
                          }
                        }}
                      />
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="center">
                      <TextField
                        fullWidth
                        name="responsavel"
                        label="Responsável"
                        value={values.responsavel}
                        onChange={handleChange}
                        placeholder="Ex: Departamento Jurídico"
                        variant="filled"
                        InputProps={{
                          sx: {
                            borderRadius: 2,
                            '&:hover': { bgcolor: 'grey.50' }
                          }
                        }}
                      />

                      <TextField
                        fullWidth
                        name="prazo_tarefa"
                        variant="filled"
                        label="Prazo de entrega da tarefa"
                        value={values.prazo_tarefa}
                        onChange={handleChange}
                        placeholder="ex: 12/08/2026"
                        sx={{ width: "50%" }}
                      />
                    </Stack>

                    <TextField
                      fullWidth
                      name="atribuido_por"
                      label="Atribuído por"
                      value={values.atribuido_por}
                      onChange={handleChange}
                      placeholder="Ex: Coordenação de Projetos"
                      variant="filled"
                      InputProps={{
                        sx: {
                          borderRadius: 2,
                          '&:hover': { bgcolor: 'grey.50' }
                        }
                      }}
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
                      borderTop: '2px solid',
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

export default TarefasEditPage;
