import React, { useState, useEffect } from "react";
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

const OBJ_TABLE = {
  name: "name",
  title: "title",
  description: "description",
  "Created At": "createdAt",
};
const searchQueryHandler = (page, per_page, sortBy, order, name, title) => {
  sortBy =
    sortBy.length > 0
      ? sortBy === "Created At"
        ? "createdAt"
        : sortBy
      : "createdAt";
  order = order.length > 0 ? order : "desc";

  name = name ? name : "";
  title = title ? title : "";

  return `cms/all?page=${page}&per_page=${per_page}&sortBy=${sortBy}&order=${order}&name=${name}&title=${title}`;
};

const ViewAll = (props) => {
  const [cms, setCms] = useState([]);
  const [page, setPage] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(1);
  const [perPage, setPerPage] = useState(0);
  const [currentSort, setCurrentSort] = useState({
    sortBy: "Created At",
    order: "desc",
  });

  const { records_per_page } = useSelector((state) => state.setting);
  // const { roleId, permission } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    resetField,
    getValues,
  } = useForm();

  const { request, response } = useRequest();
  const { request: requestDelete, response: responseDelete } = useRequest();

  const MySwal = withReactContent(Swal);

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
          "",
          ""
        )
      );
    }
    document.title = "CMS - Noonmar";
  }, [records_per_page]);

  useEffect(() => {
    if (response) {
      setCms(response.cms);
      setTotalDocuments((prev) => response.totalDocuments ?? prev);
    }
  }, [response]);

  useEffect(() => {
    if (responseDelete) {
      const { id } = responseDelete;
      let oldCms = [...cms];
      oldCms = oldCms.filter((cms) => cms._id != id);
      setCms(oldCms);
      toast.success("Cms page has been deleted successfully.");
    }
  }, [responseDelete]);

  const fetchMoreData = ({ selected }) => {
    setCms([]);
    const { name, title } = getValues();

    setPage(selected + 1);
    request(
      "GET",
      searchQueryHandler(
        selected + 1,
        perPage,
        currentSort.sortBy,
        currentSort.order,
        name,
        title
      )
    );
  };

  const deleteHandler = (id) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You want to delete this cms?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        requestDelete("DELETE", "cms", { id });
      } else if (result.isDismissed) {
      }
    });
  };

  const onSearchHandler = (data) => {
    const { name, title } = data;
    request(
      "GET",
      searchQueryHandler(
        1,
        perPage,
        currentSort.sortBy,
        currentSort.order,
        name,
        title
      )
    );
    setPage(1);
  };

  const onResetHandler = (e) => {
    e.preventDefault();
    resetField("name");
    resetField("title");
    request(
      "GET",
      searchQueryHandler(
        1,
        perPage,
        currentSort.sortBy,
        currentSort.order,
        "",
        ""
      )
    );
    setPage(1);
  };

  const perPageChangeHandler = (event) => {
    const { name, title } = getValues();
    request(
      "GET",
      searchQueryHandler(
        1,
        event.target.value,
        currentSort.sortBy,
        currentSort.order,
        name,
        title
      )
    );
    setPage(1);
    setPerPage(event.target.value);
  };

  const sortingHandler = (sortBy) => {
    if (sortBy === "description") {
      return;
    }

    const { name, title } = getValues();

    if (currentSort.sortBy == sortBy) {
      const newOrder = currentSort.order === "asc" ? "desc" : "asc";
      request(
        "GET",
        searchQueryHandler(page, perPage, sortBy, newOrder, name, title)
      );
      setCurrentSort({ sortBy, order: newOrder });
    } else {
      request(
        "GET",
        searchQueryHandler(page, perPage, sortBy, "desc", name, title)
      );
      setCurrentSort({ sortBy, order: "desc" });
    }
  };

  const InputFields = [
    {
      label: "Page Name",
      name: "name",
    },
    {
      label: "Page Title",
      name: "title",
    },
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb title="CMS" links={[{ to: "/", name: "Dashboard" }]} />

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

                    {/* {((roleId === 2 && !!permission["3_2"]) || roleId == 1) && (
                      <Link to="/cms/add" className="btn btn-primary">
                        Add New CMS
                      </Link>
                    )} */}
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
                      mainData={cms}
                      tableHeading={Object.keys(OBJ_TABLE)}
                      tableData={Object.values(OBJ_TABLE)}
                      links={[
                        {
                          isLink: true,
                          to: "/cms/view",
                          name: "View",
                          key: "12_2",
                        },
                        {
                          isLink: true,
                          to: "/cms/edit",
                          name: "Edit",
                          key: "12_3",
                        },
                        // { isLink: false, name: "Delete", click: deleteHandler },
                      ]}
                      onlyDate={{
                        createdAt: "date",
                        startDate: "dateTime",
                        endDate: "dateTime",
                      }}
                      dontShowSort={["description"]}
                    />

                    {perPage !== 0 && (
                      <Pagination
                        page={page}
                        totalDocuments={totalDocuments}
                        getNewData={fetchMoreData}
                        perPage={perPage}
                        defaultPerPage={records_per_page}
                        perPageChangeHandler={perPageChangeHandler}
                        currentDocLength={cms.length}
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
