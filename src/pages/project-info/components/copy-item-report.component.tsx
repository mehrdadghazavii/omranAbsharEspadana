import React, { useState } from "react";
import * as Yup from "yup";
import moment from "jalali-moment";
import { useFormik } from "formik";
import { postCopyItems } from "../../../api/api";
import { toast } from "react-toastify";
import { Box, Button, FormControlLabel, Grid, Switch } from "@mui/material";
import { ButtonsModal, ModalIpa } from "../../../components";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFnsJalali } from "@mui/x-date-pickers/AdapterDateFnsJalali";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import { red } from "@mui/material/colors";

export function CopyItemReport({ project }: any) {
  const [open, setOpen] = useState(false);

  const addValidation = Yup.object({
    fromDate: Yup.string().required("نباید خالی باشد"),
    toDate: Yup.string()
      .required("نباید خالی باشد")
      .test("تاریخ معتبر نیست", "تاریخ معتبر نیست", function (value: string) {
        return moment(value).isValid();
      })
  });

  const addFormik = useFormik({
    initialValues: {
      contructors: false,
      dailyWorker: false,
      staffs: false,
      tools: false,
      materials: false,
      pictures: false,
      seassion: false,
      problems: false,
      progress: false,
      letters: false,
      effectiveActions: false,
      fundsPayments: false,
      projectsfinanceInfo: false,
      operationLicense: false,
      fromDate: "",
      toDate: "",
    },
    validationSchema: addValidation,
    onSubmit: async (values, { resetForm }) => {
      values.fromDate = moment(values.fromDate).locale("en").format("YYYY-MM-DD");
      values.toDate = moment(values.toDate).locale("en").format("YYYY-MM-DD");
      let selectedItemsArray = [];
      Object.entries(values).forEach((item: any, index: number) => {
        if (typeof item[1] === "boolean" && item[1]) {
          selectedItemsArray.push(index + 1);
        }
      });
      // if (selectedItemsArray.length > 0) {
      const res = await postCopyItems(project.id, { from: values.fromDate, to: values.toDate, items: selectedItemsArray });
      if (!(res instanceof Error)) {
        toast.success("کپی داده ها با موفقیت انجام شد");
        resetForm();
        setOpen(false);
        selectedItemsArray = [];
      } else {
        toast.error("کپی داده ها با خطا مواجه شد");
        resetForm();
        setOpen(false);
        selectedItemsArray = [];
      }
      // }
    },
  });

  return (
    <>
      <Button size={"large"} color={"info"} fullWidth variant={"contained"} onClick={() => setOpen(true)}>
        کپی آیتم
        <ContentCopyRoundedIcon />
      </Button>
      {open ? (
        <ModalIpa
          title={"کپی آیتم"}
          open={open}
          onClose={() => {
            setOpen(false);
            addFormik.handleReset(1);
          }}
        >
          <form noValidate onSubmit={addFormik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item sm={6} xs={12}>
                <FormControlLabel
                  control={<Switch checked={addFormik.values.contructors} onChange={addFormik.handleChange} name="contructors" />}
                  label="پیمانکار"
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControlLabel
                  control={<Switch checked={addFormik.values.dailyWorker} onChange={addFormik.handleChange} name="dailyWorker" />}
                  label="عوامل روز مزد"
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControlLabel
                  control={<Switch checked={addFormik.values.staffs} onChange={addFormik.handleChange} name="staffs" />}
                  label="نیروی انسانی"
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControlLabel
                  control={<Switch checked={addFormik.values.tools} onChange={addFormik.handleChange} name="tools" />}
                  label="ماشین آلات وابزار"
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControlLabel
                  control={<Switch checked={addFormik.values.materials} onChange={addFormik.handleChange} name="materials" />}
                  label="مصالح"
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControlLabel
                  control={<Switch checked={addFormik.values.pictures} onChange={addFormik.handleChange} name="pictures" />}
                  label="تصاویر"
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControlLabel
                  control={<Switch checked={addFormik.values.seassion} onChange={addFormik.handleChange} name="seassion" />}
                  label="جلسات و بازدیدها"
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControlLabel
                  control={<Switch checked={addFormik.values.problems} onChange={addFormik.handleChange} name="problems" />}
                  label="مشکلات"
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControlLabel
                  control={<Switch checked={addFormik.values.progress} onChange={addFormik.handleChange} name="progress" />}
                  label="پیشرفت"
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControlLabel
                  control={<Switch checked={addFormik.values.letters} onChange={addFormik.handleChange} name="letters" />}
                  label="مکاتبات"
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={addFormik.values.effectiveActions}
                      onChange={addFormik.handleChange}
                      name="effectiveActions"
                    />
                  }
                  label="اقدامات موثر"
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControlLabel
                  control={
                    <Switch checked={addFormik.values.fundsPayments} onChange={addFormik.handleChange} name="fundsPayments" />
                  }
                  label="هزینه های تنخواه"
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={addFormik.values.projectsfinanceInfo}
                      onChange={addFormik.handleChange}
                      name="projectsfinanceInfo"
                    />
                  }
                  label="اطلاعات مالی"
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={addFormik.values.operationLicense}
                      onChange={addFormik.handleChange}
                      name="operationLicense"
                    />
                  }
                  label="مجوز اجرای عملیات"
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFnsJalali}>
                  <DatePicker
                    label={"از تاریخ"}
                    value={addFormik.values.fromDate}
                    onChange={(newValue: any) => addFormik.setFieldValue("fromDate", moment(newValue).isValid() ? newValue : "")}
                    sx={{ width: "100%" }}
                  />
                </LocalizationProvider>
                <Box component="span" sx={{ color: red[600], fontSize: "0.85rem" }}>
                  {addFormik.touched.fromDate && addFormik.errors.fromDate}
                  {addFormik.touched.fromDate && Boolean(addFormik.errors.fromDate)}
                </Box>
              </Grid>
              <Grid item md={6} xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFnsJalali}>
                  <DatePicker
                    label={"به تاریخ"}
                    value={addFormik.values.toDate}
                    onChange={(newValue: any) => addFormik.setFieldValue("toDate", moment(newValue).isValid() ? newValue : "")}
                    sx={{ width: "100%" }}
                  />
                </LocalizationProvider>
                <Box component="span" sx={{ color: red[600], fontSize: "0.85rem" }}>
                  {addFormik.touched.toDate && addFormik.errors.toDate}
                  {addFormik.touched.toDate && Boolean(addFormik.errors.toDate)}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <ButtonsModal
                  textSubmit={"تایید"}
                  textClose={"انصراف"}
                  onClose={() => {
                    setOpen(false);
                    addFormik.handleReset(1);
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
