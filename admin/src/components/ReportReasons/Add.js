import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { SubmitButton } from "../Form/Form";
import { SubTab, SubInput } from "../LanguageForm/LanguageForm";

const Add = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    setValue,
    getValues,
    trigger,
  } = useForm();

  const { languages } = useSelector((state) => state.setting);

  const { response, request } = useRequest();

  const history = useHistory();

  useEffect(() => {
    document.title = "Add Reason - Noonmar";
  }, []);

  useEffect(() => {
    if (languages) {
      languages.forEach((lang, index) => {
        if (lang.default) {
          register(`title-${lang.code}`, { required: true });
        } else {
          register(`title-${lang.code}`);
        }
      });
    }
  }, [languages]);

  useEffect(() => {
    if (response) {
      toast.success("Reason has been added successfully.");
      history.push("/report-reasons");
    }
  }, [response]);

  const onSubmit = (data) => {
    const dataToSend = [];
    const defaultData = {};

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;
      dataToSend.push({
        languageCode: code,
        title: data["title-" + code] ?? "",
      });

      if (languages[i].default) {
        defaultData.title = data["title-" + code];
      }
    }
    request("POST", "report-reason", { ...defaultData, subData: dataToSend });
  };

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Add Reason"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/report-reasons", name: "Back To Report Reasons" },
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
                    Add New Reason
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
                                titleName={"title-" + lang.code}
                                titleLabel={"Title"}
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
