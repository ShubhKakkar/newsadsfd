import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import moment from "moment";
import { useDropzone } from "react-dropzone";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Button from "react-bootstrap/Button";
import { useTranslations } from "next-intl";
import Link from "next/link";

// import Modal from "react-modal";
import Modal from "react-bootstrap/Modal";

import Layout from "@/components/Layout";
import { Logout } from "@/components/Svg";
import { capitalizeFirstLetter, createAxiosCookies } from "@/fn";
import useRequest from "@/hooks/useRequest";
import { getProfileData, getAddressData } from "@/services/customer";
import { getCountries } from "@/services/countries";

import { MEDIA_URL } from "@/api";
import { authSuccess, logout } from "@/store/auth/action";
import GooglePlace from "@/components/GooglePlace";
import Newsletter from "@/components/Newsletter";
import BreadCrumb from "@/components/customer/BreadCrumb";
import Sidebar from "@/components/customer/Sidebar";

const imgArray = ["image/png", "image/jpeg", "image/jpg"];

const MyProfile = ({ customer, addressData, countries }) => {

  const t = useTranslations("Index");
  const dispatch = useDispatch();
  const { firstName, lastName, userId } = useSelector((state) => state.auth);

  const [show, setShow] = useState(false);
  const [showModal, setshowModal] = useState(false);
  const [editShowModal, setEditShowModal] = useState(false);
  const [allAddressData, setAllAddressData] = useState(addressData);
  const [id, setId] = useState("");
  const [updateId, setUpdateId] = useState("");
  const [mobileModel, setMobileModel] = useState(false);
  const [emailOtpModel, setEmailOtpModel] = useState(false);
  const [mobileOtpModel, setMobileOtpModel] = useState(false);
  const [timer, setTimer] = useState(180);
  const [Otptimer, setOtpTimer] = useState(180);

  const [emailModel, setEmailModel] = useState(false);

  const [isPasswordVisible, setIsPasswordVisible] = useState([
    {
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
      newCurrentPassword: false,
    },
  ]);
  const dateRef = useRef();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    addAddressRegister("street", { required: true });
  }, []);

  useEffect(() => {
    let otpTimer;
    if (emailOtpModel) {
      if (timer == 0) {
        clearInterval(otpTimer);
      } else {
        otpTimer = setInterval(() => {
          setTimer((prev) => prev - 1);
        }, 1000);
        return () => {
          clearInterval(otpTimer);
        };
      }
    }
  }, [timer]);

  useEffect(() => {
    if (mobileOtpModel) {
      let otpTimer;
      if (Otptimer == 0) {
        clearInterval(otpTimer);
      } else {
        otpTimer = setInterval(() => {
          setOtpTimer((prev) => prev - 1);
        }, 1000);
        return () => {
          clearInterval(otpTimer);
        };
      }
    }
  }, [Otptimer]);

  const {
    register: personalInformationRegister,
    handleSubmit: personalInformationHandleSubmit,
    formState: { errors: personalInformationErrors },
    setError: personalInformationSetError,
    setValue: personalInformationSetValue,
    setValueAs,
    watch,
  } = useForm();

  const {
    register: emailRegister,
    handleSubmit: emailHandleSubmit,
    formState: { errors: emailErrors },
    setError: emailSetError,
    setValue: emailSetValue,
  } = useForm();

  const {
    register: mobileRegister,
    handleSubmit: mobileHandleSubmit,
    formState: { errors: mobileErrors },
    setError: mobileSetError,
    setValue: mobileSetValue,
  } = useForm();

  const {
    register: passwordRegister,
    handleSubmit: passwordHandleSubmit,
    formState: { errors: passwordErrors },
    setError: passwordSetError,
    setValue: passwordSetValue,
    getValues: passwordGetValues,
  } = useForm();

  const {
    register: addAddressRegister,
    handleSubmit: addAddressHandleSubmit,
    formState: { errors: addAddressErrors },
    setValue: addAddressSetValue,
    clearErrors,
    watch: AddressWatch,
    getValues,
  } = useForm();

  const {
    register: editAddressRegister,
    handleSubmit: editAddressHandleSubmit,
    formState: { errors: editAddressErrors },
    setValue: editAddressSetValue,
    clearErrors: editClearErrors,
    getValues: getEditValues,
  } = useForm();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors: otpClearErrors,
  } = useForm();

  const {
    register: registerMobile,
    handleSubmit: handleMobileSubmit,
    formState: { errors: MobileOtperrors },
    // setError,
    clearErrors: otpMobileClearErrors,
  } = useForm();

  const [profilePic, setProfilePic] = useState("");
  const [uploadProfilePic, setUploadProfilePic] = useState();
  const [emailNotification, setEmailNotification] = useState();
  const [smsNotification, setSmsNotification] = useState();
  const [pushNotification, setPushNotification] = useState();

  const [countryName, setCountryName] = useState("");

  const { request, response } = useRequest();
  const { request: updateProfileRequest, response: updateProfileResponse } =
    useRequest();
  const { request: changePasswordRequest, response: changePasswordResponse } =
    useRequest();
  const { request: addressRequest, response: addressResponse } = useRequest();
  const { request: deleteRequest, response: deleteResponse } = useRequest();
  const { request: singleRequest, response: singleResponse } = useRequest();
  const { request: updateRequest, response: updateResponse } = useRequest();
  const {
    request: addressUpdateGetRequest,
    response: addressUpdateGetResponse,
  } = useRequest();
  const { request: notificationRequest, response: notificationResponse } =
    useRequest();
  const { request: smsNotificationRequest, response: smsNotificationResponse } =
    useRequest();
  const {
    request: pushNotificationRequest,
    response: pushNotificationResponse,
  } = useRequest();

  const { request: mobileUpdateRequest, response: mobileUpdateResponse } =
    useRequest();

  const { request: emailUpdateRequest, response: emailUpdateResponse } =
    useRequest();
  const { request: emailOtpRequest, response: emailOtpResponse } = useRequest();
  const { response: responseResendEmail, request: requestResendEmail } =
    useRequest();
  const { response: mobileOtpResponse, request: mobileOtpRequest } =
    useRequest();
  const { response: responseResendMobile, request: requestResendMobile } =
    useRequest();
  const { response: defaultAddressResponse, request: defaultAddressRequest } =
    useRequest();
  const [newCountryCode, setCountryCode] = useState("");

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

  const changeNotification = (e, status) => {
    status = status == true ? false : true;
    notificationRequest("PUT", "v1/customer/notification-status", {
      id: userId,
      status,
    });
  };
  const changeSmsNotification = (e, status) => {
    status = status == true ? false : true;
    smsNotificationRequest("PUT", "v1/customer/sms-notification-status", {
      id: userId,
      status,
    });
  };

  const changePushNotification = (e, status) => {
    status = status == true ? false : true;
    pushNotificationRequest("PUT", "v1/customer/push-notification-status", {
      id: userId,
      status,
    });
  };

  useEffect(() => {
    if (customer) {
      const {
        email,
        firstName,
        lastName,
        contact,
        countryCode,
        profilePic,
        dob,
        isEmailNotificationActive,
        isSmsNotificationActive,
        isPushNotificationActive,
      } = customer;
      personalInformationSetValue("firstName", firstName);
      personalInformationSetValue("lastName", lastName);
      personalInformationSetValue("contact", contact);
      personalInformationSetValue("email", email);
      setEmailNotification(isEmailNotificationActive);
      setSmsNotification(isSmsNotificationActive);
      setPushNotification(isPushNotificationActive);

      if (dob) {
        personalInformationSetValue("dob", moment(dob).format("YYYY-MM-DD"));
      }
      personalInformationSetValue("countryCode", `+${countryCode}`);
      if (profilePic) {
        setProfilePic(`${MEDIA_URL}/${profilePic}`);
      }
    }
  }, [customer]);

  useEffect(() => {
    if (updateProfileResponse && updateProfileResponse.status) {
      toast.success(updateProfileResponse.message);
      dispatch(
        authSuccess({
          firstName: updateProfileResponse.firstName,
          lastName: updateProfileResponse.lastName,
        })
      );
    }
  }, [updateProfileResponse]);

  useEffect(() => {
    if (changePasswordResponse) {
      if (changePasswordResponse.status) {
        toast.success(changePasswordResponse.message);
      }
    }
  }, [changePasswordResponse]);

  useEffect(() => {
    if (responseResendEmail && responseResendEmail.status) {
      toast.success(responseResendEmail.message);
      setTimer(180);
    }
  }, [responseResendEmail]);

  useEffect(() => {
    if (responseResendMobile && responseResendMobile.status) {
      toast.success(responseResendMobile.message);
      setOtpTimer(180);
    }
  }, [responseResendMobile]);

  useEffect(() => {
    if (emailOtpResponse && emailOtpResponse.status) {
      toast.success(emailOtpResponse.message);
      setEmailOtpModel(false);
      personalInformationSetValue("email", emailOtpResponse?.email);
    } else if (emailOtpResponse?.status == false) {
      toast.error(emailOtpResponse.message);
    }
  }, [emailOtpResponse]);

  useEffect(() => {
    if (mobileOtpResponse && mobileOtpResponse.status) {
      toast.success(mobileOtpResponse.message);
      setMobileOtpModel(false);
      personalInformationSetValue("contact", mobileOtpResponse?.contact);
      personalInformationSetValue("country", mobileOtpResponse?.countryCode);
    } else if (mobileOtpResponse?.status == false) {
      toast.error(mobileOtpResponse.message);
    }
  }, [mobileOtpResponse]);

  useEffect(() => {
    if (emailUpdateResponse && emailUpdateResponse.status) {
      setEmailModel(false);
      setEmailOtpModel(true);
      emailSetValue("email", "");
      emailSetValue("newCurrentPassword", "");
      dispatch(
        authSuccess({
          email: emailUpdateResponse.email,
        })
      );
    } else if (emailUpdateResponse?.status == false) {
      toast.error(emailUpdateResponse.message);
    }
  }, [emailUpdateResponse]);

  useEffect(() => {
    if (mobileUpdateResponse) {
      if (mobileUpdateResponse.status) {
        setMobileModel(false);
        setMobileOtpModel(true);
        emailSetValue("contact", "");
        emailSetValue("newCurrentPassword", "");
        dispatch(
          authSuccess({
            contact: mobileUpdateResponse.contact,
            countryCode: mobileUpdateResponse.contact,
          })
        );
      } else {
        toast.error(mobileUpdateResponse.message);
      }
    }
  }, [mobileUpdateResponse]);

  useEffect(() => {
    if (addressUpdateGetResponse) {
      // toast.success(addressUpdateGetResponse.message);
      setAllAddressData(addressUpdateGetResponse.address);
    }
  }, [addressUpdateGetResponse]);

  useEffect(() => {
    if (deleteResponse && deleteResponse.status) {
      toast.success(deleteResponse.message);
      const newAddressData = allAddressData.filter((item) => item._id !== id);
      setAllAddressData(newAddressData);
      setshowModal(false);
    }
  }, [deleteResponse]);

  useEffect(() => {
    if (addressResponse && addressResponse.status) {
      toast.success(addressResponse.message);
      addressData.push(addressResponse.newAddress);
      setShow(false);
      addAddressSetValue("city", "");
      addAddressSetValue("state", "");
      addAddressSetValue("name", "");
      addAddressSetValue("country", "");
      addAddressSetValue("contact", "");
      addAddressSetValue("pinCode", "");
      addAddressSetValue("location", "");
      addAddressSetValue("type", "");
      addAddressSetValue("houseNo", "");
      addAddressSetValue("street", "");
      addAddressSetValue("landmark", "");
    }
  }, [addressResponse]);

  useEffect(() => {
    if (notificationResponse && notificationResponse.status) {
      toast.success(notificationResponse?.message);
      setEmailNotification(notificationResponse?.newStatus);
    }
  }, [notificationResponse]);

  useEffect(() => {
    if (smsNotificationResponse && smsNotificationResponse.status) {
      toast.success(smsNotificationResponse?.message);
      setSmsNotification(smsNotificationResponse?.newStatus);
    }
  }, [smsNotificationResponse]);

  useEffect(() => {
    if (pushNotificationResponse && pushNotificationResponse.status) {
      toast.success(pushNotificationResponse?.message);
      setPushNotification(pushNotificationResponse?.newStatus);
    }
  }, [pushNotificationResponse]);

  useEffect(() => {
    if (updateResponse && updateResponse.status) {
      toast.success(updateResponse.message);
      // addressData.push(updateResponse.newAddress);
      // const newData = addressData.filter(
      //   (item) => item._id == updateResponse?.newAddress?._id
      // );
      // console.log(newData, "newData");
      setEditShowModal(false);
      editAddressSetValue("city", "");
      editAddressSetValue("name", "");
      editAddressSetValue("country", "");
      editAddressSetValue("contact", "");
      editAddressSetValue("state", "");
      editAddressSetValue("pinCode", "");
      editAddressSetValue("location", "");
      editAddressSetValue("type", "");
      editAddressSetValue("houseNo", "");
      editAddressSetValue("street", "");
      editAddressSetValue("landmark", "");
      editAddressSetValue("countryId", "");
      addressUpdateGetRequest("GET", "v1/address");
    }
  }, [updateResponse]);

  useEffect(() => {
    if (defaultAddressResponse && defaultAddressResponse.status) {
      toast.success(defaultAddressResponse.message);
      addressUpdateGetRequest("GET", "v1/address");
    }
  }, [defaultAddressResponse]);

  useEffect(() => {
    if (response && response.status) {
      const { profilePic } = response;
      if (profilePic) {
        toast.success(response.message);
        setProfilePic(`${MEDIA_URL}/${profilePic}`);
        dispatch(authSuccess({ profilePic: response.profilePic }));
      } else if (profilePic == null) {
        toast.success("Profile pic deleted successfully");
      }
    }
  }, [response]);

  useEffect(() => {
    if (singleResponse) {
      editAddressSetValue("city", singleResponse?.addressData?.city);
      editAddressSetValue("state", singleResponse?.addressData?.state);
      editAddressSetValue("pinCode", singleResponse?.addressData?.pinCode);
      editAddressSetValue("location", singleResponse?.addressData?.location);
      editAddressSetValue("type", singleResponse?.addressData?.type);
      editAddressSetValue("houseNo", singleResponse?.addressData?.houseNo);
      editAddressSetValue("street", singleResponse?.addressData?.street);
      editAddressSetValue("landmark", singleResponse?.addressData?.landmark);
      editAddressSetValue("name", singleResponse?.addressData?.name);
      editAddressSetValue("country", singleResponse?.addressData?.countryCode);
      editAddressSetValue("contact", singleResponse?.addressData?.contact);
      editAddressSetValue("countryId", singleResponse?.addressData?.countryId);
      setCountryCode(singleResponse?.addressData?.countryCode);
      setCountryName(singleResponse?.addressData?.countryName);
    }
  }, [singleResponse]);

  const personalInformationOnsubmit = (data) => {
    const { firstName, lastName, dob } = data;
    let extras = {};
    if (dob) {
      extras.dob = dob;
    }
    updateProfileRequest("PUT", "v1/customer/update-profile", {
      firstName,
      lastName,
      ...extras,
    });
  };
  const passwordChangeHandler = (data) => {
    const { oldPassword, newPassword } = data;
    changePasswordRequest("PUT", "v1/customer/update-password", {
      oldPassword,
      newPassword,
    });
  };

  const profilePicHandler = (isDelete) => {
    const formData = new FormData();
    if (isDelete) {
      formData.append("profilePic", "");
      setProfilePic("");
      setUploadProfilePic("");
      dispatch(authSuccess({ profilePic: "" }));
      request("PUT", "v1/customer/profile-pic", formData);
    } else {
      if (uploadProfilePic) {
        formData.append("profilePic", uploadProfilePic);
        request("PUT", "v1/customer/profile-pic", formData);
      }
    }
  };

  const addressSubmitHandler = (data) => {
    const {
      city,
      houseNo,
      landmark,
      pinCode,
      state,
      street,
      type,
      location,
      name,
      contact,
      country,
      countryName,
      countryId,
    } = data;

    addressRequest("POST", "v1/address", {
      city,
      houseNo,
      landmark,
      pinCode,
      state,
      street,
      type,
      name,
      contact,
      country,
      location,
      countryName,
      countryId,
    });
  };

  const editAddressSubmitHandler = (data) => {
    const {
      city,
      houseNo,
      landmark,
      pinCode,
      state,
      street,
      type,
      location,
      name,
      contact,
      country,
      countryId,
    } = data;

    updateRequest("PUT", `v1/address`, {
      city,
      houseNo,
      landmark,
      pinCode,
      state,
      street,
      name,
      contact,
      country,
      type,
      location,
      id: updateId,
      countryName: countryName,
      countryId
    });
  };
  const saveLocationHandler = (address, geoLocation) => {
    clearErrors("street");
    addAddressSetValue("street", address);
    addAddressSetValue("location", {
      coordinates: geoLocation ? [geoLocation.lng, geoLocation.lat] : "",
      type: "Point",
    });
  };

  const editSaveLocationHandler = (address, geoLocation) => {
    editClearErrors("warehouseAddress");
    editAddressSetValue("street", address);
    editAddressSetValue("location", {
      coordinates: geoLocation ? [geoLocation.lng, geoLocation.lat] : "",
      type: "Point",
    });
  };

  const deleteAddress = () => {
    deleteRequest("DELETE", "v1/address", {
      id,
    });
  };

  const hideModal = () => {
    setshowModal(false);
  };
  const removePopUpModal = (e, id) => {
    setshowModal(true);
    setId(id);
  };

  const editPopUpModal = (e, id) => {
    setEditShowModal(true);
    setUpdateId(id);
    singleRequest("GET", `v1/address/${id}`);
  };

  const editEmail = (e) => {
    setEmailModel(true);
    // emailUpdateRequest("POST", "v1/customer/change-email",);
    // console.log(email);
  };

  const editMobile = (e) => {
    setMobileModel(true);
    // console.log(email);
  };

  const editEmailSubmitHandler = (data) => {
    const { email, newCurrentPassword } = data;
    emailUpdateRequest("POST", "v1/customer/change-email", {
      email,
      password: newCurrentPassword,
    });
  };

  const editMobileSubmitHandler = (data) => {
    const { contact, newCurrentPassword, country } = data;
    mobileUpdateRequest("POST", "v1/customer/change-phone", {
      contact,
      password: newCurrentPassword,
      country,
    });
  };

  const inputfocus = (elmnt) => {
    let value = elmnt.target.value;
    otpClearErrors("otp1");
    if (elmnt.key === "Delete" || elmnt.key === "Backspace") {
      const next = elmnt.target.tabIndex - 2;
      if (next > -1) {
        elmnt.target.form.elements[next].focus();
      }
    } else if (!value.match(/^[0-9]+$/)) {
      elmnt.target.value = "";
    } else {
      const next = elmnt.target.tabIndex;
      if (next < 4) {
        elmnt.target.form.elements[next].focus();
      }
    }
  };

  const inputfocusMobileOtp = (elmnt) => {
    let value = elmnt.target.value;
    otpMobileClearErrors("otp1");
    if (elmnt.key === "Delete" || elmnt.key === "Backspace") {
      const next = elmnt.target.tabIndex - 2;
      if (next > -1) {
        elmnt.target.form.elements[next].focus();
      }
    } else if (!value.match(/^[0-9]+$/)) {
      elmnt.target.value = "";
    } else {
      const next = elmnt.target.tabIndex;
      if (next < 4) {
        elmnt.target.form.elements[next].focus();
      }
    }
  };

  const onEmailVerifyHandler = (data) => {
    const { otp1, otp2, otp3, otp4 } = data;

    const otp = `${otp1}${otp2}${otp3}${otp4}`;

    emailOtpRequest("POST", "v1/customer/verify-change-email", {
      otp,
    });
  };

  const onMobileVerifyHandler = (data) => {
    const { otp1, otp2, otp3, otp4 } = data;

    const otp = `${otp1}${otp2}${otp3}${otp4}`;

    mobileOtpRequest("POST", "v1/customer/verify-change-phone", {
      otp,
    });
  };

  const handleResendEmail = () => {
    requestResendEmail("POST", `v1/customer/resend-change-email-otp`);
  };

  const handleResendMobile = () => {
    requestResendMobile("POST", `v1/customer/resend-change-phone-otp`);
  };

  const deafultAddress = (e, id) => {
    defaultAddressRequest("POST", "v1/address/default-address", { id });
  };

  return (
    <Layout seoData={{ pageTitle: "My Profile - Noonmar" }}>
      <section className="dashboard">
        <div className="container">
          <BreadCrumb values={["My Profile"]} />

          <div className="row">
            <Sidebar />

            <div className="col-md-9 col-xl-10 w100MD" id="myProfile">
              <div className="dashboardRightBlock">
                <div className="pageTopTitle">
                  <h2 className="RightBlockTitle">
                    {t("Personal Information")}
                  </h2>
                  <a
                    onClick={() => dispatch(logout())}
                    className="DashlogOutBtn cursor"
                  >
                    <Logout />
                    {t("Logout")}
                  </a>
                </div>
                <div className="personal_info_page">
                  <div className="img_upload">
                    <div className="personal_info_page">
                      <div className="img_upload">
                        <div className="img_profile_banner position-relative">
                          <div {...getRootProps({ className: "dropzone" })}>
                            <input {...getInputProps()} />
                            <div className="img_profile_banner">
                              {profilePic ? (
                                <img src={profilePic} alt="" />
                              ) : (
                                <img src="/assets/img/user.png" alt="" />
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
                    <form
                      onSubmit={personalInformationHandleSubmit(
                        personalInformationOnsubmit
                      )}
                    >
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group ">
                            <label className="form-label">
                              {t("First Name")}
                            </label>
                            <input
                              type="text"
                              name="fname"
                              placeholder={t("First Name")}
                              className="form-control dark-form-control   "
                              defaultValue=""
                              {...personalInformationRegister("firstName", {
                                required: true,
                                setValueAs: (v) => v.trim(),
                              })}
                            />
                            {personalInformationErrors.firstName?.type ===
                              "required" && (
                              <span className="text-danger">
                                {t("This field is required")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group ">
                            <label className="form-label">
                              {t("Last Name")}
                            </label>
                            <input
                              type="text"
                              name="lname"
                              className="form-control dark-form-control   "
                              placeholder={t("Last Name")}
                              {...personalInformationRegister("lastName", {
                                required: true,
                                setValueAs: (v) => v.trim(),
                              })}
                            />
                            {personalInformationErrors.lastName?.type ===
                              "required" && (
                              <span className="text-danger">
                                {t("This field is required")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group ">
                            <label className="form-label">{t("Email")}</label>
                            <div className="inneditBtn">
                              <input
                                type="email"
                                name="email"
                                placeholder={t("Email")}
                                className="form-control dark-form-control"
                                defaultValue=""
                                disabled
                                {...personalInformationRegister("email", {
                                  required: false,
                                })}
                              />
                              {/* <span
                                className="InputEditBtn"
                                onClick={(e) => editEmail(e)}
                                style={{ cursor: "pointer" }}
                              >
                                <i class="fa fa-edit"></i>
                              </span> */}
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group ">
                            <label className="form-label">
                              {t("Date of birth")}
                            </label>
                            <input
                              type="date"
                              name="date"
                              className="form-control dark-form-control"
                              defaultValue=""
                              placeholder={t("DOB")}
                              max={moment(new Date()).format("YYYY-MM-DD")}
                              {...personalInformationRegister("dob", {
                                required: true,
                              })}
                            />
                            {personalInformationErrors.dob?.type ===
                              "required" && (
                              <span className="text-danger">
                                {t("This field is required")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">
                            {t("Mobile Number")}
                          </label>
                          <div className="row">
                            <div className="col-md-3 col-lg-3 col-sm-3">
                              <div className="form-group ">
                                <input
                                  type="text"
                                  name="number"
                                  className="form-control dark-form-control"
                                  placeholder="+11"
                                  defaultValue=""
                                  disabled
                                  {...personalInformationRegister(
                                    "countryCode",
                                    {
                                      required: true,
                                    }
                                  )}
                                />
                              </div>
                            </div>
                            <div className="col-md-9 col-lg-9 col-sm-9">
                              <div className="form-group ">
                                <div className="inneditBtn">
                                  <input
                                    type="text"
                                    name="number"
                                    className="form-control dark-form-control"
                                    placeholder=""
                                    disabled
                                    defaultValue=""
                                    {...personalInformationRegister("contact", {
                                      required: true,
                                    })}
                                  />
                                  <span
                                    className="InputEditBtn"
                                    onClick={(e) => editMobile(e)}
                                    style={{ cursor: "pointer" }}
                                  >
                                    <i class="fa fa-edit"></i>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="upload-btn-wrapper">
                        <button className="img_upload_btn" type="submit">
                          {t("Update")}
                        </button>
                        {/* <input type="file" name="myfile" /> */}
                      </div>
                    </form>
                  </div>
                  {/* password section */}
                  <div
                    id="updatePassword"
                    style={{ position: "relative", bottom: "400px" }}
                  ></div>
                  <div className="password_change_banner">
                    <div className="infomation_title_banner">
                      <h3 className="info_title">{t("Change Password")}</h3>
                    </div>
                    <div className="profile_information_banner">
                      <form
                        onSubmit={passwordHandleSubmit(passwordChangeHandler)}
                      >
                        <div className="row">
                          <div className="col-md-6 col-lg-4 ">
                            <div className="form-group ">
                              <label className="form-label">
                                {t("Current Password")}
                              </label>
                              <input
                                type={
                                  isPasswordVisible.currentPassword
                                    ? "text"
                                    : "password"
                                }
                                name="fname"
                                placeholder=""
                                className="form-control dark-form-control   "
                                {...passwordRegister("oldPassword", {
                                  required: true,
                                })}
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
                              {passwordErrors.oldPassword?.type ===
                                "required" && (
                                <span className="text-danger">
                                  {t("This field is required")}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-md-6 col-lg-4 ">
                            <div className="form-group">
                              <label className="form-label">
                                {t("New Password")}
                              </label>
                              <input
                                type={
                                  isPasswordVisible.newPassword
                                    ? "text"
                                    : "password"
                                }
                                id="password-field"
                                name="lname"
                                placeholder=""
                                className="form-control dark-form-control "
                                {...passwordRegister("newPassword", {
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
                              {passwordErrors.newPassword?.type ===
                                "required" && (
                                <span className="text-danger">
                                  {t("This field is required")}
                                </span>
                              )}
                              {passwordErrors.newPassword?.type ===
                                "pattern" && (
                                <span className="text-danger ">
                                  {t(
                                    "Confirm Password must be of 8 or more characters long with atleast one number, one special character, one small and one capital letter"
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-md-6 col-lg-4 ">
                            <div className="form-group ">
                              <label className="form-label">
                                {t("Confirm Password")}
                              </label>
                              <input
                                type={
                                  isPasswordVisible.confirmPassword
                                    ? "text"
                                    : "password"
                                }
                                name="cNewPassword"
                                placeholder=""
                                className="form-control dark-form-control   "
                                {...passwordRegister("cNewPassword", {
                                  required: true,
                                  validate: (value) => {
                                    const { newPassword } = passwordGetValues();
                                    return newPassword === value;
                                  },
                                })}
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
                              {passwordErrors.cNewPassword?.type ===
                                "required" && (
                                <span className="text-danger">
                                  {t("This field is required")}
                                </span>
                              )}

                              {passwordErrors.cNewPassword?.type ===
                                "validate" && (
                                <span className="text-danger ">
                                  {t(
                                    "Confirm password must be same as password!"
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="upload-btn-wrapper">
                          <button className="img_upload_btn" type="submit">
                            {t("Update")}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                  {/* card section */}
                  <div
                    id="addressBook"
                    style={{ position: "relative", bottom: "120px" }}
                  ></div>
                  <div className="my_address">
                    <div className="infomation_title_banner">
                      <h3 className="info_title">{t("My Addresses")}</h3>
                    </div>

                    <div className="card_adderss_content">
                      <div className="row g-4">
                        {allAddressData &&
                          allAddressData?.map((item) => {
                            return (
                              <>
                                <div className="col-md-6 col-lg-6 col-xl-4">
                                  <div className="address_card">
                                    <span className="Default_title" />
                                    <div className="address_card_container">
                                      <div className="address_area">
                                        <span>
                                          <img
                                            src="/assets/img/home_icon.png"
                                            alt=""
                                          />
                                        </span>
                                        <h4 className="address_area_title">
                                          {capitalizeFirstLetter(item?.type)}
                                        </h4>
                                      </div>
                                      <div className="address_banner_title">
                                        <h3 className="address_card_title">
                                          {item?.name ? item?.name : "-"}
                                        </h3>
                                        <p className="address_sub_title">
                                          {item.houseNo} {item.street}
                                        </p>
                                        <p className="address_sub_title">
                                          {/* {item.city}
                                          {item.state} */}
                                          {item.pinCode}
                                        </p>
                                        <p className="address_sub_title">
                                          <span className="white-space-nowrap">
                                            {t("Phone Number:")}
                                          </span>
                                          <span className="white-space-nowrap">
                                            {item.contact ? item.contact : ""}
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                    <span className="edit_title">
                                      <a
                                        style={{ cursor: "pointer" }}
                                        onClick={(e) =>
                                          editPopUpModal(e, item._id)
                                        }
                                      >
                                        {t("EDIT")}
                                        {"  "}
                                      </a>
                                      <span className="seprator-line">|</span>
                                      <a
                                        style={{ cursor: "pointer" }}
                                        onClick={(e) =>
                                          removePopUpModal(e, item._id)
                                        }
                                      >
                                        {t("REMOVE")}
                                      </a>
                                      {item.defaultAddress == false ? (
                                        <>
                                          <span className="seprator-line">
                                            |
                                          </span>
                                          <a
                                            style={{ cursor: "pointer" }}
                                            onClick={(e) =>
                                              deafultAddress(e, item._id)
                                            }
                                          >
                                            {t("DEFAULT")}
                                          </a>
                                        </>
                                      ) : (
                                        ""
                                      )}
                                      {/* <span className="seprator-line">|</span> */}
                                    </span>
                                  </div>
                                </div>
                              </>
                            );
                          })}

                        {/* <div className="col-md-6 col-lg-6 col-xl-4 ">
                          <div className="address_card">
                            <span className="Default_title" />
                            <div className="address_card_container">
                              <div className="address_area">
                                <span>
                                  <img src="/assets/img/home_icon.png" alt="" />
                                </span>
                                <h4 className="address_area_title">Home</h4>
                              </div>
                              <div className="address_banner_title">
                                <h3 className="address_card_title">
                                  Saman Ayyub
                                </h3>
                                <p className="address_sub_title">
                                  1600 Amphitheatre ParkwayMountain
                                </p>
                                <p className="address_sub_title">
                                  View, CA 94043
                                </p>
                                <p className="address_sub_title">
                                  Phone Number:
                                  <span>736368192002</span>
                                </p>
                              </div>
                            </div>
                            <span className="edit_title">
                              <a href="#!">EDIT</a>
                              <span className="seprator-line">|</span>
                              <a href="#!"> REMOVE</a>
                            </span>
                          </div>
                        </div> */}
                        <div className="col-md-6 col-lg-6 col-xl-4">
                          <div className="address_card add_banner">
                            <a
                              className="add_new_address_banner cursor"
                              onClick={handleShow}
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
                      </div>
                    </div>
                  </div>
                  {/* notifications section */}

                  <div className="my_address" id="Notifications">
                    <div className="infomation_title_banner">
                      <h3 className="info_title">
                        {t("Notifcations Settings")}
                      </h3>
                    </div>
                    <div className="notifcations_alerts">
                      <div className="row">
                        <div className="col-md-8 col-lg-9 ">
                          <div className="sms_title_banner">
                            <h4 className="sms_title">
                              {t("My SMS Alerts Settings")}{" "}
                            </h4>
                            <p className="sms_sub_title">
                              You will receive SMS Alerts between 7:30 AM and
                              9:30 PM Indian Standard Time when your package
                              isshipped, out for delivery, delivered, encounters
                              a problem or assisting you on payment failures.
                              SMS Alerts will be sent to the following mobile
                              number:
                              {/* <a href="#!" className="sms_learn">
                                {t("Learn more")}
                              </a> */}
                            </p>
                          </div>
                        </div>
                        <div className="col-md-4 col-lg-3 alerts_btnss">
                          <div className="alerts_btn">
                            <a
                              href="#!"
                              className="sms_alert_btn"
                              onClick={(e) =>
                                changeNotification(e, emailNotification)
                              }
                            >
                              {emailNotification == true
                                ? t("Disable Notifications")
                                : t("Enable Notifications")}
                              {/* // {t("Enable Alerts")} */}
                            </a>
                          </div>
                        </div>
                        <div className="row mt-3">
                          <div className="col-lg-2 col-md-4 col-sm-3 mobile_number_input">
                            <span className="mobile_num">
                              {t("Change Mobile Number:")}{" "}
                            </span>
                          </div>
                          <div className="col-lg-1 col-md-2 col-sm-3">
                            <div className="form-group ">
                              <input
                                type="text"
                                name="number"
                                className="form-control dark-form-control"
                                placeholder=""
                                defaultValue=""
                                disabled
                                {...personalInformationRegister("countryCode", {
                                  required: true,
                                })}
                              />
                            </div>
                          </div>
                          <div className="col-lg-5 col-md-5 col-sm-6">
                            <div className="form-group ">
                              <input
                                type="text"
                                name="number"
                                className="form-control dark-form-control"
                                placeholder="202-555-0114"
                                defaultValue=""
                                disabled
                                {...personalInformationRegister("contact", {
                                  required: true,
                                })}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="notifcations_alerts">
                        <div className="row">
                          <div className="col-md-8 col-lg-9">
                            <div className="sms_title_banner">
                              <h4 className="sms_title">
                                {t("Email Notifications")}{" "}
                              </h4>
                              <p className="sms_sub_title">
                                You will receive SMS Alerts between 7:30 AM and
                                9:30 PM Indian Standard Time when your package
                                is shipped, out for delivery,
                                delivered,encounters a problem or assisting you
                                on payment failures. SMS Alerts will be sent to
                                the following mobile number:
                                {/* <a href="#!" className="sms_learn">
                                  {t("Learn more")}
                                </a> */}
                              </p>
                            </div>
                          </div>
                          <div className="col-md-4 col-lg-3 alerts_btnss">
                            <div className="alerts_btn">
                              <a
                                href="#!"
                                className="sms_alert_btn sms_active_btns"
                                onClick={(e) =>
                                  changeSmsNotification(e, smsNotification)
                                }
                              >
                                {/* sms-notification-status */}
                                {smsNotification == true
                                  ? t("Disable Notifications")
                                  : t("Enable Notifications")}

                                {/* {t("Disable Notifications")} */}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="notifcations_alerts">
                        <div className="row">
                          <div className="col-md-8 col-lg-9 ">
                            <div className="sms_title_banner">
                              <h4 className="sms_title">
                                {t("Push Notifications")}
                              </h4>
                              <p className="sms_sub_title">
                                You will receive SMS Alerts between 7:30 AM and
                                9:30 PM Indian Standard Time when your package
                                is shipped, out for delivery, delivered,
                                encounters a problem or assisting you on payment
                                failures. SMS Alerts will be sent to the
                                following mobile number:
                                <a href="#!" className="sms_learn">
                                  {t("Learn more")}
                                </a>
                              </p>
                            </div>
                          </div>
                          <div className="col-md-4 col-lg-3 alerts_btnss">
                            <div className="alerts_btn">
                              {/* <a href="#!" className="sms_alert_btn">
                                {t("Enable Notifications")}
                              </a> */}

                              <a
                                href="#!"
                                className="sms_alert_btn sms_active_btns"
                                onClick={(e) =>
                                  changePushNotification(e, pushNotification)
                                }
                              >
                                {/* sms-notification-status */}
                                {pushNotification == true
                                  ? t("Disable Notifications")
                                  : t("Enable Notifications")}

                                {/* {t("Disable Notifications")} */}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* managePayments section */}
                    <div
                      id="managePayments"
                      style={{ position: "relative", bottom: "400px" }}
                    ></div>
                    <div className="my_address">
                      <div className="infomation_title_banner">
                        <h3 className="info_title">
                          {t("Manage Payment Method")}
                        </h3>
                      </div>
                      <div className="payment_method">
                        <div className="payment_saved_cards">
                          <a href="#!" className="saved_cards_btn save-card">
                            {t("Saved Cards")}{" "}
                            <i className="fas fa-caret-down" />
                          </a>
                          <a
                            href="#!"
                            className="new_active_btn saved_cards_btn add-newcard"
                          >
                            {t("Add New card")}
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
                              <p className="bank_banner_name">{t("Bank")}</p>
                              <h4 className="bank_title_name">
                                {t("Ziraat Bankası")}
                              </h4>
                            </div>
                            <div className="bank_number">
                              <p className="bank_banner_name">{t("Number")}</p>
                              <h4 className="bank_title_name">1234</h4>
                            </div>
                            <div className="bank_account_name">
                              <p className="bank_banner_name">
                                {t("Account Name")}
                              </p>
                              <h4 className="bank_title_name">
                                {t("Hızır Kocaman")}
                              </h4>
                            </div>
                            <div className="bank_ex_date">
                              <p className="bank_banner_name">{t("Ex Date")}</p>
                              <h4 className="bank_title_name">"12/34"</h4>
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
                              <p className="bank_banner_name">{t("Bank")}</p>
                              <h4 className="bank_title_name">
                                {t("Ziraat Bankası")}
                              </h4>
                            </div>
                            <div className="bank_number">
                              <p className="bank_banner_name">{t("Number")}</p>
                              <h4 className="bank_title_name">"1234"</h4>
                            </div>
                            <div className="bank_account_name">
                              <p className="bank_banner_name">
                                {"Account Name"}
                              </p>
                              <h4 className="bank_title_name">
                                {t("Hızır Kocaman")}
                              </h4>
                            </div>
                            <div className="bank_ex_date">
                              <p className="bank_banner_name">{t("Ex Date")}</p>
                              <h4 className="bank_title_name">"12/34"</h4>
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
                                {t("Add New card")}{" "}
                              </span>
                            </div>
                            <div className="bank_name_india">
                              <img src="/assets/img/bank_logo.png" alt="" />
                            </div>
                          </div>
                          {/*  */}
                          <div className="manage_card_input">
                            <div className="card_digit_no">
                              <h4>{t("Card number")}</h4>
                              <p>
                                {t(
                                  "Enter the 16-digit card number on the card"
                                )}
                              </p>
                            </div>
                            <div className="card_digit_input">
                              <div className="form-group has-search">
                                <span className="fal fa-credit-card form-control-feedback" />
                                <input type="text" className="form-control" />
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
                              <h4>{t("Card owner")}</h4>
                              <p>{t("Enter the name on the card")}</p>
                            </div>
                            <div className="card_digit_input">
                              <div className="form-group">
                                <input type="text" className="form-control" />
                              </div>
                            </div>
                          </div>
                          <div className="manage_card_input">
                            <div className="card_digit_no">
                              <h4>{t("Expiry date")}</h4>
                              <p>{t("Enter the expration date of the card")}</p>
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
                                    <h4 className="cv_title">{t("CVV2")}</h4>
                                    <p className="code_title">
                                      {t("Security code")}
                                    </p>
                                  </div>
                                  <div className="customCard-col exp012">
                                    <input
                                      type="text"
                                      className="form-control exp_dates"
                                      placeholder="012"
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
                              <label htmlFor="check1" className="click_reme">
                                {t("Save Card for future Transactions")}
                              </label>
                            </div>
                            <div className="save_button_footer">
                              <a href="#!" className="save_upload_btn">
                                {t("SAVE NOW")}
                              </a>
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
        </div>
      </section>

      {/* Subscribe */}
      <Newsletter />
      <Modal show={show} onHide={handleClose}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">
              {"Add Address"}
            </h5>
            <button
              type="button"
              className="btn-close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={() => handleClose()}
            ></button>
          </div>
          <div className="modal-body">
            <div className="continueBx_">
              <div className="form_input_area">
                <form onSubmit={addAddressHandleSubmit(addressSubmitHandler)}>
                  <div className="form-group">
                    <label className="form-label">{t("Name")}</label>
                    <input
                      type="text"
                      className="form-control"
                      {...addAddressRegister("name", {
                        required: true,
                        setValueAs: (v) => v.trim(),
                      })}
                    />
                    {addAddressErrors.name &&
                      addAddressErrors?.name.type === "required" && (
                        <span className="text-danger">
                          {t("Please provide the necessary details")}
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
                          name=""
                          id=""
                          {...addAddressRegister("country", {
                            required: true,
                          })}
                        >
                          <option value="">{t("Select")}</option>
                          {countries?.map((item, index) => {
                            return (
                              <option value={item?._id} key={item?._id}>
                                +{item?.countryCode}
                              </option>
                            );
                          })}
                        </select>
                        {addAddressErrors.country?.type === "required" && (
                          <span className="text-danger">
                            {t("This field is required")}
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
                          {...addAddressRegister("contact", {
                            required: true,
                          })}
                        />
                        {addAddressErrors.contact?.type === "required" && (
                          <span className="text-danger">
                            {t("This field is required")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t("Type")}</label>
                    <select
                      className="form-control"
                      {...addAddressRegister("type", {
                        required: true,
                      })}
                    >
                      <option value="home">{t("HOME")}</option>
                      <option value="work">{t("WORK")}</option>
                    </select>
                    {/* <select
                        type="text"
                        className="form-control"
                        {...addAddressRegister("type", {
                          required: true,
                          setValueAs: (v) => v.trim(),
                        })}
                      /> */}
                    {addAddressErrors.type &&
                      addAddressErrors.type.type === "required" && (
                        <span className="text-danger">
                          {t("Please provide the necessary details")}
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
                      {...addAddressRegister("houseNo", {
                        required: true,
                        setValueAs: (v) => v.trim(),
                      })}
                    />
                    {addAddressErrors.houseNo &&
                      addAddressErrors.houseNo.type === "required" && (
                        <span className="text-danger">
                          {t("Please provide the necessary details")}
                        </span>
                      )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t("Street")}</label>
                    <GooglePlace
                      saveAddress={saveLocationHandler}
                      setValue={addAddressSetValue}
                    />

                    {addAddressErrors.street &&
                      addAddressErrors.street.type === "required" && (
                        <span className="text-danger">
                          {t("This field is required")}
                        </span>
                      )}
                    {addAddressErrors.street &&
                      addAddressErrors.street.type === "manual" && (
                        <span className="text-danger">
                          {t("Please enter valid address")}
                        </span>
                      )}
                    {/* <GooglePlace
                        placeholder={t("Road name,Area,Colony Name")}
                        saveAddress={saveAreaHandler}
                        setValue={addAddressSetValue}
                      />
                      {personalInformationErrors.address?.type === "manual" && (
                        <p className="invalid-feedback">
                          The address field is required.
                        </p>
                      )}
                      {personalInformationErrors.address?.type ===
                        "manual1" && (
                        <p className="invalid-feedback">
                          The address field is invalid.
                        </p>
                      )} */}
                    {/* <span
                        className="inputicon"
                        onClick={getCurrentLocationHandler}
                      ></span> */}
                    {/* {addAddressErrors.lastName &&
                        addAddressErrors.lastName.type === "required" && (
                          <span className="invalid-feedback">
                            {t("Last Name is required")}
                          </span>
                        )} */}
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t("Landmark")}</label>
                    <input
                      type="text"
                      className="form-control"
                      {...addAddressRegister("landmark", { required: false })}
                    />

                    {addAddressErrors.landmark &&
                      addAddressErrors.landmark.type === "required" && (
                        <span className="invalid-feedback">
                          {t("Please provide the necessary details")}
                        </span>
                      )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t("Pin Code")}</label>
                    <input
                      type="number"
                      className="form-control"
                      {...addAddressRegister("pinCode", {
                        required: true,
                        pattern: {
                          value: /^\d*[1-9]\d*$/,
                          message: "Please enter positive digits only",
                        },
                      })}
                    />

                    {addAddressErrors.pinCode &&
                      addAddressErrors.pinCode.type === "required" && (
                        <span className="text-danger">
                          {t("Please provide the necessary details")}
                        </span>
                      )}
                    {addAddressErrors.pinCode &&
                      addAddressErrors.pinCode.type === "pattern" && (
                        <span className="text-danger">
                          {t("Please enter valid pin code")}
                        </span>
                      )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t("City")}</label>
                    <input
                      type="text"
                      className="form-control"
                      {...addAddressRegister("city", {
                        required: true,
                        setValueAs: (v) => v.trim(),
                      })}
                    />
                    {addAddressErrors.city &&
                      addAddressErrors.city.type === "required" && (
                        <span className="text-danger">
                          {t("Please provide the necessary details")}
                        </span>
                      )}
                    {addAddressErrors.city &&
                      addAddressErrors.city.type === "pattern" && (
                        <span className="text-danger">
                          {t("Please provide the necessary details")}
                        </span>
                      )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t("State")}</label>
                    <input
                      type="text"
                      className="form-control"
                      {...addAddressRegister("state", {
                        required: true,
                        setValueAs: (v) => v.trim(),
                      })}
                    />
                    {addAddressErrors.state &&
                      addAddressErrors.state.type === "required" && (
                        <span className="text-danger">
                          {t("Please provide the necessary details")}
                        </span>
                      )}
                    {addAddressErrors.state &&
                      addAddressErrors.state.type === "pattern" && (
                        <span className="text-danger">
                          {t("Please provide the necessary details")}
                        </span>
                      )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t("Country")}</label>
                    <select
                      className="form-control"
                      {...addAddressRegister("countryId", {
                        required: true,
                      })}
                    >
                       <option value="">Select</option>
                      {countries?.map((val)=>{
                        return(
                           <option value={val._id}>{val.name}</option>
                        )
                      })}
                    </select>
                    {addAddressErrors.countryId &&
                      addAddressErrors.countryId.type === "required" && (
                        <span className="text-danger">
                          {t("Please provide the necessary details")}
                        </span>
                      )}
                    {addAddressErrors.countryId &&
                      addAddressErrors.countryId.type === "pattern" && (
                        <span className="text-danger">
                          {t("Please provide the necessary details")}
                        </span>
                      )}
                  </div>

                  <div class="modal-footer btn_sign discard">
                    <button className="btn-primary" type="submit">
                      {t("Add Address")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal show={showModal}>
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
          <Button variant="secondary" onClick={hideModal}>
            {t("Cancel")}
          </Button>
          {/* <Button variant="danger" onClick={handleDelete}> */}
          <Button variant="danger" onClick={deleteAddress}>
            {t("Delete")}
          </Button>
        </Modal.Footer>
      </Modal>
      {/* {Edit Address Model} */}
      <Modal show={editShowModal} onHide={handleClose}>
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
              onClick={(e) => setEditShowModal(false)}
            ></button>
          </div>
          <div className="modal-body">
            <div className="continueBx_">
              <div className="form_input_area">
                <form
                  onSubmit={editAddressHandleSubmit(editAddressSubmitHandler)}
                >
                  <div className="form-group">
                    <label className="form-label">{t("Name")}</label>
                    <input
                      type="text"
                      className="form-control"
                      {...editAddressRegister("name", {
                        required: true,
                        setValueAs: (v) => v.trim(),
                      })}
                    />
                    {editAddressErrors.name &&
                      editAddressErrors.name.type === "required" && (
                        <span className="text-danger">
                          {t("Please provide the necessary details")}
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
                          {...editAddressRegister("country", {
                            required: true,
                          })}
                          defaultValue={countries.find(
                            (newItem) => newItem._id == newCountryCode
                          )}
                        >
                          <option value="">{t("Select")}</option>
                          {countries.map((item, index) => {
                            return (
                              <option value={item?._id} key={item?._id}>
                                +{item?.countryCode}
                              </option>
                            );
                          })}
                        </select>
                        {editAddressErrors.country?.type === "required" && (
                          <span className="text-danger">
                            {t("This field is required")}
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
                          {...editAddressRegister("contact", {
                            required: true,
                          })}
                        />
                        {editAddressErrors.contact?.type === "required" && (
                          <span className="text-danger">
                            {t("This field is required")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t("Type")}</label>
                    <select
                      className="form-control"
                      {...editAddressRegister("type", {
                        required: true,
                      })}
                    >
                      <option value="home">{t("HOME")}</option>
                      <option value="work">{t("WORK")}</option>
                    </select>
                    {/* <select
                        type="text"
                        className="form-control"
                        {...addAddressRegister("type", {
                          required: true,
                          setValueAs: (v) => v.trim(),
                        })}
                      /> */}
                    {editAddressErrors.type &&
                      editAddressErrors.type.type === "required" && (
                        <span className="text-danger">
                          {t("Please provide the necessary details")}
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
                      {...editAddressRegister("houseNo", {
                        required: true,
                        setValueAs: (v) => v.trim(),
                      })}
                    />
                    {editAddressErrors.houseNo &&
                      editAddressErrors.houseNo.type === "required" && (
                        <span className="text-danger">
                          {t("Please provide the necessary details")}
                        </span>
                      )}
                  </div>
                  <div className="form-group">
                    <GooglePlace
                      saveAddress={editSaveLocationHandler}
                      setValue={editAddressSetValue}
                      // address={getEditValues("street")}
                      defaultAddress={getEditValues("street")}
                    />
                    {/* <GooglePlace
                      placeholder={t("Address")}
                      saveAddress={editSaveLocationHandler}
                      handleChange={editSaveLocationHandler}
                      address={getEditValues("street")}
                      setValue={editAddressSetValue}
                      name={"street"}
                    /> */}
                    {editAddressErrors.street &&
                      editAddressErrors.street.type === "required" && (
                        <span className="text-danger">
                          {t("This field is required")}
                        </span>
                      )}
                    {editAddressErrors.street &&
                      editAddressErrors.street.type === "manual" && (
                        <span className="text-danger">
                          {t("Please enter valid address.")}
                        </span>
                      )}
                    {/* <GooglePlace
                        placeholder={t("Road name,Area,Colony Name")}
                        saveAddress={saveAreaHandler}
                        setValue={addAddressSetValue}
                      />
                      {personalInformationErrors.address?.type === "manual" && (
                        <p className="invalid-feedback">
                          The address field is required.
                        </p>
                      )}
                      {personalInformationErrors.address?.type ===
                        "manual1" && (
                        <p className="invalid-feedback">
                          The address field is invalid.
                        </p>
                      )} */}
                    {/* <span
                        className="inputicon"
                        onClick={getCurrentLocationHandler}
                      ></span> */}
                    {/* {editAddressErrors.lastName &&
                        editAddressErrors.lastName.type === "required" && (
                          <span className="invalid-feedback">
                            {t("Last Name is required")}
                          </span>
                        )} */}
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t("Landmark")}</label>
                    <input
                      type="text"
                      className="form-control"
                      {...editAddressRegister("landmark", { required: false })}
                    />

                    {editAddressErrors.landmark &&
                      editAddressErrors.landmark.type === "required" && (
                        <span className="invalid-feedback">
                          {t("Please provide the necessary details")}
                        </span>
                      )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t("Pin Code")}</label>
                    <input
                      type="number"
                      className="form-control"
                      {...editAddressRegister("pinCode", {
                        required: true,
                        pattern: {
                          value: /^\d*[1-9]\d*$/,
                          message: "Please enter positive digits only",
                        },
                        setValueAs: (v) => v.trim(),
                      })}
                    />

                    {editAddressErrors.pinCode &&
                      editAddressErrors.pinCode.type === "required" && (
                        <span className="text-danger">
                          {t("Please provide the necessary details")}
                        </span>
                      )}
                    {editAddressErrors.pinCode &&
                      editAddressErrors.pinCode.type === "pattern" && (
                        <span className="text-danger">
                          {t("Please enter positive digits only")}
                        </span>
                      )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t("City")}</label>
                    <input
                      type="text"
                      className="form-control"
                      {...editAddressRegister("city", {
                        required: true,
                        setValueAs: (v) => v.trim(),
                      })}
                    />
                    {editAddressErrors.city &&
                      editAddressErrors.city.type === "required" && (
                        <span className="text-danger">
                          {t("Please provide the necessary details")}
                        </span>
                      )}
                    {editAddressErrors.city &&
                      editAddressErrors.city.type === "pattern" && (
                        <span className="text-danger">
                          {t("Please provide the necessary details")}
                        </span>
                      )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t("State")}</label>
                    <input
                      type="text"
                      className="form-control"
                      {...editAddressRegister("state", {
                        required: true,
                        setValueAs: (v) => v.trim(),
                      })}
                    />
                    {editAddressErrors.state &&
                      editAddressErrors.state.type === "required" && (
                        <span className="text-danger">
                          {t("Please provide the necessary details")}
                        </span>
                      )}
                    {editAddressErrors.state &&
                      editAddressErrors.state.type === "pattern" && (
                        <span className="text-danger">
                          {t("Please provide the necessary details")}
                        </span>
                      )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t("Country")}</label>
                    <select
                      className="form-control"
                      {...editAddressRegister("countryId", {
                        required: true,
                      })}
                    >
                       <option value="">Select</option>
                      {countries?.map((val)=>{
                        return(
                           <option value={val._id}>{val.name}</option>
                        )
                      })}
                    </select>
                    {addAddressErrors.countryId &&
                      addAddressErrors.countryId.type === "required" && (
                        <span className="text-danger">
                          {t("Please provide the necessary details")}
                        </span>
                      )}
                    {addAddressErrors.countryId &&
                      addAddressErrors.countryId.type === "pattern" && (
                        <span className="text-danger">
                          {t("Please provide the necessary details")}
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
      <Modal show={emailModel} onHide={handleClose}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">
              {t("New Email")}
            </h5>
            <button
              type="button"
              className="btn-close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={(e) => setEmailModel(false)}
            ></button>
          </div>
          <div className="modal-body">
            <div className="continueBx_">
              <div className="form_input_area">
                <form onSubmit={emailHandleSubmit(editEmailSubmitHandler)}>
                  <div className="col-md-12">
                    <div className="form-group ">
                      <label className="form-label">{t("Email")}</label>
                      <input
                        type="email"
                        name="email"
                        placeholder={t("Email")}
                        className="form-control dark-form-control"
                        defaultValue=""
                        {...emailRegister("email", {
                          required: true,
                        })}
                      />
                      {emailErrors.email?.type === "required" && (
                        <span className="text-danger">
                          {t("This field is required")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="form-group">
                      <label className="form-label">
                        {t("Current Password")}
                      </label>
                      <input
                        type={
                          isPasswordVisible.newCurrentPassword
                            ? "text"
                            : "password"
                        }
                        id="password-field"
                        placeholder=""
                        className="form-control dark-form-control "
                        {...emailRegister("newCurrentPassword", {
                          required: true,
                          // pattern: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/,
                        })}
                      />
                      <a
                        href="javascript:void(0)"
                        onClick={() => {
                          const updateP = {
                            ...isPasswordVisible,
                            newCurrentPassword:
                              isPasswordVisible.newCurrentPassword
                                ? false
                                : true,
                          };
                          setIsPasswordVisible(updateP);
                        }}
                        className={`fa fa-fw ${
                          isPasswordVisible.newCurrentPassword
                            ? "fa-eye"
                            : "fa-eye-slash"
                        } field-icon-input toggle-password`}
                      />
                      {emailErrors.newCurrentPassword?.type === "required" && (
                        <span className="text-danger">
                          {t("This field is required")}
                        </span>
                      )}
                      {/* {passwordErrors.newCurrentPassword?.type ===
                        "pattern" && (
                        <span className="text-danger ">
                          {t(
                            "Confirm password must be of 8 or more characters long with a mix of letters,numbers."
                          )}
                        </span>
                      )} */}
                    </div>
                  </div>

                  <div class="modal-footer btn_sign discard">
                    <button className="btn-primary" type="submit">
                      {t("Edit Email")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      {/* <Modal show={mobileModel} onHide={handleClose}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">
              {"New Contact Number"}
            </h5>

            <button
              type="button"
              className="btn-close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={(e) => setMobileModel(false)}
            ></button>
          </div>
          <div className="modal-body">
            <div className="continueBx_">
              <div className="form_input_area">
                <form onSubmit={mobileHandleSubmit(editAddressSubmitHandler)}>
                  <div className="col-md-12">
                    <label className="form-label">{t("Mobile Number")}</label>
                    <div className="row">
                      <div className="col-md-3 col-lg-3 col-sm-3">
                        <div className="form-group ">
                          <select
                            className="form-select dark-form-control mb-3"
                            name=""
                            id=""
                            {...mobileRegister("country", {
                              required: true,
                            })}
                          >
                            <option value="">{t("Country Code*")}</option>
                            {countries.map((item, index) => {
                              return (
                                <option value={item?._id} key={item?._id}>
                                  +{item?.countryCode}
                                </option>
                              );
                            })}
                          </select>
                          {mobileErrors.country?.type === "required" && (
                            <span className="text-danger">
                              {t("This field is required")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="col-md-9 col-lg-9 col-sm-9">
                        <div className="form-group ">
                          <input
                            type="text"
                            name="number"
                            className="form-control dark-form-control"
                            placeholder=""
                            disabled
                            defaultValue=""
                            {...mobileRegister("contact", {
                              required: true,
                            })}
                          />
                          {mobileErrors.contact?.type === "required" && (
                            <span className="text-danger">
                              {t("This field is required")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="form-group">
                      <label className="form-label">
                        {t("Current Password")}
                      </label>
                      <input
                        type={
                          isPasswordVisible.newCurrentPassword
                            ? "text"
                            : "password"
                        }
                        id="password-field"
                        placeholder=""
                        className="form-control dark-form-control "
                        {...mobileRegister("newCurrentPassword", {
                          required: true,
                          pattern: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/,
                        })}
                      />
                      <a
                        href="javascript:void(0)"
                        onClick={() => {
                          const updateP = {
                            ...isPasswordVisible,
                            newCurrentPassword:
                              isPasswordVisible.newCurrentPassword
                                ? false
                                : true,
                          };
                          setIsPasswordVisible(updateP);
                        }}
                        className={`fa fa-fw ${
                          isPasswordVisible.newCurrentPassword
                            ? "fa-eye"
                            : "fa-eye-slash"
                        } field-icon-input toggle-password`}
                      />
                      {passwordErrors.newCurrentPassword?.type ===
                        "required" && (
                        <span className="text-danger">
                          {t("This field is required")}
                        </span>
                      )}
                      {passwordErrors.newCurrentPassword?.type ===
                        "pattern" && (
                        <span className="text-danger ">
                          {t(
                            "Confirm password must be of 8 or more characters long with a mix of letters,numbers."
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  <div class="modal-footer btn_sign discard">
                    <button className="btn-primary" type="submit">
                      {t("Edit Contact Number")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Modal> */}
      <Modal show={mobileModel} onHide={handleClose}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">
              {"Edit Contact Number"}
            </h5>

            <button
              type="button"
              className="btn-close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={(e) => setMobileModel(false)}
            ></button>
          </div>
          <div className="modal-body">
            <div className="continueBx_">
              <div className="form_input_area">
                <form onSubmit={mobileHandleSubmit(editMobileSubmitHandler)}>
                  <div className="col-md-12">
                    <label className="form-label">{t("Mobile Number")}</label>
                    <div className="row">
                      <div className="col-md-5 col-lg-5 col-sm-5 w-38">
                        <div className="form-group ">
                          <select
                            className="form-select dark-form-control mb-3"
                            name=""
                            id=""
                            {...mobileRegister("country", {
                              required: true,
                            })}
                          >
                            <option value="">{t("Country Code*")}</option>
                            {countries.map((item, index) => {
                              return (
                                <option value={item?._id} key={item?._id}>
                                  +{item?.countryCode}
                                </option>
                              );
                            })}
                          </select>
                          {mobileErrors.country?.type === "required" && (
                            <span className="text-danger">
                              {t("This field is required")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="col-md-7 col-lg-7 col-sm-7 w-61">
                        <div className="form-group ">
                          <input
                            type="number"
                            name="contact"
                            className="form-control dark-form-control"
                            placeholder=""
                            defaultValue=""
                            {...mobileRegister("contact", {
                              required: true,

                              pattern: {
                                value: /^\d*[1-9]\d*$/,
                                message: "Please enter positive digits only",
                              },
                              setValueAs: (v) => v.trim(),
                            })}
                          />
                          {mobileErrors.contact?.type === "required" && (
                            <span className="text-danger">
                              {t("This field is required")}
                            </span>
                          )}
                          {mobileErrors.contact &&
                            mobileErrors.contact.type === "pattern" && (
                              <span className="text-danger">
                                {t("Please enter valid contact number")}
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="form-group">
                      <label className="form-label">
                        {t("Current Password")}
                      </label>
                      <input
                        type={
                          isPasswordVisible.newCurrentPassword
                            ? "text"
                            : "password"
                        }
                        id="password-field"
                        placeholder=""
                        className="form-control dark-form-control "
                        {...mobileRegister("newCurrentPassword", {
                          required: true,
                          // pattern: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/,
                        })}
                      />
                      <a
                        href="javascript:void(0)"
                        onClick={() => {
                          const updateP = {
                            ...isPasswordVisible,
                            newCurrentPassword:
                              isPasswordVisible.newCurrentPassword
                                ? false
                                : true,
                          };
                          setIsPasswordVisible(updateP);
                        }}
                        className={`fa fa-fw ${
                          isPasswordVisible.newCurrentPassword
                            ? "fa-eye"
                            : "fa-eye-slash"
                        } field-icon-input toggle-password`}
                      />
                      {mobileErrors.newCurrentPassword?.type === "required" && (
                        <span className="text-danger">
                          {t("This field is required")}
                        </span>
                      )}
                      {/* {passwordErrors.newCurrentPassword?.type ===
                        "pattern" && (
                        <span className="text-danger ">
                          {t(
                            "Confirm password must be of 8 or more characters long with a mix of letters,numbers."
                          )}
                        </span>
                      )} */}
                    </div>
                  </div>
                  <div class="modal-footer btn_sign discard">
                    <button className="btn-primary" type="submit">
                      {t("Edit Contact Number")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal show={emailOtpModel} onHide={handleClose}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">
              {"Otp Model"}
            </h5>

            <button
              type="button"
              className="btn-close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={(e) => setEmailOtpModel(false)}
            ></button>
          </div>
          <div className="modal-body">
            <div className="continueBx_">
              <form onSubmit={handleSubmit(onEmailVerifyHandler)}>
                <p className="mb-3 mb-md-4">
                  {t(
                    "Enter the 4 Digits code that you have recieved on your email or mobile"
                  )}
                </p>

                {/*  if mobile verify login time */}
                {/* <p className="mb-4 mb-md-5">Enter the 4 Digits code that you recieved on    your mobile.</p> */}

                <div className="form-group">
                  {/* <form onSubmit={handleSubmit(onEmailVerifyHandler)}> */}
                  <div className="codeDigit-box otpRow">
                    <input
                      className="form-control"
                      type="text"
                      name="otp1"
                      autoComplete="off"
                      tabIndex="1"
                      maxLength="1"
                      onKeyUp={(e) => inputfocus(e)}
                      {...register("otp1", {
                        required: true,
                        maxLength: 1,
                      })}
                    />
                    <input
                      className="form-control"
                      type="text"
                      name="otp2"
                      autoComplete="off"
                      tabIndex="2"
                      maxLength="1"
                      onKeyUp={(e) => inputfocus(e)}
                      {...register("otp2", {
                        required: true,
                        maxLength: 1,
                      })}
                    />
                    <input
                      className="form-control"
                      type="text"
                      name="otp3"
                      autoComplete="off"
                      tabIndex="3"
                      maxLength="1"
                      onKeyUp={(e) => inputfocus(e)}
                      {...register("otp3", {
                        required: true,
                        maxLength: 1,
                      })}
                    />
                    <input
                      className="form-control"
                      type="text"
                      name="otp4"
                      autoComplete="off"
                      tabIndex="4"
                      maxLength="1"
                      onKeyUp={(e) => inputfocus(e)}
                      {...register("otp4", {
                        required: true,
                        maxLength: 1,
                      })}
                    />
                  </div>
                  {(errors.otp1?.type === "required" ||
                    errors.otp2?.type === "required" ||
                    errors.otp3?.type === "required" ||
                    errors.otp4?.type === "required") && (
                    <p className="error-msg">{t("Please enter the OTP.")}"</p>
                  )}
                  {errors.otp1?.type === "manual" && (
                    <p className="error-msg">
                      {t("The otp entered is incorrect.")}
                    </p>
                  )}
                  {/* </form> */}
                </div>

                <div className="login_button">
                  <button type="submit" class="submit_button w-100">
                    {t("Submit")}
                  </button>
                </div>

                <div className="verify-note text-center">
                  {t("Didn't receive code ? Check your junk or spam folder")}
                </div>

                {timer ? (
                  <div className="text-center">
                    {moment.utc(timer * 1000).format("mm:ss")}
                  </div>
                ) : (
                  <div className="text-center">
                    <button
                      className="ResetOTPBtn"
                      onClick={handleResendEmail}
                      type="button"
                    >
                      {t("Resend otp")}
                    </button>{" "}
                  </div>
                )}
                {/* ** if mobile verify login time */}
              </form>
            </div>
          </div>
        </div>
      </Modal>
      <Modal show={mobileOtpModel} onHide={handleClose}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">
              {"Otp Model"}
            </h5>

            <button
              type="button"
              className="btn-close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={(e) => setMobileOtpModel(false)}
            ></button>
          </div>
          <div className="modal-body">
            <div className="continueBx_">
              <form onSubmit={handleMobileSubmit(onMobileVerifyHandler)}>
                <p className="mb-3 mb-md-4">
                  {t(
                    "Enter the 4 Digits code that you have recieved on your email or mobile"
                  )}
                </p>

                {/*  if mobile verify login time */}
                {/* <p className="mb-4 mb-md-5">Enter the 4 Digits code that you recieved on    your mobile.</p> */}

                <div className="form-group">
                  {/* <form onSubmit={handleSubmit(onEmailVerifyHandler)}> */}
                  <div className="codeDigit-box otpRow">
                    <input
                      className="form-control"
                      type="text"
                      name="otp1"
                      autoComplete="off"
                      tabIndex="1"
                      maxLength="1"
                      onKeyUp={(e) => inputfocusMobileOtp(e)}
                      {...registerMobile("otp1", {
                        required: true,
                        maxLength: 1,
                      })}
                    />
                    <input
                      className="form-control"
                      type="text"
                      name="otp2"
                      autoComplete="off"
                      tabIndex="2"
                      maxLength="1"
                      onKeyUp={(e) => inputfocusMobileOtp(e)}
                      {...registerMobile("otp2", {
                        required: true,
                        maxLength: 1,
                      })}
                    />
                    <input
                      className="form-control"
                      type="text"
                      name="otp3"
                      autoComplete="off"
                      tabIndex="3"
                      maxLength="1"
                      onKeyUp={(e) => inputfocusMobileOtp(e)}
                      {...registerMobile("otp3", {
                        required: true,
                        maxLength: 1,
                      })}
                    />
                    <input
                      className="form-control"
                      type="text"
                      name="otp4"
                      autoComplete="off"
                      tabIndex="4"
                      maxLength="1"
                      onKeyUp={(e) => inputfocusMobileOtp(e)}
                      {...registerMobile("otp4", {
                        required: true,
                        maxLength: 1,
                      })}
                    />
                  </div>
                  {(MobileOtperrors.otp1?.type === "required" ||
                    MobileOtperrors.otp2?.type === "required" ||
                    MobileOtperrors.otp3?.type === "required" ||
                    MobileOtperrors.otp4?.type === "required") && (
                    <p className="error-msg">{t("Please enter the OTP.")}"</p>
                  )}
                  {MobileOtperrors.otp1?.type === "manual" && (
                    <p className="error-msg">
                      {t("The otp entered is incorrect.")}
                    </p>
                  )}
                  {/* </form> */}
                </div>

                <div className="login_button">
                  <button type="submit" class="submit_button w-100">
                    {t("Submit")}
                  </button>
                </div>

                <div className="verify-note text-center">
                  {t("Didn't receive code ? Check your junk or spam folder")}
                </div>

                {Otptimer ? (
                  <div className="text-center">
                    {moment.utc(Otptimer * 1000).format("mm:ss")}
                  </div>
                ) : (
                  <div className="text-center">
                    <button
                      className="ResetOTPBtn"
                      onClick={handleResendMobile}
                      type="button"
                    >
                      {t("Resend otp")}
                    </button>{" "}
                  </div>
                )}
                {/* ** if mobile verify login time */}
              </form>
            </div>
          </div>
        </div>
      </Modal>
    </Layout>

    //{ Delete Model}
  );
};

export async function getServerSideProps(context) {
  await createAxiosCookies(context);

  // const customer = await getProfileData();
  // const addressData = await getAddressData();
  // const countries = await getCountries();

  const [customer, addressData, countries] = await Promise.all([
    getProfileData(),
    getAddressData(),
    getCountries(),
    // getAllCountries(),
  ]);

  return {
    props: {
      // id,
      protected: true,
      userTypes: ["customer"],
      customer,
      countries,
      addressData,
      locales: {
        ...require(`../../locales/index/${context.locale}.json`),
      },
    }, // will be passed to the page component as props
  };
}

export default MyProfile;
