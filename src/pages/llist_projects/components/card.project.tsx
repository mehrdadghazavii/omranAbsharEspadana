import {Box, Button, Card, CardContent, CardHeader, Divider, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import {withRouter} from 'react-router-dom'
import {Dispatch} from "redux";
import {connect} from "react-redux";
import {actionSetProject} from "../../../redux/actions/actions";
import {SET_IN_PROJECT} from "../../../redux/types/type";
import {motion} from 'framer-motion'
import {cardVariant} from "../../../utils/variants.motion.util";
import {GetRemainStorageByProjectId} from "../../../api/api";
import UserAccessProject from "./userAccess.project";


function CardProject(
    {
        master,
        monitoring,
        name,
        projectType,
        startDate,
        companyId,
        history,
        projectId,
        setProject,
        setInProject,
        insertDate,
        endDate,
        productionLicenseDate,
        totalArea,
        usefulMeter,
        residentialUnit,
        description,
        address,
        updateCompany,
    }: any) {

    const [storageInfo, setStorageInfo] = useState<any>({});

  const handleGoToProject = async (project: any) => {
    await setProject(project)
    setInProject()
    history.push(`/${companyId}/projects/${project.id}`)
  }

    const getProjectStorageInfo = async () => {
        const res = await GetRemainStorageByProjectId(projectId);
        if (!(res instanceof Error)) {
            setStorageInfo(res);
        } else {
            console.log(Error);
        }
    }

    useEffect(() => {
        getProjectStorageInfo();
    }, []);

  const { usedStorageMb } = storageInfo;

  return (
      <Card
          sx={{maxWidth: 320, margin: 'auto' , minHeight:"100%" , display:"flex" , flexDirection:"column" , justifyContent:"space-between" , overflow:"hidden"}}
          component={motion.div}
          variants={cardVariant}
          animate={'visible'}
          initial={'hidden'}
          whileHover={'hover'}
          exit={'exit'}
          layout
      >
        <div>
            <CardHeader
                title={name}
                sx={{maxHeight: "18vh", textAlign: 'center'}}
                action={
                    <UserAccessProject
                        projectId={projectId}
                        name={name}
                        master={master}
                        companyId={companyId}
                        monitoring={monitoring}
                        startDate={startDate}
                        projectType={projectType}
                        endDate={endDate}
                        productionLicenseDate={productionLicenseDate}
                        totalArea={totalArea}
                        usefulMeter={usefulMeter}
                        residentialUnit={residentialUnit}
                        description={description}
                        address={address}
                        updateCompany={updateCompany}
                    />
                }
            />
          <Divider variant="middle" >
            {new Date(insertDate).toLocaleDateString('fa-IR')}
          </Divider>
        <CardContent>
          <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
            <Typography color="text.secondary">
              کارفرما:
            </Typography>
            <Typography variant="body2">
              {master}
            </Typography>
          </Box>
          {/* <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
            <Typography color="text.secondary">
              ناظر:
            </Typography>
            <Typography variant="body2">
              {monitoring}
            </Typography>
          </Box> */}
          <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
            <Typography color="text.secondary">
              نوع:
            </Typography>
            <Typography variant="body2">
              {projectType}
            </Typography>
          </Box>
        </CardContent>
            <Divider variant="middle" >
                <Typography variant='caption' display='block' fontSize={12}>{`حجم فایل های  پروژه : ${usedStorageMb?.toFixed(2) ?? "0"} مگابایت`}</Typography>
            </Divider>
        </div>
        <Button
          color={'primary'}
          onClick={() => handleGoToProject({id: projectId})}
          variant={"contained"} sx={{m: 2}}>
          ورود
        </Button>
      </Card>
  )

}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    setProject: async (value: any) => dispatch(await actionSetProject(value.id)),
    setInProject: () => dispatch({type: SET_IN_PROJECT, data: true})

  }
}


const reduxCard = connect(null, mapDispatchToProps)(withRouter(CardProject))


export {reduxCard as CardProject}