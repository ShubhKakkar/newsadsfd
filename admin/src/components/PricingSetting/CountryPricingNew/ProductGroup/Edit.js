import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useHistory, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import useRequest from "../../../../hooks/useRequest";
import Breadcrumb from "../../../Breadcrumb/Breadcrumb";
import { debounce } from "../../../../util/fn";
import useRequestTwo from "../../../../hooks/useRequestTwo";

import {
  AsyncReactSelectInput,
  SubmitButton,
  MutliInput,
  ReactSelectInput,
} from "../../../Form/Form";

const EditCustomerGroups = (props) => {
  //   const { id, fieldId, type, parentId } = props.match.params;
  const { id, countryId } = props.match.params;
  const type = "product";

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    watch,
    control,
    clearErrors,
  } = useForm();
  const { response, request } = useRequest();
  const { response: responseCategories, request: requestCategories } =
    useRequestTwo();
  const { response: responseFetchUser, request: requestFetchUser } =
    useRequest();

  // const { response: responseCountries, request: requestCountries } =
  //   useRequest();

  const [allCategories, setAllCategories] = useState([]);
  const [category, setCategory] = useState([]);

  // const [countries, setCountries] = useState([]);
  // const [selectedCountry, setSelectedCountry] = useState([]);

  const history = useHistory();

  useEffect(() => {
    document.title = `Edit ${
      type == "customer"
        ? "Customer"
        : type == "specific"
        ? "Specific Product"
        : "Product"
    } Group Pricing - Noonmar`;

    // requestCountries("GET", `country/get-all-countries`);

    requestFetchUser("GET", `pricing-new/country/product-group/${id}`);
  }, []);

  // useEffect(() => {
  //   if (responseCountries) {
  //     if (responseCountries.status && responseCountries.countries) {
  //       setCountries(responseCountries.countries);
  //     }
  //   }
  // }, [responseCountries]);

  useEffect(() => {
    if (responseFetchUser) {
      const { group, value, country } = responseFetchUser.pricing;
      setValue("value", value);

      setValue("category", group);
      setCategory(group);

      // setValue("country", country);
      // setSelectedCountry(country);
    }
  }, [responseFetchUser]);

  useEffect(() => {
    const subscription = watch((values, changed) => {
      const key = changed.name.toLowerCase();
      if (key.includes("value")) {
        const id = key.split("value")[1];

        const quantity = +values[`value`];

        if (quantity < 0) {
          setError(`value`, {
            type: "custom",
            message: "value should be greater than and equal to 0.",
          });
        } else {
          clearErrors(`value`);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    if (response) {
      toast.success(
        `${
          type == "customer"
            ? "Customer"
            : type == "specific"
            ? "Specific product"
            : "Product"
        } pricing has been updated successfully.`
      );
      history.push(`/country-pricing/data/${countryId}?tab=2`);
      //   pricing-setting/system-pricing/view-customer-group/customer/64f71b0c23dcb622cfb0630a
    }
  }, [response]);

  useEffect(() => {
    if (responseCategories) {
      if (responseCategories.status && responseCategories?.categories) {
        setAllCategories(responseCategories?.categories);
      }
    }
  }, [responseCategories]);

  const onSubmit = (data) => {
    let isError = false;

    if (data[`value`] < 0) {
      setError(`value`, {
        type: "custom",
        message: "value should be greater than or equal to 0.",
      });
      isError = true;
      return;
    }
    const sendData = {
      id,
      //countryId,
      productGroupId: data.category.value,
      value: data.value,
    };

    if (!isError) {
      request("PUT", "pricing-new/country/product-group", { ...sendData });
    }
  };

  const categoryChangeHandler = (e) => {
    setCategory(e);
    setValue(`category`, e);
  };

  const categoryLoadOptionsDebounced = useCallback(
    debounce(async (inputValue, callback) => {
      const response = await requestCategories(
        "GET",
        `pricing-new/group/${type}?name=${inputValue}`
      );

      callback(response.data.groups);
    }, 500),

    []
  );

  // const countryChangeHandler = (e) => {
  //   setSelectedCountry(e);
  //   setValue(`country`, e);
  // };

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title={`Edit ${
          type == "customer"
            ? "Customer"
            : type == "specific"
            ? "Specific Product"
            : "Product"
        } Group Pricing`}
        links={[
          // { to: "/", name: "Dashboard" },
          // {
          //   to: `/pricing-setting/country-pricing/view-${type}-group/${type}/${parentId}`,
          //   name: `Back To ${
          //     type == "customer"
          //       ? "Customer"
          //       : type == "specific"
          //       ? "Specific"
          //       : "Product"
          //   } System Pricing`,
          // },
          { to: "/", name: "Dashboard" },
          {
            to: `/country-pricing/data/${countryId}?tab=2`,
            name: `Back To Product Group Pricing`,
          },
          // {
          //   to: `/pricing-setting/country-pricing/one/${parentId}`,
          //   name: "Back To Country Pricing",
          // },
          // {
          //   to: `/pricing-setting/country-pricing/view-${type}-group/${type}/${parentId}/${fieldId}`,
          //   name: `Back To ${
          //     type == "customer"
          //       ? "Customer"
          //       : type == "specific"
          //       ? "Specific Products"
          //       : "Product"
          //   } Pricing`,
          // },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">
                Edit {type == "customer" ? "Customer" : "Product"} Group Pricing
              </h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-xl-12">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row">
                      {/* <div class="col-md-3">
                        <ReactSelectInput
                          label="Country"
                          name={`country`}
                          errors={errors}
                          registerFields={{ required: true }}
                          options={countries}
                          control={control}
                          // colClass="col-xl-4"
                          colClass="w-100 inputSelectBox"
                          selectedOption={selectedCountry}
                          handleChange={(e) => countryChangeHandler(e)}
                          register={register}
                          isMultiple={false}
                        />
                      </div> */}

                      <div class="col-md-6">
                        <AsyncReactSelectInput
                          name={`category`}
                          label={
                            type == "customer"
                              ? "Customer"
                              : type == "specific"
                              ? "Specific Product"
                              : "Product Group"
                          }
                          errors={errors}
                          registerFields={{ required: true }}
                          control={control}
                          promiseOptions={categoryLoadOptionsDebounced}
                          colClass="w-100"
                          handleChange={(e) => categoryChangeHandler(e)}
                          selectedOption={category}
                          // register={register}
                          defaultOptions={allCategories}
                          isMultiple={false}
                        />
                      </div>

                      <div class="col-md-6">
                        <label>Value</label>
                        <MutliInput
                          type="number"
                          label="Value"
                          name={`value`}
                          errors={errors}
                          placeholder="Value"
                          register={register}
                          registerFields={{
                            required: true,
                            min: {
                              value: 0,
                              message:
                                "value should be greater than and equal to 0.",
                            },
                          }}
                        />
                      </div>
                    </div>

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

export default EditCustomerGroups;
