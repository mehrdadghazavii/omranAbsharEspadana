import React from "react";
import { Button, Checkbox, FormControlLabel, FormGroup, Grid, TextField } from "@mui/material";
import * as yup from "yup";
import { useFormik } from "formik";
import { changePassword } from "../../../api/api";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

function ChangePassComponent() {
  const [show, setShow] = React.useState<null | boolean>(false);
  const user = useSelector((state: any) => state.user);

  const validationChange = yup.object({
    ConfirmPassword: yup
      .string()
      .required("نباید خالی باشد")
      .test("رمزها با هم تطابق ندارند", "رمزها با هم تطابق ندارند", function (value = "") {
        return value === this.parent.NewPassword;
      }),
    NewPassword: yup.string().required("نباید خالی باشد"),
  });

  const changeFormik = useFormik({
    initialValues: {
      NewPassword: "",
      ConfirmPassword: "",
      UserId: user.id,
    },
    validationSchema: validationChange,
    onSubmit: async ({ NewPassword, ConfirmPassword, UserId }) => {
      const res = await changePassword({ NewPassword, ConfirmPassword, UserId });
      if (!(res instanceof Error)) {
        changeFormik.setValues({
          NewPassword: "",
          ConfirmPassword: "",
          UserId: user.id,
        });
        toast.success("رمز عبور با موفقیت تغییر یافت");
      } else {
        toast.error("تغییر رمز عبور با خطا مواجه شد");
      }
    },
  });
  return (
    <>
      <form noValidate onSubmit={changeFormik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              name={"NewPassword"}
              value={changeFormik.values.NewPassword}
              onChange={changeFormik.handleChange}
              label={"رمز جدید"}
              type={show ? "text" : "password"}
              error={changeFormik.touched.NewPassword && Boolean(changeFormik.errors.NewPassword)}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name={"ConfirmPassword"}
              value={changeFormik.values.ConfirmPassword}
              onChange={changeFormik.handleChange}
              label={"تکرار رمز جدید"}
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
          <Grid item xs={12} mt={6}>
            <Button size={"large"} fullWidth color={"primary"} variant={"contained"} type={"submit"}>
              تغییر رمز عبور
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  );
}

export default ChangePassComponent;
