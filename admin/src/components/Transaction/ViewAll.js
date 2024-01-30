import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import Moment from "moment";

import useRequest from "../../hooks/useRequest";
import Pagination from "../Pagination/Pagination";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import Table from "../Table/Table";
import { SearchInput, SearchSubmitButton } from "../Form/Form";
import { addOneToDate } from "../../util/fn";

const OBJ_TABLE = {
  Customer: "customerName",
  "Order Number": "customId",
  "Transaction Id": "transactionId",
  Status: "status",
  "Amount of total order": "amount",
  "Payment Date": "createdAt",
};

const searchQueryHandler = (
  page,
  per_page,
  sortBy,
  order,
  customerName = "",
  orderNumber = "",
  status = "",
  transactionId = "",
  dateFrom = "1970-01-01",
  dateTo
) => {
  if (sortBy.length > 0) {
    if (sortBy == "created at") {
      sortBy = "createdAt";
    }
  } else {
    sortBy = "createdAt";
  }
  order = order.length > 0 ? order : "desc";

  dateFrom = dateFrom.length > 0 ? dateFrom : "1970-01-01";

  dateTo = dateTo ? addOneToDate(new Date(dateTo)) : addOneToDate(new Date());

  return `transaction/all?page=${page}&per_page=${per_page}&sortBy=${sortBy}&order=${order}&orderNumber=${orderNumber}&status=${status}&customerName=${customerName}&transactionId=${transactionId}&transactionFromDate=${dateFrom}&transactionToDate=${dateTo}`;
};

