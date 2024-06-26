import React, {useEffect, useState} from 'react';
import {Autocomplete, Button, Grid, Paper, TableCell, TextField,} from "@mui/material";
import {getActivityTypesByProjectId, getContructorsOfProject, getToolCMPReport, getToolsOfProject} from "api/api";
import 'date-fns';
import {TableProIpa} from "components";
import {useParams} from 'react-router-dom'
import {ColumnPro} from "../../../../components/table-pro/table-pro.component";
import {sortDates, sortNumbers, sortStrings} from "../../../../utils/sort.utils";
import moment from "jalali-moment";
import {workingStatus} from "../../../../utils/working-status.utils";


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
    id: 'toolsName',
    label: 'نام دستگاه',
    align: 'left',
    minWidth: 60,
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
    id: 'workingStatus',
    label: 'وضعیت کار',
    align: 'center',
    minWidth: 20,
    state: 0,
    numeric: true,
    show: true,
    sort: sortNumbers,
    format: (value: number) => workingStatus[value]
  },
  {
    id: 'servingLocation',
    label: 'محل خدمت',
    align: 'left',
    minWidth: 50,
    state: 0,
    numeric: false,
    show: true,
    sort: sortStrings,
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
    id: 'contructorName',
    label: 'طرف حساب',
    align: 'left',
    minWidth: 40,
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
    format: value => value.toLocaleString("fa-IR")
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


function ToolCMPPage({startDate, endDate}: any) {
  const [rows, setRows] = useState<any>([])
  const [filteredRows, setFilteredRows] = useState<any>([])
  const [contructors, setContructors] = useState<any>([])
  const [acvTypes, setAcvTypes] = useState<any>([])
  const [tools, setTools] = useState<any>([])
  const [selectContructors, setSelectContructors] = useState<any>([])
  const [selectAcvTypes, setSelectAcvTypes] = useState<any>([])
  const [selectTools, setSelectTools] = useState<any>([])


  const handleFilterRows = () => {
    if (selectContructors.length > 0 || selectAcvTypes.length > 0 || selectTools.length > 0)
      return rows.filter((row: any) => {
        if (selectTools.includes(row.toolsNameId) || selectContructors.includes(row.contructorId) || selectAcvTypes.includes(row.activityTypeId))
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
  }, [selectContructors, selectAcvTypes, selectTools])

  const {projectId} = useParams()


  const getAllNeedData = async () => {
    const res = await getToolCMPReport(projectId,
        moment(startDate).locale('fa').format('YYYY/MM/DD'),
        moment(endDate).locale('fa').format('YYYY/MM/DD'))
    const resTools = await getToolsOfProject(projectId)
    const resTypes = await getActivityTypesByProjectId(projectId)
    const resContructors = await getContructorsOfProject(projectId)

    if (!(res instanceof Error) && !(resTypes instanceof Error) && !(resTools instanceof Error) && !(resContructors instanceof Error)) {
      setRows(res)
      setFilteredRows(res)
      setTools(resTools)
      setAcvTypes(resTypes)
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
              options={tools}
              getOptionLabel={(option: any) => option.toolsName}
              onChange={(e, v) => setSelectTools(v.map((item: any) => item.toolsNameId))}
              renderInput={(params) => (
                  <TextField
                      {...params}
                      variant="filled"
                      label="ابزار و ماشین آلات"
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
                      label="نوع فعالیت"
                  />
              )}
          />
        </Grid>
        <Grid item xs={12}>
          <Autocomplete
              multiple
              options={contructors}
              getOptionLabel={(option: any) => option.contructorName}
              onChange={(e, v) => setSelectContructors(v.map((item: any) => item.contructorNameId))}
              renderInput={(params) => (
                  <TextField
                      {...params}
                      variant="filled"
                      label="طرف حساب"
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
                           if (head === 'workingStatus') {
                             return (
                                 <TableCell key={column.id} align={column.align}>
                                   <Button variant={'text'}
                                           color={value === 1 ? 'success' : 'warning'}>
                                     {workingStatus[value]}
                                   </Button>
                                 </TableCell>
                             )
                           }
                           return (
                               <TableCell key={column.id} align={column.align}>
                                 {column.format && value ? column.format(value) : value}
                               </TableCell>
                           )
                         }}
                         summableColumns={["wage", "amount"]}
                         rows={filteredRows}/>
          </Paper>
        </Grid>
      </Grid>
  );
}

export {ToolCMPPage}