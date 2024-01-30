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
  ReactSelectInput,
} from "../../../Form/Form";

const EditCustomerGroups = (props) => {
  //   const { id, type } = props.match.params;
  const { id } = props.match.params;
  const type = "customer";
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
  const { response: responseGroups, request: requestGroups } = useRequestTwo();
  const { response: responseFetchUser, request: requestFetchUser } =
    useRequest();
  const {
    response: parentCategoriesResponse,
    request: parentCategoriesRequest,
  } = useRequest();

  const [allGroups, setAllGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState([]);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);

  const history = useHistory();

  useEffect(() => {
    document.title = `Edit ${
      type == "customer" ? "Customer" : "Product"
    } System Pricing - Noonmar`;
    parentCategoriesRequest("GET", `pricing-new/categories`);
  }, []);

  useEffect(() => {
    if (parentCategoriesResponse) {
      setCategories(parentCategoriesResponse.categories);
      requestFetchUser("GET", `pricing-new/system/customer-group/${id}`);
    }
  }, [parentCategoriesResponse]);

  useEffect(() => {
    if (responseFetchUser) {
      const { customerGroup, category, value } = responseFetchUser.pricingGroup;

      setValue("parentId", category);
      setValue("group", customerGroup);
      setValue("value", value);

      setSelectedGroup(customerGroup);
      setSelectedCategory(category);
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
    if (responseGroups) {
      if (responseGroups.status && responseGroups?.categories) {
        setAllGroups(responseGroups?.categories);
      }
    }
  }, [responseGroups]);

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
      categoryId: data.parentId.value,
      customerGroupId: data.group.value,
      value: data.value,
      // parentId,
      // type,
    };

    if (!isError) {
      request("PUT", "pricing-new/system/customer-group", { ...sendData });
    }
  };

  const groupChangeHandler = (e) => {
    setSelectedGroup(e);
    setValue(`group`, e);
  };

  const categoryLoadOptionsDebounced = useCallback(
    debounce(async (inputValue, callback) => {
      const response = await requestGroups(
        "GET",
        `pricing-new/group/${type}?name=${inputValue}`
      );

      callback(response.data.groups);
    }, 500),

    []
  );

  const categoryChangeHandler = (e) => {
    setSelectedCategory(e);
    setValue(`parentId`, e);
  };

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
            } Pricing`,
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
                      <div class="col-md-3">
                        {/* <lable>category</lable> */}
                        <ReactSelectInput
                          label="Category"
                          name={`parentId`}
                          errors={errors}
                          registerFields={{ required: true }}
                          options={categories}
                          control={control}
                          // colClass="col-xl-4"
                          colClass="w-100 inputSelectBox"
                          selectedOption={selectedCategory}
                          handleChange={(e) => categoryChangeHandler(e)}
                          register={register}
                          isMultiple={false}
                        />
                      </div>

                      <div class="col-md-4">
                        <AsyncReactSelectInput
                          name={`group`}
                          label={type == "customer" ? "Customer" : "Product"}
                          errors={errors}
                          registerFields={{ required: true }}
                          control={control}
                          promiseOptions={categoryLoadOptionsDebounced}
                          colClass="w-100"
                          handleChange={(e) => groupChangeHandler(e)}
                          selectedOption={selectedGroup}
                          // register={register}
                          defaultOptions={allGroups}
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
