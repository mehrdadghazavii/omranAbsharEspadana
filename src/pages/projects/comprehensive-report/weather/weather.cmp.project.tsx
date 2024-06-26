import React, {useEffect, useState} from 'react';
import {Grid, Paper, TableCell} from "@mui/material";
import {getWeatherCMPReport} from "api/api";
import 'date-fns';
import {TableProIpa} from "components";
import {useParams} from 'react-router-dom'
import {ColumnPro} from "../../../../components/table-pro/table-pro.component";
import {sortDates, sortNumbers, sortStrings} from "../../../../utils/sort.utils";
import {atmospheres, climates} from "../../../../utils/weather.utils";
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
    id: 'climate',
    label: 'وضعیت آب و هوا',
    align: 'left',
    minWidth: 60,
    state: 0,
    numeric: true,
    show: true,
    sort: sortNumbers,
    format: (value: number) => climates[value]
  },
  {
    id: 'atmosphere',
    label: 'وضعیت جوی',
    align: 'left',
    minWidth: 60,
    state: 0,
    numeric: true,
    show: true,
    sort: sortNumbers,
    format: (value: number) => atmospheres[value]
  },
  {
    id: 'minDegree',
    label: 'کمترین درجه',
    align: 'center',
    minWidth: 30,
    state: 0,
    numeric: true,
    show: true,
    sort: sortNumbers,
  },
  {
    id: 'maxDegree',
    label: 'بیشترین درجه',
    align: 'center',
    minWidth: 30,
    state: 0,
    numeric: true,
    show: true,
    sort: sortNumbers,
  },
  {
    id: 'description',
    label: 'توضیحات',
    align: 'left',
    minWidth: 100,
    state: 0,
    numeric: false,
    show: true,
    sort: sortStrings,
  },
  {
    id: 'date',
    label: 'تاریخ گزارش',
    align: 'center',
    minWidth: 30,
    state: 0,
    numeric: true,
    show: true,
    sort: sortDates,
    format: (value:string)=> new Date(value).toLocaleDateString('fa-IR')
  },
];


function WeatherCMPPage({startDate, endDate}: any) {
  const [rows, setRows] = useState<any>([])

  useEffect(() => {
    getAllNeedData()
  }, [startDate, endDate])

  const {projectId} = useParams()


  const getAllNeedData = async () => {
    const res = await getWeatherCMPReport(projectId,
        moment(startDate).locale('fa').format('YYYY/MM/DD'),
        moment(endDate).locale('fa').format('YYYY/MM/DD'))

    if( !(res instanceof Error)){
      setRows(res)
    }else{
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

export {WeatherCMPPage}