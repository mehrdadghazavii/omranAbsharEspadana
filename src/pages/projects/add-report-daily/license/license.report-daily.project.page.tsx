import React, { useEffect, useRef, useState } from "react";
import {Alert, Box, Button, Grid, Paper, TextField, useTheme} from "@mui/material";
import {Delete, Edit, ThumbDown, Settings, ThumbUp} from "@mui/icons-material";
import {
  deleteLicenseOfProject,
  getDailyLicenseByProjectId, getVerifiedForBadge,
  postCopyRecords,
  postLicenseAtProject,
  PostOrPutLicenseProps,
  putLicenseAtProject,
  rejectDailyReports,
  uploadImageLicense,
  verifyAllLicenses,
  verifyCurrentLicense,
} from "api/api";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import "date-fns";
import { Column, TableIpa } from "components/table/table.componet";
import { ButtonsModal, FilterTable, MenuActionTable, ModalIpa, PaginationIpa } from "components";
import { useParams } from "react-router-dom";
import { VerifyAllReportDaily } from "../components/verify-all.report-daily";
import { TableCellStyled } from "../components/table-cell-styled.report-daily";
import OmranLogo from "../../../../asset/images/mainLogo.png";
import { useDispatch, useSelector } from "react-redux";
import {
  handleSetVerifiedBadge,
  handleShowCopyRowInItem,
  handleShowModalDateCopyRow,
  setConfirmToggleDetails,
  setToggleDetails,
} from "../../../../redux/actions/actions";
import moment from "jalali-moment";
import { currentPageNumber } from "../../../../utils/currentPage-number";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFnsJalali } from "@mui/x-date-pickers/AdapterDateFnsJalali";
import { DatePicker } from "@mui/x-date-pickers";
import AddPdf from "../../../../components/pdf/addPDF.comp";
import EditPdf from "../../../../components/pdf/editPDF.comp";
import {red} from "@mui/material/colors";
import {rejectApiTypes} from "../../../../utils/rejectApiType";
import AreYouSure from "../../../../components/are-you-sure/AreYouSure";

const columns: Column[] = [
  {
    id: "counter",
    label: "#",
    align: "center",
    minWidth: 20,
  },
  {
    id: "pictureUrl",
    label: "تصویر",
    align: "center",
    minWidth: 80,
  },
  {
    id: "pdfUrl",
    label: "PDF",
    align: "center",
    minWidth: 120,
  },
  {
    id: "subject",
    label: "موضوع",
    align: "left",
    minWidth: 200,
  },
  {
    id: "number",
    label: "شماره",
    align: "left",
    minWidth: 80,
  },
  {
    id: "action",
    label: "عملیات",
    align: "center",
    minWidth: 60,
  },
];

