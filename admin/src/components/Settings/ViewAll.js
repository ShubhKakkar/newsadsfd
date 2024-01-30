import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

import useRequest from "../../hooks/useRequest";
import Pagination from "../Pagination/Pagination";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import Table from "../Table/Table";
import { SearchInput, SearchSubmitButton } from "../Form/Form";

const searchQueryHandler = (page, per_page, sortBy, order, title) => {
  sortBy = sortBy.length > 0 ? sortBy : "createdAt";
  order = order.length > 0 ? order : "desc";

  return `setting/all?page=${page}&per_page=${per_page}&sortBy=${sortBy}&order=${order}&title=${title}`;
};

const ViewAll = (props) => {
  const { backPageNum } = props.history.location;
  const [settings, setSettings] = useState([]);
  const [page, setPage] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(1);
  const [perPage, setPerPage] = useState(0);
  const [currentSort, setCurrentSort] = useState({ sortBy: "", order: "" });
  const [isBPN, setIsBPN] = useState(false);

  const { records_per_page } = useSelector((state) => state.setting);

  const { request, response } = useRequest();
  const { request: requestDelete, response: responseDelete } = useRequest();

  const MySwal = withReactContent(Swal);

  const {
    register,
    handleSubmit,
    formState: { errors },
    resetField,
    getValues,
  } = useForm();

  useEffect(() => {
    if (backPageNum && isBPN) {
      setPage(backPageNum);
      request(
        "GET",
        searchQueryHandler(
          backPageNum,
          records_per_page,
          currentSort.sortBy,
          currentSort.order,
          ""
        )
      );
    }
  }, [backPageNum, isBPN]);

  useEffect(() => {
    if (records_per_page) {
      setPerPage(records_per_page);
      request(
        "GET",
        searchQueryHandler(
          page,
          records_per_page,
          currentSort.sortBy,
          currentSort.order,
          ""
        )
      );
    }
    document.title = "Settings - Noonmar";
  }, [records_per_page]);

  useEffect(() => {
    if (response) {
      setIsBPN(true);
      setSettings(response.settings);
      setTotalDocuments((prev) => response.totalDocuments ?? prev);
    }
  }, [response]);

  useEffect(() => {
    if (responseDelete) {
      const { id } = responseDelete;
      let oldSettings = [...settings];
      oldSettings = oldSettings.filter((setting) => setting._id != id);
      setSettings(oldSettings);
      toast.success("Setting has been deleted successfully.");
    }
  }, [responseDelete]);

  const fetchMoreData = ({ selected }) => {
    setSettings([]);
    const { title } = getValues();
    setPage(selected + 1);
    request(
      "GET",
      searchQueryHandler(
        selected + 1,
        perPage,
        currentSort.sortBy,
        currentSort.order,
        title
      )
    );
  };

  const deleteHandler = (id) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You want to delete this setting?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        requestDelete("DELETE", "setting", { id });
      } else if (result.isDismissed) {
      }
    });
  };

  const onSearchHandler = (data) => {
    const { title } = data;
    request(
      "GET",
      searchQueryHandler(
        1,
        perPage,
        currentSort.sortBy,
        currentSort.order,
        title
      )
    );
    setPage(1);
  };

  const onResetHandler = (e) => {
    e.preventDefault();
    resetField("title");
    request(
      "GET",
      searchQueryHandler(1, perPage, currentSort.sortBy, currentSort.order, "")
    );
    setPage(1);
  };

  const perPageChangeHandler = (event) => {
    const { title } = getValues();
    request(
      "GET",
      searchQueryHandler(
        1,
        event.target.value,
        currentSort.sortBy,
        currentSort.order,
        title
      )
    );
    setPage(1);
    setPerPage(event.target.value);
  };

  const sortingHandler = (sortBy) => {
    const { title } = getValues();

    if (currentSort.sortBy == sortBy) {
      const newOrder = currentSort.order === "asc" ? "desc" : "asc";
      request(
        "GET",
        searchQueryHandler(page, perPage, sortBy, newOrder, title)
      );
      setCurrentSort({ sortBy, order: newOrder });
    } else {
      request("GET", searchQueryHandler(page, perPage, sortBy, "desc", title));
      setCurrentSort({ sortBy, order: "desc" });
    }
  };

  const InputFields = [
    {
      label: "Title",
      name: "title",
      required: true,
    },
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb title="Setting" links={[{ to: "/", name: "Dashboard" }]} />

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

                    <Link to="/setting/add" className="btn btn-primary">
                      Add New Setting
                    </Link>
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
                      mainData={settings}
                      tableHeading={["title", "key", "value"]}
                      tableData={["title", "key", "value"]}
                      links={[
                        {
                          isLink: true,
                          to: "/setting/edit",
                          name: "Edit",
                          extraData: true,
                        },
                        { isLink: false, name: "Delete", click: deleteHandler },
                      ]}
                      page={page}
                      onlyDate={{}}
                    />

                    {perPage !== 0 && settings.length > 0 && (
                      <Pagination
                        page={page}
                        totalDocuments={totalDocuments}
                        getNewData={fetchMoreData}
                        perPage={perPage}
                        defaultPerPage={records_per_page}
                        perPageChangeHandler={perPageChangeHandler}
                        currentDocLength={settings.length}
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
