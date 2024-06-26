import React, { useEffect, useState } from "react";
import { Autocomplete, Button, Grid, Paper, TableCell, TextField } from "@mui/material";
import {
  getCostTypes,
  getCountersPartiesOfProject,
  getFinanceCMPReport,
} from "api/api";
import "date-fns";
import { ModalIpa, TableProIpa } from "components";
import { useParams } from "react-router-dom";
import { ColumnPro } from "../../../../components/table-pro/table-pro.component";
import { sortDates, sortNumbers, sortStrings } from "../../../../utils/sort.utils";
import moment from "jalali-moment";
import { setConfirmToggleDetails, setToggleDetails } from "redux/actions/actions";
import { useDispatch } from "react-redux";

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
    id: "projectsFinanceInfoesStatement",
    label: "نوع",
    align: "left",
    minWidth: 80,
    state: 0,
    numeric: false,
    show: true,
    sort: sortStrings,
  },
  {
    id: "counterPartyName",
    label: "طرح حساب",
    align: "left",
    minWidth: 40,
    state: 0,
    numeric: false,
    show: true,
    sort: sortStrings,
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
    id: "cost",
    label: "هزینه",
    align: "center",
    minWidth: 40,
    state: 0,
    numeric: true,
    show: true,
    sort: sortNumbers,
    format: value => value.toLocaleString("fa-Ir")
  },
  {
    id: "costTypeName",
    label: "نوع هزینه",
    align: "left",
    minWidth: 40,
    state: 0,
    numeric: false,
    show: true,
    sort: sortStrings,
  },
  {
    id: "startDate",
    label: "تاریخ شروع",
    align: "center",
    minWidth: 30,
    state: 0,
    numeric: true,
    show: true,
    sort: sortDates,
    format: (value: string) => new Date(value).toLocaleDateString("fa-IR"),
  },
  {
    id: "endDate",
    label: "تاریخ پایان",
    align: "center",
    minWidth: 30,
    state: 0,
    numeric: true,
    show: true,
    sort: sortDates,
    format: (value: string) => new Date(value).toLocaleDateString("fa-IR"),
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
    id: "reportDate",
    label: "تاریخ گزارش",
    align: "center",
    minWidth: 30,
    state: 0,
    numeric: true,
    show: true,
    sort: sortDates,
    format: (value: string) => new Date(value).toLocaleDateString("fa-IR"),
  },
];

function FinancesInfoesPaymentCMPPage({ startDate, endDate }: any) {
  const [rows, setRows] = useState<any>([]);
  const [filteredRows, setFilteredRows] = useState<any>([]);
  const [cntParties, setCntParties] = useState<any>([]);
  const [costTypes, setCostTypes] = useState<any>([]);
  const [selectCntParties, setSelectCntParties] = useState<any>([]);
  const [selectPayers, setSelectPayers] = useState<any>([]);
  const [selectCostTypes, setSelectCostTypes] = useState<any>([]);
  const [picturePathLocal, setPicturePathLocal] = useState<any>("");
  const [preview, setPreview] = useState<any>(null);
  const dispatch = useDispatch();

  const handleFilterRows = () => {
    if (
      selectCntParties.length > 0 ||
      selectCostTypes.length > 0
    )
      return rows.filter((row: any) => {
        if (
          selectCostTypes.includes(row.costTypeId) ||
          selectCntParties.includes(row.counterPartyId)
        )
          return true;
        return false;
      });
    return [...rows];
  };

  useEffect(() => {
    getAllNeedData();
  }, [startDate, endDate]);

  useEffect(() => {
    setFilteredRows(handleFilterRows());
  }, [selectCostTypes, selectPayers, selectCntParties]);

  const { projectId } = useParams();

  const getAllNeedData = async () => {
    const res = await getFinanceCMPReport(
      projectId,
      moment(startDate).locale("fa").format("YYYY/MM/DD"),
      moment(endDate).locale("fa").format("YYYY/MM/DD")
    );
    const resCntParties = await getCountersPartiesOfProject(projectId);
    const resCostTypes = await getCostTypes();

    if (!(res instanceof Error) && !(resCntParties instanceof Error) && !(resCostTypes instanceof Error)) {
      setRows(res);
      setFilteredRows(res);
      setCntParties(resCntParties);
      // setPayers(resPayers)
      setCostTypes(resCostTypes);
    } else {
      setRows([]);
      setFilteredRows([]);
    }
  };

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
            options={cntParties}
            getOptionLabel={(option: any) => option.name}
            onChange={(e, v) => setSelectCntParties(v.map((item: any) => item.id))}
            renderInput={(params) => <TextField {...params} variant="filled" label="طرف حساب ها" />}
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <Autocomplete
            multiple
            options={costTypes}
            getOptionLabel={(option: any) => option.name}
            onChange={(e, v) => setSelectCostTypes(v.map((item: any) => item.id))}
            renderInput={(params) => <TextField {...params} variant="filled" label="انواع هزینه" />}
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
                return (
                  <TableCell key={column.id} align={column.align}>
                    {column.format && value ? column.format(value) : value}
                  </TableCell>
                );
              }}
              summableColumns={["cost"]}
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

export { FinancesInfoesPaymentCMPPage };