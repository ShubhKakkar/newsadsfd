import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import Moment from "moment";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Link, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "react-modal";

import useRequest from "../../hooks/useRequest";
import Pagination from "../Pagination/Pagination";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import Table from "../Table/Table";
import {
  SearchInput,
  SearchSubmitButton,
  RenderInputFields,
  ReactSelectInput,
} from "../Form/Form";
import { addOneToDate } from "../../util/fn";

const apiName = "variant";
const titleSingular = "Variant";
const titlePlural = "Variants";

const OBJ_TABLE = {
  name: "name",
  "created on": "createdAt",
  status: "isActive",
};

const searchQueryHandler = (
  page,
  per_page,
  sortBy,
  order,
  isActive = "",
  name = "",
  dateFrom = "1970-01-01",
  dateTo
) => {
  if (sortBy.length > 0) {
    if (sortBy == "created on") {
      sortBy = "createdAt";
    }
  } else {
    sortBy = "createdAt";
  }
  order = order.length > 0 ? order : "desc";

  dateFrom = dateFrom.length > 0 ? dateFrom : "1970-01-01";

  dateTo = dateTo ? addOneToDate(new Date(dateTo)) : addOneToDate(new Date());

  return `${apiName}/all?page=${page}&per_page=${per_page}&sortBy=${sortBy}&order=${order}&isActive=${isActive}&name=${name}&dateFrom=${dateFrom}&dateTo=${dateTo}`;
};

