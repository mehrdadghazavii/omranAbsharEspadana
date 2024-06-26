import {Divider, Tab, Tabs} from "@mui/material";
import React, {useEffect} from "react";
import './menu.layout.scss'
import {CSSObject, styled, Theme} from '@mui/material/styles';
import MuiDrawer from "@mui/material/Drawer";
import {connect, useDispatch, useSelector} from "react-redux";
import {
    FaCalendarAlt,
    FaChartPie,
    FaFileContract,
    FaFileSignature,
    FaFileUpload,
    FaUsers
} from "react-icons/fa";
import {BiSupport} from "react-icons/bi";
import {drawerWidth, isMobile} from "../header/header.layout";
import {drawerListWidth, DrawersMenu} from "./components/drawers.menu.layout";
import {getVerifiedForBadge} from "../../../api/api";
import {SET_CURRENT_TAB} from "../../../redux/types/type";
import {itemsDrawers} from "../../../utils/items-drawers.utils";
import {useLocation} from 'react-router-dom'
import {makeStyles} from "@mui/styles";
import {handleSetVerifiedBadge} from "../../../redux/actions/actions";

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(9)} + 1px)`,
    },
});


export const Drawer = styled(MuiDrawer, {shouldForwardProp: (prop) => prop !== 'open'})(
    ({theme, open}) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',

        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
        '& .MuiDrawer-paper': {
            position: 'unset'
        },
    }),
);

const useStyles = makeStyles({
    paperInsideDrawerRoot: {
        '& .MuiPaper-root': {
            backgroundColor: '#DEE5E5'
        },
    },
});

const TabStyled = styled(Tab)(
    ({theme}) => ({
        borderBottom: '1px solid ' + theme.palette.divider,
        minWidth: 'unset',

    })
)


export const StyledToolbar = styled('div')(({theme}) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}))

function tabProps(index: number, label: string, open: number) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
        ...(open && {
            label
        })
    };
}

interface MenuProps {
    open: 0 | 1 | 2,
    onClose: Function,
    onOpen: Function,
    startDate: string,
    currentTab: number,
    setCurrentTab: Function,
    project: any
}

function MenuLayout(props: MenuProps) {
    const location = useLocation()
    const classes = useStyles();

    const {open, onClose, onOpen, startDate, setCurrentTab, project, currentTab} = props

    const handleDrawerClose = () => {
        onClose()
    }
    const dispatch = useDispatch();
    const [value, setValue] = React.useState(currentTab);
    const verifiedBadges = useSelector((state: any) => state.verifiedBadge);
    const allowToAddUser = useSelector((state: any) => state.userAccess?.allowToAddUser);


    const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
        isMobile && onOpen();
        setCurrentTab(newValue)
        setValue(newValue);
    };

    const handleSetBadges = async () => {
        if (project) {
            const res = await getVerifiedForBadge(project?.id, startDate)
            if (!(res instanceof Error)) {
                dispatch(handleSetVerifiedBadge(res));
            }
        } else {
            const arrayOfUrl = location.pathname.split("/");
            const res = await getVerifiedForBadge(arrayOfUrl[3], startDate)
            if (!(res instanceof Error)) {
                dispatch(handleSetVerifiedBadge(res));
            }
        }
    }


    useEffect(() => {
        handleSetBadges()
    }, [startDate])

    useEffect(() => {
        setValue(currentTab)
    }, [currentTab])

    return (
        <>
            <Drawer
                className={classes.paperInsideDrawerRoot}
                variant="permanent"
                open={open > 0 && !isMobile}
                sx={{
                    '& .MuiDrawer-paper': {
                        position: 'fixed',
                        width: 'inherit'
                    },
                    marginRight: {sm: open === 2 && itemsDrawers[value].length ? drawerListWidth + 'px' : 'inherit'}
                }}
            >
                <StyledToolbar/>
                <Divider/>
                <Tabs
                    orientation="vertical"
                    TabIndicatorProps={{
                        style: {
                            width: 5,
                        }
                    }}
                    variant="scrollable"
                    textColor="secondary"
                    indicatorColor="secondary"
                    // allowScrollButtonsMobile
                    value={value}
                    onChange={handleChangeTab}
                    aria-label="Vertical tabs example"
                    sx={{borderRight: 1, borderColor: 'divider',}}
                    scrollButtons={false}
                >
                    <TabStyled icon={<FaFileSignature size={22}/>} {...tabProps(0, "ثبت گزارش روزانه", open)} />
                    <TabStyled icon={<FaFileContract size={22}/>}{...tabProps(1, "گزارش جامع", open)} />
                    <TabStyled icon={<FaFileUpload size={22}/>}{...tabProps(2, "خلاصه گزارشات", open)} />
                    <TabStyled icon={<FaCalendarAlt size={22}/>}{...tabProps(3, "تقویم", open)} />
                    <TabStyled icon={<BiSupport size={22}/>} sx={{display: "none"}} {...tabProps(4, "پشتیبانی", open)} />
                    {allowToAddUser ?
                        <TabStyled icon={<FaUsers size={22}/>}{...tabProps(5, "کاربران", open)} /> : null
                    }
                    <TabStyled icon={<FaChartPie size={22}/>} sx={{display: "none"}} {...tabProps(6, "نمودار", open)} />
                </Tabs>
            </Drawer>
            <DrawersMenu
                // @ts-ignore
                closeDrawer={handleDrawerClose} startDate={startDate} badges={verifiedBadges} openDrawer={open === 2}
                value={value}/>
        </>
    )
}

const mapStateToProps = (state: any) => {
    return {
        currentTab: state.currentTab,
        startDate: state.startDate,
        project: state.project
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return {
        setCurrentTab: (value: number) => dispatch({type: SET_CURRENT_TAB, data: value})
    }
}

const reduxMenu = connect(mapStateToProps, mapDispatchToProps)(MenuLayout)


export
{
    reduxMenu as MenuLayout
}