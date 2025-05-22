import {
  Autocomplete,
  Box,
  Button,
  Divider,
  FormControl,
  IconButton,
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
import { validateTurmaSchema } from "../../../utils/validationSchemas";
import toast from "react-hot-toast";
import { useCallback, useEffect, useState } from "react";
import "dayjs/locale/pt-br";
import LoadingBackdrop from "../../../components/loadingBackdrop";
import { apiGetData, apiPostData, apiPutData } from "../../../services/api";

import { BiSave } from "react-icons/bi";
import { LoadingButton } from "@mui/lab";
import { initialValuesTurma } from "../../../initialValues";
import { useDropzone } from "react-dropzone";
import IconUpload from "../../../assets/icons/upload";
import { TbTrash } from "react-icons/tb";
import { SlMagnifier } from "react-icons/sl";
import { graduationYearsList } from "../../../utils/arrays";

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

const TurmasPageNew = () => {
  const navigate = useNavigate();
  const [loadingSave, setLoadingSave] = useState(false);
  const [openLoadingBackdrop, setOpenLoadingBackdrop] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [planos, setPlanos] = useState<any[]>([]);

  useEffect(() => {
    const getPlanos = async () => {
      const response = await apiGetData("academic", "/planos-formatura");
      if (response.data) {
        setPlanos(response.data);
      }
    };
    getPlanos();
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(acceptedFiles[0]);
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

  const onSubmitTurma = async (values: any) => {
    console.log(values);
    setLoadingSave(true);

    const { planos_formatura, ...turmaValues } = values;

    try {
      if (file instanceof File) {
        const formData = new FormData();
        formData.append("file", file);
        toast.loading("Enviando Arquivo do Estatuto...");

        const pressignedUrl = await apiGetData("academic", `/s3/uploads/turma/pressignedUrl?fileName=${file.name}&fileType=${file.type}&turmaId=${turmaValues.identificador}`);
        if (pressignedUrl?.url) {
          const result = await fetch(pressignedUrl.url, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type
            }
          })
          if (result.status === 200) {
            turmaValues.arquivo_url = `https://meltt-turmas.s3.amazonaws.com/turmas/${encodeURIComponent(file.name)}`;
            const response = await apiPostData("academic", "/turmas", turmaValues);
            if (!response.id) throw new Error("Erro ao criar/atualizar a turma.");

            await apiPutData("academic", "/turmas/atualizar-planos", {
              turma_id: response.id,
              planos_ids: planos_formatura.map((plano: any) => plano.id),
            });

            toast.dismiss();
            toast.success("Turma salva com sucesso");
            navigate(-1);
          }
        }
      } else {
        console.error("Erro: O arquivo não é um objeto File válido.");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Erro ao salvar turma");
    }
    setLoadingSave(false);
  };

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
            overflowY: "auto",
            borderRadius: "24px",
            backgroundColor: "#fff",
          }}
        >
          <Formik
            initialValues={{
              ...initialValuesTurma,
            }}
            validationSchema={validateTurmaSchema}
            onSubmit={(values: any) => onSubmitTurma(values)}
          >
            {({ values, handleChange, handleSubmit, setFieldValue }) => (
              <form
                className="h-[100%]"
                onSubmit={handleSubmit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              >
                <Stack height={"100%"} overflow={"auto"}>
                  <Box
                    display={"flex"}
                    flexDirection={"column"}
                    gap={3}
                    p={2}
                    sx={{
                      maxHeight: "calc(85vh - 132px)",
                      overflowY: "auto",
                    }}
                  >
                    <Stack direction={"column"}>
                      <Typography
                        color="primary"
                        fontWeight={600}
                      >
                        Cadastrar Nova Turma (NOVA ASSOCIAÇÃO)
                      </Typography>
                      <Typography
                        variant="caption"
                        color="primary"
                      >
                        preencha as informações abaixo.
                      </Typography>
                    </Stack>
                    <Stack
                      direction={"row"}
                      justifyContent={"space-between"}
                      gap={2}
                    >
                      <TextField
                        fullWidth
                        size="small"
                        name="nome"
                        variant="outlined"
                        label="Nome da Turma"
                        value={values.nome}
                        onChange={handleChange}
                        placeholder="Qual o nome da sua turma ?"
                      />
                      <FormControl fullWidth size="small">
                        <InputLabel id="ano_formatura">Ano de Formatura</InputLabel>
                        <Select
                          name="ano_formatura"
                          variant="outlined"
                          label="Data de Formatura da Turma"
                          value={values.ano_formatura}
                          onChange={handleChange}
                        >
                          {graduationYearsList.map((option: any) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>
                    <Stack direction={"row"}
                      justifyContent={"space-between"}
                      gap={2}>
                      <TextField
                        fullWidth
                        size="small"
                        name="identificador"
                        variant="outlined"
                        label="Identificador da turma"
                        value={values.identificador}
                        onChange={handleChange}
                        placeholder="código único identificador da turma ?"
                      />
                      <FormControl fullWidth size="small">
                        <Autocomplete
                          multiple
                          size="small"
                          id="planos_formatura"
                          onKeyDown={(e) => { e.preventDefault() }}
                          options={planos}
                          getOptionLabel={(option) => option.nome}
                          value={values.planos_formatura} // Ensure this is an array
                          onChange={(_, newValue) => {
                            setFieldValue("planos_formatura", newValue);
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Planos de Formatura"
                              variant="outlined"
                            />
                          )}
                        />
                      </FormControl>
                    </Stack>
                    <Typography variant="body2">Arquivo do Estatuto</Typography>
                    <div
                      className="h-44 border-2 border-dashed border-default rounded-md -mt-4 p-4"
                      {...getRootProps()}
                    >
                      {file ? (
                        <Stack
                          height={"100%"}
                          direction={"column"}
                          justifyContent={"center"}
                          alignItems={"center"}
                          overflow={"hidden"}
                          p={2}
                        >
                          <IconUpload />
                          <Typography
                            variant="body1"
                            fontWeight={800}
                            textAlign={"center"}
                            color="primary"
                          >
                            {file?.name}
                          </Typography>
                          <Typography variant="body2" color="primary">
                            {file?.type}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setFile(null);
                            }}
                          >
                            <TbTrash size={14} className="text-red-500" />
                          </IconButton>
                        </Stack>
                      ) : (
                        <>
                          <input {...getInputProps()} />
                          {isDragActive ? (
                            <p className=" flex items-center justify-center text-default h-full text-center">
                              Solte seu arquivo aqui...
                            </p>
                          ) : (
                            <Stack
                              width={"100%"}
                              height={"100%"}
                              alignItems={"center"}
                              justifyContent={"center"}
                            >
                              <Stack direction={"column"} alignItems={"center"} gap={1}>
                                <IconUpload />
                                <small
                                  className="text-[#777] font-light text-xs"
                                  style={{ fontFamily: "Poppins" }}
                                >
                                  Arraste seu arquivo para iniciar o upload
                                </small>
                                <small
                                  className="text-[#777] font-light text-xs"
                                  style={{ fontFamily: "Poppins", fontSize: 10 }}
                                >
                                  pdf/jpg/png
                                </small>
                                <Divider
                                  orientation="horizontal"
                                  flexItem
                                  sx={{ color: "black", fontSize: 12 }}
                                >
                                  ou
                                </Divider>
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  endIcon={<SlMagnifier size={14} color="#2d1c63" />}
                                  style={{
                                    borderRadius: "8px",
                                    padding: "6px",
                                    fontSize: 12,
                                    width: 150,
                                  }}
                                >
                                  Buscar arquivo
                                </Button>
                              </Stack>
                            </Stack>
                          )}
                        </>
                      )}
                    </div>
                    <TextField
                      fullWidth
                      name="regras_adesao"
                      variant="outlined"
                      label="Regras de Adesão"
                      multiline
                      rows={3}
                      value={values.regras_adesao}
                      onChange={handleChange}
                      placeholder="descreva detalhamente as regras de adesão"
                    />
                    <TextField
                      fullWidth
                      name="regras_rescisao"
                      variant="outlined"
                      label="Regras de Rescisão"
                      multiline
                      rows={3}
                      value={values.regras_rescisao}
                      onChange={handleChange}
                      placeholder="descreva detalhadamento as regras de rescisão"
                    />
                    <TextField
                      fullWidth
                      name="regras_renegociacao"
                      variant="outlined"
                      label="Regras de Renegociação"
                      multiline
                      rows={3}
                      value={values.regras_renegociacao}
                      onChange={handleChange}
                      placeholder="descreva detalhadamente as regras de renegociação"
                    />
                  </Box>
                  <Stack
                    width="100%"
                    justifyContent="flex-end"
                    direction="row"
                    gap={2}
                    px={2}
                    mt={1}
                    sx={{
                      position: "absolute",
                      bottom: 12,
                      left: 0,
                      right: 0,
                      backgroundColor: "white",
                      p: 2,
                    }}
                  >
                    <Button
                      color="primary"
                      variant="outlined"
                      size="small"
                      onClick={() => navigate("/turmas")}
                      sx={{ width: 120, borderRadius: 2 }}
                    >
                      Voltar
                    </Button>
                    <LoadingButton
                      type="submit"
                      color="secondary"
                      variant="contained"
                      size="small"
                      endIcon={<BiSave />}
                      loading={loadingSave}
                      sx={{ width: 120, borderRadius: 2 }}
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
      <LoadingBackdrop
        open={openLoadingBackdrop}
        handleClose={() => setOpenLoadingBackdrop(false)}
      />
    </Stack>
  );
};

export default TurmasPageNew;
