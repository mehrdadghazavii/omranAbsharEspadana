import { Box, CssBaseline, IconButton, Toolbar, Tooltip, Typography, useTheme } from "@mui/material";
import React, { useState } from "react";
import { AiOutlineMenu, AiOutlineUnorderedList } from "react-icons/ai";
import { MenuHeader } from "./menu.header";
import { MenuLayout } from "../menu/menu.layout";
import { Copyright, SettingIpa, Support } from "../../../components";
import { styled } from "@mui/material/styles";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import { connect } from "react-redux";
import Stack from "@mui/material/Stack";
import { setTourGuide } from "../../../redux/actions/actions";
import { Dispatch } from "redux";
import { useHistory, useLocation } from "react-router-dom";
import { Help } from "@mui/icons-material";
import { motion } from "framer-motion";
import { Notification } from "../../../components/notification/notification.components";
import useMediaQuery from "@mui/material/useMediaQuery";

export const drawerWidth = 120;
export const isMobile = window.screen.width < 450;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    // marginLeft: drawerWidth,
    // width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Content = styled("main")(({ theme }) => ({
  flexGrow: 1,
  // padding: theme.spacing(3),
  marginBottom: theme.spacing(3.5),
}));

const StyledToolbar = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

function HeaderLayout({ inProject, children, setTourGuide }: any) {
  const pathname = useLocation().pathname;
  const projectPa = new RegExp("/[^/]*/projects");
  const [usedReactTour, setUsedReactTour] = useState(["/"]);
  const history = useHistory();
  const [open, setOpen] = useState<0 | 1 | 2>(2);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const theme = useTheme();
  const gray300 = theme.palette.grey[300];

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleDrawerToggle = () => {
    if (isMobile && open === 0) {
      setOpen(2);
    } else {
      // @ts-ignore
      setOpen((preV) => (preV + 1) % 3);
    }
  };

  const match = useMediaQuery("(min-width:500px)");

  const notifStatus= localStorage.getItem("notifStatus");

  const handleDrawerClose = () => {
    setOpen(0);
  };

  const handleStartTour = () => {
    setTourGuide([true, pathname]);
  };

  // useEffect(() => {
  //   if((((pathname?.match(projectPa))?.input)) === pathname){
  //     setUsedReactTour([pathname])
  //   }else{
  //     setUsedReactTour(["/"])
  //   }
  // }, [pathname])

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      <CssBaseline />
      <AppBar
        position="fixed"
        open={open > 0}
        sx={{ backgroundImage: `radial-gradient(at ${mousePosition.x}px bottom, #00ACB1 0%, #151e31 60%)` }}
        onMouseMove={handleMouseMove}
      >
        <Toolbar style={{ justifyContent: "space-between" }}>
          {inProject ? (
            <IconButton
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{
                color: gray300,
                marginRight: "36px",
                // ...(open && { display: 'none' }),
              }}
              size="large"
            >
              {open === 2 ? <AiOutlineUnorderedList /> : <AiOutlineMenu />}
            </IconButton>
          ) : null}

          <Typography
            variant="h6"
            noWrap
            sx={{ cursor: "pointer", color: gray300 }}
            onClick={() => history.push("/")}
            initial={{
              scale: 0.1,
              opacity: 0,
              // y: 100
            }}
            animate={{
              scale: 1,
              opacity: 1,
              // y: 0,
            }}
            transition={{
              duration: 1.5,
              type: "Inertia",
            }}
            component={motion.h6}
          >
            {match ? "عمران آبشار اسپادانا " : "عمران آبشار"}
          </Typography>

          <Stack direction="row" spacing={0} justifyContent="center" alignItems="center" sx={{color: gray300}}>
            <Support />
            <Notification notifStatus={notifStatus}/>
            {usedReactTour.includes(pathname) ? (
              <Tooltip title="راهنما">
                <IconButton onClick={handleStartTour} color="inherit" size="large">
                  <Help />
                </IconButton>
              </Tooltip>
            ) : null}
            <SettingIpa />
            <MenuHeader />
          </Stack>
        </Toolbar>
      </AppBar>
      {inProject ? (
        <MenuLayout
          // @ts-ignore
          onOpen={handleDrawerToggle}
          open={open}
          onClose={handleDrawerClose}
        />
      ) : null}
      <Content sx={{ px: 1.5, py: 3, p: {lg: 3} }}>
        <StyledToolbar />
        {children}
      </Content>
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
  );
}

const mapStateToProps = (state: any) => {
  return {
    inProject: state.inProject,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    setTourGuide: (value: any) => dispatch(setTourGuide(value)),
  };
};

const reduxHeader = connect(mapStateToProps, mapDispatchToProps)(HeaderLayout);

export { reduxHeader as HeaderLayout };
