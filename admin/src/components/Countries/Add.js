import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import {
  Input,
  MultiReactSelectInput,
  RenderInputFields,
  SubmitButton,
  ReactSelectInput,
  SelectInput,
  SubTab,
  SubInput,
  MutliInput,
} from "../Form/Form";

const Add = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    control,
    watch,
  } = useForm();

  const { languages } = useSelector((state) => state.setting);

  const { response, request } = useRequest();
  // const { response: responseCategories, request: requestCategories } =
  //   useRequest();
  const { response: responseCurrencies, request: requestCurrencies } =
    useRequest();
  const { response: responseGroups, request: requestGroups } = useRequest();

  // const [allCategory, setAllCategory] = useState([]);
  // const [selectedCategory, setSelectedCategory] = useState([]);

  const [allCurrencies, setAllCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  const [selectedGroup, setSelectedGroup] = useState("");
  const [groups, setGroups] = useState([]);

  const history = useHistory();
  // const isFixed = watch("isFixed");

  useEffect(() => {
    document.title = "Add Country - Noonmar";
    // requestCategories("GET", `product-category/all?page=1&isActive=${true}`);
    requestCurrencies("GET", "currency/data");
    requestGroups("GET", "group/country");
  }, []);

  useEffect(() => {
    if (response) {
      toast.success("Country has been added successfully.");
      history.push("/countries");
    }
  }, [response]);

  useEffect(() => {
    if (responseCurrencies) {
      setAllCurrencies(
        responseCurrencies.data.map((d) => ({
          label: d.sign,
          value: d._id,
        }))
      );
    }
  }, [responseCurrencies]);

  useEffect(() => {
    if (responseGroups) {
      if (responseGroups.status) {
        setGroups(responseGroups.groups);
      }
    }
  }, [responseGroups]);

  // useEffect(() => {
  //   if (responseCategories) {
  //     if (responseCategories.status && responseCategories.data) {
  //       let categories = [];
  //       if (responseCategories.data.length > 0) {
  //         responseCategories.data.forEach((obj) => {
  //           categories.push({
  //             label: obj.name,
  //             value: obj._id,
  //           });
  //         });
  //       }
  //       setAllCategory(categories);
  //     }
  //   }
  // }, [responseCategories]);

  const onSubmit = (data) => {
    // console.log('data',data)
    const {
      // name,
      currency,
      flag,
      // tax,
      // customType,
      // customAmount,
      // customAmountCurrency,
      customCurrency,
      customCell,
      customFixedValue,
      customPercentageValue,
      countryCode,
      groupId,
    } = data;

    const formData = new FormData();

    const langData = [];

    languages.forEach((lang) => {
      langData.push({
        languageCode: lang.code,
        name: data[`name-${lang.code}`],
      });

      if (lang.default) {
        formData.append("name", data[`name-${lang.code}`]);
      }
    });
    // if (group) {
    //   formData.append("group", group);
    // }
    formData.append("langData", JSON.stringify(langData));
    formData.append("currency", currency.value);
    formData.append("file", flag[0]);
    // formData.append("customType", customType);
    formData.append("countryCode", countryCode);
    formData.append("customCurrency", customCurrency.value);
    formData.append("customCell", customCell);
    formData.append("customFixedValue", customFixedValue);
    formData.append("customPercentageValue", customPercentageValue);
    formData.append("groupId", groupId);
    // formData.append("tax", tax);
    // formData.append("customAmount", customAmount);
    // formData.append("customAmountCurrency", customAmountCurrency.value);

    request("POST", "country/create", formData);
  };

  // const handleChange = (event) => {
  //   setSelectedCategory(event);

  //   if (event && event.length > 0) {
  //     let catgeoryids = [];
  //     event.forEach((obj) => {
  //       catgeoryids.push(obj.value);
  //     });
  //     setError("productCategory", "");
  //     setValue("productCategory", catgeoryids);
  //   } else {
  //     setValue("productCategory", null);
  //   }
  // };

  const handleChangeCurrency = (event) => {
    setSelectedCurrency(event);

    if (event) {
      setError("currency", "");
      setValue("currency", event);
    } else {
      setValue("currency", null);
    }
  };
  const handleChangeGroup = (event) => {
    setSelectedGroup(event);
    if (event) {
      setError("groupId", "");
      setValue("groupId", event.value);
    } else {
      setValue("groupId", null);
    }
  };

  const InputFields = [
    [
      // {
      //   Component: Input,
      //   label: "Country Name",
      //   type: "text",
      //   name: "name",
      //   registerFields: {
      //     required: true,
      //     pattern: /^[A-Za-z ]+$/,
      //   },
      //   registerFieldsFeedback: {
      //     pattern: "Name can only contain letters.",
      //   },
      // },
      {
        Component: ReactSelectInput,
        label: "Currency",
        name: "currency",
        registerFields: {
          required: true,
        },
        control,
        options: allCurrencies,
        handleChange: handleChangeCurrency,
        selectedOption: selectedCurrency,
        isMultiple: false,
      },
      // {
      //   Component: Input,
      //   label: "Tax",
      //   type: "text",
      //   name: "tax",
      //   registerFields: {
      //     required: true,
      //     pattern: /^\d{1,3}(,\d{3})*(\,|.\d+)?$/i,
      //   },
      //   registerFieldsFeedback: {
      //     pattern: "Tax can only contain numbers.",
      //   },
      // },
      // {
      //   Component: ReactSelectInput,
      //   label: "Product Category",
      //   name: "productCategory",
      //   registerFields: {
      //     required: false,
      //   },
      //   control,
      //   options: allCategory,
      //   handleChange: handleChange,
      //   selectedOption: selectedCategory,
      //   isMultiple: true,
      // },
      {
        Component: Input,
        label: "Dialing Code",
        type: "text",
        name: "countryCode",
        registerFields: {
          required: true,
          min: 1,
        },
      },
    ],
    [
      // {
      //   Component: Input,
      //   label: "Country Code",
      //   type: "text",
      //   name: "countryCode",
      //   registerFields: {
      //     required: true,
      //   },
      // },
      {
        Component: Input,
        label: "Flag",
        name: "flag",
        type: "file",
        registerFields: {
          required: true,
        },
        inputData: {
          accept: "image/*",
        },
      },
      {
        Component: ReactSelectInput,
        label: "Group",
        name: "groupId",
        options: groups,
        registerFields: {
          required: false,
        },
        handleChange: handleChangeGroup,
        selectedOption: selectedGroup,
      },
    ],
    [
      // {
      //   Component: Input,
      //   label: "Is Fixed",
      //   name: "isFixed",
      //   type: "checkbox",
      //   registerFields: {
      //     required: false,
      //   },
      // },
    ],
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Add Country"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/countries", name: "Back To Countries" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Add New Country</h3>
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
                    <div className="row">
                      <div className="col-xl-6">
                        <label>Custom Currency</label>
                        <MultiReactSelectInput
                          label="custom currency"
                          name={`customCurrency`}
                          errors={errors}
                          registerFields={{ required: true }}
                          options={allCurrencies}
                          control={control}
                          // colClass="col-xl-4"
                          colClass="w-100"
                          isMultiple={false}
                        />
                      </div>
                      <div className="col-xl-6">
                        <label>Custom Cell</label>
                        <MutliInput
                          type="number"
                          label="Custom cell"
                          name={`customCell`}
                          errors={errors}
                          placeholder="Custom cell"
                          register={register}
                          registerFields={{
                            required: true,
                            //   pattern: /^[0-9]+$/,
                          }}
                          //   colClass="col-xl-2"
                          // registerFieldsFeedback={{
                          //   pattern: "Tax can only contain numbers.",
                          // }}
                        />
                      </div>
                      <label className="col-xl-12 ">
                        <b>Custom Values</b>
                      </label>
                      <br />
                      <br />

                      <div className="col-xl-6">
                        <label>Fixed</label>
                        <MutliInput
                          type="number"
                          label="Fixed "
                          name={`customFixedValue`}
                          errors={errors}
                          placeholder="Custom Fixed value"
                          register={register}
                          registerFields={{
                            required: true,
                            //   pattern: /^[0-9]+$/,
                          }}
                        />
                      </div>
                      <div className="col-xl-6">
                        <label>Percentage</label>
                        <MutliInput
                          type="number"
                          label="Percentage"
                          name={`customPercentageValue`}
                          errors={errors}
                          placeholder="Custom Percentage Value"
                          register={register}
                          registerFields={{
                            required: true,
                            //   pattern: /^[0-9]+$/,
                          }}
                          //   colClass="col-xl-2"
                          // registerFieldsFeedback={{
                          //   pattern: "Tax can only contain numbers.",
                          // }}
                        />
                      </div>
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

export default Add;
