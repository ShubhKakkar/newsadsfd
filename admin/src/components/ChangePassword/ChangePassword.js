import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { Input, RenderInputFields, SubmitButton } from "../Form/Form";

const ChangePassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    resetField,
    setError,
  } = useForm();

  const { request, response } = useRequest();

  const { userId } = useSelector((state) => state.auth);

  useEffect(() => {
    document.title = "Change Password - Noonmar";
  }, []);

  useEffect(() => {
    if (response) {
      toast.success("Password has been changed successfully.");
      resetField("oldPassword");
      resetField("newPassword");
      resetField("confirmNewPassword");
    }
  }, [response]);

  const onSubmitHandler = (data) => {
    const { oldPassword, newPassword, confirmNewPassword } = data;

    if (oldPassword === newPassword) {
      setError("newPassword", {
        type: "manual",
      });
      return;
    }

    if (confirmNewPassword !== newPassword) {
      setError("confirmNewPassword", {
        type: "manual",
      });
      return;
    }

    request("POST", "admin/change-password", {
      id: userId,
      oldPassword,
      newPassword,
    });
  };

  const InputFields = [
    [
      {
        Component: Input,
        label: "Old Password",
        type: "password",
        name: "oldPassword",
        registerFields: {
          required: true,
          pattern: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/,
        },
        registerFieldsFeedback: {
          pattern:
            "Old password must be of 8 characters long with atleast one uppercase, one lowercase and one number.",
        },
      },
      {
        Component: Input,
        label: "New Password",
        type: "password",
        name: "newPassword",
        registerFields: {
          required: true,
          pattern: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/,
        },
        registerFieldsFeedback: {
          pattern:
            "New password must be of 8 characters long with atleast one uppercase, one lowercase and one number.",
        },
        otherRegisterFields: {
          manual: true,
          feedback: "New password cannot be equal to old Password.",
        },
      },
    ],
    [
      {
        Component: Input,
        label: "Confirm New Password",
        type: "password",
        name: "confirmNewPassword",
        registerFields: {
          required: true,
          pattern: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/,
        },
        registerFieldsFeedback: {
          pattern:
            "Confirm new password must be of 8 characters long with atleast one uppercase, one lowercase and one number.",
        },
        otherRegisterFields: {
          manual: true,
          feedback: "Confirm new password doesn't match with new password",
        },
      },
    ],
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Change Password"
        links={[{ to: "/", name: "Dashboard" }]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-xl-1"></div>
                <div className="col-xl-10">
                  {/* <h3 className="mb-10 font-weight-bold text-dark">
                    Change Password
                  </h3> */}

                  <form onSubmit={handleSubmit(onSubmitHandler)}>
                    <RenderInputFields
                      InputFields={InputFields}
                      errors={errors}
                      register={register}
                    />

                    <div className="row"></div>

                    <SubmitButton
                      handleSubmit={handleSubmit}
                      onSubmit={onSubmitHandler}
                      name="Update"
                    />
                  </form>
                </div>
                <div className="col-xl-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
