import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import moment from "moment";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useDropzone } from "react-dropzone";
import { useTranslations } from "next-intl";
import { Button, Modal } from "react-bootstrap";
import Select from "react-select";
import { useRouter } from "next/router";

import Layout from "@/components/Vendor/Layout";
import { createAxiosCookies } from "@/fn";
import useRequest from "@/hooks/useRequest";
import { getProfileData } from "@/services/vendor";
import { MEDIA_URL } from "@/api";
import { authSuccess } from "@/store/auth/action";
import { getCountries } from "@/services/countries";
import GooglePlace from "@/components/GooglePlace";
import { getCurrencies } from "@/services/currencies";
import { getCategories } from "@/services/productCategories";

const imgArray = ["image/png", "image/jpeg", "image/jpg"];

const langObj = {
  en: "English",
  tr: "Turkish",
  ar: "Arabic",
};

const MyProfile = ({ vendor, countries, currencies, categories }) => {
  const t = useTranslations("Index");
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors: errors },
    setError,
    setValue,
    control,
  } = useForm();

  const {
    register: registerChangePassword,
    handleSubmit: handleSubmitChangePassword,
    formState: { errors: errorsChangePassword },
    setError: setErrorChangePassword,
    resetField: resetChangePassword,
  } = useForm();

  const {
    register: registerBusiness,
    unregister: unregisterBusiness,
    handleSubmit: handleSubmitBusiness,
    formState: { errors: errorsBusiness },
    setValue: setValueBusiness,
    clearErrors: clearErrorsBusiness,
    setValueAs,
    getValues: getValuesBusiness,
    setError: setErrorBusiness,
    control: businessContorl,
  } = useForm();

  const {
    register: registerBank,
    handleSubmit: handleSubmitBank,
    formState: { errors: errorsBank },
    setValue: setValueBank,
  } = useForm();

  const [isPasswordVisible, setIsPasswordVisible] = useState([
    {
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    },
  ]);

  const [warehouseArray, setWarehouseArray] = useState([]);
  const [warehouseId, setWarehouseId] = useState(0);
  const [warehouseDefaultAddress, setWarehouseDefaultAddress] = useState([]);
  const [removeWarehouse, setRemoveWarehouse] = useState([]);

  const [profilePic, setProfilePic] = useState("");
  const [uploadProfilePic, setUploadProfilePic] = useState();

  const [categoryRequestInputs, setCategoryRequestInputs] = useState([]);
  const [categoryRequestId, setCategoryRequestId] = useState(1);

  const [serveCountriesOptions, setServeCountriesOptions] = useState();
  const [productCategoriesOptions, setProductCategoriesOptions] = useState(
    categories.map((c) => ({
      label: c.name,
      value: c._id,
    }))
  );
  const [isCategoryRequest, setIsCategoryRequest] = useState(false);
  const [showCategoriesRequestModal, setShowCategoriesRequestModal] =
    useState(false);

  const { request, response } = useRequest();

  const {
    request: productCategoriesRequest,
    response: productCategoriesResponse,
  } = useRequest();

  const {
    request: updateProfilePicRequest,
    response: updateProfilePicResponse,
  } = useRequest();
  const { request: requestUpdateBusiness, response: responseUpdateBusiness } =
    useRequest();
  const { request: requestUpdateBank, response: responseUpdateBank } =
    useRequest();
  const { request: requestChangePassword, response: responseChangePassword } =
    useRequest();

  const router = useRouter();
  const { locale } = router;

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      const profilePicType = acceptedFiles[0].type;
      if (!imgArray.includes(profilePicType)) {
        toast.error("Please select image only in profile pic");
        return;
      } else {
        setProfilePic(URL.createObjectURL(acceptedFiles[0]));
        setUploadProfilePic(acceptedFiles[0]);
      }
    },
  });

  useEffect(() => {
    if (locale) {
      setValueBusiness("language", langObj[locale]);
    }
  }, [locale]);

  useEffect(() => {
    if (updateProfilePicResponse && updateProfilePicResponse.status) {
      const { profilePic } = updateProfilePicResponse;
      if (profilePic) {
        toast.success(updateProfilePicResponse.message);

        setProfilePic(`${MEDIA_URL}/${profilePic}`);
        dispatch(
          authSuccess({ profilePic: updateProfilePicResponse.profilePic })
        );
      } else {
        toast.success("Profile pic deleted successfully.");
      }
    }
  }, [updateProfilePicResponse]);

  useEffect(() => {
    const {
      firstName,
      lastName,
      email,
      dob,
      profilePic,
      countryCode,
      contact,
      businessName,
      businessEmail,
      businessContact,
      businessCountry,
      ibaNumber,
      warehouseData,
      language,
      productCategories,
      serveCountries,
      storefrontSubscription,
      currency,
    } = vendor;

    if (dob) {
      setValue("dob", moment(dob).format("YYYY-MM-DD"));
    }
    setValue("countryCode", countryCode);
    setValue("contact", contact);
    setValue("firstName", firstName);
    setValue("lastName", lastName);
    setValue("email", email);

    setValueBank("ibaNumber", ibaNumber);
    setValueBusiness("businessName", businessName);
    setValueBusiness("businessContact", businessContact);
    setValueBusiness("businessEmail", businessEmail);
    setValueBusiness("businessCountry", businessCountry);
    setValueBusiness("language", language);
    setValueBusiness("currency", currency);
    setValueBusiness(
      "storefrontSubscription",
      [null, undefined].includes(storefrontSubscription) ? "false" : "true"
    );
    if (serveCountries && serveCountries.length > 0) {
      setValueBusiness(
        "serveCountries",
        serveCountries.map((s) => ({ value: s._id, label: s.name }))
      );
    }
    if (productCategories && productCategories.length > 0) {
      setValueBusiness(
        "productCategories",
        productCategories.map((s) => ({ value: s._id, label: s.name }))
      );
    }

    if (warehouseData.length > 0) {
      setWarehouseArray(
        warehouseData.map((data, idx) => ({
          id: idx,
          _id: data._id,
        }))
      );

      warehouseData.map((data, i) => {
        // console.log(warehouseId);
        setValueBusiness(`warehouseName${i}`, data.name);
        setValueBusiness(`city${i}`, data.city);
        setValueBusiness(`state${i}`, data.state);
        setValueBusiness(`street${i}`, data.street);
        setValueBusiness(`warehouseCountry${i}`, data.country);
        setValueBusiness(`zipcode${i}`, data.zipCode);
        setValueBusiness(`warehouseAddress${i}`, data.address);
        setWarehouseDefaultAddress((prev) => [...prev, data.address]);
        setValueBusiness(`geoLocation${i}`, data.geoLocation?.coordinates);
        setWarehouseId((prev) => prev + 1);
      });
    }

    if (profilePic) {
      setProfilePic(`${MEDIA_URL}/${profilePic}`);
    }

    let options = [];
    // let categoriesOptions = [];
    if (countries && countries.length > 0) {
      countries.forEach((obj) => {
        options.push({
          label: obj.name,
          value: obj._id,
        });
      });

      // if (options && options.length > 0) {
      //   productCategoriesRequest("POST", "v1/product-categories/country", {
      //     ids: options.map((o) => o.value),
      //   });
      // }
      setServeCountriesOptions(options);
    }
  }, []);

  // useEffect(() => {
  //   if (productCategoriesResponse) {
  //     if (productCategoriesResponse.status) {
  //       let { productCategories } = productCategoriesResponse;
  //       productCategories = productCategories.map((p) => ({
  //         label: p.name,
  //         value: p._id,
  //       }));

  //       setProductCategoriesOptions(productCategories);
  //       const value = getValuesBusiness("productCategories");
  //       let newArr = [];
  //       if (
  //         value &&
  //         value.length > 0 &&
  //         productCategories &&
  //         productCategories.length > 0
  //       ) {
  //         productCategories.forEach((a) => {
  //           let v = a.value;
  //           value.forEach((b) => {
  //             let val = b.value;
  //             if (v == val) {
  //               newArr.push(b);
  //             }
  //           });
  //         });
  //       }
  //       if (newArr.length > 0) {
  //         setValueBusiness("productCategories", newArr);
  //       } else {
  //         setValueBusiness("productCategories", "");
  //       }
  //     }
  //   }
  // }, [productCategoriesResponse]);

  const onSubmit = (data) => {
    const { firstName, lastName, dob } = data;
    request("PUT", "v1/vendor/update-profile", {
      firstName,
      lastName,
      dob,
    });
  };

  const profilePicHandler = (isDelete) => {
    const formData = new FormData();
    if (isDelete) {
      formData.append("profilePic", "");
      setProfilePic("");
      setUploadProfilePic("");
      dispatch(authSuccess({ profilePic: "" }));
      updateProfilePicRequest("PUT", "v1/vendor/profile-pic", formData);
    } else {
      if (uploadProfilePic) {
        formData.append("profilePic", uploadProfilePic);
        updateProfilePicRequest("PUT", "v1/vendor/profile-pic", formData);
      }
    }
  };

  useEffect(() => {
    if (response) {
      if (response.status) {
        if (response.data) {
          dispatch(
            authSuccess({
              firstName: response.data?.firstName,
              lastName: response.data?.lastName,
            })
          );
        }

        toast.success(response.message);
      }
    }
  }, [response]);

  const onSubmitChangePassword = (data) => {
    const { currentPassword, newPassword, confirmPassword } = data;

    if (newPassword !== confirmPassword) {
      setErrorChangePassword("confirmPassword", { type: "manual" });
      return;
    }

    requestChangePassword("PUT", "v1/vendor/change-password", {
      currentPassword,
      newPassword,
    });
  };

  useEffect(() => {
    if (responseChangePassword) {
      if (responseChangePassword.status) {
        resetChangePassword("currentPassword");
        resetChangePassword("newPassword");
        resetChangePassword("confirmPassword");
        toast.success(responseChangePassword.message);
      }
    }
  }, [responseChangePassword]);

  const onSubmitBank = (data) => {
    const { ibaNumber } = data;
    requestUpdateBank("PUT", "v1/vendor/update-bank-info", { ibaNumber });
  };

  useEffect(() => {
    if (responseUpdateBank) {
      if (responseUpdateBank.status) {
        toast.success(responseUpdateBank.message);
      }
    }
  }, [responseUpdateBank]);

  const saveWarehouswHandler = (address, geoLocation, key) => {
    clearErrorsBusiness("warehouseAddress");
    setValueBusiness(`warehouseAddress${key}`, address);
    setValueBusiness(`geoLocation${key}`, [geoLocation.lng, geoLocation.lat]);
  };
  const warehouseAddHandler = () => {
    setWarehouseArray((prev) => [...prev, { id: warehouseId }]);
    setWarehouseId((prev) => prev + 1);
  };
  const warehouseDeleteHandler = (id, _id) => {
    setWarehouseArray([...warehouseArray].filter((data) => data.id != id));
    if (_id) {
      setRemoveWarehouse((prev) => [...prev, _id]);
    }
    unregisterBusiness(`warehouseName${id}`);
    unregisterBusiness(`warehouseCountry${id}`);
    unregisterBusiness(`warehouseAddress${id}`);
    unregisterBusiness(`geoLocation${id}`);
  };

  const onSubmitBusiness = (data) => {
    let {
      businessName,
      businessCountry,
      serveCountries,
      productCategories,
      currency,
      language,
      storefrontSubscription,
    } = data;
    let isError = false;
    let addWarehouse = [];
    let updateWarehouse = [];
    warehouseArray.forEach((warehouse) => {
      if (!data[`warehouseAddress${warehouse.id}`]) {
        setError("warehouseAddress", {
          type: "manual",
        });
        isError = true;
      }

      if (!data[`geoLocation${warehouse.id}`]) {
        setError("address", {
          type: "manual1",
        });
        isError = true;
      }

      if (warehouse._id) {
        updateWarehouse.push({
          name: data[`warehouseName${warehouse.id}`],
          geoLocation: {
            coordinates: data[`geoLocation${warehouse.id}`],
            type: "Point",
          },
          address: data[`warehouseAddress${warehouse.id}`],
          country: data[`warehouseCountry${warehouse.id}`],
          city: data[`city${warehouse.id}`],
          state: data[`state${warehouse.id}`],
          street: data[`street${warehouse.id}`],
          zipCode: data[`zipcode${warehouse.id}`],
          id: warehouse._id,
        });
      } else {
        addWarehouse.push({
          name: data[`warehouseName${warehouse.id}`],
          geoLocation: {
            coordinates: data[`geoLocation${warehouse.id}`],
            type: "Point",
          },
          address: data[`warehouseAddress${warehouse.id}`],
          country: data[`warehouseCountry${warehouse.id}`],
          city: data[`city${warehouse.id}`],
          state: data[`state${warehouse.id}`],
          street: data[`street${warehouse.id}`],
          zipCode: data[`zipcode${warehouse.id}`],
        });
      }
    });
    serveCountries = serveCountries.map((s) => s.value);
    productCategories = productCategories.map((s) => s.value);

    let categoryRequest = [];
    if (isCategoryRequest) {
      if (categoryRequestInputs.length > 0) {
        categoryRequestInputs.forEach((c) => {
          if (
            data[`categoryRequest_${c.id}`].trim().length == 0 ||
            data[`categoryRequest_${c.id}`] == undefined
          ) {
            setErrorBusiness(`categoryRequest_${c.id}`, {
              type: "manual",
              message: "This field is required",
            });
            setShowCategoriesRequestModal(true);
            isError = true;
          } else {
            categoryRequest.push(data[`categoryRequest_${c.id}`]);
          }
        });
      }
    }

    if (isError) {
      return;
    }
    requestUpdateBusiness("PUT", "v1/vendor/update-business-info", {
      businessName,
      businessCountry,
      addWarehouse,
      updateWarehouse,
      removeWarehouse,
      language,
      productCategories,
      serveCountries,
      storefrontSubscription,
      currency,
      categoryRequest,
    });
  };

  useEffect(() => {
    if (responseUpdateBusiness) {
      if (responseUpdateBusiness.status) {
        setRemoveWarehouse([]);
        toast.success(responseUpdateBusiness.message);
      }
    }
  }, [responseUpdateBusiness]);

  const serveCountriesHandle = (val) => {
    let ids = val.map((i) => i.value);
    // if (val.length == 0) {
    //   setValueBusiness("productCategories", "");
    // }
    // productCategoriesRequest("POST", "v1/product-categories/country", {
    //   ids,
    // });
  };

  const addCategoryHandler = () => {
    setCategoryRequestInputs((prev) => [...prev, { id: categoryRequestId }]);
    setCategoryRequestId((prev) => prev + 1);
  };

  const deleteCategoryRequestHandler = (id) => {
    setCategoryRequestInputs((prev) => prev.filter((data) => data.id != id));
    unregisterBusiness(`categoryRequest_${id}`, "");
  };

  return (
    <Layout seoData={{ pageTitle: "My Profile - Noonmar" }}>
      <div className="main_content">
        <div className="col-12">
          <div className="headpageTitle mobile-title-show">
            {t("My Profile")}
          </div>
        </div>
        <div className="DashboardRightContant">
          <div className="DashboardProfile">
            <ul
              className="nav nav-tabs vendorProfileTab"
              id="myTab"
              role="tablist"
            >
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link active"
                  id="personal-information-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#personal-information-tab-pane"
                  type="button"
                  role="tab"
                  aria-controls="personal-information-tab-pane"
                  aria-selected="true"
                >
                  {t("Personal Information")}
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="business-information-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#business-information-tab-pane"
                  type="button"
                  role="tab"
                  aria-controls="business-information-tab-pane"
                  aria-selected="false"
                >
                  {t("Business Information")}
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="notification-settings-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#notification-settings-tab-pane"
                  type="button"
                  role="tab"
                  aria-controls="notification-settings-tab-pane"
                  aria-selected="false"
                >
                  {t("Notification Settings")}
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="banking-information-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#banking-information-tab-pane"
                  type="button"
                  role="tab"
                  aria-controls="banking-information-tab-pane"
                  aria-selected="false"
                >
                  {t("Banking Information")}
                </button>
              </li>
            </ul>
            <div className="tab-content" id="myTabContent">
              <div
                className="tab-pane fade show active"
                id="personal-information-tab-pane"
                role="tabpanel"
                aria-labelledby="personal-information-tab"
                tabIndex={0}
              >
                <div className="tabsContent">
                  <div className="personal_info_page">
                    <div className="img_upload">
                      <div className="img_profile_banner editIcnCenter">
                        <div {...getRootProps({ className: "dropzone" })}>
                          <input {...getInputProps()} />
                          <div className="img_profile_banner">
                            {profilePic ? (
                              <img src={profilePic} alt="" />
                            ) : (
                              <img src="/assets/img/profile-img.jpg" alt="" />
                            )}
                            <span
                              class="ProfileEditBtn"
                              style={{ cursor: "pointer" }}
                            >
                              <i class="fa fa-edit"></i>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="sameLine-button">
                        <div className="upload-btn-wrapper">
                          <button
                            className="img_upload_btn"
                            onClick={() => profilePicHandler(false)}
                          >
                            {t("Upload")}
                          </button>
                          {/* <input type="file" name="myfile" /> */}
                        </div>
                        {profilePic && (
                          <button
                            className="img_delete_btn"
                            onClick={() => profilePicHandler(true)}
                          >
                            <i className="far fa-trash-alt" /> {t("Delete")}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="profile_information_banner">
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="form-group ">
                              <label
                                htmlFor="exampleFormControlInput1"
                                className="form-label"
                              >
                                {t("First Name")}{" "}
                                <span className="required">*</span>
                              </label>
                              <input
                                type="text"
                                name="firstName"
                                placeholder=""
                                className="form-control dark-form-control   "
                                defaultValue=""
                                {...register("firstName", {
                                  required: true,
                                  pattern: /^[a-zA-Z]*$/,
                                })}
                              />
                              {errors.firstName &&
                                errors.firstName?.type === "required" && (
                                  <span className="text-danger">
                                    {t("This field is required")}
                                  </span>
                                )}

                              {errors.firstName &&
                                errors.firstName?.type === "pattern" && (
                                  <span className="text-danger">
                                    {t("Please enter valid first name")}
                                  </span>
                                )}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group ">
                              <label
                                htmlFor="exampleFormControlInput2"
                                className="form-label"
                              >
                                {t("Last Name")}{" "}
                                <span className="required">*</span>
                              </label>
                              <input
                                type="text"
                                name="lastName"
                                placeholder=""
                                className="form-control dark-form-control"
                                {...register("lastName", {
                                  required: true,
                                  pattern: /^[a-zA-Z]*$/,
                                })}
                              />
                              {errors.lastName &&
                                errors.lastName?.type === "required" && (
                                  <span className="text-danger">
                                    {t("This field is required")}
                                  </span>
                                )}

                              {errors.lastName &&
                                errors.lastName?.type === "pattern" && (
                                  <span className="text-danger">
                                    {t("Please enter valid last name")}
                                  </span>
                                )}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group ">
                              <label
                                htmlFor="exampleFormControlInput3"
                                className="form-label"
                              >
                                {t("Email")} <span className="required">*</span>
                              </label>
                              <input
                                type="text"
                                name="email"
                                placeholder=""
                                className="form-control dark-form-control   "
                                defaultValue=""
                                disabled={false}
                                {...register("email", {
                                  required: true,
                                  pattern:
                                    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                                })}
                              />
                              {errors.email &&
                                errors.email.type === "required" && (
                                  <span className="text-danger">
                                    {t("This field is required")}
                                  </span>
                                )}
                              {errors.email &&
                                errors.email.type === "pattern" && (
                                  <span className="text-danger">
                                    {t("Please enter valid email")}
                                  </span>
                                )}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group ">
                              <label
                                htmlFor="exampleFormControlInput4"
                                className="form-label"
                              >
                                {t("Date of birth")}{" "}
                                <span className="required">*</span>
                              </label>
                              <input
                                type="date"
                                name="dob"
                                className="form-control dark-form-control   "
                                max={moment(new Date()).format("YYYY-MM-DD")}
                                {...register("dob", {
                                  required: true,
                                })}
                              />
                              {errors.dob?.type === "required" && (
                                <span className="text-danger">
                                  {t("This field is required")}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-md-5">
                            <label
                              htmlFor="exampleFormControlInpu5"
                              className="form-label"
                            >
                              {t("Mobile Number")}{" "}
                              <span className="required">*</span>
                            </label>
                            <div className="number_form_input">
                              <div className="col-md-3 col-lg-3 col-sm-3 mobile_in-no">
                                <div className="form-group ">
                                  <input
                                    type="text"
                                    name="countryCode"
                                    className="form-control dark-form-control"
                                    placeholder=""
                                    defaultValue=""
                                    disabled
                                    {...register("countryCode", {
                                      required: true,
                                    })}
                                  />
                                </div>
                              </div>
                              <div className="col-md-9 col-lg-9 col-sm-9">
                                <div className="form-group ">
                                  <input
                                    type="number"
                                    name="contact"
                                    className="form-control dark-form-control"
                                    placeholder=""
                                    defaultValue=""
                                    disabled={true}
                                    {...register("contact", {
                                      required: true,
                                      pattern: /^[0-9]{10}$/gm,
                                    })}
                                  />
                                  {errors.contact &&
                                    errors.contact.type === "required" && (
                                      <span className="text-danger">
                                        {t("This field is required")}
                                      </span>
                                    )}
                                  {errors.contact &&
                                    errors.contact.type === "pattern" && (
                                      <span className="text-danger">
                                        {t("Please enter valid phone number")}
                                      </span>
                                    )}
                                </div>
                              </div>
                              <div className="col-md-9 col-lg-9 col-sm-9">
                                <div className="alerts_btn mt-2">
                                  <a
                                    href="javascript:void(0);"
                                    onClick={handleSubmit(onSubmit)}
                                    className="sms_alert_btn"
                                  >
                                    {t("Update Profile")}
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                    {/* password section */}
                    <div className="password_change_banner">
                      <div className="infomation_title_banner">
                        <h3 className="info_title">{t("Change Password")}</h3>
                      </div>
                      <div className="profile_information_banner">
                        <form
                          onSubmit={handleSubmitChangePassword(
                            onSubmitChangePassword
                          )}
                        >
                          <div className="row">
                            <div className="col-md-3">
                              <div className="form-group ">
                                <label
                                  htmlFor="exampleFormControlInput6"
                                  className="form-label"
                                >
                                  {t("Current Password")}{" "}
                                  <span className="required">*</span>
                                </label>
                                <input
                                  type={
                                    isPasswordVisible.currentPassword
                                      ? "text"
                                      : "password"
                                  }
                                  name="currentPassword"
                                  placeholder=""
                                  className="form-control dark-form-control   "
                                  defaultValue=""
                                  {...registerChangePassword(
                                    "currentPassword",
                                    {
                                      required: true,
                                    }
                                  )}
                                />

                                <a
                                  href="javascript:void(0)"
                                  onClick={() => {
                                    const updateP = {
                                      ...isPasswordVisible,
                                      currentPassword:
                                        isPasswordVisible.currentPassword
                                          ? false
                                          : true,
                                    };
                                    setIsPasswordVisible(updateP);
                                  }}
                                  className={`fa fa-fw ${
                                    isPasswordVisible.currentPassword
                                      ? "fa-eye"
                                      : "fa-eye-slash"
                                  } field-icon-input toggle-password`}
                                />

                                {errorsChangePassword.currentPassword &&
                                  errorsChangePassword.currentPassword.type ===
                                    "required" && (
                                    <span className="text-danger">
                                      {t("This field is required")}
                                    </span>
                                  )}
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="form-group">
                                <label
                                  htmlFor="exampleFormControlInput7"
                                  className="form-label"
                                >
                                  {t("New Password")}{" "}
                                  <span className="required">*</span>
                                </label>
                                <input
                                  type={
                                    isPasswordVisible.newPassword
                                      ? "text"
                                      : "password"
                                  }
                                  id="password-field"
                                  name="newPassword"
                                  placeholder=""
                                  className="form-control dark-form-control   "
                                  defaultValue=""
                                  {...registerChangePassword("newPassword", {
                                    required: true,
                                    pattern:
                                      /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(){1,})(?=(.*[!@#$%^&*()\-__+.]){1,1}).{8,}$/,
                                  })}
                                />
                                <a
                                  href="javascript:void(0)"
                                  onClick={() => {
                                    const updateP = {
                                      ...isPasswordVisible,
                                      newPassword: isPasswordVisible.newPassword
                                        ? false
                                        : true,
                                    };
                                    setIsPasswordVisible(updateP);
                                  }}
                                  className={`fa fa-fw ${
                                    isPasswordVisible.newPassword
                                      ? "fa-eye"
                                      : "fa-eye-slash"
                                  } field-icon-input toggle-password`}
                                />
                                {errorsChangePassword.newPassword &&
                                  errorsChangePassword.newPassword.type ===
                                    "required" && (
                                    <span className="text-danger">
                                      {t("This field is required")}
                                    </span>
                                  )}
                                {errorsChangePassword.newPassword &&
                                  errorsChangePassword.newPassword.type ===
                                    "pattern" && (
                                    <span className="text-danger">
                                      {t(
                                        "New Password must be of 8 or more characters long with atleast one number, one special character, one small and one capital letter"
                                      )}
                                    </span>
                                  )}
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="form-group ">
                                <label className="form-label">
                                  {t("Confirm Password")}{" "}
                                  <span className="required">*</span>
                                </label>
                                <input
                                  type={
                                    isPasswordVisible.confirmPassword
                                      ? "text"
                                      : "password"
                                  }
                                  name="confirmPassword"
                                  placeholder=""
                                  className="form-control dark-form-control   "
                                  defaultValue=""
                                  {...registerChangePassword(
                                    "confirmPassword",
                                    {
                                      required: true,
                                    }
                                  )}
                                />
                                <a
                                  href="javascript:void(0)"
                                  onClick={() => {
                                    const updateP = {
                                      ...isPasswordVisible,
                                      confirmPassword:
                                        isPasswordVisible.confirmPassword
                                          ? false
                                          : true,
                                    };
                                    setIsPasswordVisible(updateP);
                                  }}
                                  className={`fa fa-fw ${
                                    isPasswordVisible.confirmPassword
                                      ? "fa-eye"
                                      : "fa-eye-slash"
                                  } field-icon-input toggle-password`}
                                />
                                {errorsChangePassword.confirmPassword &&
                                  errorsChangePassword.confirmPassword.type ===
                                    "required" && (
                                    <span className="text-danger">
                                      {t("This field is required")}
                                    </span>
                                  )}

                                {errorsChangePassword.confirmPassword &&
                                  errorsChangePassword.confirmPassword.type ===
                                    "manual" && (
                                    <span className="text-danger">
                                      {t(
                                        "New password and confirm password does not match"
                                      )}
                                    </span>
                                  )}
                              </div>
                            </div>
                            <div className="col-md-3 col-lg-3 alerts_btnss">
                              <div className="alerts_btn mt-2">
                                <a
                                  href="javascript:void(0);"
                                  onClick={handleSubmitChangePassword(
                                    onSubmitChangePassword
                                  )}
                                  className="sms_alert_btn"
                                >
                                  {t("Update Password")}
                                </a>
                              </div>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="tab-pane fade"
                id="business-information-tab-pane"
                role="tabpanel"
                aria-labelledby="business-information-tab"
                tabIndex={0}
              >
                {/* Business Details Section */}
                <form onSubmit={handleSubmitBusiness(onSubmitBusiness)}>
                  <div className="password_change_banner">
                    <div className="infomation_title_banner">
                      <h3 className="innerSub_title">Business Details</h3>
                    </div>
                    <div className="profile_information_block">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group ">
                            <label className="form-label">
                              {t("Business Name")}{" "}
                              <span className="required">*</span>
                            </label>
                            <input
                              type="text"
                              name="businessName"
                              placeholder=""
                              className="form-control dark-form-control   "
                              defaultValue=""
                              {...registerBusiness("businessName", {
                                required: true,
                              })}
                            />
                            {errorsBusiness.businessName &&
                              errorsBusiness.businessName?.type ===
                                "required" && (
                                <div className="text-danger">
                                  {t("This field is required")}
                                </div>
                              )}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">
                              {t("Native Country")}{" "}
                              <span className="required">*</span>
                            </label>
                            <select
                              name="businessCountry"
                              className="form-select form-control dark-form-control"
                              aria-label="Default select example"
                              {...registerBusiness("businessCountry", {
                                required: true,
                              })}
                              disabled
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
                            {errorsBusiness.businessCountry &&
                              errorsBusiness.businessCountry?.type ===
                                "required" && (
                                <div className="text-danger">
                                  {t("This field is required")}
                                </div>
                              )}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">
                              {t("Business Phone Number")}{" "}
                              <span className="required">*</span>
                            </label>
                            <input
                              type="text"
                              id="password-field"
                              name="businessContact"
                              placeholder=""
                              className="form-control dark-form-control"
                              defaultValue=""
                              disabled={true}
                              {...registerBusiness("businessContact", {
                                required: true,
                                pattern: /^[0-9]{10}$/gm,
                              })}
                            />
                            {errorsBusiness.businessContact &&
                              errorsBusiness.businessContact?.type ===
                                "required" && (
                                <div className="text-danger">
                                  {t("This field is required")}
                                </div>
                              )}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">
                              {t("Business Email Address")}{" "}
                              <span className="required">*</span>
                            </label>
                            <input
                              type="text"
                              name="businessEmail"
                              placeholder=""
                              className="form-control dark-form-control"
                              defaultValue=""
                              disabled={true}
                              {...registerBusiness("businessEmail", {
                                required: true,
                                pattern:
                                  /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                              })}
                            />
                            {errorsBusiness.businessEmail &&
                              errorsBusiness.businessEmail?.type ===
                                "required" && (
                                <div className="text-danger">
                                  {t("This field is required")}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <>
                    <div className="row section-gap">
                      <div className="col-md-6 col-lg-6 col-xl-4 col02">
                        <div className="form-group">
                          <label
                            htmlFor="country"
                            className="dark-label mt575-5"
                          >
                            {t("Select Countries you want to Serve")}{" "}
                            <span className="required">*</span>
                          </label>
                          <Controller
                            className="form-control form-control-solid form-control-lg mb-10 col-4"
                            control={businessContorl}
                            name="serveCountries"
                            rules={{ required: true }}
                            render={({ field: { onChange, value, ref } }) => {
                              return (
                                <Select
                                  onChange={(val) => {
                                    onChange(val), serveCountriesHandle(val);
                                  }}
                                  options={serveCountriesOptions}
                                  isMulti={true}
                                  value={value}
                                  className="form-select- form-control- dark-form-control libSelect"
                                />
                              );
                            }}
                          />

                          {errorsBusiness.serveCountries &&
                            errorsBusiness.serveCountries.type ===
                              "required" && (
                              <span className="text-danger">
                                {t("This field is required")}
                              </span>
                            )}
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-6 col-xl-4 col01">
                        <div className="form-group ">
                          <label htmlFor="country" className="dark-label">
                            {t("Product Categories you deal with")}{" "}
                            <span className="required">*</span>
                          </label>
                          <Controller
                            className="form-control form-control-solid form-control-lg mb-10 col-4"
                            control={businessContorl}
                            name="productCategories"
                            rules={{ required: true }}
                            render={({ field: { onChange, value, ref } }) => {
                              return (
                                <Select
                                  onChange={(val) => {
                                    onChange(val);
                                  }}
                                  options={productCategoriesOptions}
                                  isMulti={true}
                                  value={value}
                                  className="form-select- form-control- dark-form-control libSelect"
                                />
                              );
                            }}
                          />

                          {errorsBusiness.productCategories &&
                            errorsBusiness.productCategories.type ===
                              "required" && (
                              <span className="text-danger">
                                {t("This field is required")}
                              </span>
                            )}
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-6 col-xl-4 col01">
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

                      <div className="col-md-6 col-lg-6 col-xl-4">
                        <div className="form-group">
                          <label className="dark-label mtm-5">
                            {t("Select Native Currency")}{" "}
                            <span className="required">*</span>
                          </label>
                          <div className="form-group ">
                            <select
                              className="form-select form-control dark-form-control"
                              name="currency"
                              {...registerBusiness("currency", {
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
                            {errorsBusiness.currency &&
                              errorsBusiness.currency.type === "required" && (
                                <span className="text-danger">
                                  {t("This field is required")}
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-6 col-xl-4 col04">
                        <div className="form-group">
                          <label className="dark-label mtm-5">
                            {t("Select Languages")}{" "}
                            <span className="required">*</span>
                          </label>
                          <div className="lang-group">
                            <div className="custom_radio">
                              <input
                                type="radio"
                                id="English"
                                {...registerBusiness("language", {
                                  required: true,
                                })}
                                name="language"
                                value="English"
                              />
                              <label htmlFor="English">
                                {t("English - EN")}
                              </label>
                            </div>
                            <div className="custom_radio">
                              <input
                                type="radio"
                                id="Arabic"
                                {...registerBusiness("language", {
                                  required: true,
                                })}
                                name="language"
                                value="Arabic"
                              />
                              <label htmlFor="Arabic">{t("Arabic")}</label>
                            </div>
                            <div className="custom_radio">
                              <input
                                type="radio"
                                id="Turkish"
                                {...registerBusiness("language", {
                                  required: true,
                                })}
                                name="language"
                                value="Turkish"
                              />
                              <label htmlFor="Turkish">{t("Turkish")}</label>
                            </div>

                            {errorsBusiness.language &&
                              errorsBusiness.language.type === "required" && (
                                <span className="text-danger">
                                  {t("This field is required")}
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-6 col-xl-4">
                        <div className="form-group ">
                          <label htmlFor="country" className="dark-label">
                            {t("Storefront Subscription Needed")}{" "}
                            {/* <span className="required">*</span> */}
                          </label>
                          <div className="inline-radio">
                            <div className="custom_radio">
                              <input
                                type="radio"
                                id="Yes"
                                name="storefrontSubscription"
                                value="true"
                                {...registerBusiness("storefrontSubscription", {
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
                                value="false"
                                {...registerBusiness("storefrontSubscription", {
                                  required: false,
                                })}
                              />
                              <label htmlFor="No">{t("No")}</label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row section-gap"></div>
                  </>
                  <div className="password_change_banner">
                    <div className="infomation_title_banner">
                      <div className="col-9 col-sm-6">
                        <h3 className="innerSub_title">
                          {t("Warehouse Details")}
                        </h3>
                      </div>
                    </div>
                    <div className="profile_information_block">
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
                      {warehouseArray &&
                        warehouseArray.length > 0 &&
                        warehouseArray.map((warehouse, index) => (
                          <div className="row">
                            {warehouseArray.length > 1 && (
                              <div class="col-md-12">
                                <hr class="hr-mb" />
                                <div className="Warehouse_banner">
                                  <a
                                    href="javascript:void(0);"
                                    onClick={() =>
                                      warehouseDeleteHandler(
                                        warehouse.id,
                                        warehouse?._id
                                      )
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
                            <div className="col-md-6">
                              <div className="form-group ">
                                <label className="form-label">
                                  {t("Warehouse Name/Label")}{" "}
                                  <span className="required">*</span>
                                </label>
                                {/* <input type="hidden"   {...registerBusiness(`warehouseName${warehouse.id}`,{ required: true})}/> */}
                                <input
                                  type="text"
                                  name="warehousename"
                                  placeholder=""
                                  className="form-control dark-form-control   "
                                  defaultValue=""
                                  {...registerBusiness(
                                    `warehouseName${warehouse.id}`,
                                    { required: true }
                                  )}
                                />
                                {errorsBusiness[
                                  `warehouseName${warehouse.id}`
                                ] &&
                                  errorsBusiness[`warehouseName${warehouse.id}`]
                                    .type === "required" && (
                                    <div className="text-danger">
                                      {t("This field is required")}
                                    </div>
                                  )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label className="form-label">
                                  {t("Warehouse Location Country & city")}{" "}
                                  <span className="required">*</span>
                                </label>
                                <select
                                  name="warehouseCountry"
                                  className="form-select form-control dark-form-control"
                                  aria-label="Default select example"
                                  {...registerBusiness(
                                    `warehouseCountry${warehouse.id}`,
                                    { required: true }
                                  )}
                                >
                                  <option value="">Select</option>
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
                                {errorsBusiness[
                                  `warehouseCountry${warehouse.id}`
                                ] &&
                                  errorsBusiness[
                                    `warehouseCountry${warehouse.id}`
                                  ].type === "required" && (
                                    <div className="text-danger">
                                      {t("This field is required")}
                                    </div>
                                  )}
                              </div>
                            </div>
                            <div className="col-md-12">
                              <div className="form-group">
                                <label className="form-label">
                                  {t("Warehouse Address")}{" "}
                                  <span className="required">*</span>
                                </label>
                                <GooglePlace
                                  saveAddress={saveWarehouswHandler}
                                  index={warehouse.id}
                                  defaultAddress={
                                    warehouseDefaultAddress[warehouse.id]
                                  }
                                  setValue={setValueBusiness}
                                />
                                {errorsBusiness[
                                  `warehouseAddress${warehouse.id}`
                                ] &&
                                  errorsBusiness[
                                    `warehouseAddress${warehouse.id}`
                                  ].type === "required" && (
                                    <span className="text-danger">
                                      {t("This field is required")}
                                    </span>
                                  )}
                                {errorsBusiness[
                                  `warehouseAddress${warehouse.id}`
                                ] &&
                                  errorsBusiness[
                                    `warehouseAddress${warehouse.id}`
                                  ].type === "manual" && (
                                    <span className="text-danger">
                                      {t(
                                        "Please enter valid warehouse address"
                                      )}
                                    </span>
                                  )}
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
                                  {...registerBusiness(
                                    `street${warehouse.id}`,
                                    {
                                      required: false,
                                    }
                                  )}
                                />
                                {/* {errors[`street${warehouse.id}`] &&
                                  errors[`street${warehouse.id}`].type ===
                                    "required" && (
                                    <span className="text-danger">
                                      {t("This field is required")}
                                    </span>
                                  )} */}

                                {/* {errors.street &&
                                errors.street.type === "required" && (
                                  <span className="invalid-feedback">
                                    {t("This field is required")}
                                  </span>
                                )} */}
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
                                  // {...registerBusiness("zipcode", { required: true })}
                                  {...registerBusiness(
                                    `zipcode${warehouse.id}`,
                                    {
                                      required: false,
                                      pattern: {
                                        value: /^\d*[1-9]\d*$/,
                                        message: "Please enter valid pin code",
                                      },
                                      setValueAs: (v) => v.trim(),
                                    }
                                  )}
                                />

                                {errorsBusiness[`zipcode${warehouse.id}`] &&
                                  errorsBusiness[`zipcode${warehouse.id}`]
                                    .type === "pattern" && (
                                    <span className="text-danger">
                                      {t("Please enter valid pin code")}
                                    </span>
                                  )}
                                {/* {errors[`zipcode${warehouse.id}`] &&
                                  errors[`zipcode${warehouse.id}`].type ===
                                    "required" && (
                                    <span className="text-danger">
                                      {t("This field is required")}
                                    </span>
                                  )} */}

                                {/* {errors.zipcode &&
                                errors.zipcode.type === "required" && (
                                  <span className="text-danger">
                                    {t("This field is required")}
                                  </span>
                                )} */}
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
                                  {...registerBusiness(`city${warehouse.id}`, {
                                    required: false,
                                    setValueBusiness: (v) => v.trim(),
                                  })}
                                  // {...registerBusiness("city", {
                                  //   required: true,
                                  //   setValueBusiness: (v) => v.trim(),
                                  // })}
                                />
                                {/* {errors[`city${warehouse.id}`] &&
                                  errors[`city${warehouse.id}`].type ===
                                    "required" && (
                                    <span className="text-danger">
                                      {t("This field is required")}
                                    </span>
                                  )} */}

                                {/* {errors.city &&
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
                                )} */}
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
                                  // {...registerBusiness("state", {
                                  //   required: true,
                                  //   setValueBusiness: (v) => v.trim(),
                                  // })}
                                  {...registerBusiness(`state${warehouse.id}`, {
                                    required: false,
                                    setValueBusiness: (v) => v.trim(),
                                  })}
                                />
                                {/* {errors[`state${warehouse.id}`] &&
                                  errors[`state${warehouse.id}`].type ===
                                    "required" && (
                                    <span className="text-danger">
                                      {t("This field is required")}
                                    </span>
                                  )} */}

                                {/* {errors.state &&
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
                                )} */}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="col-12 mt-2">
                    <button type="submit" className="sms_alert_btn">
                      {t("Save Changes")}
                    </button>
                  </div>
                </form>
                {/*  */}
              </div>
              <div
                className="tab-pane fade"
                id="notification-settings-tab-pane"
                role="tabpanel"
                aria-labelledby="notification-settings-tab"
                tabIndex={0}
              >
                <div className="my_address">
                  <div className="infomation_title_banner">
                    <h3 className="info_title">{t("Notifcations Settings")}</h3>
                  </div>
                  <div className="notifcations_alerts">
                    <div className="row">
                      <div className="col-md-8 col-lg-9 ">
                        <div className="sms_title_banner">
                          <h4 className="sms_title">My SMS Alerts Settings </h4>
                          <p className="sms_sub_title">
                            You will receive SMS Alerts between 7:30 AM and 9:30
                            PM Indian Standard Time when your package is
                            shipped, out for delivery, delivered, encounters a
                            problem or assisting you on payment failures. SMS
                            Alerts will be sent to the following mobile number:{" "}
                            <a href="#!" className="sms_learn">
                              Learn more
                            </a>
                          </p>
                        </div>
                      </div>
                      <div className="col-md-4 col-lg-3 alerts_btnss">
                        <div className="alerts_btn">
                          <a href="#!" className="sms_alert_btn">
                            Enable Alerts
                          </a>
                        </div>
                      </div>
                      <div className="row mt-3">
                        <div className="col-lg-2 col-md-4 col-sm-3 mobile_number_input">
                          <span className="mobile_num">
                            Change Mobile Number:{" "}
                          </span>
                        </div>
                        <div className="col-lg-1 col-md-2 col-sm-3">
                          <div className="form-group ">
                            <input
                              type="text"
                              name="number"
                              className="form-control dark-form-control"
                              placeholder={+11}
                              defaultValue=""
                            />
                          </div>
                        </div>
                        <div className="col-lg-4 col-md-4 col-sm-6">
                          <div className="form-group ">
                            <input
                              type="text"
                              name="number"
                              className="form-control dark-form-control"
                              placeholder="202-555-0114"
                              defaultValue=""
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="notifcations_alerts">
                      <div className="row">
                        <div className="col-md-8 col-lg-9">
                          <div className="sms_title_banner">
                            <h4 className="sms_title">Email Notifications </h4>
                            <p className="sms_sub_title">
                              You will receive SMS Alerts between 7:30 AM and
                              9:30 PM Indian Standard Time when your package is
                              shipped, out for delivery, delivered, encounters a
                              problem or assisting you on payment failures. SMS
                              Alerts will be sent to the following mobile
                              number:{" "}
                              <a href="#!" className="sms_learn">
                                Learn more
                              </a>
                            </p>
                          </div>
                        </div>
                        <div className="col-md-4 col-lg-3 alerts_btnss">
                          <div className="alerts_btn">
                            <a
                              href="#!"
                              className="sms_alert_btn sms_active_btns"
                            >
                              Disable Notifications
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="notifcations_alerts">
                      <div className="row">
                        <div className="col-md-8 col-lg-9 ">
                          <div className="sms_title_banner">
                            <h4 className="sms_title">Push Notifications </h4>
                            <p className="sms_sub_title">
                              You will receive SMS Alerts between 7:30 AM and
                              9:30 PM Indian Standard Time when your package is
                              shipped, out for delivery, delivered, encounters a
                              problem or assisting you on payment failures. SMS
                              Alerts will be sent to the following mobile
                              number:{" "}
                              <a href="#!" className="sms_learn">
                                Learn more
                              </a>
                            </p>
                          </div>
                        </div>
                        <div className="col-md-4 col-lg-3 alerts_btnss">
                          <div className="alerts_btn">
                            <a href="#!" className="sms_alert_btn">
                              Enable Notifications
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/*  */}
                </div>
              </div>
              <div
                className="tab-pane fade"
                id="banking-information-tab-pane"
                role="tabpanel"
                aria-labelledby="banking-information-tab"
                tabIndex={0}
              >
                {/* Bancking Information*/}
                <form onSubmit={handleSubmitBank(onSubmitBank)}>
                  <div className="my_address bankInfo">
                    <div className="infomation_title_banner">
                      <h3 className="info_title">{t("Banking Information")}</h3>
                    </div>
                    <div className="profile_information_banner">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group ">
                            <label className="form-label">
                              {t("IBA Number")}{" "}
                              <span className="required">*</span>
                            </label>
                            <input
                              type="text"
                              name="ibaNumber"
                              placeholder=""
                              className="form-control dark-form-control"
                              defaultValue=""
                              {...registerBank("ibaNumber", { required: true })}
                            />
                            {errorsBank.ibaNumber &&
                              errorsBank.ibaNumber?.type === "required" && (
                                <span className="text-danger">
                                  {t("This field is required")}
                                </span>
                              )}
                          </div>
                        </div>

                        {/* <div className="col-md-6">
                            <div className="form-group ">
                              <label className="form-label">Account Name</label>
                              <input
                                type="text"
                                name="accountname"
                                placeholder=""
                                className="form-control dark-form-control"
                                defaultValue=""
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label className="form-label">Bank Account</label>
                              <select
                                className="form-select form-control dark-form-control"
                                aria-label="Default select example"
                              >
                                <option selected="">Select</option>
                                <option value={1}>One</option>
                                <option value={2}>Two</option>
                                <option value={3}>Three</option>
                              </select>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label className="form-label">
                                Account Number
                              </label>
                              <input
                                type="text"
                                id="accountnumber"
                                name="lname"
                                placeholder=""
                                className="form-control dark-form-control"
                                defaultValue=""
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label className="form-label">Expiry Date</label>
                              <input
                                type="text"
                                name="expirydate"
                                placeholder=""
                                className="form-control dark-form-control"
                                defaultValue=""
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label className="form-label">Tin number</label>
                              <input
                                type="text"
                                name="tnumber"
                                placeholder=""
                                className="form-control dark-form-control"
                                defaultValue=""
                              />
                            </div>
                          </div> */}
                      </div>
                    </div>
                  </div>
                  <div className="col-12 mt-2">
                    <button type="submit" className="sms_alert_btn">
                      {t("Save Changes")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
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
                          {...registerBusiness(`categoryRequest_${data.id}`)}
                        />
                        <button
                          className="btn btn-bg-danger ml-2 mt-1"
                          type="button"
                          onClick={() => deleteCategoryRequestHandler(data.id)}
                        >
                          <i class="fas fa-trash-alt"></i>
                        </button>
                      </div>
                      {errorsBusiness[`categoryRequest_${data.id}`] && (
                        <span className="text-danger">
                          {t(
                            errorsBusiness[`categoryRequest_${data.id}`].message
                          )}
                        </span>
                      )}
                    </div>
                  </>
                ))}
              <div className="login_button">
                <button
                  type="submit"
                  class="submit_button w-100"
                  onClick={() => {
                    setIsCategoryRequest(true),
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
    </Layout>
  );
};

export async function getServerSideProps(context) {
  await createAxiosCookies(context);

  const [vendor, countries, currencies, categories] = await Promise.all([
    getProfileData(),
    getCountries(),
    getCurrencies(),
    getCategories(),
  ]);

  return {
    props: {
      protected: true,
      userTypes: ["vendor"],
      vendor,
      countries,
      currencies,
      categories,
      locales: {
        ...require(`../../locales/index/${context.locale}.json`),
      },
    },
  };
}

export default MyProfile;
