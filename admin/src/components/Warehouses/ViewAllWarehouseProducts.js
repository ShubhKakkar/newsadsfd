import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import Moment from "moment";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "react-modal";
import Select from "react-select";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import useRequest from "../../hooks/useRequest";
import Pagination from "../Pagination/Pagination";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import Table from "../Table/Table";
import { SearchInput, SearchSubmitButton } from "../Form/Form";
import { addOneToDate } from "../../util/fn";
import { BASEURL } from "../../constant/api";

const OBJ_TABLE = {
  "Product Name": "name",
  warehouse: "warehouse",
  "Bar Code": "barCode",
  "Product Id": "customId",
  Category: "categoryName",
  brand: "brandName",
  quantity: "quantity",
  "Real Quantity": "realQuantity",
  // "created at": "createdAt",
};

const MediaSelectPreview = ({ media, name, updateMedia }) => {
  const changeIsSelectedHandler = () => {
    if (media.isSelected) {
      updateMedia(media.id, "remove");
    } else {
      updateMedia(media.id, "add");
    }
  };

  return (
    <div
      onClick={changeIsSelectedHandler}
      className={`${media.isSelected ? "instadata-active" : ""} cursor`}
    >
      <div className="meCard">
        <a>
          <img src={`${BASEURL.PORT}/${media.src}`} alt="" />
          <p className="text-center">{name}</p>
        </a>
      </div>
    </div>
  );
};

const searchQueryHandler = (
  page,
  per_page,
  sortBy,
  order,
  isActive = "",
  name = "",
  warehouse = "",
  vendor = "",
  masterCategoryId = "",
  price = "",
  customId = "",
  brandId = "",
  dateFrom = "1970-01-01",
  dateTo,
  isSelected = true,
  barCode = ""
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

  return `warehouse/all-products?page=${page}&per_page=${per_page}&sortBy=${sortBy}&order=${order}&isActive=${isActive}&name=${name}&warehouseId=${warehouse}&vendor=${vendor}&masterCategoryId=${masterCategoryId}&dateFrom=${dateFrom}&dateTo=${dateTo}&brandId=${brandId}&customId=${customId}&price=${price}&isSelected=${isSelected}&barCode=${barCode}`;
};

