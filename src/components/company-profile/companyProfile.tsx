import React, {useEffect, useRef, useState} from 'react';
import Modal from "@mui/material/Modal";
import Backdrop from "@mui/material/Backdrop";
import Fade from "@mui/material/Fade";
import Box from "@mui/material/Box";
import {Button, Divider, Grid, IconButton, Tab, Tooltip, Typography, useTheme} from "@mui/material";
import {TabContext, TabList, TabPanel} from "@mui/lab";
import InfoComponent from "../company-profile/components/info.component";
import CompanyImg from "../../asset/images/userProfile640.png";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import {Check} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import useMediaQuery from "@mui/material/useMediaQuery";
import {ChangeCompaniesLogo, getCompanyPayments, getCompanyProfile} from "../../api/api";
import {toast} from "react-toastify";
import Compressor from "compressorjs";
import PaymentsComponent from "./components/Payments.component";

const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: ".5rem",
    overflow: "hidden",
    overflowY: "auto",
};
function CompanyProfile({ open, onClose, companyId }) {
    const image = useRef(null);
    const [payments, setPayments] = useState<any>();
    const [img, setImg] = useState<any>("");
    const [companyInfo, setCompanyInfo] = useState<any>({});
    const [value, setValue] = React.useState('1');
    const [editProfileBtn, setEditProfileBtn] = useState<boolean>(false);
    const [showImgSubmitBtn, setShowImgSubmitBtn] = useState<boolean>(false);

    const theme = useTheme();
    const lg = useMediaQuery(theme.breakpoints.down("lg"));
    const md = useMediaQuery(theme.breakpoints.down("md"));

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };

    const getCompany = async () => {
        const res = await getCompanyProfile(companyId);
        if (!(res instanceof Error)) {
            setCompanyInfo(res);
        } else {
            toast.error("خطایی رخ داد");
        }
    };

    const getPayments = async () => {
        const res: object = await getCompanyPayments(companyId);
        if (!(res instanceof Error)) {
            setPayments(res);
        } else {
            toast.error("تراکنشی یافت نشد!");
        }
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        new Compressor(file, {
            width: 650,
            height: 650,
            quality: 1,
            resize: 'contain',
            async success(res) {
                const compressedFileFromBlob = new File([res], file.name, {
                    type: res.type,
                });
                setImg(await toBase64(compressedFileFromBlob));
            },
            error(err) {
                console.log(err.message);
            }
        })
    };

    const toBase64 = (file: any) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });

    const handleUploadImage = async (e) => {
        e.preventDefault();
        if (img) {
            const res: any = await ChangeCompaniesLogo({
                companyId: companyId,
                logo: img.slice(22),
            });
            if (!(res instanceof Error)) {
                setShowImgSubmitBtn(false);
                toast.success("آپلود عکس با موفقیت انجام شد");
            } else {
                toast.error("آپلود عکس با خطا مواجه شد");
            }
        }
    };


    useEffect(() => {
        getCompany();
        getPayments();
    }, []);

    return (
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                open={open}
                onClose={() => onClose()}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        timeout: 500,
                    },
                }}
            >
                <Fade in={open}>
                    <Box sx={style} width={lg ? "90%" : "60%"} height={md ? "90%" : "auto"}>
                        <Grid container>
                            <Grid item xs={12} md={9} order={2} p={2}>
                                <Box>
                                    <TabContext value={value}>
                                        <TabList variant='fullWidth' onChange={handleChange}>
                                            <Tab label="مشخصات شرکت" value="1" />
                                        </TabList>
                                        <TabPanel value="1" sx={{ px: 0 }}>
                                            <InfoComponent company={companyInfo} refreshCompany={getCompany}/>
                                        </TabPanel>
                                    </TabContext>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={3} order={1} sx={{ backgroundColor: (theme) => theme.palette.primary.main }}>
                                <Box textAlign={"center"} py={8}>
                                    <Tooltip title="ویرایش تصویر">
                                        <form noValidate onSubmit={handleUploadImage}>
                                            <Box
                                                style={{ position: "relative", borderRadius: "50%", overflow: "hidden" }}
                                                width={180}
                                                height={180}
                                                mx="auto"
                                                onMouseEnter={() => setEditProfileBtn(true)}
                                                onMouseLeave={() => setEditProfileBtn(false)}
                                            >
                                                <Button component="label" fullWidth sx={{ height: "100%" }}>
                                                    <img
                                                        src={img ? img : companyInfo.logo || CompanyImg}
                                                        alt="company profile"
                                                        width={180}
                                                        height={180}
                                                        style={{ filter: editProfileBtn ? "blur(.8px)" : "unset" }}
                                                    />
                                                    <input
                                                        hidden
                                                        accept="image/*"
                                                        type="file"
                                                        ref={image}
                                                        onChange={(e) => {
                                                            handleImageChange(e);
                                                            setShowImgSubmitBtn(true);
                                                        }}
                                                    />
                                                    {editProfileBtn ? (
                                                        <Fade in={editProfileBtn}>
                                                            <Typography
                                                                variant="h4"
                                                                bgcolor="#00000069"
                                                                color="#bebebe"
                                                                position="absolute"
                                                                bottom={0}
                                                                left={0}
                                                                width="100%"
                                                            >
                                                                <CameraAltIcon />
                                                            </Typography>
                                                        </Fade>
                                                    ) : null}
                                                </Button>
                                            </Box>
                                            <Divider
                                                sx={{
                                                    flexShrink: 0,
                                                    borderWidth: 0,
                                                    borderStyle: "solid",
                                                    borderColor: "#64646469",
                                                    borderBottomWidth: "thick",
                                                    marginRight: "auto",
                                                    marginLeft: "auto",
                                                    marginTop: "12px",
                                                    boxShadow: "0 0 2px 4px #64646469",
                                                    borderRadius: "50%",
                                                    width: "135px",
                                                }}
                                            />
                                            {/*Confirm Or Cancel Selected Photo*/}
                                            {showImgSubmitBtn ? (
                                                <>
                                                    <IconButton onClick={(e) => handleUploadImage(e)}>
                                                        <Check type="submit" fontSize="medium" />
                                                    </IconButton>
                                                    <IconButton onClick={() => {
                                                        setShowImgSubmitBtn(false);
                                                        setImg('');
                                                    }}>
                                                        <CloseIcon color="error" type="submit" fontSize="medium" />
                                                    </IconButton>
                                                </>
                                            ) : null}
                                        </form>
                                    </Tooltip>
                                    <Tooltip title={companyInfo.name ?? ''}>
                                        <Typography
                                            variant="body1"
                                            overflow='hidden'
                                            whiteSpace='nowrap'
                                            textOverflow='ellipsis'
                                            fontWeight={500}
                                            mt={5}
                                            mx={1}
                                        >
                                            {companyInfo.name ?? ''}
                                        </Typography>
                                    </Tooltip>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Fade>
            </Modal>
    );
}

export default CompanyProfile;