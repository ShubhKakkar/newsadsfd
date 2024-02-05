import React, { useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";
import { parseCookies, setCookie, destroyCookie } from "nookies";
import { useDispatch } from "react-redux";
import { useTranslations } from "next-intl";

import { authSuccess, updateCartTotal } from "@/store/auth/action";
import useRequest from "@/hooks/useRequest";
import SocialLogin from "@/components/SocialLogin";
import { getSystemImage } from "@/services/customer";
import { MEDIA_URL } from "@/api";
import { LoginLogo } from "@/components/Helper";
import Seo from "@/components/Seo";

const Login = ({ image }) => {
  const t = useTranslations("Index");
  const {
    register,
    handleSubmit,
    reset: resetLogin,
    getValues: getValuesLogin,
    formState: { errors },
    setValue: setValueLogin,
  } = useForm();

  const router = useRouter();
  const dispatch = useDispatch();
  const { request, response } = useRequest();
  const { request: emailreq, response: emailres } = useRequest();
  const { request: socialLoginRequest, response: socialLoginResponse } =
    useRequest();

  const [email, setEmail] = useState();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // useEffect(() => {
  //   emailreq("GET", "admin/countries");
  // }, []);
  // useEffect(() => {
  //   if (emailres) {
  //     setEmail(emailres?.emailres);
  //   }
  // }, [emailres]);

  //   useEffect(() => {
  //     document.body.classList.add("login-signup-pages");

  //     return () => {
  //       document.body.classList.remove("login-signup-pages");
  //     };
  //   }, []);
  const onSubmit = (data) => {
    const { emailOrPhone, password } = data;

    request("POST", "v1/customer/login", {
      emailOrPhone,
      password,
    });
  };

  // const oncookiSubmit = () => {
  //   // Simply omit context parameter.
  //   // Parse

  //   const cookies = parseCookies();
  //   console.log({ cookies });

  //   // Set
  //   setCookie(null, "fromClient", "value", {
  //     emailOrPhone: "vawy@mailinator.com",
  //     password: "Hello@123",
  //   });
  // };

  useEffect(() => {
    saveDataFromCookies();
  }, []);

  const closeRegisterModalHandler = () => {
    // setIsRegisterModalOpen(false);
    // resetSignup({
    //   userName: "",
    //   email: "",
    //   ssn: "",
    //   password: "",
    //   cPassword: "",
    //   termAndCon: "",
    // });
    resetLogin({ email: "", password: "", rememberMe: false });
  };

  useEffect(() => {
    if (response) {
      if (response.status) {
        toast.success(response.message);
        const { customer, token, cartTotal } = response;
        // localStorage.setItem("token", token);
        const email = getValuesLogin("emailOrPhone");
        const password = getValuesLogin("password");
        const rememberMe = getValuesLogin("rememberMe");

        if (rememberMe) {
          setCookie(null, "email", email, {
            maxAge: 30 * 24 * 60 * 60 * 100,
            path: "/",
          });

          setCookie(null, "password", password, {
            maxAge: 30 * 24 * 60 * 60 * 100,
            path: "/",
          });
        } else {
          destroyCookie(null, "email");
          destroyCookie(null, "password");
        }

        closeRegisterModalHandler();
        dispatch(authSuccess({ ...customer, role: "customer", token }));
        dispatch(updateCartTotal({ cartTotal: cartTotal }));
        setCookie(null, "token", token, {
          maxAge: 30 * 24 * 60 * 60 * 100,
          path: "/",
        });
        router.push(
          {
            pathname: "/customer/my-profile",
            query: { id: customer.userId },
          },
          "/customer/my-profile"
        );
      } else if (!response.status && response.code === 1) {
        router.push(
          {
            pathname: "/customer/signup-verification",
            query: {
              id: response.id,
              email: response.email,
              contact: response.contact,
              isShowEmailField: response.isShowEmailField,
            },
          },
          "/customer/signup-verification"
        );
      } else if (!response.status && response.code === 2) {
        router.push(
          {
            pathname: "/customer/signup-verification",
            query: {
              id: response.id,
              email: response.email,
              contact: response.contact,
              isShowEmailField: response.isShowEmailField,
            },
          },
          "/customer/signup-verification"
        );
      }
    }
  }, [response]);

  useEffect(() => {
    if (socialLoginResponse) {
      if (socialLoginResponse.status) {
        toast.success(socialLoginResponse.message);
        const { firstName, lastName, email, role, userId, profilePic, token } =
          socialLoginResponse;
        setCookie(null, "token", token, {
          maxAge: 30 * 24 * 60 * 60 * 100,
          path: "/",
        });
        dispatch(
          authSuccess({
            firstName,
            lastName,
            email,
            role,
            userId,
            profilePic,
            token,
          })
        );
        router.push(
          {
            pathname: "/customer/my-profile",
            query: { id: userId },
          },
          "/customer/my-profile"
        );
      } else {
        toast.error(socialLoginResponse.message);
      }
    }
  }, [socialLoginResponse]);

  const saveDataFromCookies = () => {
    const cookies = parseCookies();

    if (cookies.email && cookies.password) {
      setValueLogin("emailOrPhone", cookies.email);
      setValueLogin("password", cookies.password);
      setValueLogin("rememberMe", true);
    }
  };

  return (
    <>
      <Seo seoData={{ pageTitle: "Login - Noonmar" }} />
      <div className="login_right_content">
        <img src={`${MEDIA_URL}/${image}`} alt="" />
      </div>
      <div className="d-flex flex-column flex-root">
        <div className="login login-4 wizard d-flex flex-column flex-lg-row flex-column-fluid">
          <div className="login-container d-flex flex-center bgi-size-cover bgi-no-repeat flex-row-fluid">
            {/* Features Section */}
            <section className="login_page_wrapper">
              <form className="hook_form" onSubmit={handleSubmit(onSubmit)}>
                <div className="container">
                  <div className="row">
                    <div className="col-lg-6 col-md-12 col-sm-12">
                      <div className="login_sign_up_block">
                        <LoginLogo />
                        <h1 className="login_title">
                          {t("Login to Continue")}
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
                            {...register("emailOrPhone", {
                              required: true,
                              validate: (value) => {
                                const emailRegex =
                                  /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                                const phoneRegex = /^[0-9]{10}$/;

                                const emailCheck = emailRegex.test(value);
                                const phoneCheck = phoneRegex.test(value);
                                if (emailCheck) {
                                  return true;
                                }
                                if (phoneCheck) {
                                  return true;
                                }
                                return false;
                              },
                            })}
                          />

                          {errors.emailOrPhone?.type === "required" && (
                            <span className="text-danger">
                              {t("This field is required")}
                            </span>
                          )}
                          {/* {errors.emailOrPhone?.message && (
                              <span className="text-danger">
                                {errors.emailOrPhone?.message}
                              </span>
                            )} */}
                          {errors.emailOrPhone &&
                            errors.emailOrPhone?.type === "validate" && (
                              <span className="text-danger ">
                                {t(
                                  "Please enter a valid email or phone number"
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
                              !isPasswordVisible ? "fa-eye-slash" : "fa-eye"
                            } field-icon-input toggle-password`}
                          />

                          {errors.password?.type === "required" && (
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
                              // defaultChecked=""
                              {...register("rememberMe")}
                            />
                            <label htmlFor="check1" className="click_reme">
                              {t("Remember me")}
                            </label>
                          </div>
                          <div className="forget_pass">
                            <Link
                              href="/customer/forgot-password"
                              legacyBehavior
                            >
                              <a className="for_pass">
                                {t("Forgot Password?")}
                              </a>
                            </Link>
                          </div>
                        </div>
                        {/*  */}
                        <div className="login_button_svg">
                          <SocialLogin request={socialLoginRequest} />
                        </div>
                        {/*  */}
                        <div className="login_button">
                          <button
                            type="submit"
                            // onClick={oncookiSubmit}
                            className="submit_button w-100"
                          >
                            {t("Login Now")}
                          </button>
                        </div>
                        {/*  */}
                        <div className="click_here">
                          <p>
                            {t("Don’t have an account?")}
                            <Link href="/customer/signup" legacyBehavior>
                              <a className="register_select">
                                {" "}
                                {t("Click here")}
                              </a>
                            </Link>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export async function getServerSideProps(context) {
  const image = await getSystemImage("customer-login");

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
