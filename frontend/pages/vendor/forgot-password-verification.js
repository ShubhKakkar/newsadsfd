import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import moment from "moment";

import useRequest from "@/hooks/useRequest";
import { getSystemImage } from "@/services/customer";
import { MEDIA_URL } from "@/api";
import { LoginLogo } from "@/components/Helper";
import Seo from "@/components/Seo";

const forgotPasswordVerification = ({ id, email, image }) => {
  const router = useRouter();
  const t = useTranslations("Index");

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm();

  const [timer, setTimer] = useState(180);

  const { request, response } = useRequest();

  const { request: resendOtpRequest, response: resendOtpResponse } =
    useRequest();

  useEffect(() => {
    otpInput();
  }, []);

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
      router.push(
        {
          pathname: `/vendor/reset-password`,
          query: { id: response.id, otp: response.otp },
        },
        `/vendor/reset-password`
      );
      //`/vendor/reset-password?token=${response.token}`
    }
  }, [response]);

  useEffect(() => {
    if (resendOtpResponse && resendOtpResponse.status) {
      toast.success(resendOtpResponse.message);
    }
  }, [resendOtpResponse]);

  // const inputfocus = (elmnt) => {
  //   clearErrors("otp1");
  //   if (elmnt.key === "Delete" || elmnt.key === "Backspace") {
  //     const next = elmnt.target.tabIndex - 2;
  //     if (next > -1) {
  //       elmnt.target.form.elements[next].focus();
  //     }
  //   } else {
  //     const next = elmnt.target.tabIndex;
  //     if (next < 4) {
  //       elmnt.target.form.elements[next].focus();
  //     }
  //   }
  // };

  const onSubmit = (data) => {
    const { otp1, otp2, otp3, otp4 } = data;

    const otp = `${otp1}${otp2}${otp3}${otp4}`;

    request("POST", "v1/vendor/verify-reset-otp", {
      id,
      otp,
    });
  };

  const resendOtpHandler = () => {
    resendOtpRequest("POST", "v1/vendor/resend-otp", {
      id,
    });
  };
  const otpInput = () => {
    clearErrors("otp1");
    const inputs = document.querySelectorAll("#otp-field > *[id]");
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener("keydown", function (event) {
        if (event.key === "Backspace" || event.key === "Delete") {
          inputs[i].value = "";
          if (i !== 0) inputs[i - 1].focus();
        } else {
          if (
            (event.keyCode > 47 && event.keyCode < 58) ||
            (event.keyCode > 95 && event.keyCode < 106)
          ) {
            inputs[i].value = event.key;
            if (i !== inputs.length - 1) inputs[i + 1].focus();
            event.preventDefault();
          } else if (event.keyCode > 64 && event.keyCode < 91) {
            event.preventDefault();
          } else if (i === inputs.length - 1 && inputs[i].value !== "") {
            return true;
          }
        }
      });
    }
  };

  return (
    <>
      <Seo seoData={{ pageTitle: "Forgot Password Verification - Noonmar" }} />

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
                      <h1 className="login_title">{t("Email Verification")}</h1>
                      <p>
                        {t("We’ve send you the verification code on")}
                        <b> {email}</b>
                      </p>
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <p className="mb-3 mb-md-4">
                          {t(
                            "Enter the 4 Digits code that you have recieved on your email or mobile"
                          )}
                        </p>

                        {/*  if mobile verify login time */}
                        {/* <p className="mb-4 mb-md-5">Enter the 4 Digits code that you recieved on    your mobile.</p> */}

                        <div className="form-group">
                          <div className="codeDigit-box otpRow" id="otp-field">
                            <input
                              id="otp1"
                              className="form-control"
                              type="text"
                              name="otp1"
                              autoComplete="off"
                              tabIndex="1"
                              maxLength="1"
                              // onKeyUp={(e) => inputfocus(e)}
                              {...register("otp1", {
                                required: true,
                                maxLength: 1,
                              })}
                            />
                            <input
                              id="otp2"
                              className="form-control"
                              type="text"
                              name="otp2"
                              autoComplete="off"
                              tabIndex="2"
                              maxLength="1"
                              // onKeyUp={(e) => inputfocus(e)}
                              {...register("otp2", {
                                required: true,
                                maxLength: 1,
                              })}
                            />
                            <input
                              id="otp3"
                              className="form-control"
                              type="text"
                              name="otp3"
                              autoComplete="off"
                              tabIndex="3"
                              maxLength="1"
                              // onKeyUp={(e) => inputfocus(e)}
                              {...register("otp3", {
                                required: true,
                                maxLength: 1,
                              })}
                            />
                            <input
                              id="otp4"
                              className="form-control"
                              type="text"
                              name="otp4"
                              autoComplete="off"
                              tabIndex="4"
                              maxLength="1"
                              // onKeyUp={(e) => inputfocus(e)}
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
                            <p className="text-danger">Please enter the OTP.</p>
                          )}
                          {errors.otp1?.type === "manual" && (
                            <p className="text-danger">
                              {t("The otp entered is incorrect.")}
                            </p>
                          )}
                          {/* </form> */}
                        </div>

                        <div className="login_button">
                          <button type="submit" class="submit_button w-100">
                            {t("Submit")}
                          </button>
                        </div>

                        <div className="verify-note text-center">
                          {t(
                            "Didn't receive code ? Check your junk or spam folder"
                          )}
                        </div>

                        {timer ? (
                          <div className="text-center">
                            {moment.utc(timer * 1000).format("mm:ss")}
                          </div>
                        ) : (
                          <div className="text-center">
                            <button
                              className="ResetOTPBtn"
                              onClick={resendOtpHandler}
                              type="button"
                            >
                              {t("Resend OTP")}
                            </button>{" "}
                          </div>
                        )}

                        {/* ** if mobile verify login time */}

                        {/* <div className="verify-note">
                                    Didn’t receive code ? <a href="#">Click here to resend</a>
                                </div> */}
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
    query: { id, email },
  } = context;

  const image = await getSystemImage("vendor-forgot-password-verification");

  if (!id || !email) {
    return {
      redirect: {
        image,
        permanent: false,
        destination: "/vendor/forgot-password",
      },
    };
  }

  return {
    props: {
      protected: false,
      id,
      email,
      image,
      locales: {
        ...require(`../../locales/index/${context.locale}.json`),
      },
    },
  };
}

export default forgotPasswordVerification;
