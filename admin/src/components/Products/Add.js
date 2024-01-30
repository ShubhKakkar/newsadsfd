/* eslint-disable no-loop-func */
/* eslint-disable no-lone-blocks */
import React, { useEffect, useState, Fragment, useRef } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "react-modal";
import { useDropzone } from "react-dropzone";
import { useSelector } from "react-redux";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import {
  Input,
  Textarea,
  ReactSelectInput,
  SelectInput,
  RenderInputFields,
  SubmitButton,
  MutliInput,
  CKEditorInput,
  SubTab as SubTabForm,
  SubInput as SubInputForm,
} from "../Form/Form";

const VIDEO = [
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-ms-wmv",
  "video/webm",
];

const tablePlaceholderObj = {
  _third: "Price",
  _fourth: "Discounted Price",
  _fifth: "Quantity",
  _sixth: "Height",
  _seventh: "Weight",
  _eighth: "Width",
  _nine: "Length",
};

const MediaPreview = ({
  media,
  deleteMedia,
  id,
  showFeatured = false,
  makeFeatured = () => {},
  featuredMediaId,
}) => {
  return (
    <div className="col-2 px-2 px-md-3 col-md-2">
      <div className="meCard" style={{ position: "relative" }}>
        <a href="javascript:void(0);">
          {showFeatured && featuredMediaId === id && (
            <span className="CoverImgTag">Cover Image</span>
          )}
          {!media.isVideo ? (
            <img src={media.media} alt="" />
          ) : (
            <video controls muted>
              <source src={media.media} type="video/mp4" />
            </video>
          )}
        </a>
        <div
          class="dropdown dropdownActionBtn"
          style={{ position: "absolute", top: "0px", right: "0px", zIndex: 10 }}
        >
          <button
            class="btn btn-lg dropdown-toggle_"
            type="button"
            id="dropdownMenuButton"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="22px"
              viewBox="0 0 128 512"
              fill="#333"
            >
              <path d="M64 360a56 56 0 1 0 0 112 56 56 0 1 0 0-112zm0-160a56 56 0 1 0 0 112 56 56 0 1 0 0-112zM120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0z" />
            </svg>
          </button>
          <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
            {showFeatured && featuredMediaId !== id && !media.isVideo && (
              <a
                class="dropdown-item"
                href="javascript:void(0);"
                onClick={() => makeFeatured(id)}
              >
                Make Cover Image
              </a>
            )}
            <a
              class="dropdown-item"
              href="javascript:void(0);"
              onClick={() => deleteMedia(id)}
            >
              Remove
            </a>
          </div>
        </div>
        {/* <button
          className="btn btn-bg-danger ml-2"
         
        >
          Remove
        </button> */}
      </div>
    </div>
  );
};

const MediaSelectPreview = ({ media, updateMedia }) => {
  // const [isSelected, setIsSelected] = useState(media.isSelected);

  const setPostToArr = () => {
    if (media.isSelected) {
      // setIsSelected(false);
      updateMedia(media.id, "remove");
    } else {
      // setIsSelected(true);
      updateMedia(media.id, "add");
    }
  };

  return (
    <div onClick={setPostToArr} className="col-2 px-2 px-md-3 col-md-2">
      <div className="meCard">
        <a
          href="javascript:void(0);"
          className={`${media.isSelected ? "active" : ""}`}
        >
          {!media.isVideo ? (
            <img src={media.media} alt="" />
          ) : (
            <video controls muted>
              <source src={media.media} type="video/mp4" />
            </video>
          )}
        </a>
      </div>
    </div>
  );
};

