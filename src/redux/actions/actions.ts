import {
  RESET,
  SET_USER,
  SET_LOGIN,
  TIMER_CODE,
  SET_PROJECT,
  SET_COMPANY,
  SET_FONTSIZE,
  SET_END_DATE,
  SET_START_DATE,
  SET_TOUR_GUIDE,
  SET_USER_ACCESS,
  SET_CURRENT_TAB,
  SET_FONT_FAMILY,
  SET_CURRENT_PAGE,
  SET_BORDERRADIUS,
  SET_VERIFIED_BADGE,
  SET_TOGGLE_DETAILS,
  SET_CONFIRM_TOGGLE_DETAILS,
  SET_SHOW_COPY_ROW_IN_ITEM,
  SET_SHOW_MODAL_DATE_COPY_ROW,
} from "../types/type";
import { getAccessUserProject, getProject } from "../../api/api";
import { initialState } from "../reducer/reducer";
import { store } from "../store";

export const actionCompany = (data: any) => {
  return {
    type: SET_COMPANY,
    data,
  };
};

export const actionLogin = (data: any) => {
  localStorage.setItem("omranUser", JSON.stringify(data));
  return {
    type: SET_USER,
    data,
  };
};

export const actionExit = () => {
  localStorage.removeItem("omranUser");
  return {
    type: RESET,
    data: { ...initialState, user: null },
  };
};

export const actionChangeFontSize = (data: any) => {
  localStorage.setItem("fontSizeIpa", data);
  return {
    type: SET_FONTSIZE,
    data,
  };
};

export const actionChangeBorderRadius = (data: any) => {
  localStorage.setItem("borderRadiusIpa", data);
  return {
    type: SET_BORDERRADIUS,
    data,
  };
};

export const actionChangeFontFamily = (data: string) => {
  localStorage.setItem("fontFamilyIpa", data);
  return {
    type: SET_FONT_FAMILY,
    data,
  };
};

export const setLogin = (data: boolean) => ({
  type: SET_LOGIN,
  data,
});

export const actionSetProject = async (id: string) => {
  const res = await getProject(id);
  const resUserAccess = await getAccessUserProject(id);

  if (!(res instanceof Error) && !(resUserAccess instanceof Error)) {
    store.dispatch({ type: SET_USER_ACCESS, data: resUserAccess });
    return {
      type: SET_PROJECT,
      data: res,
    };
  }
  return {
    type: SET_PROJECT,
    data: null,
  };
};

export const setTourGuide = (data: any) => {
  return {
    type: SET_TOUR_GUIDE,
    data,
  };
};

export const setToggleDetails = (data: boolean) => {
  return {
    type: SET_TOGGLE_DETAILS,
    data,
  };
};

export const setConfirmToggleDetails = (data: boolean) => {
  return {
    type: SET_CONFIRM_TOGGLE_DETAILS,
    data,
  };
};
export const handleShowCopyRowInItem = (data: boolean) => {
  return {
    type: SET_SHOW_COPY_ROW_IN_ITEM,
    data,
  };
};
export const handleShowModalDateCopyRow = (data: boolean) => {
  return {
    type: SET_SHOW_MODAL_DATE_COPY_ROW,
    data,
  };
};

export const handleTimerCode = (data: boolean) => {
  return {
    type: TIMER_CODE,
    data,
  };
};

export const handleSetStartDate = (data: any) => {
  return {
    type: SET_START_DATE,
    data,
  };
};

export const handleSetEndDate = (data: any) => {
  return {
    type: SET_END_DATE,
    data,
  };
};

export const handleSetCurrentTab = (data: number) => {
  return {
    type: SET_CURRENT_TAB,
    data,
  };
};

export const handleSetCurrentPage = (data: string) => {
  return {
    type: SET_CURRENT_PAGE,
    data,
  };
};
export const handleSetVerifiedBadge = (data: {}) => {
  return {
    type: SET_VERIFIED_BADGE,
    data,
  };
};