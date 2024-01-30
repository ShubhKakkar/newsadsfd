import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { Input, RenderInputFields, SubmitButton } from "../Form/Form";

const Edit = (props) => {
  const { id: seekerId } = props.match.params;
  const history = useHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const { response: responseFetchUser, request: requestFetchSeeker } =
    useRequest();

  const { response, request } = useRequest();

  useEffect(() => {
    if (seekerId) {
      requestFetchSeeker("GET", `registration-field/${seekerId}`);
      document.title = "Edit Registration Field - Noonmar";
    }
  }, [seekerId]);

  useEffect(() => {
    if (responseFetchUser) {
      const { name } = responseFetchUser.RegistrationFields;
      setValue("name", name);
    }
  }, [responseFetchUser]);

  useEffect(() => {
    if (response) {
      toast.success("Registration field has been updated successfully.");
      history.push("/registration-fields");
    }
  }, [response]);

  const onSubmit = (data) => {
    const { name } = data;

    const { name: oldName } = responseFetchUser.RegistrationFields;

    let updates = {};

    if (name.trim() != oldName) {
      updates.name = name;
    }

    request("PUT", "registration-field", {
      name,
      ...updates,
      id: seekerId,
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
          // pattern: /^[A-Za-z ]+$/,
        },
        // registerFieldsFeedback: {
        //   pattern: "Name can only contain letters.",
        // },
      },
    ],
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Edit Registration Field"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: { pathname: "/registration-fields" /*backPageNum: page */ },
            name: "Back To Registration Field",
          },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-xl-1"></div>
                <div className="col-xl-10">
                  <h3 className="mb-10 font-weight-bold text-dark">
                    Edit Registration Field
                  </h3>

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <RenderInputFields
                      InputFields={InputFields}
                      errors={errors}
                      register={register}
                    />

                    <div className="row"></div>

                    <SubmitButton
                      handleSubmit={handleSubmit}
                      onSubmit={onSubmit}
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

export default Edit;
