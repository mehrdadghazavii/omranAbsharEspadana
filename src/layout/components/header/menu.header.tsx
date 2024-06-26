import { IconButton, Menu, MenuItem, Divider } from "@mui/material";
import { ExitToApp, MoreVert } from "@mui/icons-material";
import React from "react";
import { connect } from "react-redux";
import { TOGGLE_DARK } from "../../../redux/types/type";
import { actionExit } from "../../../redux/actions/actions";
import PersonIcon from "@mui/icons-material/Person";
import UserProfile from "../../../components/user-profile/userProfile";

interface MenuProps {
  dark: boolean;
  toggleDark: Function;
  exit: Function;
  UserId: string;
}

function MenuHeader(props: MenuProps) {
  const { dark, toggleDark, exit } = props;
  const [open, setOpen] = React.useState<null | HTMLElement>(null);
  const [showProfile, setShowProfile] = React.useState<null | boolean>(null);

  const handleExit = () => {
    localStorage.removeItem("omranUser");
    exit();
  };

  return (
    <>
      <IconButton
        className={`more-icon-help`}
        aria-label="show more"
        aria-controls={"menu-setting-header"}
        aria-haspopup="true"
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => setOpen(e.currentTarget)}
        color="inherit"
        size="large"
      >
        <MoreVert />
      </IconButton>
      <Menu
        id={"menu-setting-header"}
        onClose={() => {
          setOpen(null);
        }}
        anchorEl={open}
        // getContentAnchorEl={null}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        open={Boolean(open)}
      >
        <MenuItem onClick={() => setShowProfile(true)} sx={{py: 0}}>
          <IconButton color="inherit" size="medium">
            <PersonIcon />
          </IconButton>
          <p style={{ paddingLeft: 15 }}>پروفایل</p>
        </MenuItem>
        <Divider variant={"fullWidth"} />
        {/*<MenuItem onClick={() => toggleDark(!dark)}>*/}
        {/*  <IconButton color="inherit" size="large">*/}
        {/*    {dark ? <Brightness4 /> : <Brightness7 />}*/}
        {/*  </IconButton>*/}
        {/*  <p style={{ paddingLeft: 15 }}>{dark ? "تاریک" : "روشن"}</p>*/}
        {/*</MenuItem>*/}
        <MenuItem onClick={handleExit} sx={{py: 0}}>
          <IconButton color="inherit" size="medium">
            <ExitToApp />
          </IconButton>
          <p style={{ paddingLeft: 15 }}>خروج</p>
        </MenuItem>
      </Menu>

      {showProfile ? (
        <UserProfile
          open={showProfile}
          onClose={() => setShowProfile(false)}
        /> ) : null }
    </>
  );
}

const mapStateToProps = (state: { dark: boolean; user: any }) => {
  return {
    UserId: state.user.id,
    dark: state.dark,
  };
};
const mapDispatchToProps = (dispatch: any) => {
  return {
    toggleDark: (value: boolean) => dispatch({ type: TOGGLE_DARK, data: value }),
    exit: () => dispatch(actionExit()),
  };
};

const HeaderRedux = connect(mapStateToProps, mapDispatchToProps, null, {})(MenuHeader);

export { HeaderRedux as MenuHeader };
