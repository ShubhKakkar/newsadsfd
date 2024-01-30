import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import Modal from "react-modal";
import Select from "react-select";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import {
  RenderInputFields,
  SubmitButton,
  SelectInput,
  ButtonComp,
} from "../Form/Form";
import {
  REQUIRED_TABLE_FIELDS,
  TABLE_FIELDS,
} from "../Products/Components/ImportProduct";
import { capitalizeWord } from "../../util/fn";

const timeOptions = new Array(24).fill(null).map((_, idx) => idx + 1);

const Edit = (props) => {
  const { id: syncId } = props.match.params;

  const history = useHistory();

  const [subCategoriesKey, setSubCategoriesKey] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [mappedObj, setMappedObj] = useState({});
  const [toUpdate, setToUpdate] = useState(false);
  const [mappingData, setMappingData] = useState({ data: "", mappingArr: [] });
  const [selectedSyncFields, setSelectedSyncFields] = useState([]);

  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    getValues,
    reset,
    setError,
    clearErrors,
    control,
    unregister,
  } = useForm();

  const { response, request } = useRequest();

  const { response: responseFetchSync, request: requestFetchSync } =
    useRequest();

  const { response: responseFile, request: requestFile } = useRequest();

  useEffect(() => {
    if (syncId) {
      document.title = "Edit Product Sync - Noonmar";
      requestFetchSync("GET", `product-sync/${syncId}`);
    }
  }, [syncId]);

  useEffect(() => {
    if (responseFetchSync) {
      const { hours, mappedObj, fieldsToSync, containers, link } =
        responseFetchSync.sync;
      setMappedObj(mappedObj);

      reset({ hours });

      requestFile("POST", "product/import-file", {
        fileLink: link,
        containers,
      });
    }
  }, [responseFetchSync]);

  useEffect(() => {
    if (responseFile) {
      reset({});
      // setFileName(responseFile.fileName);
      const product = responseFile.product;

      if (Object.keys(product).length === 0) {
        return;
      }

      const products = [];
      let index = 0;

      for (let key in product) {
        const [defaultValue, toAddKey] = tableFieldsDefaultValueHandler(key);

        products.push({
          key,
          value: typeof product[key] === "object" ? null : product[key],
          index,
          defaultValue,
        });

        if (defaultValue) {
          register(key, { required: true });
          setValue(key, defaultValue);
        }

        if (toAddKey) {
          subCategoryLevelHandler("subCategoryId", key);
          register(`subCategoryId.${key}`, { required: true });
          setValue(`subCategoryId.${key}`, toAddKey);
        }

        index++;
      }

      setProductsData(products);
    }
  }, [responseFile]);

  useEffect(() => {
    if (response) {
      toast.success("Sync File has been updated successfully.");
      history.push("/product-sync");
    }
  }, [response]);

  const onSubmit = (data) => {
    const { hours } = data;

    const updates = {
      id: syncId,
      hours,
    };

    if (toUpdate) {
      updates.mappedObj = mappingData.data;
      updates.fieldsToSync = selectedSyncFields.map((obj) => obj.value);
    }

    request("PUT", "product-sync", updates);
  };

  const tableFieldsDefaultValueHandler = (key) => {
    const obj = mappedObj[key];

    let subCategoryKeys = [];

    if (mappedObj["subCategoryId"]) {
      subCategoryKeys = Object.keys(mappedObj["subCategoryId"]);
    }

    if (obj) {
      if (subCategoryKeys.includes(key)) {
        return [
          {
            label: "Sub Category",
            value: "subCategoryId",
          },
          mappedObj["subCategoryId"][key],
        ];
      }
      return [obj];
    }
    return [undefined];
  };

  const mappingHandlerFn = (data) => {
    //only one
    const objForOne = {};
    for (let key in data) {
      const obj = data[key];
      if (obj) {
        if (objForOne[obj.value]) {
          objForOne[obj.value] = objForOne[obj.value].concat(key);
        } else {
          objForOne[obj.value] = [key];
        }
      }
    }

    let isError = false;

    for (let key in objForOne) {
      if (
        objForOne[key].length > 1 &&
        !["subCategoryId", "undefined"].includes(key)
      ) {
        isError = true;
        objForOne[key].forEach((k) => {
          setError(k, { type: "custom", message: "Already used." });
        });
      }
    }

    if (subCategoriesKey.length > 0) {
      const subCategoryData = data["subCategoryId"];

      const valuesSelected = {};

      for (let key in subCategoryData) {
        const obj = subCategoryData[key];
        if (obj) {
          if (valuesSelected[obj.value]) {
            valuesSelected[obj.value] = valuesSelected[obj.value].concat(key);
          } else {
            valuesSelected[obj.value] = [key];
          }
        } else {
          isError = true;

          setError(key, { type: "custom", message: "Please select level." });
        }
      }

      for (let key in valuesSelected) {
        if (valuesSelected[key].length > 1) {
          isError = true;
          valuesSelected[key].forEach((k) => {
            setError(k, { type: "custom", message: "Already used." });
          });
        }
      }
    }

    //required
    const keysTaken = [];
    const filteredData = {};
    const mappingArr = [];

    for (let key in data) {
      if (data[key]?.value) {
        keysTaken.push(data[key].value);
        filteredData[key] = data[key];

        if (!["masterCategoryId", "subCategoryId"].includes(data[key]?.value)) {
          mappingArr.push(data[key]);
        }
      }

      if (key === "subCategoryId") {
        filteredData["subCategoryId"] = data[key];
      }
    }

    const uncommonKeys = REQUIRED_TABLE_FIELDS.filter(
      (ele) => keysTaken.indexOf(ele) === -1
    );

    if (uncommonKeys.length > 0) {
      isError = true;
      let error = "";

      TABLE_FIELDS.forEach((obj) => {
        if (uncommonKeys.includes(obj.value)) {
          error += `${obj.label} is required. `;
        }
      });

      toast.error(error);
    }

    if (isError) {
      return;
    }

    setIsMappingModalOpen(false);
    setMappedObj(filteredData);
    setIsSyncModalOpen(true);
    setToUpdate(false);
    setMappingData({ data: filteredData, mappingArr });

    let { fieldsToSync } = responseFetchSync.sync;

    fieldsToSync = fieldsToSync
      // .filter((field) => mappingArr.find((obj) => obj.value === field))
      .map((field) => mappingArr.find((obj) => obj.value === field))
      .filter((f) => f);

    setSelectedSyncFields(fieldsToSync);
  };

  const subCategoryLevelHandler = (value, key) => {
    if (value === "subCategoryId") {
      //add
      setSubCategoriesKey((prev) => [...prev, key]);
    } else {
      //remove
      if (subCategoriesKey.includes(key)) {
        setSubCategoriesKey((prev) => prev.filter((p) => p !== key));
      }
    }
  };

  const deleteHandler = (id, key) => {
    setProductsData((prev) => prev.filter((p) => p.index !== id));
    unregister(key);

    if (subCategoriesKey.includes(key)) {
      setSubCategoriesKey((prev) => prev.filter((p) => p !== key));

      unregister(`subCategoryId.${key}`);
    }
  };

  const saveMappingFn = () => {
    if (selectedSyncFields.length === 0) {
      toast.error("Please select fields you want to sync.");
      return;
    }
    setToUpdate(true);
    setIsSyncModalOpen(false);
  };

  const InputFields = [
    [
      {
        Component: SelectInput,
        label: "Sync Time",
        name: "hours",
        registerFields: {
          required: true,
        },
        children: (
          <>
            <option value="">Select an option</option>
            {timeOptions.map((time) => (
              <option key={time} value={time}>{`Every ${time} ${
                time === 1 ? "hour" : "hours"
              }`}</option>
            ))}
          </>
        ),
      },
    ],
  ];

  return (
    <>
      <div
        className="content  d-flex flex-column flex-column-fluid"
        id="kt_content"
      >
        <Breadcrumb
          title="Edit Sync File"
          links={[
            { to: "/", name: "Dashboard" },
            {
              to: { pathname: "/product-sync" },
              name: "Back To Sync List",
            },
          ]}
        />

        <div className="d-flex flex-column-fluid">
          <div className=" container ">
            <div className="card card-custom ">
              <div class="card-header">
                <h3 class="card-title">Edit Sync File</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-xl-12">
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <RenderInputFields
                        InputFields={InputFields}
                        errors={errors}
                        register={register}
                      />

                      <ButtonComp
                        classes="btn btn-primary font-weight-bold text-uppercase"
                        onClick={() => {
                          setIsMappingModalOpen(true);
                        }}
                      >
                        Update Mapping
                      </ButtonComp>

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

      <Modal
        isOpen={isSyncModalOpen}
        onRequestClose={() => setIsSyncModalOpen(false)}
        shouldCloseOnOverlayClick={false}
        ariaHideApp={false}
        className="react_modal_custom small_popup react_Custom_modal"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              Import
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={() => setIsSyncModalOpen(false)}
            >
              <i aria-hidden="true" class="ki ki-close"></i>
            </button>
          </div>
          <div className="modal-body">
            <div className="full-xl-6">
              <div class="form-group">
                <label className="mt-2">Fields you want to sync</label>
                <div className="position-relative">
                  <Select
                    required
                    onChange={(val) => {
                      setSelectedSyncFields(val);
                    }}
                    options={mappingData.mappingArr}
                    value={selectedSyncFields}
                    className="form-select- form-control- dark-form-control"
                    isMulti
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              className="btn btn-primary w-50"
              onClick={saveMappingFn}
              type="submit"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isMappingModalOpen}
        // isOpen={true}
        onRequestClose={() => setIsMappingModalOpen(false)}
        shouldCloseOnOverlayClick={false}
        ariaHideApp={false}
        className="react_modal_custom small_popup react_Custom_modal modal-xl"
      >
        <div class="modal-content" style={{ height: "90vh" }}>
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              Update Mapping
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={() => setIsMappingModalOpen(false)}
            >
              <i aria-hidden="true" class="ki ki-close"></i>
            </button>
          </div>
          <div
            className="modal-body"
            style={{ height: "80vh", overflow: "scroll" }}
          >
            <form onSubmit={handleSubmit(mappingHandlerFn)}>
              <div className="card-body p-0">
                <div className="table-responsive">
                  {/*begin::Table*/}
                  <table
                    className="table table-bordered table-sm1"
                    id="itemtable"
                  >
                    <thead>
                      <tr className="border-bottom font-size-h7 font-weight-bolder text-gray-700 text-uppercase">
                        <th>HEADER</th>
                        <th style={{ maxWidth: 250 }}>Product 1 TEXT</th>
                        <th style1="max-width:250px;">TABLE FIELDS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productsData.map((data) => (
                        <tr key={data.index}>
                          <td>{capitalizeWord(data.key)}</td>
                          <td style={{ maxWidth: 250 }}>{data.value}</td>
                          <td>
                            <div
                              className="input-group"
                              style={{ flexWrap: "nowrap", columnGap: "10px" }}
                            >
                              <Controller
                                className="form-control form-control-solid form-control-lg mb-10 col-4 w-50"
                                control={control}
                                name={data.key}
                                // rules={{ required: "This field is required." }}
                                render={({
                                  field: { onChange, value, ref },
                                }) => {
                                  return (
                                    <Select
                                      onChange={(val) => {
                                        subCategoryLevelHandler(
                                          val.value,
                                          data.key
                                        );
                                        onChange(val);
                                      }}
                                      options={TABLE_FIELDS}
                                      defaultValue={data.defaultValue}
                                      value={value}
                                      className="form-select- form-control- dark-form-control libSelect w-50"
                                    />
                                  );
                                }}
                              />

                              {subCategoriesKey.includes(data.key) && (
                                <Controller
                                  className="form-control form-control-solid form-control-lg mb-10 col-4 w-50 zIndex5"
                                  control={control}
                                  name={"subCategoryId." + data.key}
                                  // rules={{ required: "This field is required." }}
                                  render={({
                                    field: { onChange, value, ref },
                                  }) => {
                                    return (
                                      <Select
                                        onChange={(val) => {
                                          onChange(val);
                                        }}
                                        options={subCategoriesKey.map(
                                          (_, idx) => ({
                                            label: `Level ${idx + 1}`,
                                            value: idx,
                                          })
                                        )}
                                        value={value}
                                        className="form-select- form-control- dark-form-control libSelect zIndex5 w-50"
                                        placeholder="Select Sub Category Level"
                                      />
                                    );
                                  }}
                                />
                              )}
                              <div
                                onClick={() =>
                                  deleteHandler(data.index, data.key)
                                }
                                className="input-group-append cursor ml-2"
                              >
                                <a
                                  // href="#"
                                  className="input-group-text mapped_field btn btn-bg-danger"
                                >
                                  <i
                                    className="fa fa-trash"
                                    style={{ color: "white" }}
                                  />
                                </a>
                              </div>
                            </div>
                            {errors[data.key] && (
                              <div className="invalid-feedback">
                                {errors[data.key].message}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button
              onClick={handleSubmit(mappingHandlerFn)}
              className="btn btn-primary w-50"
              type="submit"
            >
              Next
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Edit;
