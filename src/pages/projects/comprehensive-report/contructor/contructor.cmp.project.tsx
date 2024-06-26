import React, {useEffect, useState} from 'react';
import {Autocomplete, Grid, Paper, TableCell, TextField,} from "@mui/material";
import {getActivityTypesByProjectId, getContructorCMPReport, getContructorsOfProject} from "api/api";
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
    id: 'contructorName',
    label: 'نام پیمانکار',
    align: 'left',
    minWidth: 60,
    state: 0,
    numeric: false,
    show: true,
    sort: sortStrings,
  },
  {
    id: 'expertQty',
    label: 'تعداد کارشناس',
    align: 'center',
    minWidth: 20,
    state: 0,
    numeric: true,
    show: true,
    sort: sortNumbers,
  },
  {
    id: 'workManQty',
    label: 'تعداد کارگر',
    align: 'center',
    minWidth: 20,
    state: 0,
    numeric: true,
    show: true,
    sort: sortNumbers,
  },
  {
    id: 'technicalWorkerQty',
    label: 'تعداد کارگر فنی',
    align: 'center',
    minWidth: 20,
    state: 0,
    numeric: true,
    show: true,
    sort: sortNumbers,
  },
  {
    id: 'simpleWorkerQty',
    label: 'تعداد کارگر ساده',
    align: 'center',
    minWidth: 20,
    state: 0,
    numeric: true,
    show: true,
    sort: sortNumbers,
  },
  {
    id: 'operationDescription',
    label: 'شرح فعالیت',
    align: 'left',
    minWidth: 60,
    state: 0,
    numeric: false,
    show: true,
    sort: sortStrings,
  },
  {
    id: 'location',
    label: 'محل',
    align: 'left',
    minWidth: 60,
    state: 0,
    numeric: false,
    show: true,
    sort: sortStrings,
  },
  {
    id: 'cost',
    label: 'هزینه',
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
    id: 'activityTypeName',
    label: 'نوع فعالیت',
    align: 'left',
    minWidth: 40,
    state: 0,
    numeric: false,
    show: true,
    sort: sortStrings,
  },
  {
    id: 'amount',
    label: 'مقدار',
    align: 'left',
    minWidth: 40,
    state: 0,
    numeric: false,
    show: true,
    sort: sortStrings,
  },
  {
    id: 'unit',
    label: 'واحد',
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
    numeric: true,
    show: true,
    sort: sortDates,
    format: (value: string) => new Date(value).toLocaleDateString('fa-IR')
  },
];

const summableColumns: string[] = ["expertQty", "workManQty", "technicalWorkerQty", "simpleWorkerQty", "cost", "amount"];


function ContructorCMPPage({startDate, endDate}: any) {
  const [rows, setRows] = useState<any>([])
  const [filteredRows, setFilteredRows] = useState<any>([])
  const [acvTypes, setActvTypes] = useState<any>([])
  const [contructors, setContructors] = useState<any>([])
  const [selectContructors, setSelectContructors] = useState<any>([])
  const [selectAcvTypes, setSelectAcvTypes] = useState<any>([])


  const handleFilterRows = () => {
    if (selectAcvTypes.length > 0 || selectContructors.length > 0)
      return rows.filter((row: any) => {
        if (selectAcvTypes.includes(row.activityTypeId) || selectContructors.includes(row.contructorNameId))
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
  }, [selectContructors, selectAcvTypes])

  const {projectId} = useParams()


  const getAllNeedData = async () => {
    const res = await getContructorCMPReport(projectId,
        moment(startDate).locale('fa').format('YYYY/MM/DD'),
        moment(endDate).locale('fa').format('YYYY/MM/DD'))
    const resContructors = await getContructorsOfProject(projectId)
    const resActvTypes = await getActivityTypesByProjectId(projectId)

    if (!(res instanceof Error) && !(resContructors instanceof Error) && !(resActvTypes instanceof Error)) {
      setRows(res)
      setFilteredRows(res)
      setActvTypes(resActvTypes)
      setContructors(resContructors)
    } else {
      setRows([])
      setFilteredRows([])
    }

  }


  return (
      <Grid container spacing={2}>
        <Grid item md={6} xs={12}>
          <Autocomplete
              multiple
              options={contructors}
              getOptionLabel={(option: any) => option.contructorName}
              onChange={(e, v) => setSelectContructors(v.map((item: any) => item.contructorNameId))}
              renderInput={(params) => (
                  <TextField
                      {...params}
                      variant="filled"
                      label="پیمانکارها"
                  />
              )}
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <Autocomplete
              multiple
              options={acvTypes}
              getOptionLabel={(option: any) => option.name}
              onChange={(e, v) => setSelectAcvTypes(v.map((item: any) => item.id))}
              renderInput={(params) => (
                  <TextField
                      {...params}
                      variant="filled"
                      label="فعالیت ها"
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
                         summableColumns={summableColumns}
                         rows={filteredRows}
            />
          </Paper>
        </Grid>
      </Grid>
  );
}

export {ContructorCMPPage}