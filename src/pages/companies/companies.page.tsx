import { Dispatch } from "redux";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { getCompanies } from "../../api/api";
import {Typography} from "@mui/material";
import {alpha} from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";
import {motion, AnimatePresence} from 'framer-motion'
import {setTourGuide} from "../../redux/actions/actions";
import { CardCompany } from "./components/card.company";
import { actionCompany } from "../../redux/actions/actions";
import { withRouter, useLocation } from "react-router-dom";
import Joyride, {STATUS, CallBackProps} from "react-joyride";
import SkeletonCompany from "./components/skeleton.card.company";
import { Button, Grid, Paper, TextField, useTheme } from "@mui/material";

function CompaniesPage({setCompany, history, setTourGuide, tourGuide, dark, loader}: any) {
  const theme = useTheme();
  const themePl = useTheme().palette;
  const secondary = themePl.secondary.main;

  const baseButtonReactTour = {
    skip: (
        <Button variant="outlined" size="medium">
          رد کردن
        </Button>
    ),
    close: "بستن",
    next: <Button sx={{ color: "common.white", p: 0 }}>بعدی</Button>,
    back: "قبلی",
    last: <Button sx={{ color: "common.white", p: 0 }}>تمام</Button>,
  };

  const [companies, setCompanies] = useState<any>(null);
  const [filteredCom, setFilteredCom] = useState<any>(null);
  const [steps] = useState<any>([
    {
      content: (
        <Typography variant="h6" sx={{ color: "text.primary" }}>
          به راهنمای سایت خوش آمدید.
        </Typography>
      ),
      locale: baseButtonReactTour,
      placement: "center",
      target: "body",
    },
    {
      content: (
        <Typography variant="body1" sx={{ color: "text.primary" }}>
          با کلیک روی این دکمه می‌توانید نوع فونت، اندازه فونت‌ و همچنین شعاع مرز‌ها را به سلیقه خود تغییر
          دهید.
        </Typography>
      ),
      locale: baseButtonReactTour,
      placement: "bottom",
      styles: {
        options: {
          width: 365,
        },
      },
      target: ".setting-icon-help",
      title: (
        <Typography variant="h6" sx={{ color: "text.primary" }}>
          دکمه تنظیمات
        </Typography>
      ),
    },
    {
      content: (
        <Typography variant="body1" sx={{ color: "text.primary" }}>
          با کلیک روی این دکمه می‌توانید به پروفایل خود دسترسی پیدا کنید و یا از حساب‌ کاربری خود خارج شوید.
        </Typography>
      ),
      locale: baseButtonReactTour,
      placement: "bottom",
      styles: {
        options: {
          width: 390,
        },
      },
      target: ".more-icon-help",
      title: (
        <Typography variant="h6" sx={{ color: "text.primary" }}>
          دکمه تغییرات
        </Typography>
      ),
    },
    {
      content: (
        <Typography variant="body1" sx={{ color: "text.primary" }}>
          در این قسمت می‌توانید شرکت یا پروژه مورد‌ نظر خود را بر اساس اسم یا محل قرارگیری جست‌وجو کنید.
        </Typography>
      ),
      locale: baseButtonReactTour,
      placement: "bottom",
      styles: {
        options: {
          width: 390,
        },
      },
      target: ".search-box-help",
      title: (
        <Typography variant="h6" sx={{ color: "text.primary" }}>
          قسمت سرچ
        </Typography>
      ),
    },
    {
      content: (
        <Typography variant="body1" sx={{ color: "text.primary" }}>
        با کلیک روی این دکمه در صورت دسترسی می‌توانید به بخش‌های مدیریت کاربران، و پیام‌ها دسترسی پیدا کنید.
        </Typography>
      ),
      locale: baseButtonReactTour,
      placement: "left",
      styles: {
        options: {
          width: 340,
        },
      },
      target: ".more-card-help",
    },
    {
      content: (
        <Typography variant="body1" sx={{ color: "text.primary" }}>
    با کلیک روی تصویر می‌توانید لیست پروژه‌های شرکت را مشاهده کنید.
        </Typography>
      ),
      locale: baseButtonReactTour,
      spotlightPadding: 10,
      target: ".image-card-help",
    },
    {
      content: (
        <Typography variant="body1" sx={{ color: "text.primary" }}>
   در این بخش می‌توانید تعداد کاربران، تعداد پروژه و حجم مصرف شده را مشاهده کنید.
        </Typography>
      ),
      locale: baseButtonReactTour,
      placement: "left",
      styles: {
        options: {
          width: 320,
        },
      },
      spotlightPadding: -5,
      target: ".details-card-help",
    },
    {
      content: (
        <Typography variant="body1" sx={{ color: "text.primary" }}>
      در این قسمت می‌توانید پروژه مورد نظر ‌خود را جست‌وجو کنید یا در صورت نیاز با زدن فلش می‌توانید لیست تمام پروژه‌های شرکت را مشاهده کنید.
        </Typography>
      ),
      locale: baseButtonReactTour,
      placement: "bottom",
      styles: {
        options: {
          width: 350,
        },
      },
      target: ".list-project-card-help",
    },
    {
      content: (
        <Typography variant="body1" sx={{ color: "text.primary" }}>
      در این قسمت می‌توانید شرکت جدیدی را اضافه کنید.
        </Typography>
      ),
      locale: baseButtonReactTour,
      placement: "top",
      styles: {
        options: {
          width: 300,
        },
      },
      target: ".add-company-help",
    },
  ]);
  const [tourHelpClass] = useState<any>({
    imageCardHelp: "image-card-help",
    detailsCardHelp: "details-card-help",
    listProjectCardHelp: "list-project-card-help",
  });

  const pathname = useLocation().pathname;

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setTourGuide([false, ""]);
    }
  };

  const getAllNeedData = async () => {
    const res = await getCompanies();
    if (!(res instanceof Error)) {
      setCompanies(res);
      setFilteredCom(res);
    } else {
      toast.error("دریافت داده با خطا مواجه شد");
    }
  };

  useEffect(() => {
    getAllNeedData();
  }, []);

  const handleClickListProjects = (data: any) => {
    setCompany(data);
    history.push(`/${data.id}/projects`);
  };

  const handleSearchChange = (key: string) => {
    if (key) {
      const targetFilter = companies.filter((C: any) => {
        const listOfTargetProject = C.projects.filter((P: any) => {
          if (P.name.includes(key)) {
            return P;
          }
          return false;
        });

        const found = C.projects?.some((r: any) => listOfTargetProject.includes(r));

        if (C.name.includes(key) || C.address.includes(key) || found) {
          return C;
        }
        return false;
      });
      setFilteredCom(targetFilter);
    } else {
      setFilteredCom(companies);
    }
  };

  filteredCom?.sort((a: any, b: any) => {
    return b.leftDay - a.leftDay;
  });

  return (
      <>
        {tourGuide[1] === pathname ? (
            <Joyride
                steps={steps}
                run={tourGuide[0]}
                showProgress={true}
                showSkipButton={true}
                callback={handleJoyrideCallback}
                scrollToFirstStep={true}
                continuous={true}
                disableScrolling={true}
                styles={{
                  buttonClose: {
                    color: `${themePl.text.primary}`,
                  },
                  options: {
                    backgroundColor: `${themePl.background.paper}`,
                    overlayColor: `${
                        dark ? alpha(themePl.common.black, 0.9) : alpha(themePl.common.black, 0.7)
                    }`,
                    primaryColor: `${secondary}`,
                    zIndex: theme.zIndex.tooltip,
                  },
                }}
            />
        ) : null}
        <Paper sx={{mb: 3}} className={`search-box-help`}>
          <TextField
              label={"دنبال چی هستی؟"}
              variant={"outlined"}
              size="medium"
              fullWidth
              onChange={({target}) => {
                handleSearchChange(target.value);
              }}
          />
        </Paper>

        <Grid container spacing={3}
              component={motion.div}
              animate={{opacity: 1}}
              initial={{opacity: 0}}
              exit={{opacity: 0}}
            // animate={{y: 100}}
              layout
        >
          <AnimatePresence>
            {filteredCom
                ? filteredCom.map((C: any) => (
                    <Grid key={C.id} item xs={12} sm={6} md={4} lg={3} xl={2}>
                      <CardCompany
                          // @ts-ignore
                          company={C}
                          goToProject={() => handleClickListProjects(C)}
                          logo={C.logo}
                          companyId={C.id}
                          name={C.name}
                          projects={C.projects}
                          projectCount={C.projectCount}
                          leftDay={C.leftDay}
                          address={C.address}
                          userCount={C.userCount}
                          activeUserCount={C.activeUserCount}
                          userAccess={C.userAccess}
                          tourClass={tourHelpClass}
                          isOwner={C.isOwner}
                      />
                    </Grid>
                ))
                : loader ? <SkeletonCompany />
                : null}
          </AnimatePresence>
        </Grid>
      </>
  );
}

const mapStateToProps = (state: any) => {
  return {
    dark: state.dark,
    tourGuide: state.tourGuide,
    loader: state.loader
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    setCompany: (value: any) => dispatch(actionCompany(value)),
    setTourGuide: (value: any) => dispatch(setTourGuide(value)),
  };
};

const reduxCompany = connect(mapStateToProps, mapDispatchToProps)(withRouter(CompaniesPage));

export { reduxCompany as CompaniesPage };
