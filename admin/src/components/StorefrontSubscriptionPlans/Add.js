import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { Input, RenderInputFields, SubmitButton, Textarea } from "../Form/Form";
import { SubTab, SubInput } from "../LanguageForm/LanguageForm";

const Add = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues,
    setValue,
    trigger,
    clearErrors,
  } = useForm();

  const { languages } = useSelector((state) => state.setting);

  const { response, request } = useRequest();

  const history = useHistory();

  useEffect(() => {
    document.title = "Add Storefront Subscription Plan - Noonmar";
  }, []);

  useEffect(() => {
    if (response) {
      toast.success("Subscription plan has been added successfully.");
      history.push("/storefront-subscription-plans");
    }
  }, [response]);

  const onSubmit = (data) => {
    const dataToSend = [];
    const defaultData = {};

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;
      dataToSend.push({
        languageCode: code,
        name: data["name-" + code] ?? "",
        features: data["features-" + code] ?? "",
      });

      if (languages[i].default) {
        defaultData.name = data["name-" + code];
        defaultData.features = data["features-" + code];
        defaultData.monthlyPrice = data["monthlyPrice"];
        defaultData.yearlyPrice = data["yearlyPrice"];
      }
    }

    request("POST", "subscription-plan", {
      ...defaultData,
      subData: dataToSend,
    });
  };

  const InputFields = [
    [
      {
        Component: Input,
        label: "Monthly Price",
        name: "monthlyPrice",
        registerFields: {
          required: true,
          pattern: /^\d{1,3}(,\d{3})*(\,|.\d+)?$/i,
        },
        registerFieldsFeedback: {
          pattern: "Price can only contain numbers.",
        },
      },
      {
        Component: Input,
        label: "Yearly Price",
        name: "yearlyPrice",
        registerFields: {
          required: true,
          pattern: /^\d{1,3}(,\d{3})*(\,|.\d+)?$/i,
        },
        registerFieldsFeedback: {
          pattern: "Price can only contain numbers.",
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
        title="Add Storefront Subscription Plan"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: "/storefront-subscription-plans",
            name: "Back To Storefront Subscription Plans",
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
                    Add New Subscription Plan
                  </h3>

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="card card-custom gutter-b">
                      <div className="card-header card-header-tabs-line">
                        <div className="card-toolbar">
                          <ul
                            className="nav nav-tabs nav-tabs-space-lg nav-tabs-line nav-bold nav-tabs-line-3x"
                            role="tablist"
                          >
                            {languages.length > 0 &&
                              languages.map((lang, index) => (
                                <SubTab
                                  key={index}
                                  name={lang.name}
                                  index={index}
                                  image={lang?.image}
                                />
                              ))}
                          </ul>
                        </div>
                      </div>

                      <div className="card-body px-0">
                        <div className="tab-content px-10">
                          {languages.length > 0 &&
                            languages.map((lang, index) => (
                              <SubInput
                                key={index}
                                index={index}
                                errors={errors}
                                register={register}
                                getValues={getValues}
                                setValue={setValue}
                                trigger={trigger}
                                required={lang.required}
                                titleName={"name-" + lang.code}
                                titleLabel={"Name"}
                                featuresName={"features-" + lang.code}
                                featuresLabel={"Features"}
                                clearErrors={clearErrors}
                                isEdit={false}
                              />
                            ))}
                        </div>
                      </div>
                    </div>
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
                      pxClass="px-10"
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
