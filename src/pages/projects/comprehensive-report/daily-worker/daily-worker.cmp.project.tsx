import React, {useEffect, useState} from 'react';
import {Autocomplete, Grid, Paper, TableCell, TextField,} from "@mui/material";
import {getDailyWorkerCMPReport, getWorkersOfProject} from "api/api";
import 'date-fns';
import {TableProIpa} from "components";
import {useParams} from 'react-router-dom'
import {ColumnPro} from "../../../../components/table-pro/table-pro.component";
import {sortDates, sortNumbers, sortStrings} from "../../../../utils/sort.utils";
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
    id: 'dailyWorkerName',
    label: 'عوامل اجرایی رزومزد',
    align: 'left',
    minWidth: 70,
    state: 0,
    numeric: false,
    show: true,
    sort: sortStrings,
  },
  {
    id: 'enterTime',
    label: 'زمان ورود',
    align: 'center',
    minWidth: 20,
    state: 0,
    numeric: false,
    show: true,
    sort: sortDates,
    format: (value: string) => moment(value).format('HH:mm')
  },
  {
    id: 'exitTime',
    label: 'زمان خروج',
    align: 'center',
    minWidth: 20,
    state: 0,
    numeric: false,
    show: true,
    sort: sortDates,
    format: (value: string) => moment(value).format('HH:mm')
  },
  {
    id: 'servingLocation',
    label: 'محل انجام فعالیت',
    align: 'left',
    minWidth: 60,
    state: 0,
    numeric: false,
    show: true,
    sort: sortStrings,
  },
  {
    id: 'wage',
    label: 'دستمزد',
    align: 'center',
    minWidth: 40,
    state: 0,
    numeric: true,
    show: true,
    sort: sortNumbers,
    format: value => value.toLocaleString("fa-Ir")
  },
  {
    id: 'activityCode',
    label: 'کد فعالیت',
    align: 'center',
    minWidth: 30,
    state: 0,
    numeric: true,
    show: true,
    sort: sortNumbers,
  },
  {
    id: 'activityType',
    label: 'نوع فعالیت',
    align: 'left',
    minWidth: 40,
    state: 0,
    numeric: false,
    show: true,
    sort: sortStrings,
  },
  {
    id: 'description',
    label: 'توضیحات',
    align: 'left',
    minWidth: 60,
    state: 0,
    numeric: false,
    show: true,
    sort: sortStrings,
  },
  {
    id: 'reportDate',
    label: 'تاریخ گزارش',
    align: 'center',
    minWidth: 30,
    state: 0,
    numeric: false,
    show: true,
    sort: sortDates,
    format: (value: string) => new Date(value).toLocaleDateString('fa-IR')
  },
];


function DailyWorkerCMPPage({startDate, endDate}: any) {
  const [rows, setRows] = useState<any>([])
  const [filteredRows, setFilteredRows] = useState<any>([])
  const [workers, setWorkers] = useState<any>([])
  const [selectWorkers, setSelectWorkers] = useState<any>([])


  const handleFilterRows = () => {
    if (selectWorkers.length > 0)
      return rows.filter((row: any) => {
        if (selectWorkers.includes(row.dailyWorkerNameId))
          return true
        return false
      })
    return [...rows]
  }

  useEffect(() => {
    getAllNeedData()
  }, [startDate, endDate])

  useEffect(() => {
    setFilteredRows(handleFilterRows())
  }, [selectWorkers])

  const {projectId} = useParams()


  const getAllNeedData = async () => {
    const res = await getDailyWorkerCMPReport(projectId,
        moment(startDate).locale('fa').format('YYYY/MM/DD'),
        moment(endDate).locale('fa').format('YYYY/MM/DD'))
    const resWorkers = await getWorkersOfProject(projectId)


    if (!(res instanceof Error) && !(resWorkers instanceof Error)) {
      setRows(res)
      setFilteredRows(res)
      setWorkers(resWorkers)

    } else {
      setRows([])
      setFilteredRows([])
    }

  }


  return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Autocomplete
              multiple
              options={workers}
              getOptionLabel={(option: any) => option.dailyWorkerName}
              onChange={(e, v) => setSelectWorkers(v.map((item: any) => item.dailyWorkerNameId))}
              renderInput={(params) => (
                  <TextField
                      {...params}
                      variant="filled"
                      label="عوامل اجرایی"
                  />
              )}
          />
        </Grid>
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
                         summableColumns={["wage"]}
                         rows={filteredRows}/>
          </Paper>
        </Grid>
      </Grid>
  );
}

export {DailyWorkerCMPPage}