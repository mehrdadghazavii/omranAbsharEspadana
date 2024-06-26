import {Alert, Box, Button, Grid, MenuItem, Paper, TextField, Tooltip} from "@mui/material";
import {atmospheres, climates} from "../../../../utils/weather.utils";
import * as Yup from "yup";
import {useFormik} from "formik";
import {
  deleteWeather, getVerifiedForBadge,
  getWeatherByProjectId,
  postWeather,
  putWeather,
  rejectDailyReports,
  verifyWeather
} from "../../../../api/api";
import {toast} from "react-toastify";
import {useParams} from "react-router-dom";
import weatherImg from "asset/images/weather.webp";
import React, {useEffect, useState} from "react";
import {rejectApiTypes} from "../../../../utils/rejectApiType";
import {useDispatch, useSelector} from "react-redux";
import {handleSetVerifiedBadge} from "../../../../redux/actions/actions";

function WeatherReportDailyPage({ date }: any) {
  const { projectId }: { projectId: string } = useParams();
  const dispatch = useDispatch();

  const [weather, setWeather] = useState<any>(null);
  const userType = useSelector((state: any) => state.userAccess?.userType);

  const getWeather = async () => {
    const res: any = await getWeatherByProjectId(projectId, date);
    if (!(res instanceof Error)) {
      setWeather(res);
    }
  };
  useEffect(() => {
    formik.handleReset(1);
    setWeather(null);
    getAllNeedData();
  }, [date]);

  useEffect(() => {
    if (weather) {
      formik.setValues({
        Climate: weather.climate,
        Atmosphere: weather.atmosphere,
        MinDegree: weather.minDegree,
        MaxDegree: weather.maxDegree,
        Date: weather.date,
        ReportDate: weather.reportDate,
        LastUserLevel: weather.lastUserLevel,
        Description: weather.description,
        ProjectId: weather.projectId,
      });
    }
    updateVerifiedBadge();
  }, [weather]);

  const getAllNeedData = async () => {
    await getWeather();
  };


  const validation = Yup.object({
    MaxDegree: Yup.number()
      .required("نباید خالی باشد")
      .test("حداکثر درجه باید از حداقل درجه بزرگتر باشد", "حداکثر درجه باید از حداقل درجه بزرگتر باشد", function (value) {
        return +value > +this.parent.MinDegree;
      }),
    MinDegree: Yup.number()
      .required("نباید خالی باشد")
      .test("حداکثر درجه باید از حداقل درجه بزرگتر باشد", "حداکثر درجه باید از حداقل درجه بزرگتر باشد", function (value) {
        return +value < +this.parent.MaxDegree;
      }),
  });

  const formik = useFormik({
    initialValues: {
      Climate: 1,
      Atmosphere: 1,
      MinDegree: 0,
      MaxDegree: 0,
      Date: date,
      LastUserLevel: 1,
      ReportDate: date,
      Description: "",
      ProjectId: projectId,
    },
    validationSchema: validation,
    onSubmit: async (values, { resetForm }) => {
      values.ReportDate = date;
      if (!weather) {
        const res = await postWeather(values);
        if (!(res instanceof Error)) {
          toast.success("آب و هوا با موفقیت درج شد");
          // search(keySearch)
          await getWeather();
        } else {
          toast.error("درج آب و هوا با خطا مواجه شد");
        }
      } else {
        const res = await putWeather({ ...values, Id: weather.id }, weather.id);
        if (!(res instanceof Error)) {
          toast.success("آب و هوا با موفقیت ویرایش شد");
          // search(keySearch)
          await getWeather();
        } else {
          toast.error("ویرایش آب و هوا با خطا مواجه شد");
        }
      }
    },
  });

  const handleVerifyWeather = async () => {
    const res = await verifyWeather(weather.id, projectId);
    if (!(res instanceof Error)) {
      toast.success("آب و هوا با موفقیت تایید شد");
      setWeather(res);
    } else {
      toast.error("ویرایش آب و هوا با خطا مواجه شد");
    }
  };

  const handleReject = async () => {
    const res = await rejectDailyReports(weather.id, rejectApiTypes.Weather,projectId);
    if (!(res instanceof Error)) {
      setWeather(res);
      formik.handleReset(1);
      toast.success("گزارش رد و به سطح قبلی ارجاع داده شد");
    } else {
      toast.error("خطا در رَد گزارش")
    }
  }

  const handleDeleteWeather = async () => {
    const res = await deleteWeather(weather.id, projectId);
    if (!(res instanceof Error)) {
      setWeather(null);
      formik.handleReset(1);
      toast.success("آب و هوا با موفقیت حذف گردید");
    } else {
      toast.error("حذف آب و هوا با خطا مواجه شد");
    }
  };

  const updateVerifiedBadge = async () => {
    if (projectId) {
      const res = await getVerifiedForBadge(projectId, date);
      if (!(res instanceof Error)) {
        dispatch(handleSetVerifiedBadge(res));
      }
    }
  }

  return (
    <Paper
      style={{
        maxWidth: 700,
        marginRight: "auto",
        marginLeft: "auto",
      }}
    >
      <Box mx={2} pb={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} style={{ textAlign: "center" }}>
            <img src={weatherImg} alt="weather" width={150} />
          </Grid>
        </Grid>
        {!weather && userType > 1?
            <Alert severity="error" sx={{justifyContent: 'center', mx: "auto", mt: 1.5}}>
              در این تاریخ گزارش آب و هوایی ثبت نشده است.
            </Alert>
            : (
                <form onSubmit={formik.handleSubmit} noValidate>
                  <Box mx={2} pb={2}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                            label={"وضعیت آب و هوا"}
                            select
                            fullWidth
                            name={"Climate"}
                            variant={"outlined"}
                            value={formik.values.Climate}
                            onChange={(e) => formik.setFieldValue("Climate", e.target.value)}
                            error={formik.touched.Climate && Boolean(formik.errors.Climate)}
                            helperText={formik.touched.Climate && formik.errors.Climate}
                        >
                          {Object.keys(climates).map((keyC) => (
                              <MenuItem key={keyC} value={keyC}>
                                {climates[keyC]}
                              </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                            label={"وضعیت جوی"}
                            name="Atmosphere"
                            select
                            fullWidth
                            variant={"outlined"}
                            value={formik.values.Atmosphere}
                            onChange={(e) => formik.setFieldValue("Atmosphere", e.target.value)}
                            error={formik.touched.Atmosphere && Boolean(formik.errors.Atmosphere)}
                            helperText={formik.touched.Atmosphere && formik.errors.Atmosphere}
                        >
                          {Object.keys(atmospheres).map((keyA) => (
                              <MenuItem key={keyA} value={keyA}>
                                {atmospheres[keyA]}
                              </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                            label={"توضیحات"}
                            variant={"outlined"}
                            multiline
                            fullWidth
                            minRows={3}
                            name="Description"
                            value={formik.values.Description}
                            onChange={(e) => formik.setFieldValue("Description", e.target.value)}
                            error={formik.touched.Description && Boolean(formik.errors.Description)}
                            helperText={formik.touched.Description && formik.errors.Description}
                        />
                      </Grid>
                      <Grid item sm={6} xs={12}>
                        <TextField
                            label={<>حداکثر دما &#160; &#8593;</>}
                            variant={"outlined"}
                            type={"number"}
                            fullWidth
                            name="MaxDegree"
                            value={formik.values.MaxDegree}
                            onChange={(e) => formik.setFieldValue("MaxDegree", e.target.value)}
                            error={formik.touched.MaxDegree && Boolean(formik.errors.MaxDegree)}
                            helperText={formik.touched.MaxDegree && formik.errors.MaxDegree}
                        />
                      </Grid>
                      <Grid item sm={6} xs={12}>
                        <TextField
                            label={<>حداقل دما &#160; &darr;</>}
                            variant={"outlined"}
                            type={"number"}
                            fullWidth
                            name="MinDegree"
                            value={formik.values.MinDegree}
                            onChange={(e) => formik.setFieldValue("MinDegree", e.target.value)}
                            error={formik.touched.MinDegree && Boolean(formik.errors.MinDegree)}
                            helperText={formik.touched.MinDegree && formik.errors.MinDegree}
                        />
                      </Grid>
                      {userType === 1 && (
                          <>
                            {!weather ? (
                                <Grid item xs={12}>
                                  <Button fullWidth type={"submit"} variant={"contained"} color={"primary"}>
                                    ثبت
                                  </Button>
                                </Grid>
                            ) : weather?.lastUserLevel === weather?.verify ? (
                                    <Grid item xs={12}>
                                      <Button fullWidth variant={"contained"} color={"secondary"}>
                                        تایید شده
                                      </Button>
                                    </Grid>
                                )
                                : (
                                    <>
                                      <Grid item sm={4} xs={12}>
                                        <Button onClick={handleVerifyWeather} fullWidth variant={"contained"}
                                                color={"primary"}>
                                          تایید
                                        </Button>
                                      </Grid>
                                      <Grid item sm={4} xs={12}>
                                        <Button fullWidth type={"submit"} variant={"contained"} color={"info"}>
                                          ویرایش
                                        </Button>
                                      </Grid>
                                      <Grid item onClick={handleDeleteWeather} sm={4} xs={12}>
                                        <Button fullWidth variant={"contained"} color={"error"}>
                                          حذف
                                        </Button>
                                      </Grid>
                                    </>
                                )
                            }
                          </>
                      )}
                      {userType > 1 && (weather?.lastUserLevel === weather?.verify ? (
                              <Grid item xs={12}>
                                <Button fullWidth variant={"contained"} color={"secondary"}>
                                  تایید شده
                                </Button>
                              </Grid>
                          ) : (
                              <>
                                <Grid item xs={5} style={{marginLeft: 'auto'}}>
                                  <Button onClick={handleVerifyWeather} fullWidth variant={"contained"}
                                          color={"primary"}>
                                    تایید
                                  </Button>
                                </Grid>
                                <Grid item xs={5} style={{marginRight: 'auto'}}>
                                  <Tooltip title="گزارش جهت بررسی و اصلاح به سطح قبل باز می گردد!">
                                    <Button onClick={handleReject} fullWidth variant={"contained"} color={"error"}>
                                      رد
                                    </Button>
                                  </Tooltip>
                                </Grid>
                              </>
                          )
                      )}
                    </Grid>
                  </Box>
                </form>
            )}
      </Box>
    </Paper>
  );
}

export { WeatherReportDailyPage };
