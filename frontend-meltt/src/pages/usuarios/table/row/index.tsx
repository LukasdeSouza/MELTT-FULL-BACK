import { Avatar, Stack, TableCell, TableRow } from "@mui/material";
import { EnumStudentBasicEducation } from "../../../../utils/enums";

interface RowData {
  name: string;
  nome: string;
  escola: string;
  educacao_basica: keyof typeof EnumStudentBasicEducation;
  turma: string;
}

interface TableRowAlunosProps {
  row: RowData;
  onClickRow: (row: RowData) => void;
}

const TableRowAlunos: React.FC<TableRowAlunosProps> = ({ row, onClickRow }) => {
  return (
    <TableRow
      key={row.name}
      onClick={() => onClickRow(row)}
      sx={{
        "&:last-child td, &:last-child th": { border: 0 },
        " &:hover": { bgcolor: "#F7F7F7", cursor: "pointer" },
      }}
    >
      <TableCell component="th" scope="row">
        <Stack direction={"row"} alignItems={"center"} gap={1}>
          <Avatar />
          {row.nome}
        </Stack>
      </TableCell>
      <TableCell align="left">{row.escola}</TableCell>
      <TableCell align="left">
        {EnumStudentBasicEducation[row.educacao_basica]}
      </TableCell>
      <TableCell align="left">{row.turma}</TableCell>
    </TableRow>
  );
};

export default TableRowAlunos;
