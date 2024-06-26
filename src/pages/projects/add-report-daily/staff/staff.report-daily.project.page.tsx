import React, {useEffect, useState} from "react";
import {
    Alert,
    Box,
    Button,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    useTheme,
} from "@mui/material";
import {Delete, Edit, ThumbDown, Settings, ThumbUp} from "@mui/icons-material";
import {
    deleteStaffOfProject,
    getDailyStaffsByProjectId,
    getServingLocationsByProjectId,
    getStaffsOfProject,
    postStaffAtProject,
    putStaffAtProject,
    verifyAllStaffs,
    verifyCurrentStaff,
    postStaffNames,
    postServingLocations, postCopyRecords,
    rejectDailyReports, getVerifiedForBadge,
} from "api/api";
import {toast} from "react-toastify";
import {useFormik} from "formik";
import * as Yup from "yup";
import "date-fns";
import {Column, TableIpa} from "components/table/table.componet";
import {ButtonsModal, FilterTable, MenuActionTable, ModalIpa, PaginationIpa} from "components";
import {useParams} from "react-router-dom";
import {VerifyAllReportDaily} from "../components/verify-all.report-daily";
import moment from "jalali-moment";
import {TableCellStyled} from "../components/table-cell-styled.report-daily";
import {DatePicker, renderTimeViewClock, TimePicker} from "@mui/x-date-pickers";
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {presentationStatus} from "../../../../utils/presentation-status.utils";
import Autosuggest from "react-autosuggest";
import {red} from "@mui/material/colors";
import {useDispatch, useSelector} from "react-redux";
import {AdapterDateFnsJalali} from "@mui/x-date-pickers/AdapterDateFnsJalali";
import Typography from "@mui/material/Typography";
import {
    handleSetVerifiedBadge,
    handleShowCopyRowInItem,
    handleShowModalDateCopyRow
} from "../../../../redux/actions/actions";
import {currentPageNumber} from "../../../../utils/currentPage-number";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
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
        id: "staffName",
        label: "نام",
        align: "left",
        minWidth: 120,
    },
    {
        id: "presentationStatus",
        label: "وضعیت حضور",
        align: "center",
        minWidth: 60,
        format: (value: number) => presentationStatus[value],
    },
    {
        id: "enterTime",
        label: "ساعت ورود",
        align: "center",
        minWidth: 30,
        format: (value: string) => moment(value).format("HH:mm"),
    },
    {
        id: "exitTime",
        label: "ساعت خروج",
        align: "center",
        minWidth: 30,
        format: (value: string) => moment(value).format("HH:mm"),
    },
    {
        id: "workingHours",
        label: "جمع ساعت کاری",
        align: "center",
        minWidth: 30,
    },
    {
        id: "action",
        label: "عملیات",
        align: "center",
        minWidth: 60,
    },
];

