import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Divider,
  IconButton,
  Stack,
  Typography
} from "@mui/material";
import React from "react";
import {Comment, Delete, Favorite, Visibility} from "@mui/icons-material";
import {withRouter} from 'react-router-dom'
import {motion} from 'framer-motion'
import {cardVariant} from "../../../utils/variants.motion.util";


export interface CardMessageProps {
  title: string,
  date: string,
  history: any,
  likeMessage: any,
  image: string,
  description: string,
  isLike: boolean,
  like: number,
  visit: number,
  commentCount: number,
  deleteMessage: any
  messageId: string,
  user: string
}

function CardMessage({
                       title,
                       date,
                       history,
                       image,
                       description,
                       isLike,
                       like,
                       visit,
                       likeMessage,
                       commentCount,
                       user,
                       messageId,
                       deleteMessage
                     }: CardMessageProps) {


  return (
      <Card sx={{maxWidth: 320, margin: 'auto'}}
            component={motion.div}
            variants={cardVariant}
            animate={'visible'}
            initial={'hidden'}
            whileHover={'hover'}
            exit={'exit'}
            layout
      >

        <CardHeader
            sx={{
              'div span': {
                maxWidth: 245,
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }
            }}
            action={
              <IconButton onClick={deleteMessage} color={'error'}
                  // sx={{border: '1.5px solid', borderColor: 'text.error'}}
              >
                <Delete/>
              </IconButton>
            }
            title={title}
            subheader={date}
        />
        <Divider variant={'fullWidth'}/>
        <CardActionArea>
          <CardMedia
              style={{objectFit: 'contain'}}
              component="img"
              height="194"
              onClick={() => history.push(`/message/${messageId}`)}
              image={image}
              alt={title}
          />
        </CardActionArea>
        <CardContent
            sx={{
              maxHeight: 90,
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 3,
              overflow: 'hidden',
            }}
        >
          <Typography color="text.secondary">

            {user.trim() ? 'نویسنده: ' + user : null}
            {user.trim() ? <br/> : null}

            {description}
          </Typography>
        </CardContent>
        <Divider variant={'fullWidth'}/>
        <CardActions disableSpacing sx={{display: 'block'}}>
          <Stack direction={'row'} spacing={2} alignItems={'center'} justifyContent={"space-evenly"}
                 flexWrap={'wrap'}>
            <Typography>
              <Favorite
                  onClick={likeMessage}
                  color={isLike ? 'error' : 'disabled'}/>
              &#160;
              {like}
            </Typography>
            <Typography>
              <Comment/>
              &#160;
              {commentCount}
            </Typography>
            <Typography>
              <Visibility/>
              &#160;
              {visit}
            </Typography>
          </Stack>
        </CardActions>
      </Card>
  )
}

const withRoute = withRouter(CardMessage)

export {withRoute as CardMessage}