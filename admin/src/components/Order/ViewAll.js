import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import Moment from "moment";
import { toast } from "react-toastify";

import useRequest from "../../hooks/useRequest";
import Pagination from "../Pagination/Pagination";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import Table from "../Table/Table";
import { SearchInput, SearchSubmitButton } from "../Form/Form";
import { addOneToDate } from "../../util/fn";
import { CSVLink } from "react-csv";
import moment from "moment";
import { useLocation, useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import { API } from "../../constant/api";

const statusUrls = [
  "/order/all",
  "/order/placed",
  "/order/packed",
  "/order/shipped",
  "/order/out_for_delivery",
  "/order/delivered",
  "/order/cancelled",
  "/order/return_requested",
  "/order/return_accepted",
  "/order/return_rejected",
  "/order/out_for_pickup",
  "/order/return_completed",
];

const apiName = "order";
const titlePlural = "Orders";

const OBJ_TABLE = {
  "Order Details": `customId`,
  Customer: "customerName",
  Price: "currency",
  "Order Time": "createdAt",
  status: "status",
};

const statusMap = new Map([
  ["all", "All Orders"],
  ["placed", "Placed"],
  ["packed", "Packed"],
  ["shipped", "Shipped"],
  ["out_for_delivery", "Out for delivery"],
  ["delivered", "Delivered"],
  ["cancelled", "Cancelled"],
  ["return_requested", "Return Requested"],
  ["return_accepted", "Return Accepted"],
  ["return_rejected", "Return Rejected"],
  ["out_for_pickup", "Out For Pickup"],
  ["return_completed", "Return Completed"],
]);

export const SubTab = ({
  name,
  index,
  image,
  tabName,
  status,
  onClick = () => {},
}) => {
  const location = useLocation();
  const history = useHistory();
  const [newTab, setNewTab] = useState("/order/all");

  useEffect(() => {
    const decodedPathname = decodeURIComponent(location.pathname);
    const updatedPathname = decodedPathname.replace(/Shipped%20%20\(1\)/, "");

    setNewTab(updatedPathname);
    if (decodedPathname !== updatedPathname) {
      history.replace(updatedPathname);
    }
  }, [location.pathname, history]);

  const activeClass = statusUrls.findIndex((data, index) => {
    if (data == newTab) {
      return index == 0 ? true : 1;
    }
  });

  return (
    <li className={`nav-item ${index > 0 ? "mr-3" : ""}`}>
      <Link
        className={`nav-link ${index === activeClass ? "active" : ""}`}
        to={`/order/${status}`}
        onClick={() => onClick(index)}
      >
        <>
          {false && image && (
            <span className="symbol symbol-20 mr-3">
              <img src={`${API.PORT}/${image}`} alt="" />
            </span>
          )}
          <span className="nav-text">{name}</span>
        </>
      </Link>
    </li>
  );
};

const searchQueryHandler = (
  page,
  per_page,
  sortBy,
  order,
  status = "",
  orderId = "",
  keyword = "",
  dateFrom = "1970-01-01",
  dateTo
) => {
  if (sortBy.length > 0) {
    if (sortBy == "registered on") {
      sortBy = "createdAt";
    }
  } else {
    sortBy = "createdAt";
  }
  order = order.length > 0 ? order : "desc";
  dateFrom = dateFrom.length > 0 ? dateFrom : "1970-01-01";

  status = status == "all" ? "" : status;

  dateTo = dateTo ? addOneToDate(new Date(dateTo)) : addOneToDate(new Date());

  return `${apiName}/all?page=${page}&per_page=${per_page}&sortBy=${sortBy}&order=${order}&status=${status}&orderId=${orderId}&keyword=${keyword}&dateFrom=${dateFrom}&dateTo=${dateTo}`;
};

const ViewAll = () => {
  const [dataList, setDataList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(10);
  const [perPage, setPerPage] = useState(0);
  const location = useLocation();

  const [currentSort, setCurrentSort] = useState({
    sortBy: "registered on",
    order: "desc",
  });

  const [showStatus, setShowStatus] = useState([]);

  const { records_per_page, date_time_format } = useSelector(
    (state) => state.setting
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    resetField,
    getValues,
    clearErrors,
    setError,
  } = useForm();

  const { request, response } = useRequest();

  // console.log(location.pathname.split("/")[2]);

  useEffect(() => {
    if (records_per_page) {
      setPerPage(records_per_page);
      request(
        "GET",
        searchQueryHandler(
          1,
          records_per_page,
          currentSort.sortBy,
          currentSort.order,
          location.pathname.split("/")[2]
        )
      );
    }
    document.title = `${titlePlural} - Noonmar`;
  }, [records_per_page]);

  useEffect(() => {
    if (response) {
      setDataList(response.orders);
      setTotalDocuments((prev) => response.totalDocuments ?? prev);
      setShowStatus(response.docsCount);
    }
  }, [response]);

  const fetchMoreData = ({ selected }) => {
    setDataList([]);
    const { status, orderId, keyword, dateFrom, dateTo } = getValues();

    setPage(selected + 1);
    request(
      "GET",
      searchQueryHandler(
        selected + 1,
        perPage,
        currentSort.sortBy,
        currentSort.order,
        status,
        orderId,
        keyword,

        dateFrom,
        dateTo
      )
    );
  };

  const onSearchHandler = (data) => {
    const { status, orderId, keyword, dateFrom, dateTo } = getValues();

    if (dateFrom && dateTo) {
      if (Moment(dateFrom).isAfter(dateTo)) {
        setError("dateTo", {
          type: "manual",
        });
        return;
      }
    }

    request(
      "GET",
      searchQueryHandler(
        1,
        perPage,
        currentSort.sortBy,
        currentSort.order,
        status,
        orderId,
        keyword,

        dateFrom,
        dateTo
      )
    );
    setPage(1);
  };

  const onResetHandler = (e) => {
    e.preventDefault();
    resetField("keyword");
    resetField("status");
    resetField("orderId");

    resetField("dateFrom");
    resetField("dateTo");
    request(
      "GET",
      searchQueryHandler(1, perPage, currentSort.sortBy, currentSort.order)
    );
    setPage(1);
  };

  const perPageChangeHandler = (event) => {
    const { status, orderId, keyword, dateFrom, dateTo } = getValues();

    request(
      "GET",
      searchQueryHandler(
        1,
        event.target.value,
        currentSort.sortBy,
        currentSort.order,
        status,
        orderId,
        keyword,

        dateFrom,
        dateTo
      )
    );
    setPage(1);

    setPerPage(event.target.value);
  };

  const sortingHandler = (sortBy) => {
    const { status, orderId, keyword, dateFrom, dateTo } = getValues();

    if (currentSort.sortBy == sortBy) {
      const newOrder = currentSort.order === "asc" ? "desc" : "asc";
      request(
        "GET",
        searchQueryHandler(
          page,
          perPage,
          sortBy,
          newOrder,
          status,
          orderId,
          keyword,
          dateTo
        )
      );
      setCurrentSort({ sortBy, order: newOrder });
    } else {
      request(
        "GET",
        searchQueryHandler(
          page,
          perPage,
          sortBy,
          "desc",
          status,
          orderId,
          keyword,
          dateFrom,
          dateTo
        )
      );
      setCurrentSort({ sortBy, order: "desc" });
    }
  };

  const searchingData = (statusData) => {
    const { status, orderId, keyword, dateFrom, dateTo } = getValues();

    if (dateFrom && dateTo) {
      if (Moment(dateFrom).isAfter(dateTo)) {
        setError("dateTo", {
          type: "manual",
        });
        return;
      }
    }

    if (statusData == "all") {
      statusData = "";
    }

    request(
      "GET",
      searchQueryHandler(
        1,
        perPage,
        currentSort.sortBy,
        currentSort.order,
        statusData,
        orderId,
        keyword,

        dateFrom,
        dateTo
      )
    );
    setPage(1);
  };

  const InputFields = [
    {
      label: "Order Id",
      name: "orderId",
      required: false,
    },
    {
      label: "Keyword",
      name: "keyword",
      required: false,
    },
    {
      isSelectInput: true,
      label: "Status",
      name: "status",
      required: false,
      children: showStatus && showStatus.length > 0 && (
        <>
          <option value="">{"Select an option"}</option>
          {showStatus.map((obj) => (
            <option key={obj.key} value={obj.key}>
              {" "}
              {obj.name}
            </option>
          ))}
        </>
      ),
    },

    {
      label: "Date From",
      name: "dateFrom",
      isDate: true,
      clearErrors,
    },
    {
      label: "Date To",
      name: "dateTo",
      isDate: true,
      clearErrors,
      otherRegisterFields: {
        manual: true,
        feedback: "'To Date' cannot be smaller than 'From Date'",
      },
    },
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title={titlePlural}
        links={[{ to: "/", name: "Dashboard" }]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="row">
            <div className="col-12">
              <div className="card card-custom card-stretch card-shadowless">
                <div className="card-header card-header-tabs-line">
                  <div className="card-toolbar">
                    <ul
                      className="nav nav-tabs nav-tabs-space-lg nav-tabs-line nav-bold nav-tabs-line-3x"
                      role="tablist"
                    >
                      {showStatus.map((data, index) => (
                        <SubTab
                          key={index}
                          name={`${data.name}  (${data.total})`}
                          index={index}
                          onClick={() => searchingData(data.key)}
                          status={data.key}
                        />
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="card-header">
                  <div className="card-title"></div>
                  <div className="card-toolbar">
                    {/* <CSVLink
                      data={dataList.map((s) => {
                        let data = {};

                        data["First Name"] = s.firstName;
                        data["Last Name"] = s.lastName;
                        data["Email"] = s.email;
                        data["Zip Code"] = s.zipCode;
                        data["Date of birth"] = Moment(s.dob).format(
                          "DD-MM-YYYY"
                        );
                        data["Created At"] = Moment(s.createdAt).format(
                          "DD-MM-YYYY"
                        );
                        data["Contact"] = s.contact;
                        data["Status"] = s.isActive;
                        data["Email Verified"] = s.isEmailVerified;

                        return data;
                      })}
                      filename={"customers.csv"}
                      className="btn btn-primary mr-2"
                      target="_blank"
                    >
                      Export
                    </CSVLink> */}
                    <a
                      className="btn btn-primary dropdown-toggle mr-2"
                      data-toggle="collapse"
                      data-target="#collapseOne6"
                    >
                      Search
                    </a>
                  </div>
                </div>
                <div className="card-body">
                  <div
                    className="accordion accordion-solid accordion-toggle-plus"
                    id="accordionExample6"
                  >
                    <div
                      id="collapseOne6"
                      className="collapse"
                      data-parent="#accordionExample6"
                    >
                      <div>
                        <form
                          onSubmit={handleSubmit(onSearchHandler)}
                          className="kt-form kt-form--fit mb-0"
                        >
                          <div className="row mb-6">
                            {InputFields.map((inputMain, index) => (
                              <SearchInput
                                key={index}
                                {...inputMain}
                                errors={errors}
                                register={register}
                              />
                            ))}
                          </div>

                          <SearchSubmitButton
                            handleSubmit={handleSubmit}
                            onSearchHandler={onSearchHandler}
                            onResetHandler={onResetHandler}
                          />
                        </form>
                        <hr />
                      </div>
                    </div>
                  </div>
                  <div className="dataTables_wrapper ">
                    <Table
                      currentSort={currentSort}
                      sortingHandler={sortingHandler}
                      mainData={dataList}
                      tableHeading={Object.keys(OBJ_TABLE)}
                      tableData={Object.values(OBJ_TABLE)}
                      links={[
                        {
                          isLink: true,
                          to: "/order/view",
                          name: "View",
                          extraData: true,
                          key: "7_2",
                        },
                      ]}
                      onlyDate={{
                        createdAt: "dateTime",
                        startDate: "dateTime",
                        endDate: "dateTime",
                      }}
                      renderAs={{
                        customId: (data, id, showData) =>
                          data ? (
                            <div>
                              <p>Order Id: {showData["customId"]}</p>
                              <p>Product Name: {showData["name"]}</p>
                              <p>Quantity: {showData["itemQuantity"]}</p>
                            </div>
                          ) : (
                            "-"
                          ),
                        customerName: (data, id, showData) =>
                          data ? (
                            <div>
                              <p>Email: {showData[`customerEmail`]}</p>
                              <p>Name: {showData["customerName"]}</p>
                              <p>Phone: {showData["customerContact"]}</p>
                              <h6>Delivery Address</h6>
                              <p>Name: {showData.deliveryAddress[`name`]}</p>
                              <p>
                                Phone: {showData.deliveryAddress["contact"]}
                              </p>
                              <p>
                                Address: {showData.deliveryAddress["houseNo"]}
                              </p>
                              <p>{showData.deliveryAddress["street"]}</p>
                              <p>City: {showData.deliveryAddress["city"]}</p>
                              <p>State: {showData.deliveryAddress["state"]}</p>
                            </div>
                          ) : (
                            "-"
                          ),
                        currency: (data, id, showData) =>
                          data ? (
                            <div>
                              <p>
                                {/* SubTotal:  */}
                                {showData[`currency`]}
                                {showData[`itemPrice`]}
                              </p>
                            </div>
                          ) : (
                            "-"
                          ),
                        status: (data, id, showData) =>
                          data ? (
                            <span
                              className={
                                ["cancelled", "return_rejected"].includes(
                                  showData[`status`]
                                )
                                  ? `btn btn-danger`
                                  : "btn btn-success"
                              }
                            >
                              {statusMap.get(showData[`status`])}{" "}
                            </span>
                          ) : (
                            "-"
                          ),
                      }}
                    />

                    {perPage !== 0 && (
                      <Pagination
                        page={page}
                        totalDocuments={totalDocuments}
                        getNewData={fetchMoreData}
                        perPage={perPage}
                        defaultPerPage={records_per_page}
                        perPageChangeHandler={perPageChangeHandler}
                        currentDocLength={dataList.length}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAll;
