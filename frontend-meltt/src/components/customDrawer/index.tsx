import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Avatar, Chip, Collapse, Stack, Popover, InputAdornment } from "@mui/material";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { FaRegBell } from "react-icons/fa6";
import { useLocation, useNavigate } from "react-router-dom";
import { getToken, removeAllTokens } from "../../utils/token";
import { menuListAdesoes, menuListAdmin, menuListAluno, menuListAssociacao, menuListComercial, menuListFinanceiro, menuListGestaoProducao } from "../../utils/arrays";
import { DrawerMenuListType } from "../../types";
import IconLogout from "../../assets/icons/logout";
import { apiGetData, apiPostData } from "../../services/api";
import { BiChevronLeft, BiMenu } from "react-icons/bi";
import { FiSettings } from "react-icons/fi";
import CustomModal from "../modal";
import TextField from "@mui/material/TextField";
import toast from "react-hot-toast";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

export interface CustomJwtPayload extends JwtPayload {
  id?: number;
  nome?: string;
  email?: string;
  tipo: string;
  turma_id?: string;
  documento: string;
  id_bling?: string;
}

const drawerWidthOpen = 290;
const drawerWidthClosed = 72;

interface Props {
  window?: () => Window;
  pageTitle: string;
  children: React.ReactNode;
  openModalChangePassword: any;
  setOpenModalRegisterTeacher: any;
  openProfileImage: any;
  setOpenProfileImage: any;
}

