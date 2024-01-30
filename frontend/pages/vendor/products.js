import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { toast } from "react-toastify";
import { Modal } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { useTranslations } from "next-intl";
// import { useSelector } from "react-redux";

import Layout from "@/components/Vendor/Layout";
import { getAllProducts } from "@/services/product";
import { createAxiosCookies } from "@/fn";
import useRequest from "@/hooks/useRequest";
import { axiosInstance, MEDIA_URL } from "@/api";
import Pagination from "@/components/Pagination";
import AddProducts from "@/components/Vendor/AddProducts";
import ImportProducts from "@/components/Vendor/ImportProducts";

const Products = ({
  totalProductsCount,
  productsArray,
  warehousesArray,
  masterCategoriesArray,
  allBrandsArray,
}) => {
  const t = useTranslations("Index");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [products, setProducts] = useState(productsArray);
  const [warehouses, setWarehouses] = useState(warehousesArray);
  const [masterCategories, setMasterCategories] = useState(
    masterCategoriesArray
  );
  const [allBrands, setAllBrands] = useState(allBrandsArray);
  const [totalProducts, setTotalProducts] = useState(totalProductsCount);

  const [deleteProdcutId, setDeleteProductId] = useState("");
  const [showProductDeleteModal, setShowProductDeleteModal] = useState(false);

  const [isGridView, setIsGridView] = useState(true);

  // const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const router = useRouter();

  // const { userId } = useSelector((state) => state.auth);

  const { webview } = router.query;

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    getValues,
  } = useForm();

  const { request, response } = useRequest();
  const {
    request: makeProductAsDraftRequest,
    response: makeProductAsDraftResponse,
  } = useRequest();
  const {
    request: makeProductPublishRequest,
    response: makeProductPublishResponse,
  } = useRequest();

  const { request: deleteProductRequest, response: deleteProductResponse } =
    useRequest();

  const {
    request: productQuantityAddRequest,
    response: productQuantityAddResponse,
  } = useRequest();

  const { request: statusChangeRequest, response: statusChangeResponse } =
    useRequest();

  useEffect(() => {
    if (response) {
      if (response.status) {
        const {
          allBrands,
          masterCategories,
          products,
          warehouses,
          totalProducts,
        } = response;
        // setMasterCategories(masterCategories);
        setProducts(products);
        // setWarehouses(warehouses);
        // setAllBrands(allBrands);
        setTotalProducts(totalProducts);
      }
    }
  }, [response]);

  useEffect(() => {
    if (makeProductAsDraftResponse && makeProductAsDraftResponse.status) {
      const { productId } = makeProductAsDraftResponse;
      toast.success(makeProductAsDraftResponse.message);
      const newProducts = [...products].map((p) => {
        if (p._id == productId) {
          p.isPublished = false;
        }
        return p;
      });
      setProducts(newProducts);
    }
  }, [makeProductAsDraftResponse]);

  useEffect(() => {
    if (statusChangeResponse && statusChangeResponse.status) {
      const { id, newStatus } = statusChangeResponse;
      toast.success(statusChangeResponse.message);
      const newProducts = [...products].map((p) => {
        if (p._id == id) {
          p.isActive = newStatus;
        }
        return p;
      });
      setProducts(newProducts);
    }
  }, [statusChangeResponse]);

  useEffect(() => {
    if (makeProductPublishResponse && makeProductPublishResponse.status) {
      toast.success(makeProductPublishResponse.message);
      const { productId } = makeProductPublishResponse;
      const newProducts = [...products].map((p) => {
        if (p._id == productId) {
          p.isPublished = true;
        }
        return p;
      });
      setProducts(newProducts);
    }
  }, [makeProductPublishResponse]);

  useEffect(() => {
    if (deleteProductResponse && deleteProductResponse.status) {
      const { id, message } = deleteProductResponse;
      toast.success(message);
      const newProducts = products.filter((p) => p._id !== id);
      setProducts(newProducts);
      setShowProductDeleteModal(false);
    }
  }, [deleteProductResponse]);

  useEffect(() => {
    if (productQuantityAddResponse && productQuantityAddResponse.status) {
      const { id, message } = productQuantityAddResponse;
      toast.success(message);
      const newProducts = [...products].map((p) => {
        if (p._id == id) {
          p.quantity += 1;
        }
        return p;
      });
      setProducts(newProducts);
    }
  }, [productQuantityAddResponse]);

  useEffect(() => {
    const subscription = watch((values) => {
      setPage(1);

      let { name, brands, masterCategories, warehouses, isPublished } = values;

      if (brands) {
        brands = brands.map((b) => b.value);
      }
      if (masterCategories) {
        masterCategories = masterCategories.map((m) => m.value);
      }
      if (warehouses) {
        warehouses = warehouses.map((w) => w.value);
      }

      request("POST", "v1/product/all", {
        page,
        per_page: perPage,
        order: "asc",
        sortBy: "createdAt",
        name,
        brands,
        masterCategories,
        warehouses,
        isPublished,
      });
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const fetchMoreData = ({ selected }) => {
    let { name, brands, masterCategories, warehouses, isPublished } =
      getValues();

    setPage(selected + 1);
    request("POST", "v1/product/all", {
      page: selected + 1,
      per_page: perPage,
      order: "asc",
      sortBy: "name",
      name,
      brands,
      masterCategories,
      warehouses,
      isPublished,
    });
  };

  const makeProductPublishHandler = (productId) => {
    makeProductPublishRequest("POST", "v1/product/publish", { productId });
  };
  const makeProductDraftHandler = (productId) => {
    makeProductAsDraftRequest("POST", "v1/product/draft", { productId });
  };
  const productDeleteHandler = (id) => {
    deleteProductRequest("DELETE", "v1/product", { id });
  };
  const productQuantityAddHandler = (id) => {
    productQuantityAddRequest("PUT", "v1/product/quantity", { id });
  };

  const changeStatusHandler = (id, status) => {
    status = status == true ? false : true;
    statusChangeRequest("PUT", "v1/product/status", { id, status });
  };

  // const routeToProduct = (slug) => {
  //   router.push(
  //     {
  //       pathname: `/product/${slug}`,
  //       query: { vendor: userId },
  //     },
  //     `/product/${slug}`
  //   );
  // };

  if (webview) {
    return <ImportProducts />;
  }

  return (
    <Layout seoData={{ pageTitle: "Products - Noonmar" }}>
      <div className="main_content listingContainer">
        <div className="Export_listing_top">
          {/* <a
            // onClick={() => setIsImportModalOpen(true)}
            className="ExportBtns mr-15 cursor"
          >
            {t("Import")} <i className="fal fa-cloud-download" />
          </a> */}
          <ImportProducts />

          <a href="#" className="ExportBtns">
            {t("Export")}
            <i className="fal fa-cloud-upload" />
          </a>
        </div>

        <div className="offre_listing_section orderListingBox">
          <div className="AddNewProductBox showing_order">
            <Link href="/vendor/add-product" legacyBehavior>
              <a
                // onClick={() => setIsImportModalOpen(true)}
                className="Warehouse_button cursor"
              >
                <span>
                  <svg
                    width={16}
                    height={17}
                    viewBox="0 0 16 17"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.7594 9.876H9.49541V16.14H6.50741V9.876H0.279406V6.888H6.50741V0.66H9.49541V6.888H15.7594V9.876Z"
                      fill="white"
                    />
                  </svg>
                </span>
                <span className="addText">Add More Products</span>
              </a>
            </Link>

            {/* <AddProducts
              isImportModalOpen={isImportModalOpen}
              setIsImportModalOpen={setIsImportModalOpen}
            /> */}

            <div className="showing_order">
              <div className="list-grid-toggle">
                <i
                  onClick={() => setIsGridView(true)}
                  className={`[ icon icon--grid ] fa fa-th ${
                    isGridView ? "active" : ""
                  }`}
                />
                <i
                  onClick={() => setIsGridView(false)}
                  className={`[ icon icon--list ] fa fa-list ${
                    isGridView ? "" : "active"
                  }`}
                />
              </div>
              {false && (
                <h5 className="showingTitle">
                  {t("Showing")} {!totalProducts ? 0 : 1 + 10 * (page - 1)} -{" "}
                  {products.length < 10 ? totalProducts : 10 * page} of{" "}
                  {totalProducts} {t("Products")}
                  {/* Showing {1 + (page - 1) * 10} -{" "}
                {products?.length + (page - 1) * 10} of {totalProducts}{" "}
                Orders */}
                </h5>
              )}
            </div>
          </div>
          <div className="order_listing_block listingCategoryInput">
            <div className="row">
              <div className="col-lg-6 col-xl-4">
                <div className="form-group">
                  <div className="listingSearchblock">
                    <input
                      type="search"
                      className="form-control orderSearchInput"
                      placeholder={t("Search")}
                      {...register("name")}
                    />
                    <span className="OrderSearchIcon">
                      <svg
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M23.414 20.586L18.337 15.509C19.386 13.928 20 12.035 20 10C20 4.486 15.514 0 10 0C4.486 0 0 4.486 0 10C0 15.514 4.486 20 10 20C12.035 20 13.928 19.386 15.509 18.337L20.586 23.414C21.366 24.195 22.634 24.195 23.414 23.414C24.195 22.633 24.195 21.367 23.414 20.586ZM3 10C3 6.14 6.14 3 10 3C13.86 3 17 6.14 17 10C17 13.86 13.86 17 10 17C6.14 17 3 13.86 3 10Z"
                          fill="#F7CB50"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 col-xl-4">
                <div className="form-group">
                  <Controller
                    className="form-control form-control-solid form-control-lg mb-10 col-4"
                    control={control}
                    name="brands"
                    render={({ field: { onChange, value, ref } }) => {
                      return (
                        <Select
                          onChange={(val) => {
                            onChange(val);
                          }}
                          placeholder={t("Filter by Brands")}
                          options={allBrands.map((item) => {
                            return { value: item._id, label: item.name };
                          })}
                          isMulti={true}
                          defaultValue={[]}
                          // value={selectedBrand}
                          className="form-select- form-control- dark-form-control libSelect"
                        />
                      );
                    }}
                  />
                  {/* <select
                    className="form-select form-control dark-form-control"
                    aria-label="Default select "
                    {...register("bran")}
                  >
                    <option selected="">Product in stock</option>
                    <option value={1}>One</option>
                    <option value={2}>Two</option>
                    <option value={3}>Three</option>
                  </select> */}
                </div>
              </div>
              {/* <div className="col-lg-6 col-xl-4">
                <div className="form-group">
                  <Controller
                    className="form-control form-control-solid form-control-lg mb-10 col-4"
                    control={control}
                    name="warehouses"
                    render={({ field: { onChange, value, ref } }) => {
                      return (
                        <Select
                          onChange={(val) => {
                            onChange(val);
                          }}
                          placeholder={t("Filter by Warehouse")}
                          options={warehouses}
                          isMulti={true}
                          defaultValue={[]}
                          // value={selectedBrand}
                          className="form-select- form-control- dark-form-control libSelect"
                        />
                      );
                    }}
                  />
                </div>
              </div> */}
              <div className="col-lg-6 col-xl-4">
                <div className="form-group">
                  <Controller
                    className="form-control form-control-solid form-control-lg mb-10 col-4"
                    control={control}
                    name="masterCategories"
                    render={({ field: { onChange, value, ref } }) => {
                      return (
                        <Select
                          onChange={(val) => {
                            onChange(val);
                          }}
                          placeholder={t("Filter by Categories")}
                          options={masterCategories.map((item) => {
                            return { value: item._id, label: item.name };
                          })}
                          isMulti={true}
                          defaultValue={[]}
                          // value={selectedBrand}
                          className="form-select- form-control- dark-form-control libSelect"
                        />
                      );
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* listing tabel */}
        <div
          className={`OfferDetailsBlock vendar_orders products ${
            isGridView ? "list-view grid" : ""
          }`}
        >
          <div className="table-responsive">
            <table className="table align-middle table-borderless table-border-spacing">
              <thead>
                <tr>
                  {/* <th className="check-col" scope="col">
                    <div className="custom_checkbox position-relative d-flex check-type2">
                      <input type="checkbox" id="check1" defaultChecked="" />
                    </div>
                  </th> */}
                  <th scope="col">{t("Product Details")} </th>
                  {/* <th scope="col" className="text-center">
                    {" "}
                    {t("In Order Quantity")}
                  </th> */}
                  {/* <th scope="col" className="text-center">
                    {" "}
                    {t("In Stock")}
                  </th> */}
                  <th scope="col" className="text-center">
                    {t("Price")}
                  </th>
                  <th scope="col" className="text-center">
                    Status
                  </th>
                  <th scope="col" className="text-center">
                    {" "}
                    {t("Rate")}
                  </th>
                  <th scope="col" className="text-center">
                    {" "}
                    {t("Manage Inventory")}
                  </th>
                  <th scope="col" className="text-center" />
                </tr>
              </thead>
              <tbody>
                {products &&
                  products.map((p) => (
                    <tr className="shadow-effect" key={p._id}>
                      {/* <td className="select-row">
                        <div className="custom_checkbox position-relative check-type2">
                          <input type="checkbox" id="check1" />
                        </div>
                      </td> */}
                      <td className="offer-dtl-col" data-name="Product dETAILS">
                        <div className="PlatformMarketplace">
                          <div className="blackFridayImg">
                            {console.log(p)}
                            {console.log(`${MEDIA_URL}/${p.coverImage}`)}
                            <img src={`${MEDIA_URL}/${p.coverImage}`} alt="" />
                          </div>
                          <div className="blackFridaySale">
                            <div className="menorderClothing">
                              <span className="orderClothing">
                                {p.masterCategoryName}
                              </span>
                            </div>
                            <h3 className="fridaySaleTitle">{p.name}</h3>
                            {/* <p
                              dangerouslySetInnerHTML={{
                                __html: p.shortDescription,
                              }}
                              className="platformdes"
                            /> */}
                            <p className="platformdes">
                              {p.shortDescription
                                // ?.replace(/(<([^>]+)>)/gi, "")
                                // ?.substring(0, 99)
                                }
                              {p.shortDescription.length > 99 ? "..." : ""}
                            </p>
                            <div className="minQtyDes">
                              {t("Brand Name")}: <span>{p.brandName}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* <td
                        className="text-center"
                        data-name={t("In Order Quantity")}
                      >
                        {t("0 QTY")}
                      </td> */}
                      {/* <td className="text-center" data-name={t("In Stock")}>
                        {t("0 QTY")}
                      </td> */}
                      <td className="text-center" data-name={t("Price")}>
                        {p.currency}
                        {p.sellingPrice}
                      </td>
                      <td className="text-center" data-name="Status">
                        {p.isApproved ? "Approved" : "Not Approved"}
                      </td>
                      <td className="text-center" data-name={t("Rate")}>
                        <div className="productRating">
                          {
                            (new Array(p.reviewsCount)
                              .fill(null)
                              .map((f) => <i className="fas fa-star" />),
                            new Array(5 - p.reviewsCount)
                              .fill(null)
                              .map((f) => <i class="far fa-star"></i>))
                          }

                          <span>({p.reviewsCount})</span>
                        </div>
                      </td>
                      <td
                        className="text-center"
                        data-name={t("Manage Inventory")}
                      >
                        <div className="productInventory">
                          <span
                            className="products_inventory_pen cursor"
                            onClick={() =>
                              router.push(`/vendor/product/${p._id}`)
                            }
                          >
                            <i className="fas fa-pen" />
                          </span>
                          {/* <span
                            title="Increase Quantity"
                            className="products_inventory_plus cursor"
                            onClick={() => productQuantityAddHandler(p._id)}
                          >
                            <i className="fas fa-plus-circle" />
                          </span> */}
                          <span
                            className="products_inventory_delit cursor"
                            title="Delete"
                            onClick={() => {
                              setDeleteProductId(p._id);
                              setShowProductDeleteModal(true);
                            }}
                          >
                            <i className="fas fa-trash-alt" />
                          </span>
                          {p.isActive ? (
                            <span
                              title="Deactivate product"
                              className="svg-icon svg-icon-md svg-icon-danger cursor"
                              onClick={() => {
                                changeStatusHandler(p._id, p.isActive);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                // xmlns:xlink="http://www.w3.org/1999/xlink"
                                width="24px"
                                height="24px"
                                viewBox="0 0 24 24"
                                version="1.1"
                              >
                                <g
                                  stroke="none"
                                  strokeWidth="1"
                                  fill="none"
                                  fillRule="evenodd"
                                >
                                  <g
                                    transform="translate(12.000000, 12.000000) rotate(-45.000000) translate(-12.000000, -12.000000) translate(4.000000, 4.000000)"
                                    fill="#000000"
                                  >
                                    <rect
                                      x="0"
                                      y="7"
                                      width="16"
                                      height="2"
                                      rx="1"
                                    ></rect>
                                    <rect
                                      opacity="0.3"
                                      transform="translate(8.000000, 8.000000) rotate(-270.000000) translate(-8.000000, -8.000000) "
                                      x="0"
                                      y="7"
                                      width="16"
                                      height="2"
                                      rx="1"
                                    ></rect>
                                  </g>
                                </g>
                              </svg>
                            </span>
                          ) : (
                            <span
                              title="Activate product"
                              className="svg-icon svg-icon-md svg-icon-success cursor"
                              onClick={() => {
                                changeStatusHandler(p._id, p.isActive);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                // xmlns:xlink="http://www.w3.org/1999/xlink"
                                width="24px"
                                height="24px"
                                viewBox="0 0 24 24"
                                version="1.1"
                              >
                                <g
                                  stroke="none"
                                  strokeWidth="1"
                                  fill="none"
                                  fillRule="evenodd"
                                >
                                  <polygon points="0 0 24 0 24 24 0 24"></polygon>
                                  <path
                                    d="M9.26193932,16.6476484 C8.90425297,17.0684559 8.27315905,17.1196257 7.85235158,16.7619393 C7.43154411,16.404253 7.38037434,15.773159 7.73806068,15.3523516 L16.2380607,5.35235158 C16.6013618,4.92493855 17.2451015,4.87991302 17.6643638,5.25259068 L22.1643638,9.25259068 C22.5771466,9.6195087 22.6143273,10.2515811 22.2474093,10.6643638 C21.8804913,11.0771466 21.2484189,11.1143273 20.8356362,10.7474093 L17.0997854,7.42665306 L9.26193932,16.6476484 Z"
                                    fill="#000000"
                                    fillRule="nonzero"
                                    opacity="0.3"
                                    transform="translate(14.999995, 11.000002) rotate(-180.000000) translate(-14.999995, -11.000002) "
                                  ></path>
                                  <path
                                    d="M4.26193932,17.6476484 C3.90425297,18.0684559 3.27315905,18.1196257 2.85235158,17.7619393 C2.43154411,17.404253 2.38037434,16.773159 2.73806068,16.3523516 L11.2380607,6.35235158 C11.6013618,5.92493855 12.2451015,5.87991302 12.6643638,6.25259068 L17.1643638,10.2525907 C17.5771466,10.6195087 17.6143273,11.2515811 17.2474093,11.6643638 C16.8804913,12.0771466 16.2484189,12.1143273 15.8356362,11.7474093 L12.0997854,8.42665306 L4.26193932,17.6476484 Z"
                                    fill="#000000"
                                    fillRule="nonzero"
                                    transform="translate(9.999995, 12.000002) rotate(-180.000000) translate(-9.999995, -12.000002) "
                                  ></path>
                                </g>
                              </svg>
                            </span>
                          )}
                        </div>
                      </td>
                      {false && (
                        <td className="action-col">
                          <div className="RedemptionDropdown">
                            <div className="dropdown">
                              <button
                                className="btn-action-filter dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <i className="fas fa-ellipsis-v" />
                              </button>
                              <ul className="dropdown-menu">
                                <li>
                                  <div className="action_radios">
                                    <div className="form-group custom_radio">
                                      {p.isPublished ? (
                                        <label
                                          onClick={() =>
                                            makeProductDraftHandler(p._id)
                                          }
                                        >
                                          Make Draft
                                        </label>
                                      ) : (
                                        <label
                                          onClick={() =>
                                            makeProductPublishHandler(p._id)
                                          }
                                        >
                                          Publish Product
                                        </label>
                                      )}
                                      {/* <label htmlFor="Enable">Enable</label> */}
                                    </div>
                                    {/* <div className="form-group custom_radio">
                                    <input
                                      type="radio"
                                      id="Disable"
                                      name="radio-group"
                                      value={false}
                                      {...register("isPublished")}
                                    />
                                    <label htmlFor="Disable">Disable</label>
                                  </div> */}
                                  </div>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                {/* <tr className="shadow-effect">
                  <td className="select-row">
                    <div className="custom_checkbox position-relative check-type2">
                      <input type="checkbox" id="check1" />
                    </div>
                  </td>
                  <td className="offer-dtl-col" data-name="Product dETAILS">
                    <div className="PlatformMarketplace">
                      <div className="blackFridayImg">
                        <img src="img/product_vendor_img.jpg" alt="" />
                      </div>
                      <div className="blackFridaySale">
                        <div className="menorderClothing">
                          <span className="orderClothing">Men’s Clothing</span>
                        </div>
                        <h3 className="fridaySaleTitle">
                          Oversized Yellow Sweatshirt
                        </h3>
                        <p className="platformdes">
                          Force Majeure is a fashion label based in Montreal{" "}
                        </p>
                        <div className="minQtyDes">
                          Brand Name: <span>H&amp;M Store</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="text-center" data-name="IN ORDER Quantity">
                    3 QTY
                  </td>
                  <td className="text-center" data-name="IN sTOCK">
                    5 QTY
                  </td>
                  <td className="text-center" data-name="Price">
                    $4,500 USD
                  </td>
                  <td className="text-center" data-name="RATE">
                    <div className="productRating">
                      <i className="fas fa-star" />
                      <i className="fas fa-star" />
                      <i className="fas fa-star" />
                      <i className="fas fa-star" />
                      <span>(103)</span>
                    </div>
                  </td>
                  <td className="text-center" data-name="MANAGE INVENTORY">
                    <div className="productInventory">
                      <span className="products_inventory_pen ">
                        <i className="fas fa-pen" />
                      </span>
                      <span className="products_inventory_plus ">
                        <i className="fas fa-plus-circle" />
                      </span>
                      <span className="products_inventory_delit ">
                        <i className="fas fa-trash-alt" />
                      </span>
                    </div>
                  </td>
                  <td className="action-col">
                    <div className="RedemptionDropdown">
                      <div className="dropdown">
                        <button
                          className="btn-action-filter dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <i className="fas fa-ellipsis-v" />
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <a className="dropdown-item" href="#">
                              Action
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                              Another action
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                              Something else here
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr className="shadow-effect">
                  <td className="select-row">
                    <div className="custom_checkbox position-relative check-type2">
                      <input type="checkbox" id="check1" />
                    </div>
                  </td>
                  <td className="offer-dtl-col" data-name="Product dETAILS">
                    <div className="PlatformMarketplace">
                      <div className="blackFridayImg">
                        <img src="img/product_vendor_img.jpg" alt="" />
                      </div>
                      <div className="blackFridaySale">
                        <div className="menorderClothing">
                          <span className="orderClothing">Men’s Clothing</span>
                        </div>
                        <h3 className="fridaySaleTitle">
                          Oversized Yellow Sweatshirt
                        </h3>
                        <p className="platformdes">
                          Force Majeure is a fashion label based in Montreal{" "}
                        </p>
                        <div className="minQtyDes">
                          Brand Name: <span>H&amp;M Store</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="text-center" data-name="IN ORDER Quantity">
                    3 QTY
                  </td>
                  <td className="text-center" data-name="IN sTOCK">
                    5 QTY
                  </td>
                  <td className="text-center" data-name="Price">
                    $4,500 USD
                  </td>
                  <td className="text-center" data-name="RATE">
                    <div className="productRating">
                      <i className="fas fa-star" />
                      <i className="fas fa-star" />
                      <i className="fas fa-star" />
                      <i className="fas fa-star" />
                      <span>(103)</span>
                    </div>
                  </td>
                  <td className="text-center" data-name="MANAGE INVENTORY">
                    <div className="productInventory">
                      <span className="products_inventory_pen ">
                        <i className="fas fa-pen" />
                      </span>
                      <span className="products_inventory_plus ">
                        <i className="fas fa-plus-circle" />
                      </span>
                      <span className="products_inventory_delit ">
                        <i className="fas fa-trash-alt" />
                      </span>
                    </div>
                  </td>
                  <td className="action-col">
                    <div className="RedemptionDropdown">
                      <div className="dropdown">
                        <button
                          className="btn-action-filter dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <i className="fas fa-ellipsis-v" />
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <a className="dropdown-item" href="#">
                              Action
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                              Another action
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                              Something else here
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr className="shadow-effect">
                  <td className="select-row">
                    <div className="custom_checkbox position-relative check-type2">
                      <input type="checkbox" id="check1" />
                    </div>
                  </td>
                  <td className="offer-dtl-col" data-name="Product dETAILS">
                    <div className="PlatformMarketplace">
                      <div className="blackFridayImg">
                        <img src="img/product_vendor_img.jpg" alt="" />
                      </div>
                      <div className="blackFridaySale">
                        <div className="menorderClothing">
                          <span className="orderClothing">Men’s Clothing</span>
                        </div>
                        <h3 className="fridaySaleTitle">
                          Oversized Yellow Sweatshirt
                        </h3>
                        <p className="platformdes">
                          Force Majeure is a fashion label based in Montreal{" "}
                        </p>
                        <div className="minQtyDes">
                          Brand Name: <span>H&amp;M Store</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="text-center" data-name="IN ORDER Quantity">
                    3 QTY
                  </td>
                  <td className="text-center" data-name="IN sTOCK">
                    5 QTY
                  </td>
                  <td className="text-center" data-name="Price">
                    $4,500 USD
                  </td>
                  <td className="text-center" data-name="RATE">
                    <div className="productRating">
                      <i className="fas fa-star" />
                      <i className="fas fa-star" />
                      <i className="fas fa-star" />
                      <i className="fas fa-star" />
                      <span>(103)</span>
                    </div>
                  </td>
                  <td className="text-center" data-name="MANAGE INVENTORY">
                    <div className="productInventory">
                      <span className="products_inventory_pen ">
                        <i className="fas fa-pen" />
                      </span>
                      <span className="products_inventory_plus ">
                        <i className="fas fa-plus-circle" />
                      </span>
                      <span className="products_inventory_delit ">
                        <i className="fas fa-trash-alt" />
                      </span>
                    </div>
                  </td>
                  <td className="action-col">
                    <div className="RedemptionDropdown">
                      <div className="dropdown">
                        <button
                          className="btn-action-filter dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <i className="fas fa-ellipsis-v" />
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <a className="dropdown-item" href="#">
                              Action
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                              Another action
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                              Something else here
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </td>
                </tr> */}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination
          currentPage={page}
          totalItems={totalProducts}
          perPage={perPage}
          fetchMoreItems={fetchMoreData}
        />
      </div>

      <Modal show={showProductDeleteModal}>
        <Modal.Header>
          <Modal.Title>{t("Delete Confirmation")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-danger">
            {t("Are you sure you want to delete this product?")}
          </div>
        </Modal.Body>
        <Modal.Footer>
          {/* <Button variant="secondary"> */}
          <Button
            variant="secondary"
            onClick={() => setShowProductDeleteModal(false)}
          >
            {t("Cancel")}
          </Button>
          {/* <Button variant="danger" onClick={handleDelete}> */}
          <Button
            variant="danger"
            onClick={() => productDeleteHandler(deleteProdcutId)}
          >
            {t("Delete")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
};
export async function getServerSideProps(context) {
  await createAxiosCookies(context);
  const { totalProducts, products, warehouses, masterCategories, allBrands } =
    await getAllProducts();

  return {
    props: {
      protected: true,
      key: new Date().toString(),
      userTypes: ["vendor"],
      totalProductsCount: totalProducts,
      productsArray: products,
      warehousesArray: warehouses,
      masterCategoriesArray: masterCategories,
      allBrandsArray: allBrands,
      locales: {
        ...require(`../../locales/index/${context.locale}.json`),
      },
    },
  };
}

export default Products;
