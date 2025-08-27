import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Stack, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, FormControl, InputLabel, Select, MenuItem, IconButton } from '@mui/material';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import '../../../../fullCalendar.css'
import { apiDeleteData, apiGetData, apiPostData } from '../../../services/api';
import toast from 'react-hot-toast';
import { LoadingButton } from '@mui/lab';
import { IoMdTrash } from 'react-icons/io';


interface NewEventProps {
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

// Definição do tipo para o formulário
type FormDataType = {
  nome: string;
  descricao: string;
  data: string;
  nome_turma: string | null;
  turma_id: string | null;
};

const AgendaPage = () => {
  const [eventos, setEventos] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    fetchAgenda();
  }, []);

  const fetchAgenda = async () => {
    try {
      const response = await apiGetData("academic", "/agenda?limit=150");
      console.log(response.data);
      const eventosFormatados = response.data.map((evento: any) => {
        const dataEvento = evento.data ? new Date(evento.data) : null;

        return {
          id: evento.id,
          title: evento.nome,
          start: dataEvento || new Date(),
          descricao: evento.descricao,
          nome_turma: evento.nome_turma,
          turma_id: evento.turma_id
        };
      });
      setEventos(eventosFormatados);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiDeleteData("academic", `/agenda/${id}`, {});
      await fetchAgenda();
      toast.success('Evento excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      toast.error('Erro ao excluir evento');
    }
  };

  return (
    <Stack spacing={3} p={4}>
      <Stack direction={"row"} justifyContent={'space-between'} alignItems={'center'}>
        <Typography
          variant="h6"
          color="primary"
          fontFamily={"Poppins"}
          fontWeight={700}
        >
          Agenda do Time
        </Typography>
        <Button variant="contained" color="secondary" onClick={() => setOpenModal(true)}>
          Novo Evento
        </Button>
      </Stack>
      <Box
        sx={{
          height: '70vh',
          overflowY: 'auto',
          '& .fc': {
            padding: 1,
            minHeight: '100%'
          }
        }}
      >
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          locale={ptBrLocale}
          events={eventos}
          timeZone="local"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          eventDidMount={(info) => {
            const isToday = info.event.start &&
              new Date(info.event.start).toDateString() === new Date().toDateString();

            if (isToday) {
              info.el.style.setProperty('background-color', '#d32f2f', 'important');
              info.el.style.setProperty('color', 'white', 'important');
            }
          }}
          eventContent={(eventInfo: any) => (
            <Box
              sx={{
                position: 'relative',
                padding: '4px',
                fontWeight: 500,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                width: '100%',
                maxWidth: '100%',
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
                whiteSpace: 'normal',
                '&:hover .delete-button': {
                  display: 'flex',
                },
              }}
            >
              <Box sx={{ zIndex: 1 }}>{eventInfo.event.title}</Box>
              <Box sx={{ fontSize: '0.8em', opacity: 0.9, zIndex: 1 }}>
                {eventInfo.event.extendedProps.nome_turma}
              </Box>

              <IconButton
                size="small"
                onClick={() => handleDelete(eventInfo.event.id)}
                className="delete-button"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2,
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  display: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,1)',
                  },
                }}
              >
                <IoMdTrash fontSize="small" color='red' />
              </IconButton>
            </Box>
          )}
        />
      </Box>

      <NewEventModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onRefresh={fetchAgenda}
      />
    </Stack>
  );
};

const NewEventModal = ({ open, onClose, onRefresh }: NewEventProps) => {
  const [formData, setFormData] = useState<FormDataType>({
    nome: '',
    descricao: '',
    data: new Date().toISOString().slice(0, 16),
    nome_turma: null,
    turma_id: null
  });
  const [turmas, setTurmas] = useState([]);
  const [loadingSave, setLoadingSave] = useState(false);


  const handleSubmit = async () => {
    setLoadingSave(true);
    try {
      if (!formData.data || isNaN(new Date(formData.data).getTime())) {
        toast.error('Selecione uma data e hora válidas');
        return;
      }
      await apiPostData("academic", '/agenda', {
        ...formData,
        data: new Date(formData.data).toISOString()
      });
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Erro ao criar evento:', error);
    }
    setLoadingSave(false);
  };

  const fetchTurmas = async () => {
    try {
      const response = await apiGetData("academic", "/turmas");
      setTurmas(response.data);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  }
  useEffect(() => {
    fetchTurmas();
  }, []);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ fontWeight: 600, fontFamily: 'Poppins' }}>Criar Novo Evento</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2, width: 400 }}>
          <TextField
            label="Nome do Evento"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          />
          <TextField
            label="Descrição"
            multiline
            rows={4}
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          />
          <TextField
            label="Data e Hora"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={formData.data}
            onChange={(e) => setFormData({ ...formData, data: e.target.value })}
            inputProps={{
              min: new Date().toISOString().slice(0, 16)
            }}
          />
          <TextField
            label="Nome da Turma"
            value={formData.nome_turma ?? ''}
            onChange={(e) => setFormData({ ...formData, nome_turma: e.target.value || null })}
          />
          <FormControl >
            <InputLabel
              id="tipo"
              sx={{
                backgroundColor: "white",
                px: 0.5,
              }}
            >
              Turma
            </InputLabel>
            <Select
              labelId="tipo"
              name="tipo"
              value={formData.turma_id ?? ''}
              onChange={(e) => setFormData({ ...formData, turma_id: e.target.value || null })}
            >
              {turmas.map((turma: { id: string, nome: string }) => (
                <MenuItem key={turma.id} value={turma.id}>
                  {turma.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* <TextField
              label="ID da Turma"
              type="number"
              value={formData.turma_id}
              onChange={(e) => setFormData({ ...formData, turma_id: e.target.value })}
            /> */}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color='error' onClick={onClose}>Cancelar</Button>
        <LoadingButton loading={loadingSave} onClick={handleSubmit} variant="contained">Salvar</LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default AgendaPage