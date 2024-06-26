import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import {styled} from "@mui/material/styles";
import moment from "jalali-moment";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Zoom from "@mui/material/Zoom";
import {TransitionProps} from "@mui/material/transitions";
import {connect, useDispatch} from "react-redux";
import {BASE_URL} from "configs/configs";
import {setConfirmToggleDetails} from "redux/actions/actions";

const TypographyStyle = styled(Typography)(() => ({
  display: "inline",
  fontWeight: "bold",
}));

const TypoTitle = styled(Typography)(() => ({
  fontStyle: "italic",
  display: "inline",
}));

interface dialogProp {
  title?: any;
  open?: any;
  setOpen?: any;
  rowValue?: any;
  columnValue?: any;
  toggleDetails: any;
  currentTab: number;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Zoom style={{ transitionDelay: "200ms", transitionDuration: "700ms" }} ref={ref} {...props} />;
});

const sampleObj = {
  activityCode: "کد فعالیت",
  activityTypeName: "نوع فعالیت",
  amount: "مقدار",
  contructorName: "نام پیمانکار",
  cost: "هزینه",
  description: "توضیحات",
  expertQty: "تعداد کارشناس",
  operationDescription: "شرح عملیات",
  reportDate: "تاریخ گزارش",
  simpleWorkerQty: "تعداد کارگر ساده",
  technicalWorkerQty: "تعداد کارگر فنی",
  unit: "واحد",
  workManQty: "تعداد استاد کار",
  location: "محل",
  activityTypeId: "",
  contructorNameId: "",
  id: "",
  lastUserLevel: "",
  projectId: "",
  projectName: "",
  verify: "",
  dailyWorkerName: "نام کارگر روزانه",
  dailyWorkerNameId: "",
  enterTime: "ساعت ورود",
  exitTime: "ساعت خروج",
  servingLocation: "محل انجام عملیات",
  wage: "دستمزد",
  activityType: "نوع فعالیت",
  presentationStatus: "وضعیت حضور",
  servingLocationId: "",
  servingLocationName: "محل خدمت",
  staffName: "نام نیروی انسانی",
  staffNameId: "",
  contructorId: "",
  exitAndEnter: "ورودی و خروجی",
  insertTime: "ساعت ورودی",
  materialsName: "نام مصالح",
  materialsNameId: "",
  pictureUrl: "",
  activeDate: "تاریخ فعال سازی",
  deletedTime: "زمان حذف کردن",
  isActive: "فعال بودن",
  isDeleted: "حذف شده",
  name: "نام",
  project: "پروژه",
  relatedId: "",
  updateTime: "تاریخ بروزرسانی",
  plan: "برنامه",
  actual: "در واقع",
  text: "متن",
  statement: "موضوع",
  payerId: "",
  costTypeId: "",
  counterPartyId: "",
  counterPartyName: "طرف حساب",
  payerName: "پرداخت کننده",
  costTypeName: "نوع هزینه",
  accepetDate: "تاریخ پذیرش",
  accepterId: "",
  accepterName: "نام پذیرنده",
  accepterMobile: "شماره پذیرنده",
  userId: "",
  verifier: "تایید کننده",
  subject: "موضوع",
  systemNumber: "شماره سیستم",
  user: "کاربر",
  number: "شماره",
  enterExit: "ورود/خروج",
  senderReceiverName: "نام فرستنده/گیرنده",
  date: "تاریخ",
  toolsName: "نام دستگاه",
  toolsNameId: "",
  workingStatus: "وضعیت کار",
  qty: "تعداد",
  previewPath: "",
  pictureName: "نام تصویر",
  caption: "توضیحات تصویر",
  picturePath: "",
  startDate: "تاریخ شروع",
  endDate: "تاریخ پایان",
  projectsFinanceInfoesStatement: "نوع",
  projectsFinanceInfoesId: "",
  workingHours: "جمع ساعت کاری",
  pdfUrl: "PDF",
  inserterName: "درج کننده",
  inserterId: "",
  isRejected: "رد شده"
};

