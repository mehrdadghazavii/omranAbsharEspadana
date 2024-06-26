import React from "react";
import Box from "@mui/material/Box";
import {Button, Radio, TextField, Typography} from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2';
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import {CompanyProfileData, updateCompanyProfile} from "api/api";
import { toast } from "react-toastify";
import * as yup from "yup";

function InfoComponent({ company, refreshCompany }) {
  const [edit, setEdit] = useState<boolean>(false);
  const [isLegal, setIsLegal] = React.useState<boolean>(false);

  const editCompanyProfileFields = [
    {title:"name", label: isLegal ? "نام شرکت" : "نام شخص"},
    {title:"activityType", label: "نوع فعالیت"},
    {title:"phoneNumber", label: "شماره تماس"},
    {title:"nationalCode", label: isLegal ? "شناسه ملی" : "کد ملی"},
    {title:"zipCode", label: "کد پستی"},
    {title:"province", label: "استان"},
    {title:"town", label: "شهرستان"},
    {title:"city", label: "شهر"},
    {title:"address", label: "آدرس", md: 12},
  ];

  const validationEdit = yup.object({
    nationalCode: yup.string()
        .required("این فیلد اجباری است")
        .length(isLegal ? 11 : 10, "شناسه یا کدملی نامعتبر می باشد")
        .matches(/^[0-9]+$/, "شناسه ملی فقط باید عدد وارد شود")
    ,
    phoneNumber: yup.string()
        .required("این فیلد اجباری است!")
        .matches(/^[0-9]+$/, "شماره تماس فقط باید عدد وارد شود")
    ,
    zipCode: yup.string()
        .required("این فیلد اجباری است!")
        .length(10, "کد پستی باید 10 رقمی باشد")
        .matches(/^[0-9]+$/, "کد پستی فقط باید عدد وارد شود")
    ,
    province: yup.string()
        .required("این فیلد اجباری است")
    ,

    town: yup.string()
        .required("این فیلد اجباری است")
    ,
    name: yup.string()
        .required("این فیلد اجباری است")
    ,
    address: yup.string()
        .required("این فیلد اجباری است")
    ,
    activityType: yup.string()
        .required("این فیلد اجباری است")
    ,
    city: yup.string()
        .required("این فیلد اجباری است")
    ,
  });

  const editFormik = useFormik({
    initialValues: {
      activityType: "",
      address: "",
      id: company?.id,
      isLegal: company?.isLegal,
      name: "",
      nationalCode: "",
      phoneNumber: "",
      province: "",
      town: "",
      city: "",
      zipCode: "",
    } ,validationSchema: validationEdit,
    onSubmit: async (values: CompanyProfileData) => {
      const res = await updateCompanyProfile(company.id, values);
      if (!(res instanceof Error)) {
        setEdit(false);
        toast.success("اطلاعات با موفقیت ویرایش یافت");
        refreshCompany();
      } else {
        toast.error("ثبت اطلاعات با خطا مواجه شد");
      }
    },
  });

  useEffect(() => {
    if (company) {
      editFormik.setValues({
        activityType: company.activityType ?? '',
        address: company.address ?? '',
        city: company.city ?? '',
        id: company.id ?? '',
        isLegal: company.isLegal ?? '',
        name: company.name ?? '',
        nationalCode: company.nationalCode ?? '',
        phoneNumber: company.phoneNumber ?? '',
        province: company.province ?? '',
        town: company.town ?? '',
        zipCode: company.zipCode ?? '',
      });
    }
  }, [company]);

  return (
    <>
      {!edit ? (
        <>
          <Grid container spacing={4} px={3}>
            <Grid xs={12} textAlign="center">
              <Typography component="span" fontWeight={500}>
                نوع شخص :
              </Typography>
              <Typography component="span" fontWeight={400} ml={1}>
                {company.isLegal ? "حقوقی" : "حقیقی"}
              </Typography>
            </Grid>
            {editCompanyProfileFields.map((field) => (
                <Grid md={field.md || 6} xs={12}>
                  <Box display="flex" justifyContent="flex-start">
                    <Typography variant="body1" fontWeight={500}>
                      {`${field.label} :`}
                    </Typography>
                    <Typography variant="body1" fontWeight={400} ml={1}>
                      {company[field.title] ?? "ــ"}
                    </Typography>
                  </Box>
                </Grid>
            ))}

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
            <Grid xs={12} textAlign="center">
              <Typography component="span">نوع شخص : </Typography>
              <Typography component="span">حقوقی</Typography>
              <Radio
                  checked={isLegal}
                  onChange={(event) => setIsLegal(!isLegal)}
                  title="حقوقی"
              />
              <Typography component="span">حقیقی</Typography>
              <Radio
                  checked={!isLegal}
                  onChange={(event) => setIsLegal(!isLegal)}
                  title="حقیقی"
              />
            </Grid>
            {editCompanyProfileFields.map((field) => (
                <Grid md={field.md || 6} xs={12}>
                  <TextField
                      id={field.title}
                      variant="outlined"
                      label={field.label}
                      required
                      fullWidth
                      value={editFormik.values[field.title]}
                      onChange={editFormik.handleChange}
                      error={editFormik.touched[field.title] && Boolean(editFormik.errors[field.title])}
                      helperText={editFormik.touched[field.title] && editFormik.errors[field.title]}
                  />
                </Grid>
            ))}

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