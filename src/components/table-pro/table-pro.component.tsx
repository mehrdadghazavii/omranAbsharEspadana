import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  Grid,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  useTheme,
} from "@mui/material";
import React, {useEffect, useState} from "react";
import {FullscreenIpa} from "../fullscreen/fullscreenIpa.component";
import {Reorder} from "@mui/icons-material";
import {ModalIpa} from "../modal/modal.component";
import {TablePaginationActions} from "./table-pagination-actions";
import {ExportMenu} from "./table.export-pdf-excel";
import {DataPdf, exportPdf, HeadersPdf} from "../../utils/exportPDF.utils";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import classes from "./table-pro.module.scss";
import {styled} from "@mui/material/styles";
import { DetailsDialog } from "components/details-dialog/details-dialog";
import { connect, useDispatch, useSelector } from "react-redux";
import { setConfirmToggleDetails, setToggleDetails } from "redux/actions/actions";
import { Dispatch } from 'redux';
import { saveAs } from "file-saver";
import moment from "jalali-moment";
import { GetCompresedPictures } from "api/api";

export type sortFunc = (rows: any[], field: string, state: 0 | 1 | 2) => any[];

export interface ColumnPro {
  id: string;
  minWidth: number;
  label: string;
  fontSize?: number;
  align: "inherit" | "left" | "center" | "right" | "justify";
  format?: Function;
  sort?: sortFunc;
  numeric: boolean;
  show: boolean;
  state: 0 | 1 | 2; //2:desc, 0:normal, 1:asc
}

export type bodyFunc = (
    column: ColumnPro,
    row: object,
    index: number
) => React.ReactNode;

export interface TableProProps {
  columns: ColumnPro[];
  rows: any[];
  bodyFunc: bodyFunc;
  style?: {
    row?: object;
    column?: object;
  };
  toggleDetails?:any
  summableColumns?: string[];
}

