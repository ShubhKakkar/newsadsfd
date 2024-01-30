import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import moment from "moment";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { Modal } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";

import Layout from "@/components/Vendor/Layout";
import { createAxiosCookies } from "@/fn";
import { getAllOrder } from "@/services/orders";
import { BASEURL } from "@/api";
import useRequest from "@/hooks/useRequest";
import Pagination from "@/components/Pagination";

const OrderManagement = ({
  initialOrders,
  initialTotalOrder,
  filterStatus,
}) => {
  const t = useTranslations("Index");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm();

  const {
    register: rejectRegister,
    handleSubmit: rejectHandleSubmit,
    formState: { errors: rejectErrors },
  } = useForm();

  const [orderData, setOrderData] = useState(initialOrders);
  const [totalOrder, setTotalOrder] = useState(initialTotalOrder);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [orderItemId, setOrderItemId] = useState("");
  const [orderStatusType, setOrderStatusType] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [status, setStatus] = useState("");

  const [isSearch, setIsSearch] = useState(false);
  const [isStatus, setIsStatus] = useState(false);
  const [isGridView, setIsGridView] = useState(true);

  const [modal, setModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [showOrderChangeModal, setShowOrderChangeModal] = useState(false);
  const [showOrderCancelModal, setShowOrderCancelModal] = useState(false);
  const [showOrderRejectModal, setShowOrderRejectModal] = useState(false);

  const { request, response } = useRequest();
  const { request: requestStatus, response: responseStatus } = useRequest();
  const { request: cancelReq, response: cancelRes } = useRequest();

  const searchQueryHandler = (page, perPage, searchValue = "", status = "") => {
    return `v1/order/all?page=${page}&per_page=${perPage}&name=${searchValue}&status=${status}`;
  };

  useEffect(() => {
    if (isSearch) {
      const getData = setTimeout(() => {
        request("GET", searchQueryHandler(page, perPage, searchValue, status));
      }, 1000);

      return () => clearTimeout(getData);
    }
  }, [searchValue]);

  useEffect(() => {
    if (isStatus) {
      const getData = setTimeout(() => {
        request("GET", searchQueryHandler(page, perPage, searchValue, status));
      }, 1000);

      return () => clearTimeout(getData);
    }
  }, [status]);

  useEffect(() => {
    if (response) {
      if (response.status) {
        setOrderData(response.orders);
        setTotalOrder(response.totalOrders);
      }
    }
  }, [response]);

  useEffect(() => {
    if (responseStatus) {
      const { itemId, currentStatus, nextStatus } = responseStatus;

      const oldOrderData = [...orderData];
      const indexToChange = oldOrderData.findIndex((val) => val._id == itemId);

      const newItemData = { ...oldOrderData[indexToChange] };

      newItemData.status = currentStatus;
      newItemData.nextStatus = nextStatus;

      oldOrderData[indexToChange] = newItemData;
      setOrderData(oldOrderData);

      toast.success(responseStatus.message);

      setRejectModal(false);
      setShowOrderRejectModal(false);
      setShowOrderChangeModal(false);
    }
  }, [responseStatus]);

  useEffect(() => {
    if (cancelRes) {
      const { itemId } = cancelRes;
      const oldOrderData = [...orderData];
      const indexToChange = oldOrderData.findIndex((val) => val._id == itemId);

      const newItemData = { ...oldOrderData[indexToChange] };

      newItemData.status = {
        name: "Cancelled",
        type: "cancelled",
      };
      newItemData.nextStatus = [];

      oldOrderData[indexToChange] = newItemData;
      setOrderData(oldOrderData);

      toast.success(cancelRes.message);

      setShowOrderCancelModal(false);
      setShowOrderRejectModal(false);
      setModal(false);
    }
  }, [cancelRes]);

  const fetchMoreData = ({ selected }) => {
    setPage(selected + 1);
    request(
      "GET",
      searchQueryHandler(selected + 1, perPage, searchValue, status)
    );
  };

  const statusChangeHandler = (itemId, type, reason) => {
    requestStatus("PUT", "v1/order/order-status", {
      itemId,
      type,
      reason,
    });
  };

  const onSubmit = (data) => {
    const { reason } = data;
    cancelReq("PUT", "v1/order/cancel", {
      itemId: orderItemId,
      reason: reason,
    });
  };

  const onSubmitReject = (data) => {
    const { reason } = data;
    statusChangeHandler(orderItemId, orderStatusType, reason);
    setRejectModal(false);
  };

  return (
    <Layout seoData={{ pageTitle: "Order Listing- Noonmar" }}>
      <div className="main_content listingContainer">
        <div className="offre_listing_section listingCategoryInput ">
          <div className="showing_order">
            <div className="list-grid-toggle">
              <i
                onClick={() => setIsGridView(true)}
                className={`[ icon icon--grid ] fa fa-th ${
                  isGridView ? "active" : ""
                }`}
              />
              <i
                onClick={() => setIsGridView(false)}
                className={`[ icon icon--list ] fa fa-list ${
                  isGridView ? "" : "active"
                }`}
              />
            </div>
            {/* <h5 className="showingTitle">Showing 1 - 40 of 145 Orders</h5> */}
          </div>
          <div className="order_listing_block listingCategoryInput">
            <div className="row">
              <div className="col-lg-6 col-xl-6">
                <div className="form-group">
                  <div className="listingSearchblock">
                    <input
                      type="search"
                      className="form-control orderSearchInput"
                      placeholder="Search"
                      value={searchValue}
                      onChange={(e) => {
                        setSearchValue(e.target.value), setIsSearch(true);
                      }}
                    />
                    <span className="OrderSearchIcon">
                      <svg
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M23.414 20.586L18.337 15.509C19.386 13.928 20 12.035 20 10C20 4.486 15.514 0 10 0C4.486 0 0 4.486 0 10C0 15.514 4.486 20 10 20C12.035 20 13.928 19.386 15.509 18.337L20.586 23.414C21.366 24.195 22.634 24.195 23.414 23.414C24.195 22.633 24.195 21.367 23.414 20.586ZM3 10C3 6.14 6.14 3 10 3C13.86 3 17 6.14 17 10C17 13.86 13.86 17 10 17C6.14 17 3 13.86 3 10Z"
                          fill="#F7CB50"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 col-xl-6 ">
                <div className="form-group">
                  <Controller
                    className="form-control form-control-solid form-control-lg mb-10 col-4"
                    control={control}
                    name="status"
                    render={({ field: { onChange, value, ref } }) => {
                      return (
                        <Select
                          onChange={(e) => {
                            setStatus(e?.value || ""),
                              onChange(e),
                              setIsStatus(true);
                          }}
                          placeholder={t("Filter by Status")}
                          options={filterStatus}
                          isMulti={false}
                          defaultValue={[]}
                          className="form-select- form-control- dark-form-control libSelect"
                          isClearable
                        />
                      );
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* listing tabel */}
        <div
          className={`OfferDetailsBlock vendar_orders  ${
            isGridView ? "list-view grid" : ""
          }`}
        >
          <div className="table-responsive">
            <table className="table align-middle table-borderless table-border-spacing">
              <thead>
                <tr>
                  {/* <th className="check-col" scope="col">
                    <div className="custom_checkbox position-relative d-flex check-type2">
                      <input type="checkbox" id="check1" defaultChecked="" />
                    </div>
                  </th> */}
                  <th scope="col">{t("Order Details")}</th>
                  <th scope="col">{t("Order Number")}</th>
                  <th scope="col" className="text-center">
                    {t("Date")}
                  </th>
                  <th scope="col" className="text-center">
                    {t("Price")}
                  </th>
                  {/* <th scope="col" className="text-center">
                    Seller Name
                  </th> */}
                  {/* <th scope="col" className="text-center">
                    Payment Method
                  </th> */}
                  <th scope="col" className="text-center">
                    {t("Order Status")}
                  </th>
                  <th scope="col" className="text-center" />
                </tr>
              </thead>
              <tbody>
                {orderData.length > 0 &&
                  orderData.map((o, i) => (
                    <tr className="shadow-effect" key={i}>
                      {/* <td className="select-row">
                        <div className="custom_checkbox position-relative check-type2">
                          <input type="checkbox" id="check1" />
                        </div>
                      </td> */}
                      <td className="offer-dtl-col" data-name="Offer Details">
                        <div className="PlatformMarketplace">
                          <div className="blackFridayImg">
                            <img
                              src={`${BASEURL}/${o.media}`}
                              alt={`img_${i}`}
                            />
                          </div>
                          <div className="blackFridaySale">
                            <h3
                              className="fridaySaleTitle"
                              onClick={() =>
                                router.push(
                                  `/vendor/order-management/${o.orderId}`
                                )
                              }
                            >
                              {o.name}
                            </h3>
                            <p className="platformdes">
                              {t("Brand Name")} : <span>{o.brandName} </span>
                            </p>
                            {o.variants &&
                              o.variants.map((v) => (
                                <p className="platformdes">
                                  {v.label} : {v.value}
                                </p>
                              ))}
                            <div className="minQtyDes">
                              <span>
                                {o.quantity} {t("QTY")}{" "}
                              </span>
                            </div>
                            {o.cancellationReason && (
                              <p
                                className="platformdes"
                                style={{ color: "red" }}
                              >
                                {t("Reason")}:{" "}
                                <span>{o.cancellationReason} </span>
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td data-name={t("Order Number")}>{o.orderNumber}</td>
                      <td className="text-center" data-name={t("Date")}>
                        {moment(o.date).format("Do MMM YYYY, HH:mm")}
                      </td>
                      <td className="text-center" data-name={t("Price")}>
                        {o.currency}
                        {o.price}
                      </td>
                      {/* <td className="text-center" data-name="Discount">
                        Electromaxx
                      </td>
                      <td className="text-center" data-name="Discount">
                        Credit Card
                      </td> */}
                      <td className="text-center" data-name={t("Order Status")}>
                        <div className="product_status_type bg-success text-success">
                          <span
                            style={{
                              color:
                                o.status?.type === "cancelled" ? "red" : "",
                            }}
                          >
                            {t(`${o?.status?.name}`)}
                          </span>
                        </div>
                      </td>
                      <td className="action-col">
                        <div className="RedemptionDropdown">
                          
                          {o.nextStatus.length > 0 && (
                            <div className="dropdown">
                              <button
                                className="btn-action-filter dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <i className="fas fa-ellipsis-v" />
                              </button>

                              <ul className="dropdown-menu">
                                {o.nextStatus?.map((val) => {
                                  return (
                                    <li key={val.type}>
                                      <button
                                        className="dropdown-item"
                                        onClick={() => {
                                          setOrderStatusType(val.type);
                                          setOrderItemId(o._id);
                                          val.isReasonRequired
                                            ? setShowOrderRejectModal(
                                                val.isReasonRequired
                                              )
                                            : setShowOrderChangeModal(true);
                                        }}
                                      >
                                      
                                        {t(`${val.name}`)}
                                      </button>
                                    </li>
                                  );
                                })}
                                {o.itemStatus === "active" &&
                                  !["delivered", "cancelled"].includes(
                                    o.status.type
                                  ) && (
                                    <li>
                                      <button
                                        className="dropdown-item"
                                        style={{ color: "red" }}
                                        onClick={() => {
                                          setOrderItemId(o._id);
                                          setShowOrderCancelModal(true);
                                        }}
                                      >
                                        {t("Cancel")}
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
              </tbody>
            </table>
          </div>
        </div>
        {orderData.length > 0 && (
          <Pagination
            currentPage={page}
            totalItems={totalOrder}
            perPage={perPage}
            fetchMoreItems={fetchMoreData}
          />
        )}
      </div>

      <Modal
        show={modal}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        className="late_fee_rule_modal"
        onHide={() => setModal(false)}
      >
        <div className="modal-content">
          {/* <button type="button" className="btn" onClick={() => setModal(false)}>
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
          </button> */}

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
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        className="late_fee_rule_modal"
        onHide={() => setRejectModal(false)}
      >
        <div className="modal-content">
          {/* <button
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
          </button> */}

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
              setModal(true), setShowOrderCancelModal(false);
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
              setRejectModal(true), setShowOrderRejectModal(false);
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

  const { orders, totalOrders, filters } = await getAllOrder();

  return {
    props: {
      protected: true,
      userTypes: ["vendor"],
      initialOrders: orders,
      initialTotalOrder: totalOrders,
      filterStatus: filters?.status || [],
      locales: {
        ...require(`../../../locales/index/${context.locale}.json`),
      },
    },
  };
}

export default OrderManagement;
