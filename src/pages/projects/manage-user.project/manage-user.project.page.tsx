import React, { useEffect, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TableCell,
  TextField,
} from "@mui/material";
import { Delete, Edit, Settings } from "@mui/icons-material";
import { deleteUserProject, getCompanyUsersForProject, getUsersOfProject, postUserProject, putUserProject } from "api/api";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import "date-fns";
import { Column, TableIpa } from "components/table/table.componet";
import { ButtonsModal, FilterTable, MenuActionTable, ModalIpa, PaginationIpa } from "components";
import { userTypes } from "../../../utils/user-types";
import { useParams } from "react-router-dom";
import {blue} from "@mui/material/colors";

const columns: Column[] = [
  {
    id: "counter",
    label: "#",
    align: "center",
    minWidth: 20,
  },
  {
    id: "userFullName",
    label: "نام",
    align: "left",
    minWidth: 120,
  },
  {
    id: "mobile",
    label: "موبایل",
    align: "center",
    minWidth: 60,
  },
  {
    id: "userType",
    label: "نقش",
    align: "left",
    minWidth: 70,
    // @ts-ignore
    format: (value: number) => userTypes[value],
  },

  {
    id: "action",
    label: "عملیات",
    align: "center",
    minWidth: 60,
  },
];

const checkboxLabels = [
  {id: "readMessageAccess", label: "مشاهده پیام"},
  {id: "writeMessageAccess", label: "نوشتن پیام"},
  {id: "allowToAddUser", label: "ثبت کاربر"},
  {id: "contructorAccess", label: "پیمانکار"},
  {id: "dailyWorkerAccess", label: "عوامل روز مزد"},
  {id: "materialAccess", label: "مصالح"},
  {id: "fundPaymentAccess", label: "هزینه های تنخواه"},
  {id: "pictureAccess", label: "ثبت تصاویر"},
  {id: "problemAccess", label: "مشکلات"},
  {id: "projecsFinanceInfoAccess", label: "اطلاعات مالی شرکت"},
  {id: "reminderAccess", label: "یادآوری و یادداشت"},
  {id: "sessionAccess", label: "جلسات و بازدیدها"},
  {id: "staffAccess", label: "نیروی انسانی شرکت"},
  {id: "toolAccess", label: "ابزارآلات و ماشین ها"},
  {id: "weatherAccess", label: "آب و هوا"},
  {id: "progressAccess", label: "پیشرفت"},
  {id: "effectiveActionsAccess", label: "اقدامات موثر"},
  {id: "operationLicense", label: "مجوز اجرای عملیات"},
  {id: "letterAccess", label: "مکاتبات"},
  {id: "fullDataAccessInPdf", label: "دسترسی کل"}
];


