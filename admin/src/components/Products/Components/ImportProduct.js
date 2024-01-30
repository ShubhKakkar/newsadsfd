import { useState, useEffect, Fragment } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";

import { capitalizeWord, isValidUrl, downloadExcel } from "../../../util/fn";
import useRequest from "../../../hooks/useRequest";

export const TABLE_FIELDS = [
  {
    label: "Name (EN)",
    value: "name",
  },
  {
    label: "Name (AR)",
    value: "name_ar",
  },
  {
    label: "Name (TR)",
    value: "name_tr",
  },
  // {
  //   label: "Serial Number",
  //   value: "serialNumber",
  // },
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
  // {
  //   label: "Warehouse",
  //   value: "warehouses",
  // },
  // {
  //   label: "Quantity",
  //   value: "quantity",
  // },
  // {
  //   label: "Countries",
  //   value: "countries",
  // },
  // {
  //   label: "Save as",
  //   value: "isPublished",
  // },
  // {
  //   label: "Stock",
  //   value: "inStock",
  // },
  {
    label: "Buying Price",
    value: "buyingPrice",
  },
  {
    label: "Selling Price",
    value: "sellingPrice",
  },
  {
    label: "Short Description (EN)",
    value: "shortDescription",
  },
  {
    label: "Short Description (Ar)",
    value: "shortDescription_ar",
  },
  {
    label: "Short Description (Tr)",
    value: "shortDescription_tr",
  },
  {
    label: "Long Description (EN)",
    value: "longDescription",
  },
  {
    label: "Long Description (Ar)",
    value: "longDescription_ar",
  },
  {
    label: "Long Description (Tr)",
    value: "longDescription_tr",
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
    label: "Meta title (EN)",
    value: "metaDataTitle",
  },
  {
    label: "Meta title (AR)",
    value: "metaDataTitle_ar",
  },
  {
    label: "Meta title (TR)",
    value: "metaDataTitle_tr",
  },
  {
    label: "Meta Decription (EN)",
    value: "metaDataDescription",
  },
  {
    label: "Meta Decription (AR)",
    value: "metaDataDescription_ar",
  },
  {
    label: "Meta Decription (TR)",
    value: "metaDataDescription_tr",
  },
  {
    label: "Meta Author (EN)",
    value: "metaDataAuthor",
  },
  {
    label: "Meta Author (AR)",
    value: "metaDataAuthor_ar",
  },
  {
    label: "Meta Author (TR)",
    value: "metaDataAuthor_tr",
  },
  {
    label: "Meta Keywords (EN)",
    value: "metaDataKeywords",
  },
  {
    label: "Meta Keywords (AR)",
    value: "metaDataKeywords_ar",
  },
  {
    label: "Meta Keywords (TR)",
    value: "metaDataKeywords_tr",
  },
  {
    label: "Media",
    value: "media",
  },
  {
    label: "Currency",
    value: "buyingPriceCurrency",
  },
  {
    label: "Alternate Products",
    value: "alternateProducts",
  },
  {
    label: "DC",
    value: "dc",
  },
  // {
  //   label: "Shipping Company",
  //   value: "shippingCompany",
  // },
  // {
  //   label: "Product Link (EN)",
  //   value: "slug",
  // },
  // {
  //   label: "Product Link (AR)",
  //   value: "slug_ar",
  // },
  // {
  //   label: "Product Link (TR)",
  //   value: "slug_tr",
  // },
];

const KEY_VALUE_MAPPING = {
  // ws_code: "serialNumber",
  barcode: "barCode",
  name: "name",
  cat1name: "masterCategoryId",
  cat2name: "subCategoryId",
  // stock: "quantity",
  unit: "unitId",
  //   price_list: "",
  //   price_special: ""
  brand: "brandId",
  height: "height",
  width: "width",
  weight: "weight",
  length: "length",
  dc: "dc",
  // shipping_company: "shippingCompany",

  detail: "longDescription",
  seo_title: "metaDataTitle",
  seo_description: "metaDataDescription",
  seo_keywords: "metaDataKeywords",

  images: "media",
  cat3name: "subCategoryId",
  buying_price: "buyingPrice",
  selling_price: "sellingPrice",

  currency: "buyingPriceCurrency",
  alternate_products: "alternateProducts",
  media: "media",
  long_description: "longDescription",
  seo_desc: "metaDataDescription",

  name_ar: "name_ar",
  name_tr: "name_tr",
  // product_link: "slug",
  // product_link_ar: "slug_ar",
  // product_link_tr: "slug_tr",
  short_description: "shortDescription",
  short_description_ar: "shortDescription_ar",
  short_description_tr: "shortDescription_tr",
  long_description_ar: "longDescription_ar",
  long_description_tr: "longDescription_tr",
  seo_title_ar: "metaDataTitle_ar",
  seo_title_tr: "metaDataTitle_tr",
  seo_author: "metaDataAuthor",
  seo_author_ar: "metaDataAuthor_ar",
  seo_author_tr: "metaDataAuthor_tr",
  seo_desc_ar: "metaDataDescription_ar",
  seo_desc_tr: "metaDataDescription_tr",
  seo_keywords_ar: "metaDataKeywords_ar",
  seo_keywords_tr: "metaDataKeywords_tr",
};

