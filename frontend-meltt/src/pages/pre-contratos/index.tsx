import { useState, useEffect, useCallback } from "react";
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
} from "@mui/material";
import { IoMdAdd } from "react-icons/io";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { apiDeleteData, apiGetData, apiPostData, apiPutData } from "../../services/api";
import toast from "react-hot-toast";
import { format } from "date-fns";

type Item = {
  id: string;
  content: string;
  createdBy: string;
  contactedBy: string;
  studentName: string;
  agreedValue: string;
  packageInterest: string;
  created_at: string;
  status: Status
};

type Column = {
  name: string;
  items: Item[];
};

enum Status {
  PARADO = "Parado",
  EM_CONTATO = "Em Contato",
  PAGAMENTO_PENDENTE = "Pagamento Pendente",
  PAGAMENTO_EFETUADO = "Pagamento Efetuado",
}

type Columns = {
  [key: string]: Column;
};

const initialColumns = Object.values(Status).reduce((acc, status) => {
  acc[status] = { name: status, items: [] };
  return acc;
}, {} as Record<string, { name: string; items: Item[] }>);


const PreContratoPage = () => {
  const [columns, setColumns] = useState<Columns>(initialColumns);
  const [openModal, setOpenModal] = useState(false);
  const [newCard, setNewCard] = useState<Omit<Item, "id" | "created_at">>({
    content: "",
    createdBy: "",
    contactedBy: "",
    studentName: "",
    agreedValue: "",
    packageInterest: "",
    status: Status.PARADO,
  });

  const fetchPreContratos = useCallback(async () => {
    try {
      const response = await apiGetData("academic", "pre-contrato");
      if (!response) return;
  
      setColumns(_ => {
        const updatedColumns = { ...initialColumns };
        response.data?.forEach((preContrato: Item) => {
          const statusKey = preContrato.status;
          if (updatedColumns[statusKey]) {
            if (!updatedColumns[statusKey].items.some(item => item.id === preContrato.id)) {
              updatedColumns[statusKey].items.push(preContrato);
            }
          }
        });
        return updatedColumns;
      });
    } catch (error) {
      toast.error("Erro ao carregar pré-contratos");
    }
  }, []);
  


  useEffect(() => {
    fetchPreContratos();
  }, [fetchPreContratos]);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
  
    console.log(result);
  
    const { source, destination } = result;
    const startColumn = columns[source.droppableId];
    const finishColumn = columns[destination.droppableId];
  
    if (!startColumn || !finishColumn) return;
  
    // Pegando o item pelo index para garantir o ID correto
    const movedItem = startColumn.items[source.index];
  
    if (!movedItem?.id) {
      toast.error("Erro: ID inválido do card");
      return;
    }
  
    const updatedItem = { ...movedItem, status: finishColumn.name as Status };
  
    // Atualiza localmente
    setColumns(prev => {
      const newStartItems = prev[source.droppableId].items.filter((_, i) => i !== source.index);
      const newFinishItems = [...prev[destination.droppableId].items];
      newFinishItems.splice(destination.index, 0, updatedItem);
  
      return {
        ...prev,
        [source.droppableId]: { ...startColumn, items: newStartItems },
        [destination.droppableId]: { ...finishColumn, items: newFinishItems },
      };
    });
  
    try {
      await apiPutData("academic", `/pre-contrato/${movedItem.id}`, { status: updatedItem.status });
      toast.success("Status atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar status!");
    }
  };
  

  const addNewCard = async () => {
    if (
      !newCard.content.trim() ||
      !newCard.createdBy ||
      !newCard.studentName ||
      !newCard.agreedValue ||
      !newCard.packageInterest
    ) {
      return toast.error("Preencha todos os campos!");
    }
  
    const newCardData = {
      created_at: new Date().toISOString(),
      ...newCard,
      status: Status.PARADO,
    };
  
    try {
      const result = await apiPostData("academic", "/pre-contrato", newCardData);
      console.log('add new card', result);
      if (result && result.id) {
        const savedCard = { ...newCardData, id: result.id };
  
        setColumns(prev => ({
          ...prev,
          [Status.PARADO]: {
            ...prev[Status.PARADO],
            items: [...prev[Status.PARADO].items, savedCard],
          },
        }));
      }
  
      setNewCard({
        content: "",
        createdBy: "",
        contactedBy: "",
        studentName: "",
        agreedValue: "",
        packageInterest: "",
        status: Status.PARADO,
      });
      
      setOpenModal(false);
    } catch (error) {
      toast.error("Erro ao adicionar pré-contrato");
    }
  };

  const removeCard = async (columnId: string, cardId: string) => {
    try {
      let result = await apiDeleteData("academic", `/pre-contrato/${cardId}`);
      console.log(result);
      const filteredItems = columns[columnId].items.filter((item) => item.id !== cardId);
      setColumns({
        ...columns,
        [columnId]: { ...columns[columnId], items: filteredItems },
      });
      toast.success(result?.message ?? "Pré-contrato removido com sucesso!");
    } catch (error) {
      toast.error("Erro ao remover pré-contrato:");
    }
  };

  const getTotalAgreedValue = () => {
    return Object.values(columns)
      .flatMap((column) => column.items)
      .reduce((total, item) => total + (parseFloat(item.agreedValue) || 0), 0)
      .toFixed(2);
  };

  return (
    <Stack width={"calc(100% - 28px)"}>
      <Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"} my={2}>
        <h2 className="text-2xl text-default font-extrabold"></h2>
        <Button
          size="small"
          color="secondary"
          variant="contained"
          endIcon={<IoMdAdd />}
          onClick={() => setOpenModal(true)}
          sx={{ borderRadius: 2 }}
        >
          Adicionar Card
        </Button>
      </Stack>
      <Stack sx={{ maxHeight: '45vh', overflowY: 'auto' }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Stack direction={"row"} spacing={2}>
            {Object.entries(columns).map(([columnId, column]) => (
              <Droppable key={columnId} droppableId={columnId}>
                {(provided) => (
                  <Stack
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      width: 300,
                      minHeight: 350,
                      background: "#e4e4e4",
                      padding: 2,
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body1" color="primary" fontWeight={700}>
                      {column.name}
                    </Typography>
                    {column.items.map((item, index) => (
                      <Draggable key={item.id.toString()} draggableId={item.id.toString()} index={index}>
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
                                    {item.created_at && !isNaN(new Date(item.created_at).getTime())
                                      ? format(new Date(item.created_at), "dd/MM/yyyy HH:mm")
                                      : "Data inválida"}
                                  </Typography>
                                </Stack>
                                <TextField size="small" label="Criado por" value={item.createdBy} fullWidth disabled />
                                <TextField size="small" label="Aluno" value={item.studentName} fullWidth disabled />
                                <TextField size="small" label="Valor Acordado" value={item.agreedValue} fullWidth disabled />
                                <Button color="error" size="small" variant="contained" onClick={() => removeCard(columnId, item.id)} sx={{ fontFamily: "poppins" }}>
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
      </Stack>

      {/* LISTA DE PRÉ CONTRATO */}
      <Stack mt={4} sx={{ maxHeight: '35vh', overflowY: 'auto' }}>
        <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
          <Typography variant="body1" color="primary" fontWeight={600} fontFamily={'Poppins'}>Lista de Pré-Contratos:</Typography>
          <Stack direction={'column'} alignItems={'center'}>
            <Typography variant="body2" color="textSecondary" fontFamily={'Poppins'}>Valor Total</Typography>
            <Typography variant="body1" color="success" fontWeight={600} fontFamily={'Poppins'}>R${getTotalAgreedValue()}</Typography>
          </Stack>
        </Stack>
        <Stack spacing={2} mt={2}>
          {Object.values(columns)
            .flatMap((column) => column.items)
            .map((item) => (
              <Card key={item.id} sx={{ padding: 2 }}>
                <Stack direction="column" gap={1}>
                  <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                    <Typography variant="body2" color="primary">Aluno: <strong>{item.studentName}</strong></Typography>
                    <Typography variant="body2" color="primary">Criado por:<strong>{item.createdBy}</strong></Typography>
                  </Stack>
                  <Stack direction={'row'} alignItems={'center'} gap={4}>
                    <Typography variant="body2" color="primary">Valor Acordado: <strong>R${item.agreedValue}</strong></Typography>
                    <Typography variant="body2" color="primary">Pacote de Formatura: <strong>{item.packageInterest}</strong></Typography>
                  </Stack>
                  <Typography variant="caption" color="textSecondary">
                    {item.created_at && !isNaN(new Date(item.created_at).getTime())
                      ? format(new Date(item.created_at), "dd/MM/yyyy HH:mm")
                      : "Data inválida"}
                  </Typography>
                </Stack>
              </Card>
            ))}
        </Stack>
      </Stack>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Adicionar Novo Card</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Nome do aluno"
            value={newCard.studentName}
            onChange={(e) => setNewCard({ ...newCard, studentName: e.target.value })}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Criado por"
            value={newCard.createdBy}
            onChange={(e) => setNewCard({ ...newCard, createdBy: e.target.value })}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Contato feito via"
            placeholder="Telefone, WhatsApp, E-mail..."
            value={newCard.contactedBy}
            onChange={(e) => setNewCard({ ...newCard, contactedBy: e.target.value })}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Valor Total Acordado"
            value={newCard.agreedValue}
            onChange={(e) => setNewCard({ ...newCard, agreedValue: e.target.value })}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Pacote de Interesse"
            value={newCard.packageInterest}
            onChange={(e) => setNewCard({ ...newCard, packageInterest: e.target.value })}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Outros detalhes"
            value={newCard.content}
            onChange={(e) => setNewCard({ ...newCard, content: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} color="secondary">
            Cancelar
          </Button>
          <Button variant="contained" onClick={addNewCard} color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default PreContratoPage;
