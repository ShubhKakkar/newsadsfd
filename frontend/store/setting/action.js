import { SIDEBAR } from "./actionTypes";

export const updateSidebar = (updates) => {
  return {
    type: SIDEBAR,
    updates,
  };
};


