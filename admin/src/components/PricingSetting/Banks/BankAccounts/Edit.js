import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import useRequest from "../../../../hooks/useRequest";
import Breadcrumb from "../../../Breadcrumb/Breadcrumb";
import GooglePlace from "../../../GooglePlace/GooglePlace";
import {
  Input,
  Textarea,
  SelectInput,
  RenderInputFields,
  SubmitButton,
} from "../../../Form/Form";

const Edit = (props) => {
  const { bankId, id } = props.match.params;
  const history = useHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    clearErrors,
    watch,
  } = useForm();

  const { response: responseFetchUser, request: requestFetchSeeker } =
    useRequest();

  const { response, request } = useRequest();

  const { response: responseCurrencies, request: requestCurrencies } =
    useRequest();

  const [allCurrencies, setAllCurrencies] = useState([]);

  useEffect(() => {
    if (bankId) {
      requestCurrencies("GET", `currency/data`);
      document.title = "Edit Bank-Account - Noonmar";
    }
  }, [bankId]);

  useEffect(() => {
    if (responseFetchUser) {
      const { name, information, currency, iban, bankId } =
        responseFetchUser.bankAccount;
      setValue("bankId", bankId);
      setValue("name", name);
      setValue("information", information);
      //setSelectedCountry(country);
      setValue("currency", currency.value);
      setValue("iban", iban);
      // setValue("geoLocation", geoLocation?.coordinates);
    }
  }, [responseFetchUser]);

  useEffect(() => {
    if (response) {
      toast.success("Bank-Account updated successfully.");
      history.push(`/pricing-setting/bank/account/${bankId}`);
    }
  }, [response]);
  useEffect(() => {
    if (responseCurrencies) {
      if (responseCurrencies.status && responseCurrencies.data) {
        requestFetchSeeker("GET", `bank-account/${bankId}/${id}`);
        setAllCurrencies(responseCurrencies.data);
      }
    }
  }, [responseCurrencies]);

  const onSubmit = (data) => {
    const { name, information, currency, iban } = data;

    request("PUT", "bank-account", {
      name,
      currency,
      information,
      iban,
      bankId,
      id,
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
        //   pattern: "Bank-Account name can only contain letters.",
        // },
      },
      {
        Component: SelectInput,
        label: "Currency",
        name: "currency",
        registerFields: {
          required: true,
        },
        children: allCurrencies && allCurrencies.length > 0 && (
          <>
            <option value="">{"Select an option"}</option>
            {allCurrencies.map((obj) => (
              <option key={obj._id} value={obj._id}>
                {" "}
                {obj.sign}
              </option>
            ))}
          </>
        ),
      },
      {
        Component: Input,
        label: "IBA Number",
        type: "text",
        name: "iban",
        registerFields: {
          required: true,
        },
      },
      {
        Component: Textarea,
        label: "Information",
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
        title="Edit Bank Account"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: `/pricing-setting/bank/account/${bankId}`,
            name: "Back To Bank Accounts",
          },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Edit Bank Account</h3>
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
