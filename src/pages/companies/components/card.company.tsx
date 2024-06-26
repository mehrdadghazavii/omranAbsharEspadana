import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Collapse,
  Divider,
  IconButton,
  IconButtonProps, Skeleton,
  TextField, Tooltip,
  Typography,
} from "@mui/material";
import {green, orange, red} from "@mui/material/colors";
import { styled } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React, {useEffect, useState} from "react";
import OmranLogo from "asset/images/mainLogo.png";
import { UserAccess } from "./userAccess.company";
import { withRouter } from "react-router-dom";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { actionCompany, actionSetProject } from "../../../redux/actions/actions";
import { motion } from "framer-motion";
import { cardVariant } from "../../../utils/variants.motion.util";
import {makeStyles} from "@mui/styles";
import Storage from "../../../components/storage/storage";
import {GetRemainStorageByCompanyId} from "../../../api/api";

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

const useStyles = makeStyles({
  spansInCardHeader: {
    '& .MuiCardHeader-content' : {
      width : '66%'
    },
    '& .MuiTypography-root': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow : 'ellipsis'
    },
  },
});

function CardCompany({
  name,
  logo,
  leftDay,
  userCount,
  activeUserCount,
  userAccess,
  address,
  projectCount,
  projects,
  companyId,
  goToProject,
  history,
  setProject,
  company,
  setCompany,
  tourClass,
  isOwner
}: any) {
  const { projectManagement, userManagement, readMessageAccess } = userAccess[0];
  const [curProjects, setCurProjects] = useState(projects);
  const [expanded, setExpanded] = useState(false);
  const [storageInfo, setStorageInfo] = useState<any>({});

  logo = logo ? logo : OmranLogo;

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const search = (name: string) => {
    let filteredProjects = projects;
    if (name) {
      filteredProjects = projects.filter((P: any) => P.name.includes(name));
    }
    setCurProjects(filteredProjects);
  };

  const handleGoToProject = async (project: any) => {
    await setProject(project);
    await setCompany(company);
    history.push(`/${companyId}/projects/${project.id}`);
  };

  const handleGoToPayment = async () => {
    await setCompany(company);
    history.push(`/payment/${companyId}`);
  };

  const getProjectStorageInfo = async () => {
    const res = await GetRemainStorageByCompanyId(companyId);
    if (!(res instanceof Error)) {
      setStorageInfo(res);
    } else {
      console.log(Error);
    }
  }

  useEffect(() => {
    getProjectStorageInfo();
  }, []);

  const { availableStorageMb, totalStorageMb, usedStorageMb } = storageInfo;
  const classes = useStyles();

  return (
    <Card
      sx={{ maxWidth: 320, margin: "auto" }}
      component={motion.div}
      variants={cardVariant}
      animate={"visible"}
      initial={"hidden"}
      whileHover={"hover"}
      exit={"exit"}
      layout
      className={classes.spansInCardHeader}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: leftDay > 7 ? green[500] : leftDay > 0 ? orange[500] : red[500], color: "white", fontSize: 16 }} aria-label="recipe">
            {leftDay > 0 ? leftDay : "0"}
          </Avatar>
        }
        action={
          <UserAccess
            // @ts-ignore
            companyValue={company}
            goToPayment={handleGoToPayment}
            projectManagement={projectManagement}
            companyId={companyId}
            leftDay={leftDay}
            userManagement={userManagement}
            unreadMessagesCount={company.unreadMessagesCount}
            readMessageAccess={readMessageAccess}
            isOwner={isOwner}
          />
        }
        title={
        <Tooltip title={name}>
          {name}
        </Tooltip>
        }
        subheader={
        <Tooltip title={address}>
          {address}
        </Tooltip>
        }
      />
      <Divider variant={"fullWidth"} />
      <CardActionArea
        onClick={() => (leftDay > 0 ? goToProject() : null)}
        sx={{
          userSelect: leftDay > 0 ? "text" : "none",
          opacity: leftDay > 0 ? "1" : "0.3",
          bgcolor: leftDay > 0 ? "background.paper" : "rgba(255,0,0,.2)",
        }}
      >
        <CardMedia
          className={`${tourClass.imageCardHelp}`}
          style={{ objectFit: "contain" }}
          component="img"
          height="194"
          image={logo}
          alt={name}
        />
      </CardActionArea>
      <CardContent
        className={`${tourClass.detailsCardHelp}`}
        sx={{
          userSelect: leftDay > 0 ? "text" : "none",
          opacity: leftDay > 0 ? "1" : "0.3",
          bgcolor: leftDay > 0 ? "background.paper" : "rgba(255,0,0,.2)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography color="text.secondary">کاربران:</Typography>
          <Typography variant="body2">
            {userCount} / {activeUserCount}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography color="text.secondary">تعداد پروژه:</Typography>
          <Typography variant="body2">{projectCount}</Typography>
        </Box>
        <Divider/>
        <Box mt={1}>
          {!(availableStorageMb == null) ?
              <Storage
                  remainStorage={availableStorageMb || 0}
                  totalStorage={totalStorageMb || 0}
                  usedStorage={usedStorageMb || 0}
              /> : (
                  <Skeleton variant="text" animation="wave" sx={{fontSize: '1rem'}}/>
              )}
        </Box>
      </CardContent>
      <Divider variant={"fullWidth"} />
      <CardActions
        className={`${tourClass.listProjectCardHelp}`}
        disableSpacing
        sx={{
          userSelect: leftDay > 0 ? "text" : "none",
          opacity: leftDay > 0 ? "1" : "0.3",
          bgcolor: leftDay > 0 ? "background.paper" : "rgba(255,0,0,.2)",
        }}
      >
        <TextField
          placeholder="پروژه"
          fullWidth
          size={"small"}
          onChange={({ target }) => search(target.value)}
          disabled={leftDay <= 0}
        />
        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
          disabled={leftDay <= 0}
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          {curProjects.map((P: any) => (
            <Box
              onClick={() => handleGoToProject(P)}
              key={P.id}
              px={2}
              py={1}
              sx={{
                border: "1px dashed",
                borderColor: "grey.A400",
                "&:hover": {
                  cursor: "pointer",
                  borderStyle: "solid",
                },
              }}
            >
              <Typography component={"div"} gutterBottom variant={"button"} sx={{ textAlign: "center" }}>
                {P.name}
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">کارفرما:</Typography>
                <Typography variant="body2">{P.master}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">ناظر:</Typography>
                <Typography variant="body2">{P.monitoring}</Typography>
              </Box>
            </Box>
          ))}
        </CardContent>
      </Collapse>
    </Card>
  );
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    setProject: async (value: any) => dispatch(await actionSetProject(value.id)),
    setCompany: async (value: any) => dispatch(actionCompany(value)),
  };
};

const reduxCard = connect(null, mapDispatchToProps)(withRouter(CardCompany));

export { reduxCard as CardCompany };
