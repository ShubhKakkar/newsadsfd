import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Modal from "react-modal";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import {
  Input,
  SelectInput,
  RenderInputFields,
  SubmitButton,
  ReactSelectInput,
} from "../Form/Form";
import { SubTab, SubInput } from "../LanguageForm/LanguageForm";

const Add = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    getValues,
    trigger,
    clearErrors,
    control,
  } = useForm();

  const { languages } = useSelector((state) => state.setting);

  const { response, request } = useRequest();

  const history = useHistory();

  useEffect(() => {
    document.title = "Add Specification Groups - Noonmar";
  }, []);

  useEffect(() => {
    if (languages) {
      languages.forEach((lang, index) => {
        if (lang.default) {
          register(`name-${lang.code}`, { required: true });
        } else {
          register(`name-${lang.code}`);
        }
      });
    }
  }, [languages]);

  useEffect(() => {
    if (response) {
      toast.success("Specification-groups has been added successfully.");
      history.push("/specification-groups");
    }
  }, [response]);

  const onSubmit = (data) => {
    // const { name } = data;

    let fd = new FormData();

    const dataToSend = [];

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;
      dataToSend.push({
        languageCode: code,
        name: data["name-" + code] ?? "",
      });

      if (languages[i].default) {
        fd.append("name", data["name-" + code]);
      }
    }

    fd.append("subData",JSON.stringify(dataToSend));
    request("POST", "specification-groups", fd);
  };

  // const searchHandler = (e) => {
  //   if (e) {
  //     e.preventDefault();
  //   }
  // };

  // const InputFields = [
  //   [

  //   ],
  // ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Add Specification Groups"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/specification-groups", name: "Back To Specification Groups" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom">
            <div class="card-header">
              <h3 class="card-title">Add New Specification Groups</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-xl-12">
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
                                clearErrors={clearErrors}
                                isEdit={false}
                              />
                            ))}
                        </div>
                      </div>
                    </div>
                    {/* <RenderInputFields
                      InputFields={InputFields}
                      errors={errors}
                      register={register}
                    />   */}

                    <div className="row"></div>

                    <SubmitButton
                      handleSubmit={handleSubmit}
                      onSubmit={onSubmit}
                      name="Submit"
                      pxClass="px-10"
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
