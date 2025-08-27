import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { Formik } from "formik";
import { BiSave } from "react-icons/bi";
import { useNavigate, useParams } from "react-router-dom";
import { validateFornecedorSchema } from "../../../utils/validationSchemas";
import { apiPostData, apiPutData } from "../../../services/api";
import { useState } from "react";
import toast from "react-hot-toast";
import { LoadingButton } from "@mui/lab";
import { FaHardHat } from "react-icons/fa";
import { useFornecedorContext } from "../../../providers/fornecedorContext";
import { initialValuesFornecedor } from "../../../initialValues";
import phoneMask from "../../../utils/functions/phoneMask";
import CnpjMask from "../../../utils/functions/cnpjMask";

type FornecedoresFormValuesProps = {
  nome: string;
  telefone: string;
  cnpj: string;
  responsavel: string;
};

const FornecedoresEditPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const { stateFornecedor } = useFornecedorContext();
  const [loadingSave, setLoadingSave] = useState(false);

  const getFornecedorInitialValue = Object.keys(initialValuesFornecedor).reduce(
    (acc, key) => {
      const typedKey = key as keyof typeof initialValuesFornecedor;
      acc[typedKey] = id && stateFornecedor.fornecedorSelecionado
        ? stateFornecedor.fornecedorSelecionado[typedKey]
        : initialValuesFornecedor[typedKey];
      return acc;
    },
    {} as typeof initialValuesFornecedor
  );

  const onSubmitFornecedor = async (values: FornecedoresFormValuesProps) => {
    setLoadingSave(true);
    let dataObj = {
      ...values,
    };

    try {
      if (id) {
        const response = await apiPutData("academic", `/fornecedores/${id}`, dataObj);
        if (response.result.nome) {
          toast.success("Fornecedor editado com sucesso");
          navigate(-1);
        }
      } else {
        const response = await apiPostData("academic", "/fornecedores", dataObj);
        if (response.id) {
          toast.success("Fornecedor salvo com sucesso");
          navigate(-1);
        }
      }
    } catch (error) {
      toast.error("Erro ao salvar fornecedor");
    }
    setLoadingSave(false);
  };

  return (
    <Box sx={{
      p: 4,
      height: '100vh',
      backgroundColor: 'background.default'
    }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          boxShadow: 1,
          height: 'calc(100vh - 64px)',
          overflow: 'auto',
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'divider',
            borderRadius: 3
          }
        }}
      >
        <Formik
          initialValues={{ ...getFornecedorInitialValue }}
          validationSchema={validateFornecedorSchema}
          onSubmit={(values) => onSubmitFornecedor(values)}
        >
          {({ values, errors, handleChange, handleSubmit, setFieldValue }) => (
            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 4 }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 4,
                  pb: 2,
                  borderBottom: `2px solid ${theme.palette.divider}`
                }}>
                  <FaHardHat size={24} color={theme.palette.primary.main} />
                  <Typography variant="h6" fontWeight={600}>
                    Dados do Fornecedor
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {/* Linha 1 */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      name="nome"
                      label="Nome da Empresa"
                      value={values.nome}
                      onChange={handleChange}
                      error={Boolean(errors.nome)}
                      helperText={errors.nome}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  {/* Linha 2 */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      name="responsavel"
                      label="Nome do Responsável"
                      value={values.responsavel}
                      onChange={handleChange}
                      error={Boolean(errors.responsavel)}
                      helperText={errors.responsavel}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  {/* Linha 3 */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      name="telefone"
                      label="Telefone para contato"
                      value={values.telefone}
                      onChange={(e) => {
                        const masked = phoneMask(e.target.value);
                        setFieldValue("telefone", masked);
                      }}
                      error={Boolean(errors.telefone)}
                      helperText={errors.telefone}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  {/* Linha 4 */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      name="cnpj"
                      label="CNPJ"
                      value={values.cnpj}
                      onChange={(e) => {
                        const masked = CnpjMask(e.target.value);
                        setFieldValue("cnpj", masked);
                      }}
                      error={Boolean(errors.cnpj)}
                      helperText={errors.cnpj}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2,
                pt: 3,
                borderTop: `1px solid ${theme.palette.divider}`
              }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/fornecedores")}
                  sx={{
                    px: 4,
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  Cancelar
                </Button>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={loadingSave}
                  endIcon={<BiSave size={18} />}
                  sx={{
                    px: 4,
                    borderRadius: 2,
                    textTransform: 'none',
                    '&:hover': {
                      boxShadow: 2
                    }
                  }}
                >
                  Salvar Alterações
                </LoadingButton>
              </Box>
            </form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default FornecedoresEditPage;