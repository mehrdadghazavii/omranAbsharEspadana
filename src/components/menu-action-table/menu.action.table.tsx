import React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Fade from '@mui/material/Fade';
import { Dispatch } from 'redux';
import { setToggleDetails } from 'redux/actions/actions';
import { connect, useDispatch } from 'react-redux';

interface Item {
  title:any,
  onClick:Function,
  disabled?:boolean
}

interface MenuProps {
  items:Item[],
  icon:any,
  user:any,
  menuId:any,
  setToggleDetails:any,
}

function MenuActionTable({items, icon, user, menuId}: MenuProps) {
  const [open, toggleOpen] = React.useState<HTMLElement | null>(null);

  const dispatch = useDispatch()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    dispatch(setToggleDetails(false))
    toggleOpen(e.currentTarget);
   
  };

  const handleClose = () => {
    dispatch(setToggleDetails(true))
    toggleOpen(null);
  };

  return (
      <>
        <Button color={'info'} aria-controls={menuId} aria-haspopup="true" onClick={handleClick}>
          {icon}
        </Button>
        <Menu
            id={menuId}
            anchorEl={open}
            keepMounted
            open={!!open}
            onClose={handleClose}
            TransitionComponent={Fade}
            // getContentAnchorEl={null}
            anchorOrigin={{vertical: "bottom", horizontal: "left"}}
            transformOrigin={{vertical: 'top', horizontal: 'left'}}
        >
          {items.map((item: Item, index: number) => (
              <MenuItem key={index} disabled={Boolean(item.disabled)} onClick={() => item.onClick(user)}>{item.title}</MenuItem>
          ))}
        </Menu>
      </>
  );
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    setToggleDetails: (value: any) => dispatch(setToggleDetails(value))
  }
}

const reduxHeade = connect(null, mapDispatchToProps)(MenuActionTable);

export {reduxHeade as MenuActionTable};