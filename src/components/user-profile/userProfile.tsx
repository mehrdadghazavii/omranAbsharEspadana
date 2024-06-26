import * as React from "react";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import { Button, Divider, Grid, IconButton, Tab, Tooltip, Typography, useTheme } from "@mui/material";
import UserImg from "asset/images/userProfile640.png";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useEffect, useRef, useState } from "react";
import { getUserInfo, uploadUserImage } from "../../api/api";
import { toast } from "react-toastify";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { Check } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import InfoComponent from "./components/info.component";
import ChangePassComponent from "./components/changePass.component";
import ChangePhoneNumberComponent from "./components/changePhoneNumber.component";
import Compressor from 'compressorjs';

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

export default function UserProfile({ open, onClose }) {
  const image = useRef(null);
  const [img, setImg] = useState<any>("");
  const [userInfo, setUserInfo] = useState<any>({});
  const [value, setValue] = React.useState('1');
  const [editProfileBtn, setEditProfileBtn] = useState<boolean>(false);
  const [showImgSubmitBtn, setShowImgSubmitBtn] = useState<boolean>(false);

  const theme = useTheme();
  const lg = useMediaQuery(theme.breakpoints.down("lg"));
  const md = useMediaQuery(theme.breakpoints.down("md"));

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const getUser = async () => {
    const res = await getUserInfo();
    if (!(res instanceof Error)) {
      setUserInfo(res);
    } else {
      toast.error("خطایی رخ داد");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    new Compressor(file, {
      width: 650,
      height: 650,
      quality: 1,
      resize: 'cover',
      success(res) {
        const compressedFileFromBlob = new File([res], file.name, {
          type: res.type,
        });
    // console.log(compressedFileFromBlob);
        setImg(compressedFileFromBlob);
      },
      error(err) {
        console.log(err.message);
      }
    })
  };

  const handleUploadImage = async (e) => {
    e.preventDefault();
    if (img) {
      const res: any = await uploadUserImage({
        imageName: img.name,
        imageFile: img,
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
    getUser();
  }, []);


  return (
    <>
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
                      <Tab label="مشخصات" value="1" />
                      <Tab label="تغییر شماره همراه" value="2" />
                      <Tab label="تغییر رمز عبور" value="3" />
                    </TabList>
                    <TabPanel value="1" sx={{ px: 0 }}>
                      <InfoComponent user={userInfo} refreshUser={getUser}/>
                    </TabPanel>
                    <TabPanel value="2" sx={{ px: 0 }}>
                      <ChangePhoneNumberComponent/>
                    </TabPanel>
                    <TabPanel value="3" sx={{ px: 0 }}>
                      <ChangePassComponent/>
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
                            src={img ? URL.createObjectURL(img) : userInfo.profilePath || UserImg}
                            alt="user profile"
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
                  <Typography variant="h6" mt={5}>
                    {`${userInfo.firstName ?? ''} ${userInfo.lastName ?? ''}`}
                  </Typography>
                </Box>
                <Divider variant="fullWidth" />
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Modal>
    </>
  );
}
