import { useState, useEffect, useMemo, Fragment, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import Loader from "@/components/Loader";
import Newsletter from "@/components/Newsletter";
import Layout from "@/components/Layout";
import { MEDIA_URL } from "@/api";
import useRequest from "@/hooks/useRequest";
import { capitalizeFirstLetter, createAxiosCookies } from "@/fn";
import { getCountries } from "@/services/countries";
import GooglePlace from "@/components/GooglePlace";
import { getAddressData } from "@/services/customer";
import { getCartItems } from "@/services/customer";
import { useRouter } from "next/router";
import OauthPopup from "@/components/PaymentPopup";
const Checkout = ({
  countries,
  initialAddresses,
  cartItems,
  currency,
  initialCheckoutData,
}) => {
  const {
    register: registerAddAddress,
    handleSubmit: handleSubmitAddAddress,
    formState: { errors: errorsAddAddress },
    setValue: setValueAddAddress,
    clearErrors: clearErrorsAddAddress,
    reset: resetAddAddress,
  } = useForm();

  const {
    register: registerEditAddress,
    handleSubmit: handleSubmitEditAddress,
    formState: { errors: errorsEditAddress },
    setValue: setValueEditAddress,
    clearErrors: clearErrorsEditAddress,
    reset: resetEditAddress,
    getValues: getValuesEditAddress,
    watch,
  } = useForm();

  const {
    register: registerEmi,
    handleSubmit: handleSubmitEmi,
    formState: { errors: errorsEditEmi },
    setValue: setValueEmi,
    clearErrors: clearErrorsEmi,
    reset: resetEmi,
    getValues: getValuesEmi,
    watch: watchEmi,
  } = useForm();

  const t = useTranslations("Index");

  const router = useRouter();

  const [addresses, setAddresses] = useState(initialAddresses);
  const [isRemoveAddressModalOpen, setIsRemoveAddressModalOpen] =
    useState(false);
  const [removeAddressId, setRemoveAddressId] = useState(null);

  const [checkoutData, setCheckoutData] = useState(initialCheckoutData);

  const { totalPrice } = checkoutData;
  const { sign } = checkoutData.paymentCurrencyData;

  const [isEditAddressModalOpen, setIsEditAddressModalOpen] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null);
  const [editCountryCode, setEditCountryCode] = useState("");
  const [editCountryName, setEditCountryName] = useState("");
  const [googlePlaceKey, setGooglePlaceKey] = useState(0);

  // const [addressId, setAddressId] = useState("");
  // const [shippingAddressId, setShippingAddressId] = useState("");
  const [isShippingChecked, setIsShippingChecked] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentType, setPaymentType] = useState(1);
  const [paymentStep, setPaymentStep] = useState(1);
  const [isCustomEmiSelected, setIsCustomEmiSelected] = useState(false);
  const [addshow, addsetShow] = useState(false);
  // const [taxAmount, setTaxAmount] = useState(0.0);
  // const [customFees, setCustomFees] = useState(0.0);
  const [emiAmounts, setEmiAmounts] = useState({
    initial: null,
    installment: null,
  });

  const [orderData, setOrderData] = useState({
    url: null,
    orderId: null,
  });

  const [windowState, setWindowState] = useState(null);

  const [billingAddressData, setBillingAddressData] = useState({
    addressId: null,
    taxAmount: 0.0,
    phoneNumber:null
  });

  const [shippingAddressData, setShippingAddressData] = useState({
    addressId: null,
    customFees: 0.0,
    phoneNumber:null
  });

  useEffect(() => {
    const defaultAddress = initialAddresses.find((item) => item.defaultAddress);
    if (defaultAddress) {
      setBillingAddressData({ id: defaultAddress._id, taxAmount: 0.0, phoneNumber:defaultAddress.contact });
      requestTaxData("POST", "v1/checkout/tax", {
        billingAddressId: defaultAddress._id,
      });
      if (!isShippingChecked) {
        setShippingAddressData({ id: defaultAddress._id, customFees: 0.0, phoneNumber:defaultAddress.contact });
        invokeShippingAddressApi(defaultAddress._id);
      }
    }
    setPaymentMethod("orange_money");
  }, []);

  const { frequency, payment_percentage, term, month_week } = watchEmi();

  const { request: requestAddAddress, response: responseAddAddress } =
    useRequest();
  const { request: requestDeleteAddress, response: responseDeleteAddress } =
    useRequest();
  const { request: requestGetOneAddress, response: responseGetOneAddress } =
    useRequest();
  const { request: requestUpdateAddress, response: responseUpdateAddress } =
    useRequest();
  const { request: requestAddresses, response: responseAddresses } =
    useRequest();
  const { request: requestTaxData, response: responseTaxData } = useRequest();
  const { request: requestCustomFees, response: responseCustomFees } =
    useRequest();
  const {
    request: requestInstallmentOptions,
    response: responseInstallmentOptions,
    clear: clearInstallmentOptions,
  } = useRequest();

  const {
    request: requestCreateOrderHandler,
    response: responseCreateOrderHandler,
  } = useRequest();

  const {
    request: requestOrderStatusHandler,
    response: responseOrderStatusHandler,
  } = useRequest();

  useEffect(() => {
    registerAddAddress("street", { required: true });
  }, []);

  useEffect(() => {
    if (responseAddAddress) {
      toast.success(responseAddAddress.message);
      setAddresses((prev) => [...prev, responseAddAddress.newAddress]);
      setGooglePlaceKey((prev) => prev + 1);
      resetAddAddress({
        city: "",
        state: "",
        name: "",
        country: "",
        contact: "",
        pinCode: "",
        location: "",
        type: "",
        houseNo: "",
        street: "",
        landmark: "",
      });
    }
  }, [responseAddAddress]);

  useEffect(() => {
    if (responseDeleteAddress) {
      toast.success(responseDeleteAddress.message);
      const newAddresses = addresses.filter(
        (item) => item._id !== removeAddressId
      );
      setAddresses(newAddresses);
      removeAddressCloseModalHandler();
    }
  }, [responseDeleteAddress]);

  useEffect(() => {
    if (responseGetOneAddress) {
      const {
        city,
        state,
        pinCode,
        location,
        type,
        houseNo,
        street,
        landmark,
        name,
        countryCode,
        contact,
        countryName,
        countryId,
      } = responseGetOneAddress.addressData;

      resetEditAddress({
        city,
        state,
        pinCode,
        location,
        type,
        houseNo,
        street,
        landmark: landmark ?? "",
        name,
        country: countryCode,
        contact,
        countryId,
      });
      setIsEditAddressModalOpen(true);
      setEditCountryCode(countryCode);
      setEditCountryName(countryName);
    }
  }, [responseGetOneAddress]);

  useEffect(() => {
    if (responseUpdateAddress) {
      toast.success(responseUpdateAddress.message);
      editAddressCloseModalHandler();
      requestAddresses("GET", "v1/address");
    }
  }, [responseUpdateAddress]);

  // useEffect(() => {
  //   if (addressId) {
  //     if (!shippingAddressId) {
  //       let taxData = {
  //         billingAddressId: addressId,
  //       };
  //       let customData = {
  //         shippingAddressId: addressId,
  //       };
  //       requestTaxData("POST", "v1/checkout/tax", taxData);
  //       requestCustomFees("POST", "v1/checkout/custom-fees", customData);
  //     } else {
  //       let taxData = {
  //         billingAddressId: addressId,
  //       };

  //       requestTaxData("POST", "v1/checkout/tax", taxData);
  //     }
  //   }
  // }, [addressId]);

  // useEffect(() => {
  //   if (addressId && shippingAddressId) {
  //     let customData = {
  //       shippingAddressId: addressId,
  //     };

  //     if (shippingAddressId && shippingAddressId !== addressId) {
  //       customData.shippingAddressId = shippingAddressId;
  //     }

  //     requestCustomFees("POST", "v1/checkout/custom-fees", customData);
  //   }
  // }, [shippingAddressId]);

  useEffect(() => {
    if (responseTaxData) {
      setBillingAddressData((prev) => ({
        ...prev,
        taxAmount: responseTaxData.taxAmount,
      }));
    }
  }, [responseTaxData]);

  useEffect(() => {
    if (responseCustomFees) {
      setShippingAddressData((prev) => ({
        ...prev,
        customFees: responseCustomFees.customFees,
      }));
    }
  }, [responseCustomFees]);

  useEffect(() => {
    if (responseAddresses) {
      setAddresses(responseAddresses.address);
    }
  }, [responseAddresses]);

  useEffect(() => {
    if (responseCreateOrderHandler) {
      if (!responseCreateOrderHandler.status) {
        windowState?.close();
        setWindowState(null);
        toast.error(responseCreateOrderHandler.message);
        return;
      }
      setOrderData({
        url: responseCreateOrderHandler.url,
        orderId: responseCreateOrderHandler.orderId,
      });
      setIsPaymentModalOpen(false);
    }
  }, [responseCreateOrderHandler]);

  useEffect(() => {
    if (responseOrderStatusHandler) {
      toast.success(responseOrderStatusHandler.message);
      router.push("/customer/my-orders");
    }
  }, [responseOrderStatusHandler]);

  useEffect(() => {
    if (responseInstallmentOptions) {
      setCheckoutData(responseInstallmentOptions.checkoutData);

      if (responseInstallmentOptions.checkoutData.totalPrice < 1) {
        toast.error(
          `Total price (${sign} ${totalPrice}) is less than minimum amount of ${sign} 1.`
        );
        return;
      }
      setIsPaymentModalOpen(true);

      clearInstallmentOptions();
    }
  }, [responseInstallmentOptions]);

  const addressSubmitHandler = (data) => {
    requestAddAddress("POST", "v1/address", data);
  };

  const saveLocationHandler = (address, geoLocation) => {
    clearErrorsAddAddress("street");
    setValueAddAddress("street", address);
    setValueAddAddress("location", {
      coordinates: geoLocation ? [geoLocation.lng, geoLocation.lat] : "",
      type: "Point",
    });
  };

  const removeAddressHandler = (id) => {
    setIsRemoveAddressModalOpen(true);
    setRemoveAddressId(id);
  };

  const onCode = (code) => {
    requestOrderStatusHandler("POST", "v1/order/payment-status", {
      orderId: code,
    });

    closePaymentModalHandler();
  };

  const removeAddressCloseModalHandler = () => {
    setIsRemoveAddressModalOpen(false);
    setRemoveAddressId(null);
  };

  const deleteAddressHandler = () => {
    requestDeleteAddress("DELETE", "v1/address", {
      id: removeAddressId,
    });
  };

  const editAddressHandler = (id) => {
    setEditAddressId(id);
    requestGetOneAddress("GET", `v1/address/${id}`);
  };

  const editAddressCloseModalHandler = () => {
    setIsEditAddressModalOpen(false);
    setEditAddressId(null);
    setEditCountryCode("");
    setEditCountryName("");
  };

  const editAddressSubmitHandler = (data) => {
    console.log("data", data);
    data.id = editAddressId;
    data.countryName = editCountryName;
    requestUpdateAddress("PUT", "v1/address", data);
  };

  const editSaveLocationHandler = (address, geoLocation) => {
    setValueEditAddress("street", address);
    setValueEditAddress("location", {
      coordinates: geoLocation ? [geoLocation.lng, geoLocation.lat] : "",
      type: "Point",
    });
  };

  const orderAmount = useMemo(() => {
    return +cartItems.reduce((acc, cv) => acc + cv.totalPrice, 0).toFixed(2);
  }, [cartItems]);

  const makePaymentHandler = () => {
    // if (totalPrice < 1) {
    //   toast.error(
    //     `Total price (${sign} ${totalPrice}) is less than minimum amount of ${sign} 1.`
    //   );
    //   return;
    // }

    if (isShippingChecked) {
      if (!billingAddressData.id) {
        toast.error("Please select billing address.");
        return;
      }
      if (!shippingAddressData.id) {
        toast.error("Please select shipping address.");
        return;
      }
    } else {
      if (!billingAddressData.id) {
        toast.error("Please select billing address.");
        return;
      }
    }

    if (paymentMethod == null) {
      toast.error("Please select payment method");
      return;
    }

    let totalPriceSum =
      orderAmount +
      billingAddressData.taxAmount +
      shippingAddressData.customFees;

    requestInstallmentOptions("POST", "v1/cart/installment-options", {
      totalPrice: totalPriceSum,
    });
    // setIsPaymentModalOpen(true);
  };
