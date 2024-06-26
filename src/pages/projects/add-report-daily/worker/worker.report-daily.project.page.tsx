import React, {useEffect, useState} from "react";
import {Alert, Box, Grid, Paper, TextField, Typography, useTheme} from "@mui/material";
import {Delete, Edit, ThumbDown, Settings, ThumbUp} from "@mui/icons-material";
import {
    deleteWorkerOfProject,
    getDailyWorkersByProjectId,
    getWorkersOfProject,
    postWorkerAtProject,
    putWorkerAtProject,
    verifyAllWorkers,
    verifyCurrentWorker,
    postDailyWorkerName,
    postCopyRecords,
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
import {red} from "@mui/material/colors";
import Autosuggest from "react-autosuggest";
import {useDispatch, useSelector} from "react-redux";
import {AdapterDateFnsJalali} from "@mui/x-date-pickers/AdapterDateFnsJalali";
import Checkbox from "@mui/material/Checkbox";
import {
    handleSetVerifiedBadge,
    handleShowCopyRowInItem,
    handleShowModalDateCopyRow
} from "../../../../redux/actions/actions";
import {currentPageNumber} from "../../../../utils/currentPage-number";
import FormControlLabel from '@mui/material/FormControlLabel';
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
        id: "dailyWorkerName",
        label: "نام",
        align: "left",
        minWidth: 120,
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

function WorkersReportDailyPage({date}: any) {
    const [rows, setRows] = useState<any>(null);
    const [filteredRow, setFilteredRow] = useState<any>([]);
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState<any>(10);
    const [add, setAdd] = useState<any>(null);
    const [edit, setEdit] = useState<any>(null);
    const [keySearch, setKeySearch] = useState<any>("");
    const [remove, setRemove] = useState<any>(null);
    const [workers, setWorkers] = useState<any>([]);
    const [verify, setVerify] = useState<any>(null);
    const [verifyAll, setVerifyAll] = useState(false);
    const [reject, setReject] = useState<any>(null);
    const [checkedIdList, setCheckedIdList] = useState([]);
    const [checkedAllSelect, setCheckAllSelected] = useState(false);

    //@ts-ignore
    const darkMode = useSelector((state: any) => state?.dark);
    const {userType} = useSelector((state: any) => state.userAccess);
    const showCheckboxColumn = useSelector((state:any) => state.showCopyRowInItem);
    const showModalDateCopyRow = useSelector((state:any) => state.showModalDateCopyRow)
    const currentPage = useSelector((state:any) => state.currentPage)
    const startDate = useSelector((state:any) => state.startDate)

    const {projectId} = useParams();
    const errColor = red[600];
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
        if (!showCheckboxColumn) {
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
            toDate: ""
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



    const addValidation = Yup.object({
        DailyWorkerNameId: Yup.string().required("نباید خالی باشد"),
        EnterTime: Yup.date()
            .required("نباید خالی باشد")
            .typeError("نامعتبر می باشد"),
        ExitTime: Yup.date()
            .required("نباید خالی باشد")
            .typeError("نامعتبر می باشد")
            .test(
                "ساعت خروج باید از ورود بزرگتر باشد",
                "ساعت خروج باید از ورود بزرگتر باشد",
                function (value: object) {
                    return moment(value, "HH:mm").diff(moment(this.parent.EnterTime, "HH:mm"), "minute") > 0;
            }),
        Wage: Yup.number().test("باید عدد بزرگتر از صفر باشد", "باید عدد بزرگتر از صفر باشد", function (value) {
            return +value >= 0;
        }),
    });
    const editValidation = Yup.object({
        DailyWorkerNameId: Yup.string().required("نباید خالی باشد"),
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
    });

    const addFormik = useFormik({
        initialValues: {
            ActivityCode: "",
            ActivityType: "",
            DailyWorkerNameId: "",
            Description: "",
            EnterTime: "",
            ExitTime: "",
            LastUserLevel: 1,
            ProjectId: projectId,
            ReportDate: date,
            ServingLocation: "",
            Wage: 0,
        },
        validationSchema: addValidation,
        onSubmit: async (values, {resetForm}) => {
            values.ReportDate = date;
            if (values.DailyWorkerNameId !== selectSuggestionsDailyWorker) {
                const dailyWo: any = await postDailyWorkerName({
                    Name: values.DailyWorkerNameId,
                    ProjectId: values.ProjectId,
                });
                const res = await postWorkerAtProject({...values, DailyWorkerNameId: dailyWo?.id});
                if (!(res instanceof Error)) {
                    setAdd(null);
                    toast.success("اطلاعات روزمزد با موفقیت درج شد");
                    await refresh();
                    // search(keySearch)
                    resetForm();
                } else {
                    toast.error("درج اطلاعات روزمزد با خطا مواجه شد");
                }
            } else {
                const dailyWor = workers.find((item: any) => item.dailyWorkerName === values.DailyWorkerNameId);
                const res = await postWorkerAtProject({...values, DailyWorkerNameId: dailyWor.dailyWorkerNameId});
                if (!(res instanceof Error)) {
                    setAdd(null);
                    toast.success("اطلاعات روزمزد با موفقیت درج شد");
                    await refresh();
                    // search(keySearch)
                    resetForm();
                } else {
                    toast.error("درج اطلاعات روزمزد با خطا مواجه شد");
                }
            }
        },
    });
    const editFormik = useFormik({
        initialValues: {
            ActivityCode: "",
            ActivityType: "",
            DailyWorkerNameId: "",
            Description: "",
            EnterTime: "",
            ExitTime: "",
            LastUserLevel: 1,
            ProjectId: projectId,
            ReportDate: date,
            ServingLocation: "",
            Wage: 0,
        },
        validationSchema: editValidation,
        onSubmit: async (values, {resetForm}) => {
                if (values.DailyWorkerNameId !== selectSuggestionsDailyWorker) {
                    const dailyWo: any = await postDailyWorkerName({
                        Name: values.DailyWorkerNameId,
                        ProjectId: values.ProjectId,
                    });
                    const res = await putWorkerAtProject({
                        ...values,
                        Id: edit.id,
                        DailyWorkerNameId: dailyWo?.id
                    }, edit.id);
                    if (!(res instanceof Error)) {
                        setEdit(null);
                        toast.success("اطلاعات روزمزد با موفقیت ویرایش شد");
                        await refresh();
                        // search(keySearch)
                        resetForm();
                    } else {
                        toast.error("ویرایش اطلاعات روزمزد با خطا مواجه شد");
                    }
                } else {
                    const dailyWor = workers.find((item: any) => item.dailyWorkerName === values.DailyWorkerNameId);
                    const res = await putWorkerAtProject({
                        ...values,
                        Id: edit.id,
                        DailyWorkerNameId: dailyWor.dailyWorkerNameId
                    }, edit.id);
                    if (!(res instanceof Error)) {
                        setEdit(null);
                        toast.success("اطلاعات روزمزد با ویرایش درج شد");
                        await refresh();
                        // search(keySearch)
                        resetForm();
                    } else {
                        toast.error("ویرایش اطلاعات روزمزد با خطا مواجه شد");
                    }
                }
        },
        // onSubmit: async (values, {resetForm}) => {
        //   const res = await putWorkerAtProject({...values, Id: edit.id}, edit.id)
        //   if (!(res instanceof Error)) {
        //     setEdit(null)
        //     await refresh();
        //     toast.success('اطلاعات روزمزد با موفقیت ویرایش یافت')
        //     resetForm()
        //   } else {
        //     toast.error('ویرایش اطلاعات روزمزد با خطا مواجه شد')
        //   }
        // }
    });

    useEffect(() => {
        if (edit) {
            editFormik.setValues({
                ActivityCode: edit.activityCode,
                ActivityType: edit.activityType,
                DailyWorkerNameId: edit.dailyWorkerName,
                Description: edit.description,
                EnterTime: edit.enterTime,
                ExitTime: edit.exitTime,
                LastUserLevel: edit.lastUserLevel,
                ProjectId: projectId,
                ReportDate: date,
                ServingLocation: edit.servingLocation,
                Wage: edit.wage,
            });
        }
    }, [edit]);
    const handleRemove = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const res = await deleteWorkerOfProject(remove, projectId);
        if (!(res instanceof Error)) {
            const tmpRows = [...rows];
            const index = tmpRows.findIndex((row) => row.id === remove);
            await tmpRows.splice(index, 1);
            setRows(tmpRows);
            setRemove(null);
            toast.success("اطلاعات روزمزد با موفقیت حذف شد");
        } else {
            toast.error("حذف اطلاعات روزمزد با خطا مواجه شد");
        }
    };

    const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const res = await verifyCurrentWorker(verify, projectId);
        if (!(res instanceof Error)) {
            const tmpRows = [...rows];
            const index = tmpRows.findIndex((row) => row.id === verify);
            tmpRows[index].verify = 1;
            setRows(tmpRows);
            setVerify(null);
            await refresh();
            toast.success("اطلاعات روزمزد با موفقیت تایید شد");
        } else {
            toast.error("تایید اطلاعات روزمزد با خطا مواجه شد");
        }
    };

    const handleVerifyAll = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const res = await verifyAllWorkers(projectId, date);
        if (!(res instanceof Error)) {
            const tmpRows = [...rows];
            for (let i = 0; i < tmpRows.length; i++) {
                tmpRows[i].verify = 1;
            }
            setRows(tmpRows);
            setVerifyAll(false);
            await refresh();
            toast.success("تمام اطلاعات روزمزد ها تایید شدند");
        } else {
            toast.error("تایید اطلاعات روزمزد ها با خطا مواجه شد");
        }
    };

    const handleReject = async (event) => {
        event.preventDefault();
        const res = await rejectDailyReports(reject, rejectApiTypes.DailyWorker, projectId);
        if (!(res instanceof Error)) {
            setRows(rows.filter(row => row.id !== reject));
            setReject(null);
            toast.success("گزارش رد و به سطح قبلی ارجاع داده شد")
        } else {
            toast.error("خطا در رَد گزارش")
        }
    }

    const refresh = async () => {
        const res = await getDailyWorkersByProjectId(projectId, date);
        const resWorkers = await getWorkersOfProject(projectId);

        if (!(res instanceof Error)) {
            setRows(res);
            setFilteredRow(res);
            // @ts-ignore
            setCount(res.length);
        }

        if (!(resWorkers instanceof Error)) {
            setWorkers(resWorkers);
        }
    };

    const getAllNeedData = async () => {
        const res = await getDailyWorkersByProjectId(projectId, date);
        const resWorkers = await getWorkersOfProject(projectId);

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

        if (!(resWorkers instanceof Error)) {
            setWorkers(resWorkers);
        }
    };

    const search = (key: string) => {
        if (key) {
            const filtered = rows.filter((row: any) => row.dailyWorkerName.includes(key));
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
                    <Edit />&nbsp;  ویرایش
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

    const lowerCasedِDailyWorker = workers?.map((item: any) => item.dailyWorkerName.toLowerCase());
    const [suggestionsDailyWorker, setSuggestionsDailyWorker] = useState<string[]>([]);
    const [selectSuggestionsDailyWorker, setSelectSuggestionsDailyWorker] = useState<any>("");

    function getSuggestionsDailyWorker(value: string): string[] {
        return lowerCasedِDailyWorker?.filter((item: any) => item.startsWith(value.trim().toLowerCase()));
    }

    //  console.log(moment(addFormik.values.ExitTime,'HH:mm').diff(moment(addFormik.values.EnterTime, 'HH:mm'), 'minute'))
    //  console.log(moment(addFormik.values.ExitTime,'HH:mm'))
    //  console.log(typeof addFormik.values.EnterTime)
    //  console.log(moment(addFormik.values.ExitTime , "HH:mm").format("HH:mm:ss") > moment(addFormik.values.EnterTime , "HH:mm").format("HH:mm:ss"))
    //  moment('1392/6/3 16:40', 'jYYYY/jM/jD HH:mm').format('YYYY-M-D HH:mm:ss')
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
                                    titleAdd={"درج اطلاعات روزمزد"}
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
                    title={"درج اطلاعات روزمزد"}
                    onClose={() => {
                        setAdd(null);
                        addFormik.handleReset(1);
                    }}>
                    <form noValidate onSubmit={addFormik.handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Autosuggest
                                    name={"ActivityTypeId"}
                                    id={"ActivityTypeId"}
                                    error={addFormik.touched.DailyWorkerNameId && Boolean(addFormik.errors.DailyWorkerNameId)}
                                    helperText={addFormik.touched.DailyWorkerNameId && addFormik.errors.DailyWorkerNameId}
                                    suggestions={suggestionsDailyWorker ?? []}
                                    onSuggestionsClearRequested={() => setSuggestionsDailyWorker([])}
                                    onSuggestionsFetchRequested={({value}: any) => {
                                        addFormik.setFieldValue("DailyWorkerNameId", value);
                                        setSuggestionsDailyWorker(getSuggestionsDailyWorker(value));
                                    }}
                                    onSuggestionSelected={(_: any, {suggestionValue}: any) => {
                                        setSelectSuggestionsDailyWorker(suggestionValue);
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
                                            ? addFormik.touched.DailyWorkerNameId && Boolean(addFormik.errors.DailyWorkerNameId)
                                                ? "react-autosuggest__input__empty--dark"
                                                : "react-autosuggest__input--dark"
                                            : addFormik.touched.DailyWorkerNameId && Boolean(addFormik.errors.DailyWorkerNameId)
                                                ? "react-autosuggest__input__empty"
                                                : "react-autosuggest__input",
                                    }}
                                    inputProps={{
                                        placeholder: "نیروی انسانی*",
                                        value: addFormik.values.DailyWorkerNameId,
                                        onChange: (_: any, {newValue, method}: any) => {
                                            addFormik.setFieldValue("DailyWorkerNameId", newValue);
                                        },
                                    }}
                                    highlightFirstSuggestion={true}
                                />
                                <Box component="span" sx={{color: errColor, fontSize: "0.85rem"}}>
                                    {addFormik.touched.DailyWorkerNameId && addFormik.errors.DailyWorkerNameId}
                                    {addFormik.touched.DailyWorkerNameId && Boolean(addFormik.errors.DailyWorkerNameId)}
                                </Box>
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
                                {addFormik.touched.EnterTime && Boolean(addFormik.errors.EnterTime) ? <Typography  variant={"caption"} sx={{color:"#d32f2f"}}>
                                    { addFormik.touched.EnterTime && addFormik.errors.EnterTime}
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
                                            value={moment(addFormik.values.ExitTime).toDate()}
                                            onChange={(date) => addFormik.setFieldValue("ExitTime", moment(date).locale("en").format("YYYY-MM-DDTHH:mm"))}
                                            label="ساعت خروج"
                                        />
                                </LocalizationProvider>
                                {addFormik.touched.ExitTime && Boolean(addFormik.errors.ExitTime) ? <Typography variant={"caption"} sx={{color:"#d32f2f"}}>
                                    { addFormik.touched.ExitTime && addFormik.errors.ExitTime}
                                </Typography> : null}
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    name={"ActivityType"}
                                    onChange={addFormik.handleChange}
                                    value={addFormik.values.ActivityType}
                                    error={addFormik.touched.ActivityType && Boolean(addFormik.errors.ActivityType)}
                                    helperText={addFormik.touched.ActivityType && addFormik.errors.ActivityType}
                                    fullWidth
                                    label="نوع فعالیت"
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    name={"ServingLocation"}
                                    onChange={addFormik.handleChange}
                                    value={addFormik.values.ServingLocation}
                                    error={addFormik.touched.ServingLocation && Boolean(addFormik.errors.ServingLocation)}
                                    helperText={addFormik.touched.ServingLocation && addFormik.errors.ServingLocation}
                                    fullWidth
                                    label="محل انجام فعالیت"
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
                    title={edit.dailyWorkerName}
                    onClose={() => {
                        setEdit(null);
                        editFormik.handleReset(1);
                    }}>
                    <form noValidate onSubmit={editFormik.handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Autosuggest
                                    name={"ActivityTypeId"}
                                    id={"ActivityTypeId"}
                                    error={editFormik.touched.DailyWorkerNameId && Boolean(editFormik.errors.DailyWorkerNameId)}
                                    helperText={editFormik.touched.DailyWorkerNameId && editFormik.errors.DailyWorkerNameId}
                                    suggestions={suggestionsDailyWorker ?? []}
                                    onSuggestionsClearRequested={() => setSuggestionsDailyWorker([])}
                                    onSuggestionsFetchRequested={({value}: any) => {
                                        editFormik.setFieldValue("DailyWorkerNameId", value);
                                        setSuggestionsDailyWorker(getSuggestionsDailyWorker(value));
                                    }}
                                    onSuggestionSelected={(_: any, {suggestionValue}: any) => {
                                        setSelectSuggestionsDailyWorker(suggestionValue);
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
                                            ? editFormik.touched.DailyWorkerNameId && Boolean(editFormik.errors.DailyWorkerNameId)
                                                ? "react-autosuggest__input__empty--dark"
                                                : "react-autosuggest__input--dark"
                                            : editFormik.touched.DailyWorkerNameId && Boolean(editFormik.errors.DailyWorkerNameId)
                                                ? "react-autosuggest__input__empty"
                                                : "react-autosuggest__input",
                                    }}
                                    inputProps={{
                                        placeholder: "نیروی انسانی*",
                                        value: editFormik.values.DailyWorkerNameId,
                                        onChange: (_: any, {newValue, method}: any) => {
                                            editFormik.setFieldValue("DailyWorkerNameId", newValue);
                                        },
                                    }}
                                    highlightFirstSuggestion={true}
                                />
                                <Box component="span" sx={{color: errColor, fontSize: "0.85rem"}}>
                                    {editFormik.touched.DailyWorkerNameId && editFormik.errors.DailyWorkerNameId}
                                    {editFormik.touched.DailyWorkerNameId && Boolean(editFormik.errors.DailyWorkerNameId)}
                                </Box>
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
                                        value={moment(editFormik.values.EnterTime).toDate()}
                                        onChange={(date) => editFormik.setFieldValue("EnterTime", moment(date).locale("en").format("YYYY-MM-DDTHH:mm"))}
                                        label="ساعت ورود"
                                    />
                                </LocalizationProvider>
                                {editFormik.touched.EnterTime && Boolean(editFormik.errors.EnterTime) ?
                                    <Typography variant={"caption"} sx={{color: "#d32f2f"}}>
                                        {editFormik.touched.EnterTime && editFormik.errors.EnterTime}
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
                                <TextField
                                    name={"ActivityType"}
                                    onChange={editFormik.handleChange}
                                    value={editFormik.values.ActivityType}
                                    error={editFormik.touched.ActivityType && Boolean(editFormik.errors.ActivityType)}
                                    helperText={editFormik.touched.ActivityType && editFormik.errors.ActivityType}
                                    fullWidth
                                    label="نوع فعالیت"
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    name={"ServingLocation"}
                                    onChange={editFormik.handleChange}
                                    value={editFormik.values.ServingLocation}
                                    error={editFormik.touched.ServingLocation && Boolean(editFormik.errors.ServingLocation)}
                                    helperText={editFormik.touched.ServingLocation && editFormik.errors.ServingLocation}
                                    fullWidth
                                    label="محل انجام فعالیت"
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
                <ModalIpa open={Boolean(remove)} title={`آیا از حذف اطلاعات روزمزد مطمئن هستید؟`}
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
                <ModalIpa open={Boolean(verify)} title={`آیا از تایید اطلاعات روزمزد مطمئن هستید؟`}
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
                <ModalIpa open={Boolean(verifyAll)} title={`آیا از تایید تمام روزمزدها مطمئن هستید؟`}
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
                                    onChange={(newValue: any) => copyRowFormik.setFieldValue('toDate',moment(newValue).locale("en").format("YYYY-MM-DD"))}
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

export {WorkersReportDailyPage};
