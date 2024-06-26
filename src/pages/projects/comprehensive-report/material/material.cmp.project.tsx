import { Autocomplete, Button, Grid, Paper, TableCell, TextField } from "@mui/material";
import { getContructorsOfProject, getMaterialCMPReport, getMaterialsOfProject } from "api/api";
import { ModalIpa, TableProIpa } from "components";
import "date-fns";
import moment from "jalali-moment";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { setConfirmToggleDetails, setToggleDetails } from "redux/actions/actions";
import { ColumnPro } from "../../../../components/table-pro/table-pro.component";
import { sortDates, sortNumbers, sortStrings } from "../../../../utils/sort.utils";

const columns: ColumnPro[] = [
  {
    id: "counter",
    label: "#",
    align: "center",
    minWidth: 15,
    state: 0,
    numeric: true,
    show: true,
  },
  {
    id: "pictureUrl",
    label: "تصویر",
    align: "left",
    minWidth: 30,
    state: 0,
    numeric: false,
    show: true,
  },
  {
    id: "pdfUrl",
    label: "PDF",
    align: "center",
    minWidth: 30,
    state: 0,
    numeric: false,
    show: true,
  },
  {
    id: "materialsName",
    label: "نام مصالح",
    align: "left",
    minWidth: 60,
    state: 0,
    numeric: false,
    show: true,
    sort: sortStrings,
  },
  {
    id: "contructorName",
    label: "طرح حساب",
    align: "left",
    minWidth: 40,
    state: 0,
    numeric: false,
    show: true,
    sort: sortStrings,
  },
  {
    id: "wage",
    label: "دستمزد",
    align: "center",
    minWidth: 40,
    state: 0,
    numeric: true,
    show: true,
    sort: sortNumbers,
    format: value => value.toLocaleString("fa-Ir")
  },
  {
    id: "activityCode",
    label: "کد فعالیت",
    align: "center",
    minWidth: 30,
    state: 0,
    numeric: true,
    show: true,
    sort: sortNumbers,
  },
  {
    id: "description",
    label: "توضیحات",
    align: "left",
    minWidth: 60,
    state: 0,
    numeric: false,
    show: true,
    sort: sortStrings,
  },
  {
    id: "exitAndEnter",
    label: "ورود و خروج",
    align: "left",
    minWidth: 30,
    state: 0,
    numeric: true,
    show: true,
    sort: sortNumbers,
    // format: (value: boolean) => value ? "ورود" : ""
  },
  {
    id: "unit",
    label: "واحد",
    align: "left",
    minWidth: 30,
    state: 0,
    numeric: false,
    show: true,
    sort: sortStrings,
  },
  {
    id: "amount",
    label: "اندازه",
    align: "left",
    minWidth: 30,
    state: 0,
    numeric: false,
    show: true,
    sort: sortStrings,
  },
  {
    id: "reportDate",
    label: "تاریخ ثبت",
    align: "center",
    minWidth: 30,
    state: 0,
    numeric: true,
    show: true,
    sort: sortDates,
    format: (value: string) => new Date(value).toLocaleDateString("fa-IR"),
  },
];

