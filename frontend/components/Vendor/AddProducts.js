import { useState, useEffect, useReducer } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import useTranslate from "@/hooks/useTranslate";
import { toast } from "react-toastify";
import { MEDIA_URL } from "@/api";
import { useRouter } from "next/router";

import useRequest from "@/hooks/useRequest";
import { isValidUrl, capitalizeWordTwo } from "@/fn";

const TABLE_FIELDS = [
  {
    label: "Name",
    value: "name",
  },
  {
    label: "Serial Number",
    value: "serialNumber",
  },
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
  {
    label: "Warehouse",
    value: "warehouses",
  },
  {
    label: "Quantity",
    value: "quantity",
  },
  {
    label: "Countries",
    value: "countries",
  },
  {
    label: "Save as",
    value: "isPublished",
  },
  {
    label: "Stock",
    value: "inStock",
  },
  {
    label: "Buying Price",
    value: "buyingPrice",
  },
  {
    label: "Short Description",
    value: "shortDescription",
  },
  {
    label: "Long Description",
    value: "longDescription",
  },
  {
    label: "Feature or Specification Title",
    value: "featureTitle",
  },
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
    value: "metaData.title",
  },
  {
    label: "Meta Decription",
    value: "metaData.description",
  },
  {
    label: "Meta Author",
    value: "metaData.author",
  },
  {
    label: "Meta Keywords",
    value: "metaData.keywords",
  },
  {
    label: "Media",
    value: "media",
  },
];

