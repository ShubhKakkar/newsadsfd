import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import Moment from "moment";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import useRequest from "../../hooks/useRequest";
import Pagination from "../Pagination/Pagination";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import Table from "../Table/Table";
import { SearchInput, SearchSubmitButton } from "../Form/Form";
import { addOneToDate, capitalizeFirstLetter } from "../../util/fn";
import { useLocation } from "react-router-dom";
import { FRONTENDURL } from "../../constant/api";

const titlePlural = "Reviews";

const OBJ_TABLE = {
  "Product Name": `product`,
  Customer: "customerName",
  RATING: "rating",
  "RATING GIVEN ON": "createdAt",
  "Approval Status": "status",
  status: "isActive",
};

const searchQueryHandler = (
  page,
  per_page,
  sortBy,
  order,
  status = "",
  approvalStatus = "",
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

  return `review/all?page=${page}&per_page=${per_page}&sortBy=${sortBy}&order=${order}&status=${status}&approvalStatus=${approvalStatus}&dateFrom=${dateFrom}&dateTo=${dateTo}`;
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

  const MySwal = withReactContent(Swal);


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
  const { request: deleteReq, response: deleteRes } = useRequest();
  const {
    request: requestChangeApprovalStatus,
    response: responseChangeApprovalStatus,
  } = useRequest();
  const { request: requestChangeStatus, response: responseChangeStatus } =
    useRequest();

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
      setDataList(response.reviews);
      setTotalDocuments((prev) => response.totalDocuments ?? prev);
    }
  }, [response]);

  useEffect(() => {
    if (responseChangeApprovalStatus) {
      const { id, status } = responseChangeApprovalStatus?.data;
      toast.success(responseChangeApprovalStatus?.message);
      const oldSeekers = [...dataList];
      const indexToChange = oldSeekers.findIndex((seeker) => seeker._id == id);
      oldSeekers[indexToChange].status = status;

      setDataList(oldSeekers);
    }
  }, [responseChangeApprovalStatus]);

  useEffect(() => {
    if (responseChangeStatus) {
      const { id, isActive } = responseChangeStatus.data;

      const newDataList = [...dataList];
      const indexToChange = newDataList.findIndex((list) => list._id == id);
      newDataList[indexToChange].isActive = isActive;
      toast.success(responseChangeStatus.message);
      setDataList(newDataList);
    }
  }, [responseChangeStatus]);

  useEffect(() => {
    if (deleteRes) {
      const { id } = deleteRes?.data;
      let newSeeker = [...dataList];
      newSeeker = newSeeker.filter((seeker) => seeker._id != id);
      setDataList(newSeeker);
      toast.success(deleteRes.message);
    }
  }, [deleteRes]);

  const fetchMoreData = ({ selected }) => {
    setDataList([]);
    const { status, approvalStatus, dateFrom, dateTo } = getValues();

    setPage(selected + 1);
    request(
      "GET",
      searchQueryHandler(
        selected + 1,
        perPage,
        currentSort.sortBy,
        currentSort.order,
        status,
        approvalStatus,
        dateFrom,
        dateTo
      )
    );
  };

  const onSearchHandler = (data) => {
    const { status, approvalStatus, dateFrom, dateTo } = getValues();

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
        approvalStatus,
        dateFrom,
        dateTo
      )
    );
    setPage(1);
  };

  const onResetHandler = (e) => {
    e.preventDefault();
    resetField("status");
    resetField("approvalStatus");
    resetField("dateFrom");
    resetField("dateTo");
    request(
      "GET",
      searchQueryHandler(1, perPage, currentSort.sortBy, currentSort.order)
    );
    setPage(1);
  };

  const perPageChangeHandler = (event) => {
    const { status, approvalStatus, dateFrom, dateTo } = getValues();

    request(
      "GET",
      searchQueryHandler(
        1,
        event.target.value,
        currentSort.sortBy,
        currentSort.order,
        status,
        approvalStatus,
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



  const InputFields = [
    {
      isSelectInput: true,
      label: "Approval Status",
      name: "approvalStatus",
      required: false,
      children: (
        <>
          <option value="">{"Select an option"}</option>
          <option value={"pending"}> Pending</option>
          <option value={"approved"}> Approved</option>
          <option value={"rejected"}> Rejected</option>
        </>
      ),
    },
    {
      isSelectInput: true,
      label: "Status",
      name: "status",
      required: false,
      children: (
        <>
          <option value="">{"Select an option"}</option>
          <option value={"true"}>Activated</option>
          <option value={"false"}> Deactivated</option>
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

  const deleteRatingHandler = (id) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You want to delete?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete it",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        deleteReq("DELETE", "review", {
          id: id,
        });
      } else if (result.isDismissed) {
      }
    });
  };

  const approveHandler = (id) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "Want to Approve review?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, change it",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        requestChangeApprovalStatus("PUT", "review/approval-status", {
          id,
          status: "approved",
        });
      } else if (result.isDismissed) {
      }
    });
  };

  const rejectHandler = (id) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "Want to Reject review ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, change it",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        requestChangeApprovalStatus("PUT", "review/approval-status", {
          id,
          status: "rejected",
        });
      } else if (result.isDismissed) {
      }
    });
  };

  const changeStatusHandler = (id) => {
    const data = dataList.find((list) => list._id === id);
    const isActive = !data?.isActive;

    MySwal.fire({
      title: "Are you sure?",
      text: "Want to change this status?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, change it",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        requestChangeStatus("PUT", `review/status`, {
          id,
          isActive,
        });
      } else if (result.isDismissed) {
      }
    });
  };

  return (
    <>
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
                  <div className="card-header">
                    <div className="card-title"></div>
                    <div className="card-toolbar">
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
                        linksHelperFn={(name, data) => {
                          if (data.status !== "pending") {
                            return null;
                          }

                          if (name === "Approve Review") {
                            return "MakeActivate";
                          } else if (name === "Reject Review") {
                            return "MakeDeactivate";
                          }
                        }}
                        links={[
                          {
                            isLink: false,
                            name: "Approve Review",
                            click: approveHandler,
                            title: "Click To Approve",
                            key: "3_9",
                          },
                          {
                            isLink: false,
                            name: "Reject Review",
                            click: rejectHandler,
                            title: "Click To Reject",
                            key: "3_9",
                          },
                          {
                            isLink: false,
                            name: "Deactivate",
                            click: changeStatusHandler,
                            title: "Click To Activate",
                            key: "12_82",
                          },
                          {
                            isLink: false,
                            name: "Activate",
                            click: changeStatusHandler,
                            title: "Click To Deactivate",
                            key: "12_82",
                          },
                          {
                            isLink: true,
                            to: "/reviews/edit",
                            name: "Edit",
                            extraData: true,
                            key: "7_2",
                          },
                          {
                            isLink: false,
                            click: deleteRatingHandler,
                            name: "Delete",
                            extraData: true,
                            key: "7_2",
                          },
                        ]}
                        onlyDate={{
                          createdAt: "dateTime",
                        }}
                        renderAs={{
                          product: (data) => (
                            <div>
                              <p>
                                <a
                                  href={`${FRONTENDURL}/product/${data.slug}?vendor=${data.vendorId}`}
                                  target="blank"
                                >
                                  {data.name}
                                </a>
                              </p>
                            </div>
                          ),
                          rating: (data) => (
                            <div>
                              <p>
                                {[1, 2, 3, 4, 5].map((index) => (
                                  <i
                                    key={index}
                                    className={
                                      index <= data
                                        ? "fas fa-star text-warning m-1"
                                        : "far fa-star text-warning m-1"
                                    }
                                  ></i>
                                ))}
                              </p>
                            </div>
                          ),
                          status: (data) => (
                            <div>
                              <p
                                className={`${
                                  data === "pending"
                                    ? "label label-lg label-light-warning label-inline"
                                    : data === "approved"
                                    ? "label label-lg label-light-success label-inline"
                                    : "label label-lg label-light-danger label-inline"
                                }`}
                              >
                                {capitalizeFirstLetter(data)}
                              </p>
                            </div>
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
    </>
  );
};
export default ViewAll;
