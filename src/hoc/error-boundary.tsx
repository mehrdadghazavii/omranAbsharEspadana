import React, {ErrorInfo} from "react";
import {withRouter} from 'react-router-dom'

class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
  }

  state: any = {error: null, errorInfo: null};

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Catch errors in any components below and re-render with error message
    console.log('error is:', errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    // You can also log error messages to an error reporting service here
  }

  render() {
    if (this.state.errorInfo) {
      // Error path
      // @ts-ignore
      this.props.history.push('/')
    }
    // Normally, just render children
    return this.props.children;
  }
}


const withRoutClass = withRouter(ErrorBoundary)

export {withRoutClass as ErrorBoundary}