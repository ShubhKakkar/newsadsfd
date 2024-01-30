import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { Input, RenderInputFields, SubmitButton } from "../Form/Form";

const Add = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const { response, request } = useRequest();

  const history = useHistory();

  useEffect(() => {
    document.title = "Add Registration Field - Noonmar";
  }, []);

  useEffect(() => {
    if (response) {
      toast.success("Registration Field has been added successfully.");
      history.push("/registration-fields");
    }
  }, [response]);

  const onSubmit = (data) => {
    const { name } = data;

    request("POST", "registration-field/create", { name });
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
        title="Add Registartion Field"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/registration-fields", name: "Back To Registration Fields" },
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
                    Add New Registration Field
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
                      name="Submit"
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

export default Add;
