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
  email: "email",
  role: "roleName",
  "registered on": "createdAt",
  status: "isActive",
};

const searchQueryHandler = (
  page,
  per_page,
  sortBy,
  order,
  isActive = "",
  name = "",
  email = "",
  roleName = "",
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

  return `sub-admin?page=${page}&per_page=${per_page}&sortBy=${sortBy}&order=${order}&isActive=${isActive}&name=${name}&email=${email}&roleName=${roleName}&dateFrom=${dateFrom}&dateTo=${dateTo}`;
};

const ViewAll = () => {
  const [subadmin, setSubadmin] = useState([]);
  const [page, setPage] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(10);
  const [perPage, setPerPage] = useState(0);
  const [currentSort, setCurrentSort] = useState({
    sortBy: "registered on",
    order: "desc",
  });

  const MySwal = withReactContent(Swal);

  const { records_per_page } = useSelector((state) => state.setting);
  const { permission, roleId } = useSelector((state) => state.auth);

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
  const { request: requestSendCreds, response: responseSendCreds } =
    useRequest();
  const { request: loginRequest, response: loginResponce } = useRequest();
  const { request: enableAccountRequest, response: enableAccountResponce } =
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
          currentSort.order
        )
      );
    }
    document.title = "Subadmin - Noonmar";
  }, [records_per_page]);

  useEffect(() => {
    if (response) {
      setSubadmin(response.subadmin);
      setTotalDocuments((prev) => response.totalDocuments ?? prev);
    }
  }, [response]);

  useEffect(() => {
    if (responseChangeStatus) {
      const { id, status } = responseChangeStatus;

      const oldSubadmin = [...subadmin];
      const indexToChange = oldSubadmin.findIndex(
        (subadmin) => subadmin._id == id
      );
      oldSubadmin[indexToChange].isActive = status;

      setSubadmin(oldSubadmin);
    }
  }, [responseChangeStatus]);

  // useEffect(() => {
  //   if (enableAccountResponce) {
  //     const { id, isAccountDisabled } = enableAccountResponce;

  //     const oldSeekers = [...seekers];
  //     const indexToChange = oldSeekers.findIndex((seeker) => seeker._id == id);
  //     oldSeekers[indexToChange].isAccountDisabled = isAccountDisabled;

  //     setSeekers(oldSeekers);
  //   }
  // }, [enableAccountResponce]);

  useEffect(() => {
    if (responseDelete) {
      const { id } = responseDelete;
      let newSubadmin = [...subadmin];
      newSubadmin = newSubadmin.filter((sub) => sub._id != id);
      setSubadmin(newSubadmin);
      toast.success("Subadmin has been deleted successfully.");
    }
  }, [responseDelete]);

  useEffect(() => {
    if (responseSendCreds) {
      toast.success("Login credentials sent successfully");
    }
  }, [responseSendCreds]);

  useEffect(() => {
    if (loginResponce) {
      window.open(
        `http://192.168.235.200:3002?token=${loginResponce?.token}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  }, [loginResponce]);

  const fetchMoreData = ({ selected }) => {
    setSubadmin([]);
    const { isActive, name, email, roleName, dateFrom, dateTo } = getValues();

    setPage(selected + 1);
    request(
      "GET",
      searchQueryHandler(
        selected + 1,
        perPage,
        currentSort.sortBy,
        currentSort.order,
        isActive,
        name,
        email,
        roleName,
        dateFrom,
        dateTo
      )
    );
  };

  const deleteHandler = (id) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You want to delete this sub-admin?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        requestDelete("DELETE", "sub-admin", { id });
      } else if (result.isDismissed) {
      }
    });
  };

  const onSearchHandler = (data) => {
    let { isActive, name, email, roleName, dateFrom, dateTo } = data;

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
        name,
        email,
        roleName,
        dateFrom,
        dateTo
      )
    );
    setPage(1);
  };

  const onResetHandler = (e) => {
    e.preventDefault();
    resetField("isActive");
    resetField("name");
    resetField("lastName");
    resetField("email");
    resetField("contact");
    resetField("dateFrom");
    resetField("dateTo");
    request(
      "GET",
      searchQueryHandler(1, perPage, currentSort.sortBy, currentSort.order)
    );
    setPage(1);
  };

  const perPageChangeHandler = (event) => {
    const { isActive, name, email, roleName, dateFrom, dateTo } = getValues();

    request(
      "GET",
      searchQueryHandler(
        1,
        event.target.value,
        currentSort.sortBy,
        currentSort.order,
        isActive,
        name,
        email,
        roleName,
        dateFrom,
        dateTo
      )
    );
    setPage(1);

    setPerPage(event.target.value);
  };

  const sortingHandler = (sortBy) => {
    const { isActive, name, email, roleName, dateFrom, dateTo } = getValues();

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
          email,
          roleName,
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
          isActive,
          name,
          email,
          roleName,
          dateFrom,
          dateTo
        )
      );
      setCurrentSort({ sortBy, order: "desc" });
    }
  };

  const changeStatusHandler = (id) => {
    const Subadmin = subadmin.find((subadmin) => subadmin._id == id);
    const status = Subadmin.isActive == true ? false : true;

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
        requestChangeStatus("PUT", "sub-admin/status", {
          id,
          status,
        });
      } else if (result.isDismissed) {
      }
    });
  };

  const changeAccountDisableHandler = (id) => {
    const subadmin = subadmin.find((subadmin) => subadmin._id == id);
    // const status = user.isAccountDisabled == false;

    MySwal.fire({
      title: "Are you sure?",
      text: "Want to Enable?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, change it",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        enableAccountRequest("PUT", "sub-admin/enable-user", {
          id,
        });
      } else if (result.isDismissed) {
      }
    });
  };

  const sendCredentials = (id) => {
    requestSendCreds("POST", "sub-admin/send-credentials", { id });
  };

  const loginUser = (id) => {
    loginRequest("POST", "admin/login-user", { id });
  };

  const InputFields = [
    {
      label: "Name",
      name: "name",
      required: false,
    },
    {
      label: "Email",
      name: "email",
      required: false,
    },
    {
      label: "Role",
      name: "roleName",
      required: false,
    },
    {
      label: "Status",
      name: "isActive",
      required: false,
      isSelectInput: true,
      children: (
        <>
          {/* <option value={undefined}>Select</option> */}
          <option value="">Select</option>
          <option value={true}>Active</option>
          <option value={false}>Not active</option>
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
      <Breadcrumb title="Sub-Admin" links={[{ to: "/", name: "Dashboard" }]} />

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

                    {((roleId === 2 && !!permission["4_2"]) || roleId == 1) && (
                      <Link to="/sub-admin/add" className="btn btn-primary">
                        Add New Subadmin
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
                      mainData={subadmin}
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
                          key: "4_6",
                        },
                        {
                          isLink: false,
                          name: "Activate",
                          click: changeStatusHandler,
                          title: "Click To Deactivate",
                          key: "4_6",
                        },
                        {
                          isLink: true,
                          to: "/sub-admin/edit",
                          name: "Edit",
                          extraData: true,
                          key: "4_3",
                        },
                        {
                          isLink: false,
                          name: "Delete",
                          click: deleteHandler,
                          key: "4_7",
                        },
                        {
                          isLink: true,
                          to: "/sub-admin/change-password",
                          name: "ChangePassword",
                          extraData: true,
                          title: "Change Password",
                          key: "4_4",
                        },
                        {
                          isLink: false,
                          name: "SendCreds",
                          click: sendCredentials,
                          title: "Send Credentials",
                          key: "4_5",
                        },
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
                        currentDocLength={subadmin.length}
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
