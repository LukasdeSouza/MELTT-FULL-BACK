import {
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import { baseAuthURL } from "../../utils/baseURL";
import toast, { Toaster } from "react-hot-toast";
import { setToken } from "../../utils/token";
import { LoadingButton } from "@mui/lab";
import MelttLogo from "../../assets/logo/melttLogo";
import { BsEye, BsEyeSlash } from "react-icons/bs";

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("E-mail inválido")
      .required("O e-mail é obrigatório"),
    senha: Yup.string()
      .min(6, "A senha deve ter pelo menos 6 caracteres")
      .required("A senha é obrigatória"),
  });

  const onLogin = async (values: { email: string; senha: string }) => {
    setLoading(true);
    const { email, senha } = values;
    try {
      const response = await fetch(`${baseAuthURL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const data = await response.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setToken(data.token);
        toast.success("Login efetuado com sucesso");
        navigate("/turmas");
      }
    } catch (error) {
      alert(error);
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
      <Typography fontWeight={300} mb={2}>
        Gestão de Formaturas, <b>de maneira eficiente</b>.
      </Typography>
      <Stack
        alignItems={"center"}
        justifyContent={"center"}
        bgcolor={"#2D1C63"}
        width={350}
        height={470}
        borderRadius={"16px"}
        boxShadow={5}
      >
        <MelttLogo />
        <Stack direction={"column"} alignItems={"center"}>
          <Typography fontWeight={600} variant="h5">
            Login de Usuário
          </Typography>
          <Typography
          
            sx={{ fontSize: 12, fontWeight: 200 }}
          >
            entre com seu email e senha
          </Typography>
        </Stack>
        <Formik
          initialValues={{
            email: "",
            senha: "",
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            onLogin(values);
          }}
        >
          {({ values, handleChange, handleSubmit }) => (
            <Stack
              component={"form"}
              direction={"column"}
              gap={2}
              mt={4}
              onSubmit={handleSubmit}
              sx={{ width: "80%" }}
            >
              <TextField
                color="secondary"
                name="email"
                label="e-mail:"
                size="small"
                placeholder="administrador@gmail.com"
                focused
                value={values.email}
                onChange={handleChange}
                sx={{ backgroundColor: "#44327F", borderRadius: 2 }}
              />
              <TextField
                color="secondary"
                name="senha"
                label="senha:"
                size="small"
                placeholder="******"
                focused
                type={showPassword ? "text" : "password"}
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
              <Stack direction={"column"} mt={3}>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  disableElevation
                  loading={loading}
                  color="secondary"
                  size="large"
                  sx={{ mb: 1, fontFamily: "Poppins" }}
                >
                  Entrar
                </LoadingButton>
                {/* <Divider
                  variant="middle"
                  sx={{
                    "&::before, &::after": {
                      borderColor: "secondary.light",
                    },
                  }}
                >
                  <small style={{ fontFamily:'Poppins', fontWeight: 300, fontSize: 11, color: "#ddd" }}>
                    ou, se é aluno e não tem cadastro 👇
                  </small>
                </Divider>
                <Button
                  variant="outlined"
                  color="primary"
                  sx={{ mt: 1, fontFamily: "Poppins" }}
                  onClick={() => navigate("/cadastro")}
                >
                  Me Cadastrar (aluno)
                </Button> */}
              </Stack>
            </Stack>
          )}
        </Formik>
      </Stack>
      <Toaster />
    </Stack>
  );
};

export default LoginPage;
