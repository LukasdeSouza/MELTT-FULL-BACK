import {
  Autocomplete,
  Box,
  Button,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Formik } from "formik";
import { BiSave } from "react-icons/bi";
import { useNavigate, useParams } from "react-router-dom";
import { validateFornecedorSchema } from "../../../utils/validationSchemas";
import { MdOutlineAttachMoney } from "react-icons/md";
import { apiPostData, apiPutData } from "../../../services/api";
import { useState } from "react";
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
  const navigate = useNavigate();
  const { id } = useParams();
  const [loadingSave, setLoadingSave] = useState(false);
  const { stateFornecedor } = useFornecedorContext();

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
        const response = await apiPostData(
          "academic",
          "/fornecedores",
          dataObj
        );
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
              ...getFornecedorInitialValue,
            }}
            validationSchema={validateFornecedorSchema}
            onSubmit={(values) => onSubmitFornecedor(values)}
          >
            {({ values, errors, handleChange, handleSubmit }) => (
              <form className="h-[90%]" onSubmit={handleSubmit}>
                <Box
                  display={"flex"}
                  flexDirection={"column"}
                  height={"100%"}
                  justifyContent={"space-between"}
                  gap={3}
                  p={2}
                >
                  <Stack direction={"column"} gap={3}>
                    <Stack direction={"row"} alignItems={"center"} gap={2}>
                      <FaHardHat color="#db1f8d" size={22} />
                      <Typography
                        color="primary"
                        fontWeight={600}
                        sx={{ fontSize: 18 }}
                      >
                        Dados do Fornecedor
                      </Typography>
                    </Stack>
                    <Stack
                      direction={"row"}
                      justifyContent={"space-between"}
                      gap={2}
                    >
                      <TextField
                        variant="outlined"
                        size="small"
                        name="nome"
                        label="Nome da Empresa"
                        value={values.nome}
                        onChange={handleChange}
                        placeholder="ex: empresa XYZ"
                        error={Boolean(errors.nome)}
                        helperText={errors.nome}
                        sx={{ width: "50%" }}
                      />
                      <TextField
                        variant="outlined"
                        size="small"
                        name="tipo_servico"
                        label="Tipo de Serviço"
                        value={values.tipo_servico}
                        onChange={handleChange}
                        error={Boolean(errors.tipo_servico)}
                        helperText={errors.tipo_servico}
                        sx={{ width: "50%" }}
                      />
                    </Stack>
                    <TextField
                        variant="outlined"
                        size="small"
                        name="responsavel"
                        label="Nome do Responsável"
                        value={values.responsavel}
                        onChange={handleChange}
                        placeholder="nome do responsável ou de quem atendeu"
                        error={Boolean(errors.responsavel)}
                        helperText={errors.responsavel}
                        // sx={{ width: "50%" }}
                      />
                    <Stack
                      direction={"row"}
                      gap={2}
                    >
                      <TextField
                        variant="outlined"
                        size="small"
                        name="valor_cotado"
                        label="Valor cotado"
                        value={values.valor_cotado}
                        onChange={handleChange}
                        placeholder="ex: R$ 1542.23"
                        error={Boolean(errors.valor_cotado)}
                        helperText={errors.valor_cotado}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <MdOutlineAttachMoney className="text-[#ffc60b]" size={24} />
                              </InputAdornment>
                            ),
                          },
                        }}
                        sx={{ width: "25%" }}
                      />
                      <Autocomplete
                        disablePortal
                        size="small"
                        value={values.status}
                        onChange={(_, newValue) => {
                          handleChange({
                            target: {
                              name: "status",
                              value: newValue,
                            },
                          });
                        }}
                        options={[
                          "Pagamento efetuado",
                          "Pagamento não efetuado",
                        ]}
                        sx={{ width: "25%" }}
                        renderInput={(params) => (
                          <TextField {...params} label="Status do pagamento" />
                        )}
                      />
                    </Stack>
                    <Stack
                      direction={"row"}
                      gap={2}
                    >
                      <TextField
                        variant="outlined"
                        size="small"
                        name="telefone"
                        label="Telefone para contato"
                        value={values.telefone}
                        onChange={handleChange}
                        error={Boolean(errors.telefone)}
                        helperText={errors.telefone}
                        sx={{ width: "25%" }}
                      />
                      <TextField
                        variant="outlined"
                        size="small"
                        name="cnpj"
                        label="CNPJ"
                        value={values.cnpj}
                        onChange={handleChange}
                        error={Boolean(errors.cnpj)}
                        helperText={errors.cnpj}
                        sx={{ width: "25%" }}
                      />
                    </Stack>
                  </Stack>
                </Box>
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
                    onClick={() => navigate("/fornecedores")}
                    sx={{ width: 100, borderRadius: 2 }}
                  >
                    Voltar
                  </Button>
                  <LoadingButton
                    type="submit"
                    color="secondary"
                    loading={loadingSave}
                    variant="contained"
                    size="small"
                    endIcon={<BiSave />}
                    sx={{ width: 120, borderRadius: 2 }}
                  >
                    Salvar
                  </LoadingButton>
                </Stack>
              </form>
            )}
          </Formik>
        </Paper>
      </Stack>
    </Stack>
  );
};

export default FornecedoresEditPage;
