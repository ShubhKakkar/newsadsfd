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
import { CSVLink } from "react-csv";

const apiName = "customer";
const titleSingular = "Customer";
const titlePlural = "Customers";

const OBJ_TABLE = {
  firstName: "firstName",
  lastName: "lastName",
  email: "email",
  "registered on": "createdAt",
  status: "isActive",
};

const searchQueryHandler = (
  page,
  per_page,
  sortBy,
  order,
  isActive = "",
  firstName = "",
  lastName = "",
  email = "",
  country = "",
  dateFrom = "1970-01-01",
  dateTo
) => {
  if (sortBy.length > 0) {
    if (sortBy == "registered on") {
      sortBy = "createdAt";
    } else if (sortBy === "phone number") {
      sortBy = "contact";
    }
  } else {
    sortBy = "createdAt";
  }
  order = order.length > 0 ? order : "desc";

  dateFrom = dateFrom.length > 0 ? dateFrom : "1970-01-01";

  dateTo = dateTo ? addOneToDate(new Date(dateTo)) : addOneToDate(new Date());

  return `${apiName}/all?page=${page}&per_page=${per_page}&sortBy=${sortBy}&order=${order}&isActive=${isActive}&firstName=${firstName}&lastName=${lastName}&email=${email}&country=${country}&dateFrom=${dateFrom}&dateTo=${dateTo}`;
};

const ViewAll = () => {
  const [dataList, setDataList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(10);
  const [perPage, setPerPage] = useState(0);
  const [currentSort, setCurrentSort] = useState({
    sortBy: "registered on",
    order: "desc",
  });

  const [allCountry, setAllCountry] = useState([]);
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
  const { response: responseCountries, request: requestCountries } =
    useRequest();
  const { request: requestChangeStatus, response: responseChangeStatus } =
    useRequest();
  const { request: requestSendCreds, response: responseSendCreds } =
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
    document.title = `${titlePlural} - Noonmar`;
  }, [records_per_page]);

  useEffect(() => {
    if (response) {
      setDataList(response.customers);
      setTotalDocuments((prev) => response.totalDocuments ?? prev);
    }
  }, [response]);

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
    if (responseSendCreds) {
      toast.success(responseSendCreds.message);
    }
  }, [responseSendCreds]);

  useEffect(() => {
    if (responseChangeStatus) {
      const { id, status } = responseChangeStatus;

      const newDataList = [...dataList];
      const indexToChange = newDataList.findIndex((list) => list._id == id);
      newDataList[indexToChange].isActive = status;
      toast.success(responseChangeStatus.message);
      setDataList(newDataList);
    }
  }, [responseChangeStatus]);

  useEffect(() => {
    if (responseDelete) {
      const { id } = responseDelete;
      let newDataList = [...dataList];
      newDataList = newDataList.filter((list) => list._id != id);
      setDataList(newDataList);
      toast.success(responseDelete.message);
    }
  }, [responseDelete]);

  const fetchMoreData = ({ selected }) => {
    setDataList([]);
    const { isActive, firstName, lastName, email, country, dateFrom, dateTo } =
      getValues();

    setPage(selected + 1);
    request(
      "GET",
      searchQueryHandler(
        selected + 1,
        perPage,
        currentSort.sortBy,
        currentSort.order,
        isActive,
        firstName,
        lastName,
        email,
        country,
        dateFrom,
        dateTo
      )
    );
  };

  const deleteHandler = (id) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You want to delete this customer?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        requestDelete("DELETE", `${apiName}`, { id });
      } else if (result.isDismissed) {
      }
    });
  };

  const onSearchHandler = (data) => {
    const { isActive, firstName, lastName, email, country, dateFrom, dateTo } =
      getValues();

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
        firstName,
        lastName,
        email,
        country,
        dateFrom,
        dateTo
      )
    );
    setPage(1);
  };

  const onResetHandler = (e) => {
    e.preventDefault();
    resetField("isActive");
    resetField("firstName");
    resetField("lastName");
    resetField("email");
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
    const { isActive, firstName, lastName, email, country, dateFrom, dateTo } =
      getValues();

    request(
      "GET",
      searchQueryHandler(
        1,
        event.target.value,
        currentSort.sortBy,
        currentSort.order,
        isActive,
        firstName,
        lastName,
        email,
        country,
        dateFrom,
        dateTo
      )
    );
    setPage(1);

    setPerPage(event.target.value);
  };

  const sortingHandler = (sortBy) => {
    const { isActive, firstName, lastName, email, country, dateFrom, dateTo } =
      getValues();

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
          firstName,
          lastName,
          email,
          country,
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
          firstName,
          lastName,
          email,
          country,
          dateFrom,
          dateTo
        )
      );
      setCurrentSort({ sortBy, order: "desc" });
    }
  };

  const changeStatusHandler = (id) => {
    const data = dataList.find((list) => list._id == id);
    const status = !data.isActive;

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
        requestChangeStatus("PUT", `${apiName}/status`, {
          id,
          status,
        });
      } else if (result.isDismissed) {
      }
    });
  };
  const sendCredentials = (id) => {
    requestSendCreds("POST", `${apiName}/send-credentials`, { id });
  };

  const InputFields = [
    {
      label: "First Name",
      name: "firstName",
      required: false,
    },
    {
      label: "Last Name",
      name: "lastName",
      required: false,
    },
    {
      label: "Email",
      name: "email",
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
                    <CSVLink
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
                      // className="dropdown-item"
                      className="btn btn-primary mr-2"
                      target="_blank"
                      // headers={headers}
                    >
                      Export
                    </CSVLink>
                    <a
                      /*href="#!"*/
                      className="btn btn-primary dropdown-toggle mr-2"
                      data-toggle="collapse"
                      data-target="#collapseOne6"
                    >
                      Search
                    </a>

                    {((roleId === 2 && !!permission["2_2"]) || roleId == 1) && (
                      <Link to="/customer/add" className="btn btn-primary">
                        Add New {titleSingular}
                      </Link>
                    )}

                    {/* <Link to="/registration-fields" className="btn btn-primary">
                      Registration Fields
                    </Link> */}
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
                          isLink: false,
                          name: "Deactivate",
                          click: changeStatusHandler,
                          title: "Click To Activate",
                          key: "2_3",
                        },
                        {
                          isLink: false,
                          name: "Activate",
                          click: changeStatusHandler,
                          title: "Click To Deactivate",
                          key: "2_3",
                        },
                        {
                          isLink: true,
                          to: "/customer/view",
                          name: "View",
                          extraData: true,
                          key: "2_4",
                        },
                        {
                          isLink: true,
                          to: "/customer/edit",
                          name: "Edit",
                          extraData: true,
                          key: "2_5",
                        },
                        {
                          isLink: false,
                          name: "Delete",
                          click: deleteHandler,
                          key: "2_6",
                        },
                        {
                          isLink: true,
                          to: "/customer/change-password",
                          name: "ChangePassword",
                          extraData: true,
                          title: "Change Password",
                          key: "2_7",
                        },
                        {
                          isLink: false,
                          name: "SendCreds",
                          click: sendCredentials,
                          title: "Send Credentials",
                          key: "2_8",
                        },
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
