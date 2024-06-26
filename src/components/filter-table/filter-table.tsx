import {Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography, useTheme} from "@mui/material";
import {AddCircleOutline} from "@mui/icons-material";
import {useDispatch, useSelector} from "react-redux";
import {handleShowCopyRowInItem, handleShowModalDateCopyRow, setToggleDetails} from "../../redux/actions/actions";
import {useEffect} from "react";
import useMediaQuery from "@mui/material/useMediaQuery";

interface propsFilter {
    limit: number;
    onChangeLimit: Function;
    keySearch: string;
    onChangeSearch: Function;
    onClickAdd?: Function;
    titleAdd?: string;
    numberOfSelectedCopy?: number | null;
}

function FilterTable(props: propsFilter) {
    const {
        limit,
        onChangeLimit,
        keySearch,
        onChangeSearch,
        titleAdd,
        onClickAdd,
        numberOfSelectedCopy,
    } = props;

    const {userType} = useSelector((state: any) => state.userAccess);
    const showCheckboxColumn = useSelector((state: any) => state.showCopyRowInItem);
    const currentPage = useSelector((state: any) => state.currentPage);
    const currentTab = useSelector((state: any) => state.currentTab);
    const allowToAddUser = useSelector((state: any) => state.userAccess?.allowToAddUser);

    const theme = useTheme();
    const green = theme.palette.success.main;
    const dispatch = useDispatch();
    const matches = useMediaQuery(theme.breakpoints.down("md"));
    const handleCopyRowInItem = () => {
        dispatch(handleShowCopyRowInItem(!showCheckboxColumn));
    };
    const handleModalDateCopyRow = () => {
        dispatch(handleShowModalDateCopyRow(true));
    };

    useEffect(() => {
        if (showCheckboxColumn) {
            dispatch(setToggleDetails(false));
        } else {
            dispatch(setToggleDetails(true));
        }
    }, [showCheckboxColumn]);

    useEffect(() => {
        dispatch(handleShowCopyRowInItem(false));
    }, [currentTab, currentPage]);

    return (
        <Grid container spacing={3} justifyContent={"space-between"} alignItems={"center"}>
            <Grid item md={7} xs={12}>
                <Grid container justifyContent={"flex-start"} spacing={3}>
                    {onClickAdd && titleAdd && userType !== 2 && userType !== 3 && userType !== 4 && currentTab !== 5? (
                        <Grid item sm={4} xs={12}>
                            <Button
                                fullWidth
                                onClick={() => onClickAdd()}
                                variant={"contained"}
                                // style={{ backgroundColor: theme.palette.primary.main }}
                                color='primary'
                            >
                                {titleAdd}
                                <AddCircleOutline style={{marginRight: 6, fontSize: 22}}/>
                            </Button>
                        </Grid>
                    ) :  onClickAdd && titleAdd && allowToAddUser && currentTab === 5 ? (
                            <Grid item sm={4} xs={12}>
                                <Button
                                    fullWidth
                                    onClick={() => onClickAdd()}
                                    variant={"contained"}
                                    // style={{ backgroundColor: theme.palette.primary.main }}
                                    color='primary'
                                >
                                    {titleAdd}
                                    <AddCircleOutline style={{marginRight: 6, fontSize: 22}}/>
                                </Button>
                            </Grid>
                        ) : null}

                    <Grid item sm={8} xs={12}>
                        <TextField
                            label={"دنبال چی هستی؟"}
                            variant={"outlined"}
                            size="small"
                            fullWidth
                            value={keySearch}
                            onChange={({target}) => {
                                onChangeSearch(target.value);
                            }}
                        />
                    </Grid>
                </Grid>
            </Grid>

            <Grid item md={5} xs={12} style={{textAlign: "end"}}>
                <Grid container justifyContent={"flex-end"} alignItems={"center"} spacing={1}>
                    <Grid item order={matches ? 4 : 0}>
                        <FormControl size={"small"} variant={"outlined"}>
                            <InputLabel htmlFor={"count"}>تعداد</InputLabel>
                            <Select
                                labelId={"count"}
                                value={limit}
                                onChange={({target}) => {
                                    onChangeLimit(target.value);
                                }}
                                label="تعداد"
                            >
                                <MenuItem value={10}>10</MenuItem>
                                <MenuItem value={25}>25</MenuItem>
                                <MenuItem value={50}>50</MenuItem>
                                <MenuItem value={100}>100</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    {showCheckboxColumn ? (
                        <Grid item>
                            <Button onClick={() => handleModalDateCopyRow()} color={"info"} variant={"outlined"}>
                                <Typography variant={"button"} sx={{display: "inline-block"}}>
                                    انتخاب بازه زمانی
                                </Typography>
                                <Typography
                                    sx={{display: "inline-block"}}
                                    variant={"body2"}
                                >{`(${numberOfSelectedCopy} مورد انتخاب شده)`}</Typography>
                            </Button>
                        </Grid>
                    ) : currentTab !== 5 && userType === 1 ? (
                        <Grid item>
                            <Button onClick={() => handleCopyRowInItem()} color={"info"} variant={"outlined"}>
                                کپی ردیف
                            </Button>
                        </Grid>
                    ) : null}
                </Grid>
            </Grid>
        </Grid>
    );
}

export {FilterTable};
