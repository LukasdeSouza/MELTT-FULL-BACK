import { Box, CircularProgress, Slide, Stack, Typography } from "@mui/material";
import MelttLogo from "../../assets/logo/melttLogo";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PulsingMovingSVG } from "../../animations";
import { getToken } from "../../utils/token";
import { jwtDecode } from "jwt-decode";
import { CustomJwtPayload } from "../../components/customDrawer";
import { redirectToBlingURLAuth } from "../../utils/functions";

const SplashScreen = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const token = getToken();
  const decoded = token ? jwtDecode<CustomJwtPayload>(token) : null;


  useEffect(() => {
    setShow(true);
    if (decoded?.tipo === "ADMIN" && localStorage.getItem("bling-access-token") === null) {
      redirectToBlingURLAuth();
    }
    else if (decoded?.tipo === "ASSOCIACAO") {
      navigate("/contratos")
    } else {
      navigate("/turmas")
    }
  }, []);

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
              <b>Gestão de Formaturas</b>, de maneira simples e eficiente.
            </Typography>
            <CircularProgress color="secondary" size={24} sx={{ mt: 1 }} />
          </Stack>
        </Box>
      </Slide>
    </Stack>
  );
};

export default SplashScreen;
