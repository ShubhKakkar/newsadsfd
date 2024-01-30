import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";

import useRequest from "../../hooks/useRequest";
import { authSuccess } from "../../store/auth/action";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { Input, RenderInputFields, SubmitButton } from "../Form/Form";

const Profile = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const { request, response } = useRequest();

  const dispatch = useDispatch();

  const { userId, name, email } = useSelector((state) => state.auth);

  useEffect(() => {
    document.title = "Profile - Noonmar";
  }, []);

  useEffect(() => {
    if (name && email) {
      setValue("name", name);
      setValue("email", email);
    }
  }, [name, email]);

  useEffect(() => {
    if (response) {
      toast.success("Profile has been updated successfully.");
      dispatch(
        authSuccess({ name: response.name, email: response.email || email })
      );
    }
  }, [response]);

  const onSubmitHandler = (data) => {
    const { name, email: newEmail } = data;

    let updates = {};
    if (newEmail.trim() !== email) {
      updates.email = newEmail;
    }

    request("PUT", "admin", {
      id: userId,
      name,
      ...updates,
    });
  };

  const InputFields = [
    [
      {
        Component: Input,
        label: "Name",
        type: "text",
        name: "name",
        registerFields: {
          required: true,
        },
      },
    ],
    [
      {
        Component: Input,
        label: "Email",
        type: "email",
        name: "email",
        registerFields: {
          required: true,
          pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        },
        registerFieldsFeedback: {
          pattern: "The email field must be a valid email address.",
        },
      },
    ],
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb title="My Account" links={[{ to: "/", name: "Dashboard" }]} />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-xl-1"></div>
                <div className="col-xl-10">
                  <h3 className="mb-10 font-weight-bold text-dark">
                    {/* My Profile */}
                  </h3>

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

export default Profile;
