import {Button, Grid} from "@mui/material";

function ButtonsModal({onClose, textSubmit, textClose}: { onClose: Function, textSubmit: string, textClose: string }) {

  return (
      <Grid container spacing={2} >
        <Grid item xs={4} style={{maxWidth:300, minWidth:100}}>
          <Button variant="contained" color={'primary'}
                  size={'medium'}
                  fullWidth
                  type='submit'>
            {textSubmit}
          </Button>
        </Grid>
        <Grid item xs={4} style={{maxWidth:300, minWidth:100}}>
          <Button variant="outlined"
                  size={'medium'}
                  onClick={() => onClose()}
                  fullWidth>
            {textClose}
          </Button>
        </Grid>
      </Grid>

  )
}


export {ButtonsModal}