function MaterialCMPPage({ startDate, endDate }: any) {
  const [rows, setRows] = useState<any>([]);
  const [filteredRows, setFilteredRows] = useState<any>([]);
  const [contructors, setContructors] = useState<any>([]);
  const [materials, setMaterials] = useState<any>([]);
  const [selectContructors, setSelectContructors] = useState<any>([]);
  const [selectMaterials, setSelectMaterials] = useState<any>([]);
  const [picturePathLocal, setPicturePathLocal] = useState<any>("");
  const [preview, setPreview] = useState<any>(null);
  const dispatch = useDispatch();

  const handleFilterRows = () => {
    if (selectContructors.length > 0 || selectMaterials.length > 0)
      return rows.filter((row: any) => {
        if (selectMaterials.includes(row.materialsNameId) || selectContructors.includes(row.contructorId)) return true;
        return false;
      });
    return [...rows];
  };

  useEffect(() => {
    getAllNeedData();
  }, [startDate, endDate]);

  useEffect(() => {
    setFilteredRows(handleFilterRows());
  }, [selectContructors, selectMaterials]);

  const { projectId } = useParams();

  const getAllNeedData = async () => {
    const res = await getMaterialCMPReport(
      projectId,
      moment(startDate).locale("fa").format("YYYY/MM/DD"),
      moment(endDate).locale("fa").format("YYYY/MM/DD")
    );
    const resMaterials = await getMaterialsOfProject(projectId);
    const resContructors = await getContructorsOfProject(projectId);

    if (!(res instanceof Error) && !(resMaterials instanceof Error) && !(resContructors instanceof Error)) {
      setRows(res);
      setFilteredRows(res);
      setMaterials(resMaterials);
      setContructors(resContructors);
    } else {
      setRows([]);
      setFilteredRows([]);
    }
  };

  filteredRows?.forEach((item: any) => {
    if (item.exitAndEnter === false) {
      item.exitAndEnter = "خروج";
    } else if (item.exitAndEnter === true) {
      item.exitAndEnter = "ورود";
    }
  });

  rows?.map((item: any) => {
    if (item?.pictureUrl) {
      if (item?.pictureUrl?.includes("r//")) {
        item.pictureUrl = item?.pictureUrl?.replace("r//", "r/");
      }
    }
  });

  return (
    <>
      <Grid container spacing={2}>
        <Grid item md={6} xs={12}>
          <Autocomplete
            multiple
            options={materials}
            getOptionLabel={(option: any) => option.materialsName}
            onChange={(e, v) => setSelectMaterials(v.map((item: any) => item.materialsNameId))}
            renderInput={(params) => <TextField {...params} variant="filled" label="نام مصالح" />}
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <Autocomplete
            multiple
            options={contructors}
            getOptionLabel={(option: any) => option.contructorName}
            onChange={(e, v) => setSelectContructors(v.map((item: any) => item.contructorNameId))}
            renderInput={(params) => <TextField {...params} variant="filled" label="طرف حساب" />}
          />
        </Grid>
        <Grid item xs={12} style={{ width: 10 }}>
          <Paper>
            <TableProIpa
              columns={columns}
              bodyFunc={(column, row: any, index) => {
                const head = column.id;
                const value = row[column.id];
                if (head === "pictureUrl") {
                  return (
                    <TableCell key={column.id} align={column.align} sx={{ width: "12%" }}>
                      <img
                        onClick={() => {
                          setPreview(value);
                          dispatch(setToggleDetails(false));
                          setPicturePathLocal(row?.pictureUrl);
                        }}
                        onMouseOut={() => {
                          dispatch(setConfirmToggleDetails(false));
                          dispatch(setToggleDetails(true));
                        }}
                        src={value}
                        width={column.minWidth}
                        alt={row.pictureName}
                        style={{
                          cursor: "pointer",
                          width: "100%",
                        }}
                      />
                    </TableCell>
                  );
                } else if (head === 'pdfUrl') {
                  return (
                    <TableCell key={column.id} align={column.align}>
                      {value ? (
                        <Button
                          onMouseEnter={() => dispatch(setToggleDetails(false))}
                          onMouseLeave={() => dispatch(setToggleDetails(true))}
                        >
                          <a href={value} target='_blank' style={{color: '#45a294', fontWeight: 450}}>نمایش PDF</a>
                        </Button>
                      ) : '__'}
                    </TableCell>
                  )
                }
                // } else if (head === "exitAndEnter") {
                //   return (
                //     <TableCell key={column.id} align={column.align}>
                //         <Typography variant="body2">{value ? "ورود" : "خروج"}</Typography>
                //     </TableCell>
                //   )
                // }
                return (
                  <TableCell key={column.id} align={column.align}>
                    {column.format && value ? column.format(value) : value}
                  </TableCell>
                );
              }}
              summableColumns={["wage", "amount"]}
              rows={filteredRows}
            />
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
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <img
                src={picturePathLocal ? picturePathLocal : ""}
                style={{ objectFit: "contain", height: "100%", maxHeight: "80vh", width: "100%" }}
              />
            </Grid>
          </Grid>
        </ModalIpa>
      ) : null}
    </>
  );
}

export { MaterialCMPPage };
