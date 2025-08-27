import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import { useEffect, useState } from "react";
import "dayjs/locale/pt-br";
import LoadingBackdrop from "../../../components/loadingBackdrop";
import { apiGetData } from "../../../services/api";
import LoadingTable from "../../../components/loadingTable";
import NoTableData from "../../../components/noData";
import BasicTable from "../../../components/table";
import { alunosColumns } from "../table/columns";
import { AlunoListType } from "../../../types";
import { MdOutlinePayments } from "react-icons/md";

const TurmasPageView = () => {
  const navigate = useNavigate();

  const { id } = useParams();
  const [alunos, setAlunos] = useState([]);
  const [turma, setTurma] = useState<{ nome: string }[]>([]);

  const [loadingAlunos, setLoadingAlunos] = useState(false);
  const [openLoadingBackdrop, setOpenLoadingBackdrop] = useState(false);

  const fetchAlunos = async () => {
    setLoadingAlunos(true);
    await apiGetData("academic", `/alunos/turma/${id}`).then((data) =>
      setAlunos(data)
    );
    setLoadingAlunos(false);
  };

  const fetchTurma = async () => {
    await apiGetData("academic", `/turmas/${id}`).then((data) =>
      setTurma(data)
    );
  };

  const dataRow = (row: AlunoListType) => {
    return (
      <TableRow
        key={row.nome}
        sx={{
          "&:last-child td, &:last-child th": { border: 0 },
          " &:hover": { bgcolor: "#F7F7F7", cursor: "pointer" },
        }}
      >
        <TableCell component="th" scope="row">
          <Stack direction={"row"} alignItems={"center"} gap={1}>
            {row.nome}
          </Stack>
        </TableCell>
        <TableCell align="left">{row.email}</TableCell>
        <TableCell align="left">{row.telefone}</TableCell>
        <TableCell align="left">{row.plano}</TableCell>
        <TableCell align="left">
          <Chip
            variant="filled"
            color={row.formatura_paga ? "success" : "error"}
            label={row.formatura_paga ? "Fatura paga" : "Fatura não paga"}
            icon={<MdOutlinePayments />}
            sx={{ fontFamily: "Poppins", padding: 1 }}
          />
        </TableCell>
      </TableRow>
    );
  };

  useEffect(() => {
    fetchTurma();
    fetchAlunos();
  }, []);

  return (
    <Stack width={"100%"} height={"100%"} gap={10}>
      <Stack width={"calc(100% - 64px)"} direction={"column"}>
        <Typography
          color="primary"
          variant="h5"
          fontWeight={700}
          ml={4}
          mb={2}
        ></Typography>
        <Paper
          elevation={0}
          style={{
            fontFamily: "Poppins",
            position: "relative",
            padding: "12px",
            height: "calc(100vh - 132px)",
            overflow: "auto",
            borderRadius: "24px",
            backgroundColor: "#fff",
          }}
        >
          <Box>
            <Box display={"flex"} flexDirection={"column"} gap={4} p={2}>
              <Stack>
                <Stack direction={"column"}>
                  <Typography
                    color="primary"
                    variant="h6"
                  >
                    🎉 Página da Turma - <b>{turma[0]?.nome} </b>
                  </Typography>
                  <Typography
                    color="textSecondary"
                    variant="caption"
                  >
                    acompanhe os últimos tópicos da turma, eventos e novidades
                  </Typography>
                  <Button
                    color="secondary"
                    variant="text"
                    size="small"
                    onClick={() => navigate(`/turmas/view/${id}/pagina-turma`)}
                    sx={{ borderRadius: 2, height: 32 }}
                  >
                    Acessar Página da Turma
                  </Button>
                </Stack>
              </Stack>
              <Stack direction={"row"} justifyContent={"space-between"}>
                <Stack direction={"column"}>
                  <Typography
                    color="primary"
                    variant="body1"
                    fontWeight={600}
                  >
                    Lista de Alunos
                  </Typography>
                  <Typography
                    color="textSecondary"
                    variant="caption"
                  >
                    veja a lista com todos os alunos cadastrados nesta turma.
                  </Typography>
                </Stack>
                <Typography
                  color="secondary"
                  sx={{ fontSize: 12 }}
                >
                  Total de Alunos: <b>{alunos?.length}</b>
                </Typography>
              </Stack>
              {loadingAlunos ? (
                <LoadingTable />
              ) : alunos.length > 0 ? (
                <BasicTable
                  columns={alunosColumns}
                  rows={alunos}
                  loading={loadingAlunos}
                  dataRow={dataRow}
                  page={1}
                  totalPages={1}
                  handleChangePagination={() => {}}
                />
              ) : (
                <NoTableData
                  pronoum={"he"}
                  pageName="aluno"
                  disabledButton={false}
                  onClickAction={() => navigate("/alunos/edit")}
                />
              )}
            </Box>
          </Box>
        </Paper>
      </Stack>
      <LoadingBackdrop
        open={openLoadingBackdrop}
        handleClose={() => setOpenLoadingBackdrop(false)}
      />
    </Stack>
  );
};

export default TurmasPageView;