function LicensesReportDailyPage({ date }: any) {
  const [rows, setRows] = useState<any>(null);
  const [filteredRow, setFilteredRow] = useState<any>([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState<any>(10);
  const [add, setAdd] = useState<any>(null);
  const [edit, setEdit] = useState<any>(null);
  const [keySearch, setKeySearch] = useState<any>("");
  const [remove, setRemove] = useState<any>(null);
  const [verify, setVerify] = useState<any>(null);
  const [verifyAll, setVerifyAll] = useState(false);
  const [reject, setReject] = useState<any>(null);
  const [img, setImg] = useState<any>("");
  const image = useRef(null);
  const [pdf, setPdf] = useState<any>("");
  const [pdfLink, setPdfLink] = useState<any>("");
  const pdfRef = useRef(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<any>(null);
  const [picturePath, setPicturePath] = useState<any>("");
  const [checkedIdList, setCheckedIdList] = useState([]);
  const [checkedAllSelect, setCheckAllSelected] = useState(false);

  const { userType } = useSelector((state: any) => state.userAccess);
  const showCheckboxColumn = useSelector((state: any) => state.showCopyRowInItem);
  const showModalDateCopyRow = useSelector((state: any) => state.showModalDateCopyRow);
  const currentPage = useSelector((state: any) => state.currentPage);
  const startDate = useSelector((state: any) => state.startDate);

  const { companyId, projectId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    getAllNeedData();
    copyRowFormik.setFieldValue("fromDate", startDate);
  }, [date]);

  const updateVerifiedBadge = async () => {
    if (projectId) {
      const res = await getVerifiedForBadge(projectId, startDate);
      if (!(res instanceof Error)) {
        dispatch(handleSetVerifiedBadge(res));
      }
    }
  }

  //Start Handle the selected Row for the copy
  const handleChangeRowChecked = (event, row) => {
    if (event.target.checked) {
      setCheckedIdList([...checkedIdList, row?.id]);
    } else {
      setCheckedIdList(checkedIdList.filter((item: any) => item !== row?.id));
    }
  };

  useEffect(() => {
    if (!showCheckboxColumn) {
      setCheckedIdList([]);
    }
  }, [showCheckboxColumn]);

  const handleCloseModalDateCopyRow = () => {
    dispatch(handleShowCopyRowInItem(false));
    dispatch(handleShowModalDateCopyRow(false));
  };

  const validationCopyRow = Yup.object({
    fromDate: Yup.date()
        .required("نباید خالی باشد")
        .typeError("نامعتبر می باشد"),
    toDate: Yup.date()
        .required("نباید خالی باشد")
        .typeError("نامعتبر می باشد")
        .test("باید از تاریخ اولیه بزرگتر باشد",
            "باید از تاریخ اولیه بزرگتر باشد",
            function (value: object) {
              return moment(value).diff(moment(this.parent.fromDate)) > 0;
            }),
  });

  const copyRowFormik = useFormik({
    initialValues: {
      fromDate: "",
      toDate: "",
    },
    validationSchema: validationCopyRow,
    onSubmit: async (values, { resetForm }) => {
        const res = await postCopyRecords(currentPageNumber[currentPage], projectId, {
          from: values.fromDate,
          to: values.toDate,
          recordIds: checkedIdList
        });
        if (!(res instanceof Error)) {
          toast.success("کپی داده ها با موفقیت انجام شد");
          handleCloseModalDateCopyRow();
        }
    },
  });

  const handleChangeAllSelected = (event: any) => {
    setCheckAllSelected(event.target.checked);
  };

  useEffect(() => {
    if (checkedAllSelect) {
      setCheckedIdList(filteredRow.map((item: any) => item.id));
    } else {
      setCheckedIdList([]);
    }
  }, [checkedAllSelect]);

  //End Handle the selected Row for the copy

  const validation = Yup.object({
    subject: Yup.string().required("نباید خالی باشد"),
    Number: Yup.string().required("نباید خالی باشد"),
    Location: Yup.string().required("نباید خالی باشد"),
  });

  const addFormik = useFormik({
    initialValues: {
      subject: "",
      Number: "",
      Description: "",
      Amount: "",
      Unit: "",
      Verifier: "",
      Location: "",
      ProjectId: projectId,
      ReportDate: date,
      LastUserLevel: 1,
    },
    validationSchema: validation,
    onSubmit: async (values, { resetForm }) => {
      values.ReportDate = date;
      const data: PostOrPutLicenseProps = { ...values };

      if (img) {
        const resUpl: any = await uploadImageLicense(image.current.files[0], companyId, projectId);
        if (!(resUpl instanceof Error)) {
          // setImg("");
          data.PictureUrl = resUpl.url;
        } else {
          toast.error("آپلود عکس با خطا مواجه شد");
        }
      }

      if (pdf) {
        const resPdfUpl: any = await uploadImageLicense(pdf, companyId, projectId);
        if (!(resPdfUpl instanceof Error)) {
          data.PdfUrl = resPdfUpl.url;
          setPdf("");
        } else {
          toast.error("آپلود PDF با خطا مواجه شد");
        }
      }

      const res = await postLicenseAtProject(data);
      if (!(res instanceof Error)) {
        setAdd(null);
        toast.success("مجوز اجرایی با موفقیت درج شد");
        await refresh();
        // search(keySearch)
        resetForm();
      } else {
        toast.error("درج مجوز اجرایی با خطا مواجه شد");
      }
    },
  });
  const editFormik = useFormik({
    initialValues: {
      subject: "",
      Number: "",
      Description: "",
      Amount: "",
      Unit: "",
      Verifier: "",
      Location: "",
      ProjectId: projectId,
      ReportDate: date,
      LastUserLevel: 1,
      PictureUrl: '',
      PdfUrl: '',
    },
    validationSchema: validation,
    onSubmit: async (values, { resetForm }) => {
      const data: PostOrPutLicenseProps = { ...values };
      // setImg("");

      if (img !== edit.pictureUrl && img) {
        const resUpl: any = await uploadImageLicense(image.current.files[0], companyId, projectId);
        if (!(resUpl instanceof Error)) {
          data.PictureUrl = resUpl.url;
        } else {
          toast.error("آپلود عکس با خطا مواجه شد");
        }
      }

      if (pdf) {
        const resPdfUpl: any = await uploadImageLicense(pdf, companyId, projectId);
        if (!(resPdfUpl instanceof Error)) {
          data.PdfUrl = resPdfUpl.url;
          setPdf("");
        } else {
          toast.error("آپلود PDF با خطا مواجه شد");
        }
      }

      const res = await putLicenseAtProject({ ...data, Id: edit.id }, edit.id);
      if (!(res instanceof Error)) {
        setEdit(null);
        await refresh();
        toast.success("مجوز اجرایی با موفقیت ویرایش یافت");
        resetForm();
      } else {
        toast.error("ویرایش مجوز اجرایی با خطا مواجه شد");
      }
    },
  });

  useEffect(() => {
    if (edit) {
      editFormik.setValues({
        subject: edit.subject,
        Number: edit.number,
        Description: edit.description,
        Amount: edit.amount,
        Unit: edit.unit,
        Verifier: edit.verifier,
        Location: edit.location,
        ProjectId: projectId,
        ReportDate: date,
        LastUserLevel: edit.lastUserLevel,
        PictureUrl: edit.pictureUrl,
        PdfUrl: edit.pdfUrl
      });
      setImg(edit.pictureUrl || "");
      setPdfLink(edit.pdfUrl || "");
    }
  }, [edit]);
  const handleRemove = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await deleteLicenseOfProject(remove, projectId);
    if (!(res instanceof Error)) {
      const tmpRows = [...rows];
      const index = tmpRows.findIndex((row) => row.id === remove);
      await tmpRows.splice(index, 1);
      setRows(tmpRows);
      setRemove(null);
      toast.success("مجوز اجرایی با موفقیت حذف شد");
    } else {
      toast.error("حذف مجوز اجرایی با خطا مواجه شد");
    }
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await verifyCurrentLicense(verify, projectId);
    if (!(res instanceof Error)) {
      const tmpRows = [...rows];
      const index = tmpRows.findIndex((row) => row.id === verify);
      tmpRows[index].verify = 1;
      setRows(tmpRows);
      setVerify(null);
      await refresh();
      toast.success("مجوز اجرایی با موفقیت تایید شد");
    } else {
      toast.error("تایید مجوز اجرایی با خطا مواجه شد");
    }
  };

  const handleVerifyAll = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await verifyAllLicenses(projectId, date);
    if (!(res instanceof Error)) {
      const tmpRows = [...rows];
      for (let i = 0; i < tmpRows.length; i++) {
        tmpRows[i].verify = 1;
      }
      setRows(tmpRows);
      setVerifyAll(false);
      await refresh();
      toast.success("تمام مجوز اجرایی ها تایید شدند");
    } else {
      toast.error("تایید مجوز اجرایی ها با خطا مواجه شد");
    }
  };

  const handleReject = async (event) => {
    event.preventDefault();
    const res = await rejectDailyReports(reject, rejectApiTypes.OperationLicense, projectId);
    if (!(res instanceof Error)) {
      setRows(rows.filter(row => row.id !== reject));
      setReject(null);
      toast.success("گزارش رد و به سطح قبلی ارجاع داده شد")
    } else {
      toast.error("خطا در رَد گزارش")
    }
  }

  const refresh = async () => {
    const res = await getDailyLicenseByProjectId(projectId, date);

    if (!(res instanceof Error)) {
      setRows(res);
      setFilteredRow(res);
      // @ts-ignore
      setCount(res.length);
    }
  };

  const getAllNeedData = async () => {
    const res = await getDailyLicenseByProjectId(projectId, date);
    if (!(res instanceof Error)) {
      setRows(res);
      setFilteredRow(res);
      //@ts-ignore
      setCount(res?.length);
    } else {
      setRows([]);
      setFilteredRow([]);
      setCount(0);
    }
  };



  const search = (key: string) => {
    if (key) {
      const filtered = rows.filter((row: any) => row.subject.includes(key) || row.number.includes(key));
      setFilteredRow(filtered);
      setCount(filtered.length);
      setPage(1);
    } else {
      setFilteredRow(rows);
      setCount(rows.length);
      setPage(1);
    }
  };
  useEffect(() => {
    if (rows) {
      updateVerifiedBadge();
      search(keySearch);
    }
  }, [rows]);

  const itemsOfAction = (verify: number) => [
    {
      title: (
          <>
            <Edit />&nbsp; ویرایش
          </>
      ),
      onClick: async (user: any) => await setEdit(user),
      disabled: userType !== 1 || verify === userType,
    },
    {
      title: (
          <>
            {userType !== 1 ? <><ThumbDown/>&nbsp; رد</> : <><Delete/>&nbsp; حذف</>}
          </>
      ),
      onClick: (user: any) => userType !== 1 ? setReject(user.id) : setRemove(user.id),
      disabled: userType === 4 || verify === userType,
    },
    {
      title: (
          <>
            <ThumbUp />&nbsp; تایید
          </>
      ),
      onClick: (user: any) => setVerify(user.id),
      disabled: userType === 4 || verify === userType,
    },
  ];

  const toBase64 = (file: any) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  return (
    <Grid container sx={{ position: "relative" }}>
      <Grid item xs={12} style={{ width: 10 }}>
        <Paper>
          <Box mb={3} pt={3} mx={3}>
            <Grid container>
              <Grid item xs={12}>
                <FilterTable
                  limit={limit}
                  onChangeLimit={(value: number) => {
                    setPage(1);
                    setLimit(value);
                  }}
                  keySearch={keySearch}
                  onChangeSearch={(value: string) => {
                    search(value);
                    setKeySearch(value);
                  }}
                  titleAdd={"درج مجوز اجرایی"}
                  onClickAdd={() => {
                    setAdd(true);
                    setPdf("");
                    setImg("");
                  }}
                  numberOfSelectedCopy={checkedIdList?.length}
                />
              </Grid>
              {showCheckboxColumn ? (
                <Grid item sx={{ ml: "auto" }}>
                  <FormControlLabel
                    label="انتخاب همه"
                    labelPlacement={"start"}
                    control={
                      <Checkbox
                        checked={checkedAllSelect}
                        onChange={handleChangeAllSelected}
                        inputProps={{ "aria-label": "controlled" }}
                      />
                    }
                  />
                </Grid>
              ) : null}
            </Grid>
          </Box>
          <TableIpa
            columns={columns}
            style={{
              row: {
                backgroundColor: useTheme().palette.success.main,
              },
            }}
            bodyFucn={(column, row: any, index) => {
              const head = column.id;
              const value = row[column.id];
              if (head === "counter") {
                return (
                  <TableCellStyled active={row.verify === userType} key={column.id} align={column.align}>
                    {(page - 1) * limit + index + 1}
                  </TableCellStyled>
                );
              } else if (head === "action") {
                if (showCheckboxColumn) {
                  return (
                    <TableCellStyled active={row.verify === userType} key={column.id} align={column.align}>
                      <Checkbox
                        checked={checkedIdList.find((item: any) => item === row?.id) ? true : false}
                        onChange={(event: any) => handleChangeRowChecked(event, row)}
                        inputProps={{ "aria-label": "controlled" }}
                      />
                    </TableCellStyled>
                  );
                } else {
                  return (
                    <TableCellStyled active={row.verify === userType} key={column.id} align={column.align}>
                      <MenuActionTable menuId={row.id} items={itemsOfAction(row.verify)} icon={<Settings />} user={row} />
                    </TableCellStyled>
                  );
                }
              } else if (head === "pictureUrl") {
                return (
                  <TableCellStyled active={row.verify === userType} key={column.id} align={column.align}>
                    <img
                      onClick={() => {
                        setPreview(value);
                        dispatch(setToggleDetails(false));
                        setPicturePath(row?.pictureUrl);
                      }}
                      onMouseOut={() => {
                        dispatch(setConfirmToggleDetails(false));
                        dispatch(setToggleDetails(true));
                      }}
                      src={value}
                      alt={row.pictureName}
                      style={{
                        objectFit: "contain",
                        cursor: "pointer",
                        width: "30%",
                        height: "100%",
                      }}
                    />
                  </TableCellStyled>
                );
              } else if (head === 'pdfUrl') {
                return (
                  <TableCellStyled active={row.verify === userType} key={column.id} align={column.align}>
                    {value ? (
                      <Button
                        onMouseEnter={() => dispatch(setToggleDetails(false))}
                        onMouseLeave={() => dispatch(setToggleDetails(true))}
                      >
                        <a href={value} target='_blank' style={{color: '#45a294', fontWeight: 450}}>نمایش PDF</a>
                      </Button>
                    ) : '__'}
                  </TableCellStyled>
                )
              }
              return (
                <TableCellStyled active={row.verify === userType} key={column.id} align={column.align}>
                  {column.format && value ? column.format(value) : value}
                </TableCellStyled>
              );
            }}
            rows={filteredRow.length ? filteredRow.slice((page - 1) * limit, page * limit) : []}
          />
          {rows?.length < 1 ?
              <Alert severity="error" sx={{justifyContent: 'center'}}>
                در این تاریخ اطلاعاتی ثبت نشده است
              </Alert>
              : (
                  <Box py={1.5} style={{display: "flex", justifyContent: "center"}}>
                    <PaginationIpa count={count} page={page} limit={limit}
                                   onChange={(value: number) => setPage(value)}/>
                  </Box>
              )
          }
        </Paper>
      </Grid>
      {rows?.length > 0 && userType !== 4 ? (
        <VerifyAllReportDaily onClick={() => setVerifyAll(true)} />
      ) : null}
      {add ? (
        <ModalIpa
          open={add}
          title={"درج مجوز اجرایی"}
          onClose={() => {
            setAdd(null);
            addFormik.handleReset(1);
          }}
        >
          <form noValidate onSubmit={addFormik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name={"subject"}
                  onChange={addFormik.handleChange}
                  value={addFormik.values.subject}
                  error={addFormik.touched.subject && Boolean(addFormik.errors.subject)}
                  helperText={addFormik.touched.subject && addFormik.errors.subject}
                  fullWidth
                  required
                  label="موضوع"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name={"Number"}
                  onChange={addFormik.handleChange}
                  value={addFormik.values.Number}
                  error={addFormik.touched.Number && Boolean(addFormik.errors.Number)}
                  helperText={addFormik.touched.Number && addFormik.errors.Number}
                  fullWidth
                  required
                  label="شماره"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name={"Location"}
                  onChange={addFormik.handleChange}
                  value={addFormik.values.Location}
                  error={addFormik.touched.Location && Boolean(addFormik.errors.Location)}
                  helperText={addFormik.touched.Location && addFormik.errors.Location}
                  fullWidth
                  required
                  label="محل"
                  variant="outlined"
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <TextField
                  name={"Amount"}
                  onChange={addFormik.handleChange}
                  value={addFormik.values.Amount}
                  error={addFormik.touched.Amount && Boolean(addFormik.errors.Amount)}
                  helperText={addFormik.touched.Amount && addFormik.errors.Amount}
                  fullWidth
                  label="مقدار"
                  variant="outlined"
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <TextField
                  name={"Unit"}
                  onChange={addFormik.handleChange}
                  value={addFormik.values.Unit}
                  error={addFormik.touched.Unit && Boolean(addFormik.errors.Unit)}
                  helperText={addFormik.touched.Unit && addFormik.errors.Unit}
                  fullWidth
                  label="واحد"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name={"Verifier"}
                  onChange={addFormik.handleChange}
                  value={addFormik.values.Verifier}
                  error={addFormik.touched.Verifier && Boolean(addFormik.errors.Verifier)}
                  helperText={addFormik.touched.Verifier && addFormik.errors.Verifier}
                  fullWidth
                  label="تایید کننده"
                  variant="outlined"
                />
              </Grid>
              <Grid item  xs={12}>
                <TextField
                  name={"Description"}
                  onChange={addFormik.handleChange}
                  value={addFormik.values.Description}
                  error={addFormik.touched.Description && Boolean(addFormik.errors.Description)}
                  helperText={addFormik.touched.Description && addFormik.errors.Description}
                  fullWidth
                  label="توضیحات"
                  variant="outlined"
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <Box style={{ display: "flex", flexDirection: "column", width: 200, margin: "auto" }}>
                  <img width={200} height={200} style={{ objectFit: "contain" }} src={img || OmranLogo} />
                  <Button variant="contained" component="label" fullWidth>
                    انتخاب تصویر
                    <input
                      accept='image/*'
                      type="file"
                      hidden
                      ref={image}
                      onChange={async () => {
                        setImg(await toBase64(image.current!.files[0]));
                      }}
                    />
                  </Button>
                </Box>
              </Grid>
              <Grid item md={6} xs={12}>
                <AddPdf
                  pdf={pdf}
                  loading={loading}
                  setPdf={setPdf}
                  setLoading={setLoading}
                  pdfRef={pdfRef}
                />
              </Grid>
              <Grid item xs={12}>
                <ButtonsModal
                  textSubmit={"ذخیره"}
                  textClose={"انصراف"}
                  onClose={() => {
                    setAdd(null);
                    setPdf('');
                    addFormik.handleReset(1);
                  }}
                />
              </Grid>
            </Grid>
          </form>
        </ModalIpa>
      ) : null}
      {edit ? (
        <ModalIpa
          open={Boolean(edit)}
          title={"ویرایش مجوز اجرایی"}
          onClose={() => {
            setEdit(null);
            setPdf('');
            editFormik.handleReset(1);
          }}
        >
          <form noValidate onSubmit={editFormik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name={"subject"}
                  onChange={editFormik.handleChange}
                  value={editFormik.values.subject}
                  error={editFormik.touched.subject && Boolean(editFormik.errors.subject)}
                  helperText={editFormik.touched.subject && editFormik.errors.subject}
                  fullWidth
                  required
                  label="موضوع"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name={"Number"}
                  onChange={editFormik.handleChange}
                  value={editFormik.values.Number}
                  error={editFormik.touched.Number && Boolean(editFormik.errors.Number)}
                  helperText={editFormik.touched.Number && editFormik.errors.Number}
                  fullWidth
                  required
                  label="شماره"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name={"Location"}
                  onChange={editFormik.handleChange}
                  value={editFormik.values.Location}
                  error={editFormik.touched.Location && Boolean(editFormik.errors.Location)}
                  helperText={editFormik.touched.Location && editFormik.errors.Location}
                  fullWidth
                  required
                  label="محل"
                  variant="outlined"
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <TextField
                  name={"Amount"}
                  onChange={editFormik.handleChange}
                  value={editFormik.values.Amount}
                  error={editFormik.touched.Amount && Boolean(editFormik.errors.Amount)}
                  helperText={editFormik.touched.Amount && editFormik.errors.Amount}
                  fullWidth
                  label="مقدار"
                  variant="outlined"
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <TextField
                  name={"Unit"}
                  onChange={editFormik.handleChange}
                  value={editFormik.values.Unit}
                  error={editFormik.touched.Unit && Boolean(editFormik.errors.Unit)}
                  helperText={editFormik.touched.Unit && editFormik.errors.Unit}
                  fullWidth
                  label="واحد"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name={"Verifier"}
                  onChange={editFormik.handleChange}
                  value={editFormik.values.Verifier}
                  error={editFormik.touched.Verifier && Boolean(editFormik.errors.Verifier)}
                  helperText={editFormik.touched.Verifier && editFormik.errors.Verifier}
                  fullWidth
                  label="تایید کننده"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name={"Description"}
                  onChange={editFormik.handleChange}
                  value={editFormik.values.Description}
                  error={editFormik.touched.Description && Boolean(editFormik.errors.Description)}
                  helperText={editFormik.touched.Description && editFormik.errors.Description}
                  fullWidth
                  label="توضیحات"
                  variant="outlined"
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <Box style={{ display: "flex", flexDirection: "column", width: 200, margin: "auto" }}>
                  <img width={200} height={200} style={{ objectFit: "contain" }} src={img || OmranLogo} />
                  <Button variant="contained" component="label" fullWidth>
                    انتخاب تصویر
                    <input
                      accept='image/*'
                      type="file"
                      hidden
                      ref={image}
                      onChange={async () => {
                        setImg(await toBase64(image.current!.files[0]));
                      }}
                    />
                  </Button>
                </Box>
              </Grid>
              <Grid item md={6} xs={12}>
                <EditPdf
                  pdf={pdf}
                  pdfLink={pdfLink}
                  loading={loading}
                  setPdf={setPdf}
                  setLoading={setLoading}
                  pdfRef={pdfRef}
                />
              </Grid>
              <Grid item xs={12}>
                <ButtonsModal
                  textSubmit={"ذخیره"}
                  textClose={"انصراف"}
                  onClose={() => {
                    setEdit(null);
                    setPdf('');
                    editFormik.handleReset(1);
                  }}
                />
              </Grid>
            </Grid>
          </form>
        </ModalIpa>
      ) : null}
      {remove ? (
        <ModalIpa open={Boolean(remove)} title={`آیا از حذف مجوز اجرایی مطمئن هستید؟`} onClose={() => setRemove(null)}>
          <form onSubmit={handleRemove}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <ButtonsModal
                  textSubmit={"تایید"}
                  textClose={"انصراف"}
                  onClose={() => {
                    setRemove(false);
                  }}
                />
              </Grid>
            </Grid>
          </form>
        </ModalIpa>
      ) : null}
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
                src={picturePath ? picturePath : ""}
                style={{ objectFit: "contain", height: "100%", maxHeight: "80vh", width: "100%" }}
              />
            </Grid>
          </Grid>
        </ModalIpa>
      ) : null}
      {verify ? (
        <ModalIpa open={Boolean(verify)} title={`آیا از تایید مجوز اجرایی مطمئن هستید؟`} onClose={() => setVerify(null)}>
          <form onSubmit={handleVerify}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <ButtonsModal
                  textSubmit={"تایید"}
                  textClose={"انصراف"}
                  onClose={() => {
                    setVerify(null);
                  }}
                />
              </Grid>
            </Grid>
          </form>
        </ModalIpa>
      ) : null}
      {reject ?
          <AreYouSure
              onClose={() => setReject(null)}
              FormOnSubmit={handleReject}
              open={Boolean(reject)}
              title={"گزارش جهت بررسی و اصلاح به سطح قبل باز می گردد!"}/>
          : null
      }
      {verifyAll ? (
        <ModalIpa
          open={Boolean(verifyAll)}
          title={`آیا از تایید تمام مجوزات اجرایی مطمئن هستید؟`}
          onClose={() => setVerifyAll(false)}
        >
          <form onSubmit={handleVerifyAll}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <ButtonsModal
                  textSubmit={"تایید"}
                  textClose={"انصراف"}
                  onClose={() => {
                    setVerifyAll(false);
                  }}
                />
              </Grid>
            </Grid>
          </form>
        </ModalIpa>
      ) : null}
      {showModalDateCopyRow ? (
        <ModalIpa title={"کپی گزارش"} open={!!showModalDateCopyRow} onClose={() => handleCloseModalDateCopyRow()}>
          <form noValidate onSubmit={copyRowFormik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item md={6} xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFnsJalali}>
                  <DatePicker
                    disabled
                    label={"از تاریخ"}
                    value={moment(copyRowFormik.values.fromDate).toDate()}
                    onChange={(newValue: any) => copyRowFormik.setFieldValue("fromDate", moment(newValue).locale("en").format("YYYY-MM-DD"))}
                    sx={{ width: "100%" }}
                  />
                </LocalizationProvider>
                <Box component="span" sx={{color: red[600], fontSize: "0.85rem"}}>
                  {copyRowFormik.touched.fromDate && copyRowFormik.errors.fromDate}
                  {copyRowFormik.touched.fromDate && Boolean(copyRowFormik.errors.fromDate)}
                </Box>
              </Grid>
              <Grid item md={6} xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFnsJalali}>
                  <DatePicker
                    label={"به تاریخ"}
                    value={moment(copyRowFormik.values.toDate).toDate()}
                    onChange={(newValue: any) => copyRowFormik.setFieldValue("toDate", moment(newValue).locale("en").format("YYYY-MM-DD"))}
                    sx={{ width: "100%" }}
                  />
                </LocalizationProvider>
                <Box component="span" sx={{color: red[600], fontSize: "0.85rem"}}>
                  {copyRowFormik.touched.toDate && copyRowFormik.errors.toDate}
                  {copyRowFormik.touched.toDate && Boolean(copyRowFormik.errors.toDate)}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <ButtonsModal textSubmit={"تایید"} textClose={"انصراف"} onClose={() => handleCloseModalDateCopyRow()} />
              </Grid>
            </Grid>
          </form>
        </ModalIpa>
      ) : null}
    </Grid>
  );
}

export { LicensesReportDailyPage };