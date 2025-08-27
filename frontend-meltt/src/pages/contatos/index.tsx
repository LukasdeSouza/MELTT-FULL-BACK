import {
  Link,
  Paper,
  Slide,
  Stack,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import BasicTable from "../../components/table";
import { useEffect, useState } from "react";
import { apiGetData } from "../../services/api";
import toast from "react-hot-toast";
import NoTableData from "../../components/noData";
import LoadingTable from "../../components/loadingTable";
import { BiSearch } from "react-icons/bi";
import { contatosColumns } from "./table/columns";

interface Contact {
  id: number;
  codigo: string;
  nome: string;
  numeroDocumento: string;
  situacao: string;
  telefone: string;
}

const ContatosPage = () => {
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);

  const [onLoad, setOnLoad] = useState(false);

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const fetchContatos = async (page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("pagina", page.toString());

      const response = await apiGetData("academic", `/bling/contatos?${params.toString()}`);
      setContacts(response.data);
    } catch (error) {
      toast.error("Erro ao buscar Contatos no Bling, se necessário saia da sua conta Bling e autentique-se novamente");
    }

    setLoading(false);
  };


  const filteredContacts = contacts.filter((contact: Contact) => {
    const codigo = contact.codigo === "" ? "Código não informado" : contact.codigo;
    return codigo.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
  });


  const handleChangePagination = (_: React.ChangeEvent<unknown>, value: number) => {
    try {
      fetchContatos(value);
    } catch (error) {
      toast.error("Erro ao buscar Pagamentos");
    }
    setPage(value);
  };

  const dataRow = (row: Contact) => {
    return (
      <TableRow
        key={row.id}
        sx={{
          "&:last-child td, &:last-child th": { border: 0 },
          " &:hover": { bgcolor: "#F7F7F7", cursor: "pointer" },
        }}
      >
        <TableCell component="th" scope="row">
          <Link
            color="primary"
            underline="always"
            sx={{ fontFamily: "Poppins" }}
          >
            {row.codigo === "" ? "Código não informado" : row.codigo}
          </Link>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.nome}
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          {row.numeroDocumento}
        </TableCell>
        <TableCell align="left" sx={{ fontFamily: "Poppins" }}>
          {row.telefone === "" ? "Telefone não informado" : row.telefone}
        </TableCell>
      </TableRow>
    );
  };

  useEffect(() => {
    fetchContatos(1);
    setOnLoad(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <Stack width={"calc(100% - 64px)"}>
      <Slide direction="right" in={onLoad} mountOnEnter>
        <Paper
          elevation={0}
          sx={{
            p: 1,
            flexGrow: 1,
            width: "100%",
            height: "calc(90vh - 70px)",
            borderRadius: 4,
          }}
        >
          <Stack direction={'column'} p={2}>
            <TextField
              size="small"
              label="Buscar por código"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: '20%' }}
              InputProps={{
                endAdornment: <BiSearch style={{ color: '#aaa' }} />,
              }}
              />
              <Typography variant="caption" fontFamily={'Poppins'}>⚠ filtro aplicado apenas na página atual</Typography>
          </Stack>
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
            ) : contacts?.length > 0 ? (
              <BasicTable
                columns={contatosColumns}
                rows={filteredContacts}
                loading={loading}
                dataRow={dataRow}
                page={page}
                totalPages={contacts?.length}
                handleChangePagination={handleChangePagination}
              />
            ) : (
              <NoTableData
                pronoum={"he"}
                pageName="pagamento"
                disabledButton={false}
                onClickAction={() => { }}
              />
            )}
          </Paper>
        </Paper>
      </Slide>
    </Stack>
  );
};

export default ContatosPage;
