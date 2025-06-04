import {
  Box,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Formik } from "formik";
import { validatePropostaSchema } from "../../../utils/validationSchemas";
import toast from "react-hot-toast";
import { useCallback, useEffect, useState } from "react";
import "dayjs/locale/pt-br";
import LoadingBackdrop from "../../../components/loadingBackdrop";
import { apiGetData, apiPostData } from "../../../services/api";

import { BiSave } from "react-icons/bi";
import { LoadingButton } from "@mui/lab";
import { initialValuesProposta } from "../../../initialValues";
import { useDropzone } from "react-dropzone";
import IconUpload from "../../../assets/icons/upload";
import { TbTrash } from "react-icons/tb";
import { SlMagnifier } from "react-icons/sl";



const PropostasNewPage = () => {
  const navigate = useNavigate();
  const [loadingSave, setLoadingSave] = useState(false);
  const [openLoadingBackdrop, setOpenLoadingBackdrop] = useState(false);

  const [turmas, setTurmas] = useState([]);
  const [fileProposta, setFileProposta] = useState<File | null>(null);


  const fetchTurmas = async () => {
    try {
      const response = await apiGetData("academic", "/turmas?limit=100");
      setTurmas(response.data)
    } catch (error) {
      toast.error("Erro ao buscar turmas");
    }
  }

  const onSubmitProposta = async (values: any) => {
    setLoadingSave(true);

    toast.loading("Salvando Propostas...");
    try {
      let propostaUuid: string | null = null;

      if (fileProposta instanceof File) {
        toast.loading("Enviando Proposta para D4Sign...");

        const formData = new FormData();
        formData.append("file", fileProposta);

        const data = await apiPostData("academic", "/d4sign/upload", formData, {
          "Content-Type": "multipart/form-data"
        })
        propostaUuid = data.uuid;
        toast.dismiss();
      }

      const dataObj = {
        ...values,
        file_uuid: propostaUuid,
      }

      const response = await apiPostData("academic", "/propostas", dataObj)
      if (response.id) {
        toast.dismiss();
        toast.success("Proposta salva com sucesso");
        navigate(-1);
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Erro ao salvar Proposta");
    }
    setLoadingSave(false);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFileProposta(acceptedFiles[0]);
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
    fetchTurmas();
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
          Nova Proposta
          <Typography variant="body2" color="text.secondary" mt={1}>
            Preencha os campos abaixo para criar uma nova proposta
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
            initialValues={{ ...initialValuesProposta }}
            validationSchema={validatePropostaSchema}
            onSubmit={(values: any) => onSubmitProposta(values)}
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
                          label="Nome da Proposta"
                          name="nome_proposta"
                          value={values.nome_proposta}
                          onChange={handleChange}
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
                        <FormControl fullWidth variant="filled">
                          <InputLabel>Turma</InputLabel>
                          <Select
                            name="turma_id"
                            value={values.turma_id}
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
                            {turmas?.map((item: any) => (
                              <MenuItem key={item.id} value={item.id}>
                                {item.nome}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* Linha Meio */}
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          variant="filled"
                          label="Enviado por"
                          name="enviado_por"
                          value={values.enviado_por}
                          onChange={handleChange}
                          placeholder="Departamento responsável"
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
                          label="Valor da Proposta"
                          name="valor_proposta"
                          type="number"
                          value={values.valor_proposta}
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

                      {/* Observações */}
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          variant="filled"
                          label="Observações"
                          name="observacoes"
                          value={values.observacoes}
                          onChange={handleChange}
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
                        />
                      </Grid>
                    </Grid>
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
                        {fileProposta ? (
                          <>
                            <IconUpload style={{ fontSize: 32 }} />
                            <Typography variant="h6" color="primary">
                              {fileProposta.name}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="caption" color="text.secondary">
                                {fileProposta.type}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFileProposta(null);
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
                              {isDragActive ? 'Solte o arquivo aqui' : 'Arraste o Documento da Proposta ou clique para buscar'}
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
                      onClick={() => navigate("/processos-internos/propostas")}
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
                      Salvar Proposta
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

export default PropostasNewPage;
