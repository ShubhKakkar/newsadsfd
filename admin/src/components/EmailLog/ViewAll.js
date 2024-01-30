import React, { useState, useEffect } from "react";
import Modal from "react-modal";
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
  to: "to",
  from: "from",
  subject: "subject",
  Date: "createdAt",
};

const searchQueryHandler = (
  page,
  per_page,
  sortBy,
  order,
  to = "",
  from = "",
  subject = "",
  dateFrom = "1970-01-01",
  dateTo
) => {
  sortBy =
    sortBy.length > 0
      ? sortBy === "Date"
        ? "createdAt"
        : sortBy
      : "createdAt";
  order = order.length > 0 ? order : "desc";

  dateFrom = dateFrom.length > 0 ? dateFrom : "1970-01-01";

  dateTo = dateTo ? addOneToDate(new Date(dateTo)) : addOneToDate(new Date());

  return `email-log/all?page=${page}&per_page=${per_page}&sortBy=${sortBy}&order=${order}&to=${to}&from=${from}&subject=${subject}&dateFrom=${dateFrom}&dateTo=${dateTo}`;
};

const ViewAll = () => {
  const [emailLog, setEmailLog] = useState([]);
  const [page, setPage] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [viewModalData, setViewModalData] = useState({});
  const [perPage, setPerPage] = useState(0);
  const [currentSort, setCurrentSort] = useState({
    sortBy: "Date",
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
    document.title = "Email Logs - Noonmar";
  }, [records_per_page]);

  useEffect(() => {
    if (response) {
      setEmailLog(response.emailLogs);
      setTotalDocuments((prev) => response.totalDocuments ?? prev);
    }
  }, [response]);

  const fetchMoreData = ({ selected }) => {
    setEmailLog([]);
    const { to, from, subject, dateFrom, dateTo } = getValues;

    setPage(selected + 1);
    request(
      "GET",
      searchQueryHandler(
        selected + 1,
        perPage,
        currentSort.sortBy,
        currentSort.order,
        to,
        from,
        subject,
        dateFrom,
        dateTo
      )
    );
  };

  const viewModalHandler = (id) => {
    const data = emailLog.find((email) => email._id == id);
    if (!data) {
      return;
    }
    setViewModalData(data);
    setShowModal(true);
  };

  const onSearchHandler = (data) => {
    const { to, from, subject, dateFrom, dateTo } = data;

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
        to,
        from,
        subject,
        dateFrom,
        dateTo
      )
    );
    setPage(1);
  };

  const onResetHandler = (e) => {
    e.preventDefault();
    resetField("to");
    resetField("from");
    resetField("subject");
    resetField("dateFrom");
    resetField("dateTo");
    request(
      "GET",
      searchQueryHandler(1, perPage, currentSort.sortBy, currentSort.order)
    );
    setPage(1);
  };

  const perPageChangeHandler = (event) => {
    const { to, from, subject, dateFrom, dateTo } = getValues();

    request(
      "GET",
      searchQueryHandler(
        1,
        event.target.value,
        currentSort.sortBy,
        currentSort.order,
        to,
        from,
        subject,
        dateFrom,
        dateTo
      )
    );
    setPage(1);

    setPerPage(event.target.value);
  };

  const sortingHandler = (sortBy) => {
    const { to, from, subject, dateFrom, dateTo } = getValues();

    if (currentSort.sortBy == sortBy) {
      const newOrder = currentSort.order === "asc" ? "desc" : "asc";
      request(
        "GET",
        searchQueryHandler(
          page,
          perPage,
          sortBy,
          newOrder,
          to,
          from,
          subject,
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
          to,
          from,
          subject,
          dateFrom,
          dateTo
        )
      );
      setCurrentSort({ sortBy, order: "desc" });
    }
  };

  const InputFields = [
    {
      label: "To",
      name: "to",
      required: false,
    },
    {
      label: "From",
      name: "from",
      required: false,
    },
    {
      label: "Subject",
      name: "subject",
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
      <Breadcrumb title="Email Logs" links={[{ to: "/", name: "Dashboard" }]} />

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
                      mainData={emailLog}
                      tableHeading={Object.keys(OBJ_TABLE)}
                      tableData={Object.values(OBJ_TABLE)}
                      links={[
                        {
                          isLink: false,
                          name: "View",
                          click: viewModalHandler,
                          key: "12_31",
                        },
                      ]}
                      onlyDate={{
                        createdAt: "date",
                        startDate: "dateTime",
                        endDate: "dateTime",
                      }}
                      renderAs={{ from: (data) => data.slice(0, 30) }}
                    />

                    {perPage !== 0 && (
                      <Pagination
                        page={page}
                        totalDocuments={totalDocuments}
                        getNewData={fetchMoreData}
                        perPage={perPage}
                        defaultPerPage={records_per_page}
                        perPageChangeHandler={perPageChangeHandler}
                        currentDocLength={emailLog.length}
                      />
                    )}

                    <Modal
                      isOpen={showModal}
                      ariaHideApp={false}
                      className="model_block"
                      onRequestClose={() => setShowModal(false)}
                    >
                      <div
                        className="modal-dialog modal-dialog-centered modal-lg"
                        role="document"
                      >
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title">Email Detail</h5>
                            <button
                              type="button"
                              className="close"
                              data-dismiss="modal"
                              aria-label="Close"
                              onClick={() => setShowModal(false)}
                            >
                              <i aria-hidden="true" className="ki ki-close"></i>
                            </button>
                          </div>
                          <div className="modal-body">
                            <div className="row">
                              <div className="col-lg-6">
                                <div className="form-group row my-2">
                                  <label className="col-12 font-size-h6 text-dark-75 font-weight-bolder">
                                    To
                                  </label>
                                  <div className="col-12">
                                    <span className="font-size-sm text-muted font-weight-bold mt-1r">
                                      {viewModalData?.to}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="col-lg-6">
                                <div className="form-group row my-2">
                                  <label className="col-12 font-size-h6 text-dark-75 font-weight-bolder">
                                    From
                                  </label>
                                  <div className="col-12">
                                    <span className="font-size-sm text-muted font-weight-bold mt-1r">
                                      {viewModalData?.from}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <hr />
                            <div className="form-group row my-2">
                              <label className="col-12 font-size-h6 text-dark-75 font-weight-bolder">
                                Subject
                              </label>
                              <div className="col-12">
                                <span className="font-size-sm text-muted font-weight-bold mt-1r">
                                  {viewModalData?.subject}
                                </span>
                              </div>
                            </div>
                            <hr />
                            <div className="form-group row my-2">
                              <label className="col-12 font-size-h6 text-dark-75 font-weight-bolder">
                                Body
                              </label>
                              <div className="col-12">
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: viewModalData?.body,
                                  }}
                                  className="font-size-sm text-muted font-weight-bold mt-1r"
                                ></span>
                              </div>
                            </div>
                            <div className="clearfix">&nbsp;</div>
                          </div>
                        </div>
                      </div>
                    </Modal>
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
