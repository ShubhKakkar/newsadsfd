import Modal from "react-modal";
import { useState, useEffect } from "react";

import useRequest from "../../../hooks/useRequest";

const AlternateProductsModal = ({
  setSelectedProductsObjects,
  isSimilarProductsModalOpen,
  setIsSimilarProductsModalOpen,
  productId,
  similarProducts: similarProductsArr,
  selectedProductsObject,
}) => {
  // const [isSimilarProductsModalOpen, setIsSimilarProductsModalOpen] =
  // useState(false);
  const [similarProducts, setSimilarProducts] = useState(similarProductsArr);

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const { response, request } = useRequest();
  const { response: responseSearchData, request: requestSearchData } =
    useRequest();
  const { request: getcatereq, response: getcateres } = useRequest();

  const [search, setSearchState] = useState({
    string: "",
    id: "",
    name: "",
    category: "",
    brand: "",
    productId: "",
  });



  useEffect(() => {
    if (similarProductsArr) {
      setSimilarProducts(similarProductsArr);
    }
  }, [similarProductsArr]);

  useEffect(() => {
    if (getcateres) {
      setSimilarProducts(getcateres.similarProducts);
    }
  }, [getcateres]);

  const queryHandler = (category, brand) => {
    let querystring = "";

    if (category) {
      querystring += `category=${category}&`;
    }

    if (brand) {
      querystring += `brand=${brand}&`;
    }

    getcatereq("GET", `product/alternate?${querystring}`);
  };

  const selecthandlecate = (e) => {
    let id = e.target.value;
    setSearchState((prev) => ({ ...prev, category: id }));

    queryHandler(id, search.brand);
    //category, brand
  };

  const selecthandlebrand = (e) => {
    let id = e.target.value;
    setSearchState((prev) => ({ ...prev, brand: id }));

    queryHandler(search.category, id);
    //category, brand
  };

  const queryhandlerSearch = (name, category, brand, productId) => {
    let querystring = "";

    if (name) {
      querystring += `name=${name}&`;
    }

    if (category) {
      querystring += `category=${category}&`;
    }

    if (brand) {
      querystring += `brand=${brand}&`;
    }

    if (productId) {
      querystring += `productId=${productId}&`;
    }

    getcatereq("GET", `product/alternate?${querystring}`);
  };

  const handleSearch = (e) => {
    let id = e.target.value;
    setSearchState((prev) => ({ ...prev, name: id }));

    queryhandlerSearch(id, search.category, search.brand, search.productId);
  };

  useEffect(() => {
    // if (productId) {
    //   request("GET", `product/alternate?productId=${productId}`);
    // } else {
    //   request("GET", `product/alternate`);
    // }

    requestSearchData("GET", "product/alternate-search");
  }, []);

  // useEffect(() => {
  //   if (response) {
  //     setSimilarProducts(response.similarProducts);
  //   }
  // }, [response]);

  useEffect(() => {
    if (responseSearchData) {
      const { searchBrands, searchCategories, searchVendors } =
        responseSearchData;

      setBrands(searchBrands);
      setCategories(searchCategories);
      // setVendors(searchVendors);
    }
  }, [responseSearchData]);

  const addSelectedProduct = (id, name) => {
    setSelectedProductsObjects((prev) => ({
      ids: [...prev.ids, id],
      data: [...prev.data, { id, name }],
    }));
  };

  //  const selecthandlecate=(e)=>{
  //   let brandName;
  //   let barndId;
  //   let a= e.target.value
  //   alert("hello")
  //  let b= requestSearchData("GET", "product/alternate-search",{brandName,barndId});
  //       setDatbrand(b)
  //         }

  return (
    <Modal
      isOpen={isSimilarProductsModalOpen}
      // isOpen={true}
      onRequestClose={() => setIsSimilarProductsModalOpen(false)}
      shouldCloseOnOverlayClick={true}
      ariaHideApp={false}
      className="react_modal_custom small_popup react_Custom_modal modal-xl"
    >
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">
            Alternate Products
          </h5>
          <button
            type="button"
            class="close"
            data-dismiss="modal"
            aria-label="Close"
            onClick={() => setIsSimilarProductsModalOpen(false)}
          >
            <i aria-hidden="true" class="ki ki-close"></i>
          </button>
        </div>
        <div className="modal-body">
          {/* {similarProducts.map(()=>{
           return
          })} */}
          {/*begin::Search Form*/}
          <div className="mb-7">
            <div className="row align-items-center">
              <div className="col-lg-12">
                <div className="row align-items-center">
                  <div className="col-md-3 my-2 my-md-0">
                    <div className="input-icon">
                      <input
                        type="text"
                        className="form-control"
                        // value={searchitem._id}
                        placeholder="Search..."
                        id="related_products_datatable_search_query"
                        onChange={(e) => {
                          handleSearch(e);
                        }}
                      />
                      {/* )})} */}

                      {/* // <span>
                      //   <i className="flaticon2-search-1 text-muted" />
                      // </span> */}
                    </div>
                  </div>

                  <div className="col-md-3 my-2 my-md-0">
                    <div className="d-flex align-items-center">
                      <label className="mr-3 mb-0 d-none d-md-block">
                        Category:
                      </label>
                      <div className="dropdown bootstrap-select form-control">
                        <select
                          id="related_products_datatable_search_category"
                          className="form-control"
                        >
                          <option value="">Select</option>
                          {/* <option value="">All or</option> */}
                        </select>

                        {/* <option value="6370f2da52a1898d7b0d80d6">
                            Battery, Oil &amp; Consumables -&gt; Battery -&gt;
                            Agriculture and Plant
                           </option> */}

                        {/* <button
                          type="button"
                          tabIndex={-1}
                          className="btn dropdown-toggle btn-light bs-placeholder"
                          data-toggle="dropdown"
                          role="combobox"
                          aria-owns="bs-select-1"
                          aria-haspopup="listbox"
                          aria-expanded="false"
                          data-id="related_products_datatable_search_category"
                          title="All"
                        > */}
                        <div className="filter-option">
                          <div className="filter-option-inner">
                            <div className="filter-option-inner-inner">
                              <select
                                id="related_products_datatable_search_category"
                                className="form-control"
                                onChange={(e) => {
                                  selecthandlecate(e);
                                }}
                              >
                                <option value="">Select</option>
                                {categories.map((item, index) => {
                                  return (
                                    <>
                                      <option value={item._id} key={index}>
                                        {item.name}
                                      </option>
                                    </>
                                  );
                                })}
                              </select>
                            </div>
                          </div>{" "}
                        </div>
                        {/* </button> */}
                        <div className="dropdown-menu ">
                          <div
                            className="inner show"
                            role="listbox"
                            id="bs-select-1"
                            tabIndex={-1}
                          >
                            <ul
                              className="dropdown-menu inner show"
                              role="presentation"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 my-2 my-md-0">
                    <div className="d-flex align-items-center">
                      <label className="mr-3 mb-0 d-none d-md-block">
                        Brand:
                      </label>
                      <div className="dropdown bootstrap-select form-control">
                        <select
                          className="form-control"
                          id="related_products_datatable_search_brand"
                        >
                          <option value="">All</option>
                          <option value="6370f35108c016f1df08bd65">
                            Astrak
                          </option>
                        </select>
                        {/* <button
                          type="button"
                          tabIndex={-1}
                          className="btn dropdown-toggle btn-light bs-placeholder"
                          data-toggle="dropdown"
                          role="combobox"
                          aria-owns="bs-select-2"
                          aria-haspopup="listbox"
                          aria-expanded="false"
                          data-id="related_products_datatable_search_brand"
                          title="All"
                        > */}
                        <div className="filter-option">
                          <div className="filter-option-inner">
                            <div className="filter-option-inner-inner">
                              {/* All */}
                              <select
                                id="related_products_datatable_search_category"
                                className="form-control"
                                onChange={(e) => {
                                  selecthandlebrand(e);
                                }}
                              >
                                <option value="">Select</option>
                                {brands.map((item, index) => {
                                  return (
                                    <>
                                      <option value={item._id} key={index}>
                                        {item.name}
                                      </option>
                                    </>
                                  );
                                })}
                              </select>
                            </div>
                          </div>{" "}
                        </div>
                        {/* </button> */}
                        <div className="dropdown-menu ">
                          <div
                            className="inner show"
                            role="listbox"
                            id="bs-select-2"
                            tabIndex={-1}
                          >
                            <ul
                              className="dropdown-menu inner show"
                              role="presentation"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* <div className="col-md-3 my-2 my-md-0">
                    <div className="d-flex align-items-center">
                      <label className="mr-3 mb-0 d-none d-md-block">
                        Supplier:
                      </label>
                      <div className="dropdown bootstrap-select form-control">
                        <select
                          className="form-control"
                          id="related_products_datatable_search_supplier"
                        >
                          <option value="">All</option>
                          <option value="6370f131e714113f250556b3">ABD</option>
                        </select>
                        <button
                          type="button"
                          tabIndex={-1}
                          className="btn dropdown-toggle btn-light bs-placeholder"
                          data-toggle="dropdown"
                          role="combobox"
                          aria-owns="bs-select-3"
                          aria-haspopup="listbox"
                          aria-expanded="false"
                          data-id="related_products_datatable_search_supplier"
                          title="All"
                        >
                          <div className="filter-option">
                            <div className="filter-option-inner">
                              <div className="filter-option-inner-inner">
                                All
                              </div>
                            </div>{" "}
                          </div>
                        </button>
                        <div className="dropdown-menu ">
                          <div
                            className="inner show"
                            role="listbox"
                            id="bs-select-3"
                            tabIndex={-1}
                          >
                            <ul
                              className="dropdown-menu inner show"
                              role="presentation"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
              <div className="col-lg-3 col-xl-4 mt-5 mt-lg-0 text-right"></div>
            </div>
          </div>
          {/*end::Search Form*/}
          {/*begin::Card*/}
          <div
            className="card card-custom scroll ps"
            data-scroll="true"
            data-height={300}
            style={{ height: 300, overflow: "hidden" }}
          >
            {/*begin: Datatable*/}
            <div
              className="datatable datatable-bordered datatable-head-custom datatable-destroyed datatable-default datatable-primary datatable-scroll datatable-loaded"
              id="related_products_datatable"
              style={{}}
            >
              <div className="ps__rail-x" style={{ left: 0, bottom: 0 }}>
                <div
                  className="ps__thumb-x"
                  tabIndex={0}
                  style={{ left: 0, width: 0 }}
                />
              </div>
              <div className="ps__rail-y" style={{ top: 0, right: 0 }}>
                <div
                  className="ps__thumb-y"
                  tabIndex={0}
                  style={{ top: 0, height: 0 }}
                />
              </div>
              <table className="datatable-table" style={{ display: "block" }}>
                <thead className="datatable-head">
                  <tr className="datatable-row" style={{ left: 0 }}>
                    <th
                      data-field="id"
                      className="datatable-cell-center datatable-cell datatable-cell-check"
                    >
                      <span style={{ width: 20 }}>
                        <label className="checkbox checkbox-single checkbox-all">
                          <input type="checkbox" />
                          &nbsp;
                          <span />
                        </label>
                      </span>
                    </th>
                    <th
                      data-field="product_number"
                      className="datatable-cell datatable-cell-sort"
                    >
                      <span style={{ width: 133 }}>Product Number</span>
                    </th>
                    <th
                      data-field="name"
                      className="datatable-cell datatable-cell-sort"
                    >
                      <span style={{ width: 133 }}>Name</span>
                    </th>
                    <th
                      data-field="category"
                      className="datatable-cell datatable-cell-sort"
                    >
                      <span style={{ width: 133 }}>Category</span>
                    </th>
                    <th
                      data-field="brand_id"
                      className="datatable-cell datatable-cell-sort"
                    >
                      <span style={{ width: 133 }}>Brand</span>
                    </th>
                    {/* <th
                      data-field="supplier_id"
                      className="datatable-cell datatable-cell-sort"
                    >
                      <span style={{ width: 133 }}>Supplier</span>
                    </th> */}
                    <th
                      data-field="_id"
                      data-autohide-disabled="false"
                      className="datatable-cell datatable-cell-sort"
                    >
                      <span style={{ width: 75 }}>Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="datatable-body ps" style={{}}>
                  {similarProducts.map((product) => (
                    <tr
                      data-row={0}
                      className="datatable-row"
                      style={{ left: 0 }}
                      key={product._id}
                    >
                      <td
                        className="datatable-cell-center datatable-cell datatable-cell-check"
                        data-field="id"
                      >
                        <span style={{ width: 20 }}>
                          <label className="checkbox checkbox-single">
                            <input
                              type="checkbox"
                              defaultValue="6371fee00a24cadeee0cea52"
                            />
                            &nbsp;
                            <span />
                          </label>
                        </span>
                      </td>
                      <td
                        data-field="product_number"
                        className="datatable-cell"
                      >
                        <span style={{ width: 133 }}>{product.customId}</span>
                      </td>
                      <td data-field="name" className="datatable-cell">
                        <span style={{ width: 133 }}>{product.name}</span>
                      </td>
                      <td data-field="category" className="datatable-cell">
                        <span style={{ width: 133 }}>
                          {product.categoryName}
                        </span>
                      </td>
                      <td data-field="brand_id" className="datatable-cell">
                        <span style={{ width: 133 }}>{product.brandName}</span>
                      </td>
                      {/* <td data-field="supplier_id" className="datatable-cell">
                        <span style={{ width: 133 }}>{product.vendorName}</span>
                      </td> */}
                      <td
                        data-field="_id"
                        data-autohide-disabled="false"
                        className="datatable-cell"
                      >
                        <span
                          style={{
                            overflow: "visible",
                            position: "relative",
                            width: 75,
                          }}
                        >
                          {" "}
                          <span className="action">
                            {!selectedProductsObject.ids.includes(
                              product._id
                            ) ? (
                              <a
                                href="javascript;"
                                className="btn btn-sm btn-clean btn-icon mr-2 related_products"
                                title="Add Product "
                                data-id="6371fee00a24cadeee0cea52"
                                onClick={() =>
                                  addSelectedProduct(product._id, product.name)
                                }
                              >
                                {" "}
                                <span className="svg-icon svg-icon-md">
                                  {" "}
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    xmlnsXlink="http://www.w3.org/1999/xlink"
                                    width="24px"
                                    height="24px"
                                    viewBox="0 0 24 24"
                                    version="1.1"
                                  >
                                    {" "}
                                    <g
                                      stroke="none"
                                      strokeWidth={1}
                                      fill="none"
                                      fillRule="evenodd"
                                    >
                                      {" "}
                                      <rect
                                        x={0}
                                        y={0}
                                        width={24}
                                        height={24}
                                      />{" "}
                                      <path
                                        d="M8,17.9148182 L8,5.96685884 C8,5.56391781 8.16211443,5.17792052 8.44982609,4.89581508 L10.965708,2.42895648 C11.5426798,1.86322723 12.4640974,1.85620921 13.0496196,2.41308426 L15.5337377,4.77566479 C15.8314604,5.0588212 16,5.45170806 16,5.86258077 L16,17.9148182 C16,18.7432453 15.3284271,19.4148182 14.5,19.4148182 L9.5,19.4148182 C8.67157288,19.4148182 8,18.7432453 8,17.9148182 Z"
                                        fill="#000000"
                                        fillRule="nonzero"
                                        transform="translate(12.000000, 10.707409) rotate(-135.000000) translate(-12.000000, -10.707409) "
                                      />{" "}
                                      <rect
                                        fill="#000000"
                                        opacity="0.3"
                                        x={5}
                                        y={20}
                                        width={15}
                                        height={2}
                                        rx={1}
                                      />{" "}
                                    </g>{" "}
                                  </svg>{" "}
                                </span>{" "}
                              </a>
                            ) : (
                              <a
                                href="javascript:;"
                                className="btn btn-sm btn-clean btn-icon mr-2 related_products"
                                title="Add Product "
                                data-id="6371fee00a24cadeee0cea52"
                              >
                                {" "}
                                <span className="svg-icon svg-icon-md colorGreen">
                                  {" "}
                                  <i class="fas fa-circle"></i> Added{" "}
                                </span>{" "}
                              </a>
                            )}
                          </span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/*end: Datatable*/}
            <div className="ps__rail-x" style={{ left: 0, bottom: 0 }}>
              <div
                className="ps__thumb-x"
                tabIndex={0}
                style={{ left: 0, width: 0 }}
              />
            </div>
            <div className="ps__rail-y" style={{ top: 0, right: 0 }}>
              <div
                className="ps__thumb-y"
                tabIndex={0}
                style={{ top: 0, height: 0 }}
              />
            </div>
          </div>
          {/*end::Card*/}
        </div>
      </div>
    </Modal>
  );
};

export default AlternateProductsModal;
