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

const Add = (props) => {
  //   const { id, type, parentId } = props.match.params;
  const { countryId } = props.match.params;
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
  const {
    response: parentCategoriesResponse,
    request: parentCategoriesRequest,
  } = useRequest();
  // const { response: responseCountries, request: requestCountries } =
  //   useRequest();

  const [allCategories, setAllCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  // const [parentCountrys, setparentCountrys] = useState([]);

  const [categoriesArray, setCategoriesArray] = useState([
    {
      id: 1,
      value: "",
      category: "",
    },
  ]);
  const [newId, setNewId] = useState(2);

  const history = useHistory();

  useEffect(() => {
    document.title =
      type == "customer"
        ? "Add Customer Pricing - Noonmar"
        : type == "specific"
        ? "Add Specific Product Pricing - Noonmar"
        : "Add Product Pricing - Noonmar";
    if (type == "customer") {
      // parentCategoriesRequest("GET", "pricing-new/categories");
    } else {
      // requestCountries("GET", `country/get-all-countries`);
    }
  }, []);

  useEffect(() => {
    if (parentCategoriesResponse) {
      setParentCategories(parentCategoriesResponse.categories);
    }
  }, [parentCategoriesResponse]);

  // useEffect(() => {
  //   if (responseCountries) {
  //     if (responseCountries.status && responseCountries.countries) {
  //       setparentCountrys(responseCountries.countries);
  //     }
  //   }
  // }, [responseCountries]);

  useEffect(() => {
    const subscription = watch((values, changed) => {
      const key = changed.name.toLowerCase();
      if (key.includes("value")) {
        const id = key.split("value")[1];

        const quantity = +values[`value${id}`];

        if (quantity < 0) {
          setError(`value${id}`, {
            type: "custom",
            message: "value should be greater than and equal to 0.",
          });
        } else {
          clearErrors(`value${id}`);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    if (response) {
      toast.success(
        type == "customer"
          ? "Customer pricing has been added successfully."
          : type == "specific"
          ? "Specific product pricing has been added successfully."
          : "Product pricing has been added successfully."
      );

      history.push(`/country-pricing/data/${countryId}?tab=2`);
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
    let sendData = [];
    let isError = false;

    categoriesArray.forEach((item) => {
      if (data[`value${item.id}`] < 0) {
        setError(`value${item.id}`, {
          type: "custom",
          message: "value should be greater than or equal to 0.",
        });
        isError = true;
        return;
      }

      sendData.push({
        type: "productGroup",
        parentType: "country",
        value: data[`value${item.id}`],

        productGroupId: data[`category${item.id}`].value,
        // countryId: data[`parentId${item.id}`].value,
        countryId,
      });
    });

    if (!isError) {
      request("POST", "pricing-new/country/product-group", { data: sendData });
    }
  };

  const addRowHandler = () => {
    setCategoriesArray((prev) => [
      ...prev,
      {
        id: newId,
        value: "",
        category: "",
      },
    ]);
    setNewId((prev) => prev + 1);
  };

  const categoryChangeHandler = (e, id) => {
    const newData = [...categoriesArray];
    const isExists = newData.find((item) => item.category.value == e.value);

    if (isExists) {
      setError(`category${id}`, {
        type: "custom",
        message: "Category already selected.",
      });
      return;
    } else {
      clearErrors(`category${id}`);
    }
    const index = newData.findIndex((item) => item.id == id);
    newData[index].category = e;
    setCategoriesArray(newData);

    setValue(`category${id}`, e);
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

  const deleteHandler = (id) => {
    setCategoriesArray(categoriesArray.filter((item) => item.id != id));
  };

  const parentChangeHandler = (e, id) => {
    const newData = [...categoriesArray];
    const index = newData.findIndex((item) => item.id == id);
    newData[index].parentId = e;
    setCategoriesArray(newData);
    // setSelectReasons(e);
    setValue(`parentId${id}`, e);
  };

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title={
          type == "customer"
            ? "Add Customer Pricing"
            : type == "specific"
            ? "Add Specific Product Pricing"
            : "Add Product Pricing"
        }
        links={[
          // http://192.168.235.245:3010/pricing-setting/country-pricing/view-customer-group/customer/64fb03d86ff111122f46934c/65002dc445a7bba827cf6f55
          { to: "/", name: "Dashboard" },
          {
            to: `/country-pricing/data/${countryId}?tab=2`,
            name: `Back To ${
              type == "customer"
                ? "Customer"
                : type == "specific"
                ? "Specific"
                : "Product"
            } Pricing Category`,
          },
        ]}
      />
      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">
                {type == "customer"
                  ? "Add New Customer Pricing"
                  : type == "specific"
                  ? "Add New Specific Product Pricing"
                  : "Add New Product Pricing"}
              </h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-xl-12">
                  <button
                    // className="btn btn-primary fixedButtonAdd3 zindex-1"
                    className="btn btn-primary fixedButtonAdd2 zindex-1"
                    onClick={addRowHandler}
                  >
                    {type == "customer"
                      ? "Add  Customer Pricing"
                      : type == "specific"
                      ? "Add  Specific Pricing"
                      : "Add  Product Pricing"}
                    {/* Add Pricing */}
                  </button>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    {categoriesArray.map((item) => {
                      return (
                        <div className="row" key={item.id}>
                          {type == "customer" ? (
                            <>
                              <div class="col-md-3">
                                {/* <lable>category</lable> */}
                                <ReactSelectInput
                                  label="Category"
                                  name={`parentId${item.id}`}
                                  errors={errors}
                                  registerFields={{ required: true }}
                                  options={parentCategories}
                                  control={control}
                                  // colClass="col-xl-4"
                                  colClass="w-100 inputSelectBox"
                                  selectedOption={item.country}
                                  handleChange={(e) =>
                                    parentChangeHandler(e, item.id)
                                  }
                                  register={register}
                                  isMultiple={false}
                                />
                              </div>
                            </>
                          ) : (
                            // <div class="col-md-3">
                            //   <ReactSelectInput
                            //     label="Country"
                            //     name={`parentId${item.id}`}
                            //     errors={errors}
                            //     registerFields={{ required: true }}
                            //     options={parentCountrys}
                            //     control={control}
                            //     // colClass="col-xl-4"
                            //     colClass="w-100 inputSelectBox"
                            //     selectedOption={item.parentId}
                            //     handleChange={(e) =>
                            //       parentChangeHandler(e, item.id)
                            //     }
                            //     register={register}
                            //     isMultiple={false}
                            //   />
                            // </div>
                            <></>
                          )}
                          <div class="col-md-4">
                            <AsyncReactSelectInput
                              name={`category${item.id}`}
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
                              handleChange={(e) =>
                                categoryChangeHandler(e, item.id)
                              }
                              selectedOption={item.barCode}
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
                              name={`value${item.id}`}
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

                          {categoriesArray.length > 1 && (
                            <div className="col-md-1">
                              <button
                                className="btn btn-bg-danger ml-2 mt-5 btnMargin30"
                                // style={{ marginTop: "30px!important" }}
                                onClick={() => deleteHandler(item.id)}
                              >
                                <i class="fas fa-trash-alt text-white"></i>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

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
