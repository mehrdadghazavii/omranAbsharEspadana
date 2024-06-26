import React, { useEffect, useState } from "react";
import {Alert, Box, Grid, Paper, TextField, useTheme} from "@mui/material";
import {
  Delete,
  Edit,
  Settings,
  ThumbDown,
  ThumbUp,
} from "@mui/icons-material";
import {
  deleteContructorOfProject,
  getActivityTypesByProjectId,
  getContructorsByProjectId,
  getContructorsOfProject,
  postContructorAtProject,
  postConstructorName,
  putContructorAtProject,
  verifyAllContructors,
  verifyCurrentContructor,
  postActivityType,
  postCopyRecords,
  rejectDailyReports, getVerifiedForBadge,
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
import {
  handleSetVerifiedBadge,
  handleShowCopyRowInItem,
  handleShowModalDateCopyRow,
  setToggleDetails
} from "../../../../redux/actions/actions";
import { Dispatch } from "redux";
import { connect, useDispatch, useSelector } from "react-redux";
import Autosuggest from "react-autosuggest";
import { red } from "@mui/material/colors";
import moment from "jalali-moment";
import { currentPageNumber } from "../../../../utils/currentPage-number";
import {rejectApiTypes} from "../../../../utils/rejectApiType";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFnsJalali } from "@mui/x-date-pickers/AdapterDateFnsJalali";
import { DatePicker } from "@mui/x-date-pickers";
import AreYouSure from "../../../../components/are-you-sure/AreYouSure";

const columns: Column[] = [
  {
    id: "counter",
    label: "#",
    align: "center",
    minWidth: 20,
  },
  {
    id: "activityTypeName",
    label: "نام فعالیت",
    align: "left",
    minWidth: 120,
  },
  {
    id: "contructorName",
    label: "نام پیمانکار",
    align: "left",
    minWidth: 120,
  },
  {
    id: "action",
    label: "عملیات",
    align: "center",
    minWidth: 60,
  },
];

