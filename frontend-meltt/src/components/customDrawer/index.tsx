import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Avatar, Collapse, Popover, Stack } from "@mui/material";
import MelttLogo from "../../assets/logo/melttLogo";
import { jwtDecode, JwtPayload } from "jwt-decode";

export interface CustomJwtPayload extends JwtPayload {
  id?: number;
  nome?: string;
  email?: string;
  tipo?: string;
  turma_id?: string;
  id_bling?: string;
}
import {
  menuListAdmin,
  menuListAluno,
  menuListAssociacao,
} from "../../utils/arrays";
import IconLogout from "../../assets/icons/logout";
import { useLocation, useNavigate } from "react-router-dom";
import { getToken, removeAllTokens } from "../../utils/token";
import { IoSettings } from "react-icons/io5";
import { DrawerMenuListType } from "../../types";
import { FaBell } from "react-icons/fa6";
import { apiGetData } from "../../services/api";
import toast from "react-hot-toast";
import { format } from "date-fns";

const drawerWidth = 240;

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
  const [routeSelected, setRouteSelected] = React.useState("");
  const [anchorElSettings, setAnchorElSettings] =
    React.useState<HTMLButtonElement | null>(null);
  const [anchorElNotifications, setAnchorElNotifications] =
    React.useState<HTMLButtonElement | null>(null);
  const [notificacoes, setNotificacoes] = React.useState<any[]>([]);

  const handleClickOpenPopoverSettings = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorElSettings(event.currentTarget);
  };

  const handleClickOpenPopoverNotifications = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleClosePopoverSettings = () => {
    setAnchorElSettings(null);
  };

  const handleClosePopoverNotifications = () => {
    setAnchorElNotifications(null);
  };

  const openPopoverSettings = Boolean(anchorElSettings);
  const openPopoverNotifications = Boolean(anchorElNotifications);
  const idPopoverSettings = openPopoverSettings ? "simple-popover" : undefined;
  const idPopoverNotifications = openPopoverNotifications
    ? "simple-popover"
    : undefined;

  const menuList =
    decoded?.tipo === "ADMIN"
      ? menuListAdmin
      : decoded?.tipo === "ASSOCIACAO"
        ? menuListAssociacao
        : menuListAluno;

  const fetchNotificacoes = async () => {
    try {
      const response = await apiGetData("academic", `/notificacoes?id=${decoded?.id}`);
      setNotificacoes(response);
    } catch (error) {
      toast.error("Erro ao buscar notificações");
    }
  };

  React.useEffect(() => {
    const interval = setInterval(fetchNotificacoes, 300000);
    fetchNotificacoes();
    return () => clearInterval(interval);
  }, []);

  const drawer = (
    <Box
      display={"flex"}
      flexDirection={"column"}
      justifyContent={"space-between"}
      width={280}
      height={"100%"}
      // bgcolor={"#2D1C63"}
      role="presentation"
      sx={{
        background: "linear-gradient(135deg, #2D1C63 30%, #1B0E40 100%)"
      }}
    >
      <Stack direction={"column"} gap={4} ml={2}>
        <Stack pt={8} px={3} ml={4}>
          <MelttLogo />
        </Stack>
        <List sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {menuList.map((item: DrawerMenuListType, index) => (
            <React.Fragment key={index}>
              <ListItem
                disablePadding
                sx={{
                  "& .Mui-selected": { backgroundColor: "white !important" },
                }}
              >
                <ListItemButton
                  selected={location.pathname.includes(item.route)}
                  sx={{
                    borderRadius: "32px 0 0 32px",
                    ...(location.pathname === item.route ||
                      routeSelected === item.route ||
                      routeSelected.includes(item.route)
                      ? {
                        backgroundColor: "#fff",
                        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
                        // transform: "scale(0.95)",
                      }
                      : {}),
                  }}
                  onClick={() => {
                    setRouteSelected(item.route);
                    navigate(item.route);
                  }}
                >
                  <ListItemIcon>
                    {React.cloneElement(item.icon, {
                      style: {
                        color:
                          location.pathname === item.route ||
                            routeSelected === item.route ||
                            routeSelected.includes(item.route)
                            ? "#DB1F8D"
                            : "#F1F5F9",
                      },
                    })}
                  </ListItemIcon>
                  <Typography
                    sx={{
                      ...(location.pathname === item.route ||
                        routeSelected === item.route ||
                        routeSelected.includes(item.route)
                        ? { color: "#342394", fontWeight: 700 }
                        : { color: "white" }),
                    }}
                  >
                    {item.title}
                  </Typography>
                </ListItemButton>
              </ListItem>
              {item.subRoutes && item.subRoutes.length > 0 && (
                <Collapse in={location.pathname === item.route && (item.route.includes("fornecedores") || item.route.includes("dashboard"))}>
                  <List component="div" disablePadding sx={{ paddingLeft: 5 }}>
                    {item.subRoutes.map((subItem, subIndex) => (
                      <ListItem key={`${index}-${subIndex}`} disablePadding>
                        <ListItemButton
                          selected={location.pathname.includes(subItem.route)}
                          sx={{ borderRadius: "32px 0 0 32px" }}
                          onClick={() => {
                            setRouteSelected(subItem.route);
                            navigate(subItem.route);
                          }}
                        >
                          <Typography
                            sx={{
                              ml: 4,
                              fontSize: 14,
                              ...(location.pathname === subItem.route ||
                                routeSelected === subItem.route
                                ? { color: "white", fontWeight: 700 }
                                : { color: "#eee" }),
                            }}
                          >
                            ▫️ {subItem.title}
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
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              removeAllTokens();
              navigate("/login");
            }}
          >
            <ListItemIcon>
              <IconLogout />
            </ListItemIcon>
            <ListItemText primary="Sair" sx={{ color: "white" }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Stack direction={"column"}>
      <AppBar
        elevation={0}
        position="static"
        sx={{ bgcolor: "#f2f2f2", padding: 0.5 }}
      >
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            ok
          </IconButton>
          <Stack flex={1} direction={"column"}>
            <Typography
              variant="h6"
              color="primary"
              component="div"
              sx={{
                ml: 27,
                textTransform: "capitalize",
                fontWeight: 600,
                flexGrow: 1,
              }}
            >
              {props.pageTitle}
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              component="div"
              sx={{
                ml: 27.5,
                textTransform: "capitalize",
                fontWeight: 300,
                flexGrow: 1,
              }}
            >
              veja a lista de {props.pageTitle} cadastradas na platataforma{" "}
              <b>MELTT</b>
            </Typography>
          </Stack>
          <Stack direction={"row"} alignItems={"center"} gap={8}>
            <Stack direction={"row"} gap={2}>
              <IconButton
                onClick={handleClickOpenPopoverNotifications}
                sx={{ bgcolor: "#fff" }}
              >
                <FaBell color="#2d1c63" size={18} />
              </IconButton>
              <Popover
                id={idPopoverNotifications}
                open={openPopoverNotifications}
                anchorEl={anchorElNotifications}
                onClose={handleClosePopoverNotifications}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
              >
                <Box sx={{ width: "100%", padding: 1, maxWidth: 280 }}>
                  <List>
                    {notificacoes?.length > 0 ? (
                      notificacoes?.map((notificacao, index) => (
                        <ListItem key={index} disablePadding>
                          <ListItemButton>
                            <ListItemText
                              primary={notificacao.mensagem}
                              secondary={format(notificacao.criada_em, 'dd/MM/yyyy')}
                              primaryTypographyProps={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: "primary"
                              }}
                              secondaryTypographyProps={{
                                fontSize: 10,
                                color: "secondary"
                              }}
                              sx={{ color: "white" }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))
                    ) : (
                      <small
                        className="text-xs"
                        style={{}}
                      >
                        😥 nenhuma notificação disponível
                      </small>
                    )}
                  </List>
                </Box>
              </Popover>
              <IconButton
                onClick={handleClickOpenPopoverSettings}
                sx={{ bgcolor: "#fff" }}
              >
                <IoSettings color="#2d1c63" size={18} />
              </IconButton>
              <Popover
                id={idPopoverSettings}
                open={openPopoverSettings}
                anchorEl={anchorElSettings}
                onClose={handleClosePopoverSettings}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
              >
                <Box sx={{ width: "100%", maxWidth: 280 }}>
                  <List>
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => props.setOpenModalRegisterTeacher(true)}
                      >
                        <ListItemText
                          primary="Alterar Minha Senha"
                          primaryTypographyProps={{
                            fontSize: 14,
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Box>
              </Popover>
            </Stack>
            <Stack direction={"row"} alignItems={'center'} gap={1}>
              <Stack direction={"column"} gap={0.5}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ color: "#111", }}
                >
                  {decoded?.nome}
                </Typography>
                <Typography
                  variant="caption"
                  mt={-1}
                  sx={{ color: "#bbb", }}
                >
                  {decoded?.email}
                </Typography>
                <Typography
                  variant="caption"
                  mt={-1}
                  sx={{ color: "#bbb", }}
                >
                  {decoded?.tipo}
                </Typography>
              </Stack>
              <Avatar
                variant="rounded"
                src="https://media.licdn.com/dms/image/v2/C4D0BAQGHK2vhhHiVfQ/company-logo_200_200/company-logo_200_200/0/1678893040439/meltt_formaturas_logo?e=2147483647&v=beta&t=HbKS2BEqaCTDQL4JYmNDwzxD0OH-tS1wNYau8TDjrjw"
                alt="das"
                onClick={() => props.setOpenProfileImage(true)}
                sx={{ width: 50, height: 50, cursor: 'pointer' }}
              />
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>
      <Stack direction={"row"} justifyContent={"space-between"}>
        <Box
          component="nav"
          sx={{
            width: { sm: drawerWidth },
            flexShrink: { sm: 0 },
          }}
        >
          <Drawer
            open
            variant="persistent"
            sx={{
              display: { xs: "none", sm: "flex" },
              // "& .MuiDrawer-paper": {
              //   borderRadius: "0px 32px 32px 0",
              // }
            }}
          >
            {drawer}
          </Drawer>
        </Box>
        <Box
          sx={{
            // pl: 8,
            // width: '100%',
            // flexGrow: 1,
            width: { sm: `calc(100% - ${drawerWidth + 64}px)` },
            borderRadius: "0px 32px 32px 0",
          }}
        >
          {props.children}
        </Box>
      </Stack>
    </Stack>
  );
}
