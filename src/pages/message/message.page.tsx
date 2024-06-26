import {useParams} from 'react-router-dom'
import React, {useEffect, useState} from "react";
import {getComments, likeMessage, postComment, visitMessage} from "../../api/api";
import {toast} from "react-toastify";
import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import {Comment, Favorite, Send, Visibility} from "@mui/icons-material";
import {FullscreenMessage} from "../../components";


export function MessagePage() {

  const [message, setMessage] = useState<any>(null)
  const [comments, setComments] = useState<any>([])
  const [text, setText] = useState<any>('')


  const {messageId} = useParams()

  const getAllNeedData = async () => {
    const resMessage = await visitMessage(messageId)
    const resComments = await getComments(messageId)

    if (!(resMessage instanceof Error) && !(resComments instanceof Error)) {
      setMessage(resMessage)
      setComments(resComments)
    } else
      toast.error('دریافت داده با خطا مواجه شد')
  }

  useEffect(() => {
    getAllNeedData()
  }, [])

  const handleLikeMessage = async () => {
    const res = await likeMessage(messageId)
    if (!(res instanceof Error)) {
      const temp = {...message}
      temp.like = +temp.like + (temp.isLiked ? -1 : 1)
      temp.isLiked = !temp.isLiked
      setMessage(temp)
    } else
      toast.error('در پسندیدن پیام خطا رخ داد')
  }

  const handleAddComment = async () => {
    if (!text)
      return
    const res = await postComment({MessageId: messageId, Text: text})
    if (!(res instanceof Error)) {
      const tmp = {...message}
      tmp.commentCount += 1
      setText('')
      setComments([...comments, res])
      setMessage(tmp)
    } else
      toast.error('ثبت پیام با خطا مواجه شد')
  }


  return (
      <Grid container sx={{
        maxWidth: 1000, margin: {
          lg: 'auto'
        }
      }} spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
                title={message?.title}
                subheader={message ? new Date(message.insertTime).toLocaleString('fa') : ''}
            />
            <Divider variant={'fullWidth'}/>
            <CardActionArea>
              <FullscreenMessage message={message}/>
            </CardActionArea>
            <CardContent>
              <Typography color="text.secondary">

                {message?.user.trim() ? 'نویسنده: ' + message?.user : null}
                {message?.user.trim() ? <br/> : null}

                {message?.description}
              </Typography>
            </CardContent>
            <Divider variant={'fullWidth'}/>
            <CardActions disableSpacing sx={{display: 'block'}}>
              <Stack direction={'row'} spacing={2} alignItems={'center'} justifyContent={"space-evenly"}
                     flexWrap={'wrap'}>
                <Typography>
                  <Favorite
                      onClick={handleLikeMessage}
                      color={message?.isLiked ? 'error' : 'disabled'}/>
                  &#160;
                  {message?.like}
                </Typography>
                <Typography>
                  <Comment/>
                  &#160;
                  {message?.commentCount}
                </Typography>
                <Typography>
                  <Visibility/>
                  &#160;
                  {message?.visit}
                </Typography>
              </Stack>
            </CardActions>
            <CardActions>
              <TextField
                  placeholder="پیام ..."
                  fullWidth
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  value={text}
                  onChange={({target}) => setText(target.value)}
                  size={'small'}
              />
              <IconButton onClick={handleAddComment}
                          color="info"
                          sx={{marginLeft: '15px', transform: 'rotate(180deg)'}}
                          type={'submit'}>
                <Send/>
              </IconButton>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Paper>
            <Box p={3}>
              {comments.map((C: any) => (
                  <Box mb={2}>
                    <Paper elevation={3}>
                      <Box py={1} px={2} display={'flex'} justifyContent={'space-between'}>
                        <Typography variant={'body1'}>
                          {C.userInfo}
                        </Typography>
                        <Typography color={'text.secondary'} variant={'body2'}>
                          {new Date(C.insertTime).toLocaleString('fa')}
                        </Typography>
                      </Box>
                      <Divider variant={'fullWidth'}/>
                      <Box px={2} py={1}>
                        <Typography variant={'body2'}>
                          {C.text}
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
  )

}
