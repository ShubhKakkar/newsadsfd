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
  SubTab,
  SubInput,
} from "../Form/Form";

const Add = (props) => {
  const { id: parentId } = props.match.params;

  const { languages } = useSelector((state) => state.setting);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm();

  const { response, request } = useRequest();

  const history = useHistory();

  useEffect(() => {
    document.title = "Add City - Noonmar";
  }, []);

  useEffect(() => {
    if (response) {
      toast.success("City has been added successfully.");
      history.push(`/cities/${parentId}`);
    }
  }, [response]);

  const onSubmit = (data) => {
    const { isActive, pinCode } = data;

    const langData = [];
    let name;

    languages.forEach((lang) => {
      langData.push({
        languageCode: lang.code,
        name: data[`name-${lang.code}`],
      });

      if (lang.default) {
        name = data[`name-${lang.code}`];
      }
    });

    request("POST", "city", {
      name,
      isActive,
      parentId,
      pinCode,
      langData,
    });
  };

  const InputFields = [
    [
      // {
      //   Component: Input,
      //   label: "City Name",
      //   type: "text",
      //   name: "name",
      //   registerFields: {
      //     required: true,
      //     pattern: /^[A-Za-z ]+$/,
      //   },
      //   registerFieldsFeedback: {
      //     pattern: "City Name can only contain letters.",
      //   },
      // },
      {
        Component: Input,
        label: "Pin Code",
        type: "number",
        name: "pinCode",
        registerFields: {
          required: true,
          min: 1,
        },
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
        title="Add City"
        links={[
          { to: "/", name: "Dashboard" },
          { to: `/cities/${parentId}`, name: "Back To Cities" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Add New City</h3>
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
                                  tabName={`language_${index}`}
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
                                required={lang.required}
                                control={control}
                                InputFields={[
                                  [
                                    {
                                      Component: Input,
                                      label: "City Name",
                                      type: "text",
                                      name: "name",
                                      // isRequired: true,
                                      registerFields: {
                                        // required: true,
                                        // pattern: /^[A-Za-z ]+$/,
                                      },
                                      // registerFieldsFeedback: {
                                      //   pattern:
                                      //     "City Name can only contain letters.",
                                      // },
                                    },
                                  ],
                                ]}
                                code={lang.code}
                                tabName={`language_${index}`}
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
