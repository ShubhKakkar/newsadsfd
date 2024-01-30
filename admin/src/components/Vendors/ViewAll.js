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
import { addOneToDate, capitalizeFirstLetter } from "../../util/fn";

const OBJ_TABLE = {
  "first name": "firstName",
  "last name": "lastName",
  "Business Email": "businessEmail",
  "business name": "businessName",
  "Profile Status": "approvalStatus",
  "registered on": "createdAt",
  status: "isActive",
  "is Featured": "isFeatured",
};

const searchQueryHandler = (
  page,
  per_page,
  sortBy,
  order,
  isActive = "",
  firstName = "",
  lastName = "",
  businessName = "",
  businessEmail = "",
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

  return `vendor/all?page=${page}&per_page=${per_page}&sortBy=${sortBy}&order=${order}&isActive=${isActive}&firstName=${firstName}&lastName=${lastName}&businessName=${businessName}&businessEmail=${businessEmail}&country=${country}&dateFrom=${dateFrom}&dateTo=${dateTo}`;
};

const ViewAll = () => {
  const [seekers, setSeekers] = useState([]);
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
  const { request: requestSendCreds, response: responseSendCreds } =
    useRequest();
  const { request: requestChangeStatus, response: responseChangeStatus } =
    useRequest();
  const { request: requestDelete, response: responseDelete } = useRequest();
  const {
    request: requestChangeApprovalStatus,
    response: responseChangeApprovalStatus,
  } = useRequest();
  const { request: requestFeaturedStatus, response: responseFeaturedStatus } =
    useRequest();
  console.log(response);
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
    document.title = "Vendors - Noonmar";
  }, [records_per_page]);

  useEffect(() => {
    if (response) {
      setSeekers(response.vendors);
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
      const { id, status, message } = responseChangeStatus;
      toast.success(message);
      const oldSeekers = [...seekers];
      const indexToChange = oldSeekers.findIndex((seeker) => seeker._id == id);
      oldSeekers[indexToChange].isActive = status;

      setSeekers(oldSeekers);
    }
  }, [responseChangeStatus]);

  useEffect(() => {
    if (responseFeaturedStatus) {
      const { id, featured } = responseFeaturedStatus;

      const oldSeekers = [...seekers];
      const indexToChange = oldSeekers.findIndex((seeker) => seeker._id == id);
      oldSeekers[indexToChange].isFeatured = featured;

      setSeekers(oldSeekers);
    }
  }, [responseFeaturedStatus]);

  useEffect(() => {
    if (responseChangeApprovalStatus) {
      const { id, newStatus, message } = responseChangeApprovalStatus;
      toast.success(message);
      const oldSeekers = [...seekers];
      const indexToChange = oldSeekers.findIndex((seeker) => seeker._id == id);
      oldSeekers[indexToChange].approvalStatus = newStatus;

      setSeekers(oldSeekers);
    }
  }, [responseChangeApprovalStatus]);

  useEffect(() => {
    if (responseDelete) {
      const { id } = responseDelete;
      let newSeeker = [...seekers];
      newSeeker = newSeeker.filter((seeker) => seeker._id != id);
      setSeekers(newSeeker);
      toast.success("User has been deleted successfully.");
    }
  }, [responseDelete]);

  const fetchMoreData = ({ selected }) => {
    setSeekers([]);
    const {
      isActive,
      firstName,
      lastName,
      businessName,
      businessEmail,
      country,
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
        isActive,
        firstName,
        lastName,
        businessName,
        businessEmail,
        country,
        dateFrom,
        dateTo
      )
    );
  };

  const deleteHandler = (id) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You want to delete this vendor?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        requestDelete("DELETE", "group", { id });
      } else if (result.isDismissed) {
      }
    });
  };

  const onSearchHandler = (data) => {
    const {
      isActive,
      firstName,
      lastName,
      businessName,
      businessEmail,
      country,
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
        isActive,
        firstName,
        lastName,
        businessName,
        businessEmail,
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
    resetField("businessName");
    resetField("businessEmail");
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
    const {
      isActive,
      firstName,
      lastName,
      businessName,
      businessEmail,
      country,
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
        isActive,
        firstName,
        lastName,
        businessName,
        businessEmail,
        country,
        dateFrom,
        dateTo
      )
    );
    setPage(1);

    setPerPage(event.target.value);
  };

  const sortingHandler = (sortBy) => {
    const {
      isActive,
      firstName,
      lastName,
      businessName,
      businessEmail,
      country,
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
          isActive,
          firstName,
          lastName,
          businessName,
          businessEmail,
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
          businessName,
          businessEmail,
          country,
          dateFrom,
          dateTo
        )
      );
      setCurrentSort({ sortBy, order: "desc" });
    }
  };

  const changeStatusHandler = (id) => {
    const user = seekers.find((seeker) => seeker._id == id);
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
        requestChangeStatus("PUT", "vendor/status", {
          id,
          status,
        });
      } else if (result.isDismissed) {
      }
    });
  };

  const changeFeaturedHandler = (id) => {
    const user = seekers.find((seeker) => seeker._id == id);
    const featured = !user.isFeatured;

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
        requestFeaturedStatus("PUT", "vendor/featured", {
          id,
          featured,
        });
      } else if (result.isDismissed) {
      }
    });
  };

  const approveHandler = (id) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "Want to Approve vendor profile?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, change it",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        requestChangeApprovalStatus("PUT", "vendor/change-approval-status", {
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
      text: "Want to Reject vendor profile ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, change it",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        requestChangeApprovalStatus("PUT", "vendor/change-approval-status", {
          id,
          status: "rejected",
        });
      } else if (result.isDismissed) {
      }
    });
  };

  const sendCredentials = (id) => {
    requestSendCreds("POST", "vendor/send-credentials", { id });
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
      label: "Business Email",
      name: "businessEmail",
      required: false,
    },
    {
      label: "Business Name",
      name: "businessName",
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
      <Breadcrumb title="Vendors" links={[{ to: "/", name: "Dashboard" }]} />

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

                    {((roleId === 2 && !!permission["3_2"]) || roleId == 1) && (
                      <Link to="/vendor/add" className="btn btn-primary">
                        Add New Vendor
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
                      mainData={seekers}
                      tableHeading={Object.keys(OBJ_TABLE)}
                      tableData={Object.values(OBJ_TABLE)}
                      linksHelperFn={(linkName, data) => {
                        if (
                          linkName === "DeactivateFeatured" &&
                          !data.isFeatured
                        ) {
                          return "MakeActivate";
                        } else if (
                          linkName === "ActivateFeatured" &&
                          data.isFeatured
                        ) {
                          return "MakeDeactivate";
                        }
                        return null;
                      }}
                      links={[
                        // {
                        //   isLink: true,
                        //   to: `/wallet/view`,
                        //   name: "Wallet",
                        //   extraData: true,
                        // },
                        {
                          isLink: false,
                          name: "Approve",
                          click: approveHandler,
                          title: "Click To Approve",
                          key: "3_9",
                        },
                        {
                          isLink: false,
                          name: "Reject",
                          click: rejectHandler,
                          title: "Click To Reject",
                          key: "3_9",
                        },

                        {
                          isLink: true,
                          to: "/vendor/view",
                          name: "View",
                          extraData: true,
                          key: "3_4",
                        },
                        {
                          isLink: true,
                          to: "/vendor/edit",
                          name: "Edit",
                          extraData: true,
                          key: "3_5",
                        },
                        {
                          isLink: false,
                          name: "Deactivate",
                          click: changeStatusHandler,
                          title: "Click To Activate",
                          key: "3_3",
                        },
                        {
                          isLink: false,
                          name: "Activate",
                          click: changeStatusHandler,
                          title: "Click To Deactivate",
                          key: "3_3",
                        },
                        {
                          isLink: false,
                          name: "DeactivateFeatured",
                          click: changeFeaturedHandler,
                          title: "Click To Make Featured",
                          key: "3_9",
                        },
                        {
                          isLink: false,
                          name: "ActivateFeatured",
                          click: changeFeaturedHandler,
                          title: "Click To Remove Featured",
                          key: "3_9",
                        },
                        {
                          isLink: false,
                          name: "Delete",
                          click: deleteHandler,
                          key: "3_6",
                        },
                        {
                          isLink: true,
                          to: "/vendor/change-password",
                          name: "ChangePassword",
                          extraData: true,
                          title: "Change Password",
                          key: "3_7",
                        },
                        {
                          isLink: false,
                          name: "SendCreds",
                          click: sendCredentials,
                          title: "Send Credentials",
                          key: "3_8",
                        },
                        // {
                        //   isLink: false,
                        //   name: "Login",
                        //   click: loginUser,
                        //   title: "Login",
                        // },
                      ]}
                      renderAs={{
                        approvalStatus: (data) => (
                          <>
                            {data == "approved" ? (
                              <span className="label label-lg label-light-success label-inline">
                                {capitalizeFirstLetter(data)}
                              </span>
                            ) : data == "pending" ? (
                              <span className="label label-lg label-light-warning label-inline">
                                {capitalizeFirstLetter(data)}
                              </span>
                            ) : (
                              <span className="label label-lg label-light-danger label-inline">
                                {capitalizeFirstLetter(data)}
                              </span>
                            )}
                          </>
                        ),
                        isFeatured: (data) => (
                          <>
                            {data ? (
                              <span className="label label-lg label-light-success label-inline">
                                Yes
                              </span>
                            ) : (
                              <span className="label label-lg label-light-danger label-inline">
                                No
                              </span>
                            )}
                          </>
                        ),
                      }}
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
