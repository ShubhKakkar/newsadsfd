import {
  AUTH_SUCCESS,
  AUTH_LOGOUT,
  SIDEBAR_TOGGLE,
  LOADING,
  LANGUAGE,
  UPDATE,
  INIT,
  NOTIFICATION,
  CART_TOTAL,
} from "./actionTypes";
import { toast } from "react-toastify";
import { destroyCookie, setCookie } from "nookies";

export const authSuccess = (updates) => {
  if (updates.token) {
    localStorage.setItem("token", updates.token);
    setCookie(null, "token", updates.token, {
      maxAge: 30 * 24 * 60 * 60 * 100,
      path: "/",
      // sameSite: "None",
      // secure: true,
    });
  }
  return {
    type: AUTH_SUCCESS,
    updates,
  };
};

export const sidebarToggle = (updates) => {
  return {
    type: SIDEBAR_TOGGLE,
    updates,
  };
};

export const init = () => {
  localStorage.removeItem("token");
  destroyCookie(null, "token", { path: "/" });
  return {
    type: INIT,
  };
};

export const logout = () => {
  toast.success("You are now logged out!");

  localStorage.removeItem("token");
  destroyCookie(null, "token", { path: "/" });

  // window.location.reload();
  return {
    type: AUTH_LOGOUT,
  };
};

export const updateLoading = (updates) => {
  return {
    type: LOADING,
    updates,
  };
};

export const updateLanguage = (updates) => {
  return {
    type: LANGUAGE,
    updates,
  };
};

export const updateRedux = (updates) => {
  return {
    type: UPDATE,
    updates,
  };
};

export const updateNotification = (updates) => {
  return {
    type: NOTIFICATION,
    updates,
  };
};

export const updateCartTotal = (updates) => {
  return {
    type: CART_TOTAL,
    updates,
  };
};
