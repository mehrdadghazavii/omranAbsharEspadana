import {
  RESET,
  SET_BORDERRADIUS,
  SET_COMPANY,
  SET_CURRENT_PAGE,
  SET_CURRENT_TAB,
  SET_END_DATE,
  SET_FONT_FAMILY,
  SET_FONTSIZE,
  SET_IN_PROJECT,
  SET_LOGIN,
  SET_PROJECT,
  SET_START_DATE,
  SET_TAB,
  SET_USER,
  SET_USER_ACCESS,
  TOGGLE_DARK,
  TOGGLE_LOADER,
  TOGGLE_MENU,
  SET_TOUR_GUIDE,
  SET_TOGGLE_DETAILS,
  SET_CONFIRM_TOGGLE_DETAILS,
  SET_SHOW_COPY_ROW_IN_ITEM,
  SET_SHOW_MODAL_DATE_COPY_ROW,
  TIMER_CODE,
  SET_VERIFIED_BADGE,
} from "../types/type";
import moment from "jalali-moment";

export const initialState: any = {
  dark: false,
  menu: false,
  loader: false,
  fontFamily: localStorage.getItem("fontFamilyIpa") ?? "IRANSans",
  borderRadius:
    Number(localStorage.getItem("borderRadiusIpa")) && Number(localStorage.getItem("borderRadiusIpa")) !== 0
      ? Number(localStorage.getItem("borderRadiusIpa"))
      : 10,
  fontSize: localStorage.hasOwnProperty("fontSizeIpa") ? +localStorage?.getItem("fontSizeIpa") : 14,
  user: localStorage.hasOwnProperty("omranUser") && JSON.parse(localStorage.getItem("omranUser")),
  currentTab: 3,
  company: null,
  project: null,
  startDate: moment().format("YYYY-MM-DD"),
  endDate: moment().format("YYYY-MM-DD"),
  inProject: false,
  currentPage: "",
  userAccess: null,
  tourGuide: [],
  toggleDetails: true,
  confirmToggleDetails: false,
  showCopyRowInItem: false,
  showModalDateCopyRow: false,
  timerCode: false,
  verifiedBadge: {},
};

interface Action {
  type: string;
  data: any;
}

export const Reducer = (state = initialState, action: Action) => {
  switch (action.type) {
    case SET_USER_ACCESS:
      return { ...state, userAccess: action.data };
    case SET_CURRENT_TAB:
      return { ...state, currentTab: action.data };
    case RESET:
      return { ...action.data };
    case SET_END_DATE:
      return { ...state, endDate: action.data };
    case SET_CURRENT_PAGE:
      return { ...state, currentPage: action.data };
    case SET_IN_PROJECT:
      return { ...state, inProject: action.data };
    case SET_START_DATE:
      return { ...state, startDate: action.data };
    case SET_TAB:
      return { ...state, currentTab: action.data };
    case SET_PROJECT:
      return { ...state, project: action.data };
    case SET_COMPANY:
      return { ...state, company: action.data };
    case SET_BORDERRADIUS:
      return { ...state, borderRadius: action.data };
    case SET_FONTSIZE:
      return { ...state, fontSize: action.data };
    case TOGGLE_MENU:
      return { ...state, menu: action.data };
    case SET_FONT_FAMILY:
      return { ...state, fontFamily: action.data };
    case SET_LOGIN:
      return { ...state, login: action.data };
    case TOGGLE_LOADER:
      return { ...state, loader: action.data };
    case SET_USER:
      return { ...state, user: action.data };
    case TOGGLE_DARK:
      return { ...state, dark: action.data };
    case SET_TOUR_GUIDE:
      return { ...state, tourGuide: action.data };
    case SET_TOGGLE_DETAILS:
      return { ...state, toggleDetails: action.data };
    case SET_CONFIRM_TOGGLE_DETAILS:
      return { ...state, confirmToggleDetails: action.data };
    case SET_SHOW_COPY_ROW_IN_ITEM:
      return { ...state, showCopyRowInItem: action.data };
    case SET_SHOW_MODAL_DATE_COPY_ROW:
      return { ...state, showModalDateCopyRow: action.data };
    case TIMER_CODE:
      return {...state, timerCode: action.data};
      case SET_VERIFIED_BADGE:
      return {...state, verifiedBadge: action.data};
    default:
      return state;
  }
};
