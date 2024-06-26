import React from "react";
import Box from "@mui/material/Box";
import { Button, TextField, Typography } from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2';
import { useEffect, useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFnsJalali } from "@mui/x-date-pickers/AdapterDateFnsJalali";
import { DatePicker } from "@mui/x-date-pickers";
import { red } from "@mui/material/colors";
import { useFormik } from "formik";
import { updateUser } from "api/api";
import { toast } from "react-toastify";
import * as yup from "yup";
import moment from "jalali-moment";

function InfoComponent({ user, refreshUser }) {
  const [edit, setEdit] = useState<boolean>(false);

  const validationEdit = yup.object({
    LastName: yup.string().required("نباید خالی باشد"),
    FirstName: yup.string().required("نباید خالی باشد"),
    Email: yup
      .string()
      .required("نباید خالی باشد")
      .test("ایمیل معتبر نیست", "ایمیل معتبر نیست", function (email = "") {
        const re =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
      }),
    BirthDate: yup.date().required("نباید خالی باشد").typeError("تاریخ معتبر نیست"),
    JobTitle: yup
      .string()
      .required("نباید خالی باشد")
      .test("عنوان شغلی باید حداقل 4 کاراکتر باشد", "عنوان شغلی باید حداقل 4 کاراکتر باشد", function (value = "") {
        return value.length > 3;
      }),
  });

  const editFormik = useFormik({
    initialValues: {
      FirstName: "",
      LastName: "",
      BirthDate: {},
      Email: "",
      JobTitle: "",
    },
    validationSchema: validationEdit,
    onSubmit: async (values) => {
      const res = await updateUser(values);
      if (!(res instanceof Error)) {
        setEdit(false);
        toast.success("اطلاعات با موفقیت ویرایش یافت");
        refreshUser();
      } else {
        toast.error("دقت کنید، ایمیل و شماره موبایل نباید تکراری باشد");
      }
    },
  });

  useEffect(() => {
    if (user) {
      editFormik.setValues({
        FirstName: user.firstName,
        LastName: user.lastName,
        BirthDate: user.birthDate ? new Date(user.birthDate) : '',
        Email: user.email,
        JobTitle: user.jobTitle,
      });
    }
  }, [user]);

  return (
    <>
      {!edit ? (
        <>
          <Grid container spacing={4} px={3}>
            <Grid xs={12} md={6}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body1" fontWeight={500}>
                  نام :
                </Typography>
                <Typography variant="body1" fontWeight={400}>
                  {user.firstName}
                </Typography>
              </Box>
            </Grid>
            <Grid xs={12} md={6}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body1" fontWeight={500}>
                  نام خانوادگی :
                </Typography>
                <Typography variant="body1" fontWeight={400}>
                  {user.lastName}
                </Typography>
              </Box>
            </Grid>
            <Grid xs={12} md={6}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body1" fontWeight={500}>
                  تاریخ تولد :
                </Typography>
                <Typography variant="body1" fontWeight={400}>
                  {(user.birthDate ? moment(user.birthDate).locale("fa").format("YYYY/MM/DD") : "روز/ماه/سال")}
                </Typography>
              </Box>
            </Grid>
            <Grid xs={12} md={6}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body1" fontWeight={500}>
                  عنوان شغلی :
                </Typography>
                <Typography variant="body1" fontWeight={400}>
                  {user.jobTitle}
                </Typography>
              </Box>
            </Grid>
            <Grid xs={12} md={6}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body1" fontWeight={500}>
                  شماره تماس :
                </Typography>
                <Typography variant="body1" fontWeight={400}>
                  {user.phoneNumber}
                </Typography>
              </Box>
            </Grid>
            <Grid xs={12} md={6}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body1" fontWeight={500} whiteSpace='nowrap'>
                  ایمیل :
                </Typography>
                <Typography variant="subtitle2" fontWeight={400}>
                  {user.email}
                </Typography>
              </Box>
            </Grid>
            <Grid xs={12} textAlign="right">
              <Button variant="contained" color="info" onClick={() => setEdit(true)}>
                ویرایش اطلاعات
              </Button>
            </Grid>
          </Grid>
        </>
      ) : (
        <form noValidate onSubmit={editFormik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid md={6} xs={12}>
              <TextField
                id={"FirstName"}
                variant="outlined"
                label={"نام"}
                required
                fullWidth
                value={editFormik.values.FirstName}
                onChange={editFormik.handleChange}
                error={editFormik.touched.FirstName && Boolean(editFormik.errors.FirstName)}
                helperText={editFormik.touched.FirstName && editFormik.errors.FirstName}
              />
            </Grid>
            <Grid md={6} xs={12}>
              <TextField
                id={"LastName"}
                variant="outlined"
                label={"نام خانوادگی"}
                fullWidth
                required
                value={editFormik.values.LastName}
                onChange={editFormik.handleChange}
                error={editFormik.touched.LastName && Boolean(editFormik.errors.LastName)}
                helperText={editFormik.touched.LastName && editFormik.errors.LastName}
              />
            </Grid>
            <Grid md={6} xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFnsJalali} dateFormats={{ monthShort: "MMMM" }}>
                <DatePicker
                  label={"تاریخ تولد"}
                  views={["year", "month", "day"]}
                  value={editFormik.values.BirthDate}
                  onChange={(value) => editFormik.setFieldValue("BirthDate", value)}
                  sx={{ width: "100%" }}
                  slotProps={{
                    textField: {
                      required: true,
                    },
                  }}
                />
              </LocalizationProvider>
              <Box component="span" sx={{ color: red[600], fontSize: "0.85rem" }}>
                {editFormik.touched.BirthDate && editFormik.errors.BirthDate}
                {editFormik.touched.BirthDate && Boolean(editFormik.errors.BirthDate)}
              </Box>
            </Grid>
            <Grid md={6} xs={12}>
              <TextField
                id={"JobTitle"}
                variant="outlined"
                label={"عنوان شغلی"}
                required
                fullWidth
                value={editFormik.values.JobTitle}
                onChange={editFormik.handleChange}
                error={editFormik.touched.JobTitle && Boolean(editFormik.errors.JobTitle)}
                helperText={editFormik.touched.JobTitle && editFormik.errors.JobTitle}
              />
            </Grid>
            <Grid xs={12} md={8} mdOffset={2}>
              <TextField
                id={"Email"}
                variant="outlined"
                label={"ایمیل"}
                required
                type={"email"}
                fullWidth
                value={editFormik.values.Email}
                onChange={editFormik.handleChange}
                error={editFormik.touched.Email && Boolean(editFormik.errors.Email)}
                helperText={editFormik.touched.Email && editFormik.errors.Email}
              />
            </Grid>
            <Grid xs={12} mt={1.5}>
              <Box display="flex" justifyContent="space-between">
                <Button variant={"contained"} color="error" type={"button"} onClick={() => setEdit(false)} sx={{ px: 8 }}>
                  لغو
                </Button>
                <Button variant={"contained"} type={"submit"} sx={{ px: 8 }} color="primary">
                  تایید
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      )}
    </>
  );
}

export default InfoComponent;