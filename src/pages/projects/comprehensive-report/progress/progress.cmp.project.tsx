import React, {useEffect, useState} from 'react';
import {Grid, Paper, TableCell,} from "@mui/material";
import {getProgressCMPReport} from "api/api";
import 'date-fns';
import {TableProIpa} from "components";
import {useParams} from 'react-router-dom'
import {ColumnPro} from "../../../../components/table-pro/table-pro.component";
import {sortDates, sortNumbers} from "../../../../utils/sort.utils";
import moment from "jalali-moment";


const columns: ColumnPro[] = [
  {
    id: 'counter',
    label: '#',
    align: 'center',
    minWidth: 15,
    state: 0,
    numeric: true,
    show: true,
  },
  {
    id: 'plan',
    label: 'برنامه',
    align: 'center',
    minWidth: 40,
    state: 0,
    numeric: true,
    show: true,
    sort: sortNumbers,
  },
  {
    id: 'actual',
    label: 'واقعی',
    align: 'center',
    minWidth: 40,
    state: 0,
    numeric: true,
    show: true,
    sort: sortNumbers,
  },
  {
    id: 'reportDate',
    label: 'تاریخ گزارش',
    align: 'center',
    minWidth: 30,
    state: 0,
    numeric: true,
    show: true,
    sort: sortDates,
    format: (value: string) => new Date(value).toLocaleDateString('fa-IR')
  },
];


function ProgressCMPPage({startDate, endDate}: any) {
  const [rows, setRows] = useState<any>([])


  useEffect(() => {
    getAllNeedData()
  }, [startDate, endDate])


  const {projectId} = useParams()


  const getAllNeedData = async () => {
    const res = await getProgressCMPReport(projectId,
        moment(startDate).locale('fa').format('YYYY/MM/DD'),
        moment(endDate).locale('fa').format('YYYY/MM/DD'))


    if (!(res instanceof Error)) {
      setRows(res)
    } else {
      setRows([])
    }

  }



  return (
      <Grid container spacing={2}>
        <Grid item xs={12} style={{width: 10}}>
          <Paper>
            <TableProIpa columns={columns}
                         bodyFunc={(column, row: any, index) => {
                           const head = column.id
                           const value = row[column.id];
                           return (
                               <TableCell key={column.id} align={column.align}>
                                 {column.format && value ? column.format(value) : value}
                               </TableCell>
                           )
                         }}
                         rows={rows}/>
          </Paper>
        </Grid>
      </Grid>
  );
}

export {ProgressCMPPage}