function DetailsDialog(props: dialogProp) {
  const { open, rowValue: value, columnValue: column, toggleDetails, currentTab } = props;

  //filter keys by id
  const compareKeys = (a: any, b: any) => {
    var aKeys = Object.keys(a).sort();
    var bKeys = Object.keys(b).sort();
    bKeys.map((it: any) => {
      aKeys.map((cle: any) => {
        if (it === cle) {
          if (
            it === "activityTypeId" ||
            it === "contructorNameId" ||
            it === "id" ||
            it === "lastUserLevel" ||
            it === "projectId" ||
            it === "projectName" ||
            it === "project" ||
            it === "verify" ||
            it === "dailyWorkerNameId" ||
            it === "servingLocationId" ||
            it === "staffNameId" ||
            it === "contructorId" ||
            it === "materialsNameId" ||
            it === "pictureUrl" ||
            it === "relatedId" ||
            it === "isRejected" ||
            it === "payerId" ||
            it === "costTypeId" ||
            it === "counterPartyId" ||
            it === "accepterId" ||
            it === "userId" ||
            it === "toolsNameId" ||
            it === "previewPath" ||
            it === "picturePath" ||
            it === "projectsFinanceInfoesId" ||
            it === "inserterId" ||
            // it === "pdfUrl" ||
            it === "deletedTime"
          ) {
            delete b[it];
          } else {
            Object.defineProperty(b, a[cle], Object.getOwnPropertyDescriptor(b, it));
            delete b[it];
          }
        }
      });
    });
    return b;
  };

  let selectedRow = { ...value };
  console.log(selectedRow);
  let selectedColumn = [...column];
  let selectedTargetRow = { ...selectedRow };
  const targetRow = compareKeys(sampleObj, selectedTargetRow);
  const targetValue = Object.entries(targetRow);

  if (selectedRow?.reportDate) {
    selectedRow.reportDate = moment(selectedRow?.reportDate).locale("fa").format("YYYY/MM/DD");
  }

  if (selectedRow?.date) {
    selectedRow.date = moment(selectedRow?.date).locale("fa").format("YYYY/MM/DD");
  }

  if (selectedRow?.startDate) {
    selectedRow.startDate = moment(selectedRow?.startDate).locale("fa").format("YYYY/MM/DD");
  }

  if (selectedRow?.endDate) {
    selectedRow.endDate = moment(selectedRow?.endDate).locale("fa").format("YYYY/MM/DD");
  }

  if (selectedRow?.enterTime) {
    selectedRow.enterTime = moment(selectedRow?.enterTime).locale("fa").format("HH:mm");
  }

  if (selectedRow?.exitTime) {
    selectedRow.exitTime = moment(selectedRow?.exitTime).locale("fa").format("HH:mm");
  }

  // if (selectedRow?.presentationStatus) {
  //    if (selectedRow.presentationStatus === 4) {
  //       selectedRow.presentationStatus = "مرخصی";
  //    }
  //    if (selectedRow.presentationStatus === 1) {
  //       selectedRow.presentationStatus = "حاضر";
  //    }
  // }

  selectedRow?.workingStatus === 1 ?
      selectedRow.workingStatus = "در‌حال کار"
      : selectedRow.workingStatus = "متوقف"

  if (selectedRow?.exitAndEnter) {
    if (selectedRow.exitAndEnter === true) {
      selectedRow.exitAndEnter = "ورود";
    }
  }

  selectedRow?.wage && (selectedRow.wage = selectedRow.wage.toLocaleString("fa-IR"));

  selectedRow?.cost && (selectedRow.cost = selectedRow.cost.toLocaleString("fa-IR"));

  selectedRow?.salery && (selectedRow.salery = selectedRow.salery.toLocaleString("fa-IR"));

  selectedColumn = selectedColumn.filter((cl: any) => cl.id !== "action");
  selectedColumn = selectedColumn.filter((cl: any) => cl.id !== "pictureUrl");

  for (const item in selectedRow) {
    if (selectedRow[item] === "") {
      selectedRow[item] = "-";
    }
  }

  for (const item in targetValue) {
    switch (targetValue[item][0]) {
      case "تاریخ":
      case "تاریخ شروع":
      case "تاریخ گزارش":
      case "تاریخ پذیرش":
      case "تاریخ پایان":
      case "زمان حذف کردن":
      case "تاریخ فعال سازی":
      case "تاریخ بروزرسانی":
        if (targetValue[item][1]) {
          targetValue[item][1] = moment(targetValue[item][1]).locale("fa").format("YYYY/MM/DD");
        }
        break;

      case "ساعت ورود":
      case "ساعت خروج":
      case "ساعت ورودی":
        if (targetValue[item][1]) {
          targetValue[item][1] = moment(targetValue[item][1]).locale("fa").format("HH:mm");
        }
        break;

      case "وضعیت حضور":
        switch (targetValue[item][1]) {
          case 1:
            targetValue[item][1] = "حاضر";
            break;
          case 2:
            targetValue[item][1] = "غایب";
            break;
          case 3:
            targetValue[item][1] = "ماموریت";
            break;
          case 4:
            targetValue[item][1] = "مرخصی";
            break;
        }
        break;

      case "وضعیت کار":
        targetValue[item][1] = targetValue[item][1] === 1 ? "در‌حال کار" : "متوقف";
        break;

      case "فعال بودن":
      case "حذف شده":
        targetValue[item][1] = targetValue[item][1] ? "بله" : "خیر";
        break;

      case "ورود/خروج":
        targetValue[item][1] = targetValue[item][1] ? "ورود" : "خروج";
        break;

      case "ورودی و خروجی":
        targetValue[item][1] = targetValue[item][1] ? "ورود" : "خروج";
        break;

      case "پیش نمایش تصویر":
        if (targetValue[item][1]) {
          // @ts-ignore
          targetValue[item][1] = targetValue[item][1]?.replace("~", BASE_URL);
        }
        break;

      case "دستمزد":
      case "هزینه":
        if (targetValue[item][1]) {
          // @ts-ignore
          targetValue[item][1] = targetValue[item][1].toLocaleString("fa-IR");
        }
        break;
    }
  }

  const dispatch = useDispatch();

  return (
    <Dialog
      open={open && toggleDetails}
      onClose={() => dispatch(setConfirmToggleDetails(false))}
      aria-labelledby="confirm-dialog"
      fullWidth
      TransitionComponent={Transition}
    >
      <DialogTitle style={{ display: "flex", alignItems: "center" }}>
        <Typography sx={{ m: 0, p: 0, fontWeight: 600 }} variant="h6">
          جزئیات گزارش
        </Typography>
        <IconButton
          aria-label="close"
          onClick={() => dispatch(setConfirmToggleDetails(false))}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
            borderRadius: 4,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          {currentTab !== 0
            ? selectedColumn
                ?.filter((item: any) => item.label !== "#" && item.label !== "تصویر")
                ?.map((cl: any) => {
                  return (
                    <Grid item xs={12} sm={6} sx={{ px: 2 }}>
                      <TypoTitle>{cl.label} : </TypoTitle>
                      {cl.label === "PDF" && selectedRow?.[cl.id] ? (
                        <a
                          href={selectedRow?.[cl.id]}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#45a294", fontWeight: 450 }}
                        >
                          دانلود فایل
                        </a>
                      ) : (
                        <TypographyStyle>{selectedRow?.[cl.id]}</TypographyStyle>
                      )}
                    </Grid>
                  );
                })
            : targetValue.map((ent: any) => {
                return (
                  <Grid item xs={12} sm={6} sx={{ px: 2 }}>
                    <TypoTitle>{`${ent[0]}: `}</TypoTitle>
                    {ent[0] === "PDF" && ent[1] ? (
                      <a href={ent[1]} target="_blank" rel="noreferrer" style={{ color: "#45a294", fontWeight: 450 }}>
                        دانلود فایل
                      </a>
                    ) : (
                      <TypographyStyle>{ent[1]}</TypographyStyle>
                    )}
                  </Grid>
                );
              })}
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

const mapStateToProps = (state: any) => {
  return {
    toggleDetails: state.toggleDetails,
    currentTab: state.currentTab
  };
};

const reduxHead = connect(mapStateToProps)(DetailsDialog);

export { reduxHead as DetailsDialog };
