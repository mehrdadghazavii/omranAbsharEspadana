import React, {useEffect, useState} from 'react';
import {Grid, Paper, TableCell,} from "@mui/material";
import {getConstructorSummaryReport} from "api/api";
import {TableProIpa} from "components";
import {useParams} from 'react-router-dom'
import {ColumnPro} from "../../../../components/table-pro/table-pro.component";
import {sortNumbers, sortStrings} from "../../../../utils/sort.utils";


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
    id: 'name',
    label: 'نام',
    align: 'left',
    minWidth: 80,
    state: 0,
    numeric: false,
    show: true,
    sort: sortStrings,
  },
  {
    id: 'activityType',
    label: 'نوع فعالیت',
    align: 'left',
    minWidth: 60,
    state: 0,
    numeric: false,
    show: true,
    sort: sortStrings,
  },
  {
    id: 'amount',
    label: 'اندازه',
    align: 'center',
    minWidth: 30,
    state: 0,
    numeric: true,
    show: true,
    sort: sortNumbers,
  },
  {
    id: 'unit',
    label: 'واحد',
    align: 'left',
    minWidth: 30,
    state: 0,
    numeric: false,
    show: true,
    sort: sortStrings,
  },
  {
    id: 'technicalWorker',
    label: 'کارگر فنی',
    align: 'center',
    minWidth: 30,
    state: 0,
    numeric: true,
    show: true,
    sort: sortNumbers,
  },
  {
    id: 'simpleWorker',
    label: 'کارگر ساده',
    align: 'center',
    minWidth: 30,
    state: 0,
    numeric: true,
    show: true,
    sort: sortNumbers,
  },
  {
    id: 'expert',
    label: 'کارشناس',
    align: 'center',
    minWidth: 30,
    state: 0,
    numeric: true,
    show: true,
    sort: sortNumbers,
  },
  {
    id: 'workMan',
    label: 'استاد کار',
    align: 'center',
    minWidth: 30,
    state: 0,
    numeric: true,
    show: true,
    sort: sortNumbers,
  },
];
const summableColumns: string[] = ["amount", "technicalWorker", "simpleWorker", "expert", "workMan"]


function ConstructorSummaryPage({startDate, endDate}: any) {
  const [rows, setRows] = useState<any>([])

  useEffect(() => {
    getAllNeedData()
  }, [startDate, endDate])

  const {projectId} = useParams()


  const getAllNeedData = async () => {
    const res: any = await getConstructorSummaryReport(projectId, startDate, endDate)

    if (!(res instanceof Error)) {
      setRows(res[1])
    }

  }



  return (
      <Grid container>
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
                         summableColumns={summableColumns}
                         rows={rows}/>
          </Paper>
        </Grid>
      </Grid>
  );
}

export {ConstructorSummaryPage}