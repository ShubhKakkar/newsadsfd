import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import Moment from "moment";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import useRequest from "../../hooks/useRequest";
import Pagination from "../Pagination/Pagination";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import Table from "../Table/Table";
import { SearchInput, SearchSubmitButton } from "../Form/Form";
import { addOneToDate } from "../../util/fn";

const OBJ_TABLE = {
  Name: "name",
  Country: "country",
  "Product Categories": "productCategories",
  Tax: "tax",
  "created at": "createdAt",
  status: "isActive",
};

const searchQueryHandler = (
  page,
  per_page,
  sortBy,
  order,
  isActive = "",
  country = "",
  name = "",
  dateFrom = "1970-01-01",
  dateTo
) => {
  if (sortBy.length > 0) {
    if (sortBy == "created at") {
      sortBy = "createdAt";
    } else if (sortBy === "Product Categories") {
      sortBy = "productCategories";
    }
  } else {
    sortBy = "createdAt";
  }
  order = order.length > 0 ? order : "desc";

  dateFrom = dateFrom.length > 0 ? dateFrom : "1970-01-01";

  dateTo = dateTo ? addOneToDate(new Date(dateTo)) : addOneToDate(new Date());

  return `tax/all?page=${page}&per_page=${per_page}&sortBy=${sortBy}&order=${order}&isActive=${isActive}&country=${country}&name=${name}&dateFrom=${dateFrom}&dateTo=${dateTo}`;
};