export default function CustomDrawer(props: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = getToken();
  const decoded = token ? jwtDecode<CustomJwtPayload>(token) : null;

  // Notificações
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(true);
  const [anchorElNotifications, setAnchorElNotifications] = React.useState<HTMLButtonElement | null>(null);
  const [notificacoes, setNotificacoes] = React.useState<any[]>([]);
  const handleClickOpenPopoverNotifications = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleClosePopoverNotifications = () => {
    setAnchorElNotifications(null);
  };

  const openPopoverNotifications = Boolean(anchorElNotifications);
  const idPopoverNotifications = openPopoverNotifications ? "notifications-popover" : undefined;

  // Configurações
  const [anchorElSettings, setAnchorElSettings] = React.useState<HTMLButtonElement | null>(null);
  const handleClickOpenPopoverSettings = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElSettings(event.currentTarget);
  };
  const handleClosePopoverSettings = () => {
    setAnchorElSettings(null);
  };
  const openPopoverSettings = Boolean(anchorElSettings);
  const idPopoverSettings = openPopoverSettings ? "settings-popover" : undefined;

  // Alterar senha
  const [openModalChangePassword, setOpenModalChangePassword] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const onSubmitChangePassword = async () => {
    if (!newPassword) {
      toast.error("Por favor, preencha a nova senha.");
      return;
    }

    const payload = {
      email: decoded?.email,
      senha: newPassword
    };

    console.log(payload);
    try {
      const response = await apiPostData("authentication", `/users/reset-password/`, payload);
      console.log(response);
      toast.success("Evento salvo com sucesso");
    } catch (error) {
      toast.error("Erro ao salvar evento");
    } finally {
      setOpenModalChangePassword(false);
      setNewPassword("");
    }
  }

  const menuList =
    decoded?.tipo === "ADMIN"
      ? menuListAdmin
      : decoded?.tipo === "ASSOCIACAO"
        ? menuListAssociacao
        : decoded?.tipo === "COMERCIAL"
          ? menuListComercial
          : decoded?.tipo === "GESTAO_PRODUCAO"
            ? menuListGestaoProducao
            : decoded?.tipo === "ADESOES"
              ? menuListAdesoes
              : decoded?.tipo === 'FINANCEIRO'
                ? menuListFinanceiro
                : menuListAluno;

  const fetchNotificacoes = async () => {
    if (decoded?.id) {
      try {
        const response = await apiGetData("academic", `/notificacoes?id=${decoded?.id}`);
        if (response && Array.isArray(response.data)) {
          setNotificacoes(response.data);
        }
      } catch (error) {
        console.error("Erro ao buscar notificações:", error);
        setNotificacoes([]);
      }
    }
  };

  React.useEffect(() => {
    const interval = setInterval(fetchNotificacoes, 300000);
    fetchNotificacoes();
    return () => clearInterval(interval);
  }, []);

  const drawer = (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      width={isDrawerOpen ? drawerWidthOpen : drawerWidthClosed}
      height="100%"
      role="presentation"
      sx={{
        background: 'linear-gradient(135deg, #2D1C63 30%, #1B0E40 100%)',
        boxShadow: '4px 0 20px rgba(0,0,0,0.2)',
        transition: 'width 0.3s ease',
      }}
    >
      <Stack direction="column" gap={4} ml={2}>
        {isDrawerOpen && (
          <Stack pt={6} px={3} mb={2}>
            <img
              src="/images/logo.png"
              alt="Logo"
              style={{ width: '160px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
            />
          </Stack>
        )}

        <List sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, px: 1 }}>
          {menuList.map((item: DrawerMenuListType, index) => (
            <React.Fragment key={index}>
              <ListItem disablePadding>
                <ListItemButton
                  selected={location.pathname.includes(item.route)}
                  sx={{
                    borderRadius: '12px',
                    mb: 0.5,
                    py: 1.5,
                    transition: 'all 0.3s ease',
                    justifyContent: isDrawerOpen ? 'flex-start' : 'center',
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.95)' }
                    }
                  }}
                  onClick={() => navigate(item.route)}
                >
                  <ListItemIcon sx={{
                    minWidth: isDrawerOpen ? '40px' : '0px',
                    justifyContent: 'center',
                  }}>
                    {React.cloneElement(item.icon, {
                      style: {
                        color: location.pathname.includes(item.route)
                          ? '#DB1F8D'
                          : '#F1F5F9',
                        fontSize: '1.4rem'
                      }
                    })}
                  </ListItemIcon>
                  {isDrawerOpen && (
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: location.pathname.includes(item.route) ? '#2D1C63' : 'rgba(255,255,255,0.9)'
                      }}
                    >
                      {item.title}
                    </Typography>
                  )}
                </ListItemButton>
              </ListItem>

              {/* Subitens */}
              {isDrawerOpen && item.subRoutes && item.subRoutes.length > 0 && (
                <Collapse in={location.pathname.includes(item.route)}>
                  <List component="div" disablePadding sx={{ pl: 4 }}>
                    {item.subRoutes.map((subItem, subIndex) => (
                      <ListItem key={`${index}-${subIndex}`} disablePadding>
                        <ListItemButton
                          selected={location.pathname.includes(subItem.route)}
                          sx={{
                            borderRadius: '8px',
                            py: 1,
                            transition: 'all 0.3s ease',
                            '&.Mui-selected': {
                              backgroundColor: 'rgba(219,31,141,0.15)'
                            }
                          }}
                          onClick={() => navigate(subItem.route)}
                        >
                          <ListItemIcon sx={{ minWidth: '36px' }}>
                            {subItem.icon ? React.cloneElement(subItem.icon, {
                              style: {
                                color: location.pathname.includes(subItem.route)
                                  ? '#DB1F8D'
                                  : 'rgba(255,255,255,0.7)',
                                fontSize: '1.2rem'
                              }
                            }) : <></>}
                          </ListItemIcon>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: '0.9rem',
                              color: location.pathname.includes(subItem.route)
                                ? '#FFF'
                                : 'rgba(255,255,255,0.7)',
                              fontWeight: location.pathname.includes(subItem.route)
                                ? 600
                                : 400
                            }}
                          >
                            {subItem.title}
                          </Typography>
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>
      </Stack>
      <List sx={{ pb: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              removeAllTokens()
              navigate("/login")
            }}
            sx={{
              borderRadius: '12px',
              mx: 1,
              py: 1.5,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: '40px' }}>
              <IconLogout style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '1.4rem'
              }} />
            </ListItemIcon>
            {isDrawerOpen && (
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '0.95rem',
                  fontWeight: 600
                }}
              >
                Sair
              </Typography>
            )}

          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  )

  return (
    <Stack direction="column">
      <AppBar
        elevation={0}
        position="static"
        sx={{
          bgcolor: '#FFFFFF',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          py: 1
        }}
      >
        <Toolbar sx={{
          px: 3,
          ml: isDrawerOpen ? 35 : 9,
          mr: 2,
          transition: 'margin-left 0.3s ease'
        }}>
          <IconButton
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            sx={{ mr: 2, color: '#2D1C63' }}
          >
            {isDrawerOpen ? <BiChevronLeft /> : <BiMenu />}
          </IconButton>

          <Stack flex={1} direction="column">
            <Typography
              variant="h6"
              color="primary"
              sx={{
                fontWeight: 700,
                fontSize: '1.4rem',
                letterSpacing: '-0.5px',
              }}
            >
              {props.pageTitle}
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              component="div"
              sx={{
                textTransform: "capitalize",
                fontWeight: 300,
                flexGrow: 1,
              }}
            >
              visualize os recursos de {props.pageTitle} cadastrados{" "}
            </Typography>
          </Stack>

          {/* Notificações e Perfil */}
          <Stack direction="row" alignItems="center" gap={4}>
            <IconButton
              onClick={handleClickOpenPopoverNotifications}
              sx={{
                bgcolor: 'rgba(45,28,99,0.1)',
                '&:hover': { bgcolor: 'rgba(45,28,99,0.2)' },
                position: 'relative'
              }}
            >
              <FaRegBell style={{ color: '#2D1C63', fontSize: '1.2rem' }} />
              {notificacoes?.length > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    bgcolor: 'error.main',
                    color: 'white',
                    borderRadius: '50%',
                    width: 16,
                    height: 16,
                    fontSize: '0.6rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {notificacoes.length}
                </Box>
              )}
            </IconButton>

            <IconButton
              onClick={handleClickOpenPopoverSettings}
              sx={{
                bgcolor: 'rgba(45,28,99,0.1)',
                '&:hover': { bgcolor: 'rgba(45,28,99,0.2)' },
              }}
            >
              <FiSettings style={{ color: '#2D1C63', fontSize: '1.2rem' }} />
            </IconButton>

            <Popover
              id={idPopoverSettings}
              open={openPopoverSettings}
              anchorEl={anchorElSettings}
              onClose={handleClosePopoverSettings}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              sx={{
                mt: 1.5,
                '& .MuiPaper-root': {
                  width: 200,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  borderRadius: '12px'
                }
              }}
            >
              <List sx={{ p: 1 }}>
                <ListItemButton onClick={() => {
                  handleClosePopoverSettings();
                  setOpenModalChangePassword(true);
                }}>
                  <Typography variant="body2">Alterar senha</Typography>
                </ListItemButton>
              </List>
            </Popover>

            <Popover
              id={idPopoverNotifications}
              open={openPopoverNotifications}
              anchorEl={anchorElNotifications}
              onClose={handleClosePopoverNotifications}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              sx={{
                mt: 1.5,
                '& .MuiPaper-root': {
                  width: 350,
                  maxHeight: 400,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  borderRadius: '12px'
                }
              }}
            >
              <Box p={2}>
                <Typography variant="subtitle1" fontWeight={600} mb={1}>
                  Notificações ({notificacoes.length})
                </Typography>
                <List sx={{ p: 0 }}>
                  {notificacoes.length > 0 ? (
                    notificacoes.map((notificacao, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          py: 1,
                          px: 2,
                          mb: 0.5,
                          borderRadius: '8px',
                          '&:hover': {
                            bgcolor: 'action.hover'
                          }
                        }}
                      >
                        <Stack>
                          <Typography variant="body2" fontWeight={500}>
                            {notificacao.titulo}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(notificacao.data).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {notificacao.mensagem}
                          </Typography>
                        </Stack>
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
                      Nenhuma notificação nova
                    </Typography>
                  )}
                </List>
              </Box>
            </Popover>

            <Stack direction="row" alignItems="center" gap={2}>
              <Stack direction="column">
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color="textPrimary"
                >
                  {decoded?.nome}
                </Typography>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ lineHeight: 1.2 }}
                >
                  {decoded?.email}
                </Typography>
                <Chip
                  label={decoded?.tipo}
                  size="small"
                  sx={{
                    mt: 0.5,
                    bgcolor: '#F3F4F6',
                    color: '#2D1C63',
                    fontWeight: 500,
                    fontSize: '0.7rem'
                  }}
                />
              </Stack>
              <Avatar
                variant="circular"
                src="https://media.istockphoto.com/id/1464123629/pt/vetorial/student-graduation-cap-with-gold-tassel-and-ribbon.jpg?s=612x612&w=0&k=20&c=dRU9EjaRMJLuSbvPfTlAa5Rn292Ue4_Zn62nERGKN34="
                sx={{
                  width: 48,
                  height: 48,
                  border: '2px solid #E5E7EB',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              />
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>

      <Stack direction="row">
        <Box
          component="nav"
          sx={{
            width: { sm: isDrawerOpen ? drawerWidthOpen : drawerWidthClosed },
            flexShrink: { sm: 0 }
          }}
        >
          <Drawer
            open
            variant="persistent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': {
                width: isDrawerOpen ? drawerWidthOpen : drawerWidthClosed,
                borderRight: 'none',
                transition: 'width 0.3s ease',
              }
            }}
          >
            {drawer}
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 4,
            ml: isDrawerOpen ? 5 : 1,
            width: {
              sm: `calc(100% - ${isDrawerOpen ? drawerWidthOpen : drawerWidthClosed}px - 64px)`
            },
            bgcolor: '#F9FAFB',
            minHeight: 'calc(100vh - 64px)',
            transition: 'margin-left 0.3s ease, width 0.3s ease',
          }}
        >
          {props.children}
        </Box>
      </Stack>
      <CustomModal
        title="Alterar Senha"
        subHeader="preencha o campo com sua nova senha"
        openModal={openModalChangePassword}
        handleCloseModal={() => {
          setOpenModalChangePassword(false);
          setNewPassword("");
          setShowPassword(false);
        }}
        onSubmit={() => {
          onSubmitChangePassword();
        }}
      >
        <Box display={'flex'} flexDirection={'column'} component={'form'} sx={{ width: '100%' }}>
          <Stack width={'100%'} direction={'column'} gap={2}>
            <TextField
              size="small"
              label="Nova Senha"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              fullWidth
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                      {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Stack>
        </Box>
      </CustomModal>
    </Stack>
  )
}