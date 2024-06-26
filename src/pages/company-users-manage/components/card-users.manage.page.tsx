import {Box, Button, Divider, FormControlLabel, FormGroup, Grid, Paper, Switch, Typography} from "@mui/material";
import React from "react";
import {Delete, Edit} from "@mui/icons-material";

export interface CardUsrMngProps {
  "applicationUserId": string,
  "companyId": string,
  "projectManagement": boolean,
  "readMessageAccess": boolean,
  "writeMessageAccess": boolean,
  "userManagement": boolean,
  "firstName": string,
  "lastName": string,
  "phoneNumber": string,
  onDelete: Function,
  onEdit: Function
}


export function CardUserCompany({
                                  applicationUserId,
                                  companyId,
                                  projectManagement,
                                  readMessageAccess,
                                  writeMessageAccess,
                                  userManagement,
                                  firstName,
                                  lastName,
                                  phoneNumber,
                                  onDelete,
                                  onEdit
                                }: CardUsrMngProps) {

  const [state, setState] = React.useState({
    projectManagement,
    readMessageAccess,
    writeMessageAccess,
    userManagement,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      [event.target.name]: event.target.checked,
    });
  };

  return (
      <Paper>
        <Box px={2} py={1} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Typography>
            {firstName} {lastName}
          </Typography>
          <Button component={'a'} href={`tel:${phoneNumber}`} variant={"text"}>
            {phoneNumber}
          </Button>
        </Box>
        <Divider variant={'fullWidth'}/>
        <Box px={2} py={1}>
          <FormGroup>
            <Grid container spacing={3}>
              <Grid item sm={6} xs={12}>
                <FormControlLabel
                    control={
                      <Switch checked={state.projectManagement} onChange={handleChange} name="projectManagement"/>
                    }
                    label="مدیریت پروژه"
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControlLabel
                    control={
                      <Switch checked={state.userManagement} onChange={handleChange} name="userManagement"/>
                    }
                    label="مدیریت کاربران"
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControlLabel
                    control={
                      <Switch checked={state.readMessageAccess} onChange={handleChange} name="readMessageAccess"/>
                    }
                    label="مشاهده پیام"
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControlLabel
                    control={
                      <Switch checked={state.writeMessageAccess} onChange={handleChange} name="writeMessageAccess"/>
                    }
                    label="ارسال پیام"
                />
              </Grid>
            </Grid>
          </FormGroup>
        </Box>
        <Divider variant={'fullWidth'}/>
        <Box px={2} py={1}>
          <Button color={'success'} variant={'contained'}
                  sx={{
                    marginRight: 1
                  }}
                  disabled={
                    state.userManagement === userManagement &&
                    state.writeMessageAccess === writeMessageAccess &&
                    state.readMessageAccess === readMessageAccess &&
                    state.projectManagement === projectManagement
                  }
                  onClick={() => onEdit({
                    ...state,
                    applicationUserId,
                    companyId
                  }, applicationUserId)}>
            <Edit/>
            &#160;
            ویرایش
          </Button>
          {/*// @ts-ignore*/}
          <Button color={'error'} variant={'contained'} onClick={() => onDelete()}>
            <Delete/>
            &#160;
            حذف
          </Button>
        </Box>
      </Paper>
  )
}