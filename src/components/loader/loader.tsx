import React from 'react'
import {Backdrop} from "@mui/material";
import {connect} from "react-redux";
import {ScaleLoader} from "react-spinners";
import {useTheme} from "@mui/material/styles";
import { matchPath } from 'react-router'
import { useLocation } from 'react-router-dom'

function Loader(props: any) {
  const location = useLocation()
  const isProjectsListPage = matchPath(location.pathname, {
    path: "/:companyId/projects",
    exact: true,
    strict: true
  });
  return (
      <Backdrop className={'loader'} open={props.loader && location.pathname !== '/'}>
        <ScaleLoader height={200} width={18} radius={2} speedMultiplier={1.75} margin={5} color={useTheme().palette.secondary.main}/>
      </Backdrop>
  )
}

const mapStateToProps = (state: { loader: boolean }) => {
  return {
    loader: state.loader,
  }
}

const ReduxLoader = connect(mapStateToProps)(Loader)

export {ReduxLoader as Loader}