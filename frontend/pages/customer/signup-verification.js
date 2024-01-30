import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import moment from "moment/moment";

import useRequest from "@/hooks/useRequest";
import { MEDIA_URL } from "@/api";
import { getSystemImage } from "@/services/customer";
import { LoginLogo } from "@/components/Helper";
import Seo from "@/components/Seo";

const SignupVerification = ({
  id,
  email,
  image,
  isShowEmailField,
  contact,
}) => {
  const t = useTranslations("Index");
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    reset,
  } = useForm();

  const router = useRouter();

  const { response, request } = useRequest();
  const { response: responseResendEmail, request: requestResendEmail } =
    useRequest();

  const [timer, setTimer] = useState(180);

  useEffect(() => {
    let otpTimer;
    if (timer == 0) {
      clearInterval(otpTimer);
    } else {
      otpTimer = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => {
        clearInterval(otpTimer);
      };
    }
  }, [timer]);

  useEffect(() => {
    if (response && response.status) {
      toast.success(response.message);
      router.push("/customer/login");
    }
  }, [response]);

  useEffect(() => {
    if (responseResendEmail && responseResendEmail.status) {
      toast.success(responseResendEmail.message);
      setTimer(180);
      reset({
        otp1: null,
        otp2: null,
        otp3: null,
        otp4: null,
        emailOtp1: null,
        emailOtp2: null,
        emailOtp3: null,
        emailOtp4: null,
      });
    }
  }, [responseResendEmail]);

  const inputfocus = (elmnt) => {
    let value = elmnt.target.value;
    clearErrors("otp1");
    if (elmnt.key === "Delete" || elmnt.key === "Backspace") {
      const next = elmnt.target.tabIndex - 2;
      if (next > -1) {
        elmnt.target.form.elements[next].focus();
      }
    } else if (!value.match(/^[0-9]+$/)) {
      elmnt.target.value = "";
    } else {
      const next = elmnt.target.tabIndex;
      if (next < 4) {
        elmnt.target.form.elements[next].focus();
      }
    }
  };

  const inputfocusTwo = (elmnt) => {
    let value = elmnt.target.value;
    clearErrors("emailOtp1");
    if (elmnt.key === "Delete" || elmnt.key === "Backspace") {
      const next = elmnt.target.tabIndex - 2;
      if (next > -1) {
        elmnt.target.form.elements[next].focus();
      }
    } else if (!value.match(/^[0-9]+$/)) {
      elmnt.target.value = "";
    } else {
      const next = elmnt.target.tabIndex;
      if (next < 8) {
        elmnt.target.form.elements[next].focus();
      }
    }
  };

  const onEmailVerifyHandler = (data) => {
    const {
      otp1,
      otp2,
      otp3,
      otp4,
      emailOtp1,
      emailOtp2,
      emailOtp3,
      emailOtp4,
    } = data;

    const contactOtp = `${otp1}${otp2}${otp3}${otp4}`;
    const emailOtp = `${emailOtp1}${emailOtp2}${emailOtp3}${emailOtp4}`;

    request("POST", "v1/customer/verify-account", {
      id,
      contactOtp,
      emailOtp,
    });
  };
  const handleResendEmail = () => {
    requestResendEmail("POST", `v1/customer/resend-verfication`, {
      id,
    });
  };
  return (
    <>
      <Seo seoData={{ pageTitle: "Signup Verification - Noonmar" }} />
      <div className="login_right_content">
        <img src={`${MEDIA_URL}/${image}`} alt="" />
      </div>
      <div className="d-flex flex-column flex-root">
        <div className="login login-4 wizard d-flex flex-column flex-lg-row flex-column-fluid">
          <div className="login-container d-flex flex-center bgi-size-cover bgi-no-repeat flex-row-fluid">
            {/* Features Section */}
            <section className="login_page_wrapper">
              <div className="container">
                <div className="row">
                  <div className="col-lg-6 col-md-12 col-sm-12">
                    <div className="login_sign_up_block otp_verification">
                      <LoginLogo />
                      <h1 className="login_title">
                        {t("Signup Verification")}
                      </h1>
                      <p>
                        {t("We've sent you the verification code on")}

                        <b>
                          {" "}
                          {isShowEmailField
                            ? `${email} and ${contact}`
                            : contact}
                        </b>
                      </p>
                      <form onSubmit={handleSubmit(onEmailVerifyHandler)}>
                        {/*  if mobile verify login time */}
                        {/* <p className="mb-4 mb-md-5">Enter the 4 Digits code that you recieved on    your mobile.</p> */}

                        <p className="mb-3 mb-md-4">
                          {t(
                            "Enter the 4 Digits code that you have recieved on your mobile"
                          )}
                        </p>

                        <div className="form-group">
                          {/* <form onSubmit={handleSubmit(onEmailVerifyHandler)}> */}

                          <div className="codeDigit-box otpRow">
                            <input
                              className="form-control"
                              type="text"
                              name="otp1"
                              autoComplete="off"
                              tabIndex="1"
                              maxLength="1"
                              onKeyUp={(e) => inputfocus(e)}
                              {...register("otp1", {
                                required: true,
                                maxLength: 1,
                              })}
                            />
                            <input
                              className="form-control"
                              type="text"
                              name="otp2"
                              autoComplete="off"
                              tabIndex="2"
                              maxLength="1"
                              onKeyUp={(e) => inputfocus(e)}
                              {...register("otp2", {
                                required: true,
                                maxLength: 1,
                              })}
                            />
                            <input
                              className="form-control"
                              type="text"
                              name="otp3"
                              autoComplete="off"
                              tabIndex="3"
                              maxLength="1"
                              onKeyUp={(e) => inputfocus(e)}
                              {...register("otp3", {
                                required: true,
                                maxLength: 1,
                              })}
                            />
                            <input
                              className="form-control"
                              type="text"
                              name="otp4"
                              autoComplete="off"
                              tabIndex="4"
                              maxLength="1"
                              onKeyUp={(e) => inputfocus(e)}
                              {...register("otp4", {
                                required: true,
                                maxLength: 1,
                              })}
                            />
                          </div>
                          {(errors.otp1?.type === "required" ||
                            errors.otp2?.type === "required" ||
                            errors.otp3?.type === "required" ||
                            errors.otp4?.type === "required") && (
                            <p className="error-msg">
                              {t("Please enter the OTP")}
                            </p>
                          )}
                          {errors.otp1?.type === "manual" && (
                            <p className="error-msg">
                              {t("The otp entered is incorrect")}
                            </p>
                          )}
                          {/* </form> */}
                        </div>
                        {isShowEmailField && (
                          <>
                            <p className="mb-3 mb-md-4">
                              {t(
                                "Enter the 4 Digits code that you have recieved on your email"
                              )}
                            </p>
                            <div className="form-group">
                              {/* <form onSubmit={handleSubmit(onEmailVerifyHandler)}> */}
                              <div className="codeDigit-box otpRow">
                                <input
                                  className="form-control"
                                  type="text"
                                  name="emailOtp1"
                                  autoComplete="off"
                                  tabIndex="5"
                                  maxLength="1"
                                  onKeyUp={(e) => inputfocusTwo(e)}
                                  {...register("emailOtp1", {
                                    required: true,
                                    maxLength: 1,
                                  })}
                                />
                                <input
                                  className="form-control"
                                  type="text"
                                  name="emailOtp2"
                                  autoComplete="off"
                                  tabIndex="6"
                                  maxLength="1"
                                  onKeyUp={(e) => inputfocusTwo(e)}
                                  {...register("emailOtp2", {
                                    required: true,
                                    maxLength: 1,
                                  })}
                                />
                                <input
                                  className="form-control"
                                  type="text"
                                  name="emailOtp3"
                                  autoComplete="off"
                                  tabIndex="7"
                                  maxLength="1"
                                  onKeyUp={(e) => inputfocusTwo(e)}
                                  {...register("emailOtp3", {
                                    required: true,
                                    maxLength: 1,
                                  })}
                                />
                                <input
                                  className="form-control"
                                  type="text"
                                  name="emailOtp4"
                                  autoComplete="off"
                                  tabIndex="8"
                                  maxLength="1"
                                  onKeyUp={(e) => inputfocusTwo(e)}
                                  {...register("emailOtp4", {
                                    required: true,
                                    maxLength: 1,
                                  })}
                                />
                              </div>
                              {(errors.emailOtp1?.type === "required" ||
                                errors.emailOtp2?.type === "required" ||
                                errors.emailOtp3?.type === "required" ||
                                errors.emailOtp4?.type === "required") && (
                                <p className="error-msg">
                                  {t("Please enter the OTP")}
                                </p>
                              )}
                              {errors.emailOtp1?.type === "manual" && (
                                <p className="error-msg">
                                  {t("The otp entered is incorrect")}
                                </p>
                              )}
                              {/* </form> */}
                            </div>
                          </>
                        )}
                        <div className="login_button">
                          <button type="submit" class="submit_button w-100">
                            {t("Submit")}
                          </button>
                        </div>

                        <div className="verify-note text-center">
                          {isShowEmailField
                            ? t(
                                "Didn't receive code ? Check your junk or spam folder"
                              )
                            : t("Didn't receive code ?")}
                        </div>

                        {timer ? (
                          <>
                            <div className="text-center">
                              {moment.utc(timer * 1000).format("mm:ss")}
                            </div>
                          </>
                        ) : (
                          <div className="text-center">
                            <button
                              className="ResetOTPBtn"
                              onClick={handleResendEmail}
                              type="button"
                            >
                              {t("Resend OTP")}
                            </button>{" "}
                          </div>
                        )}
                        {/* ** if mobile verify login time */}
                      </form>
                      {/*  */}
                    </div>
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
  const {
    query: { id, email, isShowEmailField, contact },
  } = context;
  const image = await getSystemImage("customer-signup-verification");

  if (!id || !contact) {
    return {
      redirect: {
        permanent: false,
        destination: "/customer/signup",
      },
    };
  }
  let extras = {};
  if (email && isShowEmailField == "true") {
    extras.email = email;
  }
  return {
    props: {
      protected: false,
      id,
      image,
      ...extras,
      isShowEmailField: isShowEmailField == "true" ? true : false,
      contact,
      locales: {
        ...require(`../../locales/index/${context.locale}.json`),
      },
    }, // will be passed to the page component as props
  };
}

export default SignupVerification;
