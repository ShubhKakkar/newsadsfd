import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";

import useRequest from "../../hooks/useRequest";
import { OtherInput } from "../Form/Form";

const ResetPassword = (props) => {
  const { token } = props.match.params;

  useEffect(() => {
    document.title = "Reset Password - Noonmar";
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const { request, response } = useRequest();

  const history = useHistory();

  useEffect(() => {
    if (response) {
      toast.success("Password has been reset successfully.");
      history.push("/login");
    }
  }, [response]);

  const onSubmitHandler = (data) => {
    const { password, confirmpassword } = data;

    if (password !== confirmpassword) {
      setError("confirmpassword", {
        type: "manual",
      });
      return;
    }
    request("POST", "admin/reset-password", {
      newPassword: password,
      reset_token: token,
    });
  };

  const onCancelHandler = () => {
    history.push("/login");
  };

  const InputFields = [
    {
      label: "New Password",
      type: "password",
      name: "password",
      registerFields: {
        required: true,
        pattern: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/,
      },
      patternError:
        "Password must be of 8 characters long with atleast one Uppercase, one Lowercase and one Number",
    },
    {
      label: "Confirm Password",
      type: "password",
      name: "confirmpassword",
      registerFields: {
        required: true,
        pattern: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/,
      },
      patternError:
        "Confirm Password must be of 8 characters long with atleast one Uppercase, one Lowercase and one Number",
      otherRegisterFields: {
        manual: true,
        feedback: "Both Passwords do not match",
      },
    },
  ];

  return (
    <div className="login login-4 wizard d-flex flex-column flex-lg-row flex-column-fluid">
      <div className="login-container d-flex flex-center bgi-size-cover bgi-no-repeat flex-row-fluid p-8">
        <div className="login-content d-flex flex-column card p-5 p-md-10">
          <a /*href="#!"*/ className="login-logo pb-8 text-center">
            <img src="./logo.png" className="max-h-80px" alt="" />
          </a>

          <div className="login-form">
            <form
              className="form"
              id="kt_login_forgot_form"
              onSubmit={handleSubmit(onSubmitHandler)}
            >
              <div className="pb-5 pb-lg-15">
                <h3 className="font-weight-bolder text-dark font-size-h2 font-size-h1-lg">
                  Reset Password
                </h3>
                <p className="text-muted font-weight-bold font-size-h4">
                  Enter new password
                </p>
              </div>

              {InputFields.map((input, index) => (
                <OtherInput
                  key={index}
                  {...input}
                  errors={errors}
                  register={register}
                />
              ))}

              <div className="form-group d-flex flex-wrap">
                <button
                  onClick={handleSubmit(onSubmitHandler)}
                  style={{ display: "none" }}
                ></button>
                <a
                  onClick={handleSubmit(onSubmitHandler)}
                  id="kt_login_forgot_form_submit_button"
                  className="btn btn-primary font-weight-bolder font-size-h6 px-8 py-4 my-3 mr-4"
                >
                  Submit
                </a>
                <a
                  onClick={onCancelHandler}
                  id="kt_login_forgot_cancel"
                  className="btn btn-light-primary font-weight-bolder font-size-h6 px-8 py-4 my-3"
                >
                  Cancel
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
