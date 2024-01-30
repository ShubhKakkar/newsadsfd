import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { Switch, Redirect, Route, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import useRequest from "./hooks/useRequest";
import { authSuccess, logout } from "./store/auth/action";
import { addSetting } from "./store/setting/action";
import { useHistory } from "react-router-dom";

import { privateRoutes, notPrivateRoutes } from "./util/routes";
import { permissionObj, getFilteredRoutes } from "./util/permission";

import Sidebar from "./components/Sidebar/Sidebar";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Loading from "./components/Loading/Loading";

const App = () => {
  const [token, setToken] = useState(null);
  const [filteredPrivateRoutes, setFilteredPrivateRoutes] =
    useState(privateRoutes);

  const dispatch = useDispatch();
  const { loggedIn, loading, roleId, permission } = useSelector(
    (state) => state.auth
  );

  const { request, response } = useRequest();
  const { request: requestLanguages, response: responseLanguages } =
    useRequest();

  const routePath = useLocation();

  useEffect(() => {
    onTop();
  }, [routePath]);

  useEffect(() => {
    requestLanguages("GET", "admin/languages");

    const token = localStorage.getItem("token");
    if (!token) {
      dispatch(authSuccess({ loggedIn: false }));
    } else {
      setToken(token);
    }
  }, []);

  useEffect(() => {
    if (responseLanguages) {
      const { languages } = responseLanguages;

      dispatch(addSetting({ languages }));
    }
  }, [responseLanguages]);

  useEffect(() => {
    if (token) {
      request("POST", "admin/verify", { token });
    }
  }, [token]);

  useEffect(() => {
    if (response) {
      if (!response.status) {
        dispatch(logout());
      } else {
        const setting = {};

        response.setting.forEach((s) => {
          setting[s.newKey] = s.selected || s.value;
        });

        dispatch(
          authSuccess({
            loggedIn: true,
            token,
            userId: response.id,
            name: response.name,
            email: response.email,
            roleId: response.roleId,
            permission: response?.permissions
              ? permissionObj(response.permissions)
              : {},
          })
        );
        dispatch(addSetting(setting));
      }
    }
  }, [response]);

  const onTop = () => {
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (roleId === 2 && permission) {
      setFilteredPrivateRoutes(
        getFilteredRoutes(filteredPrivateRoutes, permission)
      );
    }
  }, [roleId, permission]);

  return (
    <div className="d-flex flex-column flex-root">
      <div className="d-flex flex-row flex-column-fluid page">
        {loading && <Loading />}
        {loggedIn !== null && (
          <>
            {loggedIn ? (
              <>
                <Sidebar />
                <div
                  className="d-flex flex-column flex-row-fluid wrapper"
                  id="kt_wrapper"
                >
                  <Header />
                  <Switch>
                    {filteredPrivateRoutes.map((route, index) => (
                      <Route key={index} exact {...route} />
                    ))}

                    {/* <Redirect to={oneNew ? `/${oneNew}` : "/"} /> */}
                    <Redirect to="/" />
                  </Switch>

                  <Footer />
                </div>
              </>
            ) : (
              <Switch>
                {notPrivateRoutes.map((route, index) => (
                  <Route key={index} exact {...route} />
                ))}
                <Redirect to="/login" />
              </Switch>
            )}
            <ToastContainer />
          </>
        )}
      </div>
    </div>
  );
};

export default App;
