import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";

import "./Login.css";
import useRequest from "../../hooks/useRequest";
import { authSuccess } from "../../store/auth/action";
import { addSetting } from "../../store/setting/action";
import { GoogleIcon } from "../../util/Svg";
import { permissionObj } from "../../util/permission";
import { Navigate } from "react-router";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const history = useHistory();

  const dispatch = useDispatch();

  const { response, request } = useRequest();

  useEffect(() => {
    document.title = "Login - Noonmar";
  }, []);

  useEffect(() => {
    if (response) {
      toast.success("You are now logged in!");
      const setting = {};

      response.setting.forEach((s) => {
        setting[s.newKey] = s.selected || s.value;
      });

      dispatch(
        authSuccess({
          token: response.token,
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

      let url = localStorage.getItem("url");
      if (url) {
        history.push(`${url}`);
      }
    }
  }, [response]);

  const onSubmit = (data) => {
    const { email, password } = data;
    request("POST", "admin/login", { email, password });
  };

  return (
    <div className="login login-4 wizard d-flex flex-column flex-lg-row flex-column-fluid">
      <div className="login-container d-flex flex-center bgi-size-cover bgi-no-repeat flex-row-fluid p-8">
        <div className="login-content d-flex flex-column card p-5 p-md-10">
          <a href="#!" className="login-logo pb-8 text-center">
            <img src="./logo.png" className="max-h-80px" alt="" />
          </a>

          <div className="login-form">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="form"
              id="kt_login_singin_form"
            >
              <div className="pb-5 pb-lg-15">
                <h3 className="font-weight-bolder text-dark font-size-h2 font-size-h1-lg">
                  Sign In
                </h3>
                {/* <div className="text-muted font-weight-bold font-size-h4">
                                    New Here?
                                    <a href="custom/pages/login/login-4/signup.html"
                                        className="text-primary font-weight-bolder">Create Account</a>
                                </div> */}
              </div>

              <div className="form-group">
                <label className="font-size-h6 font-weight-bolder text-dark">
                  Your Email
                </label>

                <input
                  className={`form-control form-control-solid h-auto py-7 px-6 rounded-lg border-0 ${
                    errors.email && "is-invalid"
                  }`}
                  type="text"
                  name="username"
                  autoComplete="off"
                  placeholder="Email"
                  {...register("email", {
                    required: true,
                    pattern:
                      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
                  })}
                />
                {errors.email?.type === "required" && (
                  <div className="invalid-feedback">
                    The email field is required.
                  </div>
                )}
                {errors.email?.type === "pattern" && (
                  <div className="invalid-feedback">
                    The email must be a valid email address.
                  </div>
                )}
              </div>

              <div className="form-group">
                <div className="d-flex justify-content-between mt-n5">
                  <label className="font-size-h6 font-weight-bolder text-dark pt-5">
                    Your Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-primary font-size-h6 font-weight-bolder text-hover-primary pt-5"
                  >
                    Forgot Password ?
                  </Link>
                </div>
                <input
                  className={`form-control form-control-solid h-auto py-7 px-6 rounded-lg border-0 ${
                    errors.password && "is-invalid" /*: "is-valid"*/
                  }`}
                  type="password"
                  name="password"
                  autoComplete="off"
                  placeholder="Password"
                  {...register("password", {
                    required: true,
                    pattern: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/,
                  })}
                />
                {errors.password?.type === "required" && (
                  <div className="invalid-feedback">
                    The password field is required.
                  </div>
                )}
                {errors.password?.type === "pattern" && (
                  <div className="invalid-feedback">
                    Password must be of 8 characters long with atleast one
                    uppercase, one lowercase and one number.
                  </div>
                )}
              </div>

              <div className="pb-lg-0 pb-5">
                <button
                  onClick={handleSubmit(onSubmit)}
                  style={{ display: "none" }}
                ></button>
                <a
                  onClick={handleSubmit(onSubmit)}
                  href="#!"
                  id="kt_login_submit"
                  className="btn btn-primary font-weight-bolder font-size-h6 px-8 py-4 my-3 mr-3"
                >
                  Sign In
                </a>
                {/* <button
                  type="button"
                  id="kt_login_google"
                  className="btn btn-light-primary font-weight-bolder px-8 py-4 my-3 font-size-lg"
                >
                  <span className="svg-icon svg-icon-md">
                    <GoogleIcon />
                  </span>{" "}
                  Sign in with Google
                </button> */}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
