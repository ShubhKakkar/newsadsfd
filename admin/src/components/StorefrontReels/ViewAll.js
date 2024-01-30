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
import Player from "../Player/Player";

const OBJ_TABLE = {
  // video: "video",
  vendor: "vendor",
  plays: "playCount",
  likes: "likeCount",
  shares: "shareCount",
  "created at": "createdAt",
  status: "status",
  "Active Status": "isActive",
};

const searchQueryHandler = (
  page,
  per_page,
  sortBy,
  order,
  status = "",
  isActive = "",
  vendor = "",
  country = "",
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

  return `reel/all?page=${page}&per_page=${per_page}&sortBy=${sortBy}&order=${order}&isActive=${isActive}&status=${status}&country=${country}&dateFrom=${dateFrom}&dateTo=${dateTo}&type=storefront&vendor=${vendor}`;
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

  const [allVendors, setAllVendors] = useState([]);
  // const [allCountry, setAllCountry] = useState([]);
  const [openPlayer, setOpenPlayer] = useState(false);
  const [reelURL, setReelURL] = useState();
  const { request, response } = useRequest();
  const { request: requestChangeStatus, response: responseChangeStatus } =
    useRequest();
  const { request: requestDelete, response: responseDelete } = useRequest();
  const { response: responseVendors, request: requestVendors } = useRequest();
  const { response: responseCountry, request: requestCountry } = useRequest();
  // const { response: responseData, request: requestData } = useRequest();

  useEffect(() => {
    requestVendors("GET", `vendor/all?page=1&isActive=${true}`);
    // requestCountry("GET", `country/all?page=1&isActive=${true}`);
  }, []);

  useEffect(() => {
    if (responseVendors) {
      setAllVendors(responseVendors.vendors);
    }
  }, [responseVendors]);

  // useEffect(() => {
  //   if (responseCountry) {
  //     if (responseCountry.status && responseCountry.data) {
  //       setAllCountry(responseCountry.data);
  //     }
  //   }
  // }, [responseCountry]);

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
    document.title = "Storefront Reels Management - Noonmar";
  }, [records_per_page]);

  useEffect(() => {
    if (response) {
      setSeekers(response.data);
      setTotalDocuments((prev) => response.totalDocuments ?? prev);
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

  useEffect(() => {
    if (responseDelete) {
      const { id } = responseDelete;
      let newSeeker = [...seekers];
      newSeeker = newSeeker.filter((seeker) => seeker._id != id);
      setSeekers(newSeeker);
      toast.success("Reel has been deleted successfully.");
    }
  }, [responseDelete]);

  const fetchMoreData = ({ selected }) => {
    setSeekers([]);
    const { status, dateFrom, dateTo, vendor, isActive, country } = getValues();

    setPage(selected + 1);
    request(
      "GET",
      searchQueryHandler(
        selected + 1,
        perPage,
        currentSort.sortBy,
        currentSort.order,
        status,
        isActive,
        vendor,
        country,
        dateFrom,
        dateTo
      )
    );
  };

  const deleteHandler = (id) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You want to delete this reel?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        requestDelete("DELETE", "reel", { id });
      } else if (result.isDismissed) {
      }
    });
  };

  const onSearchHandler = (data) => {
    const { status, vendor, dateFrom, dateTo, isActive, country } = getValues();

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
        status,
        isActive,
        vendor,
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
    resetField("vendor");
    resetField("dateFrom");
    resetField("dateTo");
    request(
      "GET",
      searchQueryHandler(1, perPage, currentSort.sortBy, currentSort.order)
    );
    setPage(1);
  };

  const perPageChangeHandler = (event) => {
    const { status, vendor, dateFrom, dateTo, isActive, country } = getValues();

    request(
      "GET",
      searchQueryHandler(
        1,
        event.target.value,
        currentSort.sortBy,
        currentSort.order,
        status,
        isActive,
        vendor,
        country,
        dateFrom,
        dateTo
      )
    );
    setPage(1);

    setPerPage(event.target.value);
  };

  const sortingHandler = (sortBy) => {
    const { status, vendor, dateFrom, dateTo, isActive, country } = getValues();

    if (currentSort.sortBy == sortBy) {
      const newOrder = currentSort.order === "asc" ? "desc" : "asc";
      request(
        "GET",
        searchQueryHandler(
          page,
          perPage,
          sortBy,
          newOrder,
          status,
          isActive,
          vendor,
          country,
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
          status,
          isActive,
          vendor,
          country,
          dateFrom,
          dateTo
        )
      );
      setCurrentSort({ sortBy, order: "desc" });
    }
  };

  const changeStatusHandler = (id) => {
    const reel = seekers.find((seeker) => seeker._id == id);
    const status = !reel.isActive;

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
        requestChangeStatus("PUT", "reel/storefront-status", {
          id,
          status,
        });
      } else if (result.isDismissed) {
      }
    });
  };

  const viewReelHandler = (id, data) => {
    setOpenPlayer(true);
    setReelURL(data.video);
    // requestData("GET", `reel/${id}`);
  };

  // useEffect(() => {
  //   if (responseData) {
  //     if (responseData.data && responseData.data.video) {
  //       setOpenPlayer(true);
  //       setReelURL(responseData.data.video);
  //     }
  //   }
  // }, [responseData]);

  const handleCloseVideoModal = () => {
    setOpenPlayer(false);
  };

  const InputFields = [
    // {
    //   label: "Status",
    //   name: "status",
    //   required: false,
    // },
    {
      isSelectInput: true,
      label: "Vendor",
      name: "vendor",
      required: false,
      children: allVendors && allVendors.length > 0 && (
        <>
          <option value="">{"Select an option"}</option>
          {allVendors.map((obj) => (
            <option key={obj._id} value={obj._id}>
              {" "}
              {obj.businessName}
            </option>
          ))}
        </>
      ),
    },
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
        title="Vendor Reels Management"
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
                      /*href="#!"*/
                      className="btn btn-primary dropdown-toggle mr-2"
                      data-toggle="collapse"
                      data-target="#collapseOne6"
                    >
                      Search
                    </a>

                    {/* <Link to="/storefront-reel/add" className="btn btn-primary">
                      Add New Reel
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
                      mainData={seekers}
                      tableHeading={Object.keys(OBJ_TABLE)}
                      tableData={Object.values(OBJ_TABLE)}
                      links={[
                        {
                          isLink: false,
                          name: "Deactivate",
                          click: changeStatusHandler,
                          title: "Click To Activate",
                          key: "10_2",
                        },
                        {
                          isLink: false,
                          name: "Activate",
                          click: changeStatusHandler,
                          title: "Click To Deactivate",
                          key: "10_2",
                        },
                        {
                          isLink: false,
                          name: "View",
                          click: viewReelHandler,
                          extraData: true,
                          key: "10_3",
                        },
                        // {
                        //   isLink: true,
                        //   to: "/storefront-reel/view",
                        //   name: "View",
                        //   extraData: true,
                        // },
                        // {
                        //   isLink: true,
                        //   to: "/storefront-reel/edit",
                        //   name: "Edit",
                        //   extraData: true,
                        // },
                        {
                          isLink: false,
                          name: "Delete",
                          click: deleteHandler,
                          key: "10_4",
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
                        currentDocLength={seekers.length}
                      />
                    )}
                    <Player
                      open={openPlayer}
                      handleCloseVideoModal={handleCloseVideoModal}
                      url={reelURL}
                    />
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
