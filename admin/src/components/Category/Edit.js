import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { Input, RenderInputFields, SubmitButton } from "../Form/Form";

const Edit = (props) => {
  const { id, sid } = props.match.params;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
  } = useForm();

  const { response, request } = useRequest();
  const { response: responseGetOne, request: requestGetOne } = useRequest();

  const history = useHistory();

  useEffect(() => {
    document.title = "Edit Category - Noonmar";
    requestGetOne("GET", `category/${id}`);
  }, []);

  useEffect(() => {
    if (responseGetOne) {
      const { name } = responseGetOne.category;
      reset({ name });
    }
  }, [responseGetOne]);

  useEffect(() => {
    if (response) {
      toast.success("Category has been updated successfully.");
      history.push(`/product/sub-categories-multi/${id}`);
    }
  }, [response]);

  const onSubmit = (data) => {
    const { name} = data;

    request("PUT", "category", { name, id });
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
        title="Edit Category"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: `/product/sub-categories-multi/${sid}`,
            name: "Back To Categories",
          },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Edit Category</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-xl-12">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Edit;
