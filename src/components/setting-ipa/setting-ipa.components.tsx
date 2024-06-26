import React, {useState} from 'react';
import {
  Box,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Slider,
  Tooltip,
  Typography,
  useTheme
} from "@mui/material";
import classes from './setting-ipa.module.scss'
import {actionChangeBorderRadius, actionChangeFontFamily, actionChangeFontSize} from "../../redux/actions/actions";
import {connect} from "react-redux";
import {RotateLeft, SettingsOutlined} from "@mui/icons-material";

function SettingIpa(props: any) {
  const [open, setOpen] = useState(false)
  const {fontSize, borderRadius, setFontSize, setBorderRadius, fontFamily, setFontFamily} = props
  return <>
    <Tooltip title="تنظیمات">
      <IconButton className={`${classes['icon-setting']} setting-icon-help`} onClick={() => setOpen(true)} color="inherit" size="large">
        <SettingsOutlined/>
      </IconButton>
    </Tooltip>
    <Drawer
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 2
        }}
        anchor={'right'}
        open={open}
        onClose={() => setOpen(false)}
    >
      <Box m={2}>
        <Box boxShadow={2} style={{width: 200, borderRadius: useTheme().shape.borderRadius}}>
          <Box style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <Typography style={{padding: '5px 10px'}}>
              شعاع مرزها
            </Typography>
            <IconButton onClick={() => setBorderRadius(10)} size="large">
              <RotateLeft/>
            </IconButton>
          </Box>
          <Divider variant={'fullWidth'}/>
          <Box mt={5} px={2} style={{display: 'flex', alignItems: 'center'}}>
            <Typography>
              0
            </Typography>
            <Slider
                aria-label="borderRadius"
                value={borderRadius}
                valueLabelDisplay={'on'}
                step={2}
                onChange={(e, value) => setBorderRadius(value)}
                style={{margin: 'auto 1rem'}}
                marks
                min={0}
                max={30}
            />
            <Typography>
              30
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box m={2}>
        <Box boxShadow={2} style={{width: 200, borderRadius: useTheme().shape.borderRadius}}>
          <Box style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <Typography style={{padding: '5px 10px'}}>
              سایز فونت
            </Typography>
            <IconButton onClick={() => setFontSize(14)} size="large">
              <RotateLeft/>
            </IconButton>
          </Box>
          <Divider variant={'fullWidth'}/>
          <Box mt={5} px={2} style={{display: 'flex', alignItems: 'center'}}>
            <Typography>
              10
            </Typography>
            <Slider
                aria-label="Temperature"
                value={fontSize || 10}
                valueLabelDisplay={'on'}
                step={2}
                onChange={(e, value) => setFontSize(value)}
                style={{margin: 'auto 1rem'}}
                marks
                min={10}
                max={30}
            />
            <Typography>
              30
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box m={2}>
        <Box boxShadow={2} style={{width: 200, borderRadius: useTheme().shape.borderRadius}}>
          <Box style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <Typography style={{padding: '5px 10px'}}>
              فونت
            </Typography>
            <IconButton onClick={() => setFontFamily('IRANSans')} size="large">
              <RotateLeft/>
            </IconButton>
          </Box>
          <Divider variant={'fullWidth'}/>
          <Box mt={1} px={2} style={{display: 'flex', alignItems: 'center'}}>
            <RadioGroup
                name="fontSize"
                value={fontFamily}
                onChange={({target}) => setFontFamily(target.value)}
            >
              <FormControlLabel value="IRANSans" control={<Radio color="primary"/>} label="ایران سنس"/>
              <FormControlLabel value="BYekan" control={<Radio color="primary"/>} label="بی یکان"/>
              <FormControlLabel value="Vazir" control={<Radio color="primary"/>} label="وزیر"/>
            </RadioGroup>
          </Box>
        </Box>
      </Box>
    </Drawer>
  </>;

}

const mapStateToProps = (state: { borderRadius: number, fontSize: number, fontFamily: string }) => {
  return {
    fontSize: state.fontSize,
    borderRadius: state.borderRadius,
    fontFamily: state.fontFamily,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    setFontSize: (value: number) => dispatch(actionChangeFontSize(value)),
    setBorderRadius: (value: number) => dispatch(actionChangeBorderRadius(value)),
    setFontFamily: (value: string) => dispatch(actionChangeFontFamily(value))
  }
}

const reduxSetting = connect(mapStateToProps, mapDispatchToProps)(SettingIpa)

export {reduxSetting as SettingIpa}