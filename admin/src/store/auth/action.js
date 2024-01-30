import {
  AUTH_SUCCESS,
  AUTH_LOGOUT,
  SIDEBAR_TOGGLE,
  LOADING,
  UPDATE_TOKEN,
} from "./actionTypes";
import { toast } from "react-toastify";

export const authSuccess = (updates) => {
  if (updates.token) {
    localStorage.setItem("token", updates.token);
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

export const logout = () => {
  localStorage.removeItem("token");
//   toast.success("You are now logged out!");
//   var testObject = {
//     url:window.location.href,
//     time:25
//   };
// // Put the object into storage
//   localStorage.setItem('testObject', JSON.stringify(testObject));
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

export const updateToken = (updates) => {
  localStorage.setItem("token", updates.token);
  return {
    type: UPDATE_TOKEN,
    updates,
  };
};
