import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {Delete, Edit, ThumbDown, Settings, ThumbUp} from "@mui/icons-material";
import {
  deleteToolOfProject,
  getActivityTypesByProjectId,
  getContructorsOfProject,
  getDailyToolsByProjectId,
  getToolsOfProject,
  postToolAtProject,
  putToolAtProject,
  verifyAllTools,
  verifyCurrentTool,
  postToolsNames,
  postActivityType,
  postConstructorName,
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
import moment from "jalali-moment";
import { TableCellStyled } from "../components/table-cell-styled.report-daily";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { renderTimeViewClock } from "@mui/x-date-pickers";
import { workingStatus } from "../../../../utils/working-status.utils";
import Autosuggest from "react-autosuggest";
import { red } from "@mui/material/colors";
import { useDispatch, useSelector } from "react-redux";
import { AdapterDateFnsJalali } from "@mui/x-date-pickers/AdapterDateFnsJalali";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import {
  handleSetVerifiedBadge,
  handleShowCopyRowInItem,
  handleShowModalDateCopyRow
} from "../../../../redux/actions/actions";
import { currentPageNumber } from "../../../../utils/currentPage-number";
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
    id: "toolsName",
    label: "نام دستگاه",
    align: "left",
    minWidth: 120,
  },
  {
    id: "contructorName",
    label: "طرف حساب",
    align: "left",
    minWidth: 80,
  },
  {
    id: "activityTypeName",
    label: "نوع فعالیت",
    align: "left",
    minWidth: 80,
  },
  {
    id: "workingStatus",
    label: "وضعیت کار",
    align: "center",
    minWidth: 60,
    format: (value: number) => workingStatus[value],
  },
  {
    id: "workingHours",
    label: "جمع ساعت کاری",
    align: "center",
    minWidth: 60,
  },
  {
    id: "action",
    label: "عملیات",
    align: "center",
    minWidth: 60,
  },
];

