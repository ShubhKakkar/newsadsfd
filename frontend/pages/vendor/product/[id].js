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
import { getEditProduct, getInitialAddProductData } from "@/services/product";
import { createAxiosCookies, urlToObject } from "@/fn";
import { Edit } from "@/components/Svg";
import { MEDIA_URL } from "@/api";
import { debounce } from "@/fn";
import ShippingSpecifications from "@/components/Product/ShippingSpecifications";
import Faqs from "@/components/Product/Faqs";
import Details from "@/components/Product/Details";
import Prices from "@/components/Product/Prices";
import Variants from "@/components/Product/Variants";

const imgArray = ["image/png", "image/jpeg", "image/jpg"];

const VIDEO = [
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-ms-wmv",
  "video/webm",
];

const EditProduct = ({
  product,
  taxes,
  editData,
  similarProducts,
  units,
  variants: selectedVariants,
  id,
  searchBrands,
  searchCategories,
  searchVendors,
  maximumImagesCount,
  currencies,
  categories,
  brands,
  allVariants,
  shippingCompanies,
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
  // const [masterCategory, setMasterCategory] = useState([]);
  // const [warehouse, setWarehouse] = useState([]);
  // const [units, setUnits] = useState([]);

  const [alternateProducts, setAlternateProducts] = useState(similarProducts);
  const [selectedAlternateProductsObj, setSelectedAlternateProductsObj] =
    useState({
      ids: [],
      data: [],
    });

  // const [subCategories, setSubCategories] = useState([]);
  // const [countriesOption, setCountriesOption] = useState([]);
  // const [countries, setCountries] = useState([]);
  const countries = [];
  // const [countriesWithTax, setCountriesWithTax] = useState([]);
  // const [selectedCountries, setSelectedCountries] = useState([]);
  // const [brands, setBrands] = useState([]);

  const [faqs, setFaqs] = useState([]);
  const [faqId, setFaqId] = useState(0);

  const [features, setFeatures] = useState([]);
  const [featureId, setFeaturesId] = useState(0);

  const [variants, setVariants] = useState([]);
  const [variantModal, setVariantModal] = useState(false);
  const [masterVariant, setMasterVariant] = useState(null);
  const [variantSelectionCount, setVariantSelectionCount] = useState(0); //number of variant selected

  const [selectedVariant, setSelectedVariant] = useState({
    variant1: null,
    variant2: null,
  });
  const [subVariants, setSubVariants] = useState([]); //selected sub variants

  const [mediaFiles, setMediaFiles] = useState([]); //media in binary
  const [previewMediaFiles, setPreviewMediaFiles] = useState([]);
  const [mediaNextId, setMediaNextId] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState({
    main: [],
  });
  const [featuredMediaId, setFeaturedMediaId] = useState(null);
  const [variantCountArr, setVariantCountArr] = useState([]);
  const [variantTh, setVariantTh] = useState([]); //heading of variant's table
  const [checkedVariants, setCheckedVariants] = useState([]);

  const [searchValue, setSearchValue] = useState("");

  const publishRef = useRef();
  const draftRef = useRef();

  const { request, response } = useRequest();

  // const {
  //   request: getSubcategoriesRequest,
  //   response: getSubcategoriesResponse,
  // } = useRequest();

  // const {
  //   request: getSubcategoriesDenpendDataRequest,
  //   response: getSubcategoriesDenpendDataResponse,
  // } = useRequest();

  const { request: getVariantsRequest, response: getVariantsResponse } =
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
    const {
      customId,
      barCode,
      hsCode,
      categoryId,
      categoryData,
      brand,
      unit,
      buyingPrice,
      buyingPriceCurrency,
      sellingPrice,
      discountedPrice,
      langData: { name, shortDescription, longDescription, features, faqs },
      height,
      weight,
      width,
      length,
      alternateProducts,
      variantsData,
      variants,
      coverImage,
      dc,
      shippingCompany,
    } = product;

    setValue("name", name);
    setValue("customId", customId);
    setValue("barCode", barCode);
    setValue("hsCode", hsCode);

    setValue("masterCategoryId", {
      label: categories.find((c) => c.value === categoryId).label,
      value: categoryId,
    });

    setValue("brandId", {
      label: brand.name,
      value: brand._id,
    });

    setValue("unit", {
      label: unit.name,
      value: unit._id,
    });

    setValue("buyingPrice", buyingPrice);
    setValue("currency", {
      label: currencies.find((c) => c._id === buyingPriceCurrency).sign,
      value: buyingPriceCurrency,
    });
    setValue("sellingPrice", sellingPrice);
    setValue("discountedPrice", discountedPrice);

    setValue("shortDescription", shortDescription);
    setValue("longDescription", longDescription);

    setValue("height", height);
    setValue("weight", weight);
    setValue("width", width);
    setValue("length", length);
    setValue("dc", dc);
    if (shippingCompany) {
      setValue("shippingCompany", {
        label: shippingCompany.name,
        value: shippingCompany._id,
      });
    }

    setSelectedAlternateProductsObj({
      ids: alternateProducts.map((a) => a._id),
      data: alternateProducts.map((a) => ({
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

    if (variantsData.length > 0) {
      let ids = [];

      const firstVariantProduct = variantsData[0];

      const twoVariants = !!firstVariantProduct.secondVariantId;

      const masterVariant = categoryData.masterVariantId;

      setMasterVariant(masterVariant);

      const variantsWithChecked = allVariants
        .map((v, idx) => ({
          ...v,
          order:
            variants.find((pv) => pv.id === v._id)?.order ||
            allVariants.length - idx,
          show: true,
          isMasterVariant: masterVariant === v._id,
          isChecked:
            masterVariant === v._id || !!variants.find((pv) => pv.id === v._id),
          subVariants: v.subVariants.map((sv) => ({
            ...sv,
            isChecked: !!variantsData.find(
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

        for (let i = 0; i < variantsData.length; i++) {
          const variant = variantsData[i];

          const id = variant.firstSubVariantId + variant.secondSubVariantId;
          ids.push(id);

          const key = `subVariant.${id}`;

          setValue(`${key}_docId`, variant._id);
          setValue(`${key}_firstId`, variant.firstSubVariantId);
          setValue(`${key}_first`, variant.firstSubVariantName);
          setValue(`${key}_secondId`, variant.secondSubVariantId);
          setValue(`${key}_second`, variant.secondSubVariantName);
          setValue(`${key}_height`, variant.height);
          setValue(`${key}_weight`, variant.weight);
          setValue(`${key}_width`, variant.width);
          setValue(`${key}_length`, variant.length);

          setValue(`${key}_buyingPrice`, variant.buyingPrice);
          // setTimeout(() => {
          //   setValue(`${key}_currency`, variant.buyingPriceCurrency);
          // }, 0);

          setValue(`${key}_currency`, {
            label: currencies.find((c) => c._id === variant.buyingPriceCurrency)
              .sign,
            value: variant.buyingPriceCurrency,
          });

          setValue(`${key}_sellingPrice`, variant.sellingPrice);
          setValue(`${key}_discountedPrice`, variant.discountedPrice);

          setValue(`${key}_dc`, variant.dc);
          setValue(`${key}_shippingCompany`, variant.shippingCompany);
          setValue(`${key}_barCode`, variant.barCode);
          setValue(`${key}_status`, variant.isActive);
          setValue(`${key}_productId`, variant.customId);
        }

        setVariantCountArr(ids);

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

        for (let i = 0; i < variantsData.length; i++) {
          const variant = variantsData[i];

          const id = variant.firstSubVariantId;
          ids.push(id);

          const key = `subVariant.${id}`;

          setValue(`${key}_docId`, variant._id);
          setValue(`${key}_firstId`, variant.firstSubVariantId);
          setValue(`${key}_first`, variant.firstSubVariantName);
          setValue(`${key}_quantity`, variant.quantity);
          setValue(`${key}_height`, variant.height);
          setValue(`${key}_weight`, variant.weight);
          setValue(`${key}_width`, variant.width);
          setValue(`${key}_length`, variant.length);

          setValue(`${key}_buyingPrice`, variant.buyingPrice);

          // setTimeout(() => {
          //   setValue(`${key}_currency`, variant.buyingPriceCurrency);
          // }, 0);

          setValue(`${key}_currency`, {
            label: currencies.find((c) => c._id === variant.buyingPriceCurrency)
              .sign,
            value: variant.buyingPriceCurrency,
          });

          setValue(`${key}_sellingPrice`, variant.sellingPrice);
          setValue(`${key}_discountedPrice`, variant.discountedPrice);

          setValue(`${key}_dc`, variant.dc);
          setValue(`${key}_shippingCompany`, variant.shippingCompany);
          setValue(`${key}_barCode`, variant.barCode);
          setValue(`${key}_status`, variant.isActive);
          setValue(`${key}_productId`, variant.customId);
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
      }

      if (coverImage) {
        setFeaturedMediaId(
          product.media.findIndex((m) => m.src === coverImage) + 1
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
          isSelected: !!values.find((v) => MEDIA_URL + "/" + v.src === m.media),
        }));
      });

      setSelectedMedia(newSelectedMedia);

      setPreviewMediaFiles(newPreviewMediaFiles);

      //media handling - end
    } else {
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
      }

      if (coverImage) {
        setFeaturedMediaId(
          product.media.findIndex((m) => m.src === coverImage) + 1
        );
      }

      newSelectedMedia.main = newSelectedMediaArr;

      setSelectedMedia(newSelectedMedia);

      setPreviewMediaFiles(newPreviewMediaFiles);
    }
  }, []);

  useEffect(() => {
    const subscription = watchSearch((values) => {
      const { category, brand, vendor } = values;

      let searchQuery = `productId=${id}&`;

      if (category) searchQuery += `category=${category}&`;
      if (brand) searchQuery += `brand=${brand}&`;
      if (vendor) searchQuery += `vendor=${vendor}&`;
      if (searchValue) searchQuery += `name=${searchValue}`;

      requestAlternateProducts("GET", `v1/product/alternate?${searchQuery}`);
    });
    return () => subscription.unsubscribe();
  }, [watchSearch, searchValue]);

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

  useEffect(() => {
    if (responseAlternateProducts) {
      setAlternateProducts(responseAlternateProducts.similarProducts);
    }
  }, [responseAlternateProducts]);

  const masterCategoryOnChange = (val) => {
    let masterCategory = val.value;

    // setValue("subCategoryId", null);
    // setSubCategories([]);

    // setValue("brandId", null);
    // setBrands([]);

    setVariants([]);
    setVariantSelectionCount(0);
    variantResetHandler();

    // getSubcategoriesRequest("GET", `v1/product/sub-category/${masterCategory}`);
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
    // unregister("subVariant");

    let ids = [];

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

      setSelectedVariant({ variant1: v1, variant2: v2 });

      for (let i = 0; i < sv1.length; i++) {
        for (let j = 0; j < sv2.length; j++) {
          const id = sv1[i].id + sv2[j].id;
          ids.push(id);

          if (variantCountArr.includes(id)) {
            continue;
          }

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

          // selectedCountries.forEach((sc) => {
          //   setValue(`${key}_sellingPrice_${sc.value}`, 1);
          //   setValue(`${key}_discountedPrice_${sc.value}`, 1);
          // });

          id++;
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
      const v1 = firstVariant;
      const sv1 = v1.subVariants;

      setSelectedVariant({
        variant1: v1,
        variant2: null,
      });

      for (let i = 0; i < sv1.length; i++) {
        const id = sv1[i].id;

        ids.push(id);

        if (variantCountArr.includes(id)) {
          continue;
        }

        const key = `subVariant.${id}`;
        setValue(`${key}_firstId`, sv1[i].id);
        setValue(`${key}_first`, sv1[i].name);
        setValue(`${key}_quantity`, 1);
        setValue(`${key}_height`, 1);
        setValue(`${key}_weight`, 1);
        setValue(`${key}_width`, 1);
        setValue(`${key}_length`, 1);

        // selectedCountries.forEach((sc) => {
        //   setValue(`${key}_sellingPrice_${sc.value}`, 1);
        //   setValue(`${key}_discountedPrice_${sc.value}`, 1);
        // });

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

      // idArr.forEach((id) => {
      //   obj[id] = previewMediaFiles.map((m) => ({ ...m, isSelected: false }));
      // });

      idArr.forEach((id) => {
        const index = subVariants.findIndex(
          (s) => s.id === selectedSubV[id].id
        );

        if (index !== -1) {
          obj[id] = selectedMedia[index];
        } else {
          obj[id] = previewMediaFiles.map((m) => ({ ...m, isSelected: false }));
        }
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

    if (
      mediaFiles.length === maximumImagesCount &&
      variantSelectionCount.length === 0
    ) {
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

  console.log("errors", errors);

  const onSubmit = (data) => {
    // console.log("data", data);

    const { buyingPrice, sellingPrice, currency, discountedPrice } = data;

    const formData = new FormData();

    formData.append("id", id);
    formData.append("buyingPrice", buyingPrice);
    formData.append("sellingPrice", sellingPrice);
    formData.append("buyingPriceCurrency", currency.value);
    formData.append("discountedPrice", +discountedPrice);

    let vArr = [];

    if (selectedVariant.variant1) {
      const v = selectedVariant.variant1;
      vArr.push({ id: v._id, name: v.name });
    }

    if (selectedVariant.variant2) {
      const v = selectedVariant.variant2;
      vArr.push({ id: v._id, name: v.name });
    }

    const subVariantsArr = [];

    if (vArr.length > 0) {
      for (let i = 0; i < variantCountArr.length; i++) {
        const id = variantCountArr[i];

        subVariantsArr.push({
          id: data["subVariant"][`${id}_docId`],
          buyingPrice: data["subVariant"][`${id}_buyingPrice`],
          buyingPriceCurrency: data["subVariant"][`${id}_currency`]?.value,
          sellingPrice: data["subVariant"][`${id}_sellingPrice`],
          discountedPrice: +data["subVariant"][`${id}_discountedPrice`],
          isActive: data["subVariant"][`${id}_status`],
        });
      }
    }

    formData.append("subVariants", JSON.stringify(subVariantsArr));

    // for (let [key, value] of formData) {
    //   console.log(`${key}: ${value}`);
    // }

    request("PUT", "v1/product", formData);
  };

  const variantResetHandler = () => {
    unregister("subVariant");
    // setSelectedVariant([]);
    setVariantSelectionCount(0);
    setSubVariants([]);
    setSelectedMedia({ main: selectedMedia["main"] });
  };

  const searchOptimizedFn = useCallback(
    debounce((value) => {
      setSearchValue(value);

      const { category, brand, vendor } = watchSearch();

      let searchQuery = `productId=${id}&`;

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
      <LayoutWrapper seoData={{ pageTitle: "Edit Product - Noonmar" }}>
        <div className="main_content listingContainer">
          <div className="dash-titles">
            <h2 className="dash-h2">Edit Product</h2>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="dashCard">
                <div className="upload-section">
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
                                <img src={media.media} alt="" />
                                {media.id == featuredMediaId ? (
                                  <span className="coverTag">Cover Image</span>
                                ) : (
                                  <></>
                                )}
                              </span>
                            </div>
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
                  <Details register={register} errors={errors} isEdit={true} />

                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Category</label>
                      <Controller
                        className="form-control form-control-solid form-control-lg mb-10 col-4"
                        control={control}
                        name="masterCategoryId"
                        rules={{ required: true }}
                        render={({ field: { onChange, value, ref } }) => {
                          return (
                            <Select
                              onChange={(val) => {
                                onChange(val);
                                masterCategoryOnChange(val);
                              }}
                              options={categories}
                              isMulti={false}
                              value={value}
                              defaultValue={[]}
                              // value={selectedBrand}
                              className="form-select- form-control- dark-form-control libSelect"
                              isDisabled={true}
                            />
                          );
                        }}
                      />
                      {errors.masterCategoryId && (
                        <span className="text-danger">
                          {t(errors.masterCategoryId.message)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Brand Name</label>
                      <Controller
                        className="form-control form-control-solid form-control-lg mb-10 col-4"
                        control={control}
                        name="brandId"
                        rules={{ required: true }}
                        render={({ field: { onChange, value, ref } }) => {
                          return (
                            <Select
                              onChange={(val) => {
                                onChange(val);
                              }}
                              options={brands.map((b) => ({
                                label: b.name,
                                value: b._id,
                              }))}
                              //   isMulti={true}
                              value={value}
                              defaultValue={[]}
                              // value={selectedBrand}
                              className="form-select- form-control- dark-form-control libSelect"
                              isDisabled={true}
                            />
                          );
                        }}
                      />
                      {errors.brandId && (
                        <span className="text-danger">
                          {t(errors.brandId.message)}
                        </span>
                      )}
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
                              options={units.map((u) => ({
                                label: u.name,
                                value: u._id,
                              }))}
                              // isMulti={false}
                              value={value}
                              defaultValue={[]}
                              // value={selectedBrand}
                              className="form-select- form-control- dark-form-control libSelect"
                              isDisabled={true}
                            />
                          );
                        }}
                      />
                      {errors.unit && errors.unit.type === "required" && (
                        <span className="text-danger">
                          {t("This field is required")}
                        </span>
                      )}
                    </div>
                  </div>

                  <Prices
                    register={register}
                    errors={errors}
                    control={control}
                    currencies={currencies}
                  />

                  <div className="col-md-12">
                    <div className="form-group">
                      <label>Short Description *</label>

                      {getValues("shortDescription") && (
                        <CKEditor
                          initData={getValues("shortDescription")}
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
                              setValue("shortDescription", data);
                              clearErrors("shortDescription");
                            }
                          }}
                          readOnly={true}

                          // onInstanceReady={(editor) => {
                          //   ckEditorRef.current = editor;
                          // }}
                        />
                      )}
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

                      {getValues("longDescription") && (
                        <CKEditor
                          initData={getValues("longDescription")}
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
                          readOnly={true}
                          // {...inputData}
                        />
                      )}
                      {errors.longDescription && (
                        <span className="text-danger">
                          {t(errors.longDescription.message)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="specifications">
                  <div className="row"></div>

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
                              {/* <input
                                type="text"
                                name=""
                                className="form-control dark-form-control"
                                {...register(`featureValue${feature.id}`, {
                                  required: "This field is required",
                                  setValueAs: (v) => v.trim(),
                                })}
                              /> */}
                              <Controller
                                className="form-control form-control-solid form-control-lg mb-10 col-4"
                                control={control}
                                name={`featureValue${feature.id}`}
                                rules={{ required: "This field is required" }}
                                render={({
                                  field: { onChange, value, ref },
                                }) => {
                                  return (
                                    <Select
                                      onChange={(val) => {
                                        onChange(val);
                                      }}
                                      options={feature.options}
                                      placeholder={t("Select")}
                                      defaultValue={[]}
                                      value={value}
                                      // value={selectedBrand}
                                      className="form-select- form-control- dark-form-control libSelect"
                                    />
                                  );
                                }}
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
                  <Variants
                    firstVariant={selectedVariant.variant1}
                    secondVariant={selectedVariant.variant2}
                    variantTh={variantTh}
                    selectedMedia={selectedMedia}
                    variantModalShowHandle={variantModalShowHandle}
                    unselectMediaHandler={unselectMediaHandler}
                    errors={errors}
                    register={register}
                    currencies={currencies}
                    control={control}
                    isEdit={true}
                    shippingCompanies={shippingCompanies}
                  />
                )}

                <ShippingSpecifications
                  register={register}
                  isEdit={true}
                  errors={errors}
                  shippingCompanies={shippingCompanies}
                  control={control}
                />
                <div className="specifications">
                  <div className="row">
                    <div className="col-md-5 col-sm-6">
                      <h3 className="subTitles">Alternate Products</h3>
                    </div>
                    <div className="col-md-7 col-sm-6">
                      <div className="addSpecificationsbtn">
                        {/* <a
                          href="#!"
                          className="sms_alert_btn sms_active_btns"
                          data-bs-toggle="modal"
                          data-bs-target="#alternateModal"
                        >
                          Add
                        </a> */}
                      </div>
                    </div>
                    {selectedAlternateProductsObj.ids.length > 0 && (
                      <div className="custom">
                        <div className="table-responsive">
                          <table className="table table-striped">
                            <thead className="table-dark">
                              <tr>
                                <th>Product Name</th>
                                {/* <th width="50px">Action</th> */}
                              </tr>
                            </thead>
                            <tbody>
                              {selectedAlternateProductsObj.data.map((p) => (
                                <tr key={p.id}>
                                  <td>{p.name}</td>
                                  {/* <td
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
                                  </td> */}
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
                  <Faqs
                    addFaqHandler={addFaqHandler}
                    faqs={faqs}
                    register={register}
                    errors={errors}
                    faqDeleteHandler={faqDeleteHandler}
                    isEdit={true}
                  />

                  <div className="draftProductButtons">
                    {/* <a
                      onClick={() => {
                        draftRef.current = false;
                        publishRef.current.click();
                      }}
                      href="#!"
                      className="btn btn-primarys"
                    >
                      Save Product as draft
                    </a> */}
                    <button
                      ref={publishRef}
                      type="submit"
                      className="btn btn-primary"
                      onClick={handleSubmit(onSubmit)}
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
      <Modal
        show={variantModal}
        onHide={variantModalCloseHandle}
        className="modal fade"
        id="variantModal"
      >
        <div className="modal-header">
          <h1 className="modal-title fs-5" id="exampleModalLabel">
            Variant Customization
          </h1>
          <button
            type="button"
            className="btn-close"
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
  await createAxiosCookies(context);

  const {
    query: { id },
  } = context;

  let initialData = getInitialAddProductData();
  let editProduct = getEditProduct(id);

  [initialData, editProduct] = await Promise.all([initialData, editProduct]);

  const { product, similarProducts, allVariants } = editProduct;
  console.log(product);

  if (!product) {
    return {
      redirect: {
        permanent: false,
        destination: "/vendor/products",
      },
    };
  }

  const {
    units,
    maximumImagesCount,
    searchBrands,
    searchCategories,
    categories,
    currencies,
    brands,
    shippingCompanies,
  } = initialData;

  return {
    props: {
      protected: true,
      userTypes: ["vendor"],
      product,
      similarProducts,
      units,
      id,
      searchBrands,
      searchCategories,
      searchVendors: [],
      maximumImagesCount,
      currencies,
      allVariants,
      locales: {
        ...require(`@/locales/index/${context.locale}.json`),
      },
      categories,
      brands,
      shippingCompanies: shippingCompanies.map((sc) => ({
        label: sc.name,
        value: sc._id,
      })),
    },
  };
}

export default EditProduct;
