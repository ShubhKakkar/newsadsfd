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
import { useParams } from "react-router";

const OBJ_TABLE = {
  sender: "sender",
  receiver: "receiver",
  product: "product",
  quantity: "quantity",
  type: "type",
  // vendor: "vendor",
  // "no of products available": "totalProducts",
  // "orders fulfilled": "ordersFulfilled",
  "created at": "createdAt",
};

const ViewWarehouseLogs = (props) => {
  const { id: warehouseId } = props.match.params;
  const [seekers, setSeekers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(10);
  const [perPage, setPerPage] = useState(0);
  const [currentSort, setCurrentSort] = useState({
    sortBy: "created at",
    order: "desc",
  });

  const searchQueryHandler = (
    page,
    per_page,
    sortBy,
    order,
    receiver = "",
    sender = "",
    product = "",
    quantity = "",
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

    return `warehouse/in-out-logs/${warehouseId}?page=${page}&per_page=${per_page}&sortBy=${sortBy}&order=${order}&receiver=${receiver}&sender=${sender}&product=${product}&quantity=${quantity}&dateFrom=${dateFrom}&dateTo=${dateTo}&role=customer`;
  };

  // const [allCountry, setAllCountry] = useState([]);
  // const [allVendors, setAllVendors] = useState([]);
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
  const { response: responseVendors, request: requestVendors } = useRequest();
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
    document.title = "Warehouse Management- Noonmar";
  }, [records_per_page]);

  useEffect(() => {
    if (response) {
      setSeekers(response.logs);
      setTotalDocuments((prev) => response.totalDocuments ?? prev);
    }
  }, [response]);

  useEffect(() => {
    // requestCountries("GET", `country/all?page=1&isActive=${true}`);
    // requestVendors("GET", `vendor/all?page=1&isActive=${true}&per_page=100`);
  }, []);

  // useEffect(() => {
  //   if (responseCountries) {
  //     if (responseCountries.status && responseCountries.data) {
  //       setAllCountry(responseCountries.data);
  //     }
  //   }
  // }, [responseCountries]);

  // useEffect(() => {
  //   if (responseVendors) {
  //     if (responseVendors.status && responseVendors.vendors) {
  //       setAllVendors(responseVendors.vendors);
  //     }
  //   }
  // }, [responseVendors]);

  const fetchMoreData = ({ selected }) => {
    setSeekers([]);
    const { receiver, sender, product, quantity, dateFrom, dateTo } =
      getValues();

    setPage(selected + 1);
    request(
      "GET",
      searchQueryHandler(
        selected + 1,
        perPage,
        currentSort.sortBy,
        currentSort.order,
        receiver,
        sender,
        product,
        quantity,
        dateFrom,
        dateTo
      )
    );
  };

  const onSearchHandler = (data) => {
    const { receiver, sender, product, quantity, dateFrom, dateTo } =
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
        receiver,
        sender,
        product,
        quantity,
        dateFrom,
        dateTo
      )
    );
    setPage(1);
  };

  const onResetHandler = (e) => {
    e.preventDefault();
    resetField("quantity");
    resetField("receiver");
    resetField("sender");
    resetField("product");
    resetField("dateFrom");
    resetField("dateTo");
    request(
      "GET",
      searchQueryHandler(1, perPage, currentSort.sortBy, currentSort.order)
    );
    setPage(1);
  };

  const perPageChangeHandler = (event) => {
    const { receiver, sender, product, quantity, dateFrom, dateTo } =
      getValues();

    request(
      "GET",
      searchQueryHandler(
        1,
        event.target.value,
        currentSort.sortBy,
        currentSort.order,
        receiver,
        sender,
        product,
        quantity,
        dateFrom,
        dateTo
      )
    );
    setPage(1);

    setPerPage(event.target.value);
  };

  const sortingHandler = (sortBy) => {
    const { receiver, sender, product, quantity, dateFrom, dateTo } =
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
          receiver,
          sender,
          product,
          quantity,
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
          receiver,
          sender,
          product,
          quantity,
          dateFrom,
          dateTo
        )
      );
      setCurrentSort({ sortBy, order: "desc" });
    }
  };

  const InputFields = [
    // {
    //   label: "Name",
    //   name: "name",
    //   required: false,
    // },
    // {
    //   isSelectInput: true,
    //   label: "Country",
    //   name: "country",
    //   required: false,
    //   children: allCountry && allCountry.length > 0 && (
    //     <>
    //       <option value="">{"Select an option"}</option>
    //       {allCountry.map((obj) => (
    //         <option key={obj._id} value={obj._id}>
    //           {" "}
    //           {obj.name}
    //         </option>
    //       ))}
    //     </>
    //   ),
    // },
    // {
    //   isSelectInput: true,
    //   label: "Vendor",
    //   name: "vendor",
    //   required: false,
    //   children: allVendors && allVendors.length > 0 && (
    //     <>
    //       <option value="">{"Select an option"}</option>
    //       {allVendors.map((obj) => (
    //         <option key={obj._id} value={obj._id}>
    //           {" "}
    //           {obj.businessName}
    //         </option>
    //       ))}
    //     </>
    //   ),
    // },
    // {
    //   isSelectInput: true,
    //   label: "Status",
    //   name: "isActive",
    //   required: false,
    //   children: (
    //     <>
    //       <option value="">{"Select an option"}</option>
    //       <option value={true}> {"Activated"}</option>
    //       <option value={false}>{"Deactivated"}</option>
    //     </>
    //   ),
    // },
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
        title="In & Out Logs"
        links={[{ to: "/", name: "Dashboard" }]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="row">
            <div className="col-12">
              <div className="card card-custom card-stretch card-shadowless">
                {/* <div className="card-header">
                  <div className="card-title"></div>
                  <div className="card-toolbar">
                    <a
                      className="btn btn-primary dropdown-toggle mr-2"
                      data-toggle="collapse"
                      data-target="#collapseOne6"
                    >
                      Search
                    </a>

                    {((roleId === 2 && !!permission["7_2"]) || roleId == 1) && (
                      <Link to="/warehouse/add" className="btn btn-primary">
                        Add New Warehouse
                      </Link>
                    )}
                  </div>
                </div> */}
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
                      renderAs={{
                        type: (data) => (
                          <>
                            {data == "in" ? (
                              <span className="label label-lg label-light-success label-inline">
                                In
                              </span>
                            ) : (
                              <span className="label label-lg label-light-danger label-inline">
                                Out
                              </span>
                            )}
                          </>
                        ),
                      }}
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
                        ]
                      }
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

export default ViewWarehouseLogs;
