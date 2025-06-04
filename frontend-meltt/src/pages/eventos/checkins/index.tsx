import {
  Chip,
  IconButton,
  Link,
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
import { eventCheckinsColumns } from "../table/columns/checkins";
import { IoTicketOutline } from "react-icons/io5";
import { MdOutlineDateRange } from "react-icons/md";
import { TbClockHour4 } from "react-icons/tb";

const EventosCheckinsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [eventCheckins, setEventCheckins] = useState([]);

  const [onLoad, setOnLoad] = useState(false);


  const fetchEventCheckins = async () => {
    setLoading(true);
    try {
      const response = await apiGetData("academic", `/uniticket/checkins?access_token=${id}`);
      if (response && response.data && Array.isArray(response.data)) {

        setEventCheckins(response.data);
      } else {
        toast.error("Estrutura inesperada em response.data");
      }

    } catch (error) {
      toast.error("Nenhuma informação encontrada para eventos");
    }
    setLoading(false);
  };

  const handleChangePagination = (_: React.ChangeEvent<unknown>, value: number) => {
    try {
      fetchEventCheckins();
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
        <TableCell component="th" scope="row">
          <Stack direction="row" alignItems="center" gap={2}>
            <Link
              color="primary"
              underline="always"
              sx={{ fontFamily: "Poppins" }}
            >
              {row.name}
            </Link>
          </Stack>
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          {row.email}
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          {row.lot_name}
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          {row.sector_name}
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          <Chip
            color="secondary"
            label={row.ticket_code}
            icon={<IoTicketOutline size={20} />}
            sx={{ fontFamily: "Poppins", p: 1 }}
          />
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          <Chip
            color="default"
            label={row.checkin_date}
            icon={<MdOutlineDateRange size={20} />}
            sx={{ fontFamily: "Poppins", p: 1 }}
          />
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          <Chip
            color="default"
            label={row.checkin_hour}
            icon={<TbClockHour4 size={20} />}
            sx={{ fontFamily: "Poppins", p: 1 }}
          />
        </TableCell>

      </TableRow>
    );
  };


  useEffect(() => {
    fetchEventCheckins();
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
          <IconButton size="small" onClick={() => navigate('/eventos')}>
            <BiArrowBack />
          </IconButton>
          <h2 className="text-lg text-default font-extrabold">Checkins do evento</h2>
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
            ) : eventCheckins.length > 0 ? (
              <BasicTable
                columns={eventCheckinsColumns}
                rows={eventCheckins}
                loading={loading}
                dataRow={dataRow}
                page={page}
                totalPages={1}
                handleChangePagination={handleChangePagination}
              />
            ) : (
              <Stack width={'100%'} mt={20} alignItems={'center'} textAlign={'center'}>
                <h2 className="font-light">nenhuma informação de checkins para este evento.</h2>
              </Stack>
            )}
          </Paper>
        </Paper>
      </Slide>
    </Stack>
  );
};

export default EventosCheckinsPage;
