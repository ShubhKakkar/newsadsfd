import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { Sidebar, TranslatedInfo } from "./Components";
import {
  RenderInputFields,
  SubmitButton,
  Input,
  ReactSelectInput,
} from "../Form/Form";
import useRequest from "../../hooks/useRequest";

const ShippingAdd = () => {
  const [instructions, setInstructions] = useState([0]);
  const [rules, setRules] = useState([0]);

  const [countries, setCountries] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [notSelectedPriorityCountries, setNotSelectedPriorityCountries] =
    useState([]);

  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [selectedPriorityCountries, setSelectedPriorityCountries] = useState(
    []
  );
  const [selectedServingCountries, setSelectedServingCountries] = useState([]);

  const { languages } = useSelector((state) => state.setting);

  const { request, response } = useRequest();
  const { request: requestAdd, response: responseAdd } = useRequest();

  const history = useHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    setError,
    unregister,
  } = useForm();

  useEffect(() => {
    request("GET", "shipping-company/add-data");
  }, []);

  useEffect(() => {
    if (response) {
      setCountries(
        response.countries.map((item) => ({
          value: item._id,
          label: item.name,
        }))
      );
      setCurrencies(
        response.currencies.map((item) => ({
          value: item._id,
          label: item.sign,
        }))
      );
      setNotSelectedPriorityCountries(
        response.notSelectedPriorityCountries.map((item) => ({
          value: item._id,
          label: item.name,
        }))
      );
    }
  }, [response]);

  useEffect(() => {
    if (responseAdd) {
      toast.success(responseAdd.message);
      history.push("/shipping-companies");
    }
  }, [responseAdd]);

  const onSubmit = (data) => {
    //check priorityCountries should be from servingCountries

    const priorityCountries = data.priorityCountries || [];

    if (priorityCountries.length > 0) {
      for (let i = 0; i < priorityCountries.length; i++) {
        const country = priorityCountries[i];

        if (!data.servingCountries.includes(country)) {
          toast.error(
            "You can not select a country as priority if you are not serving it."
          );
          return;
        }
      }
    }

    const defaultData = {
      currency: data.currency,
      isActive: data.isActive,
      priorityCountries: priorityCountries,
      servingCountries: data.servingCountries,
    };

    const namesObj = {};
    const shippingInfoObj = {};
    const instructionsObj = {};
    const rulesObj = {};

    for (let i = 0; i < languages.length; i++) {
      const language = languages[i];

      const code = language.code;

      if (language.default) {
        defaultData.name = data[`name-${code}`];
      }

      namesObj[code] = data[`name-${code}`];
      shippingInfoObj[code] = data[`shippingInfo-${code}`];

      const instructionsLangArr = [];

      for (let j = 0; j < instructions.length; j++) {
        const id = instructions[j];
        instructionsLangArr.push(data[`instruction${id}-${code}`]);
      }

      const rulesLangArr = [];

      for (let j = 0; j < rules.length; j++) {
        const id = rules[j];
        rulesLangArr.push(data[`rule${id}-${code}`]);
      }

      instructionsObj[code] = instructionsLangArr;
      rulesObj[code] = rulesLangArr;
    }

    const languageData = [];

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;

      const obj = {};

      obj.languageCode = code;
      obj.name = namesObj[code];
      obj.information = shippingInfoObj[code];
      obj.instructions = instructionsObj[code];
      obj.rules = rulesObj[code];

      languageData.push(obj);
    }

    let formData = new FormData();

    formData.append("logo", data.logo[0]);
    formData.append("defaultData", JSON.stringify(defaultData));
    formData.append("languageData", JSON.stringify(languageData));

    requestAdd("POST", "shipping-company", formData);
  };

  const handleChangeCurrency = (event) => {
    setSelectedCurrency(event);

    if (event) {
      setError("currency", "");
      setValue("currency", event.value);
    } else {
      setValue("currency", null);
    }
  };

  const handleChangePriorityCountries = (event) => {
    setSelectedPriorityCountries(event);

    if (event && event.length > 0) {
      const ids = event.map((obj) => obj.value);
      setError("priorityCountries", "");
      setValue("priorityCountries", ids);
    } else {
      setValue("priorityCountries", null);
    }
  };

  const handleChangeServingCountries = (event) => {
    setSelectedServingCountries(event);

    if (event && event.length > 0) {
      const ids = event.map((obj) => obj.value);
      setError("servingCountries", "");
      setValue("servingCountries", ids);
    } else {
      setValue("servingCountries", null);
    }
  };

  //logo(img), currency(select), status(checkbox), shipping priority(react select), Serving countries(react select)
  const InputFields = [
    [
      {
        Component: Input,
        label: "Logo",
        type: "file",
        name: "logo",
        registerFields: {
          required: true,
        },
        isMedia: true,
        accept: ".png, .jpg, .jpeg",
        control,
      },
      {
        Component: ReactSelectInput,
        label: "Currency",
        name: "currency",
        registerFields: {
          required: true,
        },
        control,
        options: currencies,
        handleChange: handleChangeCurrency,
        selectedOption: selectedCurrency,
        isMultiple: false,
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
      {
        Component: ReactSelectInput,
        label: "Priority Countries",
        name: "priorityCountries",
        registerFields: {
          required: false,
        },
        control,
        options: notSelectedPriorityCountries,
        handleChange: handleChangePriorityCountries,
        selectedOption: selectedPriorityCountries,
        isMultiple: true,
      },
      {
        Component: ReactSelectInput,
        label: "Serving Countries",
        name: "servingCountries",
        registerFields: {
          required: true,
        },
        control,
        options: countries,
        handleChange: handleChangeServingCountries,
        selectedOption: selectedServingCountries,
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
        title="Add Shipping Company"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/shipping-companies", name: "Back To Shipping Companies" },
        ]}
      />
      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div className="card-body">
              <div className="row">
                <Sidebar />

                <div className="col-9">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div
                      className="tab-content mt-0"
                      id="myTabContent"
                      data-select2-id="myTabContent"
                    >
                      <div
                        className="tab-pane fade active show"
                        id="kt_tab_pane_1"
                        role="tabpanel"
                        aria-labelledby="kt_tab_pane_1"
                        style={{ minHeight: 490 }}
                      >
                        <div>
                          <h3 className="mb-10 font-weight-bold text-dark">
                            Shipping Company Information
                          </h3>
                        </div>

                        <RenderInputFields
                          InputFields={InputFields}
                          errors={errors}
                          register={register}
                        />
                      </div>

                      <TranslatedInfo
                        errors={errors}
                        register={register}
                        control={control}
                        instructions={instructions}
                        setInstructions={setInstructions}
                        rules={rules}
                        setRules={setRules}
                        unregister={unregister}
                      />
                    </div>

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

export default ShippingAdd;
