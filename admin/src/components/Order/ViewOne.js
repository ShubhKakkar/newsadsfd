import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import Modal from "react-modal";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import moment from "moment";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
const MySwal = withReactContent(Swal);

const ViewOne = (props) => {
  const {
    register: cancelRegister,
    handleSubmit,
    formState: { errors: cancelErrors },
  } = useForm();

  const {
    register: rejectRegister,
    handleSubmit: rejectHandleSubmit,
    formState: { errors: rejectErrors },
  } = useForm();

  const { id } = props.match.params;

  const [orders, setOrder] = useState({});
  const [cancelModel, setCancelModel] = useState(false);

  const [modal, setModal] = useState(false);
  const [orderStatusType, setOrderStatusType] = useState("");
  const [oNextStatus, setONextStatus] = useState([]);
  const [trackStatus, setTrackStatus] = useState([]);

  const [showOrderChangeModal, setShowOrderChangeModal] = useState(false);
  const [showOrderCancelModal, setShowOrderCancelModal] = useState(false);
  const [showOrderRejectModal, setShowOrderRejectModal] = useState(false);
  const { request: requestStatus, response: responseStatus } = useRequest();

  const { response: responseOrderData, request: requestOrderData } =
    useRequest();
  const { response: responseCancel, request: requestCancel } = useRequest();

  const { date_format, date_time_format } = useSelector(
    (state) => state.setting
  );

  useEffect(() => {
    requestOrderData("GET", `order/${id}`);

    document.title = "View Order - Noonmar";
  }, []);

  useEffect(() => {
    if (responseOrderData) {
      setOrder(responseOrderData.order);
      setONextStatus(responseOrderData.order.nextStatus);
      setTrackStatus(responseOrderData.order.status);
    }
  }, [responseOrderData]);

  useEffect(() => {
    if (responseCancel) {
      toast.success(responseCancel.message);
      setCancelModel(false);
      requestOrderData("GET", `order/${id}`);
    }
  }, [responseCancel]);

  useEffect(() => {
    if (responseStatus) {
      setShowOrderChangeModal(false);
      setModal(false);
      toast.success(responseStatus.message);
      setONextStatus(responseStatus.nextStatus);

      requestOrderData("GET", `order/${id}`);
    }
  }, [responseStatus]);

  const cancelOrder = () => {
    MySwal.fire({
      title: "Are you sure?",
      text: "Want to cancel this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, change it",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        cancelReasonHandler();
      } else if (result.isDismissed) {
      }
    });
  };

  const onSubmitReject = (data) => {
    const { reason } = data;
    requestStatus("PUT", "order/order-status", {
      itemId: orders._id,
      type: orderStatusType,
      reason: reason,
    });
  };

  // const statusChangeHandler = () => {

  // };

  const onSubmit = (data) => {
    const { reason } = data;
    requestCancel("PUT", "order/cancel", {
      itemId: orders._id,
      reason: reason,
    });
  };

  const handleStatusChange = (type) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "Want to change status of this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, change it",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        requestStatus("PUT", "order/order-status", {
          itemId: orders._id,
          type: type,
        });
      } else if (result.isDismissed) {
        setShowOrderChangeModal(false);
      }
    });
  };

  const handleRejectStatus = (type) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "Want to change status of this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, change it",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        reasonHandler(type);
      } else if (result.isDismissed) {
      }
    });
  };
  const reasonHandler = async (type) => {
    const { value: text, dismiss } = await Swal.fire({
      input: "textarea",
      inputLabel: "Reason",
      inputPlaceholder: "Type your reason here...",
      inputAttributes: {
        "aria-label": "Type your reason here",
      },
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "Reason is required!";
        }
      },
    });

    if (text) {
      requestStatus("PUT", "order/order-status", {
        itemId: orders._id,
        type: type,
        reason: text,
      });
    } else if (dismiss === Swal.DismissReason.cancel) {
      // Handle cancel button click if needed
    }
  };

  const cancelReasonHandler = async () => {
    const { value: text, dismiss } = await Swal.fire({
      input: "textarea",
      inputLabel: "Reason",
      inputPlaceholder: "Type your reason here...",
      inputAttributes: {
        "aria-label": "Type your reason here",
      },
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "Reason is required!";
        }
      },
    });

    if (text) {
      requestCancel("PUT", "order/cancel", {
        itemId: orders._id,
        reason: text,
      });
    } else if (dismiss === Swal.DismissReason.cancel) {
      // Handle cancel button click if needed
    }
  };

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="View Order"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/order/all", name: "Back To Orders" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom gutter-b">
            <div
              style={{
                display: "block",
              }}
              className="card-body px-0"
            >
              <div className="tab-content px-10">
                {orders && (
                  <div className="form-group row my-2">
                    <div className="col-6">
                      <h6>ORDER DETAIL</h6>
                      <p>Order Id: {orders.customId ? orders.customId : "-"}</p>
                      <p>
                        Transaction Id:{" "}
                        {orders.transactionId ? orders.transactionId : "-"}
                      </p>
                      <p>
                        Order Status:{" "}
                        {orders.currentStatus
                          ? orders.currentStatus?.name
                          : "-"}
                      </p>
                      <p>
                        Order Time:{" "}
                        {orders.orderTime
                          ? moment(orders.orderTime).format(date_time_format)
                          : "-"}
                      </p>
                      <p>
                        Price:{" "}
                        {orders.itemPrice
                          ? orders.itemPrice + orders.currency
                          : "-"}
                      </p>
                      <p>
                        Quantity:{" "}
                        {orders.itemQuantity ? orders.itemQuantity : "-"}
                      </p>
                      <p>
                        Total:{" "}
                        {orders.itemTotal
                          ? orders.itemTotal + orders.currency
                          : "-"}
                      </p>
                      {orders.cancellationReason ? (
                        <p>
                          Cancellation Reason:{" "}
                          <span className="text-danger">
                            {orders.cancellationReason
                              ? orders.cancellationReason
                              : "-"}
                          </span>
                        </p>
                      ) : (
                        ""
                      )}
                    </div>
                    <div className="col-6">
                      <h6>DELIVER TO.</h6>
                      <p>
                        Email: {orders.customerName ? orders.customerName : "-"}
                      </p>
                      <p>
                        Name:{" "}
                        {orders.customerEmail ? orders.customerEmail : "-"}
                      </p>
                      <p>
                        Phone:{" "}
                        {orders.customerContact ? orders.customerContact : "-"}
                      </p>
                      <h6>Delivery Address</h6>
                      <p>
                        Name:{" "}
                        {orders?.deliveryAddress?.name
                          ? orders?.deliveryAddress?.name
                          : "-"}
                      </p>
                      <p>
                        Phone:{" "}
                        {orders?.deliveryAddress?.contact
                          ? orders?.deliveryAddress?.contact
                          : "-"}
                      </p>
                      <p>
                        Address:{" "}
                        {orders?.deliveryAddress?.houseNo
                          ? orders?.deliveryAddress?.houseNo +
                            ", " +
                            orders?.deliveryAddress?.street
                          : "-"}
                      </p>
                      <p>
                        City:{" "}
                        {orders?.deliveryAddress?.city
                          ? orders?.deliveryAddress?.city
                          : "-"}
                      </p>
                      <p>
                        State:{" "}
                        {orders?.deliveryAddress?.state
                          ? orders?.deliveryAddress?.state
                          : "-"}
                      </p>
                      <p>
                        Zip Code:{" "}
                        {orders?.deliveryAddress?.pinCode
                          ? orders?.deliveryAddress?.pinCode
                          : "-"}
                      </p>
                    </div>
                  </div>
                )}
                {oNextStatus?.length > 0 &&
                  oNextStatus.map((val) => {
                    return (
                      <button
                        className={"btn btn-success m-2 "}
                        onClick={() => {
                          setOrderStatusType(val.type);
                          val.isReasonRequired
                            ? handleRejectStatus(val.type)
                            : handleStatusChange(val.type);
                        }}
                      >
                        {val.name}
                      </button>
                    );
                  })}
                {orders.itemStatus === "active" &&
                  !["delivered", "cancelled"].includes(
                    orders.currentStatus.type
                  ) && (
                    <button className="btn btn-danger" onClick={cancelOrder}>
                      Cancel
                    </button>
                  )}
                <table class="table">
                  <thead>
                    <th>Item Details</th>
                    <th>Price</th>
                    <th>Total Price</th>
                    <th>Status</th>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <span>
                          Product Name: {orders?.name ? orders.name : "-"}
                        </span>
                        <br />
                        <span>
                          Vendor Name:{" "}
                          {orders?.vendorName ? orders.vendorName : "-"}
                        </span>
                        <br />
                        <span>
                          Quantity:{" "}
                          {orders?.itemQuantity ? orders.itemQuantity : "-"}
                        </span>
                        <br />
                      </td>
                      <td>
                        {orders?.itemPrice
                          ? orders.itemPrice + orders.currency
                          : "-"}
                      </td>
                      <td>
                        {orders?.itemTotal
                          ? orders.itemTotal + orders.currency
                          : "-"}
                      </td>
                      <td>
                        <span
                          className={
                            ["cancelled", "return_rejected"].includes(
                              orders?.status?.[orders?.status?.length - 1]
                                ?.status
                            )
                              ? `btn btn-danger`
                              : "btn btn-success"
                          }
                        >
                          {orders?.currentStatus?.name
                            ? orders?.currentStatus?.name
                            : "-"}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {orders?.status?.length > 0 && (
                  <div className="trackMyoder">
                    <h3 className="orderSubTitle">Order Tracking:</h3>
                    <div className="trackStatus">
                      <div
                        className="step-1"
                        id="checkout-progress"
                        data-current-step={1}
                      >
                        <div className="orderprogress-bar">
                          {trackStatus?.length > 0 &&
                            trackStatus?.map((val) => {
                              return (
                                <>
                                  <div
                                    className={`step step-1 ${
                                      val.completed && "active"
                                    }`}
                                  >
                                    <div className="fa fa-check opaque" />
                                    <div className="step-label">
                                      {val.name}
                                      <br />
                                      <span>
                                        {val.completed
                                          ? moment(val.at).format(
                                              "DD/MMM/YY hh:mm a"
                                            )
                                          : "-"}
                                      </span>
                                    </div>
                                  </div>
                                </>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="row"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={cancelModel}
        ariaHideApp={false}
        className="model_block"
        onRequestClose={() => setCancelModel(false)}
      >
        <div
          className="modal-dialog modal-dialog-centered modal-lg"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Cancel Reason</h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
                onClick={() => setCancelModel(false)}
              >
                <i aria-hidden="true" className="ki ki-close"></i>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row">
                  <div className="col-lg-12">
                    <div className="form-group">
                      <div
                        className="form-input-box "
                        style={{ textAlign: "left" }}
                      >
                        <label>Reason</label>
                        <div className="form-group">
                          <textarea
                            type="text"
                            name="reason"
                            placeholder="reason"
                            className="form-control dark-form-control"
                            defaultValue=""
                            {...cancelRegister("reason", {
                              required: true,
                            })}
                          />

                          {cancelErrors.reason?.type === "required" && (
                            <span className="text-danger">
                              This field is required
                            </span>
                          )}
                          {/* {cancelErrors.reason &&
                          cancelErrors.reason?.type === "validate" && (
                            <span className="text-danger ">
                              {t("Please enter a reason")}
                            </span>
                          )} */}
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        // onClick={handleSubmit(onSubmit)}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        ariaHideApp={false}
        className="model_block"
        isOpen={modal}
        onRequestClose={() => setModal(false)}
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
                          placeholder="reason"
                          className="form-control dark-form-control"
                          defaultValue=""
                          {...rejectRegister("reason", {
                            required: true,
                          })}
                        />

                        {rejectErrors.reason?.type === "required" && (
                          <span className="text-danger">
                            This field is required
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
        isOpen={showOrderChangeModal}
        ariaHideApp={false}
        className="model_block"
        onRequestClose={() => {
          setShowOrderChangeModal(false);
        }}
      >
        <div
          className="modal-dialog modal-dialog-centered modal-lg"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Change Confirmation</h5>
            </div>
            <div className="modal-body">
              <div className="alert alert-danger">
                Are you sure you want to change this status?
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowOrderChangeModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-danger">Change</button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showOrderCancelModal}>
        <div className="modal-header">
          <h5 className="modal-title">Cancel Confirmation</h5>
        </div>
        <div className="modal-body">
          <div className="alert alert-danger">
            Are you sure you want to cancel this order?
          </div>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => setShowOrderCancelModal(false)}
        >
          Cancel
        </button>
        <button
          className="btn btn-danger"
          onClick={() => {
            setModal(true);
            setShowOrderCancelModal(false);
          }}
        >
          Ok
        </button>
      </Modal>

      <Modal
        isOpen={showOrderRejectModal}
        ariaHideApp={false}
        className="model_block"
        onRequestClose={() => setShowOrderRejectModal(false)}
      >
        <div
          className="modal-dialog modal-dialog-centered modal-lg"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Reject Confirmation</h5>
            </div>
            <div className="modal-body">
              <div className="alert alert-danger">
                Are you sure you want to reject this order?
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowOrderRejectModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  setModal(true);
                  setShowOrderRejectModal(false);
                }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ViewOne;
