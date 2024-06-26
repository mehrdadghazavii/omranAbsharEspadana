import axios from "axios";
import {BASE_URL, TIME_OUT} from 'configs/configs';
import {history} from "./history.utils";
import {store} from "../redux/store";
import {TOGGLE_LOADER} from "../redux/types/type";
import {actionExit} from "../redux/actions/actions";
import {toast} from "react-toastify";

const http = axios.create();
http.defaults.timeout = TIME_OUT;
http.defaults.baseURL = BASE_URL;

http.interceptors.request.use(function (config) {

  if (localStorage.hasOwnProperty('omranUser'))
    config.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('omranUser'))['access_token']}`
  config.headers["Access-Control-Allow-Origin"] = "*"
  store.dispatch({type: TOGGLE_LOADER, data: true})
  return config;
}, function (error) {
  store.dispatch({type: TOGGLE_LOADER, data: false})
  return Promise.reject(error);
});

http.interceptors.response.use(function (response) {
  store.dispatch({type: TOGGLE_LOADER, data: false})
  return response;
}, function (error) {
  store.dispatch({type: TOGGLE_LOADER, data: false})
  if (error.response?.status === 401 && (!!store.getState().user)) {
    store.dispatch(actionExit())
    history.push('login')
    return
  }
  else if (error.response?.status === 404) {
    return Promise.reject(error);
  }
  else if (error.response?.status === 403) {
    history.push('403')
    return
  }
  return Promise.reject(error);
});


export default http;