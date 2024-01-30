import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { toast } from "react-toastify";

import useRequest from "../../hooks/useRequest";
import Pagination from "../Pagination/Pagination";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import Table from "../Table/Table";
// import { SearchInput, SearchSubmitButton } from "../Form/Form";

const OBJ_TABLE = {
  link: "link",
  hours: "hours",
  "last synced at": "lastSyncedAt",
  "created on": "createdAt",
  status: "isActive",
};

const searchQueryHandler = (page, per_page, sortBy, order) => {
  if (sortBy.length > 0) {
    if (sortBy === "created on") {
      sortBy = "createdAt";
    } else if (sortBy === "last synced at") {
      sortBy = "lastSyncedAt";
    }
  } else {
    sortBy = "createdAt";
  }

  order = order.length > 0 ? order : "desc";

  return `product-sync/all?page=${page}&per_page=${per_page}&sortBy=${sortBy}&order=${order}`;
};

const ViewAll = () => {
  const [syncFiles, setSyncFiles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(10);
  const [perPage, setPerPage] = useState(0);
  const [currentSort, setCurrentSort] = useState({
    sortBy: "created on",
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
    document.title = "Product Sync - Noonmar";
  }, [records_per_page]);

  useEffect(() => {
    if (response) {
      setSyncFiles(response.syncs);
      setTotalDocuments((prev) => response.totalDocuments ?? prev);
    }
  }, [response]);

  useEffect(() => {
    if (responseChangeStatus) {
      const { id, status } = responseChangeStatus;

      const oldSyncFiles = [...syncFiles];
      const indexToChange = oldSyncFiles.findIndex((file) => file._id == id);
      oldSyncFiles[indexToChange].isActive = status;

      setSyncFiles(oldSyncFiles);
    }
  }, [responseChangeStatus]);

  useEffect(() => {
    if (responseDelete) {
      const { id } = responseDelete;
      let newSyncFile = [...syncFiles];
      newSyncFile = newSyncFile.filter((file) => file._id != id);
      setSyncFiles(newSyncFile);
      toast.success("Product Sync File has been deleted successfully.");
    }
  }, [responseDelete]);

  const fetchMoreData = ({ selected }) => {
    setSyncFiles([]);
    // const { question } = getValues();

    setPage(selected + 1);
    request(
      "GET",
      searchQueryHandler(
        selected + 1,
        perPage,
        currentSort.sortBy,
        currentSort.order
      )
    );
  };

  const deleteHandler = (id) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You want to delete this sync file?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        requestDelete("DELETE", "product-sync", { id });
      } else if (result.isDismissed) {
      }
    });
  };

  const onSearchHandler = (data) => {
    // const { question } = getValues();

    request(
      "GET",
      searchQueryHandler(1, perPage, currentSort.sortBy, currentSort.order)
    );
    setPage(1);
  };

  const onResetHandler = (e) => {
    e.preventDefault();
    // resetField("question");
    request(
      "GET",
      searchQueryHandler(1, perPage, currentSort.sortBy, currentSort.order)
    );
    setPage(1);
  };

  const perPageChangeHandler = (event) => {
    // const { question } = getValues();

    request(
      "GET",
      searchQueryHandler(
        1,
        event.target.value,
        currentSort.sortBy,
        currentSort.order
      )
    );
    setPage(1);

    setPerPage(event.target.value);
  };

  const sortingHandler = (sortBy) => {
    // const { question } = getValues();

    if (currentSort.sortBy == sortBy) {
      const newOrder = currentSort.order === "asc" ? "desc" : "asc";
      request("GET", searchQueryHandler(page, perPage, sortBy, newOrder));
      setCurrentSort({ sortBy, order: newOrder });
    } else {
      request("GET", searchQueryHandler(page, perPage, sortBy, "desc"));
      setCurrentSort({ sortBy, order: "desc" });
    }
  };

  const changeStatusHandler = (id) => {
    const syncFile = syncFiles.find((file) => file._id == id);
    const status = !syncFile.isActive;

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
        requestChangeStatus("PUT", "product-sync/status", {
          id,
          status,
        });
      } else if (result.isDismissed) {
      }
    });
  };

  // const InputFields = [
  //   {
  //     label: "Question",
  //     name: "question",
  //     required: true,
  //   },
  // ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Product Sync List"
        links={[{ to: "/", name: "Dashboard" }]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="row">
            <div className="col-12">
              <div className="card card-custom card-stretch card-shadowless">
                <div className="card-header">
                  <div className="card-title"></div>
                  {/* <div className="card-toolbar">
                    <a
                      className="btn btn-primary dropdown-toggle mr-2"
                      data-toggle="collapse"
                      data-target="#collapseOne6"
                    >
                      Search
                    </a>
                  </div> */}
                </div>
                <div className="card-body">
                  {/* <div
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
                  </div> */}
                  <div className="dataTables_wrapper faq-table">
                    <Table
                      currentSort={currentSort}
                      sortingHandler={sortingHandler}
                      mainData={syncFiles}
                      tableHeading={Object.keys(OBJ_TABLE)}
                      tableData={Object.values(OBJ_TABLE)}
                      links={[
                        {
                          isLink: false,
                          name: "Deactivate",
                          click: changeStatusHandler,
                          title: "Click To Activate",
                          key: "12_42",
                        },
                        {
                          isLink: false,
                          name: "Activate",
                          click: changeStatusHandler,
                          title: "Click To Deactivate",
                          key: "12_42",
                        },
                        {
                          isLink: true,
                          to: "/product-sync/edit",
                          name: "Edit",
                          extraData: true,
                          key: "12_43",
                        },
                        {
                          isLink: true,
                          to: "/product-sync/history",
                          name: "Read",
                          title: "View Sync History",
                          extraData: true,
                          key: "12_43",
                        },
                        {
                          isLink: false,
                          name: "Delete",
                          click: deleteHandler,
                          key: "12_44",
                        },
                      ]}
                      onlyDate={{
                        createdAt: "date",
                        lastSyncedAt: "dateTime",
                      }}
                      dontShowSort={["link", "hours", "status"]}
                      renderAs={{
                        hours: (time) =>
                          `Every ${time} ${time === 1 ? "hour" : "hours"}`,
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
                        currentDocLength={syncFiles.length}
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
