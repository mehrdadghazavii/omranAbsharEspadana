import React, { useState } from "react";
import * as Yup from "yup";
import moment from "jalali-moment";
import { useFormik } from "formik";
import { postCopyDailyReport } from "../../../api/api";
import { toast } from "react-toastify";
import {Box, Button, Grid } from "@mui/material";
import { CopyAll } from "@mui/icons-material";
import { ButtonsModal, ModalIpa } from "../../../components";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFnsJalali } from "@mui/x-date-pickers/AdapterDateFnsJalali";
import {red} from "@mui/material/colors";

export function CopyReport({ project }: any) {
  const [open, setOpen] = useState(false);

  const validation = Yup.object({
    fromDate: Yup.string()
        .required("باید پر شود")
        .typeError("تاریخ معتبر نمی باشد"),
    toDate: Yup.string()
        .required("باید پر شود")
        .typeError("تاریخ معتبر نمی باشد")
  });

  const copyFormik = useFormik({
    initialValues: {
      fromDate: "",
      toDate: "",
    },
    validationSchema: validation,
    onSubmit: async (values, { resetForm }) => {
      const res = await postCopyDailyReport(project.id, {
        fromDate: moment(values.fromDate).locale("en").format("YYYY-MM-DD"),
        toDate: moment(values.toDate).locale("en").format("YYYY-MM-DD"),
      });
      if (!(res instanceof Error)) {
        toast.success("کپی داده ها با موفقیت انجام شد");
        resetForm();
        setOpen(false);
      }
    },
  });
  return (
    <>
      <Button size={"large"} color={"primary"} fullWidth variant={"outlined"} onClick={() => setOpen(true)}>
        کپی کل
        <CopyAll />
      </Button>
      {open ? (
        <ModalIpa
          title={"کپی کل"}
          open={open}
          onClose={() => {
            setOpen(false);
            copyFormik.handleReset(1);
          }}
        >
          <form noValidate onSubmit={copyFormik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item md={6} xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFnsJalali}>
                  <DatePicker
                    label={"از تاریخ"}
                    value={copyFormik.values.fromDate}
                    onChange={(newValue: any) => copyFormik.setFieldValue("fromDate", newValue)}
                    sx={{ width: "100%" }}
                  />
                </LocalizationProvider>
                <Box component="span" sx={{ color: red[600], fontSize: "0.85rem" }}>
                  {copyFormik.touched.fromDate && copyFormik.errors.fromDate}
                  {copyFormik.touched.fromDate && Boolean(copyFormik.errors.fromDate)}
                </Box>
              </Grid>
              <Grid item md={6} xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFnsJalali}>
                  <DatePicker
                    label={"به تاریخ"}
                    value={copyFormik.values.toDate}
                    onChange={(newValue: any) => copyFormik.setFieldValue("toDate", newValue)}
                    sx={{ width: "100%" }}
                  />
                </LocalizationProvider>
                <Box component="span" sx={{ color: red[600], fontSize: "0.85rem" }}>
                  {copyFormik.touched.toDate && copyFormik.errors.toDate}
                  {copyFormik.touched.toDate && Boolean(copyFormik.errors.toDate)}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <ButtonsModal
                  textSubmit={"تایید"}
                  textClose={"انصراف"}
                  onClose={() => {
                    setOpen(false);
                    copyFormik.handleReset(1);
                  }}
                />
              </Grid>
            </Grid>
          </form>
        </ModalIpa>
      ) : null}
    </>
  );
}
