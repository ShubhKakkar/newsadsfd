import React, { useEffect, useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import moment from "moment";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import GooglePlace from "../GooglePlace/GooglePlace";
import {
  Input,
  SelectInput,
  RenderInputFields,
  SubmitButton,
  ReactSelectInput,
} from "../Form/Form";
import { API } from "../../constant/api";

const Edit = (props) => {
  const { id } = props.match.params;
  const history = useHistory();
  const pdfArray = ["application/pdf"];
  const imgArray = ["image/png", "image/jpeg", "image/jpg"];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    unregister,
    setError,
    control,
    clearErrors,
  } = useForm();

  const [image, setImage] = useState("");
  const [allCountry, setAllCountry] = useState([]);
  const [countryCodes, setCountryCodes] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState([]);
  const [isProfilePicRemove, setIsProfilePicRemove] = useState(false);
  const [vendorDefaultAddress, setVendorDefaultAddress] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [warehouseId, setWarehouseId] = useState(0);
  const [warehouseArray, setWarehouseArray] = useState([]);
  const [productCategoriesArray, setProductCategoriesArray] = useState([]);
  const [selectedServeCountry, setSelectedServeCountry] = useState([]);
  const [selectedProductCategories, setSelectedProductCategories] = useState(
    []
  );
  const [bussinessDocument, setBussinessDocument] = useState([]);
  const [removeWarehouse, setRemoveWarehouse] = useState([]);
  const [apiInvokeCount, setApiInvokeCount] = useState(0);
  // const [addWarehouse, setAddWarehouse] = useState([]);
  // const [updateWarehouse, setUpdateWarehouse] = useState([]);

  const { response: responseVendor, request: requestVendor } = useRequest();

  const { response, request } = useRequest();
  const { response: responseCountries, request: requestCountries } =
    useRequest();
  const { response: responseCurrencies, request: requestCurrencies } =
    useRequest();
  const {
    response: responseProductCategories,
    request: requestProductCategories,
  } = useRequest();

  useEffect(() => {
    if (id) {
      document.title = "Edit Vendor - Noonmar";
      requestCountries("GET", `country/all?page=1&isActive=${true}`);
      requestProductCategories(
        "GET",
        "product-category/all?page=1&isActive=true"
      );
      requestCurrencies("GET", `currency/all?page=1&per_page=100&sortBy=name`);
    }
  }, [id]);

  useEffect(() => {
    if (apiInvokeCount === 3) {
      requestVendor("GET", `vendor/${id}`);
    }
  }, [apiInvokeCount]);

  useEffect(() => {
    if (responseCurrencies) {
      if (responseCurrencies.status && responseCurrencies.currencies) {
        setCurrencies(
          responseCurrencies.currencies.map((data) => ({
            label: `${data.code} (${data.sign})`,
            value: data._id,
          }))
        );
        setApiInvokeCount((prev) => prev + 1);
      }
    }
  }, [responseCurrencies]);

  useEffect(() => {
    if (responseProductCategories) {
      if (responseProductCategories.status && responseProductCategories.data) {
        setProductCategoriesArray(
          responseProductCategories.data.map((data) => ({
            label: data.name,
            value: data._id,
          }))
        );
        setApiInvokeCount((prev) => prev + 1);
      }
    }
  }, [responseProductCategories]);

  useEffect(() => {
    if (responseCountries) {
      if (responseCountries.status && responseCountries.data) {
        setAllCountry(
          responseCountries.data.map((data) => ({
            label: data.name,
            value: data._id,
          }))
        );

        setCountryCodes(
          responseCountries.data.map((data) => ({
            label: "+" + data.countryCode,
            value: "+" + data.countryCode,
          }))
        );
        setApiInvokeCount((prev) => prev + 1);
      }
    }
  }, [responseCountries]);

  useEffect(() => {
    if (responseVendor) {
      const {
        businessName,
        businessEmail,
        businessCountry,
        businessContact,
        productCategories,
        serveCountries,
        currency,
        language,
        storefrontSubscription,
        firstName,
        lastName,
        countryCode,
        contact,
        email,
        dob,
        profilePic,
        warehouseData,
        businessDoc,
        address,
        location,
        ibaNumber,
      } = responseVendor.vendor;
      if (profilePic) {
        setImage(`${API.PORT}/${profilePic}`);
      }
      if (warehouseData.length > 0) {
        warehouseData.map((data, i) => {
          setWarehouseArray((prev) => [...prev, { id: i, _id: data._id }]);
          setValue(`warehouseName_${i}`, data.name);
          setValue(`city_${i}`, data.city);
          setValue(`state_${i}`, data.state);
          setValue(`street_${i}`, data.street);
          setValue(`country_${i}`, data.country);
          setValue(`zipcode_${i}`, data.zipCode);
          setValue(`address_${i}`, data.address);
          setDefaultAddress((prev) => [...prev, data.address]);
          setValue(`geoLocation_${i}`, data.geoLocation?.coordinates);
          setWarehouseId((prev) => prev + 1);
        });
      }
      if (productCategories.length > 0) {
        const categories = productCategories.map((data) => data.value);
        setValue("productCategories", categories);
      }
      if (serveCountries.length > 0) {
        const countries = serveCountries.map((data) => data.value);
        setValue("serveCountries", countries);
      }
      setSelectedProductCategories(productCategories);
      setSelectedServeCountry(serveCountries);
      setValue("businessName", businessName);
      setValue("businessEmail", businessEmail);
      setValue("businessContact", businessContact);
      setValue("businessCountry", businessCountry);
      setValue("firstName", firstName);
      setValue("lastName", lastName);
      setValue("countryCode", countryCode);
      setValue("storefrontSubscription", storefrontSubscription);
      setValue("currency", currency);
      if (dob) {
        setValue("dob", moment(dob).format("YYYY-MM-DD"));
      }
      setValue("email", email);
      setValue("contact", contact);
      setValue("language", language);
      setValue("ibaNumber", ibaNumber);
      setValue("geoLocation", location?.coordinates);
      setValue("address", address);
      setVendorDefaultAddress(address);
      setBussinessDocument(businessDoc);
    }
  }, [responseVendor]);

  useEffect(() => {
    if (response) {
      toast.success("Vendor has been updated successfully.");
      history.push("/vendors");
    }
  }, [response]);

  const onSubmit = (data) => {
    let {
      businessName,
      businessEmail,
      businessCountry,
      businessContact,
      productCategories,
      serveCountries,
      currency,
      language,
      storefrontSubscription,
      businessDoc,
      firstName,
      lastName,
      countryCode,
      contact,
      email,
      profilePic,
      address,
      geoLocation,
      ibaNumber,
    } = data;

    const formData = new FormData();

    let isError = false;
    let addWarehouse = [];
    let updateWarehouse = [];
    warehouseArray.forEach((warehouse) => {
      if (!data[`address_${warehouse.id}`]) {
        setError("address", {
          type: "manual",
        });
        isError = true;
      }

      if (!data[`geoLocation_${warehouse.id}`]) {
        setError("address", {
          type: "manual1",
        });
        isError = true;
      }

      if (warehouse._id) {
        updateWarehouse.push({
          name: data[`warehouseName_${warehouse.id}`],
          geoLocation: {
            coordinates: data[`geoLocation_${warehouse.id}`],
            type: "Point",
          },
          address: data[`address_${warehouse.id}`],
          country: data[`country_${warehouse.id}`],
          city: data[`city_${warehouse.id}`],
          state: data[`state_${warehouse.id}`],
          street: data[`street_${warehouse.id}`],
          zipCode: data[`zipcode_${warehouse.id}`],
          id: warehouse._id,
        });
      } else {
        addWarehouse.push({
          name: data[`warehouseName_${warehouse.id}`],
          geoLocation: {
            coordinates: data[`geoLocation_${warehouse.id}`],
            type: "Point",
          },
          address: data[`address_${warehouse.id}`],
          country: data[`country_${warehouse.id}`],
          city: data[`city_${warehouse.id}`],
          state: data[`state_${warehouse.id}`],
          street: data[`street_${warehouse.id}`],
          zipCode: data[`zipcode_${warehouse.id}`],
        });
      }
    });

    if (profilePic && profilePic[0]) {
      const profilePicType = profilePic[0].type;
      if (!imgArray.includes(profilePicType)) {
        toast.error("Please select inage only in Profile pic");
        isError = true;
        return;
      } else {
        formData.append("profilePic", profilePic[0]);
      }
    }

    if (businessDoc.length > 0) {
      for (let i = 0; i < businessDoc.length; i++) {
        if (!pdfArray.includes(businessDoc[i].type)) {
          toast.error("Please select pdf only in upload business document");
          isError = true;
          break;
        } else {
          formData.append("businessDoc", businessDoc[i]);
        }
      }
    }

    if (isError) {
      return;
    }

    if (!address) {
      setError("location", {
        type: "manual",
      });
      return;
    }

    if (!geoLocation) {
      setError("location", {
        type: "manual1",
      });
      return;
    }
    let location = JSON.stringify({
      coordinates: geoLocation,
      type: "Point",
    });
    productCategories = JSON.stringify(productCategories);
    serveCountries = JSON.stringify(serveCountries);

    formData.append("businessName", businessName);
    formData.append("businessEmail", businessEmail);
    formData.append("businessCountry", businessCountry);
    formData.append("businessContact", businessContact);
    formData.append("productCategories", productCategories);
    formData.append("serveCountries", serveCountries);
    formData.append("currency", currency);
    formData.append("language", language);
    formData.append("storefrontSubscription", storefrontSubscription);
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("countryCode", countryCode);
    formData.append("contact", contact);
    formData.append("location", location);
    formData.append("address", address);
    formData.append("removeWarehouse", JSON.stringify(removeWarehouse));
    formData.append("addWarehouse", JSON.stringify(addWarehouse));
    formData.append("updateWarehouse", JSON.stringify(updateWarehouse));
    formData.append("id", id);
    formData.append("ibaNumber", ibaNumber);
    formData.append("isProfilePicRemove", isProfilePicRemove);

    // return;
    request("PUT", "vendor", formData);
  };

  const handleChangeServeCountry = (event) => {
    setSelectedServeCountry(event);
    if (event && event.length > 0) {
      let countryids = event.map((obj) => obj.value);
      setError("serveCountries", "");
      setValue("serveCountries", countryids);
    } else {
      setValue("serveCountries", null);
    }
  };
  const handleChangeProductCategories = (event) => {
    setSelectedProductCategories(event);
    if (event && event.length > 0) {
      let countryids = event.map((obj) => obj.value);
      setError("productCategories", "");
      setValue("productCategories", countryids);
    } else {
      setValue("productCategories", null);
    }
  };

  const displayImageHandler = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]));
    setIsProfilePicRemove(false);
  };
  const handleRemoveMedia = () => {
    setValue("profilePic", "");
    setIsProfilePicRemove(true);
    setImage("");
  };

  const InputFields = [
    [
      {
        Component: Input,
        label: "Business Name",
        type: "text",
        name: "businessName",
        registerFields: {
          required: true,
          // pattern: /^[A-Za-z ]+$/,
          setValueAs: (v) => v.trim(),
        },
        // registerFieldsFeedback: {
        //   pattern: "Name can only contain letters.",
        // },
      },
      {
        Component: SelectInput,
        label: "Country",
        name: "businessCountry",
        registerFields: {
          required: true,
        },
        children: allCountry && allCountry.length > 0 && (
          <>
            <option value="">{"Select an option"}</option>
            {allCountry.map((obj) => (
              <option key={obj.value} value={obj.value}>
                {" "}
                {obj.label}
              </option>
            ))}
          </>
        ),
      },
      {
        Component: Input,
        label: "Phone Number",
        type: "number",
        name: "businessContact",
        registerFields: {
          required: true,
          pattern: /^[0-9]{10}$/gm,
        },
        registerFieldsFeedback: {
          pattern: "This field must be a valid phone number.",
        },
      },
      {
        Component: Input,
        label: "Email",
        type: "email",
        name: "businessEmail",
        registerFields: {
          required: true,
          pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        },
        registerFieldsFeedback: {
          pattern: "The email field must be a valid email address.",
        },
      },
    ],
  ];

  const InputFieldsWarehouse = (id) => [
    [
      {
        Component: Input,
        label: "Warehouse Name / Label",
        type: "text",
        name: `warehouseName_${id}`,
        registerFields: {
          required: true,
          // pattern: /^[A-Za-z ]+$/,
          setValueAs: (v) => v.trim(),
        },
        // registerFieldsFeedback: {
        //   pattern: "Name can only contain letters.",
        // },
      },
      {
        Component: SelectInput,
        label: "Country",
        name: `country_${id}`,
        registerFields: {
          required: true,
        },
        children: allCountry && allCountry.length > 0 && (
          <>
            <option value="">{"Select an option"}</option>
            {allCountry.map((obj) => (
              <option key={obj.value} value={obj.value}>
                {" "}
                {obj.label}
              </option>
            ))}
          </>
        ),
      },
    ],
    [
      {
        Component: Input,
        label: "Street",
        type: "text",
        name: `street_${id}`,
        registerFields: {
          required: false,
          // pattern: /^[A-Za-z ]+$/,
        },
        // registerFieldsFeedback: {
        //   pattern: "Street can only contain letters.",
        // },
      },
      {
        Component: Input,
        label: "City",
        type: "text",
        name: `city_${id}`,
        registerFields: {
          required: false,
          // pattern: /^[A-Za-z ]+$/,
        },
        // registerFieldsFeedback: {
        //   pattern: "City can only contain letters.",
        // },
      },
    ],
    [
      {
        Component: Input,
        label: "State",
        type: "text",
        name: `state_${id}`,
        registerFields: {
          required: false,
          // pattern: /^[A-Za-z ]+$/,
        },
        // registerFieldsFeedback: {
        //   pattern: "State can only contain letters.",
        // },
      },
      {
        Component: Input,
        label: "Zip Code",
        type: "number",
        name: `zipcode_${id}`,
        registerFields: {
          required: false,
        },
      },
    ],
  ];

  const InputFieldsOtherDetail = [
    [
      {
        Component: ReactSelectInput,
        label: "Product Categories you deal with",
        type: "text",
        name: "productCategories",
        options: productCategoriesArray ?? [],
        isMultiple: true,
        registerFields: {
          required: true,
          // pattern: /^[A-Za-z ]+$/,
        },
        handleChange: handleChangeProductCategories,
        selectedOption: selectedProductCategories,
      },
      {
        Component: ReactSelectInput,
        label: "Select countries you want to serve",
        type: "text",
        name: "serveCountries",
        options: allCountry,
        isMultiple: true,
        registerFields: {
          required: true,
          // pattern: /^[A-Za-z ]+$/,
        },
        handleChange: handleChangeServeCountry,
        selectedOption: selectedServeCountry,
      },
    ],
    [
      {
        Component: SelectInput,
        label: "Select Native Currency",
        name: "currency",
        registerFields: {
          required: true,
        },
        children: (
          <>
            <option value="">Select Currency</option>
            {currencies.length > 0 &&
              currencies.map((currency) => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
          </>
        ),
      },
      {
        Component: Input,
        label: "Upload Business Document (PDF ONLY)",
        name: "businessDoc",
        type: "file",
        registerFields: {
          required: false,
        },
        inputData: {
          accept: "application/pdf",
        },
        children:
          bussinessDocument &&
          bussinessDocument.map((item, index) => {
            return (
              <>
                <a href={`${API.PORT}/${item}`} target="_blank">
                  <img
                    src="/assets/img/pdf-img.png"
                    width={50}
                    height={50}
                    alt=""
                    style={{ cursor: "pointer", marginBottom: "10px" }}
                  />
                </a>
                {/* <Link to="#" onClick={handleRemoveMedia} className="mx-3">
              Remove
            </Link> */}
              </>
            );
          }),
      },
    ],
    [
      {
        Component: SelectInput,
        label: "Storefront Subscription Needed",
        name: "storefrontSubscription",
        registerFields: {
          required: true,
        },
        children: (
          <>
            <option value="">Select</option>
            <option value={true}>Yes</option>
            <option value={false}>No</option>
          </>
        ),
      },
    ],
  ];

  const InputFieldsPersonalDetail = [
    [
      {
        Component: Input,
        label: "First Name",
        type: "text",
        name: `firstName`,
        registerFields: {
          required: true,
          // pattern: /^[A-Za-z ]+$/,
          setValueAs: (v) => v.trim(),
        },
        // registerFieldsFeedback: {
        //   pattern: "First Name can only contain letters.",
        // },
      },
      {
        Component: Input,
        label: "Last Name",
        type: "text",
        name: `lastName`,
        registerFields: {
          required: true,
          // pattern: /^[A-Za-z ]+$/,
          setValueAs: (v) => v.trim(),
        },
        // registerFieldsFeedback: {
        //   pattern: "Last Name can only contain letters.",
        // },
      },
    ],
    [
      {
        Component: Input,
        label: "Email",
        type: "text",
        name: `email`,
        registerFields: {
          required: true,
          pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        },
        registerFieldsFeedback: {
          pattern: "The email field must be a valid email address.",
        },
      },
      // {
      //   Component: Input,
      //   label: "Country Code",
      //   type: "text",
      //   name: `countryCode`,
      //   registerFields: {
      //     required: true,
      //     // pattern: /^[A-Za-z ]+$/,
      //   },
      //   registerFieldsFeedback: {
      //     pattern: "Country Code can only contain letters.",
      //   },
      // },
      {
        Component: SelectInput,
        label: "Country Code",
        name: "countryCode",
        registerFields: {
          required: true,
        },
        children: countryCodes && countryCodes.length > 0 && (
          <>
            <option value="">{"Select an option"}</option>
            {countryCodes.map((obj, idx) => (
              <option key={idx} value={obj.value}>
                {" "}
                {obj.label}
              </option>
            ))}
          </>
        ),
      },
    ],
    [
      {
        Component: Input,
        label: "Contact Number",
        type: "number",
        name: `contact`,
        registerFields: {
          required: true,
          pattern: /^[0-9]{10}$/gm,
        },
        registerFieldsFeedback: {
          pattern: "This field must be a valid phone number.",
        },
      },
      // {
      //   Component: Input,
      //   label: "DOB",
      //   type: "date",
      //   name: `dob`,
      //   registerFields: {
      //     required: true,
      //     // pattern: /^[A-Za-z ]+$/,
      //   },
      //   inputData: {
      //     max: moment().format("YYYY-MM-DD"),
      //   },
      //   registerFieldsFeedback: {
      //     pattern: "Contact number can only contain letters.",
      //   },
      // },
    ],
    [
      {
        Component: Input,
        label: "Profile Pic",
        type: "file",
        name: "profilePic",
        registerFields: {
          required: false,
          setValueAs: (v) => v.trim(),
        },
        registerFieldsFeedback: {
          // pattern: "The zip code field must be a valid zip code.",
        },
        handleMedia: displayImageHandler,
        isMedia: true,
        accept: ".png, .jpg, .jpeg",
        control,
        children: image && (
          <>
            <img
              src={image}
              width={150}
              height={100}
              alt=""
              style={{ cursor: "pointer", marginBottom: "10px" }}
              data-fancybox
            />
            <Link to="#" onClick={handleRemoveMedia} className="mx-3">
              Remove
            </Link>
          </>
        ),
      },
    ],
  ];

  const InputFieldsBankDetail = [
    [
      {
        Component: Input,
        label: "IBA Number",
        type: "text",
        name: "ibaNumber",
        registerFields: {
          required: true,
        },
      },
    ],
  ];

  const warehouseAddHandler = () => {
    setWarehouseArray((prev) => [...prev, { id: warehouseId }]);
    setWarehouseId((prev) => prev + 1);
  };
  const warehouseDeleteHandler = (id, _id) => {
    setWarehouseArray([...warehouseArray].filter((data) => data.id != id));
    if (_id) {
      setRemoveWarehouse((prev) => [...prev, _id]);
    }
    unregister(`address_${id}`);
    unregister(`geoLocation_${id}`);
  };

  const saveAddressHandler = (address, geoLocation, key) => {
    clearErrors("address");
    setValue(`address_${key}`, address);
    setValue(`geoLocation_${key}`, [geoLocation.lng, geoLocation.lat]);
  };
  const saveLocationHandler = (address, geoLocation) => {
    clearErrors("location");
    setValue("address", address);
    setValue("geoLocation", [geoLocation.lng, geoLocation.lat]);
  };

  const getCurrentLocationHandler = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition();
    } else {
    }
  };

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Edit Vendor"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: { pathname: "/vendors" /*backPageNum: page */ },
            name: "Back To Vendors",
          },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom">
            <div class="card-header">
              <h3 class="card-title">Edit Vendor</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-xl-12">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div class="accordion" id="accordionExample">
                      <div class="card">
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
                              Business Details
                            </button>
                          </h2>
                        </div>

                        <div
                          id="collapseOne"
                          class="collapse show"
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

                      <div class="card">
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
                              Warehouse Details
                            </button>
                          </h2>
                          <button
                            className="btn btn-primary"
                            onClick={() => warehouseAddHandler()}
                            type="button"
                          >
                            Add more warehouse
                          </button>
                        </div>

                        <div
                          id="collapseTwo"
                          class="collapse show"
                          aria-labelledby="headingTwo"
                          data-parent="#accordionExample"
                        >
                          {warehouseArray.length > 0 &&
                            warehouseArray.map((warehouse) => (
                              <div class="card-body" key={warehouse.id}>
                                <RenderInputFields
                                  InputFields={InputFieldsWarehouse(
                                    warehouse.id
                                  )}
                                  errors={errors}
                                  register={register}
                                />
                                <div className="form-group">
                                  <div className="position-relative">
                                    <label>
                                      Location
                                      <span className="text-danger">*</span>
                                    </label>
                                    <GooglePlace
                                      saveAddress={saveAddressHandler}
                                      index={warehouse.id}
                                      defaultAddress={
                                        defaultAddress[warehouse.id]
                                      }
                                      setValue={setValue}
                                      // {...register("location", {
                                      //   required: true,
                                      // })}
                                    />
                                    {errors.location?.type === "required" && (
                                      <p className="invalid-feedback">
                                        The address field is required.
                                      </p>
                                    )}
                                    {errors.location?.type === "manual1" && (
                                      <p className="invalid-feedback">
                                        The address field is invalid.
                                      </p>
                                    )}
                                    <span
                                      className="inputicon"
                                      onClick={getCurrentLocationHandler}
                                    ></span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  className="btn btn-danger"
                                  onClick={() =>
                                    warehouseDeleteHandler(
                                      warehouse.id,
                                      warehouse?._id
                                    )
                                  }
                                >
                                  Delete
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>
                      <div class="card">
                        <div class="card-header" id="headingOne">
                          <h2 class="mb-0">
                            <button
                              class="btn btn-link btn-block text-left"
                              type="button"
                              data-toggle="collapse"
                              data-target="#collapseThree"
                              aria-expanded="true"
                              aria-controls="collapseThree"
                            >
                              OTHER DETAILS
                            </button>
                          </h2>
                        </div>

                        <div
                          id="collapseThree"
                          class="collapse show"
                          aria-labelledby="headingOne"
                          data-parent="#accordionExample"
                        >
                          <div class="card-body">
                            <RenderInputFields
                              InputFields={InputFieldsOtherDetail}
                              errors={errors}
                              register={register}
                            />
                            <div className="form-group">
                              <label>Select language:</label>
                              <div className="radio-inline">
                                <label class="radio" htmlFor="English">
                                  <input
                                    type="radio"
                                    id="English"
                                    name="language"
                                    value="English"
                                    {...register("language", {
                                      required: true,
                                    })}
                                  />
                                  <span></span>
                                  English - EN
                                </label>
                                <label class="radio" htmlFor="Arabic">
                                  <input
                                    type="radio"
                                    id="Arabic"
                                    name="language"
                                    value="Arabic"
                                    {...register("language", {
                                      required: true,
                                    })}
                                  />
                                  <span></span>
                                  Arabic
                                </label>

                                <label class="radio" htmlFor="Turkish">
                                  <input
                                    type="radio"
                                    id="Turkish"
                                    name="language"
                                    value="Turkish"
                                    {...register("language", {
                                      required: true,
                                    })}
                                  />
                                  <span></span>
                                  Turkish
                                </label>
                              </div>
                              {errors &&
                                errors.language?.type === "required" && (
                                  <div className="invalid-feedback">
                                    The language field is required.
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="card">
                        <div class="card-header" id="headingOne">
                          <h2 class="mb-0">
                            <button
                              class="btn btn-link btn-block text-left"
                              type="button"
                              data-toggle="collapse"
                              data-target="#collapseFour"
                              aria-expanded="true"
                              aria-controls="collapseFour"
                            >
                              PERSONAL DETAILS
                            </button>
                          </h2>
                        </div>

                        <div
                          id="collapseFour"
                          class="collapse show"
                          aria-labelledby="headingOne"
                          data-parent="#accordionExample"
                        >
                          <div class="card-body">
                            <RenderInputFields
                              InputFields={InputFieldsPersonalDetail}
                              errors={errors}
                              register={register}
                            />
                            <div className="form-group">
                              <div className="position-relative">
                                <label>
                                  Location
                                  <span className="text-danger">*</span>
                                </label>
                                <GooglePlace
                                  saveAddress={saveLocationHandler}
                                  defaultAddress={vendorDefaultAddress}
                                  // {...register("location", {
                                  //   required: true,
                                  // })}
                                />
                                {errors.location?.type === "required" && (
                                  <p className="invalid-feedback">
                                    The location field is required.
                                  </p>
                                )}
                                {errors.location?.type === "manual1" && (
                                  <p className="invalid-feedback">
                                    The location field is invalid.
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="card">
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
                              Bank Details
                            </button>
                          </h2>
                        </div>

                        <div
                          id="collapseOne"
                          class="collapse show"
                          aria-labelledby="headingOne"
                          data-parent="#accordionExample"
                        >
                          <div class="card-body">
                            <RenderInputFields
                              InputFields={InputFieldsBankDetail}
                              errors={errors}
                              register={register}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row"></div>

                    <SubmitButton
                      handleSubmit={handleSubmit}
                      onSubmit={onSubmit}
                      name="Submit"
                    />
                  </form>
                </div>
                <div className="col-xl-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Edit;
