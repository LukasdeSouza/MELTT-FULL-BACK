import {
  Box,
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
import { motion } from 'framer-motion'
import { baseAuthURL } from "../../utils/baseURL";
import toast, { Toaster } from "react-hot-toast";
import { setToken } from "../../utils/token";
import { LoadingButton } from "@mui/lab";
import { BsArrowRight, BsEye, BsEyeSlash } from "react-icons/bs";
import { MdOutlineMail } from "react-icons/md";
import { BiLock } from "react-icons/bi";

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
      localStorage.removeItem("bling-access-token");
      localStorage.removeItem("bling-refresh-token");
      const data = await response.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setToken(data.token);
        toast.success("Login efetuado com sucesso");
        navigate("/splash");
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
      sx={{
        background: "linear-gradient(135deg, #db1f8d 0%, #6A1B9A 100%)",
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(255,107,107,0.15) 0%, transparent 70%)',
          top: '-20%',
          right: '-10%',
          animation: 'float 25s infinite linear',
          '@keyframes float': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' }
          }
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Stack
          alignItems={"center"}
          justifyContent={"center"}
          bgcolor={"rgba(255, 255, 255, 0.1)"}
          width={400}
          height={500}
          borderRadius={"24px"}
          boxShadow={"0 8px 32px rgba(0, 0, 0, 0.1)"}
          sx={{
            backdropFilter: 'blur(12px)',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            position: 'relative'
          }}
        >
          {/* Efeito Neon */}
          <Box sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: `radial-gradient(circle at 50% 0%, rgba(219,31,141,0.3) 0%, transparent 50%)`,
            pointerEvents: 'none'
          }} />

          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{ cursor: 'pointer' }}
          >
            <img
              src="/images/logo.png"
              alt="Logo"
              className="w-48 mb-6 drop-shadow-[0_4px_12px_rgba(219,31,141,0.3)]"
            />
          </motion.div>

          <Typography
            variant="h5"
            fontWeight={500}
            fontFamily={'Poppins'}
            sx={{
              color: 'white',
              mb: 1,
              textShadow: '0 2px 8px rgba(219,31,141,0.3)'
            }}
          >
            Bem-vindo a plataforma! 🎉
          </Typography>

          <Typography
            fontSize={14}
            fontWeight={300}
            fontFamily={'Poppins'}
            sx={{
              color: 'rgba(255,255,255,0.8)',
              mb: 4
            }}
          >
            Sua plataforma de gestão de eventos
          </Typography>

          <Formik
            initialValues={{ email: "", senha: "" }}
            validationSchema={validationSchema}
            onSubmit={(values) => onLogin(values)}
          >
            {({ values, handleChange, handleSubmit }) => (
              <Stack
                component={"form"}
                direction={"column"}
                gap={3}
                onSubmit={handleSubmit}
                sx={{ width: "75%" }}
              >
                <TextField
                  name="email"
                  label="Email"
                  variant="filled"
                  size="medium"
                  placeholder="exemplo@email.com"
                  value={values.email}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MdOutlineMail style={{ color: '#FF4081' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiFilledInput-root': {
                      backgroundColor: 'rgba(255,255,255,0.15)!important',
                      borderRadius: '12px',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.2)!important',
                        boxShadow: '0 0 0 2px rgba(219,31,141,0.3)'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.7)',
                      '&.Mui-focused': { color: '#FF4081' }
                    }
                  }}
                />

                <TextField
                  name="senha"
                  label="Senha"
                  type={showPassword ? "text" : "password"}
                  variant="filled"
                  size="medium"
                  value={values.senha}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BiLock style={{ color: '#FF4081' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          sx={{ color: 'rgba(255,255,255,0.7)' }}
                        >
                          {showPassword ? <BsEye /> : <BsEyeSlash />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiFilledInput-root': {
                      backgroundColor: 'rgba(255,255,255,0.15)!important',
                      borderRadius: '12px',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.2)!important',
                        boxShadow: '0 0 0 2px rgba(219,31,141,0.3)'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.7)',
                      '&.Mui-focused': { color: '#FF4081' }
                    }
                  }}
                />

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    loading={loading}
                    endIcon={<BsArrowRight />}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      borderRadius: '12px',
                      background: 'linear-gradient(45deg, #db1f8d 0%, #FF4081 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontFamily: 'Poppins',
                      textTransform: 'none',
                      fontSize: 16,
                      boxShadow: '0 4px 6px rgba(219,31,141,0.3)',
                      '&:hover': {
                        boxShadow: '0 6px 8px rgba(219,31,141,0.4)',
                        background: 'linear-gradient(45deg, #db1f8d 0%, #FF4081 100%)'
                      }
                    }}
                  >
                    Começar a Acesso!
                  </LoadingButton>
                </motion.div>
              </Stack>
            )}
          </Formik>
        </Stack>
      </motion.div>

      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#6A1B9A',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.15)'
          }
        }}
      />
    </Stack>
  );
};

export default LoginPage;
