import React, {useState} from "react";
import {
  Button,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField
} from "@mui/material";
import {LocalPhone, Visibility, VisibilityOff} from "@mui/icons-material";
import {useFormik} from "formik";
import * as yup from "yup";
import {checkSmsForgetPassword, login, sendVerificationCode} from "../../../api/api";
import {actionLogin, handleTimerCode} from "../../../redux/actions/actions";
import {toast} from "react-toastify";
import {ForgetForm} from "./forget.component";
import {connect, useDispatch, useSelector} from "react-redux";
import {withRouter} from 'react-router-dom'
import CountdownTimer from "../../../components/countdown-timer/countdown-timer";


function LoginForm({history, setLogin}: any) {
  const [showPassword, setShowPassword] = useState(false)
  const [forget, setForget] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const timerCode = useSelector((state: any) => state.timerCode);

  const dispatch = useDispatch();

  function ConfirmPhoneNumber () {

    const resendVerifyCode = async () => {
      const res = await sendVerificationCode(loginFormik.values.username);
      if (!(res instanceof Error)) {
        dispatch(handleTimerCode(true));
        setConfirm(true);
      } else {
        toast.error("ارسال کد با خطا مواجه شد");
      }
    }

    const confirmFormik = useFormik({
      initialValues: ({
        code: ''
      }),
      onSubmit: async ({code}) => {
        await confirmFormik.setValues({ code: '' });
        if (timerCode) {
          const res = await checkSmsForgetPassword(loginFormik.values.username, code)
          if (!(res instanceof Error)) {
            setConfirm(false);
            toast.success("حساب شما با موفقیت فعال شد.");
          } else {
            toast.error('کد تایید نامعتبر است')
          }
        } else {
          toast.error('کد تایید شما منقضی شده است');
        }
      }
    })

    return (
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
        </form>
    )
  }

  const validation = yup.object({
    password: yup
        .string()
        .required('نباید خالی باشد'),
    username: yup
        .string()
        .required('نباید خالی باشد')
        .test("شماره موبایل باید 11 رقمی باشد", "شماره موبایل باید 11 رقمی باشد", function (value = '') {
          return value.toString().length === 11;
        }),
  })

  const loginFormik = useFormik({
    initialValues: ({
      username: '',
      password: ''
    }),
    validationSchema: validation,
    //TODO: need to review
    onSubmit: async (values) => {
      try {
        const {data, status} = await login(values);
        if (status === 200) {
          setLogin(data);
          history.push('/');
        } else if (status === 418) {
          setConfirm(true);
          dispatch(handleTimerCode(true));
          toast.warning("برای ورود شماره همراه خود را تایید کنید");
        } else {
          toast.error('نام کاربری و رمز عبور صحیح نمی باشد');
        }
      } catch (error) {
        console.error('An error occurred:', error);
      }
    }
  })


  return (
      <>
        {forget ? (
            <ForgetForm
                backToLogin={() => setForget(false)}
            />
        ) : confirm ? (
            <ConfirmPhoneNumber/>
        ) : (
            <form noValidate onSubmit={loginFormik.handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel htmlFor="username">موبایل</InputLabel>
                    <OutlinedInput
                        required
                        id="username"
                        fullWidth
                        value={loginFormik.values.username}
                        onChange={loginFormik.handleChange}
                        error={loginFormik.touched.username && Boolean(loginFormik.errors.username)}
                        // helperText={(loginFormik.touched.password && loginFormik.errors.password)}
                        endAdornment={
                          <InputAdornment position="end">
                            {/* <IconButton
                                aria-label="toggle password visibility"
                                edge="end"
                            > */}
                            <LocalPhone/>
                            {/* </IconButton> */}
                          </InputAdornment>
                        }
                        label="مویایل"
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel htmlFor="password">رمز ورود</InputLabel>
                    <OutlinedInput
                        fullWidth
                        required
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={loginFormik.values.password}
                        onChange={loginFormik.handleChange}
                        error={loginFormik.touched.password && Boolean(loginFormik.errors.password)}
                        // helperText={(loginFormik.touched.password && loginFormik.errors.password)}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowPassword((v) => !v)}
                                edge="end"
                            >
                              {showPassword ? <VisibilityOff/> : <Visibility/>}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="رمز ورود"
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Button color={'secondary'} variant={'text'} size={'small'} onClick={() => setForget(true)}>
                    فراموشی رمز عبور
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button size={'large'} fullWidth color={'primary'} variant={'contained'} type={'submit'}>
                    ورود
                  </Button>
                </Grid>
              </Grid>
            </form>
        )}
      </>
  )

}

const mapDispatchToProps = (dispatch: any) => (
    {
      setLogin: (user: any) => dispatch(actionLogin(user))
    }
)

const reduxLogin = connect(null, mapDispatchToProps)(withRouter(LoginForm))


export
{
  reduxLogin as LoginForm
}