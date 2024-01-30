import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import {
  Input,
  RenderInputFields,
  SubmitButton,
  SubTab,
  SubInput,
} from "../Form/Form";

const Edit = (props) => {
  const { id: reasonId } = props.match.params;
  const history = useHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm();

  const { response: responseFetchData, request: requestFetchData } =
    useRequest();

  const { response, request } = useRequest();

  const [parentId, setParentId] = useState("");

  useEffect(() => {
    if (reasonId) {
      requestFetchData("GET", `master/inventory-reason/${reasonId}`);
      document.title = "Edit Reason - Noonmar";
    }
  }, [reasonId]);

  useEffect(() => {
    if (responseFetchData) {
      const { reason, isActive, parentId } = responseFetchData.reason;

      setValue("reason", reason);

      setValue("isActive", isActive);

      setParentId(parentId);
    }
  }, [responseFetchData]);

  useEffect(() => {
    if (response) {
      toast.success(" Inventory reason updated successfully.");
      history.push(`/inventory-reasons`);
    }
  }, [response]);

  const onSubmit = (data) => {
    const { isActive, reason } = data;

    request("PUT", "master/inventory-reason", {
      reason,
      isActive,
      id: reasonId,
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
        title="Edit Reason"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: { pathname: `/inventory-reasons/${parentId}` },
            name: "Back To Inventory-Reason",
          },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Edit Reason</h3>
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
                      name="Update"
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
