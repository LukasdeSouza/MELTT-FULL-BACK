
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Collapse,
  Divider,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { BiArrowBack } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';

const mockCustosPreEventos = [
  {
    id: 1,
    nome: 'Reserva de Espaço',
    valor: 1800,
    vencimento: '02/09/2025',
    detalhes: 'Reserva do salão para evento, inclui taxa de limpeza.'
  },
  {
    id: 2,
    nome: 'Material Promocional',
    valor: 600,
    vencimento: '15/08/2025',
    detalhes: 'Confecção de banners, flyers e brindes.'
  },
  {
    id: 3,
    nome: 'Consultoria',
    valor: 950,
    vencimento: '20/08/2025',
    detalhes: 'Consultoria para planejamento do evento.'
  },
];

const CustosPreEventosPage = () => {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState('');
  const [expandido, setExpandido] = useState<number | null>(null);

  const custosFiltrados = mockCustosPreEventos.filter(custo =>
    custo.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <Box sx={{ width: '100%', mx: 'auto', mt: 4 }}>
      <IconButton color='secondary' size='small' onClick={() => navigate('/custos')}>
        <BiArrowBack />
      </IconButton>
      <Typography color='primary' variant="h5" fontWeight={700} mb={2}>
        Custos de Pré-Eventos
      </Typography>
      <TextField
        label="Filtrar por nome"
        variant="outlined"
        size="small"
        fullWidth
        value={filtro}
        onChange={e => setFiltro(e.target.value)}
        sx={{ mb: 3 }}
      />
      <Paper elevation={2}>
        <List>
          {custosFiltrados.map(custo => (
            <React.Fragment key={custo.id}>
              <ListItem
                secondaryAction={
                  <IconButton edge="end" onClick={() => setExpandido(expandido === custo.id ? null : custo.id)}>
                    {expandido === custo.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                }
                sx={{ cursor: 'pointer' }}
                onClick={() => setExpandido(expandido === custo.id ? null : custo.id)}
              >
                <ListItemText
                  primary={custo.nome}
                  secondary={`Valor: R$ ${custo.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Vencimento: ${custo.vencimento}`}
                />
              </ListItem>
              <Collapse in={expandido === custo.id} timeout="auto" unmountOnExit>
                <Box sx={{ px: 3, py: 2, bgcolor: '#F6F7FB' }}>
                  <Typography variant="body2" color="text.secondary">
                    {custo.detalhes}
                  </Typography>
                </Box>
              </Collapse>
              <Divider />
            </React.Fragment>
          ))}
          {custosFiltrados.length === 0 && (
            <ListItem>
              <ListItemText primary="Nenhum custo de pré-evento encontrado." />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default CustosPreEventosPage;