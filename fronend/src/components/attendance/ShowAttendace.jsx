import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useSelector } from 'react-redux';

export default function ShowAttendance({ dates, presentDates }) {
  const userData = useSelector((state) => state.auth.userData);

  // Extract the dates from the presentDates array
  const presDates = presentDates.map((item) => item.Date);

  // Styled components for table cells and rows
  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

  // Dynamically create data for attendance table
  const createData = (date) => {
    return { date };
  };

  // Map through dates to create rows dynamically
  const rows = dates.map((date) => createData(date));

  return (
    <div className="overflow-x-auto">
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Date (Lectures Conducted)</StyledTableCell>
              <StyledTableCell align="right">Present</StyledTableCell>
              <StyledTableCell align="right">Absent&nbsp;</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <StyledTableRow key={row.date}>
                <StyledTableCell component="th" scope="row">
                  {row.date}
                </StyledTableCell>

                {/* Check if the row.date is in the presDates array */}
                <StyledTableCell align="right">
                  {presDates.includes(row.date) ? 'Present' : '-'}
                </StyledTableCell>

                <StyledTableCell align="right">
                  {!presDates.includes(row.date) ? 'Absent' : '-'}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
