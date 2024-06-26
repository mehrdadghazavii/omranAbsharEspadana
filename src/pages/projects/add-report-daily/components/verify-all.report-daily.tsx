import {IconButton} from "@mui/material";
import {CheckCircle} from "@mui/icons-material";

interface VerifyAllProps {
  onClick: Function,
}

export function VerifyAllReportDaily({onClick}: VerifyAllProps) {


  // @ts-ignore
  return (<IconButton color={'primary'} size={'small'} style={{position: 'absolute', top: -28, left: -15}} onClick={onClick}>
    <CheckCircle sx={{fontSize:'3rem'}} />
  </IconButton>)
}