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
  sender: "sender",
  receiver: "receiver",
  product: "product",
  quantity: "quantity",
  "created at": "createdAt",
};

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

  return `warehouse/transactions?page=${page}&per_page=${per_page}&sortBy=${sortBy}&order=${order}&receiverId=${receiver}&senderId=${sender}&product=${product}&quantity=${quantity}&dateFrom=${dateFrom}&dateTo=${dateTo}&role=customer`;
};
const ViewAllTransactions = () => {
  const [transaction, setTransaction] = useState([]);
  const [page, setPage] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(10);
  const [perPage, setPerPage] = useState(0);
  const [currentSort, setCurrentSort] = useState({
    sortBy: "created at",
    order: "desc",
  });
  const [warehouses, setWarehouses] = useState([]);
  
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
  const { response: responseSearchData, request: requestSearchData } =
    useRequest();
  const { response: responseWarehouses, request: requestWarehouses } =
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
    document.title = "Transactions - Noonmar";
  }, [records_per_page]);

  useEffect(() => {
    if (response) {
      setTransaction(response.transactions ? response.transactions : []);
      setTotalDocuments((prev) => response.totalDocuments ?? prev);
    }
  }, [response]);

  useEffect(() => {
    requestWarehouses("GET", `warehouse/all?page=1&isActive=${true}`);
  }, []);

  useEffect(() => {
    if (responseWarehouses) {
      setWarehouses(responseWarehouses.data);
    }
  }, [responseWarehouses]);

  const fetchMoreData = ({ selected }) => {
    setTransaction([]);
    const { receiverId, senderId } = getValues();

    setPage(selected + 1);
    request(
      "GET",
      searchQueryHandler(
        selected + 1,
        perPage,
        currentSort.sortBy,
        currentSort.order,
        receiverId,
        senderId
      )
    );
  };

  const onSearchHandler = (data) => {
    const { receiverId, senderId } = getValues();

    request(
      "GET",
      searchQueryHandler(
        1,
        perPage,
        currentSort.sortBy,
        currentSort.order,
        receiverId,
        senderId
      )
    );
    setPage(1);
  };

  const onResetHandler = (e) => {
    e.preventDefault();

    resetField("receiverId");
    resetField("senderId");
    request(
      "GET",
      searchQueryHandler(1, perPage, currentSort.sortBy, currentSort.order)
    );
    setPage(1);
  };

  const perPageChangeHandler = (event) => {
    const { receiverId, senderId } = getValues();

    request(
      "GET",
      searchQueryHandler(
        1,
        event.target.value,
        currentSort.sortBy,
        currentSort.order,
        receiverId,
        senderId
      )
    );
    setPage(1);

    setPerPage(event.target.value);
  };

  const sortingHandler = (sortBy) => {
    const { receiverId, senderId, product, quantity, dateFrom, dateTo } =
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
          receiverId,
          senderId,
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
          receiverId,
          senderId,
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
    {
      isSelectInput: true,
      label: "Sender Warehouse",
      name: "senderId",
      required: false,
      children: warehouses && warehouses.length > 0 && (
        <>
          <option value="">Select an option</option>
          {warehouses.map((obj) => (
            <option key={obj._id} value={obj._id}>
              {obj.name}
            </option>
          ))}
        </>
      ),
    },
    {
      isSelectInput: true,
      label: "Receiver Warehouse",
      name: "receiverId",
      required: false,
      children: warehouses && warehouses.length > 0 && (
        <>
          <option value="">Select an option</option>
          {warehouses.map((obj) => (
            <option key={obj._id} value={obj._id}>
              {""}
              {obj.name}
            </option>
          ))}
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
        title="Transactions"
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

                    {((roleId === 2 && !!permission["7_20"]) ||
                      roleId == 1) && (
                      <Link
                        to="/warehouse/transfer"
                        className="btn btn-primary"
                      >
                        Make Transfer
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
                      mainData={transaction}
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
                          //{
                          //   isLink: false,
                          //   name: "Deactivate",
                          //   click: changeStatusHandler,
                          //   title: "Click To Activate",
                          //   key: "7_3",
                          // },
                          // {
                          //   isLink: false,
                          //   name: "Activate",
                          //   click: changeStatusHandler,
                          //   title: "Click To Deactivate",
                          //   key: "7_3",
                          // },
                          // {
                          //   isLink: true,
                          //   to: "/warehouse/view",
                          //   name: "View",
                          //   extraData: true,
                          //   key: "7_4",
                          // },
                          // {
                          //   isLink: true,
                          //   to: "/warehouse/edit",
                          //   name: "Edit",
                          //   extraData: true,
                          //   key: "7_5",
                          // },
                          // {
                          //   isLink: true,
                          //   to: "/warehouse/products",
                          //   name: "Read",
                          //   title: "View Products",
                          //   extraData: true,
                          //   key: "7_7",
                          // },
                          // {
                          //   isLink: true,
                          //   to: "/warehouse/add-products",
                          //   name: "Add Product",
                          //   title: "Inventory",
                          //   key: "7_8",
                          // },
                          // {
                          //   isLink: false,
                          //   name: "Delete",
                          //   click: deleteHandler,
                          //   key: "7_6",
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
                        currentDocLength={transaction.length}
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

export default ViewAllTransactions;
