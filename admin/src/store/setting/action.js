import { ADD_SETTING } from "./actionTypes";

export const addSetting = (updates) => {
  return {
    type: ADD_SETTING,
    updates,
  };
};
