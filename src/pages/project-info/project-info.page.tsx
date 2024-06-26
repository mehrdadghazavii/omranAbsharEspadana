import {Box, Button, Grid, IconButton, Paper} from "@mui/material";
import { withRouter, useParams } from "react-router-dom";
import { connect, useSelector } from "react-redux";
import {DatePicker, DateValidationError} from "@mui/x-date-pickers";
import { AdapterDateFnsJalali } from "@mui/x-date-pickers/AdapterDateFnsJalali";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import React, {useEffect} from "react";
import { SET_END_DATE, SET_IN_PROJECT, SET_START_DATE } from "../../redux/types/type";
import moment from "jalali-moment";
import { ReportDailyPages } from "../../utils/report-daily-pages";
import { ReportCMPPages } from "../../utils/report-comprehensive-pages.utils";
import { ReportSummaryPages } from "../../utils/report-summary-pages.utils";
import { ManageUserProjectPage } from "../projects";
import {Message, PictureAsPdf} from "@mui/icons-material";
import {getCompanies, getPdfDailyReport} from "../../api/api";
import { CopyReport } from "./components/copy-report.component";
import { userTypes } from "../../utils/user-types";
import { actionCompany, actionSetProject } from "../../redux/actions/actions";
import { CopyItemReport } from "./components/copy-item-report.component";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ProjectInfoIconStyle from "../../components/project-info-icon-style/project-info-icon-style";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TimelapseIcon from "@mui/icons-material/Timelapse";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ProjectCalender from "../projects/calender/project-calender.page";

