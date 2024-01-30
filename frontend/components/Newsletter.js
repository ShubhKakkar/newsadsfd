import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import useTranslate from "../hooks/useTranslate";
import useRequest from "../hooks/useRequest";

const Newsletter = () => {
  const t = useTranslate();

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const { response, request } = useRequest();

  useEffect(() => {
    if (response) {
      if (response && response.status) {
        setValue("email", "");
        setAcceptedTerms(false);
        if (response.alreadySubscribed) {
          toast.success(response.message);
        } else {
          toast.success(
            "Newsletter subscription verification mail has been sent to your email address."
          );
        }
      }
    }
  }, [response]);

  const onSubmit = async (data) => {
    if (acceptedTerms) {
      request("POST", "v1/home/newsletter", data);
    } else {
      toast.error("Please accept the terms and conditions");
    }
  };

  return (
    <section className="section-padding subscribe-section">
      <div className="container">
        <div className="subscribeRow">
          <div className="row">
            <div className="col-md-3 col-lg-4">
              <div className="offerText">
                <h2 className="subscribeCardTitle">
                  {t("Subscribe to our")}
                  <br />
                  {t("Newsletter today!")}
                </h2>
              </div>
            </div>
            <div className="col-md-9 col-lg-8">
              <div className="subscribeForm">
                <form
                  className="d-flex"
                  role="search"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <input
                    className="form-control me-2 subscribeInput"
                    type="email"
                    name="email"
                    placeholder={t("Enter email address")}
                    {...register("email", {
                      required: true,
                      pattern:
                        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i,
                    })}
                    aria-label="Search"
                  />

                  <button
                    className="btn BlackThemeBtn"
                    type="submit"
                    onClick={handleSubmit(onSubmit)}
                  >
                    {t("SEND")}
                  </button>
                </form>
                {errors.email?.type === "required" && (
                  <div className="error-msg">
                    {t("Please enter your email")}
                  </div>
                )}

                {errors.email?.type === "pattern" && (
                  <div className="error-msg">
                    {t("Please enter valid email")}
                  </div>
                )}
                <div className="newsletters">
                  <div className="custom_checkbox position-relative check-type2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      defaultValue=""
                      id="saleCheckDefault"
                      checked={acceptedTerms}
                      onChange={(e) => {
                        setAcceptedTerms(e.target.checked);
                      }}
                    />
                  </div>
                  <label
                    className="form-check-label"
                    htmlFor="saleCheckDefault"
                  >
                    {t(
                      "I agree to review recent updates and newsletters about latest offers & discounts"
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
