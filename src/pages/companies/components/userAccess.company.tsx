import { Dispatch } from "redux";
import React, {useState} from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { HiShoppingCart } from "react-icons/hi";
import { MoreVert } from "@mui/icons-material";
import { actionCompany } from "../../../redux/actions/actions";
import CompanyIcon from "asset/images/company-profile.png"
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import CompanyProfile from "../../../components/company-profile/companyProfile";
import { Badge, IconButton, Menu, MenuItem, Stack, Typography } from "@mui/material";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";

interface AccessProps {
  projectManagement: boolean;
  userManagement: boolean;
  companyId: string;
  history: any;
  readMessageAccess: boolean;
  unreadMessagesCount: boolean;
  goToPayment: Function;
  leftDay: number;
  companyValue: any;
  setCompany: Function;
  isOwner: boolean
}

function UserAccess({
  projectManagement,
  userManagement,
  companyId,
  history,
  readMessageAccess,
  unreadMessagesCount,
  leftDay,
  companyValue,
  setCompany,
  isOwner
}: AccessProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [companyProfile, setCompanyProfile] = useState<boolean>(false);
  const open = Boolean(anchorEl);
  const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const moveToPaymentForBuyPage = async () => {
    await setCompany(companyValue);
    history.push(`/paymentForBuyPage/${companyId}`);
  };

  return (
    <>
      {!projectManagement && leftDay <= 0 ? null : (
        <IconButton onClick={handleClickMenu} aria-label="settings" className={`more-card-help`}>
          {readMessageAccess ? (
            <Badge badgeContent={unreadMessagesCount} color={"info"}>
              <MoreVert />
            </Badge>
          ) : (
            <MoreVert />
          )}
        </IconButton>
      )}

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {isOwner &&
            <MenuItem disabled={!isOwner} onClick={() => setCompanyProfile(!companyProfile)}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%" spacing={2}>
                <Typography variant={"button"}>پروفایل شرکت</Typography>
                <IconButton sx={{ width: 24, height: 24 }}>
                  <img src={CompanyIcon} width={24} height={24} alt="companyIcon" />
                </IconButton>
              </Stack>
            </MenuItem>
        }

        <MenuItem disabled={!userManagement} onClick={() => history.push(`/companyUsers/${companyId}`)}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" style={{ width: "100%" }} spacing={2}>
            <Typography variant={"button"}>مدیریت کاربران</Typography>
            <ManageAccountsRoundedIcon />
          </Stack>
        </MenuItem>

        {!(leftDay > 0) ? (
          <MenuItem disabled={!projectManagement} onClick={() => moveToPaymentForBuyPage()}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" style={{ width: "100%" }} spacing={2}>
              <Typography variant={"button"}>خرید اکانت</Typography>
              <HiShoppingCart />
            </Stack>
          </MenuItem>
        ) : null}

        {leftDay > 0 ? (
          <MenuItem
            disabled={leftDay <= 0 || (leftDay > 0 && !readMessageAccess)}
            onClick={() => history.push(`/messages/company/${companyId}`)}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" style={{ width: "100%" }} spacing={2}>
              <Typography variant={"button"}>پیام ها</Typography>
              <Badge badgeContent={unreadMessagesCount} color={"info"}>
                <EmailRoundedIcon fontSize={"medium"} />
              </Badge>
            </Stack>
          </MenuItem>
        ) : null}
      </Menu>
      { companyProfile && <CompanyProfile open={companyProfile} onClose={ () => setCompanyProfile(!companyProfile) } companyId={companyId}/> }
    </>
  );
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    setCompany: async (value: any) => dispatch(actionCompany(value)),
  };
};

const userAccessCompanyCard = connect(null, mapDispatchToProps)(withRouter(UserAccess));

export { userAccessCompanyCard as UserAccess };
