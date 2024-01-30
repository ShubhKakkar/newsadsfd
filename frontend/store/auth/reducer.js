import {
  AUTH_SUCCESS,
  AUTH_LOGOUT,
  SIDEBAR_TOGGLE,
  LOADING,
  LANGUAGE,
  UPDATE,
  INIT,
  NOTIFICATION,
} from "./actionTypes";

const initialState = {
  loggedIn: null,
  token: null,
  userId: null,
  email: null,
  firstName: null,
  lastName: null,
  loading: false,
  language: null,
  role: null,
  contact: null,
  profilePic: null,
  socialSettings: [],
  currencies: [],
  appLinks: [],
  contactUsSetting: [],
  contactUsSettings: {},
  countries: [],
  businessName: null,
  currentCountry: null,
  categories: [],
  notification: [],
};

const authReducer = (state = initialState, action) => {

  switch (action.type) {
    case AUTH_SUCCESS:
      return {
        ...state,
        loggedIn: true,
        ...action.updates,
      };
    case INIT:
    case AUTH_LOGOUT:
      return {
        ...state,
        token: null,
        userId: null,
        email: null,
        firstName: null,
        lastName: null,
        loading: false,
        role: null,
        contact: null,
        profilePic: null,
        loggedIn: false,
      };
    case SIDEBAR_TOGGLE:
      return {
        ...state,
        ...action.updates,
      };
    case LOADING:
      return {
        ...state,
        ...action.updates,
      };
    case LANGUAGE:
      return {
        ...state,
        ...action.updates,
      };
    case UPDATE:
      return {
        ...state,
        ...action.updates,
      };
      case NOTIFICATION:
        return {
          ...state,
          ...action.updates,
        };
    default:
      return state;
  }
};

export default authReducer;
