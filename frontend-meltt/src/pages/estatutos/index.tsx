import { LoadingButton } from "@mui/lab";
import { Button, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { FaSignature } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { apiGetData, apiPostData } from "../../services/api";
import { getToken } from "../../utils/token";
import { jwtDecode } from "jwt-decode";
import { CustomJwtPayload } from "../../components/customDrawer";
import toast from "react-hot-toast";

type Estatuto = {
  Url: string;
  Name: string;
  LastModified: string;
}

const EstatutosPage = () => {
  const navigate = useNavigate();
  const token = getToken();
  const decoded = token ? jwtDecode<CustomJwtPayload>(token) : null;

  const [loading, setLoading] = useState(false);
  const [loadingSign, setLoadingSign] = useState(false);	

  const [estatuto, setEstatuto] = useState<Estatuto[]>();
  const [signed, setSigned] = useState<boolean>(false);

  const fetchEstatuto = async () => {
    setLoading(true);
    let identificadorTurma = ""
    try {
      const response = await apiGetData("academic", `/turmas/${decoded?.turma_id}`);
      identificadorTurma = response[0].identificador;
    } catch (error) {
      toast.error("Erro ao buscar turma");
    }
    try {
      const result = await apiGetData("academic", `/s3/uploads/turmas/getByTurma?turma_id=${identificadorTurma}`);
      setEstatuto(result.files)
    } catch (error) {
      toast.error("Erro ao buscar contrato");
    }
    setLoading(false);
  }

  const fetchAssinaturaEstatuto =  async () => {
    try {
      let response = await apiGetData("academic", `/assinatura-estatuto/usuario/${decoded?.id}`);
      if(response.length > 0) {
        setSigned(true);
      }
    } catch (error) {
      toast.error("Não foi possível confirmar a assinatura do contrato");
    }
  }

  const onClickSign = async () => {
    setLoadingSign(true);
    let dataObj = {
      id_usuario: decoded?.id,
      id_turma: decoded?.turma_id,
      email: decoded?.email,
      nome: decoded?.nome
    }

    try {
      const response = await apiPostData("academic", "/assinatura-estatuto", {...dataObj})
      console.log('response', response)
      if(response.id) {
        toast.success("Contrato assinado com sucesso");
        navigate(-1);
      }
    } catch (error) {
      toast.error("Erro ao assinar contrato");
    }
    setLoadingSign(false);
  }

  useEffect(() => {
    fetchAssinaturaEstatuto();
    fetchEstatuto();
  }, [])

  return (
    <Stack
      direction={"column"}
      alignItems={"center"}
      justifyContent={"center"}
      width={"calc(100% - 28px)"}
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
            justifyContent={"space-between"}
            p={2}
          >
            <Typography
              color="textSecondary"
              variant={"body2"}
            >
              Leia o Contrato do Estatuto e estando de acordo, <b>assine clicando no botão abaixo</b>:
            </Typography>
            {loading
              ? <Stack
                height={'100%'}
                width={'100%'}
                alignItems={'center'}
                justifyContent={'center'}
              >
                Carregando Estatuto...
                <CircularProgress color="secondary" size={22}/>
              </Stack>
              : <iframe
                src={estatuto?.[0]?.Url}
                width="100%"
                height="85%"
              ></iframe>
            }
            <Stack
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
                endIcon={<FaSignature />}
                loading={loadingSign}
                onClick={onClickSign}
                disabled={signed}
                sx={{ fontFamily: "Poppins", width: 210 }}
              >
                {signed ? "Contrato já assinado" : "Assinar Contrato"}
              </LoadingButton>
            </Stack>
          </Stack>
        </Paper>
      </Paper>
    </Stack>
  );
};

export default EstatutosPage;
