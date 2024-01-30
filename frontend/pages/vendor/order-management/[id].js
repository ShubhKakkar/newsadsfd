import { createAxiosCookies } from "@/fn";
import React, { useState, useEffect } from "react";
import Layout from "@/components/Vendor/Layout";
import { getOrderDetails } from "@/services/orders";
import moment from "moment";
import { BASEURL } from "@/api";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { Modal } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import useRequest from "@/hooks/useRequest";
import { Controller, useForm } from "react-hook-form";

const ViewOneOrder = ({ orderDetails }) => {
  const t = useTranslations("Index");

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    getValues,
  } = useForm();

  const {
    register: rejectRegister,
    handleSubmit: rejectHandleSubmit,
    formState: { errors: rejectErrors },
  } = useForm();

  const { request: requestStatus, response: responseStatus } = useRequest();
  const { request: cancelReq, response: cancelRes } = useRequest();

  const [customerDetail, setCustomerDetail] = useState(orderDetails.order);
  const [orderItemDetail, setOrderItemDetail] = useState(
    orderDetails.orderItems
  );
  const [orderItemId, setOrderItemId] = useState("");
  const [modal, setModal] = useState(false);
  const [orderStatusType, setOrderStatusType] = useState("");
  const [rejectModal, setRejectModal] = useState(false);

  const [showOrderChangeModal, setShowOrderChangeModal] = useState(false);
  const [showOrderCancelModal, setShowOrderCancelModal] = useState(false);
  const [showOrderRejectModal, setShowOrderRejectModal] = useState(false);

  console.log("orderDetails", orderDetails);
  console.log(orderItemId, "orderItemId");

  useEffect(() => {
    if (responseStatus) {
      const { itemId, currentStatus, nextStatus } = responseStatus;

      const oldOrderData = [...orderItemDetail];
      const indexToChange = oldOrderData.findIndex((val) => val._id == itemId);

      const newItemData = { ...oldOrderData[indexToChange] };

      newItemData.status = currentStatus;
      newItemData.nextStatus = nextStatus;

      oldOrderData[indexToChange] = newItemData;
      setOrderItemDetail(oldOrderData);

      setShowOrderChangeModal(false);
      toast.success(responseStatus.message);
    }
  }, [responseStatus]);

  useEffect(() => {
    if (cancelRes) {
      const { itemId } = cancelRes;
      const oldOrderData = [...orderItemDetail];
      const indexToChange = oldOrderData.findIndex((val) => val._id == itemId);
      oldOrderData[indexToChange].status = {
        name: "Cancelled",
        type: "cancelled",
      };
      oldOrderData[indexToChange].nextStatus = [];
      setOrderItemDetail(oldOrderData);
      setShowOrderCancelModal(false);
      setShowOrderRejectModal(false);
      setModal(false);
      toast.success(cancelRes.message);
    }
  }, [cancelRes]);

  const statusChangeHandler = (itemId, type) => {
    requestStatus("PUT", "v1/order/order-status", {
      itemId,
      type,
    });
  };

  const onSubmitReject = (data) => {
    const { reason } = data;
    console.log("data", data);
  };

  const onSubmit = (data) => {
    const { reason } = data;
    cancelReq("PUT", "v1/order/cancel", {
      itemId: orderItemId,
      reason: reason,
    });
  };

  return (
    <Layout seoData={{ pageTitle: "Order Detail- Noonmar" }}>
      <div class="main_content listingContainer">
        <div class="orderDetailsBlock">
          <div class="order_ndi">
            <div class="orderNumberIn">
              {t("Order Number")}{" "}
              <span class="ndi_dis">{customerDetail?.orderNumber}</span>
            </div>
            <div class="orderNumberIn">
              {t("Order Date")}{" "}
              <span class="ndi_dis">
                {/* 12 Sept 2022 - 12:55 pm */}
                {moment(customerDetail.date).format("DD MMM YYYY HH:mm")}
              </span>
            </div>
            {false && customerDetail.trackingId && (
              <div class="orderNumberIn">
                {t("Tracking ID")}{" "}
                <span class="ndi_dis">
                  {/* 9348fjr73 */}
                  {customerDetail.trackingId}
                  <i class="far fa-copy"></i>
                </span>
              </div>
            )}
          </div>
          <div class="order_mark_btn">
            <div class="MarkCompleteBTn">
              {/* <div class="drop-list MarkCompleteDrop">
                <div class="btn-group">
                  <button
                    type="button"
                    class=" btn-primary  dropdown-toggle MarkCompleteDrop dropdown-toggle-split"
                    data-bs-toggle="dropdown"
                  >
                    {t("Mark as Complete")}
                  </button>

                  <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                      <a class="dropdown-item" href="#">
                        <div class="product_status_type bg-success text-success">
                          <span>Completed</span>
                        </div>
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#">
                        <div class="product_status_type bg-danger text-danger">
                          <span>Cancelled</span>
                        </div>
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#">
                        <div class="product_status_type bg-primary text-primary">
                          <span>In Progress</span>
                        </div>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="orderCancelBtn">
                <button type="button" class="btn btn-primary">
                  {t("Cancel Order")}
                </button>
              </div> */}
            </div>
          </div>
        </div>

        <div class="DeliveryDetailsBlock">
          <div class="row">
            <div class="col-md-6 col-lg-12 col-xl-6 col-xxl-4">
              <div class="DeliveryDetailsbox">
                <div class="CustomerDetails">
                  <div class="detail_customer_title">
                    <div class="contact_Name_icon">
                      <div class="contactIcon">
                        <svg
                          width="45"
                          height="45"
                          viewBox="0 0 45 45"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect width="45" height="45" rx="8" fill="#FF6000" />
                          <path
                            d="M22.9978 26.7031C17.966 26.7031 13.668 27.4965 13.668 30.6698C13.668 33.8443 17.9391 34.6656 22.9978 34.6656C28.0296 34.6656 32.3276 33.8735 32.3276 30.699C32.3276 27.5245 28.0576 26.7031 22.9978 26.7031Z"
                            fill="white"
                          />
                          <path
                            opacity="0.4"
                            d="M22.9982 23.68C26.4259 23.68 29.1722 20.9325 29.1722 17.506C29.1722 14.0795 26.4259 11.332 22.9982 11.332C19.5717 11.332 16.8242 14.0795 16.8242 17.506C16.8242 20.9325 19.5717 23.68 22.9982 23.68Z"
                            fill="white"
                          />
                        </svg>
                      </div>
                      <div class="contactName">
                        <h4>{customerDetail.customerName}</h4>
                        <p>{/* Customer since <span>12 Sept 2022 </span> */}</p>
                      </div>
                    </div>
                    {/* <div class="deleveryPendingBtn">
                      <div class="product_status_type bg-danger text-danger">
                        Pending
                      </div>
                    </div> */}
                  </div>
                  <div class="row DeliveryDetailsewe">
                    <div class="col-md-8 col-sm-8">
                      <div class="DeliveryDetailsTitle">
                        <h4>{t("Delivery Details")}</h4>
                        <p class="DeliveryDetailsDis">
                          {/* No. 15 Adekunle Street, Yaba, Lagos State */}
                          {customerDetail.address.name}
                        </p>
                        <p class="DeliveryDetailsDis">
                          {customerDetail.address.houseNo},{" "}
                          {customerDetail.address.street}
                        </p>
                        <p class="DeliveryDetailsDis">
                          {customerDetail.address.landmark},{" "}
                          {customerDetail.address.city}
                        </p>
                        <p class="DeliveryDetailsDis">
                          {customerDetail.address.state},{" "}
                          {customerDetail.address.pinCode}
                        </p>
                      </div>
                    </div>
                    <div class="col-md-4 col-sm-4">
                      {/* <div class="DeliveryDetailsTitle">
                        <h4>{t("Biling Details")}</h4>
                        <p class="DeliveryDetailsDis">Details</p>
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* <div class="col-md-6 col-lg-12 col-xl-6 col-xxl-5">
              <div class="DeliveryDetailsbox">
                <div class="CustomerDetails">
                  <div class="detail_customer_title">
                    <div class="contactIcon">
                      <svg
                        width="45"
                        height="45"
                        viewBox="0 0 45 45"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="45" height="45" rx="8" fill="#FF6000" />
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M25.3125 20.8131C25.3125 19.2591 24.0534 18 22.5006 18C20.9466 18 19.6875 19.2591 19.6875 20.8131C19.6875 22.3659 20.9466 23.625 22.5006 23.625C24.0534 23.625 25.3125 22.3659 25.3125 20.8131Z"
                          stroke="white"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M22.4995 32.625C21.1512 32.625 14.0625 26.8857 14.0625 20.8837C14.0625 16.185 17.8392 12.375 22.4995 12.375C27.1597 12.375 30.9375 16.185 30.9375 20.8837C30.9375 26.8857 23.8477 32.625 22.4995 32.625Z"
                          stroke="white"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                  <div class="row DeliveryDetailsewe">
                    <div class="col-md-6 col-sm-6">
                      <div class="DeliveryDetailsTitle">
                        <h4>Home Address</h4>
                        <p class="DeliveryDetailsDis">
                          No. 15 Adekunle Street, Yaba, Lagos State
                        </p>
                      </div>
                    </div>
                    <div class="col-md-6 col-sm-6">
                      <div class="DeliveryDetailsTitle">
                        <h4>Biling Details</h4>
                        <p class="DeliveryDetailsDis">
                          No. 15 Adekunle Street, Yaba, Lagos State
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6 col-lg-12 col-xl-6 col-xxl-3">
              <div class="DeliveryDetailsbox">
                <div class="CustomerDetails">
                  <div class="detail_customer_title">
                    <div class="contact_Name_icon">
                      <div class="contactIcon">
                        <svg
                          width="45"
                          height="45"
                          viewBox="0 0 45 45"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect width="45" height="45" rx="8" fill="#FF6000" />
                          <path
                            d="M31.8763 14.166H13.1263C11.9757 14.166 11.043 15.0988 11.043 16.2493V28.7493C11.043 29.8999 11.9757 30.8327 13.1263 30.8327H31.8763C33.0269 30.8327 33.9596 29.8999 33.9596 28.7493V16.2493C33.9596 15.0988 33.0269 14.166 31.8763 14.166Z"
                            stroke="white"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M11.043 20.416H33.9596"
                            stroke="white"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                    <div class="deleveryPendingBtn">
                      <div class="form-group">
                        <select
                          class="form-select form-control dark-form-control"
                          aria-label="Default select example"
                        >
                          <option selected="">This Week</option>
                          <option value="1">Monday</option>
                          <option value="2">Tuesday</option>
                          <option value="3">Wednesday</option>
                          <option value="4">Thus</option>
                          <option value="5">Fri</option>
                          <option value="6">Sat</option>
                          <option value="7">Sun</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div class="row DeliveryDetailsewe">
                    <div class="col-md-6 col-sm-6">
                      <div class="DeliveryDetailsTitle">
                        <h4>Payment Method</h4>
                        <p class="DeliveryDetailsDis">Master Card</p>
                      </div>
                    </div>
                    <div class="col-md-6 col-sm-6">
                      <div class="DeliveryDetailsTitle">
                        <h4>Order Type</h4>
                        <p class="DeliveryDetailsDis">Home Delivery</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
        {/* <!-- listing tabel --> */}
        <div class="OfferDetailsBlock products">
          <div class="table-responsive">
            <table class="table align-middle table-borderless table-border-spacing">
              <thead>
                <tr>
                  <th scope="col">{t("Item Details")}</th>
                  <th scope="col">{t("QTY")}</th>
                  <th scope="col" class="text-center">
                    {t("Unit Price")}
                  </th>
                  <th scope="col" class="text-center">
                    {t("Discount")}
                  </th>
                  {/* <th scope="col" class="text-center">
                    {t("Actions")}
                  </th> */}
                  <th scope="col" class="text-center">
                    {" "}
                    {t("Status")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {orderItemDetail &&
                  orderItemDetail.length > 0 &&
                  orderItemDetail.map((item, i) => (
                    <tr class="shadow-effect" key={i}>
                      <td class="offer-dtl-col">
                        <div class="PlatformMarketplace">
                          <div class="blackFridayImg">
                            {/* <img src="img/order-listing-Img-1.jpg" alt="" /> */}
                            <img src={`${BASEURL}/${item.media}`} alt="" />
                          </div>
                          <div class="blackFridaySale">
                            <h3 class="fridaySaleTitle">
                              {/* Zipper Jacket - Brown */}
                              {item.name}
                            </h3>
                            <p class="platformdes">
                              {t("Brand Name")}
                              {""}
                              <span>: {item.brandName} </span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>{item.quantity}</td>

                      <td class="text-center">
                        {customerDetail.currency}
                        {item.price}
                      </td>

                      <td class="text-center">0</td>
                      {/* <td class="text-center separate_select">
                        <div class="form-group ">
                          <select
                            class="form-select form-control dark-form-control"
                            aria-label="Default select example dropdown-menu"
                          >
                            <option
                              value="1"
                              class="product_status_type bg-success text-success"
                            >
                              <span>Completed</span>
                            </option>
                            <option
                              value="2"
                              class="product_status_type bg-danger text-danger"
                            >
                              <a class="dropdown-item" href="#">
                                <span>Cancelled</span>
                              </a>
                            </option>
                            <option
                              value="3"
                              class="product_status_type bg-primary text-primary"
                            >
                              <a class="dropdown-item" href="#">
                                <span>In Progress</span>
                              </a>
                            </option>
                          </select>
                        </div>
                      </td> */}

                      <td class="text-center">
                        <div
                          class={`product_status_type  ${
                            item.status.name === "Cancelled"
                              ? "bg-danger text-light"
                              : "bg-success text-success"
                          }`}
                        >
                          <span>{t(`${item.status.name}`)}</span>
                        </div>
                      </td>
                      <td class="action-col">
                        <div class="RedemptionDropdown">
                          {item.nextStatus.length > 0 && (
                            <div class="dropdown">
                              <button
                                class="btn-action-filter dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <i class="fas fa-ellipsis-v"></i>
                              </button>
                              <ul class="dropdown-menu">
                                {item.nextStatus.map((val, index) => {
                                  return (
                                    <li key={index}>
                                      <a
                                        class="dropdown-item"
                                        href="javascript:void(0)"
                                        onClick={() => {
                                          setOrderStatusType(val.type);
                                          setOrderItemId(item._id);
                                          val.isReasonRequired
                                            ? setShowOrderRejectModal(
                                                val.isReasonRequired
                                              )
                                            : setShowOrderChangeModal(true);
                                        }}
                                      >
                                        {val.name}
                                      </a>
                                    </li>
                                  );
                                })}
                                {item.itemStatus === "active" &&
                                  !["delivered", "cancelled"].includes(
                                    item.status.type
                                  ) && (
                                    <li>
                                      <button
                                        className="dropdown-item"
                                        style={{ color: "red" }}
                                        onClick={() => {
                                          setOrderItemId(item._id);
                                          setShowOrderCancelModal(true);
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    </li>
                                  )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                {/* <tr class="shadow-effect">
                  <td class="offer-dtl-col">
                    <div class="PlatformMarketplace">
                      <div class="blackFridayImg">
                        <img src="img/order-listing-Img-2.jpg" alt="" />
                      </div>
                      <div class="blackFridaySale">
                        <h3 class="fridaySaleTitle">Zipper Jacket - Brown</h3>
                        <p class="platformdes">
                          Brand Name <span>:Tori </span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>03</td>

                  <td class="text-center">$4,500 USD</td>

                  <td class="text-center">00.0</td>
                  <td class="text-center separate_select">
                    <div class="form-group ">
                      <select
                        class="form-select form-control dark-form-control"
                        aria-label="Default select example dropdown-menu"
                      >
                        <option
                          value="1"
                          class="product_status_type bg-success text-success"
                        >
                          <span>Completed</span>
                        </option>
                        <option
                          value="2"
                          class="product_status_type bg-danger text-danger"
                        >
                          <a class="dropdown-item" href="#">
                            <span>Cancelled</span>
                          </a>
                        </option>
                        <option
                          value="3"
                          class="product_status_type bg-primary text-primary"
                        >
                          <a class="dropdown-item" href="#">
                            <span>In Progress</span>
                          </a>
                        </option>
                      </select>
                    </div>
                  </td>

                  <td class="text-center">
                    <div class="product_status_type bg-danger text-danger">
                      <span>Cancelled</span>
                    </div>
                  </td>
                  <td class="action-col">
                    <div class="RedemptionDropdown">
                      <div class="dropdown">
                        <button
                          class="btn-action-filter dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <ul class="dropdown-menu">
                          <li>
                            <a class="dropdown-item" href="#">
                              Action 1
                            </a>
                          </li>
                          <li>
                            <a class="dropdown-item" href="#">
                              Action 2
                            </a>
                          </li>
                          <li>
                            <a class="dropdown-item" href="#">
                              Action 3
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </td>
                </tr>

                <tr class="shadow-effect">
                  <td class="offer-dtl-col">
                    <div class="PlatformMarketplace">
                      <div class="blackFridayImg">
                        <img src="img/order-listing-Img-3.jpg" alt="" />
                      </div>
                      <div class="blackFridaySale">
                        <h3 class="fridaySaleTitle">Zipper Jacket - Brown</h3>
                        <p class="platformdes">
                          Brand Name <span>:Tori </span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>10</td>

                  <td class="text-center">$4,500 USD</td>

                  <td class="text-center">00.0</td>
                  <td class="text-center separate_select">
                    <div class="form-group ">
                      <select
                        class="form-select form-control dark-form-control"
                        aria-label="Default select example dropdown-menu"
                      >
                        <option
                          value="1"
                          class="product_status_type bg-success text-success"
                        >
                          <span>Completed</span>
                        </option>
                        <option
                          value="2"
                          class="product_status_type bg-danger text-danger"
                        >
                          <a class="dropdown-item" href="#">
                            <span>Cancelled</span>
                          </a>
                        </option>
                        <option
                          value="3"
                          class="product_status_type bg-primary text-primary"
                        >
                          <a class="dropdown-item" href="#">
                            <span>In Progress</span>
                          </a>
                        </option>
                      </select>
                    </div>
                  </td>

                  <td class="text-center">
                    <div class="product_status_type bg-primary text-primary">
                      <span>In Progress</span>
                    </div>
                  </td>
                  <td class="action-col">
                    <div class="RedemptionDropdown">
                      <div class="dropdown">
                        <button
                          class="btn-action-filter dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <ul class="dropdown-menu">
                          <li>
                            <a class="dropdown-item" href="#">
                              Action 1
                            </a>
                          </li>
                          <li>
                            <a class="dropdown-item" href="#">
                              Action 2
                            </a>
                          </li>
                          <li>
                            <a class="dropdown-item" href="#">
                              Action 3
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </td>
                </tr> */}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        show={modal}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        className="late_fee_rule_modal"
        onHide={() => setModal(false)}
      >
        <div className="modal-content">
          <button type="button" className="btn" onClick={() => setModal(false)}>
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

          <div className="modal-header"></div>
          <div className="modal-body">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="row">
                <div className="col-lg-12">
                  <div className="form-group">
                    <div className="form-input-box ">
                      <label>Reason</label>
                      <div className="form-group">
                        <input
                          type="text"
                          name="reason"
                          placeholder={t("reason")}
                          className="form-control dark-form-control"
                          defaultValue=""
                          {...register("reason", {
                            required: true,
                          })}
                        />

                        {errors.reason?.type === "required" && (
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

      <Modal
        show={rejectModal}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        className="late_fee_rule_modal"
        onHide={() => setRejectModal(false)}
      >
        <div className="modal-content">
          <button
            type="button"
            className="btn"
            onClick={() => setRejectModal(false)}
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

          <div className="modal-header"></div>
          <div className="modal-body">
            <form onSubmit={rejectHandleSubmit(onSubmitReject)}>
              <div className="row">
                <div className="col-lg-12">
                  <div className="form-group">
                    <div className="form-input-box ">
                      <label>Reason</label>
                      <div className="form-group">
                        <input
                          type="text"
                          name="reason"
                          placeholder={t("reason")}
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

      <Modal show={showOrderChangeModal}>
        <Modal.Header>
          <Modal.Title>{t("Change Confirmation")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-danger">
            {t("Are you sure you want to change this status?")}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowOrderChangeModal(false)}
          >
            {t("Cancel")}
          </Button>
          <Button
            variant="danger"
            onClick={() => statusChangeHandler(orderItemId, orderStatusType)}
          >
            {t("Change")}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showOrderCancelModal}>
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
            onClick={() => setShowOrderCancelModal(false)}
          >
            {t("Cancel")}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setModal(true);
              setShowOrderCancelModal(false);
            }}
          >
            {t("Ok")}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showOrderRejectModal}>
        <Modal.Header>
          <Modal.Title>{t("Reject Confirmation")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-danger">
            {t("Are you sure you want to reject this order?")}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowOrderRejectModal(false)}
          >
            {t("Cancel")}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setModal(true);
              setShowOrderRejectModal(false);
            }}
          >
            {t("Reject")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
};

export async function getServerSideProps(context) {
  await createAxiosCookies(context);

  const {
    query: { id },
  } = context;

  if (!id) {
    return {
      redirect: {
        permanent: false,
        destination: "/vendor/order-management",
      },
    };
  }

  let orderDetails = getOrderDetails(id);

  [orderDetails] = await Promise.all([orderDetails]);

  return {
    props: {
      protected: true,
      userTypes: ["vendor"],
      orderDetails,
      locales: {
        ...require(`../../../locales/index/${context.locale}.json`),
      },
    },
  };
}

export default ViewOneOrder;
