import {
    Accordion, AccordionDetails,
    AccordionSummary,
    Badge, Box,
    Grid,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import {MoreVert} from "@mui/icons-material";
import React, {useState} from "react";
import {ButtonsModal, ModalIpa} from "../../../components";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDateFnsJalali} from "@mui/x-date-pickers/AdapterDateFnsJalali";
import {DatePicker} from "@mui/x-date-pickers";
import moment from "jalali-moment";
import {useFormik} from "formik";
import {putProject} from "../../../api/api";
import {toast} from "react-toastify";
import {postOrPutValidation} from "../list_projects.page";
import {AiOutlineProject} from "react-icons/ai";

function UserAccessProject(props) {
    const {
        master,
        monitoring,
        startDate,
        endDate,
        productionLicenseDate,
        totalArea,
        usefulMeter,
        residentialUnit,
        projectType,
        name,
        description,
        address,
        projectId,
        companyId,
        updateCompany
    } = props;
    const [editProject, setEditProject] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const EditProjectModal = () => {
        const editFormik = useFormik({
            initialValues: ({
                Id: projectId,
                Master: master,
                CompanyId: companyId,
                Monitoring: monitoring,
                StartDate: startDate,
                EndDate: endDate,
                ProductionLicenseDate: productionLicenseDate,
                TotalArea: totalArea,
                UsefulMeter: usefulMeter,
                ResidentialUnit: residentialUnit,
                ProjectType: projectType,
                Name: name,
                Description: description,
                Address: address,
            }),
            validationSchema: postOrPutValidation,
            onSubmit: async (values, {resetForm}) => {

                const res = await putProject(values)

                if (!(res instanceof Error)) {
                    updateCompany();
                    toast.success('ویرایش پروژه با موفقیت انجام شد');
                    resetForm();
                    setEditProject(false);
                } else
                    toast.error('ویرایش پروژه با موفقیت انجام نشد!')
            }
        });

        const handleCloseModal = () => {
            editFormik.handleReset(1);
            setEditProject(false);
        }

        return (
            <ModalIpa title="ویرایش پروژه" open={editProject} onClose={handleCloseModal}>
                <form onSubmit={editFormik.handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                id={'Name'}
                                fullWidth
                                label={'نام پروژه'}
                                value={editFormik.values.Name}
                                onChange={editFormik.handleChange}
                                error={editFormik.touched.Name && Boolean(editFormik.errors.Name)}
                                helperText={(editFormik.touched.Name && editFormik.errors.Name)}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                id={'ProjectType'}
                                fullWidth
                                label={'نوع پروژه'}
                                value={editFormik.values.ProjectType}
                                onChange={editFormik.handleChange}
                                error={editFormik.touched.ProjectType && Boolean(editFormik.errors.ProjectType)}
                                helperText={(editFormik.touched.ProjectType && editFormik.errors.ProjectType)}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                id={'Master'}
                                fullWidth
                                label={'کارفرما'}
                                value={editFormik.values.Master}
                                onChange={editFormik.handleChange}
                                error={editFormik.touched.Master && Boolean(editFormik.errors.Master)}
                                helperText={(editFormik.touched.Master && editFormik.errors.Master)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                    <Typography>اطلاعات تکمیلی</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container spacing={3}>
                                        {/*StartDate*/}
                                        <Grid item xs={12} md={4}>
                                            <LocalizationProvider dateAdapter={AdapterDateFnsJalali}
                                                                  dateFormats={{monthShort: "MMMM"}}>
                                                <DatePicker
                                                    label={'تاریخ شروع'}
                                                    views={["year", "month", "day"]}
                                                    sx={{width: "100%"}}
                                                    value={moment(editFormik.values.StartDate).toDate()}
                                                    onChange={(date) => editFormik.setFieldValue("StartDate", moment(date).locale('en').format("YYYY-MM-DD"))}
                                                />
                                            </LocalizationProvider>
                                            <Box component="span" sx={{color: '#e53935', fontSize: "0.85rem"}}>
                                                {editFormik.touched.StartDate && editFormik.errors.StartDate}
                                                {editFormik.touched.StartDate && Boolean(editFormik.errors.StartDate)}
                                            </Box>
                                        </Grid>
                                        {/*EndDate*/}
                                        <Grid item xs={12} md={4}>
                                            <LocalizationProvider dateAdapter={AdapterDateFnsJalali}
                                                                  dateFormats={{monthShort: "MMMM"}}>
                                                <DatePicker
                                                    label={'تاریخ پایان'}
                                                    views={["year", "month", "day"]}
                                                    sx={{width: "100%"}}
                                                    value={moment(editFormik.values.EndDate).toDate()}
                                                    onChange={(date) => editFormik.setFieldValue("EndDate", moment(date).locale('en').format("YYYY-MM-DD"))}
                                                />
                                            </LocalizationProvider>
                                            <Box component="span" sx={{color: '#e53935', fontSize: "0.85rem"}}>
                                                {editFormik.touched.EndDate && editFormik.errors.EndDate}
                                                {editFormik.touched.EndDate && Boolean(editFormik.errors.EndDate)}
                                            </Box>
                                        </Grid>
                                        {/*ProductionLicenseDate*/}
                                        <Grid item xs={12} md={4}>
                                            <LocalizationProvider dateAdapter={AdapterDateFnsJalali}
                                                                  dateFormats={{monthShort: "MMMM"}}>
                                                <DatePicker
                                                    label={'تاریخ پروانه'}
                                                    views={["year", "month", "day"]}
                                                    sx={{width: "100%"}}
                                                    value={moment(editFormik.values.ProductionLicenseDate).toDate()}
                                                    onChange={(date) => editFormik.setFieldValue("ProductionLicenseDate", moment(date).locale('en').format("YYYY-MM-DD"))}
                                                />
                                            </LocalizationProvider>
                                            <Box component="span" sx={{color: '#e53935', fontSize: "0.85rem"}}>
                                                {editFormik.touched.ProductionLicenseDate && editFormik.errors.ProductionLicenseDate}
                                                {editFormik.touched.ProductionLicenseDate && Boolean(editFormik.errors.ProductionLicenseDate)}
                                            </Box>
                                        </Grid>
                                        {/*TotalArea*/}
                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                id={'TotalArea'}
                                                fullWidth
                                                label={'متراژ کل'}
                                                placeholder={'متر مربع'}
                                                value={editFormik.values.TotalArea}
                                                onChange={editFormik.handleChange}
                                                error={editFormik.touched.TotalArea && Boolean(editFormik.errors.TotalArea)}
                                                helperText={(editFormik.touched.TotalArea && editFormik.errors.TotalArea)}
                                            />
                                        </Grid>
                                        {/*UsefulMeter*/}
                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                id={'UsefulMeter'}
                                                fullWidth
                                                label={'متراژ مفید'}
                                                placeholder={'متر مربع'}
                                                value={editFormik.values.UsefulMeter}
                                                onChange={editFormik.handleChange}
                                                error={editFormik.touched.UsefulMeter && Boolean(editFormik.errors.UsefulMeter)}
                                                helperText={(editFormik.touched.UsefulMeter && editFormik.errors.UsefulMeter)}
                                            />
                                        </Grid>
                                        {/*residentialUnit*/}
                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                id={'ResidentialUnit'}
                                                fullWidth
                                                label={'تعداد واحد'}
                                                value={editFormik.values.ResidentialUnit}
                                                onChange={editFormik.handleChange}
                                                error={editFormik.touched.ResidentialUnit && Boolean(editFormik.errors.ResidentialUnit)}
                                                helperText={(editFormik.touched.ResidentialUnit && editFormik.errors.ResidentialUnit)}
                                            />
                                        </Grid>
                                        {/*Monitoring*/}
                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                id={'Monitoring'}
                                                fullWidth
                                                label={'ناظر'}
                                                value={editFormik.values.Monitoring}
                                                onChange={editFormik.handleChange}
                                                error={editFormik.touched.Monitoring && Boolean(editFormik.errors.Monitoring)}
                                                helperText={(editFormik.touched.Monitoring && editFormik.errors.Monitoring)}
                                            />
                                        </Grid>
                                        {/*Address*/}
                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                id={'Address'}
                                                fullWidth
                                                placeholder="آدرس ..."
                                                multiline
                                                maxRows={2}
                                                value={editFormik.values.Address}
                                                onChange={editFormik.handleChange}
                                                error={editFormik.touched.Address && Boolean(editFormik.errors.Address)}
                                                helperText={(editFormik.touched.Address && editFormik.errors.Address)}
                                            />
                                        </Grid>
                                        {/*Description*/}
                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                id={'Description'}
                                                fullWidth
                                                placeholder="توضیحات ..."
                                                multiline
                                                maxRows={5}
                                                value={editFormik.values.Description}
                                                onChange={editFormik.handleChange}
                                                error={editFormik.touched.Description && Boolean(editFormik.errors.Description)}
                                                helperText={(editFormik.touched.Description && editFormik.errors.Description)}
                                            />
                                        </Grid>
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                        </Grid>
                        <Grid item xs={12}>
                            <ButtonsModal onClose={() => {
                                setEditProject(false)
                                editFormik.handleReset(1)
                            }} textSubmit={'ثبت'} textClose={'انصراف'}/>
                        </Grid>
                    </Grid>
                </form>
            </ModalIpa>
        )
    }

    const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton onClick={handleClickMenu}>
                <Badge color='error' variant='dot' anchorOrigin={{vertical: 'top', horizontal: 'right'}}>
                    <MoreVert/>
                </Badge>
            </IconButton>
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
            >
                <MenuItem onClick={() => setEditProject(!editProject)}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                        spacing={2}
                    >
                        <Typography variant={"button"}>ویرایش پروژه</Typography>
                        <AiOutlineProject size='24px'/>
                    </Stack>
                </MenuItem>
            </Menu>
            {editProject && <EditProjectModal/>}
        </>
    );
}

export default UserAccessProject;