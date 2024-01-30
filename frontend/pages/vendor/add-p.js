import { useRouter } from "next/router";
import { Fragment, useEffect, useState, useRef, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import Select from "react-select";
import { CKEditor } from "ckeditor4-react";
import Modal from "react-bootstrap/Modal";
import { useDropzone } from "react-dropzone";
import { useTranslations } from "next-intl";

import useRequest from "@/hooks/useRequest";
import Layout from "@/components/Vendor/Layout";
import {
  getInitialAddProductData,
  getAlternateProducts,
} from "@/services/product";
import { createAxiosCookies, debounce, urlToObject } from "@/fn";
import { Edit } from "@/components/Svg";
import { MEDIA_URL } from "@/api";

const imgArray = ["image/png", "image/jpeg", "image/jpg"];

const VIDEO = [
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-ms-wmv",
  "video/webm",
];

const AddProduct = ({
  data,
  customId,
  unit,
  similarProducts,
  maximumImagesCount,
  searchBrands,
  searchCategories,
  searchVendors,
}) => {
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
  } = useForm();

  const { register: registerSearch, watch: watchSearch } = useForm();

  const router = useRouter();

  const { webview } = router.query;

  const t = useTranslations("Index");
  const [masterCategory, setMasterCategory] = useState([]);
  const [warehouse, setWarehouse] = useState([]);
  const [units, setUnits] = useState([]);

  const [alternateProducts, setAlternateProducts] = useState(similarProducts);
  const [selectedAlternateProductsObj, setSelectedAlternateProductsObj] =
    useState({
      ids: [],
      data: [],
    });

  const [subCategories, setSubCategories] = useState([]);
  const [countriesOption, setCountriesOption] = useState([]);
  const [countries, setCountries] = useState([]);
  const [countriesWithTax, setCountriesWithTax] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [brands, setBrands] = useState([]);

  const [faqs, setFaqs] = useState([]);
  const [faqId, setFaqId] = useState(0);

  const [features, setFeatures] = useState([]);
  const [featureId, setFeaturesId] = useState(0);

  const [variants, setVariants] = useState([]);
  const [variantModal, setVariantModal] = useState(false);
  const [variantSelectionCount, setVariantSelectionCount] = useState(0); //number of variant selected
  const [variantCount, setVariantCount] = useState(null); //total sub variants selected
  const [selectedVariant, setSelectedVariant] = useState([]);
  const [subVariants, setSubVariants] = useState([]); //selected sub variants

  const [mediaFiles, setMediaFiles] = useState([]); //media in binary
  const [previewMediaFiles, setPreviewMediaFiles] = useState([]);
  const [mediaNextId, setMediaNextId] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState({
    main: [],
  });
  const [featuredMediaId, setFeaturedMediaId] = useState(null);
  const [helperProducts, setHelperProducts] = useState([]);

  const [searchValue, setSearchValue] = useState("");

  const publishRef = useRef();
  const draftRef = useRef();
  const ckEditorRef = useRef();

  const { name, brandId, subCategoryId } = watch();

  const { request, response } = useRequest();

  const {
    request: getSubcategoriesRequest,
    response: getSubcategoriesResponse,
  } = useRequest();

  const {
    request: getSubcategoriesDenpendDataRequest,
    response: getSubcategoriesDenpendDataResponse,
  } = useRequest();

  const { request: getVariantsRequest, response: getVariantsResponse } =
    useRequest();

  const { request: requestHelperProducts, response: responseHelperProducts } =
    useRequest();

  const { request: requestHelperProduct, response: responseHelperProduct } =
    useRequest();

  const {
    request: requestAlternateProducts,
    response: responseAlternateProducts,
  } = useRequest();

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    multiple: true,
    onDrop: (acceptedFiles) => {
      mediaViewHandler(acceptedFiles);
    },
  });

  useEffect(() => {
    register("longDescription");
  }, []);

  useEffect(() => {
    const subscription = watchSearch((values) => {
      const { category, brand, vendor } = values;

      let searchQuery = ``;

      if (category) searchQuery += `category=${category}&`;
      if (brand) searchQuery += `brand=${brand}&`;
      if (vendor) searchQuery += `vendor=${vendor}&`;
      if (searchValue) searchQuery += `name=${searchValue}`;

      requestAlternateProducts("GET", `v1/product/alternate?${searchQuery}`);
    });
    return () => subscription.unsubscribe();
  }, [watchSearch, searchValue]);

  useEffect(() => {
    let timer;
    if (name && name.trim().length > 0 && brandId && subCategoryId) {
      timer = setTimeout(() => {
        const { masterCategoryId } = watch();
        requestHelperProducts("POST", "v1/product/helper", {
          name,
          brandId,
          masterCategoryId,
          subCategoryId,
        });
      }, 500);
    }

    return () => clearTimeout(timer);
  }, [name, brandId]);

  useEffect(() => {
    if (responseHelperProducts) {
      const { products } = responseHelperProducts;
      setHelperProducts(products);
    }
  }, [responseHelperProducts]);

  useEffect(() => {
    if (responseHelperProduct) {
      const { product } = responseHelperProduct;
      const {
        serialNumber,
        unit,
        shortDescription,
        longDescription,
        featureTitle,
        features,
        height,
        weight,
        width,
        length,
        alternateProductsData,
        faqs,
        metaData,
        variants: selectedVariants,
        variantsData,
      } = product;

      setValue("serialNumber", serialNumber);
      setValue("unit", [{ value: unit._id, label: unit.name }]);
      setValue("shortDescription", shortDescription);
      setValue("longDescription", longDescription);
      ckEditorRef.current.editor.insertHtml(longDescription);

      setValue("featureTitle", featureTitle);
      setFeatures(features.map((f, i) => ({ ...f, id: i })));
      features.forEach((f, i) => {
        setValue(`featureLabel${i}`, f.label);
        setValue(`featureValue${i}`, f.value);
      });
      setFeaturesId(features.length);

      setValue("height", height);
      setValue("weight", weight);
      setValue("width", width);
      setValue("length", length);

      setSelectedAlternateProductsObj({
        ids: alternateProductsData.map((a) => a._id),
        data: alternateProductsData.map((a) => ({
          id: a._id,
          name: a.name,
        })),
      });

      setFaqs(faqs.map((f, i) => ({ ...f, id: i })));
      faqs.forEach((f, i) => {
        setValue(`faqQuestion${i}`, f.question);
        setValue(`faqAnswer${i}`, f.answer);
      });
      setFaqId(faqs.length);

      setValue("metaData", metaData);

      if (variantsData.length > 0) {
        const firstVariantProduct = variantsData[0];
        const twoVariants = !!firstVariantProduct.secondVariantId;

        setVariants((prev) =>
          prev
            .map((v) => ({
              ...v,
              isChecked:
                v.isMasterVariant ||
                selectedVariants.find((sv) => sv.id === v._id),
              subVariants: v.subVariants.map((sv) => ({
                ...sv,
                isChecked: variantsData.find(
                  (pv) =>
                    pv.firstSubVariantId === sv.id ||
                    pv.secondSubVariantId === sv.id
                ),
              })),
            }))
            .sort((a, b) => b.isMasterVariant - a.isMasterVariant)
        );

        if (twoVariants) {
          setVariantSelectionCount(2);

          setSelectedVariant([
            {
              _id: firstVariantProduct.firstVariantId,
              name: firstVariantProduct.firstVariantName,
            },
            {
              _id: firstVariantProduct.secondVariantId,
              name: firstVariantProduct.secondVariantName,
            },
          ]);

          let id = 0;

          for (let i = 0; i < variantsData.length; i++) {
            const variant = variantsData[i];

            const key = `subVariant.${id}`;

            setValue(`${key}_firstId`, variant.firstSubVariantId);
            setValue(`${key}_first`, variant.firstSubVariantName);
            setValue(`${key}_secondId`, variant.secondSubVariantId);
            setValue(`${key}_second`, variant.secondSubVariantName);
            // setValue(`${key}_quantity`, variant.quantity);
            setValue(`${key}_quantity`, null);
            setValue(`${key}_height`, variant.height);
            setValue(`${key}_weight`, variant.weight);
            setValue(`${key}_width`, variant.width);
            setValue(`${key}_length`, variant.length);

            id++;
          }

          setVariantCount(id);
        } else {
          setVariantSelectionCount(1);

          setSelectedVariant([
            {
              _id: firstVariantProduct.firstVariantId,
              name: firstVariantProduct.firstVariantName,
            },
          ]);

          for (let i = 0; i < variantsData.length; i++) {
            const variant = variantsData[i];

            const key = `subVariant.${id}`;

            setValue(`${key}_firstId`, variant.firstSubVariantId);
            setValue(`${key}_first`, variant.firstSubVariantName);
            setValue(`${key}_quantity`, variant.quantity);
            setValue(`${key}_height`, variant.height);
            setValue(`${key}_weight`, variant.weight);
            setValue(`${key}_width`, variant.width);
            setValue(`${key}_length`, variant.length);

            variant.prices.forEach((sc) => {
              setValue(`${key}_sellingPrice_${sc._id}`, sc.sellingPrice);
              setValue(`${key}_discountedPrice_${sc._id}`, sc.discountPrice);
            });

            id++;
            setVariantCount(id);
          }
        }

        const masterVariantValues = variantsData.reduce((acc, cv) => {
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

        setSubVariants(subVariants);

        //media handling - start
        const vMap = new Map();

        const variantMedia = variantsData.reduce((acc, cv) => {
          if (!acc.has(cv.firstSubVariantId)) {
            acc.set(cv.firstSubVariantId, cv.media);
          }
          return acc;
        }, vMap);

        const newPreviewMediaFiles = [];
        let newSelectedMedia = { ...selectedMedia };

        const newSelectedMediaArr = [];

        for (let i = 0; i < product.media.length; i++) {
          const media = product.media[i];
          const id = mediaNextId + i;

          urlToObject(MEDIA_URL + "/" + media.src).then((data) => {
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
            media: MEDIA_URL + "/" + media.src,
            isVideo: !media.isImage,
            id,
          });

          newSelectedMediaArr.push({
            media: MEDIA_URL + "/" + media.src,
            isVideo: !media.isImage,
            id,
            isSelected: true,
          });

          if (media.isFeatured) {
            setFeaturedMediaId(id);
          }
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
              (v) => MEDIA_URL + "/" + v.src === m.media
            ),
          }));
        });

        setSelectedMedia(newSelectedMedia);

        setPreviewMediaFiles(newPreviewMediaFiles);
      }
    }
  }, [responseHelperProduct]);

  useEffect(() => {
    draftRef.current = true;
    if (response) {
      if (response.status) {
        toast.success(response.message);
        router.push("/vendor/products");
      } else {
        toast.success(response.message);
      }
    }
  }, [response]);

  useEffect(() => {
    if (responseAlternateProducts) {
      setAlternateProducts(responseAlternateProducts.similarProducts);
    }
  }, [responseAlternateProducts]);

  useEffect(() => {
    if (data) {
      const { masterCategories, warehouses } = data;
      setMasterCategory(masterCategories);
      if (warehouses.length > 0) {
        setWarehouse(
          warehouses.map((data) => ({ label: data.name, value: data._id }))
        );
      }
    }
    if (unit.length > 0) {
      setUnits(unit.map((data) => ({ label: data.name, value: data._id })));
    }

    setValue("customId", customId);
  }, []);

  useEffect(() => {
    if (getSubcategoriesResponse) {
      if (getSubcategoriesResponse.status) {
        const { countries, subCategories } = getSubcategoriesResponse.data;
        setSubCategories(subCategories);
        setCountries(countries);
        setCountriesWithTax(countries);
        setCountriesOption(
          [...countries].map((c, i) => ({ ...c, label: c.name, value: c._id }))
        );
        setValue(
          "countries",
          [...countries].map((c) => ({ value: c._id, label: c.name }))
        );
        setSelectedCountries(
          [...countries].map((c) => ({ label: c.name, value: c._id }))
        );
      }
    }
  }, [getSubcategoriesResponse]);

  useEffect(() => {
    if (getSubcategoriesDenpendDataResponse) {
      if (getSubcategoriesDenpendDataResponse.status) {
        const { brandsData, faqs, features } =
          getSubcategoriesDenpendDataResponse.data;
        setBrands(brandsData);
        setFaqs(
          [...faqs].map((f, i) => {
            setValue(`faqQuestion${i}`, f);
            return { question: f, answer: "", id: i };
          })
        );
        setFaqId(faqs.length);
        setFeatures(
          [...features].map((f, i) => {
            setValue(`featureLabel${i}`, f);
            return { label: f, value: "", id: i };
          })
        );
        setFeaturesId(features.length);
      }
    }
  }, [getSubcategoriesDenpendDataResponse]);

  useEffect(() => {
    if (getVariantsResponse) {
      const { variants } = getVariantsResponse;

      setVariants(
        variants
          .map((v) => ({
            ...v,
            isChecked: v.isMasterVariant,
            subVariants: v.subVariants.map((sv) => ({
              ...sv,
              isChecked: v.isMasterVariant,
            })),
          }))
          .sort((a, b) => b.isChecked - a.isChecked)
      );

      setVariantSelectionCount(variants.length > 0 ? 1 : 0);
      variantResetHandler();
    }
  }, [getVariantsResponse]);

  const masterCategoryOnChange = (e) => {
    let masterCategory = e.target.value;

    setBrands([]);
    setVariants([]);
    setVariantSelectionCount(0);
    variantResetHandler();

    getSubcategoriesRequest("GET", `v1/product/sub-category/${masterCategory}`);
  };

  const subCategoryOnChange = (e) => {
    let subCategoryId = e.target.value;

    getSubcategoriesDenpendDataRequest(
      "GET",
      `v1/product/brand-faq-feature/${subCategoryId}`
    );
    getVariantsRequest("GET", `v1/product/variants/${subCategoryId}`);
  };

  const handleChangeCountry = (event) => {
    setSelectedCountries(event);
    setCountries(event);
  };

  const addFeatureHandler = () => {
    setFeatures((prev) => [...prev, { label: "", value: "", id: featureId }]);
    setFeaturesId((prev) => prev + 1);
  };

  const featureDeleteHandler = (id) => {
    const newFeatures = features.filter((f) => f.id != id);
    setFeatures(newFeatures);
    unregister(`featureLabel${id}`);
    unregister(`featureValue${id}`);
  };

  const addFaqHandler = () => {
    setFaqs((prev) => [...prev, { question: "", answer: "", id: faqId }]);
    setFaqId((prev) => prev + 1);
  };

  const faqDeleteHandler = (id) => {
    const newFaqs = faqs.filter((f) => f.id != id);
    setFaqs(newFaqs);
    unregister(`faqQuestion${id}`);
    unregister(`faqAnswer${id}`);
  };

  const addAlternateProductHandler = (id, name) => {
    setSelectedAlternateProductsObj((prev) => ({
      ids: [...prev.ids, id],
      data: [...prev.data, { id, name }],
    }));
  };

  const removeSelectedProduct = (id) => {
    setSelectedAlternateProductsObj((prev) => ({
      ids: prev.ids.filter((i) => i !== id),
      data: prev.data.filter((d) => d.id !== id),
    }));
  };

  const variantModalShowHandle = () => {
    setVariantModal(true);
  };

  const variantModalCloseHandle = () => {
    setVariantModal(false);
  };

  const variantCheckHandler = (id, value) => {
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

  const variantCreateHandler = () => {
    unregister("subVariant");

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
      const v1 = firstVariant;
      const sv1 = v1.subVariants;

      const v2 = secondVariant;
      const sv2 = v2.subVariants;

      setSelectedVariant([v1, v2]);

      for (let i = 0; i < sv1.length; i++) {
        for (let j = 0; j < sv2.length; j++) {
          const key = `subVariant.${id}`;

          setValue(`${key}_firstId`, sv1[i].id);
          setValue(`${key}_first`, sv1[i].name);
          setValue(`${key}_secondId`, sv2[j].id);
          setValue(`${key}_second`, sv2[j].name);
          setValue(`${key}_quantity`, 1);
          setValue(`${key}_height`, 1);
          setValue(`${key}_weight`, 1);
          setValue(`${key}_width`, 1);
          setValue(`${key}_length`, 1);

          selectedCountries.forEach((sc) => {
            setValue(`${key}_sellingPrice_${sc.value}`, 1);
            setValue(`${key}_discountedPrice_${sc.value}`, 1);
          });

          id++;
        }
      }

      setVariantCount(id);
    } else if (firstVariant) {
      const v1 = firstVariant;
      const sv1 = v1.subVariants;

      setSelectedVariant([v1]);

      for (let i = 0; i < sv1.length; i++) {
        const key = `subVariant.${id}`;
        setValue(`${key}_firstId`, sv1[i].id);
        setValue(`${key}_first`, sv1[i].name);
        setValue(`${key}_quantity`, 1);
        setValue(`${key}_height`, 1);
        setValue(`${key}_weight`, 1);
        setValue(`${key}_width`, 1);
        setValue(`${key}_length`, 1);

        selectedCountries.forEach((sc) => {
          setValue(`${key}_sellingPrice_${sc.value}`, 1);
          setValue(`${key}_discountedPrice_${sc.value}`, 1);
        });

        id++;
      }

      setVariantCount(id);
    }

    {
      const mainArr = selectedMedia["main"];
      const obj = { main: mainArr };

      const v = firstVariant.isMasterVariant ? firstVariant : secondVariant;
      const selectedSubV = v.subVariants.filter((sv) => sv.isChecked);
      setSubVariants(selectedSubV);

      const idArr = Array(selectedSubV.length)
        .fill(null)
        .map((_, idx) => idx);

      idArr.forEach((id) => {
        obj[id] = previewMediaFiles.map((m) => ({ ...m, isSelected: false }));
      });

      setSelectedMedia(obj);
    }

    variantModalCloseHandle();
  };

  const mediaViewHandler = (acceptedFiles) => {
    // if (!e.target.files || e.target.files.length === 0) {
    //   return;
    // }

    // const newMediaFiles = [...mediaFiles, ...e.target.files];

    if (mediaFiles.length === maximumImagesCount && variantCount === null) {
      return;
    }

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
      if (len === maximumImagesCount) {
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

  const onSubmit = (data) => {
    // console.log(data);
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("masterCategoryId", data.masterCategoryId);
    formData.append("subCategoryId", data.subCategoryId);
    formData.append("brandId", data.brandId);
    formData.append("quantity", data.quantity);
    formData.append("buyingPrice", data.buyingPrice);
    formData.append("serialNumber", data.serialNumber);
    formData.append("featureTitle", data.featureTitle);
    formData.append("shortDescription", data.shortDescription);
    formData.append("longDescription", data.longDescription);

    let unitId, warehouses, countries;
    unitId = data.unit[0].value;
    warehouses = data.warehouse.map((u) => u.value);
    countries = data.countries.map((u) => u.value);

    formData.append("warehouses", JSON.stringify(warehouses));
    formData.append("countries", JSON.stringify(countries));
    formData.append("unitId", unitId);

    const prices = [];

    for (let i = 0; i < countries.length; i++) {
      const id = countries[i];
      prices.push({
        countryId: id,
        sellingPrice: data[`sellingPrice_${id}`],
        discountPrice: data[`discountedPrice_${id}`],
      });
    }
    formData.append("prices", JSON.stringify(prices));

    let taxesData = [];

    for (let i = 0; i < countriesWithTax.length; i++) {
      const tax = countriesWithTax[i];
      if (countries.includes(tax._id)) {
        tax.taxData.forEach((t) => {
          taxesData.push({
            countryId: tax._id,
            tax: t._id,
            isSelected: data[`tax-${tax._id}-${t._id}`],
          });
        });
      }
    }

    taxesData.filter((tax) => tax.isSelected);

    formData.append("taxesData", JSON.stringify(taxesData));

    const featuresData = [];

    for (let i = 0; i < features.length; i++) {
      const id = features[i].id;
      featuresData.push({
        label: data[`featureLabel${id}`],
        value: data[`featureValue${id}`],
      });
    }
    formData.append("features", JSON.stringify(featuresData));

    const faqsData = [];

    for (let i = 0; i < faqs.length; i++) {
      const id = faqs[i].id;
      faqsData.push({
        question: data[`faqQuestion${id}`],
        answer: data[`faqAnswer${id}`],
      });
    }
    formData.append("faqs", JSON.stringify(faqsData));
    if (data.ogImage) {
      formData.append("ogImage", data.ogImage[0]);
    }

    formData.append("metaData", JSON.stringify(data.metaData));
    formData.append("height", data.height);
    formData.append("weight", data.weight);
    formData.append("width", data.width);
    formData.append("length", data.length);
    formData.append("isPublished", draftRef.current);
    formData.append("inStock", data.inStock);

    const selectedMediaCustomObj = {};
    const selectedMediaCustomObjTwo = {
      main: [],
    };

    {
      Array(variantCount)
        .fill(null)
        .forEach((_, idx) => {
          selectedMediaCustomObjTwo[idx] = [];
        });
    }

    {
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
        toast.error(t("Please upload atleast one media"));
        return;
      }

      let featuredMediaIdAdded = false;

      const toAddNum = variantCount / subVariants.length;

      for (let i = 0; i < mediaIds.length; i++) {
        const media = mediaFiles.find((m) => m.id === mediaIds[i]);

        for (let key in selectedMediaCustomObj) {
          if (selectedMediaCustomObj[key].includes(media.id)) {
            if (key === "main" || toAddNum === 1) {
              selectedMediaCustomObjTwo[key] =
                selectedMediaCustomObjTwo[key].concat(i);
            } else {
              /*

              0 = 0 (0 + 0*0)
              1 = 1  (1 + 1*0)
              2 = 2 (2 + 2*0)

              3/3 = 1

              0 = 0, 1 (0+0) (0+ 0*1)
              1 = 2, 3 (1+1) (1+ 1*1)
              2 = 4, 5 (2+2) (2 + 2*1)

              6/3 = 2

              0 =  0,1,2 = (0+0) (0 * 3-1) (0*2)
              1 = 3,4,5 = (1+2) (1 * 3-1) (1*2)
              2 = 6,7,8 = (2+4) (2*2)

              9/3 = 3

              */
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
        toast.error(t("Please select cover image"));
        return;
      }

      // if (subVariants.length == 0 && mediaIds.length > 5) {
      //   toast.error("You can only upload 5 media at a time.");
      //   return
      // }
    }

    const vArr = [];

    if (selectedVariant[0]) {
      // const v = variants.find((v) => v._id === selectedVariant.variant1);
      const v = selectedVariant[0];
      vArr.push({ id: v._id, name: v.name });
    }

    if (selectedVariant[1]) {
      const v = selectedVariant[1];
      // const v = variants.find((v) => v._id === selectedVariant.variant2);
      vArr.push({ id: v._id, name: v.name });
    }

    formData.append("variants", JSON.stringify(vArr));

    const subVariantsArr = [];

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

        const prices = [];

        for (let j = 0; j < countries.length; j++) {
          const countryId = countries[j];
          prices.push({
            countryId: countryId,
            sellingPrice: data["subVariant"][`${id}_sellingPrice_${countryId}`],
            discountPrice:
              data["subVariant"][`${id}_discountedPrice_${countryId}`],
          });
        }

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
          prices,
          // isDeleted: variantObj[id],
        });
      }
    }

    formData.append("subVariants", JSON.stringify(subVariantsArr));
    formData.append("mediaIds", JSON.stringify(selectedMediaCustomObjTwo));
    formData.append(
      "alternateProductIds",
      JSON.stringify(selectedAlternateProductsObj.ids)
    );

    // for (let [key, value] of formData) {
    //   console.log(`${key}: ${value}`);
    // }

    request("POST", "v1/product/add", formData);
    draftRef.current = true;
  };

  const onErrors = (errors) => {
    if ("subVariant" in errors) {
      const key = Object.keys(errors["subVariant"])[0];
      const idx = +key.split("_")[0];

      const mainEle = document.querySelector(
        `[data-bs-target="#flush-collapseTwo-variant-${idx}"]`
      );

      mainEle.classList.remove("collapsed");

      const mainEleId = document.getElementById(
        `flush-collapseTwo-variant-${idx}`
      );

      mainEleId.classList.add("show");

      let subEleSelector, thirdEleSelector;

      if (key.includes("_quantity")) {
        subEleSelector = `#flush-collapseOne1-${idx}`;
      } else if (
        key.includes("_discountedPrice_") ||
        key.includes("_sellingPrice_")
      ) {
        subEleSelector = `#flush-collapseThree3-${idx}`;
        const countryId = key.split("_")[2];
        // subVariant.1_sellingPrice_63a58161202586c94cefbc96
        //#v-pills-home-0-63a58161202586c94cefbc96
        //#v-pills-home-0-63c5238ec9cc346964520bce

        //#v-pills-home-1-63a58161202586c94cefbc96

        // console.log("selectedCountries", selectedCountries);
        selectedCountries.forEach((country) => {
          document
            .querySelector(
              `[data-bs-target="#v-pills-home-${idx}-${country.value}"]`
            )
            .classList.remove("active");

          document
            .getElementById(`v-pills-home-${idx}-${country.value}`)
            .classList.remove("active", "show");
        });

        thirdEleSelector = `v-pills-home-${idx}-${countryId}`;
      } else {
        subEleSelector = `#flush-collapseTwo2-${idx}`;
      }

      let subEle = document.querySelector(
        `[data-bs-target="${subEleSelector}"]`
      );

      subEle.classList.remove("collapsed");

      const subEleId = document.getElementById(subEleSelector.substring(1));

      subEleId.classList.add("show");

      if (thirdEleSelector) {
        let thirdEle = document.querySelector(
          `[data-bs-target="#${thirdEleSelector}"]`
        );

        thirdEle.classList.add("active");

        const thirdEleId = document.getElementById(thirdEleSelector);

        thirdEleId.classList.add("active", "show");
      }

      if (Object.keys(errors).length === 1) {
        mainEleId.scrollIntoView({ behavior: "smooth" });
      }
      /*
      let mainEle = document.querySelector(
        `[data-bs-target="#flush-collapseTwo-variant-${idx}"]`
      );

      mainEle.click();

      let selector;

      if (["_quantity"].includes(key)) {
        selector = `#flush-collapseOne1-${idx}`;
      } else if (["_height", "_weight", "_width", "_length"].includes(key)) {
        selector = `#flush-collapseTwo2-${idx}`;
      } else {
        selector = `#flush-collapseThree3-${idx}`;
      }

      let subEle = document.querySelector(`[data-bs-target="${selector}"]`);

      if (subEle) {
        subEle.click();
      }
      */
    }
  };

  const variantResetHandler = () => {
    unregister("subVariant");
    setSelectedVariant([]);
    setVariantCount(null);
    setSubVariants([]);
    setSelectedMedia({ main: selectedMedia["main"] });
  };

  const onChangeHelperProductHandler = (e) => {
    const value = e.target.value;
    if (value) {
      requestHelperProduct("GET", `v1/product/helper/${value}`);
    }
  };

  const searchOptimizedFn = useCallback(
    debounce((value) => {
      setSearchValue(value);

      const { category, brand, vendor } = watchSearch();

      let searchQuery = ``;

      if (category) searchQuery += `category=${category}&`;
      if (brand) searchQuery += `brand=${brand}&`;
      if (vendor) searchQuery += `vendor=${vendor}&`;
      if (value) searchQuery += `name=${value}`;

      requestAlternateProducts("GET", `v1/product/alternate?${searchQuery}`);
    }, 1000),
    []
  );

  const LayoutWrapper = webview ? Fragment : Layout;

  return (
    <>
      <LayoutWrapper seoData={{ pageTitle: "Add Product - Noonmar" }}>
        <div className="main_content listingContainer">
          <div className="dash-titles">
            <h2 className="dash-h2">Add Product</h2>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="dashCard">
                <h3 className="subTitles">Add Images</h3>
                <div className="upload-section">
                  {/* Uploader Dropzone */}
                  <form id="zdrop" className="fileuploader center-align">
                    <div
                      {...getRootProps({ className: "dropzone" })}
                      id="upload-label"
                    >
                      <i className="material-icons">
                        <svg
                          width={58}
                          height={58}
                          viewBox="0 0 58 58"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_1_1540)">
                            <path
                              d="M42.1769 57.9992C41.7709 57.9992 41.3553 57.9485 40.9444 57.8397L3.57552 47.8323C1.01386 47.1266 -0.513477 44.4731 0.158357 41.9115L4.87327 24.3375C5.04727 23.6922 5.70944 23.3176 6.35227 23.482C6.99752 23.6535 7.37936 24.3181 7.20777 24.961L2.49527 42.5301C2.15936 43.811 2.92786 45.145 4.21111 45.5002L41.5655 55.5028C42.8488 55.8411 44.1731 55.0775 44.5066 53.8015L46.394 46.8076C46.568 46.1624 47.2302 45.7781 47.8754 45.9545C48.5207 46.1285 48.9001 46.7931 48.7285 47.436L46.8435 54.4201C46.2756 56.5709 44.3181 57.9992 42.1769 57.9992Z"
                              fill="#6CB9FF"
                            />
                            <path
                              d="M53.168 43.5007H14.5013C11.8357 43.5007 9.66797 41.3329 9.66797 38.6673V9.66732C9.66797 7.00173 11.8357 4.83398 14.5013 4.83398H53.168C55.8336 4.83398 58.0013 7.00173 58.0013 9.66732V38.6673C58.0013 41.3329 55.8336 43.5007 53.168 43.5007ZM14.5013 7.25065C13.1697 7.25065 12.0846 8.33573 12.0846 9.66732V38.6673C12.0846 39.9989 13.1697 41.084 14.5013 41.084H53.168C54.4996 41.084 55.5846 39.9989 55.5846 38.6673V9.66732C55.5846 8.33573 54.4996 7.25065 53.168 7.25065H14.5013Z"
                              fill="#6CB9FF"
                            />
                            <path
                              d="M21.7513 21.7507C19.0857 21.7507 16.918 19.5829 16.918 16.9173C16.918 14.2517 19.0857 12.084 21.7513 12.084C24.4169 12.084 26.5846 14.2517 26.5846 16.9173C26.5846 19.5829 24.4169 21.7507 21.7513 21.7507ZM21.7513 14.5007C20.4197 14.5007 19.3346 15.5857 19.3346 16.9173C19.3346 18.2489 20.4197 19.334 21.7513 19.334C23.0829 19.334 24.168 18.2489 24.168 16.9173C24.168 15.5857 23.0829 14.5007 21.7513 14.5007Z"
                              fill="#6CB9FF"
                            />
                            <path
                              d="M11.0449 40.9144C10.7355 40.9144 10.4262 40.796 10.1894 40.5616C9.71813 40.0903 9.71813 39.3243 10.1894 38.853L21.6033 27.4391C22.9711 26.0713 25.3612 26.0713 26.729 27.4391L30.1269 30.8369L39.5325 19.5511C40.2165 18.7318 41.2218 18.2558 42.2924 18.2461H42.319C43.3775 18.2461 44.3804 18.7053 45.0715 19.51L57.7107 34.2565C58.1457 34.7616 58.0877 35.5253 57.5802 35.9603C57.0751 36.3953 56.3139 36.3397 55.8765 35.8298L43.2373 21.0833C43.0029 20.8126 42.679 20.6628 42.319 20.6628C42.0676 20.641 41.6254 20.815 41.391 21.0978L31.137 33.401C30.9195 33.662 30.603 33.8191 30.2622 33.8336C29.919 33.8578 29.5928 33.7224 29.3535 33.4808L25.0205 29.1477C24.5637 28.6933 23.7686 28.6933 23.3119 29.1477L11.898 40.5616C11.6635 40.796 11.3542 40.9144 11.0449 40.9144Z"
                              fill="#6CB9FF"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_1_1540">
                              <rect width={58} height={58} fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </i>
                      {variantCount === null ? (
                        <span className="tittle">
                          Upload upto {maximumImagesCount} images
                        </span>
                      ) : (
                        <span className="tittle">Upload / Drag images</span>
                      )}

                      <input {...getInputProps()} />
                    </div>
                  </form>
                  {/* Preview collection of uploaded documents */}
                  <div
                    className="preview-container"
                    style={{ visibility: "visible" }}
                  >
                    <div className="preview-data" id="previews">
                      {previewMediaFiles.map((media) => (
                        <div
                          className="preview-item clearhack valign-wrapper item-template"
                          id="zdrop-template"
                          key={media.id}
                        >
                          <div className="zdrop-info">
                            <div className="dz-thumbs">
                              <span className="preview">
                                {/* <img data-dz-thumbnail="" /> */}
                                <img src={media.media} alt="" />
                                {media.id == featuredMediaId ? (
                                  <span className="coverTag">Cover Image</span>
                                ) : (
                                  <div class="dropdown dropstart">
                                    <a
                                      href="javascaript:void(0);"
                                      class=" dropdown-toggle"
                                      data-bs-toggle="dropdown"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 128 512"
                                        width="15px"
                                        height="15px"
                                        fill="#fff"
                                      >
                                        <path d="M64 360a56 56 0 1 0 0 112 56 56 0 1 0 0-112zm0-160a56 56 0 1 0 0 112 56 56 0 1 0 0-112zM120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0z" />
                                      </svg>
                                    </a>
                                    <ul class="dropdown-menu ">
                                      <li>
                                        <a
                                          class="dropdown-item cursor"
                                          onClick={() =>
                                            setFeaturedMediaId(media.id)
                                          }
                                        >
                                          Make Cover Image
                                        </a>
                                      </li>
                                      {/* <li>
                                        <a class="dropdown-item" href="#">
                                          Delete
                                        </a>
                                      </li> */}
                                    </ul>
                                  </div>
                                )}
                              </span>
                            </div>
                            <div className="dpz-info">
                              <div>
                                <span className="dzf-Name" data-dz-name="" />
                                <span className="dzf-size" data-dz-size="" />
                              </div>
                              <div className="progress">
                                <div
                                  className="determinate"
                                  style={{ width: 0 }}
                                  data-dz-uploadprogress=""
                                ></div>
                              </div>
                              <div className="dz-error-message">
                                <span data-dz-errormessage="" />
                              </div>
                            </div>
                          </div>
                          <div className="zdropactions">
                            <a
                              href="#!"
                              data-dz-remove=""
                              className="zdrop-delete"
                              onClick={() => deleteMediaHandler(media.id)}
                            >
                              <svg
                                width={23}
                                height={23}
                                viewBox="0 0 23 23"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M2.79297 6.73828L3.9865 21.1463C4.07203 22.1853 4.95708 23 6.00008 23H16.9972C18.0402 23 18.9252 22.1853 19.0108 21.1463L20.2042 6.73828H2.79297ZM8.12883 20.3047C7.77611 20.3047 7.47935 20.0303 7.45698 19.673L6.78315 8.80186C6.76011 8.43008 7.0424 8.11029 7.41354 8.08724C7.79848 8.06024 8.10449 8.34586 8.12816 8.71763L8.80199 19.5887C8.82584 19.9737 8.52123 20.3047 8.12883 20.3047ZM12.1724 19.6309C12.1724 20.0033 11.8711 20.3047 11.4986 20.3047C11.1262 20.3047 10.8248 20.0033 10.8248 19.6309V8.75977C10.8248 8.38732 11.1262 8.08594 11.4986 8.08594C11.8711 8.08594 12.1724 8.38732 12.1724 8.75977V19.6309ZM16.2141 8.8019L15.5402 19.673C15.5181 20.0267 15.2233 20.3215 14.8256 20.3034C14.4545 20.2803 14.1722 19.9605 14.1952 19.5888L14.869 8.71767C14.8921 8.3459 15.2178 8.07543 15.5837 8.08729C15.9548 8.11033 16.2371 8.43013 16.2141 8.8019Z"
                                  fill="currentColor"
                                />
                                <path
                                  d="M20.2578 2.69531H16.2148V2.02148C16.2148 0.906793 15.3081 0 14.1934 0H8.80273C7.68804 0 6.78125 0.906793 6.78125 2.02148V2.69531H2.73828C1.99397 2.69531 1.39062 3.29866 1.39062 4.04297C1.39062 4.78719 1.99397 5.39062 2.73828 5.39062C8.93597 5.39062 14.0603 5.39062 20.2578 5.39062C21.0021 5.39062 21.6055 4.78719 21.6055 4.04297C21.6055 3.29866 21.0021 2.69531 20.2578 2.69531ZM14.8672 2.69531H8.12891V2.02148C8.12891 1.64971 8.43096 1.34766 8.80273 1.34766H14.1934C14.5651 1.34766 14.8672 1.64971 14.8672 2.02148V2.69531Z"
                                  fill="currentColor"
                                />
                              </svg>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* upload-section END */}
              </div>
            </div>
            {/* dashcard END */}
            {/* Product Details Start */}
            <div className="col-md-8">
              <div className="dashCard pb-0">
                <h3 className="subTitles">Product Details</h3>
                <div className="row">
                  <div className="col-md-12">
                    <div className="form-group">
                      <label>Product Name</label>
                      <input
                        type="text"
                        name=""
                        className="form-control dark-form-control"
                        defaultValue=""
                        {...register("name", {
                          required: "This field is required",
                          setValueAs: (v) => v.trim(),
                        })}
                      />
                      {errors.name && (
                        <span className="text-danger">
                          {t(errors.name.message)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Product ID</label>
                      <input
                        type="text"
                        name=""
                        className="form-control dark-form-control"
                        defaultValue=""
                        {...register("customId", { required: true })}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Serial Number</label>
                      <input
                        type="text"
                        name=""
                        className="form-control dark-form-control"
                        defaultValue=""
                        {...register("serialNumber", {
                          required: "This field is required",
                          setValueAs: (v) => v.trim(),
                        })}
                      />
                      {errors.serialNumber && (
                        <span className="text-danger">
                          {t(errors.serialNumber.message)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Master Category</label>
                      <select
                        className="form-select form-control dark-form-control"
                        aria-label="Default select example"
                        {...register("masterCategoryId", {
                          required: "This field is required",
                        })}
                        onChange={(e) => masterCategoryOnChange(e)}
                      >
                        <option value="">Select</option>
                        {masterCategory &&
                          masterCategory.map((masterCat) => (
                            <option value={masterCat._id} key={masterCat._id}>
                              {masterCat.name}
                            </option>
                          ))}
                      </select>
                      {errors.masterCategoryId && (
                        <span className="text-danger">
                          {t(errors.masterCategoryId.message)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Sub Category</label>
                      <select
                        className="form-select form-control dark-form-control"
                        aria-label="Default select example"
                        {...register("subCategoryId", {
                          required: "This field is required",
                        })}
                        onChange={(e) => subCategoryOnChange(e)}
                      >
                        <option value="">Select</option>
                        {subCategories &&
                          subCategories.map((subCat) => (
                            <option value={subCat._id} key={subCat._id}>
                              {subCat.name}
                            </option>
                          ))}
                      </select>
                      {errors.subCategoryId && (
                        <span className="text-danger">
                          {t(errors.subCategoryId.message)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Brand Name</label>
                      <select
                        className="form-select form-control dark-form-control"
                        aria-label="Default select example"
                        {...register("brandId", {
                          required: "This field is required",
                        })}
                      >
                        <option value="">Select</option>
                        {brands &&
                          brands.map((b) => (
                            <option value={b._id} key={b._id}>
                              {b.name}
                            </option>
                          ))}
                      </select>
                      {errors.brandId && (
                        <span className="text-danger">
                          {t(errors.brandId.message)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Helper Products</label>
                      <select
                        className="form-select form-control dark-form-control"
                        aria-label="Default select example"
                        onChange={onChangeHelperProductHandler}
                      >
                        <option value="">Select</option>
                        {helperProducts.length > 0 &&
                          helperProducts.map((product) => (
                            <option value={product._id} key={product._id}>
                              {product.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Select Unit</label>
                      <Controller
                        className="form-control form-control-solid form-control-lg mb-10 col-4"
                        control={control}
                        name="unit"
                        rules={{ required: true }}
                        render={({ field: { onChange, value, ref } }) => {
                          return (
                            <Select
                              onChange={(val) => {
                                onChange(val);
                              }}
                              options={units}
                              defaultValue={[]}
                              value={value}
                              // value={selectedBrand}
                              className="form-select- form-control- dark-form-control libSelect"
                            />
                          );
                        }}
                      />
                      {errors.unit && errors.unit.type === "required" && (
                        <span className="text-danger">
                          {t("This field is required")}
                        </span>
                      )}

                      {/* <select className="js-select2" multiple="multiple">
                        <option value="O1" data-badge="">
                          Warehouse name 1
                        </option>
                        <option value="O2" data-badge="">
                          Warehouse name 2
                        </option>
                        <option value="O3" data-badge="">
                          Warehouse name 3
                        </option>
                        <option value="O4" data-badge="">
                          Warehouse name 4
                        </option>
                      </select> */}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Select Warehouse</label>
                      <Controller
                        className="form-control form-control-solid form-control-lg mb-10 col-4"
                        control={control}
                        name="warehouse"
                        rules={{ required: true }}
                        render={({ field: { onChange, value, ref } }) => {
                          return (
                            <Select
                              onChange={(val) => {
                                onChange(val);
                              }}
                              options={warehouse}
                              isMulti={true}
                              defaultValue={[]}
                              // value={selectedBrand}
                              className="form-select- form-control- dark-form-control libSelect"
                            />
                          );
                        }}
                      />
                      {errors.warehouse &&
                        errors.warehouse.type === "required" && (
                          <span className="text-danger">
                            {t("This field is required")}
                          </span>
                        )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Quantity</label>
                      <input
                        type="text"
                        name=""
                        className="form-control dark-form-control"
                        defaultValue=""
                        {...register("quantity", {
                          required: "This field is required",
                          pattern: {
                            value: /^\d*[1-9]\d*$/,
                            message: "Please enter positive digits only",
                          },
                          setValueAs: (v) => v.trim(),
                        })}
                      />
                      {errors.quantity && (
                        <span className="text-danger">
                          {t(errors.quantity.message)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Buying Price</label>
                      <input
                        type="text"
                        name=""
                        className="form-control dark-form-control"
                        defaultValue=""
                        {...register("buyingPrice", {
                          required: "This field is required",
                          pattern: {
                            value: /^\d*[1-9]\d*$/,
                            message: "Please enter positive digits only",
                          },
                        })}
                      />
                      {errors.buyingPrice && (
                        <span className="text-danger">
                          {t(errors.buyingPrice.message)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Stock</label>
                      <select
                        className="form-select form-control dark-form-control"
                        aria-label="Default select example"
                        {...register("inStock", {
                          required: "This field is required",
                        })}
                      >
                        <option value="">Select</option>
                        <option value={true}>In Stock</option>
                        <option value={false}>Out of Stock</option>
                      </select>
                      {errors.inStock && (
                        <span className="text-danger">
                          {t(errors.inStock.message)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Countries</label>
                      <Controller
                        className="form-control form-control-solid form-control-lg mb-10 col-4"
                        control={control}
                        name="countries"
                        rules={{ required: true }}
                        render={({ field: { onChange, value, ref } }) => {
                          return (
                            <Select
                              onChange={(val) => {
                                onChange(val);
                                handleChangeCountry(val);
                              }}
                              options={countriesOption}
                              isMulti={true}
                              value={value}
                              className="form-select- form-control- dark-form-control libSelect"
                            />
                          );
                        }}
                      />
                      {errors.countries &&
                        errors.countries.type === "required" && (
                          <span className="text-danger">
                            {t("This field is required")}
                          </span>
                        )}
                    </div>
                  </div>
                  {countries &&
                    countries.map((country) => (
                      <Fragment key={country._id}>
                        <div className="row">
                          <h5 className="CountriesPri">{country.name}</h5>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label>Selling Price *</label>
                              <input
                                type="text"
                                name=""
                                className="form-control dark-form-control"
                                defaultValue=""
                                {...register(`sellingPrice_${country._id}`, {
                                  required: "This field is required",
                                  pattern: {
                                    value: /^\d*[1-9]\d*$/,
                                    message:
                                      "Please enter positive digits only",
                                  },
                                })}
                              />
                              {errors[`sellingPrice_${country._id}`] && (
                                <span className="text-danger">
                                  {t(
                                    errors[`sellingPrice_${country._id}`]
                                      .message
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label>Discounted Price *</label>
                              <input
                                type="text"
                                name=""
                                className="form-control dark-form-control"
                                defaultValue=""
                                {...register(`discountedPrice_${country._id}`, {
                                  required: "This field is required",
                                  pattern: {
                                    value: /^\d*[1-9]\d*$/,
                                    message:
                                      "Please enter positive digits only",
                                  },
                                })}
                              />
                              {errors[`discountedPrice_${country._id}`] && (
                                <span className="text-danger">
                                  {t(
                                    errors[`discountedPrice_${country._id}`]
                                      .message
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="checkGSTRow">
                              {country.taxData &&
                                country.taxData.map((t) => (
                                  <div className="form-group custom_checkbox check-type2 CustomersDetails">
                                    <input
                                      type="checkbox"
                                      id="checkgst1"
                                      {...register(
                                        `tax-${country._id}-${t._id}`,
                                        {
                                          required: false,
                                        }
                                      )}
                                    />

                                    <label htmlFor="checkgst1">{`${t.name}(${t.tax})`}</label>
                                  </div>
                                ))}
                              {/* <div className="form-group custom_checkbox check-type2 CustomersDetails">
                                <input type="checkbox" id="checkgst2" />
                                <label htmlFor="checkgst2">GST(12%)</label>
                              </div> */}
                            </div>
                          </div>
                        </div>
                      </Fragment>
                    ))}

                  <div className="col-md-12">
                    <div className="form-group">
                      <label>Short Description *</label>
                      <textarea
                        name=""
                        id=""
                        cols={30}
                        rows={4}
                        className="form-control dark-form-control"
                        defaultValue={""}
                        {...register("shortDescription", {
                          required: "This field is required",
                          setValueAs: (v) => v.trim(),
                        })}
                      />
                      {errors.shortDescription && (
                        <span className="text-danger">
                          {t(errors.shortDescription.message)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="form-group">
                      <label>Long Description *</label>
                      <CKEditor
                        // initData={getValues(name)}
                        config={{
                          extraAllowedContent:
                            "p(*)[*]{*};div(*)[*]{*};li(*)[*]{*};ul(*)[*]{*};i(*)[*]{*}",
                          allowedContent: true,
                          protectedSource: [/<i[^>]*><\/i>/g],
                          // removeEmpty: { i: false },
                        }}
                        onChange={({ editor }) => {
                          const data = editor.getData();
                          if (data) {
                            setValue("longDescription", data);
                            clearErrors("longDescription");
                          }
                        }}
                        onInstanceReady={(editor) => {
                          ckEditorRef.current = editor;
                        }}
                      />
                      {errors.longDescription && (
                        <span className="text-danger">
                          {t(errors.longDescription.message)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="specifications">
                  <div className="row">
                    <div className="col-md-5 col-sm-6">
                      <h3 className="subTitles">Features or Specifications</h3>
                    </div>
                    <div className="col-md-7 col-sm-6">
                      <div className="addSpecificationsbtn">
                        <a
                          onClick={() => addFeatureHandler()}
                          className="sms_alert_btn sms_active_btns cursor"
                        >
                          Add Features
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Feature or Specification Title</label>
                    <input
                      type="text"
                      name=""
                      className="form-control dark-form-control"
                      defaultValue=""
                      placeholder="Feature or Specification Title"
                      {...register("featureTitle", {
                        required: "This field is required",
                        setValueAs: (v) => v.trim(),
                      })}
                    />
                    {errors.featureTitle && (
                      <span className="text-danger">
                        {t(errors.featureTitle.message)}
                      </span>
                    )}
                  </div>
                  <div className="specifications-row default-spec-row">
                    {features &&
                      features.map((feature) => (
                        <div className="row">
                          <div className="col-md-5">
                            <div className="form-group">
                              <label>Enter Feature Label*</label>
                              <input
                                type="text"
                                name=""
                                className="form-control dark-form-control"
                                defaultValue=""
                                {...register(`featureLabel${feature.id}`, {
                                  required: "This field is required",
                                  setValueAs: (v) => v.trim(),
                                })}
                              />
                              {errors[`featureLabel${feature.id}`] && (
                                <span className="text-danger">
                                  {t(
                                    errors[`featureLabel${feature.id}`].message
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-md-5">
                            <div className="form-group">
                              <label>Enter Feature Value*</label>
                              <input
                                type="text"
                                name=""
                                className="form-control dark-form-control"
                                defaultValue=""
                                {...register(`featureValue${feature.id}`, {
                                  required: "This field is required",
                                  setValueAs: (v) => v.trim(),
                                })}
                              />
                              {errors[`featureValue${feature.id}`] && (
                                <span className="text-danger">
                                  {t(
                                    errors[`featureValue${feature.id}`].message
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-md-2">
                            <div className="form-group">
                              <label className="pt-4 d-block"> </label>
                              <button
                                type="button"
                                className="btn btn-bg-danger ml-2 mt-1"
                                onClick={() => featureDeleteHandler(feature.id)}
                              >
                                <i className="fas fa-trash-alt" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Other Details Start*/}
            <div className="col-md-12">
              <div className="dashCard">
                {variants.length > 0 && (
                  <>
                    <div className="specifications">
                      <div className="row">
                        <div className="col-md-5 col-sm-6">
                          <h3 className="subTitles">Variant</h3>
                        </div>
                        <div className="col-md-7 col-sm-6">
                          <div className="addSpecificationsbtn">
                            <a
                              onClick={variantModalShowHandle}
                              className="sms_alert_btn sms_active_btns"
                              // data-bs-toggle="modal"
                              // data-bs-target="#variantModal"
                            >
                              Variant Customization
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="specifications-row default-spec-row">
                        {variantCount !== null && (
                          <div
                            className="accordion variantAccordion"
                            id="accordionFlushExample"
                          >
                            {Array(variantCount)
                              .fill(null)
                              .map((_, idx) => idx)
                              .map((id) => (
                                <div className="accordion-item">
                                  <h2 className="accordion-header">
                                    <button
                                      className="accordion-button collapsed"
                                      type="button"
                                      data-bs-toggle="collapse"
                                      data-bs-target={`#flush-collapseTwo-variant-${id}`}
                                      aria-expanded="false"
                                      aria-controls={`flush-collapseTwo-variant-${id}`}
                                    >
                                      {selectedVariant.length === 1
                                        ? `${
                                            selectedVariant[0].name
                                          }: ${getValues(
                                            `subVariant.${id}_first`
                                          )}`
                                        : `${
                                            selectedVariant[0].name
                                          }: ${getValues(
                                            `subVariant.${id}_first`
                                          )} and ${
                                            selectedVariant[1].name
                                          }: ${getValues(
                                            `subVariant.${id}_second`
                                          )}`}
                                    </button>
                                  </h2>
                                  <div
                                    id={`flush-collapseTwo-variant-${id}`}
                                    className="accordion-collapse collapse"
                                    data-bs-parent="#accordionFlushExample"
                                  >
                                    <div className="accordion-body">
                                      <div
                                        className="accordion variantAccordion"
                                        id="accordionFlushExample2"
                                      >
                                        <div className="accordion-item">
                                          <h2 className="accordion-header">
                                            <button
                                              className="accordion-button collapsed"
                                              type="button"
                                              data-bs-toggle="collapse"
                                              data-bs-target={`#flush-collapseOne1-${id}`}
                                              aria-expanded="false"
                                              aria-controls={`flush-collapseOne1-${id}`}
                                            >
                                              Available Quantity
                                            </button>
                                          </h2>
                                          <div
                                            id={`flush-collapseOne1-${id}`}
                                            className="accordion-collapse collapse"
                                            data-bs-parent="#accordionFlushExample2"
                                          >
                                            <div className="accordion-body">
                                              <div className="variantBody">
                                                <div className="row">
                                                  <div className="col-md-6">
                                                    <div className="form-group">
                                                      <label>Quantity *</label>
                                                      <input
                                                        type="text"
                                                        name=""
                                                        className="form-control dark-form-control"
                                                        defaultValue=""
                                                        {...register(
                                                          `subVariant.${id}_quantity`,
                                                          {
                                                            required:
                                                              "This field is required",
                                                            pattern: {
                                                              value:
                                                                /^\d*[0-9]\d*$/,
                                                              message:
                                                                "Please enter positive digits only",
                                                            },
                                                          }
                                                        )}
                                                      />
                                                      {errors.subVariant?.[
                                                        `${id}_quantity`
                                                      ] && (
                                                        <span className="text-danger">
                                                          {t(
                                                            errors.subVariant[
                                                              `${id}_quantity`
                                                            ].message
                                                          )}
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="accordion-item">
                                          <h2 className="accordion-header">
                                            <button
                                              className="accordion-button collapsed"
                                              type="button"
                                              data-bs-toggle="collapse"
                                              data-bs-target={`#flush-collapseTwo2-${id}`}
                                              aria-expanded="false"
                                              aria-controls={`flush-collapseTwo2-${id}`}
                                            >
                                              Shipping Specifications
                                            </button>
                                          </h2>
                                          <div
                                            id={`flush-collapseTwo2-${id}`}
                                            className="accordion-collapse collapse"
                                            data-bs-parent="#accordionFlushExample2"
                                          >
                                            <div className="accordion-body">
                                              <div className="variantBody">
                                                <div className="row">
                                                  <div className="col-md-3">
                                                    <div className="form-group">
                                                      <label>Height </label>
                                                      <input
                                                        type="text"
                                                        name=""
                                                        className="form-control dark-form-control"
                                                        defaultValue=""
                                                        {...register(
                                                          `subVariant.${id}_height`,
                                                          {
                                                            required:
                                                              "This field is required",
                                                            pattern: {
                                                              value:
                                                                /^\d*[1-9]\d*$/,
                                                              message:
                                                                "Please enter positive digits only",
                                                            },
                                                          }
                                                        )}
                                                      />
                                                      {errors.subVariant?.[
                                                        `${id}_height`
                                                      ] && (
                                                        <span className="text-danger">
                                                          {t(
                                                            errors.subVariant[
                                                              `${id}_height`
                                                            ].message
                                                          )}
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>
                                                  <div className="col-md-3">
                                                    <div className="form-group">
                                                      <label>Weight</label>
                                                      <input
                                                        type="text"
                                                        name=""
                                                        className="form-control dark-form-control"
                                                        defaultValue=""
                                                        {...register(
                                                          `subVariant.${id}_weight`,
                                                          {
                                                            required:
                                                              "This field is required",
                                                            pattern: {
                                                              value:
                                                                /^\d*[0-9]\d*$/,
                                                              message:
                                                                "Please enter positive digits only",
                                                            },
                                                          }
                                                        )}
                                                      />
                                                      {errors.subVariant?.[
                                                        `${id}_weight`
                                                      ] && (
                                                        <span className="text-danger">
                                                          {t(
                                                            errors.subVariant[
                                                              `${id}_weight`
                                                            ].message
                                                          )}
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>
                                                  <div className="col-md-3">
                                                    <div className="form-group">
                                                      <label>Width</label>
                                                      <input
                                                        type="text"
                                                        name=""
                                                        className="form-control dark-form-control"
                                                        defaultValue=""
                                                        {...register(
                                                          `subVariant.${id}_width`,
                                                          {
                                                            required:
                                                              "This field is required",
                                                            pattern: {
                                                              value:
                                                                /^\d*[0-9]\d*$/,
                                                              message:
                                                                "Please enter positive digits only",
                                                            },
                                                          }
                                                        )}
                                                      />
                                                      {errors.subVariant?.[
                                                        `${id}_width`
                                                      ] && (
                                                        <span className="text-danger">
                                                          {t(
                                                            errors.subVariant[
                                                              `${id}_width`
                                                            ].message
                                                          )}
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>
                                                  <div className="col-md-3">
                                                    <div className="form-group">
                                                      <label>Length</label>
                                                      <input
                                                        type="text"
                                                        name=""
                                                        className="form-control dark-form-control"
                                                        defaultValue=""
                                                        {...register(
                                                          `subVariant.${id}_length`,
                                                          {
                                                            required:
                                                              "This field is required",
                                                            pattern: {
                                                              value:
                                                                /^\d*[0-9]\d*$/,
                                                              message:
                                                                "Please enter positive digits only",
                                                            },
                                                          }
                                                        )}
                                                      />
                                                      {errors.subVariant?.[
                                                        `${id}_length`
                                                      ] && (
                                                        <span className="text-danger">
                                                          {t(
                                                            errors.subVariant[
                                                              `${id}_length`
                                                            ].message
                                                          )}
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="accordion-item">
                                          <h2 className="accordion-header">
                                            <button
                                              className="accordion-button collapsed"
                                              type="button"
                                              data-bs-toggle="collapse"
                                              data-bs-target={`#flush-collapseThree3-${id}`}
                                              aria-expanded="false"
                                              aria-controls={`flush-collapseThree3-${id}`}
                                            >
                                              Prices
                                            </button>
                                          </h2>
                                          <div
                                            id={`flush-collapseThree3-${id}`}
                                            className="accordion-collapse collapse"
                                            data-bs-parent="#accordionFlushExample2"
                                          >
                                            <div className="accordion-body">
                                              <div className="variantBody">
                                                <div className="d-flex align-items-start">
                                                  <div
                                                    className="nav flex-column w-auto nav-pills marginLeft"
                                                    id="v-pills-tab"
                                                    role="tablist"
                                                    aria-orientation="vertical"
                                                  >
                                                    {selectedCountries.map(
                                                      (country, idx) => (
                                                        <button
                                                          key={idx}
                                                          className={`nav-link ${
                                                            idx === 0
                                                              ? "active"
                                                              : null
                                                          }`}
                                                          id={`v-pills-home-tab-${id}-${country.value}`}
                                                          data-bs-toggle="pill"
                                                          data-bs-target={`#v-pills-home-${id}-${country.value}`}
                                                          type="button"
                                                          role="tab"
                                                          aria-controls={`v-pills-home-${id}-${country.value}`}
                                                          aria-selected="true"
                                                        >
                                                          {country.label}
                                                        </button>
                                                      )
                                                    )}
                                                  </div>
                                                  <div
                                                    className="tab-content"
                                                    id="v-pills-tabContent"
                                                  >
                                                    {selectedCountries.map(
                                                      (country, idx) => (
                                                        <div
                                                          className={`tab-pane fade ${
                                                            idx === 0
                                                              ? "show active"
                                                              : ""
                                                          }`}
                                                          id={`v-pills-home-${id}-${country.value}`}
                                                          role="tabpanel"
                                                          aria-labelledby={`v-pills-home-tab-${id}-${country.value}`}
                                                          tabIndex={
                                                            country.value
                                                          }
                                                        >
                                                          <div className="row">
                                                            <h5 className="CountriesPri">
                                                              {country.label}
                                                            </h5>
                                                            <div className="col-md-6">
                                                              <div className="form-group">
                                                                <label>
                                                                  Selling Price
                                                                  *
                                                                </label>
                                                                <input
                                                                  type="text"
                                                                  name=""
                                                                  className="form-control dark-form-control"
                                                                  defaultValue=""
                                                                  {...register(
                                                                    `subVariant.${id}_sellingPrice_${country.value}`,
                                                                    {
                                                                      required:
                                                                        "This field is required",
                                                                      pattern: {
                                                                        value:
                                                                          /^\d*[1-9]\d*$/,
                                                                        message:
                                                                          "Please enter positive digits only",
                                                                      },
                                                                    }
                                                                  )}
                                                                />
                                                                {errors
                                                                  .subVariant?.[
                                                                  `${id}_sellingPrice_${country.value}`
                                                                ] && (
                                                                  <span className="text-danger">
                                                                    {t(
                                                                      errors
                                                                        .subVariant?.[
                                                                        `${id}_sellingPrice_${country.value}`
                                                                      ].message
                                                                    )}
                                                                  </span>
                                                                )}
                                                              </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                              <div className="form-group">
                                                                <label>
                                                                  Discounted
                                                                  Price *
                                                                </label>
                                                                <input
                                                                  type="text"
                                                                  name=""
                                                                  className="form-control dark-form-control"
                                                                  defaultValue=""
                                                                  {...register(
                                                                    `subVariant.${id}_discountedPrice_${country.value}`,
                                                                    {
                                                                      required:
                                                                        "This field is required",
                                                                      pattern: {
                                                                        value:
                                                                          /^\d*[1-9]\d*$/,
                                                                        message:
                                                                          "Please enter positive digits only",
                                                                      },
                                                                    }
                                                                  )}
                                                                />
                                                                {errors
                                                                  .subVariant?.[
                                                                  `${id}_discountedPrice_${country.value}`
                                                                ] && (
                                                                  <span className="text-danger">
                                                                    {t(
                                                                      errors
                                                                        .subVariant?.[
                                                                        `${id}_discountedPrice_${country.value}`
                                                                      ].message
                                                                    )}
                                                                  </span>
                                                                )}
                                                              </div>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      )
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                        <div
                          className="accordion variantAccordion"
                          id="accordionFlushExample"
                        ></div>
                      </div>
                      {/* specifications-row END */}
                    </div>
                    {mediaFiles.length > 0 && variantCount !== null && (
                      <div className="specifications">
                        <div className="row">
                          <div className="col-md-5 col-sm-6">
                            <h3 className="subTitles">Variant Media</h3>
                          </div>
                        </div>
                        <div className="specifications-row default-spec-row">
                          <div
                            className="accordion variantAccordion"
                            id="VariantMedia"
                          >
                            {subVariants.map((sv, idx) => (
                              <div key={idx} className="accordion-item">
                                <h2 className="accordion-header">
                                  <button
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#Variantmedia-collapseOne-${idx}`}
                                    aria-expanded="false"
                                    aria-controls={`Variantmedia-collapseOne-${idx}`}
                                  >
                                    {sv.name}
                                  </button>
                                </h2>
                                <div
                                  id={`Variantmedia-collapseOne-${idx}`}
                                  className="accordion-collapse collapse"
                                  data-bs-parent="#VariantMedia"
                                >
                                  <div className="accordion-body">
                                    <div className="variantBody">
                                      <div className="form_input_area">
                                        <div className="row">
                                          {selectedMedia[idx]?.length === 0
                                            ? "No Media Uploaded"
                                            : selectedMedia[idx]?.map(
                                                (media) => (
                                                  <div className="col-2 px-2 px-md-3 col-md-2">
                                                    <div
                                                      className="meCard"
                                                      onClick={() =>
                                                        unselectMediaHandler(
                                                          idx,
                                                          media.id,
                                                          media.isSelected
                                                            ? "remove"
                                                            : "add"
                                                        )
                                                      }
                                                    >
                                                      <a
                                                        href="javascript:void(0);"
                                                        className={
                                                          media.isSelected
                                                            ? "active"
                                                            : ""
                                                        }
                                                      >
                                                        <img
                                                          // src="./img/Featured-Gift-img-8.png"
                                                          src={media.media}
                                                          alt=""
                                                        />
                                                      </a>
                                                    </div>
                                                  </div>
                                                )
                                              )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* specifications-row END */}
                      </div>
                    )}
                  </>
                )}
                <div className="specifications">
                  <div className="row">
                    <div className="col-md-5 col-sm-6">
                      <h3 className="subTitles">Shipping Specifications</h3>
                    </div>
                  </div>
                  <div className="specifications-row default-spec-row">
                    <div className="row">
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Product Height </label>
                          <input
                            type="text"
                            name=""
                            className="form-control dark-form-control"
                            defaultValue=""
                            placeholder="Product Height"
                            {...register("height", {
                              required: "This field is required",
                              pattern: {
                                value: /^\d*[1-9]\d*$/,
                                message: "Please enter positive digits only",
                              },
                            })}
                          />
                          {errors.height && (
                            <span className="text-danger">
                              {t(errors.height.message)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Product Weight</label>
                          <input
                            type="text"
                            name=""
                            className="form-control dark-form-control"
                            defaultValue=""
                            placeholder="Product Weight"
                            {...register("weight", {
                              required: "This field is required",
                              pattern: {
                                value: /^\d*[1-9]\d*$/,
                                message: "Please enter positive digits only",
                              },
                            })}
                          />
                          {errors.weight && (
                            <span className="text-danger">
                              {t(errors.weight.message)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Product Width</label>
                          <input
                            type="text"
                            name=""
                            className="form-control dark-form-control"
                            defaultValue=""
                            placeholder="Product Width"
                            {...register("width", {
                              required: "This field is required",
                              pattern: {
                                value: /^\d*[1-9]\d*$/,
                                message: "Please enter positive digits only",
                              },
                            })}
                          />

                          {errors.width && (
                            <span className="text-danger">
                              {t(errors.width.message)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Product Length</label>
                          <input
                            type="text"
                            name=""
                            className="form-control dark-form-control"
                            defaultValue=""
                            placeholder="Product Length"
                            {...register("length", {
                              required: true,
                              pattern: {
                                value: /^\d*[1-9]\d*$/,
                                message: "Please enter positive digits only",
                              },
                            })}
                          />
                          {errors.length && (
                            <span className="text-danger">
                              {t(errors.length.message)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* specifications-row END */}
                  <div className="specifications-row">
                    <div className="row"></div>
                  </div>
                  {/* specifications-row END */}
                </div>
                <div className="specifications">
                  <div className="row">
                    <div className="col-md-5 col-sm-6">
                      <h3 className="subTitles">Alternate Products</h3>
                    </div>
                    <div className="col-md-7 col-sm-6">
                      <div className="addSpecificationsbtn">
                        <a
                          href="#!"
                          className="sms_alert_btn sms_active_btns"
                          data-bs-toggle="modal"
                          data-bs-target="#alternateModal"
                        >
                          Add
                        </a>
                      </div>
                    </div>
                    {selectedAlternateProductsObj.ids.length > 0 && (
                      <div className="custom">
                        <div className="table-responsive">
                          <table className="table table-striped">
                            <thead className="table-dark">
                              <tr>
                                <th>Product Name</th>
                                <th width="50px">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedAlternateProductsObj.data.map((p) => (
                                <tr key={p.id}>
                                  <td>{p.name}</td>
                                  <td
                                    width="50px"
                                    onClick={() => {
                                      removeSelectedProduct(p.id);
                                    }}
                                  >
                                    <button
                                      type="button"
                                      className="btn btn-bg-danger"
                                    >
                                      <i
                                        style={{ color: "#fff" }}
                                        class="fas fa-trash-alt"
                                      ></i>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12">
                    <div className="row">
                      <div className="col-md-5 col-sm-6">
                        <h3 className="subTitles">Add FAQs</h3>
                      </div>
                      <div className="col-md-7 col-sm-6">
                        <div className="addSpecificationsbtn">
                          <a
                            onClick={() => addFaqHandler()}
                            className="sms_alert_btn sms_active_btns"
                          >
                            Add FAQ
                          </a>
                        </div>
                      </div>
                    </div>
                    {faqs &&
                      faqs.map((faq) => (
                        <>
                          <div className="form-group">
                            <div className="row">
                              <div className="col-md-10">
                                <input
                                  type="text"
                                  name=""
                                  className="form-control dark-form-control"
                                  placeholder="Question"
                                  {...register(`faqQuestion${faq.id}`, {
                                    required: "This field is required",
                                    setValueAs: (v) => v.trim(),
                                  })}
                                />
                                {errors[`faqQuestion${faq.id}`] && (
                                  <span className="text-danger">
                                    {t(errors[`faqQuestion${faq.id}`].message)}
                                  </span>
                                )}
                              </div>

                              <div className="col-md-2">
                                <div className="form-group">
                                  <label className="d-block"> </label>
                                  <button
                                    type="button"
                                    className="btn btn-bg-danger ml-2 mt-1"
                                    onClick={() => faqDeleteHandler(faq.id)}
                                  >
                                    <i className="fas fa-trash-alt" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="form-group">
                            <textarea
                              name=""
                              id=""
                              cols={30}
                              rows={4}
                              className="form-control dark-form-control"
                              placeholder="Answer..."
                              {...register(`faqAnswer${faq.id}`, {
                                required: true,
                                setValueAs: (v) => v.trim(),
                              })}
                            />
                            {errors[`faqAnswer${faq.id}`] && (
                              <span className="text-danger">
                                {t(errors[`faqAnswer${faq.id}`].message)}
                              </span>
                            )}
                          </div>
                        </>
                      ))}
                  </div>

                  <div className="ProductMetaInpurBlock">
                    <h3 className="subTitles">Product Meta </h3>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Title </label>
                      <input
                        type="text"
                        name=""
                        className="form-control dark-form-control"
                        defaultValue=""
                        {...register("metaData.title", { required: false })}
                      />
                    </div>
                  </div>
                  <div className="col-md-8">
                    <div className="form-group">
                      <label>Keywords</label>
                      <input
                        type="text"
                        name=""
                        className="form-control dark-form-control"
                        defaultValue=""
                        {...register("metaData.keywords", { required: false })}
                      />
                      {errors.keywords &&
                        errors.keywords.type === "required" && (
                          <span className="text-danger">
                            {t("This field is required")}
                          </span>
                        )}
                      {false && (
                        <div className="contryList">
                          <span className="ctry-name">
                            Men’s Clothing
                            <a href="javascript:void()" />
                          </span>
                          <span className="ctry-name">
                            Men’s Clothing
                            <a href="javascript:void()" />
                          </span>
                          <span className="ctry-name">
                            Men’s Clothing
                            <a href="javascript:void()" />
                          </span>
                          <span className="ctry-name">
                            Men’s Clothing
                            <a href="javascript:void()" />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="form-group">
                      <label>Meta Description</label>
                      <textarea
                        name=""
                        id=""
                        cols={30}
                        rows={4}
                        className="form-control dark-form-control"
                        defaultValue={""}
                        {...register("metaData.description", {
                          required: false,
                        })}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Author </label>
                      <input
                        type="text"
                        name=""
                        className="form-control dark-form-control"
                        defaultValue=""
                        {...register("metaData.author", { required: false })}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="form-group">
                      <label>Twitter Card</label>
                      <textarea
                        name=""
                        id=""
                        cols={30}
                        rows={4}
                        className="form-control dark-form-control"
                        defaultValue={""}
                        {...register("metaData.twitterCard", {
                          required: false,
                        })}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Twitter Site</label>
                      <input
                        type="text"
                        name=""
                        className="form-control dark-form-control"
                        defaultValue=""
                        {...register("metaData.twitterSite", {
                          required: false,
                        })}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>OG Url </label>
                      <input
                        type="text"
                        name=""
                        className="form-control dark-form-control"
                        defaultValue=""
                        {...register("metaData.ogUrl", { required: false })}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>OG Type</label>
                      <input
                        type="text"
                        name=""
                        className="form-control dark-form-control"
                        defaultValue=""
                        {...register("metaData.ogType", { required: false })}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>OG Title</label>
                      <input
                        type="text"
                        name=""
                        className="form-control dark-form-control"
                        defaultValue=""
                        {...register("metaData.ogTitle", { required: false })}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="form-group">
                      <label>OG Description</label>
                      <textarea
                        name=""
                        id=""
                        cols={30}
                        rows={4}
                        className="form-control dark-form-control"
                        defaultValue={""}
                        {...register("metaData.ogDescription", {
                          required: false,
                        })}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Og Image</label>
                      <input
                        type="file"
                        name=""
                        className="form-control dark-form-control"
                        defaultValue=""
                        {...register("ogImage", { required: false })}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>OG Tag</label>
                      <input
                        type="text"
                        name=""
                        className="form-control dark-form-control"
                        defaultValue=""
                        {...register("metaData.ogTag", { required: false })}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>OG Alt Tag</label>
                      <input
                        type="text"
                        name=""
                        className="form-control dark-form-control"
                        defaultValue=""
                        {...register("metaData.ogAltTag", { required: false })}
                      />
                    </div>
                  </div>
                  <div className="draftProductButtons">
                    <a
                      onClick={() => {
                        draftRef.current = false;
                        publishRef.current.click();
                      }}
                      href="#!"
                      className="btn btn-primarys"
                    >
                      Save Product as draft
                    </a>
                    <button
                      ref={publishRef}
                      type="submit"
                      className="btn btn-primary"
                      onClick={handleSubmit(onSubmit, onErrors)}
                    >
                      Submit Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* page_container END */}
      </LayoutWrapper>
      {/* Modal */}
      {/* Modal */}
      <Modal
        show={variantModal}
        onHide={variantModalCloseHandle}
        className="modal fade"
        id="variantModal"
        // tabIndex={-1}
        // aria-labelledby="exampleModalLabel"
        // aria-hidden="true"
      >
        {/* <div className="modal-dialog modal-dialog-scrollable modal-dialog-centered"> */}
        <div className="modal-header">
          <h1 className="modal-title fs-5" id="exampleModalLabel">
            Variant Customization
          </h1>
          <button
            type="button"
            className="btn-close"
            // data-bs-dismiss="modal"
            // aria-label="Close"
            onClick={() => variantModalCloseHandle()}
          />
        </div>
        <div className="modal-body">
          <div
            className="accordion accordion-flush_ variantAccordion"
            id="accordionFlushExample"
          >
            {variants &&
              variants.map((v) => (
                <div className="accordion-item" key={v._id}>
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#flush-collapse${v._id}`}
                      aria-expanded="false"
                      aria-controls={`flush-collapse${v._id}`}
                    >
                      {v.name}
                      <label class="custom_checkbox check-type2 CustomersDetails ms-2">
                        {!v.isMasterVariant && (
                          <>
                            <input
                              type="checkbox"
                              checked={v.isChecked}
                              onChange={(e) => {
                                variantCheckHandler(v._id, e.target.checked);
                              }}
                              style={{ height: "20px" }}
                              id={v._id}
                            />
                            <span></span>
                          </>
                        )}
                      </label>
                    </button>
                  </h2>

                  {v.isChecked && (
                    <div
                      id={`flush-collapse${v._id}`}
                      className="accordion-collapse collapse"
                      data-bs-parent="#accordionFlushExample"
                    >
                      <div className="accordion-body">
                        <div className="variantBody">
                          <div className="checkGSTRow">
                            {v.subVariants &&
                              v.subVariants.length > 0 &&
                              v.subVariants.map((s) => (
                                <div
                                  className="custom_checkbox check-type2 CustomersDetails"
                                  key={s._id}
                                >
                                  <input
                                    type="checkbox"
                                    id={`checkvariant${s._id}`}
                                    checked={s.isChecked}
                                    onChange={(e) => {
                                      subVariantCheckHandler(
                                        v._id,
                                        s.id,
                                        e.target.checked
                                      );
                                    }}
                                  />
                                  <label htmlFor={`checkvariant${s._id}`}>
                                    {s.name}
                                  </label>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              onClick={variantModalCloseHandle}
            >
              Close
            </button>
            <button
              onClick={variantCreateHandler}
              type="button"
              className="btn btn-primary"
            >
              Save changes
            </button>
          </div>
        </div>
      </Modal>

      <div
        className="modal fade"
        id="alternateModal"
        tabIndex={-1}
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">
                Alternate Products
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-3">
                  <div className="input-icon">
                    <label>Search</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search..."
                      id="related_products_datatable_search_query"
                      onChange={(e) => searchOptimizedFn(e.target.value)}
                    />
                    <span>
                      <i className="flaticon2-search-1 text-muted" />
                    </span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      className="form-select form-control dark-form-control"
                      aria-label="Default select example"
                      {...registerSearch("category")}
                    >
                      <option value="">Select</option>
                      {searchCategories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Brand</label>
                    <select
                      className="form-select form-control dark-form-control"
                      aria-label="Default select example"
                      {...registerSearch("brand")}
                    >
                      <option value="">Select</option>
                      {searchBrands.map((brand) => (
                        <option key={brand._id} value={brand._id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Supplier</label>
                    <select
                      className="form-select form-control dark-form-control"
                      aria-label="Default select example"
                      {...registerSearch("vendor")}
                    >
                      <option value="">Select</option>
                      {searchVendors.map((vendor) => (
                        <option key={vendor._id} value={vendor._id}>
                          {vendor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-striped">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col">
                        <div className="custom_checkbox check-type2">
                          <input type="checkbox" id="check4" />
                        </div>
                      </th>
                      <th scope="col">Product Number</th>
                      <th scope="col">Name</th>
                      <th scope="col">Category</th>
                      <th scope="col">Brand</th>
                      <th scope="col">Supplier</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  {alternateProducts &&
                    alternateProducts.map((s) => (
                      <tbody key={s._id}>
                        <tr>
                          <td scope="row">
                            <div className="custom_checkbox check-type2">
                              <input type="checkbox" id="check4" />
                            </div>
                          </td>
                          <td>{s?.customId}</td>
                          <td>{s?.name}</td>
                          <td>{s?.categoryName}</td>
                          <td>{s?.brandName}</td>
                          <td>{s?.vendorName}</td>
                          <td>
                            <span className="action">
                              {!selectedAlternateProductsObj.ids.includes(
                                s._id
                              ) ? (
                                <a
                                  className="btn btn-sm btn-clean btn-icon mr-2 related_products"
                                  title="Add Product "
                                  data-id="6371fee00a24cadeee0cea52"
                                  onClick={() =>
                                    addAlternateProductHandler(s._id, s.name)
                                  }
                                >
                                  <span className="svg-icon svg-icon-md">
                                    <Edit />
                                  </span>
                                </a>
                              ) : (
                                <a
                                  href="javascript:;"
                                  className="btn btn-sm btn-clean btn-icon mr-2 related_products"
                                  title="Add Product "
                                  data-id="6371fee00a24cadeee0cea52"
                                >
                                  {" "}
                                  <span className="svg-icon svg-icon-md colorGreen">
                                    {" "}
                                    <i class="fas fa-circle"></i> Added{" "}
                                  </span>{" "}
                                </a>
                              )}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    ))}
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button type="button" className="btn btn-primary">
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export async function getServerSideProps(context) {
  createAxiosCookies(context);

  // const { data, customId, units, similarProducts, maximumImagesCount } =
  //   await getInitialAddProductData();

  let initialData = getInitialAddProductData();
  let similarProducts = getAlternateProducts();

  [initialData, similarProducts] = await Promise.all([
    initialData,
    similarProducts,
  ]);

  const {
    data,
    customId,
    units,
    maximumImagesCount,
    searchBrands,
    searchCategories,
    searchVendors,
  } = initialData;

  return {
    props: {
      protected: true,
      userTypes: ["vendor"],
      data,
      customId,
      unit: units,
      similarProducts,
      maximumImagesCount,
      searchBrands,
      searchCategories,
      searchVendors,
      locales: {
        ...require(`../../locales/index/${context.locale}.json`),
      },
    },
  };
}

export default AddProduct;