const ViewAllWarehouseProducts = (props) => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(10);
  const [perPage, setPerPage] = useState(0);
  const [currentSort, setCurrentSort] = useState({
    sortBy: "created at",
    order: "desc",
  });
  const [allWarehouse, setAllWarehouse] = useState([]);

  //   const [allVendors, setAllVendors] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [allBrands, setAllBrands] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState({});

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isProductImportModalOpen, setIsProductImportModalOpen] =
    useState(false);

  const [searchKey, setSearchKey] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [allProducts, setAllProducts] = useState([]);

  const [selectedProductIds, setSelectedProductIds] = useState([]);

  const MySwal = withReactContent(Swal);

  const history = useHistory();

  const { records_per_page } = useSelector((state) => state.setting);
  //   const { permission, roleId } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    resetField,
    getValues,
    clearErrors,
    setError,
  } = useForm();

  const {
    register: registerSelected,
    handleSubmit: handleSubmitSelected,
    getValues: getValuesSelected,
    watch: watchSelected,
    setValue: setValueSelected,
  } = useForm({
    defaultValues: {
      selectedCount: 0,
    },
  });

  const { request, response } = useRequest();

  const { response: responseSearchData, request: requestSearchData } =
    useRequest();

  const { request: requestUpdate, response: responseUpdate } = useRequest();

  const { request: requestCategories, response: responseCategories } =
    useRequest();
  const { request: requesetWarehouse, response: responseWarehouse } =
    useRequest();
  const { response: responseProducts, request: requestProducts } = useRequest();

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

      requestCategories("GET", "v1/user/product-category");
      requestSearchData("GET", `product/search-data`);
      requesetWarehouse("GET", `warehouse/all?page=1&sortBy=name`);
    }
    document.title = "Products - Noonmar";
  }, [records_per_page]);

  useEffect(() => {
    if (response) {
      setProducts(response.data);
      setTotalDocuments((prev) => response.totalDocuments ?? prev);

      if (false && response.data && response.data.length > 0) {
        let selectedCount = 0;

        response.data.forEach((obj) => {
          const oldValue = getValuesSelected(obj._id);
          if (typeof oldValue === "boolean") {
            if (oldValue) {
              //   setValueSelected(obj._id, true);
              selectedCount++;
            }
          } else if (obj.isSelected) {
            setValueSelected(obj._id, true);
            selectedCount++;
          }
        });

        setValueSelected("selectedCount", selectedCount);

        if (selectedCount === response.data.length) {
          setValueSelected("all", true);
        } else {
          setValueSelected("all", false);
        }
      } else {
        setValueSelected("selectedCount", 0);
        setValueSelected("all", false);
      }
    }
  }, [response]);

  useEffect(() => {
    if (responseSearchData) {
      //   setAllVendors(responseSearchData.vendors);
      // setAllCategories(responseSearchData.mainCategories);
      setAllBrands(responseSearchData.brands);
    }
  }, [responseSearchData]);

  useEffect(() => {
    if (responseWarehouse) {
      //   setAllVendors(responseSearchData.vendors);
      // setAllCategories(responseSearchData.mainCategories);
      setAllWarehouse(responseWarehouse.data);
    }
  }, [responseWarehouse]);

  useEffect(() => {
    if (responseCategories) {
      setAllCategories(responseCategories.category);
    }
  }, [responseCategories]);

  useEffect(() => {
    if (responseProducts) {
      setAllProducts(
        responseProducts.data.map((data) => ({
          ...data,
          isSelected: selectedProductIds.includes(data._id),
        }))
      );
      setIsCategoryModalOpen(false);
      setIsProductImportModalOpen(true);
    }
  }, [responseProducts]);

  useEffect(() => {
    if (responseUpdate) {
      toast.success(responseUpdate.message);
      clearProductImportModalHandler();
      // history.push("/warehouses");
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
  }, [responseUpdate]);

  const fetchMoreData = ({ selected }) => {
    setProducts([]);
    const {
      isActive,
      name,
      warehouse,
      vendor,
      masterCategoryId,
      customId,
      brandId,
      price,
      dateFrom,
      dateTo,
      isSelected,
      barCode,
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
        warehouse,
        vendor,
        masterCategoryId,
        price,
        customId,
        brandId,
        dateFrom,
        dateTo,
        isSelected,
        barCode
      )
    );
  };

  const onSearchHandler = (data) => {
    const {
      isActive,
      name,
      warehouse,
      vendor,
      masterCategoryId,
      customId,
      brandId,
      price,
      dateFrom,
      dateTo,
      isSelected,
      barCode,
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
        warehouse,
        vendor,
        masterCategoryId,
        price,
        customId,
        brandId,
        dateFrom,
        dateTo,
        isSelected,
        barCode
      )
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
    resetField("barCode");
    request(
      "GET",
      searchQueryHandler(1, perPage, currentSort.sortBy, currentSort.order)
    );
    setPage(1);
  };

  const perPageChangeHandler = (event) => {
    const {
      isActive,
      name,
      warehouse,
      vendor,
      masterCategoryId,
      customId,
      brandId,
      price,
      dateFrom,
      dateTo,
      isSelected,
      barCode,
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
        warehouse,
        vendor,
        masterCategoryId,
        price,
        customId,
        brandId,
        dateFrom,
        dateTo,
        isSelected,
        barCode
      )
    );
    setPage(1);

    setPerPage(event.target.value);
  };

  const sortingHandler = (sortBy) => {
    const {
      isActive,
      name,
      warehouse,
      vendor,
      masterCategoryId,
      customId,
      brandId,
      price,
      dateFrom,
      dateTo,
      isSelected,
      barCode,
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
          warehouse,
          vendor,
          masterCategoryId,
          price,
          customId,
          brandId,
          dateFrom,
          dateTo,
          isSelected,
          barCode
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
          warehouse,
          vendor,
          masterCategoryId,
          price,
          customId,
          brandId,
          dateFrom,
          dateTo,
          isSelected,
          barCode
        )
      );
      setCurrentSort({ sortBy, order: "desc" });
    }
  };

  const clearApi = (skip) => {
    if (!skip) {
      if (searchValue.trim.length === 0 && searchKey.length === 0) {
        setSearchValue("");
        return;
      }
    }
    setSearchKey("");
    setSearchValue("");
    requestProducts(
      "GET",
      searchQueryHandler(
        1,
        100,
        currentSort.sortBy,
        currentSort.order,
        "",
        "",
        "",
        "",
        selectedCategory.value,
        "",
        "",
        "",
        "",
        "",
        false,
        ""
      )
    );
  };

  const searchData = () => {
    if (searchKey && searchValue.trim().length > 0) {
      //requestProducts()
      requestProducts(
        "GET",
        searchQueryHandler(
          1,
          100,
          currentSort.sortBy,
          currentSort.order,
          "",
          searchKey === "barcode" ? "" : searchValue,
          "",
          "",
          selectedCategory.value,
          "",
          "",
          "",
          "",
          "",
          false,
          searchKey === "barcode" ? searchValue : ""
        )
      );
    } else if (!searchKey) {
      toast.error("Select search criteria.");
    } else if (searchValue.trim().length > 0) {
      toast.error("Please enter search term.");
    }
  };

  const updateMedia = (id, type) => {
    let newProducts = [...allProducts];

    const idx = newProducts.findIndex((p) => p._id === id);

    newProducts[idx].isSelected = type === "add";

    let newSelectedProductIds = [...selectedProductIds];

    if (type === "add") {
      newSelectedProductIds.push(id);
    } else {
      newSelectedProductIds = newSelectedProductIds.filter((a) => a !== id);
    }
    setSelectedProductIds(newSelectedProductIds);

    setAllProducts(newProducts);
  };

  const getProductsHandler = () => {
    if (Object.keys(selectedCategory).length != 0) {
      clearApi(true);
    }
  };

  const clearCategoryModalHandler = () => {
    setIsCategoryModalOpen(false);
    setSelectedCategory({});
  };

  const clearProductImportModalHandler = () => {
    setIsProductImportModalOpen(false);
    setSearchKey("");
    setSearchValue("");
    setAllProducts([]);
    setSelectedProductIds([]);
    setSelectedCategory({});
  };

  const backToCategoryModalHandler = () => {
    setIsProductImportModalOpen(false);
    setSearchKey("");
    setSearchValue("");
    setAllProducts([]);
    setSelectedProductIds([]);
    setIsCategoryModalOpen(true);
  };

  const importProductHandler = () => {
    if (selectedProductIds.length === 0) {
      toast.error("Please select atleast one product");
      return;
    }

    requestUpdate("PUT", "warehouse/products", {
      //   warehouseId,
      selectedIds: selectedProductIds,
      notSelectedIds: [],
    });
  };

  const InputFields = [
    {
      label: "Product Name",
      name: "name",
      required: false,
    },
    {
      isSelectInput: true,
      label: "Warehouse",
      name: "warehouse",
      required: false,
      children: allWarehouse && allWarehouse.length > 0 && (
        <>
          <option value="">{"Select an option"}</option>
          {allWarehouse.map((obj) => (
            <option key={obj._id} value={obj._id}>
              {obj.name}
            </option>
          ))}
        </>
      ),
    },
    {
      label: "Product Id",
      name: "customId",
      required: false,
    },
    {
      label: "Bar Code",
      name: "barCode",
      required: false,
    },
    // {
    //   isSelectInput: true,
    //   label: "Status",
    //   name: "isActive",
    //   required: false,
    //   children: (
    //     <>
    //       <option value="">Select an option</option>
    //       <option value={true}>Activated</option>
    //       <option value={false}>Deactivated</option>
    //     </>
    //   ),
    // },
    // {
    //   isSelectInput: true,
    //   label: "Category",
    //   name: "masterCategoryId",
    //   required: false,
    //   children: allCategories && allCategories.length > 0 && (
    //     <>
    //       <option value="">{"Select an option"}</option>
    //       {allCategories.map((obj) => (
    //         <option key={obj.value} value={obj.value}>
    //           {obj.label}
    //         </option>
    //       ))}
    //     </>
    //   ),
    // },

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
    // {
    //   label: "Date From",
    //   name: "dateFrom",
    //   isDate: true,
    //   clearErrors,
    // },
    // {
    //   label: "Date To",
    //   name: "dateTo",
    //   isDate: true,
    //   clearErrors,
    //   otherRegisterFields: {
    //     manual: true,
    //     feedback: "'To Date' cannot be smaller than 'From Date'",
    //   },
    // },
    // {
    //   isSelectInput: true,
    //   label: "Selected",
    //   name: "isSelected",
    //   required: false,
    //   children: (
    //     <>
    //       <option value="">Select an option</option>
    //       <option value={true}>Selected</option>
    //       <option value={false}>Not Selected</option>
    //     </>
    //   ),
    // },
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Warehouse Products"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/warehouses", name: "Back to Warehouse" },
        ]}
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
                    {/* <button
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="btn btn-primary w-100px"
                    >
                      Add
                    </button> */}
                    {/* <button
                      onClick={handleSubmitSelected(onSubmit)}
                      className="btn btn-primary w-100px"
                    >
                      Save
                    </button> */}
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
                  <input
                    className="d-none"
                    {...registerSelected("selectedCount")}
                  />
                  <div className="dataTables_wrapper ">
                    <Table
                      currentSort={currentSort}
                      sortingHandler={sortingHandler}
                      mainData={products}
                      tableHeading={Object.keys(OBJ_TABLE)}
                      tableData={Object.values(OBJ_TABLE)}
                      dontShowSort={[
                        "name",
                        "warehouse",
                        "Product Id",
                        "Category",
                        "brand",
                        "created at",
                      ]}
                      onlyDate={{
                        createdAt: "date",
                        startDate: "dateTime",
                        endDate: "dateTime",
                      }}
                      // checkRegisterHandler={(id, className) => (
                      //   <input
                      //     className={className}
                      //     type="checkbox"
                      //     {...registerSelected(id)}
                      //     onChange={(e) => selectHandler(e.target.checked, id)}
                      //   />
                      // )}
                      // isCheckbox={true}
                      // links={[
                      //   {
                      //     isLink: false,
                      //     name: "Delete",
                      //     click: deleteHandler,
                      //     key: "6_7",
                      //   },
                      // ]}
                    />

                    {perPage !== 0 && (
                      <Pagination
                        page={page}
                        totalDocuments={totalDocuments}
                        getNewData={fetchMoreData}
                        perPage={perPage}
                        defaultPerPage={records_per_page}
                        perPageChangeHandler={perPageChangeHandler}
                        currentDocLength={products.length}
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
        isOpen={isCategoryModalOpen}
        onRequestClose={clearCategoryModalHandler}
        shouldCloseOnOverlayClick={false}
        ariaHideApp={false}
        className="react_modal_custom small_popup react_Custom_modal"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              Add Product
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={clearCategoryModalHandler}
            >
              <i aria-hidden="true" class="ki ki-close"></i>
            </button>
          </div>
          <div className="modal-body">
            <div className="full-xl-6">
              <div class="form-group">
                <label>Select Category</label>
                <form>
                  <div className="position-relative">
                    <Select
                      required
                      onChange={(val) => {
                        setSelectedCategory(val);
                      }}
                      options={allCategories}
                      value={selectedCategory}
                      className="form-select- form-control- dark-form-control"
                      placeholder="Select Category"
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              className="btn btn-primary w-50"
              onClick={getProductsHandler}
              type="submit"
            >
              Next
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isProductImportModalOpen}
        onRequestClose={clearProductImportModalHandler}
        shouldCloseOnOverlayClick={false}
        ariaHideApp={false}
        className="react_modal_custom small_popup react_Custom_modal modal-dialog-scrollable"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              Add Product
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={clearProductImportModalHandler}
            >
              <i aria-hidden="true" class="ki ki-close"></i>
            </button>
          </div>
          <div className="modal-body">
            <div className="full-xl-6">
              <div class="form-group">
                <div className="row">
                  <div className="col-sm-12 col-md-4">Search Criteria</div>
                  <div className="col-sm-12 col-md-4">
                    <input
                      type="radio"
                      id="name"
                      value="name"
                      checked={searchKey === "name"}
                      onChange={(e) => setSearchKey(e.target.value)}
                    />
                    <label for="name" style={{ marginLeft: "10px" }}>
                      Name of the product
                    </label>
                  </div>
                  <div className="col-sm-12 col-md-4">
                    <input
                      type="radio"
                      id="barcode"
                      value="barcode"
                      onChange={(e) => setSearchKey(e.target.value)}
                      checked={searchKey === "barcode"}
                    />
                    <label for="barcode" style={{ marginLeft: "10px" }}>
                      Barcode
                    </label>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <div className="row g-3">
                  <div className="col-sm-12 col-md-6">
                    <input
                      type="text"
                      className="design-input form-control"
                      name="search"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                  </div>
                  <div
                    className="col-sm-12 col-md-6"
                    style={{ display: "flex" }}
                  >
                    <button
                      className="new-clear btn btn-primary"
                      onClick={() => clearApi(false)}
                    >
                      Clear
                    </button>
                    <button
                      className="new-clear btn btn-primary"
                      style={{ marginLeft: "11px" }}
                      onClick={searchData}
                    >
                      Search
                    </button>
                  </div>
                  {/* <div className="col-2">
                   
                    <button>Search</button>
                </div> */}
                </div>
              </div>

              <div class="form-group">
                {allProducts.length > 0 && <label>Select Product </label>}

                <div className="row">
                  {allProducts.length > 0 ? (
                    <>
                      {allProducts.map((item, idx) => (
                        <div className="col-4">
                          <div key={item._id}>
                            {/*  class="card-body" */}
                            <div className="instadata">
                              <div className="continueBx_">
                                <div className="form_input_area">
                                  <MediaSelectPreview
                                    media={{
                                      id: item._id,
                                      src: item.coverImage,
                                      isSelected: item.isSelected,
                                    }}
                                    name={item.name}
                                    key={item._id}
                                    id={item._id}
                                    updateMedia={updateMedia}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p>
                      No Products Found. Please select different category or
                      enter different search term.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            {allProducts.length === 0 && (
              <button
                className="btn btn-primary w-50"
                onClick={backToCategoryModalHandler}
                type="submit"
              >
                Back
              </button>
            )}
            {allProducts.length > 0 && (
              <button
                className="btn btn-primary w-50"
                onClick={importProductHandler}
                type="submit"
              >
                Add
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ViewAllWarehouseProducts;
