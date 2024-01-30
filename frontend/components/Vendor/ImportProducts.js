import { useState, useEffect, useReducer } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import useTranslate from "@/hooks/useTranslate";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

import useRequest from "@/hooks/useRequest";
import { isValidUrl, capitalizeWordTwo } from "@/fn";
import AddProducts from "./AddProducts";

const TABLE_FIELDS = [
  {
    label: "Name",
    value: "name",
  },
  //   {
  //     label: "Serial Number",
  //     value: "serialNumber",
  //   },
  {
    label: "Bar Code",
    value: "barCode",
  },
  {
    label: "Master Category",
    value: "masterCategoryId",
  },
  {
    label: "Sub Category",
    value: "subCategoryId",
  },
  {
    label: "Brand",
    value: "brandId",
  },
  {
    label: "Unit",
    value: "unitId",
  },
  //   {
  //     label: "Warehouse",
  //     value: "warehouses",
  //   },
  //   {
  //     label: "Quantity",
  //     value: "quantity",
  //   },
  //   {
  //     label: "Countries",
  //     value: "countries",
  //   },
  //   {
  //     label: "Save as",
  //     value: "isPublished",
  //   },
  //   {
  //     label: "Stock",
  //     value: "inStock",
  //   },
  {
    label: "Buying Price",
    value: "buyingPrice",
  },
  {
    label: "Selling Price",
    value: "sellingPrice",
  },
  {
    label: "Short Description",
    value: "shortDescription",
  },
  {
    label: "Long Description",
    value: "longDescription",
  },
  // {
  //   label: "Feature or Specification Title",
  //   value: "featureTitle",
  // },
  {
    label: "Height",
    value: "height",
  },
  {
    label: "Weight",
    value: "weight",
  },
  {
    label: "Width",
    value: "width",
  },
  {
    label: "Length",
    value: "length",
  },
  {
    label: "Meta title",
    value: "metaDataTitle",
    // value: "metaData.title",
  },
  {
    label: "Meta Decription",
    value: "metaDataDescription",
    // value: "metaData.description",
  },
  {
    label: "Meta Author",
    value: "metaDataAuthor",
    // value: "metaData.author",
  },
  {
    label: "Meta Keywords",
    value: "metaDataKeywords",
    // value: "metaData.keywords",
  },
  {
    label: "Media",
    value: "media",
  },
];

const KEY_VALUE_MAPPING = {
  //   ws_code: "serialNumber",
  barcode: "barCode",
  name: "name",
  cat1name: "masterCategoryId",
  cat2name: "subCategoryId",
  //   stock: "quantity",
  unit: "unitId",
  //   price_list: "",
  //   price_special: ""
  brand: "brandId",
  height: "height",
  width: "width",
  weight: "weight",
  detail: "longDescription",
  seo_title: "metaData.title",
  seo_description: "metaData.description",
  seo_keywords: "metaData.keywords",
  images: "media",
  cat3name: "subCategoryId",
};

const REQUIRED_TABLE_FIELDS = [
  "name",
  "barCode",
  // "serialNumber",
  "masterCategoryId",
  //   "subCategoryId",
  "brandId",
  "unitId",
  // "warehouses",
  // "quantity",
  // "countries",
  // "isPublished",
  // "inStock",
  //   "buyingPrice",
  // "shortDescription",
  // "longDescription",
  // "featureTitle",
  // "height",
  // "weight",
  // "width",
  // "length",
  // "media",
];

const timeOptions = new Array(24).fill(null).map((_, idx) => idx + 1);

const initialState = {
  modalStage: 1, //link, mapping, sync
  fileLink: "",
  fileName: "",
  container: "",
  containers: "",
  isAutoSync: false,
  syncTime: "",
  selectedSyncFields: [],
  uniqueField: "",
  isLinkModalOpen: false,
  isMappingModalOpen: false,
  isSyncModalOpen: false,
  productsData: [],
  isProgressModalOpen: false,
  progressValue: 0,
  mappingData: {
    data: "",
    mappingArr: [],
  },
  subCategoriesKey: [],
  errors: {},
};

