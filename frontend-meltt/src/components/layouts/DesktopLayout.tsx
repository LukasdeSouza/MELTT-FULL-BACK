import { useLocation } from "react-router-dom";
import CustomDrawer, { CustomJwtPayload } from "../customDrawer";
import {
  // Avatar,
  Box,
  Button,
  Card,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CustomCard from "../card";
import { Formik } from "formik";
import { useState } from "react";
import { getToken } from "../../utils/token";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import { apiPostData } from "../../services/api";
import { LoadingButton } from "@mui/lab";
// import { profileAvatarImages } from "../../utils/arrays";

type DesktopLayoutProps = {
  children: React.ReactNode;
};
const DesktopLayout = ({ children }: DesktopLayoutProps) => {
  const { pathname } = useLocation();
  const pathNameTransform = pathname.split("/")[1]; // Quando converto a rota /usuarios, é omitido o acento agudo
  const token = getToken();
  const decoded = token ? jwtDecode<CustomJwtPayload>(token) : null;

  const [openModalChangePassword, setOpenModalRegisterTeacher] =
    useState(false);
  const [openProfileImage, setOpenProfileImage] = useState(false);
  const [loadingSavePassword, setLoadingSavePassword] = useState(false);

  // const [profilePicture, setProfilePicture] = useState<string>("");

  // console.log('openprofilepicture', openProfileImage);
  const onSubmitTeacher = async (values: any) => {
    setLoadingSavePassword(true);
    // const { senha } = values;
    let userInfo = {
      email: decoded?.email,
      senha: values.senha,
    };

    try {
      const response = await apiPostData(
        "authentication",
        `/users/reset-password`,
        userInfo,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.message) {
        toast.success("Senha alterada com sucesso");
        setOpenModalRegisterTeacher(false);
      }
    } catch (error) {
      toast.error("Erro ao alterar senha");
      setLoadingSavePassword(false);
    }
    setLoadingSavePassword(false);
  };

  return (
    <Box width={"100%"}>
      <CustomDrawer
        pageTitle={pathNameTransform}
        openModalChangePassword={openModalChangePassword}
        setOpenModalRegisterTeacher={setOpenModalRegisterTeacher}
        openProfileImage={openProfileImage}
        setOpenProfileImage={setOpenProfileImage}
      >
        {children}
      </CustomDrawer>
      <Modal
        open={openModalChangePassword}
        onClose={() => setOpenModalRegisterTeacher(false)}
      >
        <Card
          sx={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#fff",
            borderRadius: 3,
            width: 500,
            boxShadow: 12,
            zIndex: 999,
          }}
        >
          <CustomCard title="Alterar Senha do Usuário Logado">
            <Stack direction={"column"} px={1} gap={2}>
              <Formik initialValues={{ senha: "" }} onSubmit={onSubmitTeacher}>
                {({ values, errors, handleSubmit, handleChange }) => (
                  <form onSubmit={handleSubmit}>
                    <Stack direction={"column"} gap={1} p={3}>
                      <Stack direction={"row"} gap={1}>
                        <Stack flex={1} direction={"column"} gap={1}>
                          <Typography
                            fontWeight={700}
                            fontSize={14}
                            sx={{ color: "#342394" }}
                          >
                            Nova Senha*
                          </Typography>
                          <TextField
                            size="small"
                            label=""
                            name="senha"
                            type="password"
                            value={values.senha}
                            onChange={handleChange}
                          />
                          {errors.senha && (
                            <small
                              style={{
                                color: "#EB420E",
                                fontFamily: "Poppins",
                              }}
                            >
                              {errors.senha}
                            </small>
                          )}
                        </Stack>
                      </Stack>
                      <Stack
                        direction={"row"}
                        justifyContent={"flex-end"}
                        gap={2}
                        mt={2}
                      >
                        <Button
                          color="primary"
                          variant="outlined"
                          onClick={() => setOpenModalRegisterTeacher(false)}
                          sx={{
                            padding: 1,
                            height: 40,
                            borderRadius: 2,
                            width: 120,
                          }}
                        >
                          Cancelar
                        </Button>
                        <LoadingButton
                          type="submit"
                          color="secondary"
                          variant="contained"
                          loading={loadingSavePassword}
                          sx={{
                            padding: 1,
                            height: 40,
                            borderRadius: 2,
                            width: 120,
                          }}
                        >
                          Salvar
                        </LoadingButton>
                      </Stack>
                    </Stack>
                  </form>
                )}
              </Formik>
            </Stack>
          </CustomCard>
        </Card>
      </Modal>
      {/* <Modal
        open={openModalChangePassword}
        onClose={() => setOpenProfileImage(false)}
      >
        <Card
          sx={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#fff",
            borderRadius: 3,
            width: 500,
            boxShadow: 12,
            zIndex: 999,
          }}
        >
          <CustomCard
            title="Foto de Perfil do Usuário:"
            subtitle="escolha um foto bem dahora pro seu perfil"
          >
            <Stack
              direction={"column"}
              alignItems={"center"}
              justifyContent={"center"}
              padding={4}
              gap={2}
            >
              <Button
                sx={{ padding: 2, backgroundColor: "#f5f5f5", borderRadius: 2 }}
              >
                <Avatar
                  src={profilePicture}
                  sx={{ width: 120, height: 120, borderRadius: 1 }}
                />
              </Button>
              <Stack
                direction={"row"}
                alignItems={"center"}
                justifyContent={"center"}
                gap={2}
                flexWrap={"wrap"}
              >
                {profileAvatarImages.map((image, index) => (
                  <Button
                    key={index}
                    onClick={() => setProfilePicture(image.url)}
                  >
                    <Avatar
                      src={image.url}
                      sx={{ width: 70, height: 70, borderRadius: 2 }}
                    />
                  </Button>
                ))}
              </Stack>
              <Stack
                direction={"row"}
                justifyContent={"flex-end"}
                gap={2}
                mt={2}
              >
                <Button
                  color="error"
                  variant="outlined"
                  onClick={() => setOpenProfileImage(false)}
                  sx={{
                    padding: 1,
                    height: 40,
                    borderRadius: 2,
                    width: 120,
                  }}
                >
                  Fechar
                </Button>
                <LoadingButton
                  color="primary"
                  variant="contained"
                  loading={loadingSavePassword}
                  sx={{
                    padding: 1,
                    height: 40,
                    borderRadius: 2,
                    width: 120,
                  }}
                >
                  Salvar
                </LoadingButton>
              </Stack>
            </Stack>
          </CustomCard>
        </Card>
      </Modal> */}
    </Box>
  );
};

export default DesktopLayout;
