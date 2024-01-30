import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import useRequest from "../../../../hooks/useRequest";
import Breadcrumb from "../../../Breadcrumb/Breadcrumb";
import {
  Textarea,
  Input,
  SelectInput,
  RenderInputFields,
  SubmitButton,
} from "../../../Form/Form";

const Add = (props) => {
  const { id: bankId } = props.match.params;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    clearErrors,
  } = useForm();

  const { response, request } = useRequest();
  const { response: responseCurrencies, request: requestCurrencies } =
    useRequest();
  // const { response: responseVendors, request: requestVendors } = useRequest();

  const [allCurrencies, setAllCurrencies] = useState([]);
  // const [allVendors, setAllVendors] = useState([]);

  const history = useHistory();

  useEffect(() => {
    document.title = "Add Bank Account - Noonmar";
    requestCurrencies("GET", `currency/data`);
    // requestVendors("GET", `vendor/all?page=1&isActive=${true}`);
  }, []);

  useEffect(() => {
    if (response) {
      toast.success("Banks has been added successfully.");
      history.push(`/pricing-setting/bank/account/${bankId}`);
    }
  }, [response]);

  useEffect(() => {
    if (responseCurrencies) {
      if (responseCurrencies.status && responseCurrencies.data) {
        setAllCurrencies(responseCurrencies.data);
      }
    }
  }, [responseCurrencies]);

  // useEffect(() => {
  //   if (responseVendors) {
  //     if (responseVendors.status && responseVendors.users) {
  //       setAllVendors(responseVendors.users);
  //     }
  //   }
  // }, [responseVendors]);

  const onSubmit = (data) => {
    const { name, information, currency, iban } = data;

    request("POST", "bank-account", {
      name,
      currency,
      information,
      iban,
      bankId,
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
        //   pattern: "Bank name can only contain letters.",
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
        title="Add Bank Account"
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
              <h3 class="card-title">Add Bank Account</h3>
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
