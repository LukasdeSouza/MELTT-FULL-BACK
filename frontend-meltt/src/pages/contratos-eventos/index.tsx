import { useState } from "react";
import {
  Button,
  Stack,
  TextField,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Tabs,
  Tab,
  Box,
  Paper,
} from "@mui/material";
import { IoMdAdd } from "react-icons/io";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "moment/locale/pt-br";
moment.locale("pt-br");

const localizer = momentLocalizer(moment);

type Item = {
  id: string;
  content: string;
  createdBy: string;
  eventName: string;
  agreedValue: string;
  turma: string;
  type: string;
  createdAt: string;
};

type Column = {
  name: string;
  items: Item[];
};

type Columns = {
  [key: string]: Column;
};

const initialColumns: Columns = {
  "em-atraso": {
    name: "Em Atraso",
    items: [],
  },
  "em-andamento": {
    name: "Em Andamento",
    items: [],
  },
  "em-negociacao": {
    name: "Negociação",
    items: [],
  },
  "realizado": {
    name: "Realizado",
    items: [],
  },
};

const ContratosEventosPage = () => {
  const [columns, setColumns] = useState<Columns>(initialColumns);
  const [openModal, setOpenModal] = useState(false);
  const [newCard, setNewCard] = useState<Omit<Item, "id" | "createdAt">>({
    content: "",
    createdBy: "",
    eventName: "",
    agreedValue: "",
    turma: "",
    type: "",
  });
  const [view, setView] = useState<"kanban" | "agenda">("kanban");

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const startColumn = columns[source.droppableId];
    const finishColumn = columns[destination.droppableId];

    if (!startColumn || !finishColumn) return;

    const newStartItems = [...startColumn.items];
    const [movedItem] = newStartItems.splice(source.index, 1);

    const newFinishItems = [...finishColumn.items];
    newFinishItems.splice(destination.index, 0, movedItem);

    setColumns({
      ...columns,
      [source.droppableId]: { ...startColumn, items: newStartItems },
      [destination.droppableId]: { ...finishColumn, items: newFinishItems },
    });
  };

  const addNewCard = () => {
    if (
      !newCard.content.trim() ||
      !newCard.createdBy ||
      !newCard.eventName ||
      !newCard.agreedValue ||
      !newCard.type
    )
      return;

    const newCardData: Item = {
      id: Date.now().toString(),
      createdAt: new Date().toLocaleDateString("pt-BR"),
      ...newCard,
    };

    setColumns({
      ...columns,
      "em-andamento": {
        ...columns["em-andamento"],
        items: [...columns["em-andamento"].items, newCardData],
      },
    });

    setNewCard({
      content: "",
      createdBy: "",
      eventName: "",
      agreedValue: "",
      turma: "",
      type: "",
    });

    setOpenModal(false);
  };

  const handleSelectEvent = (event: any) => {
    setNewCard({
      content: event.desc,
      createdBy: event.createdBy,
      eventName: event.title,
      agreedValue: event.agreedValue,
      type: event.type,
      turma: event.turma,
    });
    setOpenModal(true);
  };

  const removeCard = (columnId: string, cardId: string) => {
    const filteredItems = columns[columnId].items.filter((item) => item.id !== cardId);
    setColumns({
      ...columns,
      [columnId]: { ...columns[columnId], items: filteredItems },
    });
  };

  const getColumnBackgroundColor = (columnId: string) => {
    switch (columnId) {
      case "em-atraso":
        return "rgba(255, 99, 71, 0.3)";
      case "em-andamento":
      case "em-negociacao":
        return "rgba(255, 255, 0, 0.3)";
      case "realizado":
        return "rgba(144, 238, 144, 0.3)";
      default:
        return "#e4e4e4";
    }
  };

  const events = Object.values(columns)
    .flatMap((column) =>
      column.items.map((item) => ({
        id: item.id,
        title: item.eventName,
        start: new Date(item.createdAt),
        end: new Date(item.createdAt),
        desc: item.content,
        createdBy: item.createdBy,
        type: item.type,
      }))
    );

  return (
    <Stack width={"calc(100% - 64px)"}>
      <Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"} my={2}>
        <h2 className="text-2xl text-default font-extrabold">Controle de Eventos e Agenda</h2>
        <Button
          color="secondary"
          variant="contained"
          endIcon={<IoMdAdd />}
          onClick={() => setOpenModal(true)}
          sx={{ borderRadius: 2 }}
        >
          Adicionar Card
        </Button>
      </Stack>
      <Paper
        elevation={0}
        sx={{
          p: 1,
          flexGrow: 1,
          width: "100%",
          height: "calc(100vh - 170px)",
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
          <Tabs value={view} onChange={(_, newValue) => setView(newValue)}>
            <Tab label="Kanban" value="kanban" sx={{ fontFamily: "Poppins" }} />
            <Tab label="Agenda" value="agenda" sx={{ fontFamily: "Poppins" }} />
          </Tabs>
          {view === "kanban" ? (
            <DragDropContext onDragEnd={onDragEnd}>
              <Stack direction={"row"} spacing={2} padding={2}>
                {Object.entries(columns).map(([columnId, column]) => (
                  <Droppable key={columnId} droppableId={columnId}>
                    {(provided) => (
                      <Stack
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{
                          width: 300,
                          minHeight: 350,
                          background: getColumnBackgroundColor(columnId),
                          padding: 2,
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body1" color="primary" fontWeight={600}>
                          {column.name}
                        </Typography>
                        {column.items.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{ marginBottom: 2, padding: 1 }}
                              >
                                <CardContent>
                                  <Stack direction={"column"} gap={2}>
                                    <Stack direction={"column"} gap={1}>
                                      <Typography variant="caption" color="textSecondary">
                                        Criado em: {item.createdAt}
                                      </Typography>
                                    </Stack>
                                    <TextField size="small" label="Criado por" value={item.createdBy} fullWidth disabled />
                                    <TextField size="small" label="Nome do Evento" value={item.eventName} fullWidth disabled />
                                    <TextField size="small" label="Valor Acordado" value={item.agreedValue} fullWidth disabled />
                                    <TextField size="small" label="Tipo de Evento" value={item.type} fullWidth disabled />
                                    <Button color="secondary" size="small" variant="contained" onClick={() => handleSelectEvent(item)} sx={{ fontFamily: "poppins" }}>
                                      Editar
                                    </Button>
                                    <Button color="error" size="small" onClick={() => removeCard(columnId, item.id)} sx={{ fontFamily: "poppins" }}>
                                      Remover
                                    </Button>
                                  </Stack>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Stack>
                    )}
                  </Droppable>
                ))}
              </Stack>
            </DragDropContext>
          ) : (
            <Box sx={{ height: 600, mt: 3 }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                onSelectEvent={handleSelectEvent}
                views={["month", "week", "day"]}
                defaultView="month"
                style={{
                  fontFamily: "Poppins",
                  backgroundColor: "#f0f0f0", // Cor de fundo do calendário
                  borderRadius: "8px", // Bordas arredondadas
                }}
              />
            </Box>
          )}
        </Paper>
      </Paper>

      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle sx={{ fontFamily: "Poppins" }}>Adicionar Evento</DialogTitle>
        <DialogContent>
          <TextField
            label="Descrição"
            fullWidth
            multiline
            rows={4}
            value={newCard.content}
            onChange={(e) => setNewCard({ ...newCard, content: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Criado por"
            fullWidth
            value={newCard.createdBy}
            onChange={(e) => setNewCard({ ...newCard, createdBy: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Nome do Evento"
            fullWidth
            value={newCard.eventName}
            onChange={(e) => setNewCard({ ...newCard, eventName: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Valor Acordado"
            fullWidth
            value={newCard.agreedValue}
            onChange={(e) => setNewCard({ ...newCard, agreedValue: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Tipo"
            fullWidth
            value={newCard.type}
            onChange={(e) => setNewCard({ ...newCard, type: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={addNewCard} color="primary" variant="contained">
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default ContratosEventosPage;
