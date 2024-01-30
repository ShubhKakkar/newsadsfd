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

  const { response: responseCountries, request: requestCountries } =
    useRequest();

  const [allCountry, setAllCountry] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState([]);

  const history = useHistory();

  useEffect(() => {
    document.title = "Add Promotion Package - Noonmar";
    requestCountries("GET", `country/all?page=1&isActive=${true}`);
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
      toast.success("Promotion package has been added successfully.");
      history.push("/promotion-packages");
    }
  }, [response]);

  useEffect(() => {
    if (responseCountries) {
      if (responseCountries.status && responseCountries.data) {
        let countries = [];
        if (responseCountries.data.length > 0) {
          responseCountries.data.forEach((obj) => {
            countries.push({
              label: obj.name,
              value: obj._id,
            });
          });
        }
        setAllCountry(countries);
      }
    }
  }, [responseCountries]);

  const onSubmit = (data) => {
    if (parseInt(data["duration"]) < 1) {
      setError("duration", { type: "manual" });
      return;
    }

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
        defaultData.duration = data["duration"];
        defaultData.amount = data["amount"];
        defaultData.country = data["country"];
      }
    }

    request("POST", "promotion-package", {
      ...defaultData,
      subData: dataToSend,
    });
  };

  const handleChange = (event) => {
    setSelectedCountry(event);

    if (event && event.length > 0) {
      let countryids = [];
      event.forEach((obj) => {
        countryids.push(obj.value);
      });
      setError("country", "");
      setValue("country", countryids);
    } else {
      setValue("country", null);
    }
  };

  const InputFields = [
    [
      // {
      //   Component: Input,
      //   label: "Title",
      //   type: "text",
      //   name: "title",
      //   registerFields: {
      //     required: true,
      //     pattern: /^[A-Za-z ]+$/,
      //   },
      //   registerFieldsFeedback: {
      //     pattern: "Title can only contain letters.",
      //   },
      // },
      {
        Component: Input,
        label: "Duration (in months)",
        type: "text",
        name: "duration",
        registerFields: {
          required: true,
          pattern: /^[0-9]+$/,
        },
        registerFieldsFeedback: {
          pattern: "Duration can only numbers.",
        },
        otherRegisterFields: {
          feedback: "The duration field must be greater than 0.",
        },
      },
      {
        Component: Input,
        label: "Amount",
        name: "amount",
        registerFields: {
          required: true,
          pattern: /^\d{1,3}(,\d{3})*(\,|.\d+)?$/i,
        },
        registerFieldsFeedback: {
          pattern: "Amount can only contain numbers.",
        },
      },
      {
        Component: ReactSelectInput,
        label: "Country",
        name: "country",
        registerFields: {
          required: true,
        },
        control,
        options: allCountry,
        handleChange: handleChange,
        selectedOption: selectedCountry,
        isMultiple: true,
      },
    ],
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Add Promotion Package"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/promotion-packages", name: "Back To Promotion Packages" },
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
                    Add Promotion Package
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
