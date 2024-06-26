import {handleSetCurrentPage, handleSetCurrentTab, handleSetStartDate} from "../../../redux/actions/actions";
import {Box, Card, Divider, Grid, Tooltip, Typography, TypographyProps} from "@mui/material";
import {AdapterDateFnsJalali} from "@mui/x-date-pickers/AdapterDateFnsJalali";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {getCalenderDayInfo, GetCalenderData} from "../../../api/api";
import {DateCalendar, PickersDay} from "@mui/x-date-pickers";
import useMediaQuery from "@mui/material/useMediaQuery";
import {ArrowBackIos} from "@mui/icons-material";
import React, {useEffect, useState} from 'react';
import { useHistory } from 'react-router-dom';
import {styled} from "@mui/material/styles";
import {useParams} from "react-router-dom";
import {ModalIpa} from "../../../components";
import {useDispatch} from "react-redux";
import moment from "jalali-moment";
import {useFormik} from "formik";

function ProjectCalender(startDate) {
    const [openModal, setOpenModal] = useState<any>(false);
    const [calenderData, setCalenderData] = useState(null);
    const [selectedDate, setSelectedDate] = useState<any>(startDate);
    const [calenderDayInfo, setCalenderDayInfo] = useState(null);

    const history = useHistory();
    const {companyId, projectId} = useParams();
    const dispatch = useDispatch();
    const match = useMediaQuery("(min-width: 600px)");

    const CustomDay = (props) => {
        const {day, ...other} = props;
        const formattedDay = moment(day).format('YYYY-MM-DD');
        const dayData = calenderData?.find(d => moment(d.date).format('YYYY-MM-DD') === formattedDay);

        const isHoliday = dayData?.isHoliday;
        const actionNeeded = dayData?.actionNeeded;

        return (
            <Tooltip title={'نیاز به بررسی'} disableHoverListener={!actionNeeded}>
                <PickersDay
                    onClick={() => setOpenModal(!openModal)}
                    day={day}
                    {...other}
                    sx={{
                        fontSize: 17, fontWeight: 500,
                        color: actionNeeded ? '#000000' : isHoliday ? "#FFFFFF" : "#637454",
                        bgcolor: actionNeeded ? '#FFC145' : isHoliday ? "#ff7c7c" : "#f8f8f8",
                        ':hover': {bgcolor: actionNeeded ? 'rgb(255 170 0)' : isHoliday ? "rgb(255 78 78)" : "rgb(221 221 221)"},
                        borderRadius: '8px',
                    }}
                />
            </Tooltip>
        );
    };

    const ItemListStyled = styled(Typography)<TypographyProps>(({theme}) => ({
        width: "100%",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        cursor: 'pointer',
        transition: '0.3s',
        ':hover': {
            backgroundColor: 'rgb(236 236 236)', color: 'blue', borderRadius: 4, padding: '0 8px',
            '& .MuiSvgIcon-root': {visibility: 'visible'}
        },
    }))

    const calenderStyles = {
        border: `1px solid #efefef`,
        borderRadius: '8px',
        height: 'unset',
        maxHeight: 'unset',
        width: '100%',
        '& .MuiYearCalendar-root': {width: '100%'},
        '& .MuiPickersSlideTransition-root': {minHeight: '487px'},
        '& .MuiDayCalendar-header': {
            width: '100%',
            justifyContent: 'space-around',
            '& MuiDayCalendar-weekDayLabel': {width: '100%', justifyContent: 'space-around'},
        },
        '& .MuiDayCalendar-weekContainer': {
            justifyContent: 'space-around',
            '& .MuiPickersDay-root': {width: '80%', height: '95px'},
        },
        '& .MuiIconButton-edgeStart': {
            '&:before': {content: '"ماه بعد"', fontSize: '12px'}
        },
        '& .MuiIconButton-edgeEnd': {
            '&:after': {content: '"ماه قبل"', fontSize: '12px'},
        },
    }

    const CalenderGuideBox = (props) => {
        const {title, color} = props;
        return (
            <Box component='div' display='flex' alignItems='center' justifyContent='center'>
                <Box component='div' sx={{
                    width: '15px',
                    height: '15px',
                    bgcolor: color,
                    borderRadius: 0.5,
                    mx: 0.5,
                    border: `1px solid ${color}`
                }}/>
                <Typography component='span' variant='body1' fontWeight={500} fontSize={12}>{title}</Typography>
            </Box>
        );
    };

    const handleGetCalenderData = async (data) => {
        const res = await GetCalenderData(projectId, data);
        if (!(res instanceof Error)) {
            setCalenderData(res);
        } else {
            console.log(Error);
        }
    }

    const handleGetCalenderDayInfo = async (date) => {
        const formattedDate = moment(date).format('YYYY-MM-DD');
        const res = await getCalenderDayInfo(projectId, formattedDate);
        if (!(res instanceof Error)) {
            setCalenderDayInfo(res);
        } else {
            console.log(Error);
        }
    }

    const handleClickItem = (targetPage: string) => {
        dispatch(handleSetStartDate(selectedDate));
        dispatch(handleSetCurrentTab(0));
        dispatch(handleSetCurrentPage(targetPage));
        history.push(`/${companyId}/projects/${projectId}/report-daily/${moment(selectedDate).locale('en').format('YYYY-MM-DD')}/${targetPage} `);
    }

    const formik = useFormik({
        initialValues: {
            year: moment(Date.now()).locale('fa').format('YYYY'),
            month: moment(Date.now()).locale('fa').format('MM')
        }, onSubmit: async (values) => {
            const res = await GetCalenderData(projectId, values);
            if (!(res instanceof Error)) {
                setCalenderData(res);
            } else {
                console.log(Error);
            }
        }
    });

    useEffect(() => {
        handleGetCalenderData(formik.values);
    }, [formik.values]);

    return (
        <>
            <Card sx={{py: 5, px: match && 5}}>
                <LocalizationProvider dateAdapter={AdapterDateFnsJalali}>
                    <DateCalendar
                        dayOfWeekFormatter={day => day}
                        views={['year', 'day']}
                        onChange={date => {
                            handleGetCalenderDayInfo(date);
                            setSelectedDate(moment(date).format("YYYY-MM-DD"));
                        }}
                        onMonthChange={(date) => formik.setValues({
                            month: moment(date).locale('fa').format('MM'),
                            year: moment(date).locale('fa').format('YYYY')
                        })}
                        onYearChange={(date) => formik.setValues({
                            month: moment(date).locale('fa').format('MM'),
                            year: moment(date).locale('fa').format('YYYY')
                        })}
                        slots={{day: CustomDay}}
                        sx={match && calenderStyles}
                        // Calculating minimum and maximum year that can be selected
                        maxDate={moment().add(20, 'jYear').toDate()}
                        minDate={moment().subtract(20, 'jYear').toDate()}
                    />
                </LocalizationProvider>
                <Box textAlign='center' mt={1}>
                    <Typography variant='body1' fontWeight={600} mb={2}>
                        راهنمای تقویم
                    </Typography>
                    <Grid container mt={1} rowGap={2}>
                        <Grid item xs={4}>
                            <CalenderGuideBox title='امروز' color={''}/>
                        </Grid>
                        <Grid item xs={4}>
                            <CalenderGuideBox title='روز نیاز به رسیدگی' color='#FFC145'/>
                        </Grid>
                        <Grid item xs={4}>
                            <CalenderGuideBox title='روز تعطیل' color='#ff7c7c'/>
                        </Grid>
                    </Grid>
                </Box>
            </Card>
            {/*Single Day Information Section*/}
            {openModal && calenderDayInfo ?
                <ModalIpa
                    open={openModal}
                    onClose={() => {
                        setOpenModal(false);
                        setCalenderDayInfo(null);
                    }}
                    title={moment(selectedDate).locale('fa').format('dddd - D MMMM - YYYY')}
                >
                    <Grid container>
                        <Grid item xs={12} md={4}>
                            <Typography component={'div'} fontWeight={600} textAlign='center'>
                                موارد رد شده
                            </Typography>
                            <Divider variant='middle'/>
                            <ul style={{listStyle: 'none'}}>
                                {calenderDayInfo?.rejected.map((item: any, index: number) => {
                                    return (
                                        <li key={index}>
                                            <ItemListStyled onClick={() => handleClickItem(item.itemName)}>
                                                {item.message}
                                                <ArrowBackIos visibility='collapse' color='action' fontSize='small'/>
                                            </ItemListStyled>
                                        </li>
                                    )
                                })}
                            </ul>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography component={'div'} fontWeight={600} textAlign='center'>
                                موارد تایید نشده
                            </Typography>
                            <Divider variant='middle'/>
                            <ul style={{listStyle: 'none'}}>
                                {calenderDayInfo?.unVerified.map((item: any, index: number) => {
                                    return (
                                        <li key={index}>
                                            <ItemListStyled onClick={() => handleClickItem(item.itemName)}>
                                                {item?.message}
                                                <ArrowBackIos visibility='collapse' color='action' fontSize='small' sx={{transition: '0.1s'}}/>
                                            </ItemListStyled>
                                        </li>
                                    )
                                })}
                            </ul>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography component={'div'} fontWeight={600} textAlign='center'>
                                مناسبت های روز
                            </Typography>
                            <Divider variant='middle'/>
                            <ul style={{listStyle: 'none'}}>
                                {calenderDayInfo?.events.map((item: any, index: number) => {
                                    return (
                                        <li key={index}>
                                            <Tooltip title={`${item.message}`}>
                                                <ItemListStyled>
                                                    {item?.message}
                                                </ItemListStyled>
                                            </Tooltip>
                                        </li>
                                    )
                                })}
                            </ul>
                        </Grid>
                    </Grid>
                </ModalIpa> : null
            }
        </>
    );
}

export default ProjectCalender;