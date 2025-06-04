import { Box, Button, Card, Grid, Stack, Typography } from "@mui/material"
import { BiBookOpen, BiSend } from "react-icons/bi"
import { useNavigate } from "react-router-dom"
import { getToken } from "../../utils/token"
import { jwtDecode } from "jwt-decode"
import { CustomJwtPayload } from "../../components/customDrawer"

const paginas = [
  {
    nome: "Pré Contratos",
    descricao: "Acesse o fluxo de status dos pré-contratos.",
    link: "/processos-internos/pre-contratos",
    roles: ['ADMIN', 'COMERCIAL']
  },
  {
    nome: "Adesões",
    descricao: "Acesseo a listagem de acessões.",
    link: "/processos-internos/adesoes",
    roles: ['ADMIN', 'ADESOES']
  },
  {
    nome: "Tarefas da Equipe",
    descricao: "Visualize as tarefas da equipe.",
    link: "/processos-internos/tarefas",
    roles: ['ADMIN', 'ADESOES', 'COMERCIAL', 'FINANCEIRO']
  },
  {
    nome: "Agenda Interna",
    descricao: "Veja a Agenda Interna.",
    link: "/processos-internos/agenda",
    roles: ['ADMIN', 'ADESOES', 'COMERCIAL', 'FINANCEIRO']
  }
]

const ProcessoInternosPage = () => {
  const token = getToken();
  const decoded = token ? jwtDecode<CustomJwtPayload>(token) : null;
  const navigate = useNavigate();

 const allowedPages = decoded 
    ? paginas.filter(pagina => pagina.roles.includes(decoded?.tipo)) 
    : [];

  return (
    <Stack width="100%" p={2}>
      <Grid container spacing={3} justifyContent="center">
        {allowedPages.map((pagina, index) => (
          <Grid key={index} item xs={12} sm={6} md={4} lg={3}>
            <Card
              sx={{
                height: '75vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f7ff 100%)',
                borderRadius: 4,
                boxShadow: '0px 8px 24px rgba(45, 28, 99, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0px 12px 32px rgba(45, 28, 99, 0.2)',
                  '& .card-icon': {
                    transform: 'scale(1.1)',
                    filter: 'drop-shadow(0 4px 8px rgba(45, 28, 99, 0.15))'
                  }
                }
              }}
            >
              <Stack
                spacing={3}
                justifyContent={'center'}
                alignItems="center"
                p={4}
                sx={{ height: '100%' }}
              >
                {/* Ícone decorativo */}
                <Box
                  className="card-icon"
                  sx={{
                    width: 80,
                    height: 80,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'primary.light',
                    borderRadius: '50%',
                    transition: 'all 0.3s ease',
                    mb: 2
                  }}
                >
                  <BiBookOpen size={32} color="#2D1C63" />
                </Box>

                {/* Conteúdo textual */}
                <Stack textAlign="center" spacing={1}>
                  <Typography
                    variant="h5"
                    fontWeight={800}
                    fontFamily="Poppins"
                    sx={{
                      background: 'linear-gradient(45deg, #2D1C63 30%, #4A3C8B 90%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    {pagina.nome}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.6,
                      minHeight: 60,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {pagina.descricao}
                  </Typography>
                </Stack>

                {/* Botão de ação */}
                <Button
                  variant="contained"
                  endIcon={<BiSend style={{ marginLeft: 8 }} />}
                  onClick={() => navigate(pagina.link)}
                  sx={{
                    mt: 'auto',
                    width: '100%',
                    maxWidth: 200,
                    borderRadius: 2,
                    py: 1.5,
                    background: 'linear-gradient(45deg, #2D1C63 30%, #4A3C8B 90%)',
                    '&:hover': {
                      opacity: 0.9,
                      transform: 'scale(1.02)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Acessar
                </Button>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}

export default ProcessoInternosPage