function ContructorReportDailyPage({ date, toggleDetails, setToggleDetails }: any) {
  const [rows, setRows] = useState<any>(null);
  const [filteredRow, setFilteredRow] = useState<any>([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState<any>(10);
  const [add, setAdd] = useState<any>(null);
  const [edit, setEdit] = useState<any>(null);
  const [keySearch, setKeySearch] = useState<any>("");
  const [remove, setRemove] = useState<any>(null);
  const [contructors, setContructors] = useState<any>(null);
  const [activityTypes, setActivityTypes] = useState<any>(null);
  const [verify, setVerify] = useState<any>(null);
  const [verifyAll, setVerifyAll] = useState(false);
  const [reject, setReject] = useState<any>(null);
  const [checkedIdList, setCheckedIdList] = useState([]);
  const [checkedAllSelect, setCheckAllSelected] = useState(false);

  useEffect(() => {
    getAllNeedData();
    copyRowFormik.setFieldValue("fromDate", startDate);
  }, [date]);

  //@ts-ignore
  const darkMode = useSelector((state: any) => state?.dark);
  const { userType } = useSelector((state: any) => state.userAccess);
  const showCheckboxColumn = useSelector((state: any) => state.showCopyRowInItem);
  const showModalDateCopyRow = useSelector((state: any) => state.showModalDateCopyRow);
  const currentPage = useSelector((state: any) => state.currentPage);
  const startDate = useSelector((state: any) => state.startDate);

  const { projectId } = useParams();
  const dispatch = useDispatch();
  const errColor = red[600];

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

  const validation = Yup.object({
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
    validationSchema: validation,
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

  const addValidation = Yup.object({
    ActivityTypeId: Yup.string().required("نباید خالی باشد"),
    ContructorNameId: Yup.string().required("نباید خالی باشد"),
    Amount: Yup.number().test("باید عدد بزرگتر از صفر باشد", "باید عدد بزرگتر از صفر باشد", function (value) {
      return +value >= 0;
    }),
    WorkManQty: Yup.number().test("باید عدد بزرگتر از صفر باشد", "باید عدد بزرگتر از صفر باشد", function (value) {
      return +value >= 0;
    }),
    Cost: Yup.number().test("باید عدد بزرگتر از صفر باشد", "باید عدد بزرگتر از صفر باشد", function (value) {
      return +value >= 0;
    }),
    ExpertQty: Yup.number().test("باید عدد بزرگتر از صفر باشد", "باید عدد بزرگتر از صفر باشد", function (value) {
      return +value >= 0;
    }),
    SimpleWorkerQty: Yup.number().test("باید عدد بزرگتر از صفر باشد", "باید عدد بزرگتر از صفر باشد", function (value) {
      return +value >= 0;
    }),
    TechnicalWorkerQty: Yup.number().test("باید عدد بزرگتر از صفر باشد", "باید عدد بزرگتر از صفر باشد", function (value) {
      return +value >= 0;
    }),
  });

  const editValidation = Yup.object({
    ActivityTypeId: Yup.string().required("نباید خالی باشد"),
    ContructorNameId: Yup.string().required("نباید خالی باشد"),
    Amount: Yup.number().test("باید عدد بزرگتر از صفر باشد", "باید عدد بزرگتر از صفر باشد", function (value) {
      return +value >= 0;
    }),
    WorkManQty: Yup.number().test("باید عدد بزرگتر از صفر باشد", "باید عدد بزرگتر از صفر باشد", function (value) {
      return +value >= 0;
    }),
    Cost: Yup.number().test("باید عدد بزرگتر از صفر باشد", "باید عدد بزرگتر از صفر باشد", function (value) {
      return +value >= 0;
    }),
    ExpertQty: Yup.number().test("باید عدد بزرگتر از صفر باشد", "باید عدد بزرگتر از صفر باشد", function (value) {
      return +value >= 0;
    }),
    SimpleWorkerQty: Yup.number().test("باید عدد بزرگتر از صفر باشد", "باید عدد بزرگتر از صفر باشد", function (value) {
      return +value >= 0;
    }),
    TechnicalWorkerQty: Yup.number().test("باید عدد بزرگتر از صفر باشد", "باید عدد بزرگتر از صفر باشد", function (value) {
      return +value >= 0;
    }),
  });

  const addFormik = useFormik({
    initialValues: {
      ActivityCode: "",
      ActivityTypeId: "",
      Amount: 0,
      ContructorNameId: "",
      Cost: 0,
      Description: "",
      ExpertQty: 0,
      lastUserLevel: 1,
      Location: "",
      OperationDescription: "",
      projectId: projectId,
      ReportDate: date,
      SimpleWorkerQty: 0,
      TechnicalWorkerQty: 0,
      Unit: "",
      Verify: 0,
      WorkManQty: 0,
    },
    validationSchema: addValidation,
    onSubmit: async (values, { resetForm }) => {
      values.ReportDate = date;
      if (values.ContructorNameId !== selectSuggestions || values.ActivityTypeId !== selectSuggestionsActivityType) {
        if (values.ContructorNameId !== selectSuggestions && values.ActivityTypeId === selectSuggestionsActivityType) {
          const conDet: any = await postConstructorName({
            Name: values.ContructorNameId,
            ProjectId: values.projectId,
          });
          const actId = activityTypes.find((item: any) => item.name === values.ActivityTypeId);
          const res = await postContructorAtProject({ ...values, ContructorNameId: conDet?.id, ActivityTypeId: actId?.id });
          if (!(res instanceof Error)) {
            setAdd(null);
            toast.success("پیمانکار با موفقیت درج شد");
            await refreshContructors();
            // search(keySearch)
            resetForm();
          } else {
            toast.error("درج پیمانکار با خطا مواجه شد");
          }
        }

        if (values.ContructorNameId === selectSuggestions && values.ActivityTypeId !== selectSuggestionsActivityType) {
          const actDet: any = await postActivityType({
            Name: values.ActivityTypeId,
            ProjectId: values.projectId,
          });
          const contId = contructors.find((item: any) => item.contructorName === values.ContructorNameId);
          const res = await postContructorAtProject({
            ...values,
            ActivityTypeId: actDet?.id,
            ContructorNameId: contId.contructorNameId,
          });
          if (!(res instanceof Error)) {
            setAdd(null);
            toast.success("پیمانکار با موفقیت درج شد");
            await refreshContructors();
            // search(keySearch)
            resetForm();
          } else {
            toast.error("درج پیمانکار با خطا مواجه شد");
          }
        }

        if (values.ContructorNameId !== selectSuggestions && values.ActivityTypeId !== selectSuggestionsActivityType) {
          const actDet: any = await postActivityType({
            Name: values.ActivityTypeId,
            ProjectId: values.projectId,
          });
          const conDet: any = await postConstructorName({
            Name: values.ContructorNameId,
            ProjectId: values.projectId,
          });

          const res = await postContructorAtProject({ ...values, ActivityTypeId: actDet?.id, ContructorNameId: conDet?.id });
          if (!(res instanceof Error)) {
            setAdd(null);
            toast.success("پیمانکار با موفقیت درج شد");
            await refreshContructors();
            // search(keySearch)
            resetForm();
          } else {
            toast.error("درج پیمانکار با خطا مواجه شد");
          }
        }
      } else {
        const contId = contructors.find((item: any) => item.contructorName === values.ContructorNameId);
        const actId = activityTypes.find((item: any) => item.name === values.ActivityTypeId);

        const res = await postContructorAtProject({
          ...values,
          ContructorNameId: contId.contructorNameId,
          ActivityTypeId: actId.id,
        });
        if (!(res instanceof Error)) {
          setAdd(null);
          toast.success("پیمانکار با موفقیت درج شد");
          await refreshContructors();
          // search(keySearch)
          resetForm();
        } else {
          toast.error("درج پیمانکار با خطا مواجه شد");
        }
      }
    },
  });
  const editFormik = useFormik({
    initialValues: {
      ActivityCode: "",
      ActivityTypeId: "",
      Amount: 0,
      ContructorNameId: "",
      Cost: 0,
      Description: "",
      ExpertQty: 0,
      lastUserLevel: 1,
      Location: "",
      OperationDescription: "",
      projectId: projectId,
      ReportDate: date,
      SimpleWorkerQty: 0,
      TechnicalWorkerQty: 0,
      Unit: "",
      Verify: 0,
      WorkManQty: 0,
    },
    validationSchema: editValidation,
    onSubmit: async (values, { resetForm }) => {
      if (values.ContructorNameId !== selectSuggestions || values.ActivityTypeId !== selectSuggestionsActivityType) {
        if (values.ContructorNameId !== selectSuggestions && values.ActivityTypeId === selectSuggestionsActivityType) {
          const conDet: any = await postConstructorName({
            Name: values.ContructorNameId,
            ProjectId: values.projectId,
          });
          const actId = activityTypes.find((item: any) => item.name === values.ActivityTypeId);
          const res = await putContructorAtProject(
            { ...values, Id: edit.id, ContructorNameId: conDet?.id, ActivityTypeId: actId?.id },
            edit.id
          );
          if (!(res instanceof Error)) {
            setEdit(null);
            toast.success("پیمانکار با موفقیت ویرایش شد");
            await refreshContructors();
            // search(keySearch)
            resetForm();
          } else {
            toast.error("ویرایش پیمانکار با خطا مواجه شد");
          }
        }

        if (values.ContructorNameId === selectSuggestions && values.ActivityTypeId !== selectSuggestionsActivityType) {
          const actDet: any = await postActivityType({
            Name: values.ActivityTypeId,
            ProjectId: values.projectId,
          });
          const contId = contructors.find((item: any) => item.contructorName === values.ContructorNameId);
          const res = await putContructorAtProject(
            { ...values, Id: edit.id, ActivityTypeId: actDet?.id, ContructorNameId: contId.contructorNameId },
            edit.id
          );
          if (!(res instanceof Error)) {
            setEdit(null);
            toast.success("پیمانکار با موفقیت ویرایش شد");
            await refreshContructors();
            // search(keySearch)
            resetForm();
          } else {
            toast.error("ویرایش پیمانکار با خطا مواجه شد");
          }
        }

        if (values.ContructorNameId !== selectSuggestions && values.ActivityTypeId !== selectSuggestionsActivityType) {
          const actDet: any = await postActivityType({
            Name: values.ActivityTypeId,
            ProjectId: values.projectId,
          });
          const conDet: any = await postConstructorName({
            Name: values.ContructorNameId,
            ProjectId: values.projectId,
          });

          const res = await putContructorAtProject(
            { ...values, Id: edit.id, ActivityTypeId: actDet?.id, ContructorNameId: conDet?.id },
            edit.id
          );
          if (!(res instanceof Error)) {
            setEdit(null);
            toast.success("پیمانکار با موفقیت ویرایش شد");
            await refreshContructors();
            // search(keySearch)
            resetForm();
          } else {
            toast.error("ویرایش پیمانکار با خطا مواجه شد");
          }
        }
      } else {
        const contId = contructors.find((item: any) => item.contructorName === values.ContructorNameId);
        const actId = activityTypes.find((item: any) => item.name === values.ActivityTypeId);

        const res = await putContructorAtProject(
          { ...values, Id: edit.id, ContructorNameId: contId.contructorNameId, ActivityTypeId: actId.id },
          edit.id
        );
        if (!(res instanceof Error)) {
          setEdit(null);
          toast.success("پیمانکار با موفقیت ویرایش شد");
          await refreshContructors();
          // search(keySearch)
          resetForm();
        } else {
          toast.error("ویرایش پیمانکار با خطا مواجه شد");
        }
      }
    },
  });

  useEffect(() => {
    if (edit) {
      console.log(edit);
      editFormik.setValues({
        ActivityCode: edit.activityCode,
        ActivityTypeId: edit.activityTypeName,
        Amount: +edit.amount,
        ContructorNameId: edit.contructorName,
        Cost: edit.cost,
        Description: edit.description,
        ExpertQty: edit.expertQty,
        lastUserLevel: edit.lastUserLevel,
        Location: edit.location,
        OperationDescription: edit.operationDescription,
        projectId: projectId,
        ReportDate: date,
        SimpleWorkerQty: edit.simpleWorkerQty,
        TechnicalWorkerQty: edit.technicalWorkerQty,
        Unit: edit.unit,
        Verify: edit.verify,
        WorkManQty: edit.workManQty,
      });
    }
  }, [edit]);
  const handleRemoveContructor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await deleteContructorOfProject(remove, projectId);
    if (!(res instanceof Error)) {
      const tmpRows = [...rows];
      const index = tmpRows.findIndex((row) => row.id === remove);
      await tmpRows.splice(index, 1);
      setRows(tmpRows);
      setRemove(null);
      toast.success("کاربر با موفقیت حذف شد");
    } else {
      toast.error("حذف کاربر با خطا مواجه شد");
    }
  };

  const handleVerifyContructor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await verifyCurrentContructor(verify, projectId);
    if (!(res instanceof Error)) {
      const tmpRows = [...rows];
      const index = tmpRows.findIndex((row) => row.id === verify);
      tmpRows[index].verify = 1;
      setRows(tmpRows);
      setVerify(null);
      await refreshContructors();
      toast.success("پیمانکار با موفقیت تایید شد");
    } else {
      toast.error("تایید پیمانکار با خطا مواجه شد");
    }
  };

  const handleReject = async (event) => {
    event.preventDefault();
    const res = await rejectDailyReports(reject, rejectApiTypes.Contractor, projectId);
    if (!(res instanceof Error)) {
      setRows(rows.filter(row => row.id !== reject));
      setReject(null);
      toast.success("گزارش رد و به سطح قبلی ارجاع داده شد");
    } else {
      toast.error("خطا در رَد گزارش");
    }
  }

  const handleVerifyAll = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await verifyAllContructors(projectId, date);
    if (!(res instanceof Error)) {
      const tmpRows = [...rows];
      for (let i = 0; i < tmpRows.length; i++) {
        tmpRows[i].verify = 1;
      }
      setRows(tmpRows);
      setVerifyAll(false);
      await refreshContructors();
      toast.success("تمام پیمانکار ها تایید شدند");
    } else {
      toast.error("تایید پیمانکار ها با خطا مواجه شد");
    }
  };

  const refreshContructors = async () => {
    const res = await getContructorsByProjectId(projectId, date);
    const resActvTypes = await getActivityTypesByProjectId(projectId);
    const resContructors = await getContructorsOfProject(projectId);

    if (!(res instanceof Error)) {
      setRows(res);
      setFilteredRow(res);
      // @ts-ignore
      setCount(res.length);
    } else {
      toast.error("دریافت داده با خطا مواجه شد");
    }

    if (!(resActvTypes instanceof Error)) {
      setActivityTypes(resActvTypes);
    } else {
      toast.error("دریافت داده با خطا مواجه شد");
    }

    if (!(resContructors instanceof Error)) {
      setContructors(resContructors);
    } else {
      toast.error("دریافت داده با خطا مواجه شد");
    }
  };

  const getAllNeedData = async () => {
    const res = await getContructorsByProjectId(projectId, date);
    const resActvTypes = await getActivityTypesByProjectId(projectId);
    const resContructors = await getContructorsOfProject(projectId);

    if (!(res instanceof Error)) {
      setRows(res);
      setFilteredRow(res);
      //@ts-ignore
      setCount(res?.length);
    } else {
      setRows([]);
      setFilteredRow([]);
      //@ts-ignore
      setCount(0);
      // toast.error("داده ای وجود نداشت");
    }
    if (!(resActvTypes instanceof Error)) {
      setActivityTypes(resActvTypes);
    }
    if (!(resContructors instanceof Error)) {
      setContructors(resContructors);
    }
    // .catch((err) => toast.error("دریافت داده با خطا مواجه شد"));
  };

  const search = (key: string) => {
    if (key) {
      const filtered = rows.filter((row: any) => row.activityTypeName.includes(key) || row.contructorName.includes(key));
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


  const lowerCasedCompanies = contructors?.map((item: any) => item.contructorName.toLowerCase());
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectSuggestions, setSelectSuggestions] = useState<any>("");

  function getSuggestions(value: string): string[] {
    return lowerCasedCompanies?.filter((item: any) => item.startsWith(value.trim().toLowerCase()));
  }

  const lowerCasedActivityType = activityTypes?.map((item: any) => item.name.toLowerCase());
  const [suggestionsActivityType, setSuggestionsActivityType] = useState<string[]>([]);
  const [selectSuggestionsActivityType, setSelectSuggestionsActivityType] = useState<any>("");

  function getSuggestionsActivityType(value: string): string[] {
    return lowerCasedActivityType?.filter((item: any) => item.startsWith(value.trim().toLowerCase()));
  }

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
                  titleAdd={"درج پیمانکار"}
                  onClickAdd={() => setAdd(true)}
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
          title={"درج پیمانکار"}
          onClose={() => {
            setAdd(null);
            addFormik.handleReset(1);
          }}
        >
          <form noValidate onSubmit={addFormik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item sm={6} xs={12}>
                <Autosuggest
                  name={"ContructorNameId"}
                  id={"ContructorNameId"}
                  error={addFormik.touched.ContructorNameId && Boolean(addFormik.errors.ContructorNameId)}
                  helperText={addFormik.touched.ContructorNameId && addFormik.errors.ContructorNameId}
                  suggestions={suggestions ?? []}
                  onSuggestionsClearRequested={() => setSuggestions([])}
                  onSuggestionsFetchRequested={({ value }: any) => {
                    addFormik.setFieldValue("ContructorNameId", value);
                    setSuggestions(getSuggestions(value));
                  }}
                  onSuggestionSelected={(_: any, { suggestionValue }: any) => {
                    setSelectSuggestions(suggestionValue);
                  }}
                  getSuggestionValue={(suggestion: any) => suggestion}
                  renderSuggestion={(suggestion: any) => <span>{suggestion}</span>}
                  theme={{
                    container: "react-autosuggest__container",
                    containerOpen: "react-autosuggest__container--open",
                    inputOpen: "react-autosuggest__input--open",
                    inputFocused: "react-autosuggest__input--focused",
                    suggestionsContainer: "react-autosuggest__suggestions-container",
                    suggestionsContainerOpen: darkMode
                      ? "react-autosuggest__suggestions-container--open--dark"
                      : "react-autosuggest__suggestions-container--open",
                    suggestionsList: "react-autosuggest__suggestions-list",
                    suggestion: "react-autosuggest__suggestion",
                    suggestionFirst: "react-autosuggest__suggestion--first",
                    suggestionHighlighted: darkMode
                      ? "react-autosuggest__suggestion--highlighted--dark"
                      : "react-autosuggest__suggestion--highlighted",
                    sectionContainer: "react-autosuggest__section-container",
                    sectionContainerFirst: "react-autosuggest__section-container--first",
                    sectionTitle: "react-autosuggest__section-title",
                    input: darkMode
                      ? addFormik.touched.ContructorNameId && Boolean(addFormik.errors.ContructorNameId)
                        ? "react-autosuggest__input__empty--dark"
                        : "react-autosuggest__input--dark"
                      : addFormik.touched.ContructorNameId && Boolean(addFormik.errors.ContructorNameId)
                        ? "react-autosuggest__input__empty"
                        : "react-autosuggest__input",
                  }}
                  inputProps={{
                    placeholder: "پیمانکار*",
                    value: addFormik.values.ContructorNameId,
                    onChange: (_: any, { newValue, method }: any) => {
                      addFormik.setFieldValue("ContructorNameId", newValue);
                    },
                  }}
                  highlightFirstSuggestion={true}
                />
                <Box component="span" sx={{ color: errColor, fontSize: "0.85rem" }}>
                  {addFormik.touched.ContructorNameId && addFormik.errors.ContructorNameId}
                  {addFormik.touched.ContructorNameId && Boolean(addFormik.errors.ContructorNameId)}
                </Box>
              </Grid>
              <Grid item sm={6} xs={12}>
                <Autosuggest
                  name={"ActivityTypeId"}
                  id={"ActivityTypeId"}
                  error={addFormik.touched.ActivityTypeId && Boolean(addFormik.errors.ActivityTypeId)}
                  helperText={addFormik.touched.ActivityTypeId && addFormik.errors.ActivityTypeId}
                  suggestions={suggestionsActivityType ?? []}
                  onSuggestionsClearRequested={() => setSuggestionsActivityType([])}
                  onSuggestionsFetchRequested={({ value }: any) => {
                    addFormik.setFieldValue("ActivityTypeId", value);
                    setSuggestionsActivityType(getSuggestionsActivityType(value));
                  }}
                  onSuggestionSelected={(_: any, { suggestionValue }: any) => {
                    setSelectSuggestionsActivityType(suggestionValue);
                  }}
                  getSuggestionValue={(suggestion: any) => suggestion}
                  renderSuggestion={(suggestion: any) => <span>{suggestion}</span>}
                  theme={{
                    container: "react-autosuggest__container",
                    containerOpen: "react-autosuggest__container--open",
                    inputOpen: "react-autosuggest__input--open",
                    inputFocused: "react-autosuggest__input--focused",
                    suggestionsContainer: "react-autosuggest__suggestions-container",
                    suggestionsContainerOpen: darkMode
                      ? "react-autosuggest__suggestions-container--open--dark"
                      : "react-autosuggest__suggestions-container--open",
                    suggestionsList: "react-autosuggest__suggestions-list",
                    suggestion: "react-autosuggest__suggestion",
                    suggestionFirst: "react-autosuggest__suggestion--first",
                    suggestionHighlighted: darkMode
                      ? "react-autosuggest__suggestion--highlighted--dark"
                      : "react-autosuggest__suggestion--highlighted",
                    sectionContainer: "react-autosuggest__section-container",
                    sectionContainerFirst: "react-autosuggest__section-container--first",
                    sectionTitle: "react-autosuggest__section-title",
                    input: darkMode
                      ? addFormik.touched.ActivityTypeId && Boolean(addFormik.errors.ActivityTypeId)
                        ? "react-autosuggest__input__empty--dark"
                        : "react-autosuggest__input--dark"
                      : addFormik.touched.ActivityTypeId && Boolean(addFormik.errors.ActivityTypeId)
                        ? "react-autosuggest__input__empty"
                        : "react-autosuggest__input",
                  }}
                  inputProps={{
                    placeholder: "نوع فعالیت*",
                    value: addFormik.values.ActivityTypeId,
                    onChange: (_: any, { newValue, method }: any) => {
                      addFormik.setFieldValue("ActivityTypeId", newValue);
                    },
                  }}
                  highlightFirstSuggestion={true}
                />
                <Box component="span" sx={{ color: errColor, fontSize: "0.85rem" }}>
                  {addFormik.touched.ActivityTypeId && addFormik.errors.ActivityTypeId}
                  {addFormik.touched.ActivityTypeId && Boolean(addFormik.errors.ActivityTypeId)}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name={"ExpertQty"}
                  onChange={addFormik.handleChange}
                  value={addFormik.values.ExpertQty}
                  error={addFormik.touched.ExpertQty && Boolean(addFormik.errors.ExpertQty)}
                  helperText={addFormik.touched.ExpertQty && addFormik.errors.ExpertQty}
                  fullWidth
                  type={"number"}
                  label="تعداد کارشناس"
                  variant="outlined"
                />
              </Grid>
              <Grid item sm={4} xs={12}>
                <TextField
                  name={"WorkManQty"}
                  fullWidth
                  onChange={addFormik.handleChange}
                  value={addFormik.values.WorkManQty}
                  error={addFormik.touched.WorkManQty && Boolean(addFormik.errors.WorkManQty)}
                  helperText={addFormik.touched.WorkManQty && addFormik.errors.WorkManQty}
                  type={"number"}
                  label="تعداد استاد کار"
                  variant="outlined"
                />
              </Grid>
              <Grid item sm={4} xs={12}>
                <TextField
                  name={"TechnicalWorkerQty"}
                  fullWidth
                  onChange={addFormik.handleChange}
                  value={addFormik.values.TechnicalWorkerQty}
                  error={addFormik.touched.TechnicalWorkerQty && Boolean(addFormik.errors.TechnicalWorkerQty)}
                  helperText={addFormik.touched.TechnicalWorkerQty && addFormik.errors.TechnicalWorkerQty}
                  type={"number"}
                  label="تعداد کارگر فنی"
                  variant="outlined"
                />
              </Grid>
              <Grid item sm={4} xs={12}>
                <TextField
                  name={"SimpleWorkerQty"}
                  onChange={addFormik.handleChange}
                  value={addFormik.values.SimpleWorkerQty}
                  error={addFormik.touched.SimpleWorkerQty && Boolean(addFormik.errors.SimpleWorkerQty)}
                  helperText={addFormik.touched.SimpleWorkerQty && addFormik.errors.SimpleWorkerQty}
                  fullWidth
                  type={"number"}
                  label="تعداد کارگر ساده"
                  variant="outlined"
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <TextField
                  name={"OperationDescription"}
                  onChange={addFormik.handleChange}
                  value={addFormik.values.OperationDescription}
                  error={addFormik.touched.OperationDescription && Boolean(addFormik.errors.OperationDescription)}
                  helperText={addFormik.touched.OperationDescription && addFormik.errors.OperationDescription}
                  fullWidth
                  label="شرح عملیات"
                  variant="outlined"
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <TextField
                  fullWidth
                  name={"Location"}
                  onChange={addFormik.handleChange}
                  value={addFormik.values.Location}
                  error={addFormik.touched.SimpleWorkerQty && Boolean(addFormik.errors.Location)}
                  helperText={addFormik.touched.Location && addFormik.errors.Location}
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
                  type={"number"}
                  label="مقدار"
                  variant="outlined"
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <TextField
                  fullWidth
                  name={"Unit"}
                  onChange={addFormik.handleChange}
                  value={addFormik.values.Unit}
                  error={addFormik.touched.Unit && Boolean(addFormik.errors.Unit)}
                  helperText={addFormik.touched.Unit && addFormik.errors.Unit}
                  label="واحد"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name={"Cost"}
                  onChange={addFormik.handleChange}
                  value={addFormik.values.Cost}
                  error={addFormik.touched.Cost && Boolean(addFormik.errors.Cost)}
                  helperText={addFormik.touched.Cost && addFormik.errors.Cost}
                  fullWidth
                  type={"number"}
                  label="هزینه (تومان)"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
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
              <Grid item xs={12}>
                <TextField
                  name={"ActivityCode"}
                  onChange={addFormik.handleChange}
                  value={addFormik.values.ActivityCode}
                  error={addFormik.touched.ActivityCode && Boolean(addFormik.errors.ActivityCode)}
                  helperText={addFormik.touched.ActivityCode && addFormik.errors.ActivityCode}
                  fullWidth
                  label="کد فعالیت"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <ButtonsModal
                  textSubmit={"ذخیره"}
                  textClose={"انصراف"}
                  onClose={() => {
                    setAdd(null);
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
          title={edit.contructorName}
          onClose={() => {
            setEdit(null);
            editFormik.handleReset(1);
          }}
        >
          <form noValidate onSubmit={editFormik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item sm={6} xs={12}>
                <Autosuggest
                  name={"ContructorNameId"}
                  id={"ContructorNameId"}
                  error={editFormik.touched.ContructorNameId && Boolean(editFormik.errors.ContructorNameId)}
                  helperText={editFormik.touched.ContructorNameId && editFormik.errors.ContructorNameId}
                  suggestions={suggestions ?? []}
                  onSuggestionsClearRequested={() => setSuggestions([])}
                  onSuggestionsFetchRequested={({ value }: any) => {
                    editFormik.setFieldValue("ContructorNameId", value);
                    setSuggestions(getSuggestions(value));
                  }}
                  onSuggestionSelected={(_: any, { suggestionValue }: any) => {
                    setSelectSuggestions(suggestionValue);
                  }}
                  getSuggestionValue={(suggestion: any) => suggestion}
                  renderSuggestion={(suggestion: any) => <span>{suggestion}</span>}
                  theme={{
                    container: "react-autosuggest__container",
                    containerOpen: "react-autosuggest__container--open",
                    inputOpen: "react-autosuggest__input--open",
                    inputFocused: "react-autosuggest__input--focused",
                    suggestionsContainer: "react-autosuggest__suggestions-container",
                    suggestionsContainerOpen: darkMode
                      ? "react-autosuggest__suggestions-container--open--dark"
                      : "react-autosuggest__suggestions-container--open",
                    suggestionsList: "react-autosuggest__suggestions-list",
                    suggestion: "react-autosuggest__suggestion",
                    suggestionFirst: "react-autosuggest__suggestion--first",
                    suggestionHighlighted: darkMode
                      ? "react-autosuggest__suggestion--highlighted--dark"
                      : "react-autosuggest__suggestion--highlighted",
                    sectionContainer: "react-autosuggest__section-container",
                    sectionContainerFirst: "react-autosuggest__section-container--first",
                    sectionTitle: "react-autosuggest__section-title",
                    input: darkMode
                      ? editFormik.touched.ContructorNameId && Boolean(editFormik.errors.ContructorNameId)
                        ? "react-autosuggest__input__empty--dark"
                        : "react-autosuggest__input--dark"
                      : editFormik.touched.ContructorNameId && Boolean(editFormik.errors.ContructorNameId)
                        ? "react-autosuggest__input__empty"
                        : "react-autosuggest__input",
                  }}
                  inputProps={{
                    placeholder: "پیمانکار*",
                    value: editFormik.values.ContructorNameId,
                    onChange: (_: any, { newValue, method }: any) => {
                      editFormik.setFieldValue("ContructorNameId", newValue);
                    },
                  }}
                  highlightFirstSuggestion={true}
                />
                <Box component="span" sx={{ color: errColor, fontSize: "0.85rem" }}>
                  {editFormik.touched.ContructorNameId && editFormik.errors.ContructorNameId}
                  {editFormik.touched.ContructorNameId && Boolean(editFormik.errors.ContructorNameId)}
                </Box>
              </Grid>

              <Grid item sm={6} xs={12}>
                <Autosuggest
                  name={"ActivityTypeId"}
                  id={"ActivityTypeId"}
                  error={editFormik.touched.ActivityTypeId && Boolean(editFormik.errors.ActivityTypeId)}
                  helperText={editFormik.touched.ActivityTypeId && editFormik.errors.ActivityTypeId}
                  suggestions={suggestionsActivityType ?? []}
                  onSuggestionsClearRequested={() => setSuggestionsActivityType([])}
                  onSuggestionsFetchRequested={({ value }: any) => {
                    editFormik.setFieldValue("ActivityTypeId", value);
                    setSuggestionsActivityType(getSuggestionsActivityType(value));
                  }}
                  onSuggestionSelected={(_: any, { suggestionValue }: any) => {
                    setSelectSuggestionsActivityType(suggestionValue);
                  }}
                  getSuggestionValue={(suggestion: any) => suggestion}
                  renderSuggestion={(suggestion: any) => <span>{suggestion}</span>}
                  theme={{
                    container: "react-autosuggest__container",
                    containerOpen: "react-autosuggest__container--open",
                    inputOpen: "react-autosuggest__input--open",
                    inputFocused: "react-autosuggest__input--focused",
                    suggestionsContainer: "react-autosuggest__suggestions-container",
                    suggestionsContainerOpen: darkMode
                      ? "react-autosuggest__suggestions-container--open--dark"
                      : "react-autosuggest__suggestions-container--open",
                    suggestionsList: "react-autosuggest__suggestions-list",
                    suggestion: "react-autosuggest__suggestion",
                    suggestionFirst: "react-autosuggest__suggestion--first",
                    suggestionHighlighted: darkMode
                      ? "react-autosuggest__suggestion--highlighted--dark"
                      : "react-autosuggest__suggestion--highlighted",
                    sectionContainer: "react-autosuggest__section-container",
                    sectionContainerFirst: "react-autosuggest__section-container--first",
                    sectionTitle: "react-autosuggest__section-title",
                    input: darkMode
                      ? editFormik.touched.ActivityTypeId && Boolean(editFormik.errors.ActivityTypeId)
                        ? "react-autosuggest__input__empty--dark"
                        : "react-autosuggest__input--dark"
                      : editFormik.touched.ActivityTypeId && Boolean(editFormik.errors.ActivityTypeId)
                        ? "react-autosuggest__input__empty"
                        : "react-autosuggest__input",
                  }}
                  inputProps={{
                    placeholder: "نوع فعالیت*",
                    value: editFormik.values.ActivityTypeId,
                    onChange: (_: any, { newValue, method }: any) => {
                      editFormik.setFieldValue("ActivityTypeId", newValue);
                    },
                  }}
                  highlightFirstSuggestion={true}
                />
                <Box component="span" sx={{ color: errColor, fontSize: "0.85rem" }}>
                  {editFormik.touched.ActivityTypeId && editFormik.errors.ActivityTypeId}
                  {editFormik.touched.ActivityTypeId && Boolean(editFormik.errors.ActivityTypeId)}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name={"ExpertQty"}
                  onChange={editFormik.handleChange}
                  value={editFormik.values.ExpertQty}
                  error={editFormik.touched.ExpertQty && Boolean(editFormik.errors.ExpertQty)}
                  helperText={editFormik.touched.ExpertQty && editFormik.errors.ExpertQty}
                  fullWidth
                  type={"number"}
                  label="تعداد کارشناس"
                  variant="outlined"
                />
              </Grid>
              <Grid item sm={4} xs={12}>
                <TextField
                  name={"WorkManQty"}
                  onChange={editFormik.handleChange}
                  value={editFormik.values.WorkManQty}
                  error={editFormik.touched.WorkManQty && Boolean(editFormik.errors.WorkManQty)}
                  helperText={editFormik.touched.WorkManQty && editFormik.errors.WorkManQty}
                  fullWidth
                  type={"number"}
                  label="تعداد استاد کار"
                  variant="outlined"
                />
              </Grid>
              <Grid item sm={4} xs={12}>
                <TextField
                  name={"TechnicalWorkerQty"}
                  onChange={editFormik.handleChange}
                  value={editFormik.values.TechnicalWorkerQty}
                  error={editFormik.touched.TechnicalWorkerQty && Boolean(editFormik.errors.TechnicalWorkerQty)}
                  helperText={editFormik.touched.TechnicalWorkerQty && editFormik.errors.TechnicalWorkerQty}
                  fullWidth
                  type={"number"}
                  label="تعداد کارگر فنی"
                  variant="outlined"
                />
              </Grid>
              <Grid item sm={4} xs={12}>
                <TextField
                  name={"SimpleWorkerQty"}
                  onChange={editFormik.handleChange}
                  value={editFormik.values.SimpleWorkerQty}
                  error={editFormik.touched.SimpleWorkerQty && Boolean(editFormik.errors.SimpleWorkerQty)}
                  helperText={editFormik.touched.SimpleWorkerQty && editFormik.errors.SimpleWorkerQty}
                  fullWidth
                  type={"number"}
                  label="تعداد کارگر ساده"
                  variant="outlined"
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <TextField
                  name={"OperationDescription"}
                  onChange={editFormik.handleChange}
                  value={editFormik.values.OperationDescription}
                  error={editFormik.touched.OperationDescription && Boolean(editFormik.errors.OperationDescription)}
                  helperText={editFormik.touched.OperationDescription && editFormik.errors.OperationDescription}
                  fullWidth
                  label="شرح عملیات"
                  variant="outlined"
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <TextField
                  name={"Location"}
                  onChange={editFormik.handleChange}
                  value={editFormik.values.Location}
                  error={editFormik.touched.SimpleWorkerQty && Boolean(editFormik.errors.Location)}
                  helperText={editFormik.touched.Location && editFormik.errors.Location}
                  fullWidth
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
                  type={"number"}
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
                  name={"Cost"}
                  onChange={editFormik.handleChange}
                  value={editFormik.values.Cost}
                  error={editFormik.touched.Cost && Boolean(editFormik.errors.Cost)}
                  helperText={editFormik.touched.Cost && editFormik.errors.Cost}
                  fullWidth
                  type={"number"}
                  label="هزینه (تومان)"
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
              <Grid item xs={12}>
                <TextField
                  name={"ActivityCode"}
                  onChange={editFormik.handleChange}
                  value={editFormik.values.ActivityCode}
                  error={editFormik.touched.ActivityCode && Boolean(editFormik.errors.ActivityCode)}
                  helperText={editFormik.touched.ActivityCode && editFormik.errors.ActivityCode}
                  fullWidth
                  label="کد فعالیت"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <ButtonsModal
                  textSubmit={"ذخیره"}
                  textClose={"انصراف"}
                  onClose={() => {
                    setEdit(null);
                    editFormik.handleReset(1);
                  }}
                />
              </Grid>
            </Grid>
          </form>
        </ModalIpa>
      ) : null}
      {remove ? (
        <ModalIpa open={Boolean(remove)} title={`آیا از حذف پیمانکار مطمئن هستید؟`} onClose={() => setRemove(null)}>
          <form onSubmit={handleRemoveContructor}>
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
      {verify ? (
        <ModalIpa open={Boolean(verify)} title={`آیا از تایید پیمانکار مطمئن هستید؟`} onClose={() => setVerify(null)}>
          <form onSubmit={handleVerifyContructor}>
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
          title={`آیا از تایید تمام پیمانکار ها مطمئن هستید؟`}
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

const mapStateToProps = (state: any) => {
  return {
    toggleDetails: state.toggleDetails,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    setToggleDetails: (value: any) => dispatch(setToggleDetails(value)),
  };
};

const reduxHeade = connect(mapStateToProps, mapDispatchToProps)(ContructorReportDailyPage);

export { reduxHeade as ContructorReportDailyPage };
