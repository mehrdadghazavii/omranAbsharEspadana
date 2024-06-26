import React, { useEffect, useRef, useState } from "react";
import {Alert, Autocomplete, Box, Button, Grid, Paper, TextField, useTheme} from "@mui/material";
import {Delete, Edit, ThumbDown, Settings, ThumbUp} from "@mui/icons-material";
import {
  deleteFinanceOfProject,
  getCostTypes,
  getCountersPartiesOfProject,
  getDailyFinanceInfoByProjectId,
  getFinanceInfoOfProject,
  postFinanceAtProject,
  PostOrPutFinanceProps,
  putFinanceAtProject,
  uploadImageFinance,
  verifyAllFinances,
  verifyCurrentFinance,
  postFinanceInfoesNames,
  GetCounterPartyByProjectIdAndType,
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
import OmranLogo from "../../../../asset/images/mainLogo.png";
import moment from "jalali-moment";
import { AdapterDateFnsJalali } from "@mui/x-date-pickers/AdapterDateFnsJalali";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers";
import Autosuggest from "react-autosuggest";
import { red } from "@mui/material/colors";
import { useDispatch, useSelector } from "react-redux";
import {
  handleSetVerifiedBadge,
  handleShowCopyRowInItem,
  handleShowModalDateCopyRow,
  setToggleDetails
} from "../../../../redux/actions/actions";
import { currentPageNumber } from "../../../../utils/currentPage-number";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import AddPdf from "../../../../components/pdf/addPDF.comp";
import EditPdf from "../../../../components/pdf/editPDF.comp";
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
    id: "startDate",
    label: "تاریخ شروع",
    align: "center",
    minWidth: 80,
    format: (value: any) => new Date(value).toLocaleDateString("fa-IR"),
  },
  {
    id: "endDate",
    label: "تاریخ پایان",
    align: "center",
    minWidth: 80,
    format: (value: any) => new Date(value).toLocaleDateString("fa-IR"),
  },
  {
    id: "costTypeName",
    label: "نوع هزینه",
    align: "left",
    minWidth: 80,
  },
  {
    id: "counterPartyName",
    label: "طرف حساب",
    align: "left",
    minWidth: 80,
  },
  {
    id: "pdfUrl",
    label: "PDF",
    align: "center",
    minWidth: 120,
  },
  {
    id: "action",
    label: "عملیات",
    align: "center",
    minWidth: 60,
  },
];

