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
  name: "name",
  order: "order",
  image: "image",
  "created at": "createdAt",
  status: "isActive",
  "is Featured": "isFeatured",
};

const searchQueryHandler = (
  page,
  per_page,
  sortBy,
  order,
  parentId = "",
  isActive = "",
  name = "",
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

  return `product-category/all?page=${page}&per_page=${per_page}&sortBy=${sortBy}&order=${order}&isActive=${isActive}&name=${name}&dateFrom=${dateFrom}&dateTo=${dateTo}&parentId=${parentId}`;
};

const ViewAll = (props) => {
  const { id: parentId } = props.match.params;

  const [seekers, setSeekers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(10);
  const [perPage, setPerPage] = useState(0);
  const [currentSort, setCurrentSort] = useState({
    sortBy: "order",
    order: "asc",
  });
  const [grandFatherId, setGrandFatherId] = useState("");

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
  const { request: requestFeaturedStatus, response: responseFeaturedStatus } =
    useRequest();

  useEffect(() => {
    if (records_per_page) {
      resetStates();
      setPerPage(records_per_page);
      request(
        "GET",
        searchQueryHandler(
          1,
          records_per_page,
          currentSort.sortBy,
          currentSort.order,
          parentId
        )
      );
    }
    document.title = "Product Categories- Noonmar";
  }, [parentId]);

  useEffect(() => {
    if (response) {
      console.log(response.data);
      setSeekers(response.data);
      setTotalDocuments((prev) => response.totalDocuments ?? prev);

      if (response.categoryData && response.categoryData.parentId) {
        setGrandFatherId(response.categoryData.parentId);
      }
    }
  }, [response]);

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
    if (responseChangeStatus) {
      const { id, status } = responseChangeStatus;

      const oldSeekers = [...seekers];
      const indexToChange = oldSeekers.findIndex((seeker) => seeker._id == id);
      oldSeekers[indexToChange].isActive = status;

      setSeekers(oldSeekers);
    }
  }, [responseChangeStatus]);

  useEffect(() => {
    if (responseDelete) {
      const { id } = responseDelete;
      let newSeeker = [...seekers];
      newSeeker = newSeeker.filter((seeker) => seeker._id != id);
      const index = newSeeker.findIndex((item) => item._id == id);

      const Data = newSeeker.map((item, newIndex) => {
        if (newIndex - 1 > index) {
          item.order = item.order - 1;
        }
        return item;
      });
      // for (let i = index + 1; i <= newSeeker.length - 1; i++) {
      //   newSeeker[i].order = newSeeker[i].order - 1;
      //   return newSeeker;
      // }
      setSeekers(Data);
      toast.success("Product category has been deleted successfully.");
    }
  }, [responseDelete]);

  const fetchMoreData = ({ selected }) => {
    setSeekers([]);
    const { isActive, name, dateFrom, dateTo } = getValues();

    setPage(selected + 1);
    request(
      "GET",
      searchQueryHandler(
        selected + 1,
        perPage,
        currentSort.sortBy,
        currentSort.order,
        parentId,
        isActive,
        name,
        dateFrom,
        dateTo
      )
    );
  };

  const resetStates = () => {
    setSeekers([]);
    setPage(1);
    setTotalDocuments(10);
    // setPerPage(0);
    setGrandFatherId("");
  };

  const deleteHandler = (id) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You want to delete this product category?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        requestDelete("DELETE", "product-category", { id });
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
        requestFeaturedStatus("PUT", "product-category/featured", {
          id,
          featured,
        });
      } else if (result.isDismissed) {
      }
    });
  };

  const onSearchHandler = (data) => {
    const { isActive, name, dateFrom, dateTo } = getValues();

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
        parentId,
        isActive,
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
    resetField("name");
    resetField("dateFrom");
    resetField("dateTo");
    request(
      "GET",
      searchQueryHandler(
        1,
        perPage,
        currentSort.sortBy,
        currentSort.order,
        parentId
      )
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
        parentId,
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
          parentId,
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
          parentId,
          isActive,
          name,
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
        requestChangeStatus("PUT", "product-category/status", {
          id,
          status,
        });
      } else if (result.isDismissed) {
      }
    });
  };

  const orderHandler = () => {
    const { isActive, name, dateFrom, dateTo } = getValues();

    const api = searchQueryHandler(
      page,
      perPage,
      currentSort.sortBy,
      currentSort.order,
      parentId,
      isActive,
      name,
      dateFrom,
      dateTo
    );

    return api.split("?")[1];
  };

  const InputFields = [
    // {
    //   label: "Status",
    //   name: "isActive",
    //   required: false,
    // },
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

  const breadcrumbLinks = [];
  const links = [];

  if (parentId && grandFatherId) {
    breadcrumbLinks.push({
      to: `/product/categories/${grandFatherId}`,
      name: "Back To Product Categories",
    });
  } else if (parentId) {
    breadcrumbLinks.push({
      to: `/product/categories`,
      name: "Back To Product Categories",
    });
  }

  // if (!grandFatherId) {
  links.push({
    isLink: true,
    // to: "/product/sub-categories",
    to: "/product/categories",
    name: "Read",
    title: "View Categories",
    extraData: true,
    key: "6_40",
  });
  // }

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Product Categories"
        links={[{ to: "/", name: "Dashboard" }, ...breadcrumbLinks]}
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
                    {((roleId === 2 && !!permission["6_21"]) ||
                      roleId == 1) && (
                      <Link
                        to={
                          parentId
                            ? `/product/category/${parentId}/add`
                            : "/product/category/add"
                        }
                        className="btn btn-primary"
                      >
                        Add New Product Category
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
                          name: "Deactivate",
                          click: changeStatusHandler,
                          title: "Click To Activate",
                          key: "6_22",
                        },
                        {
                          isLink: false,
                          name: "Activate",
                          click: changeStatusHandler,
                          title: "Click To Deactivate",
                          key: "6_22",
                        },
                        // {
                        //   isLink: true,
                        //   to: "/product/category/view",
                        //   name: "View",
                        //   extraData: true,
                        //   key: "6_23",
                        // },
                        {
                          isLink: true,
                          to: "/product/category/edit",
                          name: "Edit",
                          extraData: true,
                          key: "6_24",
                        },
                        ...links,
                        {
                          isLink: false,
                          name: "DeactivateFeatured",
                          click: changeFeaturedHandler,
                          title: "Click To Make Featured",
                          key: "6_99",
                        },
                        {
                          isLink: false,
                          name: "ActivateFeatured",
                          click: changeFeaturedHandler,
                          title: "Click To Remove Featured",
                          key: "6_99",
                        },
                        {
                          isLink: false,
                          name: "Delete",
                          click: deleteHandler,
                          key: "6_25",
                        },
                      ]}
                      renderAs={{
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
                      sorting={true}
                      orderHandler={orderHandler}
                      page={page}
                      per_page={perPage}
                      sortObj={{ data: { parentId }, api: "product-category" }}
                      responseKey="data"
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
