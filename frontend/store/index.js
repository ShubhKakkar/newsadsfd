import { createStore, applyMiddleware, compose, combineReducers } from "redux";
import { createWrapper } from "next-redux-wrapper";
import thunk from "redux-thunk";

import authReducer from "./auth/reducer";
import settingReducer from "./setting/reducer";

let composeEnhancers = compose;
if (typeof window !== "undefined") {
  composeEnhancers =
    (process.env.NODE_ENV === "development"
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : null) || compose;
}

const rootReducer = combineReducers({
  auth: authReducer,
  setting: settingReducer,
});

const makeStore = (context) =>
  createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)));

export const wrapper = createWrapper(makeStore);
