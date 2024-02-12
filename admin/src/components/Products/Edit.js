/* eslint-disable no-loop-func */
/* eslint-disable no-lone-blocks */
import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "react-modal";
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
  MultiReactSelectInput,
} from "../Form/Form";
import { BASEURL } from "../../constant/api";
import { urlToObject, arrayMoveMutable, createCustomId } from "../../util/fn";
import { SortableContainer, SortableItem } from "../Table/Table";

import {
  VariantMedia,
  Media,
  ProductMeta,
  AlternateProducts,
  ShippingSpecification,
  Faq,
  Feature,
  Tax,
  About,
  Price,
  Sidebar,
  TranslatedInfo,
  NewVariantEdit,
} from "./Components";

const VIDEO = [
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-ms-wmv",
  "video/webm",
];

const tablePlaceholderObj = {
  _quantity: "Quantity",
  _height: "Height",
  _weight: "Weight",
  _width: "Width",
  _length: "Length",
};

const locationObj = {
  1: [
    "name",
    "vendor",
    "serialNumber",
    "barCode",
    "masterCategoryId",
    "subCategoryId",
    "brandId",
    "unitId",
    "warehouses",
    "quantity",
    "countries",
    "isPublished",
  ],
  2: ["buyingPrice"],
  5: ["featureTitle"],
  6: ["height", "weight", "width", "length"],
};
const Edit = (props) => {
  const { id: recordId } = props.match.params;

  const {
    register,
    handleSubmit,
    formState: { errors, submitCount },
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
  const { request: requestData, response: responseData } = useRequest();
  // const { response: responseVariant, request: requestVariant } = useRequest();
  const { response: responseFeaturesNFaqs, request: requestFeaturesNFaqs } =
    useRequest();
  // const { response: responseTaxes, request: requestTaxes } = useRequest();
  // const { response: responseBrands, request: requestBrands } = useRequest();
  const { response: responseDefaultData, request: requestDefaultData } =
    useRequest();

  const variantCustomIdObj = useRef(1);

  // const [allVendors, setAllVendors] = useState([]); //vendors list
  // const [mainCategories, setMainCategories] = useState([]); //vendor's main categories
  // const [subCategories, setSubCategories] = useState([]);
  // const [subCategoriesForRS, setSubCategoriesForRS] = useState([]); //sub categories of main category
  // const [warehouses, setWarehouses] = useState([]); //vendor's warehouses
  const [brands, setBrands] = useState([]); //all brands
  // const [allVendorsForRS, setAllVendorsForRS] = useState([]);
  const [variants, setVariants] = useState([]); //variants based on sub categories

  const [checkedVariants, setCheckedVariants] = useState([]);

  const [mainCategoriesForRS, setMainCategoriesForRS] = useState([]);
  // const [countries, setCountries] = useState([]); //vendor's countries
  const [units, setUnits] = useState([]);
  // const [taxes, setTaxes] = useState([]);
  // const [similarProducts, setSimilarProducts] = useState([]);

  // const [firstVariants, setFirstVariants] = useState([]);
  // const [secondVariants, setSecondVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState({
    variant1: null,
    variant2: null,
  });

  // const [selectedWarehouses, setSelectedWarehouses] = useState([]);
  // const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  // const [selectedSubCategory, setSelectedSubCategory] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  // const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState([]);

  const [features, setFeatures] = useState([
    // { id: 0, isMultiSelect: false, options: {} },
  ]);
  const [nextId, setNextId] = useState(1);

  const [mediaFiles, setMediaFiles] = useState([]); //media in binary
  const [previewMediaFiles, setPreviewMediaFiles] = useState([]);
  const [mediaNextId, setMediaNextId] = useState(1);

  const [selectedMedia, setSelectedMedia] = useState({
    main: [],
  });

  const [featuredMediaId, setFeaturedMediaId] = useState(null);
  // const [variantCount, setVariantCount] = useState(null); //total sub variants selected
  const [variantTh, setVariantTh] = useState([]); //heading of variant's table
  // const [variantObj, setVariantObj] = useState({}); //for delete
  const [variantCountArr, setVariantCountArr] = useState([]);
  const [alreadySavedVariantIds, setAlreadySavedVariantIds] = useState([]);

  const [isFirstStageVariantModalOpen, setIsFirstStageVariantModalOpen] =
    useState(false);

  const [isSecondStageVariantModalOpen, setIsSecondStageVariantModalOpen] =
    useState(false);

  const [isVariantModalOpen, setIsVaraintModalOpen] = useState(false); //variant customization modal
  const [masterVariant, setMasterVariant] = useState(null); //subcategories' master variant
  const [variantSelectionCount, setVariantSelectionCount] = useState(0); //number of variant selected
  const [subVariants, setSubVariants] = useState([]); //selected sub variants

  const [isAddVariantModalOpen, setIsAddVariantModalOpen] = useState(false); //add modal state
  const [subVariantsAdd, setSubVariantsAdd] = useState([]); //sub variants to add (variantId, subCategoryId, name, languagesData)
  const [searchValue, setSearchValue] = useState("");

  // const [taxesToShow, setTaxesToShow] = useState([]);

  const [selectedProductsObject, setSelectedProductsObjects] = useState({
    ids: [],
    data: [], //id,name
  });

  const [faqs, setFaqs] = useState([{ id: 0 }]);
  const [faqNextId, setFaqNextId] = useState(1);

  const [isOptional, setIsOptional] = useState(false);
  const [currencies, setCurrencies] = useState([]);

  const [variantOptions, setVariantOptions] = useState({
    // mainVariantOptions: [],
    mainVariantChildOptions: [],
    secondVariantOptions: [],
    secondVariantChildOptions: [],
  });

  // const [isDataSet, setIsDataSet] = useState(false);

  const [variantsOrder, setVariantsOrder] = useState({});

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [slugValidation, setSlugValidation] = useState(
    // languages.map((lang) => ({ [lang.code]: null }))
    { en: null, ar: null, tr: null }
  );

  const [shippingCompanies, setShippingCompanies] = useState([]);

  const history = useHistory();

  const { languages } = useSelector((state) => state.setting);

  useEffect(() => {
    document.title = "Edit Product - Noonmar";
    requestData("GET", `product/edit-data/${recordId}`);
    register("subVariant");

    if (languages) {
      languages.forEach((lang, index) => {
        if (lang.default) {
          register(`description-${lang.code}`, { required: true });
          register(`shortDescription-${lang.code}`, { required: true });
        } else {
          register(`description-${lang.code}`);
          register(`shortDescription-${lang.code}`);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (errors) {
      const firstKey = Object.keys(errors)[0];

      if (!firstKey) {
        return;
      }

      const locationObjKeys = Object.keys(locationObj);

      let location = null;

      for (let i = 0; i < locationObjKeys.length; i++) {
        const key = locationObjKeys[i];

        if (locationObj[key].includes(firstKey)) {
          location = key;
          break;
        }
      }

      if (firstKey.includes("shortDescription")) {
        location = 3;
      }

      if (
        firstKey.includes("featurelabel") ||
        firstKey.includes("featureValue")
      ) {
        location = 5;
      }

      if (firstKey === "subVariant") {
        const key = Object.keys(errors["subVariant"])[0];

        [
          "_quantity",
          "_height",
          "_weight",
          "_width",
          "_length",
          "_discountedPrice_",
          "_sellingPrice_",
        ].forEach((a) => {
          if (key.includes(a)) {
            location = 10;
          }
        });
      } else if (
        firstKey.includes("sellingPrice_") ||
        firstKey.includes("discountedPrice_")
      ) {
        location = 2;
      }

      if (location !== null) {
        const ele = document.querySelector(`[href="#kt_tab_pane_${location}"]`);
        if (ele) {
          ele.click();
        }
      }
    }
  }, [submitCount]);

  useEffect(() => {
    if (responseData) {
      const {
        product,
        // taxes,
        // editData,
        // subProductData,
        units,
        // similarProducts,
        variants,
        // countries,
        currencies,
        specifications,
        shippingCompanies,
      } = responseData;
      // const brandData = subProductData?.brandData || [];

      // setSimilarProducts(similarProducts);

      setCurrencies(currencies);
      setShippingCompanies(
        shippingCompanies.map((sc) => ({
          label: sc.name,
          value: sc._id,
        }))
      );

      product.langData.forEach((lang) => {
        const code = lang.languageCode;
        setValue(`name-${code}`, lang.name);
        setValue(`slug-${code}`, lang.slug);
      });

      setValue("barCode", product.barCode);
      setValue("hsCode", product.hsCode);
      setValue("customId", product.customId);

      // setAllVendorsForRS([
      //   { value: product.vendor._id, label: product.vendor.businessName },
      // ]);

      // setValue("vendor", product.vendor._id);

      // setSelectedVendor({
      //   label: product.vendor.businessName,
      //   value: product.vendor._id,
      // });

      // setValue("serialNumber", product.serialNumber);

      // setMainCategories(editData.mainCategories);
      // setMainCategoriesForRS(
      //   editData.mainCategories.map((item) => {
      //     return { value: item._id, label: item.name };
      //   })
      // );

      if (product.categoryId) {
        setValue("categoryId", product.categoryId);

        // setSelectedCategory({
        //   label: product.category.name,
        //   value: product.category._id,
        // });

        // const subCategories =
        //   editData.mainCategories
        //     .find((m) => m._id === product.category._id)
        //     ?.subCategories.map((sc) => ({
        //       value: sc._id,
        //       label: sc.name,
        //     })) ?? [];

        // setSubCategoriesForRS(subCategories);

        // setValue("subCategoryId", product.subCategory._id);

        // setSelectedSubCategory({
        //   label: product.subCategory.name,
        //   value: product.subCategory._id,
        // });
      }

      // setBrands(brandData);

      if (product.brand) {
        setValue("brandId", product.brand._id);

        setSelectedBrands({
          label: product.brand.name,
          value: product.brand._id,
        });
      }

      setUnits(
        units.map((item) => {
          return { value: item._id, label: item.name };
        })
      );

      if (product.unit) {
        setValue("unitId", product.unit._id);

        setSelectedUnits({
          label: product.unit.name,
          value: product.unit._id,
        });
      }

      // setSelectedWarehouses(
      //   product.warehouse.map((w) => ({
      //     label: w.name,
      //     value: w._id,
      //   }))
      // );

      // setValue(
      //   "warehouses",
      //   product.warehouse.map((w) => w._id)
      // );

      // setWarehouses(editData.warehouses);

      // setValue("quantity", product.quantity);

      // setCountries(countries.countries);

      // setValue(
      //   "countries",
      //   product.countries.map((e) => e._id)
      // );

      // setSelectedCountries(
      //   product.countries.map((c) => ({
      //     label: c.name,
      //     value: c._id,
      //   }))
      // );

      setValue("isPublished", product.isPublished ? "publish" : "draft");

      setIsOptional(!product.isPublished);
      // setValue("inStock", product.inStock);

      //second page

      if (product.buyingPrice) {
        setValue("buyingPrice", product.buyingPrice);
      }

      setTimeout(() => {
        if (product.buyingPriceCurrency) {
          setValue("currency", product.buyingPriceCurrency);
        }
      }, 0);

      // if (product.buyingPriceCurrency) {
      //   setValue("currency", product.buyingPriceCurrency);
      // }

      if (product.sellingPrice) {
        setValue("sellingPrice", product.sellingPrice);
      }

      // product.countries.forEach((c) => {
      //   const price = product.prices.find((p) => p.countryId === c._id);

      //   setValue(`sellingPrice_${c._id}`, price.sellingPrice);
      //   setValue(`discountedPrice_${c._id}`, price.discountPrice);
      // });

      //third page
      product.langData.forEach((lang) => {
        const code = lang.languageCode;
        setValue(`shortDescription-${code}`, lang.shortDescription ?? " ");
        setValue(`description-${code}`, lang.longDescription ?? "");
        // setValue(
      });

      // if (product.descriptionData.length > 0) {
      //   product.descriptionData.forEach((d) => {
      //     setValue(`shortDescription-${d.languageCode}`, d.shortDescription);
      //     setValue(`description-${d.languageCode}`, d.longDescription ?? " ");
      //   });
      // } else {
      //   for (let i = 0; i < languages.length; i++) {
      //     const code = languages[i].code;
      //     setValue(`description-${code}`, " ");
      //   }
      // }

      //fourth page

      // setTaxes(taxes);

      // const taxesToShow = [];

      // taxes.forEach((tax) => {
      //   if (product.countries.find((c) => c._id === tax._id)) {
      //     taxesToShow.push(tax);
      //   }
      // });

      // setTaxesToShow(taxes);

      // product.tax.forEach((t) => {
      //   setValue(`tax-${t.countryId}-${t._id}`, true);
      // });

      //fifth page

      if (specifications.length > 0) {
        const newFeatures = specifications.map((sp, idx) => {
          const options = {};

          sp.langData.forEach((lang) => {
            setValue(`featureLabel${idx}-${lang.languageCode}`, lang.name);
          });

          sp.values.forEach((val) => {
            val.langData.forEach((lang) => {
              if (options[lang.languageCode]) {
                options[lang.languageCode] = [
                  ...options[lang.languageCode],
                  {
                    label: lang.name,
                    value: val._id,
                  },
                ];
              } else {
                options[lang.languageCode] = [
                  { label: lang.name, value: val._id },
                ];
              }

              if (val.isSelected) {
                setValue(`featureValue${idx}-${lang.languageCode}`, {
                  label: lang.name,
                  value: val._id,
                });
              }
            });
          });

          // options[lang.languageCode] = lang.values.map((s, idx) => ({
          //   label: s,
          //   value: idx,
          // }));

          return {
            id: idx,
            isMultiSelect: options["en"].length > 0,
            options,
            spId: sp._id,
            isRequired: product.categoryData.requiredSpecificationIds.includes(
              sp.specificationId
            ),
          };
        });

        setFeatures(newFeatures);
        setNextId(newFeatures.length);

        // const features = product.langData.find(
        //   (lang) => lang.languageCode === "en"
        // )?.features;

        // const newFeatures = specifications.map((sp, idx) => {
        //   const options = {};

        //   const selectedFeature = features.find((f) => f.id === sp._id);

        //   const enValues = sp.langData.find(
        //     (l) => l.languageCode === "en"
        //   )?.values;

        //   let valIdx = enValues.findIndex((v) => v === selectedFeature.value);

        //   //Change in future, will create an issue also remove muti language
        //   if (valIdx === -1) {
        //     valIdx = 0;
        //   }

        //   sp.langData.forEach((lang) => {
        //     setValue(`featureLabel${idx}-${lang.languageCode}`, lang.name);
        //     options[lang.languageCode] = lang.values.map((s, idx) => ({
        //       label: s,
        //       value: idx,
        //     }));

        //     if (selectedFeature) {
        //       // setTimeout(() => {
        //       setValue(
        //         `featureValue${idx}-${lang.languageCode}`,
        //         options[lang.languageCode][valIdx]
        //       );
        //       // }, 1000);
        //     }
        //   });

        //   return {
        //     id: idx,
        //     isMultiSelect: options["en"].length > 0,
        //     options,
        //     spId: sp._id,
        //   };
        // });

        // setFeatures(newFeatures);
        // setNextId(newFeatures.length);
      }

      // setValue("featureTitle", product.featureTitle);

      // if (product.featuresData.length > 0) {
      //   setFeatures(
      //     product.featuresData[0].features.map((_, id) => ({
      //       id,
      //       isMultiSelect: false,
      //       options: {},
      //     }))
      //   );

      //   setNextId(product.featuresData[0].features.length);

      //   product.featuresData.forEach((d) => {
      //     d.features.forEach((f, idx) => {
      //       setValue(`featureLabel${idx}-${d.languageCode}`, f.label);
      //       setValue(`featureValue${idx}-${d.languageCode}`, f.value);
      //     });
      //   });
      // }

      //sixth page

      setFaqs(product.langData[0]?.faqs.map((_, idx) => ({ id: idx })));

      product.langData.forEach((lang) => {
        const code = lang.languageCode;

        lang.faqs.forEach((f, idx) => {
          setValue(`faqQuestion${idx}-${code}`, f.question);
          setValue(`faqAnswer${idx}-${code}`, f.answer);
        });

        setValue(`shortDescription-${code}`, lang.shortDescription ?? " ");
        setValue(`description-${code}`, lang.longDescription ?? "");
      });

      setFaqNextId(product.langData[0]?.faqs.length);

      // if (product.faqsData.length > 0) {
      //   setFaqs(product.faqsData[0].faqs.map((_, idx) => ({ id: idx })));

      //   product.faqsData.forEach((d) => {
      //     d.faqs.forEach((f, idx) => {
      //       setValue(`faqQuestion${idx}-${d.languageCode}`, f.question);
      //       setValue(`faqAnswer${idx}-${d.languageCode}`, f.answer);
      //     });
      //   });

      //   setFaqNextId(product.faqsData[0].faqs.length);
      // }

      //seventh page
      setValue("height", product.height);
      setValue("weight", product.weight);
      setValue("width", product.width);
      setValue("length", product.length);
      setValue("dc", product.dc);
      if (product.shippingCompany) {
        setValue("shippingCompany", {
          label: product.shippingCompany.name,
          value: product.shippingCompany._id,
        });
      }

      //8th page

      setSelectedProductsObjects({
        ids: product.alternateProducts.map((a) => a._id),
        data: product.alternateProducts.map((a) => ({
          id: a._id,
          name: a.name,
        })),
      });

      //9th page

      // if (product.metaData) {
      // setValue("metaData", product.metaData);
      // }

      product.langData.forEach((lang) => {
        const code = lang.languageCode;

        for (let key in lang.metaData) {
          if (key !== "keywords") {
            setValue(`metaData.${key}-${code}`, lang.metaData[key]);
          } else {
            if (lang.metaData[key]) {
              setValue(
                `metaData.${key}-${code}`,
                lang.metaData[key].split(",")
              );
            }
          }
        }
      });

      //10th page

      if (product.variantsData.length > 0) {
        let ids = [];

        const firstVariantProduct = product.variantsData[0];

        const twoVariants = !!firstVariantProduct.secondVariantId;

        // const masterVariant = editData.mainCategories
        //   .find((m) => m._id === product.category._id)
        //   ?.subCategories.find(
        //     (sc) => sc._id === product.subCategory._id
        //   )?.masterVariant;

        const masterVariant = product.categoryData.masterVariantId;

        setMasterVariant(masterVariant);

        const variantsWithChecked = variants
          .map((v, idx) => ({
            ...v,
            order:
              product.variants.find((pv) => pv.id === v._id)?.order ||
              variants.length - idx,
            show: true,
            isMasterVariant: masterVariant === v._id,
            isChecked:
              masterVariant === v._id ||
              !!product.variants.find((pv) => pv.id === v._id),
            subVariants: v.subVariants.map((sv) => ({
              ...sv,
              isChecked: !!product.variantsData.find(
                (pv) =>
                  pv.firstSubVariantId === sv.id ||
                  pv.secondSubVariantId === sv.id
              ),
              isAdded: false,
            })),
          }))
          .sort((a, b) => b.isMasterVariant - a.isMasterVariant);

        setVariants(variantsWithChecked);
        setCheckedVariants(variantsWithChecked);

        const orderObj = {
          length: 0,
        };

        for (let i = 0; i < variantsWithChecked.length; i++) {
          const item = variantsWithChecked[i];
          orderObj[item._id] = item.order;
          orderObj.length = orderObj.length + 1;
        }

        setVariantsOrder(orderObj);

        if (twoVariants) {
          setVariantSelectionCount(2);

          setSelectedVariant({
            variant1: {
              _id: firstVariantProduct.firstVariantId,
              name: firstVariantProduct.firstVariantName,
              subVariants: variantsWithChecked
                .find((v) => v._id === firstVariantProduct.firstVariantId)
                .subVariants.filter((sv) => sv.isChecked),
            },
            variant2: {
              _id: firstVariantProduct.secondVariantId,
              name: firstVariantProduct.secondVariantName,
              subVariants: variantsWithChecked
                .find((v) => v._id === firstVariantProduct.secondVariantId)
                .subVariants.filter((sv) => sv.isChecked),
            },
          });

          for (let i = 0; i < product.variantsData.length; i++) {
            const variant = product.variantsData[i];

            const id = variant.firstSubVariantId + variant.secondSubVariantId;
            ids.push(id);

            const key = `subVariant.${id}`;

            setValue(`${key}_firstId`, variant.firstSubVariantId);
            setValue(`${key}_first`, variant.firstSubVariantName);
            setValue(`${key}_secondId`, variant.secondSubVariantId);
            setValue(`${key}_second`, variant.secondSubVariantName);
            // setValue(`${key}_quantity`, variant.quantity);
            setValue(`${key}_height`, variant.height);
            setValue(`${key}_weight`, variant.weight);
            setValue(`${key}_width`, variant.width);
            setValue(`${key}_length`, variant.length);

            setValue(`${key}_dc`, variant.dc);
            setValue(`${key}_shippingCompany`, variant.shippingCompany);
            setValue(`${key}_barCode`, variant.barCode);
            setValue(`${key}_productId`, variant.customId);
            setValue(`${key}_status`, variant.isActive);

            setValue(`${key}_buyingPrice`, variant.buyingPrice);
            // setValue(`${key}_currency`, variant.buyingPriceCurrency);
            setTimeout(() => {
              setValue(`${key}_currency`, variant.buyingPriceCurrency);
            }, 0);
            setValue(`${key}_sellingPrice`, variant.sellingPrice);

            // variant.prices.forEach((sc) => {
            //   setValue(`${key}_sellingPrice_${sc.countryId}`, sc.sellingPrice);
            //   setValue(
            //     `${key}_discountedPrice_${sc.countryId}`,
            //     sc.discountPrice
            //   );
            // });
          }

          setVariantCountArr(ids);
          setAlreadySavedVariantIds(ids);

          setVariantTh([
            firstVariantProduct.firstVariantName,
            firstVariantProduct.secondVariantName,
            "Quantity",
            "Height",
            "Weight",
            "Width",
            "Length",
          ]);
        } else {
          setVariantSelectionCount(1);

          setSelectedVariant({
            variant1: {
              _id: firstVariantProduct.firstVariantId,
              name: firstVariantProduct.firstVariantName,
              subVariants: variantsWithChecked
                .find((v) => v._id === firstVariantProduct.firstVariantId)
                .subVariants.filter((sv) => sv.isChecked),
            },
            variant2: null,
          });

          for (let i = 0; i < product.variantsData.length; i++) {
            const variant = product.variantsData[i];

            const id = variant.firstSubVariantId;
            ids.push(id);

            const key = `subVariant.${id}`;

            setValue(`${key}_firstId`, variant.firstSubVariantId);
            setValue(`${key}_first`, variant.firstSubVariantName);
            setValue(`${key}_quantity`, variant.quantity);
            setValue(`${key}_height`, variant.height);
            setValue(`${key}_weight`, variant.weight);
            setValue(`${key}_width`, variant.width);
            setValue(`${key}_length`, variant.length);

            setValue(`${key}_dc`, variant.dc);
            setValue(`${key}_shippingCompany`, variant.shippingCompany);
            setValue(`${key}_barCode`, variant.barCode);
            setValue(`${key}_productId`, variant.customId);
            setValue(`${key}_status`, variant.isActive);

            setValue(`${key}_buyingPrice`, variant.buyingPrice);

            setTimeout(() => {
              setValue(`${key}_currency`, variant.buyingPriceCurrency);
            }, 0);

            setValue(`${key}_sellingPrice`, variant.sellingPrice);

            // variant.prices.forEach((sc) => {
            //   setValue(`${key}_sellingPrice_${sc._id}`, sc.sellingPrice);
            //   setValue(`${key}_discountedPrice_${sc._id}`, sc.discountPrice);
            // });
          }

          setVariantTh([
            firstVariantProduct.firstVariantName,
            "Quantity",
            "Height",
            "Weight",
            "Width",
            "Length",
          ]);

          setVariantCountArr(ids);
          setAlreadySavedVariantIds(ids);
        }

        {
          const masterVariantData = variantsWithChecked.find(
            (v) => v.isMasterVariant && v.isChecked
          );

          let mainVariantChildOptions = [];
          let secondVariantChildOptions = [];

          if (masterVariantData) {
            setValue("selectVariant1", {
              label: masterVariantData.name,
              value: masterVariantData._id,
            });

            const values = masterVariantData.subVariants.filter(
              (sv) => sv.isChecked
            );

            mainVariantChildOptions = masterVariantData.subVariants.map(
              (v) => ({
                label: v.name,
                value: v.id,
              })
            );

            setValue(
              "selectVariantValues1",
              values.map((v) => ({
                label: v.name,
                value: v.id,
              }))
            );
          }

          const secondVariantData = variantsWithChecked.find(
            (v) => !v.isMasterVariant && v.isChecked
          );

          if (secondVariantData) {
            setValue("selectVariant2", {
              label: secondVariantData.name,
              value: secondVariantData._id,
            });

            const values = secondVariantData.subVariants.filter(
              (sv) => sv.isChecked
            );

            secondVariantChildOptions = secondVariantData.subVariants.map(
              (v) => ({
                label: v.name,
                value: v.id,
              })
            );

            setValue(
              "selectVariantValues2",
              values.map((v) => ({
                label: v.name,
                value: v.id,
              }))
            );
          }

          const secondVariantOptions = variantsWithChecked
            .filter((v) => !v.isMasterVariant)
            .map((v) => ({
              label: v.name,
              value: v._id,
            }));

          setVariantOptions({
            mainVariantChildOptions,
            secondVariantOptions,
            secondVariantChildOptions,
          });
        }

        const masterVariantValues = product.variantsData.reduce((acc, cv) => {
          // if (!acc.includes(cv.firstSubVariantName)) {
          //   acc.push(cv.firstSubVariantName);
          // }
          if (!acc[cv.firstSubVariantId]) {
            acc[cv.firstSubVariantId] = cv.firstSubVariantName;
          }
          return acc;
        }, {});

        const subVariants = [];

        for (let key in masterVariantValues) {
          subVariants.push({
            id: key,
            name: masterVariantValues[key],
          });
        }

        // const subVariants = masterVariantValues.map((value) => ({
        //   name: value,
        // }));

        setSubVariants(subVariants);

        //media handling - start

        const vMap = new Map();

        const variantMedia = product.variantsData.reduce((acc, cv) => {
          if (!acc.has(cv.firstSubVariantId)) {
            acc.set(cv.firstSubVariantId, cv.media);
          }
          return acc;
        }, vMap);

        // const mediaFiles = [];
        const newPreviewMediaFiles = [];
        let newSelectedMedia = { ...selectedMedia };

        const newSelectedMediaArr = [];

        for (let i = 0; i < product.media.length; i++) {
          const media = product.media[i];
          const id = mediaNextId + i;

          urlToObject(BASEURL.PORT + "/" + media.src).then((data) => {
            const file = new File([data], "image.jpg", { type: data.type });
            setMediaFiles((prev) => [
              ...prev,
              {
                id,
                file,
              },
            ]);

            setMediaNextId((prev) => prev + 1);
          });

          newPreviewMediaFiles.push({
            media: BASEURL.PORT + "/" + media.src,
            isVideo: !media.isImage,
            id,
          });

          newSelectedMediaArr.push({
            media: BASEURL.PORT + "/" + media.src,
            isVideo: !media.isImage,
            id,
            isSelected: true,
          });
        }

        if (product.coverImage) {
          setFeaturedMediaId(
            product.media.findIndex((m) => m.src === product.coverImage) + 1
          );
        }

        newSelectedMedia.main = newSelectedMediaArr;

        const idArr = Array(subVariants.length)
          .fill(null)
          .map((_, idx) => idx);

        const iterator1 = variantMedia.values();

        idArr.forEach((id) => {
          const values = iterator1.next().value;

          newSelectedMedia[id] = newSelectedMediaArr.map((m) => ({
            ...m,
            isSelected: !!values.find(
              (v) => BASEURL.PORT + "/" + v.src === m.media
            ),
          }));
        });

        setSelectedMedia(newSelectedMedia);

        // setMediaFiles(mediaFiles);
        setPreviewMediaFiles(newPreviewMediaFiles);

        // setMediaNextId((prev) => prev + mediaFiles.length);

        //media handling - end
      } else {
        variantInitialHandler(
          variants.map((v) => ({
            ...v,
            isMasterVariant: v._id === product.categoryData?.masterVariantId,
          }))
        );
        // const mediaFiles = [];
        const newPreviewMediaFiles = [];
        let newSelectedMedia = { ...selectedMedia };

        const newSelectedMediaArr = [];

        for (let i = 0; i < product.media.length; i++) {
          const media = product.media[i];
          const id = mediaNextId + i;

          // mediaFiles.push({ id, file: media.src });

          urlToObject(BASEURL.PORT + "/" + media.src).then((data) => {
            const file = new File([data], "image.jpg", { type: data.type });
            setMediaFiles((prev) => [
              ...prev,
              {
                id,
                file,
              },
            ]);
            setMediaNextId((prev) => prev + 1);
          });

          newPreviewMediaFiles.push({
            media: BASEURL.PORT + "/" + media.src,
            isVideo: !media.isImage,
            id,
          });

          newSelectedMediaArr.push({
            media: BASEURL.PORT + "/" + media.src,
            isVideo: !media.isImage,
            id,
            isSelected: true,
          });

          // if (media.isFeatured) {
          //   setFeaturedMediaId(id);
          // }
        }

        if (product.coverImage) {
          setFeaturedMediaId(
            product.media.findIndex((m) => m.src === product.coverImage) + 1
          );
        }

        newSelectedMedia.main = newSelectedMediaArr;

        setSelectedMedia(newSelectedMedia);

        // setMediaFiles(mediaFiles);
        setPreviewMediaFiles(newPreviewMediaFiles);

        // setMediaNextId((prev) => prev + mediaFiles.length);
      }

      //11th page

      //features, faqs, variant, media

      requestDefaultData("GET", "product/add-data");
    }
  }, [responseData]);

  useEffect(() => {
    if (responseDefaultData) {
      setMainCategoriesForRS(responseDefaultData.categories);
      // setCurrencies(responseDefaultData.currencies);
      setBrands(
        responseDefaultData.brands.map((brand) => ({
          label: brand.name,
          value: brand._id,
        }))
      );

      const selectedId = responseData.product.categoryId;

      setSelectedCategory({
        label: responseDefaultData.categories.find(
          (c) => c.value === selectedId
        )?.label,
        value: selectedId,
      });

      variantCustomIdObj.current = responseDefaultData.variantCustomId;

      // setShippingCompanies(
      //   responseDefaultData.shippingCompanies.map((sc) => ({
      //     label: sc.name,
      //     value: sc._id,
      //   }))
      // );
    }
  }, [responseDefaultData]);

  // useEffect(() => {
  //   if (responseVariant) {
  //     const variants = responseVariant.variants;
  //     // setFirstVariants(variants);
  //     // setSecondVariants(variants);
  //     setVariants(
  //       variants
  //         .map((v) => ({
  //           ...v,
  //           show: true,
  //           isChecked: masterVariant === v._id,
  //           subVariants: v.subVariants.map((sv) => ({
  //             ...sv,
  //             isChecked: masterVariant === v._id,
  //             isAdded: false,
  //           })),
  //         }))
  //         .sort((a, b) => b.isChecked - a.isChecked)
  //     );

  //     setVariantSelectionCount(variants.length > 0 ? 1 : 0);

  //     setSubVariantsAdd([]);

  //     unregister("subVariant");

  //     setSelectedVariant({
  //       variant1: null,
  //       variant2: null,
  //     });

  //     setVariantCountArr([]);
  //     setVariantTh([]);

  //     setSubVariants([]);
  //     setSelectedMedia({
  //       main: selectedMedia["main"],
  //     });
  //   }
  // }, [responseVariant]);

  useEffect(() => {
    if (response) {
      toast.success(response.message);
      history.push("/products");
    }
  }, [response]);

  // useEffect(() => {
  //   if (responseTaxes) {
  //     const taxes = responseTaxes.taxes;
  //     setTaxes(taxes);

  //     const { countries } = responseTaxes.countries;

  //     setCountries(countries);
  //     setSelectedCountries(countries);
  //     setValue(
  //       "countries",
  //       countries.map((e) => e.value)
  //     );

  //     taxHTMLHandler(countries, taxes, true);
  //   }
  // }, [responseTaxes]);

  // useEffect(() => {
  //   if (responseBrands && responseBrands.data) {
  //     const {
  //       data: { brandData },
  //     } = responseBrands.data;

  //     setBrands(brandData);
  //   }
  // }, [responseBrands]);

  useEffect(() => {
    if (responseFeaturesNFaqs) {
      const { data } = responseFeaturesNFaqs;

      if (!data) {
        return;
      }

      const { specificationData, variantData, requiredSpecificationIds } = data;

      if (specificationData.length > 0) {
        const newFeatures = specificationData.map((sp, idx) => {
          const options = {};

          sp.langData.forEach((lang) => {
            setValue(`featureLabel${idx}-${lang.languageCode}`, lang.name);
            // options[lang.languageCode] = lang.values.map((s, idx) => ({
            //   label: s,
            //   value: idx,
            // }));
          });

          sp.values.forEach((val) => {
            val.langData.forEach((lang) => {
              if (options[lang.languageCode]) {
                options[lang.languageCode] = [
                  ...options[lang.languageCode],
                  {
                    label: lang.name,
                    value: val._id,
                  },
                ];
              } else {
                options[lang.languageCode] = [
                  { label: lang.name, value: val._id },
                ];
              }
            });
          });

          return {
            id: idx,
            isMultiSelect: options["en"].length > 0,
            options,
            spId: sp._id,
            isRequired: requiredSpecificationIds.includes(sp._id),
          };
        });

        setFeatures(newFeatures);
        setNextId(newFeatures.length);
      }

      if (variantData.length > 0) {
        setVariants(
          variantData
            .map((v) => ({
              ...v,
              show: true,
              isChecked: v.isMasterVariant,
              subVariants: v.subVariants.map((sv) => ({
                ...sv,
                isChecked: v.isMasterVariant,
                isAdded: false,
              })),
            }))
            .sort((a, b) => b.isChecked - a.isChecked)
        );

        setVariantSelectionCount(variantData.length > 0 ? 1 : 0);
        setSubVariantsAdd([]);

        const masterVariant = variantData.find((v) => v.isMasterVariant);

        if (masterVariant) {
          setMasterVariant(masterVariant._id);

          setValue("selectVariant1", {
            label: masterVariant.name,
            value: masterVariant._id,
          });

          setVariantOptions((prev) => ({
            ...prev,
            mainVariantChildOptions:
              masterVariant.subVariants.map((sv) => ({
                label: sv.name,
                value: sv.id,
              })) || [],
            secondVariantOptions:
              variantData
                .filter((v) => !v.isMasterVariant)
                .map((v) => ({
                  value: v._id,
                  label: v.name,
                })) || [],
          }));
        }

        unregister("subVariant");
        setSelectedVariant({
          variant1: null,
          variant2: null,
        });
        // setVariantCount(null);
        setVariantTh([]);

        setSubVariants([]);
        setSelectedMedia({
          main: selectedMedia["main"],
        });
      }

      return;

      if (data.length > 0) {
        // const newFeatures = Array(data[0].featuresLength)
        //   .fill(0)
        //   .map((_, idx) => ({ id: idx }));

        const newFaqs = Array(data[0].faqsLength)
          .fill(0)
          .map((_, idx) => ({ id: idx }));

        // setFeatures(newFeatures);
        // setNextId(newFeatures.length);

        setFaqs(newFaqs);
        setFaqNextId(newFaqs.length);

        data.forEach((d, index) => {
          d.features.forEach((feature, idx) => {
            setValue("featureLabel" + idx + "-" + d.languageCode, feature);
          });
          d.faqs.forEach((faq, idx) => {
            setValue("faqQuestion" + idx + "-" + d.languageCode, faq);
          });
        });
      }
    }
  }, [responseFeaturesNFaqs]);

  // const filterForRS = (inputValue, array) => {
  //   return array
  //     .filter((i) => i.label.toLowerCase().includes(inputValue.toLowerCase()))
  //     .slice(0, 5);
  // };

  // const vendorPromiseOptions = (inputValue) =>
  //   new Promise((resolve) => {
  //     resolve(
  //       filterForRS(
  //         inputValue,
  //         allVendors.map((item) => {
  //           return { value: item._id, label: item.businessName };
  //         })
  //       )
  //     );
  //   });

  const variantInitialHandler = (variantData) => {
    if (variantData.length > 0) {
      setVariants(
        variantData
          .map((v) => ({
            ...v,
            show: true,
            isChecked: v.isMasterVariant,
            subVariants: v.subVariants.map((sv) => ({
              ...sv,
              // isChecked: v.isMasterVariant,
              isChecked: false,
              isAdded: false,
            })),
          }))
          .sort((a, b) => b.isChecked - a.isChecked)
      );

      setVariantSelectionCount(variantData.length > 0 ? 1 : 0);
      setSubVariantsAdd([]);

      const masterVariant = variantData.find((v) => v.isMasterVariant);

      if (masterVariant) {
        setMasterVariant(masterVariant._id);

        setValue("selectVariant1", {
          label: masterVariant.name,
          value: masterVariant._id,
        });

        setVariantOptions((prev) => ({
          ...prev,
          mainVariantChildOptions:
            masterVariant.subVariants.map((sv) => ({
              label: sv.name,
              value: sv.id,
            })) || [],
          secondVariantOptions:
            variantData
              .filter((v) => !v.isMasterVariant)
              .map((v) => ({
                value: v._id,
                label: v.name,
              })) || [],
        }));
      } else {
        setMasterVariant(null);
      }

      unregister("subVariant");
      setSelectedVariant({
        variant1: null,
        variant2: null,
      });
      // setVariantCount(null);
      setVariantTh([]);

      setSubVariants([]);
      setSelectedMedia({
        main: selectedMedia["main"],
      });
    } else {
      setMasterVariant(null);
      setVariants([]);
      setVariantSelectionCount(0);
      setSubVariantsAdd([]);
    }
  };

  const onSubmit = (data) => {
    // if (!featuredMediaId) {
    //   return;
    // }

    let isSlugError = false;

    for (let key in slugValidation) {
      if (slugValidation[key]) {
        setError(`slug-${key}`, {
          type: "manual",
        });
        isSlugError = true;
      }
    }

    if (isSlugError) {
      return true;
    }

    const slugData = {
      en: data["slug-en"],
      ar: data["slug-ar"],
      tr: data["slug-tr"],
    };

    if (
      slugData.en == slugData.ar ||
      slugData.en == slugData.tr ||
      slugData.ar == slugData.tr
    ) {
      toast.error("Please enter unique slug.");
      return;
    }

    //manage subvariant error also

    const formData = new FormData();

    formData.append("barCode", data.barCode);
    formData.append("hsCode", data.hsCode);
    formData.append("categoryId", data.categoryId);
    data.brandId && formData.append("brandId", data.brandId);
    data.unitId && formData.append("unitId", data.unitId);
    formData.append("isPublished", data.isPublished === "publish");

    data.buyingPrice && formData.append("buyingPrice", data.buyingPrice);
    data.sellingPrice && formData.append("sellingPrice", data.sellingPrice);
    data.currency && formData.append("buyingPriceCurrency", data.currency);

    // formData.append("name", data.name);

    // const prices = [];

    // for (let i = 0; i < data.countries.length; i++) {
    //   const id = data.countries[i];
    //   prices.push({
    //     countryId: id,
    //     sellingPrice: data[`sellingPrice_${id}`],
    //     discountPrice: data[`discountedPrice_${id}`],
    //   });
    // }

    // formData.append("prices", JSON.stringify(prices));

    // const descriptionLangData = [];

    // for (let i = 0; i < languages.length; i++) {
    //   const code = languages[i].code;

    //   descriptionLangData.push({
    //     languageCode: code,
    //     shortDescription: data[`shortDescription-${code}`],
    //     longDescription: data[`description-${code}`] ?? "",
    //   });

    //   if (languages[i].default) {
    //     formData.append("shortDescription", data[`shortDescription-${code}`]);
    //     formData.append("longDescription", data[`description-${code}`]);

    //     if (
    //       !data[`description-${code}`] ||
    //       data[`description-${code}`].length === 0
    //     ) {
    //       toast.error("Please enter long description");
    //       return;
    //     }
    //   }
    // }

    // formData.append("descriptionLangData", JSON.stringify(descriptionLangData));

    // let taxesData = [];

    // for (let i = 0; i < taxes.length; i++) {
    //   const tax = taxes[i];
    //   if (data.countries.includes(tax._id)) {
    //     tax.taxes.forEach((t) => {
    //       taxesData.push({
    //         countryId: tax._id,
    //         tax: t.id,
    //         isSelected: data[`tax-${tax._id}-${t.id}`],
    //       });
    //     });
    //   }
    // }

    // taxesData = taxesData.filter((tax) => tax.isSelected);

    // formData.append("taxesData", JSON.stringify(taxesData));

    // const featuresArrDefault = [];
    const featuresArrLang = {};

    languages.forEach((lang) => {
      featuresArrLang[lang.code] = [];
    });

    for (let i = 0; i < features.length; i++) {
      const id = features[i].id;

      for (let j = 0; j < languages.length; j++) {
        const code = languages[j].code;

        featuresArrLang[code] = [
          ...featuresArrLang[code],
          {
            // label: data[`featureLabel${id}-${code}`],
            // value: data[`featureValue${id}-${code}`]?.label,
            // id: features[i].spId,
            label: features[i].spId,
            value: data[`featureValue${id}-${code}`]?.value,
          },
        ];

        // if (languages[j].default) {
        //   featuresArrDefault.push({
        //     label: data[`featureLabel${id}-${code}`],
        //     value: data[`featureValue${id}-${code}`],
        //   });
        // }
      }
    }

    // formData.append("features", JSON.stringify(featuresArrDefault));
    // formData.append("featuresLang", JSON.stringify(featuresArrLang));

    // const faqsArrDefault = [];
    const faqsArrLang = {};

    languages.forEach((lang) => {
      faqsArrLang[lang.code] = [];
    });

    for (let i = 0; i < faqs.length; i++) {
      const id = faqs[i].id;

      for (let j = 0; j < languages.length; j++) {
        const code = languages[j].code;

        faqsArrLang[code] = [
          ...faqsArrLang[code],
          {
            question: data[`faqQuestion${id}-${code}`],
            answer: data[`faqAnswer${id}-${code}`],
          },
        ];

        // if (languages[j].default) {
        //   faqsArrDefault.push({
        //     question: data[`faqQuestion${id}-${code}`],
        //     answer: data[`faqAnswer${id}-${code}`],
        //   });
        // }
      }
    }

    // formData.append("faqs", JSON.stringify(faqsArrDefault));
    // formData.append("faqsLang", JSON.stringify(faqsArrLang));

    data.height && formData.append("height", data.height);
    data.weight && formData.append("weight", data.weight);
    data.width && formData.append("width", data.width);
    data.length && formData.append("length", data.length);
    data.dc && formData.append("dc", data.dc);
    data.shippingCompany &&
      formData.append("shippingCompany", data.shippingCompany.value);

    formData.append(
      "alternateProductIds",
      JSON.stringify(selectedProductsObject.ids)
    );

    const metaDatas = {};

    for (let i = 0; i < languages.length; i++) {
      metaDatas[languages[i].code] = {};
    }

    for (let key in data.metaData) {
      const [title, code] = key.split("-");
      metaDatas[code][title] = data.metaData[key];
      if (title == "keywords") {
        metaDatas[code][title] =
          data.metaData[key] != undefined
            ? data.metaData[key].toString()
            : null;
      }
    }

    const langData = [];

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;

      langData.push({
        languageCode: code,
        name: data[`name-${code}`],
        slug: data[`slug-${code}`],
        shortDescription: data[`shortDescription-${code}`],
        longDescription: data[`description-${code}`] ?? " ",
        features: featuresArrLang[code],
        faq: faqsArrLang[code],
        metaData: metaDatas[code],
      });

      // if (languages[i].default) {
      //   // formData.append("shortDescription", data[`shortDescription-${code}`]);
      //   // formData.append("longDescription", data[`description-${code}`]);

      //   formData.append("name", data[`name-${code}`]);

      //   if (!isOptional) {
      //     if (
      //       !data[`description-${code}`] ||
      //       data[`description-${code}`].length === 0
      //     ) {
      //       toast.error("Please enter long description");
      //       return;
      //     }

      //     if (
      //       !data[`shortDescription-${code}`] ||
      //       data[`shortDescription-${code}`].length === 0
      //     ) {
      //       toast.error("Please enter short description");
      //       return;
      //     }
      //   }
      // }
    }

    formData.append("langData", JSON.stringify(langData));

    // if (data.ogImage) {
    //   formData.append("ogImage", data.ogImage[0]);
    // }

    // formData.append("description", data.description);

    const selectedMediaCustomObj = {};
    const selectedMediaCustomObjTwo = {
      main: [],
    };

    {
      variantCountArr.forEach((_, idx) => {
        selectedMediaCustomObjTwo[idx] = [];
      });

      //media
      let mediaIds = new Set();

      for (let key in selectedMedia) {
        selectedMediaCustomObj[key] = [];
        // selectedMediaCustomObjTwo[key] = [];
        selectedMedia[key].forEach((media) => {
          if (media.isSelected) {
            mediaIds.add(media.id);
            selectedMediaCustomObj[key].push(media.id);
          }
        });
      }

      mediaIds = [...mediaIds];

      if (mediaIds.length === 0) {
        toast.error("Please upload atleast one media");
        return;
      }

      let featuredMediaIdAdded = false;

      const toAddNum = variantCountArr.length / subVariants.length;

      for (let i = 0; i < mediaIds.length; i++) {
        const media = mediaFiles.find((m) => m.id === mediaIds[i]);

        for (let key in selectedMediaCustomObj) {
          if (selectedMediaCustomObj[key].includes(media.id)) {
            if (key === "main" || toAddNum === 1) {
              selectedMediaCustomObjTwo[key] =
                selectedMediaCustomObjTwo[key].concat(i);
            } else {
              const allKeysToUpdate = [];

              for (let j = 0; j < toAddNum; j++) {
                allKeysToUpdate.push(+key + j + +key * (toAddNum - 1));
              }

              allKeysToUpdate.forEach((idx) => {
                selectedMediaCustomObjTwo[idx] =
                  selectedMediaCustomObjTwo[idx].concat(i);
              });
            }
          }
        }

        if (featuredMediaId === media.id) {
          formData.append("featuredMediaId", i);
          featuredMediaIdAdded = true;
        }

        formData.append("media", media.file);
      }

      if (!featuredMediaIdAdded) {
        toast.error("Please select cover image.");
        return;
      }
    }

    // formData.append("metaData", JSON.stringify(data.metaData));
    // formData.append("vendor", data.vendor);
    // formData.append("countries", JSON.stringify(data.countries));
    formData.append("mediaIds", JSON.stringify(selectedMediaCustomObjTwo));

    let vArr = [];

    if (selectedVariant.variant1) {
      // const v = variants.find((v) => v._id === selectedVariant.variant1);
      const v = selectedVariant.variant1;
      const order = checkedVariants.find((va) => va._id == v._id).order;
      vArr.push({ id: v._id, name: v.name, order });
    }

    if (selectedVariant.variant2) {
      const v = selectedVariant.variant2;
      // const v = variants.find((v) => v._id === selectedVariant.variant2);
      const order = checkedVariants.find((va) => va._id == v._id).order;
      vArr.push({ id: v._id, name: v.name, order });
    }

    if (vArr.length === 1) {
      vArr[0].order = 1;
    }

    formData.append("variants", JSON.stringify(vArr));

    const subVariantsArr = [];

    if (vArr.length > 0) {
      // const arr = Array(variantCount)
      //   .fill(null)
      //   .map((_, idx) => idx);

      for (let i = 0; i < variantCountArr.length; i++) {
        const id = variantCountArr[i];

        const obj = {};
        if (vArr.length === 2) {
          obj["secondVariantId"] = vArr[1].id;
          obj["secondVariantName"] = vArr[1].name;
          obj["secondSubVariantId"] = data["subVariant"][`${id}_secondId`];
          obj["secondSubVariantName"] = data["subVariant"][`${id}_second`];
        }

        // const prices = [];

        // for (let j = 0; j < data.countries.length; j++) {
        //   const countryId = data.countries[j];
        //   prices.push({
        //     countryId: countryId,
        //     sellingPrice: data["subVariant"][`${id}_sellingPrice_${countryId}`],
        //     discountPrice:
        //       data["subVariant"][`${id}_discountedPrice_${countryId}`],
        //   });
        // }

        subVariantsArr.push({
          ...obj,
          firstVariantId: vArr[0].id,
          firstVariantName: vArr[0].name,
          firstSubVariantId: data["subVariant"][`${id}_firstId`],
          firstSubVariantName: data["subVariant"][`${id}_first`],
          // price: data["subVariant"][`${id}_third`],
          // discountedPrice: data["subVariant"][`${id}_fourth`],
          quantity: data["subVariant"][`${id}_quantity`],
          height: data["subVariant"][`${id}_height`],
          weight: data["subVariant"][`${id}_weight`],
          width: data["subVariant"][`${id}_width`],
          length: data["subVariant"][`${id}_length`],

          dc: data["subVariant"][`${id}_dc`],
          shippingCompany: data["subVariant"][`${id}_shippingCompany`],
          barCode: data["subVariant"][`${id}_barCode`],
          isActive: data["subVariant"][`${id}_status`],

          // prices,
          buyingPrice: data["subVariant"][`${id}_buyingPrice`],
          buyingPriceCurrency: data["subVariant"][`${id}_currency`],
          sellingPrice: data["subVariant"][`${id}_sellingPrice`],
          // isDeleted: variantObj[id],
        });
      }
    }

    formData.append("subVariants", JSON.stringify(subVariantsArr));
    formData.append("newSubVariants", JSON.stringify(subVariantsAdd));

    formData.append("id", recordId);

    // for (let [key, value] of formData) {
    //   console.log(`${key}: ${value}`);
    // }
    request("PUT", "product", formData);
  };

  // const vendorChangeHandler = (e) => {
  //   return;
  //   setValue("masterCategoryId", null);
  //   setSelectedCategory(null);

  //   setValue("subCategoryId", null);
  //   setSubCategoriesForRS([]);
  //   setSelectedSubCategory([]);

  //   setValue("warehouses", null);
  //   setSelectedWarehouses([]);

  //   setCountries([]);
  //   setSelectedCountries([]);
  //   setValue("countries", null);
  //   setTaxesToShow([]);

  //   clearBrandHandler();

  //   if (e) {
  //     setValue("vendor", e.value);
  //     setSelectedVendor(e);

  //     const vendor = allVendors.find((vendor) => vendor._id === e.value);

  //     setMainCategoriesForRS(
  //       vendor.mainCategories.map((item) => {
  //         return { value: item._id, label: item.name };
  //       })
  //     );

  //     setMainCategories(vendor.mainCategories);
  //     setWarehouses(vendor.warehouses);

  //     // setCountries(vendor.countries);
  //     // setSelectedCountries(vendor.countries);
  //     // setValue(
  //     //   "countries",
  //     //   vendor.countries.map((e) => e.value)
  //     // );
  //   }
  // };

  const mainCategoryChangeHandler = (e) => {
    setSelectedCategory(e);

    // setValue("subCategoryId", null);
    // setSelectedSubCategory([]);

    // clearBrandHandler();

    clearVariantStateHandler();

    if (e) {
      // requestTaxes(
      //   "GET",
      //   `product/tax-data/${selectedVendor.value}/${e.value}`
      // );

      // const category = mainCategories.find(
      //   (category) => category._id === e.value
      // );

      // setSubCategoriesForRS(
      //   category.subCategories.map((item) => {
      //     return { value: item._id, label: item.name };
      //   })
      // );
      // setSubCategories(category.subCategories);
      setValue("categoryId", e.value);
      requestFeaturesNFaqs("GET", `product/features-faqs-data/${e.value}`);
    }
  };

  // const handleChangeWarehouse = (event) => {
  //   setSelectedWarehouses(event);

  //   if (event && event.length > 0) {
  //     setError("warehouses", "");
  //     setValue(
  //       "warehouses",
  //       event.map((e) => e.value)
  //     );
  //   } else {
  //     setValue("warehouses", null);
  //   }
  // };

  // const handleChangeCountry = (event) => {
  //   setSelectedCountries(event);

  //   taxHTMLHandler(event, taxes, false);

  //   if (event && event.length > 0) {
  //     setError("countries", "");
  //     setValue(
  //       "countries",
  //       event.map((e) => e.value)
  //     );
  //   } else {
  //     setValue("countries", null);
  //   }
  // };

  // const handleChangeSubCategory = (event) => {
  //   setSelectedSubCategory(event);
  //   clearBrandHandler();

  //   if (event) {
  //     setError("subCategoryId", "");
  //     setValue("subCategoryId", event.value);

  //     requestFeaturesNFaqs("GET", `product/features-faqs-data/${event.value}`);
  //     requestBrands("GET", `product-sub-category/${event.value}`);

  //     {
  //       requestVariant(
  //         "GET",
  //         `variant/product/${event.value}/${getValues("vendor")}`
  //       );

  //       const masterVar = subCategories.find(
  //         (s) => s._id === event.value
  //       ).masterVariant;

  //       if (masterVar) {
  //         setMasterVariant(masterVar);
  //       } else {
  //         setMasterVariant(null);
  //       }
  //     }
  //   } else {
  //     setValue("subCategoryId", null);
  //   }
  // };

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
    setFeatures((prev) => [
      ...prev,
      { id: nextId, isMultiSelect: false, options: {} },
    ]);
    setNextId((prev) => prev + 1);
  };

  const deleteFeature = (id) => {
    const newFeatures = [...features].filter((f) => f.id !== id);
    setFeatures(newFeatures);

    unregister(`featureLabel${id}`);
    unregister(`featureValue${id}`);
  };

  const addFaq = () => {
    setFaqs((prev) => [...prev, { id: faqNextId }]);
    setFaqNextId((prev) => prev + 1);
  };

  const deleteFaq = (id) => {
    const newFaqs = [...faqs].filter((f) => f.id !== id);
    setFaqs(newFaqs);

    unregister(`faqQuestion${id}`);
    unregister(`faqAnswer${id}`);
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

  useEffect(() => {
    if (checkedVariants.length == 1) {
      variantCreateHandler();
      // if (!isDataSet) {
      //   setIsDataSet(true);
      // } else {
      //   variantCreateHandler();
      // }
    }
  }, [checkedVariants]);

  const variantCreateHandler = () => {
    // unregister("subVariant");

    // const quantity = getValues("quantity");

    // const countriesPrices = {};

    // const sellingPrices = getValues(
    //   selectedCountries.map((c) => `sellingPrice_${c.value}`)
    // );

    // const discountedPrices = getValues(
    //   selectedCountries.map((c) => `discountedPrice_${c.value}`)
    // );

    // selectedCountries.forEach((sc, idx) => {
    //   countriesPrices[sc.value] = {
    //     price: sellingPrices[idx],
    //     discount: discountedPrices[idx],
    //   };
    // });

    const buyingPrice = getValues("buyingPrice");
    const currency = getValues("currency");
    const sellingPrice = getValues("sellingPrice");

    const height = getValues("height");
    const weight = getValues("weight");
    const width = getValues("width");
    const length = getValues("length");
    const dc = getValues("dc");
    const shippingCompany = getValues("shippingCompany");

    let ids = [];

    const newVariants = JSON.parse(JSON.stringify(checkedVariants));

    const selectedVariants = newVariants
      .filter((v) => v.isChecked)
      .sort((a, b) => b.isMasterVariant - a.isMasterVariant);

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

    const orderObj = {
      length: 0,
    };

    for (let i = 0; i < newVariants.length; i++) {
      const item = newVariants[i];
      orderObj[item._id] = item.order;
      orderObj.length = orderObj.length + 1;
    }

    setVariantsOrder(orderObj);

    let variantCustomIndex = 0;

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
          const id = sv1[i].id + sv2[j].id;
          ids.push(id);

          const key = `subVariant.${id}`;

          if (variantCountArr.includes(id)) {
            if (!alreadySavedVariantIds.includes(id)) {
              setValue(
                `${key}_productId`,
                createCustomId(
                  "productVariant",
                  variantCustomIdObj.current,
                  variantCustomIndex++
                )
              );
            }
            continue;
          }

          setValue(`${key}_firstId`, sv1[i].id);
          setValue(`${key}_first`, sv1[i].name);
          setValue(`${key}_secondId`, sv2[j].id);
          setValue(`${key}_second`, sv2[j].name);
          // setValue(`${key}_quantity`, quantity);
          setValue(`${key}_height`, height ?? 0);
          setValue(`${key}_weight`, weight ?? 0);
          setValue(`${key}_width`, width ?? 0);
          setValue(`${key}_length`, length ?? 0);
          setValue(`${key}_dc`, dc ?? 0);
          setValue(
            `${key}_shippingCompany`,
            shippingCompany ? shippingCompany.value : undefined
          );

          setValue(`${key}_buyingPrice`, buyingPrice ?? 0);
          setValue(`${key}_currency`, currency);
          setValue(`${key}_sellingPrice`, sellingPrice ?? 0);

          setValue(
            `${key}_productId`,
            createCustomId(
              "productVariant",
              variantCustomIdObj.current,
              variantCustomIndex++
            )
          );

          // selectedCountries.forEach((sc) => {
          //   setValue(
          //     `${key}_sellingPrice_${sc.value}`,
          //     countriesPrices[sc.value].price
          //   );
          //   setValue(
          //     `${key}_discountedPrice_${sc.value}`,
          //     countriesPrices[sc.value].discount
          //   );
          // });

          // id++;
        }
      }

      setVariantCountArr(ids);

      setVariantTh([
        v1.name,
        v2.name,
        "Quantity",
        "Height",
        "Weight",
        "Width",
        "Length",
      ]);
    } else if (firstVariant) {
      setSelectedVariant({
        variant1: firstVariant,
        variant2: null,
      });

      const v1 = firstVariant;
      const sv1 = v1.subVariants;

      for (let i = 0; i < sv1.length; i++) {
        const id = sv1[i].id;

        ids.push(id);
        const key = `subVariant.${id}`;

        if (variantCountArr.includes(id)) {
          if (!alreadySavedVariantIds.includes(id)) {
            setValue(
              `${key}_productId`,
              createCustomId(
                "productVariant",
                variantCustomIdObj.current,
                variantCustomIndex++
              )
            );
          }
          continue;
        }

        setValue(`${key}_firstId`, sv1[i].id);
        setValue(`${key}_first`, sv1[i].name);
        // setValue(`${key}_quantity`, quantity);
        setValue(`${key}_height`, height ?? 0);
        setValue(`${key}_weight`, weight ?? 0);
        setValue(`${key}_width`, width ?? 0);
        setValue(`${key}_length`, length ?? 0);
        setValue(`${key}_dc`, dc ?? 0);
        setValue(
          `${key}_shippingCompany`,
          shippingCompany ? shippingCompany.value : undefined
        );

        setValue(`${key}_buyingPrice`, buyingPrice ?? 0);
        setValue(`${key}_currency`, currency);
        setValue(`${key}_sellingPrice`, sellingPrice ?? 0);

        setValue(
          `${key}_productId`,
          createCustomId(
            "productVariant",
            variantCustomIdObj.current,
            variantCustomIndex++
          )
        );

        // selectedCountries.forEach((sc) => {
        //   setValue(
        //     `${key}_sellingPrice_${sc.value}`,
        //     countriesPrices[sc.value].price
        //   );
        //   setValue(
        //     `${key}_discountedPrice_${sc.value}`,
        //     countriesPrices[sc.value].discount
        //   );
        // });
      }

      setVariantTh([
        v1.name,
        "Quantity",
        "Height",
        "Weight",
        "Width",
        "Length",
      ]);

      setVariantCountArr(ids);
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
      const index = subVariants.findIndex((s) => s.id === selectedSubV[id].id);

      if (index !== -1) {
        obj[id] = selectedMedia[index];
      } else {
        obj[id] = previewMediaFiles.map((m) => ({ ...m, isSelected: false }));
      }
      // objDelete[id] = false;
    });

    setSelectedMedia(obj);
    // setVariantObj(objDelete);
    setIsVaraintModalOpen(false);
  };

  const preVariantCreateHandler = () => {
    const selectedVariants = [];
    let selectedVariantsValue = [];

    // const masterVariant = getValues("selectVariant1");
    // const masterVariantValues = getValues("selectVariantValues1");
    // const secondVariant = getValues("selectVariant2");
    // const secondVariantValues = getValues("selectVariantValues2");

    const [
      masterVariant,
      masterVariantValues,
      secondVariant,
      secondVariantValues,
    ] = watch([
      "selectVariant1",
      "selectVariantValues1",
      "selectVariant2",
      "selectVariantValues2",
    ]);

    selectedVariants.push(masterVariant.value);

    if (!masterVariantValues || masterVariantValues.length === 0) {
      toast.error(`Please select values in master variant`);
      return;
    }

    selectedVariantsValue = masterVariantValues.map((sv) => sv.value);

    if (secondVariant) {
      if (!secondVariantValues) {
        toast.error(`Please select values in second variant`);
        return;
      }

      selectedVariants.push(secondVariant.value);

      selectedVariantsValue = [
        ...selectedVariantsValue,
        ...secondVariantValues.map((sv) => sv.value),
      ];
    }

    let checkedVariantsNew = variants
      .map((v) => ({
        ...v,
        isChecked: selectedVariants.includes(v._id),
        subVariants: v.subVariants.map((sv) => ({
          ...sv,
          isChecked: selectedVariantsValue.includes(sv.id),
        })),
      }))
      .filter((v) => v.isChecked)
      .map((v, idx) => ({ ...v, order: idx + 1 }));

    //Old Order Algo

    if (variantsOrder.length === 2 && checkedVariantsNew.length === 2) {
      let isSame = true;

      for (let i = 0; i < checkedVariantsNew.length; i++) {
        const item = checkedVariantsNew[i];

        if (variantsOrder[item._id] === undefined) {
          isSame = false;
          break;
        }
      }

      if (isSame) {
        checkedVariantsNew = checkedVariantsNew
          .map((v) => ({ ...v, order: variantsOrder[v._id] }))
          .sort((a, b) => a.order - b.order);
      }
    }

    setCheckedVariants(checkedVariantsNew);

    if (checkedVariantsNew.length === 1) {
      // variantCreateHandler();
    } else {
      setIsSecondStageVariantModalOpen(true);
    }
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
    const newVariants = [...checkedVariants].map((v) => ({
      ...v,
      subVariants:
        v._id === id
          ? v.subVariants.map((sv) => ({
              ...sv,
              isChecked: svId === sv.id ? value : sv.isChecked,
            }))
          : v.subVariants,
    }));
    setCheckedVariants(newVariants);
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

  const clearVariantStateHandler = () => {
    // unregister("selectVariant1");
    // unregister("selectVariantValues1");
    // unregister("selectVariant2");
    // unregister("selectVariantValues2");
    // unregister("subVariant");

    setValue("selectVariant1", null);
    setValue("selectVariantValues1", null);
    setValue("selectVariant2", null);
    setValue("selectVariantValues2", null);
    setValue("subVariant", null);

    for (let i = 0; i < nextId; i++) {
      unregister(`featureLabel${i}`);
      unregister(`featureValue${i}`);
    }

    setCheckedVariants([]);
    setVariantsOrder({});
    setMasterVariant(null);
    setVariantOptions({
      mainVariantChildOptions: [],
      secondVariantOptions: [],
      secondVariantChildOptions: [],
    });
    // setVariantCount(null);
    setVariantCountArr([]);
    setVariantTh([]);
    setVariantSelectionCount(0);
    setSubVariants([]);
    setFeatures([]);
    setNextId(1);
    setVariants([]);
    setSelectedVariant({ variant1: null, variant2: null });
    setSelectedMedia({
      main: selectedMedia["main"],
    });
  };

  // const taxHTMLHandler = (countries, taxes, toSetValues) => {
  //   const selectedCountriesValue = countries.map((c) => c.value);

  //   const taxesToShow = [];

  //   for (let i = 0; i < taxes.length; i++) {
  //     const tax = taxes[i];
  //     if (selectedCountriesValue.includes(tax._id)) {
  //       taxesToShow.push(tax);

  //       if (toSetValues) {
  //         tax.taxes.forEach((t) => {
  //           setValue(`tax-${tax._id}-${t.id}`, true);
  //         });
  //       }
  //     }
  //   }

  //   setTaxesToShow(taxesToShow);
  // };

  // const clearBrandHandler = () => {
  //   setValue("brandId", null);
  //   setSelectedBrands([]);
  //   setBrands([]);
  // };

  const InputFields = [
    [
      // {
      //   Component: Input,
      //   label: "Name",
      //   type: "text",
      //   name: "name",
      //   registerFields: {
      //     required: true,
      //   },
      // },
      // {
      //   Component: ReactSelectInput,
      //   label: "Vendor",
      //   name: "vendor",
      //   registerFields: {
      //     required: true,
      //   },
      //   control,
      //   options: allVendorsForRS,
      //   handleChange: vendorChangeHandler,
      //   selectedOption: selectedVendor,
      // },
      // {
      //   Component: Input,
      //   label: "Serial Number",
      //   type: "text",
      //   name: "serialNumber",
      //   registerFields: {
      //     required: true,
      //   },
      // },
      {
        Component: Input,
        label: "Bar Code",
        type: "text",
        name: "barCode",
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
        Component: Input,
        label: "HS Code",
        type: "text",
        name: "hsCode",
        registerFields: {
          required: true,
        },
      },
      {
        Component: ReactSelectInput,
        label: "Category",
        name: "categoryId",
        registerFields: {
          required: true,
        },
        control,
        options: mainCategoriesForRS,
        handleChange: mainCategoryChangeHandler,
        selectedOption: selectedCategory,
      },
      // {
      //   Component: ReactSelectInput,
      //   label: "Sub Category",
      //   name: "subCategoryId",
      //   registerFields: {
      //     required: true,
      //   },
      //   control,
      //   options: subCategoriesForRS,
      //   handleChange: handleChangeSubCategory,
      //   selectedOption: selectedSubCategory,
      // },
      {
        Component: ReactSelectInput,
        label: "Brand",
        name: "brandId",
        registerFields: {
          required: !isOptional,
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
          required: !isOptional,
        },
        control,
        options: units,
        handleChange: handleChangeUnits,
        selectedOption: selectedUnits,
      },
      // {
      //   Component: ReactSelectInput,
      //   label: "Warehouse",
      //   name: "warehouses",
      //   registerFields: {
      //     required: true,
      //   },
      //   control,
      //   options: warehouses,
      //   handleChange: handleChangeWarehouse,
      //   selectedOption: selectedWarehouses,
      //   isMultiple: true,
      // },
      // {
      //   Component: Input,
      //   label: "Quantity",
      //   type: "text",
      //   name: "quantity",
      //   registerFields: {
      //     required: true,
      //     pattern: /^\d{1,3}(,\d{3})*(\,|.\d+)?$/i,
      //   },
      //   registerFieldsFeedback: {
      //     pattern: "Quantity can only contain numbers.",
      //   },
      // },
      // {
      //   Component: ReactSelectInput,
      //   label: "Countries",
      //   name: "countries",
      //   registerFields: {
      //     required: true,
      //   },
      //   control,
      //   options: countries,
      //   handleChange: handleChangeCountry,
      //   selectedOption: selectedCountries,
      //   isMultiple: true,
      // },
      {
        Component: SelectInput,
        label: "Save as",
        name: "isPublished",
        registerFields: {
          required: true,
        },
        onChange: (value) => {
          setIsOptional("draft" === value);
        },
        children: (
          <>
            <option value="">Select Save as</option>
            <option value="draft">Draft</option>
            <option value="publish">Publish</option>
            {/* <option value="helper">Helper</option> */}
          </>
        ),
      },
      // {
      //   Component: SelectInput,
      //   label: "Stock",
      //   name: "inStock",
      //   registerFields: {
      //     required: true,
      //   },
      //   children: (
      //     <>
      //       <option value={true}>In Stock</option>
      //       <option value={false}>Out of Stock</option>
      //     </>
      //   ),
      // },
    ],
  ];

  const PriceInputFields = [
    {
      Component: Input,
      colClass: "col-xl-4 pr-0 childBorderNone",
      label: "Buying Price",
      type: "text",
      name: "buyingPrice",
      registerFields: {
        // required: !isOptional,
        required: true,
        pattern: /^\d{1,3}(,\d{3})*(\,|.\d+)?$/i,
      },
      registerFieldsFeedback: {
        pattern: "Price can only contain numbers.",
      },
    },
    {
      Component: SelectInput,
      colClass: "col-xl-2 pl-0 childBorderNone",
      label: "Currency",
      name: "currency",
      registerFields: {
        required: true,
      },
      children: (
        <>
          <option value="">Select</option>
          {currencies.map((c) => (
            <option key={c._id} value={c._id}>
              {c.sign}
            </option>
          ))}
        </>
      ),
    },
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
    // {
    //   Component: Input,
    //   label: "Discounted Price",
    //   type: "text",
    //   name: "discountedPrice",
    //   registerFields: {
    //     required: true,
    //     pattern: /^\d{1,3}(,\d{3})*(\,|.\d+)?$/i,
    //   },
    //   registerFieldsFeedback: {
    //     pattern: "Discounted Price can only contain numbers.",
    //   },
    // },
  ];

  const DescInputFields = [
    [
      // {
      //   Component: Textarea,
      //   label: "Short Description",
      //   type: "text",
      //   name: "shortDescription",
      //   registerFields: {
      //     required: true,
      //   },
      //   colClass: "col-xl-12",
      // },
      {
        Component: CKEditorInput,
        colClass: "col-xl-12",
        label: "Short Description",
        name: "shortDescription",
        registerFields: {
          required: true,
        },
        getValues,
        setValue,
        trigger,
        inputData: {},
        clearErrors,
        isEdit: true,
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
        isEdit: true,
      },
    ],
  ];

  const onSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex == newIndex) {
      return;
    }

    const oldOrder = oldIndex + 1;
    const newOrder = newIndex + 1;

    let idsWithOrder = [...checkedVariants];

    if (oldOrder < newOrder) {
      arrayMoveMutable(idsWithOrder, 0, newOrder - oldOrder);
    } else if (oldOrder > newOrder) {
      arrayMoveMutable(idsWithOrder, oldOrder - newOrder, 0);
    }

    setCheckedVariants(
      idsWithOrder.map((v, idx) => ({ ...v, order: idx + 1 }))
    );
  };

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Edit Product"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/products", name: "Back To Products" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div
              className={`card-body main_product_block ${
                !isSidebarOpen ? "show" : ""
              }`}
            >
              <div className="row">
                <Sidebar
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                  variants={variants}
                  subVariants={subVariants}
                />

                <div className="col-12">
                  <div className="product_right_block">
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div
                        className="tab-content mt-0"
                        id="myTabContent"
                        data-select2-id="myTabContent"
                      >
                        <div
                          className="tab-pane fade active show"
                          id="kt_tab_pane_1"
                          role="tabpanel"
                          aria-labelledby="kt_tab_pane_1"
                          style={{ minHeight: 490 }}
                        >
                          <div>
                            <h3 className="mb-10 font-weight-bold text-dark">
                              Product Information
                            </h3>
                          </div>

                          {/* <div className="card card-custom gutter-b">
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
                                      image={lang?.image}
                                      tabName={`language_${index}`}
                                    />
                                  ))}
                              </ul>
                            </div>
                          </div>

                          <div className="card-body px-0">
                            <div className="tab-content px-10">
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
                                          Component: Input,
                                          label: "Name",
                                          type: "text",
                                          name: "name",
                                          isRequired: true,
                                        },
                                        {
                                          Component: Input,
                                          label: "Product Link",
                                          type: "text",
                                          name: "slug",
                                          // isRequired: false,
                                        },
                                      ],
                                    ]}
                                    code={lang.code}
                                    tabName={`language_${index}`}
                                  />
                                ))}
                            </div>
                          </div>
                        </div> */}

                          <RenderInputFields
                            InputFields={InputFields}
                            errors={errors}
                            register={register}
                          />
                        </div>

                        <Price
                          errors={errors}
                          register={register}
                          // selectedCountries={selectedCountries}
                          PriceInputFields={PriceInputFields}
                          isOptional={isOptional}
                          currencies={currencies}
                        />

                        {/* <About
                        errors={errors}
                        register={register}
                        DescInputFields={DescInputFields}
                        isOptional={isOptional}
                      /> */}

                        {/* <Tax taxesToShow={taxesToShow} register={register} /> */}

                        <Feature
                          errors={errors}
                          register={register}
                          addFeature={addFeature}
                          features={features}
                          deleteFeature={deleteFeature}
                          setValue={setValue}
                          control={control}
                        />

                        {/* <Faq
                        addFaq={addFaq}
                        faqs={faqs}
                        errors={errors}
                        register={register}
                        deleteFaq={deleteFaq}
                        isOptional={isOptional}
                      /> */}

                        <ShippingSpecification
                          errors={errors}
                          register={register}
                          isOptional={isOptional}
                          control={control}
                          shippingCompanies={shippingCompanies}
                        />

                        <AlternateProducts
                          setSelectedProductsObjects={
                            setSelectedProductsObjects
                          }
                          // similarProducts={similarProducts}
                          selectedProductsObject={selectedProductsObject}
                          productId={recordId}
                        />
                        {/* 
                      <ProductMeta
                        errors={errors}
                        control={control}
                        register={register}
                      /> */}

                        <Media
                          mediaViewHandler={mediaViewHandler}
                          selectedMedia={selectedMedia}
                          unselectMediaHandler={unselectMediaHandler}
                          makeFeaturedHandler={makeFeaturedHandler}
                          featuredMediaId={featuredMediaId}
                        />

                        <div
                          className="tab-pane fade"
                          id="kt_tab_pane_10"
                          role="tabpanel"
                          aria-labelledby="kt_tab_pane_10"
                          style={{ minHeight: 490 }}
                        >
                          <div>
                            <h3 className="mb-10 font-weight-bold text-dark">
                              Variant
                            </h3>
                          </div>
                          <div className="text-center p-5">
                            <button
                              onClick={() => {
                                // setIsVaraintModalOpen(true);
                                setIsFirstStageVariantModalOpen(true);
                              }}
                              type="button"
                              className="btn btn-primary"
                            >
                              Variant Customization
                            </button>
                          </div>
                          {false && variantCountArr.length !== 0 && (
                            <div class="accordion" id="accordionExample5">
                              {variantCountArr.map((id, index) => (
                                <div key={id} class="card">
                                  <div
                                    class="card-header"
                                    id={`headingVariant${id}`}
                                  >
                                    <h2 class="mb-0">
                                      <button
                                        class="btn btn-link btn-block text-left"
                                        type="button"
                                        data-toggle="collapse"
                                        data-target={`#collapseVariant${id}`}
                                        aria-expanded="true"
                                        aria-controls={`collapseVariant${id}`}
                                      >
                                        {`${variantTh[0]}: ${getValues(
                                          `subVariant.${id}_first`
                                        )}`}
                                      </button>
                                    </h2>
                                  </div>

                                  <div
                                    id={`collapseVariant${id}`}
                                    class="collapse"
                                    aria-labelledby={`headingVariant${id}`}
                                    data-parent="#accordionExample5"
                                  >
                                    <div class="card-body">
                                      <VariantMedia
                                        // subVariants={subVariants}
                                        selectedMedia={selectedMedia}
                                        unselectMediaHandler={
                                          unselectMediaHandler
                                        }
                                        idx={index}
                                        // sv={sv}
                                      />

                                      <div
                                        class="accordion"
                                        id="accordionExample6"
                                      >
                                        {false && (
                                          <div class="card">
                                            <div
                                              class="card-header"
                                              id={`headingIn1Variant${id}`}
                                            >
                                              <h2 class="mb-0">
                                                <button
                                                  class="btn btn-link btn-block text-left"
                                                  type="button"
                                                  data-toggle="collapse"
                                                  data-target={`#collapseIn1Variant${id}`}
                                                  aria-expanded="true"
                                                  aria-controls={`collapseIn1Variant${id}`}
                                                >
                                                  Available Quantity
                                                </button>
                                              </h2>
                                            </div>

                                            <div
                                              id={`collapseIn1Variant${id}`}
                                              class="collapse"
                                              aria-labelledby={`headingIn1Variant${id}`}
                                              data-parent="#accordionExample6"
                                            >
                                              <div class="card-body">
                                                <Input
                                                  label={
                                                    tablePlaceholderObj[
                                                      "_quantity"
                                                    ]
                                                  }
                                                  type="text"
                                                  name={`subVariant.${id}_quantity`}
                                                  errors={errors}
                                                  register={register}
                                                  registerFields={{
                                                    required: true,
                                                    pattern:
                                                      /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/,
                                                  }}
                                                  inputData={{
                                                    placeholder: `Enter ${tablePlaceholderObj["_quantity"]}`,
                                                  }}
                                                  registerFieldsFeedback={{
                                                    pattern:
                                                      "Please enter digits only.",
                                                  }}
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                        <div class="card">
                                          <div
                                            class="card-header"
                                            id={`headingIn2Variant${id}`}
                                          >
                                            <h2 class="mb-0">
                                              <button
                                                class="btn btn-link btn-block text-left"
                                                type="button"
                                                data-toggle="collapse"
                                                data-target={`#collapseIn2Variant${id}`}
                                                aria-expanded="true"
                                                aria-controls={`collapseIn2Variant${id}`}
                                              >
                                                Shipping Specifications
                                              </button>
                                            </h2>
                                          </div>

                                          <div
                                            id={`collapseIn2Variant${id}`}
                                            class="collapse"
                                            aria-labelledby={`headingIn2Variant${id}`}
                                            data-parent="#accordionExample6"
                                          >
                                            <div class="card-body row">
                                              {[
                                                "_first",
                                                "_second",
                                                // "_quantity",
                                                "_height",
                                                "_weight",
                                                "_width",
                                                "_length",
                                                "_firstId",
                                                "_secondId",
                                              ].map((data) => {
                                                const registerObj = {};
                                                if (
                                                  [
                                                    // "_quantity",
                                                    "_height",
                                                    "_weight",
                                                    "_width",
                                                    "_length",
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
                                                  variantTh.length === 6
                                                ) {
                                                  return null;
                                                }

                                                if (
                                                  ![
                                                    "_firstId",
                                                    "_secondId",
                                                    "_first",
                                                    "_second",
                                                  ].includes(data)
                                                ) {
                                                  return (
                                                    <Input
                                                      label={
                                                        tablePlaceholderObj[
                                                          data
                                                        ]
                                                      }
                                                      type="text"
                                                      name={`subVariant.${id}${data}`}
                                                      errors={errors}
                                                      register={register}
                                                      registerFields={{
                                                        required: true,
                                                        ...registerObj,
                                                      }}
                                                      inputData={{
                                                        placeholder: `Enter ${tablePlaceholderObj[data]}`,
                                                      }}
                                                      registerFieldsFeedback={{
                                                        pattern:
                                                          "Please enter digits only.",
                                                      }}
                                                    />
                                                  );
                                                }

                                                return (
                                                  <div
                                                    style={{ display: "none" }}
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
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        </div>

                                        <div class="card">
                                          <div
                                            class="card-header"
                                            id={`headingIn3Variant${id}`}
                                          >
                                            <h2 class="mb-0">
                                              <button
                                                class="btn btn-link btn-block text-left"
                                                type="button"
                                                data-toggle="collapse"
                                                data-target={`#collapseIn3Variant${id}`}
                                                aria-expanded="true"
                                                aria-controls={`collapseIn3Variant${id}`}
                                              >
                                                Price
                                              </button>
                                            </h2>
                                          </div>

                                          <div
                                            id={`collapseIn3Variant${id}`}
                                            class="collapse"
                                            aria-labelledby={`headingIn3Variant${id}`}
                                            data-parent="#accordionExample6"
                                          >
                                            <div class="card-body">
                                              <RenderInputFields
                                                InputFields={[
                                                  PriceInputFields.map((p) => ({
                                                    ...p,
                                                    // name: `subVariant.${
                                                    //   2 * index + idx
                                                    // }_${p.name}`,
                                                    name: `subVariant.${id}_${p.name}`,
                                                  })),
                                                ]}
                                                errors={errors}
                                                register={register}
                                              />
                                            </div>
                                          </div>

                                          {/* <div
                                          id={`collapseIn3Variant${id}`}
                                          class="collapse"
                                          aria-labelledby={`headingIn3Variant${id}`}
                                          data-parent="#accordionExample6"
                                        >
                                          <div class="card-body">
                                            {selectedCountries.length > 0 && (
                                              <div className="row">
                                                <div className="col-3">
                                                  <ul className="nav flex-column nav-pills">
                                                    {selectedCountries.map(
                                                      (country, idx) => (
                                                        <li
                                                          key={idx}
                                                          className="nav-item"
                                                        >
                                                          <a
                                                            className={`tablnk nav-link ${
                                                              idx === 0
                                                                ? "active"
                                                                : null
                                                            }`}
                                                            data-tabid={1}
                                                            data-toggle="tab"
                                                            href={`#kt_tab_pane_variant${idx}`}
                                                          >
                                                            {country.label}
                                                          </a>{" "}
                                                        </li>
                                                      )
                                                    )}
                                                  </ul>
                                                </div>
                                                <div className="col-9">
                                                  <div
                                                    className="tab-content mt-0"
                                                    id="myTabContent"
                                                    data-select2-id="myTabContent"
                                                  >
                                                    {selectedCountries.map(
                                                      (country, idx) => (
                                                        <div
                                                          key={idx}
                                                          className={`tab-pane fade ${
                                                            idx === 0
                                                              ? "active show"
                                                              : null
                                                          }`}
                                                          id={`kt_tab_pane_variant${idx}`}
                                                          role="tabpanel"
                                                          aria-labelledby={`kt_tab_pane_variant${idx}`}
                                                          style={{
                                                            minHeight: 490,
                                                          }}
                                                        >
                                                          <div>
                                                            <h3 className="mb-10 font-weight-bold text-dark">
                                                              {country.label}
                                                            </h3>
                                                          </div>
                                                          <RenderInputFields
                                                            InputFields={[
                                                              PriceInputFields.map(
                                                                (p) => ({
                                                                  ...p,
                                                                  name: `subVariant.${id}_${p.name}_${country.value}`,
                                                                })
                                                              ),
                                                            ]}
                                                            errors={errors}
                                                            register={register}
                                                          />
                                                        </div>
                                                      )
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div> */}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {false && selectedVariant.variant1 !== null && (
                            <div class="accordion" id="accordionExample5">
                              {selectedVariant.variant1.subVariants.map(
                                (sv, index) => (
                                  <div key={sv.id} class="card">
                                    <div
                                      class="card-header"
                                      id={`headingVariant${sv.id}`}
                                    >
                                      <h2 class="mb-0">
                                        <button
                                          class="btn btn-link btn-block text-left"
                                          type="button"
                                          data-toggle="collapse"
                                          data-target={`#collapseVariant${sv.id}`}
                                          aria-expanded="true"
                                          aria-controls={`collapseVariant${sv.id}`}
                                        >
                                          {`${variantTh[0]}: ${sv.name}`}
                                        </button>
                                      </h2>
                                    </div>

                                    <div
                                      id={`collapseVariant${sv.id}`}
                                      class="collapse"
                                      aria-labelledby={`headingVariant${sv.id}`}
                                      data-parent="#accordionExample5"
                                    >
                                      <div class="card-body">
                                        <VariantMedia
                                          // subVariants={subVariants}
                                          selectedMedia={selectedMedia}
                                          unselectMediaHandler={
                                            unselectMediaHandler
                                          }
                                          idx={index}
                                          // sv={sv}
                                        />

                                        {selectedVariant.variant2 !== null && (
                                          <div
                                            class="accordion"
                                            id="accordionExampl7"
                                          >
                                            {selectedVariant.variant2.subVariants.map(
                                              (sv2, idx) => (
                                                <div class="card">
                                                  <div
                                                    class="card-header"
                                                    id={`headingOne${sv2.id}`}
                                                  >
                                                    <h2 class="mb-0">
                                                      <button
                                                        class="btn btn-link btn-block text-left"
                                                        type="button"
                                                        data-toggle="collapse"
                                                        data-target={`#collapseOne${sv2.id}`}
                                                        aria-expanded="true"
                                                        aria-controls={`collapseOne${sv2.id}`}
                                                      >
                                                        {`${variantTh[1]}: ${sv2.name}`}
                                                      </button>
                                                    </h2>
                                                  </div>

                                                  <div
                                                    id={`collapseOne${sv2.id}`}
                                                    class="collapse show"
                                                    aria-labelledby={`headingOne${sv2.id}`}
                                                    data-parent="#accordionExampl7"
                                                  >
                                                    <div class="card-body">
                                                      <div
                                                        class="accordion"
                                                        id="accordionExample6"
                                                      >
                                                        <div class="card">
                                                          <div
                                                            class="card-header"
                                                            id={`headingIn2Variant${sv2.id}`}
                                                          >
                                                            <h2 class="mb-0">
                                                              <button
                                                                class="btn btn-link btn-block text-left"
                                                                type="button"
                                                                data-toggle="collapse"
                                                                data-target={`#collapseIn2Variant${sv2.id}`}
                                                                aria-expanded="true"
                                                                aria-controls={`collapseIn2Variant${sv2.id}`}
                                                              >
                                                                Shipping
                                                                Specifications
                                                              </button>
                                                            </h2>
                                                          </div>

                                                          <div
                                                            id={`collapseIn2Variant${sv2.id}`}
                                                            class="collapse"
                                                            aria-labelledby={`headingIn2Variant${sv2.id}`}
                                                            data-parent="#accordionExample6"
                                                          >
                                                            <div class="card-body row">
                                                              {[
                                                                "_first",
                                                                "_second",
                                                                // "_quantity",
                                                                "_height",
                                                                "_weight",
                                                                "_width",
                                                                "_length",
                                                                "_firstId",
                                                                "_secondId",
                                                              ].map((data) => {
                                                                const registerObj =
                                                                  {};
                                                                if (
                                                                  [
                                                                    // "_quantity",
                                                                    "_height",
                                                                    "_weight",
                                                                    "_width",
                                                                    "_length",
                                                                  ].includes(
                                                                    data
                                                                  )
                                                                ) {
                                                                  registerObj.pattern =
                                                                    /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/;
                                                                }

                                                                if (
                                                                  [
                                                                    "_secondId",
                                                                    "_second",
                                                                  ].includes(
                                                                    data
                                                                  ) &&
                                                                  variantTh.length ===
                                                                    6
                                                                ) {
                                                                  return null;
                                                                }

                                                                if (
                                                                  ![
                                                                    "_firstId",
                                                                    "_secondId",
                                                                    "_first",
                                                                    "_second",
                                                                  ].includes(
                                                                    data
                                                                  )
                                                                ) {
                                                                  return (
                                                                    <Input
                                                                      label={
                                                                        tablePlaceholderObj[
                                                                          data
                                                                        ]
                                                                      }
                                                                      type="text"
                                                                      name={`subVariant.${sv.id}${sv2.id}${data}`}
                                                                      errors={
                                                                        errors
                                                                      }
                                                                      register={
                                                                        register
                                                                      }
                                                                      registerFields={{
                                                                        required: true,
                                                                        ...registerObj,
                                                                      }}
                                                                      inputData={{
                                                                        placeholder: `Enter ${tablePlaceholderObj[data]}`,
                                                                      }}
                                                                      registerFieldsFeedback={{
                                                                        pattern:
                                                                          "Please enter digits only.",
                                                                      }}
                                                                    />
                                                                  );
                                                                }

                                                                return (
                                                                  <div
                                                                    style={{
                                                                      display:
                                                                        "none",
                                                                    }}
                                                                  >
                                                                    <MutliInput
                                                                      type="text"
                                                                      label="Sub Variant"
                                                                      name={`subVariant.${sv.id}${sv2.id}${data}`}
                                                                      errors={
                                                                        errors
                                                                      }
                                                                      placeholder={`Enter ${tablePlaceholderObj[data]}`}
                                                                      register={
                                                                        register
                                                                      }
                                                                      registerFields={{
                                                                        required: true,
                                                                        ...registerObj,
                                                                      }}
                                                                      registerFieldsFeedback={{
                                                                        pattern:
                                                                          "Please enter digits only.",
                                                                      }}
                                                                      inputData={{
                                                                        disabled:
                                                                          [
                                                                            "_first",
                                                                            "_second",
                                                                          ].includes(
                                                                            data
                                                                          ),
                                                                      }}
                                                                    />
                                                                  </div>
                                                                );
                                                              })}
                                                            </div>
                                                          </div>
                                                        </div>

                                                        <div class="card">
                                                          <div
                                                            class="card-header"
                                                            id={`headingIn3Variant${sv2.id}`}
                                                          >
                                                            <h2 class="mb-0">
                                                              <button
                                                                class="btn btn-link btn-block text-left"
                                                                type="button"
                                                                data-toggle="collapse"
                                                                data-target={`#collapseIn3Variant${sv2.id}`}
                                                                aria-expanded="true"
                                                                aria-controls={`collapseIn3Variant${sv2.id}`}
                                                              >
                                                                Price
                                                              </button>
                                                            </h2>
                                                          </div>

                                                          <div
                                                            id={`collapseIn3Variant${sv2.id}`}
                                                            class="collapse"
                                                            aria-labelledby={`headingIn3Variant${sv2.id}`}
                                                            data-parent="#accordionExample6"
                                                          >
                                                            <div class="card-body">
                                                              <RenderInputFields
                                                                InputFields={[
                                                                  PriceInputFields.map(
                                                                    (p) => ({
                                                                      ...p,
                                                                      name: `subVariant.${sv.id}${sv2.id}_${p.name}`,
                                                                    })
                                                                  ),
                                                                ]}
                                                                errors={errors}
                                                                register={
                                                                  register
                                                                }
                                                              />
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        )}
                                        {selectedVariant.variant2 === null && (
                                          <div
                                            class="accordion"
                                            id="accordionExample6"
                                          >
                                            <div class="card">
                                              <div
                                                class="card-header"
                                                id={`headingIn2Variant${sv.id}`}
                                              >
                                                <h2 class="mb-0">
                                                  <button
                                                    class="btn btn-link btn-block text-left"
                                                    type="button"
                                                    data-toggle="collapse"
                                                    data-target={`#collapseIn2Variant${sv.id}`}
                                                    aria-expanded="true"
                                                    aria-controls={`collapseIn2Variant${sv.id}`}
                                                  >
                                                    Shipping Specifications
                                                  </button>
                                                </h2>
                                              </div>

                                              <div
                                                id={`collapseIn2Variant${sv.id}`}
                                                class="collapse"
                                                aria-labelledby={`headingIn2Variant${sv.id}`}
                                                data-parent="#accordionExample6"
                                              >
                                                <div class="card-body row">
                                                  {[
                                                    "_first",
                                                    "_second",
                                                    // "_quantity",
                                                    "_height",
                                                    "_weight",
                                                    "_width",
                                                    "_length",
                                                    "_firstId",
                                                    "_secondId",
                                                  ].map((data) => {
                                                    const registerObj = {};
                                                    if (
                                                      [
                                                        // "_quantity",
                                                        "_height",
                                                        "_weight",
                                                        "_width",
                                                        "_length",
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
                                                      variantTh.length === 6
                                                    ) {
                                                      return null;
                                                    }

                                                    if (
                                                      ![
                                                        "_firstId",
                                                        "_secondId",
                                                        "_first",
                                                        "_second",
                                                      ].includes(data)
                                                    ) {
                                                      return (
                                                        <Input
                                                          label={
                                                            tablePlaceholderObj[
                                                              data
                                                            ]
                                                          }
                                                          type="text"
                                                          name={`subVariant.${sv.id}${data}`}
                                                          errors={errors}
                                                          register={register}
                                                          registerFields={{
                                                            required: true,
                                                            ...registerObj,
                                                          }}
                                                          inputData={{
                                                            placeholder: `Enter ${tablePlaceholderObj[data]}`,
                                                          }}
                                                          registerFieldsFeedback={{
                                                            pattern:
                                                              "Please enter digits only.",
                                                          }}
                                                        />
                                                      );
                                                    }

                                                    return (
                                                      <div
                                                        style={{
                                                          display: "none",
                                                        }}
                                                      >
                                                        <MutliInput
                                                          type="text"
                                                          label="Sub Variant"
                                                          name={`subVariant.${sv.id}${data}`}
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
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                            </div>

                                            <div class="card">
                                              <div
                                                class="card-header"
                                                id={`headingIn3Variant${sv.id}`}
                                              >
                                                <h2 class="mb-0">
                                                  <button
                                                    class="btn btn-link btn-block text-left"
                                                    type="button"
                                                    data-toggle="collapse"
                                                    data-target={`#collapseIn3Variant${sv.id}`}
                                                    aria-expanded="true"
                                                    aria-controls={`collapseIn3Variant${sv.id}`}
                                                  >
                                                    Price
                                                  </button>
                                                </h2>
                                              </div>

                                              <div
                                                id={`collapseIn3Variant${sv.id}`}
                                                class="collapse"
                                                aria-labelledby={`headingIn3Variant${sv.id}`}
                                                data-parent="#accordionExample6"
                                              >
                                                <div class="card-body">
                                                  <RenderInputFields
                                                    InputFields={[
                                                      PriceInputFields.map(
                                                        (p) => ({
                                                          ...p,
                                                          name: `subVariant.${sv.id}_${p.name}`,
                                                        })
                                                      ),
                                                    ]}
                                                    errors={errors}
                                                    register={register}
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>

                        {/* <VariantMedia
                        subVariants={subVariants}
                        selectedMedia={selectedMedia}
                        unselectMediaHandler={unselectMediaHandler}
                      /> */}

                        <TranslatedInfo
                          errors={errors}
                          register={register}
                          DescInputFields={DescInputFields}
                          isOptional={isOptional}
                          addFaq={addFaq}
                          faqs={faqs}
                          deleteFaq={deleteFaq}
                          control={control}
                          watch={watch}
                          setSlugValidation={setSlugValidation}
                          setError={setError}
                          clearErrors={clearErrors}
                          id={recordId}
                        />

                        <NewVariantEdit
                          selectedVariant={selectedVariant}
                          register={register}
                          currencies={currencies}
                          selectedMedia={selectedMedia}
                          unselectMediaHandler={unselectMediaHandler}
                          errors={errors}
                          shippingCompanies={shippingCompanies}
                        >
                          <div className="row">
                            <div className="col-xl-6">
                              <div className="form-group">
                                <label>
                                  Main Variant
                                  <span className="text-danger">*</span>
                                </label>
                                <MultiReactSelectInput
                                  label="Main Variant"
                                  name="selectVariant1"
                                  errors={errors}
                                  registerFields={{ required: !!masterVariant }}
                                  options={[]}
                                  control={control}
                                  required={!!masterVariant}
                                  inputData={{ isDisabled: true }}
                                  colClass="w-100"
                                />
                              </div>
                            </div>

                            <div className="col-xl-6">
                              <div className="form-group">
                                <label>
                                  Values
                                  <span className="text-danger">*</span>
                                </label>

                                <MultiReactSelectInput
                                  label="Main Variant Values"
                                  name="selectVariantValues1"
                                  errors={errors}
                                  registerFields={{ required: false }}
                                  options={
                                    variantOptions.mainVariantChildOptions
                                  }
                                  control={control}
                                  required={false}
                                  isMultiple={true}
                                  colClass="w-100"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-xl-6">
                              <div className="form-group">
                                <label>Second Variant</label>

                                <MultiReactSelectInput
                                  label="Second Variant"
                                  name="selectVariant2"
                                  errors={errors}
                                  registerFields={{ required: true }}
                                  options={variantOptions.secondVariantOptions}
                                  control={control}
                                  required={false}
                                  inputData={{ isClearable: true }}
                                  colClass="w-100"
                                  handleChange={(e) => {
                                    if (e) {
                                      setVariantOptions((prev) => ({
                                        ...prev,
                                        secondVariantChildOptions:
                                          variants
                                            .find((v) => v._id === e.value)
                                            .subVariants.map((v) => ({
                                              value: v.id,
                                              label: v.name,
                                            })) || [],
                                      }));
                                      setValue("selectVariantValues2", null);
                                    } else {
                                      setVariantOptions((prev) => ({
                                        ...prev,
                                        secondVariantChildOptions: [],
                                      }));
                                      setValue("selectVariantValues2", null);
                                    }
                                  }}
                                />
                              </div>
                            </div>

                            {variantOptions.secondVariantChildOptions.length >
                              0 && (
                              <div className="col-xl-6">
                                <div className="form-group">
                                  <label>
                                    Values
                                    <span className="text-danger">*</span>
                                  </label>

                                  <MultiReactSelectInput
                                    label="Second Variant Values"
                                    name="selectVariantValues2"
                                    errors={errors}
                                    registerFields={{ required: true }}
                                    options={
                                      variantOptions.secondVariantChildOptions
                                    }
                                    control={control}
                                    required={true}
                                    isMultiple={true}
                                    colClass="w-100"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          <button
                            className="btn btn-primary mb-5"
                            onClick={preVariantCreateHandler}
                            type="button"
                          >
                            Create Variant
                          </button>
                        </NewVariantEdit>
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
      </div>

      <Modal
        isOpen={isFirstStageVariantModalOpen}
        onRequestClose={() => setIsFirstStageVariantModalOpen(false)}
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
              onClick={() => setIsFirstStageVariantModalOpen(false)}
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
                        </div>
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
              onClick={() => {
                const cVariants = JSON.parse(
                  JSON.stringify(
                    variants
                      .filter((v) => v.isChecked)
                      .map((v, idx) => ({ ...v, order: v.order ?? idx + 1 }))
                      .sort((a, b) => a.order - b.order)
                  )
                );

                setCheckedVariants(cVariants);
                setIsFirstStageVariantModalOpen(false);
                if (cVariants.length > 1) {
                  setIsSecondStageVariantModalOpen(true);
                } else {
                  setIsVaraintModalOpen(true);
                }
              }}
            >
              Next
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isSecondStageVariantModalOpen}
        onRequestClose={() => setIsSecondStageVariantModalOpen(false)}
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
        className="react_modal_custom small_popup react_Custom_modal"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              Change Variants Order
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={() => setIsSecondStageVariantModalOpen(false)}
            >
              <i aria-hidden="true" class="ki ki-close"></i>
            </button>
          </div>
          <div className="modal-body">
            <div className="table-responsive">
              <table
                className="table dataTable table-head-custom table-head-bg table-borderless table-vertical-center"
                id="taskTable"
              >
                <thead>
                  <tr className="text-uppercase">
                    <th></th>
                    <th>
                      <a className="no_sort">Order</a>
                    </th>
                    <th>
                      <a className="no_sort">Variant Group</a>
                    </th>
                  </tr>
                </thead>
                <SortableContainer useDragHandle onSortEnd={onSortEnd}>
                  {checkedVariants.map((data, i) => (
                    <SortableItem
                      key={`item-${i}`}
                      index={i}
                      data={data}
                      tableData={["order", "name"]}
                      onlyDate={{}}
                      links={[]}
                      page={1}
                      date_format={null}
                      date_time_format={null}
                      renderAs={{}}
                      linksHelperFn={() => {}}
                    />
                  ))}
                </SortableContainer>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button
              className="btn btn-primary w-50"
              onClick={() => {
                setIsSecondStageVariantModalOpen(false);
                // setIsVaraintModalOpen(true);
                variantCreateHandler();
              }}
            >
              Next
            </button>
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
                {/* <div class="form-group">
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
                </div> */}
                {checkedVariants.map((v) => (
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
                            {/* <label class="checkbox checkbox-square">
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
                                </label> */}
                          </div>
                        </button>
                      </h2>

                      {/* <button
                            className="btn btn-primary mr-2"
                            onClick={() => {
                              setIsAddVariantModalOpen(true);
                              setValueAddVariant("newVariantId", v._id);
                            }}
                          >
                            Add
                          </button> */}
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
                ))}
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
    </div>
  );
};

export default Edit;
