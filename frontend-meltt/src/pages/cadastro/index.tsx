import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from "@mui/material";
import * as Yup from "yup";
import React from "react";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import MelttLogo from "../../assets/logo/melttLogo";
import { Formik } from "formik";
import toast from "react-hot-toast";
import { LoadingButton } from "@mui/lab";
import { baseAuthURL } from "../../utils/baseURL";

type TypeCadastroFormValues = {
  nome: string;
  email: string;
  documento: string;
  senha: string;
};

const CadastroPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const validationSchema = Yup.object({
    nome: Yup.string().required("O nome é obrigatório"),
    email: Yup.string()
      .email("E-mail inválido")
      .required("O e-mail é obrigatório"),
    documento: Yup.string().required("O CPF é obrigatório"),
    senha: Yup.string()
      .min(6, "A senha deve ter pelo menos 6 caracteres")
      .required("A senha é obrigatória"),
  });

  const onRegister = async (values: TypeCadastroFormValues) => {
    setLoading(true);
    try {
      const response = await fetch(`${baseAuthURL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values }),
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      toast.error("Erro ao cadastrar usuário");
    }
    setLoading(false);
  };

  return (
    <Stack
      width={"100%"}
      height={"100vh"}
      alignItems={"center"}
      justifyContent={"center"}
      sx={{ backgroundColor: "#44327F" }}
    >
      <Box
        sx={{
          padding: 4,
          width: "380px",
          height: "fit-content",
          bgcolor: "#2D1C63",
          borderRadius: 5,
        }}
      >
        <Formik
          initialValues={{
            nome: "",
            email: "",
            documento: "",
            senha: "",
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            onRegister(values);
          }}
        >
          {({ values, handleChange, handleSubmit }) => (
            <Stack
              component={"form"}
              direction={"column"}
              gap={3}
              onSubmit={handleSubmit}
            >
              <Stack alignItems={"center"} gap={2}>
                <MelttLogo />
                <small
                  style={{
                    fontWeight: 300,
                    color: "#FDFDFD",
                    fontFamily: "Poppins",
                  }}
                >
                  Cadastre sua conta e comece a usar
                </small>
              </Stack>
              <Stack direction={"column"} gap={2}>
                <Stack direction={"column"}>
                  <label
                    style={{
                      fontWeight: 300,
                      fontSize: "12px",
                      fontFamily: "Poppins",
                    }}
                  >
                    Nome Completo
                  </label>
                  <TextField
                    focused
                    color="secondary"
                    name="nome"
                    type="text"
                    size="small"
                    variant="outlined"
                    value={values.nome}
                    onChange={handleChange}
                    sx={{ backgroundColor: "#44327F", borderRadius: 2 }}
                  />
                </Stack>
                <Stack direction={"column"}>
                  <label
                    style={{
                      fontWeight: 300,
                      fontSize: "12px",
                      fontFamily: "Poppins",
                    }}
                  >
                    E-mail
                  </label>
                  <TextField
                    focused
                    color="secondary"
                    name="email"
                    type="text"
                    size="small"
                    variant="outlined"
                    value={values.email}
                    onChange={handleChange}
                    sx={{ backgroundColor: "#44327F", borderRadius: 2 }}
                  />
                </Stack>
                <Stack direction={"column"}>
                  <label
                    style={{
                      fontWeight: 300,
                      fontSize: "12px",
                      fontFamily: "Poppins",
                    }}
                  >
                    CPF
                  </label>
                  <TextField
                    focused
                    color="secondary"
                    type="text"
                    name="documento"
                    size="small"
                    variant="outlined"
                    placeholder="000.000.000-00"
                    value={values.documento}
                    onChange={handleChange}
                    sx={{ backgroundColor: "#44327F", borderRadius: 2 }}
                  />
                </Stack>
                <Stack direction={"column"}>
                  <label
                    style={{
                      fontWeight: 300,
                      fontSize: "12px",
                      fontFamily: "Poppins",
                    }}
                  >
                    Senha
                  </label>
                  <TextField
                    focused
                    color="secondary"
                    type={showPassword ? "text" : "password"}
                    size="small"
                    variant="outlined"
                    name="senha"
                    value={values.senha}
                    onChange={handleChange}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowPassword((showPassword) => !showPassword)
                              }
                            >
                              {showPassword ? (
                                <BsEye className="text-[#ffc60b]" />
                              ) : (
                                <BsEyeSlash className="text-[#ffc60b]" />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{ backgroundColor: "#44327F", borderRadius: 2 }}
                  />
                </Stack>
              </Stack>
              <LoadingButton
                variant="contained"
                color="secondary"
                type="submit"
                loading={loading}
                sx={{
                  fontFamily: "Poppins",
                }}
              >
                Me Cadastrar
              </LoadingButton>
              <Divider variant="middle">
                <small style={{ fontWeight: 300, color: "#cccc" }}>
                  ou, se já possui conta 👇
                </small>
              </Divider>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate("/login")}
                sx={{
                  fontFamily: "Poppins",
                }}
              >
                Entrar
              </Button>
            </Stack>
          )}
        </Formik>
      </Box>
    </Stack>
  );
};

export default CadastroPage;
