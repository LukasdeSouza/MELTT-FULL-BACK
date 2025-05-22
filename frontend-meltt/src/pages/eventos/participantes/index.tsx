import {
  Chip,
  IconButton,
  Paper,
  Slide,
  Stack,
  TableCell,
  TableRow,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import BasicTable from "../../../components/table";
import LoadingTable from "../../../components/loadingTable";
import { apiGetData } from "../../../services/api";
import { BiArrowBack } from "react-icons/bi";
import { eventsParticipantesColumns } from "../table/columns/particiantes";

const EventosParticipantesPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(false);
  const [eventos, setEventos] = useState([]);

  const [onLoad, setOnLoad] = useState(false);


  const fetchEventsParticipants = async (_: number) => {
    setLoading(true);
    try {
      const response = await apiGetData("academic", `/uniticket/participants?access_token=${id}`);
      setTotalPages(response.totalPages);
      setEventos(response.data);
    } catch (error) {
      toast.error("Nenhuma informação encontrada para eventos");
    }
    setLoading(false);
  };

  const handleChangePagination = (_: React.ChangeEvent<unknown>, value: number) => {
    try {
      fetchEventsParticipants(value);
    } catch (error) {
      toast.error("Erro ao buscar Turmas");
    }
    setPage(value);
  };



  const dataRow = (row: any) => {
    return (
      <TableRow
        key={row.id}
        sx={{
          "&:last-child td, &:last-child th": { border: 0 },
          " &:hover": { bgcolor: "#F7F7F7", cursor: "pointer" },
        }}
      >
        <TableCell component="th" scope="row" sx={{ fontFamily: "Poppins" }}>
          {row.access_code}
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          {row.name}
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          {row.document.type} - {row.document.number}
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          {row.email}
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          <Chip color={row.checked_in == 0 ? 'warning' : 'success'} label={row.checked_in == 0 ? 'Checkin Não efetuado' : 'Checkin efetuado'}/>
        </TableCell>

      </TableRow>
    );
  };

  useEffect(() => {
    fetchEventsParticipants(1);
    setOnLoad(true);
  }, []);

  return (
    <Stack width={"calc(100% - 28px)"}>
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
        my={2}
      >
        <Stack direction={'row'} alignItems={'center'} gap={1}>
          <IconButton onClick={() => navigate(-1)}>
            <BiArrowBack />
          </IconButton>
          <h2 className="text-2xl text-default font-extrabold">Participantes do evento</h2>
        </Stack>
        
      </Stack>
      <Slide direction="right" in={onLoad} mountOnEnter>
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
            {loading ? (
              <LoadingTable />
            ) : eventos.length > 0 ? (
              <BasicTable
                columns={eventsParticipantesColumns}
                rows={eventos}
                loading={loading}
                dataRow={dataRow}
                page={page}
                totalPages={totalPages}
                handleChangePagination={handleChangePagination}
              />
            ) : (
              <Stack width={'100%'} height={'100%'} alignItems={'center'}>
                <h2 className="font-light">Não há eventos cadastrados</h2>
              </Stack>
            )}
          </Paper>
        </Paper>
      </Slide>
    </Stack>
  );
};

export default EventosParticipantesPage;
