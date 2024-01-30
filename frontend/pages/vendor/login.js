import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { useTranslations } from "next-intl";
import { setCookie } from "nookies";

import useRequest from "@/hooks/useRequest";
import { authSuccess } from "@/store/auth/action";
import { getSystemImage } from "@/services/customer";
import { MEDIA_URL } from "@/api";
import { LoginLogo } from "@/components/Helper";
import Seo from "@/components/Seo";

const Login = ({ image }) => {
  //   useEffect(() => {
  //     document.body.classList.add("login-signup-pages");

  //     return () => {
  //       document.body.classList.remove("login-signup-pages");
  //     };
  //   }, []);

  const t = useTranslations("Index");
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm();

  const router = useRouter();
  const dispatch = useDispatch();
  const { request, response } = useRequest();
  const [rememberMe, setRememberMe] = useState(0);
  const [rememberMeEmail, setRememberMeEmail] = useState("");
  const [rememberMePassword, setRememberMePassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const onSubmit = (data) => {
    const { email, password } = data;
    if (rememberMe) {
      setRememberMeEmail(email);
      setRememberMePassword(password);
    }
    request("POST", "v1/vendor/login", { emailOrPhone: email, password });
  };

  useEffect(() => {
    setValue("email", localStorage.getItem("isRememberEmail"));
    setValue("password", localStorage.getItem("isRememberPassword"));

    if (localStorage.getItem("isRememberMe")) {
      const value = localStorage.getItem("isRememberMe");
      if (value == 1) {
        document.getElementById("check1").checked = true;
      }
      setRememberMe(localStorage.getItem("isRememberMe"));
    }
  }, []);
  useEffect(() => {
    if (response) {
      if (response.status) {
        toast.success(response.message);
        const { vendor, token } = response;
        let result = document.getElementById("check1").checked;
        if (result) {
          localStorage.setItem("isRememberEmail", rememberMeEmail);
          localStorage.setItem("isRememberPassword", rememberMePassword);
          localStorage.setItem("isRememberMe", 1);
        } else {
          localStorage.setItem("isRememberEmail", "");
          localStorage.setItem("isRememberPassword", "");
          localStorage.setItem("isRememberMe", 0);
        }

        dispatch(authSuccess({ ...vendor, role: "vendor", token }));

        setCookie(null, "token", token, {
          maxAge: 30 * 24 * 60 * 60 * 100,
          path: "/",
        });

        router.push(
          {
            pathname: "/vendor/my-profile",
            query: { id: vendor.userId },
          },
          "/vendor/my-profile"
        );
      } else if (!response.status && response.code === 1) {
        toast.success(
          t(
            "Your verfication otp has been send successfully to your email address."
          )
        );
        router.push(
          {
            pathname: "/vendor/signup-verification",
            query: { id: response.id, email: response.email },
          },
          "/vendor/signup-verification"
        );
      } else if (!response.status && response.code === 2) {
        toast.error(response.message);
      }
    }
  }, [response]);

  return (
    <>
      <Seo seoData={{ pageTitle: "Vendor Login - Noonmar" }} />
      <div className="vendor_right_content">
        <img src={`${MEDIA_URL}/${image}`} alt="" />
      </div>
      <div className="d-flex flex-column flex-root">
        <div className="login login-4 wizard d-flex flex-column flex-lg-row flex-column-fluid">
          <div className="login-container d-flex flex-center bgi-size-cover bgi-no-repeat flex-row-fluid">
            <section className="login_page_wrapper">
              <div className="container">
                <div className="row">
                  <div className="col-lg-6 col-md-12 col-sm-12">
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="login_sign_up_block">
                        <LoginLogo />
                        <h1 className="vendor_login_title">
                          {t("Login into Vendor Account")}
                        </h1>
                        <div className="form-group">
                          <input
                            type="text"
                            name="email"
                            placeholder={t(
                              "Enter your registered email /phone number*"
                            )}
                            className="form-control dark-form-control"
                            defaultValue=""
                            {...register("email", {
                              required: true,
                              validate: (value) => {
                                const emailRegex =
                                  /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                                const phoneRegex = /^[0-9]{10}$/;

                                const emailCheck = emailRegex.test(value);
                                const phoneCheck = phoneRegex.test(value);
                                if (emailCheck) {
                                  return emailRegex.test(value);
                                }
                                if (phoneCheck) {
                                  return phoneRegex.test(value);
                                }
                                return false;
                              },
                            })}
                          />
                          {errors.email && errors.email.type === "required" && (
                            <span className="text-danger">
                              {t("This field is required")}
                            </span>
                          )}

                          {errors.email &&
                            errors.email?.type === "validate" && (
                              <span className="text-danger ">
                                {t(
                                  "Please enter a valid email or phone number."
                                )}
                              </span>
                            )}
                        </div>
                        <div className="form-group">
                          <input
                            type={isPasswordVisible ? "text" : "password"}
                            name="password"
                            placeholder={t("Enter password*")}
                            className="form-control dark-form-control"
                            defaultValue=""
                            {...register("password", {
                              required: true,
                              // pattern: {
                              //   value: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/,
                              // },
                            })}
                          />
                          <a
                            href="javascript:void(0)"
                            onClick={() => {
                              setIsPasswordVisible(
                                isPasswordVisible ? false : true
                              );
                            }}
                            className={`fa fa-fw ${
                              isPasswordVisible ? "fa-eye" : "fa-eye-slash"
                            } field-icon-input toggle-password`}
                          />
                          {errors.password &&
                            errors.password.type === "required" && (
                              <span className="text-danger">
                                {t("This field is required")}
                              </span>
                            )}
                          {/* {errors.password &&
                            errors.password.type === "pattern" && (
                              <span className="text-danger">
                                {t(
                                  "Password must be of 8 or more characters long with a mix of letters,numbers"
                                )}
                              </span>
                            )} */}
                        </div>
                        {/* forget password */}
                        <div className="select_remendor">
                          <div className="form-group custom_checkbox d-flex">
                            <input
                              type="checkbox"
                              id="check1"
                              defaultChecked=""
                            />
                            <label
                              htmlFor="check1"
                              className="click_vendor_reme"
                            >
                              {t("Remember me")}
                            </label>
                          </div>
                          <div className="forget_pass">
                            <Link href="/vendor/forgot-password" legacyBehavior>
                              <a className="for_pass forgot_pass">
                                {t("Forgot Password?")}
                              </a>
                            </Link>
                          </div>
                        </div>
                        {/*  */}
                        {/*  */}
                        <div className="login_button">
                          <button
                            type="submit"
                            className="submit_button vendor_login_button w-100"
                          >
                            {t("Login Now")}
                          </button>
                        </div>
                        {/*  */}
                        <div className="click_here">
                          <p>
                            {t("Don’t have an account?")}
                            <Link
                              href="/vendor/signup"
                              className="register_select"
                            >
                              {" "}
                              {t("Click here")}
                            </Link>
                          </p>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};
export async function getServerSideProps(context) {
  const image = await getSystemImage("vendor-login");
  return {
    props: {
      protected: false,
      image,
      locales: {
        ...require(`../../locales/index/${context.locale}.json`),
      },
    },
  };
}
export default Login;
