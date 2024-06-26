import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import {Provider} from "react-redux";
import {store} from "./redux/store";
import {ToastContainer} from "react-toastify";
import 'normalize.css'
import 'react-toastify/dist/ReactToastify.css';
import 'asset/styles/global.style.scss'
import {AppRoute} from "./route/app.route";
// window.onbeforeunload = function () {return false;}

ReactDOM.render(
  <Provider store={store}>
    <AppRoute/>
    <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        theme={store.getState().dark ? 'dark' : 'colored'}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
    />
  </Provider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
