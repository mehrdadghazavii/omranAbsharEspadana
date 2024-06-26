import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {AiFillFileExcel, AiFillFilePdf} from "react-icons/ai";
import {BiExport} from "react-icons/bi";
import {ListItemIcon, ListItemText, Stack} from "@mui/material";
import {exportExcel} from "../../utils/exportEXCEL.utils";

interface ExportMenuProps {
    exportPdf: Function,
    excelData: any,
    columnWidths: any,
    excelHeaders: any,
    downloadImages:Function,
    onClick : Function
}

export function ExportMenu({exportPdf, excelData , excelHeaders,  downloadImages, columnWidths, onClick}: ExportMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    onClick();
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
      <div>
        <Button
            variant={'outlined'}
            color={'info'}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
        >
          <BiExport size={24}/>
          Export
        </Button>
        <Menu
            aria-labelledby="demo-positioned-button"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
        >
          <MenuItem disabled={excelData === null} onClick={() => {
              exportExcel(excelHeaders, excelData, columnWidths);
              downloadImages();
          }}>
              <Stack direction={'row'} spacing={2} alignItems={'center'}>
                  <ListItemIcon>
                      <AiFillFileExcel  size={24}/>
                  </ListItemIcon>
                  <ListItemText>EXCEL</ListItemText>
              </Stack>
          </MenuItem>
          <MenuItem disabled={excelData === null} onClick={() => {
            exportPdf()
            downloadImages()
            }}>
            <Stack direction={'row'} spacing={2} alignItems={'center'}>
              <ListItemIcon>
                <AiFillFilePdf size={24}/>
              </ListItemIcon>
              <ListItemText>PDF</ListItemText>
            </Stack>
          </MenuItem>
          {/*<MenuItem onClick={handleCreateDataExport}>*/}
          {/*  <Stack direction={'row'} spacing={2} alignItems={'center'}>*/}
          {/*    <ListItemIcon>*/}
          {/*      <HiRefresh size={24}/>*/}
          {/*    </ListItemIcon>*/}
          {/*    <ListItemText>Refresh</ListItemText>*/}
          {/*  </Stack>*/}
          {/*</MenuItem>*/}
        </Menu>
      </div>
  );
}
