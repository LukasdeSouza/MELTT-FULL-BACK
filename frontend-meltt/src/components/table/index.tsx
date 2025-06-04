import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Box, CircularProgress, Pagination, Stack } from "@mui/material";
import { TableColumnsType } from "../../types";
import { ReactNode } from "react";

type BasicTableProps = {
  page: number;
  totalPages: number;
  columns: TableColumnsType[];
  rows: any[];
  dataRow: (row: any) => ReactNode;
  loading: boolean;
  handleChangePagination: (event: React.ChangeEvent<unknown>, value: number) => void;
};


export default function BasicTable({
  page,
  totalPages,
  columns,
  rows,
  dataRow,
  loading,
  handleChangePagination
}: BasicTableProps) {
  return (
    <Box sx={{
      height: "calc(80vh - 20px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      borderRadius: "10px",
      boxShadow: 3,
      bgcolor: 'background.paper',
    }}>
      <TableContainer
        sx={{
          width: "100%",
          maxHeight: "70vh",
          overflow: "auto",
          borderRadius: "10px",
          '&::-webkit-scrollbar': { width: 8 },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'primary.main',
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-track': { backgroundColor: 'grey.100' },
        }}>
        <Table stickyHeader sx={{
          width: "100%",
          borderCollapse: 'separate',
          borderSpacing: '0 8px',
        }}>
          <TableHead>
            <TableRow sx={{
              '& th': {
                bgcolor: 'primary.main',
                color: 'common.white',
                fontFamily: 'Poppins',
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                border: 0,
                py: 1.5,
                '&:first-of-type': { borderTopLeftRadius: 10 },
                '&:last-child': { borderTopRightRadius: 10 }
              }
            }}>
              {columns.map((column, index) => (
                <TableCell
                  key={column.key}
                  align={index === columns.length - 1 ? 'center' : 'left'}
                  sx={{ minWidth: 120, whiteSpace: 'nowrap' }}
                  >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody sx={{
            '& tr': {
              transition: 'background-color 0.2s',
              '&:hover': { bgcolor: 'action.hover' },
              '&:not(:last-child)': { borderBottom: '8px solid', borderColor: 'background.paper' }
            },
            '& td': {
              py: 2,
              border: 0,
              fontFamily: 'Roboto',
              fontWeight: 400,
              color: 'text.primary',
              bgcolor: 'grey.50',
              '&:first-of-type': { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
              '&:last-child': { borderTopRightRadius: 8, borderBottomRightRadius: 8 }
            }
          }}>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ height: '60vh', bgcolor: 'background.paper' }}>
                  <Stack height="100%" alignItems="center" justifyContent="center">
                    <CircularProgress color="primary" size={40} />
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              rows?.map((row) => dataRow(row))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination
        count={totalPages}
        page={page}
        onChange={handleChangePagination}
        sx={{
          my: 2,
          '& .MuiPaginationItem-root': {
            color: 'primary.main',
            '&.Mui-selected': {
              color: 'common.white',
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' }
            }
          }
        }}
      />
    </Box>
  );
}
