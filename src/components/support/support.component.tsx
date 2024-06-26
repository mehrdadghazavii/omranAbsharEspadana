import React, { useState } from "react";
import { ModalIpa } from "components/modal/modal.component";
import { Badge, Button, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import { ButtonsModal } from "components/buttons-form-modal/buttons-modal";
import { BiSupport } from "react-icons/bi";
import classes from "./support.module.scss";
import PhoneEnabledIcon from "@mui/icons-material/PhoneEnabled";
import PhonelinkRingIcon from "@mui/icons-material/PhonelinkRing";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import QRCode from "asset/images/ipa-whatsapp-QR-code.png";

const Support = () => {
  const [showStatus, setShowStatus] = useState(null);

  return (
    <>
      <Tooltip title="پشتیبانی">
        <IconButton onClick={() => setShowStatus(true)} color="inherit" size="large">
          <BiSupport />
          {/* {showStatus === null ? <span className={classes.blob}></span> : null} */}
        </IconButton>
      </Tooltip>
      <ModalIpa open={!!showStatus} title={`پشتیبانی`} onClose={() => setShowStatus(false)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography>
              برای پیشتیبانی در ساعات اداری شنبه تا چهارشنبه ساعت 9 الی 17 و پنجشنبه ساعت 9 الی 16 با شماره تلفن، و در ساعات غیر
              اداری به صورت ایمیل و یا واتساپ با ما در ارتباط باشید.
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} sx={{ display: "flex", alignItems: "center" }}>
            <PhoneEnabledIcon style={{ fontSize: "18.5px", color: "#256C29", marginLeft: "2px" }} />
            <Typography sx={{ display: "inline-block" }}>
              شماره تلفن:
              <a href="tel:031-33932292">33932292-031</a>
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} sx={{ display: "flex", alignItems: "center" }}>
            <PhonelinkRingIcon style={{ fontSize: "18.5px", color: "#256C29", marginLeft: "2px" }} />
            <Typography sx={{ display: "inline-block" }}>
              شماره موبایل:
              <a href="tel:09134041709">09134041709</a>
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} sx={{ display: "flex", alignItems: "center" }}>
            <WhatsAppIcon style={{ fontSize: "19px", color: "#256C29", marginLeft: "2px" }} />
            <Typography sx={{ display: "inline-block" }}>
              واتساپ:
              <a href="https://wa.me/9809134041709">https://wa.me/9809134041709</a>
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} sx={{ display: "flex", alignItems: "center" }}>
            <MailOutlineIcon style={{ fontSize: "19px", color: "#256C29", marginLeft: "2px" }} />
            <Typography sx={{ display: "inline-block" }}>
              ایمیل:
              <a href="mailto:su@ipasoft.co">su@ipasoft.co</a>
            </Typography>
          </Grid>

          <Grid item xs={12} sx={{ display: "flex", alignItems: "center" }}>
            <img src={QRCode} alt="" style={{ width: "120px", height: "120px" }} />
          </Grid>

          <Grid item xs={12} sx={{ textAlign: "end" }}>
            <Button onClick={() => setShowStatus(false)} variant="outlined">
              بستن
            </Button>
          </Grid>
        </Grid>
      </ModalIpa>
    </>
  );
};

export { Support };