function FinancesInfoesPaymentReportDailyPage({ date }: any) {
  const [rows, setRows] = useState<any>(null);
  const [filteredRow, setFilteredRow] = useState<any>([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState<any>(10);
  const [add, setAdd] = useState<any>(null);
  const [edit, setEdit] = useState<any>(null);
  const [keySearch, setKeySearch] = useState<any>("");
  const [remove, setRemove] = useState<any>(null);
  const [finances, setFinances] = useState<any>([]);
  const [costTypes, setCostTypes] = useState<any>([]);
  const [cntParties, setCntParties] = useState<any>([]);
  const [verify, setVerify] = useState<any>(null);
  const [verifyAll, setVerifyAll] = useState(false);
  const [reject, setReject] = useState<any>(null);
  const [adaptedCntParties, setAdaptedCntParties] = useState<any>([]);
  const [img, setImg] = useState<any>("");
  const [pdf, setPdf] = useState<any>("");
  const [pdfLink, setPdfLink] = useState<any>("");
  const pdfRef = useRef(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [checkedIdList, setCheckedIdList] = useState([]);
  const [checkedAllSelect, setCheckAllSelected] = useState(false);

  //@ts-ignore
  const darkMode = useSelector((state: any) => state?.dark);
  const { userType } = useSelector((state: any) => state.userAccess);
  const showCheckboxColumn = useSelector((state: any) => state.showCopyRowInItem);
  const showModalDateCopyRow = useSelector((state: any) => state.showModalDateCopyRow);
  const currentPage = useSelector((state: any) => state.currentPage);
  const startDate = useSelector((state: any) => state.startDate);

  const image = useRef(null);
  const errColor = red[600];
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
    ProjectsFinanceInfoesNameId: Yup.string().required("نباید خالی باشد"),
    StartDate: Yup.string()
      .required("نباید خالی باشد")
      .test("تاریخ معتبر نیست", "تاریخ معتبر نیست", function (value: string) {
        return moment(value).isValid();
      }),
    EndDate: Yup.string()
      .required("نباید خالی باشد")
      .test("تاریخ معتبر نیست", "تاریخ معتبر نیست", function (value: string) {
        return moment(value).isValid();
      })
      .test("تاریخ پایان از شروع باید بزرگتر باشد", "تاریخ پایان از شروع باید بزرگتر باشد", function (value: string) {
        return moment(value).diff(this.parent.StartDate, "day") + 1 > 0;
      }),
    CostTypeId: Yup.string().required("نباید خالی باشد"),
    CounterParty: Yup.object().required("نباید خالی باشد"),
    Cost: Yup.number().test("باید عدد بزرگتر از صفر باشد", "باید عدد بزرگتر از صفر باشد", function (value) {
      return +value >= 0;
    }),
  });

  const editValidation = Yup.object({
    ProjectsFinanceInfoesNameId: Yup.string().required("نباید خالی باشد"),
    StartDate: Yup.string()
      .required("نباید خالی باشد")
      .test("تاریخ معتبر نیست", "تاریخ معتبر نیست", function (value: string) {
        return moment(value).isValid();
      }),
    EndDate: Yup.string()
      .required("نباید خالی باشد")
      .test("تاریخ معتبر نیست", "تاریخ معتبر نیست", function (value: string) {
        return moment(value).isValid();
      })
      .test("تاریخ پایان از شروع باید بزرگتر باشد", "تاریخ پایان از شروع باید بزرگتر باشد", function (value: string) {
        return moment(value).diff(this.parent.StartDate, "day") + 1 > 0;
      }),
    CostTypeId: Yup.string().required("نباید خالی باشد"),
    CounterParty: Yup.object().required("نباید خالی باشد"),
    Cost: Yup.number().test("باید عدد بزرگتر از صفر باشد", "باید عدد بزرگتر از صفر باشد", function (value) {
      return +value >= 0;
    }),
  });

  const addFormik = useFormik({
    initialValues: {
      ProjectsFinanceInfoesNameId: "",
      StartDate: "", //iso format
      EndDate: "", //iso format
      Description: "",
      Cost: 0,
      CostTypeId: "",
      CounterParty: {},
      ProjectId: projectId,
      ReportDate: date,
      LastUserLevel: 1,
    },
    validationSchema: addValidation,
    onSubmit: async (values, { resetForm }) => {
      values.ReportDate = date;
      // values.StartDate = moment(values.StartDate).locale("en").format("YYYY-MM-DD");
      // values.EndDate = moment(values.EndDate).locale("en").format("YYYY-MM-DD");
      const data: PostOrPutFinanceProps = { ...values };
      if (img) {
        const resUpl: any = await uploadImageFinance(image.current.files[0], companyId, projectId);
        if (!(resUpl instanceof Error)) {
          data.PictureUrl = resUpl.url;
        } else {
          toast.error("آپلود عکس با خطا مواجه شد");
        }
      }

      if (pdf) {
        const resPdfUpl: any = await uploadImageFinance(pdf, companyId, projectId);
        if (!(resPdfUpl instanceof Error)) {
          data.PdfUrl = resPdfUpl.url;
          setPdf("");
        } else {
          toast.error("آپلود PDF با خطا مواجه شد");
        }
      }

      if (values.ProjectsFinanceInfoesNameId !== selectSuggestionsFinances) {
        const finaDet: any = await postFinanceInfoesNames({
          statement: values.ProjectsFinanceInfoesNameId,
          ProjectId: values.ProjectId,
        });

        console.log({
          ...data,
          CostTypeId: values.CostTypeId,
          CounterParty: values.CounterParty,
          ProjectsFinanceInfoesNameId: finaDet?.id,
        });
        const res = await postFinanceAtProject({
          ...data,
          CostTypeId: values.CostTypeId,
          CounterParty: values.CounterParty,
          ProjectsFinanceInfoesNameId: finaDet?.id,
        });
        if (!(res instanceof Error)) {
          setAdd(null);
          toast.success("اطلاعات مالی با موفقیت درج شد");
          await refresh();
          // search(keySearch)
          resetForm();
        } else {
          toast.error("درج اطلاعات مالی با خطا مواجه شد");
        }
      } else {
        const finaId = finances.find((item: any) => item.statement === values.ProjectsFinanceInfoesNameId);
        console.log({
          ...data,
          CostTypeId: values.CostTypeId,
          CounterParty: values.CounterParty,
          ProjectsFinanceInfoesNameId: finaId?.id,
        });
        const res = await postFinanceAtProject({
          ...data,
          CostTypeId: values.CostTypeId,
          CounterParty: values.CounterParty,
          ProjectsFinanceInfoesNameId: finaId?.id,
        });
        if (!(res instanceof Error)) {
          setAdd(null);
          toast.success("اطلاعات مالی با موفقیت درج شد");
          await refresh();
          // search(keySearch)
          resetForm();
        } else {
          toast.error("درج اطلاعات مالی با خطا مواجه شد");
        }
      }
    },
  });
  const editFormik = useFormik({
    initialValues: {
      ProjectsFinanceInfoesNameId: "",
      StartDate: "", //iso format
      EndDate: "", //iso format
      Description: "",
      Cost: 0,
      CostTypeId: "",
      CounterParty: {},
      ProjectId: projectId,
      ReportDate: date,
      LastUserLevel: 1,
      PictureUrl: '',
      PdfUrl: '',
    },
    validationSchema: editValidation,
    onSubmit: async (values, { resetForm }) => {
      const data: PostOrPutFinanceProps = { ...values };
      if (img !== edit.pictureUrl && img) {
        const resUpl: any = await uploadImageFinance(image.current.files[0], companyId, projectId);
        if (!(resUpl instanceof Error)) {
          data.PictureUrl = resUpl.url;
        } else {
          toast.error("آپلود عکس با خطا مواجه شد");
        }
      }

      if (pdf) {
        const resPdfUpl: any = await uploadImageFinance(pdf, companyId, projectId);
        if (!(resPdfUpl instanceof Error)) {
          data.PdfUrl = resPdfUpl.url;
          setPdf("");
        } else {
          toast.error("آپلود PDF با خطا مواجه شد");
        }
      }

      if (values.ProjectsFinanceInfoesNameId !== selectSuggestionsFinances) {
        const finaDet: any = await postFinanceInfoesNames({
          statement: values.ProjectsFinanceInfoesNameId,
          ProjectId: values.ProjectId,
        });

        console.log({
          ...data,
          CostTypeId: values.CostTypeId,
          CounterParty: values.CounterParty,
          ProjectsFinanceInfoesNameId: finaDet?.id,
        });
        const res = await putFinanceAtProject(
          {
            ...data,
            Id: edit.id,
            CostTypeId: values.CostTypeId,
            CounterParty: values.CounterParty,
            ProjectsFinanceInfoesNameId: finaDet?.id,
          },
          edit.id
        );
        if (!(res instanceof Error)) {
          setEdit(null);
          toast.success("اطلاعات مالی با موفقیت ویرایش شد");
          await refresh();
          // search(keySearch)
          resetForm();
        } else {
          toast.error("ویرایش اطلاعات مالی با خطا مواجه شد");
        }
      } else {
        const finaId = finances.find((item: any) => item.statement === values.ProjectsFinanceInfoesNameId);
        console.log({
          ...data,
          CostTypeId: values.CostTypeId,
          CounterParty: values.CounterParty,
          ProjectsFinanceInfoesNameId: finaId?.id,
        });
        const res = await putFinanceAtProject(
          {
            ...data,
            Id: edit.id,
            CostTypeId: values.CostTypeId,
            CounterParty: values.CounterParty,
            ProjectsFinanceInfoesNameId: finaId?.id,
          },
          edit.id
        );
        if (!(res instanceof Error)) {
          setEdit(null);
          toast.success("اطلاعات مالی با موفقیت ویرایش شد");
          await refresh();
          // search(keySearch)
          resetForm();
        } else {
          toast.error("ویرایش اطلاعات مالی با خطا مواجه شد");
        }
      }

      // const res = await putFinanceAtProject({ ...data, Id: edit.id }, edit.id);
      // if (!(res instanceof Error)) {
      //    setEdit(null);
      //    await refresh();
      //    toast.success("اطلاعات مالی با موفقیت ویرایش یافت");
      //    resetForm();
      // } else {
      //    toast.error("ویرایش اطلاعات مالی با خطا مواجه شد");
      // }
    },
  });

  useEffect(() => {
    if (edit) {
      editFormik.setValues({
        ProjectsFinanceInfoesNameId: edit.projectsFinanceInfoesStatement,
        //@ts-ignore
        StartDate: new Date(edit.startDate), //iso format
        //@ts-ignore
        EndDate: new Date(edit.endDate), //iso format
        Description: edit.description,
        Cost: edit.cost,
        CostTypeId: edit.costTypeId,
        CounterParty: {
          name: edit.counterPartyName,
          id: edit.id,
          projectId: edit.projectId,
        },
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
    const res = await deleteFinanceOfProject(remove, projectId);
    if (!(res instanceof Error)) {
      const tmpRows = [...rows];
      const index = tmpRows.findIndex((row) => row.id === remove);
      await tmpRows.splice(index, 1);
      setRows(tmpRows);
      setRemove(null);
      toast.success("اطلاعات مالی با موفقیت حذف شد");
    } else {
      toast.error("حذف اطلاعات مالی با خطا مواجه شد");
    }
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await verifyCurrentFinance(verify, projectId);
    if (!(res instanceof Error)) {
      const tmpRows = [...rows];
      const index = tmpRows.findIndex((row) => row.id === verify);
      tmpRows[index].verify = 1;
      setRows(tmpRows);
      setVerify(null);
      await refresh();
      toast.success("اطلاعات مالی با موفقیت تایید شد");
    } else {
      toast.error("تایید اطلاعات مالی با خطا مواجه شد");
    }
  };

  const handleVerifyAll = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await verifyAllFinances(projectId, date);
    if (!(res instanceof Error)) {
      const tmpRows = [...rows];
      for (let i = 0; i < tmpRows.length; i++) {
        tmpRows[i].verify = 1;
      }
      setRows(tmpRows);
      setVerifyAll(false);
      await refresh();
      toast.success("تمام اطلاعات مالی ها تایید شدند");
    } else {
      toast.error("تایید اطلاعات مالی ها با خطا مواجه شد");
    }
  };

  const handleReject = async (event) => {
    event.preventDefault();
    const res = await rejectDailyReports(reject, rejectApiTypes.ProjectsFinanceInfo, projectId);
    if (!(res instanceof Error)) {
      setRows(rows.filter(row => row.id !== reject));
      setReject(null);
      toast.success("گزارش رد و به سطح قبلی ارجاع داده شد")
    } else {
      toast.error("خطا در رَد گزارش")
    }
  }

  const refresh: any = async () => {
    const res = await getDailyFinanceInfoByProjectId(projectId, date);
    const resCostTypes = await getCostTypes();
    const resCntParties = await getCountersPartiesOfProject(projectId);
    const resFinances = await getFinanceInfoOfProject(projectId);

    if (!(res instanceof Error)) {
      setRows(res);
      setFilteredRow(res);
      // @ts-ignore
      setCount(res.length);
    }

    if (!(resCostTypes instanceof Error)) {
      setCostTypes(resCostTypes);
    }

    if (!(resCntParties instanceof Error)) {
      setCntParties(resCntParties);
    }

    if (!(resFinances instanceof Error)) {
      setFinances(resFinances);
    }
  };

  const getAllNeedData = async () => {
    const res = await getDailyFinanceInfoByProjectId(projectId, date);
    const resCostTypes = await getCostTypes();
    const resCntParties = await getCountersPartiesOfProject(projectId);
    const resFinances = await getFinanceInfoOfProject(projectId);

    if (!(res instanceof Error)) {
      setRows(res);
      setFilteredRow(res);
      // @ts-ignore
      setCount(res?.length);
    } else {
      setRows([]);
      setFilteredRow([]);
      // @ts-ignore
      setCount(0);
    }

    if (!(resCostTypes instanceof Error)) {
      setCostTypes(resCostTypes);
    }

    if (!(resCntParties instanceof Error)) {
      setCntParties(resCntParties);
    }

    if (!(resFinances instanceof Error)) {
      setFinances(resFinances);
    }

    // await Promise.all([
    //   res,
    //   resCostTypes,
    //   resCntParties,
    //   resFinances,
    // ]).then((R: any) => {
    //   setRows(R[0])
    //   setFilteredRow(R[0])
    //   setCount(R[0]?.length)
    //   setCostTypes(R[1])
    //   setCntParties(R[2])
    //   setFinances(R[3])
    // }).catch(err => toast.error('دریافت داده با خطا مواجه شد'))
  };



  const search = (key: string) => {
    if (key) {
      const filtered = rows.filter((row: any) => row.costTypeName.includes(key) || row.counterPartyName.includes(key));
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

  const getAdaptedCntParties = async (costTypeId: string) => {
    const resCntParties = await GetCounterPartyByProjectIdAndType(projectId, { type: costTypeId });
    if (!(resCntParties instanceof Error)) {
      setAdaptedCntParties(resCntParties);
      console.log(resCntParties);
    }
  };

  useEffect(() => {
    if (addFormik.values.CostTypeId) {
      getAdaptedCntParties(addFormik.values.CostTypeId);
    } else {
      setAdaptedCntParties([]);
    }
  }, [addFormik.values.CostTypeId]);

  // const lowerCasedCostTypes = costTypes?.map((item: any) => item.name.toLowerCase());
  // const [suggestionsCostTypes, setSuggestionsCostTypes] = useState<string[]>([]);
  // const [selectSuggestionsCostTypes, setSelectSuggestionsCostTypes] = useState<any>("");

  // function getSuggestionsCostTypes(value: string): string[] {
  //    return lowerCasedCostTypes?.filter((item: any) => item.startsWith(value.trim().toLowerCase()));
  // }

  const lowerCasedCntParties = cntParties?.map((item: any) => item.name.toLowerCase());
  const [suggestionsCntParties, setSuggestionsCntParties] = useState<string[]>([]);
  const [selectSuggestionsCntParties, setSelectSuggestionsCntParties] = useState<any>("");

  function getSuggestionsCntParties(value: string): string[] {
    return lowerCasedCntParties?.filter((item: any) => item.startsWith(value.trim().toLowerCase()));
  }

  const lowerCasedFinances = finances?.map((item: any) => item.statement.toLowerCase());
  const [suggestionsFinances, setSuggestionsFinances] = useState<string[]>([]);
  const [selectSuggestionsFinances, setSelectSuggestionsFinances] = useState<any>("");

  function getSuggestionsFinances(value: string): string[] {
    return lowerCasedFinances?.filter((item: any) => item.startsWith(value.trim().toLowerCase()));
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
                  titleAdd={"درج اطلاعات مالی"}
                  onClickAdd={() => {
                    setAdd(true);
                    setPdf('');
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
          title={"درج اطلاعات مالی"}
          onClose={() => {
            setAdd(null);
            addFormik.handleReset(1);
          }}
        >
          <form noValidate onSubmit={addFormik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {/* <Autocomplete
                    options={finances}
                    onChange={(e, value) => {
                      addFormik.setFieldValue('ProjectsFinanceInfoesNameId', value ? value.id : '')
                    }}
                    getOptionLabel={(F: any) => F.statement}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            error={addFormik.touched.ProjectsFinanceInfoesNameId && Boolean(addFormik.errors.ProjectsFinanceInfoesNameId)}
                            helperText={addFormik.touched.ProjectsFinanceInfoesNameId && addFormik.errors.ProjectsFinanceInfoesNameId}
                            required
                            fullWidth
                            label="نوع"
                            variant="outlined"/>)}
                /> */}

                <Autosuggest
                  name={"ProjectsFinanceInfoesNameId"}
                  id={"ProjectsFinanceInfoesNameId"}
                  error={addFormik.touched.ProjectsFinanceInfoesNameId && Boolean(addFormik.errors.ProjectsFinanceInfoesNameId)}
                  helperText={addFormik.touched.ProjectsFinanceInfoesNameId && addFormik.errors.ProjectsFinanceInfoesNameId}
                  suggestions={suggestionsFinances ?? []}
                  onSuggestionsClearRequested={() => setSuggestionsFinances([])}
                  onSuggestionsFetchRequested={({ value }: any) => {
                    addFormik.setFieldValue("ProjectsFinanceInfoesNameId", value);
                    setSuggestionsFinances(getSuggestionsFinances(value));
                  }}
                  onSuggestionSelected={(_: any, { suggestionValue }: any) => {
                    setSelectSuggestionsFinances(suggestionValue);
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
                      ? addFormik.touched.ProjectsFinanceInfoesNameId && Boolean(addFormik.errors.ProjectsFinanceInfoesNameId)
                        ? "react-autosuggest__input__empty--dark"
                        : "react-autosuggest__input--dark"
                      : addFormik.touched.ProjectsFinanceInfoesNameId && Boolean(addFormik.errors.ProjectsFinanceInfoesNameId)
                        ? "react-autosuggest__input__empty"
                        : "react-autosuggest__input",
                  }}
                  inputProps={{
                    placeholder: "نوع*",
                    value: addFormik.values.ProjectsFinanceInfoesNameId,
                    onChange: (_: any, { newValue, method }: any) => {
                      addFormik.setFieldValue("ProjectsFinanceInfoesNameId", newValue);
                    },
                  }}
                  highlightFirstSuggestion={true}
                />
                <Box component="span" sx={{ color: errColor, fontSize: "0.85rem" }}>
                  {addFormik.touched.ProjectsFinanceInfoesNameId && addFormik.errors.ProjectsFinanceInfoesNameId}
                  {addFormik.touched.ProjectsFinanceInfoesNameId && Boolean(addFormik.errors.ProjectsFinanceInfoesNameId)}
                </Box>
              </Grid>
              <Grid item sm={6} xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFnsJalali}>
                  <DatePicker
                    value={moment(addFormik.values.StartDate).toDate()}
                    label={"تاریخ شروع"}
                    onChange={(newValue: any) => addFormik.setFieldValue("StartDate",  moment(newValue).locale("en").format("YYYY-MM-DD"))}
                    sx={{ width: "100%" }}
                  />
                </LocalizationProvider>
                <Box component="span" sx={{ color: errColor, fontSize: "0.85rem" }}>
                  {addFormik.touched.StartDate && addFormik.errors.StartDate}
                  {addFormik.touched.StartDate && Boolean(addFormik.errors.StartDate)}
                </Box>
              </Grid>
              <Grid item sm={6} xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFnsJalali}>
                  <DatePicker
                    value={moment(addFormik.values.EndDate).toDate()}
                    label={"تاریخ پایان"}
                    onChange={(newValue: any) => addFormik.setFieldValue("EndDate", moment(newValue).locale("en").format("YYYY-MM-DD"))}
                    sx={{ width: "100%" }}
                  />
                </LocalizationProvider>
                <Box component="span" sx={{ color: errColor, fontSize: "0.85rem" }}>
                  {addFormik.touched.EndDate && addFormik.errors.EndDate}
                  {addFormik.touched.EndDate && Boolean(addFormik.errors.EndDate)}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={costTypes ?? []}
                  onChange={(e, value) => {
                    addFormik.setFieldValue("CostTypeId", value ? value.id : "");
                  }}
                  getOptionLabel={(C: any) => C.name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={addFormik.touched.CostTypeId && Boolean(addFormik.errors.CostTypeId)}
                      helperText={addFormik.touched.CostTypeId && addFormik.errors.CostTypeId}
                      required
                      fullWidth
                      label="نوع هزینه"
                      variant="outlined"
                    />
                  )}
                />

                {/* <Autosuggest
                           name={"CostTypeId"}
                           id={"CostTypeId"}
                           error={addFormik.touched.CostTypeId && Boolean(addFormik.errors.CostTypeId)}
                           helperText={addFormik.touched.CostTypeId && addFormik.errors.CostTypeId}
                           suggestions={suggestionsCostTypes ?? []}
                           onSuggestionsClearRequested={() => setSuggestionsCostTypes([])}
                           onSuggestionsFetchRequested={({ value }: any) => {
                              addFormik.setFieldValue("CostTypeId", value);
                              setSuggestionsCostTypes(getSuggestionsCostTypes(value));
                           }}
                           onSuggestionSelected={(_: any, { suggestionValue }: any) => {
                              setSelectSuggestionsCostTypes(suggestionValue);
                           }}
                           getSuggestionValue={(suggestion: any) => suggestion}
                           renderSuggestion={(suggestion: any) => <span>{suggestion}</span>}
                           theme={{
                              container: "react-autosuggest__container",
                              containerOpen: "react-autosuggest__container--open",
                              inputOpen: "react-autosuggest__input--open",
                              inputFocused: "react-autosuggest__input--focused",
                              suggestionsContainer: "react-autosuggest__suggestions-container",
                              suggestionsContainerOpen: "react-autosuggest__suggestions-container--open",
                              suggestionsList: "react-autosuggest__suggestions-list",
                              suggestion: "react-autosuggest__suggestion",
                              suggestionFirst: "react-autosuggest__suggestion--first",
                              suggestionHighlighted: "react-autosuggest__suggestion--highlighted",
                              sectionContainer: "react-autosuggest__section-container",
                              sectionContainerFirst: "react-autosuggest__section-container--first",
                              sectionTitle: "react-autosuggest__section-title",
                              input: addFormik.touched.CostTypeId && Boolean(addFormik.errors.CostTypeId) ? "react-autosuggest__input__empty" : "react-autosuggest__input",
                           }}
                           inputProps={{
                              placeholder: "نوع هزینه*",
                              value: addFormik.values.CostTypeId,
                              onChange: (_: any, { newValue, method }: any) => {
                                 addFormik.setFieldValue("CostTypeId", newValue);
                              },
                           }}
                           highlightFirstSuggestion={true}
                        />
                        <Box component="span" sx={{ color: errColor, fontSize: "0.85rem" }}>
                           {addFormik.touched.CostTypeId && addFormik.errors.CostTypeId}
                           {addFormik.touched.CostTypeId && Boolean(addFormik.errors.CostTypeId)}
                        </Box> */}
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={adaptedCntParties ?? []}
                  onChange={(e, value) => {
                    addFormik.setFieldValue("CounterParty", value ? value : "");
                  }}
                  getOptionLabel={(S: any) => S.name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={addFormik.touched.CounterParty && Boolean(addFormik.errors.CounterParty)}
                      helperText={addFormik.touched.CounterParty && addFormik.errors.CounterParty}
                      required
                      fullWidth
                      label="طرف حساب"
                      variant="outlined"
                    />
                  )}
                />

                {/* <Autosuggest
                           name={"CounterParty"}
                           id={"CounterParty"}
                           error={addFormik.touched.CounterParty && Boolean(addFormik.errors.CounterParty)}
                           helperText={addFormik.touched.CounterParty && addFormik.errors.CounterParty}
                           suggestions={suggestionsCntParties ?? []}
                           onSuggestionsClearRequested={() => setSuggestionsCntParties([])}
                           onSuggestionsFetchRequested={({ value }: any) => {
                              addFormik.setFieldValue("CounterParty", value);
                              setSuggestionsCntParties(getSuggestionsCntParties(value));
                           }}
                           onSuggestionSelected={(_: any, { suggestionValue }: any) => {
                              setSelectSuggestionsCntParties(suggestionValue);
                           }}
                           getSuggestionValue={(suggestion: any) => suggestion}
                           renderSuggestion={(suggestion: any) => <span>{suggestion}</span>}
                           theme={{
                              container: "react-autosuggest__container",
                              containerOpen: "react-autosuggest__container--open",
                              inputOpen: "react-autosuggest__input--open",
                              inputFocused: "react-autosuggest__input--focused",
                              suggestionsContainer: "react-autosuggest__suggestions-container",
                              suggestionsContainerOpen: "react-autosuggest__suggestions-container--open",
                              suggestionsList: "react-autosuggest__suggestions-list",
                              suggestion: "react-autosuggest__suggestion",
                              suggestionFirst: "react-autosuggest__suggestion--first",
                              suggestionHighlighted: "react-autosuggest__suggestion--highlighted",
                              sectionContainer: "react-autosuggest__section-container",
                              sectionContainerFirst: "react-autosuggest__section-container--first",
                              sectionTitle: "react-autosuggest__section-title",
                              input: addFormik.touched.CounterParty && Boolean(addFormik.errors.CounterParty) ? "react-autosuggest__input__empty" : "react-autosuggest__input",
                           }}
                           inputProps={{
                              placeholder: "طرف حساب*",
                              value: addFormik.values.CounterParty,
                              onChange: (_: any, { newValue, method }: any) => {
                                 addFormik.setFieldValue("CounterParty", newValue);
                              },
                           }}
                           highlightFirstSuggestion={true}
                        />
                        <Box component="span" sx={{ color: errColor, fontSize: "0.85rem" }}>
                           {addFormik.touched.CounterParty && addFormik.errors.CounterParty}
                           {addFormik.touched.CounterParty && Boolean(addFormik.errors.CounterParty)}
                        </Box> */}
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name={"Cost"}
                  onChange={addFormik.handleChange}
                  value={addFormik.values.Cost}
                  error={addFormik.touched.Cost && Boolean(addFormik.errors.Cost)}
                  helperText={addFormik.touched.Cost && addFormik.errors.Cost}
                  fullWidth
                  required
                  type={"number"}
                  label="هزینه"
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
          title={"ویرایش اطلاعات مالی"}
          onClose={() => {
            setEdit(null);
            setPdf('');
            editFormik.handleReset(1);
          }}
        >
          <form noValidate onSubmit={editFormik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autosuggest
                  name={"ProjectsFinanceInfoesNameId"}
                  id={"ProjectsFinanceInfoesNameId"}
                  error={editFormik.touched.ProjectsFinanceInfoesNameId && Boolean(editFormik.errors.ProjectsFinanceInfoesNameId)}
                  helperText={editFormik.touched.ProjectsFinanceInfoesNameId && editFormik.errors.ProjectsFinanceInfoesNameId}
                  suggestions={suggestionsFinances ?? []}
                  onSuggestionsClearRequested={() => setSuggestionsFinances([])}
                  onSuggestionsFetchRequested={({ value }: any) => {
                    editFormik.setFieldValue("ProjectsFinanceInfoesNameId", value);
                    setSuggestionsFinances(getSuggestionsFinances(value));
                  }}
                  onSuggestionSelected={(_: any, { suggestionValue }: any) => {
                    setSelectSuggestionsFinances(suggestionValue);
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
                      ? editFormik.touched.ProjectsFinanceInfoesNameId && Boolean(editFormik.errors.ProjectsFinanceInfoesNameId)
                        ? "react-autosuggest__input__empty--dark"
                        : "react-autosuggest__input--dark"
                      : editFormik.touched.ProjectsFinanceInfoesNameId && Boolean(editFormik.errors.ProjectsFinanceInfoesNameId)
                        ? "react-autosuggest__input__empty"
                        : "react-autosuggest__input",
                  }}
                  inputProps={{
                    placeholder: "نوع*",
                    value: editFormik.values.ProjectsFinanceInfoesNameId,
                    onChange: (_: any, { newValue, method }: any) => {
                      editFormik.setFieldValue("ProjectsFinanceInfoesNameId", newValue);
                    },
                  }}
                  highlightFirstSuggestion={true}
                />
                <Box component="span" sx={{ color: errColor, fontSize: "0.85rem" }}>
                  {editFormik.touched.ProjectsFinanceInfoesNameId && editFormik.errors.ProjectsFinanceInfoesNameId}
                  {editFormik.touched.ProjectsFinanceInfoesNameId && Boolean(editFormik.errors.ProjectsFinanceInfoesNameId)}
                </Box>
                {/* <Autocomplete
                           defaultValue={finances.find((F: any) => F.id === edit.projectsFinanceInfoesId)}
                           options={finances}
                           onChange={(e, value) => {
                              editFormik.setFieldValue("ProjectsFinanceInfoesNameId", value ? value.id : "");
                           }}
                           getOptionLabel={(F: any) => F.statement}
                           renderInput={(params) => (
                              <TextField
                                 {...params}
                                 error={editFormik.touched.ProjectsFinanceInfoesNameId && Boolean(editFormik.errors.ProjectsFinanceInfoesNameId)}
                                 helperText={editFormik.touched.ProjectsFinanceInfoesNameId && editFormik.errors.ProjectsFinanceInfoesNameId}
                                 required
                                 fullWidth
                                 label="نوع"
                                 variant="outlined"
                              />
                           )}
                        /> */}
              </Grid>
              <Grid item sm={6} xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFnsJalali}>
                  <DatePicker
                    label={"تاریخ شروع"}
                    value={moment(editFormik.values.StartDate).toDate()}
                    onChange={(newValue: any) =>
                      editFormik.setFieldValue("StartDate",  moment(newValue).locale("en").format("YYYY-MM-DD"))
                    }
                    sx={{ width: "100%" }}
                  />
                </LocalizationProvider>
                <Box component="span" sx={{ color: errColor, fontSize: "0.85rem" }}>
                  {editFormik.touched.StartDate && editFormik.errors.StartDate}
                  {editFormik.touched.StartDate && Boolean(editFormik.errors.StartDate)}
                </Box>
              </Grid>
              <Grid item sm={6} xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFnsJalali}>
                  <DatePicker
                    value={moment(editFormik.values.EndDate).toDate()}
                    label={"تاریخ پایان"}
                    onChange={(newValue: any) => editFormik.setFieldValue("EndDate", moment(newValue).locale("en").format("YYYY-MM-DD"))}
                    sx={{ width: "100%" }}
                  />
                </LocalizationProvider>
                <Box component="span" sx={{ color: errColor, fontSize: "0.85rem" }}>
                  {editFormik.touched.EndDate && editFormik.errors.EndDate}
                  {editFormik.touched.EndDate && Boolean(editFormik.errors.EndDate)}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={costTypes}
                  defaultValue={costTypes.find((C: any) => C.id === edit.costTypeId)}
                  onChange={(e, value) => {
                    editFormik.setFieldValue("CostTypeId", value ? value.id : "");
                  }}
                  getOptionLabel={(C: any) => C.name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={editFormik.touched.CostTypeId && Boolean(editFormik.errors.CostTypeId)}
                      helperText={editFormik.touched.CostTypeId && editFormik.errors.CostTypeId}
                      required
                      fullWidth
                      label="نوع هزینه"
                      variant="outlined"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={cntParties}
                  defaultValue={cntParties.find((C: any) => C.id === edit.counterPartyId)}
                  onChange={(e, value) => {
                    editFormik.setFieldValue("CounterParty", value ? value : "");
                  }}
                  getOptionLabel={(S: any) => S.name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={editFormik.touched.CounterParty && Boolean(editFormik.errors.CounterParty)}
                      helperText={editFormik.touched.CounterParty && editFormik.errors.CounterParty}
                      required
                      fullWidth
                      label="طرف حساب"
                      variant="outlined"
                    />
                  )}
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
                  required
                  type={"number"}
                  label="هزینه"
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
        <ModalIpa open={Boolean(remove)} title={`آیا از حذف اطلاعات مالی مطمئن هستید؟`} onClose={() => setRemove(null)}>
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
      {verify ? (
        <ModalIpa open={Boolean(verify)} title={`آیا از تایید اطلاعات مالی مطمئن هستید؟`} onClose={() => setVerify(null)}>
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
          title={`آیا از تایید تمام اطلاعات مالی ها مطمئن هستید؟`}
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

export { FinancesInfoesPaymentReportDailyPage };
