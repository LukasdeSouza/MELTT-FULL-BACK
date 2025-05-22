import { Box, Paper, Stack, Typography } from "@mui/material";

const SupportPage = () => {
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
          <Box
            height={"70vh"}
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"center"}
          >
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAIYhwsdFaV328N3c_6J05VaEr0Ch5F0KABw&s" />
            <Typography color="primary" fontWeight={600}>
              Dificuldades ao utilizar a plataforma?
            </Typography>
            <Typography color="textSecondary" variant="caption">
              Fale conosco pelo email: <b>contato@melttformatura.com.br</b>
            </Typography>
            <Typography color="textSecondary" variant="caption">
              ou pelo Whatsapp <b>(11) 99999-9999</b>
            </Typography>
          </Box>
        </Paper>
      </Paper>
    </Stack>
  );
};

export default SupportPage;
