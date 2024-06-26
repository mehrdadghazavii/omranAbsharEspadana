import {Box, Button, FormControlLabel, Grid, Paper, Switch, TextField} from "@mui/material";
import React, {FormEvent, useEffect, useState} from "react";
import {
  deleteCompanyUser,
  getCompanyUsers,
  getUserByPhoneNumber,
  postCompanyUser,
  PostOrPutCmpUsrData,
  putCompanyUser
} from "../../api/api";
import {useParams} from "react-router-dom";
import {toast} from "react-toastify";
import {CardUserCompany} from "./components/card-users.manage.page";
import {ButtonsModal, ModalIpa} from "components";
import InputMask from 'react-input-mask';
import {Search} from "@mui/icons-material";
import {useFormik} from "formik";


export function CompanyUsersManagePage() {
  const [users, setUsers] = useState<any>([])
  const [deleteUser, setDeleteUser] = useState<any>(null)
  const [mobile, setMobile] = useState<any>('')
  const [addUser, setAddUser] = useState<any>(null)
  const {companyId} = useParams()

  const addFormik = useFormik({
    initialValues: ({
      ProjectManagement: false,
      ReadMessageAccess: false,
      WriteMessageAccess: false,
      UserManagement: false,
    }),
    onSubmit: async ({
                       ProjectManagement,
                       ReadMessageAccess,
                       WriteMessageAccess,
                       UserManagement
                     }, {resetForm}) => {
      const res = await postCompanyUser({
        ProjectManagement,
        ReadMessageAccess,
        WriteMessageAccess,
        UserManagement,
        ApplicationUserId: addUser.id,
        CompanyId: companyId
      })

      if (!(res instanceof Error)) {
        const name = addUser.firstName + " " + addUser.lastName + ' ';
        toast.success(name + 'با موفقیت به شرکت اضافه شد')
        setAddUser(null)
        resetForm()
        getAllNeedData()
      } else {
        toast.error('درج کاربر با خطا مواجه شد')
      }
    }
  })

  const getAllNeedData = async () => {
    const res = await getCompanyUsers(companyId)
    if (!(res instanceof Error)) {
      setUsers(res)
    } else {
      toast.error('دریافت داده با خطا مواجه شد')
    }
  }
  useEffect(() => {
    getAllNeedData()
  }, [])

  const handleDeleteUser = async (e: FormEvent) => {
    e.preventDefault()
    const res = await deleteCompanyUser(deleteUser, companyId)
    if (!(res instanceof Error)) {
      setDeleteUser(false)
      setUsers(users.filter(user => user.id !== deleteUser));
      toast.success('کاربر با موفقیت حذف گردید')
      await getAllNeedData()
    } else {
      toast.error('حذف کاربر با خطا مواجه شد')
    }
  }

  const handleEditUser = async (data: PostOrPutCmpUsrData, companyId: string) => {
    const res = await putCompanyUser(data, companyId)
    if (!(res instanceof Error)) {
      setDeleteUser(false)
      toast.success('کاربر با موفقیت ویرایش یافت')
      await getAllNeedData()
    } else {
      toast.error('ویرایش کاربر با خطا مواجه شد')
    }
  }

  const handleSearchUser = async (e: FormEvent) => {
    e.preventDefault()
    const res = await getUserByPhoneNumber(mobile.replace(' ', ''))
    if (!(res instanceof Error)) {
      setAddUser(res)
    } else {
      toast.error('کاربری با این شماره موبایل یافت نشد')
    }
  }

  return (
      <>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper>
              <Box py={2} px={1}>
                <form onSubmit={handleSearchUser}>
                  <Grid container alignItems={'center'} style={{maxWidth: 700}}>
                    <Grid item sm={9} xs={12}>
                      <InputMask
                          mask="09999999999"
                          value={mobile}
                          onChange={({target}: any) => setMobile(target.value)}
                      >
                        {() => <TextField
                            label={'شماره موبایل'}
                            size={'small'}
                            required
                            fullWidth
                        />}
                      </InputMask>
                    </Grid>
                    <Grid item sm={3} xs={12}>
                      <Button sx={{marginLeft: {sm: 1}, marginTop: {sm:0, xs:1}}} size={'large'} fullWidth variant={'contained'} type={'submit'}>
                        <Search/>
                        &#160;
                        جست و جو
                      </Button>
                    </Grid>

                  </Grid>
                </form>
              </Box>
            </Paper>
          </Grid>
          {users.map((U: any) => (
                  <Grid key={U.applicationUserId} item lg={3} md={4} sm={6} xs={12}>
                    <CardUserCompany
                        applicationUserId={U.applicationUserId}
                        companyId={U.companyId}
                        projectManagement={U.projectManagement}
                        readMessageAccess={U.readMessageAccess}
                        writeMessageAccess={U.writeMessageAccess}
                        userManagement={U.userManagement}
                        firstName={U.firstName}
                        lastName={U.lastName}
                        phoneNumber={U.phoneNumber}
                        onDelete={() => setDeleteUser(U.applicationUserId)}
                        onEdit={handleEditUser}/>
                  </Grid>
              )
          )}
        </Grid>
        {!!addUser ?
            <ModalIpa
                open={!!addUser}
                title={addUser.firstName + " " + addUser.lastName}
                onClose={() => setAddUser(false)}
            >
              <form onSubmit={addFormik.handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormControlLabel
                        control={
                          <Switch checked={addFormik.values.ProjectManagement} onChange={addFormik.handleChange}
                                  name="ProjectManagement"/>
                        }
                        label="مدیریت پروژه"
                    />
                  </Grid>
                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormControlLabel
                        control={
                          <Switch checked={addFormik.values.UserManagement} onChange={addFormik.handleChange}
                                  name="UserManagement"/>
                        }
                        label="مدیریت کاربران"
                    />
                  </Grid>
                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormControlLabel
                        control={
                          <Switch checked={addFormik.values.ReadMessageAccess} onChange={addFormik.handleChange}
                                  name="ReadMessageAccess"/>
                        }
                        label="مشاهده پیام"
                    />
                  </Grid>
                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormControlLabel
                        control={
                          <Switch checked={addFormik.values.WriteMessageAccess} onChange={addFormik.handleChange}
                                  name="WriteMessageAccess"/>
                        }
                        label="ارسال پیام"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ButtonsModal onClose={() => {
                      setAddUser(null)
                      addFormik.handleReset(1)
                    }} textSubmit={'اضافه'} textClose={'انصراف'}/>
                  </Grid>
                </Grid>

              </form>

            </ModalIpa>
            : null}
        {deleteUser ?
            <ModalIpa
                open={!!deleteUser}
                onClose={() => setDeleteUser(false)}
                title='آیا از حذف کاربر مطمئن هستید؟'>
              <form onSubmit={handleDeleteUser}>
                <Grid container>
                  <Grid item xs={12}>
                    <ButtonsModal onClose={() => setDeleteUser(false)} textSubmit={'حذف'} textClose={'انصراف'}/>
                  </Grid>
                </Grid>
              </form>
            </ModalIpa>
            : null}
      </>
  )
}