const ViewAll = () => {
  const [taxes, setTaxes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(10);
  const [perPage, setPerPage] = useState(0);
  const [currentSort, setCurrentSort] = useState({
    sortBy: "created at",
    order: "desc",
  });

  const MySwal = withReactContent(Swal);

  const { records_per_page } = useSelector((state) => state.setting);
  const { roleId, permission } = useSelector((state) => state.auth);

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
  const { request: requestChangeStatus, response: responseChangeStatus } =
    useRequest();
  const { request: requestDelete, response: responseDelete } = useRequest();
  const { response: responseCountries, request: requestCountries } =
    useRequest();
  const [allCountry, setAllCountry] = useState([]);

  useEffect(() => {
    requestCountries("GET", `country/all?page=1&isActive=${true}`);
  }, []);

  useEffect(() => {
    if (responseCountries) {
      if (responseCountries.status && responseCountries.data) {
        setAllCountry(responseCountries.data);
      }
    }
  }, [responseCountries]);

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
    document.title = "Taxes - Noonmar";
  }, [records_per_page]);

  useEffect(() => {
    if (response) {
      setTaxes(response.data);
      setTotalDocuments((prev) => response.totalDocuments ?? prev);
    }
  }, [response]);

  useEffect(() => {
    if (responseChangeStatus) {
      const { id, status } = responseChangeStatus;

      const oldSeekers = [...taxes];
      const indexToChange = oldSeekers.findIndex((seeker) => seeker._id == id);
      oldSeekers[indexToChange].isActive = status;

      setTaxes(oldSeekers);
    }
  }, [responseChangeStatus]);

  useEffect(() => {
    if (responseDelete) {
      const { id } = responseDelete;
      let newSeeker = [...taxes];
      newSeeker = newSeeker.filter((seeker) => seeker._id != id);
      setTaxes(newSeeker);
      toast.success("Country has been deleted successfully.");
    }
  }, [responseDelete]);

  const fetchMoreData = ({ selected }) => {
    setTaxes([]);
    const { isActive, country, name, dateFrom, dateTo } = getValues();

    setPage(selected + 1);
    request(
      "GET",
      searchQueryHandler(
        selected + 1,
        perPage,
        currentSort.sortBy,
        currentSort.order,
        isActive,
        country,
        name,
        dateFrom,
        dateTo
      )
    );
  };

  const deleteHandler = (id) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You want to delete this tax?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        requestDelete("DELETE", "tax", { id });
      } else if (result.isDismissed) {
      }
    });
  };

  const onSearchHandler = (data) => {
    const { isActive, country, name, dateFrom, dateTo } = getValues();

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
        isActive,
        country,
        name,
        dateFrom,
        dateTo
      )
    );
    setPage(1);
  };

  const onResetHandler = (e) => {
    e.preventDefault();
    resetField("isActive");
    resetField("country");
    resetField("dateFrom");
    resetField("dateTo");
    request(
      "GET",
      searchQueryHandler(1, perPage, currentSort.sortBy, currentSort.order)
    );
    setPage(1);
  };

  const perPageChangeHandler = (event) => {
    const { isActive, country, name, dateFrom, dateTo } = getValues();

    request(
      "GET",
      searchQueryHandler(
        1,
        event.target.value,
        currentSort.sortBy,
        currentSort.order,
        isActive,
        country,
        name,
        dateFrom,
        dateTo
      )
    );
    setPage(1);

    setPerPage(event.target.value);
  };

  const sortingHandler = (sortBy) => {
    const { isActive, country, name, dateFrom, dateTo } = getValues();

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
          country,
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
          country,
          name,
          dateFrom,
          dateTo
        )
      );
      setCurrentSort({ sortBy, order: "desc" });
    }
  };

  const changeStatusHandler = (id) => {
    const user = taxes.find((seeker) => seeker._id == id);
    const status = !user.isActive;

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
        requestChangeStatus("PUT", "tax/status", {
          id,
          status,
        });
      } else if (result.isDismissed) {
      }
    });
  };

  const InputFields = [
    {
      label: "Name",
      name: "name",
      required: false,
    },
    {
      isSelectInput: true,
      label: "Country",
      name: "country",
      required: false,
      children: allCountry && allCountry.length > 0 && (
        <>
          <option value="">{"Select an option"}</option>
          {allCountry.map((obj) => (
            <option key={obj._id} value={obj._id}>
              {" "}
              {obj.name}
            </option>
          ))}
        </>
      ),
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
      <Breadcrumb title="Taxes" links={[{ to: "/", name: "Dashboard" }]} />

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
                    {((roleId === 2 && !!permission["9_2"]) || roleId == 1) && (
                      <Link to="/tax/add" className="btn btn-primary">
                        Add New Tax
                      </Link>
                    )}
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
                      mainData={taxes}
                      tableHeading={Object.keys(OBJ_TABLE)}
                      tableData={Object.values(OBJ_TABLE)}
                      links={[
                        // {
                        //   isLink: true,
                        //   to: `/wallet/view`,
                        //   name: "Wallet",
                        //   extraData: true,
                        // },
                        {
                          isLink: false,
                          name: "Deactivate",
                          click: changeStatusHandler,
                          title: "Click To Activate",
                          key: "9_3",
                        },
                        {
                          isLink: false,
                          name: "Activate",
                          click: changeStatusHandler,
                          title: "Click To Deactivate",
                          key: "9_3",
                        },
                        {
                          isLink: true,
                          to: "/tax/view",
                          name: "View",
                          extraData: true,
                          key: "9_4",
                        },
                        {
                          isLink: true,
                          to: "/tax/edit",
                          name: "Edit",
                          extraData: true,
                          key: "9_5",
                        },
                        {
                          isLink: false,
                          name: "Delete",
                          click: deleteHandler,
                          key: "9_6",
                        },
                        // {
                        //   isLink: true,
                        //   to: "/users/change-password",
                        //   name: "ChangePassword",
                        //   extraData: true,
                        //   title: "Change Password",
                        // },
                        // {
                        //   isLink: false,
                        //   name: "SendCreds",
                        //   click: sendCredentials,
                        //   title: "Send Credentials",
                        // },
                        // {
                        //   isLink: false,
                        //   name: "Login",
                        //   click: loginUser,
                        //   title: "Login",
                        // },
                      ]}
                      onlyDate={{
                        createdAt: "date",
                        startDate: "dateTime",
                        endDate: "dateTime",
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
                        currentDocLength={taxes.length}
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