function TableProIpa({columns, rows, bodyFunc, style , toggleDetails, summableColumns}: TableProProps) {
  const [rowsTable, setRows] = useState<any>(rows ? [...rows] : []);
  const [columnsTable, setColumns] = useState<any>(columns ? columns : []);
  const [searchKey, setSearchKey] = useState<string>("");
  const [editShow, setEditShow] = useState<null | boolean>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [densePadding, setDensePadding] = React.useState(false);
  const [toggleArr] = useState("arrToggleShow");
  const [selectedRow, setSelectedRow] = useState(null)
  //excel data
  const [excelData, setExcelData] = React.useState<any>(null);
  const [excelHeaders, setExcelHeaders] = React.useState<any>(null);
  const [columnWidths, setColumnWidths] = React.useState<any>(null);

  const menuItemContainImage:string[] = ["materials" , "pictures" , "seassion" , "letters" , "fundsPayments" , "projectsfinanceInfo" , "operationLicense "]

  const dispatch = useDispatch();

  const globalState = useSelector((state:any) => state)

  const confirmToggleDetails = useSelector((state:any) => state.confirmToggleDetails);

  const handleChangeStateColumn = (id: string) => {
    const index = columnsTable.findIndex((C: any) => C.id === id);
    const tmp = [...columnsTable];
    tmp[index].state = (tmp[index].state + 1) % 3;
    setColumns(tmp);
    setRows(tmp[index].sort([...rows], tmp[index].id, tmp[index].state));
  };

  useEffect(() => {
    setRows([...rows]);
  }, [rows]);


  useEffect(() => {
    setColumns(columns);
  }, [columns]);
  const handleChangeShowColumn = (id: string) => {
    const index = columnsTable.findIndex((C: any) => C.id === id);
    const tmp = [...columnsTable];
    tmp[index].show = !tmp[index]?.show;
    setColumns(tmp);
  };

  const handleChangePage = (
      event: React.MouseEvent<HTMLButtonElement> | null,
      newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    setRows([
      ...search(
          rows && Array.isArray(rows) ? [...rows] : [],
          columns,
          searchKey
      ),
    ]);
  }, [searchKey]);

  const handleDownloadPdfFile = () => {
    const headers: HeadersPdf = [
      columnsTable
          .filter((column: ColumnPro) => column.show && !(column.id === "pdfUrl" || column.id === "pictureUrl" || column.id === "picturePath"))
          .map((C: ColumnPro) => C.label)
          .reverse(),
    ];
    const data: DataPdf = rowsTable.map((row: any, index: number) => {
      const array = [];
      for (const head of columnsTable.filter(
          (column: ColumnPro) => column.show && !(column.id === "pdfUrl" || column.id === "pictureUrl" || column.id === "picturePath")
      )) {
        if (head.id === "counter") {
          array.push(index + 1);
          continue;
        }
        const value = row[head.id];
        array.push(head.format && value ? head.format(value) : value);
      }
      return array.reverse();
    });
    exportPdf(headers, data, "OmranAbshar", "اتوماسیون اجرایی پروژه", "", "");
  };
  
  const handleDownloadImage = async() => {
    if(menuItemContainImage.find((item:any) => globalState.currentPage.includes(item))){
      const resPictureZip = await GetCompresedPictures(globalState?.project?.id , {StartDate:moment(globalState?.startDate , "YYYY-MM-DD").locale("fa").format("YYYY/MM/DD") , EndDate:moment(globalState?.endDate , "YYYY-MM-DD").locale("fa").format("YYYY/MM/DD") , reportType:`${globalState.currentPage}`})
      if(!(resPictureZip instanceof Error)){
        resPictureZip.forEach((value: string) => saveAs(value));
      }
    }
  }


  const handleMakeExcelData = () => {
    //Create Headers
    const headers = columnsTable
        .filter((column: ColumnPro) => column.show)
        .map((C: ColumnPro) => ({
          title: C.label,
        }))
        .map(header => header.title)
        .reverse();

    //Create widths
    const extractWidths = columnsTable
        .filter((column: ColumnPro) => column.show)
        .map((C: ColumnPro) => ({
          width: C.minWidth / 3.5,
        }))
        .map((W: any) => W.width)
        .reverse();

    //Create Data
    const data = rowsTable.map((row: any, index: number) => {
      const array = [];
      for (const head of columnsTable.filter(
          (column: ColumnPro) => column.show
      )) {
        if (head.id === "counter") {
          array.push(index + 1);
          continue;
        }
        const value = row[head.id];
        array.push(head.format && value ? head.format(value) : value || ' ');
      }
      return array.reverse();
    });

    setExcelHeaders(headers);
    setExcelData(data);
    setColumnWidths(extractWidths);
  };

  const search = (array: any[], fields: ColumnPro[], key: string) => {
    if (key) {
      return array.filter((item) => {
        let flag = false;
        for (const field of fields) {
          if (
              item[field.id] && item[field.id].toString
                  ? field.format
                  ? field.format(item[field.id]).toString().includes(key)
                  : item[field.id].toString().includes(key)
                  : false
          ) {
            flag = true;
            break;
          }
        }
        return flag;
      });
    }
    return [...array];
  };

  const handleCellHover = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (document.getElementById(e.target.getAttribute("is-select")) !== null) {
      const target = document.getElementById(
          e.target.getAttribute("is-select")
      );
      target.classList.add(`${toggleArr}`);
    }
  };

  const handleCellLeave = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (document.getElementById(e.target.getAttribute("is-select")) !== null) {
      const target = document.getElementById(
          e.target.getAttribute("is-select")
      );
      target.classList.remove(`${toggleArr}`);
    }
  };

  const ArrowUpwardIconStyle = styled(ArrowUpwardIcon)(({theme}) => ({
    fontSize: "16px",
    visibility: "hidden",
    opacity: ".6",
    cursor: "pointer",
    "&.arrToggleShow": {
      visibility: "visible",
    },
  }));

  useEffect(() => {
      setPage(0)
  }, [rows]);

  function sumProperty(rows, propertyName: string) {
    const sum: number = rows.map(row => parseInt(row[propertyName])).reduce((acc, val) => acc + val, 0)
    return sum.toLocaleString('fa-IR');
  }

  return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box px={2}>
            <Grid container spacing={2}>
              <Grid item lg={2} md={3} xs={12}>
                <Button
                    fullWidth
                    onClick={() => setEditShow(true)}
                    variant={"contained"}
                    color={"primary"}>
                  ستون ها
                  <Reorder/>
                </Button>
              </Grid>
              <Grid item lg={6} md={9} xs={12}>
                <TextField
                    fullWidth
                    variant={"outlined"}
                    size="small"
                    placeholder="دنبال چی میگردی؟"
                    value={searchKey}
                    onChange={({target}) => setSearchKey(target.value)}
                />
              </Grid>
              <Grid item lg={2} md={6} xs={12}>
                <ExportMenu
                    onClick={handleMakeExcelData}
                    exportPdf={handleDownloadPdfFile}
                    excelData={excelData}
                    excelHeaders={excelHeaders}
                    columnWidths={columnWidths}
                    downloadImages={handleDownloadImage}
                />
              </Grid>
              <Grid
                  lg={2}
                  md={6}
                  item
                  xs={12}
                  sx={{
                    textAlign: "right",
                  }}>
                <FormControlLabel
                    control={
                      <Switch
                          checked={densePadding}
                          onChange={({target}) => setDensePadding(target.checked)}
                      />
                    }
                    label="متراکم"
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>
        <div>
        <DetailsDialog
    title="Delete Post?"
    open={confirmToggleDetails}
    // setOpen={setConfirmOpen}
    rowValue={selectedRow}
    columnValue={columns}
  />
