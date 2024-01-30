import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Select from "react-select";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import { Button, Modal } from "react-bootstrap";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

import { getCountries } from "@/services/countries";
import { getCurrencies } from "@/services/currencies";
import { getCategories } from "@/services/productCategories";
import GooglePlace from "@/components/GooglePlace";
import LocationPlace from "@/components/LocationPlace";
import useRequest from "@/hooks/useRequest";
import { LoginLogo } from "@/components/Helper";
import { getSystemImage } from "@/services/customer";
import { MEDIA_URL } from "@/api";
import Seo from "@/components/Seo";
import { handleClientScriptLoad } from "next/script";

const pdfArray = ["application/pdf"];

const Signup = ({ countries, currencies, categories, image }) => {
  const t = useTranslations("Index");
  const router = useRouter();
  const { request, response } = useRequest();

  const dateRef = useRef();

  const [isCategoryRequest, setIsCategoryRequest] = useState(false);
  const [showCategoriesRequestModal, setShowCategoriesRequestModal] =
    useState(false);
  const [categoryRequestInputs, setCategoryRequestInputs] = useState([]);
  const [categoryRequestId, setCategoryRequestId] = useState(1);

  const [businessDocFiles, setBusinessDocFiles] = useState([]);
  const [businessDocNames, setBusinessDocNames] = useState([]);
  const [serveCountriesOptions, setServeCountriesOptions] = useState();
  const [productCategoriesOptions, setProductCategoriesOptions] = useState(
    categories.map((c) => ({
      label: c.name,
      value: c._id,
    }))
  );
  const [serveCountries, setServeCountries] = useState([]);
  const [selectedServeCountry, setSelectedServeCountry] = useState();
  const [selectedCategory, setSelectedCategory] = useState();
  const [warehouseArray, setWarehouseArray] = useState([{ id: 0 }]);
  const [showimage, setShowImage] = useState();
  const [showimageerror, setShowImageerror] = useState(null);
  const [warehouseId, setWarehouseId] = useState(1);
  const [isPasswordVisible, setIsPasswordVisible] = useState([
    {
      password: false,
      confirmPassword: false,
    },
  ]);

  const {
    register,
    unregister,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    clearErrors,
    getValues,
    watch,
  } = useForm({
    defaultValues: {
      storefrontSubscription: "false",
    },
  });

  console.log(errors);

  // console.log(watch());
  // const {
  //   register: requestCategoryRegister,
  //   handleSubmit: requestCategoryHandleSubmit,
  //   formState: { errors: requestCategoryError },
  // } = useForm();

  useEffect(() => {
    register("productCategories", { required: true });
    register("serveCountries", { required: true });
    register("location", { required: true });

    let options = [];
    // let categoriesOptions = [];
    if (countries && countries.length > 0) {
      countries.forEach((obj) => {
        options.push({
          label: obj.name,
          value: obj._id,
        });
      });
      setServeCountriesOptions(options);
    }

    // if (categories && categories.length > 0) {
    //   categories.forEach((obj) => {
    //     categoriesOptions.push({
    //       label: obj.name,
    //       value: obj._id,
    //     });
    //   });
    //   setProductCategoriesOptions(categoriesOptions);
    // }

    document.body.classList.add("custom-tooltip");

    return () => {
      document.body.classList.remove("custom-tooltip");
    };
  }, []);

  const onSubmit = (data) => {
    const {
      businessName,
      businessCountry,
      businessContact,
      businessEmail,
      productCategories,
      serveCountries,
      currency,
      language,
      storefrontSubscription,
      name,
      location,
      geoLocation,
      contact,
      email,
      country,
      password,
      cpassword,
      countryCode,
      ibaNumber,
    } = data;
    // console.log(data);
    const formData = new FormData();
    let error = 0;

    if (!location) {
      setError("location", {
        type: "manual",
      });
      error = 1;
    }

    if (!geoLocation) {
      setError("location", {
        type: "manual",
      });
      error = 1;
    }

    if (cpassword != password) {
      setError("cpassword", {
        type: "manual",
      });
      error = 1;
    }

    let warehouseDetail = warehouseArray.map((warehouse) => {
      if (!data[`warehouseAddress${warehouse.id}`]) {
        setError(`warehouseAddress${warehouse.id}`, {
          type: "manual",
        });
        error = 1;
      }

      if (!data[`geoLocation_${warehouse.id}`]) {
        setError(`warehouseAddress${warehouse.id}`, {
          type: "manual1",
        });
        error = 1;
      }
      return {
        name: data[`warehouseName${warehouse.id}`],
        geoLocation: {
          coordinates: data[`geoLocation_${warehouse.id}`],
          type: "Point",
        },
        address: data[`warehouseAddress${warehouse.id}`],
        country: data[`warehouseCountry${warehouse.id}`],
        city: data[`city${warehouse.id}`],
        state: data[`state${warehouse.id}`],
        street: data[`street${warehouse.id}`],
        zipCode: data[`zipcode${warehouse.id}`],
      };
    });
    // console.log(warehouseDetail, "warehouseDetail");
    if (businessDocFiles?.length > 0) {
      clearErrors("businessDoc");
      for (let i = 0; i < businessDocFiles.length; i++) {
        formData.append("businessDoc", businessDocFiles[i]);
      }
    } else {
      setError("businessDoc", {
        type: "required",
      });
      return;
    }

    let newLocation = JSON.stringify({
      coordinates: geoLocation,
      type: "Point",
    });

    let categoryRequest = [];
    if (isCategoryRequest) {
      if (categoryRequestInputs.length > 0) {
        categoryRequestInputs.forEach((c) => {
          if (`categoryRequest_${c.id}`) {
            if (
              data[`categoryRequest_${c.id}`].trim() == "" ||
              data[`categoryRequest_${c.id}`] == undefined
            ) {
              setError(`categoryRequest_${c.id}`, {
                type: "manual",
                message: "This field is required",
              });
              setShowCategoriesRequestModal(true);
              error = 1;
            } else {
              categoryRequest.push(data[`categoryRequest_${c.id}`]);
            }
          }
        });
      }
    }

    formData.append("categoryRequest", JSON.stringify(categoryRequest));
    if (error == 1) {
      return;
    }

    if (!showimageerror) {
      setShowImageerror("This Field is required");
      return;
    }

    if (storefrontSubscription) {
      formData.append("storefrontSubscription", storefrontSubscription);
    }
    formData.append("businessName", businessName);
    formData.append("businessCountry", businessCountry);
    formData.append("businessContact", businessContact);
    formData.append("businessEmail", businessEmail);
    formData.append("warehouseDetail", JSON.stringify(warehouseDetail));
    formData.append("productCategories", JSON.stringify(productCategories));
    formData.append("serveCountries", JSON.stringify(serveCountries));
    formData.append("currency", currency);
    formData.append("language", language);
    formData.append("name", name);
    formData.append("contact", contact);
    formData.append("email", email);
    formData.append("address", location);
    formData.append("location", newLocation);
    formData.append("country", country);
    formData.append("password", password);
    formData.append("countryCode", countryCode);
    formData.append("ibaNumber", ibaNumber);

    request("POST", "v1/vendor/signup", formData);
  };

  const onErrors = (errors) => {
    // console.log(errors);
  };

  useEffect(() => {
    if (response) {
      if (response.status) {
        toast.success(response.message);
        router.push(
          {
            pathname: "/vendor/signup-verification",
            query: { id: response.id, email: response.email },
          },
          "/vendor/signup-verification"
        );
      } else {
        toast.error(response.message);
      }
    }
  }, [response]);

  const handleChangeServeCountry = (event) => {
    setSelectedServeCountry(event);

    if (event && event.length > 0) {
      let countryids = event.map((obj) => obj.value);
      let countryNames = event.map((obj) => obj.label);
      setServeCountries(countryNames);
      setError("serveCountries", "");
      setValue("serveCountries", countryids);

      if (false && categories && categories.length > 0) {
        let categoriesOptions = categories.map((c) => ({
          label: c.name,
          value: c._id,
        }));

        setProductCategoriesOptions(categoriesOptions);
        setSelectedCategory([]);
        setValue("productCategories", null);
      }
    } else {
      setServeCountries([]);
      setValue("serveCountries", null);

      // setProductCategoriesOptions([]);
      // setSelectedCategory([]);
      // setValue("productCategories", null);
    }
  };

  const handleChangeCategory = (event) => {
    setSelectedCategory(event);
    if (event && event.length > 0) {
      let categoryids = event.map((obj) => obj.value);
      setValue("productCategories", categoryids);
      setError("productCategories", "");
    } else {
      setValue("productCategories", null);
    }
  };

  const warehouseAddHandler = () => {
    setWarehouseArray((prev) => [...prev, { id: warehouseId }]);
    setWarehouseId((prev) => prev + 1);
  };

  const warehouseDeleteHandler = (id) => {
    setWarehouseArray([...warehouseArray].filter((data) => data.id != id));
    unregister(`warehouseName${id}`);
    unregister(`warehouseCountry${id}`);
    unregister(`warehouseAddress${id}`);
    unregister(`geoAddMoreWarehouseLocation${id}`);
  };

  const saveLocationHandler = (address, geoLocation) => {
    clearErrors("location");
    setValue("location", address);
    setValue(
      "geoLocation",
      geoLocation ? [geoLocation.lng, geoLocation.lat] : ""
    );
  };

  const saveAddressHandler = (address, geoLocation, key) => {
    clearErrors("warehouseAddress");
    setValue(`warehouseAddress${key}`, address);
    setValue(`geoLocation_${key}`, [geoLocation.lng, geoLocation.lat]);
  };

  const businessDocHandler = (e) => {
    // setShowImage(URL.createObjectURL(e.target.files[0]));
    if (businessDocFiles.length == 5) {
      toast.error(`Cannot upload files more than ${5}`);
      return;
    }

    let isError = false;
    if (Array.from(e.target.files).length > 5) {
      e.preventDefault();
      toast.error(`Cannot upload files more than ${5}`);

      return;
    } else {
      const files = e.target.files;
      for (let i = 0; i < files.length; i++) {
        if (!pdfArray.includes(files[i].type)) {
          toast.error("Please select pdf only in upload business document");
          isError = true;
          break;
        }
      }
      let newFiles = [];
      let fileToUpload = 5 - businessDocFiles.length;
      for (let i = 0; i < files.length; i++) {
        if (fileToUpload == 0) {
          break;
        }
        fileToUpload--;
        newFiles.push(files[i]);
      }

      if (isError) {
        return;
      } else {
        clearErrors("businessDoc");
        setBusinessDocFiles((prev) => [...prev, ...newFiles]);
        setBusinessDocNames((prev) => [
          ...prev,
          ...newFiles.map((f) => f.name),
        ]);
      }
    }
  };

  const removeBusinessDocHandler = (id) => {
    const newName = businessDocNames.filter((n, i) => i != id);
    const newDoc = businessDocFiles.filter((n, i) => i != id);
    setBusinessDocNames(newName);
    setBusinessDocFiles(newDoc);
  };

  const addCategoryHandler = () => {
    setCategoryRequestInputs((prev) => [...prev, { id: categoryRequestId }]);
    setCategoryRequestId((prev) => prev + 1);
  };

  const deleteCategoryRequestHandler = (id) => {
    setCategoryRequestInputs((prev) => prev.filter((data) => data.id != id));
    unregister(`categoryRequest_${id}`, "");
  };

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      <strong>Rules for uploading documents</strong>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </p>
    </Tooltip>
  );

  return (
    <>
      <Seo seoData={{ pageTitle: "Vendor Signup - Noonmar" }} />

      <section className="vendor_account_wrapper">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 col-md-12 col-sm-12">
              <form onSubmit={handleSubmit(onSubmit, onErrors)}>
                <div className="">
                  <LoginLogo />
                  <h1 className="vendor_login_title">
                    {t("Create your Vendor Account")}
                  </h1>
                  <div className="row">
                    <div className="col-lg-12">
                      <h4 className="Warehouse_title">
                        {t("Business Details")}
                      </h4>
                    </div>
                    <div className="col-md-6 col-lg-6">
                      <div className="form-group ">
                        <label className="form-label">
                          {t("Business Name")}{" "}
                          <span className="required">*</span>
                        </label>
                        <input
                          {...register("businessName", {
                            required: true,
                            setValueAs: (v) => v.trim(),
                          })}
                          type="text"
                          name="businessName"
                          placeholder=""
                          className="form-control dark-form-control"
                          defaultValue=""
                        />
                        {errors.businessName &&
                          errors.businessName.type === "required" && (
                            <span className="text-danger">
                              {t("This field is required")}
                            </span>
                          )}
                      </div>
                    </div>
                    <div className="col-md-6 col-lg-6">
                      <div className="form-group ">
                        <label className="form-label">
                          {t("Native Country")}{" "}
                          <span className="required">*</span>
                        </label>
                        <select
                          className="form-select form-control dark-form-control"
                          name="businessCountry"
                          {...register("businessCountry", {
                            required: true,
                          })}
                        >
                          <option value="">{t("Select")}</option>
                          {countries &&
                            countries.map((item, index) => {
                              return (
                                <option value={item?._id} key={item?._id}>
                                  {item?.name}
                                </option>
                              );
                            })}
                        </select>

                        {errors.businessCountry &&
                          errors.businessCountry.type === "required" && (
                            <span className="text-danger">
                              {t("This field is required")}
                            </span>
                          )}
                      </div>
                    </div>
                    <div className="col-md-6 col-lg-6">
                      <div className="form-group ">
                        <label className="form-label">
                          {t("Business Phone Number")}{" "}
                          <span className="required">*</span>
                        </label>
                        <input
                          {...register("businessContact", {
                            required: true,
                            setValueAs: (v) => v.trim(),
                            pattern: /^[0-9]{10}$/gm,
                          })}
                          type="number"
                          name="businessContact"
                          placeholder=""
                          className="form-control dark-form-control"
                          defaultValue=""
                        />
                        {errors.businessContact &&
                          errors.businessContact.type === "required" && (
                            <span className="text-danger">
                              {t("This field is required")}
                            </span>
                          )}
                        {errors.businessContact &&
                          errors.businessContact.type === "pattern" && (
                            <span className="text-danger">
                              {t("Please enter valid business phone number")}
                            </span>
                          )}
                      </div>
                    </div>
                    <div className="col-md-6 col-lg-6">
                      <div className="form-group ">
                        <label className="form-label">
                          {t("Business Email Address")}{" "}
                          <span className="required">*</span>
                        </label>
                        <input
                          {...register("businessEmail", {
                            required: true,
                            pattern:
                              /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                          })}
                          type="text"
                          name="businessEmail"
                          placeholder=""
                          className="form-control dark-form-control"
                          defaultValue=""
                        />
                        {errors.businessEmail &&
                          errors.businessEmail.type === "required" && (
                            <span className="text-danger">
                              {t("This field is required")}
                            </span>
                          )}
                        {errors.businessEmail &&
                          errors.businessEmail.type === "pattern" && (
                            <span className="text-danger">
                              {t("Please enter valid business email address")}
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                  <div className="row align-items-center">
                    <div className="col-9 col-sm-6">
                      <h4 className="Warehouse_title m-0">
                        {t("Warehouse Details")}
                      </h4>
                    </div>
                  </div>

                  <div className="row warehouse-group">
                    <div class="col-lg-12">
                      <div className="Warehouse_banner">
                        <a
                          href="javascript:void(0);"
                          onClick={() => warehouseAddHandler()}
                          className="Warehouse_button"
                        >
                          <span>
                            <svg
                              width={16}
                              height={17}
                              viewBox="0 0 16 17"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M15.7594 9.876H9.49541V16.14H6.50741V9.876H0.279406V6.888H6.50741V0.66H9.49541V6.888H15.7594V9.876Z"
                                fill="white"
                              />
                            </svg>
                          </span>
                          <span className="addText">
                            {t("Add More Warehouse")}
                          </span>
                        </a>
                      </div>
                    </div>
                    {warehouseArray &&
                      warehouseArray.length > 0 &&
                      warehouseArray.map((warehouse, index) => (
                        <>
                          <div className="row warehouse-group">
                            {warehouseArray.length > 1 && (
                              <div class="col-lg-12">
                                <hr class="hr-mb" />
                                <div className="Warehouse_banner">
                                  <a
                                    href="javascript:void(0);"
                                    onClick={() =>
                                      warehouseDeleteHandler(warehouse.id)
                                    }
                                    className="Warehouse_button"
                                  >
                                    <span>
                                      <svg
                                        width={16}
                                        height={17}
                                        viewBox="0 0 16 17"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        // viewBox="0 0 448 512"
                                      >
                                        <path
                                          d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"
                                          fill="white"
                                        />
                                      </svg>
                                    </span>
                                    <span className="addText">
                                      {t("Remove Warehouse")}
                                    </span>
                                  </a>
                                </div>
                              </div>
                            )}
                            <div className="col-md-6 col-lg-6">
                              <div className="form-group ">
                                <label className="form-label">
                                  {t("Warehouse Name/Label")}
                                  <span className="required">*</span>
                                </label>
                                <input
                                  {...register(`warehouseName${warehouse.id}`, {
                                    required: true,
                                    setValueAs: (v) => v.trim(),
                                  })}
                                  type="text"
                                  name={`warehouseName${warehouse.id}`}
                                  placeholder=""
                                  className="form-control dark-form-control"
                                  defaultValue=""
                                />
                                {errors[`warehouseName${warehouse.id}`] &&
                                  errors[`warehouseName${warehouse.id}`]
                                    .type === "required" && (
                                    <span className="text-danger">
                                      {t("This field is required")}
                                    </span>
                                  )}
                              </div>
                            </div>

                            <div className="col-md-6 col-lg-6">
                              <div className="form-group ">
                                <label className="form-label">
                                  {t("Warehouse Location Country")}
                                  <span className="required">*</span>
                                </label>

                                <select
                                  className="form-select form-control dark-form-control"
                                  name={`warehouseCountry${warehouse.id}`}
                                  {...register(
                                    `warehouseCountry${warehouse.id}`,
                                    {
                                      required: true,
                                    }
                                  )}
                                >
                                  <option value="">{t("Select")}</option>
                                  {countries &&
                                    countries.map((item, index) => {
                                      return (
                                        <option
                                          value={item?._id}
                                          key={item?._id}
                                        >
                                          {item?.name}
                                        </option>
                                      );
                                    })}
                                </select>
                                {errors[`warehouseCountry${warehouse.id}`] &&
                                  errors[`warehouseCountry${warehouse.id}`]
                                    .type === "required" && (
                                    <span className="text-danger">
                                      {t("This field is required")}
                                    </span>
                                  )}
                              </div>
                            </div>
                            <div className="col-lg-12">
                              <div className="form-group ">
                                <label className="form-label">
                                  {t("Warehouse Address")}{" "}
                                  <span className="required">*</span>
                                </label>

                                <GooglePlace
                                  saveAddress={saveAddressHandler}
                                  index={warehouse.id}
                                  setValue={setValue}
                                  // onChange={(e) => setValue("warehouseAddress", e.target.value)}
                                  {...register(
                                    `warehouseAddress${warehouse.id}`,
                                    {
                                      required: true,
                                    }
                                  )}
                                />

                                {errors[`warehouseAddress${warehouse.id}`] &&
                                  errors[`warehouseAddress${warehouse.id}`]
                                    .type === "required" && (
                                    <span className="text-danger">
                                      {t("This field is required")}
                                    </span>
                                  )}
                                {errors[`warehouseAddress${warehouse.id}`] &&
                                  errors[`warehouseAddress${warehouse.id}`]
                                    .type === "manual" && (
                                    <span className="text-danger">
                                      {t(
                                        "Please enter valid warehouse address"
                                      )}
                                    </span>
                                  )}

                                {/* <input
                            name={`warehouseAddress${warehouse.id}`}
                            {...register(`warehouseAddress${warehouse.id}`,{ required: true})}
                            type="text"
                            placeholder="Warehouse Address"
                            className="form-control dark-form-control"
                            defaultValue=""
                          />
                          {errors[`warehouseAddress${warehouse.id}`] && errors[`warehouseAddress${warehouse.id}`].type === "required" && (
                            <span className="text-danger">
                             This field is required
                            </span>
                          )} */}
                              </div>
                            </div>
                            <div className="col-md-6 col-lg-6">
                              <div className="form-group">
                                <label className="form-label">
                                  {t("Warehouse Street")}
                                  {/* <span className="required">*</span> */}
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  // {...register("street", { required: false })}
                                  {...register(`street${warehouse.id}`, {
                                    required: true,
                                  })}
                                />
                                {errors[`street${warehouse.id}`] &&
                                  errors[`street${warehouse.id}`].type ===
                                    "required" && (
                                    <span className="text-danger">
                                      {t("This field is required")}
                                    </span>
                                  )}

                                {errors.street &&
                                  errors.street.type === "required" && (
                                    <span className="invalid-feedback">
                                      {t("This field is required")}
                                    </span>
                                  )}
                              </div>
                            </div>
                            <div className="col-md-6 col-lg-6">
                              {" "}
                              <div className="form-group">
                                <label className="form-label">
                                  {t("Warehouse Pin Code")}
                                  {/* <span className="required">*</span> */}
                                </label>
                                <input
                                  type="number"
                                  className="form-control"
                                  // {...register("zipcode", { required: true })}
                                  {...register(`zipcode${warehouse.id}`, {
                                    required: true,
                                  })}
                                />
                                {errors[`zipcode${warehouse.id}`] &&
                                  errors[`zipcode${warehouse.id}`].type ===
                                    "required" && (
                                    <span className="text-danger">
                                      {t("This field is required")}
                                    </span>
                                  )}

                                {errors.zipcode &&
                                  errors.zipcode.type === "required" && (
                                    <span className="text-danger">
                                      {t("This field is required")}
                                    </span>
                                  )}
                              </div>
                            </div>

                            <div className="col-md-6 col-lg-6">
                              <div className="form-group">
                                <label className="form-label">
                                  {t("Warehouse City")}
                                  {/* <span className="required">*</span> */}
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  {...register(`city${warehouse.id}`, {
                                    required: true,
                                    setValueAs: (v) => v.trim(),
                                  })}
                                  // {...register("city", {
                                  //   required: true,
                                  //   setValueAs: (v) => v.trim(),
                                  // })}
                                />
                                {errors[`city${warehouse.id}`] &&
                                  errors[`city${warehouse.id}`].type ===
                                    "required" && (
                                    <span className="text-danger">
                                      {t("This field is required")}
                                    </span>
                                  )}

                                {errors.city &&
                                  errors.city.type === "required" && (
                                    <span className="text-danger">
                                      {t("This field is required")}
                                    </span>
                                  )}
                                {errors.city &&
                                  errors.city.type === "pattern" && (
                                    <span className="text-danger">
                                      {t("This field is required")}
                                    </span>
                                  )}
                              </div>
                            </div>
                            <div className="col-md-6 col-lg-6">
                              {" "}
                              <div className="form-group">
                                <label className="form-label">
                                  {t("Warehouse State")}
                                  {/* <span className="required">*</span> */}
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  // {...register("state", {
                                  //   required: true,
                                  //   setValueAs: (v) => v.trim(),
                                  // })}
                                  {...register(`state${warehouse.id}`, {
                                    required: true,
                                    setValueAs: (v) => v.trim(),
                                  })}
                                />
                                {errors[`state${warehouse.id}`] &&
                                  errors[`state${warehouse.id}`].type ===
                                    "required" && (
                                    <span className="text-danger">
                                      {t("This field is required")}
                                    </span>
                                  )}

                                {errors.state &&
                                  errors.state.type === "required" && (
                                    <span className="text-danger">
                                      {t("This field is required")}
                                    </span>
                                  )}
                                {errors.state &&
                                  errors.state.type === "pattern" && (
                                    <span className="text-danger">
                                      {t("This field is required")}
                                    </span>
                                  )}
                              </div>
                            </div>
                          </div>
                        </>
                      ))}
                  </div>

                  {/* MORE Warehouse */}
                  {/* <div class="row warehouse-group">
                         
                          <div class="col-lg-6">
                              <input type="text" name="text" placeholder="Warehouse Name/Label "
                                  class="form-control dark-form-control" value=""/>
                          </div>
                          <div class="col-lg-6">
                              <input type="text" name="text" placeholder="Warehouse Location (Country & city) "
                                  class="form-control dark-form-control" value=""/>
                          </div>
                          <div class="col-lg-12">
                              <div class="form-group ">
                                  <input type="text" name="text" placeholder="Warehouse Address "
                                      class="form-control dark-form-control" value=""/>
                              </div>
                          </div>
                      </div> */}
                  <div className="row section-gap">
                    <div className="col-md-6 col-lg-6 col-xl-3 col02">
                      <div className="form-group">
                        <label htmlFor="country" className="dark-label mt575-5">
                          {t("Select Countries you want to Serve")}{" "}
                          <span className="required">*</span>
                        </label>
                        <Select
                          name="serveCountries"
                          // {...refRegister}
                          // ref={(e) => {
                          //   refRegister.ref(e);
                          // }}
                          value={selectedServeCountry}
                          onChange={handleChangeServeCountry}
                          options={serveCountriesOptions}
                          isMulti={true}
                          className="form-select- form-control- dark-form-control libSelect"
                        />

                        {errors.serveCountries &&
                          errors.serveCountries.type === "required" && (
                            <span className="text-danger">
                              {t("This field is required")}
                            </span>
                          )}
                      </div>
                    </div>
                    <div className="col-md-6 col-lg-6 col-xl-3 col01">
                      <div className="form-group ">
                        <label htmlFor="country" className="dark-label">
                          {t("Product Categories you deal with")}{" "}
                          <span className="required">*</span>
                        </label>
                        <Select
                          name="productCategories"
                          // {...refRegister}
                          // ref={(e) => {
                          //   refRegister.ref(e);
                          // }}
                          value={selectedCategory}
                          onChange={handleChangeCategory}
                          options={productCategoriesOptions}
                          isDisabled={productCategoriesOptions.length == 0}
                          placeholder={
                            productCategoriesOptions.length == 0
                              ? "Please select countries first."
                              : "Select..."
                          }
                          isMulti={true}
                          className="form-select- form-control- dark-form-control libSelect"
                        />

                        {errors.productCategories &&
                          errors.productCategories.type === "required" && (
                            <span className="text-danger">
                              {t("This field is required")}
                            </span>
                          )}
                      </div>
                    </div>
                    <div className="col-md-6 col-lg-6 col-xl-3 col01">
                      <div className="form-group ">
                        <label htmlFor="country" className="dark-label">
                          {t("Category not available?")}{" "}
                        </label>
                        <button
                          className="Warehouse_button d-block"
                          onClick={() => setShowCategoriesRequestModal(true)}
                          type="button"
                        >
                          {t("Request")}
                        </button>
                      </div>
                    </div>

                    <div className="col-md-6 col-lg-6 col-xl-3 col03">
                      <div className="form-group">
                        <label className="dark-label mtm-5">
                          {t("Select Native Currency")}{" "}
                          <span className="required">*</span>
                        </label>
                        <div className="form-group ">
                          <select
                            className="form-select form-control dark-form-control"
                            name="currency"
                            {...register("currency", {
                              required: true,
                            })}
                          >
                            <option value="">{t("Select")}</option>
                            {currencies &&
                              currencies.map((item, index) => {
                                return (
                                  <option value={item?._id} key={item?._id}>
                                    {item?.name} {` (${item?.sign})`}
                                  </option>
                                );
                              })}
                          </select>
                          {errors.currency &&
                            errors.currency.type === "required" && (
                              <span className="text-danger">
                                {t("This field is required")}
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 col-lg-6 col-xl-3 col04">
                      <div className="form-group">
                        <label className="dark-label mtm-5">
                          {t("Select Languages")}{" "}
                          <span className="required">*</span>
                        </label>
                        <div className="lang-group">
                          <div className="custom_radio">
                            <input
                              type="radio"
                              id="en"
                              {...register("language", { required: true })}
                              name="language"
                              value="English"
                            />
                            <label htmlFor="en">{t("English - EN")}</label>
                          </div>
                          <div className="custom_radio">
                            <input
                              type="radio"
                              id="Arabic"
                              {...register("language", { required: true })}
                              name="language"
                              value="Arabic"
                            />
                            <label htmlFor="Arabic">{t("Arabic")}</label>
                          </div>
                          <div className="custom_radio">
                            <input
                              type="radio"
                              id="Turkish"
                              {...register("language", { required: true })}
                              name="language"
                              value="Turkish"
                            />
                            <label htmlFor="Turkish">{t("Turkish")}</label>
                          </div>

                          {errors.language &&
                            errors.language.type === "required" && (
                              <span className="text-danger">
                                {t("This field is required")}
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row section-gap">
                    <div className="col-md-6 col-lg-6 col-xl-3">
                      <div className="form-group ">
                        <label htmlFor="country" className="dark-label">
                          {t("Storefront Subscription Needed")}:{" "}
                          {/* <span className="required">*</span> */}
                        </label>
                        <div className="inline-radio">
                          <div className="custom_radio">
                            <input
                              type="radio"
                              id="Yes"
                              name="storefrontSubscription"
                              value={"true"}
                              {...register("storefrontSubscription", {
                                required: false,
                              })}
                            />
                            <label htmlFor="Yes">{t("Yes")}</label>
                          </div>
                          <div className="custom_radio">
                            <input
                              type="radio"
                              id="No"
                              name="storefrontSubscription"
                              value={"false"}
                              {...register("storefrontSubscription", {
                                required: true,
                              })}
                            />
                            <label htmlFor="No">{t("No")}</label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 col-lg-6 col-xl-4">
                      <div className="form-group">
                        <label htmlFor="country" className="dark-label mt575-5">
                          {t("Upload Business Documents (PDF ONLY)")}{" "}
                          <span className="required">*</span>
                          <OverlayTrigger
                            placement="right"
                            overlay={renderTooltip}
                          >
                            <svg
                              width={22}
                              height={22}
                              viewBox="0 0 22 22"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="cursor"
                            >
                              <path
                                d="M10.8371 0.417969C4.87837 0.417969 0.046875 5.24946 0.046875 11.2082C0.046875 17.167 4.87837 21.9994 10.8371 21.9994C16.7959 21.9994 21.6283 17.167 21.6283 11.2082C21.6283 5.24946 16.7959 0.417969 10.8371 0.417969ZM13.0834 17.1414C12.528 17.3606 12.0859 17.5269 11.7543 17.642C11.4236 17.7571 11.039 17.8146 10.6014 17.8146C9.9291 17.8146 9.40566 17.6502 9.03296 17.3223C8.66025 16.9943 8.47481 16.5787 8.47481 16.0735C8.47481 15.8771 8.48851 15.6761 8.51592 15.4715C8.54424 15.2669 8.589 15.0367 8.6502 14.7782L9.34537 12.3227C9.40658 12.087 9.45956 11.8632 9.50158 11.6549C9.5436 11.4448 9.5637 11.2521 9.5637 11.0767C9.5637 10.7642 9.49884 10.545 9.37004 10.4217C9.23941 10.2984 8.99368 10.2381 8.62736 10.2381C8.44832 10.2381 8.26379 10.2646 8.0747 10.3203C7.88743 10.3778 7.72483 10.4299 7.59146 10.4811L7.77507 9.72469C8.22999 9.53925 8.66573 9.3803 9.08137 9.24876C9.49701 9.11539 9.88982 9.04961 10.2598 9.04961C10.9276 9.04961 11.4428 9.21222 11.8054 9.53377C12.1663 9.85623 12.348 10.2755 12.348 10.7907C12.348 10.8976 12.3353 11.0858 12.3106 11.3544C12.2859 11.6239 12.2393 11.8696 12.1717 12.0952L11.4802 14.5434C11.4236 14.7398 11.3733 14.9645 11.3277 15.2157C11.2829 15.4669 11.261 15.6588 11.261 15.7876C11.261 16.1128 11.3331 16.3348 11.4793 16.4526C11.6236 16.5704 11.8767 16.6298 12.2348 16.6298C12.4038 16.6298 12.5929 16.5997 12.8066 16.5412C13.0185 16.4827 13.172 16.4307 13.2688 16.3859L13.0834 17.1414ZM12.961 7.20435C12.6385 7.50397 12.2503 7.65379 11.7963 7.65379C11.3432 7.65379 10.9522 7.50397 10.627 7.20435C10.3036 6.90472 10.1401 6.54023 10.1401 6.11454C10.1401 5.68977 10.3045 5.32437 10.627 5.022C10.9522 4.71872 11.3432 4.56799 11.7963 4.56799C12.2503 4.56799 12.6394 4.71872 12.961 5.022C13.2835 5.32437 13.4452 5.68977 13.4452 6.11454C13.4452 6.54115 13.2835 6.90472 12.961 7.20435Z"
                                fill="#FF6000"
                              />
                            </svg>
                          </OverlayTrigger>
                        </label>
                        <div className="doc-file-input">
                          <input
                            type="file"
                            multiple
                            name="businessDoc"
                            onChange={(e) => {
                              businessDocHandler(e), setShowImageerror(null);
                            }}

                            // {...register("businessDoc", { required: true })}
                            // accept=".pdf"
                          />
                          {showimageerror && (
                            <div className="input-error text-danger text-center">
                              {showimageerror}
                            </div>
                          )}
                          {/* <span class='button'>Choose</span> */}
                          <span className="label" data-js-label="">
                            <i className="fas fa-plus" />
                            {t("Upload from device")}
                          </span>
                          {errors.businessDoc &&
                            errors.businessDoc.type === "required" && (
                              <span className="text-danger customErrorMsg">
                                {t("This field is required")}
                              </span>
                            )}
                          {errors.businessDoc &&
                            errors.businessDoc.type === "manual" && (
                              <span className="text-danger">
                                {t(
                                  "Please select pdf only in upload business document"
                                )}
                              </span>
                            )}
                        </div>
                        {showimage}
                        <div className="uploadedRow">
                          {businessDocNames.map((doc, i) => (
                            <div className="uploadedPdf" key={i}>
                              <span
                                className="deleteUploaded"
                                onClick={() => removeBusinessDocHandler(i)}
                              >
                                <i class="fas fa-trash-alt"></i>
                              </span>
                              <img src="/assets/img/pdf-img.png" />
                              <p>{doc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12">
                    <h4 className="Warehouse_title">{t("Bank Details")}</h4>
                  </div>
                  <div className="col-md-12 col-lg-6">
                    <div className="form-group">
                      <label className="form-label">
                        {t("IBA Number")}
                        <span className="required">*</span>
                      </label>
                      <input
                        {...register("ibaNumber", { required: true })}
                        type="text"
                        name="ibaNumber"
                        placeholder=" "
                        className="form-control dark-form-control"
                        defaultValue=""
                      />
                      {errors.ibaNumber &&
                        errors.ibaNumber.type === "required" && (
                          <span className="text-danger">
                            {t("This field is required")}
                          </span>
                        )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-12">
                    <h4 className="Warehouse_title">{t("Personal Details")}</h4>
                  </div>
                  <div className="col-md-12 col-lg-6">
                    <div className="form-group">
                      <label className="form-label">
                        {t("Name")} <span className="required">*</span>
                      </label>
                      <input
                        {...register("name", {
                          required: true,
                          pattern: /^[a-zA-Z ]*$/,
                        })}
                        type="text"
                        name="name"
                        placeholder=" "
                        className="form-control dark-form-control"
                        defaultValue=""
                      />
                      {errors.name && errors.name.type === "required" && (
                        <span className="text-danger">
                          {t("This field is required")}
                        </span>
                      )}
                      {errors.name && errors.name.type === "pattern" && (
                        <span className="text-danger">
                          {t("The field name must contain letters")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label className="form-label">
                        {t("Country")}
                        <span className="required">*</span>
                      </label>
                      <select
                        className="form-select form-control dark-form-control"
                        name="country"
                        {...register("country", {
                          required: true,
                        })}
                        onChange={(e) => {
                          const country = countries.find((obj) => {
                            if (obj._id == e.target.value) {
                              return obj.countryCode;
                            }
                          });

                          if (country && country.countryCode) {
                            setValue("countryCode", `+${country.countryCode}`);
                            clearErrors("country");
                            clearErrors("countryCode");
                          } else {
                            setError("country", {
                              type: "required",
                            });
                            setError("countryCode", {
                              type: "required",
                            });
                            setValue("countryCode", "");
                          }
                        }}
                      >
                        <option value="">{t("Select")}</option>
                        {countries &&
                          countries.map((item, index) => {
                            return (
                              <option value={item?._id} key={item?._id}>
                                {item?.name}
                              </option>
                            );
                          })}
                      </select>

                      {errors.country && errors.country.type === "required" && (
                        <span className="text-danger">
                          {t("This field is required")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="form-group">
                      <label className="form-label">
                        {t("Email Address")} <span className="required">*</span>
                      </label>
                      <input
                        {...register("email", {
                          required: true,
                          pattern:
                            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                        })}
                        type="text"
                        name="email"
                        placeholder=" "
                        className="form-control dark-form-control"
                        defaultValue=""
                      />
                      {errors.email && errors.email.type === "required" && (
                        <span className="text-danger">
                          {t("This field is required")}
                        </span>
                      )}
                      {errors.email && errors.email.type === "pattern" && (
                        <span className="text-danger">
                          {t("Please enter valid email")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-sm-4 col-5 col-md-3 col-lg-2">
                    <div className="form-group">
                      <label className="form-label">
                        {t("Contact Number")}
                        <span className="required">*</span>
                      </label>
                      <input
                        {...register("countryCode", {
                          required: true,
                        })}
                        type="text"
                        name="countryCode"
                        placeholder="+91"
                        className="form-control dark-form-control"
                        defaultValue=""
                        disabled={true}
                      />
                      {errors.countryCode &&
                        errors.countryCode.type === "required" && (
                          <span className="text-danger">
                            {t("This field is required")}
                          </span>
                        )}
                    </div>
                  </div>
                  <div className="col-sm-8 col-7 col-md-9 col-lg-4">
                    <div className="form-group">
                      <label className="form-label">&nbsp;</label>
                      <input
                        {...register("contact", {
                          required: true,
                          setValueAs: (v) => v.trim(),
                          pattern: /^[0-9]{10}$/gm,
                        })}
                        type="number"
                        name="contact"
                        placeholder=""
                        className="form-control dark-form-control"
                        defaultValue=""
                      />
                      {errors.contact && errors.contact.type === "required" && (
                        <span className="text-danger">
                          {t("This field is required")}
                        </span>
                      )}
                      {errors.contact && errors.contact.type === "pattern" && (
                        <span className="text-danger">
                          {t("Please enter valid contact number")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-lg-12">
                    <div className="form-group">
                      <label className="form-label">
                        {t("Location")} <span className="required">*</span>
                      </label>
                      {/* {console.log(warehouse,"warehouse")} */}
                      <GooglePlace
                        saveAddress={saveLocationHandler}
                        // index={warehouse.id}
                        setValue={setValue}
                        {...register(`location`, {
                          required: true,
                        })}
                      />
                      {errors[`location`] &&
                        errors[`location`].type === "required" && (
                          <span className="text-danger">
                            {t("This field is required")}
                          </span>
                        )}
                      {errors[`location`] &&
                        errors[`location`].type === "manual1" && (
                          <span className="text-danger">
                            {t("Please enter valid location address.")}
                          </span>
                        )}
                      {/* {errors[`warehouseAddress${warehouse.id}`] &&
                                  errors[`warehouseAddress${warehouse.id}`]
                                    .type=== "required" && (
                                    <span className="text-danger">
                                      {t("This field is required")}
                                    </span>
                                  )}
                                {errors[`warehouseAddress${warehouse.id}`] &&
                                  errors[`warehouseAddress${warehouse.id}`]
                                    .type === "manual" && (
                                    <span className="text-danger">
                                      {t(
                                        "Please enter valid warehouse address"
                                      )}
                                    </span>
                                  )} */}
                    </div>
                  </div>

                  {/* <div className="col-lg-6">
                    <div
                      ref={dateRef}
                      onClick={openDatePicker}
                      className="form-group"
                    >
                      <label className="form-label">
                        {t("Date of Birth")} <span className="required">*</span>
                      </label>
                      <input
                        {...register("dob", { required: false })}
                        type="date"
                        max={new Date().toISOString().split("T")[0]}
                        name="dob"
                        placeholder=" "
                        className="form-control dark-form-control"
                        defaultValue=""
                      />
                      {errors.dob && errors.dob.type === "required" && (
                        <span className="text-danger">
                          {t("This field is required")}
                        </span>
                      )}
                    </div>
                  </div> */}

                  <div className="col-lg-6">
                    <div className="form-group">
                      <label className="form-label">
                        {t("Password")} <span className="required">*</span>
                      </label>
                      <input
                        {...register("password", {
                          required: true,
                          pattern: {
                            value:
                              /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(){1,})(?=(.*[!@#$%^&*()\-__+.]){1,1}).{8,}$/,
                          },
                          setValueAs: (v) => v.trim(),
                        })}
                        type={isPasswordVisible.password ? "text" : "password"}
                        name="password"
                        placeholder=" "
                        className="form-control dark-form-control"
                        defaultValue=""
                      />
                      <a
                        href="javascript:void(0)"
                        onClick={() => {
                          const updateP = {
                            ...isPasswordVisible,
                            password: isPasswordVisible.password ? false : true,
                          };
                          setIsPasswordVisible(updateP);
                        }}
                        className={`fa fa-fw ${
                          !isPasswordVisible.password
                            ? "fa-eye-slash"
                            : "fa-eye"
                        } field-icon-input toggle-password`}
                      />
                      {errors.password &&
                        errors.password.type === "required" && (
                          <span className="text-danger">
                            {t("This field is required")}
                          </span>
                        )}
                      {errors.password &&
                        errors.password.type === "pattern" && (
                          <span className="text-danger">
                            {t(
                              "Password must be of 8 or more characters long with atleast one number, one special character, one small and one capital letter"
                            )}
                          </span>
                        )}
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="form-group">
                      <label className="form-label">
                        {t("Confirm Password")}{" "}
                        <span className="required">*</span>
                      </label>
                      <input
                        {...register("cpassword", {
                          required: true,
                          pattern: {
                            value:
                              // /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&]).{8,}/,
                              /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(){1,})(?=(.*[!@#$%^&*()\-__+.]){1,1}).{8,}$/,
                          },
                        })}
                        type={
                          isPasswordVisible.confirmPassword
                            ? "text"
                            : "password"
                        }
                        name="cpassword"
                        placeholder=" "
                        className="form-control dark-form-control"
                        defaultValue=""
                      />
                      <a
                        href="javascript:void(0)"
                        onClick={() => {
                          const updateP = {
                            ...isPasswordVisible,
                            confirmPassword: isPasswordVisible.confirmPassword
                              ? false
                              : true,
                          };
                          setIsPasswordVisible(updateP);
                        }}
                        className={`fa fa-fw ${
                          !isPasswordVisible.confirmPassword
                            ? "fa-eye-slash"
                            : "fa-eye"
                        } field-icon-input toggle-password`}
                      />
                      {errors.cpassword &&
                        errors.cpassword.type === "required" && (
                          <span className="text-danger">
                            {t("This field is required")}
                          </span>
                        )}
                      {errors.cpassword &&
                        errors.cpassword.type === "pattern" && (
                          <span className="text-danger">
                            {t(
                              "Confirm Password must be of 8 or more characters long with atleast one number, one special character, one small and one capital letter"
                            )}
                          </span>
                        )}

                      {errors.cpassword &&
                        errors.cpassword.type === "manual" && (
                          <span className="text-danger">
                            {t("Password and confirm password does not match")}
                          </span>
                        )}
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="select_remendor">
                      <div className="form-group custom_checkbox d-flex position-relative">
                        <input
                          type="checkbox"
                          id="terms"
                          {...register("termsAndConditions", {
                            required: true,
                          })}
                        />
                        <label htmlFor="terms" className="click_reme">
                          {t("I accept all")}{" "}
                          <Link href="/terms-&-conditions" legacyBehavior>
                            <a target="_blank" className="register_select">
                              {t("terms & conditions")}
                            </a>
                          </Link>
                        </label>
                      </div>
                    </div>
                    {errors.termsAndConditions &&
                      errors.termsAndConditions.type === "required" && (
                        <span className="text-danger">
                          {t("This field is required")}
                        </span>
                      )}
                  </div>
                  <div className="vendor_submit_account">
                    <div className="vendor_button register_submit">
                      <button
                        type="submit"
                        className="submit_button regisert_btn vendor_login_button"
                      >
                        {t("Submit Now")}
                      </button>
                    </div>
                    <div className="click_here account_vendor_click">
                      <p>
                        {t("Already have an Account")}{" "}
                        <Link href="/vendor/login" legacyBehavior>
                          <a className="register_select ">{t("Click here")}</a>
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
      <Modal show={showCategoriesRequestModal}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">
              {t("Request a category")}
            </h5>

            <button
              type="button"
              className="btn-close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={(e) => setShowCategoriesRequestModal(false)}
            ></button>
          </div>
          <div className="modal-body">
            <div className="continueBx_">
              <div className="modalAddRow">
                <label className="dark-label mtm-5">
                  {" "}
                  {t("Category Name")}{" "}
                </label>
                <button type="button" onClick={() => addCategoryHandler()}>
                  <svg
                    fill="currentcolor"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    width="20px"
                  >
                    <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" />
                  </svg>
                </button>
              </div>
              {categoryRequestInputs &&
                categoryRequestInputs.map((data) => (
                  <>
                    <div className="addTopRowCard">
                      <div className="addRowCard">
                        <input
                          className="form-control dark-form-control"
                          {...register(`categoryRequest_${data.id}`)}
                        />
                        <button
                          className="btn btn-bg-danger ml-2 mt-1"
                          type="button"
                          onClick={() => deleteCategoryRequestHandler(data.id)}
                        >
                          <i class="fas fa-trash-alt"></i>
                        </button>
                      </div>
                      {errors[`categoryRequest_${data.id}`] && (
                        <span className="text-danger">
                          {t(errors[`categoryRequest_${data.id}`].message)}
                        </span>
                      )}
                    </div>

                    {/* <div className="addRowCard">
                      <input
                        className="form-control dark-form-control"
                        {...register(`categoryRequest_${data.id}`)}
                      />
                   
                      <button
                        className="btn btn-bg-danger ml-2 mt-1"
                        type="button"
                        onClick={() => deleteCategoryRequestHandler(data.id)}
                      >
                        <i class="fas fa-trash-alt"></i>
                      </button><br></br>
                      {errors[`categoryRequest_${data.id}`] && (
                        <span className="text-danger">
                          {t(errors[`categoryRequest_${data.id}`].message)}
                        </span>
                      )}
                    </div> */}
                  </>
                ))}
              <div className="login_button">
                <button
                  type="submit"
                  class="submit_button w-100"
                  onClick={() => {
                    setIsCategoryRequest(true);
                    setShowCategoriesRequestModal(false);
                  }}
                >
                  {t("Save Request")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export async function getServerSideProps(context) {
  const [countries, currencies, categories, image] = await Promise.all([
    getCountries(),
    getCurrencies(),
    getCategories(),
    getSystemImage("vendor-signup"),
  ]);

  return {
    props: {
      protected: false,
      countries: countries ? countries : [],
      currencies: currencies ? currencies : [],
      categories: categories ? categories : [],
      image,
      locales: {
        ...require(`../../locales/index/${context.locale}.json`),
      },
    },
  };
}

export default Signup;
