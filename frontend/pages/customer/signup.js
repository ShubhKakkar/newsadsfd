import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import moment from "moment";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";

import { useTranslations } from "next-intl";
import SocialLogin from "@/components/SocialLogin";
import useRequest from "@/hooks/useRequest";
import { authSuccess } from "@/store/auth/action";
import { getSystemImage } from "@/services/customer";
import { MEDIA_URL } from "@/api";
import { LoginLogo } from "@/components/Helper";
import Seo from "@/components/Seo";
import { getCountries } from "@/services/countries";

const Signup = ({ image, countries }) => {
  const t = useTranslations("Index");
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    clearErrors,
    formState: { errors },
    setError,
  } = useForm();

  const router = useRouter();

  const dateRef = useRef();
  const inputTypeRef = useRef();

  //const [dateInput, setDateInput] = useState("text");

  const { request, response } = useRequest();

  const { request: socialLoginRequest, response: socialLoginResponse } =
    useRequest();

  useEffect(() => {
    if (response) {
      if (response.status) {
        toast.success(response.message);
        router.push(
          {
            pathname: "/customer/signup-verification",
            query: {
              id: response.id,
              email: response.email,
              isShowEmailField: response.isShowEmailField,
              contact: response.contact,
            },
          },
          "/customer/signup-verification"
        );
      } else {
        toast.error(response.message);
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

  const onSubmit = (data) => {
    const {
      email,
      password,
      firstName,
      lastName,
      // dob,
      contact,
      country,
      // gender,
    } = data;
    const countryCode = countries.find((c) => c._id === country);

    request("POST", "v1/customer/signup", {
      email,
      password,
      firstName,
      country,
      lastName,
      // dob,
      contact,
      // gender,
      countryCode: countryCode.countryCode,
    });
  };

  const openDatePicker = () => {
    inputTypeRef.current.type = "date";
    dateRef.current.children[0].showPicker();
  };

  // const typeChangeHandler = () => {
  //   inputTypeRef.type = "date";
  //   //dateRef.current.children[0].showPicker();
  // };

  return (
    <>
      <Seo seoData={{ pageTitle: "Customer Signup - Noonmar" }} />

      <div className="login_right_content">
        <img src={`${MEDIA_URL}/${image}`} alt="" />
      </div>
      <div className="d-flex flex-column flex-root">
        <div className="login login-4 wizard d-flex flex-column flex-lg-row flex-column-fluid">
          <div className="login-container d-flex flex-center bgi-size-cover bgi-no-repeat flex-row-fluid">
            <section className="login_page_wrapper">
              <form className="hook_form" onSubmit={handleSubmit(onSubmit)}>
                <div className="container">
                  <div className="row">
                    <div className="col-lg-6 col-md-12 col-sm-12">
                      <div className="login_sign_up_block">
                        <LoginLogo />
                        <h1 className="login_title">
                          {t("Register your Account")}
                        </h1>

                        <div className="row input_register_form">
                          <div className="col-lg-6">
                            <div className="form-group">
                              <input
                                type="text"
                                name="fname"
                                placeholder={t("First Name*")}
                                className="form-control dark-form-control"
                                defaultValue=""
                                {...register("firstName", {
                                  required: true,
                                  setValueAs: (v) => v.trim(),
                                })}
                              />
                              {errors.firstName?.type === "required" && (
                                <span className="text-danger">
                                  {t("This field is required")}
                                </span>
                              )}
                              {errors.firstName?.type === "pattern" && (
                                <span className="text-danger">
                                  {t("Enter valid First Name")}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-lg-6">
                            <div className="form-group">
                              <input
                                type="text"
                                name="lname"
                                placeholder={t("Last Name*")}
                                className="form-control dark-form-control"
                                defaultValue=""
                                {...register("lastName", {
                                  required: true,
                                  setValueAs: (v) => v.trim(),
                                })}
                              />
                              {errors.lastName?.type === "required" && (
                                <span className="text-danger">
                                  {t("This field is required")}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="form-group">
                              <input
                                type="text"
                                name="email"
                                placeholder={t("Enter Email Address")}
                                className="form-control dark-form-control"
                                defaultValue=""
                                {...register("email", {
                                  required: false,
                                  pattern: {
                                    value:
                                      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                                    message: t("Enter a valid email-address"),
                                  },
                                })}
                              />
                              {errors.email?.type === "required" && (
                                <span className="text-danger">
                                  {t("This field is required")}
                                </span>
                              )}
                              {errors.email?.message && (
                                <span className="text-danger">
                                  {errors.email?.message}
                                </span>
                              )}
                            </div>
                          </div>
                          {/* <div className="col-12">
                            <div className="form-group">
                              <div className="country-dropdown">
                                <div
                                  className="niceCountryInputSelector"
                                  data-selectedcountry="US"
                                  data-showflags="true"
                                  data-i18nnofilter="No selection"
                                  data-i18nfilter="Filter"
                                  data-onchangecallback="onChangeCallback"
                                />
                              </div>
                            </div>
                          </div> */}

                          <div className="col-lg-12">
                            <div className="form-group">
                              <select
                                className="form-select dark-form-control"
                                name=""
                                id=""
                                {...register("country", {
                                  required: true,
                                })}
                                onChange={(e) => {
                                  const country = countries.find((obj) => {
                                    if (obj._id == e.target.value) {
                                      return obj.countryCode;
                                    }
                                  });

                                  if (country && country.countryCode) {
                                    setValue(
                                      "countryCode",
                                      `+${country.countryCode}`
                                    );
                                    clearErrors("country");
                                    clearErrors("countryCode");
                                  } else {
                                    setError("country", {
                                      type: "required",
                                    });
                                    setError("countryCode", {
                                      type: "required",
                                    });
                                    setValue("countryCode", "");
                                  }
                                }}
                              >
                                <option value="">{t("Select Country*")}</option>
                                {countries.map((item, index) => {
                                  return (
                                    <option value={item?._id} key={item?._id}>
                                      {item?.name}
                                    </option>
                                  );
                                })}
                              </select>
                              {errors.country?.type === "required" && (
                                <span className="text-danger">
                                  {t("This field is required")}
                                </span>
                              )}
                            </div>
                          </div>
                          {false && (
                            <div className="col-lg-6">
                              <div
                                //ref={dateRef}
                                //onClick={openDatePicker}
                                className="form-group"
                              >
                                <input
                                  type="date"
                                  //ref={inputTypeRef}
                                  name="text"
                                  //onFocus={typeChangeHandler}
                                  //onBlur={typeChangeHandlerBlur}
                                  placeholder={t("Date of Birth")}
                                  className="form-control dark-form-control"
                                  max={moment(new Date()).format("YYYY-MM-DD")}
                                  {...register("dob", {
                                    required: false,
                                  })}
                                />
                                {/* <input
                                type={dateInput}
                                //ref={inputTypeRef}
                                name="text"
                                id="dateInput"
                                // placeholder="dssd ssdd"
                                //onFocus={typeChangeHandler}
                                //onBlur={typeChangeHandlerBlur}
                                //onfocus={typeChangeHandler}
                                onClick={() => {
                                  setDateInput("date");
                                }}
                                placeholder={t("Date of Birth")}
                                className="form-control dark-form-control"
                                max={moment(new Date()).format("YYYY-MM-DD")}
                                {...register("dob", {
                                  required: false,
                                })}
                              /> */}
                                {errors.dob?.type === "required" && (
                                  <span className="text-danger">
                                    {t("This field is required")}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          {false && (
                            <div className="col-lg-6">
                              <select
                                className="form-select dark-form-control mb-3"
                                name=""
                                id=""
                                {...register("gender", {
                                  required: false,
                                })}
                              >
                                <option value="">{t("Select Gender")}</option>
                                <option value="male">{t("Male")}</option>
                                <option value="female">{t("Female")}</option>
                                <option value="other">{t("Other")}</option>
                              </select>
                            </div>
                          )}

                          <div className="col-lg-12">
                            <div className="row g-4">
                              <div className="col-md-3 col-lg-3 col-sm-3">
                                <div className="form-group ">
                                  {/* <input
                                    type="text"
                                    name="number"
                                    className="form-control dark-form-control"
                                    placeholder="+11 "
                                    value=""
                                  ></input> */}
                                  <input
                                    {...register("countryCode", {
                                      required: true,
                                    })}
                                    type="text"
                                    name="countryCode"
                                    placeholder="+91"
                                    className="form-control dark-form-control"
                                    defaultValue=""
                                    disabled={true}
                                  />
                                  {errors.countryCode &&
                                    errors.countryCode.type === "required" && (
                                      <span className="text-danger">
                                        {t("This field is required")}
                                      </span>
                                    )}
                                </div>
                              </div>
                              <div class="col-md-9 col-lg-9 col-sm-9">
                                <div className="form-group ">
                                  <input
                                    type="number"
                                    name="text"
                                    placeholder={t("Phone number*")}
                                    className="form-control dark-form-control"
                                    defaultValue=""
                                    {...register("contact", {
                                      required: t("This field is required"),
                                      maxLength: {
                                        value: 10,
                                        message: t(
                                          "Phone Number Must be of 10 digits"
                                        ),
                                      },
                                      minLength: {
                                        value: 10,
                                        message: t(
                                          "Phone Number Must be of 10 digits"
                                        ),
                                      },
                                      pattern: {
                                        value: /^\d*[1-9]\d*$/,
                                        message:
                                          "Please enter valid phone number",
                                      },
                                    })}
                                  />

                                  {errors.contact && (
                                    <span className="text-danger">
                                      {t(errors.contact.message)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {/* <div className="form-group">
                             
                            </div> */}
                          </div>

                          <div className="col-12">
                            <div className="form-group">
                              <input
                                type="password"
                                name="password"
                                placeholder={t("Password")}
                                className="form-control dark-form-control"
                                defaultValue=""
                                {...register("password", {
                                  required: true,
                                  pattern:
                                    /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(){1,})(?=(.*[!@#$%^&*()\-__+.]){1,1}).{8,}$/,
                                })}
                              />
                              {errors.password?.type === "required" && (
                                <span className="text-danger">
                                  {t("This field is required")}
                                </span>
                              )}
                              {errors.password?.type === "pattern" && (
                                <span className="text-danger ">
                                  {t(
                                    "Password must be of 8 or more characters long with atleast one number, one special character, one small and one capital letter"
                                  )}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="col-12">
                            <div className="form-group">
                              <input
                                type="password"
                                name="password"
                                placeholder={t("Confirm Password*")}
                                className="form-control dark-form-control"
                                defaultValue=""
                                {...register("confirm_password", {
                                  required: true,
                                  validate: (value) => {
                                    const { password } = getValues();
                                    return password === value;
                                  },
                                })}
                              />

                              {errors.confirm_password?.type === "required" && (
                                <span className="text-danger">
                                  {t("This field is required")}
                                </span>
                              )}

                              {errors.confirm_password?.type === "validate" && (
                                <span className="text-danger ">
                                  {t(
                                    "Confirm password must be same as password!"
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="login_button_svg register_button_svg">
                          <SocialLogin request={socialLoginRequest} />
                        </div>
                        {/* <div className="login_button_svg register_button_svg">
                          <a
                            href="javascript:viod(0)"
                            className="apple_buttons"
                          >
                            <Apple />
                          </a>
                          <a
                            href="javascript:viod(0)"
                            className="google_buttons"
                          >
                            <Google />
                          </a>
                          <a
                            href="javascript:viod(0)"
                            className="facebook_buttons"
                          >
                            <Facebook />
                          </a>
                        </div> */}
                        <div className="select_remendor">
                          <div className="form-group custom_checkbox d-flex mb-0">
                            <input
                              type="checkbox"
                              id="check1"
                              defaultChecked=""
                              {...register("chackbox", {
                                required: true,
                              })}
                            />
                            <label htmlFor="check1" className="click_reme">
                              {t("I accept all")}
                              <Link href="/terms-&-conditions" legacyBehavior>
                                <a className="register_select" target="_blank">
                                  {" "}
                                  {t("terms & conditions")}
                                </a>
                              </Link>
                            </label>
                          </div>
                        </div>
                        {errors.chackbox?.type === "required" && (
                          <span className="text-danger mt-0">
                            {t("This field is required")}
                          </span>
                        )}
                        <div className="login_button register_submit">
                          <button
                            type="submit "
                            className="submit_button regisert_btn w-100"
                          >
                            {t("Submit Now")}
                          </button>
                        </div>
                        <div className="click_here">
                          <p>
                            {t("Already have an account?")}
                            <Link href="/customer/login" legacyBehavior>
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
  const image = await getSystemImage("customer-signup");
  const countries = await getCountries();
  return {
    props: {
      protected: false,
      image,
      countries,
      locales: {
        ...require(`../../locales/index/${context.locale}.json`),
      },
    },
  };
}
export default Signup;
