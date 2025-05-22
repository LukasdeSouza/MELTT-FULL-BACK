import { Box, Stack, Typography } from "@mui/material";

const BoxDashboardValues = ({ title, valor }: { title: string, valor: number }) => {

  const valorFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);

  return (
    <Stack direction={"column"} flex={1} alignItems={"center"} my={2}>
      <Typography
        color="primary"
        variant="body2"
      >
        {title}
      </Typography>
      <Box borderRadius={"20px"} color={"white"}>
        <Typography color="secondary" variant="h5" fontWeight={700}>
          {valorFormatado}
        </Typography>
      </Box>
    </Stack>
  );
};

export default BoxDashboardValues;
