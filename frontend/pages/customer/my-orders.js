import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { Modal } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import moment from "moment";
import Select from "react-select";
import Button from "react-bootstrap/Button";

import { createAxiosCookies } from "@/fn";
import useTranslate from "@/hooks/useTranslate";
import Newsletter from "@/components/Newsletter";
import Layout from "@/components/Layout";
import BreadCrumb from "@/components/customer/BreadCrumb";
import Sidebar from "@/components/customer/Sidebar";
import { BASEURL, MEDIA_URL } from "@/api";
import useRequest from "@/hooks/useRequest";
import Pagination from "@/components/Pagination";
import { getOrders, getReviewFileLimit } from "@/services/orders";
import { logout } from "@/store/auth/action";

const filterStatus = [
  { label: "Success", value: "success" },
  { label: "Failed", value: "failed" },
  { label: "Pending", value: "pending" },
];

const MyOrders = ({ allOrdersList, totalOrdersCount, reviewLimitCount }) => {
  const t = useTranslate();
  const dispatch = useDispatch();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm();

  const {
    register: cancelRegister,
    handleSubmit: cancelHandleSubmit,
    formState: { errors: cancelErrors },
  } = useForm();

  const {
    register: rejectRegister,
    handleSubmit: rejectHandleSubmit,
    formState: { errors: rejectErrors },
  } = useForm();

  const {
    register: reviewRegister,
    handleSubmit: reviewHandleSubmit,
    formState: { errors: reviewErrors },
    setError: reviewSetError,
    clearErrors: reviewClearErrors,
    setValue: reviewSetValue,
  } = useForm();

  const [orderList, setOrderList] = useState(allOrdersList);
  const [totalOrder, setTotalOrder] = useState(totalOrdersCount);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [orderItemId, setOrderItemId] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [status, setStatus] = useState("");
  const [previewImage, setPreviewImage] = useState([]);
  const [reviewSelectedImage, setReviewSelectedImage] = useState([]);

  const [scroll, setScroll] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [cancelReasonModal, setCancelReasonModal] = useState(false);
  const [returnReasonModal, setReturnReasonModal] = useState(false);
  const [showCancelButton, setShowCancelButton] = useState(true);
  const [showReturnButton, setShowReturnButton] = useState(true);
  const [showReviewButton, setShowReviewButton] = useState(true);
  const [chooseCancelModal, setChooseCancelModal] = useState(false);
  const [chooseRejectModal, setChooseRejectModal] = useState(false);

  const { request, response } = useRequest();
  const { request: cancelReq, response: cancelRes } = useRequest();
  const { request: returnReq, response: returnRes } = useRequest();
  const { request: reviewReq, response: reviewRes } = useRequest();

  const searchQuery = (page, perPage, searchValue = "", status = "") => {
    return `v1/order?page=${page}&per_page=${perPage}&name=${searchValue}&status=${status}`;
  };

  useEffect(() => {
    if (scroll) {
      const element = document.getElementById("my_Order");
      element.scrollIntoView();
      setScroll((prev) => !prev);
    }
  }, [scroll]);

  useEffect(() => {
    if (isSearch) {
      const getData = setTimeout(() => {
        request("GET", searchQuery(1, perPage, searchValue, status));
      }, 1000);

      return () => clearTimeout(getData);
    }
  }, [searchValue]);

  useEffect(() => {
    if (reviewModal) {
      reviewSetValue("rating", "");
      reviewSetValue("isRecommended", "");
      reviewSetValue("review", "");
      setPreviewImage("");
      setReviewSelectedImage("");
    }
  }, [reviewModal]);

  useEffect(() => {
    if (response) {
      if (response.status) {
        setOrderList(response.orders);
        setTotalOrder(response.totalOrders);
      }
    }
  }, [response]);

  useEffect(() => {
    if (returnRes && returnRes.status) {
      const { itemId } = returnRes;
      const oldOrderData = [...orderList];
      const indexToChange = oldOrderData.findIndex((val) => val._id == itemId);

      const newItemData = { ...oldOrderData[indexToChange] };

      const status = newItemData.status.concat([
        {
          status: "return_requested",
          name: "Return Requested",
          at: new Date(),
          completed: true,
        },
        {
          status: "out_for_pickup",
          name: "Out For Pickup",
          completed: false,
        },
        {
          status: "return_completed",
          name: "Return Completed",
          completed: false,
        },
      ]);

      newItemData.status = status;

      oldOrderData[indexToChange] = newItemData;
      setOrderList(oldOrderData);

      toast.success(returnRes.message);
      setReturnReasonModal(false);
      setShowReturnButton(false);
    }
  }, [returnRes]);

  useEffect(() => {
    if (cancelRes && cancelRes.status) {
      const { itemId } = cancelRes;
      const oldOrderData = [...orderList];
      const indexToChange = oldOrderData.findIndex((val) => val._id == itemId);

      const newItemData = { ...oldOrderData[indexToChange] };

      const status = newItemData.status.filter((s) => s.completed);

      status.push({
        status: "cancelled",
        name: "Cancelled",
        at: new Date(),
        completed: true,
      });

      newItemData.status = status;

      oldOrderData[indexToChange] = newItemData;
      setOrderList(oldOrderData);

      toast.success(cancelRes.message);
      setCancelReasonModal(false);
      setShowCancelButton(false);
    }
  }, [cancelRes]);

  useEffect(() => {
    if (reviewRes) {
      toast.success(reviewRes.message);
      setShowReviewButton(false);
    }
  }, [reviewRes]);

  const fetchMoreData = ({ selected }) => {
    setPage(selected + 1);
    request("GET", searchQuery(selected + 1, perPage, searchValue, status));
    setScroll(true);
  };

  const onSubmitRejectHandler = (data) => {
    const { reason } = data;

    returnReq("PUT", "v1/order/return", {
      itemId: orderItemId,
      reason,
    });
  };

  const onSubmitCancel = (data) => {
    const { reason } = data;

    cancelReq("PUT", "v1/order/cancel", {
      itemId: orderItemId,
      reason: reason,
    });
  };

  const reviewImageHandler = (e) => {
    reviewClearErrors("imageOrVideo");

    let filesArr = [...reviewSelectedImage];
    let previewFilesArr = [...previewImage];

    const files = e.target.files;

    for (let i = 0; i < files.length; i++) {
      filesArr.push(files[i]);
      previewFilesArr.push(URL.createObjectURL(files[i]));
    }

    setReviewSelectedImage(filesArr.slice(0, 5));
    setPreviewImage(previewFilesArr.slice(0, 5));
  };

  const onSubmitReviewHandler = (data) => {
    const { rating, review, isRecommended } = data;

    if (!rating) {
      reviewSetError("rating", {
        type: "manual",
        message: t("This field is required"),
      });
      return;
    }

    const formData = new FormData();

    formData.append("orderItemId", orderItemId);
    formData.append("rating", rating);
    formData.append("review", review);
    formData.append("isRecommended", isRecommended);

    reviewSelectedImage.forEach((image) => formData.append("file", image));

    reviewReq("POST", "v1/review", formData);

    setReviewModal(false);
  };

  const deleteImageHandler = (index) => {
    setReviewSelectedImage((prev) => prev.filter((_, idx) => idx !== index));
    setPreviewImage((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <Layout seoData={{ pageTitle: "My Orders - Noonmar" }}>
      <section className="product-search-listing">
        <div className="container" id="my_Order">
          <BreadCrumb values={["My Orders"]} />

          <div className="row g-4 gx-md-5">
            <Sidebar />

            <div className="col-lg-9">
              <div className="Wishists_product_block">
                <div className="Wishists_product">
                  <div className="heading_input">
                    <h2 className="RightBlockTitle">{t("My Orders")}</h2>
                    <div className="Wishists_product_input">
                      <input
                        type="search"
                        className="form-control"
                        placeholder={t("Search Orders")}
                        aria-label="Search"
                        value={searchValue}
                        onChange={(e) => {
                          setSearchValue(e.target.value), setIsSearch(true);
                        }}
                      />
                      <button
                        className="searchIconBtn wishistsearchIconBtn"
                        type="submit"
                      >
                        <svg
                          width={18}
                          height={18}
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M17 17L13.2223 13.2156M15.3158 8.15789C15.3158 10.0563 14.5617 11.8769 13.2193 13.2193C11.8769 14.5617 10.0563 15.3158 8.15789 15.3158C6.2595 15.3158 4.43886 14.5617 3.0965 13.2193C1.75413 11.8769 1 10.0563 1 8.15789C1 6.2595 1.75413 4.43886 3.0965 3.0965C4.43886 1.75413 6.2595 1 8.15789 1C10.0563 1 11.8769 1.75413 13.2193 3.0965C14.5617 4.43886 15.3158 6.2595 15.3158 8.15789V8.15789Z"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="col-lg-3 col-xl-3 ">
                    <Controller
                      className="form-control form-control-solid form-control-lg mb-5 col-3"
                      control={control}
                      name="status"
                      render={({ field: { onChange, value, ref } }) => {
                        return (
                          <Select
                            placeholder={t("Filter by Status")}
                            options={filterStatus}
                            isMulti={false}
                            className="form-select- form-control- dark-form-control libSelect"
                            onChange={(e) => {
                              setStatus(e?.value || "");
                              onChange(e);
                              request(
                                "GET",
                                searchQuery(
                                  1,
                                  perPage,
                                  searchValue,
                                  e?.value || ""
                                )
                              );
                            }}
                            defaultValue={{
                              label: "Success",
                              value: "success",
                            }}
                            isClearable
                          />
                        );
                      }}
                    />
                  </div>
                  <button
                    className="DashlogOutBtn"
                    onClick={() => dispatch(logout())}
                  >
                    <svg
                      width={25}
                      height={24}
                      viewBox="0 0 25 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M16.8125 8.0625L20.75 12L16.8125 15.9375"
                        stroke="white"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10.25 12H20.75"
                        stroke="white"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10.25 20.25H5C4.80109 20.25 4.61032 20.171 4.46967 20.0303C4.32902 19.8897 4.25 19.6989 4.25 19.5V4.5C4.25 4.30109 4.32902 4.11032 4.46967 3.96967C4.61032 3.82902 4.80109 3.75 5 3.75H10.25"
                        stroke="white"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                    {t("Logout")}
                  </button>
                </div>
              </div>
              {orderList.length > 0 &&
                orderList.map((item, i) => {
                  return (
                    <div
                      key={i}
                      className="order_wrraper"
                      style={{ marginBottom: "60px" }}
                    >
                      <div className="order_id">
                        <h4>{t("Order ID")}: {item.orderId}</h4>
                      </div>
                      <div className="order_details_block">
                        <div className="user_block">
                          <div className="userimg">
                            <img src={`${BASEURL}/${item.media}`} alt="" />
                          </div>
                          <div className="userdetials_inner">
                            <h3 className="proNme">{item.name}</h3>
                            <div className="proTags">
                              {item.variants?.length > 0 &&
                                item.variants.map((val, i) => {
                                  return (
                                    <span key={i}>
                                      {t(`${val.label}`)} : {val.value}
                                    </span>
                                  );
                                })}

                              <span>
                                {t("Seller name")}:
                                {item.vendorName}
                              </span>
                            </div>
                            <div className="valueText">
                              {item.total}
                              {item.currency}
                            </div>
                          </div>
                        </div>
                        <div className="address_block">
                          <h3 className="proNme">{t("Address")}</h3>
                          <div className="orderAddress">
                            <p className="AddressNme">{item.address.name}</p>
                            <p className="AddressDtl">
                              {item.address.street ? item.address.street : "-"}
                              <span className="addressNumber">
                                {t("Phone Number")}:{" "}
                                <span>
                                  {item.address.contact
                                    ? item.address.contact
                                    : "-"}
                                </span>
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="date_block">
                          <h3 className="proNme">{t("Estimated Delivery")}</h3>
                          {/* <h4 className="estimateDate"> */}
                          {/* 22nd December 2022 */}-{/* </h4> */}
                        </div>
                        <div className="track_block">
                          {item.isCancellable && showCancelButton && (
                            <div
                              className="proStatusTag activeStatus"
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                setOrderItemId(item._id);
                                setChooseCancelModal(true);
                              }}
                            >
                              {t("Cancel")}
                            </div>
                          )}
                          {item.isReturnable && showReturnButton && (
                            <div
                              className="proStatusTag activeStatus"
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                setOrderItemId(item._id);
                                setChooseRejectModal(true);
                              }}
                            >
                              {t("Return")}
                            </div>
                          )}
                          {item.isReviewable && showReviewButton && (
                            <div
                              className="proStatusTag activeStatus"
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                setReviewModal(true);
                                setOrderItemId(item._id);
                              }}
                            >
                             {t("Write a Review")}
                            </div>
                          )}
                        </div>
                      </div>
                      {item?.transaction?.status === "pending" ||
                      item?.transaction?.status === "failed" ? (
                        <h3
                          className="proNme"
                          style={{ textTransform: "capitalize" }}
                        >
                          {t("Status")} :{" "}
                          {item.transaction.status === "pending" ? (
                            <span>
                              {t(`${item.transaction.status}`)}(We are verifying your
                              payment. So, sit back and relax. It may take upto
                              30 minutes.)
                            </span>
                          ) : (
                            <span>{t(`${item.transaction.status}`)}</span>
                          )}
                        </h3>
                      ) : (
                        <>
                          {item?.status?.length > 0 && (
                            <div className="trackMyoder">
                              <h3 className="orderSubTitle">{t("Track my order")}:</h3>
                              <div className="trackStatus">
                                <div
                                  className="step-1"
                                  id="checkout-progress"
                                  data-current-step={1}
                                >
                                  <div className="orderprogress-bar">
                                    {item?.status?.map((val, i) => {
                                      return (
                                        <div
                                          key={i}
                                          className={`step step-1 ${
                                            val.completed && "active"
                                          }`}
                                        >
                                          <div className="fa fa-check opaque" />
                                          <div className="step-label">
                                            {/* {val.name} */}
                                            {t(`${val.name}`)}
                                            <span>
                                              {val.completed ? (
                                                moment(val.at).format(
                                                  "DD/MMM/YYYY, h:mm a"
                                                )
                                              ) : (
                                                <span>-</span>
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}

                                    {/* <div className="step step-2">
                                      <div className="fa fa-check opaque" />
                                      <div className="step-label">
                                        Dispatched
                                        <span>22nd December 2022</span>
                                      </div>
                                    </div>
                                    <div className="step step-3">
                                      <div className="fa fa-check opaque" />
                                      <div className="step-label">
                                        Shipped<span>22nd December 2022</span>
                                      </div>
                                    </div>
                                    <div className="step step-4">
                                      <div className="fa fa-check opaque" />
                                      <div className="step-label">
                                        On the way<span>Tracking Courier</span>
                                        <span>9:00pm</span>
                                        <span>AWB Number</span>
                                      </div>
                                    </div>
                                    <div className="step step-5">
                                      <div className="fa fa-check opaque" />
                                      <div className="step-label">
                                        Delivered
                                        <span>
                                          AWB<span>9:00pm</span>
                                        </span>
                                      </div>
                                    </div> */}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {orderList.length > 0 && (
          <Pagination
            currentPage={page}
            totalItems={totalOrder}
            perPage={perPage}
            fetchMoreItems={fetchMoreData}
          />
        )}
      </section>

      <Modal
        show={reviewModal}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        className="late_fee_rule_modal"
        onHide={() => setReviewModal(false)}
      >
        <div className="modal-content">
          <div className="modal-content-top">
            <button
              type="button"
              className="btn"
              onClick={() => setReviewModal(false)}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 39C30.45 39 39 30.45 39 20C39 9.55 30.45 1 20 1C9.55 1 1 9.55 1 20C1 30.45 9.55 39 20 39Z"
                  stroke="#282342"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M14.6211 25.377L25.3751 14.623"
                  stroke="#282342"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M25.3751 25.377L14.6211 14.623"
                  stroke="#282342"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>

            <div className="modal-header">
              <h3>Write a Review</h3>
            </div>
          </div>

          <div className="modal-body">
            <form onSubmit={reviewHandleSubmit(onSubmitReviewHandler)}>
              <div className="row">
                <div className="col-lg-12">
                  <div className="form-group">
                    <div className="form-input-box">
                      <label>Overall Rating</label>
                      <div class="star-widget">
                        <input
                          type="radio"
                          name="rating"
                          id="rate-5"
                          value="5"
                          {...reviewRegister("rating", {
                            required: false,
                          })}
                        />
                        <label for="rate-5" className="fas fa-star"></label>
                        <input
                          type="radio"
                          name="rating"
                          id="rate-4"
                          value="4"
                          {...reviewRegister("rating", {
                            required: false,
                          })}
                        />
                        <label for="rate-4" className="fas fa-star"></label>
                        <input
                          type="radio"
                          name="rating"
                          id="rate-3"
                          value="3"
                          {...reviewRegister("rating", {
                            required: false,
                          })}
                        />
                        <label for="rate-3" className="fas fa-star"></label>
                        <input
                          type="radio"
                          name="rating"
                          id="rate-2"
                          value="2"
                          {...reviewRegister("rating", {
                            required: false,
                          })}
                        />
                        <label for="rate-2" className="fas fa-star"></label>
                        <input
                          type="radio"
                          name="rating"
                          id="rate-1"
                          value="1"
                          {...reviewRegister("rating", {
                            required: false,
                          })}
                        />
                        <label for="rate-1" className="fas fa-star"></label>
                      </div>
                      {reviewErrors["rating"] && (
                        <div className="invalid-feedback d-block">
                          {reviewErrors["rating"].message}
                        </div>
                      )}
                    </div>
                    <div className="form-input-box mb-4">
                      <label>
                        Add Photo or Video (Max: {reviewLimitCount} images)
                      </label>
                      <div className="review_order_file">
                        {previewImage &&
                          previewImage.map((file, i) => {
                            return (
                              <div className="review_preview_first" key={i}>
                                <img src={file} className="review_img" />
                                <i
                                  onClick={() => deleteImageHandler(i)}
                                  className="far fa-trash-alt trash_icon_image"
                                />
                              </div>
                            );
                          })}

                        {/* <img
                          src="/assets/img/saleCardTop-2.png"
                          className="review_img"
                        />
                        <video
                          src="/assets/img/video.mp4"
                          controls
                          className="review_img"
                        >
                          {" "}
                        </video>
                        <img
                          src="/assets/img/saleCardTop-4.png"
                          className="review_img"
                        />
                        <img
                          src="/assets/img/saleCardTop-3.png"
                          className="review_img"
                        /> */}

                        <div className="img__upload_btn">
                          <label
                            for="img_upload_label"
                            class="img_upload_label"
                          >
                            <svg
                              width="23"
                              height="23"
                              viewBox="0 0 23 23"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M22.277 13.55H13.577V22.25H9.42695V13.55H0.776953V9.4H9.42695V0.75H13.577V9.4H22.277V13.55Z"
                                fill="#171520"
                              />
                            </svg>
                            <span>Upload here</span>
                          </label>

                          <input
                            type="file"
                            class="d-none"
                            id="img_upload_label"
                            name="imageOrVideo"
                            multiple
                            accept="image/*"
                            onChange={(e) => reviewImageHandler(e)}
                          />
                        </div>
                      </div>
                      {reviewErrors["imageOrVideo"] && (
                        <div className="invalid-feedback d-block">
                          {reviewErrors["imageOrVideo"].message}
                        </div>
                      )}
                    </div>

                    <div className="custom_checkbox check-type2">
                      <label>Recommended?</label>
                      <input
                        style={{ margin: "0px 0px 0px 15px" }}
                        type="checkbox"
                        {...reviewRegister("isRecommended")}
                      />
                    </div>

                    <div className="form-input-box mt-3">
                      <label>Add a review</label>
                      <div className="form-group">
                        <textarea
                          className="review_textarea"
                          name="review"
                          rows="4"
                          cols="50"
                          {...reviewRegister("review", {
                            required: t("This field is required"),
                          })}
                        />
                        {reviewErrors.review && (
                          <span className="text-danger">
                            {reviewErrors.review.message}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                Submit Review
              </button>
            </form>
          </div>
        </div>
      </Modal>

      <Modal
        show={cancelReasonModal}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        className="late_fee_rule_modal"
        onHide={() => setCancelReasonModal(false)}
      >
        <div className="modal-content">
          <div className="modal-header"></div>
          <div className="modal-body">
            <form>
              <div className="row">
                <div className="col-lg-12">
                  <div className="form-group">
                    <div className="form-input-box ">
                      <label>Reason</label>
                      <div className="form-group">
                        <input
                          type="text"
                          name="reason"
                          className="form-control dark-form-control"
                          defaultValue=""
                          {...cancelRegister("reason", {
                            required: true,
                          })}
                        />

                        {cancelErrors.reason?.type === "required" && (
                          <span className="text-danger">
                            {t("This field is required")}
                          </span>
                        )}
                        {cancelErrors.reason &&
                          cancelErrors.reason?.type === "validate" && (
                            <span className="text-danger ">
                              {t("Please enter a reason")}
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
            <button
              type="button"
              className="btn btn-primary"
              onClick={cancelHandleSubmit(onSubmitCancel)}
            >
              Submit
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        show={returnReasonModal}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        className="late_fee_rule_modal"
        onHide={() => setReturnReasonModal(false)}
      >
        <div className="modal-content">
          <div className="modal-header"></div>
          <div className="modal-body">
            <form onSubmit={rejectHandleSubmit(onSubmitRejectHandler)}>
              <div className="row">
                <div className="col-lg-12">
                  <div className="form-group">
                    <div className="form-input-box ">
                      <label>Reason</label>
                      <div className="form-group">
                        <input
                          type="text"
                          name="reason"
                          className="form-control dark-form-control"
                          defaultValue=""
                          {...rejectRegister("reason", {
                            required: true,
                          })}
                        />

                        {rejectErrors.reason?.type === "required" && (
                          <span className="text-danger">
                            {t("This field is required")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </form>
          </div>
        </div>
      </Modal>

      <Modal show={chooseCancelModal}>
        <Modal.Header>
          <Modal.Title>{t("Cancel Confirmation")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-danger">
            {t("Are you sure you want to cancel this order?")}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setChooseCancelModal(false)}
          >
            {t("Cancel")}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setCancelReasonModal(true), setChooseCancelModal(false);
            }}
          >
            {t("Ok")}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={chooseRejectModal}>
        <Modal.Header>
          <Modal.Title>{t("Return Confirmation")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-danger">
            {t("Are you sure you want to return this order?")}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setChooseRejectModal(false)}
          >
            {t("Cancel")}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setReturnReasonModal(true), setChooseRejectModal(false);
            }}
          >
            {t("Return")}
          </Button>
        </Modal.Footer>
      </Modal>

      <Newsletter />
    </Layout>
  );
};

export async function getServerSideProps(context) {
  await createAxiosCookies(context);

  const { orders, totalOrders } = await getOrders();
  const fileLimit = await getReviewFileLimit();

  return {
    props: {
      protected: true,
      userTypes: ["customer"],
      allOrdersList: orders,
      totalOrdersCount: totalOrders,
      reviewLimitCount: fileLimit,
      locales: {
        ...require(`../../locales/index/${context.locale}.json`),
      },
    },
  };
}

export default MyOrders;