function ManageUserProjectPage() {
  const [usersCmp, setUsersCmp] = useState<any>(null);
  const [rows, setRows] = useState<any>(null);
  const [filteredRow, setFilteredRow] = useState<any>([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState<any>(10);
  const [add, setAdd] = useState<any>(null);
  const [edit, setEdit] = useState<any>(null);
  const [keySearch, setKeySearch] = useState<any>("");
  const [remove, setRemove] = useState<any>(null);
  const [checked, setChecked] = useState(new Array(checkboxLabels.length).fill(false));
  const { companyId, projectId } = useParams();
  const validation = Yup.object({
    id: Yup.string().required("نباید خالی باشد"),
  });

  const addFormik = useFormik({
    initialValues: {
      allowToAddUser: false,
      applicationUserId: "",
      contructorAccess: false,
      dailyWorkerAccess: false,
      effectiveActionsAccess: false,
      fullDataAccessInPdf: false,
      fundPaymentAccess: false,
      id: "",
      letterAccess: false,
      materialAccess: false,
      operationLicense: false,
      pictureAccess: false,
      problemAccess: false,
      progressAccess: false,
      projecsFinanceInfoAccess: false,
      projectId: projectId,
      readMessageAccess: false,
      reminderAccess: false,
      sessionAccess: false,
      staffAccess: false,
      toolAccess: false,
      userType: 1,
      weatherAccess: false,
      writeMessageAccess: false,
    },
    validationSchema: validation,
    onSubmit: async (values, { resetForm }) => {
      const tempId = values.id;
      delete values.id;
      const res = await postUserProject({ ...values, applicationUserId: tempId });
      if (!(res instanceof Error)) {
        setAdd(null);
        toast.success("کاربر با موفقیت درج شد");
        await refreshUsers();
        // search(keySearch)
        resetForm();
      } else {
        toast.error("درج کاربر با خطا مواجه شد");
      }
    },
  });
  const editFormik = useFormik({
    initialValues: {
      allowToAddUser: false,
      applicationUserId: "",
      contructorAccess: false,
      dailyWorkerAccess: false,
      effectiveActionsAccess: false,
      fullDataAccessInPdf: false,
      fundPaymentAccess: false,
      id: "",
      letterAccess: false,
      materialAccess: false,
      operationLicense: false,
      pictureAccess: false,
      problemAccess: false,
      progressAccess: false,
      projecsFinanceInfoAccess: false,
      projectId: "",
      readMessageAccess: false,
      reminderAccess: false,
      sessionAccess: false,
      staffAccess: false,
      toolAccess: false,
      userType: 1,
      weatherAccess: false,
      writeMessageAccess: false,
    },
    validationSchema: validation,
    onSubmit: async (values, { resetForm }) => {
      const res = await putUserProject(values, edit.id);
      if (!(res instanceof Error)) {
        setEdit(null);
        // const tmpRows = [...rows]
        // const index = tmpRows.indexOf(edit)
        // tmpRows[index] = {...values, id: edit.id}
        // setRows(tmpRows)
        // setFilteredRow(tmpRows)
        await refreshUsers();

        toast.success("کاربر با موفقیت ویرایش یافت");
        resetForm();
      } else {
        toast.error("ویرایش کاربر با خطا مواجه شد");
      }
    },
  });

  useEffect(() => {
    if (edit) {
      const editFormChecked = checkboxLabels.map(item => {
        if (edit && edit.hasOwnProperty(item.id)) {
          return edit[item.id];
        } else {
          return false;
        }
      });
      setChecked(editFormChecked);
      editFormik.setValues({
        allowToAddUser: edit.allowToAddUser,
        applicationUserId: edit.applicationUserId,
        contructorAccess: edit.contructorAccess,
        dailyWorkerAccess: edit.dailyWorkerAccess,
        effectiveActionsAccess: edit.effectiveActionsAccess,
        fullDataAccessInPdf: edit.fullDataAccessInPdf,
        fundPaymentAccess: edit.fundPaymentAccess,
        id: edit.id,
        letterAccess: edit.letterAccess,
        materialAccess: edit.materialAccess,
        operationLicense: edit.operationLicense,
        pictureAccess: edit.pictureAccess,
        problemAccess: edit.problemAccess,
        progressAccess: edit.progressAccess,
        projecsFinanceInfoAccess: edit.projecsFinanceInfoAccess,
        projectId: edit.projectId,
        readMessageAccess: edit.readMessageAccess,
        reminderAccess: edit.reminderAccess,
        sessionAccess: edit.sessionAccess,
        staffAccess: edit.staffAccess,
        toolAccess: edit.toolAccess,
        userType: edit.userType,
        weatherAccess: edit.weatherAccess,
        writeMessageAccess: edit.writeMessageAccess,
      });
    }
  }, [edit]);
  const handleRemoveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await deleteUserProject(remove);
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
    const resUsers = await getCompanyUsersForProject(companyId, projectId);
    if (!(resUsers instanceof Error)) {
      setUsersCmp(resUsers);
    }
  };

  const refreshUsers = async () => {
    const res = await getUsersOfProject(projectId);
    if (!(res instanceof Error)) {
      setRows(res);
      setFilteredRow(res);
      // @ts-ignore
      setCount(res.length);
    } else {
      toast.error("دریافت داده با خطا مواجه شد");
    }
  };

  const getAllNeedData = async () => {
    const res = await getUsersOfProject(projectId);
    const resUsers = await getCompanyUsersForProject(companyId, projectId);
    if (!(res instanceof Error)) {
      setRows(res);
      setFilteredRow(res);
      // @ts-ignore
      setCount(res.length);
    } else {
      toast.error("دریافت داده با خطا مواجه شد");
    }
    if (!(resUsers instanceof Error)) {
      setUsersCmp(resUsers);
    } else {
      toast.error("دریافت داده با خطا مواجه شد");
    }
  };

  // useMemo(() => {
  //   return rows
  // }, [rows])

  useEffect(() => {
    getAllNeedData();
  }, []);

  const search = (key: string) => {
    if (key) {
      const filtered = rows.filter((row: any) => row.userFullName.includes(key) || row.mobile.includes(key));
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
      search(keySearch);
    }
  }, [rows]);

  const itemsOfAction = [
    {
      title: (
        <>
          <Edit />
          &nbsp; ویرایش
        </>
      ),
      onClick: async (user: any) =>
        await new Promise((resolve, reject) => {
          setEdit(user);
        }),
    },
    {
      title: (
        <>
          <Delete />
          &nbsp; حذف
        </>
      ),
      onClick: (user: any) => setRemove(user.id),
    },
  ];

  const handleCheckboxChange = (index) => {
    const newChecked = [...checked];
    newChecked[index] = !newChecked[index];
    setChecked(newChecked);
  };

  // Handler for the "select all" checkbox change
  const handleSelectAllChange = (event) => {
    setChecked(new Array(checkboxLabels.length).fill(event.target.checked));
    checkboxLabels.forEach((item) => {
      addFormik.setFieldValue(item.id, event.target.checked);
      editFormik.setFieldValue(item.id, event.target.checked);
    })
  };

  const isAllChecked = checked.every((value) => value);

  return (
    <Grid container>
      <Grid item xs={12} style={{ width: 10 }}>
        <Paper>
          <Box mb={3} pt={3} mx={3}>
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
              titleAdd={"درج کاربر"}
              onClickAdd={() => setAdd(true)}
            />
          </Box>
          <TableIpa
            columns={columns}
            style={{}}
            bodyFucn={(column, row: any, index) => {
              const head = column.id;
              const value = row[column.id];
              if (head === "counter") {
                return (
                  <TableCell key={column.id} align={column.align}>
                    {(page - 1) * limit + index + 1}
                  </TableCell>
                );
              } else if (head === "mobile") {
                return (
                  <TableCell key={column.id} align={column.align}>
                    <Button variant={"text"} component={"a"} href={"tel:" + value}>
                      {value}
                    </Button>
                  </TableCell>
                );
              } else if (head === "action") {
                return (
                  <TableCell key={column.id} align={column.align}>
                    <MenuActionTable menuId={row.id} items={itemsOfAction} icon={<Settings />} user={row} />
                  </TableCell>
                );
              }

              return (
                <TableCell key={column.id} align={column.align}>
                  {column.format && value ? column.format(value) : value}
                </TableCell>
              );
            }}
            rows={filteredRow.length ? filteredRow.slice((page - 1) * limit, page * limit) : []}
          />
          {rows?.length < 1 ?
              <Alert severity="error" sx={{justifyContent: 'center', width: '100%'}}>
                کاربری برای این پروژه درج نشده است
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
      {add ? (
        <ModalIpa
          open={add}
          title={"درج کاربر"}
          onClose={() => {
            setChecked(new Array(checkboxLabels.length).fill(false));
            setAdd(null);
            addFormik.handleReset(1);
          }}
        >
          <form noValidate onSubmit={addFormik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  options={usersCmp ?? []}
                  onChange={(e, value) => addFormik.setFieldValue("id", value ? value.id : "")}
                  getOptionLabel={(user: any) => user.fullName + " " + user.phoneNumber}
                  // disableCloseOnSelect
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={addFormik.touched.id && Boolean(addFormik.errors.id)}
                      helperText={addFormik.touched.id && addFormik.errors.id}
                      required
                      label="کاربر"
                      variant="outlined"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth variant={"outlined"}>
                  <InputLabel htmlFor={"userType"}>سطح کاربر</InputLabel>
                  <Select
                    labelId={"userType"}
                    id={"userType"}
                    value={addFormik.values.userType}
                    onChange={(e) => addFormik.setFieldValue("userType", e.target.value)}
                    error={addFormik.touched.userType && Boolean(addFormik.errors.userType)}
                    // helperText={addFormik.touched.completeStatus && addFormik.errors.completeStatus}
                    label="وضعیت"
                  >
                    {Object.keys(userTypes).map((type) => (
                      // @ts-ignore
                      <MenuItem key={type} value={+type}>
                        {userTypes[+type]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                    control={
                      <Switch
                          checked={isAllChecked}
                          onChange={handleSelectAllChange}
                          name="select all"
                      />
                    }
                    label="انتخاب همه"
                    color="warning"
                    sx={{
                      color: blue["700"],
                      '& .MuiTypography-root': {fontWeight: 500},
                      '& .muirtl-pzncqu-MuiButtonBase-root-MuiSwitch-switchBase.Mui-checked': {color: blue["700"]},
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {backgroundColor: blue["700"]},
                    }}
                />
              </Grid>
              {checkboxLabels.map((item, index) => {
                return (
                    <Grid item xs={12} sm={6} key={index}>
                      <FormControlLabel
                          control={
                            <Switch
                                checked={checked[index]}
                                onChange={() => {
                                  handleCheckboxChange(index);
                                  addFormik.setFieldValue(item.id, !checked[index])
                                }}
                                name={`checkbox-${index}`}
                            />
                          }
                          label={item.label}
                      />
                    </Grid>
                )
              })}
              <Grid item xs={12}>
                <ButtonsModal
                  textSubmit={"ذخیره"}
                  textClose={"انصراف"}
                  onClose={() => {
                    setAdd(null);
                    addFormik.handleReset(1);
                    setChecked(new Array(checkboxLabels.length).fill(false));
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
          title={edit.userFullName + " " + edit.mobile}
          onClose={() => {
            setChecked(new Array(checkboxLabels.length).fill(false));
            setEdit(null);
            editFormik.handleReset(1);
          }}
        >
          <form noValidate onSubmit={editFormik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth variant={"outlined"}>
                  <InputLabel htmlFor={"userType"}>سطح کاربر</InputLabel>
                  <Select
                    labelId={"userType"}
                    id={"userType"}
                    value={editFormik.values.userType}
                    onChange={(e) => editFormik.setFieldValue("userType", e.target.value)}
                    error={editFormik.touched.userType && Boolean(editFormik.errors.userType)}
                    // helperText={editFormik.touched.completeStatus && editFormik.errors.completeStatus}
                    label="وضعیت"
                  >
                    {Object.keys(userTypes).map((type) => (
                      // @ts-ignore
                      <MenuItem key={type} value={+type}>
                        {userTypes[+type]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                    control={
                      <Switch
                          checked={isAllChecked}
                          onChange={handleSelectAllChange}
                          name="select all"
                      />
                    }
                    label="انتخاب همه"
                    color="warning"
                    sx={{
                      color: blue["700"],
                      '& .MuiTypography-root': {fontWeight: 500},
                      '& .muirtl-pzncqu-MuiButtonBase-root-MuiSwitch-switchBase.Mui-checked': {color: blue["700"]},
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {backgroundColor: blue["700"]},
                    }}
                />
              </Grid>
              {checkboxLabels.map((item, index) => {
                return (
                    <Grid item xs={12} sm={6} key={index}>
                      <FormControlLabel
                          control={
                            <Switch
                                checked={editFormik.values[item.id]}
                                onChange={() => {
                                  handleCheckboxChange(index);
                                  editFormik.setFieldValue(item.id, !checked[index])
                                }}
                                name={`checkbox-${index}`}
                            />
                          }
                          label={item.label}
                      />
                    </Grid>
                )
              })}
              <Grid item xs={12}>
                <ButtonsModal
                  textSubmit={"ذخیره"}
                  textClose={"انصراف"}
                  onClose={() => {
                    setEdit(null);
                    editFormik.handleReset(1);
                    setChecked(new Array(checkboxLabels.length).fill(false));
                  }}
                />
              </Grid>
            </Grid>
          </form>
        </ModalIpa>
      ) : null}
      {remove ? (
        <ModalIpa open={Boolean(remove)} title={`آیا از حذف کاربر مطمئن هستید؟`} onClose={() => setRemove(null)}>
          <form onSubmit={handleRemoveUser}>
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
    </Grid>
  );
}

export { ManageUserProjectPage };
