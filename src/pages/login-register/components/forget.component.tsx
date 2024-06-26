import {Button, Checkbox, FormControlLabel, FormGroup, Grid, TextField} from "@mui/material";
import {useFormik} from "formik";
import * as yup from "yup";
import { changePassword, checkSmsForgetPassword, sendSmsForgetPassword, sendVerificationCode } from "../../../api/api";
import {toast} from "react-toastify";
import InputMask from 'react-input-mask';
import React, {useState} from "react";
import {ModalIpa} from "../../../components";
import CountdownTimer from "../../../components/countdown-timer/countdown-timer";
import { useDispatch, useSelector } from "react-redux";
import { handleTimerCode } from "../../../redux/actions/actions";


function ForgetForm({backToLogin}: any) {
  const [confirm, setConfirm] = useState<any>(null)
  const [changePass, setChangePass] = useState<any>(null)
  const [show, setShow] = useState<any>(false);
  const timerCode = useSelector((state: any) => state.timerCode);


  const dispatch = useDispatch();
  const resendVerifyCode = async () => {
    const res = await sendVerificationCode(forgetFormik.values.mobile);
    if (!(res instanceof Error)) {
      dispatch(handleTimerCode(true));
      setConfirm(true);
    } else {
      toast.error("ارسال کد با خطا مواجه شد");
    }
  }

  const validation = yup.object({
    mobile: yup
        .string()
        .required('نباید خالی باشد')
        .test("شماره موبایل باید 11 رقمی باشد", "شماره موبایل باید 11 رقمی باشد", function (value = '') {
          return value.toString().replace('_', '').length === 11;
        }),
  })

  const validationChange = yup.object({
    ConfirmPassword: yup
        .string()
        .required('نباید خالی باشد')
        .test("رمزها با هم تطابق ندارند", "رمزها با هم تطابق ندارند", function (value = '') {
          return value === this.parent.NewPassword
        }),
    NewPassword: yup
        .string()
        .required('نباید خالی باشد'),
  })

  const forgetFormik = useFormik({
    initialValues: ({
      mobile: '',
    }),
    validationSchema: validation,
    onSubmit: async ({mobile}) => {
      const res = await sendSmsForgetPassword(mobile)
      if (!(res instanceof Error)) {
        setConfirm(true);
        dispatch(handleTimerCode(true));
        toast.success('کد تایید برای شما ارسال شد')
      } else {
        toast.error('ارسال کد تایید با خطا مواجه شد')
      }
    }
  })

  const confirmFormik = useFormik({
    initialValues: ({
      code: ''
    }),
    onSubmit: async ({code}) => {
      await confirmFormik.setValues({ code: '' });
      if (timerCode) {
        const res = await checkSmsForgetPassword(forgetFormik.values.mobile, code)
        if (!(res instanceof Error)) {
          setChangePass(res)
        } else {
          toast.error('کد تایید نامعتبر است')
        }
      } else {
        toast.error('کد تایید شما منقضی شده است');
      }
    }
  })

  const changeFormik = useFormik({
    initialValues: ({
      ConfirmPassword: '',
      NewPassword: ''
    }),
    validationSchema: validationChange,
    onSubmit: async ({NewPassword, ConfirmPassword}) => {
      const res = await changePassword({NewPassword, ConfirmPassword, UserId: changePass})
      if (!(res instanceof Error)) {
        setChangePass(null)
        backToLogin()
        toast.success('رمز عبور با موفقیت تغییر یافت')
      } else {
        toast.error('تغییر رمز عبور با خطا مواجه شد')
      }
    }
  })


  return (
      <>
        {!confirm ?
            <form noValidate onSubmit={forgetFormik.handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <InputMask
                      mask="09999999999"
                      value={forgetFormik.values.mobile}
                      onChange={({target}: any) => forgetFormik.setFieldValue('mobile', target.value)}
                  >
                    {() => <TextField
                        label={'شماره موبایل'}
                        name={'mobile'}
                        error={forgetFormik.touched.mobile && Boolean(forgetFormik.errors.mobile)}
                        required
                        fullWidth
                    />}
                  </InputMask>
                </Grid>
                <Grid item xs={12}>
                  <Button variant={'text'} size={'small'} onClick={backToLogin}>
                    بازگشت به ورود
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button size={'large'} fullWidth color={'primary'} variant={'contained'} type={'submit'}>
                    تایید
                  </Button>
                </Grid>
              </Grid>
            </form>
            :
            <form noValidate onSubmit={confirmFormik.handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                      name={'code'}
                      value={confirmFormik.values.code}
                      onChange={confirmFormik.handleChange}
                      label={'کد تایید'}
                      error={confirmFormik.touched.code && Boolean(confirmFormik.errors.code)}
                      required
                      fullWidth
                  />
                </Grid>
                <Grid item xs={8}>
                  <Button variant={'text'} size={'small'} onClick={() => setConfirm(false)}>
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
                  <Button size={'large'} fullWidth color={'primary'} variant={'contained'} type={'submit'}>
                    تایید
                  </Button>
                </Grid>
              </Grid>
            </form>}
        {changePass ?
            <ModalIpa
                open={!!changePass}
                title={'تغییر رمز عبور'}
                onClose={() => {
                  setChangePass(false)
                }}
            >
              <form noValidate onSubmit={changeFormik.handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                        name={'NewPassword'}
                        value={changeFormik.values.NewPassword}
                        onChange={changeFormik.handleChange}
                        label={'رمز جدید'}
                        type={show ? "text" : "password"}
                        error={changeFormik.touched.NewPassword && Boolean(changeFormik.errors.NewPassword)}
                        required
                        fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                        name={'ConfirmPassword'}
                        value={changeFormik.values.ConfirmPassword}
                        onChange={changeFormik.handleChange}
                        label={'تکرار رمز جدید'}
                        type={show ? "text" : "password"}
                        error={changeFormik.touched.ConfirmPassword && Boolean(changeFormik.errors.ConfirmPassword)}
                        required
                        fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormGroup>
                      <FormControlLabel
                        control={<Checkbox checked={show} onChange={({ target }) => setShow(target.checked)} />}
                        label={"نمایش رمز"}
                      />
                    </FormGroup>
                  </Grid>
                  <Grid item xs={12}>
                    <Button size={'large'} fullWidth color={'primary'} variant={'contained'} type={'submit'}>
                      تغییر رمز عبور
                    </Button>
                  </Grid>
                </Grid>
              </form>

            </ModalIpa>
            : null}
      </>
  )

}


export {ForgetForm}