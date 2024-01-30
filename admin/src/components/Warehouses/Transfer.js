import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { debounce } from "../../util/fn";
import useRequestTwo from "../../hooks/useRequestTwo";

import {
  Input,
  AsyncReactSelectInput,
  SubmitButton,
  ButtonComp,
  ReactSelectInput,
} from "../Form/Form";

const initialRow = {
  product: {},
  id: 1,
};

const AddTransactions = () => {
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

  const { response: responseWarehouse, request: requestWarehouse } =
    useRequest();
  const { request: requestProducts } = useRequestTwo();

  const [allWarehouse, setAllWarehouse] = useState([]);
  const [selectFrom, setSelectFrom] = useState([]);
  const [selectTo, setSelectTo] = useState([]);
  const [isShow, setIsShow] = useState(false);

  const [allTransfers, setAllTransfers] = useState([initialRow]);

  const [newNextId, setNewNextId] = useState(2);
  // const [allProducts, setAllProducts] = useState([]);

  const history = useHistory();

  useEffect(() => {
    document.title = "Make Transfer - Noonmar";
    requestWarehouse("GET", `warehouse/all?page=1&sortBy=name`);
  }, []);

  const [senderId, receiverId] = watch([
    "senderWarehouseId",
    "receiverWarehouseId",
  ]);

  useEffect(() => {
    if (senderId && receiverId) {
      if (senderId !== receiverId) {
        setIsShow(true);
      } else {
        setIsShow(false);
      }
    } else {
      setIsShow(false);
    }
  }, [senderId, receiverId]);

  useEffect(() => {
    if (response) {
      toast.success("Warehouse product transfer successfully.");
      history.push(`/warehouse/transactions`);
    }
  }, [response]);

  useEffect(() => {
    if (responseWarehouse) {
      if (responseWarehouse.status && responseWarehouse?.data) {
        const newData = responseWarehouse.data.map((item, index) => {
          return {
            label: item.name,
            value: item._id,
          };
        });

        setAllWarehouse(newData);
      }
    }
  }, [responseWarehouse]);

  const onSubmit = (data) => {
    const productData = [];
    allTransfers.forEach((item) => {
      productData.push({
        id: data[`productId${item.id}`].value,
        quantity: data[`quantity${item.id}`],
      });
    });

    const { senderWarehouseId, receiverWarehouseId } = data;
    const sendData = {
      senderWarehouseId: senderWarehouseId.value,
      receiverWarehouseId: receiverWarehouseId.value,
      products: productData,
    };
    request("POST", "warehouse/transfer", sendData);
  };

  const formChangeHandler = (e) => {
    setSelectFrom(e);
    setValue("senderWarehouseId", e);
  };

  const toChangeHandler = (e) => {
    if (selectFrom == e) {
      setError("receiverWarehouseId", {
        type: "custom",
        message: "Please select different warehouse",
      });
      setValue("receiverWarehouseId", "");
      setSelectTo("");
    } else {
      clearErrors("receiverWarehouseId");
      setSelectTo(e);
      setValue("receiverWarehouseId", e);
    }
  };

  const addHandler = () => {
    setAllTransfers((prev) => [...prev, { product: {}, id: newNextId }]);
    setNewNextId((prev) => prev + 1);
  };

  const deleteHandler = (id) => {
    const data = allTransfers.filter((item) => item.id !== id);
    setAllTransfers(data);
  };

  const productLoadOptionsDebounced = useCallback(
    debounce(async (inputValue, callback) => {
      const response = await requestProducts(
        "GET",
        `warehouse/products?page=1&per_page=1000&name=${inputValue}&warehouseId=${senderId.value}`
      );

      callback(
        response.data.data.map((b) => ({
          value: b._id,
          label: b.name,
        }))
      );
    }, 500),

    [senderId]
  );

  const productChangeHandler = (e, item) => {
    const isExist = allTransfers.find(
      (transfer) => transfer.product.value === e.value
    );

    if (isExist) {
      setError(`productId${item.id}`, {
        type: "custom",
        message: "Product already selected.",
      });
    } else {
      const newTransfers = [...allTransfers];

      const indexToChange = newTransfers.findIndex(
        (transfer) => transfer.id === item.id
      );

      newTransfers[indexToChange].product = e;
      setAllTransfers(newTransfers);

      setValue(`productId${item.id}`, e);
    }
  };

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Make Transfer"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/warehouses", name: "Back To Warehouses" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Make Transfer</h3>
            </div>
            <div className="card-body">
              <div className="row ">
                <div className="col-xl-12">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    {isShow && allTransfers.length > 0 && (
                      <button
                        class="btn btn-primary mr-2 mb-2 fixedButtonAdd2 zindex-1"
                        type="button"
                        onClick={addHandler}
                      >
                        Add <i class="fas fa-plus p-0"></i>
                      </button>
                    )}

                    <div className="row align-items-center">
                      <ReactSelectInput
                        label="From"
                        name={`senderWarehouseId`}
                        errors={errors}
                        registerFields={{ required: true }}
                        options={allWarehouse}
                        control={control}
                        colClass="col-xl-6"
                        selectedOption={selectFrom}
                        handleChange={formChangeHandler}
                        register={register}
                        isMultiple={false}
                      />

                      <ReactSelectInput
                        label="To"
                        name={`receiverWarehouseId`}
                        errors={errors}
                        registerFields={{ required: true }}
                        options={allWarehouse}
                        control={control}
                        colClass="col-xl-6"
                        selectedOption={selectTo}
                        handleChange={toChangeHandler}
                        register={register}
                        isMultiple={false}
                      />
                    </div>

                    {isShow &&
                      allTransfers.map((item) => {
                        return (
                          <div key={item.id} className="row align-items-center">
                            <AsyncReactSelectInput
                              name={`productId${item.id}`}
                              label="Products"
                              errors={errors}
                              registerFields={{ required: true }}
                              control={control}
                              promiseOptions={productLoadOptionsDebounced}
                              colClass="col-xl-4"
                              handleChange={(e) =>
                                productChangeHandler(e, item)
                              }
                              selectedOption={item.product}
                              // defaultOptions={allProducts}
                              isMultiple={false}
                            />

                            <Input
                              label="Quantity"
                              type="number"
                              name={`quantity${item.id}`}
                              errors={errors}
                              register={register}
                              registerFields={{
                                required: true,
                              }}
                              colClass="col-xl-4"
                            />
                            {allTransfers.length > 1 && (
                              <ButtonComp
                                classes="btn btn-bg-danger ml-2"
                                onClick={() => deleteHandler(item.id)}
                              >
                                <i class="fas fa-trash-alt text-white"></i>
                              </ButtonComp>
                            )}
                          </div>
                        );
                      })}

                    <SubmitButton
                      handleSubmit={handleSubmit}
                      onSubmit={onSubmit}
                      name="Transfer"
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

export default AddTransactions;
