import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme
} from "@mui/material";
import React, { useState } from "react";
import {FullscreenIpa} from "../fullscreen/fullscreenIpa.component";
import { DetailsDialog } from 'components/details-dialog/details-dialog';
import { connect, useDispatch, useSelector } from "react-redux";
import { Dispatch } from 'redux';
import { setConfirmToggleDetails, setToggleDetails } from 'redux/actions/actions';


export interface Column {
  id: string,
  minWidth: number,
  label: string,
  fontSize?: number,
  align: "inherit" | "left" | "center" | "right" | "justify",
  format?: any
}

export type bodyFucn = (column: Column, row: object, index: number) => React.ReactNode

export interface tableProps {
  toggleDetails : boolean
  columns: Column[],
  rows?: any[],
  bodyFucn: bodyFucn
  style?: {
    row?: object
    column?: object
  }
  setToggleDetails:any
}

function TableIpa(props: tableProps) {
  const {columns, rows, bodyFucn , toggleDetails , setToggleDetails} = props
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)

  const dispatch = useDispatch()

  const confirmToggleDetails = useSelector((state:any) => state.confirmToggleDetails)
  
  return (
      <FullscreenIpa>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow style={{backgroundColor: useTheme().palette.background.default}}>
                {columns.map((column) => (
                    <TableCell
                        key={column.id}
                        align={column.align}
                        style={{minWidth: column.minWidth, fontWeight: 'bold', fontSize: column.fontSize || 13}}
                    >
                      {column.label}
                    </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <div>
  <DetailsDialog
    title="Delete Post?"
    open={confirmToggleDetails}
    // setOpen={setConfirmOpen}
    rowValue={selectedRow}
    columnValue={columns}
  />
</div>
            <TableBody>
              {rows && React.Children.toArray(rows.map((row: any, index: number) =>
                  (
                      <TableRow
                          hover
                          onClick={() => {
                            if (toggleDetails) {
                              dispatch(setConfirmToggleDetails(true))
                              setSelectedRow(row)
                            } else {
                              dispatch(setConfirmToggleDetails(false))
                              setSelectedRow(row);
                            }
                          }}
                      >
                        {React.Children.toArray(columns.map((column) => {
                              return bodyFucn(column, row, index)
                            }
                        ))}
                        <Badge
                            invisible={!row.isRejected}
                            badgeContent="رد شده"
                            color="error"
                            anchorOrigin={{
                              vertical: "top",
                              horizontal: "right",
                            }}
                            sx={{'& .MuiBadge-badge': {width: 'max-content', right: '30px',borderRadius: '4px'} }}
                        />
                      </TableRow>
                  ))
              )
              }
            </TableBody>
          </Table>
        </TableContainer>
      </FullscreenIpa>
  )
}

const mapStateToProps = (state: any) => {
  return{
      toggleDetails: state.toggleDetails
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    setToggleDetails: (value: any) => dispatch(setToggleDetails(value))
  }
}

const reduxHead = connect(mapStateToProps, mapDispatchToProps )(TableIpa)

export {reduxHead as TableIpa}