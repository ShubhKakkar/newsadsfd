import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import Link from "next/link";

import useRequest from "@/hooks/useRequest";
import { getSystemImage } from "@/services/customer";
import { MEDIA_URL } from "@/api";
import { LoginLogo } from "@/components/Helper";
import Seo from "@/components/Seo";

const ForgotPassword = ({ image }) => {
  const t = useTranslations("Index");

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { request, response } = useRequest();

  useEffect(() => {
    if (response) {
      if (response.status) {
        toast.success(response.message);
        router.push(
          {
            pathname: "/vendor/forgot-password-verification",
            query: { id: response.id, email: response.email },
          },
          "/vendor/forgot-password-verification"
        );
      }
    }
  }, [response]);

  const onsubmit = (data) => {
    const { emailOrPhone } = data;
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let contactRegex = /^[0-9]{10}$/gm;

    if (!emailRegex.test(emailOrPhone) && !contactRegex.test(emailOrPhone)) {
      toast.error("Please select a valid email or contact");
      return;
    }

    request("POST", "v1/vendor/forgot-password", { emailOrPhone });
  };

  return (
    <>
      <Seo seoData={{ pageTitle: "Forgot Password - Noonmar" }} />
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
                    <div className="login_sign_up_block">
                      <LoginLogo />
                      <h1 className="login_title">{t("Forgot Password")}</h1>
                      <p>
                        {t(
                          "Don't worry Resetting your password is easy, Just type in the email you registered to Noonmar"
                        )}
                      </p>
                      <form onSubmit={handleSubmit(onsubmit)}>
                        <div className="form-group">
                          <input
                            type="text"
                            name="email"
                            placeholder={t(
                              "Enter your registered email/phone*"
                            )}
                            className="form-control dark-form-control"
                            defaultValue=""
                            {...register("emailOrPhone", {
                              required: true,
                            })}
                          />
                          {errors.emailOrPhone &&
                            errors.emailOrPhone.type === "required" && (
                              <span className="text-danger">
                                {t("This field is required")}
                              </span>
                            )}
                        </div>
                        {/*  */}
                        <div className="login_button">
                          <button type="submit" className="submit_button w-100">
                            {t("Submit")}
                          </button>
                        </div>
                      </form>
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
  const image = await getSystemImage("vendor-forgot-password");

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

export default ForgotPassword;
