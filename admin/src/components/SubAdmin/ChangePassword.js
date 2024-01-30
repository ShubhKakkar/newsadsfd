import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { Input, RenderInputFields, SubmitButton } from "../Form/Form";

const ChangePassword = (props) => {
  const { id: SubadminId } = props.match.params;
  const {
    register,
    handleSubmit,
    formState: { errors },
    resetField,
    setError,
  } = useForm();

  const history = useHistory();

  const { request, response } = useRequest();

  useEffect(() => {
    document.title = "Change Password - Noonmar";
  }, []);

  useEffect(() => {
    if (response) {
      toast.success("Password has been changed successfully.");
      resetField("newPassword");
      resetField("confirmNewPassword");
      history.push("/sub-admin");
    }
  }, [response]);

  const onSubmitHandler = (data) => {
    const { newPassword, confirmNewPassword } = data;

    if (confirmNewPassword !== newPassword) {
      setError("confirmNewPassword", {
        type: "manual",
      });
      return;
    }

    request("PUT", "sub-admin/change-password", {
      id: SubadminId,
      password: newPassword,
    });
  };

  const InputFields = [
    [
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
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/sub-admin", name: "Back To Sub- Admin" },
        ]}
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
