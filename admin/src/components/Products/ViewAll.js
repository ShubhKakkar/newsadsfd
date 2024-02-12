import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import Moment from "moment";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Link, useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import useRequest from "../../hooks/useRequest";
import Pagination from "../Pagination/Pagination";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import Table from "../Table/Table";
import { SearchInput, SearchSubmitButton } from "../Form/Form";
import { addOneToDate } from "../../util/fn";
import ImportProduct from "./Components/ImportProduct";

const OBJ_TABLE = {
  name: "name",
  "price ($)": "sellingPrice",
  "Product Id": "customId",
  Category: "categoryName",
  // vendor: "vendorName",
  brand: "brandName",
  "created at": "createdAt",
  status: "isActive",
  "approval status": "isApproved",
  "publish status": "status",
  // "is Sponsored": "isSponsored",
};

const searchQueryHandler = (
  page,
  per_page,
  sortBy,
  order,
  isActive = "",
  name = "",
  vendor = "",
  masterCategoryId = "",
  price = "",
  customId = "",
  brandId = "",
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

  return `product/all?page=${page}&per_page=${per_page}&sortBy=${sortBy}&order=${order}&isActive=${isActive}&name=${name}&vendor=${vendor}&masterCategoryId=${masterCategoryId}&dateFrom=${dateFrom}&dateTo=${dateTo}&brandId=${brandId}&customId=${customId}&price=${price}`;
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

  const [allVendors, setAllVendors] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [allBrands, setAllBrands] = useState([]);

  const MySwal = withReactContent(Swal);

  const history = useHistory();

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

  const isApproved = history.location.pathname === "/pending-products";

  let dynamicString = "";

  if (isApproved) {
    dynamicString = "&isApproved=false";
  }

  const { request, response } = useRequest();

  const { response: responseSearchData, request: requestSearchData } =
    useRequest();

  const { request: requestChangeStatus, response: responseChangeStatus } =
    useRequest();

  const {
    request: requestChangePublishStatus,
    response: responseChangePublishStatus,
  } = useRequest();

  const {
    request: requestChangeApproveStatus,
    response: responseChangeApproveStatus,
  } = useRequest();

  const { request: requestDelete, response: responseDelete } = useRequest();
  const { request: requestSponsoredStatus, response: responseSponsoredStatus } =
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
        ) + dynamicString
      );
    }
    document.title = "Products - Noonmar";
  }, [dynamicString]);

  useEffect(() => {
    if (response) {
      setSeekers(response.data);
      setTotalDocuments((prev) => response.totalDocuments ?? prev);
    }
  }, [response]);

  useEffect(() => {
    requestSearchData("GET", `product/search-data`);
  }, []);

  useEffect(() => {
    if (responseSearchData) {
      setAllVendors(responseSearchData.vendors);
      setAllCategories(responseSearchData.mainCategories);
      setAllBrands(responseSearchData.brands);
    }
  }, [responseSearchData]);

  useEffect(() => {
    if (responseChangeStatus) {
      const { id, newStatus } = responseChangeStatus;

      const oldSeekers = [...seekers];
      const indexToChange = oldSeekers.findIndex((seeker) => seeker._id === id);
      oldSeekers[indexToChange].isActive = newStatus;

      setSeekers(oldSeekers);
    }
  }, [responseChangeStatus]);

  useEffect(() => {
    if (responseSponsoredStatus) {
      const { id, sponsored } = responseSponsoredStatus;

      const oldSeekers = [...seekers];
      const indexToChange = oldSeekers.findIndex((seeker) => seeker._id == id);
      oldSeekers[indexToChange].isSponsored = sponsored;

      setSeekers(oldSeekers);
    }
  }, [responseSponsoredStatus]);

  useEffect(() => {
    if (responseChangePublishStatus) {
      const { id, newStatus } = responseChangePublishStatus;

      const oldSeekers = [...seekers];
      const indexToChange = oldSeekers.findIndex((seeker) => seeker._id === id);
      oldSeekers[indexToChange].status = newStatus ? "Publish" : "Draft";

      setSeekers(oldSeekers);
    }
  }, [responseChangePublishStatus]);

  useEffect(() => {
    if (responseChangeApproveStatus) {
      const { id, newStatus } = responseChangeApproveStatus;

      if (isApproved) {
        let newSeeker = [...seekers];
        newSeeker = newSeeker.filter((seeker) => seeker._id != id);
        setSeekers(newSeeker);
        return;
      }

      const oldSeekers = [...seekers];
      const indexToChange = oldSeekers.findIndex((seeker) => seeker._id === id);
      oldSeekers[indexToChange].isApproved = newStatus;

      setSeekers(oldSeekers);
    }
  }, [responseChangeApproveStatus]);

  useEffect(() => {
    if (responseDelete) {
      const { id } = responseDelete;
      let newSeeker = [...seekers];
      newSeeker = newSeeker.filter((seeker) => seeker._id != id);
      setSeekers(newSeeker);
      toast.success("Product has been deleted successfully.");
    }
  }, [responseDelete]);

  const fetchMoreData = ({ selected }) => {
    setSeekers([]);
    const {
      isActive,
      name,
      vendor,
      masterCategoryId,
      customId,
      brandId,
      price,
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
        name,
        vendor,
        masterCategoryId,
        price,
        customId,
        brandId,
        dateFrom,
        dateTo
      ) + dynamicString
    );
  };

  const deleteHandler = (id) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You want to delete this product?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        requestDelete("DELETE", "product", { id });
      } else if (result.isDismissed) {
      }
    });
  };

  const onSearchHandler = (data) => {
    const {
      isActive,
      name,
      vendor,
      masterCategoryId,
      customId,
      brandId,
      price,
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
        name,
        vendor,
        masterCategoryId,
        price,
        customId,
        brandId,
        dateFrom,
        dateTo
      ) + dynamicString
    );
    setPage(1);
  };

  const onResetHandler = (e) => {
    e.preventDefault();
    resetField("isActive");
    resetField("name");
    resetField("vendor");
    resetField("masterCategoryId");
    resetField("price");
    resetField("customId");
    resetField("brandId");
    resetField("dateFrom");
    resetField("dateTo");
    request(
      "GET",
      searchQueryHandler(1, perPage, currentSort.sortBy, currentSort.order) +
        dynamicString
    );
    setPage(1);
  };

  const perPageChangeHandler = (event) => {
    const {
      isActive,
      name,
      vendor,
      masterCategoryId,
      customId,
      brandId,
      price,
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
        name,
        vendor,
        masterCategoryId,
        price,
        customId,
        brandId,
        dateFrom,
        dateTo
      ) + dynamicString
    );
    setPage(1);

    setPerPage(event.target.value);
  };

  const sortingHandler = (sortBy) => {
    const {
      isActive,
      name,
      vendor,
      masterCategoryId,
      customId,
      brandId,
      price,
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
          name,
          vendor,
          masterCategoryId,
          price,
          customId,
          brandId,
          dateFrom,
          dateTo
        ) + dynamicString
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
          vendor,
          masterCategoryId,
          price,
          customId,
          brandId,
          dateFrom,
          dateTo
        ) + dynamicString
      );
      setCurrentSort({ sortBy, order: "desc" });
    }
  };

  const changeStatusHandler = (id) => {
    const user = seekers.find((seeker) => seeker._id === id);
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
        requestChangeStatus("PUT", "product/status", {
          id,
          status,
        });
      } else if (result.isDismissed) {
      }
    });
  };

  const changeSponsoredHandler = (id) => {
    const user = seekers.find((seeker) => seeker._id == id);
    const sponsored = !user.isSponsored;

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
        requestSponsoredStatus("PUT", "product/sponsored", {
          id,
          sponsored,
        });
      } else if (result.isDismissed) {
      }
    });
  };

  const changePublishStatusHandler = (id) => {
    const user = seekers.find((seeker) => seeker._id === id);
    const status = user.status === "Publish" ? false : true;

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
        requestChangePublishStatus("PUT", "product/publish", {
          id,
          status,
        });
      } else if (result.isDismissed) {
      }
    });
  };

  const changeIsApprovedStatus = (id) => {
    const user = seekers.find((seeker) => seeker._id === id);
    const status = !user.isApproved;

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
        requestChangeApproveStatus("PUT", "product/approve", {
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
      label: "Price",
      name: "price",
      required: false,
    },
    {
      label: "Product Id",
      name: "customId",
      required: false,
    },
    {
      isSelectInput: true,
      label: "Status",
      name: "isActive",
      required: false,
      children: (
        <>
          <option value="">Select an option</option>
          <option value={true}>Activated</option>
          <option value={false}>Deactivated</option>
        </>
      ),
    },
    {
      isSelectInput: true,
      label: "Vendor",
      name: "vendor",
      required: false,
      children: allVendors && allVendors.length > 0 && (
        <>
          <option value="">Select an option</option>
          {allVendors.map((obj) => (
            <option key={obj._id} value={obj._id}>
              {obj.businessName}
            </option>
          ))}
        </>
      ),
    },
    {
      isSelectInput: true,
      label: "Category",
      name: "masterCategoryId",
      required: false,
      children: allCategories && allCategories.length > 0 && (
        <>
          <option value="">{"Select an option"}</option>
          {allCategories.map((obj) => (
            <option key={obj._id} value={obj._id}>
              {obj.name}
            </option>
          ))}
        </>
      ),
    },
    {
      isSelectInput: true,
      label: "Brand",
      name: "brandId",
      required: false,
      children: allBrands && allBrands.length > 0 && (
        <>
          <option value="">{"Select an option"}</option>
          {allBrands.map((obj) => (
            <option key={obj._id} value={obj._id}>
              {obj.name}
            </option>
          ))}
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
      <Breadcrumb title="Products" links={[{ to: "/", name: "Dashboard" }]} />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="row">
            <div className="col-12">
              <div className="card card-custom card-stretch card-shadowless">
                <div className="card-header">
                  <div className="card-title"></div>
                  <div className="card-toolbar">
                    {!isApproved && <ImportProduct allVendors={allVendors} />}
                    <a
                      /*href="#!"*/
                      className="btn btn-primary dropdown-toggle mr-2"
                      data-toggle="collapse"
                      data-target="#collapseOne6"
                    >
                      Search
                    </a>
                    {!isApproved &&
                      ((roleId === 2 && !!permission["6_2"]) ||
                        roleId == 1) && (
                        <Link to="/product/add" className="btn btn-primary">
                          Add New Product
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
                      dontShowSort={[
                        "Master Category",
                        "vendor",
                        "brand",
                        "status",
                        "publish status",
                        "approval status",
                      ]}
                      linksHelperFn={(linkName, data) => {
                        if (
                          linkName === "DeactivateSponsored" &&
                          !data.isSponsored
                        ) {
                          return "MakeActivate";
                        } else if (
                          linkName === "ActivateSponsored" &&
                          data.isSponsored
                        ) {
                          return "MakeDeactivate";
                        }
                        return null;
                      }}
                      links={[
                        {
                          isLink: false,
                          name: "Deactivate",
                          click: changeStatusHandler,
                          title: "Click To Activate",
                          key: "6_3",
                        },
                        {
                          isLink: false,
                          name: "Activate",
                          click: changeStatusHandler,
                          title: "Click To Deactivate",
                          key: "6_3",
                        },
                        {
                          isLink: false,
                          name: "DeactivateSponsored",
                          click: changeSponsoredHandler,
                          title: "Click To Make Sponsored",
                          key: "3_9",
                        },
                        {
                          isLink: false,
                          name: "ActivateSponsored",
                          click: changeSponsoredHandler,
                          title: "Click To Remove Sponsored",
                          key: "3_9",
                        },
                        {
                          isLink: false,
                          name: "Verified",
                          click: changeIsApprovedStatus,
                          title: "Click To Pending",
                          key: "6_8",
                        },
                        {
                          isLink: false,
                          name: "Pending",
                          click: changeIsApprovedStatus,
                          title: "Click To Verified",
                          key: "6_9",
                        },
                        // {
                        //   isLink: false,
                        //   name: "Publish",
                        //   click: changePublishStatusHandler,
                        //   title: "Click To Draft",
                        //   key: "6_4",
                        // },
                        // {
                        //   isLink: false,
                        //   name: "Draft",
                        //   click: changePublishStatusHandler,
                        //   title: "Click To Publish",
                        //   key: "6_4",
                        // },

                        // {
                        //   isLink: true,
                        //   to: "/product/view",
                        //   name: "View",
                        //   extraData: true,
                        //   key: "6_5",
                        // },
                        {
                          isLink: true,
                          to: "/product/edit",
                          name: "Edit",
                          extraData: true,
                        },
                        {
                          isLink: false,
                          name: "Delete",
                          click: deleteHandler,
                          key: "6_7",
                        },
                      ]}
                      onlyDate={{
                        createdAt: "date",
                        startDate: "dateTime",
                        endDate: "dateTime",
                      }}
                      renderAs={{
                        isApproved: (data) =>
                          data ? (
                            <span className="label label-lg label-light-success label-inline">
                              Verified
                            </span>
                          ) : (
                            <span className="label label-lg label-light-danger label-inline">
                              Pending
                            </span>
                          ),
                        isSponsored: (data) => (
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
