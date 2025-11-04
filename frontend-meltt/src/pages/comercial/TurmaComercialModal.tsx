import React from 'react';
import { TurmaComercial } from '../../stores/comercialStore';
import { Modal, Box, Typography, Button, Paper, Grid, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { statusLabels } from '.';

interface TurmaComercialModalProps {
  turma: TurmaComercial | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string, acao: string) => void;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: 800,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto',
};

const TurmaComercialModal: React.FC<TurmaComercialModalProps> = ({ turma, onClose, onUpdateStatus }) => {
  if (!turma) return null;

  const handleStatusChange = (newStatus: TurmaComercial['status']) => {
    const acao = `Status alterado para ${statusLabels[newStatus]}`;
    onUpdateStatus(String(turma.id), newStatus, acao);
  };

  return (
    <Modal open={!!turma} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h5" gutterBottom>{turma.nome}</Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>{turma.instituicao}</Typography>
        
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Informações</Typography>
              <Typography><strong>Contato:</strong> {turma.contatoPrincipal}</Typography>
              <Typography><strong>Telefone:</strong> {turma.telefone}</Typography>
              <Typography><strong>Status:</strong> {statusLabels[turma.status]}</Typography>
              <Typography><strong>Data do Contato:</strong> {new Date(turma.dataPrimeiroContato).toLocaleDateString()}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Timeline</Typography>
              <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                {turma.timeline.map((item, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography variant="body2"><strong>{new Date(item.data).toLocaleString()}:</strong> {item.acao}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Mover Status</Typography>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Novo Status</InputLabel>
            <Select label="Novo Status">
              {Object.keys(statusLabels).map(statusKey => (
                <MenuItem key={statusKey} onClick={() => handleStatusChange(statusKey as TurmaComercial['status'])}>
                  {statusLabels[statusKey as TurmaComercial['status']]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Button onClick={onClose} sx={{ mt: 3 }}>Fechar</Button>
      </Box>
    </Modal>
  );
};

export default TurmaComercialModal;
