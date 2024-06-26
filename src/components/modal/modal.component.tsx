import {alpha, Box, Divider, IconButton, Modal} from "@mui/material";
import React from "react";
import {styled} from "@mui/material/styles";
import classes from './modal.module.scss'
import {Close} from "@mui/icons-material";


const ModalStyled = styled(Modal)(({theme}) => ({
    overflow: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    width: '75%',
    maxWidth: 1000,
    margin: 'auto',
    maxHeight: '85vh',
    [theme.breakpoints.down('sm')]: {
        width: '100%',
    },
    [theme.breakpoints.up('lg')]: {
        // display: 'flex',
    }
}))

const ModalContainer = styled('div')(({theme}) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[5],
  // padding: theme.spacing(1, 2, 2),
  borderRadius: theme.shape.borderRadius,
}))

const Backdrop = styled('div')`
  z-index: -1;
  position: fixed;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  -webkit-tap-highlight-color: transparent;
`;

function ModalIpa(props: { children: React.ReactNode, open: boolean, onClose: Function, title: string, styleNew?: any }) {

  return (
      <ModalStyled
          open={props.open}
          style={props.styleNew}

          aria-labelledby="modal"
          aria-describedby="modal"
          onClose={() => props.onClose()}
          closeAfterTransition
          // @ts-ignore
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}>
        <ModalContainer>
          <Box px={2}
               sx={(theme) => ({
                 backgroundColor: alpha(theme.palette.primary.light, 1),
                 borderStartEndRadius: theme.shape.borderRadius,
                 borderStartStartRadius: theme.shape.borderRadius
               })}
               className={classes.titleForm}>
            <h3>{props.title}</h3>
            <IconButton style={{marginRight: 5}} size={"medium"} onClick={() => props.onClose()}>
              <Close/>
            </IconButton>
          </Box>
          <Divider variant={'fullWidth'}/>
          <Box p={2}>
            {props.children}
          </Box>
        </ModalContainer>
      </ModalStyled>
  )
}

export {ModalIpa}