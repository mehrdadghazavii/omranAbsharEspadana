import {useState} from 'react';
import {ModalIpa} from "../modal/modal.component";
import MainLogo from "../../asset/images/mainLogo.png";
import {AddBoxOutlined, IosShare} from "@mui/icons-material";
import {Button, CardActions, Grid, Paper, Typography} from "@mui/material";

function PwaNotice() {

    const [open, setOpen] = useState(true);


    return (
        <ModalIpa
            styleNew={{width: '100%', height: '100vh'}}
            open={!!open} onClose={() => setOpen(false)}
            title={""}
        >
            <Grid container py={5} px={2}>
                <Grid item xs={12} justifyContent={"center"} display={"flex"} mt={8} mb={5}>
                    <img src={MainLogo} width={90} alt="logo"/>
                </Grid>

                <Grid item xs={12} textAlign='center'>
                    <Typography variant="button">
                        وب‌اپلیکیشن عمران آبشار را به صفحه اصلی گوشی‌تان اضافه کنید.
                    </Typography>
                </Grid>

                <Grid item xs={12} mt={2} mb={5}>
                    <Paper sx={{padding: 3, border: '1px solid #bebebe', borderRadius: "10px"}}>

                        <Typography sx={{ lineHeight: 2.5 }}>
                            1. در نوار پایین دکمه
                            <sub><IosShare color={"info"}/></sub>
                            «Share» را انتخاب کنید.
                        </Typography>

                        <Typography sx={{ lineHeight: 2.5 }}>
                            2. در منو باز شده ، گزینه
                            <sub><AddBoxOutlined color={"info"}/></sub>
                            «Add to home screen» را انتخاب کنید.
                        </Typography>

                        <Typography sx={{ lineHeight: 2.5 }}>3. در مرحله بعد «Add» را انتخاب کنید.</Typography>

                        <CardActions>
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={() => setOpen(!open)}>
                                متوجه شدم
                            </Button>
                        </CardActions>

                    </Paper>
                </Grid>
            </Grid>
        </ModalIpa>
    );
}

export default PwaNotice;