const ViewAll = () => {

  const [seekers, setSeekers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(10);
  const [perPage, setPerPage] = useState(0);
  const [currentSort, setCurrentSort] = useState({
    sortBy: "created at",
    order: "desc",
  });

  const { records_per_page } = useSelector((state) => state.setting);

  const {
    register,
    handleSubmit,
    formState: { errors },
    resetField,
    getValues,
    clearErrors,
    setError,
    setValue,
  } = useForm();

  const { request, response } = useRequest();

  useEffect(() => {
    if (records_per_page) {
      setPerPage(records_per_page);
      request(
        "GET",
        searchQueryHandler(
          1,
          records_per_page,
          currentSort.sortBy,
          currentSort.order
        )
      );
    }
    document.title = "Transaction - Noonmar";
  }, [records_per_page]);

  useEffect(() => {
    if (response) {
      setSeekers(response.transactions);
      setTotalDocuments((prev) => response.totalDocuments ?? prev);
    }
  }, [response]);

  const fetchMoreData = ({ selected }) => {
    setSeekers([]);
    const {
      customerName,
      orderNumber,
      status,
      transactionId,
      dateFrom,
      dateTo,
    } = getValues();

    setPage(selected + 1);
    request(
      "GET",
      searchQueryHandler(
        selected + 1,
        perPage,
        currentSort.sortBy,
        currentSort.order,
        customerName,
        orderNumber,
        status,
        transactionId,
        dateFrom,
        dateTo
      )
    );
  };

  const onSearchHandler = (data) => {
    const {
      customerName,
      orderNumber,
      status,
      transactionId,
      dateFrom,
      dateTo,
    } = getValues();

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
        customerName,
        orderNumber,
        status,
        transactionId,
        dateFrom,
        dateTo
      )
    );
    setPage(1);
  };

  const onResetHandler = (e) => {
    e.preventDefault();
    resetField("customerName");
    resetField("orderNumber");
    resetField("status");
    resetField("transactionId");
    resetField("dateFrom");
    resetField("dateTo");
    request(
      "GET",
      searchQueryHandler(1, perPage, currentSort.sortBy, currentSort.order)
    );
    setPage(1);
  };

  const perPageChangeHandler = (event) => {
    const {
      customerName,
      orderNumber,
      status,
      transactionId,
      dateFrom,
      dateTo,
    } = getValues();

    request(
      "GET",
      searchQueryHandler(
        1,
        event.target.value,
        currentSort.sortBy,
        currentSort.order,
        customerName,
        orderNumber,
        status,
        transactionId,
        dateFrom,
        dateTo
      )
    );
    setPage(1);
    setPerPage(event.target.value);
  };

  const sortingHandler = (sortBy) => {
    const {
      customerName,
      orderNumber,
      status,
      transactionId,
      dateFrom,
      dateTo,
    } = getValues();

    if (currentSort.sortBy == sortBy) {
      const newOrder = currentSort.order === "asc" ? "desc" : "asc";
      request(
        "GET",
        searchQueryHandler(
          page,
          perPage,
          sortBy,
          newOrder,
          customerName,
          orderNumber,
          status,
          transactionId,
          dateFrom,
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
          customerName,
          orderNumber,
          status,
          transactionId,
          dateFrom,
          dateTo
        )
      );
      setCurrentSort({ sortBy, order: "desc" });
    }
  };

  const statusSelectedHandler = (data) => {
    setValue("status", data);
  };

  const InputFields = [
    {
      label: "Customer Name",
      name: "customerName",
      required: false,
    },
    {
      label: "Order Number",
      name: "orderNumber",
      required: false,
    },
    {
      isSelectInput: true,
      label: "Status",
      name: "status",
      required: false,
      onChange: statusSelectedHandler,
      children: (
        <>
          <option value="">Select an option</option>
          <option value={"success"}>Success</option>
          <option value={"failed"}>Failed</option>
          <option value={"pending"}>Pending</option>
        </>
      ),
    },
    {
      label: "Transaction Id",
      name: "transactionId",
      required: false,
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
        title="Transaction"
        links={[{ to: "/", name: "Dashboard" }]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="row">
            <div className="col-12">
              <div className="card card-custom card-stretch card-shadowless">
                <div className="card-header">
                  <div className="card-title"></div>
                  <div className="card-toolbar">
                    <a
                      /*href="#!"*/
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
                          // onSubmit={handleSubmit(onSearchHandler)}
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
                      mainData={seekers}
                      tableHeading={Object.keys(OBJ_TABLE)}
                      tableData={Object.values(OBJ_TABLE)}
                      linksHelperFn={(linkName, data) => {
                        if (
                          linkName === "DeactivateSponsored" &&
                          !data.isSponsored
                        ) {
                          return "MakeActivate";
                        } else if (
                          linkName === "ActivateSponsored" &&
                          data.isSponsored
                        ) {
                          return "MakeDeactivate";
                        }
                        return null;
                      }}
                      links={
                        [
                          // {
                          //   isLink: false,
                          //   name: "Deactivate",
                          //   // click: changeStatusHandler,
                          //   title: "Click To Activate",
                          //   key: "6_3",
                          // },
                          // {
                          //   isLink: false,
                          //   name: "Activate",
                          //   // click: changeStatusHandler,
                          //   title: "Click To Deactivate",
                          //   key: "6_3",
                          // },
                          // {
                          //   isLink: false,
                          //   name: "DeactivateSponsored",
                          //   click: changeSponsoredHandler,
                          //   title: "Click To Make Sponsored",
                          //   key: "3_9",
                          // },
                          // {
                          //   isLink: false,
                          //   name: "ActivateSponsored",
                          //   click: changeSponsoredHandler,
                          //   title: "Click To Remove Sponsored",
                          //   key: "3_9",
                          // },
                          // {
                          //   isLink: false,
                          //   name: "Verified",
                          //   // click: changeIsApprovedStatus,
                          //   title: "Click To Pending",
                          //   key: "6_8",
                          // },
                          // {
                          //   isLink: false,
                          //   name: "Pending",
                          //   // click: changeIsApprovedStatus,
                          //   title: "Click To Verified",
                          //   key: "6_9",
                          // },
                          // {
                          //   isLink: false,
                          //   name: "Publish",
                          //   click: changePublishStatusHandler,
                          //   title: "Click To Draft",
                          //   key: "6_4",
                          // },
                          // {
                          //   isLink: false,
                          //   name: "Draft",
                          //   click: changePublishStatusHandler,
                          //   title: "Click To Publish",
                          //   key: "6_4",
                          // },
                          // {
                          //   isLink: true,
                          //   to: "/product/view",
                          //   name: "View",
                          //   extraData: true,
                          //   key: "6_5",
                          // },
                          // {
                          //   isLink: true,
                          //   to: "/product/edit",
                          //   name: "Edit",
                          //   extraData: true,
                          // },
                          // {
                          //   isLink: false,
                          //   name: "Delete",
                          //   // click: deleteHandler,
                          //   key: "6_7",
                          // },
                        ]
                      }
                      onlyDate={{
                        createdAt: "dateTime",
                        startDate: "dateTime",
                        endDate: "dateTime",
                      }}
                      renderAs={{
                        customerName: (data, id, showData) =>
                          data && (
                            <>
                              <div style={{ textTransform: "capitalize" }}>
                                Name : {showData["customerName"]}
                              </div>
                              <div style={{ textTransform: "capitalize" }}>
                                Email : {showData["customerEmail"]}{" "}
                              </div>
                              <div>Phone : {showData["customerContact"]} </div>
                            </>
                          ),

                        status: (data) =>
                          data == "pending" ? (
                            <span
                              className="label label-lg label-light-warning label-inline"
                              style={{
                                textTransform: "capitalize",
                              }}
                            >
                              {data}
                            </span>
                          ) : data == "failed" ? (
                            <span
                              className="label label-lg label-light-danger label-inline"
                              style={{
                                textTransform: "capitalize",
                              }}
                            >
                              {data}
                            </span>
                          ) : (
                            <span
                              className="label label-lg label-light-success label-inline"
                              style={{
                                textTransform: "capitalize",
                              }}
                            >
                              {data}
                            </span>
                          ),

                        amount: (data, id, showData) =>
                          data && (
                            <div>
                              {showData["sign"]} {showData["amount"]}
                            </div>
                          ),

                        transactionId: (data) => (!data ? "-": data),
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
                        currentDocLength={seekers.length}
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
