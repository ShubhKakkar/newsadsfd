import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
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
  MultiReactSelectInput,
  MutliInput,
} from "../Form/Form";
import { API } from "../../constant/api";

const Edit = (props) => {
  const { id: countryId } = props.match.params;
  const history = useHistory();

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

  const { response: responseFetchData, request: requestFetchData } =
    useRequest();

  const { response, request } = useRequest();
  // const { response: responseCategories, request: requestCategories } =
  //   useRequest();
  const { response: responseCurrencies, request: requestCurrencies } =
    useRequest();

  // const [allCategory, setAllCategory] = useState([]);
  // const [selectedCategory, setSelectedCategory] = useState([]);

  const [allCurrencies, setAllCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  const [oldFile, setOldFile] = useState("");

  // const isFixed = watch("isFixed");

  useEffect(() => {
    if (countryId) {
      requestFetchData("GET", `country/${countryId}`);
      // requestCategories("GET", `product-category/all?page=1&isActive=${true}`);
      document.title = "Edit Country - Noonmar";
      requestCurrencies("GET", "currency/data");
    }
  }, [countryId]);

  useEffect(() => {
    if (responseFetchData) {
      const {
        // name,
        currency,
        flag,
        customCell,
        customFixedValue,
        customPercentageValue,
        customAmountCurrency,
        // tax,
        // customType,
        // customAmount,
        // customAmountCurrency,

        langData,
        countryCode,
      } = responseFetchData.country;

      // setValue("name", name);

      if (langData && Array.isArray(langData)) {
        langData.forEach((lang) => {
          setValue(`name-${lang.languageCode}`, lang.name);
        });
      }

      if (currency) {
        setValue("currency", {
          label: currency.sign,
          value: currency._id,
        });
        setSelectedCurrency({ label: currency.sign, value: currency._id });
      }

      // setValue("customType", customType);

      // setValue("customAmount", customAmount);
      setValue("countryCode", countryCode);
      setValue("customCell", customCell);
      setValue("customFixedValue", customFixedValue);
      setValue("customPercentageValue", customPercentageValue);

      if (customAmountCurrency) {
        setValue("customCurrency", {
          label: customAmountCurrency.sign,
          value: customAmountCurrency._id,
        });
      }

      // setValue("tax", tax);
      // setValue("customAmountCurrency", {
      //   label: customAmountCurrency.sign,
      //   value: customAmountCurrency._id,
      // });

      // setSelectedCustomCellCurrency({
      //   label: customAmountCurrency.sign,
      //   value: customAmountCurrency._id,
      // });

      setOldFile(flag);

      // const { name, productCategoryId, countryCode } =
      //   responseFetchData.Country;
      // let categories = [];
      // let categoryIds = [];
      // if (productCategoryId && productCategoryId.length > 0) {
      //   productCategoryId.forEach((obj) => {
      //     categories.push({
      //       label: obj.name,
      //       value: obj._id,
      //     });
      //     categoryIds.push(obj._id);
      //   });
      //   setSelectedCategory(categories);
      // }
      // setValue("name", name);
      // setValue("productCategory", categoryIds);
      // setValue("countryCode", countryCode);
    }
  }, [responseFetchData]);

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
    if (response) {
      toast.success("Country has been updated successfully.");
      history.push("/countries");
    }
  }, [response]);

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
    const {
      // name,
      currency,
      flag,
      // tax,
      // customType,
      // customAmount,
      // customAmountCurrency,
      customPercentageValue,
      customCurrency,
      customFixedValue,
      customCell,
      countryCode,
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

    formData.append("langData", JSON.stringify(langData));
    formData.append("id", countryId);
    // formData.append("tax", tax);
    formData.append("currency", currency.value);

    if (flag.length > 0) {
      formData.append("file", flag[0]);
    }

    // formData.append("customType", customType);
    // formData.append("customAmount", customAmount);
    formData.append("customCell", customCell);
    formData.append("customFixedValue", customFixedValue);
    formData.append("customPercentageValue", customPercentageValue);
    formData.append("customCurrency", customCurrency.value);

    formData.append("countryCode", countryCode);
    // formData.append("customAmountCurrency", customAmountCurrency.value);

    request("PUT", "country", formData);
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
      //     required: true,
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
          required: !oldFile,
        },
        inputData: {
          accept: "image/*",
        },
        children: oldFile && (
          <img
            src={`${API.PORT}/${oldFile}`}
            width={100}
            height={100}
            alt=""
            style={{ cursor: "pointer" }}
            data-fancybox
          />
        ),
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
        title="Edit Country"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: { pathname: "/countries" /*backPageNum: page */ },
            name: "Back To Country",
          },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Edit Country</h3>
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
                                required={lang.default}
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
                      name="Update"
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
