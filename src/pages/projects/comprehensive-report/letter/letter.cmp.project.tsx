import React, { useEffect, useState } from "react";
import { Button, Grid, Paper, TableCell } from "@mui/material";
import { getLetterCMPReport } from "api/api";
import "date-fns";
import { ModalIpa, TableProIpa } from "components";
import { useParams } from "react-router-dom";
import { ColumnPro } from "../../../../components/table-pro/table-pro.component";
import { sortDates, sortStrings } from "../../../../utils/sort.utils";
import moment from "jalali-moment";
import { useDispatch } from "react-redux";
import { setConfirmToggleDetails, setToggleDetails } from "redux/actions/actions";

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
    id: "subject",
    label: "موضوع",
    align: "left",
    minWidth: 40,
    state: 0,
    numeric: false,
    show: true,
    sort: sortStrings,
  },
  {
    id: "description",
    label: "توضیح",
    align: "left",
    minWidth: 70,
    state: 0,
    numeric: false,
    show: true,
    sort: sortStrings,
  },
  {
    id: "number",
    label: "شماره",
    align: "left",
    minWidth: 30,
    state: 0,
    numeric: false,
    show: true,
    sort: sortStrings,
  },
  {
    id: "date",
    label: "تاریخ",
    align: "center",
    minWidth: 30,
    state: 0,
    numeric: false,
    show: true,
    sort: sortDates,
    format: (value: string) => new Date(value).toLocaleDateString("fa-IR"),
  },
  {
    id: "reportDate",
    label: "تاریخ گزارش",
    align: "center",
    minWidth: 30,
    state: 0,
    numeric: false,
    show: true,
    sort: sortDates,
    format: (value: string) => new Date(value).toLocaleDateString("fa-IR"),
  },
];

function LetterCMPPage({ startDate, endDate }: any) {
  const [rows, setRows] = useState<any>([]);
  const [picturePathLocal, setPicturePathLocal] = useState<any>("");
  const [preview, setPreview] = useState<any>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    getAllNeedData();
  }, [startDate, endDate]);

  const { projectId } = useParams();

  const getAllNeedData = async () => {
    const res = await getLetterCMPReport(
      projectId,
      moment(startDate).locale("fa").format("YYYY/MM/DD"),
      moment(endDate).locale("fa").format("YYYY/MM/DD")
    );

    if (!(res instanceof Error)) {
      setRows(res);
    } else {
      setRows([]);
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
              rows={rows}
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

export { LetterCMPPage };