import { SIDEBAR } from "./actionTypes";

const initialState = {
  isSidebarOpen: false,

};

const settingReducer = (state = initialState, action) => {
  switch (action.type) {
    case SIDEBAR:
      return {
        ...state,
        ...action.updates,
      };
    default:
      return state;
  }
};

export default settingReducer;
