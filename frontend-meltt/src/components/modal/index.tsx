import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Modal,
} from "@mui/material";
import { IoMdSave } from "react-icons/io";
import { MdClose } from "react-icons/md";

const cardStyle = {
  position: "absolute",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "#ffff",
  borderRadius: 3,
  width: "40%",
  maxHeight: "90vh", // Limita altura máxima do modal
  boxShadow: 12,
  display: "flex",
  flexDirection: "column",
};

type CustomModalProps = {
  title: string;
  subHeader?: string;
  openModal: boolean;
  handleCloseModal: () => void;
  loadingSave?: boolean;
  onSubmit: (e?: any) => void;
  children: React.ReactNode;
};

const CustomModal = ({
  title,
  subHeader,
  openModal,
  handleCloseModal,
  loadingSave,
  onSubmit,
  children,
}: CustomModalProps) => {
  return (
    <Modal open={openModal} onClose={handleCloseModal}>
      <Card
        component={"form"}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        sx={cardStyle}
      >
        <CardHeader
          title={title}
          subheader={subHeader}
          titleTypographyProps={{
            fontSize: 22,
            fontWeight: 600,
          }}
          subheaderTypographyProps={{ fontSize: 12 }}
          action={
            <IconButton onClick={handleCloseModal} aria-label="close">
              <MdClose size={18} style={{ color: "#ddd" }} />
            </IconButton>
          }
          sx={{ 
            borderRadius: "12px 12px 0 0",
            flexShrink: 0 // Impede que o header encolha
          }}
        />

        <CardContent 
          sx={{ 
            padding: 0,
            flex: 1, // Ocupa o espaço restante
            overflow: "hidden", // Esconde overflow do CardContent
            display: "flex",
            flexDirection: "column"
          }}
        >
          <Box 
            sx={{
              padding: 2,
              flex: 1,
              overflow: "auto", // Permite scroll no conteúdo
              maxHeight: "calc(90vh - 180px)", // Desconta header e actions
            }}
          >
            {children}
          </Box>
        </CardContent>
        
        <CardActions
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            padding: "16px",
            flexShrink: 0, // Impede que as actions encolham
            borderTop: "1px solid #f0f0f0", // Linha sutil para separar
          }}
        >
          <Button
            color="error"
            variant="outlined"
            onClick={handleCloseModal}
            style={{ borderRadius: "8px", width: 80, marginRight: 8 }}
          >
            Cancelar
          </Button>
          <LoadingButton
            type="submit"
            color="primary"
            loading={loadingSave}
            variant="contained"
            endIcon={<IoMdSave />}
            style={{ borderRadius: "8px", width: 120 }}
          >
            Salvar
          </LoadingButton>
        </CardActions>
      </Card>
    </Modal>
  );
};

export default CustomModal;