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

const Add = () => {
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

  const [allCategories, setAllCategories] = useState([]);
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
    document.title = "Add - Noonmar";
  }, []);

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
      toast.success("System pricing category has been added successfully.");
      history.push(`/system-pricing/category`);
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
        type: "category",
        parentType: "default",
        value: data[`value${item.id}`],
        categoryId: data[`category${item.id}`].value,
      });
    });

    if (!isError) {
      request("POST", "pricing-new/system/category", { data: sendData });
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
        `pricing-new/categories?name=${inputValue}`
      );

      callback(response.data.categories);
    }, 500),

    []
  );

  const deleteHandler = (id) => {
    setCategoriesArray(categoriesArray.filter((item) => item.id != id));
  };

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Add Pricing"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: "/system-pricing/category",
            name: "Back To Category Pricing",
          },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Add Pricing</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-xl-12">
                  <button
                    // className="btn btn-primary fixedButtonAdd3 zindex-1"
                    className="btn btn-primary fixedButtonAdd2 zindex-1"
                    onClick={addRowHandler}
                  >
                    Add Pricing
                  </button>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    {categoriesArray.map((item) => {
                      return (
                        <div className="row" key={item.id}>
                          <div class="col-md-4">
                            <AsyncReactSelectInput
                              name={`category${item.id}`}
                              label="Category"
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
