import React from 'react';
import { TurmaComercial } from '../../stores/comercialStore';
import { Paper, Typography, Grid, Box, Chip } from '@mui/material';
import { statusLabels } from '.';

interface TurmaComercialListProps {
  turmas: TurmaComercial[];
  onTurmaClick: (turma: TurmaComercial) => void;
}

const TurmaComercialList: React.FC<TurmaComercialListProps> = ({ turmas, onTurmaClick }) => {
  console.log(turmas);
  
  if (turmas.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Nenhuma turma encontrada para este status.</Typography>
      </Paper>
    );
  }

  return (
    <Grid container spacing={2}>
      {turmas.map(turma => (
        <Grid item xs={12} md={6} lg={4} key={turma.id}>
          <Paper 
            elevation={2} 
            sx={{ p: 2, cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
            onClick={() => onTurmaClick(turma)}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h6">{turma.nome}</Typography>
                <Typography variant="body2" color="text.secondary">{turma.instituicao}</Typography>
              </Box>
              <Chip label={statusLabels[turma.status]} color="primary" size="small" />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2"><strong>Contato:</strong> {turma.contatoPrincipal}</Typography>
              <Typography variant="body2"><strong>Telefone:</strong> {turma.telefone}</Typography>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default TurmaComercialList;
