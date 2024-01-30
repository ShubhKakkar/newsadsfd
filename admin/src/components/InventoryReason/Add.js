import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import {
  Input,
  RenderInputFields,
  SubmitButton,
  ReactSelectInput,
  SelectInput,
  SubTab,
  SubInput,
} from "../Form/Form";

const Add = (props) => {
  const { id: parentId } = props.match.params;

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setError,
    setValue,
    watch,
  } = useForm();

  const { response, request } = useRequest();
  const history = useHistory();

  useEffect(() => {
    document.title = "Add Inventory-Reason - Noonmar";
  }, []);

  useEffect(() => {
    if (response) {
      toast.success("Inventory reason added successfully.");
      history.push(`/inventory-reasons`);
    }
  }, [response]);

  const onSubmit = (data) => {
    const { isActive, reason } = data;

    request("POST", "master/inventory-reason", {
      reason,
      parentId,
      isActive,
    });
  };

  const InputFields = [
    [
      {
        Component: Input,
        label: "Reason",
        type: "text",
        name: "reason",
        registerFields: {
          required: true,
          // pattern: /^[A-Za-z ]+$/,
        },
        // registerFieldsFeedback: {
        //   pattern: "Reason can only contain letters.",
        // },
      },

      {
        Component: Input,
        label: "Status",
        name: "isActive",
        type: "checkbox",
        registerFields: {
          required: false,
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
        title="Add Reason"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: `/inventory-reason/${parentId}`,
            name: "Back To Inventory-Reasons",
          },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Add New Reason</h3>
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

export default Add;