console.log("data",billingAddressData)
  const paymentHandler = () => {
    const sendData = {
      billingAddressId: billingAddressData.id,
      shippingAddressId: shippingAddressData.id,
      phoneNumber:billingAddressData.phoneNumber,
      payFull: true,
    };
    setWindowState(window.open());
    console.log("paymentData",sendData)
    requestCreateOrderHandler("POST", "v1/order", sendData);
  };

  const emiSubmitHandler = (data) => {
    const { frequency, month_week, payment_percentage, term } = data;

    const sendData = {
      installmentOption: {
        type: month_week,
        term,
        frequency,
        initialPercentage: payment_percentage,
      },
      billingAddressId: billingAddressData.id,
      shippingAddressId: shippingAddressData.id,
      payFull: paymentType === 1,
    };

    setWindowState(window.open());

    requestCreateOrderHandler("POST", "v1/order", sendData);
  };

  useEffect(() => {
    if (payment_percentage && term && frequency != "") {
      firstTimeAmount();
    }
  }, [payment_percentage, term, frequency]);

  const firstTimeAmount = () => {
    let amount = +totalPrice;
    const initial = +((amount * payment_percentage) / 100).toFixed(2);
    const remaining = +(amount - initial).toFixed(2);
    const payment_terms = +term;
    const installment = +(remaining / payment_terms).toFixed(2);

    setEmiAmounts({ installment, initial });
  };

  const setEmiData = (data) => {
    const { frequency, initialPercentage, term, type } = data;
    setValueEmi("month_week", type);
    setValueEmi("frequency", frequency);
    setValueEmi("payment_percentage", initialPercentage);
    setValueEmi("term", term);
  };

  const resetEmiData = () => {
    setValueEmi("month_week", "");
    setValueEmi("frequency", "");
    setValueEmi("payment_percentage", "");
    setValueEmi("term", "");

    setEmiAmounts({ installment: null, initial: null });
  };

  const closePaymentModalHandler = () => {
    setIsPaymentModalOpen(false);
    setPaymentType(1);
    setPaymentStep(1);
    setIsCustomEmiSelected(false);
    setEmiAmounts({
      initial: null,
      installment: null,
    });
    setOrderData({ url: null, orderId: null });
  };

  const setBillingAddressHandler = (id) => {
    setBillingAddressData({ id, taxAmount: 0.0 });
    requestTaxData("POST", "v1/checkout/tax", { billingAddressId: id });

    if (!isShippingChecked) {
      setShippingAddressData({ id, customFees: 0.0 });
      invokeShippingAddressApi(id);
    }
  };

  const setShippingAddressHandler = (id) => {
    setShippingAddressData({ id, customFees: 0.0 });
    invokeShippingAddressApi(id);
  };

  const invokeShippingAddressApi = (id) => {
    requestCustomFees("POST", "v1/checkout/custom-fees", {
      shippingAddressId: id,
    });
  };

  const [selectedCountryData, setSelectedCountryData] = useState({});

  const handleCountryChange = (e) => {
    const _id = e.target.value;
    const countryData = countries.find((country) => {
      return country._id === _id;
    });
    setValueAddAddress("countryCode", _id);
    setSelectedCountryData(countryData);
  };

  return (
    <Layout seoData={{ pageTitle: "Checkout - Noonmar" }}>
      <section className="Checkout_Process_wrapper">
        <div className="container">
          <div className="breadcrumbBlock">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link href="/" legacyBehavior>
                    <a>{t("Home")}</a>
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <Link href="/cart" legacyBehavior>
                    <a>{t("Cart")}</a>
                  </Link>
                </li>

                <li className="breadcrumb-item active" aria-current="page">
                  {t("Checkout")}
                </li>
              </ol>
            </nav>
            <a href="javascript:void(0)" className="menu-toggle">
              <i className="fas fa-list-ul" />
            </a>
          </div>

          {/* <div>
            <button onClick={checkPopupAllowed}>Check Pop-up</button>
            {popupAllowed !== null && (
              <p>
                Pop-ups are {popupAllowed ? "allowed" : "blocked"} in your
                browser.
              </p>
            )}
          </div> */}

          <div className="Checkout_main_block">
            <h1 className="LeftBlockTitle">{t("Checkout")} </h1>
            <div className="row">
              {/*  */}
              <div className="col-lg-8 col-xl-9">
                <div className="Checkout_Process_box">
                  <div className="personal_info_page">
                    {/* card section */}
                    <div className="my_address" id="addressBook">
                      {addresses.length > 0 && (
                        <>
                          <div className="infomation_title_banner">
                            <h3 className="Checkout_info_title">
                              {t("Billing Address")}
                            </h3>
                          </div>
                          <div className="card_adderss_content check_card_adderss">
                            <div className="row g-4">
                              {addresses.map((item) => (
                                <div
                                  key={item._id}
                                  className="col-md-6 col-lg-6 col-xl-4"
                                >
                                  <div className=" Checkout_Addresse_card">
                                    <input
                                      className="form-check-input d-none"
                                      type="radio"
                                      name="flexRadioDefault00"
                                      id={`flexRadioDefault_${item._id}`}
                                      onChange={() =>
                                        setBillingAddressHandler(item._id)
                                      }
                                      defaultChecked={
                                        !isShippingChecked &&
                                        item.defaultAddress
                                      }
                                    />
                                    <label
                                      className="form-check-label Checkout_card_box"
                                      htmlFor={`flexRadioDefault_${item._id}`}
                                    >
                                      <span className="Default_title">
                                        {item.defaultAddress
                                          ? `${t("Default")}`
                                          : ""}
                                      </span>
                                      <div className="address_card_container">
                                        <div className="address_area">
                                          <div className="addressIconBox">
                                            <img
                                              src={`/assets/img/${
                                                item.type == "home"
                                                  ? "home_icon.png"
                                                  : "office_icon.png"
                                              }`}
                                              alt=""
                                            />
                                            <div className="address_area_title">
                                              {capitalizeFirstLetter(item.type)}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="address_banner_title">
                                          <h3 className="address_card_title">
                                            {item.name}
                                          </h3>
                                          <p className="address_sub_title">
                                            {" "}
                                            {item.houseNo} {item.street}
                                          </p>
                                          <p className="address_sub_title">
                                            {item.pinCode}
                                          </p>
                                          <p className="address_sub_title">
                                            {t("Phone Number:")}
                                            <span>{item.contact}</span>
                                          </p>
                                        </div>
                                      </div>
                                      <span className="edit_title">
                                        <a
                                          onClick={() =>
                                            editAddressHandler(item._id)
                                          }
                                          href="javascript:void(0)"
                                        >
                                          {t("EDIT")}
                                        </a>
                                        <span className="seprator-line">|</span>
                                        <a
                                          href="javascript:void(0)"
                                          onClick={() =>
                                            removeAddressHandler(item._id)
                                          }
                                        >
                                          {t("REMOVE")}
                                        </a>
                                      </span>
                                    </label>
                                  </div>
                                </div>
                              ))}
                              {addresses && (
                                <div className="col-md-6 col-lg-6 col-xl-4">
                                  <div className="address_card add_banner">
                                    <a
                                      className="add_new_address_banner cursor"
                                      onClick={() => {
                                        addsetShow(!addshow);
                                      }}
                                    >
                                      <span className="puls_icon_add">
                                        <i className="fas fa-plus" />
                                      </span>
                                      <span className="add_title">
                                        {t("Add New Address")}
                                      </span>
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="form-check my-4">
                            <input
                              type="checkbox"
                              id="shipping_checkbox"
                              className="form-check-input"
                              checked={isShippingChecked}
                              onChange={(e) => {
                                setIsShippingChecked((prev) => !prev);

                                if (e.target.checked) {
                                  setShippingAddressData({
                                    id: null,
                                    customFees: 0.0,
                                  });
                                } else {
                                  if (billingAddressData.id) {
                                    setShippingAddressData({
                                      id: billingAddressData.id,
                                      customFees: 0.0,
                                    });

                                    invokeShippingAddressApi(
                                      billingAddressData.id
                                    );
                                  }
                                }
                              }}
                            />
                            <label
                              htmlFor="shipping_checkbox"
                              className="form-check-label"
                            >
                              Ship to a different address?
                            </label>
                          </div>
                          {/* Shipping Address */}
                          {isShippingChecked && (
                            <div className="card_adderss_content check_card_adderss">
                              <div className="row g-4">
                                {addresses.map((item) => (
                                  <div
                                    key={item._id}
                                    className="col-md-6 col-lg-6 col-xl-6"
                                  >
                                    <div className=" Checkout_Addresse_card">
                                      <input
                                        className="form-check-input d-none"
                                        type="radio"
                                        name="flexRadioShipping00"
                                        id={`flexRadioShipping_${item._id}`}
                                        onChange={() =>
                                          setShippingAddressHandler(item._id)
                                        }
                                        defaultChecked={item.defaultAddress}
                                      />
                                      <label
                                        className="form-check-label Checkout_card_box"
                                        htmlFor={`flexRadioShipping_${item._id}`}
                                      >
                                        <span className="Default_title">
                                          {item.defaultAddress
                                            ? `${t("Default")}`
                                            : ""}
                                        </span>
                                        <div className="address_card_container">
                                          <div className="address_area">
                                            <div className="addressIconBox">
                                              <img
                                                src={`/assets/img/${
                                                  item.type == "home"
                                                    ? "home_icon.png"
                                                    : "office_icon.png"
                                                }`}
                                                alt=""
                                              />
                                              <div className="address_area_title">
                                                {capitalizeFirstLetter(
                                                  item.type
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="address_banner_title">
                                            <h3 className="address_card_title">
                                              {item.name}
                                            </h3>
                                            <p className="address_sub_title">
                                              {" "}
                                              {item.houseNo} {item.street}
                                            </p>
                                            <p className="address_sub_title">
                                              {item.pinCode}
                                            </p>
                                            <p className="address_sub_title">
                                              {t("Phone Number:")}
                                              <span>{item.contact}</span>
                                            </p>
                                          </div>
                                        </div>
                                        <span className="edit_title">
                                          <a
                                            onClick={() =>
                                              editAddressHandler(item._id)
                                            }
                                            href="javascript:void(0)"
                                          >
                                            {t("EDIT")}
                                          </a>
                                          <span className="seprator-line">
                                            |
                                          </span>
                                          <a
                                            href="javascript:void(0)"
                                            onClick={() =>
                                              removeAddressHandler(item._id)
                                            }
                                          >
                                            {t("REMOVE")}
                                          </a>
                                        </span>
                                      </label>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      {/*  */}

                      <div className="my_address" id="Notifications">
                        <div className="infomation_title_banner">
                          <div className="profile_information_banner">
                            {(addresses.length === 0 || addshow) && (
                              <form
                                onSubmit={handleSubmitAddAddress(
                                  addressSubmitHandler
                                )}
                              >
                                {" "}
                                <div className="mt-2 mb-4 h3">
                                  {t("Add New Address")}
                                </div>
                                <div className="row">
                                  <div className="col-md-6">
                                    <div className="form-group ">
                                      <label className="form-label">
                                        {t("Name")}
                                      </label>
                                      <input
                                        type="text"
                                        name="fname"
                                        className="form-control dark-form-control   "
                                        {...registerAddAddress("name", {
                                          required: "This field is required",
                                          setValueAs: (v) => v.trim(),
                                        })}
                                      />
                                      {errorsAddAddress.name && (
                                        <span className="text-danger">
                                          {t(errorsAddAddress.name.message)}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="col-md-6">
                                    <div className="form-group ">
                                      <label className="form-label">
                                        {t("Type")}
                                      </label>
                                      <select
                                        className="form-control"
                                        {...registerAddAddress("type", {
                                          required: "This field is required",
                                        })}
                                      >
                                        <option value="home">
                                          {t("HOME")}
                                        </option>
                                        <option value="work">
                                          {t("WORK")}
                                        </option>
                                      </select>
                                      {errorsAddAddress.type && (
                                        <span className="text-danger">
                                          {t(errorsAddAddress.type.message)}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="col-md-6">
                                    <div className="form-group ">
                                      <label className="form-label">
                                        {t("Country")}
                                      </label>
                                      <select
                                        className="form-control dark-form-control"
                                        {...registerAddAddress("countryId", {
                                          required: "This field is required",
                                          setValueAs: (v) => v.trim(),
                                          onChange: (e) => {
                                            handleCountryChange(e);
                                          },
                                        })}
                                      >
                                        <option value="">Select</option>
                                        {countries?.map((val) => {
                                          return (
                                            <option value={val._id}>
                                              {val.name}
                                            </option>
                                          );
                                        })}
                                      </select>

                                      {errorsAddAddress.countryId && (
                                        <span className="text-danger">
                                          {t(
                                            errorsAddAddress.countryId.message
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* <div className="col-md-6">
                                    <div className="form-group ">
                                      <label className="form-label">
                                        {t("State")}
                                      </label>
                                      <input
                                        type="text"
                                        {...registerAddAddress("state", {
                                          required: "This field is required",
                                          setValueAs: (v) => v.trim(),
                                        })}
                                        className="form-control dark-form-control"
                                      />
                                      {errorsAddAddress.state && (
                                        <span className="text-danger">
                                          {t(errorsAddAddress.state.message)}
                                        </span>
                                      )}
                                    </div>
                                  </div> */}

                                  <div className="col-md-6">
                                    <div className="form-group ">
                                      <label className="form-label">
                                        {t("City")}
                                      </label>
                                      <input
                                        type="text"
                                        {...registerAddAddress("city", {
                                          required: "This field is required",
                                          setValueAs: (v) => v.trim(),
                                        })}
                                        className="form-control dark-form-control"
                                      />
                                      {errorsAddAddress.city && (
                                        <span className="text-danger">
                                          {t(errorsAddAddress.city.message)}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="col-md-6">
                                    <div className="form-group ">
                                      <label className="form-label">
                                        {t("Address")}
                                      </label>
                                      <input
                                        type="text"
                                        name="State"
                                        {...registerAddAddress("houseNo", {
                                          required: "This field is required",
                                          setValueAs: (v) => v.trim(),
                                        })}
                                        className="form-control dark-form-control"
                                      />
                                      {errorsAddAddress.address && (
                                        <span className="text-danger">
                                          {t(errorsAddAddress.address.message)}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* <div className="col-md-6">
                                    <div className="form-group ">
                                      <label className="form-label">
                                        {t("House No,Building Name")}
                                      </label>
                                      <input
                                        type="text"
                                        name="State"
                                        {...registerAddAddress("houseNo", {
                                          required: "This field is required",
                                          setValueAs: (v) => v.trim(),
                                        })}
                                        className="form-control dark-form-control"
                                      />
                                      {errorsAddAddress.houseNo && (
                                        <span className="text-danger">
                                          {t(errorsAddAddress.houseNo.message)}
                                        </span>
                                      )}
                                    </div>
                                  </div> */}

                                  {/* <div className="col-md-6">
                                    <div className="form-group ">
                                      <label className="form-label">
                                        {t("Street")}
                                      </label>
                                      <GooglePlace
                                        saveAddress={saveLocationHandler}
                                        setValue={setValueAddAddress}
                                        key={googlePlaceKey}
                                      />
                                      {errorsAddAddress.street &&
                                        errorsAddAddress.street.type ===
                                          "required" && (
                                          <span className="text-danger">
                                            {t("This field is required")}
                                          </span>
                                        )}
                                      {errorsAddAddress.street &&
                                        errorsAddAddress.street.type ===
                                          "manual" && (
                                          <span className="text-danger">
                                            {t("Please enter valid address")}
                                          </span>
                                        )}
                                    </div>
                                  </div> */}

                                  {/* <div className="col-md-6">
                                    <div className="form-group ">
                                      <label className="form-label">
                                        {t("Landmark")}
                                      </label>
                                      <input
                                        type="text"
                                        {...registerAddAddress("landmark", {
                                          required: false,
                                        })}
                                        className="form-control dark-form-control"
                                      />
                                    </div>
                                  </div> */}

                                  <div className="col-md-6">
                                    <label className="form-label">
                                      {t("Mobile Number")}
                                    </label>
                                    <div className="row">
                                      <div className="col-md-3 col-lg-3 col-sm-3">
                                        <div className="form-group ">
                                          <select
                                            className="form-select dark-form-control mb-3 ml-3"
                                            // name=""
                                            id=""
                                            {...registerAddAddress(
                                              "countryCode",
                                              {
                                                required:
                                                  "This field is required",
                                              }
                                            )}
                                          >
                                            <option value="">
                                              {t("Select")}
                                            </option>
                                            {countries.map((item, index) => {
                                              return (
                                                <option
                                                  value={item?._id}
                                                  key={item?._id}
                                                  defaultValue={
                                                    item?._id ===
                                                    selectedCountryData._id
                                                  }
                                                >
                                                  +{item?.countryCode}
                                                </option>
                                              );
                                            })}
                                          </select>
                                          {errorsAddAddress.country && (
                                            <span className="text-danger">
                                              {t(
                                                errorsAddAddress.country.message
                                              )}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="col-md-9 col-lg-9 col-sm-9">
                                        <div className="form-group ">
                                          <input
                                            type="number"
                                            name="number"
                                            className="form-control dark-form-control"
                                            placeholder=""
                                            defaultValue=""
                                            {...registerAddAddress("contact", {
                                              required:
                                                "This field is required",
                                            })}
                                          />
                                          {errorsAddAddress.contact && (
                                            <span className="text-danger">
                                              {t(
                                                errorsAddAddress.contact.message
                                              )}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="col-md-6">
                                    <div className="form-group ">
                                      <label className="form-label">
                                        {t("Pin Code")}
                                      </label>
                                      <input
                                        type="number"
                                        {...registerAddAddress("pinCode", {
                                          required: "This field is required",
                                          pattern: {
                                            value: /^\d*[1-9]\d*$/,
                                            message:
                                              "Please enter valid pin code",
                                          },
                                        })}
                                        className="form-control dark-form-control"
                                      />
                                      {errorsAddAddress.pinCode && (
                                        <span className="text-danger">
                                          {t(errorsAddAddress.pinCode.message)}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="Transactions_button">
                                    {/* <div className="form-group custom_checkbox d-flex position-relative">
                                  <input
                                    type="checkbox"
                                    id="check001"
                                    defaultChecked=""
                                  />
                                  <label
                                    htmlFor="check001"
                                    className="click_reme"
                                  >
                                    Save Card for future
                                    Transactions
                                  </label>
                                </div> */}
                                    <div className="save_button_footer">
                                      {/* <a
                                     href="javascript:void(0)"
                                    className="save_upload_btn"
                                  >
                                    SAVE NOW
                                  </a> */}
                                      <button className="save_upload_btn">
                                        {t("SAVE NOW")}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </form>
                            )}
                            <div className="row">
                              {/* <div className="col-md-3 col-lg-3 col-sm-3"> */}
                              <div className="form-group ">
                                <label className="form-label">
                                  {t("Payment Methods")}
                                </label>
                                <select
                                  className="form-select dark-form-control mb-3"
                                  onChange={(e) =>
                                    setPaymentMethod(e.target.value)
                                  }
                                >
                                  <option value="orange_money">
                                    {t("Orange Money")}{" "}
                                  </option>
                                  <option value="null">{t("Select")}</option>
                                </select>
                              </div>
                            </div>
                            {false && (
                              <div className="my_address" id="managePayments">
                                <div className="infomation_title_banner">
                                  <h3 className="info_title">
                                    Select Payment Method
                                  </h3>
                                </div>
                                <div className="payment_method">
                                  <div className="payment_saved_cards">
                                    <a
                                      href="javascript:void(0)"
                                      className="saved_cards_btn save-card"
                                    >
                                      Saved Cards
                                      <i className="fas fa-caret-down" />
                                    </a>
                                    <a
                                      href="javascript:void(0)"
                                      className="new_active_btn saved_cards_btn add-newcard"
                                    >
                                      Add New card
                                    </a>
                                  </div>
                                  <div className="save-cards-list">
                                    <div className="bank_ditails bank_active_card">
                                      <div className="bank_card_icon">
                                        <span className="check_bank_info">
                                          <svg
                                            width={24}
                                            height={24}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <circle
                                              cx={12}
                                              cy={12}
                                              r={12}
                                              fill="#1BB66E"
                                            />
                                            <path
                                              d="M16.8002 9L10.2003 15.6L7.2002 12.6"
                                              stroke="white"
                                              strokeWidth={3}
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                        </span>
                                        <span className="check_bank_info">
                                          <svg
                                            width={24}
                                            height={24}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              d="M6 14.25C5.58579 14.25 5.25 14.5858 5.25 15C5.25 15.4142 5.58579 15.75 6 15.75V14.25ZM9.5 15.75C9.91421 15.75 10.25 15.4142 10.25 15C10.25 14.5858 9.91421 14.25 9.5 14.25V15.75ZM5 6.75H19V5.25H5V6.75ZM20.25 8V16H21.75V8H20.25ZM19 17.25H5V18.75H19V17.25ZM3.75 16V8H2.25V16H3.75ZM5 17.25C4.30964 17.25 3.75 16.6904 3.75 16H2.25C2.25 17.5188 3.48122 18.75 5 18.75V17.25ZM20.25 16C20.25 16.6904 19.6904 17.25 19 17.25V18.75C20.5188 18.75 21.75 17.5188 21.75 16H20.25ZM19 6.75C19.6904 6.75 20.25 7.30964 20.25 8H21.75C21.75 6.48122 20.5188 5.25 19 5.25V6.75ZM5 5.25C3.48122 5.25 2.25 6.48122 2.25 8H3.75C3.75 7.30964 4.30964 6.75 5 6.75V5.25ZM3 10.75H21V9.25H3V10.75ZM6 15.75H9.5V14.25H6V15.75Z"
                                              fill="#002CBF"
                                            />
                                          </svg>
                                        </span>
                                      </div>
                                      <div className="bank_name">
                                        <p className="bank_banner_name">Bank</p>
                                        <h4 className="bank_title_name">
                                          Ziraat Bankası
                                        </h4>
                                      </div>
                                      <div className="bank_number">
                                        <p className="bank_banner_name">
                                          Number
                                        </p>
                                        <h4 className="bank_title_name">
                                          1234
                                        </h4>
                                      </div>
                                      <div className="bank_account_name">
                                        <p className="bank_banner_name">
                                          Account Name
                                        </p>
                                        <h4 className="bank_title_name">
                                          Hızır Kocaman
                                        </h4>
                                      </div>
                                      <div className="bank_ex_date">
                                        <p className="bank_banner_name">
                                          Ex Date
                                        </p>
                                        <h4 className="bank_title_name">
                                          12/34
                                        </h4>
                                      </div>
                                    </div>
                                    <div className="bank_ditails">
                                      <div className="bank_card_icon">
                                        <span className="check_bank_info">
                                          <svg
                                            width={24}
                                            height={24}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <circle
                                              cx={12}
                                              cy={12}
                                              r={12}
                                              fill="#E0E0E0"
                                            />
                                            <path
                                              d="M16.8002 9L10.2003 15.6L7.2002 12.6"
                                              stroke="white"
                                              strokeWidth={3}
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                        </span>
                                        <span className="check_bank_info">
                                          <svg
                                            width={24}
                                            height={24}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              d="M6 14.25C5.58579 14.25 5.25 14.5858 5.25 15C5.25 15.4142 5.58579 15.75 6 15.75V14.25ZM9.5 15.75C9.91421 15.75 10.25 15.4142 10.25 15C10.25 14.5858 9.91421 14.25 9.5 14.25V15.75ZM5 6.75H19V5.25H5V6.75ZM20.25 8V16H21.75V8H20.25ZM19 17.25H5V18.75H19V17.25ZM3.75 16V8H2.25V16H3.75ZM5 17.25C4.30964 17.25 3.75 16.6904 3.75 16H2.25C2.25 17.5188 3.48122 18.75 5 18.75V17.25ZM20.25 16C20.25 16.6904 19.6904 17.25 19 17.25V18.75C20.5188 18.75 21.75 17.5188 21.75 16H20.25ZM19 6.75C19.6904 6.75 20.25 7.30964 20.25 8H21.75C21.75 6.48122 20.5188 5.25 19 5.25V6.75ZM5 5.25C3.48122 5.25 2.25 6.48122 2.25 8H3.75C3.75 7.30964 4.30964 6.75 5 6.75V5.25ZM3 10.75H21V9.25H3V10.75ZM6 15.75H9.5V14.25H6V15.75Z"
                                              fill="#002CBF"
                                            />
                                          </svg>
                                        </span>
                                      </div>
                                      <div className="bank_name">
                                        <p className="bank_banner_name">Bank</p>
                                        <h4 className="bank_title_name">
                                          Ziraat Bankası
                                        </h4>
                                      </div>
                                      <div className="bank_number">
                                        <p className="bank_banner_name">
                                          Number
                                        </p>
                                        <h4 className="bank_title_name">
                                          1234
                                        </h4>
                                      </div>
                                      <div className="bank_account_name">
                                        <p className="bank_banner_name">
                                          Account Name
                                        </p>
                                        <h4 className="bank_title_name">
                                          Hızır Kocaman
                                        </h4>
                                      </div>
                                      <div className="bank_ex_date">
                                        <p className="bank_banner_name">
                                          Ex Date
                                        </p>
                                        <h4 className="bank_title_name">
                                          12/34
                                        </h4>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="save_card_future">
                                    <div className="bank_logo_banner">
                                      <div className="bank_name_card">
                                        <span className="bank_card_main_title">
                                          <svg
                                            width={24}
                                            height={25}
                                            viewBox="0 0 24 25"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <circle
                                              cx={12}
                                              cy="12.5"
                                              r={12}
                                              fill="#FF6000"
                                            />
                                            <path
                                              d="M16.8002 9.5L10.2003 16.1L7.2002 13.1"
                                              stroke="white"
                                              strokeWidth={3}
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                          Add new card{" "}
                                        </span>
                                      </div>
                                      <div className="bank_name_india">
                                        <img src="img/bank_logo.png" alt="" />
                                      </div>
                                    </div>
                                    {/*  */}
                                    <div className="manage_card_input">
                                      <div className="card_digit_no">
                                        <h4>Card number</h4>
                                        <p>
                                          Enter the 16-digit card number on the
                                          card
                                        </p>
                                      </div>
                                      <div className="card_digit_input">
                                        <div className="form-group has-search">
                                          <span className="fal fa-credit-card form-control-feedback" />
                                          <input
                                            type="text"
                                            className="form-control"
                                          />
                                        </div>
                                      </div>
                                      <span className="check_credit">
                                        <svg
                                          width={32}
                                          height={32}
                                          viewBox="0 0 32 32"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <circle
                                            cx={16}
                                            cy={16}
                                            r="15.5"
                                            fill="white"
                                            stroke="#C9C9C9"
                                          />
                                          <path
                                            d="M23.1109 11.5556L13.3332 21.3333L8.88867 16.8889"
                                            stroke="#001A72"
                                            strokeWidth={3}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                      </span>
                                    </div>
                                    <div className="manage_card_input">
                                      <div className="card_digit_no">
                                        <h4>Card owner</h4>
                                        <p>Enter the name on the card</p>
                                      </div>
                                      <div className="card_digit_input">
                                        <div className="form-group">
                                          <input
                                            type="text"
                                            className="form-control"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <div className="manage_card_input">
                                      <div className="card_digit_no">
                                        <h4>Expiry date</h4>
                                        <p>
                                          Enter the expration date of the card
                                        </p>
                                      </div>
                                      <div className="card_digit_input">
                                        <div className="Linerow">
                                          <div className="customCard-row">
                                            <input
                                              type="text"
                                              className="form-control  exp_date"
                                            />
                                            <span className="cardSlash">
                                              <svg
                                                width={12}
                                                height={22}
                                                viewBox="0 0 12 22"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <path
                                                  d="M1.32666 21.016C1.19866 21.016 1.08666 20.968 0.990656 20.872C0.894656 20.776 0.846656 20.664 0.846656 20.536C0.846656 20.456 0.870656 20.36 0.918656 20.248L9.12666 0.568C9.17466 0.471999 9.23866 0.375999 9.31866 0.279999C9.41466 0.184 9.55866 0.136 9.75066 0.136H10.6867C10.8147 0.136 10.9267 0.184 11.0227 0.279999C11.1187 0.375999 11.1667 0.487999 11.1667 0.615999C11.1667 0.679999 11.1507 0.776 11.1187 0.904L2.88666 20.584C2.85466 20.664 2.78266 20.752 2.67066 20.848C2.57466 20.96 2.43866 21.016 2.26266 21.016H1.32666Z"
                                                  fill="black"
                                                />
                                              </svg>
                                            </span>
                                            <input
                                              type="text"
                                              className="form-control exp_date"
                                              placeholder={23}
                                            />
                                          </div>
                                          <div className="customCard-row">
                                            <div className="customCard-col CVV2">
                                              <h4 className="cv_title">CVV2</h4>
                                              <p className="code_title">
                                                Security code
                                              </p>
                                            </div>
                                            <div className="customCard-col exp012">
                                              <input
                                                type="text"
                                                className="form-control exp_dates"
                                                placeholder={12}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    {/*  */}
                                    <div className="Transactions_button">
                                      <div className="form-group custom_checkbox d-flex position-relative">
                                        <input
                                          type="checkbox"
                                          id="check1"
                                          defaultChecked=""
                                        />
                                        <label
                                          htmlFor="check1"
                                          className="click_reme"
                                        >
                                          Save Card for future Transactions
                                        </label>
                                      </div>
                                      <div className="save_button_footer">
                                        <a
                                          href="javascript:void(0)"
                                          className="save_upload_btn"
                                        >
                                          SAVE NOW
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/*  */}
              <div className="col-lg-4 col-xl-3">
                <div className="my_address Check_my_address" id="addressBook">
                  <div className="infomation_title_banner">
                    <h3 className="Checkout_info_title Checkout_info_Order">
                      {t("Order Summary")}
                    </h3>
                    <div className="check_Coach_block">
                      {cartItems.map((item, idx) => (
                        <div
                          key={item.idForCart}
                          className={`${
                            idx == cartItems.length - 1
                              ? "check_Coach_box2"
                              : "check_Coach_box1"
                          }`}
                        >
                          <div className="check_Coach_img">
                            <img
                              src={`${MEDIA_URL}/${item.media}`}
                              alt={item.name}
                            />
                          </div>
                          <div className="check_Coach_title">
                            <h3>{item.vendorName}</h3>
                            <p>{item.name}</p>
                            <p>Qty - {item.quantity}</p>
                          </div>
                        </div>
                      ))}

                      {/* <div className="check_Coach_box2">
                        <div className="check_Coach_img">
                          <img src="img/products/product-img02.png" alt="" />
                        </div>
                        <div className="check_Coach_title">
                          <h3>Coach</h3>
                          <p>Leather Coach Bag</p>
                          <p>Qty- 1</p>
                        </div>
                      </div> */}
                    </div>
                  </div>
                  <div className="Check_my_address_inputs">
                    <div className="form-group ">
                      <input
                        type="text"
                        name="check"
                        placeholder={t("Apply Coupon Code")}
                        className="form-control dark-form-control"
                      />
                      <a
                        href="javascript:void(0)"
                        className="Check_address_inputs"
                      >
                        {t("CHECK")}
                      </a>
                    </div>
                  </div>
                  <div className="infomation_title_banner">
                    <h3 className="Checkout_info_title  Checkout_info_totals">
                      {t("Cart Totals")}
                    </h3>
                    <div className="Cart_Totals_block">
                      <div className="Cart_Total_title">
                        <h3>{t("Order Amount")}: </h3>
                        <span>
                          {orderAmount} {currency}
                        </span>
                      </div>
                      <div className="Cart_Total_title CartTotalTitle2">
                        <h3>{t("Delivery Fee")}:</h3>
                        <span> 0.00 {currency}</span>
                      </div>
                      <div className="Cart_Total_title CartTotalTitle3">
                        <h3>{t("Applicable Taxes")}:</h3>
                        <span>
                          {billingAddressData.taxAmount} {currency}
                        </span>
                      </div>
                      <div className="Cart_Total_title">
                        <h3>{t("Custom Fees")}</h3>
                        <span>
                          {shippingAddressData.customFees} {currency}
                        </span>
                      </div>
                      {/* <div className="Cart_Total_title CartTotalTitle4">
                        <h3>Discount (50% OFF)</h3>
                        <span>-£325.00</span>
                      </div> */}
                      <div className="TotalPriceCart">
                        <h3>{t("Total Price")}:</h3>
                        <span>
                          {"  "}
                          {
                            +(
                              orderAmount +
                              billingAddressData.taxAmount +
                              shippingAddressData.customFees
                            ).toFixed(2)
                          }{" "}
                          &nbsp;
                          {currency}
                        </span>
                      </div>
                    </div>
                    <div className="checkPaymentCartBtn">
                      <a
                        href="javascript:void(0)"
                        className="payment_Make_Btn"
                        onClick={makePaymentHandler}
                      >
                        {t("Make the Payment")}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Newsletter />

      <Modal show={isRemoveAddressModalOpen}>
        <Modal.Header>
          <Modal.Title>{t("Delete Confirmation")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-danger">
            {t("Are you sure you want to delete address?")}
          </div>
        </Modal.Body>
        <Modal.Footer>
          {/* <Button variant="secondary"> */}
          <Button variant="secondary" onClick={removeAddressCloseModalHandler}>
            {t("Cancel")}
          </Button>
          {/* <Button variant="danger" onClick={handleDelete}> */}
          <Button variant="danger" onClick={deleteAddressHandler}>
            {t("Delete")}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={isEditAddressModalOpen}
        onHide={editAddressCloseModalHandler}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">
              {t("Edit Address")}
            </h5>
            <button
              type="button"
              className="btn-close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={editAddressCloseModalHandler}
            ></button>
          </div>
          <div className="modal-body">
            <div className="continueBx_">
              <div className="form_input_area">
                <form
                  onSubmit={handleSubmitEditAddress(editAddressSubmitHandler)}
                >
                  <div className="form-group">
                    <label className="form-label">{t("Name")}</label>
                    <input
                      type="text"
                      className="form-control"
                      {...registerEditAddress("name", {
                        required: "This field is required",
                        setValueAs: (v) => v.trim(),
                      })}
                    />
                    {errorsEditAddress.name && (
                      <span className="text-danger">
                        {t(errorsEditAddress.name.message)}
                      </span>
                    )}
                  </div>
                  <div className="row">
                    <div className="col-md-3 col-lg-3 col-sm-3">
                      <div className="form-group ">
                        <label className="form-label">
                          {t("Country Code")}
                        </label>
                        <select
                          className="form-select dark-form-control mb-3"
                          id=""
                          {...registerEditAddress("country", {
                            required: "This field is required",
                          })}
                          defaultValue={countries.find(
                            (country) => country._id == editCountryCode
                          )}
                        >
                          <option value="">{t("Select")}</option>
                          {countries.map((item) => {
                            return (
                              <option value={item?._id} key={item?._id}>
                                +{item?.countryCode}
                              </option>
                            );
                          })}
                        </select>
                        {errorsEditAddress.country && (
                          <span className="text-danger">
                            {t(errorsEditAddress.country.message)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-md-9 col-lg-9 col-sm-9">
                      <div className="form-group ">
                        <label className="form-label">{t("Contact")}</label>
                        <input
                          type="number"
                          name="number"
                          className="form-control dark-form-control"
                          placeholder=""
                          defaultValue=""
                          {...registerEditAddress("contact", {
                            required: "This field is required",
                          })}
                        />
                        {errorsEditAddress.contact && (
                          <span className="text-danger">
                            {t(errorsEditAddress.contact.message)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t("Type")}</label>
                    <select
                      className="form-control"
                      {...registerEditAddress("type", {
                        required: "This field is required",
                      })}
                    >
                      <option value="home">{t("HOME")}</option>
                      <option value="work">{t("WORK")}</option>
                    </select>

                    {errorsEditAddress.type && (
                      <span className="text-danger">
                        {t(errorsEditAddress.type.message)}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      {t("House No,Building Name")}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      {...registerEditAddress("houseNo", {
                        required: "This field is required",
                        setValueAs: (v) => v.trim(),
                      })}
                    />
                    {errorsEditAddress.houseNo && (
                      <span className="text-danger">
                        {t(errorsEditAddress.houseNo.message)}
                      </span>
                    )}
                  </div>
                  {/* <div className="form-group">
                    <GooglePlace
                      saveAddress={editSaveLocationHandler}
                      setValue={setValueEditAddress}
                      defaultAddress={getValuesEditAddress("street")}
                    />

                    {errorsEditAddress.street &&
                      errorsEditAddress.street.type === "required" && (
                        <span className="text-danger">
                          {t("This field is required")}
                        </span>
                      )}
                    {errorsEditAddress.street &&
                      errorsEditAddress.street.type === "manual" && (
                        <span className="text-danger">
                          {t("Please enter valid address.")}
                        </span>
                      )}
                  </div> */}

                  {/* <div className="form-group">
                    <label className="form-label">{t("Landmark")}</label>
                    <input
                      type="text"
                      className="form-control"
                      {...registerEditAddress("landmark", { required: false })}
                    />
                  </div> */}
                  <div className="form-group">
                    <label className="form-label">{t("Pin Code")}</label>
                    <input
                      type="number"
                      className="form-control"
                      {...registerEditAddress("pinCode", {
                        required: "This field is required",
                        pattern: {
                          value: /^\d*[1-9]\d*$/,
                          message: "Please enter positive digits only",
                        },
                      })}
                    />

                    {errorsEditAddress.pinCode && (
                      <span className="text-danger">
                        {t(errorsEditAddress.pinCode.message)}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t("City")}</label>
                    <input
                      type="text"
                      className="form-control"
                      {...registerEditAddress("city", {
                        required: "This field is required",
                        setValueAs: (v) => v.trim(),
                      })}
                    />
                    {errorsEditAddress.city && (
                      <span className="text-danger">
                        {t(errorsEditAddress.city.message)}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t("State")}</label>
                    <input
                      type="text"
                      className="form-control"
                      {...registerEditAddress("state", {
                        required: "This field is required",
                        setValueAs: (v) => v.trim(),
                      })}
                    />
                    {errorsEditAddress.state && (
                      <span className="text-danger">
                        {t(errorsEditAddress.state.message)}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t("Country")}</label>
                    <select
                      className="form-control"
                      {...registerEditAddress("countryId", {
                        required: "This field is required",
                        setValueAs: (v) => v.trim(),
                      })}
                    >
                      <option value="">Select</option>
                      {countries?.map((val) => {
                        return <option value={val._id}>{val.name}</option>;
                      })}
                    </select>

                    {errorsEditAddress.countryId && (
                      <span className="text-danger">
                        {t(errorsEditAddress.countryId.message)}
                      </span>
                    )}
                  </div>

                  <div class="modal-footer btn_sign discard">
                    <button className="btn-primary" type="submit">
                      {t("Edit Address")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal show={isPaymentModalOpen} onHide={closePaymentModalHandler}>
        <Modal.Header>
          <Modal.Title>
            {paymentStep == 1 ? t("Payment Options") : t("Installment Options")}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {paymentStep == 1 && (
            <>
              <div className=" PaymentTypeBox">
                <Button
                  variant="secondary"
                  onClick={() => setPaymentType(1)}
                  className={paymentType == 1 ? "payment_method_active" : ""}
                >
                  {`${t("Pay")} ${sign} ${totalPrice} ${t("now")}`}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setPaymentType(2)}
                  className={paymentType == 2 ? "payment_method_active" : ""}
                >
                  {`${t("Pay")} ${sign} ${totalPrice} ${t("in installments")}`}
                </Button>
              </div>
            </>
          )}

          {paymentStep == 2 && (
            <div>
              {checkoutData.installmentOptions.length > 0 &&
                checkoutData.installmentOptions.map((item, idx) => {
                  return (
                    <Fragment key={idx}>
                      <div class="form-group custom_radio">
                        <input
                          type="radio"
                          id={`option_${idx}`}
                          name="emi_value"
                          onChange={(e) => {
                            setIsCustomEmiSelected(false);
                            setEmiData(item.data);
                          }}
                        />
                        <label htmlFor={`option_${idx}`}>{item.text}</label>
                      </div>
                    </Fragment>
                  );
                })}
              <div class="form-group custom_radio">
                <input
                  type="radio"
                  id="custom"
                  name="emi_value"
                  value="custom"
                  onChange={(e) => {
                    resetEmiData();
                    setIsCustomEmiSelected(true);
                  }}
                />
                <label for="custom">Custom</label>
              </div>
            </div>
          )}

          {paymentStep == 2 && (
            <div className="mt-5">
              <form onSubmit={handleSubmitEmi(emiSubmitHandler)}>
                {isCustomEmiSelected && (
                  <>
                    <div className="form-group ">
                      <label className="form-label">
                        {t("Select Month/Week")}
                      </label>
                      <select
                        className="form-select dark-form-control mb-3"
                        id=""
                        {...registerEmi("month_week", {
                          required: "This field is required",
                        })}
                      >
                        <option value="">{t("Select")}</option>
                        <option value="M">Month</option>
                        <option value="W">Week</option>
                      </select>
                      {errorsEditEmi.month_week && (
                        <span className="text-danger">
                          {t(errorsEditEmi.month_week.message)}
                        </span>
                      )}
                    </div>
                    <div className="form-group ">
                      <label className="form-label">{t("Frequency")}</label>
                      <select
                        className="form-select dark-form-control mb-3"
                        id=""
                        {...registerEmi("frequency", {
                          required: "This field is required",
                        })}
                      >
                        <option value="">{t("Select")}</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                        <option value="11">11</option>
                        <option value="12">12</option>
                      </select>
                      {errorsEditEmi.frequency && (
                        <span className="text-danger">
                          {t(errorsEditEmi.frequency.message)}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t("Term")}</label>
                      <input
                        type="number"
                        className="form-control"
                        {...registerEmi("term", {
                          required: "This field is required",
                        })}
                        min="2"
                      />
                      {errorsEditEmi.term && (
                        <span className="text-danger">
                          {t(errorsEditEmi.term.message)}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        {t("Initial Payment Percentage")}
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        {...registerEmi("payment_percentage", {
                          required: "This field is required",
                        })}
                        min="10"
                        max="99"
                      />
                      {errorsEditEmi.payment_percentage && (
                        <span className="text-danger">
                          {t(errorsEditEmi.payment_percentage.message)}
                        </span>
                      )}
                    </div>
                    {emiAmounts.initial !== null &&
                      `Pay ${sign}${
                        emiAmounts.initial
                      } as a down payment and pay ${sign} ${
                        emiAmounts.installment
                      } every ${
                        month_week == "W" ? "week" : "month"
                      } for ${term} ${month_week == "W" ? "weeks" : "months"}.`}
                  </>
                )}

                <div class="modal-footer btn_sign discard">
                  <button className="btn-primary" type="submit">
                    {t("Proceed To Pay")}
                  </button>
                </div>
              </form>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {/* <Button variant="secondary"> */}
          {paymentStep == 1 && (
            <Button
              variant="secondary"
              onClick={() =>
                paymentType == 1 ? paymentHandler() : setPaymentStep(2)
              }
            >
              {paymentType == 2 ? `${t("Next")}` : `${t("Proceed To Pay")}`}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {orderData.url && (
        <OauthPopup
          windowState={windowState}
          url={orderData.url}
          onCode={onCode}
          onClose={() => {
            setOrderData({ url: null, orderId: null });
          }}
        >
          <Loader text="While processing payment, Please do not close this tab or page" />
        </OauthPopup>
      )}
    </Layout>
  );
};

export async function getServerSideProps(context) {
  await createAxiosCookies(context);

  const [countries, initialAddresses, cartData] = await Promise.all([
    getCountries(),
    getAddressData(),
    getCartItems(),
  ]);

  const { cartItems, currency, status, checkoutData } = cartData;
  if (!status || cartItems.length == 0) {
    return {
      redirect: {
        permanent: false,
        destination: `/cart`,
      },
    };
  }
  return {
    props: {
      protected: true,
      userTypes: ["customer"],
      countries,
      initialAddresses,
      cartItems,
      currency,
      initialCheckoutData: checkoutData,
      locales: {
        ...require(`../locales/index/${context.locale}.json`),
      },
    },
  };
}

export default Checkout;
