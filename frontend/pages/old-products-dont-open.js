import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import ReactPaginate from "react-paginate";

import Layout from "@/components/Layout";
import { getProducts } from "@/services/product";
import { createAxiosCookies } from "@/fn";
import { MEDIA_URL } from "@/api";
import useRequest from "@/hooks/useRequest";

const Products = ({
  productsArr,
  minPrice,
  maxPrice,
  totalProductsCount,
  currency,
  brands,
  subCategories,
  filters,
}) => {
  const [products, setProducts] = useState(productsArr);
  const [totalProducts, setTotalProducts] = useState(totalProductsCount);

  const [isGridView, setIsGridView] = useState(true);
  const [page, setPage] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const { request, response } = useRequest();

  const router = useRouter();

  useEffect(() => {
    register("minPrice");
    register("maxPrice");

    setValue("minPrice", minPrice);
    setValue("maxPrice", maxPrice);

    $("#budget_slider").ionRangeSlider({
      type: "double",
      grid: false,
      min: minPrice,
      max: maxPrice,
      from: minPrice,
      to: maxPrice,
      onFinish: (data) => {
        setValue("minPrice", data.from);
        setValue("maxPrice", data.to);
      },
    });
  }, []);

  useEffect(() => {
    const subscription = watch((values) => {
      const {
        onSale,
        minPrice,
        maxPrice,
        sortBy,
        inStock,
        outOfStock,
        ratings,
        discount,
        dynamic,
      } = values;

      const subCategories = [];
      const brands = [];
      const dynamicFilters = [];

      for (let key in values.subCategories) {
        if (values.subCategories[key]) {
          subCategories.push(key);
        }
      }

      for (let key in values.brands) {
        if (values.brands[key]) {
          brands.push(key);
        }
      }

      let bodyObj = {};

      if (ratings !== null) {
        bodyObj.ratings = +ratings;
      }

      if (discount !== null) {
        switch (discount) {
          case "one": {
            bodyObj.minDiscount = 0;
            bodyObj.maxDiscount = 15;
            break;
          }
          case "two": {
            bodyObj.minDiscount = 15;
            bodyObj.maxDiscount = 30;
            break;
          }
          case "three": {
            bodyObj.minDiscount = 30;
            bodyObj.maxDiscount = 45;
            break;
          }
          default: {
          }
        }
      }

      for (let key in dynamic) {
        if (dynamic[key]) {
          const [id, value] = key.split("_");
          dynamicFilters.push({
            id,
            value,
          });
        }
      }

      request("POST", "v1/product", {
        onSale,
        subCategories,
        brands,
        minPrice,
        maxPrice,
        inStock,
        outOfStock,
        page: 1,
        sortBy,
        dynamicFilters,
        ...bodyObj,
      });
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    if (response) {
      setPage(1);
      setProducts(response.products);
      setTotalProducts(response.totalProducts);
    }
  }, [response]);

  return (
    <Layout seoData={{ pageTitle: "Noonmar" }}>
      <section className="sale-section-banner">
        <div className="container-fluid">
          <div className="hero_banner_wrapper">
            <img src="/assets/img/hero.png" alt="" />
          </div>
        </div>
        <section className="product-search-listing">
          <div className="container">
            <div className="row gx-md-5">
              <div col-md-12="">
                <div className="breadcrumbBlock breadcrumbBlockListing">
                  <nav>
                    <ol className="breadcrumb">
                      <li className="breadcrumb-item">
                        <a href="#">Home</a>
                      </li>
                      <li
                        className="breadcrumb-item active"
                        aria-current="page"
                      >
                        Handbag
                      </li>
                    </ol>
                  </nav>
                  <div onclick="openNav()" className="sideTabicon">
                    <svg
                      className="svg-inline--fa fa-filter"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fas"
                      data-icon="filter"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                      data-fa-i2svg=""
                    >
                      <path
                        fill="currentColor"
                        d="M3.853 54.87C10.47 40.9 24.54 32 40 32H472C487.5 32 501.5 40.9 508.1 54.87C514.8 68.84 512.7 85.37 502.1 97.33L320 320.9V448C320 460.1 313.2 471.2 302.3 476.6C291.5 482 278.5 480.9 268.8 473.6L204.8 425.6C196.7 419.6 192 410.1 192 400V320.9L9.042 97.33C-.745 85.37-2.765 68.84 3.854 54.87L3.853 54.87z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 theia-sticky">
                <div id="portfolioDisc">
                  <h2 className="product-section-heading">Handbags</h2>
                  <a
                    href="javascript:void(0)"
                    onclick="closeNav()"
                    className="closebtn"
                  >
                    <i className="fas fa-times" />
                  </a>
                  <div className="stock-checkBox stock-checkBox-spacing">
                    <div className="form-check">
                      <div className="custom_checkbox position-relative check-type2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          defaultValue=""
                          id="saleCheckDefault"
                          {...register("onSale")}
                        />
                      </div>
                      <label
                        className="form-check-label"
                        htmlFor="saleCheckDefault"
                      >
                        On Sale
                      </label>
                    </div>
                  </div>
                  <div
                    className="accordion accordion-flush accordion-category"
                    id="accordionFlushExample"
                  >
                    <div className="accordion-item">
                      <h2 className="accordion-header" id="flush-headingOne">
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#flush-collapseOne"
                          aria-expanded="false"
                          aria-controls="flush-collapseOne"
                        >
                          Sub - Category
                        </button>
                      </h2>
                      <div
                        id="flush-collapseOne"
                        className="accordion-collapse collapse"
                        aria-labelledby="flush-headingOne"
                        data-bs-parent="#accordionFlushExample"
                      >
                        <div className="accordion-body">
                          <div className="stock-checkBox">
                            {subCategories.map((subCategory) => (
                              <div key={subCategory._id} className="form-check">
                                <div className="custom_checkbox position-relative check-type2">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    defaultValue=""
                                    id={subCategory._id}
                                    {...register(
                                      `subCategories.${subCategory._id}`
                                    )}
                                  />
                                </div>
                                <label
                                  className="form-check-label"
                                  htmlFor={subCategory._id}
                                >
                                  {subCategory.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="accordion-item">
                      <h2 className="accordion-header" id="flush-headingTwo">
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#flush-collapseTwo"
                          aria-expanded="false"
                          aria-controls="flush-collapseTwo"
                        >
                          Brand
                        </button>
                      </h2>
                      <div
                        id="flush-collapseTwo"
                        className="accordion-collapse collapse"
                        aria-labelledby="flush-headingTwo"
                        data-bs-parent="#accordionFlushExample"
                      >
                        <div className="accordion-body">
                          <div className="stock-checkBox">
                            {brands.map((brand) => (
                              <div key={brand._id} className="form-check">
                                <div className="custom_checkbox position-relative check-type2">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    defaultValue=""
                                    id={brand._id}
                                    {...register(`brands.${brand._id}`)}
                                  />
                                </div>
                                <label
                                  className="form-check-label"
                                  htmlFor={brand._id}
                                >
                                  {brand.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="accordion-item">
                      <h2 className="accordion-header" id="flush-headingFour">
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#flush-collapseFour"
                          aria-expanded="false"
                          aria-controls="flush-collapseFour"
                        >
                          Price Range
                        </button>
                      </h2>
                      <div
                        id="flush-collapseFour"
                        className="accordion-collapse collapse"
                        aria-labelledby="flush-headingFour"
                        data-bs-parent="#accordionFlushExample"
                      >
                        <div className="accordion-body">
                          <div className="stock-checkBox">
                            <div className="pf-Bx">
                              <label className="form-check-label mb-3 ms-0">
                                Filter By Price
                              </label>
                              <div className="pf-inbx">
                                <div className="budget-slider">
                                  <input
                                    type="text"
                                    id="budget_slider"
                                    name="budget_sler"
                                    defaultValue=""
                                  />
                                  <span className="Min">Min</span>
                                  <span className="Max">Max</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="accordion-item">
                      <h2 className="accordion-header" id="flush-headingFive">
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#flush-collapseFive"
                          aria-expanded="false"
                          aria-controls="flush-collapseFive"
                        >
                          Discount
                        </button>
                      </h2>
                      <div
                        id="flush-collapseFive"
                        className="accordion-collapse collapse"
                        aria-labelledby="flush-headingFive"
                        data-bs-parent="#accordionFlushExample"
                      >
                        <div className="accordion-body">
                          <div className="stock-checkBox">
                            <div className="form-check">
                              <div className="custom_checkbox position-relative check-type2">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  value="one"
                                  defaultValue=""
                                  id="partyCheckDefault"
                                  {...register(`discount`)}
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="partyCheckDefault"
                              >
                                15% off
                              </label>
                            </div>
                            <div className="form-check">
                              <div className="custom_checkbox position-relative check-type2">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  value="two"
                                  defaultValue=""
                                  id="formalCheckDefault"
                                  {...register(`discount`)}
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="formalCheckDefault"
                              >
                                15% to 30% off
                              </label>
                            </div>
                            <div className="form-check">
                              <div className="custom_checkbox position-relative check-type2">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  value="three"
                                  defaultValue=""
                                  id="casualCheckDefault"
                                  {...register(`discount`)}
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="casualCheckDefault"
                              >
                                30% to 50% off
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="accordion-item">
                      <h2 className="accordion-header" id="flush-headingSix">
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#flush-collapseSix"
                          aria-expanded="false"
                          aria-controls="flush-collapseSix"
                        >
                          Availability
                        </button>
                      </h2>
                      <div
                        id="flush-collapseSix"
                        className="accordion-collapse collapse"
                        aria-labelledby="flush-headingSix"
                        data-bs-parent="#accordionFlushExample"
                      >
                        <div className="accordion-body">
                          <div className="stock-checkBox">
                            <div className="form-check">
                              <div className="custom_checkbox position-relative check-type2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  defaultValue=""
                                  id="partyCheckDefault"
                                  {...register("inStock")}
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="partyCheckDefault"
                              >
                                In Stock
                              </label>
                            </div>
                            <div className="form-check">
                              <div className="custom_checkbox position-relative check-type2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  defaultValue=""
                                  id="formalCheckDefault"
                                  {...register("outOfStock")}
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="formalCheckDefault"
                              >
                                Out of Stock
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="accordion-item">
                      <h2 className="accordion-header" id="flush-headingSaven">
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#flush-collapseSaven"
                          aria-expanded="false"
                          aria-controls="flush-collapseSaven"
                        >
                          Rating
                        </button>
                      </h2>
                      <div
                        id="flush-collapseSaven"
                        className="accordion-collapse collapse"
                        aria-labelledby="flush-headingSaven"
                        data-bs-parent="#accordionFlushExample"
                      >
                        <div className="accordion-body">
                          <div className="stock-checkBox">
                            <div className="form-check">
                              <div className="custom_checkbox position-relative check-type2">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  value={5}
                                  defaultValue=""
                                  id="fiveStarCheckDefault"
                                  {...register("ratings")}
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="fiveStarCheckDefault"
                              >
                                <span>
                                  <i className="fas fa-star" />
                                </span>
                                <span>
                                  <i className="fas fa-star" />
                                </span>
                                <span>
                                  <i className="fas fa-star" />
                                </span>
                                <span>
                                  <i className="fas fa-star" />
                                </span>
                                <span>
                                  <i className="fas fa-star" />
                                </span>
                              </label>
                            </div>
                            <div className="form-check">
                              <div className="custom_checkbox position-relative check-type2">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  value={4}
                                  defaultValue=""
                                  id="fourStarCheckDefault"
                                  {...register("ratings")}
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="fourStarCheckDefault"
                              >
                                <span>
                                  <i className="fas fa-star" />
                                </span>
                                <span>
                                  <i className="fas fa-star" />
                                </span>
                                <span>
                                  <i className="fas fa-star" />
                                </span>
                                <span>
                                  <i className="fas fa-star" />
                                </span>
                              </label>
                            </div>
                            <div className="form-check">
                              <div className="custom_checkbox position-relative check-type2">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  value={3}
                                  defaultValue=""
                                  id="threeStarCheckDefault"
                                  {...register("ratings")}
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="threeStarCheckDefault"
                              >
                                <span>
                                  <i className="fas fa-star" />
                                </span>
                                <span>
                                  <i className="fas fa-star" />
                                </span>
                                <span>
                                  <i className="fas fa-star" />
                                </span>
                              </label>
                            </div>
                            <div className="form-check">
                              <div className="custom_checkbox position-relative check-type2">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  value={2}
                                  defaultValue=""
                                  id="twoStarCheckDefault"
                                  {...register("ratings")}
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="twoStarCheckDefault"
                              >
                                <span>
                                  <i className="fas fa-star" />
                                </span>
                                <span>
                                  <i className="fas fa-star" />
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {filters.map((filter) => (
                      <div key={filter._id} className="accordion-item">
                        <h2
                          className="accordion-header"
                          id={`flush-heading${filter._id}`}
                        >
                          <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#flush-collapse${filter._id}`}
                            aria-expanded="false"
                            aria-controls={`flush-collapse${filter._id}`}
                          >
                            {filter.name}
                          </button>
                        </h2>
                        <div
                          id={`flush-collapse${filter._id}`}
                          className="accordion-collapse collapse"
                          aria-labelledby={`flush-heading${filter._id}`}
                          data-bs-parent="#accordionFlushExample"
                        >
                          <div className="accordion-body">
                            <div className="stock-checkBox">
                              {filter.values.map((value) => (
                                <div key={value} className="form-check">
                                  <div className="custom_checkbox position-relative check-type2">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      defaultValue=""
                                      id={value}
                                      {...register(
                                        `dynamic.${filter._id}_${value}`
                                      )}
                                    />
                                  </div>
                                  <label
                                    className="form-check-label"
                                    htmlFor={value}
                                  >
                                    {value}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-lg-9">
                <div className="product-listingOrder">
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
                    <h5 className="showingTitle">
                      Showing 1 - 40 of 145 Orders
                    </h5>
                  </div>
                  <div className="listingCategory">
                    <div className="listingCategorySelect">
                      <div className="row align-items-center">
                        <label
                          htmlFor="inputEmail3"
                          className="col-md-3 col-form-label"
                        >
                          Sort by
                        </label>
                        <div className="col-md-9">
                          <div className="form-group">
                            <select
                              className="form-select form-control dark-form-control"
                              aria-label="Default select "
                              {...register("sortBy", {
                                required: true,
                              })}
                            >
                              <option selected value="new">
                                Newest Arrivals
                              </option>
                              <option value="priceAsc">
                                Price: Low to High{" "}
                              </option>
                              <option value="priceDesc">
                                Price: High to Low
                              </option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={`row align-items-center custom-row products  ${
                    isGridView ? "grid" : "list-view"
                  }  `}
                >
                  {products.map((product) => (
                    <div
                      key={product._id}
                      className="col-md-6 col-sm-6 col-lg-4 col-xxl-3  customPro-col-product  "
                    >
                      <div className="productCard rounded m-t-30 ">
                        <div className="product-listing_card">
                          <a href="javascript:void(0)" className="likePro">
                            <i className="far fa-heart" />
                          </a>
                          <a href="javascript:void(0)" className="likeProtow">
                            <i className="fal fa-share-alt" />
                          </a>
                          <div
                            onClick={() =>
                              router.push(`/product/${product.slug}`)
                            }
                            className="productImgCard"
                          >
                            <img
                              className="img-fluid rounded-top"
                              //   src="/assets/img/products/product-img01.png"
                              src={`${MEDIA_URL}/${product.media}`}
                              alt="Classified Plus"
                            />
                          </div>
                        </div>
                        <div className="featured-text">
                          <div className="text-top d-flex justify-content-between ">
                            <div
                              className="proTitle"
                              style={{ height: "40px" }}
                            >
                              {product.name}
                            </div>
                          </div>
                          <div className="proPriRow">
                            <span className="InnPriTag">
                              <span className="proPri">
                                {product.currency}
                                {product.price}
                              </span>
                              {product.discountPercentage !== 0 && (
                                <span className="ofrProPri">
                                  {product.currency}
                                  {product.discountedPrice}
                                </span>
                              )}
                            </span>
                            {product.discountPercentage > 0 && (
                              <span className="ofrTag">
                                -${product.discountPercentage}% off
                              </span>
                            )}
                          </div>
                          {product.reviewsCount !== 0 && (
                            <div className="proStars m-t-5">
                              {Array(product.ratings)
                                .fill(null)
                                .map((_, idx) => (
                                  <svg
                                    key={idx}
                                    width={17}
                                    height={16}
                                    viewBox="0 0 17 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                      fill="#FFAE5D"
                                    />
                                  </svg>
                                ))}
                              <span className="StarCount">
                                ({product.reviewsCount})
                              </span>
                            </div>
                          )}
                          <div className="product-btnGroup">
                            <a
                              href="javascript:void(0)"
                              className="proCartBtnborder"
                            >
                              Add to Cart
                            </a>
                            <a
                              href="javascript:void(0)"
                              className="proCartBtn proBuyBtn"
                            >
                              Buy Now
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {false && (
                    <>
                      <div className="col-md-6 col-sm-6 col-lg-4 col-xxl-3  customPro-col-product  ">
                        <div className="productCard rounded m-t-30 ">
                          <div className="product-listing_card">
                            <a href="javascript:void(0)" className="likePro">
                              <i className="far fa-heart" />
                            </a>
                            <a href="javascript:void(0)" className="likeProtow">
                              <i className="fal fa-share-alt" />
                            </a>
                            <div className="productImgCard">
                              <img
                                className="img-fluid rounded-top"
                                src="/assets/img/products/product-img01.png"
                                alt="Classified Plus"
                              />
                              <span className="BSellerTag">Best Seller</span>
                            </div>
                          </div>
                          <div className="featured-text">
                            <div className="text-top d-flex justify-content-between ">
                              <div className="proTitle" style={{ height: 80 }}>
                                ZEBRONICS Zeb-Reaper 2.4GHz Wireless Gaming
                                Mouse
                              </div>
                            </div>
                            <div className="proPriRow">
                              <span className="InnPriTag">
                                <span className="proPri">₹1,599.00</span>
                                <span className="ofrProPri">₹1,599.00</span>
                              </span>
                              <span className="ofrTag">-40% off</span>
                            </div>
                            <div className="proStars m-t-5">
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <span className="StarCount">(135)</span>
                            </div>
                            <div className="product-btnGroup">
                              <a
                                href="javascript:void(0)"
                                className="proCartBtnborder"
                              >
                                Add to Cart
                              </a>
                              <a
                                href="javascript:void(0)"
                                className="proCartBtn proBuyBtn"
                              >
                                Buy Now
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-sm-6 col-lg-4 col-xxl-3  customPro-col-product  ">
                        <div className="productCard rounded m-t-30 ">
                          <div className="product-listing_card">
                            <a href="javascript:void(0)" className="likePro">
                              <i className="far fa-heart" />
                            </a>
                            <a href="javascript:void(0)" className="likeProtow">
                              <i className="fal fa-share-alt" />
                            </a>
                            <div className="productImgCard">
                              <img
                                className="img-fluid rounded-top"
                                src="/assets/img/products/black-bag.png"
                                alt="Classified Plus"
                              />
                              <span className="BSellerTag">Best Seller</span>
                            </div>
                          </div>
                          <div className="featured-text">
                            <div className="text-top d-flex justify-content-between ">
                              <div className="proTitle" style={{ height: 80 }}>
                                ZEBRONICS Zeb-Reaper 2.4GHz Wireless Gaming
                                Mouse
                              </div>
                            </div>
                            <div className="proPriRow">
                              <span className="InnPriTag">
                                <span className="proPri">₹1,599.00</span>
                                <span className="ofrProPri">₹1,599.00</span>
                              </span>
                              <span className="ofrTag">-40% off</span>
                            </div>
                            <div className="proStars m-t-5">
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <span className="StarCount">(135)</span>
                            </div>
                            <div className="product-btnGroup">
                              <a
                                href="javascript:void(0)"
                                className="proCartBtnborder"
                              >
                                Add to Cart
                              </a>
                              <a
                                href="javascript:void(0)"
                                className="proCartBtn proBuyBtn"
                              >
                                Buy Now
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-sm-6 col-lg-4 col-xxl-3  customPro-col-product  ">
                        <div className="productCard rounded m-t-30 ">
                          <div className="product-listing_card">
                            <a href="javascript:void(0)" className="likePro">
                              <i className="far fa-heart" />
                            </a>
                            <a href="javascript:void(0)" className="likeProtow">
                              <i className="fal fa-share-alt" />
                            </a>
                            <div className="productImgCard">
                              <img
                                className="img-fluid rounded-top"
                                src="/assets/img/products/brown-bag.png"
                                alt="Classified Plus"
                              />
                            </div>
                          </div>
                          <div className="featured-text">
                            <div className="text-top d-flex justify-content-between ">
                              <div className="proTitle" style={{ height: 80 }}>
                                ZEBRONICS Zeb-Reaper 2.4GHz Wireless Gaming
                                Mouse
                              </div>
                            </div>
                            <div className="proPriRow">
                              <span className="InnPriTag">
                                <span className="proPri">₹1,599.00</span>
                                <span className="ofrProPri">₹1,599.00</span>
                              </span>
                              <span className="ofrTag">-40% off</span>
                            </div>
                            <div className="proStars m-t-5">
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <span className="StarCount">(135)</span>
                            </div>
                            <div className="product-btnGroup">
                              <a
                                href="javascript:void(0)"
                                className="proCartBtnborder"
                              >
                                Add to Cart
                              </a>
                              <a
                                href="javascript:void(0)"
                                className="proCartBtn proBuyBtn"
                              >
                                Buy Now
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-sm-6 col-lg-4 col-xxl-3  customPro-col-product  ">
                        <div className="productCard rounded m-t-30 ">
                          <div className="product-listing_card">
                            <a href="javascript:void(0)" className="likePro">
                              <i className="far fa-heart" />
                            </a>
                            <a href="javascript:void(0)" className="likeProtow">
                              <i className="fal fa-share-alt" />
                            </a>
                            <div className="productImgCard">
                              <img
                                className="img-fluid rounded-top"
                                src="/assets/img/products/product-img02.png"
                                alt="Classified Plus"
                              />
                            </div>
                          </div>
                          <div className="featured-text">
                            <div className="text-top d-flex justify-content-between ">
                              <div className="proTitle" style={{ height: 80 }}>
                                ZEBRONICS Zeb-Reaper 2.4GHz Wireless Gaming
                                Mouse
                              </div>
                            </div>
                            <div className="proPriRow">
                              <span className="InnPriTag">
                                <span className="proPri">₹1,599.00</span>
                                <span className="ofrProPri">₹1,599.00</span>
                              </span>
                              <span className="ofrTag">-40% off</span>
                            </div>
                            <div className="proStars m-t-5">
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <span className="StarCount">(135)</span>
                            </div>
                            <div className="product-btnGroup">
                              <a
                                href="javascript:void(0)"
                                className="proCartBtnborder"
                              >
                                Add to Cart
                              </a>
                              <a
                                href="javascript:void(0)"
                                className="proCartBtn proBuyBtn"
                              >
                                Buy Now
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-sm-6 col-lg-4 col-xxl-3  customPro-col-product  ">
                        <div className="productCard rounded m-t-30 ">
                          <div className="product-listing_card">
                            <a href="javascript:void(0)" className="likePro">
                              <i className="far fa-heart" />
                            </a>
                            <div className="productImgCard">
                              <img
                                className="img-fluid rounded-top"
                                src="/assets/img/products/product-img01.png"
                                alt="Classified Plus"
                              />
                            </div>
                          </div>
                          <div className="featured-text">
                            <div className="text-top d-flex justify-content-between ">
                              <div className="proTitle" style={{ height: 80 }}>
                                ZEBRONICS Zeb-Reaper 2.4GHz Wireless Gaming
                                Mouse
                              </div>
                            </div>
                            <div className="proPriRow">
                              <span className="InnPriTag">
                                <span className="proPri">₹1,599.00</span>
                                <span className="ofrProPri">₹1,599.00</span>
                              </span>
                              <span className="ofrTag">-40% off</span>
                            </div>
                            <div className="proStars m-t-5">
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <span className="StarCount">(135)</span>
                            </div>
                            <div className="product-btnGroup">
                              <a
                                href="javascript:void(0)"
                                className="proCartBtnborder"
                              >
                                Add to Cart
                              </a>
                              <a
                                href="javascript:void(0)"
                                className="proCartBtn proBuyBtn"
                              >
                                Buy Now
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-sm-6 col-lg-4 col-xxl-3  customPro-col-product  ">
                        <div className="productCard rounded m-t-30 ">
                          <div className="product-listing_card">
                            <a href="javascript:void(0)" className="likePro">
                              <i className="far fa-heart" />
                            </a>
                            <div className="productImgCard">
                              <img
                                className="img-fluid rounded-top"
                                src="/assets/img/products/black-bag.png"
                                alt="Classified Plus"
                              />
                              <span className="BsponsoredTag">Sponsored</span>
                            </div>
                          </div>
                          <div className="featured-text">
                            <div className="text-top d-flex justify-content-between ">
                              <div className="proTitle" style={{ height: 80 }}>
                                ZEBRONICS Zeb-Reaper 2.4GHz Wireless Gaming
                                Mouse
                              </div>
                            </div>
                            <div className="proPriRow">
                              <span className="InnPriTag">
                                <span className="proPri">₹1,599.00</span>
                                <span className="ofrProPri">₹1,599.00</span>
                              </span>
                              <span className="ofrTag">-40% off</span>
                            </div>
                            <div className="proStars m-t-5">
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <span className="StarCount">(135)</span>
                            </div>
                            <div className="product-btnGroup">
                              <a
                                href="javascript:void(0)"
                                className="proCartBtnborder"
                              >
                                Add to Cart
                              </a>
                              <a
                                href="javascript:void(0)"
                                className="proCartBtn proBuyBtn"
                              >
                                Buy Now
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-sm-6 col-lg-4 col-xxl-3  customPro-col-product  ">
                        <div className="productCard rounded m-t-30 ">
                          <div className="product-listing_card">
                            <a href="javascript:void(0)" className="likePro">
                              <i className="far fa-heart" />
                            </a>
                            <div className="productImgCard">
                              <img
                                className="img-fluid rounded-top"
                                src="/assets/img/products/brown-bag.png"
                                alt="Classified Plus"
                              />
                              <span className="BsponsoredTag">Sponsored</span>
                            </div>
                          </div>
                          <div className="featured-text">
                            <div className="text-top d-flex justify-content-between ">
                              <div className="proTitle" style={{ height: 80 }}>
                                ZEBRONICS Zeb-Reaper 2.4GHz Wireless Gaming
                                Mouse
                              </div>
                            </div>
                            <div className="proPriRow">
                              <span className="InnPriTag">
                                <span className="proPri">₹1,599.00</span>
                                <span className="ofrProPri">₹1,599.00</span>
                              </span>
                              <span className="ofrTag">-40% off</span>
                            </div>
                            <div className="proStars m-t-5">
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <span className="StarCount">(135)</span>
                            </div>
                            <div className="product-btnGroup">
                              <a
                                href="javascript:void(0)"
                                className="proCartBtnborder"
                              >
                                Add to Cart
                              </a>
                              <a
                                href="javascript:void(0)"
                                className="proCartBtn proBuyBtn"
                              >
                                Buy Now
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-sm-6 col-lg-4 col-xxl-3  customPro-col-product  ">
                        <div className="productCard rounded m-t-30 ">
                          <div className="product-listing_card">
                            <a href="javascript:void(0)" className="likePro">
                              <i className="far fa-heart" />
                            </a>
                            <div className="productImgCard">
                              <img
                                className="img-fluid rounded-top"
                                src="/assets/img/products/product-img02.png"
                                alt="Classified Plus"
                              />
                              <span className="BsponsoredTag">Sponsored</span>
                            </div>
                          </div>
                          <div className="featured-text">
                            <div className="text-top d-flex justify-content-between ">
                              <div className="proTitle" style={{ height: 80 }}>
                                ZEBRONICS Zeb-Reaper 2.4GHz Wireless Gaming
                                Mouse
                              </div>
                            </div>
                            <div className="proPriRow">
                              <span className="InnPriTag">
                                <span className="proPri">₹1,599.00</span>
                                <span className="ofrProPri">₹1,599.00</span>
                              </span>
                              <span className="ofrTag">-40% off</span>
                            </div>
                            <div className="proStars m-t-5">
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <span className="StarCount">(135)</span>
                            </div>
                            <div className="product-btnGroup">
                              <a
                                href="javascript:void(0)"
                                className="proCartBtnborder"
                              >
                                Add to Cart
                              </a>
                              <a
                                href="javascript:void(0)"
                                className="proCartBtn proBuyBtn"
                              >
                                Buy Now
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-sm-6 col-lg-4 col-xxl-3  customPro-col-product  ">
                        <div className="productCard rounded m-t-30 ">
                          <div className="product-listing_card">
                            <a href="javascript:void(0)" className="likePro">
                              <i className="far fa-heart" />
                            </a>
                            <div className="productImgCard">
                              <img
                                className="img-fluid rounded-top"
                                src="/assets/img/products/product-img01.png"
                                alt="Classified Plus"
                              />
                              <span className="BSellerTag">Best Seller</span>
                            </div>
                          </div>
                          <div className="featured-text">
                            <div className="text-top d-flex justify-content-between ">
                              <div className="proTitle" style={{ height: 80 }}>
                                ZEBRONICS Zeb-Reaper 2.4GHz Wireless Gaming
                                Mouse
                              </div>
                            </div>
                            <div className="proPriRow">
                              <span className="InnPriTag">
                                <span className="proPri">₹1,599.00</span>
                                <span className="ofrProPri">₹1,599.00</span>
                              </span>
                              <span className="ofrTag">-40% off</span>
                            </div>
                            <div className="proStars m-t-5">
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <span className="StarCount">(135)</span>
                            </div>
                            <div className="product-btnGroup">
                              <a
                                href="javascript:void(0)"
                                className="proCartBtnborder"
                              >
                                Add to Cart
                              </a>
                              <a
                                href="javascript:void(0)"
                                className="proCartBtn proBuyBtn"
                              >
                                Buy Now
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-sm-6 col-lg-4 col-xxl-3  customPro-col-product  ">
                        <div className="productCard rounded m-t-30 ">
                          <div className="product-listing_card">
                            <a href="javascript:void(0)" className="likePro">
                              <i className="far fa-heart" />
                            </a>
                            <div className="productImgCard">
                              <img
                                className="img-fluid rounded-top"
                                src="/assets/img/products/black-bag.png"
                                alt="Classified Plus"
                              />
                              <span className="BSellerTag">Best Seller</span>
                            </div>
                          </div>
                          <div className="featured-text">
                            <div className="text-top d-flex justify-content-between ">
                              <div className="proTitle" style={{ height: 80 }}>
                                ZEBRONICS Zeb-Reaper 2.4GHz Wireless Gaming
                                Mouse
                              </div>
                            </div>
                            <div className="proPriRow">
                              <span className="InnPriTag">
                                <span className="proPri">₹1,599.00</span>
                                <span className="ofrProPri">₹1,599.00</span>
                              </span>
                              <span className="ofrTag">-40% off</span>
                            </div>
                            <div className="proStars m-t-5">
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <span className="StarCount">(135)</span>
                            </div>
                            <div className="product-btnGroup">
                              <a
                                href="javascript:void(0)"
                                className="proCartBtnborder"
                              >
                                Add to Cart
                              </a>
                              <a
                                href="javascript:void(0)"
                                className="proCartBtn proBuyBtn"
                              >
                                Buy Now
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-sm-6 col-lg-4 col-xxl-3  customPro-col-product  ">
                        <div className="productCard rounded m-t-30 ">
                          <div className="product-listing_card">
                            <a href="javascript:void(0)" className="likePro">
                              <i className="far fa-heart" />
                            </a>
                            <div className="productImgCard">
                              <img
                                className="img-fluid rounded-top"
                                src="/assets/img/products/brown-bag.png"
                                alt="Classified Plus"
                              />
                              <span className="BSellerTag">Best Seller</span>
                            </div>
                          </div>
                          <div className="featured-text">
                            <div className="text-top d-flex justify-content-between ">
                              <div className="proTitle" style={{ height: 80 }}>
                                ZEBRONICS Zeb-Reaper 2.4GHz Wireless Gaming
                                Mouse
                              </div>
                            </div>
                            <div className="proPriRow">
                              <span className="InnPriTag">
                                <span className="proPri">₹1,599.00</span>
                                <span className="ofrProPri">₹1,599.00</span>
                              </span>
                              <span className="ofrTag">-40% off</span>
                            </div>
                            <div className="proStars m-t-5">
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <span className="StarCount">(135)</span>
                            </div>
                            <div className="product-btnGroup">
                              <a
                                href="javascript:void(0)"
                                className="proCartBtnborder"
                              >
                                Add to Cart
                              </a>
                              <a
                                href="javascript:void(0)"
                                className="proCartBtn proBuyBtn"
                              >
                                Buy Now
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-sm-6 col-lg-4 col-xxl-3  customPro-col-product  ">
                        <div className="productCard rounded m-t-30 ">
                          <div className="product-listing_card">
                            <a href="javascript:void(0)" className="likePro">
                              <i className="far fa-heart" />
                            </a>
                            <div className="productImgCard">
                              <img
                                className="img-fluid rounded-top"
                                src="/assets/img/products/product-img02.png"
                                alt="Classified Plus"
                              />
                            </div>
                          </div>
                          <div className="featured-text">
                            <div className="text-top d-flex justify-content-between ">
                              <div className="proTitle" style={{ height: 80 }}>
                                ZEBRONICS Zeb-Reaper 2.4GHz Wireless Gaming
                                Mouse
                              </div>
                            </div>
                            <div className="proPriRow">
                              <span className="InnPriTag">
                                <span className="proPri">₹1,599.00</span>
                                <span className="ofrProPri">₹1,599.00</span>
                              </span>
                              <span className="ofrTag">-40% off</span>
                            </div>
                            <div className="proStars m-t-5">
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <svg
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  fill="#FFAE5D"
                                />
                              </svg>
                              <span className="StarCount">(135)</span>
                            </div>
                            <div className="product-btnGroup">
                              <a
                                href="javascript:void(0)"
                                className="proCartBtnborder"
                              >
                                Add to Cart
                              </a>
                              <a
                                href="javascript:void(0)"
                                className="proCartBtn proBuyBtn"
                              >
                                Buy Now
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
    </Layout>
  );
};

export async function getServerSideProps(context) {
  createAxiosCookies(context);

  const {
    products,
    minPrice,
    maxPrice,
    totalProducts,
    currency,
    brands,
    subCategories,
    filters,
  } = await getProducts();

  if (totalProducts === 0) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  return {
    props: {
      protected: null,
      productsArr: products,
      minPrice,
      maxPrice,
      totalProductsCount: totalProducts,
      currency,
      brands,
      subCategories,
      filters,
      locales: {
        ...require(`../locales/index/${context.locale}.json`),
      },
    },
  };
}

export default Products;
