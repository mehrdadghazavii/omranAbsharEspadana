import {Box, useTheme} from "@mui/material";
import React from "react";
import classes from './bubbles.module.scss'

function BackgroundBubbles() {
  const array: any[] = new Array<any>(10).fill('')
  const bgColor = useTheme().palette.background.paper
  const borderRadius = useTheme().shape.borderRadius
  return (
      <Box className={classes.wrapper}>
        <ul className={classes['bg-bubbles']}>
          {React.Children.toArray(array.map(() => <li style={{backgroundColor: bgColor, borderRadius}}/>))}
        </ul>
      </Box>
  )
}

export {BackgroundBubbles}