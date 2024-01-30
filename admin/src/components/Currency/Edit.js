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
  SelectInput,
  SubTab,
  SubInput,
} from "../Form/Form";

const Edit = (props) => {
  const { id } = props.match.params;

  // const [countries, setCountries] = useState([]);
  // const [selectedCountries, setSelectedCountries] = useState([]);

  const [showExhangeRate, setShowExchangeRate] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setError,
    setValue,
  } = useForm();

  const { languages } = useSelector((state) => state.setting);

  const { response, request } = useRequest();
  const { response: responseGetOne, request: requestGetOne } = useRequest();

  const history = useHistory();

  useEffect(() => {
    document.title = "Edit Currency - Noonmar";
    requestGetOne("GET", `currency/${id}`);
  }, []);

  useEffect(() => {
    if (responseGetOne) {
      const { code, name, sign, exchangeRate, exchangeType, langData } =
        responseGetOne.currency;

      // const selectedCountries = countries.filter((c) => c.isSelected);

      // setCountries(
      //   countries.map((c) => {
      //     delete c.isSelected;
      //     return c;
      //   })
      // );

      // setSelectedCountries(
      //   selectedCountries.map((c) => {
      //     delete c.isSelected;
      //     return c;
      //   })
      // );

      const updates = {};

      if (langData && Array.isArray(langData)) {
        langData.forEach((lang) => {
          updates[`name-${lang.languageCode}`] = lang.name;
        });
      }

      reset({
        code,
        name,
        sign,
        exchangeRate,
        exchangeType,
        // countriesId: selectedCountries.map((c) => c.value),
        ...updates,
      });
    }
  }, [responseGetOne]);

  useEffect(() => {
    if (response) {
      toast.success("Currency has been updated successfully.");
      history.push("/currencies");
    }
  }, [response]);

  const onSubmit = (data) => {
    const { code, sign, exchangeRate, exchangeType } = data;

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

    request("PUT", "currency", {
      name,
      code,
      sign,
      id,
      exchangeRate,
      exchangeType,
      langData,
    });
  };

  // const handleChangeCountries = (event) => {
  //   setSelectedCountries(event);

  //   if (event) {
  //     setError("countriesId", "");
  //     setValue(
  //       "countriesId",
  //       event.map((e) => e.value)
  //     );
  //   } else {
  //     setValue("countriesId", null);
  //   }
  // };

  const InputFields = [
    [
      {
        Component: Input,
        label: "Currency Name",
        type: "text",
        name: "name",
        registerFields: {
          required: true,
          // pattern: /^[A-Za-z ]+$/,
        },
        // registerFieldsFeedback: {
        //   pattern: "Currency Name can only contain letters.",
        // },
      },
      {
        Component: Input,
        label: "Currency Code",
        type: "text",
        name: "code",
        registerFields: {
          required: true,
          // pattern: /^[A-Za-z ]+$/,
        },
        // registerFieldsFeedback: {
        //   pattern: "Currency Code can only contain letters.",
        // },
      },
      {
        Component: Input,
        label: "Currency Symbol",
        type: "text",
        name: "sign",
        registerFields: {
          required: true,
        },
      },
      {
        Component: SelectInput,
        label: "Exchange Type",
        name: "exchangeType",
        registerFields: {
          required: true,
        },
        onChange: (data) => {
          setShowExchangeRate(data === "Fixed");
        },
        children: (
          <>
            <option value="">Select Exchange Type</option>
            <option value="Fixed">Fixed</option>
            <option value="Automatic">Automatic</option>
          </>
        ),
      },
      {
        Component: Input,
        label: "Exchange Rate",
        type: "text",
        name: "exchangeRate",
        registerFields: {
          required: showExhangeRate,
        },
        inputData: {
          disabled: !showExhangeRate,
        },
      },
      // {
      //   Component: ReactSelectInput,
      //   label: "Countries",
      //   name: "countriesId",
      //   registerFields: {
      //     required: true,
      //   },
      //   control,
      //   options: countries,
      //   handleChange: handleChangeCountries,
      //   selectedOption: selectedCountries,
      //   isMultiple: true,
      // },
    ],
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Edit Currency"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/currencies", name: "Back To Currencies" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Edit New Currency</h3>
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
                                      label: "Name",
                                      type: "text",
                                      name: "name",
                                      // isRequired: true,
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

export default Edit;
