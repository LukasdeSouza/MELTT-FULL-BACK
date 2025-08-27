
import React, { useEffect, useState } from 'react';
import {
  Box,
  Stack,
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
import { apiGetData } from '../../../services/api';
import formatDateToDDMMYYYY from '../../../utils/functions/formatDate';
import formatCentavosToBRL from '../../../utils/functions/formatCentavosToBRL';

const CustosFixosPage = () => {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState('');
  const [expandido, setExpandido] = useState<number | null>(null);
  const [custosFixo, setCustosFixo] = useState([]);

  const fetchCustosFixo = async (searchTerm = '') => {
    const url = searchTerm
      ? `/custos?tipo_custo=Fixo&evento=${encodeURIComponent(searchTerm)}`
      : '/custos?tipo_custo=Fixo';

    const response = await apiGetData('academic', url);
    setCustosFixo(response.data || []);
  };

  useEffect(() => {
    fetchCustosFixo();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchCustosFixo(filtro);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [filtro]);

  return (
    <Box sx={{ width: '100%', mx: 'auto', mt: 4 }}>
      <IconButton color='secondary' size='small' onClick={() => navigate('/custos')}>
        <BiArrowBack />
      </IconButton>
      <Typography color='primary' variant="h5" fontWeight={700} mb={2}>
        Custos Fixos
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
          {custosFixo.map(custo => (
            <React.Fragment key={custo.id_custo}>
              <ListItem
                secondaryAction={
                  <IconButton edge="end" onClick={() => setExpandido(expandido === custo.id_custo ? null : custo.id_custo)}>
                    {expandido === custo.id_custo ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                }
                sx={{ cursor: 'pointer' }}
                onClick={() => setExpandido(expandido === custo.id_custo ? null : custo.id_custo)}
              >
                <ListItemText
                  primary={custo.evento}
                  secondary={`Valor: R$ ${formatCentavosToBRL(custo.valor)} | Vencimento: ${formatDateToDDMMYYYY(custo.vencimento)}`}
                />
              </ListItem>
              <Collapse in={expandido === custo.id_custo} timeout="auto" unmountOnExit>
                <Box sx={{ px: 3, py: 2, bgcolor: '#F6F7FB' }}>
                  <Typography variant="body2" color="text.secondary">
                    {custo.situacao}
                  </Typography>
                </Box>
              </Collapse>
              <Divider />
            </React.Fragment>
          ))}
          {custosFixo.length === 0 && (
            <ListItem>
              <ListItemText primary="Nenhum custo fixo encontrado." />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default CustosFixosPage;