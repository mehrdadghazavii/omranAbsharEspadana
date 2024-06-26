import React, { useState } from "react";
import { alpha, Tooltip, Typography, Badge, Divider, Grid, IconButton } from "@mui/material";
import classes from "./notification.module.scss";
import NotificationsSharpIcon from "@mui/icons-material/NotificationsSharp";
import { ModalIpa } from "../modal/modal.component";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { styled } from "@mui/material/styles";

function Notification({notifStatus}) {

  const notificationList = [
    {
      version: "0 . 4 . 7",
      date: "1403/03/13",
      listTexts: [
        {
          primary: "اضافه شدن تقویم پروژه",
          secondary: `در تقویم پروژه تعطیلات رسمی، آیتم های رد شده از طرف سطح بالاتر و آیتم های تایید نشده توسط شما با توجه به رنگ بندی در تقویم متمایز شده و با کلیک بر روی هر روز جزئیات بیشتر نمایش داده خواهد شد. لطفاً جهت اطمینان از بروز بودن پروژه، تقویم را هر روز بررسی نمایید.`,
        },
      ],
    },
    {
      version: "0 . 3 . 7",
      date: "1403/02/31",
      listTexts: [
        {
          primary: "رد گزارش های روزانه جهت بررسی و اصلاح",
          secondary: `اطلاعات در سطح پیمانکار پس از تایید به سطح های بعدی ارسال می شوند و در صورت عدم تایید و رد به سطح قبل جهت بررسی و اصلاح مجدد بازگردانده می شوند.`,
        },
        {
          primary: "اضافه شدن پروفایل شرکت",
          secondary: `در قسمت شرکت ها برای مشاهده یا ویرایش اطلاعات شرکت به پروفایل شرکت مراجعه کنید.`,
        },
      ],
    },
    {
      version: "0 . 2 . 7",
      date: "1402/12/22",
      listTexts: [
        {
          primary: "جمع ساعت های کاری",
          secondary: `هم اکنون می توانید جمع ساعت های کاری را در "عوامل روزمزد" ، "نیروی انسانی" و "ماشین آلات و ابزار" مشاهده نمایید.`,
        },
        {
          primary: "آپلود PDF",
          secondary: `اضافه شدن آپلود PDF در فرم های "مصالح" ، "جلسات و بازدیدها" ، "مکاتبات" ، "هزینه های تن خواه" ، "اطلاعات مالی" و "مجوز اجرای عملیات".`,
        },
        {
          primary: "پشتیبانی آنلاین",
          secondary: `اضافه شدن پشتیبانی آنلاین (گفتگوی آنلاین)`,
        },
        {
          primary: `بهبود عملکرد و رفع برخی مشکلات`,
          secondary: '',
        },
      ],
    },
    {
      version: "0 . 1 . 7",
      date: "1402/12/20",
      listTexts: [
        {
          primary: "تغییر ظاهر و رنگبندی سامانه",
          secondary: ``,
        },
        {
          primary: "اضافه شدن پروفایل کاربری",
          secondary: `در قسمت "پروفایل" می توانید به "اطلاعات کاربری" , "تغییر رمز عبور" و "تغییر شماره موبایل" خود دسترسی پیدا کنید.`,
        },
        {
          primary: "شخصی سازی کپی",
          secondary: `با اضافه شدن شخصی سازی کپی می توانید گزارش های خود را به شکل "کپی کل" ,"کپی آیتم" و یا "کپی ردیف" در تاریخ دیگری کپی کنید.`,
        }
      ],
    },
  ];

  const isNotifSeen: boolean = parseInt(notifStatus) >= notificationList.length;

  const [open, setOpen] = useState(false);
  const [showBadge, setShowBadge] = useState(isNotifSeen);

  const ListItemStyled = styled(ListItem)(({ theme }) => ({
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    "&:hover": {
      backgroundColor: alpha(theme.palette.secondary.main, 0.05),
      color: theme.palette.secondary.main,
    },
  }));

  const handleNotifStatus = () => {
    localStorage.setItem("notifStatus", String(notificationList.length));
    setShowBadge(true);
  };

  return (
      <>
        <Tooltip title="اعلان ها">
          <IconButton
              className={!showBadge ? `${classes["notif-icon"]}` : ""}
              onClick={() => {
                setOpen(true);
                handleNotifStatus();
              }}
              color="inherit"
              size="large"
          >
            <Badge
                invisible={showBadge}
                color="error"
                variant="dot"
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
            >
              <NotificationsSharpIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        <ModalIpa open={!!open} title={`اعلان ها`} onClose={() => setOpen(false)}>
          <List sx={{ width: "100%", padding: 0, borderRadius: 0 }}>
            {notificationList.map((list) => (
                <ListItemStyled>
                  <Grid container p={1}>
                    <Grid xs={6}>
                      <Typography variant={"subtitle2"}>{`نسخه: ${list.version}`}</Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant={"subtitle2"}>{`تاریخ: ${list.date}`}</Typography>
                    </Grid>
                    <Grid xs={12}>
                      <Divider variant="fullWidth" />
                    </Grid>
                    <Grid xs={12} py={0.5}>
                      {list.listTexts.map((listText) => (
                          <ListItemText primary={`- ${listText.primary}`} secondary={listText.secondary} />
                      ))}
                    </Grid>
                  </Grid>
                </ListItemStyled>
            ))}
          </List>
        </ModalIpa>
      </>
  );
}

export { Notification };
