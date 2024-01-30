import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import useRequest from "../../../hooks/useRequest";
import Breadcrumb from "../../Breadcrumb/Breadcrumb";
import GooglePlace from "../../GooglePlace/GooglePlace";
import {
  Textarea,
  Input,
  SelectInput,
  RenderInputFields,
  SubmitButton,
} from "../../Form/Form";

const Edit = (props) => {
  const { id: recordId } = props.match.params;
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    clearErrors,
  } = useForm();

  const { response, request } = useRequest();
  const { response: responseFetchUser, request: requestFetchUser } =
    useRequest();

  const history = useHistory();

  useEffect(() => {
    document.title = "Payment Fees - Noonmar";
    requestFetchUser("GET", `payment-method/${recordId}`);
    // requestVendors("GET", `vendor/all?page=1&isActive=${true}`);
  }, []);

  useEffect(() => {
    if (response) {
      toast.success("Payment fees has been updated successfully.");
      history.push("/pricing-setting/payment-methods");
    }
  }, [response]);

  useEffect(() => {
    if (responseFetchUser) {
      if (responseFetchUser.status && responseFetchUser.paymentMethod) {
        const {
          information,
          fixedValue,
          minimumLimit,
          percentage,
          isOnlinePayment,
        } = responseFetchUser.paymentMethod;

        setValue("information", information);
        setValue("minimumLimit", minimumLimit);
        setValue("fixedValue", fixedValue);
        setValue("percentage", percentage);
        setValue("isOnlinePayment", isOnlinePayment);
      }
    }
  }, [responseFetchUser]);

  const onSubmit = (data) => {
    const {
      information,
      fixedValue,
      minimumLimit,
      percentage,
      isOnlinePayment,
    } = data;

    request("PUT", "payment-method", {
      // vendor,
      information,
      fixedValue,
      minimumLimit,
      percentage,
      id: recordId,
      isOnlinePayment,
    });
  };

  const InputFields = [
    [
      {
        Component: Input,
        label: "Percentage",
        type: "Number",
        name: "percentage",
        registerFields: {
          required: true,
        },
      },
      {
        Component: Input,
        label: "Fixed Value",
        type: "Number",
        name: "fixedValue",
        registerFields: {
          required: true,
        },
      },
      {
        Component: Input,
        label: "Minimum Limit",
        type: "Number",
        name: "minimumLimit",
        registerFields: {
          required: true,
        },
      },
      {
        Component: Textarea,
        label: "Method Information",
        type: "text",
        name: "information",
        registerFields: {
          required: true,
        },
        colClass: "col-xl-12",
      },
    ],
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Edit Payment Fees"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: "/pricing-setting/payment-methods",
            name: "Back To Payment Mathods",
          },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Edit Payment Fees</h3>
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