function ProjectInfoPage({ setProject, setCompany, setStartDate, unSetInProject, setInProject, history, setEndDate }: any) {
  const userAccess = useSelector((state: any) => state.userAccess);
  const project = useSelector((state: any) => state.project);
  const company = useSelector((state: any) => state.company);
  const currentTab = useSelector((state: any) => state.currentTab);
  const startDate = useSelector((state: any) => state.startDate);
  const endDate = useSelector((state: any) => state.endDate);
  const currentPage = useSelector((state: any) => state.currentPage);
  const userType = useSelector((state: any) => state.userAccess?.userType);
  const allowToAddUser = useSelector((state: any) => state.userAccess?.allowToAddUser);

  const { companyId, projectId } = useParams();

  const getNeededDataAfterRefresh = async () => {
    const res: any = await getCompanies();
    return res.find((company: any) => company.id === companyId);
  };

  useEffect(() => {
    if (!project) {
      setProject(projectId);
      getNeededDataAfterRefresh().then((res) => {
        setCompany(res);
      });
    }
    setInProject();
    //TODO should be test
    return () => unSetInProject();
  }, []);


  const handleDownloadPdfFile = async () => {
    const res = await getPdfDailyReport(project.id, startDate);
    if (!(res instanceof Error)) {
      const a = document.createElement("a");
      a.target = "_blank";

      a.href = res.toString();
      a.download = res.toString();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <>
      <IconButton
        onClick={() => history.push(`/messages/project/${project.id}`)}
        sx={{
          position: "fixed",
          right: 15,
          bottom: 10,
          zIndex: 1,
        }}
        disabled={!userAccess?.readMessageAccess}
        color={"primary"}
      >
        <Message sx={{ fontSize: 40 }} />
      </IconButton>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper>
            <Box px={1} py={3} sx={{ p: {lg: 3} }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6} lg={3}>
                  <ProjectInfoIconStyle
                    title={"شرکت"}
                    titleValue={company?.name}
                    icon={<ApartmentIcon sx={{ fontSize: "32px" }} />}
                    fullWidthInLg={true}
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <ProjectInfoIconStyle
                    title={"پروژه"}
                    titleValue={project?.name}
                    icon={<AssessmentIcon sx={{ fontSize: "32px" }} />}
                    fullWidthInLg={true}
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <ProjectInfoIconStyle
                    title={"روزهای باقی مانده"}
                    titleValue={company?.leftDay}
                    icon={<TimelapseIcon sx={{ fontSize: "32px" }} />}
                    fullWidthInLg={true}
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <ProjectInfoIconStyle
                      title={"سطح کاربر"}
                      titleValue={userTypes[userAccess?.userType] ?? ''}
                      icon={<AdminPanelSettingsIcon sx={{ fontSize: "32px" }} />}
                      fullWidthInLg={true}
                  />
                </Grid>
              </Grid>
            </Box>
            {/*<Divider variant={"fullWidth"} />*/}
            <Box px={1} py={3} sx={{ p: {lg: 3} }}>
              <Grid container spacing={2}>
                {/*<Grid item lg={3} md={4} sm={6} xs={12}>*/}
                {/*  <ProjectInfoIconStyle*/}
                {/*    title={"کارفرما"}*/}
                {/*    titleValue={project?.master}*/}
                {/*    icon={<EngineeringIcon sx={{ fontSize: "32px" }} />}*/}
                {/*    fullWidthInLg={true}*/}
                {/*  />*/}
                {/*</Grid>*/}
                {/*<Grid item lg={3} md={4} sm={6} xs={12}>*/}
                {/*  <ProjectInfoIconStyle*/}
                {/*    title={"ناظر"}*/}
                {/*    titleValue={project?.monitoring}*/}
                {/*    icon={<HowToRegIcon sx={{ fontSize: "32px" }} />}*/}
                {/*    fullWidthInLg={true}*/}
                {/*  />*/}
                {/*</Grid>*/}
                {/*/!*<Grid item lg={3} md={4} sm={6} xs={12}>*!/*/}
                {/*/!*  <ProjectInfoIconStyle*!/*/}
                {/*/!*    title={"روزهای باقی مانده"}*!/*/}
                {/*/!*    titleValue={company?.leftDay}*!/*/}
                {/*/!*    icon={<TimelapseIcon sx={{ fontSize: "32px" }} />}*!/*/}
                {/*/!*    fullWidthInLg={true}*!/*/}
                {/*/!*  />*!/*/}
                {/*/!*</Grid>*!/*/}
                {/*<Grid item lg={3} md={4} sm={6} xs={12}>*/}
                {/*  <ProjectInfoIconStyle*/}
                {/*    title={"کاربر"}*/}
                {/*    titleValue={`${userInfo?.firstName}${userInfo?.lastName}`}*/}
                {/*    icon={<PersonIcon sx={{ fontSize: "32px" }} />}*/}
                {/*    fullWidthInLg={true}*/}
                {/*  />*/}
                {/*</Grid>*/}
                {/*<Grid item lg={3} md={4} sm={6} xs={12}>*/}
                {/*  <ProjectInfoIconStyle*/}
                {/*    title={"سطح کاربر"}*/}
                {/*    titleValue={`${userTypes[userAccess?.userType]}`}*/}
                {/*    icon={<AdminPanelSettingsIcon sx={{ fontSize: "32px" }} />}*/}
                {/*    fullWidthInLg={true}*/}
                {/*  />*/}
                {/*</Grid>*/}
                <Grid item xs={12} sx={{ ml: "auto" }}>
                  {currentTab === 0 ? (
                    <Grid alignItems={"center"} container spacing={2} justifyContent={"flex-end"}>
                      <Grid item lg={2} xs={6}>
                        <Button size={"large"} color={"primary"} fullWidth variant={"outlined"} onClick={handleDownloadPdfFile} >
                          PDF
                          <PictureAsPdf sx={{ ml: 1 }}/>
                        </Button>
                      </Grid>
                      {userType === 1 ? (
                        <Grid item lg={2} xs={6}>
                          <CopyReport project={project} />
                        </Grid>
                      ) : null}
                    </Grid>
                  ) : null}
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Grid container justifyContent={currentTab === 0 && "space-between"} spacing={2}>
            {currentTab !== 5 && currentTab !== 3 ? (
                <Grid item lg={4} md={6} xs={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFnsJalali} dateFormats={{ monthShort: 'MMMM' }}>
                    <DatePicker
                        value={new Date(startDate)}
                        views={['year', 'month', 'day']}
                        onChange={(newValue: any) =>
                            moment(newValue, "YYYY/MM/DD").isValid() && setStartDate(moment(newValue).locale("en").format("YYYY-MM-DD"))
                        }
                        sx={{ width: "100%" }}
                    />
                  </LocalizationProvider>
                </Grid>
            ) : null}
            {currentTab === 0 && userType === 1 ? (
                <Grid item lg={8} md={6} xs={12}>
                  <Grid container alignItems={"center"} justifyContent={"flex-end"}>
                    <Grid item xs={12} sm={5} lg={3}>
                      <CopyItemReport project={project} />
                    </Grid>
                  </Grid>
                </Grid>
            ) : null}
            {[1, 2].includes(currentTab) ? (
              <Grid item lg={4} md={6} xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFnsJalali} dateFormats={{ monthShort: 'MMMM' }}>
                  <DatePicker
                      minDate={new Date(startDate)}
                      value={new Date(endDate)}
                      views={["year", "month", "day"]}
                      onChange={(newValue: any) =>
                          moment(newValue, "YYYY/MM/DD").isValid() && setEndDate(moment(newValue).locale("en").format("YYYY-MM-DD"))
                      }
                      sx={{width: "100%"}}
                  />
                </LocalizationProvider>
              </Grid>
            ) : null}
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Box mt={2}>
            {currentTab === 0 ? <ReportDailyPages page={currentPage} date={startDate} /> : null}
            {currentTab === 1 ? <ReportCMPPages page={currentPage} startDate={startDate} endDate={endDate} /> : null}
            {currentTab === 2 ? <ReportSummaryPages page={currentPage} startDate={startDate} endDate={endDate} /> : null}
            {currentTab === 3 ? <ProjectCalender startDate={startDate} /> : null}
            {currentTab === 5 && allowToAddUser ? <ManageUserProjectPage /> : null}
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

const mapStateToProps = (state: any) => {
  return {
    userAccess: state.userAccess,
    project: state.project,
    company: state.company,
    currentTab: state.currentTab,
    startDate: state.startDate,
    endDate: state.endDate,
    currentPage: state.currentPage,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setStartDate: (value: string) => dispatch({ type: SET_START_DATE, data: value }),
    setEndDate: (value: string) => dispatch({ type: SET_END_DATE, data: value }),
    unSetInProject: () => dispatch({ type: SET_IN_PROJECT, data: false }),
    setInProject: () => dispatch({ type: SET_IN_PROJECT, data: true }),
    setProject: async (value: any) => dispatch(await actionSetProject(value)),
    setCompany: (value: any) => dispatch(actionCompany(value)),
  };
};

const reduxPage = connect(mapStateToProps, mapDispatchToProps)(withRouter(ProjectInfoPage));

export { reduxPage as ProjectInfoPage };
