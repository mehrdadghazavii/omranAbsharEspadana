import React, {useEffect, useState} from 'react';
import {Grid, Paper, TableCell,} from "@mui/material";
import {getImageCMPReport} from "api/api";
import {toast} from "react-toastify";
import 'date-fns';
import {ModalIpa, TableProIpa} from "components";
import {useParams} from 'react-router-dom'
import {ColumnPro} from "../../../../components/table-pro/table-pro.component";
import {sortDates, sortStrings} from "../../../../utils/sort.utils";
import moment from "jalali-moment";
import {BASE_URL} from "../../../../configs/configs";
import { useDispatch } from 'react-redux';
import { setConfirmToggleDetails, setToggleDetails } from 'redux/actions/actions';


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
    id: 'picturePath',
    label: 'تصویر',
    align: 'left',
    minWidth: 130,
    state: 0,
    numeric: false,
    show: true,
  },
  {
    id: 'caption',
    label: 'توضیح',
    align: 'left',
    minWidth: 120,
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


function ImageCMPPage({startDate, endDate}: any) {
  const [rows, setRows] = useState<any>([])
  const dispatch = useDispatch();
  const [picturePathLocal, setPicturePathLocal] = useState<any>("");
  const [preview, setPreview] = useState<any>(null);

  useEffect(() => {
    getAllNeedData()
  }, [startDate, endDate])


  const {projectId} = useParams()


  const getAllNeedData = async () => {
    const res = await getImageCMPReport(projectId,
        moment(startDate).locale('fa').format('YYYY/MM/DD'),
        moment(endDate).locale('fa').format('YYYY/MM/DD'))


    if (!(res instanceof Error)) {
      setRows(res)

    } else {
      setRows([])
    }

  }




  rows?.map((item:any) =>{
    if(item.picturePath){
      item.picturePath = item?.picturePath?.replace("~", BASE_URL)
    }
  })  


  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} style={{width: 10}}>
          <Paper>
            <TableProIpa columns={columns}
                         bodyFunc={(column, row: any, index) => {
                           const head = column.id
                           const value = row[column.id];
                           if (head === 'picturePath') {
                             return (
                                 <TableCell key={column.id} align={column.align} sx={{width:"12%"}}> 
                                   <img 
                                   onClick={() => {
                                    setPreview(value)
                                    dispatch(setToggleDetails(false))
                                    setPicturePathLocal(row?.picturePath);
                                }}
                                onMouseOut={() => {
                                    dispatch(setConfirmToggleDetails(false))
                                    dispatch(setToggleDetails(true))
                                }}
                                   src={value?.replace('~', BASE_URL)} width={column.minWidth} alt={row.pictureName}
                                   style={{
                                    cursor: "pointer",
                                    width: "100%",
                                   }}
                                   />
                                 </TableCell>
                             )
                           }
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
        {preview ? (
          <ModalIpa
              open={Boolean(preview)}
              title={"نمایش عکس"}
              onClose={() => {
                  setPreview(null);
                  // dispatch(setToggleDetails(null))
              }}>
              <Grid container spacing={2}>
                  <Grid item xs={12}>
                      <img src={picturePathLocal ? picturePathLocal : ""}  style={{ objectFit: "contain" , height:"100%",maxHeight:"80vh" , width:"100%" }} />
                  </Grid>
              </Grid>
          </ModalIpa>
      ) : null}
      </>
  );
}

export {ImageCMPPage}