import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Box,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tab,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import { MdOutlinePayments } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const ViewPagamentoPage = () => {
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState("1");

  useEffect(() => {}, []);

  return (
    <Stack width={"calc(100% - 28px)"}>
      <Stack direction={"row"} alignItems={"center"} gap={2} my={2}>
        <IconButton size="small" onClick={() => navigate("/pagamentos")}>
          <BiArrowBack />
        </IconButton>
        <h2 className="text-lg text-default" style={{ fontFamily: "Poppins" }}>
          Detalhes do pagamento
        </h2>
      </Stack>
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
        px={4}
      >
        <Stack direction={"column"} alignItems={"center"}>
          <Typography
            color="textSecondary"
            variant="body2"
          >
            valor
          </Typography>
          <Typography
            color="success"
            variant="body1"
            fontWeight={600}
          >
            R$120.00
          </Typography>
        </Stack>
        <Stack direction={"column"} alignItems={"center"}>
          <Typography
            color="textSecondary"
            variant="body2"
          >
            data de vencimento
          </Typography>
          <Typography
            color="error"
            variant="body1"
            fontWeight={600}
          >
            12/12/2024
          </Typography>
        </Stack>
        <Stack direction={"column"} alignItems={"center"}>
          <Typography
            color="textSecondary"
            variant="body2"
          >
            status do pagamento
          </Typography>
          <Chip
            label="Pagamento efetuado"
            variant="filled"
            color="error"
            icon={<MdOutlinePayments />}
            sx={{ padding: 1, fontFamily: "Poppins", fontSize: 12 }}
          />
        </Stack>
      </Stack>
      <Divider variant="middle" flexItem sx={{ py: 2 }} />
      <TabContext value={tabValue}>
        <TabList onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab
            label="Pix"
            value="1"
            sx={{ fontFamily: "Poppins", textTransform: "lowercase" }}
          />
          <Tab
            label="Cartão de Crédito"
            value="2"
            sx={{ fontFamily: "Poppins", textTransform: "lowercase" }}
          />
          <Tab
            label="Boleto"
            value="3"
            sx={{ fontFamily: "Poppins", textTransform: "lowercase" }}
          />
        </TabList>
        <TabPanel value={"1"}>
          <Box px={2}>
            <Typography color="textSecondary" variant="body2">
              escanei o QRCode abaixo com seu aplicativo do banco para efetuar o
              pagamento da fatura em aberto
            </Typography>
          </Box>
        </TabPanel>
        <TabPanel value={"2"}>
          <Box px={2}>
            <Typography color="textSecondary" variant="body2">
              cartão de crédito
            </Typography>
          </Box>
        </TabPanel>
        <TabPanel value={"3"}>
          <Box px={2}>
            <Typography color="textSecondary" variant="body2">
              informações do boleto
            </Typography>
          </Box>
        </TabPanel>
      </TabContext>
    </Stack>
  );
};

export default ViewPagamentoPage;