function ToolsReportDailyPage({ date }: any) {
  const [rows, setRows] = useState<any>(null);
  const [filteredRow, setFilteredRow] = useState<any>([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState<any>(10);
  const [add, setAdd] = useState<any>(null);
  const [edit, setEdit] = useState<any>(null);
  const [keySearch, setKeySearch] = useState<any>("");
  const [remove, setRemove] = useState<any>(null);
  const [tools, setTools] = useState<any>([]);
  const [contructors, setContructors] = useState<any>([]);
  const [actvTypes, setActvTypes] = useState<any>([]);
  const [verify, setVerify] = useState<any>(null);
  const [verifyAll, setVerifyAll] = useState(false);
  const [reject, setReject] = useState<any>(null);
  const [checkedIdList, setCheckedIdList] = useState([]);
  const [checkedAllSelect, setCheckAllSelected] = useState(false);

  //@ts-ignore
  const darkMode = useSelector((state: any) => state?.dark);
  const { userType } = useSelector((state: any) => state.userAccess);
  const showCheckboxColumn = useSelector((state: any) => state.showCopyRowInItem);
  const showModalDateCopyRow = useSelector((state: any) => state.showModalDateCopyRow);
  const currentPage = useSelector((state: any) => state.currentPage);
  const startDate = useSelector((state: any) => state.startDate);

  const errColor = red[600];
  const { projectId } = useParams();
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
    ActivityTypeId: Yup.string().required("نباید خالی باشد"),
    ToolsNameId: Yup.string().required("نباید خالی باشد"),
    ContructorId: Yup.string().required("نباید خالی باشد"),
    EnterTime: Yup.date()
        .required("نباید خالی باشد")
        .typeError("نامعتبر می باشد"),
    ExitTime: Yup.date()
        .required("نباید خالی باشد")
        .typeError("نامعتبر می باشد")
        .test("ساعت خروج باید از ورود بزرگتر باشد",
            "ساعت خروج باید از ورود بزرگتر باشد",
            function (value: object) {
              return moment(value, "HH:mm").diff(moment(this.parent.EnterTime, "HH:mm"), "minute") > 0;
            }),
    Wage: Yup.number().test("باید عدد بزرگتر از صفر باشد", "باید عدد بزرگتر از صفر باشد", function (value) {
      return +value >= 0;
    }),
    Qty: Yup.number().test("باید عدد بزرگتر از صفر باشد", "باید عدد بزرگتر از صفر باشد", function (value) {
      return +value >= 0;
    }),
  });

  const editValidation = Yup.object({
    ActivityTypeId: Yup.string().required("نباید خالی باشد"),
    ToolsNameId: Yup.string().required("نباید خالی باشد"),
    ContructorId: Yup.string().required("نباید خالی باشد"),
    EnterTime: Yup.date()
        .required("نباید خالی باشد")
        .typeError("نامعتبر می باشد"),
    ExitTime: Yup.date()
        .required("نباید خالی باشد")
        .typeError("نامعتبر می باشد")
        .test("ساعت خروج باید از ورود بزرگتر باشد",
            "ساعت خروج باید از ورود بزرگتر باشد",
            function (value: object) {
              return moment(value, "HH:mm").diff(moment(this.parent.EnterTime, "HH:mm"), "minute") > 0;
            }),
    Wage: Yup.number().test("باید عدد بزرگتر از صفر باشد", "باید عدد بزرگتر از صفر باشد", function (value) {
      return +value >= 0;
    }),
    Qty: Yup.number().test("باید عدد بزرگتر از صفر باشد", "باید عدد بزرگتر از صفر باشد", function (value) {
      return +value >= 0;
    }),
  });

  const addFormik = useFormik({
    initialValues: {
      Name: "",
      Qty: 0,
      EnterTime: "",
      ExitTime: "",
      WorkingStatus: 0,
      ServingLocation: "",
      Wage: 0,
      Description: "",
      ActivityCode: "",
      ActivityTypeId: "",
      projectId: projectId,
      lastUserLevel: 1,
      reportDate: date,
      ToolsNameId: "",
      ContructorId: "",
    },
    validationSchema: addValidation,
    onSubmit: async (values, { resetForm }) => {
      values.reportDate = date;
      if (
        values.ToolsNameId !== selectSuggestionsTools ||
        values.ContructorId !== selectSuggestionsContructors ||
        values.ActivityTypeId !== selectSuggestionsActvTypes
      ) {
        if (
          values.ToolsNameId !== selectSuggestionsTools &&
          values.ContructorId === selectSuggestionsContructors &&
          values.ActivityTypeId === selectSuggestionsActvTypes
        ) {
          const toolsDet: any = await postToolsNames({
            Name: values.ToolsNameId,
            ProjectId: values.projectId,
          });

          const conId = contructors.find((item: any) => item.contructorName === values.ContructorId);
          const actId = actvTypes.find((item: any) => item.name === values.ActivityTypeId);

          const res = await postToolAtProject({
            ...values,
            ToolsNameId: toolsDet?.id,
            ContructorId: conId?.contructorNameId,
            ActivityTypeId: actId?.id,
          });
          if (!(res instanceof Error)) {
            setAdd(null);
            toast.success("ماشین یا ابزار با موفقیت درج شد");
            await refresh();
            // search(keySearch)
            resetForm();
          } else {
            toast.error("درج ماشین یا ابزار با خطا مواجه شد");
          }
        }

        if (
          values.ToolsNameId !== selectSuggestionsTools &&
          values.ContructorId !== selectSuggestionsContructors &&
          values.ActivityTypeId === selectSuggestionsActvTypes
        ) {
          const toolsDet: any = await postToolsNames({
            Name: values.ToolsNameId,
            ProjectId: values.projectId,
          });

          const contDet: any = await postConstructorName({
            Name: values.ContructorId,
            ProjectId: values.projectId,
          });

          const actId = actvTypes.find((item: any) => item.name === values.ActivityTypeId);

          const res = await postToolAtProject({
            ...values,
            ToolsNameId: toolsDet?.id,
            ContructorId: contDet?.id,
            ActivityTypeId: actId?.id,
          });
          if (!(res instanceof Error)) {
            setAdd(null);
            toast.success("ماشین یا ابزار با موفقیت درج شد");
            await refresh();
            // search(keySearch)
            resetForm();
          } else {
            toast.error("درج ماشین یا ابزار با خطا مواجه شد");
          }
        }

        if (
          values.ToolsNameId !== selectSuggestionsTools &&
          values.ContructorId !== selectSuggestionsContructors &&
          values.ActivityTypeId !== selectSuggestionsActvTypes
        ) {
          const toolsDet: any = await postToolsNames({
            Name: values.ToolsNameId,
            ProjectId: values.projectId,
          });

          const contDet: any = await postConstructorName({
            Name: values.ContructorId,
            ProjectId: values.projectId,
          });

          const actvDet: any = await postActivityType({
            Name: values.ActivityTypeId,
            ProjectId: values.projectId,
          });

          const res = await postToolAtProject({
            ...values,
            ToolsNameId: toolsDet?.id,
            ContructorId: contDet?.id,
            ActivityTypeId: actvDet?.id,
          });
          if (!(res instanceof Error)) {
            setAdd(null);
            toast.success("ماشین یا ابزار با موفقیت درج شد");
            await refresh();
            // search(keySearch)
            resetForm();
          } else {
            toast.error("درج ماشین یا ابزار با خطا مواجه شد");
          }
        }

        if (
          values.ToolsNameId === selectSuggestionsTools &&
          values.ContructorId !== selectSuggestionsContructors &&
          values.ActivityTypeId === selectSuggestionsActvTypes
        ) {
          const contDet: any = await postConstructorName({
            Name: values.ContructorId,
            ProjectId: values.projectId,
          });

          const toolId = tools.find((item: any) => item.toolsName === values.ToolsNameId);
          const actId = actvTypes.find((item: any) => item.name === values.ActivityTypeId);

          const res = await postToolAtProject({
            ...values,
            ToolsNameId: toolId?.toolsNameId,
            ContructorId: contDet?.id,
            ActivityTypeId: actId?.id,
          });
          if (!(res instanceof Error)) {
            setAdd(null);
            toast.success("ماشین یا ابزار با موفقیت درج شد");
            await refresh();
            // search(keySearch)
            resetForm();
          } else {
            toast.error("درج ماشین یا ابزار با خطا مواجه شد");
          }
        }

        if (
          values.ToolsNameId === selectSuggestionsTools &&
          values.ContructorId !== selectSuggestionsContructors &&
          values.ActivityTypeId !== selectSuggestionsActvTypes
        ) {
          const contDet: any = await postConstructorName({
            Name: values.ContructorId,
            ProjectId: values.projectId,
          });

          const actvDet: any = await postActivityType({
            Name: values.ActivityTypeId,
            ProjectId: values.projectId,
          });

          const toolId = tools.find((item: any) => item.toolsName === values.ToolsNameId);

          const res = await postToolAtProject({
            ...values,
            ToolsNameId: toolId?.toolsNameId,
            ContructorId: contDet?.id,
            ActivityTypeId: actvDet?.id,
          });
          if (!(res instanceof Error)) {
            setAdd(null);
            toast.success("ماشین یا ابزار با موفقیت درج شد");
            await refresh();
            // search(keySearch)
            resetForm();
          } else {
            toast.error("درج ماشین یا ابزار با خطا مواجه شد");
          }
        }

        if (
          values.ToolsNameId !== selectSuggestionsTools &&
          values.ContructorId === selectSuggestionsContructors &&
          values.ActivityTypeId !== selectSuggestionsActvTypes
        ) {
          const toolsDet: any = await postToolsNames({
            Name: values.ToolsNameId,
            ProjectId: values.projectId,
          });

          const actvDet: any = await postActivityType({
            Name: values.ActivityTypeId,
            ProjectId: values.projectId,
          });

          const conId = contructors.find((item: any) => item.contructorName === values.ContructorId);

          const res = await postToolAtProject({
            ...values,
            ToolsNameId: toolsDet?.id,
            ContructorId: conId?.contructorNameId,
            ActivityTypeId: actvDet?.id,
          });
          if (!(res instanceof Error)) {
            setAdd(null);
            toast.success("ماشین یا ابزار با موفقیت درج شد");
            await refresh();
            // search(keySearch)
            resetForm();
          } else {
            toast.error("درج ماشین یا ابزار با خطا مواجه شد");
          }
        }

        if (
          values.ToolsNameId === selectSuggestionsTools &&
          values.ContructorId === selectSuggestionsContructors &&
          values.ActivityTypeId !== selectSuggestionsActvTypes
        ) {
          const actvDet: any = await postActivityType({
            Name: values.ActivityTypeId,
            ProjectId: values.projectId,
          });

          const conId = contructors.find((item: any) => item.contructorName === values.ContructorId);
          const toolId = tools.find((item: any) => item.toolsName === values.ToolsNameId);

          const res = await postToolAtProject({
            ...values,
            ToolsNameId: toolId?.toolsNameId,
            ContructorId: conId?.contructorNameId,
            ActivityTypeId: actvDet?.id,
          });
          if (!(res instanceof Error)) {
            setAdd(null);
            toast.success("ماشین یا ابزار با موفقیت درج شد");
            await refresh();
            // search(keySearch)
            resetForm();
          } else {
            toast.error("درج ماشین یا ابزار با خطا مواجه شد");
          }
        }
      } else {
        const toolId = tools.find((item: any) => item.toolsName === values.ToolsNameId);
        const conId = contructors.find((item: any) => item.contructorName === values.ContructorId);
        const actId = actvTypes.find((item: any) => item.name === values.ActivityTypeId);
        const res = await postToolAtProject({
          ...values,
          ToolsNameId: toolId?.toolsNameId,
          ContructorId: conId?.contructorNameId,
          ActivityTypeId: actId?.id,
        });
        if (!(res instanceof Error)) {
          setAdd(null);
          toast.success("ماشین یا ابزار با موفقیت درج شد");
          await refresh();
          // search(keySearch)
          resetForm();
        } else {
          toast.error("درج ماشین یا ابزار با خطا مواجه شد");
        }
      }
    },
  });
  const editFormik = useFormik({
    initialValues: {
      Name: "",
      Qty: 0,
      EnterTime: "",
      ExitTime: "",
      WorkingStatus: 0,
      ServingLocation: "",
      Wage: 0,
      Description: "",
      ActivityCode: "",
      ActivityTypeId: "",
      projectId: projectId,
      lastUserLevel: 1,
      reportDate: date,
      ToolsNameId: "",
      ContructorId: "",
    },
    validationSchema: editValidation,
    onSubmit: async (values, { resetForm }) => {
        if (
          values.ToolsNameId !== selectSuggestionsTools ||
          values.ContructorId !== selectSuggestionsContructors ||
          values.ActivityTypeId !== selectSuggestionsActvTypes
        ) {
          if (
            values.ToolsNameId !== selectSuggestionsTools &&
            values.ContructorId === selectSuggestionsContructors &&
            values.ActivityTypeId === selectSuggestionsActvTypes
          ) {
            const toolsDet: any = await postToolsNames({
              Name: values.ToolsNameId,
              ProjectId: values.projectId,
            });

            const conId = contructors.find((item: any) => item.contructorName === values.ContructorId);
            const actId = actvTypes.find((item: any) => item.name === values.ActivityTypeId);

            const res = await putToolAtProject(
              {
                ...values,
                Id: edit.id,
                ToolsNameId: toolsDet?.id,
                ContructorId: conId?.contructorNameId,
                ActivityTypeId: actId?.id,
              },
              edit.id
            );
            if (!(res instanceof Error)) {
              setEdit(null);
              toast.success("ماشین یا ابزار با موفقیت ویرایش شد");
              await refresh();
              // search(keySearch)
              resetForm();
            } else {
              toast.error("ویرایش ماشین یا ابزار با خطا مواجه شد");
            }
          }

          if (
            values.ToolsNameId !== selectSuggestionsTools &&
            values.ContructorId !== selectSuggestionsContructors &&
            values.ActivityTypeId === selectSuggestionsActvTypes
          ) {
            const toolsDet: any = await postToolsNames({
              Name: values.ToolsNameId,
              ProjectId: values.projectId,
            });

            const contDet: any = await postConstructorName({
              Name: values.ContructorId,
              ProjectId: values.projectId,
            });

            const actId = actvTypes.find((item: any) => item.name === values.ActivityTypeId);

            const res = await putToolAtProject(
              {
                ...values,
                Id: edit.id,
                ToolsNameId: toolsDet?.id,
                ContructorId: contDet?.id,
                ActivityTypeId: actId?.id,
              },
              edit.id
            );
            if (!(res instanceof Error)) {
              setEdit(null);
              toast.success("ماشین یا ابزار با موفقیت ویرایش شد");
              await refresh();
              // search(keySearch)
              resetForm();
            } else {
              toast.error("ویرایش ماشین یا ابزار با خطا مواجه شد");
            }
          }

          if (
            values.ToolsNameId !== selectSuggestionsTools &&
            values.ContructorId !== selectSuggestionsContructors &&
            values.ActivityTypeId !== selectSuggestionsActvTypes
          ) {
            const toolsDet: any = await postToolsNames({
              Name: values.ToolsNameId,
              ProjectId: values.projectId,
            });

            const contDet: any = await postConstructorName({
              Name: values.ContructorId,
              ProjectId: values.projectId,
            });

            const actvDet: any = await postActivityType({
              Name: values.ActivityTypeId,
              ProjectId: values.projectId,
            });

            const res = await putToolAtProject(
              {
                ...values,
                Id: edit.id,
                ToolsNameId: toolsDet?.id,
                ContructorId: contDet?.id,
                ActivityTypeId: actvDet?.id,
              },
              edit.id
            );
            if (!(res instanceof Error)) {
              setEdit(null);
              toast.success("ماشین یا ابزار با موفقیت ویرایش شد");
              await refresh();
              // search(keySearch)
              resetForm();
            } else {
              toast.error("ویرایش ماشین یا ابزار با خطا مواجه شد");
            }
          }

          if (
            values.ToolsNameId === selectSuggestionsTools &&
            values.ContructorId !== selectSuggestionsContructors &&
            values.ActivityTypeId === selectSuggestionsActvTypes
          ) {
            const contDet: any = await postConstructorName({
              Name: values.ContructorId,
              ProjectId: values.projectId,
            });

            const toolId = tools.find((item: any) => item.toolsName === values.ToolsNameId);
            const actId = actvTypes.find((item: any) => item.name === values.ActivityTypeId);

            const res = await putToolAtProject(
              {
                ...values,
                Id: edit.id,
                ToolsNameId: toolId?.toolsNameId,
                ContructorId: contDet?.id,
                ActivityTypeId: actId?.id,
              },
              edit.id
            );
            if (!(res instanceof Error)) {
              setEdit(null);
              toast.success("ماشین یا ابزار با موفقیت ویرایش شد");
              await refresh();
              // search(keySearch)
              resetForm();
            } else {
              toast.error("ویرایش ماشین یا ابزار با خطا مواجه شد");
            }
          }

          if (
            values.ToolsNameId === selectSuggestionsTools &&
            values.ContructorId !== selectSuggestionsContructors &&
            values.ActivityTypeId !== selectSuggestionsActvTypes
          ) {
            const contDet: any = await postConstructorName({
              Name: values.ContructorId,
              ProjectId: values.projectId,
            });

            const actvDet: any = await postActivityType({
              Name: values.ActivityTypeId,
              ProjectId: values.projectId,
            });

            const toolId = tools.find((item: any) => item.toolsName === values.ToolsNameId);

            const res = await putToolAtProject(
              {
                ...values,
                Id: edit.id,
                ToolsNameId: toolId?.toolsNameId,
                ContructorId: contDet?.id,
                ActivityTypeId: actvDet?.id,
              },
              edit.id
            );
            if (!(res instanceof Error)) {
              setEdit(null);
              toast.success("ماشین یا ابزار با موفقیت ویرایش شد");
              await refresh();
              // search(keySearch)
              resetForm();
            } else {
              toast.error("ویرایش ماشین یا ابزار با خطا مواجه شد");
            }
          }

          if (
            values.ToolsNameId !== selectSuggestionsTools &&
            values.ContructorId === selectSuggestionsContructors &&
            values.ActivityTypeId !== selectSuggestionsActvTypes
          ) {
            const toolsDet: any = await postToolsNames({
              Name: values.ToolsNameId,
              ProjectId: values.projectId,
            });

            const actvDet: any = await postActivityType({
              Name: values.ActivityTypeId,
              ProjectId: values.projectId,
            });

            const conId = contructors.find((item: any) => item.contructorName === values.ContructorId);

            const res = await putToolAtProject(
              {
                ...values,
                Id: edit.id,
                ToolsNameId: toolsDet?.id,
                ContructorId: conId?.contructorNameId,
                ActivityTypeId: actvDet?.id,
              },
              edit.id
            );
            if (!(res instanceof Error)) {
              setEdit(null);
              toast.success("ماشین یا ابزار با موفقیت ویرایش شد");
              await refresh();
              // search(keySearch)
              resetForm();
            } else {
              toast.error("ویرایش ماشین یا ابزار با خطا مواجه شد");
            }
          }

          if (
            values.ToolsNameId === selectSuggestionsTools &&
            values.ContructorId === selectSuggestionsContructors &&
            values.ActivityTypeId !== selectSuggestionsActvTypes
          ) {
            const actvDet: any = await postActivityType({
              Name: values.ActivityTypeId,
              ProjectId: values.projectId,
            });

            const conId = contructors.find((item: any) => item.contructorName === values.ContructorId);
            const toolId = tools.find((item: any) => item.toolsName === values.ToolsNameId);

            const res = await putToolAtProject(
              {
                ...values,
                Id: edit.id,
                ToolsNameId: toolId?.toolsNameId,
                ContructorId: conId?.contructorNameId,
                ActivityTypeId: actvDet?.id,
              },
              edit.id
            );
            if (!(res instanceof Error)) {
              setEdit(null);
              toast.success("ماشین یا ابزار با موفقیت ویرایش شد");
              await refresh();
              // search(keySearch)
              resetForm();
            } else {
              toast.error("ویرایش ماشین یا ابزار با خطا مواجه شد");
            }
          }
        } else {
          const toolId = tools.find((item: any) => item.toolsName === values.ToolsNameId);
          const conId = contructors.find((item: any) => item.contructorName === values.ContructorId);
          const actId = actvTypes.find((item: any) => item.name === values.ActivityTypeId);
          const res = await putToolAtProject(
            {
              ...values,
              Id: edit.id,
              ToolsNameId: toolId?.toolsNameId,
              ContructorId: conId?.contructorNameId,
              ActivityTypeId: actId?.id,
            },
            edit.id
          );
          if (!(res instanceof Error)) {
            setEdit(null);
            toast.success("ماشین یا ابزار با موفقیت ویرایش شد");
            await refresh();
            // search(keySearch)
            resetForm();
          } else {
            toast.error("ویرایش ماشین یا ابزار با خطا مواجه شد");
          }
        }
    },
    // onSubmit: async (values, { resetForm }) => {
    //    const res = await putToolAtProject({ ...values, Id: edit.id }, edit.id);
    //    if (!(res instanceof Error)) {
    //       setEdit(null);
    //       await refresh();
    //       toast.success("ماشین یا ابزار با موفقیت ویرایش یافت");
    //       resetForm();
    //    } else {
    //       toast.error("ویرایش ماشین یا ابزار با خطا مواجه شد");
    //    }
    // },
  });

  useEffect(() => {
    if (edit) {
      editFormik.setValues({
        Name: edit.toolsName,
        Qty: edit.qty,
        EnterTime: edit.enterTime,
        ExitTime: edit.exitTime,
        WorkingStatus: edit.workingStatus,
        ServingLocation: edit.servingLocation,
        Wage: edit.wage || 0,
        Description: edit.description,
        ActivityCode: edit.activityCode,
        // ActivityTypeId: edit.activityTypeId,
        ActivityTypeId: edit.activityTypeName,
        projectId: projectId,
        lastUserLevel: 1,
        reportDate: edit.reportDate,
        // ToolsNameId: edit.toolsNameId,
        ToolsNameId: edit.toolsName,
        // ContructorId: edit.contructorId,
        ContructorId: edit.contructorName,
      });
    }
  }, [edit]);
  const handleRemove = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await deleteToolOfProject(remove, projectId);
    if (!(res instanceof Error)) {
      const tmpRows = [...rows];
      const index = tmpRows.findIndex((row) => row.id === remove);
      await tmpRows.splice(index, 1);
      setRows(tmpRows);
      setRemove(null);
      toast.success("ماشین یا ابزار با موفقیت حذف شد");
    } else {
      toast.error("حذف ماشین یا ابزار با خطا مواجه شد");
    }
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await verifyCurrentTool(verify, projectId);
    if (!(res instanceof Error)) {
      const tmpRows = [...rows];
      const index = tmpRows.findIndex((row) => row.id === verify);
      tmpRows[index].verify = 1;
      setRows(tmpRows);
      setVerify(null);
      await refresh();
      toast.success("ماشین یا ابزار با موفقیت تایید شد");
    } else {
      toast.error("تایید ماشین یا ابزار با خطا مواجه شد");
    }
  };

  const handleVerifyAll = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await verifyAllTools(projectId, date);
    if (!(res instanceof Error)) {
      const tmpRows = [...rows];
      for (let i = 0; i < tmpRows.length; i++) {
        tmpRows[i].verify = 1;
      }
      setRows(tmpRows);
      setVerifyAll(false);
      await refresh();
      toast.success("تمام ماشین یا ابزار ها تایید شدند");
    } else {
      toast.error("تایید ماشین یا ابزار ها با خطا مواجه شد");
    }
  };

  const handleReject = async (event) => {
    event.preventDefault();
    const res = await rejectDailyReports(reject, rejectApiTypes.Tool, projectId);
    if (!(res instanceof Error)) {
      setRows(rows.filter(row => row.id !== reject));
      setReject(null);
      toast.success("گزارش رد و به سطح قبلی ارجاع داده شد")
    } else {
      toast.error("خطا در رَد گزارش")
    }
  }

  const refresh = async () => {
    const res = await getDailyToolsByProjectId(projectId, date);
    const resTools = await getToolsOfProject(projectId);
    const resActvTypes = await getActivityTypesByProjectId(projectId);
    const resContructors = await getContructorsOfProject(projectId);

    if (!(res instanceof Error)) {
      setRows(res);
      setFilteredRow(res);
      // @ts-ignore
      setCount(res.length);
    }

    if (!(resTools instanceof Error)) {
      setTools(resTools);
    }

    if (!(resActvTypes instanceof Error)) {
      setActvTypes(resActvTypes);
    }

    if (!(resContructors instanceof Error)) {
      setContructors(resContructors);
    }
  };

  const getAllNeedData = async () => {
    const res = await getDailyToolsByProjectId(projectId, date);
    const resTools = await getToolsOfProject(projectId);
    const resActvTypes = await getActivityTypesByProjectId(projectId);
    const resContructors = await getContructorsOfProject(projectId);

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

    if (!(resTools instanceof Error)) {
      setTools(resTools);
    }

    if (!(resActvTypes instanceof Error)) {
      setActvTypes(resActvTypes);
    }

    if (!(resContructors instanceof Error)) {
      setContructors(resContructors);
    }

    // await Promise.all([res, resTools, resActvTypes, resContructors])
    //    .then((R: any) => {
    //       setRows(R[0]);
    //       setFilteredRow(R[0]);
    //       setCount(R[0]?.length);
    //       setTools(R[1]);
    //       setActvTypes(R[2]);
    //       setContructors(R[3]);
    //    })
    //    .catch((err) => toast.error("دریافت داده با خطا مواجه شد"));
  };



  const search = (key: string) => {
    if (key) {
      const filtered = rows.filter(
        (row: any) => row.toolsName.includes(key) || row.activityTypeName.includes(key) || row.contructorName.includes(key)
      );
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

  const lowerCasedTools = tools?.map((item: any) => item.toolsName.toLowerCase());
  const [suggestionsTools, setSuggestionsTools] = useState<string[]>([]);
  const [selectSuggestionsTools, setSelectSuggestionsTools] = useState<any>("");

  function getSuggestionsTools(value: string): string[] {
    return lowerCasedTools?.filter((item: any) => item.startsWith(value.trim().toLowerCase()));
  }

  const lowerCasedActvTypes = actvTypes?.map((item: any) => item.name.toLowerCase());
  const [suggestionsActvTypes, setSuggestionsActvTypes] = useState<string[]>([]);
  const [selectSuggestionsActvTypes, setSelectSuggestionsActvTypes] = useState<any>("");

  function getSuggestionsActvTypes(value: string): string[] {
    return lowerCasedActvTypes?.filter((item: any) => item.startsWith(value.trim().toLowerCase()));
  }

  const lowerCasedContructors = contructors?.map((item: any) => item.contructorName.toLowerCase());
  const [suggestionsContructors, setSuggestionsContructors] = useState<string[]>([]);
  const [selectSuggestionsContructors, setSelectSuggestionsContructors] = useState<any>("");

  function getSuggestionsContructors(value: string): string[] {
    return lowerCasedContructors?.filter((item: any) => item.startsWith(value.trim().toLowerCase()));
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
                  titleAdd={"درج ماشین یا ابزار"}
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
              } else if (head === "workingStatus") {
                return (
                  <TableCellStyled active={row.verify === userType} key={column.id} align={column.align}>
                    <Button variant={"text"} color={value === 1 ? "success" : "warning"}>
                      {workingStatus[value]}
                    </Button>
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
          title={"درج ماشین یا ابزار"}
          onClose={() => {
            setAdd(null);
            addFormik.handleReset(1);
          }}
        >
          <form noValidate onSubmit={addFormik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {/* <Autocomplete
                    options={tools}
                    onChange={(e, value) => {
                      addFormik.setFieldValue('ToolsNameId', value ? value.toolsNameId : '')
                    }}
                    getOptionLabel={(tool: any) => tool.toolsName}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            error={addFormik.touched.ToolsNameId && Boolean(addFormik.errors.ToolsNameId)}
                            helperText={addFormik.touched.ToolsNameId && addFormik.errors.ToolsNameId}
                            required
                            fullWidth
                            label="نام ماشین یا ابزار"
                            variant="outlined"/>)}
                /> */}
                <Autosuggest
                  name={"ToolsNameId"}
                  id={"ToolsNameId"}
                  error={addFormik.touched.ToolsNameId && Boolean(addFormik.errors.ToolsNameId)}
                  helperText={addFormik.touched.ToolsNameId && addFormik.errors.ToolsNameId}
                  suggestions={suggestionsTools ?? []}
                  onSuggestionsClearRequested={() => setSuggestionsTools([])}
                  onSuggestionsFetchRequested={({ value }: any) => {
                    addFormik.setFieldValue("ToolsNameId", value);
                    setSuggestionsTools(getSuggestionsTools(value));
                  }}
                  onSuggestionSelected={(_: any, { suggestionValue }: any) => {
                    setSelectSuggestionsTools(suggestionValue);
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
                      ? addFormik.touched.ToolsNameId && Boolean(addFormik.errors.ToolsNameId)
                        ? "react-autosuggest__input__empty--dark"
                        : "react-autosuggest__input--dark"
                      : addFormik.touched.ToolsNameId && Boolean(addFormik.errors.ToolsNameId)
                        ? "react-autosuggest__input__empty"
                        : "react-autosuggest__input",
                  }}
                  inputProps={{
                    placeholder: "نام ماشین یا ابزار*",
                    value: addFormik.values.ToolsNameId,
                    onChange: (_: any, { newValue, method }: any) => {
                      addFormik.setFieldValue("ToolsNameId", newValue);
                    },
                  }}
                  highlightFirstSuggestion={true}
                />
                <Box component="span" sx={{ color: errColor, fontSize: "0.85rem" }}>
                  {addFormik.touched.ToolsNameId && addFormik.errors.ToolsNameId}
                  {addFormik.touched.ToolsNameId && Boolean(addFormik.errors.ToolsNameId)}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name={"Qty"}
                  onChange={addFormik.handleChange}
                  value={addFormik.values.Qty}
                  error={addFormik.touched.Qty && Boolean(addFormik.errors.Qty)}
                  helperText={addFormik.touched.Qty && addFormik.errors.Qty}
                  fullWidth
                  type={"number"}
                  label="تعداد"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  id={"WorkingStatus"}
                  value={addFormik.values.WorkingStatus}
                  onChange={(e) => addFormik.setFieldValue("WorkingStatus", e.target.value)}
                  error={addFormik.touched.WorkingStatus && Boolean(addFormik.errors.WorkingStatus)}
                  helperText={addFormik.touched.WorkingStatus && addFormik.errors.WorkingStatus}
                  label="وضعیت"
                  fullWidth
                >
                  {Object.keys(workingStatus).map((type) => (
                    // @ts-ignore
                    <MenuItem key={type} value={+type}>
                      {workingStatus[+type]}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item sm={6} xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFnsJalali}>
                  <TimePicker
                      viewRenderers={{
                        hours: renderTimeViewClock,
                        minutes: renderTimeViewClock,
                        seconds: renderTimeViewClock,
                      }}
                      sx={{width: "100%"}}
                      ampm={false}
                      value={moment(addFormik.values.EnterTime).toDate()}
                      onChange={(date) => addFormik.setFieldValue("EnterTime", moment(date).locale("en").format("YYYY-MM-DDTHH:mm"))}
                      label="ساعت ورود"
                  />
                </LocalizationProvider>

                {addFormik.touched.EnterTime && Boolean(addFormik.errors.EnterTime) ? (
                    <Typography variant={"caption"} sx={{color: "#d32f2f"}}>
                      {addFormik.touched.EnterTime && addFormik.errors.EnterTime}
                    </Typography>
                ) : null}
              </Grid>
              <Grid item sm={6} xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFnsJalali}>
                  <TimePicker
                      viewRenderers={{
                        hours: renderTimeViewClock,
                        minutes: renderTimeViewClock,
                        seconds: renderTimeViewClock,
                      }}
                      sx={{width: "100%"}}
                      ampm={false}
                      value={moment(addFormik.values.ExitTime).toDate()}
                      onChange={(date) => addFormik.setFieldValue("ExitTime", moment(date).locale("en").format("YYYY-MM-DDTHH:mm"))}
                      label="ساعت خروج"
                  />
                </LocalizationProvider>
                {addFormik.touched.ExitTime && Boolean(addFormik.errors.ExitTime) ? (
                    <Typography variant={"caption"} sx={{color: "#d32f2f"}}>
                      {addFormik.touched.ExitTime && addFormik.errors.ExitTime}
                    </Typography>
                ) : null}
              </Grid>
              <Grid item xs={12}>
                {/* <Autocomplete
                    options={contructors}
                    onChange={(e, value) =>
                        addFormik.setFieldValue('ContructorId', value ? value.contructorNameId : '')}
                    getOptionLabel={(C: any) => C.contructorName}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            error={addFormik.touched.ContructorId && Boolean(addFormik.errors.ContructorId)}
                            helperText={addFormik.touched.ContructorId && addFormik.errors.ContructorId}
                            required
                            fullWidth
                            label="طرف حساب"
                            variant="outlined"/>)}
                /> */}

                <Autosuggest
                  name={"ContructorId"}
                  id={"ContructorId"}
                  error={addFormik.touched.ContructorId && Boolean(addFormik.errors.ContructorId)}
                  helperText={addFormik.touched.ContructorId && addFormik.errors.ContructorId}
                  suggestions={suggestionsContructors ?? []}
                  onSuggestionsClearRequested={() => setSuggestionsContructors([])}
                  onSuggestionsFetchRequested={({ value }: any) => {
                    addFormik.setFieldValue("ContructorId", value);
                    setSuggestionsContructors(getSuggestionsContructors(value));
                  }}
                  onSuggestionSelected={(_: any, { suggestionValue }: any) => {
                    setSelectSuggestionsContructors(suggestionValue);
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
                      ? addFormik.touched.ContructorId && Boolean(addFormik.errors.ContructorId)
                        ? "react-autosuggest__input__empty--dark"
                        : "react-autosuggest__input--dark"
                      : addFormik.touched.ContructorId && Boolean(addFormik.errors.ContructorId)
                        ? "react-autosuggest__input__empty"
                        : "react-autosuggest__input",
                  }}
                  inputProps={{
                    placeholder: "طرف حساب*",
                    value: addFormik.values.ContructorId,
                    onChange: (_: any, { newValue, method }: any) => {
                      addFormik.setFieldValue("ContructorId", newValue);
                    },
                  }}
                  highlightFirstSuggestion={true}
                />
                <Box component="span" sx={{ color: errColor, fontSize: "0.85rem" }}>
                  {addFormik.touched.ContructorId && addFormik.errors.ContructorId}
                  {addFormik.touched.ContructorId && Boolean(addFormik.errors.ContructorId)}
                </Box>
              </Grid>
              <Grid item xs={12}>
                {/* <Autocomplete
                    options={actvTypes}
                    onChange={(e, value) =>
                        addFormik.setFieldValue('ActivityTypeId', value ? value.id : '')}
                    getOptionLabel={(A: any) => A.name}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            error={addFormik.touched.ActivityTypeId && Boolean(addFormik.errors.ActivityTypeId)}
                            helperText={addFormik.touched.ActivityTypeId && addFormik.errors.ActivityTypeId}
                            required
                            fullWidth
                            label="نوع فعالیت"
                            variant="outlined"/>)}
                /> */}

                <Autosuggest
                  name={"ActivityTypeId"}
                  id={"ActivityTypeId"}
                  error={addFormik.touched.ActivityTypeId && Boolean(addFormik.errors.ActivityTypeId)}
                  helperText={addFormik.touched.ActivityTypeId && addFormik.errors.ActivityTypeId}
                  suggestions={suggestionsActvTypes ?? []}
                  onSuggestionsClearRequested={() => setSuggestionsActvTypes([])}
                  onSuggestionsFetchRequested={({ value }: any) => {
                    addFormik.setFieldValue("ActivityTypeId", value);
                    setSuggestionsActvTypes(getSuggestionsActvTypes(value));
                  }}
                  onSuggestionSelected={(_: any, { suggestionValue }: any) => {
                    setSelectSuggestionsActvTypes(suggestionValue);
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
                  name={"ServingLocation"}
                  onChange={addFormik.handleChange}
                  value={addFormik.values.ServingLocation}
                  error={addFormik.touched.ServingLocation && Boolean(addFormik.errors.ServingLocation)}
                  helperText={addFormik.touched.ServingLocation && addFormik.errors.ServingLocation}
                  fullWidth
                  label="محل خدمت"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name={"Wage"}
                  onChange={addFormik.handleChange}
                  value={addFormik.values.Wage}
                  error={addFormik.touched.Wage && Boolean(addFormik.errors.Wage)}
                  helperText={addFormik.touched.Wage && addFormik.errors.Wage}
                  fullWidth
                  type={"number"}
                  label="دستمزد (تومان)"
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
          title={edit.toolsName}
          onClose={() => {
            setEdit(null);
            editFormik.handleReset(1);
          }}
        >
          <form noValidate onSubmit={editFormik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autosuggest
                  name={"ToolsNameId"}
                  id={"ToolsNameId"}
                  error={editFormik.touched.ToolsNameId && Boolean(editFormik.errors.ToolsNameId)}
                  helperText={editFormik.touched.ToolsNameId && editFormik.errors.ToolsNameId}
                  suggestions={suggestionsTools ?? []}
                  onSuggestionsClearRequested={() => setSuggestionsTools([])}
                  onSuggestionsFetchRequested={({ value }: any) => {
                    editFormik.setFieldValue("ToolsNameId", value);
                    setSuggestionsTools(getSuggestionsTools(value));
                  }}
                  onSuggestionSelected={(_: any, { suggestionValue }: any) => {
                    setSelectSuggestionsTools(suggestionValue);
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
                      ? editFormik.touched.ToolsNameId && Boolean(editFormik.errors.ToolsNameId)
                        ? "react-autosuggest__input__empty--dark"
                        : "react-autosuggest__input--dark"
                      : editFormik.touched.ToolsNameId && Boolean(editFormik.errors.ToolsNameId)
                        ? "react-autosuggest__input__empty"
                        : "react-autosuggest__input",
                  }}
                  inputProps={{
                    placeholder: "نام ماشین یا ابزار*",
                    value: editFormik.values.ToolsNameId,
                    onChange: (_: any, { newValue, method }: any) => {
                      editFormik.setFieldValue("ToolsNameId", newValue);
                    },
                  }}
                  highlightFirstSuggestion={true}
                />
                <Box component="span" sx={{ color: errColor, fontSize: "0.85rem" }}>
                  {editFormik.touched.ToolsNameId && editFormik.errors.ToolsNameId}
                  {editFormik.touched.ToolsNameId && Boolean(editFormik.errors.ToolsNameId)}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name={"Qty"}
                  onChange={editFormik.handleChange}
                  value={editFormik.values.Qty}
                  error={editFormik.touched.Qty && Boolean(editFormik.errors.Qty)}
                  helperText={editFormik.touched.Qty && editFormik.errors.Qty}
                  fullWidth
                  type={"number"}
                  label="تعداد"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  id={"WorkingStatus"}
                  value={editFormik.values.WorkingStatus}
                  onChange={(e) => editFormik.setFieldValue("WorkingStatus", e.target.value)}
                  error={editFormik.touched.WorkingStatus && Boolean(editFormik.errors.WorkingStatus)}
                  helperText={editFormik.touched.WorkingStatus && editFormik.errors.WorkingStatus}
                  label="وضعیت"
                  fullWidth
                >
                  {Object.keys(workingStatus).map((type) => (
                    // @ts-ignore
                    <MenuItem key={type} value={+type}>
                      {workingStatus[+type]}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item sm={6} xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFnsJalali}>
                  <TimePicker
                    viewRenderers={{
                      hours: renderTimeViewClock,
                      minutes: renderTimeViewClock,
                      seconds: renderTimeViewClock,
                    }}
                    sx={{ width: "100%" }}
                    ampm={false}
                    value={moment(editFormik.values.EnterTime).toDate()}
                    onChange={(date) => editFormik.setFieldValue("EnterTime", moment(date).locale("en").format("YYYY-MM-DDTHH:mm"))}
                    label="ساعت ورود"
                  />
                </LocalizationProvider>
                {editFormik.touched.EnterTime && Boolean(editFormik.errors.EnterTime) ? <Typography  variant={"caption"} sx={{color:"#d32f2f"}}>
                  { editFormik.touched.EnterTime && editFormik.errors.EnterTime}
                </Typography> : null}
              </Grid>
              <Grid item sm={6} xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFnsJalali}>
                  <TimePicker
                      viewRenderers={{
                        hours: renderTimeViewClock,
                        minutes: renderTimeViewClock,
                        seconds: renderTimeViewClock,
                      }}
                      sx={{width: "100%"}}
                      ampm={false}
                      value={moment(editFormik.values.ExitTime).toDate()}
                      onChange={(date) => editFormik.setFieldValue("ExitTime", moment(date).locale("en").format("YYYY-MM-DDTHH:mm"))}
                      label="ساعت خروج"
                  />
                </LocalizationProvider>
                {editFormik.touched.ExitTime && Boolean(editFormik.errors.ExitTime) ?
                    <Typography variant={"caption"} sx={{color: "#d32f2f"}}>
                      {editFormik.touched.ExitTime && editFormik.errors.ExitTime}
                    </Typography> : null}
              </Grid>
              <Grid item xs={12}>
                <Autosuggest
                  name={"ContructorId"}
                  id={"ContructorId"}
                  error={editFormik.touched.ContructorId && Boolean(editFormik.errors.ContructorId)}
                  helperText={editFormik.touched.ContructorId && editFormik.errors.ContructorId}
                  suggestions={suggestionsContructors ?? []}
                  onSuggestionsClearRequested={() => setSuggestionsContructors([])}
                  onSuggestionsFetchRequested={({ value }: any) => {
                    editFormik.setFieldValue("ContructorId", value);
                    setSuggestionsContructors(getSuggestionsContructors(value));
                  }}
                  onSuggestionSelected={(_: any, { suggestionValue }: any) => {
                    setSelectSuggestionsContructors(suggestionValue);
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
                      ? editFormik.touched.ContructorId && Boolean(editFormik.errors.ContructorId)
                        ? "react-autosuggest__input__empty--dark"
                        : "react-autosuggest__input--dark"
                      : editFormik.touched.ContructorId && Boolean(editFormik.errors.ContructorId)
                        ? "react-autosuggest__input__empty"
                        : "react-autosuggest__input",
                  }}
                  inputProps={{
                    placeholder: "طرف حساب*",
                    value: editFormik.values.ContructorId,
                    onChange: (_: any, { newValue, method }: any) => {
                      editFormik.setFieldValue("ContructorId", newValue);
                    },
                  }}
                  highlightFirstSuggestion={true}
                />
                <Box component="span" sx={{ color: errColor, fontSize: "0.85rem" }}>
                  {editFormik.touched.ContructorId && editFormik.errors.ContructorId}
                  {editFormik.touched.ContructorId && Boolean(editFormik.errors.ContructorId)}
                </Box>
                {/* <Autocomplete
                           options={contructors}
                           defaultValue={contructors.find((C: any) => C.contructorNameId === edit.contructorId)}
                           onChange={(e, value) => editFormik.setFieldValue("ContructorId", value ? value.contructorNameId : "")}
                           getOptionLabel={(C: any) => C.contructorName}
                           renderInput={(params) => (
                              <TextField
                                 {...params}
                                 error={editFormik.touched.ContructorId && Boolean(editFormik.errors.ContructorId)}
                                 helperText={editFormik.touched.ContructorId && editFormik.errors.ContructorId}
                                 required
                                 fullWidth
                                 label="طرف حساب"
                                 variant="outlined"
                              />
                           )}
                        /> */}
              </Grid>
              <Grid item xs={12}>
                <Autosuggest
                  name={"ActivityTypeId"}
                  id={"ActivityTypeId"}
                  error={editFormik.touched.ActivityTypeId && Boolean(editFormik.errors.ActivityTypeId)}
                  helperText={editFormik.touched.ActivityTypeId && editFormik.errors.ActivityTypeId}
                  suggestions={suggestionsActvTypes ?? []}
                  onSuggestionsClearRequested={() => setSuggestionsActvTypes([])}
                  onSuggestionsFetchRequested={({ value }: any) => {
                    editFormik.setFieldValue("ActivityTypeId", value);
                    setSuggestionsActvTypes(getSuggestionsActvTypes(value));
                  }}
                  onSuggestionSelected={(_: any, { suggestionValue }: any) => {
                    setSelectSuggestionsActvTypes(suggestionValue);
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
                {/* <Autocomplete
                           options={actvTypes}
                           defaultValue={actvTypes.find((A: any) => A.id === edit.activityTypeId)}
                           onChange={(e, value) => editFormik.setFieldValue("ActivityTypeId", value ? value.id : "")}
                           getOptionLabel={(A: any) => A.name}
                           renderInput={(params) => (
                              <TextField
                                 {...params}
                                 error={editFormik.touched.ActivityTypeId && Boolean(editFormik.errors.ActivityTypeId)}
                                 helperText={editFormik.touched.ActivityTypeId && editFormik.errors.ActivityTypeId}
                                 required
                                 fullWidth
                                 label="نوع فعالیت"
                                 variant="outlined"
                              />
                           )}
                        /> */}
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name={"ServingLocation"}
                  onChange={editFormik.handleChange}
                  value={editFormik.values.ServingLocation}
                  error={editFormik.touched.ServingLocation && Boolean(editFormik.errors.ServingLocation)}
                  helperText={editFormik.touched.ServingLocation && editFormik.errors.ServingLocation}
                  fullWidth
                  label="محل خدمت"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name={"Wage"}
                  onChange={editFormik.handleChange}
                  value={editFormik.values.Wage}
                  error={editFormik.touched.Wage && Boolean(editFormik.errors.Wage)}
                  helperText={editFormik.touched.Wage && editFormik.errors.Wage}
                  fullWidth
                  type={"number"}
                  label="دستمزد (تومان)"
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
        <ModalIpa open={Boolean(remove)} title={`آیا از حذف ماشین یا ابزار مطمئن هستید؟`} onClose={() => setRemove(null)}>
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
        <ModalIpa open={Boolean(verify)} title={`آیا از تایید ماشین یا ابزار مطمئن هستید؟`} onClose={() => setVerify(null)}>
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
          title={`آیا از تایید تمام ماشین یا ابزار ها مطمئن هستید؟`}
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

export { ToolsReportDailyPage };