export const REQUIRED_TABLE_FIELDS = [
  "name",
  "barCode",
  // "serialNumber",
  "masterCategoryId",
  // "subCategoryId",
  "brandId",
  "unitId",
  // "warehouses",
  // "quantity",
  // "countries",
  // "isPublished",
  // "inStock",
  // "buyingPrice",
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

export const tableFieldsDefaultValueHandler = (key) => {
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

const ImportProduct = ({ allVendors }) => {
  const [modalStage, setModalStage] = useState(0);
  //1 = vendor, 2 = link 3= sync

  const [selectedVendor, setSelectedVendor] = useState("");

  const [fileLink, setFileLink] = useState("");
  const [container, setContainer] = useState("");
  const [containers, setContainers] = useState("");

  const [isAutoSync, setIsAutoSync] = useState(false);
  const [syncTime, setSyncTime] = useState("");
  const [selectedSyncFields, setSelectedSyncFields] = useState([]);
  // const [uniqueField, setUniqueField] = useState("");

  const [fileName, setFileName] = useState("");

  const [isImportProductModalOpen, setIsImportProductModalOpen] =
    useState(false);

  const [isProductDataModalOpen, setIsProductDataModalOpen] = useState(false);

  const [productsData, setProductsData] = useState([]);

  const [isProgressBarModalOpen, setIsProgressBarModalOpen] = useState(false);

  const [timeValue, setTimeValue] = useState(0);

  const [mappingData, setMappingData] = useState({ data: "", mappingArr: [] });

  const [subCategoriesKey, setSubCategoriesKey] = useState([]);

  const [xlsxFile, setXlsxFile] = useState(null);
  const [isXlsxFile, setIsXlsxFile] = useState(false);

  const [commonCategoryFields, setCommonCategoryFields] = useState([]);
  const [isConnectCategoryModalOpen, setIsConnectCategoryModalOpen] =
    useState(false);
  const [categories, setCategories] = useState([]);

  const [commonPropertyFields, setCommonPropertyFields] = useState([]);
  const [isConnectPropertyModalOpen, setIsConnectPropertyModalOpen] =
    useState(false);
  const [dbFields, setDbFields] = useState({
    brands: [],
    units: [],
    currencies: [],
    shippingCompanies: [],
  });
  const [isConnectPropFieldModalOpen, setIsConnectPropFieldModalOpen] =
    useState(false);

  const [connectedPropertyData, setConnectedPropertyData] = useState({});

  const [isPropertyReviewModalOpen, setIsPropertyReviewModalOpen] =
    useState(false);
  const [propertyReviewData, setPropertyReviewData] = useState([]);

  const { request, response } = useRequest();

  const { request: requestImportProd, response: responseImportProd } =
    useRequest();

  const { request: requestImportStatus, response: responseImportStatus } =
    useRequest(true);

  const {
    request: requestCategoryConnectData,
    response: responseCategoryConnectData,
  } = useRequest();

  const { request: requestConnectData, response: responseConnectData } =
    useRequest();

  // useEffect(() => {
  //   if (timeValue <= 99) {
  //     const timer = setTimeout(() => {
  //       setTimeValue(timeValue + 10);
  //     }, 1000);
  //     return () => clearTimeout(timer);
  //   }
  // }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    setValue,
    unregister,
    watch,
    getValues,
    control,
    setError,
    reset,
  } = useForm();

  const {
    handleSubmit: handleSubmitConnectCategories,
    formState: { errors: errorsConnectCategories },
    control: controlConnectCategories,
    // reset: resetConnectCategories,
  } = useForm();

  const {
    register: registerConnectProperties,
    handleSubmit: handleSubmitConnectProperties,
    formState: { errors: errorsConnectProperties },
    control: controlConnectProperties,
    // reset: resetConnectProperties,
  } = useForm();

  const {
    register: registerReviewProperties,
    handleSubmit: handleSubmitReviewProperties,
    // reset: resetReviewProperties,
  } = useForm();

  useEffect(() => {
    if (response) {
      reset({});
      setFileName(response.fileName);
      const product = response.product;

      if (Object.keys(product).length === 0) {
        toast.error("Invalid file.");
        setModalStage(1);
        setIsImportProductModalOpen(true);
        return;
      }

      setIsXlsxFile(response.isXlsx ?? false);

      setContainers(response.containers);

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

      setIsProductDataModalOpen(true);
      setProductsData(products);
    }
  }, [response]);

  useEffect(() => {
    if (responseImportProd) {
      if (!responseImportProd.status) {
        toast.error("Failed to import products.");
        downloadExcel(responseImportProd.products, "Product Import");
      } else {
        toast.success("Products import started successfully.");

        setTimeValue(
          Math.floor(
            (responseImportProd.current / responseImportProd.total) * 100
          )
        );

        setIsProgressBarModalOpen(true);

        setTimeout(() => {
          requestImportStatus("POST", "product/import-products-status", {
            fileName,
          });
        }, 1000);
      }
    }
  }, [responseImportProd]);

  useEffect(() => {
    if (responseImportStatus) {
      if (responseImportStatus.importStatus) {
        setTimeValue(
          Math.floor(
            (responseImportStatus.importStatus.current /
              responseImportStatus.importStatus.total) *
              100
          )
        );

        if (
          responseImportStatus.importStatus.current !==
          responseImportStatus.importStatus.total
        ) {
          setTimeout(() => {
            requestImportStatus("POST", "product/import-products-status", {
              fileName,
            });
          }, 1000);
        } else {
          toast.success("Upload completed successfully.");
          setIsProgressBarModalOpen(false);
          setTimeValue(0);
          window.location.reload();
        }
      }
    }
  }, [responseImportStatus]);

  useEffect(() => {
    if (responseCategoryConnectData) {
      setCategories(responseCategoryConnectData.categories);
      setCommonCategoryFields(responseCategoryConnectData.commonFields);
      setIsConnectCategoryModalOpen(true);
    }
  }, [responseCategoryConnectData]);

  useEffect(() => {
    if (responseConnectData) {
      setCommonPropertyFields(responseConnectData.commonFields);
      setIsConnectCategoryModalOpen(false);
      setIsConnectPropertyModalOpen(true);
      setDbFields(responseConnectData.dbFields);

      responseConnectData.commonFields.forEach((field) => {
        field.values.forEach((value, index) => {
          registerConnectProperties(`connect_${field.key}_${index}`, {
            required: true,
          });
        });
      });
    }
  }, [responseConnectData]);

  const importStageHandler = (e) => {
    e.preventDefault();

    if (modalStage === 1) {
      // if (!selectedVendor) {
      //   toast.error("Please select vendor.");
      //   return;
      // }

      if (!xlsxFile) {
        toast.error("Please upload file.");
        return;
      } else if (
        xlsxFile.type !==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        toast.error("Please upload valid xlsx file.");
        return;
      }

      setModalStage((prev) => prev + 1);
      setIsImportProductModalOpen(false);

      const formData = new FormData();
      formData.append("file", xlsxFile);

      request("POST", "product/import-xlsx", formData);
    } else if (modalStage === 2) {
      if (!fileLink) {
        toast.error("Please provide file link.");
        return;
      }

      if (!isValidUrl(fileLink)) {
        toast.error("Please provide valid file link.");
        return;
      }

      if (container.trim().length === 0) {
        toast.error("Please provide container name.");
        return;
      }

      setModalStage((prev) => prev + 1);
      setIsImportProductModalOpen(false);

      request("POST", "product/import-file", {
        fileLink,
        container,
      });
    } else if (modalStage === 3) {
      if (isAutoSync) {
        if (!syncTime) {
          toast.error("Please select sync time.");
          return;
        }

        if (selectedSyncFields.length === 0) {
          toast.error("Please select fields you want to sync.");
          return;
        }

        // if (!uniqueField) {
        //   toast.error("Please select unique identifier.");
        //   return;
        // }
      }
      setIsImportProductModalOpen(false);

      linkingHelper({});
    }
  };

  // const importFileHandler = (e) => {
  //   e.preventDefault();
  // };

  const deleteHandler = (id, key) => {
    setProductsData((prev) => prev.filter((p) => p.index !== id));
    unregister(key);

    if (subCategoriesKey.includes(key)) {
      setSubCategoriesKey((prev) => prev.filter((p) => p !== key));

      unregister(`subCategoryId.${key}`);
    }
  };

  const productDataHeaderHandler = (data) => {
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
      if (objForOne[key].length > 1 && key !== "subCategoryId") {
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

        if (
          ![
            "masterCategoryId",
            "subCategoryId",
            "barCode",
            "brandId",
            "unitId",
            "buyingPriceCurrency",
            "alternateProducts",
            "slug",
            "slug_ar",
            "slug_tr",
          ].includes(data[key]?.value)
        ) {
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

    setIsProductDataModalOpen(false);

    const commonLinkFields = {};

    if (true) {
      //"shippingCompany"
      ["brandId", "buyingPriceCurrency", "unitId"].forEach((field) => {
        if (objForOne[field]) {
          commonLinkFields[field] = objForOne[field][0];
        }
      });
    }

    let mappingDataToAdd = {
      data: filteredData,
      mappingArr,
      commonLinkFields,
    };

    if (!isXlsxFile) {
      // setIsImportProductModalOpen(true);
      // setMappingData();
      setModalStage(3);
    } else {
      // requestImportProd("POST", "product/import-products", {
      //   fileName,
      //   mappedObj: filteredData,
      //   containers,
      //   subCategoriesKey,
      //   isXlsxFile,
      //   isAutoSync,
      //   syncTime,
      //   selectedSyncFields: selectedSyncFields.map((obj) => obj.value),
      //   fileLink,
      // });
    }

    //connecting categories
    if (true) {
      let masterCategoryIdLinkBy = objForOne["masterCategoryId"][0];
      let subCategoryIdLinkBy = [];

      if (keysTaken.includes("subCategoryId")) {
        for (let key in filteredData["subCategoryId"]) {
          subCategoryIdLinkBy[filteredData["subCategoryId"][key].value] = key;
        }
      }

      const fields = [masterCategoryIdLinkBy, ...subCategoryIdLinkBy];

      mappingDataToAdd.categoriesLinkedFields = fields;

      setMappingData(mappingDataToAdd);

      requestCategoryConnectData(
        "POST",
        "product/import-category-common-data",
        {
          fields,
          fileName,
          containers,
          isXlsxFile,
        }
      );
    }
  };

  const resetStates = () => {
    setModalStage(0);

    setSelectedVendor("");

    setFileLink("");
    setContainer("");

    setIsAutoSync(false);
    setSelectedSyncFields([]);
    setSyncTime("");
    // setUniqueField("");
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

  const connectCategoryHandler = (data) => {
    setMappingData((prev) => ({ ...prev, categoriesLinkedData: data }));

    requestConnectData("POST", "product/import-common-data", {
      fields: mappingData.commonLinkFields,
      fileName,
      containers,
      isXlsxFile,
    });
  };

  const connectPropertyHandler = (data) => {
    for (let key in data) {
      if (!data[key]) {
        connectPropertyHandlerError({ [key]: true });
        return;
      }
    }

    const toBeReview = [];

    for (let key in data) {
      if (data[key].value === "other") {
        const index = key.split("_")[2];
        const obj = { registerKey: key, index };

        let item, value;

        if (/brandId/.test(key)) {
          item = commonPropertyFields.find((f) => f.key === "brandId");
        } else if (/buyingPriceCurrency/.test(key)) {
          item = commonPropertyFields.find(
            (f) => f.key === "buyingPriceCurrency"
          );
        } else if (/unitId/.test(key)) {
          item = commonPropertyFields.find((f) => f.key === "unitId");
        }
        // else if (/shippingCompany/.test(key)) {
        //   item = commonPropertyFields.find((f) => f.key === "shippingCompany");
        // }

        value = item.values[index];

        obj.value = value;
        obj.key = item.key;
        obj.xmlKey = item.xmlKey;
        obj.label = item.label;

        toBeReview.push(obj);
      }
    }

    setMappingData((prev) => ({
      ...prev,
      toBeReview,
      propertiesLinkedData: data,
    }));

    setIsConnectPropertyModalOpen(false);

    if (toBeReview.length > 0) {
      setIsPropertyReviewModalOpen(true);
      setPropertyReviewData(toBeReview);
      return;
    }

    if (!isXlsxFile) {
      setIsImportProductModalOpen(true);
    } else {
      linkingHelper({ propertiesLinkedData: data });
    }
  };

  const openConnectPropertyFieldHandler = (index) => {
    let dbData;
    const data = commonPropertyFields[index];
    switch (data.key) {
      case "brandId":
        dbData = dbFields["brands"];
        break;
      case "buyingPriceCurrency":
        dbData = dbFields["currencies"];
        break;
      case "unitId":
        dbData = dbFields["units"];
        break;
      // case "shippingCompany":
      //   dbData = dbFields["shippingCompanies"];
      //   break;
      default:
    }

    data.dbData = dbData;

    setConnectedPropertyData(data);
    setIsConnectPropFieldModalOpen(true);
  };

  const connectPropertyHandlerError = (errors) => {
    // const firstKey = Object.keys(errors)[0]

    let firstKey;
    for (let key in errors) {
      firstKey = key;
      break;
    }

    let index = -1;

    //can use array instead of if-else
    if (/brandId/.test(firstKey)) {
      index = commonPropertyFields.findIndex((f) => f.key === "brandId");
    } else if (/buyingPriceCurrency/.test(firstKey)) {
      index = commonPropertyFields.findIndex(
        (f) => f.key === "buyingPriceCurrency"
      );
    } else if (/unitId/.test(firstKey)) {
      index = commonPropertyFields.findIndex((f) => f.key === "unitId");
    }
    // else if (/shippingCompany/.test(firstKey)) {
    //   index = commonPropertyFields.findIndex(
    //     (f) => f.key === "shippingCompany"
    //   );
    // }

    if (index !== -1) {
      openConnectPropertyFieldHandler(index);
    }
  };

  const reviewPropertyModalHandler = (data) => {
    setMappingData((prev) => ({
      ...prev,
      reviewData: data,
    }));
    setIsPropertyReviewModalOpen(false);
    setIsImportProductModalOpen(true);
  };

  const linkingHelper = ({ propertiesLinkedData }) => {
    const categoriesLinking = {};

    //categories linking
    if (true) {
      commonCategoryFields.forEach((field, idx) => {
        const item =
          mappingData.categoriesLinkedData[`connect_category_${idx}`];
        categoriesLinking[field] = item.value;
      });
    }

    const propertiesLinking = [];

    if (!propertiesLinkedData) {
      propertiesLinkedData = mappingData.propertiesLinkedData;
    }

    //common linking
    if (true) {
      commonPropertyFields.forEach((common) => {
        const { key, xmlKey, values } = common;

        const propertyLinking = { key, xmlKey, values: {} };

        values.forEach((value, index) => {
          const item = propertiesLinkedData[`connect_${key}_${index}`];

          if (item.value === "other") {
            item.value = mappingData.reviewData[`${key}_${index}`]
              ? "add"
              : "delete";
          }

          propertyLinking.values[value] = item.value;
        });

        propertiesLinking.push(propertyLinking);
      });
    }

    requestImportProd("POST", "product/import-products", {
      fileName,
      mappedObj: mappingData.data,
      // vendor: selectedVendor.value,
      containers,
      subCategoriesKey,
      isXlsxFile,
      isAutoSync,
      syncTime,
      selectedSyncFields: selectedSyncFields.map((obj) => obj.value),
      fileLink,
      linkingData: {
        categoriesLinkedFields: mappingData.categoriesLinkedFields.slice(1),
        categoriesLinking,

        commonLinkFields: mappingData.commonLinkFields,
        propertiesLinking,
      },
    });
  };

  return (
    <>
      <button
        onClick={() => {
          setIsImportProductModalOpen(true);
          resetStates();
        }}
        className="btn btn-primary mr-2"
      >
        Import
      </button>

      <Modal
        isOpen={isImportProductModalOpen}
        onRequestClose={() => setIsImportProductModalOpen(false)}
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
              onClick={() => setIsImportProductModalOpen(false)}
            >
              <i aria-hidden="true" class="ki ki-close"></i>
            </button>
          </div>
          <div className="modal-body">
            <div className="full-xl-6">
              {false && modalStage === 1 && (
                <div class="form-group">
                  <label>Vendor</label>
                  <form>
                    <div className="position-relative">
                      <Select
                        required
                        onChange={(val) => {
                          setSelectedVendor(val);
                        }}
                        options={allVendors.map((v) => ({
                          label: v.businessName,
                          value: v._id,
                        }))}
                        value={selectedVendor}
                        className="form-select- form-control- dark-form-control"
                      />
                    </div>
                  </form>
                </div>
              )}
              {modalStage === 0 && (
                <div class="form-group d-flex gap2">
                  <button
                    className="btn btn-primary w-50"
                    onClick={() => {
                      setModalStage(2);
                    }}
                    type="submit"
                  >
                    Import From XML Link
                  </button>
                  <button
                    className="btn btn-primary w-50"
                    onClick={() => {
                      setModalStage(1);
                    }}
                    type="submit"
                  >
                    Import From Xlsx File
                  </button>
                </div>
              )}
              {modalStage === 1 && (
                <div class="form-group">
                  <label>Upload File</label>
                  <div className="position-relative">
                    <input
                      type="file"
                      class="form-control form-control-solid form-control-lg undefined"
                      name="file"
                      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={(e) => {
                        setXlsxFile(e.target.files[0]);
                      }}
                    ></input>
                  </div>
                  <div className="input-group">
                    <p>
                      <a target="__blank" href="/document.xlsx">
                        Sample File
                      </a>
                    </p>
                  </div>
                </div>
              )}
              {modalStage === 2 && (
                <div class="form-group">
                  <label>Enter Link</label>
                  <div className="position-relative">
                    <input
                      type="url"
                      class="form-control form-control-solid form-control-lg undefined"
                      name="file"
                      placeholder="Enter link"
                      onChange={(e) => setFileLink(e.target.value)}
                      value={fileLink}
                    ></input>
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
                      onChange={(e) => setContainer(e.target.value)}
                      value={container}
                    ></input>
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
              )}
              {modalStage === 3 && (
                <div class="form-group">
                  <div className="ProVariantList">
                    <label class="checkbox checkbox-square">
                      <input
                        type="checkbox"
                        style={{ height: "20px" }}
                        checked={isAutoSync}
                        onChange={(e) => setIsAutoSync(e.target.checked)}
                      ></input>
                      <span></span>
                      Want to auto sync?
                    </label>
                  </div>
                  {isAutoSync && (
                    <>
                      <label className="mt-2">Sync Time</label>
                      <div className="position-relative">
                        <select
                          onChange={(e) => setSyncTime(e.target.value)}
                          value={syncTime}
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
                            setSelectedSyncFields(val);
                          }}
                          options={mappingData.mappingArr}
                          value={selectedSyncFields}
                          className="form-select- form-control- dark-form-control"
                          isMulti
                        />
                      </div>

                      {/* <label className="mt-2">Unique Identifier</label>
                      <div className="position-relative">
                        <Select
                          required
                          onChange={(val) => {
                            setUniqueField(val);
                          }}
                          options={mappingData.mappingArr}
                          value={uniqueField}
                          className="form-select- form-control- dark-form-control"
                        />
                      </div> */}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          {modalStage !== 0 && (
            <div class="modal-footer">
              <button
                className="btn btn-primary w-50"
                onClick={importStageHandler}
                type="submit"
              >
                {modalStage === 3 ? "Import" : "Next"}
              </button>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={isProductDataModalOpen}
        // isOpen={true}
        onRequestClose={() => setIsProductDataModalOpen(false)}
        shouldCloseOnOverlayClick={false}
        ariaHideApp={false}
        className="react_modal_custom small_popup react_Custom_modal modal-xl"
      >
        <div class="modal-content" style={{ height: "90vh" }}>
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              Import
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={() => setIsProductDataModalOpen(false)}
            >
              <i aria-hidden="true" class="ki ki-close"></i>
            </button>
          </div>
          <div
            className="modal-body"
            style={{ height: "80vh", overflow: "scroll" }}
          >
            <form onSubmit={handleSubmit(productDataHeaderHandler)}>
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
              onClick={handleSubmit(productDataHeaderHandler)}
              className="btn btn-primary w-50"
              type="submit"
            >
              {isXlsxFile ? "Import" : "Next"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isConnectCategoryModalOpen}
        onRequestClose={() => setIsConnectCategoryModalOpen(false)}
        shouldCloseOnOverlayClick={false}
        ariaHideApp={false}
        className="react_modal_custom small_popup react_Custom_modal modal-xl"
      >
        <div class="modal-content" style={{ height: "90vh" }}>
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              Connect Categories
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={() => setIsConnectCategoryModalOpen(false)}
            >
              <i aria-hidden="true" class="ki ki-close"></i>
            </button>
          </div>
          <div
            className="modal-body"
            style={{ height: "80vh", overflow: "scroll" }}
          >
            <form
              onSubmit={handleSubmitConnectCategories(connectCategoryHandler)}
            >
              <div className="card-body p-0">
                <div className="table-responsive">
                  {/*begin::Table*/}
                  <table
                    className="table table-bordered table-sm1"
                    id="itemtable"
                  >
                    <thead>
                      <tr className="border-bottom font-size-h7 font-weight-bolder text-gray-700 text-uppercase">
                        <th style={{ maxWidth: 250 }}>XML Category</th>
                        <th style1="max-width:250px;">Connect with</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commonCategoryFields.map((data, index) => (
                        <tr key={index}>
                          <td style={{ maxWidth: 250 }}>{data}</td>
                          <td>
                            <div
                              className="input-group"
                              style={{
                                flexWrap: "nowrap",
                                columnGap: "10px",
                              }}
                            >
                              <Controller
                                className="form-control form-control-solid form-control-lg mb-10 col-4 w-50"
                                control={controlConnectCategories}
                                name={`connect_category_${index}`}
                                rules={{
                                  required: "This field is required.",
                                }}
                                render={({
                                  field: { onChange, value, ref },
                                }) => {
                                  return (
                                    <Select
                                      onChange={(val) => {
                                        onChange(val);
                                      }}
                                      options={categories}
                                      value={value}
                                      className="form-select- form-control- dark-form-control libSelect w-50"
                                    />
                                  );
                                }}
                              />
                            </div>
                            {errorsConnectCategories[
                              `connect_category_${index}`
                            ] && (
                              <div className="invalid-feedback">
                                {
                                  errorsConnectCategories[
                                    `connect_category_${index}`
                                  ].message
                                }
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
              onClick={handleSubmitConnectCategories(connectCategoryHandler)}
              className="btn btn-primary w-50"
              type="submit"
            >
              NEXT
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isConnectPropertyModalOpen}
        onRequestClose={() => setIsConnectPropertyModalOpen(false)}
        shouldCloseOnOverlayClick={false}
        ariaHideApp={false}
        className="react_modal_custom small_popup react_Custom_modal modal-xl"
      >
        <div class="modal-content" style={{ height: "90vh" }}>
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              Connect Properties
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={() => setIsConnectPropertyModalOpen(false)}
            >
              <i aria-hidden="true" class="ki ki-close"></i>
            </button>
          </div>
          <div
            className="modal-body"
            style={{ height: "80vh", overflow: "scroll" }}
          >
            <form
              onSubmit={handleSubmitConnectProperties(
                connectPropertyHandler,
                connectPropertyHandlerError
              )}
            >
              <div className="card-body p-0">
                <div className="table-responsive">
                  {/*begin::Table*/}
                  <table
                    className="table table-bordered table-sm1"
                    id="itemtable"
                  >
                    <thead>
                      <tr className="border-bottom font-size-h7 font-weight-bolder text-gray-700 text-uppercase">
                        <th style={{ maxWidth: 250 }}>Property</th>
                        <th style1="max-width:250px;">Connected with</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commonPropertyFields.map((data, index) => (
                        <tr key={index}>
                          <td style={{ maxWidth: 250 }}>{data.label}</td>
                          <td style={{ maxWidth: 250 }}>
                            <div>
                              {data.xmlKey}
                              <span
                                onClick={() =>
                                  openConnectPropertyFieldHandler(index)
                                }
                              >
                                @
                              </span>
                            </div>
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
              onClick={handleSubmitConnectProperties(
                connectPropertyHandler,
                connectPropertyHandlerError
              )}
              className="btn btn-primary w-50"
              type="submit"
            >
              NEXT
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isConnectPropFieldModalOpen}
        onRequestClose={() => setIsConnectPropFieldModalOpen(false)}
        shouldCloseOnOverlayClick={false}
        ariaHideApp={false}
        className="react_modal_custom small_popup react_Custom_modal"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              Connect Property Field
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={() => setIsConnectPropFieldModalOpen(false)}
            >
              <i aria-hidden="true" class="ki ki-close"></i>
            </button>
          </div>
          <div className="modal-body">
            <div className="full-xl-6">
              <div className="card-body p-0">
                <div className="table-responsive">
                  {/*begin::Table*/}
                  <table
                    className="table table-bordered table-sm1"
                    id="itemtable"
                  >
                    <thead>
                      <tr className="border-bottom font-size-h7 font-weight-bolder text-gray-700 text-uppercase">
                        <th style={{ maxWidth: 250 }}>Property</th>
                        <th style1="max-width:250px;">Connect with</th>
                      </tr>
                    </thead>
                    <tbody>
                      {connectedPropertyData.values?.map((value, index) => (
                        <tr key={value}>
                          <td style={{ maxWidth: 250 }}>{value}</td>
                          <td>
                            <div
                              className="input-group"
                              style={{ flexWrap: "nowrap", columnGap: "10px" }}
                            >
                              <Controller
                                className="form-control form-control-solid form-control-lg mb-10 col-4 w-50"
                                control={controlConnectProperties}
                                name={`connect_${connectedPropertyData.key}_${index}`}
                                rules={{ required: "This field is required." }}
                                render={({
                                  field: { onChange, value, ref },
                                }) => {
                                  return (
                                    <Select
                                      onChange={(val) => {
                                        onChange(val);
                                      }}
                                      options={connectedPropertyData.dbData}
                                      value={value}
                                      className="form-select- form-control- dark-form-control libSelect w-50"
                                    />
                                  );
                                }}
                              />
                            </div>
                            {errorsConnectProperties[
                              `connect_${connectedPropertyData.key}_${index}`
                            ] && (
                              <div className="invalid-feedback">
                                {
                                  errorsConnectProperties[
                                    `connect_${connectedPropertyData.key}_${index}`
                                  ].message
                                }
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              className="btn btn-primary w-50"
              onClick={() => setIsConnectPropFieldModalOpen(false)}
              type="submit"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isPropertyReviewModalOpen}
        onRequestClose={() => setIsPropertyReviewModalOpen(false)}
        shouldCloseOnOverlayClick={false}
        ariaHideApp={false}
        className="react_modal_custom small_popup react_Custom_modal modal-xl"
      >
        <div class="modal-content" style={{ height: "90vh" }}>
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              Review Properties
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={() => setIsPropertyReviewModalOpen(false)}
            >
              <i aria-hidden="true" class="ki ki-close"></i>
            </button>
          </div>
          <div
            className="modal-body"
            style={{ height: "80vh", overflow: "scroll" }}
          >
            <form
              onSubmit={handleSubmitReviewProperties(
                reviewPropertyModalHandler
              )}
            >
              <div className="card-body p-0">
                <div className="table-responsive">
                  {/*begin::Table*/}
                  <table
                    className="table table-bordered table-sm1"
                    id="itemtable"
                  >
                    <thead>
                      <tr className="border-bottom font-size-h7 font-weight-bolder text-gray-700 text-uppercase">
                        <th style={{ maxWidth: 250 }}>Property</th>
                        <th style1="max-width:250px;">Value</th>
                        <th style1="max-width:250px;">To Add</th>
                      </tr>
                    </thead>
                    <tbody>
                      {propertyReviewData.map((data, index) => (
                        <tr key={index}>
                          <td style={{ maxWidth: 250 }}>{data.label}</td>
                          <td style={{ maxWidth: 250 }}>{data.value}</td>
                          <td>
                            <div className="ProVariantList">
                              <label class="checkbox checkbox-square">
                                <input
                                  type="checkbox"
                                  style={{ height: "20px" }}
                                  {...registerReviewProperties(
                                    `${data.key}_${data.index}`
                                  )}
                                ></input>
                                <span></span>
                              </label>
                            </div>
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
              onClick={handleSubmitReviewProperties(reviewPropertyModalHandler)}
              className="btn btn-primary w-50"
              type="submit"
            >
              NEXT
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isProgressBarModalOpen}
        onRequestClose={() => setIsProgressBarModalOpen(false)}
        shouldCloseOnOverlayClick={false}
        ariaHideApp={false}
        className="react_modal_custom small_popup react_Custom_modal modal-lg"
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
                style={{ width: `${timeValue}%` }}
                aria-valuenow="25"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                {timeValue}%
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ImportProduct;
