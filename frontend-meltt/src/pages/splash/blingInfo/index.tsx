import {
  Box,
  Button,
  CircularProgress,
  Slide,
  Stack,
  Typography,
} from "@mui/material";
import { PulsingMovingSVG } from "../../../animations";
import MelttLogo from "../../../assets/logo/melttLogo";
import { useEffect, useState } from "react";
import { apiPostData } from "../../../services/api";
import toast from "react-hot-toast";
import {
  setBlingAccessToken,
  setBlingRefreshToken,
} from "../../../utils/token";
import { useNavigate } from "react-router-dom";
import { SlReload } from "react-icons/sl";

const SplashGetBlingInfo = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [showTryAgain, setShowTryAgain] = useState(false);

  const queryParams = new URLSearchParams(window.location.search);
  const code = queryParams.get("code");

  const authenticateInBling = async () => {
    if(code) {
      try {
        const response = await apiPostData(
          "authentication",
          `/external/bling/oauth?code=${code}`,
          {}
        );
        setBlingAccessToken(response.access_token);
        setBlingRefreshToken(response.refresh_token);
  
        if (response.access_token) {
          navigate("/turmas");
        } else {
          setShowTryAgain(true);
          toast.error("Erro ao autenticar via Bling, tente novamente.");
        }
      } catch (error) {
        setShowTryAgain(true);
        toast.error("Erro ao autenticar via Bling, tente novamente.");
      }
    }
  };

  useEffect(() => {
    setShow(true);
    setTimeout(() => {
      authenticateInBling()
    }, 2500)
  }, [code !== undefined])

  return (
    <Stack
      width={"calc(100% - 28px)"}
      height={"calc(100vh - 28px)"}
      alignItems={"center"}
      justifyContent={"center"}
    >
      <Slide direction="up" in={show} mountOnEnter unmountOnExit timeout={1000}>
        <Box display={"flex"} flexDirection={"column"} alignItems={"center"}>
          <PulsingMovingSVG>
            <MelttLogo />
          </PulsingMovingSVG>
          <Stack direction={"column"} alignItems={"center"} mt={3}>
            <Typography
              color="textSecondary"
              fontWeight={"light"}
              variant="subtitle2"
            >
              <b>
                {showTryAgain
                  ? "Erro ao buscar informações no BLING"
                  : "Trazendo informações do BLING, aguarde..."}
              </b>
            </Typography>
            {showTryAgain ? (
              <Button
                variant="contained"
                color="secondary"
                endIcon={<SlReload />}
                sx={{ fontFamily: "Poppins", textTransform: "none", mt: 1 }}
                onClick={() => {
                  // Limpa o flag para tentar redirecionar novamente
                  sessionStorage.removeItem("blingRedirected");
                  window.location.reload();
                }}
              >
                Tentar Novamente
              </Button>
            ) : (
              <CircularProgress color="primary" size={24} sx={{ mt: 1 }} />
            )}
          </Stack>
        </Box>
      </Slide>
    </Stack>
  );
};

export default SplashGetBlingInfo;