const tableFieldsDefaultValueHandler = (key) => {
  const value = KEY_VALUE_MAPPING[key];

  if (value) {
    const obj = TABLE_FIELDS.find((tf) => tf.value === value);
    if (value === "subCategoryId") {
      return [obj, key];
    }
    return [obj];
  }
  return [undefined];
};

const reducer = (state, action) => {
  switch (action.type) {
    case "update":
      return { ...state, [action.payload.key]: action.payload.value };
    case "updates":
      return {
        ...state,
        ...action.payload,
      };
    case "arrAddElm": {
      const key = action.payload.key;
      return {
        ...state,
        [key]: [...state[action.payload.key], action.payload.value],
      };
    }
    case "arrRemoveElm": {
      const key = action.payload.key;
      return {
        ...state,
        // [key]: [
        //   ...state[action.payload.key].filter(
        //     (p) => p !== action.payload.value
        //   ),
        // ],
        [key]: action.payload.value(state[action.payload.key]),
      };
    }
    case "addError": {
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.value,
        },
      };
    }
    case "removeError": {
      const newErrors = { ...state.errors };
      delete newErrors[action.payload.key];

      return {
        ...state,
        errors: newErrors,
      };
    }
    case "reset": {
      return { ...initialState };
    }
    default:
      return state;
  }
};

