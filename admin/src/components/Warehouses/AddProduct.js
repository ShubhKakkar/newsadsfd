import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useHistory, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { debounce } from "../../util/fn";
import useRequestTwo from "../../hooks/useRequestTwo";

import {
  AsyncReactSelectInput,
  SubmitButton,
  MutliInput,
  ReactSelectInput,
} from "../Form/Form";

const AddProduct = () => {
  const { id } = useParams();
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
  const { response: responseProducts, request: requestProducts } =
    useRequestTwo();
  const { response: responseReasons, request: requestReasons } = useRequest();

  const [allProducts, setAllProducts] = useState([]);
  const [allReasons, setAllReasons] = useState([]);
  const [newObj, setNewObj] = useState({ 1: true });
  const [productsArray, setProductsArray] = useState([
    {
      id: 1,
      name: "",
      quantity: "",
      barCode: "",
      realQuantity: "",
      reasons: "",
      isDefault: true,
    },
  ]);
  const [newId, setNewId] = useState(2);

  const history = useHistory();

  useEffect(() => {
    document.title = "Add Inventory - Noonmar";
    requestReasons("GET", `master/inventory-reason/all`);
  }, []);

  useEffect(() => {
    const subscription = watch((values, changed) => {
      const key = changed.name.toLowerCase();
      if (key.includes("quantity")) {
        const id = key.split("quantity")[1];

        const quantity = +values[`quantity${id}`];
        const realQuantity = +values[`realQuantity${id}`];

        // if (quantity > realQuantity) {
        //   setError(`quantity${id}`, {
        //     type: "custom",
        //     message:
        //       "Quantity should be less than or equal to the real quantity.",
        //   });
        // } else {
        //   clearErrors(`quantity${id}`);
        // }
        if (quantity < 0) {
          setError(`quantity${id}`, {
            type: "custom",
            message: "quantity should be greater than and equal to 0.",
          });
        } else {
          clearErrors(`quantity${id}`);
        }
        if (realQuantity < 0) {
          setError(`realQuantity${id}`, {
            type: "custom",
            message: "real quantity should be greater than and equal to 0.",
          });
        } else {
          clearErrors(`realQuantity${id}`);
        }

        if (quantity && realQuantity && quantity !== realQuantity) {
          setNewObj((prev) => ({ ...prev, [id]: false }));
        } else {
          setNewObj((prev) => ({ ...prev, [id]: true }));
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    if (response) {
      toast.success("Warehouse product has been added successfully.");
      history.push(`/warehouses`);
    }
  }, [response]);

  useEffect(() => {
    if (responseProducts) {
      if (responseProducts.status && responseProducts?.products) {
        const newData = responseProducts.products.map((item, index) => {
          return {
            label: item.name,
            value: item._id,
          };
        });
        setAllProducts(newData);
      }
    }
  }, [responseProducts]);

  useEffect(() => {
    if (responseReasons) {
      if (responseReasons.status && responseReasons?.reasons) {
        const newData = responseReasons.reasons.map((item, index) => {
          return {
            label: item.reason,
            value: item._id,
          };
        });

        setAllReasons(newData);
      }
    }
  }, [responseReasons]);

  const onSubmit = (data) => {
    let sendData = [];
    let isError = false;

    productsArray.forEach((item) => {
      if (data[`quantity${item.id}`] < 0) {
        setError(`quantity${item.id}`, {
          type: "custom",
          message: "quantity should be greater than or equal to 0.",
        });
        isError = true;
        return;
      }

      if (data[`realQuantity${item.id}`] < 0) {
        setError(`realQuantity${item.id}`, {
          type: "custom",
          message: "real quantity should be greater than or equal to 0.",
        });
        isError = true;
        return;
      }

      sendData.push({
        quantity: data[`quantity${item.id}`],
        productId: data[`name${item.id}`].value,
        realQuantity: data[`realQuantity${item.id}`],
        warehouseId: id,
        reason: data[`reasons${item.id}`]?.value,
      });
    });

    const allDataSend = {
      data: sendData,
      warehouseId: id,
      reportName: data.reportName,
    };
    if (!isError) {
      request("PUT", "warehouse/products", { ...allDataSend });
    }
  };

  const addRowHandler = () => {
    setProductsArray((prev) => [
      ...prev,
      {
        id: newId,
        name: "",
        quantity: "",
        barCode: "",
        realQuantity: "",
        reasons: "",
        isDefault: true,
      },
    ]);
    setNewId((prev) => prev + 1);
    setNewObj((prev) => ({ ...prev, [newId]: true }));
  };

  const nameChangeHandler = (e, id) => {
    const newData = [...productsArray];
    const isExists = newData.find((item) => item.name.value == e.value);

    if (isExists) {
      setError(`name${id}`, {
        type: "custom",
        message: "Product already selected.",
      });
      return;
    }

    const index = newData.findIndex((item) => item.id == id);
    newData[index].name = e;
    newData[index].barCode = { value: e.value, label: e.barCode };
    setProductsArray(newData);

    // setSelectedBarcode(e);
    setValue(`name${id}`, e);
    setValue(`barcode${id}`, { value: e.value, label: e.barCode });
    // setSelectedName(e);
    // setValue("name", e);
    // setValue("barcode", { value: e.value, label: e.barCode });
    // setSelectedBarcode({ value: e.value, label: e.barCode });
  };

  const reasonChangeHandler = (e, id) => {
    const newData = [...productsArray];
    const index = newData.findIndex((item) => item.id == id);
    newData[index].reasons = e;
    setProductsArray(newData);
    // setSelectReasons(e);
    setValue(`reasons${id}`, e);
  };

  const barChangeHandler = (e, id) => {
    const newData = [...productsArray];
    const isExists = newData.find((item) => item.barCode.value == e.value);

    if (isExists) {
      setError(`barcode${id}`, {
        type: "custom",
        message: "Product already selected.",
      });
      return;
    }
    const index = newData.findIndex((item) => item.id == id);
    newData[index].barCode = e;
    newData[index].name = { value: e.value, label: e.barCode };
    setProductsArray(newData);

    // setSelectedBarcode(e);
    setValue(`barcode${id}`, e);
    setValue(`name${id}`, { value: e.value, label: e.barCode });
    // setSelectedName({ value: e.value, label: e.barCode });
  };

  const loadOptionsDebounced = useCallback(
    debounce(async (inputValue, callback) => {
      const response = await requestProducts(
        "GET",
        `product/inventory-search?key=name&value=${inputValue}`
      );

      callback(
        response.data.products.map((b) => ({
          value: b._id,
          label: b.name,
          barCode: b.barCode,
        }))
      );
    }, 500),

    []
  );

  const barcodeLoadOptionsDebounced = useCallback(
    debounce(async (inputValue, callback) => {
      const response = await requestProducts(
        "GET",
        `product/inventory-search?key=barCode&value=${inputValue}`
      );

      callback(
        response.data.products.map((b) => ({
          value: b._id,
          label: b.barCode,
          barCode: b.name,
        }))
      );
    }, 500),

    []
  );

  const deleteHandler = (id) => {
    setProductsArray(productsArray.filter((item) => item.id != id));
  };

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Create Inventory"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/warehouses", name: "Back To Warehouses" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Create Inventory</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-xl-12">
                  <button
                    // className="btn btn-primary fixedButtonAdd3 zindex-1"
                    className="btn btn-primary fixedButtonAdd2 zindex-1"
                    onClick={addRowHandler}
                  >
                    Add Inventory
                  </button>

                  {/* Inventory Report Name */}
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div class="col-md-4">
                      <label>
                        Inventory Report Name{" "}
                        <span style={{ color: "red" }}>*</span>{" "}
                      </label>
                      <MutliInput
                        type="text"
                        label="Inventory Report "
                        name={`reportName`}
                        errors={errors}
                        placeholder="Inventory Report"
                        register={register}
                        registerFields={{
                          required: true,
                        }}
                      />
                    </div>
                    <br />
                    <br />
                    {productsArray.map((item) => {
                      return (
                        <div className="row" key={item.id}>
                          <div class="col-md-2">
                            <AsyncReactSelectInput
                              name={`barcode${item.id}`}
                              label="Bar Code"
                              errors={errors}
                              registerFields={{ required: true }}
                              control={control}
                              promiseOptions={barcodeLoadOptionsDebounced}
                              colClass="w-100"
                              handleChange={(e) => barChangeHandler(e, item.id)}
                              selectedOption={item.barCode}
                              // register={register}
                              defaultOptions={allProducts}
                              isMultiple={false}
                            />
                          </div>
                          <div class="col-md-3">
                            <AsyncReactSelectInput
                              label="Name"
                              name={`name${item.id}`}
                              errors={errors}
                              registerFields={{ required: true }}
                              // options={allProducts}
                              control={control}
                              // colClass="col-xl-4"
                              promiseOptions={loadOptionsDebounced}
                              colClass="w-100"
                              handleChange={(e) =>
                                nameChangeHandler(e, item.id)
                              }
                              selectedOption={item.name}
                              // register={register}
                              defaultOptions={allProducts}
                              isMultiple={false}
                            />
                          </div>
                          <div class="col-md-2">
                            <label>Quantity</label>
                            <MutliInput
                              type="number"
                              label="Quantity"
                              name={`quantity${item.id}`}
                              errors={errors}
                              placeholder="Qunatity"
                              register={register}
                              registerFields={{
                                required: true,
                              }}
                            />
                          </div>
                          <div class="col-md-2">
                            <label>Real Quantity</label>
                            <MutliInput
                              type="number"
                              label=""
                              name={`realQuantity${item.id}`}
                              errors={errors}
                              placeholder="Real Quantity"
                              register={register}
                              registerFields={{
                                required: true,
                              }}
                            />
                          </div>
                          <div class="col-md-2">
                            <lable>Reason</lable>
                            <ReactSelectInput
                              label=""
                              name={`reasons${item.id}`}
                              errors={errors}
                              registerFields={{ required: !newObj[item.id] }}
                              options={allReasons}
                              control={control}
                              // colClass="col-xl-4"
                              colClass="w-100 inputSelectBox"
                              selectedOption={item.reasons}
                              handleChange={(e) =>
                                reasonChangeHandler(e, item.id)
                              }
                              register={register}
                              isMultiple={false}
                              isDisabled={newObj[item.id]}
                            />
                          </div>
                          {productsArray.length > 1 && (
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

export default AddProduct;
