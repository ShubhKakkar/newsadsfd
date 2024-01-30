import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import {
  Input,
  RenderInputFields,
  SubmitButton,
  ReactSelectInput,
} from "../Form/Form";
import { SubTab, SubInput } from "../LanguageForm/LanguageForm";

const Edit = (props) => {
  const { id: recordId } = props.match.params;
  const history = useHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    getValues,
    trigger,
    clearErrors,
    reset,
    control,
  } = useForm();

  const { languages } = useSelector((state) => state.setting);

  const { response: responseReason, request: requestReason } = useRequest();
  const { response: responseCountries, request: requestCountries } =
    useRequest();
  const [allCountry, setAllCountry] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState();
  const [langDataIds, setLangDataIds] = useState([]);

  const { response, request } = useRequest();

  useEffect(() => {
    document.title = "Edit Reason - Noonmar";
  }, []);

  useEffect(() => {
    if (languages) {
      requestReason("GET", `promotion-package/${recordId}`);
      requestCountries("GET", `country/all?page=1&isActive=${true}`);
    }
  }, [languages]);

  useEffect(() => {
    if (responseReason) {
      const { duration, amount } = responseReason.data.data;

      const {
        data: { title },
        countriesData,
        languageData,
      } = responseReason.data;
      const subData = {};

      setLangDataIds(languageData);
      languageData.forEach((lang) => {
        const code = lang.languageCode;
        subData["title-" + code] = lang.title;
      });

      reset({ title, ...subData });

      let countries = [];
      let countryIds = [];
      if (countriesData && countriesData.length > 0) {
        countriesData.forEach((obj) => {
          countries.push({
            label: obj.name,
            value: obj.id,
          });
          countryIds.push(obj.id);
        });
        setSelectedCountry(countries);
      }
      setValue("country", countryIds);
      setValue("duration", duration);
      setValue("amount", amount);
    }
  }, [responseReason]);

  useEffect(() => {
    if (response) {
      toast.success("Promotion package has been updated successfully.");
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

  const onSubmit = (data) => {
    const dataToSend = [];
    const defaultData = {
      title: data["title"],
      amount: data["amount"],
      duration: data["duration"],
      country: data["country"],
    };

    if (parseInt(data["duration"]) < 1) {
      setError("duration", { type: "manual" });
      return;
    }

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;

      const lang = langDataIds.find((obj) => {
        if (obj.languageCode == code) {
          return obj.id;
        }
      });

      dataToSend.push({
        title: data["title-" + code] ?? "",
        id: lang && lang.id ? lang.id : "",
      });

      if (languages[i].default) {
        defaultData.title = data["title-" + code];
      }
    }

    request("PUT", "promotion-package", {
      id: recordId,
      ...defaultData,
      data: dataToSend,
    });
  };

  const InputFields = [
    [
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
        title="Edit Promotion Package"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: { pathname: "/promotion-packages" /*backPageNum: page */ },
            name: "Back To Promotion Packages",
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
                    Edit Promotion Package
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
                                isEdit={true}
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
                      name="Update"
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

export default Edit;