const Add = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    setError,
    unregister,
    watch,
    getValues,
    trigger,
    clearErrors,
  } = useForm();

  const {
    register: registerAddVariant,
    handleSubmit: handleSubmitAddVariant,
    formState: { errors: errorsAddVariant },
    setValue: setValueAddVariant,
    reset: resetAddVariant,
    clearErrors: clearErrorsAddVariant,
  } = useForm();

  const { response, request } = useRequest();
  const { request: requestAddData, response: responseAddData } = useRequest();
  const { response: responseVariant, request: requestVariant } = useRequest();
  const { response: responseFeatures, request: requestFeatures } = useRequest();
  const { response: responseTaxes, request: requestTaxes } = useRequest();

  const [allVendors, setAllVendors] = useState([]); //vendors list
  const [mainCategories, setMainCategories] = useState([]); //vendor's main categories
  const [subCategories, setSubCategories] = useState([]); //sub categories of main category
  const [warehouses, setWarehouses] = useState([]); //vendor's warehouses
  const [brands, setBrands] = useState([]); //all brands
  const [allVendorsSimple, setAllVendorsSimple] = useState([]);
  const [variants, setVariants] = useState([]); //variants based on sub categories
  const [mainCategoriesSimple, setMainCategoriesSimple] = useState([]);
  const [countries, setCountries] = useState([]); //vendor's countries
  const [units, setUnits] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);

  // const [firstVariants, setFirstVariants] = useState([]);
  // const [secondVariants, setSecondVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState({
    variant1: null,
    variant2: null,
  });

  const [selectedWarehouses, setSelectedWarehouses] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState([]);

  const [features, setFeatures] = useState([{ id: 0 }]);
  const [nextId, setNextId] = useState(1);

  const [isMediaLibraryModalOpen, setIsMediaLibraryModalOpen] = useState(false); //overall media modal (Not using)
  const [mediaFiles, setMediaFiles] = useState([]); //media in binary
  const [previewMediaFiles, setPreviewMediaFiles] = useState([]);
  const [mediaNextId, setMediaNextId] = useState(1);

  const [selectedMedia, setSelectedMedia] = useState({
    main: [],
  });

  const [selectedMediaKey, setSelectedMediaKey] = useState(""); //what selectedMedia to open (Not using)

  const [featuredMediaId, setFeaturedMediaId] = useState(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false); //main media modal (Not using)
  const [variantCount, setVariantCount] = useState(null); //total sub variants selected
  const [variantTh, setVariantTh] = useState([]); //heading of variant's table
  // const [variantObj, setVariantObj] = useState({}); //for delete

  const [isVariantModalOpen, setIsVaraintModalOpen] = useState(false); //variant customization modal
  const [masterVariant, setMasterVariant] = useState(null); //subcategories' master variant
  const [variantSelectionCount, setVariantSelectionCount] = useState(0); //number of variant selected
  const [subVariants, setSubVariants] = useState([]); //selected sub variants

  const [isAddVariantModalOpen, setIsAddVariantModalOpen] = useState(false); //add modal state
  const [subVariantsAdd, setSubVariantsAdd] = useState([]); //sub variants to add (variantId, subCategoryId, name, languagesData)
  const [searchValue, setSearchValue] = useState("");

  const [taxesToShow, setTaxesToShow] = useState([]);

  const [isSimilarProductsModalOpen, setIsSimilarProductsModalOpen] =
    useState(false);

  const history = useHistory();

  const { languages } = useSelector((state) => state.setting);

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*,video/*",
    onDrop: (acceptedFiles) => {
      mediaViewHandler(acceptedFiles);
      // setUploadFiles(acceptedFiles);
      // setPreviewFiles(
      //   acceptedFiles.map((file) =>
      //     Object.assign(file, {
      //       preview: URL.createObjectURL(file),
      //     })
      //   )
      // );
    },
  });

  useEffect(() => {
    document.title = "Add Product - Noonmar";
    requestAddData("GET", "product/add-data");
    register("subVariant");

    // const showAllVariants = () => {
    //   setVariants((prev) => [...prev].map((v) => ({ ...v, show: true })));
    // };

    // document
    //   .getElementById("searchbox")
    //   .addEventListener("search", showAllVariants);

    // return () => {
    //   document
    //     .getElementById("searchbox")
    //     .removeEventListener("search", showAllVariants);
    // };
  }, []);

  useEffect(() => {
    if (responseAddData) {
      const { vendors, brands, customId, units, similarProducts } =
        responseAddData;
      // console.log(responseAddData);
      setAllVendorsSimple(
        vendors.map((item) => {
          return { value: item._id, label: item.businessName };
        })
      );
      setAllVendors(vendors);
      setSimilarProducts(similarProducts);
      setBrands(
        brands.map((item) => {
          return { value: item._id, label: item.name };
        })
      );
      setUnits(
        units.map((item) => {
          return { value: item._id, label: item.name };
        })
      );
      setValue("customId", customId);
    }
  }, [responseAddData]);

  useEffect(() => {
    if (responseVariant) {
      const variants = responseVariant.variants;
      // setFirstVariants(variants);
      // setSecondVariants(variants);
      setVariants(
        variants
          .map((v) => ({
            ...v,
            show: true,
            isChecked: masterVariant === v._id,
            subVariants: v.subVariants.map((sv) => ({
              ...sv,
              isChecked: masterVariant === v._id,
              isAdded: false,
            })),
          }))
          .sort((a, b) => b.isChecked - a.isChecked)
      );

      setVariantSelectionCount(variants.length > 0 ? 1 : 0);
    }
  }, [responseVariant]);

  useEffect(() => {
    if (response) {
      toast.success("Product has been added successfully.");
      history.push("/products");
    }
  }, [response]);

  useEffect(() => {
    if (responseTaxes) {
      const taxes = responseTaxes.taxes;
      setTaxes(taxes);

      taxHTMLHandler(selectedCountries, taxes, true);
    }
  }, [responseTaxes]);

  useEffect(() => {
    if (responseFeatures) {
      const { features } = responseFeatures;

      if (features.length > 0) {
        const newFeatures = Array(features[0].featuresLength)
          .fill(0)
          .map((_, idx) => ({ id: idx }));

        setFeatures(newFeatures);

        features.forEach((f, index) => {
          f.features.forEach((ff, idx) => {
            setValue("featureLabel" + idx + "-" + f.languageCode, ff);
          });
        });
      }
    }
  }, [responseFeatures]);

  const onSubmit = (data) => {
    // if (!featuredMediaId) {
    //   return;
    // }

    //manage subvariant error also

    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("masterCategoryId", data.masterCategoryId);
    formData.append("subCategoryId", data.subCategoryId);
    formData.append("brandId", data.brandId);
    formData.append("warehouses", JSON.stringify(data.warehouses));
    formData.append("price", data.price);
    formData.append("discountedPrice", data.discountedPrice);
    formData.append("quantity", data.quantity);
    formData.append("featureTitle", data.featureTitle);

    let taxesData = [];

    for (let i = 0; i < taxes.length; i++) {
      const tax = taxes[i];
      if (data.countries.includes(tax._id)) {
        tax.taxes.forEach((t) => {
          taxesData.push({
            countryId: tax._id,
            tax: t.id,
            isSelected: data[`tax-${tax._id}-${t.id}`],
          });
        });
      }
    }

    taxesData.filter((tax) => tax.isSelected);

    formData.append("taxesData", JSON.stringify(taxesData));

    const featuresArr = [];

    for (let i = 0; i < features.length; i++) {
      const id = features[i].id;
      featuresArr.push({
        label: data[`featurelabel${id}`],
        value: data[`featureValue${id}`],
      });
    }

    if (data.ogImage) {
      formData.append("ogImage", data.ogImage[0]);
    }

    formData.append("features", JSON.stringify(featuresArr));

    formData.append("description", data.description);
    formData.append("isPublished", data.isPublished);

    const selectedMediaCustomObj = {};
    const selectedMediaCustomObjTwo = {};

    {
      //media
      let mediaIds = new Set();

      for (let key in selectedMedia) {
        selectedMediaCustomObj[key] = [];
        selectedMediaCustomObjTwo[key] = [];
        selectedMedia[key].forEach((media) => {
          if (media.isSelected) {
            mediaIds.add(media.id);
            selectedMediaCustomObj[key].push(media.id);
          }
        });
      }

      mediaIds = [...mediaIds];

      for (let i = 0; i < mediaIds.length; i++) {
        const media = mediaFiles.find((m) => m.id === mediaIds[i]);

        for (let key in selectedMediaCustomObj) {
          if (selectedMediaCustomObj[key].includes(media.id)) {
            selectedMediaCustomObjTwo[key] =
              selectedMediaCustomObjTwo[key].concat(i);
          }
        }

        if (featuredMediaId === media.id) {
          formData.append("featuredMediaId", i);
        }

        formData.append("media", media.file);
      }
    }

    formData.append("metaData", JSON.stringify(data.metaData));
    formData.append("vendor", data.vendor);
    formData.append("mediaIds", JSON.stringify(selectedMediaCustomObjTwo));

    const vArr = [];

    if (selectedVariant.variant1) {
      // const v = variants.find((v) => v._id === selectedVariant.variant1);
      const v = selectedVariant.variant1;
      vArr.push({ id: v._id, name: v.name });
    }

    if (selectedVariant.variant2) {
      const v = selectedVariant.variant2;
      // const v = variants.find((v) => v._id === selectedVariant.variant2);
      vArr.push({ id: v._id, name: v.name });
    }

    formData.append("variants", JSON.stringify(vArr));

    const subVariants = [];

    if (vArr.length > 0) {
      const arr = Array(variantCount)
        .fill(null)
        .map((_, idx) => idx);

      for (let i = 0; i < arr.length; i++) {
        const id = arr[i];

        const obj = {};
        if (vArr.length === 2) {
          obj["secondVariantId"] = vArr[1].id;
          obj["secondVariantName"] = vArr[1].name;
          obj["secondSubVariantId"] = data["subVariant"][`${id}_secondId`];
          obj["secondSubVariantName"] = data["subVariant"][`${id}_second`];
        }

        subVariants.push({
          ...obj,
          firstVariantId: vArr[0].id,
          firstVariantName: vArr[0].name,
          firstSubVariantId: data["subVariant"][`${id}_firstId`],
          firstSubVariantName: data["subVariant"][`${id}_first`],
          price: data["subVariant"][`${id}_third`],
          discountedPrice: data["subVariant"][`${id}_fourth`],
          quantity: data["subVariant"][`${id}_fifth`],
          height: data["subVariant"][`${id}_sixth`],
          weight: data["subVariant"][`${id}_seventh`],
          width: data["subVariant"][`${id}_eighth`],
          length: data["subVariant"][`${id}_nine`],

          // isDeleted: variantObj[id],
        });
      }
    }

    formData.append("subVariants", JSON.stringify(subVariants));
    formData.append("newSubVariants", JSON.stringify(subVariantsAdd));


    // for (let [key, value] of formData) {
    //   console.log(`${key}: ${value}`);
    // }
    request("POST", "product", formData);
  };

  const vendorChangeHandler = (id) => {
    setMainCategories([]);
    setSubCategories([]);
    setWarehouses([]);
    // setFirstVariants([]);
    // setSecondVariants([]);
    setSelectedWarehouses([]);

    setValue("warehouses", null);

    if (id) {
      setValue("vendor", id?.value);
      setSelectedVendor(id?.value);

      const vendor = allVendors.find((vendor) => vendor._id === id.value);

      setMainCategoriesSimple(
        vendor.mainCategories.map((item) => {
          return { value: item._id, label: item.name };
        })
      );

      setMainCategories(vendor.mainCategories);
      setWarehouses(vendor.warehouses);

      setCountries(vendor.countries);
      setSelectedCountries(vendor.countries);
      setValue(
        "countries",
        vendor.countries.map((e) => e.value)
      );
    }
  };

  const mainCategoryChangeHandler = (id) => {
    setValue("masterCategoryId", id?.value);
    setSelectedCategory(id?.label);
    if (id) {
      requestTaxes("GET", `product/tax-data/${selectedVendor}/${id.value}`);

      // const category = mainCategories.find(
      //   (category) => category._id === id.value
      // );
      setSubCategories(
        category.subCategories.map((item) => {
          return { value: item._id, label: item.name };
        })
      );
    }
  };

  const subCategoryChangeHandler = (id) => {
    if (id) {
      const masterVar = subCategories.find((s) => s._id === id).masterVariant;

      if (masterVar) {
        setMasterVariant(masterVar);
      } else {
        setMasterVariant(null);
      }

      requestVariant("GET", `variant/product/${id}/${getValues("vendor")}`);
    }
  };

  // const firstVariantChangeHandler = (id) => {
  //   if (id) {
  //     setSelectedVariant((prev) => ({ ...prev, variant1: id }));
  //   }
  // };

  // const secondVariantChangeHandler = (id) => {
  //   if (id) {
  //     setSelectedVariant((prev) => ({ ...prev, variant2: id }));
  //   }
  // };

  const handleChangeWarehouse = (event) => {
    setSelectedWarehouses(event);

    if (event && event.length > 0) {
      setError("warehouses", "");
      setValue(
        "warehouses",
        event.map((e) => e.value)
      );
    } else {
      setValue("warehouses", null);
    }
  };

  const handleChangeCountry = (event) => {
    setSelectedCountries(event);

    taxHTMLHandler(event, taxes, false);

    if (event && event.length > 0) {
      setError("countries", "");
      setValue(
        "countries",
        event.map((e) => e.value)
      );
    } else {
      setValue("countries", null);
    }
  };

  const handleChangeSubCategory = (event) => {
    setSelectedSubCategory(event);

    if (event) {
      setError("subCategoryId", "");
      setValue("subCategoryId", event.value);
      requestFeatures("GET", `product/features-data/${event.value}`);

      {
        requestVariant(
          "GET",
          `variant/product/${event.value}/${getValues("vendor")}`
        );

        const masterVar = subCategories.find(
          (s) => s._id === event.value
        ).masterVariant;

        if (masterVar) {
          setMasterVariant(masterVar);
        } else {
          setMasterVariant(null);
        }
      }
    } else {
      setValue("subCategoryId", null);
    }
  };

  const handleChangeBrands = (event) => {
    setSelectedBrands(event);

    if (event) {
      setError("brandId", "");
      setValue("brandId", event.value);
    } else {
      setValue("brandId", null);
    }
  };

  const handleChangeUnits = (event) => {
    setSelectedUnits(event);

    if (event) {
      setError("unitId", "");
      setValue("unitId", event.value);
    } else {
      setValue("unitId", null);
    }
  };

  const addFeature = () => {
    setFeatures((prev) => [...prev, { id: nextId }]);
    setNextId((prev) => prev + 1);
  };

  const deleteFeature = (id) => {
    const newFeatures = [...features].filter((f) => f.id !== id);
    setFeatures(newFeatures);

    unregister(`featureLabel${id}`);
    unregister(`featureValue${id}`);
  };

  const mediaViewHandler = (acceptedFiles) => {
    // if (!e.target.files || e.target.files.length === 0) {
    //   return;
    // }

    // const newMediaFiles = [...mediaFiles, ...e.target.files];
    const newMediaFiles = [...mediaFiles];
    const newPreviewMediaFiles = [...previewMediaFiles];
    let newSelectedMedia = { ...selectedMedia };

    const newSelectedMediaArr = [];

    // for (let i = 0; i < e.target.files.length; i++) {
    for (let i = 0; i < acceptedFiles.length; i++) {
      const media = acceptedFiles[i];
      const id = mediaNextId + i;
      newMediaFiles.push({ id, file: media });

      let isVideo = VIDEO.includes(media.type);
      const previewMedia = URL.createObjectURL(media);

      newPreviewMediaFiles.push({ media: previewMedia, isVideo, id });

      newSelectedMediaArr.push({
        media: previewMedia,
        isVideo,
        id,
        isSelected: false,
      });
    }

    for (let key in newSelectedMedia) {
      newSelectedMedia[key] = newSelectedMedia[key].concat(
        key === "main"
          ? newSelectedMediaArr.map((a) => ({
              ...a,
              isSelected: true,
            }))
          : newSelectedMediaArr
      );
      setFeaturedMediaId((prev) =>
        prev === null ? newSelectedMedia["main"][0]?.id : prev
      );
    }

    setSelectedMedia(newSelectedMedia);

    setMediaFiles(newMediaFiles);
    setPreviewMediaFiles(newPreviewMediaFiles);

    setMediaNextId((prev) => prev + newMediaFiles.length);

    // e.target.files = null;
  };

  const deleteMediaHandler = (id) => {
    setMediaFiles((prev) => prev.filter((m) => m.id !== id));
    setPreviewMediaFiles((prev) => prev.filter((m) => m.id !== id));

    let newSelectedMedia = { ...selectedMedia };

    for (let key in newSelectedMedia) {
      newSelectedMedia[key] = newSelectedMedia[key].filter((m) => m.id !== id);
    }

    setSelectedMedia(newSelectedMedia);
  };

  const unselectMediaHandler = (key, id, type) => {
    let newSelectedMedia = { ...selectedMedia };

    if (type === "add") {
      const len = newSelectedMedia[key].filter(
        (media) => media.isSelected
      ).length;
      if (len === 5) {
        return;
      }
    } else {
      // if (id === featuredMediaId && key === "main") {
      //   setFeaturedMediaId(null);
      // }
    }

    newSelectedMedia[key] = newSelectedMedia[key].map((media) =>
      media.id === id ? { ...media, isSelected: type === "add" } : media
    );

    setSelectedMedia(newSelectedMedia);

    if (key === "main") {
      deleteMediaHandler(id);
    }
  };

  const variantCreateHandler = () => {
    unregister("subVariant");
    const [price, discountedPrice, quantity] = getValues([
      "price",
      "discountedPrice",
      "quantity",
    ]);

    let id = 0;

    const newVariants = JSON.parse(JSON.stringify(variants));
    const selectedVariants = newVariants.filter((v) => v.isChecked);
    let firstVariant = selectedVariants[0];
    let secondVariant = selectedVariants[1];

    if (firstVariant) {
      const subVariantsSelected = firstVariant.subVariants.filter(
        (sv) => sv.isChecked
      );

      if (subVariantsSelected.length === 0) {
        toast.error(`Please select variant in ${firstVariant.name}`);
        return;
      }

      firstVariant.subVariants = [...subVariantsSelected];
    }

    if (secondVariant) {
      const subVariantsSelected = secondVariant.subVariants.filter(
        (sv) => sv.isChecked
      );

      if (subVariantsSelected.length === 0) {
        toast.error(`Please select variant in ${secondVariant.name}`);
        return;
      }

      secondVariant.subVariants = [...subVariantsSelected];
    }

    if (firstVariant && secondVariant) {
      setSelectedVariant({
        variant1: firstVariant,
        variant2: secondVariant,
      });

      const v1 = firstVariant;
      const sv1 = v1.subVariants;
      const v2 = secondVariant;
      const sv2 = v2.subVariants;

      for (let i = 0; i < sv1.length; i++) {
        for (let j = 0; j < sv2.length; j++) {
          const key = `subVariant.${id}`;

          setValue(`${key}_firstId`, sv1[i].id);
          setValue(`${key}_first`, sv1[i].name);
          setValue(`${key}_secondId`, sv2[j].id);
          setValue(`${key}_second`, sv2[j].name);
          setValue(`${key}_third`, price);
          setValue(`${key}_fourth`, discountedPrice);
          setValue(`${key}_fifth`, quantity);
          setValue(`${key}_sixth`, 0);
          setValue(`${key}_seventh`, 0);
          setValue(`${key}_eighth`, 0);
          setValue(`${key}_nine`, 0);

          id++;
        }
      }
      setVariantCount(id);
      setVariantTh([
        v1.name,
        v2.name,
        "Price",
        "Discounted Price",
        "Quantity",
        "Height",
        "Weight",
        "Width",
        "Length",
        // "Delete",
        // "Media",
      ]);
    } else if (firstVariant) {
      setSelectedVariant({
        variant1: firstVariant,
        variant2: null,
      });

      const v1 = firstVariant;
      const sv1 = v1.subVariants;

      for (let i = 0; i < sv1.length; i++) {
        const key = `subVariant.${id}`;
        setValue(`${key}_firstId`, sv1[i].id);
        setValue(`${key}_first`, sv1[i].name);
        setValue(`${key}_third`, price);
        setValue(`${key}_fourth`, discountedPrice);
        setValue(`${key}_fifth`, quantity);
        setValue(`${key}_sixth`, 0);
        setValue(`${key}_seventh`, 0);
        setValue(`${key}_eighth`, 0);
        setValue(`${key}_nine`, 0);
        id++;
      }

      setVariantTh([
        v1.name,
        "Price",
        "Discounted Price",
        "Quantity",
        "Height",
        "Weight",
        "Width",
        "Length",
        // "Delete",
        // "Media",
      ]);
      setVariantCount(id);
    }

    const mainArr = selectedMedia["main"];
    const obj = { main: mainArr };
    // const objDelete = {};

    const v = newVariants.find((v) => v._id === masterVariant);
    const selectedSubV = v.subVariants.filter((sv) => sv.isChecked);
    setSubVariants(selectedSubV);

    const idArr = Array(selectedSubV.length)
      .fill(null)
      .map((_, idx) => idx);

    idArr.forEach((id) => {
      obj[id] = previewMediaFiles.map((m) => ({ ...m, isSelected: false }));
      // objDelete[id] = false;
    });

    setSelectedMedia(obj);
    // setVariantObj(objDelete);
    setIsVaraintModalOpen(false);
  };

  const variantMediaHandler = (id) => {
    setSelectedMediaKey(id);
    setIsMediaModalOpen(true);
  };

  const makeFeaturedHandler = (id) => {
    setFeaturedMediaId(id);
  };

  const variantCheckHandler = (id, value) => {
    if (id === masterVariant) {
      return;
    }

    if (variantSelectionCount === 2 && value) {
      return;
    }

    if (value) {
      setVariantSelectionCount((prev) => prev + 1);
    } else {
      setVariantSelectionCount((prev) => prev - 1);
    }

    const newVariants = [...variants].map((v) => ({
      ...v,
      isChecked: v._id === id ? value : v.isChecked,
    }));
    setVariants(newVariants);
  };

  const subVariantCheckHandler = (id, svId, value) => {
    const newVariants = [...variants].map((v) => ({
      ...v,
      subVariants:
        v._id === id
          ? v.subVariants.map((sv) => ({
              ...sv,
              isChecked: svId === sv.id ? value : sv.isChecked,
            }))
          : v.subVariants,
    }));
    setVariants(newVariants);
  };

  const addVariantSubmit = (data) => {
    const { newVariantId } = data;
    const subCategoryId = getValues("subCategoryId");

    const obj = {
      id: subVariantsAdd.length,
      variantId: newVariantId,
      subCategoryId,
      languagesData: [],
      name: null,
    };

    languages.forEach((lang) => {
      const value = data[`newVariantName-${lang.code}`];
      if (lang.default) {
        obj.name = value;
      }
      obj.languagesData.push({
        code: lang.code,
        name: value,
      });
    });

    setSubVariantsAdd((prev) => [...prev, obj]);

    const idx = variants.findIndex((v) => v._id === newVariantId);
    const newVariants = [...variants];
    newVariants[idx] = {
      ...newVariants[idx],
      subVariants: [
        ...newVariants[idx].subVariants,
        { id: obj.id, name: obj.name, isChecked: true, isAdded: true },
      ],
    };
    setVariants(newVariants);

    setIsAddVariantModalOpen(false);
    resetAddVariant({ newVariantName: "", newVariantId: "" });
    clearErrorsAddVariant("newVariantName");
  };

  const searchHandler = (e) => {
    if (e) {
      e.preventDefault();
    }
    const regex = new RegExp(searchValue, "i");
    const variantsFiltered = variants.map((v) => {
      const { name } = v;
      if (name.match(regex)) {
        return { ...v, show: true };
      } else {
        return { ...v, show: false };
      }
    });
    setVariants(variantsFiltered);
  };

  const taxHTMLHandler = (countries, taxes, toSetValues) => {
    const selectedCountriesValue = countries.map((c) => c.value);

    const taxesToShow = [];

    for (let i = 0; i < taxes.length; i++) {
      const tax = taxes[i];
      if (selectedCountriesValue.includes(tax._id)) {
        taxesToShow.push(tax);

        if (toSetValues) {
          tax.taxes.forEach((t) => {
            setValue(`tax-${tax._id}-${t.id}`, true);
          });
        }
      }
    }

    setTaxesToShow(taxesToShow);
  };

  const InputFields = [
    [
      {
        Component: Input,
        label: "Name",
        type: "text",
        name: "name",
        registerFields: {
          required: true,
          // pattern: /^[A-Za-z ]+$/,
        },
        // registerFieldsFeedback: {
        //   pattern: "Name can only contain letters.",
        // },
      },
      {
        Component: ReactSelectInput,
        label: "Vendor",
        name: "vendor",
        registerFields: {
          required: true,
        },
        control,
        options: allVendorsSimple,
        handleChange: vendorChangeHandler,
        selectedOption: allVendorsSimple?.find(
          (item) => item.value == selectedVendor
        ),
        // children: allVendors && allVendors.length > 0 && (
        //   <>

        //     <option value="">Select vendor</option>
        //     {allVendors.map((obj) => (
        //       <option key={obj._id} value={obj._id}>
        //         {obj.businessName}
        //       </option>
        //     ))}
        //   </>
        // ),
        // onChange: vendorChangeHandler,
      },
      {
        Component: Input,
        label: "Serial Number",
        type: "text",
        name: "serialNumber",
        registerFields: {
          required: true,
        },
      },
      {
        Component: Input,
        label: "Product ID",
        type: "text",
        name: "customId",
        registerFields: {
          required: true,
        },
        inputData: {
          disabled: true,
        },
      },
      {
        Component: ReactSelectInput,
        label: "Master Category",
        name: "masterCategoryId",
        registerFields: {
          required: true,
        },
        control,
        options: mainCategoriesSimple,
        handleChange: mainCategoryChangeHandler,
        selectedOption: mainCategoriesSimple?.find(
          (item) => item.value == selectedCategory
        ),
        //   children:
        //     mainCategories && mainCategories.length > 0 ? (
        //       <>
        //         <option value="">Select Master Category</option>
        //         {mainCategories.map((obj) => (
        //           <option key={obj._id} value={obj._id}>
        //             {obj.name}
        //           </option>
        //         ))}
        //       </>
        //     ) : (
        //       <option value="">Please select vendor first</option>
        //     ),
        //   onChange: mainCategoryChangeHandler,
      },
      {
        Component: ReactSelectInput,
        label: "Sub Category",
        name: "subCategoryId",
        registerFields: {
          required: true,
        },
        control,
        options: subCategories,
        handleChange: handleChangeSubCategory,
        selectedOption: selectedSubCategory,
        // children:
        //   subCategories && subCategories.length > 0 ? (
        //     <>
        //       <option value="">Select Sub Category</option>
        //       {subCategories.map((obj) => (
        //         <option key={obj._id} value={obj._id}>
        //           {obj.name}
        //         </option>
        //       ))}
        //     </>
        //   ) : (
        //     <option value="">Please select master category first</option>
        //   ),
        onChange: subCategoryChangeHandler,
      },
      {
        Component: ReactSelectInput,
        label: "Brand",
        name: "brandId",
        registerFields: {
          required: true,
        },
        control,
        options: brands,
        handleChange: handleChangeBrands,
        selectedOption: selectedBrands,
      },
      {
        Component: ReactSelectInput,
        label: "Unit",
        name: "unitId",
        registerFields: {
          required: true,
        },
        control,
        options: units,
        handleChange: handleChangeUnits,
        selectedOption: selectedUnits,
      },
      {
        Component: ReactSelectInput,
        label: "Warehouse",
        name: "warehouses",
        registerFields: {
          required: true,
        },
        control,
        options: warehouses,
        handleChange: handleChangeWarehouse,
        selectedOption: selectedWarehouses,
        isMultiple: true,
      },
      {
        Component: Input,
        label: "Quantity",
        type: "text",
        name: "quantity",
        registerFields: {
          required: true,
          pattern: /^\d{1,3}(,\d{3})*(\,|.\d+)?$/i,
        },
        registerFieldsFeedback: {
          pattern: "Quantity can only contain numbers.",
        },
      },
      {
        Component: ReactSelectInput,
        label: "Countries",
        name: "countries",
        registerFields: {
          required: true,
        },
        control,
        options: countries,
        handleChange: handleChangeCountry,
        selectedOption: selectedCountries,
        isMultiple: true,
      },
      {
        Component: SelectInput,
        label: "Save as",
        name: "isPublished",
        registerFields: {
          required: true,
        },
        children: (
          <>
            <option value="">Select Save as</option>
            <option value={false}>Draft</option>
            <option value={true}>Publish</option>
          </>
        ),
      },
      {
        Component: SelectInput,
        label: "Stock",
        name: "inStock",
        registerFields: {
          required: true,
        },
        children: (
          <>
            <option value={true}>In Stock</option>
            <option value={false}>Out of Stock</option>
          </>
        ),
      },
    ],
  ];

  const PriceInputFields = [
    {
      Component: Input,
      label: "Selling Price",
      type: "text",
      name: "sellingPrice",
      registerFields: {
        required: true,
        pattern: /^\d{1,3}(,\d{3})*(\,|.\d+)?$/i,
      },
      registerFieldsFeedback: {
        pattern: "Price can only contain numbers.",
      },
    },
    {
      Component: Input,
      label: "Discounted Price",
      type: "text",
      name: "discountedPrice",
      registerFields: {
        required: true,
        pattern: /^\d{1,3}(,\d{3})*(\,|.\d+)?$/i,
      },
      registerFieldsFeedback: {
        pattern: "Discounted Price can only contain numbers.",
      },
    },
  ];

  const DescInputFields = [
    [
      {
        Component: Textarea,
        label: "Short Description",
        type: "text",
        name: "shortDescription",
        registerFields: {
          required: true,
        },
        colClass: "col-xl-12",
      },
      {
        Component: CKEditorInput,
        colClass: "col-xl-12",
        label: "Long Description",
        name: "description",
        registerFields: {
          required: true,
        },
        getValues,
        setValue,
        trigger,
        inputData: {},
        clearErrors,
        isEdit: false,
      },
    ],
  ];

  const ShippingInputFields = [
    [
      {
        Component: Input,
        label: "Height",
        type: "text",
        name: "height",
        registerFields: {
          required: true,
          pattern: /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/,
        },
        registerFieldsFeedback: {
          pattern: "Please enter digits only.",
        },
      },
      {
        Component: Input,
        label: "Weight",
        type: "text",
        name: "weight",
        registerFields: {
          required: true,
          pattern: /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/,
        },
        registerFieldsFeedback: {
          pattern: "Please enter digits only.",
        },
      },
      {
        Component: Input,
        label: "Width",
        type: "text",
        name: "width",
        registerFields: {
          required: true,
          pattern: /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/,
        },
        registerFieldsFeedback: {
          pattern: "Please enter digits only.",
        },
      },
      {
        Component: Input,
        label: "Length",
        type: "text",
        name: "length",
        registerFields: {
          required: true,
          pattern: /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/,
        },
        registerFieldsFeedback: {
          pattern: "Please enter digits only.",
        },
      },
    ],
  ];

  const SEOInputFields = [
    [
      {
        Component: Input,
        label: "Title",
        type: "text",
        name: "metaData.title",
        registerFields: {
          required: false,
        },
      },
      {
        Component: Textarea,
        label: "Description",
        type: "text",
        name: "metaData.description",
        registerFields: {
          required: false,
        },
        colClass: "col-xl-12",
      },
      {
        Component: Input,
        label: "Author",
        type: "text",
        name: "metaData.author",
        registerFields: {
          required: false,
        },
      },
      {
        Component: Input,
        label: "Keywords",
        type: "text",
        name: "metaData.keywords",
        registerFields: {
          required: false,
        },
      },

      {
        Component: Textarea,
        label: "Twitter Card",
        type: "text",
        name: "metaData.twitterCard",
        registerFields: {
          required: false,
        },
        colClass: "col-xl-12",
      },
      {
        Component: Input,
        label: "Twitter Site",
        type: "text",
        name: "metaData.twitterSite",
        registerFields: {
          required: false,
        },
      },
      {
        Component: Input,
        label: "OG Url",
        type: "text",
        name: "metaData.ogUrl",
        registerFields: {
          required: false,
        },
      },
      {
        Component: Input,
        label: "OG Type",
        type: "text",
        name: "metaData.ogType",
        registerFields: {
          required: false,
        },
      },
      {
        Component: Input,
        label: "OG Title",
        type: "text",
        name: "metaData.ogTitle",
        registerFields: {
          required: false,
        },
      },
      {
        Component: Textarea,
        label: "OG Description",
        type: "text",
        name: "metaData.ogDescription",
        registerFields: {
          required: false,
        },
        colClass: "col-xl-12",
      },
      {
        Component: Input,
        label: "Og Image",
        name: "ogImage",
        registerFields: {
          required: false,
        },
        type: "file",
        inputData: {
          accept: "image/*",
        },
      },
      {
        Component: Input,
        label: "OG Tag",
        type: "text",
        name: "metaData.ogTag",
        registerFields: {
          required: false,
        },
      },
      {
        Component: Input,
        label: "OG Alt Tag",
        type: "text",
        name: "metaData.ogAltTag",
        registerFields: {
          required: false,
        },
      },
    ],
  ];

  // let obj = [];

  // if (selectedVariant.variant1) {
  //   obj.push({
  //     Component: SelectInput,
  //     label: "Second Variant",
  //     name: "variant2",
  //     registerFields: {
  //       required: false,
  //     },
  //     children:
  //       secondVariants && secondVariants.length > 0 ? (
  //         <>
  //           <option value="">Select second variant</option>
  //           {secondVariants.map((obj) => (
  //             <option key={obj._id} value={obj._id}>
  //               {" "}
  //               {obj.name}
  //             </option>
  //           ))}
  //         </>
  //       ) : (
  //         <option value="">Select sub category first</option>
  //       ),
  //     onChange: secondVariantChangeHandler,
  //   });
  // }

  // const VariantInputFields = [
  //   [
  //     {
  //       Component: SelectInput,
  //       label: "First Variant",
  //       name: "variant1",
  //       registerFields: {
  //         required: false,
  //       },
  //       children:
  //         firstVariants && firstVariants.length > 0 ? (
  //           <>
  //             <option value="">Select first variant</option>
  //             {firstVariants.map((obj) => (
  //               <option key={obj._id} value={obj._id}>
  //                 {" "}
  //                 {obj.name}
  //               </option>
  //             ))}
  //           </>
  //         ) : (
  //           <option value="">Select sub category first</option>
  //         ),
  //       onChange: firstVariantChangeHandler,
  //     },
  //     ...obj,
  //   ],
  // ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Add Product"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/products", name: "Back To Products" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title"> Add New Product</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-xl-12">
                  {/* <button
                    className="btn btn-primary mr-2"
                    onClick={() => {
                      setIsMediaLibraryModalOpen(true);
                    }}
                  >
                    Media Library
                  </button> */}

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div class="accordion" id="accordionExample">
                      <div class="card mb-4">
                        <div class="card-header" id="headingOne">
                          <h2 class="mb-0">
                            <button
                              class="btn btn-link btn-block text-left"
                              type="button"
                              data-toggle="collapse"
                              data-target="#collapseOne"
                              aria-expanded="true"
                              aria-controls="collapseOne"
                            >
                              Product Details
                            </button>
                          </h2>
                        </div>

                        <div
                          id="collapseOne"
                          class="collapse"
                          aria-labelledby="headingOne"
                          data-parent="#accordionExample"
                        >
                          <div class="card-body">
                            <RenderInputFields
                              InputFields={InputFields}
                              errors={errors}
                              register={register}
                            />
                          </div>
                        </div>
                      </div>

                      <div class="card mb-4">
                        <div class="card-header" id="headingSix">
                          <h2 class="mb-0">
                            <button
                              class="btn btn-link btn-block text-left"
                              type="button"
                              data-toggle="collapse"
                              data-target="#collapseSix"
                              aria-expanded="true"
                              aria-controls="collapseSix"
                            >
                              Price Details
                            </button>
                          </h2>
                        </div>

                        <div
                          id="collapseSix"
                          class="collapse"
                          aria-labelledby="headingSix"
                          data-parent="#accordionExamplePrice"
                        >
                          <div class="card-body">
                            <RenderInputFields
                              InputFields={[
                                [
                                  {
                                    Component: Input,
                                    label: "Buying Price",
                                    type: "text",
                                    name: "buyingPrice",
                                    registerFields: {
                                      required: true,
                                      pattern: /^\d{1,3}(,\d{3})*(\,|.\d+)?$/i,
                                    },
                                    registerFieldsFeedback: {
                                      pattern:
                                        "Price can only contain numbers.",
                                    },
                                  },
                                ],
                              ]}
                              errors={errors}
                              register={register}
                            />

                            <div class="accordion" id="accordionExamplePrice">
                              {selectedCountries.map((country, idx) => (
                                <div key={country.value} class="card">
                                  <div
                                    class="card-header"
                                    id={`headingPrice-${idx}`}
                                  >
                                    <h2 class="mb-0">
                                      <button
                                        class="btn btn-link btn-block text-left"
                                        type="button"
                                        data-toggle="collapse"
                                        data-target={`#collapsePrice-${idx}`}
                                        aria-expanded="true"
                                        aria-controls={`collapsePrice-${idx}`}
                                      >
                                        {country.label}
                                      </button>
                                    </h2>
                                  </div>

                                  <div
                                    id={`collapsePrice-${idx}`}
                                    class="collapse"
                                    aria-labelledby={`headingPrice-${idx}`}
                                    data-parent="#accordionExamplePrice"
                                  >
                                    <div class="card-body">
                                      <RenderInputFields
                                        InputFields={[
                                          PriceInputFields.map((p) => ({
                                            ...p,
                                            name: `${p.name}_${country.value}`,
                                          })),
                                        ]}
                                        errors={errors}
                                        register={register}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="card mb-4">
                        <div class="card-header" id="headingSeven">
                          <h2 class="mb-0">
                            <button
                              class="btn btn-link btn-block text-left"
                              type="button"
                              data-toggle="collapse"
                              data-target="#collapseSeven"
                              aria-expanded="true"
                              aria-controls="collapseSeven"
                            >
                              About Product
                            </button>
                          </h2>
                        </div>

                        <div
                          id="collapseSeven"
                          class="collapse"
                          aria-labelledby="headingSeven"
                          data-parent="#accordionExample"
                        >
                          <div class="card-body">
                            {/* <RenderInputFields
                              InputFields={DescInputFields}
                              errors={errors}
                              register={register}
                            /> */}

                            <>
                              <div className="card-header card-header-tabs-line">
                                <div className="card-toolbar">
                                  <ul
                                    className="nav nav-tabs nav-tabs-space-lg nav-tabs-line nav-bold nav-tabs-line-3x"
                                    role="tablist"
                                  >
                                    {languages.length > 0 &&
                                      languages.map((lang, index) => (
                                        <SubTabForm
                                          key={index}
                                          name={lang.name}
                                          index={index}
                                          tabName={index + "_first"}
                                          image={lang?.image}
                                        />
                                      ))}
                                  </ul>
                                </div>
                              </div>
                              <div className="mt-5">
                                <div className="card-body px-0">
                                  <div className="tab-content px-15">
                                    {languages.length > 0 &&
                                      languages.map((lang, index) => (
                                        <SubInputForm
                                          key={index}
                                          index={index}
                                          errors={errors}
                                          register={register}
                                          required={lang.required}
                                          InputFields={DescInputFields}
                                          code={lang.code}
                                          tabName={index + "_first"}
                                        />
                                      ))}
                                  </div>
                                </div>
                              </div>
                            </>
                          </div>
                        </div>
                      </div>

                      <div class="card mb-4">
                        <div class="card-header" id="headingEight">
                          <h2 class="mb-0">
                            <button
                              class="btn btn-link btn-block text-left"
                              type="button"
                              data-toggle="collapse"
                              data-target="#collapseEight"
                              aria-expanded="true"
                              aria-controls="collapseEight"
                            >
                              Taxes
                            </button>
                          </h2>
                        </div>

                        <div
                          id="collapseEight"
                          class="collapse"
                          aria-labelledby="headingEight"
                          data-parent="#accordionExample"
                        >
                          <div class="card-body">
                            <div class="accordion" id="accordionExample3">
                              {taxesToShow.map((t) => (
                                <div key={t._id} class="card">
                                  <div
                                    class="card-header"
                                    id={`headingTax-${t._id}`}
                                  >
                                    <h2 class="mb-0">
                                      <button
                                        class="btn btn-link btn-block text-left"
                                        type="button"
                                        data-toggle="collapse"
                                        data-target={`#collapseTax-${t._id}`}
                                        aria-expanded="true"
                                        aria-controls={`collapseTax-${t._id}`}
                                      >
                                        {t.countryName}
                                      </button>
                                    </h2>
                                  </div>

                                  <div
                                    id={`collapseTax-${t._id}`}
                                    class="collapse"
                                    aria-labelledby={`headingTax-${t._id}`}
                                    data-parent="#accordionExample3"
                                  >
                                    <div class="card-body">
                                      <div className="form-group">
                                        <div className="checkbox-inline flex-wrap gap2">
                                          {t.taxes.map((tax) => (
                                            <label
                                              key={tax.id}
                                              class="checkbox checkbox-square"
                                            >
                                              <input
                                                type="checkbox"
                                                id={tax.id}
                                                {...register(
                                                  `tax-${t._id}-${tax.id}`
                                                )}
                                              />
                                              <span></span>
                                              {tax.name} ({tax.tax}%)
                                            </label>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="card mb-4">
                        <div class="card-header" id="headingTwo">
                          <h2 class="mb-0">
                            <button
                              class="btn btn-link btn-block text-left"
                              type="button"
                              data-toggle="collapse"
                              data-target="#collapseTwo"
                              aria-expanded="true"
                              aria-controls="collapseTwo"
                            >
                              Feature or Specification
                            </button>
                          </h2>
                        </div>

                        <div
                          id="collapseTwo"
                          class="collapse"
                          aria-labelledby="headingTwo"
                          data-parent="#accordionExample"
                        >
                          <div class="card-body">
                            <RenderInputFields
                              InputFields={[
                                [
                                  {
                                    Component: Input,
                                    label: "Feature or Specification Title",
                                    type: "text",
                                    name: "featureTitle",
                                    registerFields: {
                                      required: true,
                                    },
                                  },
                                ],
                              ]}
                              errors={errors}
                              register={register}
                            />

                            <div className="col-xl-12">
                              <div className="form-group">
                                <label className="mr-5">
                                  Features or Specifications
                                </label>
                                <button
                                  onClick={addFeature}
                                  className="btn btn-primary mr-2"
                                  type="button"
                                >
                                  Add
                                </button>

                                {features.map((feature) => (
                                  <Fragment key={feature.id}>
                                    <div className="card-header card-header-tabs-line">
                                      <div className="card-toolbar">
                                        <ul
                                          className="nav nav-tabs nav-tabs-space-lg nav-tabs-line nav-bold nav-tabs-line-3x"
                                          role="tablist"
                                        >
                                          {languages.length > 0 &&
                                            languages.map((lang, index) => (
                                              <SubTabForm
                                                key={index}
                                                name={lang.name}
                                                index={index}
                                                tabName={
                                                  "feature_" +
                                                  index +
                                                  "_" +
                                                  feature.id
                                                }
                                                image={lang?.image}
                                              />
                                            ))}
                                        </ul>
                                      </div>
                                    </div>
                                    <div className="mt-5">
                                      <div className="card-body px-0">
                                        <div className="tab-content px-15">
                                          {languages.length > 0 &&
                                            languages.map((lang, index) => (
                                              <SubInputForm
                                                key={index}
                                                index={index}
                                                errors={errors}
                                                register={register}
                                                required={lang.required}
                                                InputFields={[
                                                  [
                                                    {
                                                      Component: MutliInput,
                                                      type: "text",
                                                      label: "Feature Label",
                                                      name: `featureLabel${feature.id}`,
                                                      placeholder: `Enter Feature Label (${lang.name})`,
                                                    },
                                                    {
                                                      Component: MutliInput,
                                                      type: "text",
                                                      label: "Feature Value",
                                                      name: `featureValue${feature.id}`,
                                                      placeholder: `Enter Feature Value (${lang.name})`,
                                                    },
                                                  ],
                                                ]}
                                                code={lang.code}
                                                tabName={
                                                  "feature_" +
                                                  index +
                                                  "_" +
                                                  feature.id
                                                }
                                              />
                                            ))}
                                          <button
                                            onClick={() =>
                                              deleteFeature(feature.id)
                                            }
                                            className="btn btn-bg-danger ml-2"
                                            type="button"
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </Fragment>
                                ))}

                                {false &&
                                  features.map((feature) => (
                                    <div
                                      key={feature.id}
                                      className="d-flex mt-5"
                                    >
                                      <div className="d-flex flex-column col">
                                        <input
                                          type="text"
                                          className={`form-control form-control-solid form-control-lg ${
                                            errors[
                                              `featurelabel${feature.id}`
                                            ] && "is-invalid"
                                          }`}
                                          placeholder="Enter Feature Label"
                                          required
                                          {...register(
                                            `featurelabel${feature.id}`,
                                            {
                                              required: true,
                                            }
                                          )}
                                        />
                                        {errors[`featurelabel${feature.id}`]
                                          ?.type === "required" && (
                                          <div className="invalid-feedback">
                                            Either fill this field or delete.
                                          </div>
                                        )}
                                      </div>
                                      <div className="d-flex flex-column col">
                                        <input
                                          type="text"
                                          className={`form-control form-control-solid form-control-lg ${
                                            errors[
                                              `featureValue${feature.id}`
                                            ] && "is-invalid"
                                          }`}
                                          placeholder="Enter Feature Value"
                                          required
                                          {...register(
                                            `featureValue${feature.id}`,
                                            {
                                              required: true,
                                            }
                                          )}
                                        />
                                        {errors[`featureValue${feature.id}`]
                                          ?.type === "required" && (
                                          <div className="invalid-feedback">
                                            Either fill this field or delete.
                                          </div>
                                        )}
                                      </div>
                                      <button
                                        onClick={() =>
                                          deleteFeature(feature.id)
                                        }
                                        className="btn btn-bg-danger ml-2"
                                        type="button"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="card mb-4">
                        <div class="card-header" id="headingNine">
                          <h2 class="mb-0">
                            <button
                              class="btn btn-link btn-block text-left"
                              type="button"
                              data-toggle="collapse"
                              data-target="#collapseNine"
                              aria-expanded="true"
                              aria-controls="collapseNine"
                            >
                              Shipping Specifications
                            </button>
                          </h2>
                        </div>

                        <div
                          id="collapseNine"
                          class="collapse"
                          aria-labelledby="headingNine"
                          data-parent="#accordionExample"
                        >
                          <div class="card-body">
                            <RenderInputFields
                              InputFields={ShippingInputFields}
                              errors={errors}
                              register={register}
                            />
                          </div>
                        </div>
                      </div>

                      <div class="card mb-4">
                        <div class="card-header" id="headingTen">
                          <h2 class="mb-0">
                            <button
                              class="btn btn-link btn-block text-left"
                              type="button"
                              data-toggle="collapse"
                              data-target="#collapseTen"
                              aria-expanded="true"
                              aria-controls="collapseTen"
                            >
                              Alternate Products
                            </button>
                          </h2>
                        </div>

                        <div
                          id="collapseTen"
                          class="collapse"
                          aria-labelledby="headingTen"
                          data-parent="#accordionExample"
                        >
                          <div class="card-body">
                            <div className="text-center p-5">
                              <button
                                onClick={() => {
                                  setIsSimilarProductsModalOpen(true);
                                }}
                                type="button"
                                className="btn btn-primary"
                              >
                                Add New
                              </button>
                            </div>
                            <div className="custom">
                              <table>
                                <tr>
                                  <th>Product Name</th>
                                  <th>Action</th>
                                </tr>
                                <tr>
                                  <td>Test Product</td>
                                  <td>Delete</td>
                                </tr>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="card mb-4">
                        <div class="card-header" id="headingThree">
                          <h2 class="mb-0">
                            <button
                              class="btn btn-link btn-block text-left"
                              type="button"
                              data-toggle="collapse"
                              data-target="#collapseThree"
                              aria-expanded="true"
                              aria-controls="collapseThree"
                            >
                              Product Meta
                            </button>
                          </h2>
                        </div>

                        <div
                          id="collapseThree"
                          class="collapse"
                          aria-labelledby="headingThree"
                          data-parent="#accordionExample"
                        >
                          <div class="card-body">
                            <RenderInputFields
                              InputFields={SEOInputFields}
                              errors={errors}
                              register={register}
                            />
                          </div>
                        </div>
                      </div>

                      <div class="card mb-4">
                        <div class="card-header" id="headingFour">
                          <h2 class="mb-0">
                            <button
                              class="btn btn-link btn-block text-left"
                              type="button"
                              data-toggle="collapse"
                              data-target="#collapseFour"
                              aria-expanded="true"
                              aria-controls="collapseFour"
                            >
                              Media
                            </button>
                          </h2>
                        </div>

                        <div
                          id="collapseFour"
                          class="collapse"
                          aria-labelledby="headingFour"
                          data-parent="#accordionExample"
                        >
                          <div class="card-body">
                            <div className="modal-body- mb-3 mt-3">
                              <section>
                                <div
                                  {...getRootProps({
                                    className: "dropzone dropzoneHeight",
                                  })}
                                >
                                  <input {...getInputProps()} />
                                  <p>
                                    Drag 'n' drop some media files here, or
                                    click to select media files
                                  </p>
                                </div>
                              </section>
                            </div>
                            {/* <button
                              className="btn btn-primary mr-2"
                              type="button"
                              onClick={() => {
                                setIsMediaModalOpen(true);
                                setSelectedMediaKey("main");
                              }}
                            >
                              Select Media
                            </button> */}
                            <div className="instadata">
                              <div className="row">
                                {selectedMedia["main"].filter(
                                  (media) => media.isSelected
                                ).length > 0 &&
                                  selectedMedia["main"]
                                    .filter((media) => media.isSelected)
                                    .map((media) => (
                                      <MediaPreview
                                        deleteMedia={(id) =>
                                          unselectMediaHandler(
                                            "main",
                                            id,
                                            "remove"
                                          )
                                        }
                                        media={media}
                                        key={media.id}
                                        id={media.id}
                                        showFeatured={true}
                                        makeFeatured={makeFeaturedHandler}
                                        featuredMediaId={featuredMediaId}
                                      >
                                        {/* <>
                                            <label htmlFor={media.id}>
                                              Featured
                                            </label>
                                            <input
                                              type="radio"
                                              name="featured"
                                              id={media.id}
                                              value={media.id}
                                              checked={
                                                featuredMediaId === media.id
                                              }
                                              onChange={() =>
                                                setFeaturedMediaId(media.id)
                                              }
                                            />
                                          </> */}
                                      </MediaPreview>
                                    ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {variants.length > 0 && (
                        <>
                          <div class="card mb-4">
                            <div class="card-header" id="headingFive">
                              <h2 class="mb-0">
                                <button
                                  class="btn btn-link btn-block text-left"
                                  type="button"
                                  data-toggle="collapse"
                                  data-target="#collapseFive"
                                  aria-expanded="true"
                                  aria-controls="collapseFive"
                                >
                                  Variant
                                </button>
                              </h2>
                            </div>

                            <div
                              id="collapseFive"
                              class="collapse"
                              aria-labelledby="headingFive"
                              data-parent="#accordionExample"
                            >
                              <div class="card-body">
                                {/* <RenderInputFields
                                InputFields={VariantInputFields}
                                errors={errors}
                                register={register}
                              /> */}

                                <div className="text-center p-5">
                                  <button
                                    onClick={() => {
                                      setIsVaraintModalOpen(true);
                                    }}
                                    type="button"
                                    className="btn btn-primary"
                                  >
                                    Variant Customization
                                  </button>
                                </div>
                                {/* {selectedVariant.variant1 && (
                                  <button
                                    className="btn btn-primary mr-2"
                                    onClick={variantCreateHandler}
                                    type="button"
                                  >
                                    Set Variant
                                  </button>
                                )} */}
                                {variantCount !== null && (
                                  <>
                                    <table>
                                      <tr>
                                        {variantTh.map((name, idx) => (
                                          <th key={idx}>{name}</th>
                                        ))}
                                      </tr>
                                      {Array(variantCount)
                                        .fill(null)
                                        .map((_, idx) => idx)
                                        .map((id) => (
                                          <Fragment key={id}>
                                            <tr>
                                              {[
                                                "_first",
                                                "_second",
                                                "_third",
                                                "_fourth",
                                                "_fifth",
                                                "_sixth",
                                                "_seventh",
                                                "_eighth",
                                                "_nine",
                                                "_firstId",
                                                "_secondId",
                                              ].map((data) => {
                                                const registerObj = {};

                                                if (
                                                  [
                                                    "_third",
                                                    "_fourth",
                                                    "_fifth",
                                                    "_sixth",
                                                    "_seventh",
                                                    "_eighth",
                                                    "_nine",
                                                  ].includes(data)
                                                ) {
                                                  registerObj.pattern =
                                                    /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/;
                                                }

                                                if (
                                                  [
                                                    "_secondId",
                                                    "_second",
                                                  ].includes(data) &&
                                                  variantTh.length === 8
                                                ) {
                                                  return null;
                                                }
                                                return (
                                                  <td
                                                    style={{
                                                      display: [
                                                        "_firstId",
                                                        "_secondId",
                                                      ].includes(data)
                                                        ? "none"
                                                        : "table-cell",
                                                    }}
                                                    key={data}
                                                  >
                                                    <MutliInput
                                                      type="text"
                                                      label="Sub Variant"
                                                      name={`subVariant.${id}${data}`}
                                                      errors={errors}
                                                      placeholder={`Enter ${tablePlaceholderObj[data]}`}
                                                      register={register}
                                                      registerFields={{
                                                        required: true,
                                                        ...registerObj,
                                                      }}
                                                      registerFieldsFeedback={{
                                                        pattern:
                                                          "Please enter digits only.",
                                                      }}
                                                      inputData={{
                                                        disabled: [
                                                          "_first",
                                                          "_second",
                                                        ].includes(data),
                                                      }}
                                                    />
                                                  </td>
                                                );
                                              })}
                                              {/* <td>
                                              <input
                                                type="checkbox"
                                                className={`form-control`}
                                                style={{ height: "20px" }}
                                                checked={variantObj[id]}
                                                onChange={(e) => {
                                                  setVariantObj((prev) => ({
                                                    ...prev,
                                                    [id]: e.target.checked,
                                                  }));
                                                }}
                                              />
                                            </td>
                                            <td>
                                              <button
                                                className="btn btn-primary mr-2"
                                                onClick={() =>
                                                  variantMediaHandler(id)
                                                }
                                                type="button"
                                              >
                                                Media
                                              </button>
                                            </td> */}
                                            </tr>
                                          </Fragment>
                                        ))}
                                    </table>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {subVariants.length > 0 && (
                            <div class="card">
                              <div class="card-header" id="headingSix">
                                <h2 class="mb-0">
                                  <button
                                    class="btn btn-link btn-block text-left"
                                    type="button"
                                    data-toggle="collapse"
                                    data-target="#collapseSize"
                                    aria-expanded="true"
                                    aria-controls="collapseSize"
                                  >
                                    Variant Media
                                  </button>
                                </h2>
                              </div>

                              <div
                                id="collapseSize"
                                class="collapse"
                                aria-labelledby="headingSix"
                                data-parent="#accordionExample"
                              >
                                <div class="card-body">
                                  <div class="accordion" id="accordionExample1">
                                    {subVariants.map((sv, idx) => {
                                      return (
                                        <div key={idx} class="card">
                                          <div
                                            class="card-header"
                                            id={`headingSix-${idx}`}
                                          >
                                            <h2 class="mb-0">
                                              <button
                                                class="btn btn-link btn-block text-left"
                                                type="button"
                                                data-toggle="collapse"
                                                data-target={`#collapseSix-${idx}`}
                                                aria-expanded="true"
                                                aria-controls={`collapseSix-${idx}`}
                                              >
                                                {sv.name}
                                              </button>
                                            </h2>
                                          </div>

                                          <div
                                            id={`collapseSix-${idx}`}
                                            class="collapse"
                                            aria-labelledby={`headingSix-${idx}`}
                                            data-parent="#accordionExample1"
                                          >
                                            <div class="card-body">
                                              <div className="instadata">
                                                <div className="continueBx_">
                                                  <div className="form_input_area">
                                                    <div className="row">
                                                      {selectedMedia[idx]
                                                        ?.length === 0
                                                        ? "No Media Uploaded"
                                                        : selectedMedia[
                                                            idx
                                                          ]?.map((media) => (
                                                            <MediaSelectPreview
                                                              media={media}
                                                              key={media.id}
                                                              id={media.id}
                                                              updateMedia={(
                                                                id,
                                                                type
                                                              ) =>
                                                                unselectMediaHandler(
                                                                  idx,
                                                                  id,
                                                                  type
                                                                )
                                                              }
                                                            />
                                                          ))}
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="row"></div>

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

      <Modal
        isOpen={isMediaLibraryModalOpen}
        onRequestClose={() => setIsMediaLibraryModalOpen(false)}
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
      >
        <div>
          <div>
            <div className="text-center">
              <h1 className="modaltop-title">Media Library</h1>
            </div>
            <div className="modal-body instadata">
              <div className="continueBx_">
                <div className="form_input_area">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={mediaViewHandler}
                    multiple
                  />
                  <div className="row">
                    {previewMediaFiles.length === 0
                      ? "No Media Uploaded"
                      : previewMediaFiles.map((media) => (
                          <MediaPreview
                            deleteMedia={deleteMediaHandler}
                            media={media}
                            key={media.id}
                            id={media.id}
                          />
                        ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isMediaModalOpen}
        onRequestClose={() => setIsMediaModalOpen(false)}
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
      >
        <div>
          <div>
            <div className="text-center">
              <h1 className="modaltop-title">Media Library</h1>
            </div>
            <div className="modal-body instadata">
              <div className="continueBx_">
                <div className="form_input_area">
                  <div className="row">
                    {selectedMedia[selectedMediaKey]?.length === 0
                      ? "No Media Uploaded"
                      : selectedMedia[selectedMediaKey]?.map((media) => (
                          <MediaSelectPreview
                            media={media}
                            key={media.id}
                            id={media.id}
                            updateMedia={(id, type) =>
                              unselectMediaHandler(selectedMediaKey, id, type)
                            }
                          />
                        ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isVariantModalOpen}
        onRequestClose={() => setIsVaraintModalOpen(false)}
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
        className="react_modal_custom small_popup react_Custom_modal"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              Variant Customization
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={() => setIsVaraintModalOpen(false)}
            >
              <i aria-hidden="true" class="ki ki-close"></i>
            </button>
          </div>
          <div className="modal-body">
            <div className="full-xl-6">
              <div class="accordion" id="accordionExample2">
                {" "}
                <div class="form-group">
                  <label>Search</label>
                  <form onSubmit={searchHandler}>
                    <div className="position-relative">
                      <input
                        type="text"
                        class="form-control form-control-solid form-control-lg undefined"
                        name="name-ar"
                        id="searchbox"
                        placeholder="Search..."
                        onChange={(e) => setSearchValue(e.target.value)}
                        value={searchValue}
                      ></input>
                      <button onClick={searchHandler} className="searchIconBtn">
                        <i class="fas fa-search"></i>
                      </button>
                    </div>
                  </form>
                </div>
                {variants.filter((v) => v.show).length > 0 ? (
                  variants
                    .filter((v) => v.show)
                    .map((v) => (
                      <div class="card" key={v._id}>
                        <div class="card-header" id={`heading-${v._id}`}>
                          <h2 class="mb-0">
                            <button
                              class="btn btn-link btn-block text-left"
                              type="button"
                              data-toggle="collapse"
                              data-target={`#collapse-${v._id}`}
                              aria-expanded="true"
                              aria-controls={`collapse-${v._id}`}
                            >
                              <div class="row align-items-center m-0 mb-3">
                                <h4 class=" text-dark font-weight-bold mb-0 mr-3">
                                  {v.name}
                                </h4>
                                <label class="checkbox checkbox-square">
                                  {v._id !== masterVariant && (
                                    <>
                                      <input
                                        type="checkbox"
                                        checked={v.isChecked}
                                        onChange={(e) => {
                                          variantCheckHandler(
                                            v._id,
                                            e.target.checked
                                          );
                                        }}
                                        style={{ height: "20px" }}
                                        id={v._id}
                                      />
                                      <span></span>
                                    </>
                                  )}
                                </label>
                              </div>
                            </button>
                          </h2>

                          <button
                            className="btn btn-primary mr-2"
                            onClick={() => {
                              setIsAddVariantModalOpen(true);
                              setValueAddVariant("newVariantId", v._id);
                            }}
                          >
                            Add
                          </button>
                        </div>

                        {v.isChecked && (
                          <div
                            id={`collapse-${v._id}`}
                            class="collapse"
                            aria-labelledby={`heading-${v._id}`}
                            data-parent="#accordionExample2"
                          >
                            <div class="card-body">
                              {v.subVariants.length > 0 && (
                                <div className="form-group">
                                  <div className="checkbox-inline flex-wrap gap2">
                                    {v.subVariants.map((sub) => (
                                      <label
                                        key={sub.id}
                                        class="checkbox checkbox-square"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={sub.isChecked}
                                          onChange={(e) => {
                                            subVariantCheckHandler(
                                              v._id,
                                              sub.id,
                                              e.target.checked
                                            );
                                          }}
                                          id={sub.id}
                                        />
                                        <span></span>
                                        {sub.name}
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                ) : (
                  <div className="notFoundData">No Result found</div>
                )}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              className="btn btn-primary w-50"
              onClick={variantCreateHandler}
            >
              Save
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isAddVariantModalOpen}
        onRequestClose={() => setIsAddVariantModalOpen(false)}
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
        className="react_modal_custom small_popup react_Custom_modal"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              Add Variant
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={() => setIsAddVariantModalOpen(false)}
            >
              <i aria-hidden="true" class="ki ki-close"></i>
            </button>
          </div>
          <div className="modal-body">
            <div className="full-xl-6">
              <div className="card-toolbar">
                <ul
                  className="nav nav-tabs nav-tabs-space-lg nav-tabs-line nav-bold nav-tabs-line-3x"
                  role="tablist"
                >
                  {variants.length > 0 &&
                    languages.length > 0 &&
                    languages.map((lang, index) => (
                      <SubTabForm
                        key={index}
                        name={lang.name}
                        index={index}
                        tabName={index + "_fifth"}
                        image={lang?.image}
                      />
                    ))}
                </ul>
              </div>
              <form onSubmit={handleSubmitAddVariant(addVariantSubmit)}>
                <div className="mt-5">
                  <div className="card-body px-0">
                    <div className="tab-content px-4">
                      {languages.length > 0 &&
                        languages.map((lang, index) => (
                          <SubInputForm
                            key={index}
                            index={index}
                            errors={errorsAddVariant}
                            register={registerAddVariant}
                            required={lang.required}
                            InputFields={[
                              [
                                {
                                  Component: MutliInput,
                                  type: "text",
                                  label: "Variant Name",
                                  name: `newVariantName`,
                                  placeholder: `Enter Variant (${lang.name})`,
                                },
                              ],
                            ]}
                            code={lang.code}
                            tabName={index + "_fifth"}
                          />
                        ))}
                    </div>

                    <MutliInput
                      type="text"
                      label="New Variant Id"
                      name="newVariantId"
                      errors={errorsAddVariant}
                      placeholder="Enter Data"
                      register={registerAddVariant}
                      registerFields={{
                        required: true,
                      }}
                      inputData={{
                        style: {
                          display: "none",
                        },
                      }}
                    />
                    <div className="row"></div>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div class="modal-footer">
            <button
              className="btn btn-primary w-50"
              onClick={handleSubmitAddVariant(addVariantSubmit)}
            >
              Save
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isSimilarProductsModalOpen}
        // isOpen={true}
        onRequestClose={() => setIsSimilarProductsModalOpen(false)}
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
        className="react_modal_custom small_popup react_Custom_modal"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              Variant Customization
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={() => setIsSimilarProductsModalOpen(false)}
            >
              <i aria-hidden="true" class="ki ki-close"></i>
            </button>
          </div>
          <div className="modal-body">
            {/*begin::Search Form*/}
            <div className="mb-7">
              <div className="row align-items-center">
                <div className="col-lg-12">
                  <div className="row align-items-center">
                    <div className="col-md-3 my-2 my-md-0">
                      <div className="input-icon">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search..."
                          id="related_products_datatable_search_query"
                        />
                        <span>
                          <i className="flaticon2-search-1 text-muted" />
                        </span>
                      </div>
                    </div>
                    <div className="col-md-3 my-2 my-md-0">
                      <div className="d-flex align-items-center">
                        <label className="mr-3 mb-0 d-none d-md-block">
                          Category
                        </label>
                        <div className="dropdown bootstrap-select form-control">
                          <select
                            id="related_products_datatable_search_category"
                            className="form-control"
                          >
                            <option value="">All</option>
                            <option value="6370f2da52a1898d7b0d80d6">
                              Battery, Oil &amp; Consumables -&gt; Battery -&gt;
                              Agriculture and Plant
                            </option>
                          </select>
                          <button
                            type="button"
                            tabIndex={-1}
                            className="btn dropdown-toggle btn-light bs-placeholder"
                            data-toggle="dropdown"
                            role="combobox"
                            aria-owns="bs-select-1"
                            aria-haspopup="listbox"
                            aria-expanded="false"
                            data-id="related_products_datatable_search_category"
                            title="All"
                          >
                            <div className="filter-option">
                              <div className="filter-option-inner">
                                <div className="filter-option-inner-inner">
                                  All
                                </div>
                              </div>{" "}
                            </div>
                          </button>
                          <div className="dropdown-menu ">
                            <div
                              className="inner show"
                              role="listbox"
                              id="bs-select-1"
                              tabIndex={-1}
                            >
                              <ul
                                className="dropdown-menu inner show"
                                role="presentation"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 my-2 my-md-0">
                      <div className="d-flex align-items-center">
                        <label className="mr-3 mb-0 d-none d-md-block">
                          Brand:
                        </label>
                        <div className="dropdown bootstrap-select form-control">
                          <select
                            className="form-control"
                            id="related_products_datatable_search_brand"
                          >
                            <option value="">All</option>
                            <option value="6370f35108c016f1df08bd65">
                              Astrak
                            </option>
                          </select>
                          <button
                            type="button"
                            tabIndex={-1}
                            className="btn dropdown-toggle btn-light bs-placeholder"
                            data-toggle="dropdown"
                            role="combobox"
                            aria-owns="bs-select-2"
                            aria-haspopup="listbox"
                            aria-expanded="false"
                            data-id="related_products_datatable_search_brand"
                            title="All"
                          >
                            <div className="filter-option">
                              <div className="filter-option-inner">
                                <div className="filter-option-inner-inner">
                                  All
                                </div>
                              </div>{" "}
                            </div>
                          </button>
                          <div className="dropdown-menu ">
                            <div
                              className="inner show"
                              role="listbox"
                              id="bs-select-2"
                              tabIndex={-1}
                            >
                              <ul
                                className="dropdown-menu inner show"
                                role="presentation"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 my-2 my-md-0">
                      <div className="d-flex align-items-center">
                        <label className="mr-3 mb-0 d-none d-md-block">
                          Supplier:
                        </label>
                        <div className="dropdown bootstrap-select form-control">
                          <select
                            className="form-control"
                            id="related_products_datatable_search_supplier"
                          >
                            <option value="">All</option>
                            <option value="6370f131e714113f250556b3">
                              ABD
                            </option>
                          </select>
                          <button
                            type="button"
                            tabIndex={-1}
                            className="btn dropdown-toggle btn-light bs-placeholder"
                            data-toggle="dropdown"
                            role="combobox"
                            aria-owns="bs-select-3"
                            aria-haspopup="listbox"
                            aria-expanded="false"
                            data-id="related_products_datatable_search_supplier"
                            title="All"
                          >
                            <div className="filter-option">
                              <div className="filter-option-inner">
                                <div className="filter-option-inner-inner">
                                  All
                                </div>
                              </div>{" "}
                            </div>
                          </button>
                          <div className="dropdown-menu ">
                            <div
                              className="inner show"
                              role="listbox"
                              id="bs-select-3"
                              tabIndex={-1}
                            >
                              <ul
                                className="dropdown-menu inner show"
                                role="presentation"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-xl-4 mt-5 mt-lg-0 text-right"></div>
              </div>
            </div>
            {/*end::Search Form*/}
            {/*begin::Card*/}
            <div
              className="card card-custom scroll ps"
              data-scroll="true"
              data-height={300}
              style={{ height: 300, overflow: "hidden" }}
            >
              {/*begin: Datatable*/}
              <div
                className="datatable datatable-bordered datatable-head-custom datatable-destroyed datatable-default datatable-primary datatable-scroll datatable-loaded"
                id="related_products_datatable"
                style={{}}
              >
                <div className="ps__rail-x" style={{ left: 0, bottom: 0 }}>
                  <div
                    className="ps__thumb-x"
                    tabIndex={0}
                    style={{ left: 0, width: 0 }}
                  />
                </div>
                <div className="ps__rail-y" style={{ top: 0, right: 0 }}>
                  <div
                    className="ps__thumb-y"
                    tabIndex={0}
                    style={{ top: 0, height: 0 }}
                  />
                </div>
                <table className="datatable-table" style={{ display: "block" }}>
                  <thead className="datatable-head">
                    <tr className="datatable-row" style={{ left: 0 }}>
                      <th
                        data-field="id"
                        className="datatable-cell-center datatable-cell datatable-cell-check"
                      >
                        <span style={{ width: 20 }}>
                          <label className="checkbox checkbox-single checkbox-all">
                            <input type="checkbox" />
                            &nbsp;
                            <span />
                          </label>
                        </span>
                      </th>
                      <th
                        data-field="product_number"
                        className="datatable-cell datatable-cell-sort"
                      >
                        <span style={{ width: 133 }}>Product Number</span>
                      </th>
                      <th
                        data-field="name"
                        className="datatable-cell datatable-cell-sort"
                      >
                        <span style={{ width: 133 }}>Name</span>
                      </th>
                      <th
                        data-field="category"
                        className="datatable-cell datatable-cell-sort"
                      >
                        <span style={{ width: 133 }}>Category</span>
                      </th>
                      <th
                        data-field="brand_id"
                        className="datatable-cell datatable-cell-sort"
                      >
                        <span style={{ width: 133 }}>Brand</span>
                      </th>
                      <th
                        data-field="supplier_id"
                        className="datatable-cell datatable-cell-sort"
                      >
                        <span style={{ width: 133 }}>Supplier</span>
                      </th>
                      <th
                        data-field="_id"
                        data-autohide-disabled="false"
                        className="datatable-cell datatable-cell-sort"
                      >
                        <span style={{ width: 75 }}>Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="datatable-body ps" style={{}}>
                    <tr
                      data-row={0}
                      className="datatable-row"
                      style={{ left: 0 }}
                    >
                      <td
                        className="datatable-cell-center datatable-cell datatable-cell-check"
                        data-field="id"
                        aria-label="6371fee00a24cadeee0cea52"
                      >
                        <span style={{ width: 20 }}>
                          <label className="checkbox checkbox-single">
                            <input
                              type="checkbox"
                              defaultValue="6371fee00a24cadeee0cea52"
                            />
                            &nbsp;
                            <span />
                          </label>
                        </span>
                      </td>
                      <td
                        data-field="product_number"
                        aria-label={120272301461}
                        className="datatable-cell"
                      >
                        <span style={{ width: 133 }}>120272301461</span>
                      </td>
                      <td
                        data-field="name"
                        aria-label="Gulf Super Tractor Oil Universal 10W-30 20 LTR"
                        className="datatable-cell"
                      >
                        <span style={{ width: 133 }}>
                          Gulf Super Tractor Oil Universal 10W-30 20 LTR
                        </span>
                      </td>
                      <td
                        data-field="category"
                        aria-label="[object Object]"
                        className="datatable-cell"
                      >
                        <span style={{ width: 133 }}>Engine Oil</span>
                      </td>
                      <td
                        data-field="brand_id"
                        aria-label="6370f35108c016f1df08bd62"
                        className="datatable-cell"
                      >
                        <span style={{ width: 133 }}>Gulf</span>
                      </td>
                      <td
                        data-field="supplier_id"
                        aria-label="6370f24d28cb4245bc0257b2"
                        className="datatable-cell"
                      >
                        <span style={{ width: 133 }}>Rossmore Lubricants</span>
                      </td>
                      <td
                        data-field="_id"
                        data-autohide-disabled="false"
                        aria-label="6371fee00a24cadeee0cea52"
                        className="datatable-cell"
                      >
                        <span
                          style={{
                            overflow: "visible",
                            position: "relative",
                            width: 75,
                          }}
                        >
                          {" "}
                          <span className="action">
                            <a
                              href="javascript:;"
                              className="btn btn-sm btn-clean btn-icon mr-2 related_products"
                              title="Add Product "
                              data-id="6371fee00a24cadeee0cea52"
                            >
                              {" "}
                              <span className="svg-icon svg-icon-md">
                                {" "}
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  xmlnsXlink="http://www.w3.org/1999/xlink"
                                  width="24px"
                                  height="24px"
                                  viewBox="0 0 24 24"
                                  version="1.1"
                                >
                                  {" "}
                                  <g
                                    stroke="none"
                                    strokeWidth={1}
                                    fill="none"
                                    fillRule="evenodd"
                                  >
                                    {" "}
                                    <rect
                                      x={0}
                                      y={0}
                                      width={24}
                                      height={24}
                                    />{" "}
                                    <path
                                      d="M8,17.9148182 L8,5.96685884 C8,5.56391781 8.16211443,5.17792052 8.44982609,4.89581508 L10.965708,2.42895648 C11.5426798,1.86322723 12.4640974,1.85620921 13.0496196,2.41308426 L15.5337377,4.77566479 C15.8314604,5.0588212 16,5.45170806 16,5.86258077 L16,17.9148182 C16,18.7432453 15.3284271,19.4148182 14.5,19.4148182 L9.5,19.4148182 C8.67157288,19.4148182 8,18.7432453 8,17.9148182 Z"
                                      fill="#000000"
                                      fillRule="nonzero"
                                      transform="translate(12.000000, 10.707409) rotate(-135.000000) translate(-12.000000, -10.707409) "
                                    />{" "}
                                    <rect
                                      fill="#000000"
                                      opacity="0.3"
                                      x={5}
                                      y={20}
                                      width={15}
                                      height={2}
                                      rx={1}
                                    />{" "}
                                  </g>{" "}
                                </svg>{" "}
                              </span>{" "}
                            </a>
                          </span>
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {/*end: Datatable*/}
              <div className="ps__rail-x" style={{ left: 0, bottom: 0 }}>
                <div
                  className="ps__thumb-x"
                  tabIndex={0}
                  style={{ left: 0, width: 0 }}
                />
              </div>
              <div className="ps__rail-y" style={{ top: 0, right: 0 }}>
                <div
                  className="ps__thumb-y"
                  tabIndex={0}
                  style={{ top: 0, height: 0 }}
                />
              </div>
            </div>
            {/*end::Card*/}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Add;