const ViewAll = () => {
  const [dataList, setDataList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(10);
  const [perPage, setPerPage] = useState(0);
  const [currentSort, setCurrentSort] = useState({
    sortBy: "created on",
    order: "desc",
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddSpecificationModalOpen, setIsAddSpecificationModalOpen] =
    useState(false);

  const [allSpecifications, setAllSpecifications] = useState([]);
  const [selectedSpecifications, setSelectedSpecifications] = useState([]);

  const MySwal = withReactContent(Swal);
  const history = useHistory();

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
    control,
    setValue,
  } = useForm();

  const { request, response } = useRequest();
  const { request: requestChangeStatus, response: responseChangeStatus } =
    useRequest();
  const { request: requestDelete, response: responseDelete } = useRequest();
  const {
    request: requestSpecificationGroup,
    response: responseSpecificationGroup,
  } = useRequest();
  const {
    request: requestImportSpecification,
    response: responseImportSpecification,
  } = useRequest();

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
    document.title = `${titlePlural} - Noonmar`;
    requestSpecificationGroup("GET", "product-category/sub-specification-groups");
  }, [records_per_page]);

  useEffect(() => {
    if (response) {
      setDataList(response.variants);
      setTotalDocuments((prev) => response.totalDocuments ?? prev);
    }
  }, [response]);

  useEffect(() => {
    if (responseSpecificationGroup) {
      let specification = responseSpecificationGroup.groups.map((obj) => ({
        label: obj.name,
        value: obj._id,
      }));

      setAllSpecifications(specification);
    }
  }, [responseSpecificationGroup]);

  useEffect(() => {
    if (responseChangeStatus) {
      const { id, newStatus } = responseChangeStatus;

      const newDataList = [...dataList];
      const indexToChange = newDataList.findIndex((list) => list._id == id);
      newDataList[indexToChange].isActive = newStatus;

      setDataList(newDataList);
    }
  }, [responseChangeStatus]);

  useEffect(() => {
    if (responseDelete) {
      const { id } = responseDelete;
      let newDataList = [...dataList];
      newDataList = newDataList.filter((list) => list._id != id);
      setDataList(newDataList);
      toast.success("Variant has been deleted successfully.");
    }
  }, [responseDelete]);

  useEffect(() => {
    if (responseImportSpecification) {
      toast.success("Variant(s) has been imported successfully.");
      setIsAddSpecificationModalOpen(false);
      setValue("specifications", null);
      setSelectedSpecifications([]);

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
  }, [responseImportSpecification]);

  const handleChangeSpecification = (event) => {
    setSelectedSpecifications(event);

    if (event && event.length > 0) {
      const specificationids = event.map((obj) => obj.value);
      setError("specifications", "");
      setValue("specifications", specificationids);
    } else {
      setValue("specifications", null);
    }
  };

  const fetchMoreData = ({ selected }) => {
    setDataList([]);
    const { isActive, name, dateFrom, dateTo } = getValues();

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
        dateFrom,
        dateTo
      )
    );
  };

  const deleteHandler = (id) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You want to delete this variant?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        requestDelete("DELETE", `${apiName}`, { id });
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
    resetField("email");
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
    const { isActive, name, dateFrom, dateTo } = getValues();

    request(
      "GET",
      searchQueryHandler(
        1,
        event.target.value,
        currentSort.sortBy,
        currentSort.order,
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
    const data = dataList.find((list) => list._id == id);
    const status = !data.isActive;

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
        requestChangeStatus("PUT", `${apiName}/status`, {
          id,
          status,
        });
      } else if (result.isDismissed) {
      }
    });
  };

  const onSubmitImportVariant = (data) => {
    const { specifications } = data;

    requestImportSpecification("POST", "sub-specification-groups/import", {
      ids: specifications,
    });
  };

  const InputFields = [
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
          <option value="">Select an option</option>
          <option value={true}> Activated</option>
          <option value={false}>Deactivated</option>
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
        title={titlePlural}
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

                    {((roleId === 2 && !!permission["12_161"]) ||
                      roleId == 1) && (
                      // <Link to="/variant/add" className="btn btn-primary">
                      //   Add New {titleSingular}
                      // </Link>
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          setIsAddModalOpen(true);
                        }}
                      >
                        Add New {titleSingular}
                      </button>
                    )}

                    {/* <Link to="/registration-fields" className="btn btn-primary">
                      Registration Fields
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
                      mainData={dataList}
                      tableHeading={Object.keys(OBJ_TABLE)}
                      tableData={Object.values(OBJ_TABLE)}
                      links={[
                        {
                          isLink: false,
                          name: "Deactivate",
                          click: changeStatusHandler,
                          title: "Click To Activate",
                          key: "12_162",
                        },
                        {
                          isLink: false,
                          name: "Activate",
                          click: changeStatusHandler,
                          title: "Click To Deactivate",
                          key: "12_162",
                        },
                        // {
                        //   isLink: true,
                        //   to: "/variant/view",
                        //   name: "View",
                        //   extraData: true,
                        // },
                        {
                          isLink: true,
                          to: "/variant/edit",
                          name: "Edit",
                          extraData: true,
                          key: "12_163",
                        },
                        {
                          isLink: false,
                          name: "Delete",
                          click: deleteHandler,
                          key: "12_164",
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
                        currentDocLength={dataList.length}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onRequestClose={() => setIsAddModalOpen(false)}
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
        className="react_modal_custom small_popup react_Custom_modal"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              Add Variant
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={() => setIsAddModalOpen(false)}
            >
              <i aria-hidden="true" class="ki ki-close"></i>
            </button>
          </div>
          <div className="modal-body">
            <div className="full-xl-6">
              <button
                className="btn btn-primary mr-10"
                style={{ width: "40%" }}
                onClick={() => history.push("/variant/add")}
              >
                Create New
              </button>
              <button
                className="btn btn-primary"
                style={{ width: "40%" }}
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsAddSpecificationModalOpen(true);
                }}
              >
                Import
              </button>
            </div>
          </div>
          {/* <div class="modal-footer">
          </div> */}
        </div>
      </Modal>

      <Modal
        isOpen={isAddSpecificationModalOpen}
        onRequestClose={() => setIsAddSpecificationModalOpen(false)}
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
        className="react_modal_custom small_popup react_Custom_modal"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              Import Variant
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={() => setIsAddSpecificationModalOpen(false)}
            >
              <i aria-hidden="true" class="ki ki-close"></i>
            </button>
          </div>
          <div className="modal-body">
            <div className="full-xl-6">
              <RenderInputFields
                InputFields={[
                  [
                    {
                      Component: ReactSelectInput,
                      label: "Specification Groups",
                      name: "specifications",
                      registerFields: {
                        required: true,
                      },
                      control,
                      options: allSpecifications,
                      handleChange: handleChangeSpecification,
                      selectedOption: selectedSpecifications,
                      isMultiple: true,
                    },
                  ],
                ]}
                errors={errors}
                register={register}
              />
            </div>
          </div>
          <div class="modal-footer">
            <button
              className="btn btn-primary w-50"
              onClick={handleSubmit(onSubmitImportVariant)}
            >
              Import
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ViewAll;
