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
import { eventBuyersColumns } from "../table/columns/buyers";
import { BiArrowBack } from "react-icons/bi";

const EventosCompradoresPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [eventBuyers, setEventBuyers] = useState([]);
  const [totalAmount, setTotalAmount] = useState("");
  const [totalPaidAmount, setTotalPaidAmount] = useState("");

  const [onLoad, setOnLoad] = useState(false);


  const fetchEventBuyers = async (_: number) => {
    setLoading(true);
    try {
      const response = await apiGetData("academic", `/uniticket/buyers?access_token=${id}`);
      if (response && response.data && Array.isArray(response.data)) {
        const totalAmount = response.data.reduce((sum: number, item: any) => {
          if (item.order && item.order.total_amount) {
            const amount = parseFloat(item.order.total_amount);
            if (!isNaN(amount)) {
              return sum + amount;
            }
          }
          return sum;
        }, 0);

        const totalPaidAmount = response.data.reduce((sum: number, item: any) => {
          if (item.order && item.order.total_amount && item.order.status === 'finalizado') {
            const amount = parseFloat(item.order.total_amount);
            if (!isNaN(amount)) {
              return sum + amount;
            }
          }
          return sum;
        }, 0);

        const formattedTotalAmount = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(totalAmount);

        const formattedTotalPaidAmount = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(totalPaidAmount);

        console.log('Total adquirido com vendas de ingressos:', formattedTotalAmount);
        console.log('Valor pago com status finalizado:', formattedTotalPaidAmount);

        setEventBuyers(response.data);
        setTotalAmount(formattedTotalAmount);
        setTotalPaidAmount(formattedTotalPaidAmount);
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
      fetchEventBuyers(value);
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
          {row.cpf}
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          {row.phone}
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          <Chip color={row.order.status === 'finalizado' ? 'success' : 'secondary'} label={row.order.status} />
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          R$ {row.order.total_amount}
        </TableCell>
      </TableRow>
    );
  };


  useEffect(() => {
    fetchEventBuyers(1);
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
          <h2 className="text-lg text-default font-extrabold">Quantidade de Compradores: {eventBuyers.length}</h2>
        </Stack>
        <Stack direction={'row'} gap={1}>
          <Chip color="secondary" label={`Valor Movimentado: ${totalAmount}`} />
          <Chip color="success" label={`Valor Total Pago: ${totalPaidAmount}`} />
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
            ) : eventBuyers.length > 0 ? (
              <BasicTable
                columns={eventBuyersColumns}
                rows={eventBuyers}
                loading={loading}
                dataRow={dataRow}
                page={page}
                totalPages={1}
                handleChangePagination={handleChangePagination}
              />
            ) : (
              <Stack width={'100%'} mt={20} alignItems={'center'} textAlign={'center'}>
                <h2 className="font-light">nenhuma informação de compradores para este evento.</h2>
              </Stack>
            )}
          </Paper>
        </Paper>
      </Slide>
    </Stack>
  );
};

export default EventosCompradoresPage;