function StaffsReportDailyPage({date}: any) {
    const [rows, setRows] = useState<any>(null);
    const [filteredRow, setFilteredRow] = useState<any>([]);
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState<any>(10);
    const [add, setAdd] = useState<any>(null);
    const [edit, setEdit] = useState<any>(null);
    const [keySearch, setKeySearch] = useState<any>("");
    const [remove, setRemove] = useState<any>(null);
    const [staffs, setStaffs] = useState<any>([]);
    const [servingLocations, setServingLocations] = useState<any>([]);
    const [verify, setVerify] = useState<any>(null);
    const [verifyAll, setVerifyAll] = useState(false);
    const [reject, setReject] = useState<any>(null);
    const [checkedIdList, setCheckedIdList] = useState([]);
    const [checkedAllSelect, setCheckAllSelected] = useState(false);

    //@ts-ignore
    const darkMode = useSelector((state: any) => state?.dark);
    const {userType} = useSelector((state: any) => state.userAccess)
    const showCheckboxColumn = useSelector((state:any) => state.showCopyRowInItem);
    const showModalDateCopyRow = useSelector((state:any) => state.showModalDateCopyRow)
    const currentPage = useSelector((state:any) => state.currentPage)
    const startDate = useSelector((state:any) => state.startDate)

    const errColor = red[600];
    const {projectId} = useParams();
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
    const handleChangeRowChecked = (event , row) => {
        if(event.target.checked){
            setCheckedIdList([...checkedIdList ,  row?.id] )
        }else{
            setCheckedIdList(checkedIdList.filter((item:any) => item !== row?.id))
        }
    }

    useEffect(() => {
        if(!showCheckboxColumn){
            setCheckedIdList([])
        }
    }, [showCheckboxColumn]);

    const handleCloseModalDateCopyRow = () =>{
        dispatch(handleShowCopyRowInItem(false))
        dispatch(handleShowModalDateCopyRow(false))
    }
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
    const copyRowFormik = useFormik(({
        initialValues: {
            fromDate: "",
            toDate: ''
        },
        validationSchema: validation,
        onSubmit: async (values, {resetForm}) => {
            const res = await postCopyRecords(currentPageNumber[currentPage], projectId, {
                from: values.fromDate,
                to: values.toDate,
                recordIds: checkedIdList
            })
            if (!(res instanceof Error)) {
                toast.success('کپی داده ها با موفقیت انجام شد')
                handleCloseModalDateCopyRow()
            }
        }
    }))

    const handleChangeAllSelected = (event:any) =>{
        setCheckAllSelected(event.target.checked)
    }

    useEffect(() => {
        if(checkedAllSelect){
            setCheckedIdList(filteredRow.map((item:any) => item.id))
        }else{
            setCheckedIdList([])
        }
    }, [checkedAllSelect]);

    //End Handle the selected Row for the copy


    const staffValidation = Yup.object({
        staffNameId: Yup.string().required("نباید خالی باشد"),
        servingLocationId: Yup.string().required("نباید خالی باشد"),
        enterTime: Yup.date()
            .when("presentationStatus", {
                is: (presentationStatus: number) => presentationStatus !== 2,
                then: Yup.date()
                    .required("نباید خالی باشد")
                    .typeError("نامعتبر می باشد"),
            }),
        exitTime: Yup.date()
            .when("presentationStatus", {
                is: (presentationStatus: number) => presentationStatus !== 2,
                then: Yup.date()
                    .required("نباید خالی باشد")
                    .typeError("نامعتبر می باشد")
                    .test(
                        "ساعت خروج باید از ورود بزرگتر باشد",
                        "ساعت خروج باید از ورود بزرگتر باشد",
                        function (value: object) {
                            return moment(value, "HH:mm").diff(moment(this.parent.enterTime, "HH:mm"), "minute") > 0;
                        }),
            }),
        wage: Yup.number().test("باید عدد بزرگتر از صفر باشد", "باید عدد بزرگتر از صفر باشد", function (value) {
            return +value >= 0;
        }),
    });

    const addFormik = useFormik({
        initialValues: {
            activityCode: "",
            description: "",
            enterTime: "",
            exitTime: "",
            lastUserLevel: 1,
            presentationStatus: 1,
            projectId: projectId,
            reportDate: date,
            servingLocationId: "",
            staffNameId: "",
            verify: 0,
            wage: 0,
        },
        validationSchema: staffValidation,
        onSubmit: async (values, {resetForm}) => {
            values.reportDate = date;
            if (values.presentationStatus === 2 ) {
                delete values.enterTime;
                delete values.exitTime;
            }
            if (values.staffNameId !== selectSuggestionsStaffs || values.servingLocationId !== selectSuggestionsServingLocations) {
                if (values.staffNameId !== selectSuggestionsStaffs && values.servingLocationId === selectSuggestionsServingLocations) {
                    const staffDet: any = await postStaffNames({
                        Name: values.staffNameId,
                        ProjectId: values.projectId,
                    });

                    const servId = servingLocations.find((item: any) => item.name === values.servingLocationId);
                    const res = await postStaffAtProject({
                        ...values,
                        staffNameId: staffDet?.id,
                        servingLocationId: servId?.id
                    });
                    if (!(res instanceof Error)) {
                        setAdd(null);
                        toast.success("نیروی انسانی با موفقیت درج شد");
                        await refresh();
                        // search(keySearch)
                        resetForm();
                    } else {
                        toast.error("درج نیروی انسانی با خطا مواجه شد");
                    }
                }

                if (values.staffNameId === selectSuggestionsStaffs && values.servingLocationId !== selectSuggestionsServingLocations) {
                    const servDet: any = await postServingLocations({
                        Name: values.servingLocationId,
                        ProjectId: values.projectId,
                    });
                    const staffsId = staffs.find((item: any) => item.staffName === values.staffNameId);
                    const res = await postStaffAtProject({
                        ...values,
                        servingLocationId: servDet?.id,
                        staffNameId: staffsId?.staffNameId,
                    });
                    if (!(res instanceof Error)) {
                        setAdd(null);
                        toast.success("نیروی انسانی با موفقیت درج شد");
                        await refresh();
                        // search(keySearch)
                        resetForm();
                    } else {
                        toast.error("درج نیروی انسانی با خطا مواجه شد");
                        console.log('values', values)
                    }
                }

                if (values.staffNameId !== selectSuggestionsStaffs && values.servingLocationId !== selectSuggestionsServingLocations) {
                    const servDet: any = await postServingLocations({
                        Name: values.servingLocationId,
                        ProjectId: values.projectId,
                    });
                    const staffDet: any = await postStaffNames({
                        Name: values.staffNameId,
                        ProjectId: values.projectId,
                    });

                    const res = await postStaffAtProject({
                        ...values,
                        staffNameId: staffDet?.id,
                        servingLocationId: servDet?.id
                    });
                    if (!(res instanceof Error)) {
                        setAdd(null);
                        toast.success("نیروی انسانی با موفقیت درج شد");
                        await refresh();
                        // search(keySearch)
                        resetForm();
                    } else {
                        toast.error("درج نیروی انسانی با خطا مواجه شد");
                    }
                }
            } else {
                const staffsId = staffs.find((item: any) => item.staffName === values.staffNameId);
                const serLocId = servingLocations.find((item: any) => item.name === values.servingLocationId);
                const res = await postStaffAtProject({
                    ...values,
                    staffNameId: staffsId?.staffNameId,
                    servingLocationId: serLocId?.id,
                });
                if (!(res instanceof Error)) {
                    setAdd(null);
                    toast.success("نیروی انسانی با موفقیت درج شد");
                    await refresh();
                    // search(keySearch)
                    resetForm();
                } else {
                    toast.error("درج نیروی انسانی با خطا مواجه شد");
                }
            }
        },
    });

    const editFormik = useFormik({
        initialValues: {
            activityCode: "",
            description: "",
            enterTime: "",
            exitTime: "",
            lastUserLevel: 1,
            presentationStatus: 1,
            projectId: projectId,
            reportDate: date,
            servingLocationId: "",
            staffNameId: "",
            verify: 0,
            wage: 0,
        },
        validationSchema: staffValidation,
        onSubmit: async (values, {resetForm}) => {
            if (values.presentationStatus === 2 ) {
                delete values.enterTime;
                delete values.exitTime;
            }
            if (values.staffNameId !== selectSuggestionsStaffs || values.servingLocationId !== selectSuggestionsServingLocations) {
                if (values.staffNameId !== selectSuggestionsStaffs && values.servingLocationId === selectSuggestionsServingLocations) {
                    const staffDet: any = await postStaffNames({
                        Name: values.staffNameId,
                        ProjectId: values.projectId,
                    });
                    const servId = servingLocations.find((item: any) => item.name === values.servingLocationId);
                    const res = await putStaffAtProject(
                        {...values, Id: edit.id, staffNameId: staffDet?.id, servingLocationId: servId?.id},
                        edit.id
                    );
                    if (!(res instanceof Error)) {
                        setEdit(null);
                        toast.success("نیروی انسانی با موفقیت ویرایش شد");
                        await refresh();
                        // search(keySearch)
                        resetForm();
                    } else {
                        toast.error("ویرایش نیروی انسانی با خطا مواجه شد");
                    }
                }

                if (values.staffNameId === selectSuggestionsStaffs && values.servingLocationId !== selectSuggestionsServingLocations) {
                    const servDet: any = await postServingLocations({
                        Name: values.servingLocationId,
                        ProjectId: values.projectId,
                    });
                    const staffsId = staffs.find((item: any) => item.staffName === values.staffNameId);
                    const res = await putStaffAtProject(
                        {...values, Id: edit.id, servingLocationId: servDet?.id, staffNameId: staffsId?.staffNameId},
                        edit.id
                    );
                    if (!(res instanceof Error)) {
                        setEdit(null);
                        toast.success("نیروی انسانی با موفقیت ویرایش شد");
                        await refresh();
                        // search(keySearch)
                        resetForm();
                    } else {
                        toast.error("ویرایش نیروی انسانی با خطا مواجه شد");
                    }
                }

                if (values.staffNameId !== selectSuggestionsStaffs && values.servingLocationId !== selectSuggestionsServingLocations) {
                    const servDet: any = await postServingLocations({
                        Name: values.servingLocationId,
                        ProjectId: values.projectId,
                    });
                    const staffDet: any = await postStaffNames({
                        Name: values.staffNameId,
                        ProjectId: values.projectId,
                    });

                    const res = await putStaffAtProject(
                        {...values, Id: edit.id, staffNameId: staffDet?.id, servingLocationId: servDet?.id},
                        edit.id
                    );
                    if (!(res instanceof Error)) {
                        setEdit(null);
                        toast.success("نیروی انسانی با موفقیت ویرایش شد");
                        await refresh();
                        // search(keySearch)
                        resetForm();
                    } else {
                        toast.error("ویرایش نیروی انسانی با خطا مواجه شد");
                    }
                }
            } else {
                const staffsId = staffs.find((item: any) => item.staffName === values.staffNameId);
                const serLocId = servingLocations.find((item: any) => item.name === values.servingLocationId);
                const res = await putStaffAtProject(
                    {...values, Id: edit.id, staffNameId: staffsId?.staffNameId, servingLocationId: serLocId?.id},
                    edit.id
                );
                if (!(res instanceof Error)) {
                    setEdit(null);
                    toast.success("نیروی انسانی با موفقیت ویرایش شد");
                    await refresh();
                    // search(keySearch)
                    resetForm();
                } else {
                    toast.error("ویرایش نیروی انسانی با خطا مواجه شد");
                }
            }
        }
    });

    useEffect(() => {
        if (edit) {
            editFormik.setValues({
                activityCode: edit.activityCode,
                description: edit.description,
                enterTime: edit.enterTime ?? '',
                exitTime: edit.exitTime ?? '',
                lastUserLevel: edit.lastUserLevel,
                presentationStatus: edit.presentationStatus,
                projectId: projectId,
                reportDate: edit.reportDate,
                verify: edit.verify,
                // servingLocationId: edit.servingLocationId,
                servingLocationId: edit.servingLocationName,
                // staffNameId: staffs.find((S: any) => edit.staffName === S.staffName)!.staffNameId,
                staffNameId: edit.staffName,
                wage: edit.wage,
            });
        }
    }, [edit]);
    const handleRemove = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const res = await deleteStaffOfProject(remove, projectId);
        if (!(res instanceof Error)) {
            const tmpRows = [...rows];
            const index = tmpRows.findIndex((row) => row.id === remove);
            await tmpRows.splice(index, 1);
            setRows(tmpRows);
            setRemove(null);
            toast.success("نیروی انسانی با موفقیت حذف شد");
        } else {
            toast.error("حذف نیروی انسانی با خطا مواجه شد");
        }
    };

    const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const res = await verifyCurrentStaff(verify, projectId);
        if (!(res instanceof Error)) {
            const tmpRows = [...rows];
            const index = tmpRows.findIndex((row) => row.id === verify);
            tmpRows[index].verify = 1;
            setRows(tmpRows);
            setVerify(null);
            await refresh();
            toast.success("نیروی انسانی با موفقیت تایید شد");
        } else {
            toast.error("تایید نیروی انسانی با خطا مواجه شد");
        }
    };

    const handleVerifyAll = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const res = await verifyAllStaffs(projectId, date);
        if (!(res instanceof Error)) {
            const tmpRows = [...rows];
            for (let i = 0; i < tmpRows.length; i++) {
                tmpRows[i].verify = 1;
            }
            setRows(tmpRows);
            setVerifyAll(false);
            await refresh();
            toast.success("تمام نیروی انسانی ها تایید شدند");
        } else {
            toast.error("تایید نیروی انسانی ها با خطا مواجه شد");
        }
    };

    const handleReject = async (event) => {
        event.preventDefault();
        const res = await rejectDailyReports(reject, rejectApiTypes.Staff, projectId);
        if (!(res instanceof Error)) {
            setRows(rows.filter(row => row.id !== reject));
            setReject(null);
            toast.success("گزارش رد و به سطح قبلی ارجاع داده شد")
        } else {
            toast.error("خطا در رَد گزارش")
        }
    }

    const refresh = async () => {
        const res = await getDailyStaffsByProjectId(projectId, date);
        const resStaffs = await getStaffsOfProject(projectId);
        const resLocations = await getServingLocationsByProjectId(projectId);

        if (!(res instanceof Error)) {
            setRows(res);
            setFilteredRow(res);
            // @ts-ignore
            setCount(res?.length);
        }

        if (!(resStaffs instanceof Error)) {
            setStaffs(resStaffs);
        }

        if (!(resLocations instanceof Error)) {
            setServingLocations(resLocations);
        }
    };

    const getAllNeedData = async () => {
        const res = await getDailyStaffsByProjectId(projectId, date);
        const resStaffs = await getStaffsOfProject(projectId);
        const resLocations = await getServingLocationsByProjectId(projectId);

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

        if (!(resStaffs instanceof Error)) {
            setStaffs(resStaffs);
        }

        if (!(resLocations instanceof Error)) {
            setServingLocations(resLocations);
        }

        // await Promise.all([res, resStaffs, resLocations])
        //    .then((R: any) => {
        //       setRows(R[0]);
        //       setFilteredRow(R[0]);
        //       setCount(R[0]?.length);
        //setStaffs(R[1]);
        // setServingLocations(resLocations);
        //    })
        //    .catch((err) => toast.error("دریافت داده با خطا مواجه شد"));
    };

    const search = (key: string) => {
        if (key) {
            const filtered = rows.filter((row: any) => row.staffName.includes(key));
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

    const lowerCasedStaffs = staffs?.map((item: any) => item.staffName.toLowerCase());
    const [suggestionsStaffs, setSuggestionsStaffs] = useState<string[]>([]);
    const [selectSuggestionsStaffs, setSelectSuggestionsStaffs] = useState<any>("");

    function getSuggestionsStaffs(value: string): string[] {
        return lowerCasedStaffs?.filter((item: any) => item.startsWith(value.trim().toLowerCase()));
    }

    const lowerCasedServingLocations = servingLocations?.map((item: any) => item.name.toLowerCase());
    const [suggestionsServingLocations, setSuggestionsServingLocations] = useState<string[]>([]);
    const [selectSuggestionsServingLocations, setSelectSuggestionsServingLocations] = useState<any>("");

    function getSuggestionsServingLocations(value: string): string[] {
        return lowerCasedServingLocations?.filter((item: any) => item.startsWith(value.trim().toLowerCase()));
    }

    useEffect(() => {
        if (addFormik.values.presentationStatus === 2) {
            addFormik.setFieldValue("enterTime", "");
            addFormik.setFieldValue("exitTime", "");
        }
    }, [addFormik.values.presentationStatus]);

    return (
        <Grid container sx={{position: "relative"}}>
            <Grid item xs={12} style={{width: 10}}>
                <Paper>
                    <Box mb={3} pt={3} mx={3}>
                        <Grid container >
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
                            titleAdd={"درج نیروی انسانی"}
                            onClickAdd={() => setAdd(true)}
                            numberOfSelectedCopy = {checkedIdList?.length}
                        />
                    </Grid>
                    {showCheckboxColumn ?  <Grid item sx={{ml:"auto"}}>
                        <FormControlLabel
                            label="انتخاب همه"
                            labelPlacement={"start"}
                            control={
                                <Checkbox
                                    checked={checkedAllSelect}
                                    onChange={handleChangeAllSelected}
                                    inputProps={{ 'aria-label': 'controlled' }}
                                />
                            }
                        />
                    </Grid> : null}
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
                            } else if (head === "presentationStatus") {
                                return (
                                    <TableCellStyled active={row.verify === userType} key={column.id} align={column.align}>
                                        <Button
                                            variant={"text"}
                                            color={value === 1 ? "success" : value === 2 ? "error" : value === 3 ? "info" : "warning"}>
                                            {presentationStatus[value]}
                                        </Button>
                                    </TableCellStyled>
                                );
                            } else if (head === "action") {
                                if(showCheckboxColumn) {
                                    return (
                                        <TableCellStyled  active={row.verify === userType}   key={column.id} align={column.align}>
                                            <Checkbox
                                                checked={checkedIdList.find((item:any) => item === row?.id) ? true : false}
                                                onChange={(event:any) => handleChangeRowChecked(event , row)}
                                                inputProps={{ 'aria-label': 'controlled' }}
                                            />
                                        </TableCellStyled>
                                    );
                                }else {
                                    return (
                                        <TableCellStyled active={row.verify === userType} key={column.id} align={column.align}>
                                            <MenuActionTable menuId={row.id} items={itemsOfAction(row.verify)} icon={<Settings/>}
                                                             user={row}/>
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
                    title={"درج نیروی انسانی"}
                    onClose={() => {
                        setAdd(null);
                        addFormik.handleReset(1);
                    }}>
                    <form noValidate onSubmit={addFormik.handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                {/* <Autocomplete
                    options={staffs}
                    onChange={(e, value) =>
                        addFormik.setFieldValue('staffNameId', value ? value.staffNameId : '')}
                    getOptionLabel={(staff: any) => staff.staffName}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            error={addFormik.touched.staffNameId && Boolean(addFormik.errors.staffNameId)}
                            helperText={addFormik.touched.staffNameId && addFormik.errors.staffNameId}
                            required
                            fullWidth
                            label="نام"
                            variant="outlined"/>)}
                /> */}
                                <Autosuggest
                                    name={"staffNameId"}
                                    id={"staffNameId"}
                                    error={addFormik.touched.staffNameId && Boolean(addFormik.errors.staffNameId)}
                                    helperText={addFormik.touched.staffNameId && addFormik.errors.staffNameId}
                                    suggestions={suggestionsStaffs ?? []}
                                    onSuggestionsClearRequested={() => setSuggestionsStaffs([])}
                                    onSuggestionsFetchRequested={({value}: any) => {
                                        addFormik.setFieldValue("staffNameId", value);
                                        setSuggestionsStaffs(getSuggestionsStaffs(value));
                                    }}
                                    onSuggestionSelected={(_: any, {suggestionValue}: any) => {
                                        setSelectSuggestionsStaffs(suggestionValue);
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
                                            ? addFormik.touched.staffNameId && Boolean(addFormik.errors.staffNameId)
                                                ? "react-autosuggest__input__empty--dark"
                                                : "react-autosuggest__input--dark"
                                            : addFormik.touched.staffNameId && Boolean(addFormik.errors.staffNameId)
                                                ? "react-autosuggest__input__empty"
                                                : "react-autosuggest__input",
                                    }}
                                    inputProps={{
                                        placeholder: "نام*",
                                        value: addFormik.values.staffNameId,
                                        onChange: (_: any, {newValue, method}: any) => {
                                            addFormik.setFieldValue("staffNameId", newValue);
                                        },
                                    }}
                                    highlightFirstSuggestion={true}
                                />
                                <Box component="span" sx={{color: errColor, fontSize: "0.85rem"}}>
                                    {addFormik.touched.staffNameId && addFormik.errors.staffNameId}
                                    {addFormik.touched.staffNameId && Boolean(addFormik.errors.staffNameId)}
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    select
                                    id={"presentationStatus"}
                                    value={addFormik.values.presentationStatus}
                                    onChange={(e) => addFormik.setFieldValue("presentationStatus", e.target.value)}
                                    error={addFormik.touched.presentationStatus && Boolean(addFormik.errors.presentationStatus)}
                                    helperText={addFormik.touched.presentationStatus && addFormik.errors.presentationStatus}
                                    label="وضعیت حضور"
                                    fullWidth>
                                    {Object.keys(presentationStatus).map((type) => (
                                        // @ts-ignore
                                        <MenuItem key={type} value={+type}>
                                            {presentationStatus[+type]}
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
                                        disabled={addFormik.values.presentationStatus === 2}
                                        ampm={false}
                                        value={moment(addFormik.values.enterTime).toDate()}
                                        onChange={(date) => addFormik.setFieldValue("enterTime", moment(date).locale("en").format("YYYY-MM-DDTHH:mm"))}
                                        label="ساعت ورود"
                                    />
                                </LocalizationProvider>
                                {addFormik.touched.enterTime && Boolean(addFormik.errors.enterTime) ?
                                    <Typography variant={"caption"} sx={{color: "#d32f2f"}}>
                                        {addFormik.touched.enterTime && addFormik.errors.enterTime}
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
                                        disabled={addFormik.values.presentationStatus === 2}
                                        ampm={false}
                                        value={moment(addFormik.values.exitTime).toDate()}
                                        onChange={(date) => addFormik.setFieldValue("exitTime", moment(date).locale("en").format("YYYY-MM-DDTHH:mm"))}
                                        label="ساعت خروج"
                                    />
                                </LocalizationProvider>
                                {addFormik.touched.exitTime && Boolean(addFormik.errors.exitTime) ?
                                    <Typography variant={"caption"} sx={{color: "#d32f2f"}}>
                                        {addFormik.touched.exitTime && addFormik.errors.exitTime}
                                    </Typography> : null}
                            </Grid>
                            <Grid item xs={12}>
                                {/* <Autocomplete
                    options={servingLocations}
                    onChange={(e, value) =>
                        addFormik.setFieldValue('servingLocationId', value ? value.id : '')}
                    getOptionLabel={(location: any) => location.name}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            error={addFormik.touched.servingLocationId && Boolean(addFormik.errors.servingLocationId)}
                            helperText={addFormik.touched.servingLocationId && addFormik.errors.servingLocationId}
                            required
                            fullWidth
                            label="محل خدمت"
                            variant="outlined"/>)}
                /> */}
                                <Autosuggest
                                    name={"servingLocationId"}
                                    id={"servingLocationId"}
                                    error={addFormik.touched.servingLocationId && Boolean(addFormik.errors.servingLocationId)}
                                    helperText={addFormik.touched.servingLocationId && addFormik.errors.servingLocationId}
                                    suggestions={suggestionsServingLocations ?? []}
                                    onSuggestionsClearRequested={() => setSuggestionsServingLocations([])}
                                    onSuggestionsFetchRequested={({value}: any) => {
                                        addFormik.setFieldValue("servingLocationId", value);
                                        setSuggestionsServingLocations(getSuggestionsServingLocations(value));
                                    }}
                                    onSuggestionSelected={(_: any, {suggestionValue}: any) => {
                                        setSelectSuggestionsServingLocations(suggestionValue);
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
                                            ? addFormik.touched.servingLocationId && Boolean(addFormik.errors.servingLocationId)
                                                ? "react-autosuggest__input__empty--dark"
                                                : "react-autosuggest__input--dark"
                                            : addFormik.touched.servingLocationId && Boolean(addFormik.errors.servingLocationId)
                                                ? "react-autosuggest__input__empty"
                                                : "react-autosuggest__input",
                                    }}
                                    inputProps={{
                                        placeholder: "محل خدمت*",
                                        value: addFormik.values.servingLocationId,
                                        onChange: (_: any, {newValue, method}: any) => {
                                            addFormik.setFieldValue("servingLocationId", newValue);
                                        },
                                    }}
                                    highlightFirstSuggestion={true}
                                />
                                <Box component="span" sx={{color: errColor, fontSize: "0.85rem"}}>
                                    {addFormik.touched.servingLocationId && addFormik.errors.servingLocationId}
                                    {addFormik.touched.servingLocationId && Boolean(addFormik.errors.servingLocationId)}
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    name={"wage"}
                                    onChange={addFormik.handleChange}
                                    value={addFormik.values.wage}
                                    error={addFormik.touched.wage && Boolean(addFormik.errors.wage)}
                                    helperText={addFormik.touched.wage && addFormik.errors.wage}
                                    fullWidth
                                    type={"number"}
                                    label="دستمزد (تومان)"
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    name={"description"}
                                    onChange={addFormik.handleChange}
                                    value={addFormik.values.description}
                                    error={addFormik.touched.description && Boolean(addFormik.errors.description)}
                                    helperText={addFormik.touched.description && addFormik.errors.description}
                                    fullWidth
                                    label="توضیحات"
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    name={"activityCode"}
                                    onChange={addFormik.handleChange}
                                    value={addFormik.values.activityCode}
                                    error={addFormik.touched.activityCode && Boolean(addFormik.errors.activityCode)}
                                    helperText={addFormik.touched.activityCode && addFormik.errors.activityCode}
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
                    title={edit.staffName}
                    onClose={() => {
                        setEdit(null);
                        editFormik.handleReset(1);
                    }}>
                    <form noValidate onSubmit={editFormik.handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Autosuggest
                                    name={"staffNameId"}
                                    id={"staffNameId"}
                                    error={editFormik.touched.staffNameId && Boolean(editFormik.errors.staffNameId)}
                                    helperText={editFormik.touched.staffNameId && editFormik.errors.staffNameId}
                                    suggestions={suggestionsStaffs ?? []}
                                    onSuggestionsClearRequested={() => setSuggestionsStaffs([])}
                                    onSuggestionsFetchRequested={({value}: any) => {
                                        editFormik.setFieldValue("staffNameId", value);
                                        setSuggestionsStaffs(getSuggestionsStaffs(value));
                                    }}
                                    onSuggestionSelected={(_: any, {suggestionValue}: any) => {
                                        setSelectSuggestionsStaffs(suggestionValue);
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
                                            ? editFormik.touched.staffNameId && Boolean(editFormik.errors.staffNameId)
                                                ? "react-autosuggest__input__empty--dark"
                                                : "react-autosuggest__input--dark"
                                            : editFormik.touched.staffNameId && Boolean(editFormik.errors.staffNameId)
                                                ? "react-autosuggest__input__empty"
                                                : "react-autosuggest__input",
                                    }}
                                    inputProps={{
                                        placeholder: "نام*",
                                        value: editFormik.values.staffNameId,
                                        onChange: (_: any, {newValue, method}: any) => {
                                            editFormik.setFieldValue("staffNameId", newValue);
                                        },
                                    }}
                                    highlightFirstSuggestion={true}
                                />
                                <Box component="span" sx={{color: errColor, fontSize: "0.85rem"}}>
                                    {editFormik.touched.staffNameId && editFormik.errors.staffNameId}
                                    {editFormik.touched.staffNameId && Boolean(editFormik.errors.staffNameId)}
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth variant={"outlined"}>
                                    <InputLabel htmlFor={"status"}>وضعیت حضور</InputLabel>
                                    <Select
                                        labelId={"status"}
                                        id={"presentationStatus"}
                                        value={editFormik.values.presentationStatus}
                                        onChange={(e) => editFormik.setFieldValue("presentationStatus", e.target.value)}
                                        error={editFormik.touched.presentationStatus && Boolean(editFormik.errors.presentationStatus)}
                                        // helperText={editFormik.touched.completeStatus && editFormik.errors.completeStatus}
                                        label="وضعیت حضور">
                                        {Object.keys(presentationStatus).map((type) => (
                                            // @ts-ignore
                                            <MenuItem key={type} value={+type}>
                                                {presentationStatus[+type]}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item sm={6} xs={12}>
                                <LocalizationProvider dateAdapter={AdapterDateFnsJalali}>
                                    <TimePicker
                                        viewRenderers={{
                                            hours: renderTimeViewClock,
                                            minutes: renderTimeViewClock,
                                            seconds: renderTimeViewClock,
                                        }}
                                        disabled={editFormik.values.presentationStatus === 2}
                                        sx={{width: "100%"}}
                                        ampm={false}
                                        value={moment(editFormik.values.enterTime).toDate()}
                                        onChange={(date) => editFormik.setFieldValue("enterTime", moment(date).locale("en").format("YYYY-MM-DDTHH:mm"))}
                                        label="ساعت ورود"
                                    />
                                </LocalizationProvider>
                                {editFormik.touched.enterTime && Boolean(editFormik.errors.enterTime) ? <Typography variant={"caption"} sx={{color:"#d32f2f"}}>
                                    { editFormik.touched.enterTime && editFormik.errors.enterTime}
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
                                        disabled={editFormik.values.presentationStatus === 2}
                                        sx={{width: "100%"}}
                                        ampm={false}
                                        value={moment(editFormik.values.exitTime).toDate()}
                                        onChange={(date) => editFormik.setFieldValue("exitTime",moment(date).locale("en").format("YYYY-MM-DDTHH:mm"))}
                                        label="ساعت خروج"
                                    />
                                </LocalizationProvider>
                                {editFormik.touched.exitTime && Boolean(editFormik.errors.exitTime) ? <Typography variant={"caption"} sx={{color:"#d32f2f"}}>
                                    { editFormik.touched.exitTime && editFormik.errors.exitTime}
                                </Typography> : null}
                            </Grid>
                            <Grid item xs={12}>
                                <Autosuggest
                                    name={"servingLocationId"}
                                    id={"servingLocationId"}
                                    error={editFormik.touched.servingLocationId && Boolean(editFormik.errors.servingLocationId)}
                                    helperText={editFormik.touched.servingLocationId && editFormik.errors.servingLocationId}
                                    suggestions={suggestionsServingLocations ?? []}
                                    onSuggestionsClearRequested={() => setSuggestionsServingLocations([])}
                                    onSuggestionsFetchRequested={({value}: any) => {
                                        editFormik.setFieldValue("servingLocationId", value);
                                        setSuggestionsServingLocations(getSuggestionsServingLocations(value));
                                    }}
                                    onSuggestionSelected={(_: any, {suggestionValue}: any) => {
                                        setSelectSuggestionsServingLocations(suggestionValue);
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
                                            ? editFormik.touched.servingLocationId && Boolean(editFormik.errors.servingLocationId)
                                                ? "react-autosuggest__input__empty--dark"
                                                : "react-autosuggest__input--dark"
                                            : editFormik.touched.servingLocationId && Boolean(editFormik.errors.servingLocationId)
                                                ? "react-autosuggest__input__empty"
                                                : "react-autosuggest__input",
                                    }}
                                    inputProps={{
                                        placeholder: "محل خدمت*",
                                        value: editFormik.values.servingLocationId,
                                        onChange: (_: any, {newValue, method}: any) => {
                                            editFormik.setFieldValue("servingLocationId", newValue);
                                        },
                                    }}
                                    highlightFirstSuggestion={true}
                                />
                                <Box component="span" sx={{color: errColor, fontSize: "0.85rem"}}>
                                    {editFormik.touched.servingLocationId && editFormik.errors.servingLocationId}
                                    {editFormik.touched.servingLocationId && Boolean(editFormik.errors.servingLocationId)}
                                </Box>
                                {/* <Autocomplete
                           options={servingLocations}
                           defaultValue={servingLocations.find((L: any) => L.id === edit.servingLocationId)}
                           onChange={(e, value) => editFormik.setFieldValue("servingLocationId", value ? value.id : "")}
                           getOptionLabel={(location: any) => location.name}
                           renderInput={(params) => (
                              <TextField
                                 {...params}
                                 error={editFormik.touched.servingLocationId && Boolean(editFormik.errors.servingLocationId)}
                                 helperText={editFormik.touched.servingLocationId && editFormik.errors.servingLocationId}
                                 required
                                 fullWidth
                                 label="محل خدمت"
                                 variant="outlined"
                              />
                           )}
                        /> */}
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    name={"wage"}
                                    onChange={editFormik.handleChange}
                                    value={editFormik.values.wage}
                                    error={editFormik.touched.wage && Boolean(editFormik.errors.wage)}
                                    helperText={editFormik.touched.wage && editFormik.errors.wage}
                                    fullWidth
                                    type={"number"}
                                    label="دستمزد (تومان)"
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    name={"description"}
                                    onChange={editFormik.handleChange}
                                    value={editFormik.values.description}
                                    error={editFormik.touched.description && Boolean(editFormik.errors.description)}
                                    helperText={editFormik.touched.description && editFormik.errors.description}
                                    fullWidth
                                    label="توضیحات"
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    name={"activityCode"}
                                    onChange={editFormik.handleChange}
                                    value={editFormik.values.activityCode}
                                    error={editFormik.touched.activityCode && Boolean(editFormik.errors.activityCode)}
                                    helperText={editFormik.touched.activityCode && editFormik.errors.activityCode}
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
                <ModalIpa open={Boolean(remove)} title={`آیا از حذف نیروی انسانی مطمئن هستید؟`}
                          onClose={() => setRemove(null)}>
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
                <ModalIpa open={Boolean(verify)} title={`آیا از تایید نیروی انسانی مطمئن هستید؟`}
                          onClose={() => setVerify(null)}>
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
                    title={`آیا از تایید تمام نیروی انسانی ها مطمئن هستید؟`}
                    onClose={() => setVerifyAll(false)}>
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
            {showModalDateCopyRow ?
                <ModalIpa
                    title={'کپی گزارش'}
                    open={!!showModalDateCopyRow}
                    onClose={()=> handleCloseModalDateCopyRow()}
                >
                    <form noValidate onSubmit={copyRowFormik.handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item md={6} xs={12}>
                                <LocalizationProvider dateAdapter={AdapterDateFnsJalali}>
                                    <DatePicker
                                        disabled
                                        label={'از تاریخ'}
                                        value={moment(copyRowFormik.values.fromDate).toDate()}
                                        onChange={(newValue: any) => copyRowFormik.setFieldValue('fromDate', moment(newValue).locale("en").format("YYYY-MM-DD"))}
                                        sx={{width: "100%"}}
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
                                        label={'به تاریخ'}
                                        value={moment(copyRowFormik.values.toDate).toDate()}
                                        onChange={(newValue: any) => copyRowFormik.setFieldValue('toDate', moment(newValue).locale("en").format("YYYY-MM-DD"))}
                                        sx={{width: "100%"}}
                                    />
                                </LocalizationProvider>
                                <Box component="span" sx={{color: red[600], fontSize: "0.85rem"}}>
                                    {copyRowFormik.touched.toDate && copyRowFormik.errors.toDate}
                                    {copyRowFormik.touched.toDate && Boolean(copyRowFormik.errors.toDate)}
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <ButtonsModal textSubmit={'تایید'} textClose={'انصراف'} onClose={() => handleCloseModalDateCopyRow()}/>
                            </Grid>
                        </Grid>
                    </form>
                </ModalIpa> : null}
        </Grid>
    );
}

export {StaffsReportDailyPage};
