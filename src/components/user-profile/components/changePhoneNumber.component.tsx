import React, { useState } from "react";
import * as yup from "yup";
import { useFormik } from "formik";
import { sendVerificationCode, updatePhoneNumber, verifyMobileUser } from "../../../api/api";
import { toast } from "react-toastify";
import { Button, Grid, TextField, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import CountdownTimer from "../../countdown-timer/countdown-timer";
import { handleTimerCode } from "../../../redux/actions/actions";

function ChangePhoneNumberComponent() {
  const [showVerify, setShowVerify] = useState(false);
  const user = useSelector((state: any) => state.user);
  const timerCode = useSelector((state: any) => state.timerCode);


  const dispatch = useDispatch();
  const resendVerifyCode = async () => {
    const res = await sendVerificationCode(changeFormik.values.PhoneNumber);
    if (!(res instanceof Error)) {
      dispatch(handleTimerCode(true));
      setShowVerify(true);
    } else {
      toast.error("ارسال کد با خطا مواجه شد");
    }
  }

  const validationChange = yup.object({
    PhoneNumber: yup
      .string()
      .required("نباید خالی باشد")
      .test("شماره موبایل باید 11 رقمی باشد", "شماره موبایل باید 11 رقمی باشد", function (value = "") {
        return value.toString().length === 11;
      }),
  });

  const changeFormik = useFormik({
    initialValues: {
      PhoneNumber: "",
    },
    validationSchema: validationChange,
    onSubmit: async (values) => {
      const res = await updatePhoneNumber(values);
      if (!(res instanceof Error)) {
        dispatch(handleTimerCode(true));
        setShowVerify(true);
        toast.success("کد تایید برای شما ارسال شد");
      } else {
        toast.error("دقت کنید ، شماره موبایل نباید تکراری باشد!");
      }
    },
  });

  const validationVerify = yup.object({
    code: yup.string().required("نباید خالی باشد"),
  });

  const verifyFormik = useFormik({
    initialValues: {
      code: "",
    },
    validationSchema: validationVerify,
    onSubmit: async (values) => {
      await verifyFormik.setValues({ code: '' });
      if (timerCode) {
        const res = await verifyMobileUser({ ...values, UserId: user.id });
        if (!(res instanceof Error)) {
          setShowVerify(false);
          toast.success("شماره موبایل شما با موفقیت تغییر یافت");
        } else {
          toast.error("کد تایید نامعتبر است");
        }
      } else {
        toast.error('کد تایید شما منقضی شده است');
      }
    },
  });

  return (
    <>
      {showVerify ? (
        <form noValidate onSubmit={verifyFormik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="body1">
                کد تایید به شماره
                <Typography variant="subtitle1" color="primary" fontWeight={500} display="inline-block" mx={1}>
                  {changeFormik.values.PhoneNumber}
                </Typography>
                ارسال شد.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name={"code"}
                value={verifyFormik.values.code}
                onChange={verifyFormik.handleChange}
                label={"کد تایید"}
                error={verifyFormik.touched.code && Boolean(verifyFormik.errors.code)}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={8}>
              <Button variant={"text"} size={"small"} onClick={() => setShowVerify(false)}>
                بازگشت
              </Button>
            </Grid>
            <Grid item xs={3} textAlign='right'>
              {timerCode ? (
                <CountdownTimer seconds={120}/>
              ) : (
                <Button variant='contained' color='primary' onClick={() => resendVerifyCode()}>ارسال مجدد</Button>
              )}
            </Grid>
            <Grid item xs={12}>
              <Button size={"large"} fullWidth color={"primary"} variant={"contained"} type={"submit"}>
                تایید
              </Button>
            </Grid>
          </Grid>
        </form>
      ) : (
        <form noValidate onSubmit={changeFormik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                id={"PhoneNumber"}
                variant="outlined"
                label={"شماره موبایل"}
                required
                fullWidth
                onChange={changeFormik.handleChange}
                error={changeFormik.touched.PhoneNumber && Boolean(changeFormik.errors.PhoneNumber)}
                helperText={changeFormik.touched.PhoneNumber && changeFormik.errors.PhoneNumber}
              />
            </Grid>
            <Grid item xs={12} mt={12}>
              <Button size={"large"} fullWidth color={"primary"} variant={"contained"} type={"submit"}>
                تغییر شماره همراه
              </Button>
            </Grid>
          </Grid>
        </form>
      )}
    </>
  );
}

export default ChangePhoneNumberComponent;
