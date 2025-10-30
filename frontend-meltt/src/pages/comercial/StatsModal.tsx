import React from 'react';
import { Modal, Box, Typography, Paper, Grid, LinearProgress, CircularProgress } from '@mui/material';
import { PipelineStats } from '../../stores/comercialStore';

interface StatsModalProps {
  open: boolean;
  onClose: () => void;
  stats: PipelineStats | null;
  loading: boolean;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: 700,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const ConversionRateBar = ({ title, value }: { title: string; value: number }) => (
  <Box sx={{ mb: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
      <Typography variant="body2">{title}</Typography>
      <Typography variant="body2" color="text.secondary">{value.toFixed(1)}%</Typography>
    </Box>
    <LinearProgress variant="determinate" value={value} />
  </Box>
);

const StatsModal: React.FC<StatsModalProps> = ({ open, onClose, stats, loading }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography color='primary' variant="h6" fontFamily={'Poppins'} fontWeight={600} gutterBottom>Estatísticas do Pipeline</Typography>
        {loading && <CircularProgress />}
        {!loading && stats && (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Turmas por Status</Typography>
                {Object.entries(stats.stats).map(([key, value]) => (
                  <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ textTransform: 'capitalize' }}>{key}</Typography>
                    <Typography>{value}</Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Taxas de Conversão</Typography>
                <ConversionRateBar title="Contato → Reunião" value={stats.conversionRates.contato_reuniao} />
                <ConversionRateBar title="Reunião → Proposta" value={stats.conversionRates.reuniao_proposta} />
                <ConversionRateBar title="Proposta → Negociação" value={stats.conversionRates.proposta_negociacao} />
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
    </Modal>
  );
};

export default StatsModal;
