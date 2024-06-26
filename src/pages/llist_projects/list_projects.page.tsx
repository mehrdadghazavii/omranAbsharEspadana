import * as yup from "yup";
import * as Yup from "yup";
import {Dispatch} from "redux";
import moment from "jalali-moment";
import {matchPath} from 'react-router'
import {getCompanies} from "../../api/api";
import {useParams} from 'react-router-dom'
import {useLocation} from 'react-router-dom'
import React, {useEffect, useState} from "react";
import {connect, useDispatch} from "react-redux";
import {Grid, Paper, TextField,} from "@mui/material";
import {CardProject} from "./components/card.project";
import {motion, AnimatePresence} from 'framer-motion'
import {SET_IN_PROJECT} from "../../redux/types/type";
import SkeletonProject from "./components/skeleton.card.project";
import {actionCompany, handleShowCopyRowInItem} from "../../redux/actions/actions";

export const postOrPutValidation = yup.object({
    Name: yup
        .string()
        .required('نباید خالی باشد'),
    ProjectType: yup
        .string()
        .required('نباید خالی باشد'),
    Master: yup
        .string()
        .required('نباید خالی باشد'),
    TotalArea: yup.string()
        .matches(/^\d+(\.\d{1,2})?$/, "فقط عدد تا 2 رقم اعشار وارد شود."),
    UsefulMeter: yup.string()
        .matches(/^\d+(\.\d{1,2})?$/, "فقط عدد تا 2 رقم اعشار وارد شود."),
    ResidentialUnit: yup.string()
        .matches(/^[0-9]+$/, "فقط باید عدد وارد شود"),
    StartDate: Yup.date()
        .nullable()
        .typeError('تاریخ معتبر نیست'),
    EndDate: Yup.date()
        .nullable()
        .typeError('تاریخ معتبر نیست')
        .test("تاریخ پایان از شروع باید بزرگتر باشد", "تاریخ پایان از شروع باید بزرگتر باشد", function (value: Date) {
            if (!value) {
                return true;
            }
            return moment(value).diff(this.parent.StartDate, "day") + 1 > 0;
        }),
    ProductionLicenseDate: Yup.date()
        .nullable()
        .typeError('تاریخ معتبر نیست'),
})

function ListProjects({company, setCompany, loader, unSetInProject}: any) {
    const [projects, setProjects] = useState<any>(company?.projects)
    const [filteredProject, setFilteredProject] = useState<any>(null)
    const {companyId} = useParams();
    const dispatch = useDispatch();
    const location = useLocation();
    const isProjectsListPage = matchPath(location.pathname, {
        path: "/:companyId/projects",
        exact: true,
        strict: true
    });

    useEffect(() => {
        if (isProjectsListPage?.isExact) {
            unSetInProject()
            dispatch(handleShowCopyRowInItem(false))
        }
    }, [isProjectsListPage]);

    const updateCompany = async () => {
        const res: any = await getCompanies()
        if (!(res instanceof Error)) {
            const company = res.find((company: any) => company.id === companyId)
            setCompany(company)
            setProjects(company.projects)
        }
    }

    const handleSearchChange = (key: string) => {
        if (key) {
            const filteredCompany = company.projects.filter((P: any) => {
                    if (P.name.includes(key) || P.monitoring.includes(key)) {
                        return P;
                    }
                    return false;
                }
            )
            setFilteredProject(filteredCompany)
        } else {
            setFilteredProject(company.projects)
        }
    }

    const getAllNeedData = async () => {
        await setFilteredProject(projects)
    }

    useEffect(() => {
        if (!projects) {
            updateCompany();
        }
        getAllNeedData()
    }, [])

    useEffect(() => {
        if (projects)
            getAllNeedData()
    }, [projects])


    return (
        <>
            <Paper sx={{mb: 3}} className={`search-box-help`}>
                <TextField
                    label={'دنبال چی هستی؟'}
                    variant={'outlined'}
                    size="medium"
                    fullWidth
                    onChange={({target}) => {
                        handleSearchChange(target.value)
                    }}
                />
            </Paper>
            <Grid container spacing={3}
                  component={motion.div}
                  animate={{opacity: 1}}
                  initial={{opacity: 0}}
                  exit={{opacity: 0}}
                  layout
            >
                <AnimatePresence>
                    {company?.projects ? filteredProject?.map((P: any) => (
                                <Grid key={P.id} item xs={12} sm={6} md={4} lg={3} xl={2}>
                                    <CardProject
                                        // @ts-ignore
                                        projectId={P.id}
                                        name={P.name}
                                        master={P.master}
                                        companyId={companyId}
                                        monitoring={P.monitoring}
                                        startDate={P.startDate}
                                        insertDate={P.insertTime}
                                        projectType={P.projectType}
                                        endDate={P.endDate}
                                        productionLicenseDate={P.productionLicenseDate}
                                        totalArea={P.totalArea}
                                        usefulMeter={P.usefulMeter}
                                        residentialUnit={P.residentialUnit}
                                        description={P.description}
                                        address={P.address}
                                        updateCompany={updateCompany}
                                    />
                                </Grid>
                            )
                        )
                        : loader ? <SkeletonProject/>
                            : null}
                </AnimatePresence>
            </Grid>
        </>
    )
}


const mapStateToProps = (state: any) => (
    {
        company: state.company,
        userAccess: state.userAccess,
        loader: state.loader
    }
)

const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        setCompany: (value: any) => dispatch(actionCompany(value)),
        unSetInProject: () => dispatch({type: SET_IN_PROJECT, data: false}),
    };
};


const reduxProjects = connect(mapStateToProps, mapDispatchToProps)(ListProjects)

export {reduxProjects as ListProjects}