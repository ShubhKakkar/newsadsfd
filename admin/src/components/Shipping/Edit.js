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
import { API } from "../../constant/api";

const ShippingEdit = (props) => {
  const { id } = props.match.params;

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

  const [oldLogo, setOldLogo] = useState(null);
  const [langDataObj, setLangDataObj] = useState({});

  const { languages } = useSelector((state) => state.setting);

  const { request, response } = useRequest();
  const { request: requestUpdate, response: responseUpdate } = useRequest();

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
    request("GET", `shipping-company/${id}`);
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

      const shippingCompany = response.shippingCompany;

      setOldLogo(shippingCompany.logo);

      if (shippingCompany.currencyData) {
        setSelectedCurrency({
          value: shippingCompany.currencyData._id,
          label: shippingCompany.currencyData.sign,
        });

        setValue("currency", shippingCompany.currency);
      }

      setValue("isActive", shippingCompany.isActive);

      setSelectedPriorityCountries(
        shippingCompany.priorityCountriesData.map((country) => ({
          value: country._id,
          label: country.name,
        }))
      );

      const selectedAndNotSelectedCountries = [
        ...response.notSelectedPriorityCountries,
        ...shippingCompany.priorityCountriesData,
      ];

      setNotSelectedPriorityCountries(
        selectedAndNotSelectedCountries.map((item) => ({
          value: item._id,
          label: item.name,
        }))
      );

      setValue("priorityCountries", shippingCompany.priorityCountries);

      setSelectedServingCountries(
        shippingCompany.servingCountriesData.map((country) => ({
          value: country._id,
          label: country.name,
        }))
      );

      setValue("servingCountries", shippingCompany.servingCountries);

      const langDataObj = {};

      shippingCompany.langData.forEach((lang) => {
        const code = lang.languageCode;
        langDataObj[lang.languageCode] = lang._id;

        setValue(`name-${code}`, lang.name);
        setValue(`shippingInfo-${code}`, lang.information);

        lang.instructions.forEach((instruction, idx) => {
          setValue(`instruction${idx}-${code}`, instruction);
        });

        lang.rules.forEach((rule, idx) => {
          setValue(`rule${idx}-${code}`, rule);
        });
      });

      setLangDataObj(langDataObj);

      setInstructions(
        shippingCompany.langData[0].instructions.map((_, idx) => idx)
      );

      setRules(shippingCompany.langData[0].rules.map((_, idx) => idx));
    }
  }, [response]);

  useEffect(() => {
    if (responseUpdate) {
      toast.success(responseUpdate.message);
      history.push("/shipping-companies");
    }
  }, [responseUpdate]);

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

      const obj = {
        id: langDataObj[code],
      };

      obj.languageCode = code;
      obj.name = namesObj[code];
      obj.information = shippingInfoObj[code];
      obj.instructions = instructionsObj[code];
      obj.rules = rulesObj[code];

      languageData.push(obj);
    }

    let formData = new FormData();

    formData.append("id", id);

    if (data.logo[0]) {
      formData.append("logo", data.logo[0]);
    }

    formData.append("defaultData", JSON.stringify(defaultData));

    formData.append("languageData", JSON.stringify(languageData));

    requestUpdate("PUT", "shipping-company", formData);
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
          required: false,
        },
        isMedia: true,
        accept: ".png, .jpg, .jpeg",
        control,
        children: oldLogo && (
          <img
            src={`${API.PORT}/${oldLogo}`}
            width={100}
            height={100}
            alt=""
            style={{ cursor: "pointer" }}
            data-fancybox
          />
        ),
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
                        isEdit={true}
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

export default ShippingEdit;
