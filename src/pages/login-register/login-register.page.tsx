import { Box, Grid, Paper, Tab, Tabs, Typography, useTheme, Button, Card, Link } from "@mui/material";
import { useHistory } from "react-router-dom";
import SwipeableViews from "react-swipeable-views";
import React, { useEffect, useState } from "react";
import { LoginForm } from "./components/login.componet";
import { RegisterForm } from "./components/register.componet";
import { Copyright } from "../../components";
import PwaNotice from "../../components/pwa-notice/pwa-notice";
import useMediaQuery from "@mui/material/useMediaQuery";
import omranLogo from "../../asset/images/OmranAnsharLogo.png";
import PhoneEnabledIcon from "@mui/icons-material/PhoneEnabled";
import ChatIcon from "@mui/icons-material/Chat";

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
      <div
          role="tabpanel"
          hidden={value !== index}
          id={`full-width-tabpanel-${index}`}
          aria-labelledby={`full-width-tab-${index}`}
          {...other}
      >
        {value === index && (
            <Box sx={{ p: 3 }}>
              <Typography>{children}</Typography>
            </Box>
        )}
      </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

export function LoginAndRegisterPage() {
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const [showModal, setShowModal] = useState(null);

  const history = useHistory();

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index: number) => {
    setValue(index);
  };

  const match = useMediaQuery("(max-width:1024px)");
  const lg = useMediaQuery(theme.breakpoints.down("lg"));
  const sm = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    setTimeout(() => {
      setShowModal(true);
    }, 2400);
  }, []);

  return (
      <>
        {match ? <PwaNotice /> : ""}

        <Grid container spacing={3}>
          <Grid item xs={11} mx={"auto"} my={6}>
            <Card
                variant={"outlined"}
                sx={{
                  backgroundImage: `radial-gradient(at ${mousePosition.x}px bottom, #00ACB1 0%, #151e31 50%)`,
                  padding: `1.5rem ${sm ? "10px" : ''}`,
                }}
                onMouseMove={handleMouseMove}
            >
              {/*header*/}
                <img src={omranLogo} alt="omran logo" width={match ? 100 : 150}/>
              {/*content*/}
              <Grid container my={10} spacing={3}>
                <Grid item xs={12} md={7} mx={"auto"}>
                  <Box
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        position: !match ? "absolute" : "unset",
                        top: !match ? 246 : "unset",
                        right: !match ? 200 : "unset",
                      }}
                  >
                    <Box>
                      <Grid container spacing={3}>
                        <Grid item md={6} xs={12} order={1}>
                          <Paper sx={{ backgroundColor: "#f3fffb", minWidth: !lg ? "550px" : "300px" }}>
                            <Tabs
                                value={value}
                                onChange={handleChange}
                                indicatorColor="secondary"
                                textColor="inherit"
                                variant="fullWidth"
                                aria-label="full width tabs"
                            >
                              <Tab label="ورود" {...a11yProps(0)} />
                            </Tabs>
                            <SwipeableViews
                                axis={theme.direction === "rtl" ? "x-reverse" : "x"}
                                index={value}
                                onChangeIndex={handleChangeIndex}
                            >
                              <TabPanel value={value} index={0} dir={theme.direction}>
                                <LoginForm />
                              </TabPanel>
                            </SwipeableViews>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                    <Box
                        m={2}
                        sx={{
                          position: "fixed",
                          bottom: 0,
                          left: 0,
                          right: 0,
                        }}
                    >
                      <Copyright />
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={5} mx={"auto"} textAlign={match ? "center" : 'left'}>
                  <Box>
                    <Typography variant={!match ? "h4" : "h5"} color={"#d8f6ee"} fontWeight={600}>
                      عمران آبشار اسپادانا
                    </Typography>

                    <Typography variant={"h6"} color={"#eefffab8"} fontWeight={400} my={3}>
                      هر پروژه، یک موفقیت ؛ مدیریت پروژه ساختمانی با دقت و نوآوری
                    </Typography>

                    <Link href="tel:03133932292" underline="none">
                      <Typography variant={"h6"} color={"#eefffab8"} fontWeight={400}>
                        <Box display={"inline"} px={2.5}>
                          <PhoneEnabledIcon sx={{ verticalAlign: "sub", color: "#ffffff" }} />
                        </Box>
                        پشتیبانی تلفنی
                      </Typography>
                    </Link>

                    <Typography variant={"h6"} color={"#eefffab8"} fontWeight={400}>
                      <Box display={"inline"} px={2.5}>
                        <ChatIcon sx={{ verticalAlign: "sub", color: "#ffffff" }} />
                      </Box>
                      گفتگوی زنده
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </>
  );
}
