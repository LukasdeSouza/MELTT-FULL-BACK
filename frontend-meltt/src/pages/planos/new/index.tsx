import {
  Box,
  Button,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Formik } from "formik";
import { validatePlanoSchema } from "../../../utils/validationSchemas";
import toast from "react-hot-toast";
import { useState } from "react";
import "dayjs/locale/pt-br";
import LoadingBackdrop from "../../../components/loadingBackdrop";
import { apiPostData } from "../../../services/api";

import { BiSave } from "react-icons/bi";
import { LoadingButton } from "@mui/lab";
import { initialValuesPlano } from "../../../initialValues";


const PlanosFormaturaNewPage = () => {
  const navigate = useNavigate();
  const [loadingSave, setLoadingSave] = useState(false);
  const [openLoadingBackdrop, setOpenLoadingBackdrop] = useState(false);


  const onSubmitPlano = async (values: any) => {
    setLoadingSave(true);
    let dataObj = {
      ...values
    }

    toast.loading("Salvando Plano de Formatura...");
    try {
      const response = await apiPostData("academic", "/planos-formatura", dataObj)
      console.log("response", response);
      if (response.id) {
        toast.dismiss();
        toast.success("Plano de Formatura salvo com sucesso");
        navigate(-1);
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Erro ao salvar Plano de Formatura");
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
          Novo Plano de Formatura
          <Typography variant="body2" color="text.secondary" mt={1}>
            Defina os detalhes do novo plano de formatura
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
            initialValues={{ ...initialValuesPlano }}
            validationSchema={validatePlanoSchema}
            onSubmit={(values: any) => onSubmitPlano(values)}
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
                    <Grid container spacing={3}>
                      {/* Linha Superior */}
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          variant="filled"
                          label="Nome do Plano"
                          name="nome"
                          value={values.nome}
                          onChange={handleChange}
                          placeholder="Ex: Plano Premium 2024"
                          InputProps={{
                            sx: {
                              borderRadius: 2,
                              '&:hover': { bgcolor: 'grey.50' },
                              '&.Mui-focused': { bgcolor: 'grey.100' }
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          variant="filled"
                          label="Valor do Plano"
                          name="valor"
                          value={values.valor}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                            sx: {
                              borderRadius: 2,
                              '& input': { textAlign: 'right' },
                              '&:hover': { bgcolor: 'grey.50' }
                            }
                          }}
                        />
                      </Grid>

                      {/* Descrição do Plano */}
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          variant="filled"
                          label="Detalhes do Plano"
                          name="incluso"
                          value={values.incluso}
                          onChange={handleChange}
                          multiline
                          rows={6}
                          placeholder="Liste todos os benefícios inclusos no plano"
                          InputProps={{
                            sx: {
                              borderRadius: 2,
                              alignItems: 'flex-start',
                              bgcolor: 'grey.50',
                              '& textarea': {
                                lineHeight: 1.6,
                                py: 1.5,
                                '&::placeholder': {
                                  fontStyle: 'italic'
                                }
                              }
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Ações */}
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
                      Salvar Plano
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

export default PlanosFormaturaNewPage;
