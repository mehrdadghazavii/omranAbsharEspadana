import React, {useEffect, useState} from 'react';
import {Autocomplete, Button, Grid, Paper, TableCell, TextField,} from "@mui/material";
import {getServingLocationsByProjectId, getStaffCMPReport, getStaffsOfProject} from "api/api";
import 'date-fns';
import {TableProIpa} from "components";
import {useParams} from 'react-router-dom'
import {ColumnPro} from "../../../../components/table-pro/table-pro.component";
import {sortDates, sortNumbers, sortStrings} from "../../../../utils/sort.utils";
import moment from "jalali-moment";
import {presentationStatus} from "../../../../utils/presentation-status.utils";


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
    id: 'staffName',
    label: 'نام نیروی انسانی',
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
    id: 'presentationStatus',
    label: 'وضعیت حضور',
    align: 'center',
    minWidth: 20,
    state: 0,
    numeric: true,
    show: true,
    sort: sortNumbers,
    format: (value: number) => presentationStatus[value]
  },
  {
    id: 'servingLocationName',
    label: 'محل خدمت',
    align: 'left',
    minWidth: 50,
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


function StaffCMPPage({startDate, endDate}: any) {
  const [rows, setRows] = useState<any>([])
  const [filteredRows, setFilteredRows] = useState<any>([])
  const [srvLocations, setSrvLocations] = useState<any>([])
  const [staffs, setStaffs] = useState<any>([])
  const [selectStaffs, setSelectStaffs] = useState<any>([])
  const [selectSrvLocations, setSelectSrvLocations] = useState<any>([])


  const handleFilterRows = () => {
    if (selectStaffs.length > 0 || selectSrvLocations.length > 0)
      return rows.filter((row: any) => {
        if (selectStaffs.includes(row.staffNameId) || selectSrvLocations.includes(row.servingLocationId))
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
  }, [selectStaffs, selectSrvLocations])

  const {projectId} = useParams()


  const getAllNeedData = async () => {
    const res = await getStaffCMPReport(projectId,
        moment(startDate).locale('fa').format('YYYY/MM/DD'),
        moment(endDate).locale('fa').format('YYYY/MM/DD'))
    const resStaff = await getStaffsOfProject(projectId)
    const resLocations = await getServingLocationsByProjectId(projectId)

    if (!(res instanceof Error) && !(resStaff instanceof Error) && !(resLocations instanceof Error)) {
      setRows(res)
      setFilteredRows(res)
      setSrvLocations(resLocations)
      setStaffs(resStaff)
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
              options={staffs}
              getOptionLabel={(option: any) => option.staffName}
              onChange={(e, v) => setSelectStaffs(v.map((item: any) => item.staffNameId))}
              renderInput={(params) => (
                  <TextField
                      {...params}
                      variant="filled"
                      label="نیروهای انسانی"
                  />
              )}
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <Autocomplete
              multiple
              options={srvLocations}
              getOptionLabel={(option: any) => option.name}
              onChange={(e, v) => setSelectSrvLocations(v.map((item: any) => item.id))}
              renderInput={(params) => (
                  <TextField
                      {...params}
                      variant="filled"
                      label="محل های خدمت"
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
                           if (head === 'presentationStatus') {
                             return (
                                 <TableCell key={column.id} align={column.align}>
                                   <Button variant={'text'}
                                           color={value === 1 ? 'success' : value === 2 ? 'error' : value === 3 ? 'info' : 'warning'}>
                                     {presentationStatus[value]}
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
                         summableColumns={["wage"]}
                         rows={filteredRows}/>
          </Paper>
        </Grid>
      </Grid>
  );
}

export {StaffCMPPage}