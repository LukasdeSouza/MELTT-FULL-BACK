import { IconButton, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { apiGetData } from "../../services/api";
import { getToken } from "../../utils/token";
import { jwtDecode } from "jwt-decode";
import { CustomJwtPayload } from "../../components/customDrawer";
import toast from "react-hot-toast";
import { BiDownload } from "react-icons/bi";

const ContratosPage = () => {
  const token = getToken();
  const decoded = token ? jwtDecode<CustomJwtPayload>(token) : null;
  const [turma, setTurma] = useState<any>();

  const fetchTurmaById = async () => {
    try {
      const result = await apiGetData("academic", `/turmas/${decoded?.turma_id}`)
      setTurma(result[0]);
    } catch (error) {
      toast.error("Erro ao buscar turma");
    }
  }

  useEffect(() => {
    fetchTurmaById();
  }, [])

  return (
    <Stack
      direction={"column"}
      alignItems={"center"}
      justifyContent={"center"}
      width={"calc(100% - 64px)"}
    >
      <Paper
        elevation={0}
        sx={{
          p: 1,
          flexGrow: 1,
          width: "100%",
          height: "calc(100vh - 100px)",
          borderRadius: 4,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            height: "100%",
            overflow: "auto",
            "&::-webkit-scrollbar": {
              width: "8px",
              height: "12px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#ddd",
              borderRadius: "12px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#EFEFEF",
            },
          }}
        >
          <Stack
            height={"100%"}
            direction={"column"}
            p={2}
          >
            <Typography
              color="secondary"
              variant={"body1"}
              fontWeight={600}
              fontFamily={"Poppins"}
            >
              Tenha acesso ao CONTRATO MELTT vinculado a sua Turma:
            </Typography>
            <Stack className="h-full flex-col items-center border-slate-400 rounded-md p-4">
              {turma?.meltt_contrato_url ? (
                <Stack className="flex-col">
                  <IconButton onClick={() => { }}>
                    <BiDownload />
                  </IconButton>
                  <Typography>Download do Contrato</Typography>
                </Stack>
              ) : (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ fontFamily: 'Poppins', mt:20 }}
                >
                  nenhum contrato MELTT vinculado a essa turma, até o momento.
                </Typography>
              )}
            </Stack>
            {/* <iframe
              src="https://drive.google.com/file/d/1f2a4P6JX7Z7uQ4g3Z6JwHvQ1b7Nk6z9x/preview"
              width="100%"
              height="100%"
            ></iframe> */}
            {/* <Stack
              direction={"row"}
              alignItems={"center"}
              justifyContent={"end"}
              gap={2}
            >
              <Button
                color="secondary"
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{ fontFamily: "Poppins" }}
              >
                Voltar
              </Button>
              <LoadingButton
                variant="contained"
                color="primary"
                endIcon={<FaSignature/> }
                sx={{ fontFamily: "Poppins", width: 150 }}
              >
                Assinar
              </LoadingButton>
            </Stack> */}
          </Stack>
        </Paper>
      </Paper>
    </Stack>
  );
};

export default ContratosPage;