const KEY_VALUE_MAPPING = {
  ws_code: "serialNumber",
  name: "name",
  cat1name: "masterCategoryId",
  cat2name: "subCategoryId",
  stock: "quantity",
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
  // "serialNumber",
  "masterCategoryId",
  "subCategoryId",
  "brandId",
  "unitId",
  // "warehouses",
  // "quantity",
  // "countries",
  // "isPublished",
  // "inStock",
  "buyingPrice",
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
  isImportModalOpen: false,
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

const AddProducts = ({ isImportModalOpen, setIsImportModalOpen }) => {
  const t = useTranslate();

  const [state, dispatch] = useReducer(reducer, initialState);

  const { request, response } = useRequest();

  const { request: requestImportProd, response: responseImportProd } =
    useRequest();

  const { request: requestImportStatus, response: responseImportStatus } =
    useRequest(true);
  const { request: requestCategory, response: responseCategory } = useRequest();
  const [selectedMedia, setSelectedMedia] = useState({
    main: [],
  });
  const [allCategory, setAllCategory] = useState([]);
  const [category, setCategory] = useState("");
  const [selectedNewArray, setSelectedNewArray] = useState([]);
  // const [isImportModalOpen, setIsImportModalOpen] = useState(true);
  const [isProductModel, setIsProductModel] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [searchKey, setSearchKey] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    unregister,
    control,
    setError,
    reset,
    clearErrors,
  } = useForm();

  const router = useRouter();

  useEffect(() => {
    requestCategory("GET", "v1/user/product-category");
  }, []);

  useEffect(() => {
    if (responseCategory && responseCategory.category.length > 0) {
      setAllCategory(responseCategory.category);
    }
  }, [responseCategory]);

  useEffect(() => {
    if (response) {
      setAllProducts(
        response.products.map((product) => ({
          ...product,
          isSelected: false,
        }))
      );
      //name, media, _id

      //   const product = response.product;

      //   const products = [];
      //   let index = 0;
      //   let subCategoryLevel = 0;

      //   for (let key in product) {
      //     const [defaultValue, toAddKey] = tableFieldsDefaultValueHandler(key);

      //     products.push({
      //       key,
      //       value: typeof product[key] === "object" ? null : product[key],
      //       index,
      //       defaultValue,
      //     });

      //     if (defaultValue) {
      //       register(key, { required: true });
      //       setValue(key, defaultValue);
      //     }

      //     if (toAddKey) {
      //       subCategoryLevelHandler("subCategoryId", key);
      //       register(`subCategoryId.${key}`, { required: true });
      //       setValue(`subCategoryId.${key}`, {
      //         label: `Level ${subCategoryLevel + 1}`,
      //         value: subCategoryLevel,
      //       });
      //       subCategoryLevel++;
      //     }

      //     index++;
      //   }

      //   dispatchUpdatesHandler({
      //     fileName: response.fileName,
      //     containers: response.containers,
      //     productsData: products,
      //     isMappingModalOpen: true,
      //   });
    }
  }, [response]);

  useEffect(() => {
    if (responseImportProd) {
      handleCloseProductModal();
      toast.success("Product imported successfully.");
      // router.push("/vendor/products");
      router.replace(router.asPath);
    }
  }, [responseImportProd]);

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

  const MediaSelectPreview = ({ media, name, updateMedia }) => {
    // const [isSelected, setIsSelected] = useState(media.isSelected);

    const changeIsSelectedHandler = () => {
      if (media.isSelected) {
        // setIsSelected(false);
        const newArray = selectedNewArray.filter((item) => item != media.id);
        setSelectedNewArray(newArray);
        updateMedia(media.id, "remove");
      } else {
        // setIsSelected(true);
        selectedNewArray.push(media.id);
        //  setSelectedNewArray(newArray)
        updateMedia(media.id, "add");
      }
    };
    return (
      <div
        onClick={changeIsSelectedHandler}
        className={`${
          selectedNewArray.includes(media.id) ? "instadata-active" : ""
        } cursor`}
      >
        <div className="meCard">
          <a>
            <img src={`${MEDIA_URL}/${media.src}`} alt="" />
            <p className="text-center">{name}</p>
          </a>
        </div>
      </div>
    );
  };

  const updateMedia = (id, type) => {
    let newProducts = [...allProducts];

    const idx = newProducts.findIndex((p) => p._id === id);

    newProducts[idx].isSelected = type === "add";

    setAllProducts(newProducts);
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
    setIsImportModalOpen(false);
    setCategory("");
    clearErrors("category");
  };

  const handleCloseProductModal = () => {
    setIsProductModel(false);
    setCategory("");
  };

  const searchData = () => {
    if (searchKey !== "" && searchValue !== "") {
      request(
        "POST",
        `v1/product/import-categories?key=${searchKey}&value=${searchValue}`,
        {
          categoryId: category,
        }
      );
    }
  };

  const clearApi = () => {
    setSearchValue("");
    request("POST", `v1/product/import-categories`, {
      categoryId: category,
    });
  };

  // const linkModalHandler = () => {
  //   let isError = false;

  //   if (state.fileLink.trim().length === 0) {
  //     dispatchHandler("addError", "fileLink", "Please provide file link");
  //     isError = true;
  //   } else if (!isValidUrl(state.fileLink)) {
  //     dispatchHandler("addError", "fileLink", "Please provide valid file link");
  //     isError = true;
  //   }

  //   if (state.container.trim().length === 0) {
  //     dispatchHandler("addError", "container", "Please provide container name");
  //     isError = true;
  //   }

  //   if (isError) {
  //     return;
  //   }

  //   dispatchUpdatesHandler({
  //     modalStage: 2,
  //     isImportModalOpen: false,
  //   });

  //   request("POST", "v1/product/import-file", {
  //     fileLink: state.fileLink,
  //     container: state.container,
  //   });
  // };

  const productModalHandler = () => {
    if (category != "") {
      request("POST", "v1/product/import-categories", {
        categoryId: category,
      });
      clearErrors("category");
      setIsImportModalOpen(false);
      setIsProductModel(true);
      setAllProducts([]);
    } else {
      setError("category", {
        type: "custom",
        message: "This field is Required !",
      });
    }
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

    if (statesubCategoriesKey.includes(key)) {
      dispatchHandler("arrRemoveElm", "subCategoriesKey", (arr) =>
        arr.filter((p) => p !== key)
      );
      unregister(`subCategoryId.${key}`);
    }
  };

  const handleCloseSyncModal = () => {
    dispatchHandler("update", "isSyncModalOpen", false);
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

    // requestImportProd("POST", "product/import-products", {
    //   fileName: state.fileName,
    //   mappedObj: state.mappingData.data,
    //   containers: state.containers,
    //   subCategoriesKey: state.subCategoriesKey,
    // });
  };

  const productImportHandler = () => {
    setCategory("");
    // const selectedIds = allProducts
    //   .filter((p) => p.isSelected)
    //   .map((p) => p._id);

    if (selectedNewArray.length === 0) {
      toast.error("Please select atleast one product");
      return;
    }

    requestImportProd("POST", "v1/product/import", {
      ids: selectedNewArray,
    });
  };

  return (
    <>
      {/* <button
        onClick={() => {
          // dispatchHandler("reset");

          // dispatchUpdatesHandler({
          //   modalStage: 1,
          //   isImportModalOpen: true,
          // });
          setIsImportModalOpen(true);
        }}
      >
        Import
      </button> */}

      <Modal
        show={isImportModalOpen}
        onHide={handleCloseLinkModal}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Import</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div class="form-group">
            <label>Select Category </label>
            <div className="position-relative">
              <Select
                name="category"
                // value={category}
                // onChange={handleChange}
                // onChange={(val) =>
                //   onChange(val.map((c) => c.value))
                // }
                onChange={(e) => setCategory(e.value)}
                options={allCategory}
              />
              {errors.category && (
                <span className="text-danger">
                  {t(errors.category.message)}
                </span>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseLinkModal}>
            Close
          </Button>
          <Button variant="primary" onClick={productModalHandler}>
            Next
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={state.isMappingModalOpen}
        onHide={handleCloseMappingModal}
        backdrop="static"
        keyboard={false}
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
        show={isProductModel}
        onHide={handleCloseProductModal}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Import</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div class="form-group">
            <div className="row">
              <div className="col-sm-12 col-md-4">Search Criteria</div>
              <div className="col-sm-12 col-md-4">
                <input
                  type="radio"
                  id="name"
                  name="barcode"
                  onClick={(e) => setSearchKey(e.target.value)}
                  value="name"
                />
                <label for="name" style={{ marginLeft: "10px" }}>
                  Name of the product
                </label>
              </div>
              <div className="col-sm-12 col-md-4">
                <input
                  type="radio"
                  id="barcode"
                  name="barcode"
                  value="barcode"
                  onClick={(e) => setSearchKey(e.target.value)}
                />
                <label for="barcode" style={{ marginLeft: "10px" }}>
                  Barcode
                </label>
              </div>
            </div>
          </div>

          <div class="form-group">
            <div className="row g-3">
              <div className="col-sm-12 col-md-6">
                <input
                  type="text"
                  className="design-input form-control"
                  name="search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
              <div className="col-sm-12 col-md-6" style={{ display: "flex" }}>
                {/* <Button
              variant="secondary"
              onClick={clearApi}
            >
              Clear
            </Button>       
            <Button
              variant="secondary"
              onClick={searchData}
            >
              Search
            </Button>           */}
                <button className="new-clear new_btn" onClick={clearApi}>
                  Clear
                </button>
                <button
                  className="new-clear new_btn"
                  style={{ marginLeft: "11px" }}
                  onClick={searchData}
                >
                  Search
                </button>
              </div>
              {/* <div className="col-2">
                   
                    <button>Search</button>
                </div> */}
            </div>
          </div>

          <div class="form-group">
            <div className="row">
              {allProducts.length > 0 ? (
                <>
                  <label>Select Product </label>
                  {allProducts.map((item, idx) => (
                    <div className="col-4">
                      <div key={item._id} class="card-body">
                        <div className="instadata">
                          <div className="continueBx_">
                            <div className="form_input_area">
                              <MediaSelectPreview
                                media={{
                                  id: item._id,
                                  src: item.media,
                                  isSelected: item.isSelected,
                                }}
                                name={item.name}
                                key={item._id}
                                id={item._id}
                                updateMedia={updateMedia}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <p>No Products Found. Please select different category.</p>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          {allProducts.length == 0 && (
            <Button
              variant="secondary"
              onClick={() => {
                handleCloseProductModal();
                setIsImportModalOpen(true);
              }}
            >
              Back
            </Button>
          )}
          <Button variant="secondary" onClick={handleCloseProductModal}>
            Close
          </Button>
          {allProducts.length > 0 && (
            <Button variant="primary" onClick={productImportHandler}>
              Next
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddProducts;
