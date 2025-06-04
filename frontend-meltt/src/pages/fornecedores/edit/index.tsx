import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { Formik } from "formik";
import { BiSave } from "react-icons/bi";
import { useNavigate, useParams } from "react-router-dom";
import { validateFornecedorSchema } from "../../../utils/validationSchemas";
import { MdOutlineAttachMoney } from "react-icons/md";
import { apiGetData, apiPostData, apiPutData } from "../../../services/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LoadingButton } from "@mui/lab";
import { FaHardHat } from "react-icons/fa";
import { useFornecedorContext } from "../../../providers/fornecedorContext";
import { initialValuesFornecedor } from "../../../initialValues";

type FornecedoresFormValuesProps = {
  nome: string;
  tipo_servico: string;
  telefone: string;
  valor_cotado: string;
  status: any;
};

const FornecedoresEditPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const { stateFornecedor } = useFornecedorContext();
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingTurmas, setLoadingTurmas] = useState(false);
  const [turmas, setTurmas] = useState([]);

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

  const fetchTurmas = async () => {
    setLoadingTurmas(true);
    await apiGetData("academic", `/turmas`).then((response) => {
      setTurmas(response.data)
    });
    setLoadingTurmas(false);
  };

  const onSubmitFornecedor = async (values: FornecedoresFormValuesProps) => {
    setLoadingSave(true);
    let dataObj = {
      ...values,
      valor_cotado: parseFloat(values.valor_cotado),
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

  useEffect(() => {
    fetchTurmas();
  }, [])

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
          {({ values, errors, handleChange, handleSubmit }) => (
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
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      name="tipo_servico"
                      label="Tipo de Serviço"
                      value={values.tipo_servico}
                      onChange={handleChange}
                      error={Boolean(errors.tipo_servico)}
                      helperText={errors.tipo_servico}
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
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Turma</InputLabel>
                      <Select
                        name="turma_id"
                        disabled={loadingTurmas}
                        value={values.turma_id}
                        onChange={handleChange}
                        label="Turma"
                      >
                        {turmas?.map((item: { nome: string; id: number }) => (
                          <MenuItem key={item.id} value={item.nome}>
                            {item.nome}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Linha 3 */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      name="valor_cotado"
                      label="Valor cotado"
                      value={values.valor_cotado}
                      onChange={handleChange}
                      error={Boolean(errors.valor_cotado)}
                      helperText={errors.valor_cotado}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MdOutlineAttachMoney 
                              style={{ color: theme.palette.warning.main }} 
                              size={24} 
                            />
                          </InputAdornment>
                        ),
                      }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      fullWidth
                      options={["Pagamento efetuado", "Pagamento não efetuado"]}
                      value={values.status}
                      onChange={(_, newValue) => {
                        handleChange({
                          target: {
                            name: "status",
                            value: newValue,
                          },
                        });
                      }}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="Status do pagamento" 
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                    />
                  </Grid>

                  {/* Linha 4 */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      name="telefone"
                      label="Telefone para contato"
                      value={values.telefone}
                      onChange={handleChange}
                      error={Boolean(errors.telefone)}
                      helperText={errors.telefone}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      name="cnpj"
                      label="CNPJ"
                      value={values.cnpj}
                      onChange={handleChange}
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