const ImportProducts = () => {
  const t = useTranslate();

  const [state, dispatch] = useReducer(reducer, initialState);

  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);

  const [isImportByCategoryModalOpen, setIsImportByCategoryModalOpen] =
    useState(false);

  const router = useRouter();

  const { request, response } = useRequest();

  const { request: requestImportProd, response: responseImportProd } =
    useRequest();

  const { request: requestImportStatus, response: responseImportStatus } =
    useRequest(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    unregister,
    control,
    setError,
    reset,
  } = useForm();

  const { webview } = router.query;

  useEffect(() => {
    if (webview) {
      dispatchUpdatesHandler({
        modalStage: 1,
        isLinkModalOpen: true,
      });
    }
  }, []);

  useEffect(() => {
    if (response) {
      const product = response.product;

      const products = [];
      let index = 0;
      let subCategoryLevel = 0;

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
          setValue(`subCategoryId.${key}`, {
            label: `Level ${subCategoryLevel + 1}`,
            value: subCategoryLevel,
          });
          subCategoryLevel++;
        }

        index++;
      }

      dispatchUpdatesHandler({
        fileName: response.fileName,
        containers: response.containers,
        productsData: products,
        isMappingModalOpen: true,
      });
    }
  }, [response]);

  useEffect(() => {
    if (responseImportProd) {
      if (!responseImportProd.status) {
        toast.error("Failed to import products.");
        // downloadExcel(responseImportProd.products, "Product Import");
      } else {
        toast.success("Products import started successfully.");

        dispatchUpdatesHandler({
          progressValue: Math.floor(
            (responseImportProd.current / responseImportProd.total) * 100
          ),
          isProgressModalOpen: true,
        });

        setTimeout(() => {
          requestImportStatus("POST", "v1/product/import-products-status", {
            fileName: state.fileName,
          });
        }, 5000);
      }
    }
  }, [responseImportProd]);

  useEffect(() => {
    if (responseImportStatus) {
      if (responseImportStatus.importStatus) {
        dispatchUpdatesHandler({
          progressValue: Math.floor(
            (responseImportStatus.importStatus.current /
              responseImportStatus.importStatus.total) *
              100
          ),
        });

        if (
          responseImportStatus.importStatus.current !==
          responseImportStatus.importStatus.total
        ) {
          setTimeout(() => {
            requestImportStatus("POST", "v1/product/import-products-status", {
              fileName: state.fileName,
            });
          }, 1000);
        } else {
          toast.success("Upload completed successfully.");

          dispatchUpdatesHandler({
            progressValue: 0,
            isProgressModalOpen: false,
          });
          if (webview) {
            router.replace("/vendor/dashboard");
          } else {
            router.replace(router.asPath);
          }
        }
      }
    }
  }, [responseImportStatus]);

  const dispatchHandler = (type, key, value) => {
    dispatch({
      type,
      payload: {
        key,
        value,
      },
    });
  };

  const dispatchUpdatesHandler = (payload) => {
    dispatch({
      type: "updates",
      payload,
    });
  };

  const dispatchRemoveErrorHandler = (key) => {
    dispatch({
      type: "removeError",
      payload: {
        key,
      },
    });
  };

  const handleCloseLinkModal = () => {
    dispatchHandler("update", "isLinkModalOpen", false);
    if (webview) {
      router.replace("/vendor/dashboard");
    }
  };

  const linkModalHandler = () => {
    let isError = false;

    if (state.fileLink.trim().length === 0) {
      dispatchHandler("addError", "fileLink", "Please provide file link");
      isError = true;
    } else if (!isValidUrl(state.fileLink)) {
      dispatchHandler("addError", "fileLink", "Please provide valid file link");
      isError = true;
    }

    if (state.container.trim().length === 0) {
      dispatchHandler("addError", "container", "Please provide container name");
      isError = true;
    }

    if (isError) {
      return;
    }

    dispatchUpdatesHandler({
      modalStage: 2,
      isLinkModalOpen: false,
    });

    request("POST", "v1/product/import-file", {
      fileLink: state.fileLink,
      container: state.container,
    });
  };

  const subCategoryLevelHandler = (value, key) => {
    if (value === "subCategoryId") {
      //add
      //   setSubCategoriesKey((prev) => [...prev, key]);
      dispatchHandler("arrAddElm", "subCategoriesKey", key);
    } else {
      //remove
      if (state.subCategoriesKey.includes(key)) {
        // setSubCategoriesKey((prev) => prev.filter((p) => p !== key));
        dispatchHandler("arrRemoveElm", "subCategoriesKey", (arr) =>
          arr.filter((p) => p !== key)
        );
      }
    }
  };

  const handleCloseMappingModal = () => {
    dispatchHandler("update", "isMappingModalOpen", false);
    if (webview) {
      router.replace("/vendor/dashboard");
    }
  };

  const productDataHeaderHandler = (data) => {
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
      if (objForOne[key].length > 1 && key !== "subCategoryId") {
        isError = true;
        objForOne[key].forEach((k) => {
          setError(k, { type: "custom", message: "Already used." });
        });
      }
    }

    if (state.subCategoriesKey.length > 0) {
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

        mappingArr.push(data[key]);
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

    dispatchUpdatesHandler({
      modalStage: 3,
      isMappingModalOpen: false,
      isSyncModalOpen: true,
      mappingData: { data: filteredData, mappingArr },
    });
  };

  const deleteHandler = (id, key) => {
    dispatchHandler("arrRemoveElm", "productsData", (arr) =>
      arr.filter((p) => p.index !== id)
    );

    unregister(key);

    if (state.subCategoriesKey.includes(key)) {
      dispatchHandler("arrRemoveElm", "subCategoriesKey", (arr) =>
        arr.filter((p) => p !== key)
      );
      unregister(`subCategoryId.${key}`);
    }
  };

  const handleCloseSyncModal = () => {
    dispatchHandler("update", "isSyncModalOpen", false);
    if (webview) {
      router.replace("/vendor/dashboard");
    }
  };

  const handleCloseProgressModal = () => {
    dispatchHandler("update", "isProgressModalOpen", false);
    if (webview) {
      router.replace("/vendor/dashboard");
    }
  };

  const importHandler = () => {
    let isError = false;

    if (state.isAutoSync) {
      if (!state.syncTime) {
        dispatchHandler("addError", "syncTime", "Please select sync time");
        isError = true;
      }

      if (state.selectedSyncFields.length === 0) {
        dispatchHandler(
          "addError",
          "selectedSyncFields",
          "Please select fields you want to sync"
        );
        isError = true;
      }

      if (!state.uniqueField) {
        dispatchHandler(
          "addError",
          "uniqueField",
          "Please select unique identifier"
        );
        isError = true;
      }

      if (isError) {
        return;
      }
    }

    dispatchHandler("update", "isSyncModalOpen", false);

    requestImportProd("POST", "v1/product/import-products", {
      fileName: state.fileName,
      mappedObj: state.mappingData.data,
      containers: state.containers,
      subCategoriesKey: state.subCategoriesKey,
    });
  };

  return (
    <>
      {/* <button
        onClick={() => {
          dispatchHandler("reset");

          dispatchUpdatesHandler({
            modalStage: 1,
            isLinkModalOpen: true,
          });
        }}
      >
        Import
      </button> */}

      <AddProducts
        isImportModalOpen={isImportByCategoryModalOpen}
        setIsImportModalOpen={setIsImportByCategoryModalOpen}
      />

      {!webview && (
        <a
          onClick={() => {
            // dispatchHandler("reset");

            // dispatchUpdatesHandler({
            //   modalStage: 1,
            //   isLinkModalOpen: true,
            // });

            setIsOptionsModalOpen(true);
          }}
          className="ExportBtns mr-15 cursor"
        >
          {t("Import")} <i className="fal fa-cloud-download" />
        </a>
      )}

      <Modal
        show={state.isLinkModalOpen}
        onHide={handleCloseLinkModal}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Import</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div class="form-group">
            <label>Enter Link</label>
            <div className="position-relative">
              <input
                type="url"
                class="form-control form-control-solid form-control-lg undefined"
                name="file"
                placeholder="Enter link"
                onChange={(e) => {
                  dispatchHandler("update", "fileLink", e.target.value);
                  dispatchRemoveErrorHandler("fileLink");
                }}
                value={state.fileLink}
              />
              {state.errors.fileLink && (
                <span className="text-danger">{t(state.errors.fileLink)}</span>
              )}
            </div>

            <div className="input-group mt-5">
              <p>Note :- Please provide only XML link.</p>
            </div>

            <label>Container Names</label>
            <div className="position-relative">
              <input
                type="text"
                class="form-control form-control-solid form-control-lg undefined"
                name="container"
                placeholder="Enter Container Name"
                onChange={(e) => {
                  dispatchHandler("update", "container", e.target.value);
                  dispatchRemoveErrorHandler("container");
                }}
                value={state.container}
              />
              {state.errors.container && (
                <span className="text-danger">{t(state.errors.container)}</span>
              )}
            </div>

            <div className="input-group mt-5">
              <p>
                Note :- For below sample link it will be <b>product</b>
              </p>
            </div>

            <div className="input-group">
              <p>
                <a
                  target="__blank"
                  href="https://www.noonmar.com/xml/?R=2283&K=602a&Seo=1&Imgs=1&AltUrun=1&TamLink&Dislink"
                >
                  Sample Link
                </a>
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseLinkModal}>
            Close
          </Button>
          <Button variant="primary" onClick={linkModalHandler}>
            Next
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={state.isMappingModalOpen}
        onHide={handleCloseMappingModal}
        backdrop="static"
        keyboard={false}
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>Import</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ height: "80vh", overflow: "scroll" }}>
            <form onSubmit={handleSubmit(productDataHeaderHandler)}>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table
                    className="table table-bordered table-sm1 custom_tbl_new"
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
                      {state.productsData.map((data) => (
                        <tr key={data.index}>
                          <td>{capitalizeWordTwo(data.key)}</td>
                          <td
                            style={{
                              maxWidth: 250,
                              wordBreak: "break-all",
                              whiteSpace: "break-spaces",
                            }}
                          >
                            {data.value}
                          </td>
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
                                      className="form-select- form-control- dark-form-control libSelect custom_input w-50"
                                      classNamePrefix="custom_input_child"
                                    />
                                  );
                                }}
                              />

                              {state.subCategoriesKey.includes(data.key) && (
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
                                        options={state.subCategoriesKey.map(
                                          (_, idx) => ({
                                            label: `Level ${idx + 1}`,
                                            value: idx,
                                          })
                                        )}
                                        value={value}
                                        className="form-select- form-control- dark-form-control libSelect custom_input zIndex5 w-50"
                                        placeholder="Select Sub Category Level"
                                        classNamePrefix="custom_input_child"
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseMappingModal}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(productDataHeaderHandler)}
          >
            Next
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={state.isSyncModalOpen}
        onHide={handleCloseSyncModal}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Import</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div class="form-group">
            <div className="ProVariantList">
              <label class="checkbox checkbox-square">
                <input
                  type="checkbox"
                  style={{ height: "20px" }}
                  checked={state.isAutoSync}
                  onChange={(e) =>
                    dispatchHandler("update", "isAutoSync", e.target.checked)
                  }
                ></input>
                <span></span>
                Want to auto sync?
              </label>
            </div>
            {state.isAutoSync && (
              <>
                <label className="mt-2">Sync Time</label>
                <div className="position-relative">
                  <select
                    onChange={(e) =>
                      dispatchHandler("update", "syncTime", e.target.value)
                    }
                    value={state.syncTime}
                    required
                    class="form-control form-control-solid form-control-lg undefined"
                  >
                    <option value="">Select an option</option>
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>{`Every ${time} ${
                        time === 1 ? "hour" : "hours"
                      }`}</option>
                    ))}
                  </select>
                </div>

                <label className="mt-2">Fields you want to sync</label>
                <div className="position-relative">
                  <Select
                    required
                    onChange={(val) => {
                      //   state(val);
                      dispatchHandler("update", "selectedSyncFields", val);
                    }}
                    options={state.mappingData.mappingArr}
                    value={state.selectedSyncFields}
                    className="form-select- form-control- dark-form-control"
                    isMulti
                  />
                </div>

                <label className="mt-2">Unique Identifier</label>
                <div className="position-relative">
                  <Select
                    required
                    onChange={(val) => {
                      //   setUniqueField(val);
                      dispatchHandler("update", "uniqueField", val);
                    }}
                    options={state.mappingData.mappingArr}
                    value={state.uniqueField}
                    className="form-select- form-control- dark-form-control"
                  />
                </div>
              </>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseSyncModal}>
            Close
          </Button>
          <Button onClick={importHandler} variant="primary">
            Import
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={state.isProgressModalOpen}
        onHide={handleCloseProgressModal}
        backdrop="static"
        keyboard={false}
      >
        <div class="modal-content">
          <div class="modal-header">
            <h3>Your file is being processed...</h3>
          </div>
          <div className="modal-body">
            <p style={{ textAlign: "center" }}>Upload in progress</p>
            <div class="progress">
              <div
                class="progress-bar"
                role="progressbar"
                style={{ width: `${state.progressValue}%` }}
                aria-valuenow="25"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                {state.progressValue}%
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        show={isOptionsModalOpen}
        onHide={() => setIsOptionsModalOpen(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Import</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div class="form-group modal_btn">
            <Button
              onClick={() => {
                setIsOptionsModalOpen(false);
                setIsImportByCategoryModalOpen(true);
              }}
              variant="primary"
            >
              Import using Category
            </Button>
            {/* <Button
              onClick={() => {
                setIsOptionsModalOpen(false);
                dispatchHandler("reset");

                dispatchUpdatesHandler({
                  modalStage: 1,
                  isLinkModalOpen: true,
                });
              }}
              variant="primary"
            >
              Import using XML File
            </Button> */}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ImportProducts;
