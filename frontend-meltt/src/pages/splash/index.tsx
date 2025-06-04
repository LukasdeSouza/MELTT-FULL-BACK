import { Box, Button, Slide, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../utils/token";
import { jwtDecode } from "jwt-decode";
import { CustomJwtPayload } from "../../components/customDrawer";
import { redirectToBlingURLAuth } from "../../utils/functions";
import { motion } from 'framer-motion'
import { BiLabel } from "react-icons/bi";

const SplashScreen = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const token = getToken();
  const decoded = token ? jwtDecode<CustomJwtPayload>(token) : null;

  useEffect(() => {
    setShow(true);
  }, []);

  return (
    <Stack
      width="100vw"
      height="100vh"
      alignItems="center"
      justifyContent="center"
      sx={{
        background: 'linear-gradient(135deg, #8E24AA 0%, #D81B60 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)',
          animation: 'pulse 6s infinite',
          '@keyframes pulse': {
            '0%': { transform: 'scale(0.8)', opacity: 0 },
            '50%': { transform: 'scale(1.2)', opacity: 0.2 },
            '100%': { transform: 'scale(0.8)', opacity: 0 }
          }
        }
      }}
    >
      <Slide direction="up" in={show} mountOnEnter unmountOnExit timeout={1000}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          sx={{
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: '24px',
            p: 6,
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: '600px'
          }}
        >
          <motion.div
            animate={{
              y: [0, -15, 0],
              scale: [1, 1.03, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <img
              src="/images/logo.png"
              alt="Logo"
              style={{
                width: '180px',
                filter: 'drop-shadow(0 4px 12px rgba(142,36,170,0.2))'
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Stack direction="column" alignItems="center" mt={4} spacing={2}>
              <Typography
                variant="h6"
                sx={{
                  color: '#5E35B1',
                  fontWeight: 600,
                  textAlign: 'center',
                  fontFamily: 'Poppins',
                  lineHeight: 1.4
                }}
              >
                Gestão de Formaturas
                <Box component="span" sx={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: 400,
                  color: '#8E24AA'
                }}>
                  Simplicidade e eficiência em cada detalhe
                </Box>
              </Typography>

              {(decoded?.tipo === "ADMIN" || decoded?.tipo === 'FINANCEIRO') && localStorage.getItem("bling-access-token") === null ? (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} mt={4} width="100%">
                  <motion.div whileHover={{ scale: 1.02 }} style={{ flex: 1 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={() => navigate("/turmas")}
                      sx={{
                        fontFamily: 'Poppins',
                        backgroundColor: '#8E24AA',
                        color: 'white',
                        borderRadius: '12px',
                        py: 2,
                        minHeight: '56px',
                        textTransform: 'none',
                        fontSize: '1rem',
                        letterSpacing: '0.5px',
                        '&:hover': {
                          backgroundColor: '#6A1B9A'
                        }
                      }}
                    >
                      Continuar sem Bling
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} style={{ flex: 1 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      onClick={() => redirectToBlingURLAuth()}
                      sx={{
                        fontFamily: 'Poppins',
                        color: '#8E24AA',
                        border: '2px solid #8E24AA',
                        borderRadius: '12px',
                        py: 2,
                        minHeight: '56px',
                        textTransform: 'none',
                        fontSize: '1rem',
                        letterSpacing: '0.5px',
                        '&:hover': {
                          backgroundColor: '#F3E5F5',
                          borderColor: '#6A1B9A'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <BiLabel style={{ fontSize: '1.25rem', color: '#8E24AA' }} />
                        Entrar com Bling
                      </Box>
                    </Button>
                  </motion.div>
                </Stack>
              ) : (

                  <Button variant="contained" color="secondary" onClick={() => navigate("/turmas")}>
                    Acessar Plataforma
                  </Button>

              )}
            </Stack>
          </motion.div>
        </Box>
      </Slide>
    </Stack>
  );
};

export default SplashScreen;
