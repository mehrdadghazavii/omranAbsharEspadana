import {useEffect, useRef, useState} from "react";
import * as yup from "yup";
import {useFormik} from "formik";
import {toast} from "react-toastify";
import {Box, Button, Grid, IconButton, Paper, TextField} from "@mui/material";
import {AddCircle} from "@mui/icons-material";
import {ButtonsModal, ModalIpa} from "../../components";
import {deleteMessage, getMessages, likeMessage, postMessage} from "../../api/api";
import {CardMessage} from "./components/card.message.component";
import {useParams} from 'react-router-dom';
import OmranLogo from "../../asset/images/mainLogo.png";
import {connect} from "react-redux";
import {motion, AnimatePresence} from 'framer-motion'


function MessagesPage({userId, writeMessageAccess}: any) {
  const [messages, setMessages] = useState<any>([])
  const [add, setAdd] = useState<boolean>(false)
  const [filteredMessages, setFilteredMessages] = useState<any>([])
  const [img, setImg] = useState<any>('')
  const image = useRef(null)
  const {companyId, projectId} = useParams()

  const validation = yup.object({
    Title: yup
        .string()
        .required('نباید خالی باشد'),
    Description: yup
        .string()
        .required('نباید خالی باشد'),
  })

  const addFormik = useFormik({
    initialValues: ({
      file: '',
      Title: '',
      Description: '',
      ProjectId: projectId ? projectId : null,
      CompanyId: companyId ? companyId : null,
      UserId: userId,
    }),
    validationSchema: validation,
    onSubmit: async (values, {resetForm}) => {
      const res: any = await postMessage({...values, file: img || ''})
      if (!(res instanceof Error)) {
        resetForm()
        setImg('')
        setAdd(false)
        getAllNeedData()
        toast.success('پیام با موفقیت ثبت شد')
      } else
        toast.error('ثبت پیام با خطا مواجه شد')
    }
  })

  const handleLikeMessage = async (messageId: string) => {
    const res = await likeMessage(messageId)
    if (!(res instanceof Error))
      getAllNeedData()
    else
      toast.error('در پسندیدن پیام خطا رخ داد')
  }

  const handleDeleteMessage = async (messageId: string) => {
    const res = await deleteMessage(messageId)
    if (!(res instanceof Error)) {
      getAllNeedData()
      toast.success('پیام با موفقیت حذف گردید')
    } else
      toast.error('حذف پیام با خطا مواجه شد')
  }

  const handleSearchChange = (key: string) => {
    if (key) {
      const filtered = messages.filter((M: any) => {
            return !!(M.title.includes(key) || M.description.includes(key));
          }
      )
      setFilteredMessages(filtered)
    } else {
      setFilteredMessages(messages)
    }
  }

  const getAllNeedData = async () => {

    const id = companyId || projectId
    const type = companyId ? 3 : 2;
    const res = await getMessages(type, id)
    if (!(res instanceof Error)) {
      setMessages(res)
      setFilteredMessages(res)
    } else {
      toast.error('دریافت داده با خطا مواجه شد')
    }
  }


  useEffect(() => {
    getAllNeedData()
  }, [])

  const toBase64 = (file: any) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });


  return (
      <>
        <IconButton
            onClick={() => setAdd(true)}
            sx={{
              position: 'fixed',
              right: 15,
              bottom: 27,
              zIndex: 1
            }}
            disabled={projectId && !writeMessageAccess}
            color={'primary'}
        >
          <AddCircle sx={{fontSize: 55}}/>
        </IconButton>
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
            // animate={{y: 100}}
              layout
        >
          <AnimatePresence>
            {filteredMessages ? filteredMessages?.map((M: any) => (
                    <Grid key={M.id} item xs={12} sm={6} md={4} lg={3} xl={2}>
                      <CardMessage
                          user={M.user}
                          deleteMessage={() => handleDeleteMessage(M.messageId)}
                          title={M.title}
                          date={new Date(M.insertTime).toLocaleDateString('fa')}
                          likeMessage={() => handleLikeMessage(M.messageId)}
                          image={M.pictureUrl}
                          description={M.description}
                          isLike={M.isLiked}
                          like={M.like}
                          visit={M.visit}
                          commentCount={M.commentCount}
                          messageId={M.messageId}/>
                    </Grid>
                )
            ) : null}
          </AnimatePresence>
        </Grid>
        {add ?
            <ModalIpa open={add} onClose={() => setAdd(false)} title={'درج پیام'}>
              <form noValidate onSubmit={addFormik.handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box style={{display: 'flex', flexDirection: 'column', width: 200, margin: 'auto'}}>
                      <img
                          width={200}
                          height={200}
                          style={{objectFit: 'contain'}}
                          src={img || OmranLogo}/>
                      <Button
                          variant="contained"
                          component="label"
                          fullWidth
                      >
                        انتخاب تصویر
                        <input
                            type="file"
                            hidden
                            ref={image}
                            onChange={async () => {
                              setImg(await toBase64(image.current!.files[0]))
                            }}
                        />
                      </Button>
                    </Box>

                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                        id={'Title'}
                        fullWidth
                        label={'عنوان'}
                        value={addFormik.values.Title}
                        onChange={addFormik.handleChange}
                        error={addFormik.touched.Title && Boolean(addFormik.errors.Title)}
                        helperText={(addFormik.touched.Title && addFormik.errors.Title)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                        id={'Description'}
                        fullWidth
                        multiline
                        minRows={2}
                        maxRows={4}
                        label={'توضیحات'}
                        value={addFormik.values.Description}
                        onChange={addFormik.handleChange}
                        error={addFormik.touched.Description && Boolean(addFormik.errors.Description)}
                        helperText={(addFormik.touched.Description && addFormik.errors.Description)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ButtonsModal onClose={() => {
                      setAdd(false)
                      setImg('')
                      addFormik.handleReset(1)
                    }} textSubmit={'ثبت'} textClose={'انصراف'}/>
                  </Grid>
                </Grid>
              </form>
            </ModalIpa>
            : null}
      </>
  )
}

const mapStateToProps = (state: any) => {
  return {
    writeMessageAccess: state.userAccess ? state.userAccess.writeMessageAccess : true,
    userId: state.user.id
  }
}

const reduxMessage = connect(mapStateToProps)(MessagesPage)


export {reduxMessage as MessagesPage}