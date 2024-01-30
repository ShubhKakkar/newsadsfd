import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import Moment from "moment";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import useRequest from "../../../hooks/useRequest";
import Pagination from "../../Pagination/Pagination";
import Breadcrumb from "../../Breadcrumb/Breadcrumb";
import Table from "../../Table/Table";
import { SearchInput, SearchSubmitButton } from "../../Form/Form";
import { addOneToDate } from "../../../util/fn";

const OBJ_TABLE = {
  name: "name",
  "created at": "createdAt",
  Action: "isOnlinePayment",
};

const searchQueryHandler = (
  page,
  per_page,
  sortBy,
  order,
  name = "",
  members,
  dateFrom = "1970-01-01",
  dateTo
) => {
  if (sortBy.length > 0) {
    if (sortBy == "created at") {
      sortBy = "createdAt";
    } else if (sortBy === "name") {
      sortBy = "name";
    }
  } else {
    sortBy = "createdAt";
  }
  order = order.length > 0 ? order : "desc";

  dateFrom = dateFrom.length > 0 ? dateFrom : "1970-01-01";

  dateTo = dateTo ? addOneToDate(new Date(dateTo)) : addOneToDate(new Date());

  return `payment-method/all?page=${page}&per_page=${per_page}&sortBy=${sortBy}&order=${order}&name=${name}&members=${members}&dateFrom=${dateFrom}&dateTo=${dateTo}`;
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

  const MySwal = withReactContent(Swal);

  const { records_per_page } = useSelector((state) => state.setting);

  const {
    register,
    handleSubmit,
    formState: { errors },
    resetField,
    getValues,
  } = useForm();

  const { request, response } = useRequest();
  const { request: requestChangeStatus, response: responseChangeStatus } =
    useRequest();
  const { request: requestDelete, response: responseDelete } = useRequest();

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
    document.title = "Payment Methods- Noonmar";
  }, [records_per_page]);

  useEffect(() => {
    if (response) {
      setSeekers(response.paymentMethod);
      setTotalDocuments(3);
    }
  }, [response]);

  useEffect(() => {
    if (responseChangeStatus) {
      const { id, status } = responseChangeStatus;

      const oldSeekers = [...seekers];
      const indexToChange = oldSeekers.findIndex((seeker) => seeker._id == id);
      oldSeekers[indexToChange].isActive = status;

      setSeekers(oldSeekers);
    }
  }, [responseChangeStatus]);

  const fetchMoreData = ({ selected }) => {
    setSeekers([]);
    // const { isActive, name, dateFrom, dateTo } = getValues();
    const { isActive, name } = getValues();
    setPage(selected + 1);
    request(
      "GET",
      searchQueryHandler(
        selected + 1,
        perPage,
        currentSort.sortBy,
        currentSort.order,
        isActive,
        name
        // dateFrom,
        // dateTo
      )
    );
  };

  const onSearchHandler = (data) => {
    // const { isActive, name, dateFrom, dateTo } = getValues();
    const { isActive, name } = getValues();
    // if (dateFrom && dateTo) {
    //   if (Moment(dateFrom).isAfter(dateTo)) {
    //     setError("dateTo", {
    //       type: "manual",
    //     });
    //     return;
    //   }
    // }

    request(
      "GET",
      searchQueryHandler(
        1,
        perPage,
        currentSort.sortBy,
        currentSort.order,
        isActive,
        name
        // dateFrom,
        // dateTo
      )
    );
    setPage(1);
  };

  const onResetHandler = (e) => {
    e.preventDefault();
    resetField("isActive");
    resetField("name");
    // resetField("dateFrom");
    // resetField("dateTo");
    request(
      "GET",
      searchQueryHandler(1, perPage, currentSort.sortBy, currentSort.order)
    );
    setPage(1);
  };

  const perPageChangeHandler = (event) => {
    const { isActive, name, dateFrom, dateTo } = getValues();

    request(
      "GET",
      searchQueryHandler(
        1,
        event.target.value,
        currentSort.sortBy,
        currentSort.order,
        isActive,
        name,
        dateFrom,
        dateTo
      )
    );
    setPage(1);

    setPerPage(event.target.value);
  };

  const sortingHandler = (sortBy) => {
    const { isActive, name, dateFrom, dateTo } = getValues();

    if (currentSort.sortBy == sortBy) {
      const newOrder = currentSort.order === "asc" ? "desc" : "asc";
      request(
        "GET",
        searchQueryHandler(
          page,
          perPage,
          sortBy,
          newOrder,
          isActive,
          name,
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
          isActive,
          name,
          dateFrom,
          dateTo
        )
      );
      setCurrentSort({ sortBy, order: "desc" });
    }
  };

  const InputFields = [
    {
      label: "Name",
      name: "name",
      required: false,
    },
    {
      isSelectInput: true,
      label: "Status",
      name: "isActive",
      required: false,
      children: (
        <>
          <option value="">{"Select an option"}</option>
          <option value={true}> {"Activated"}</option>
          <option value={false}>{"Deactivated"}</option>
        </>
      ),
    },
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Payment Methods"
        links={[{ to: "/", name: "Dashboard" }]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="row">
            <div className="col-12">
              <div className="card card-custom card-stretch card-shadowless">
                {/* <div className="card-header">
                  <div className="card-title"></div>
                </div> */}
                <div className="card-body">
                  {false && (
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
                  )}

                  <div className="dataTables_wrapper ">
                    <Table
                      currentSort={currentSort}
                      sortingHandler={sortingHandler}
                      mainData={seekers}
                      tableHeading={Object.keys(OBJ_TABLE)}
                      tableData={Object.values(OBJ_TABLE)}
                      links={
                        [
                          // {
                          //   isLink: true,
                          //   to: `/wallet/view`,
                          //   name: "Wallet",
                          //   extraData: true,
                          // },
                          // {
                          //   isLink: true,
                          //   to: "/pricing-setting/payment-methods/edit",
                          //   name: "Edit",
                          //   extraData: true,
                          //   key: "12_84",
                          // },
                        ]
                      }
                      onlyDate={{
                        createdAt: "date",
                        startDate: "dateTime",
                        endDate: "dateTime",
                      }}
                      //   renderAs={{
                      //     isOnlinePayment: (data) =>
                      //     <Link>

                      //     </Link>
                      //     ,
                      //   }}
                      renderAs={{
                        isOnlinePayment: (data, id) =>
                          data ? (
                            <Link
                              to={`/pricing-setting/payment-methods/edit/${id}`}
                            >
                              <button className="btn btn-primary">Edit</button>
                            </Link>
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
