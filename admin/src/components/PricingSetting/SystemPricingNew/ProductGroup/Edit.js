import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import useRequest from "../../../../hooks/useRequest";
import Breadcrumb from "../../../Breadcrumb/Breadcrumb";
import { debounce } from "../../../../util/fn";
import useRequestTwo from "../../../../hooks/useRequestTwo";

import {
  AsyncReactSelectInput,
  SubmitButton,
  MutliInput,
} from "../../../Form/Form";

const EditCustomerGroups = (props) => {
  //   const { id, type } = props.match.params;
  const { id } = props.match.params;
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

  const [allCategories, setAllCategories] = useState([]);
  const [category, setCategory] = useState([]);

  const history = useHistory();

  useEffect(() => {
    document.title = `Edit ${
      type == "customer" ? "Customer" : "Product"
    } System Pricing - Noonmar`;
    requestFetchUser(
      "GET",
      `pricing-new/system/product-group/${id}?type=${type}`
    );
  }, []);

  useEffect(() => {
    if (responseFetchUser) {
      const { productGroup, value } = responseFetchUser.pricingGroup;
      setValue("category", productGroup);
      setValue("value", value);
      setCategory(productGroup);
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
          type == "customer" ? "Customer" : "Product"
        } System pricing  has been updated successfully.`
      );
      history.push(`/system-pricing/${type}`);
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
      productGroupId: data.category.value,
      value: data.value,
      // parentId,
      // type,
    };

    if (!isError) {
      request("PUT", "pricing-new/system/product-group", { ...sendData });
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
        `pricing-new/group/product?name=${inputValue}`
      );

      callback(response.data.groups);
    }, 500),

    []
  );

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title={`Edit ${
          type == "customer" ? "Customer" : "Product"
        }  Group Pricing`}
        links={[
          { to: "/", name: "Dashboard" },

          {
            to: `/system-pricing/${type}`,
            name: `Back To ${
              type == "customer" ? "Customer" : "Product"
            } Group Pricing`,
          },
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
                      <div class="col-md-4">
                        <AsyncReactSelectInput
                          name={`category`}
                          label={
                            type == "customer" ? "Customer" : "Product Group"
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

                      <div class="col-md-4">
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
