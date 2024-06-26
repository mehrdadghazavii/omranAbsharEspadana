import React, {useEffect, useState} from 'react';
import {Grid, Paper, TableCell,} from "@mui/material";
import {getWeatherSummaryReport} from "api/api";
import 'date-fns';
import {TableProIpa} from "components";
import {useParams} from 'react-router-dom'
import {ColumnPro} from "../../../../components/table-pro/table-pro.component";
import {sortNumbers} from "../../../../utils/sort.utils";


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
    id: 'sunny',
    label: 'آفتابی',
    align: 'center',
    minWidth: 60,
    state: 0,
    numeric: true,
    show: true,
    sort: sortNumbers,
  },
  {
    id: 'partlyCloudy',
    label: 'نیمه ابری',
    align: 'center',
    minWidth: 60,
    state: 0,
    numeric: true,
    show: true,
    sort: sortNumbers,
  },
  {
    id: 'cloudy',
    label: 'ابری',
    align: 'center',
    minWidth: 60,
    state: 0,
    numeric: true,
    show: true,
    sort: sortNumbers,
  },
  {
    id: 'rainy',
    label: 'بارانی',
    align: 'center',
    minWidth: 60,
    state: 0,
    numeric: true,
    show: true,
    sort: sortNumbers,
  },
  {
    id: 'snowy',
    label: 'برفی',
    align: 'center',
    minWidth: 60,
    state: 0,
    numeric: true,
    show: true,
    sort: sortNumbers,
  },
];


function WeatherSummaryPage({startDate, endDate}: any) {
  const [rows, setRows] = useState<any>([])

  useEffect(() => {
    getAllNeedData()
  }, [startDate, endDate])

  const {projectId} = useParams()


  const getAllNeedData = async () => {
    const res: any = await getWeatherSummaryReport(projectId, startDate, endDate)

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
                         rows={rows}/>
          </Paper>
        </Grid>
      </Grid>
  );
}

export {WeatherSummaryPage}