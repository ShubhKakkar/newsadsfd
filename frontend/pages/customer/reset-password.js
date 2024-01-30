import { useRouter } from "next/router";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";

import useRequest from "@/hooks/useRequest";
import { getSystemImage } from "@/services/customer";
import { MEDIA_URL } from "@/api";
import { LoginLogo } from "@/components/Helper";
import Seo from "@/components/Seo";

const ResetPassword = ({ id, otp, image }) => {
  const router = useRouter();

  const t = useTranslations("Index");
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm();

  const { request, response } = useRequest();

  useEffect(() => {
    if (response && response.status) {
      toast.success(response.message);
      router.push("/customer/login");
    }
  }, [response]);

  const onSubmit = (data) => {
    const { newPassword } = data;
    request("POST", "v1/customer/reset-password", {
      newPassword,
      id,
      otp,
    });
  };
  return (
    <>
      <Seo seoData={{ pageTitle: "Reset Password - Noonmar" }} />
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
                      <h1 className="login_title">{t("Reset Password")}</h1>
                      <p>{t("Reset your password")}</p>
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="form-group">
                          <input
                            type="password"
                            name="email"
                            placeholder={t("New Password")}
                            className="form-control dark-form-control"
                            defaultValue=""
                            {...register("newPassword", {
                              required: true,
                              pattern:
                                /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(){1,})(?=(.*[!@#$%^&*()\-__+.]){1,1}).{8,}$/,
                            })}
                          />
                          {errors.newPassword?.type === "required" && (
                            <span className="text-danger">
                              {t("This field is required")}
                            </span>
                          )}
                          {errors.newPassword?.type === "pattern" && (
                            <span className="text-danger ">
                              {t(
                                "Password must be of 8 or more characters long with atleast one number, one special character, one small and one capital letter"
                              )}
                            </span>
                          )}
                        </div>
                        <div className="form-group">
                          <input
                            type="password"
                            name="email"
                            placeholder={t("Confirm New Password")}
                            className="form-control dark-form-control"
                            defaultValue=""
                            {...register("cNewPassword", {
                              required: true,
                              validate: (value) => {
                                const { newPassword } = getValues();
                                return newPassword === value;
                              },
                            })}
                          />
                          {errors.cNewPassword?.type === "required" && (
                            <span className="text-danger">
                              {t("This field is required")}
                            </span>
                          )}
                          {errors.cNewPassword?.type === "validate" && (
                            <span className="text-danger ">
                              {t("Confirm password must be same as password!")}
                            </span>
                          )}
                        </div>
                        {/*  */}
                        <div className="login_button">
                          <button type="submit" className="submit_button w-100">
                            {t("Submit")}
                          </button>
                        </div>
                        {/*  */}
                        {/* <div className="click_here">
                          <p>
                            Don’t have an account?
                            <Link href="cutoner" legacyBehavior>
                            <a  className="register_select">
                              {" "}
                              Click here
                            </a>
                            </Link>
                          </p>
                        </div> */}
                      </form>
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
    query: { id, otp },
  } = context;
  const image = await getSystemImage("customer-reset-password");

  if (!id || !otp) {
    return {
      redirect: {
        permanent: false,
        destination: "/customer/forgot-password",
      },
    };
  }
  return {
    props: {
      id,
      otp,
      protected: false,
      image,
      locales: {
        ...require(`../../locales/index/${context.locale}.json`),
      },
    }, // will be passed to the page component as props
  };
}

export default ResetPassword;
