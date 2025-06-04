import { Box, Stack, Typography, useTheme } from "@mui/material";

const BoxDashboardValues = ({ title, valor }: { title: string, valor: number }) => {
  const theme = useTheme();
  
  const valorFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);

  return (
    <Stack 
      direction="column" 
      flex={1} 
      alignItems="center" 
      p={2.5}
      bgcolor="background.paper"
      borderRadius={2}
      boxShadow={1}
      sx={{
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)'
        }
      }}
    >
      {/* Título */}
      <Typography 
        variant="overline" 
        color="textSecondary"
        sx={{ 
          letterSpacing: '0.5px',
          mb: 0.5,
          lineHeight: 1.2,
          textAlign: 'center'
        }}
      >
        {title}
      </Typography>

      {/* Valor principal */}
      <Typography 
        variant="h5" 
        color="text.primary"
        sx={{ 
          fontWeight: 700,
          lineHeight: 1.2,
          mb: 0.5,
          letterSpacing: '-0.5px',
          color: valor > 0 ? theme.palette.success.dark : theme.palette.text.disabled
        }}
      >
        {valorFormatado}
      </Typography>

      {/* Subtítulo */}
      <Typography 
        variant="caption" 
        color="text.secondary"
        sx={{ 
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        {valor > 0 ? (
          <>
            <Box component="span" sx={{ color: 'success.light' }}>▲</Box> 
            {' '}Total acumulado
          </>
        ) : (
          <Box component="span" color="text.disabled">Sem registros</Box>
        )}
      </Typography>
    </Stack>
  );
};

export default BoxDashboardValues;