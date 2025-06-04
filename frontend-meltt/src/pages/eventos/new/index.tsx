import { LoadingButton } from '@mui/lab';
import { Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { BiSave } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { apiGetData, apiPostData } from '../../../services/api';
import toast from 'react-hot-toast';

const EventosNewPage = () => {
  const navigate = useNavigate();
  const [loadingSave, setLoadingSave] = useState(false);

  const [turmas, setTurmas] = useState([]);

  const [values, setValues] = useState({
    nome: "",
    token: "",
    turma_id: "",
    data_formatura: ""
  })

  const fetchTurmas = async () => {
    try {
      const response = await apiGetData("academic", "/turmas");
      setTurmas(response.data);
    } catch (error) {
      toast.error("Erro ao buscar turmas");
    }
  }

  useEffect(() => {
    fetchTurmas();
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setLoadingSave(true);
    try {
      const response = apiPostData("academic", "/eventos", values);
      console.log(response);
      toast.success("Evento salvo com sucesso");
      navigate("/eventos");
    } catch (error) {
      toast.error("Erro ao salvar evento");
    }
    setLoadingSave(false);
  }


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
                <Stack direction={"column"}>
                  <Typography
                    color="primary"
                    fontWeight={600}
                    sx={{ fontSize: 18 }}
                  >
                    Dados do Evento
                  </Typography>
                  <Typography
                    color="primary"
                    sx={{ fontSize: 12 }}
                  >
                    preencha as informações do evento conforme cadastrado na Uniticket
                  </Typography>
                </Stack>

                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  name="nome"
                  label="Nome do evento"
                  value={values.nome}
                  onChange={(e) => setValues({ ...values, nome: e.target.value })}
                />

                <Stack
                  direction={"row"}
                  justifyContent={"space-between"}
                  gap={2}
                >
                  <TextField
                    variant="outlined"
                    size="small"
                    name="token"
                    label="Token da Plataforma UNITICKET"
                    value={values.token}
                    onChange={(e) => setValues({ ...values, token: e.target.value })}
                    sx={{ width: "100%" }}
                  />
                  <FormControl fullWidth size="small">
                    <InputLabel
                      id="turma-label"
                      sx={{
                        backgroundColor: "white",
                        px: 0.5,
                      }}
                    >
                      Turma
                    </InputLabel>
                    <Select
                      value={values.turma_id}
                      onChange={(e) => setValues({ ...values, turma_id: e.target.value })}
                      variant="outlined"
                      sx={{ width: "100%" }}
                    >
                      {turmas.map((turma: {id: string, nome: string}) => (
                        <MenuItem key={turma.id} value={turma.id}>
                          {turma.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  name="data_formatura"
                  label="Data do Evento"
                  placeholder='dd/mm/aaaa'
                  value={values.data_formatura}
                  onChange={(e) => setValues({ ...values, data_formatura: e.target.value })}
                />
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
                onClick={() => navigate("/eventos")}
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
        </Paper>
      </Stack>
    </Stack>
  )
}

export default EventosNewPage