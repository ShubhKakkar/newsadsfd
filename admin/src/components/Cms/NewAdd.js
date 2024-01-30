import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import { SubTab, SubInput } from "./TabNInput";
import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { SelectInput, SubmitButton, Input } from "../Form/Form";

const Add = () => {
  const { languages } = useSelector((state) => state.setting);

  const {
    register,
    handleSubmit,
    formState: { errors },
    // resetField,
    setValue,
    trigger,
    getValues,
    clearErrors,
  } = useForm();

  const history = useHistory();

  const { response, request } = useRequest();

  useEffect(() => {
    document.title = "Add CMS - Noonmar";
  }, []);

  useEffect(() => {
    if (languages) {
      languages.forEach((lang, index) => {
        if (lang.default) {
          register(`description-${lang.code}`, { required: true });
        } else {
          register(`description-${lang.code}`);
        }
      });
    }
  }, [languages]);

  useEffect(() => {
    if (response) {
      toast.success("CMS page has been added successfully.");
      history.push("/cms");
    }
  }, [response]);

  const onSubmit = (data) => {
    const dataToSend = [];
    const defaultData = { name: data["pageName"] };

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;
      dataToSend.push({
        languageCode: code,
        title: data["title-" + code] ?? "",
        description: data["description-" + code] ?? "",
      });

      if (languages[i].default) {
        defaultData.title = data["title-" + code];
        defaultData.description = data["description-" + code];
      }
    }
    request("POST", "cms", { ...defaultData, subData: dataToSend });
  };

  const InputFields = [
    {
      label: "Page Name",
      name: "pageName",
      registerFields: {
        required: true,
      },
      type: "text",
    },
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Add CMS Page"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/cms", name: "Back To CMS Page" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="card card-custom gutter-b">
              <div className="card-body">
                <div className="row">
                  {InputFields.map((input, index) => (
                    <Input
                      key={index}
                      {...input}
                      errors={errors}
                      register={register}
                    />
                  ))}
                </div>
              </div>
            </div>

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
                        titleName={"title-" + lang.code}
                        descName={"description-" + lang.code}
                        clearErrors={clearErrors}
                        isEdit={false}
                      />
                    ))}
                </div>

                <SubmitButton
                  handleSubmit={handleSubmit}
                  onSubmit={onSubmit}
                  name="Submit"
                  pxClass="px-10"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Add;
