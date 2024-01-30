import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import {
  Input,
  SelectInput,
  RenderInputFields,
  SubmitButton,
} from "../Form/Form";

import { SubTab, SubInput } from "../LanguageForm/LanguageForm";
const Add = () => {
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    getValues,
    trigger,
    clearErrors,
    control,
    formState: { errors },
  } = useForm();

  const { languages } = useSelector((state) => state.setting);

  const { response, request } = useRequest();
  const history = useHistory();

  useEffect(() => {
    document.title = "Add Unit - Noonmar";
  }, []);

  useEffect(() => {
    if (response) {
      toast.success("Unit has been added successfully.");
      history.push("/units");
    }
  }, [response]);

  // const onSubmit = (data) => {
  //   let fd = new FormData();

  //   const dataToSend = [];

  //   for (let i = 0; i < languages.length; i++) {
  //     const code = languages[i].code;
  //     dataToSend.push({
  //       languageCode: code,
  //       name: data["name-" + code] ?? "",
  //     });

  //     if (languages[i].default) {
  //       fd.append("name", data["name-" + code]);
  //     }
  //   }

  //   fd.append("subData", JSON.stringify(dataToSend));

  //   // const { name } = data;
  //   // request("POST", "unit", { name });
  //   request("POST", "unit", fd);
  // };

  const onSubmit = (data) => {
    const dataToSend = [];
    let name;

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;

      dataToSend.push({
        languageCode: code,
        name: data["name-" + code] ?? "",
      });

      if (languages[i].default) {
        name = data["name-" + code];
      }
    }

    request("POST", "unit", {
      name,
      subData: dataToSend,
    });
  };

  // if (languages[i].default) {
  //   fd.append("name", data["name-" + code]);
  // }

  // fd.append("subData", JSON.stringify(dataToSend));

  // const { name } = data;
  // request("POST", "unit", { name });
  //   request("POST", "unit",{name,subData,});
  // };
  // const InputFields = [
  //   [
  //     {
  //       Component: Input,
  //       label: "Unit Name",
  //       type: "text",
  //       name: "name",
  //       registerFields: {
  //         required: true,
  //         // pattern: /^[A-Za-z ]+$/,
  //       },
  //       // registerFieldsFeedback: {
  //       //   pattern: "Unit Name can only contain letters.",
  //       // },
  //     },
  //   ],
  // ];

  const InputFields = [[]];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Add Unit"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/units", name: "Back To Units" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom">
            <div class="card-header">
              <h3 class="card-title">Add Unit</h3>
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Add New Unit</h3>
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
      </div> */}
    </div>
  );
};

export default Add;
