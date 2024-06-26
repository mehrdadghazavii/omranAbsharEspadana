import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  FormControlLabel,
  Grid,
  Paper,
  Switch,
  TextField,
  useTheme,
  Typography, Alert
} from "@mui/material";
import {Delete, Edit, ThumbDown, Settings, ThumbUp} from "@mui/icons-material";
import {
  deleteMaterialOfProject,
  getContructorsOfProject,
  getDailyMaterialsByProjectId,
  getMaterialsOfProject,
  postMaterialAtProject,
  PostOrPutMaterialProps,
  putMaterialAtProject,
  uploadImageMaterial,
  verifyAllMaterials,
  verifyCurrentMaterial,
  postMaterialsNames,
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
import { TableCellStyled } from "../components/table-cell-styled.report-daily";
import OmranLogo from "../../../../asset/images/mainLogo.png";
import Autosuggest from "react-autosuggest";
import { red } from "@mui/material/colors";
import {
  handleSetVerifiedBadge,
  handleShowCopyRowInItem,
  handleShowModalDateCopyRow,
  setConfirmToggleDetails,
  setToggleDetails,
} from "redux/actions/actions";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "configs/configs";
import moment from "jalali-moment";
import { currentPageNumber } from "../../../../utils/currentPage-number";
import Checkbox from "@mui/material/Checkbox";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFnsJalali } from "@mui/x-date-pickers/AdapterDateFnsJalali";
import { DatePicker } from "@mui/x-date-pickers";
import EditPdf from "components/pdf/editPDF.comp";
import AddPdf from "../../../../components/pdf/addPDF.comp";
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
    minWidth: 120,
  },
  {
    id: "pdfUrl",
    label: "PDF",
    align: "center",
    minWidth: 120,
  },
  {
    id: "materialsName",
    label: "نام",
    align: "left",
    minWidth: 120,
  },
  {
    id: "amount",
    label: "مقدار",
    align: "center",
    minWidth: 50,
  },
  {
    id: "exitAndEnter",
    label: "ورودی و خروجی",
    align: "center",
    minWidth: 60,
    // format: (value: boolean) => (value ? "ورود" : "نادرست"),
  },
  {
    id: "contructorName",
    label: "طرف حساب",
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

function MaterialsReportDailyPage({ date }: any) {
  const [rows, setRows] = useState<any>(null);
  const [filteredRow, setFilteredRow] = useState<any>([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState<any>(10);
  const [add, setAdd] = useState<any>(null);
  const [edit, setEdit] = useState<any>(null);
  const [preview, setPreview] = useState<any>(null);
  const [picturePath, setPicturePath] = useState<any>("");
  const [keySearch, setKeySearch] = useState<any>("");
  const [remove, setRemove] = useState<any>(null);
  const [materials, setMaterials] = useState<any>([]);
  const [contructors, setContructors] = useState<any>([]);
  const [verify, setVerify] = useState<any>(null);
  const [verifyAll, setVerifyAll] = useState(false);
  const [reject, setReject] = useState<any>(null);
  const [img, setImg] = useState<any>("");
  const [pdf, setPdf] = useState<any>("");
  const [pdfLink, setPdfLink] = useState<any>("");
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

  const dispatch = useDispatch();
  const { companyId, projectId } = useParams();
  const image = useRef(null);
  const pdfRef = useRef(null);
  const errColor = red[600];
  const theme = useTheme();

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
      fromDate: startDate,
      toDate: "",
    },
    validationSchema: validation,
    onSubmit: async (values, {resetForm}) => {
      const res = await postCopyRecords(currentPageNumber[currentPage], projectId, {
        from: values.fromDate,
        to: values.toDate,
        recordIds: checkedIdList,
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
    MaterialsNameId: Yup.string().required("نباید خالی باشد"),
    ContructorNameId: Yup.string().required("نباید خالی باشد"),
    Unit: Yup.string().required("نباید خالی باشد"),
    Wage: Yup.number().test("باید عدد بزرگتر از صفر باشد", "باید عدد بزرگتر از صفر باشد", function (value) {
      return +value >= 0;
    }),
    Amount: Yup.number().test("باید عدد بزرگتر از صفر باشد", "باید عدد بزرگتر از صفر باشد", function (value) {
      return +value >= 0;
    }),
  });
  const editValidation = Yup.object({
    MaterialsNameId: Yup.string().required("نباید خالی باشد"),
    ContructorNameId: Yup.string().required("نباید خالی باشد"),
    Unit: Yup.string().required("نباید خالی باشد"),
    Wage: Yup.number().test("باید عدد بزرگتر از صفر باشد", "باید عدد بزرگتر از صفر باشد", function (value) {
      return +value >= 0;
    }),
    Amount: Yup.number().test("باید عدد بزرگتر از صفر باشد", "باید عدد بزرگتر از صفر باشد", function (value) {
      return +value >= 0;
    }),
  });

  const addFormik = useFormik({
    initialValues: {
      Unit: "",
      Amount: 0,
      Wage: 0,
      Description: "",
      ActivityCode: "",
      ProjectId: projectId,
      ContructorNameId: "",
      MaterialsNameId: "",
      ReportDate: date,
      LastUserLevel: 1,
      ExitAndEnter: true,
    },
    validationSchema: addValidation,
    onSubmit: async (values, { resetForm }) => {
      values.ReportDate = date;
      const data: PostOrPutMaterialProps = { ...values };
      if (img) {
        const resUpl: any = await uploadImageMaterial(image.current.files[0], companyId, projectId);
        if (!(resUpl instanceof Error)) {
          data.PictureUrl = resUpl.url;
        } else {
          toast.error("آپلود عکس با خطا مواجه شد");
        }
      }
      if (pdf) {
        const resPdfUpl: any = await uploadImageMaterial(pdf, companyId, projectId);
        if (!(resPdfUpl instanceof Error)) {
          data.PdfUrl = resPdfUpl.url;
          setPdf("");
        } else {
          toast.error("آپلود PDF با خطا مواجه شد");
        }
      }
      if (values.ContructorNameId !== selectSuggestionsContructors || values.MaterialsNameId !== selectSuggestionsMaterials) {
        if (values.ContructorNameId !== selectSuggestionsContructors && values.MaterialsNameId === selectSuggestionsMaterials) {
          const conDet: any = await postConstructorName({
            Name: values.ContructorNameId,
            ProjectId: values.ProjectId,
          });
          const matId = materials.find((item: any) => item.materialsName === values.MaterialsNameId);
          const res = await postMaterialAtProject({
            ...data,
            ContructorNameId: conDet?.id,
            MaterialsNameId: matId?.materialsNameId,
          });
          if (!(res instanceof Error)) {
            setAdd(null);
            toast.success("مصالح با موفقیت درج شد");
            await refresh();
            // search(keySearch)
            resetForm();
          } else {
            toast.error("درج مصالح با خطا مواجه شد");
          }
        }

        if (values.ContructorNameId === selectSuggestionsContructors && values.MaterialsNameId !== selectSuggestionsMaterials) {
          const matDet: any = await postMaterialsNames({
            Name: values.MaterialsNameId,
            ProjectId: values.ProjectId,
          });
          const contId = contructors.find((item: any) => item.contructorName === values.ContructorNameId);
          const res = await postMaterialAtProject({
            ...data,
            MaterialsNameId: matDet?.id,
            ContructorNameId: contId.contructorNameId,
          });
          if (!(res instanceof Error)) {
            setAdd(null);
            toast.success("مصالح با موفقیت درج شد");
            await refresh();
            // search(keySearch)
            resetForm();
          } else {
            toast.error("درج مصالح با خطا مواجه شد");
          }
        }

        if (values.ContructorNameId !== selectSuggestionsContructors && values.MaterialsNameId !== selectSuggestionsMaterials) {
          const matDet: any = await postMaterialsNames({
            Name: values.MaterialsNameId,
            ProjectId: values.ProjectId,
          });
          const conDet: any = await postConstructorName({
            Name: values.ContructorNameId,
            ProjectId: values.ProjectId,
          });

          const res = await postMaterialAtProject({ ...data, MaterialsNameId: matDet?.id, ContructorNameId: conDet?.id });
          if (!(res instanceof Error)) {
            setAdd(null);
            toast.success("مصالح با موفقیت درج شد");
            await refresh();
            // search(keySearch)
            resetForm();
          } else {
            toast.error("درج مصالح با خطا مواجه شد");
          }
        }
      } else {
        const contId = contructors.find((item: any) => item.contructorName === values.ContructorNameId);
        const matId = materials.find((item: any) => item.materialsName === values.MaterialsNameId);
        const res = await postMaterialAtProject({
          ...data,
          ContructorNameId: contId?.contructorNameId,
          MaterialsNameId: matId?.materialsNameId,
        });
        if (!(res instanceof Error)) {
          setAdd(null);
          toast.success("مصالح با موفقیت درج شد");
          await refresh();
          // search(keySearch)
          resetForm();
        } else {
          toast.error("درج مصالح با خطا مواجه شد");
        }
      }
    },
  });
  const editFormik = useFormik({
    initialValues: {
      Unit: "",
      Amount: 0,
      Wage: 0,
      Description: "",
      ActivityCode: "",
      ProjectId: projectId,
      ContructorNameId: "",
      MaterialsNameId: "",
      ReportDate: date,
      LastUserLevel: 1,
      ExitAndEnter: true,
      PictureUrl: '',
      PdfUrl: '',
    },
    validationSchema: editValidation,
    onSubmit: async (values, { resetForm }) => {
      const data: PostOrPutMaterialProps = { ...values};
        if (img !== edit.pictureUrl && img) {
          const resUpl: any = await uploadImageMaterial(image.current.files[0], companyId, projectId);
          if (!(resUpl instanceof Error)) {
            data.PictureUrl = resUpl.url;
          } else {
            toast.error("آپلود عکس با خطا مواجه شد");
          }
        }

        if (pdf) {
          const resPdfUpl: any = await uploadImageMaterial(pdf, companyId, projectId);
          if (!(resPdfUpl instanceof Error)) {
            data.PdfUrl = resPdfUpl.url;
            setPdf("");
          } else {
            toast.error("آپلود PDF با خطا مواجه شد");
          }
        }

      if (values.ContructorNameId !== selectSuggestionsContructors || values.MaterialsNameId !== selectSuggestionsMaterials) {
        if (values.ContructorNameId !== selectSuggestionsContructors && values.MaterialsNameId === selectSuggestionsMaterials) {
          const conDet: any = await postConstructorName({
            Name: values.ContructorNameId,
            ProjectId: values.ProjectId,
          });
          const matId = materials.find((item: any) => item.materialsName === values.MaterialsNameId);
          const res = await putMaterialAtProject(
            { ...data, Id: edit.id, ContructorNameId: conDet?.id, MaterialsNameId: matId?.materialsNameId },
            edit.id
          );
          if (!(res instanceof Error)) {
            setEdit(null);
            toast.success("مصالح با موفقیت ویرایش شد");
            await refresh();
            // search(keySearch)
            resetForm();
          } else {
            toast.error("ویرایش مصالح با خطا مواجه شد");
          }
        }

        if (values.ContructorNameId === selectSuggestionsContructors && values.MaterialsNameId !== selectSuggestionsMaterials) {
          const matDet: any = await postMaterialsNames({
            Name: values.MaterialsNameId,
            ProjectId: values.ProjectId,
          });
          const contId = contructors.find((item: any) => item.contructorName === values.ContructorNameId);
          const res = await putMaterialAtProject(
            { ...data, Id: edit.id, MaterialsNameId: matDet?.id, ContructorNameId: contId.contructorNameId },
            edit.id
          );
          if (!(res instanceof Error)) {
            setEdit(null);
            toast.success("مصالح با موفقیت ویرایش شد");
            await refresh();
            // search(keySearch)
            resetForm();
          } else {
            toast.error("ویرایش مصالح با خطا مواجه شد");
          }
        }

        if (values.ContructorNameId !== selectSuggestionsContructors && values.MaterialsNameId !== selectSuggestionsMaterials) {
          const matDet: any = await postMaterialsNames({
            Name: values.MaterialsNameId,
            ProjectId: values.ProjectId,
          });
          const conDet: any = await postConstructorName({
            Name: values.ContructorNameId,
            ProjectId: values.ProjectId,
          });

          const res = await putMaterialAtProject(
            { ...data, Id: edit.id, MaterialsNameId: matDet?.id, ContructorNameId: conDet?.id },
            edit.id
          );
          if (!(res instanceof Error)) {
            setEdit(null);
            toast.success("مصالح با موفقیت ویرایش شد");
            await refresh();
            // search(keySearch)
            resetForm();
          } else {
            toast.error("ویرایش مصالح با خطا مواجه شد");
          }
        }
      } else {
        const contId = contructors.find((item: any) => item.contructorName === values.ContructorNameId);
        const matId = materials.find((item: any) => item.materialsName === values.MaterialsNameId);
        const res = await putMaterialAtProject(
          { ...data, Id: edit.id, ContructorNameId: contId?.contructorNameId, MaterialsNameId: matId?.materialsNameId },
          edit.id
        );
        if (!(res instanceof Error)) {
          setEdit(null);
          toast.success("مصالح با موفقیت ویرایش شد");
          await refresh();
          // search(keySearch)
          resetForm();
        } else {
          toast.error("ویرایش مصالح با خطا مواجه شد");
        }
      }
    },
    // onSubmit: async (values, { resetForm }) => {
    //    const data: PostOrPutMaterialProps = { ...values, PictureUrl: edit.pictureUrl };

    //    if (img !== edit.pictureUrl && image.current.files) {
    //       const resUpl: any = await uploadImageMaterial(image.current.files[0]);
    //       if (!(resUpl instanceof Error)) {
    //          data.PictureUrl = resUpl.url;
    //       } else {
    //          toast.error("آپلود عکس با خطا مواجه شد");
    //       }
    //    }
    //    const res = await putMaterialAtProject({ ...data, Id: edit.id }, edit.id);
    //    if (!(res instanceof Error)) {
    //       setEdit(null);
    //       await refresh();
    //       toast.success("مصالح با موفقیت ویرایش یافت");
    //       resetForm();
    //    } else {
    //       toast.error("ویرایش مصالح با خطا مواجه شد");
    //    }
    // },
  });

  useEffect(() => {
    if (edit) {
      editFormik.setValues({
        Unit: edit.unit,
        Amount: edit.amount,
        Wage: edit.wage,
        Description: edit.description,
        ActivityCode: edit.activityCode,
        ProjectId: projectId,
        ContructorNameId: edit.contructorName,
        MaterialsNameId: edit.materialsName,
        ReportDate: edit.reportDate,
        LastUserLevel: 1,
        ExitAndEnter: edit.exitAndEnter,
        PictureUrl: edit.pictureUrl,
        PdfUrl: edit.pdfUrl
      });
      setImg(edit.pictureUrl || "");
      setPdfLink(edit.pdfUrl || "");
    }
  }, [edit]);
  const handleRemove = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await deleteMaterialOfProject(remove, projectId);
    if (!(res instanceof Error)) {
      const tmpRows = [...rows];
      const index = tmpRows.findIndex((row) => row.id === remove);
      await tmpRows.splice(index, 1);
      setRows(tmpRows);
      setRemove(null);
      toast.success("مصالح با موفقیت حذف شد");
    } else {
      toast.error("حذف مصالح با خطا مواجه شد");
    }
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await verifyCurrentMaterial(verify, projectId);
    if (!(res instanceof Error)) {
      const tmpRows = [...rows];
      const index = tmpRows.findIndex((row) => row.id === verify);
      tmpRows[index].verify = 1;
      setRows(tmpRows);
      setVerify(null);
      await refresh();
      toast.success("مصالح با موفقیت تایید شد");
    } else {
      toast.error("تایید مصالح با خطا مواجه شد");
    }
  };

  const handleVerifyAll = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await verifyAllMaterials(projectId, date);
    if (!(res instanceof Error)) {
      const tmpRows = [...rows];
      for (let i = 0; i < tmpRows.length; i++) {
        tmpRows[i].verify = 1;
      }
      setRows(tmpRows);
      setVerifyAll(false);
      await refresh();
      toast.success("تمام مصالح ها تایید شدند");
    } else {
      toast.error("تایید مصالح ها با خطا مواجه شد");
    }
  };

  const handleReject = async (event) => {
    event.preventDefault();
    const res = await rejectDailyReports(reject, rejectApiTypes.Material, projectId);
    if (!(res instanceof Error)) {
      setRows(rows.filter(row => row.id !== reject));
      setReject(null);
      toast.success("گزارش رد و به سطح قبلی ارجاع داده شد")
    } else {
      toast.error("خطا در رَد گزارش")
    }
  }

  const refresh = async () => {
    const res = await getDailyMaterialsByProjectId(projectId, date);
    const resMaterials = await getMaterialsOfProject(projectId);
    const resContructors = await getContructorsOfProject(projectId);

    if (!(res instanceof Error)) {
      setRows(res);
      setFilteredRow(res);
      // @ts-ignore
      setCount(res.length);
    }

    if (!(resMaterials instanceof Error)) {
      setMaterials(resMaterials);
    }

    if (!(res instanceof Error)) {
      setContructors(resContructors);
    }
  };

  const getAllNeedData = async () => {
    const res = await getDailyMaterialsByProjectId(projectId, date);
    const resMaterials = await getMaterialsOfProject(projectId);
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
    if (!(resMaterials instanceof Error)) {
      setMaterials(resMaterials);
    }
    if (!(resContructors instanceof Error)) {
      setContructors(resContructors);
    }
  };



  const search = (key: string) => {
    if (key) {
      const filtered = rows.filter((row: any) => row.materialsName.includes(key) || row.contructorName.includes(key));
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

  const lowerCasedContructors = contructors?.map((item: any) => item.contructorName.toLowerCase());
  const [suggestionsContructors, setSuggestionsContructors] = useState<string[]>([]);
  const [selectSuggestionsContructors, setSelectSuggestionsContructors] = useState<any>("");

  function getSuggestionsContructors(value: string): string[] {
    return lowerCasedContructors?.filter((item: any) => item.startsWith(value.trim().toLowerCase()));
  }

  const lowerCasedMaterials = materials?.map((item: any) => item.materialsName.toLowerCase());
  const [suggestionsMaterials, setSuggestionsMaterials] = useState<string[]>([]);
  const [selectSuggestionsMaterials, setSelectSuggestionsMaterials] = useState<any>("");

  function getSuggestionsMaterials(value: string): string[] {
    return lowerCasedMaterials?.filter((item: any) => item.startsWith(value.trim().toLowerCase()));
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
                  titleAdd={"درج مصالح"}
                  onClickAdd={() => {
                    setAdd(true);
                    setImg("");
                    setPdf("");
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
              let value = row[column.id];
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
              } else if (head === "exitAndEnter") {
                return (
                  <TableCellStyled active={row.verify === userType} key={column.id} align={column.align}>
                    <Typography variant="body2">{value ? "ورود" : "خروج"}</Typography>
                  </TableCellStyled>
                );
              } else if (head === "pictureUrl") {
                return (
                  <TableCellStyled active={row.verify === userType} key={column.id} align={column.align}>
                    <img
                      onClick={() => {
                        setPreview(value);
                        dispatch(setToggleDetails(false));
                        setPicturePath(row?.pictureUrl?.replace("~", BASE_URL));
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
                        width: "80%",
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
          title={"درج مصالح"}
          onClose={() => {
            setAdd(null);
            addFormik.handleReset(1);
          }}
        >
          <form noValidate onSubmit={addFormik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {/* <Autocomplete
                    options={materials}
                    onChange={(e, value) => {
                      addFormik.setFieldValue('MaterialsNameId', value ? value.materialsNameId : '')
                    }}
                    getOptionLabel={(tool: any) => tool.materialsName}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            error={addFormik.touched.MaterialsNameId && Boolean(addFormik.errors.MaterialsNameId)}
                            helperText={addFormik.touched.MaterialsNameId && addFormik.errors.MaterialsNameId}
                            required
                            fullWidth
                            label="نام مصالح"
                            variant="outlined"/>)}
                /> */}
                <Autosuggest
                  name={"MaterialsNameId"}
                  id={"MaterialsNameId"}
                  error={addFormik.touched.MaterialsNameId && Boolean(addFormik.errors.MaterialsNameId)}
                  helperText={addFormik.touched.MaterialsNameId && addFormik.errors.MaterialsNameId}
                  suggestions={suggestionsMaterials ?? []}
                  onSuggestionsClearRequested={() => setSuggestionsMaterials([])}
                  onSuggestionsFetchRequested={({ value }: any) => {
                    addFormik.setFieldValue("MaterialsNameId", value);
                    setSuggestionsMaterials(getSuggestionsMaterials(value));
                  }}
                  onSuggestionSelected={(_: any, { suggestionValue }: any) => {
                    setSelectSuggestionsMaterials(suggestionValue);
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
                      ? addFormik.touched.MaterialsNameId && Boolean(addFormik.errors.MaterialsNameId)
                        ? "react-autosuggest__input__empty--dark"
                        : "react-autosuggest__input--dark"
                      : addFormik.touched.MaterialsNameId && Boolean(addFormik.errors.MaterialsNameId)
                        ? "react-autosuggest__input__empty"
                        : "react-autosuggest__input",
                  }}
                  inputProps={{
                    placeholder: "نام مصالح*",
                    value: addFormik.values.MaterialsNameId,
                    onChange: (_: any, { newValue, method }: any) => {
                      addFormik.setFieldValue("MaterialsNameId", newValue);
                    },
                  }}
                  highlightFirstSuggestion={true}
                />
                <Box component="span" sx={{ color: errColor, fontSize: "0.85rem" }}>
                  {addFormik.touched.MaterialsNameId && addFormik.errors.MaterialsNameId}
                  {addFormik.touched.MaterialsNameId && Boolean(addFormik.errors.MaterialsNameId)}
                </Box>
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControlLabel
                  control={
                    <>
                      <Box
                        component="span"
                        sx={{
                          pb: 0.3,
                          pl: 0.3,
                          color: !addFormik.values.ExitAndEnter ? theme.palette.text.primary : theme.palette.grey[400],
                        }}
                      >
                        خروج
                      </Box>
                      <Switch checked={addFormik.values.ExitAndEnter} onChange={addFormik.handleChange} name="ExitAndEnter" />
                    </>
                  }
                  label="ورود"
                  labelPlacement={"end"}
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      color: addFormik.values.ExitAndEnter ? theme.palette.text.primary : theme.palette.grey[400],
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
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
              <Grid item xs={12}>
                <TextField
                  name={"Unit"}
                  required
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
                {/* <Autocomplete
                    options={contructors}
                    onChange={(e, value) =>
                        addFormik.setFieldValue('ContructorNameId', value ? value.contructorNameId : '')}
                    getOptionLabel={(C: any) => C.contructorName}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            error={addFormik.touched.ContructorNameId && Boolean(addFormik.errors.ContructorNameId)}
                            helperText={addFormik.touched.ContructorNameId && addFormik.errors.ContructorNameId}
                            required
                            fullWidth
                            label="طرف حساب"
                            variant="outlined"/>)}
                /> */}
                <Autosuggest
                  name={"ContructorNameId"}
                  id={"ContructorNameId"}
                  error={addFormik.touched.ContructorNameId && Boolean(addFormik.errors.ContructorNameId)}
                  helperText={addFormik.touched.ContructorNameId && addFormik.errors.ContructorNameId}
                  suggestions={suggestionsContructors ?? []}
                  onSuggestionsClearRequested={() => setSuggestionsContructors([])}
                  onSuggestionsFetchRequested={({ value }: any) => {
                    addFormik.setFieldValue("ContructorNameId", value);
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
                      ? addFormik.touched.ContructorNameId && Boolean(addFormik.errors.ContructorNameId)
                        ? "react-autosuggest__input__empty--dark"
                        : "react-autosuggest__input--dark"
                      : addFormik.touched.ContructorNameId && Boolean(addFormik.errors.ContructorNameId)
                        ? "react-autosuggest__input__empty"
                        : "react-autosuggest__input",
                  }}
                  inputProps={{
                    placeholder: "طرف حساب*",
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
          title={edit.materialsName}
          onClose={() => {
            setEdit(null);
            setPdf('');
            editFormik.handleReset(1);
          }}
        >
          <form noValidate onSubmit={editFormik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {/* <Autocomplete
                    options={materials}
                    onChange={(e, value) => {
                      addFormik.setFieldValue('MaterialsNameId', value ? value.materialsNameId : '')
                    }}
                    getOptionLabel={(tool: any) => tool.materialsName}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            error={addFormik.touched.MaterialsNameId && Boolean(addFormik.errors.MaterialsNameId)}
                            helperText={addFormik.touched.MaterialsNameId && addFormik.errors.MaterialsNameId}
                            required
                            fullWidth
                            label="نام مصالح"
                            variant="outlined"/>)}
                /> */}
                <Autosuggest
                  name={"MaterialsNameId"}
                  id={"MaterialsNameId"}
                  error={editFormik.touched.MaterialsNameId && Boolean(editFormik.errors.MaterialsNameId)}
                  helperText={editFormik.touched.MaterialsNameId && editFormik.errors.MaterialsNameId}
                  suggestions={suggestionsMaterials ?? []}
                  onSuggestionsClearRequested={() => setSuggestionsMaterials([])}
                  onSuggestionsFetchRequested={({ value }: any) => {
                    editFormik.setFieldValue("MaterialsNameId", value);
                    setSuggestionsMaterials(getSuggestionsMaterials(value));
                  }}
                  onSuggestionSelected={(_: any, { suggestionValue }: any) => {
                    setSelectSuggestionsMaterials(suggestionValue);
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
                      ? editFormik.touched.MaterialsNameId && Boolean(editFormik.errors.MaterialsNameId)
                        ? "react-autosuggest__input__empty--dark"
                        : "react-autosuggest__input--dark"
                      : editFormik.touched.MaterialsNameId && Boolean(editFormik.errors.MaterialsNameId)
                        ? "react-autosuggest__input__empty"
                        : "react-autosuggest__input",
                  }}
                  inputProps={{
                    placeholder: "نام مصالح*",
                    value: editFormik.values.MaterialsNameId,
                    onChange: (_: any, { newValue, method }: any) => {
                      editFormik.setFieldValue("MaterialsNameId", newValue);
                    },
                  }}
                  highlightFirstSuggestion={true}
                />
                <Box component="span" sx={{ color: errColor, fontSize: "0.85rem" }}>
                  {editFormik.touched.MaterialsNameId && editFormik.errors.MaterialsNameId}
                  {editFormik.touched.MaterialsNameId && Boolean(editFormik.errors.MaterialsNameId)}
                </Box>
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControlLabel
                  control={
                    <>
                      <Box
                        component="span"
                        sx={{
                          pb: 0.3,
                          pl: 0.3,
                          color: !editFormik.values.ExitAndEnter ? theme.palette.text.primary : theme.palette.grey[400],
                        }}
                      >
                        خروج
                      </Box>
                      <Switch checked={editFormik.values.ExitAndEnter} onChange={editFormik.handleChange} name="ExitAndEnter" />
                    </>
                  }
                  label="ورود"
                  labelPlacement={"end"}
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      color: editFormik.values.ExitAndEnter ? theme.palette.text.primary : theme.palette.grey[400],
                    },
                  }}
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
              <Grid item xs={12}>
                <TextField
                  name={"Unit"}
                  required
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
                <Autosuggest
                  name={"ContructorNameId"}
                  id={"ContructorNameId"}
                  error={editFormik.touched.ContructorNameId && Boolean(editFormik.errors.ContructorNameId)}
                  helperText={editFormik.touched.ContructorNameId && editFormik.errors.ContructorNameId}
                  suggestions={suggestionsContructors ?? []}
                  onSuggestionsClearRequested={() => setSuggestionsContructors([])}
                  onSuggestionsFetchRequested={({ value }: any) => {
                    editFormik.setFieldValue("ContructorNameId", value);
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
                      ? editFormik.touched.ContructorNameId && Boolean(editFormik.errors.ContructorNameId)
                        ? "react-autosuggest__input__empty--dark"
                        : "react-autosuggest__input--dark"
                      : editFormik.touched.ContructorNameId && Boolean(editFormik.errors.ContructorNameId)
                        ? "react-autosuggest__input__empty"
                        : "react-autosuggest__input",
                  }}
                  inputProps={{
                    placeholder: "طرف حساب*",
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
                {/* <Autocomplete
                           options={contructors}
                           defaultValue={contructors.find((C: any) => C.contructorNameId === editFormik.values.ContructorNameId)}
                           onChange={(e, value) => editFormik.setFieldValue("ContructorNameId", value ? value.contructorNameId : "")}
                           getOptionLabel={(C: any) => C.contructorName}
                           renderInput={(params) => (
                              <TextField
                                 {...params}
                                 error={editFormik.touched.ContructorNameId && Boolean(editFormik.errors.ContructorNameId)}
                                 helperText={editFormik.touched.ContructorNameId && editFormik.errors.ContructorNameId}
                                 required
                                 fullWidth
                                 label="طرف حساب"
                                 variant="outlined"
                              />
                           )}
                        /> */}
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
        <ModalIpa open={Boolean(remove)} title={`آیا از حذف مصالح مطمئن هستید؟`} onClose={() => setRemove(null)}>
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
        <ModalIpa open={Boolean(verify)} title={`آیا از تایید مصالح مطمئن هستید؟`} onClose={() => setVerify(null)}>
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
        <ModalIpa open={Boolean(verifyAll)} title={`آیا از تایید تمام مصالح ها مطمئن هستید؟`} onClose={() => setVerifyAll(false)}>
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

export { MaterialsReportDailyPage };