</div>
        <Grid item xs={12}>
          <Box pt={1}>
            <FullscreenIpa>
              <TableContainer>
                <Table size={densePadding ? "small" : "medium"}>
                  <TableHead>
                    <TableRow
                        style={{
                          backgroundColor: useTheme().palette.background.default,
                          ...style?.column,
                        }}
                       
                        >
                      {columnsTable
                          .filter((column: ColumnPro) => column.show)
                          .map((column: ColumnPro) => (
                              <TableCell
                                  id="tableCell"
                                  onClick={() =>
                                      column.sort && handleChangeStateColumn(column.id)
                                  }
                                  onMouseOver={(e: any) => handleCellHover(e)}
                                  onMouseLeave={(e: any) => handleCellLeave(e)}
                                  sx={{
                                    minWidth: column.minWidth,
                                    fontWeight: "bold",
                                    fontSize: column.fontSize || 13,
                                    cursor: column.sort ? "pointer" : "unset",
                                  }}
                                  key={column.id}
                                  align={column.align}
                                  is-select={column.id}>
                                {column.label} &nbsp;{" "}
                                {column.sort ? (
                                    <>
                                      {column.state === 0 ? (
                                          <ArrowUpwardIconStyle id={`${column.id}`}/>
                                      ) : null}
                                      {column.state === 1 ? (
                                          <ArrowUpwardIcon
                                              sx={{
                                                fontSize: "16px",
                                              }}
                                              className={classes.animatedUp}
                                          />
                                      ) : column.state === 2 ? (
                                          <ArrowDownwardIcon
                                              sx={{
                                                fontSize: "16px",
                                              }}
                                              className={classes.animatedDown}
                                          />
                                      ) : null}
                                    </>
                                ) : null}
                              </TableCell>
                          ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rowsTable &&
                    rowsTable.slice &&
                    React.Children.toArray(
                        (rowsPerPage > 0 ?
                            rowsTable?.slice(
                                page * rowsPerPage,
                                page * rowsPerPage + rowsPerPage
                            ) : rowsTable).map((row: any, index: number) => (
                            <TableRow hover style={style?.row}
                            onClick={() => {
                              if(toggleDetails){
                                dispatch(setConfirmToggleDetails(true))
                                setSelectedRow(row)
                              }else{
                                dispatch(setConfirmToggleDetails(false))
                                setSelectedRow(row);
                              }
                            }}
                            >
                              {React.Children.toArray(
                                  columnsTable
                                      .filter((column: ColumnPro) => column.show)
                                      .map((column: ColumnPro) => {
                                        if (column.id === "counter") {
                                          return (
                                              <TableCell align={column.align}>
                                                {page * rowsPerPage + index + 1}
                                              </TableCell>
                                          );
                                        }
                                        return bodyFunc(column, row, index);
                                      })
                              )}
                            </TableRow>
                        ))
                    )}
                    {/*START : sum summable columns, based on search, pagination & column.show*/}
                    {(summableColumns?.length && rows?.length) ?
                        <TableRow sx={{bgcolor: "rgba(216, 246, 238)"}}>
                          {React.Children.toArray(
                              columnsTable
                                  .filter(column => column.show)
                                  .map(column => {
                                    if (column.id === "counter") {
                                      return <TableCell align={column.align} sx={{ whiteSpace: "nowrap" }}>جمع کل</TableCell>;
                                    } else if (summableColumns.includes(column.id)) {
                                      // finding rows based on pagination or search
                                      const summableRows = (rowsPerPage > 0 ?
                                          rowsTable?.slice(
                                              page * rowsPerPage,
                                              page * rowsPerPage + rowsPerPage
                                          ) : rowsTable);
                                      return (
                                          <TableCell align={column.align}>
                                            {sumProperty(summableRows, column.id)}
                                          </TableCell>
                                          )
                                    } else {
                                      //insert value for columns that are not summable
                                      return <TableCell align={column.align}>{"*".repeat(column.id.length)}</TableCell>;
                                    }
                                  })
                          )}
                        </TableRow> : null
                    }
                    {/*END : sum summable columns, based on search and pagination*/}
                  </TableBody>
                  <TableFooter sx={{ display: rows?.length < 1 && "none" }}>
                    <TableRow>
                      <TablePagination
                          rowsPerPageOptions={[
                            10,
                            25,
                            50,
                            100,
                            {
                              label: "همه",
                              value: -1,
                            },
                          ]}
                          // colSpan={3}
                          count={rowsTable.length}
                          rowsPerPage={rowsPerPage}
                          page={page}
                          labelDisplayedRows={({from, to, count, page}) =>
                              `${from || "1"}–${to || "0"} از ${
                                  count !== -1 ? count || "0" : `بیشتر از ${to || "0"}`
                              }`
                          }
                          SelectProps={{
                            inputProps: {
                              "aria-label": "rows per page",
                            },
                            native: true,
                          }}
                          onPageChange={handleChangePage}
                          onRowsPerPageChange={handleChangeRowsPerPage}
                          ActionsComponent={TablePaginationActions}
                      />
                    </TableRow>
                  </TableFooter>
                </Table>
                {rows?.length < 1 &&
                    <Alert severity="error" sx={{justifyContent: 'center', width: '100%'}}>
                      در این بازه زمانی اطلاعاتی ثبت نشده است
                    </Alert>
                }
              </TableContainer>
            </FullscreenIpa>
          </Box>
        </Grid>
        {editShow ? (
            <ModalIpa
                open={Boolean(editShow)}
                onClose={() => setEditShow(null)}
                title={"نمایش ستون ها"}>
              <Grid container spacing={2}>
                {columnsTable.map((column: ColumnPro) => (
                    <Grid item lg={3} md={4} sm={6} xs={12} key={column.id}>
                      <FormControlLabel
                          control={
                            <Switch
                                checked={column.show}
                                onChange={() => handleChangeShowColumn(column.id)}
                            />
                          }
                          label={column.label}
                      />
                    </Grid>
                ))}
              </Grid>
            </ModalIpa>
        ) : null}
      </Grid>
  );
}

const mapStateToProps = (state: any) => {
  return{
      toggleDetails: state.toggleDetails,
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    setToggleDetails: (value: any) => dispatch(setToggleDetails(value))
  }
}

const reduxHead = connect(mapStateToProps, mapDispatchToProps )(TableProIpa)

export {reduxHead as TableProIpa}

