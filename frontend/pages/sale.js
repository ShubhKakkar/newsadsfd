import React, { useState } from 'react';
import Link from "next/link";

import Layout from "@/components/Layout";

const Sale = () => {
  const [showBar, setShowBar] = useState(false);

  const handleButtonClick = () => {
    setShowBar(!showBar);
  };
  const handleClose = () => {
    setShowBar(false);
  };
  return (
    <Layout seoData={{ pageTitle: "Noonmar - Sale" }}>
      <>
        <section className="sale-section-banner">
          <div className="container-fluid">
            <div className="hero_banner_wrapper">
              <div className="swiper saleSectionSlider">
                <div className="swiper-wrapper">
                  <div className="swiper-slide">
                    <img src="/assets/img/sela-img-slide.png" alt="" />
                  </div>
                  <div className="swiper-slide">
                    <img src="/assets/img/hero.png" alt="" />
                  </div>
                  <div className="swiper-slide">
                    <img src="/assets/img/sela-img-slide.png" alt="" />
                  </div>
                  <div className="swiper-slide">
                    <img src="/assets/img/hero.png" alt="" />
                  </div>
                </div>
                <div className="swiper-button-next" />
                <div className="swiper-button-prev" />
              </div>
            </div>
          </div>
        </section>
        <section className="sale-section-wrapper">
          <div className="container">
            <div className="row gx-md-5">
              <div col-md-12="">
                <div className="breadcrumbBlock breadcrumbBlockListing">
                  <nav style={{}} aria-label="breadcrumb">
                    <ol className="breadcrumb">
                      <li className="breadcrumb-item">
                        <Link href="/" legacyBehavior>
                          <a>Home</a>
                        </Link>
                      </li>
                      <li
                        className="breadcrumb-item active"
                        aria-current="page"
                      >
                        Sale
                      </li>
                    </ol>
                  </nav>
                  <div onClick={handleButtonClick} className="sideTabicon">
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
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="col-lg-3">
                <div id="portfolioDisc"  className={showBar ? 'showBar' : ''}>
                  <h2 className="product-section-heading">Filters:</h2>
                  <a
                    href="javascript:void(0)"
                    onclick="closeNav()"
                    className="closebtn"
                    onClick={handleClose}
                  >
                    <i className="fas fa-times" />
                  </a>
                  <div className="stock-checkBox stock-checkBox-spacing">
                    <div className="form-check">
                      <div className="custom_checkbox position-relative check-type2">
                        <input type="checkbox" id="stockCheckDefault" />
                      </div>
                      <label
                        className="form-check-label"
                        htmlFor="stockCheckDefault"
                      >
                        In - stock
                      </label>
                    </div>
                    <div className="form-check">
                      <div className="custom_checkbox position-relative check-type2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          defaultValue=""
                          id="saleCheckDefault"
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
                          Sub- Category
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
                            <div className="form-check">
                              <div className="custom_checkbox position-relative check-type2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  defaultValue=""
                                  id="partyCheckDefault"
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="partyCheckDefault"
                              >
                                Party
                              </label>
                            </div>
                            <div className="form-check">
                              <div className="custom_checkbox position-relative check-type2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  defaultValue=""
                                  id="formalCheckDefault"
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="formalCheckDefault"
                              >
                                Formal
                              </label>
                            </div>
                            <div className="form-check">
                              <div className="custom_checkbox position-relative check-type2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  defaultValue=""
                                  id="casualCheckDefault"
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="casualCheckDefault"
                              >
                                Casual
                              </label>
                            </div>
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
                          Color
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
                            <div className="form-check">
                              <div className="custom_checkbox position-relative check-type2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  defaultValue=""
                                  id="blueCheckDefault"
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="blueCheckDefault"
                              >
                                Blue
                              </label>
                            </div>
                            <div className="form-check">
                              <div className="custom_checkbox position-relative check-type2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  defaultValue=""
                                  id="maroonCheckDefault"
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="maroonCheckDefault"
                              >
                                Maroon Red
                              </label>
                            </div>
                            <div className="form-check">
                              <div className="custom_checkbox position-relative check-type2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  defaultValue=""
                                  id="crimsonCheckDefault"
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="crimsonCheckDefault"
                              >
                                Crimson Red
                              </label>
                            </div>
                            <div className="form-check">
                              <div className="custom_checkbox position-relative check-type2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  defaultValue=""
                                  id="seinnaCheckDefault"
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="seinnaCheckDefault"
                              >
                                Seinna Pink
                              </label>
                            </div>
                            <div className="form-check">
                              <div className="custom_checkbox position-relative check-type2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  defaultValue=""
                                  id="tealCheckDefault"
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="tealCheckDefault"
                              >
                                Teal
                              </label>
                            </div>
                            <div className="form-check">
                              <div className="custom_checkbox position-relative check-type2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  defaultValue=""
                                  id="aquamarineCheckDefault"
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="aquamarineCheckDefault"
                              >
                                Aquamarine
                              </label>
                            </div>
                            <div className="form-check">
                              <div className="custom_checkbox position-relative check-type2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  defaultValue=""
                                  id="whiteCheckDefault"
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="whiteCheckDefault"
                              >
                                Off-White
                              </label>
                            </div>
                            <div className="form-check">
                              <div className="custom_checkbox position-relative check-type2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  defaultValue=""
                                  id="orangeCheckDefault"
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="orangeCheckDefault"
                              >
                                Muave
                              </label>
                            </div>
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
                            <div className="form-check">
                              <div className="custom_checkbox position-relative check-type2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  defaultValue=""
                                  id="partyCheckDefault"
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="partyCheckDefault"
                              >
                                Party
                              </label>
                            </div>
                            <div className="form-check">
                              <div className="custom_checkbox position-relative check-type2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  defaultValue=""
                                  id="formalCheckDefault"
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="formalCheckDefault"
                              >
                                Formal
                              </label>
                            </div>
                            <div className="form-check">
                              <div className="custom_checkbox position-relative check-type2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  defaultValue=""
                                  id="casualCheckDefault"
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="casualCheckDefault"
                              >
                                Casual
                              </label>
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
                                  type="checkbox"
                                  defaultValue=""
                                  id="partyCheckDefault"
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="partyCheckDefault"
                              >
                                Party
                              </label>
                            </div>
                            <div className="form-check">
                              <div className="custom_checkbox position-relative check-type2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  defaultValue=""
                                  id="formalCheckDefault"
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="formalCheckDefault"
                              >
                                Formal
                              </label>
                            </div>
                            <div className="form-check">
                              <div className="custom_checkbox position-relative check-type2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  defaultValue=""
                                  id="casualCheckDefault"
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="casualCheckDefault"
                              >
                                Casual
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
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="partyCheckDefault"
                              >
                                Party
                              </label>
                            </div>
                            <div className="form-check">
                              <div className="custom_checkbox position-relative check-type2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  defaultValue=""
                                  id="formalCheckDefault"
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="formalCheckDefault"
                              >
                                Formal
                              </label>
                            </div>
                            <div className="form-check">
                              <div className="custom_checkbox position-relative check-type2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  defaultValue=""
                                  id="casualCheckDefault"
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="casualCheckDefault"
                              >
                                Casual
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
                                  type="checkbox"
                                  defaultValue=""
                                  id="fiveStarCheckDefault"
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
                                  type="checkbox"
                                  defaultValue=""
                                  id="fourStarCheckDefault"
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
                                  type="checkbox"
                                  defaultValue=""
                                  id="threeStarCheckDefault"
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
                                  type="checkbox"
                                  defaultValue=""
                                  id="twoStarCheckDefault"
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
                  </div>
                </div>
              </div>
              <div className="col-lg-9">
                <div className="everyoneCardBlock">
                  <div className="row g-4">
                    <div className="col-6 col-md-4 col-sm-6 col-lg-4 col-xxl-2 ">
                      <a href="#!" className="saleCardImgTop">
                        <figure className="menCardBlock">
                          <div className="menCardBox">
                            <img src="/assets/img/saleCardTop-1.png" alt="" />
                          </div>
                          <figcaption className="saleCardTop">
                            Men’s Wear
                          </figcaption>
                        </figure>
                      </a>
                    </div>
                    <div className="col-6 col-md-4 col-sm-6 col-lg-4 col-xxl-2 ">
                      <a href="#!" className="saleCardImgTop">
                        <figure className="menCardBlock">
                          <div className="menCardBox">
                            <img src="/assets/img/saleCardTop-2.png" alt="" />
                          </div>
                          <figcaption className="saleCardTop">
                            Electronics
                          </figcaption>
                        </figure>
                      </a>
                    </div>
                    <div className="col-6 col-md-4 col-sm-6 col-lg-4 col-xxl-2 ">
                      <a href="#!" className="saleCardImgTop">
                        <figure className="menCardBlock">
                          <div className="menCardBox">
                            <img src="/assets/img/saleCardTop-3.png" alt="" />
                          </div>
                          <figcaption className="saleCardTop">
                            Menswear
                          </figcaption>
                        </figure>
                      </a>
                    </div>
                    <div className="col-6 col-md-4 col-sm-6 col-lg-4 col-xxl-2 ">
                      <a href="#!" className="saleCardImgTop">
                        <figure className="menCardBlock">
                          <div className="menCardBox">
                            <img src="/assets/img/saleCardTop-4.png" alt="" />
                          </div>
                          <figcaption className="saleCardTop">
                            Home &amp; Kitchen
                          </figcaption>
                        </figure>
                      </a>
                    </div>
                    <div className="col-6 col-md-4 col-sm-6 col-lg-4 col-xxl-2 ">
                      <a href="#!" className="saleCardImgTop">
                        <figure className="menCardBlock">
                          <div className="menCardBox">
                            <img src="/assets/img/saleCardTop-5.png" alt="" />
                          </div>
                          <figcaption className="saleCardTop">
                            Beauty
                          </figcaption>
                        </figure>
                      </a>
                    </div>
                    <div className="col-6 col-md-4 col-sm-6 col-lg-4 col-xxl-2 ">
                      <a href="#!" className="saleCardImgTop">
                        <figure className="menCardBlock">
                          <div className="menCardBox">
                            <img src="/assets/img/saleCardTop-6.png" alt="" />
                          </div>
                          <figcaption className="saleCardTop">
                            Women’s Wear
                          </figcaption>
                        </figure>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="product-listingOrder">
                  <h1 className="sale_product_heading">
                    50% FLAT SALE Products
                  </h1>
                  <div className="row g-4 align-items-center ">
                    <div className="col-md-6 col-sm-6 col-lg-4 col-xxl-3  customPro-col-sale  ">
                      <div className="productCard rounded m-t-30 ">
                        <div className="product-listing_card">
                          <a href="javascript:void(0)" className="likePro">
                            <i className="far fa-heart" />
                          </a>
                          <div className=" SaleImgCard">
                            <img
                              className="img-fluid rounded-top"
                              src="/assets/img/saleProductImg1.png"
                              alt="Classified Plus"
                            />
                            <span className="BSellerTag">Best Seller</span>
                          </div>
                        </div>
                        <div className="featured-text">
                          <div className="text-top d-flex justify-content-between ">
                            <div className="proTitle" style={{ height: 80 }}>
                              ZEBRONICS Zeb-Reaper 2.4GHz Wireless Gaming Mouse
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
                          <div className="product-btnGroup sale-product-btn">
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
                    <div className="col-md-6 col-sm-6 col-lg-4 col-xxl-3  customPro-col-sale  ">
                      <div className="productCard rounded m-t-30 ">
                        <div className="product-listing_card">
                          <a href="javascript:void(0)" className="likePro">
                            <i className="far fa-heart" />
                          </a>
                          <div className=" SaleImgCard">
                            <img
                              className="img-fluid rounded-top"
                              src="/assets/img/saleproductimg-2.png"
                              alt="Classified Plus"
                            />
                            <span className="BsponsoredTag">Sponsored</span>
                          </div>
                        </div>
                        <div className="featured-text">
                          <div className="text-top d-flex justify-content-between ">
                            <div className="proTitle" style={{ height: 80 }}>
                              ZEBRONICS Zeb-Reaper 2.4GHz Wireless Gaming Mouse
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
                          <div className="product-btnGroup sale-product-btn">
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
                    <div className="col-md-6 col-sm-6 col-lg-4 col-xxl-3  customPro-col-sale  ">
                      <div className="productCard rounded m-t-30 ">
                        <div className="product-listing_card">
                          <a href="javascript:void(0)" className="likePro">
                            <i className="far fa-heart" />
                          </a>
                          <div className=" SaleImgCard">
                            <img
                              className="img-fluid rounded-top"
                              src="/assets/img/saleproductimg-3.png"
                              alt="Classified Plus"
                            />
                            <span className="BsponsoredTag">Sponsored</span>
                          </div>
                        </div>
                        <div className="featured-text">
                          <div className="text-top d-flex justify-content-between ">
                            <div className="proTitle" style={{ height: 80 }}>
                              ZEBRONICS Zeb-Reaper 2.4GHz Wireless Gaming Mouse
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
                          <div className="product-btnGroup sale-product-btn">
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
                    <div className="col-md-6 col-sm-6 col-lg-4 col-xxl-3  customPro-col-sale  ">
                      <div className="productCard rounded m-t-30 ">
                        <div className="product-listing_card">
                          <a href="javascript:void(0)" className="likePro">
                            <i className="far fa-heart" />
                          </a>
                          <div className=" SaleImgCard">
                            <img
                              className="img-fluid rounded-top"
                              src="/assets/img/saleproductimg-4.png"
                              alt="Classified Plus"
                            />
                            <span className="BsponsoredTag">Sponsored</span>
                          </div>
                        </div>
                        <div className="featured-text">
                          <div className="text-top d-flex justify-content-between ">
                            <div className="proTitle" style={{ height: 80 }}>
                              ZEBRONICS Zeb-Reaper 2.4GHz Wireless Gaming Mouse
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
                          <div className="product-btnGroup sale-product-btn">
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
                    <div className="col-md-6 col-sm-6 col-lg-4 col-xxl-3  customPro-col-sale  ">
                      <div className="productCard rounded m-t-30 ">
                        <div className="product-listing_card">
                          <a href="javascript:void(0)" className="likePro">
                            <i className="far fa-heart" />
                          </a>
                          <div className=" SaleImgCard">
                            <img
                              className="img-fluid rounded-top"
                              src="/assets/img/saleproductimg-5.png"
                              alt="Classified Plus"
                            />
                            <span className="BsponsoredTag">Sponsored</span>
                          </div>
                        </div>
                        <div className="featured-text">
                          <div className="text-top d-flex justify-content-between ">
                            <div className="proTitle" style={{ height: 80 }}>
                              ZEBRONICS Zeb-Reaper 2.4GHz Wireless Gaming Mouse
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
                          <div className="product-btnGroup sale-product-btn ">
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
                  </div>
                </div>
                <div className="christmas_sale_banner">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <a href="#!" className="ChristmasSaleImg">
                        <img src="/assets/img/sale-off-img-1.png" alt="" />
                      </a>
                    </div>
                    <div className="col-md-6">
                      <a href="#!" className="ChristmasSaleImg">
                        <img src="/assets/img/sale-off-img-2.png" alt="" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="product-listingOrder">
                  <h1 className="sale_product_heading">Top Offers</h1>
                  <div className="row g-4 align-items-center ">
                    <div className="col-md-6 col-sm-6 col-lg-4 col-xxl-3  customPro-col-sale  ">
                      <div className="productCard rounded m-t-30 ">
                        <div className="product-listing_card">
                          <a href="javascript:void(0)" className="likePro">
                            <i className="far fa-heart" />
                          </a>
                          <div className=" SaleImgCard">
                            <img
                              className="img-fluid rounded-top"
                              src="/assets/img/saleProductImg1.png"
                              alt="Classified Plus"
                            />
                            <span className="BSellerTag">Best Seller</span>
                          </div>
                        </div>
                        <div className="featured-text">
                          <div className="text-top d-flex justify-content-between ">
                            <div className="proTitle" style={{ height: 80 }}>
                              ZEBRONICS Zeb-Reaper 2.4GHz Wireless Gaming Mouse
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
                          <div className="product-btnGroup sale-product-btn">
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
                    <div className="col-md-6 col-sm-6 col-lg-4 col-xxl-3  customPro-col-sale  ">
                      <div className="productCard rounded m-t-30 ">
                        <div className="product-listing_card">
                          <a href="javascript:void(0)" className="likePro">
                            <i className="far fa-heart" />
                          </a>
                          <div className=" SaleImgCard">
                            <img
                              className="img-fluid rounded-top"
                              src="/assets/img/saleproductimg-2.png"
                              alt="Classified Plus"
                            />
                            <span className="BsponsoredTag">Sponsored</span>
                          </div>
                        </div>
                        <div className="featured-text">
                          <div className="text-top d-flex justify-content-between ">
                            <div className="proTitle" style={{ height: 80 }}>
                              ZEBRONICS Zeb-Reaper 2.4GHz Wireless Gaming Mouse
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
                          <div className="product-btnGroup sale-product-btn">
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
                    <div className="col-md-6 col-sm-6 col-lg-4 col-xxl-3  customPro-col-sale  ">
                      <div className="productCard rounded m-t-30 ">
                        <div className="product-listing_card">
                          <a href="javascript:void(0)" className="likePro">
                            <i className="far fa-heart" />
                          </a>
                          <div className=" SaleImgCard">
                            <img
                              className="img-fluid rounded-top"
                              src="/assets/img/saleproductimg-3.png"
                              alt="Classified Plus"
                            />
                            <span className="BsponsoredTag">Sponsored</span>
                          </div>
                        </div>
                        <div className="featured-text">
                          <div className="text-top d-flex justify-content-between ">
                            <div className="proTitle" style={{ height: 80 }}>
                              ZEBRONICS Zeb-Reaper 2.4GHz Wireless Gaming Mouse
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
                          <div className="product-btnGroup sale-product-btn">
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
                    <div className="col-md-6 col-sm-6 col-lg-4 col-xxl-3  customPro-col-sale  ">
                      <div className="productCard rounded m-t-30 ">
                        <div className="product-listing_card">
                          <a href="javascript:void(0)" className="likePro">
                            <i className="far fa-heart" />
                          </a>
                          <div className=" SaleImgCard">
                            <img
                              className="img-fluid rounded-top"
                              src="/assets/img/saleproductimg-4.png"
                              alt="Classified Plus"
                            />
                            <span className="BsponsoredTag">Sponsored</span>
                          </div>
                        </div>
                        <div className="featured-text">
                          <div className="text-top d-flex justify-content-between ">
                            <div className="proTitle" style={{ height: 80 }}>
                              ZEBRONICS Zeb-Reaper 2.4GHz Wireless Gaming Mouse
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
                          <div className="product-btnGroup sale-product-btn">
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
                    <div className="col-md-6 col-sm-6 col-lg-4 col-xxl-3  customPro-col-sale  ">
                      <div className="productCard rounded m-t-30 ">
                        <div className="product-listing_card">
                          <a href="javascript:void(0)" className="likePro">
                            <i className="far fa-heart" />
                          </a>
                          <div className=" SaleImgCard">
                            <img
                              className="img-fluid rounded-top"
                              src="/assets/img/saleproductimg-5.png"
                              alt="Classified Plus"
                            />
                            <span className="BsponsoredTag">Sponsored</span>
                          </div>
                        </div>
                        <div className="featured-text">
                          <div className="text-top d-flex justify-content-between ">
                            <div className="proTitle" style={{ height: 80 }}>
                              ZEBRONICS Zeb-Reaper 2.4GHz Wireless Gaming Mouse
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
                          <div className="product-btnGroup sale-product-btn ">
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
                  </div>
                </div>
                <div className="christmas_sale_banner">
                  <div className="row">
                    <div className="col-md-12">
                      <a href="#!" className="ChristmasSaleImg">
                        <img
                          src="/assets/img/sale-new-year-banner.png"
                          alt=""
                        />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    </Layout>
  );
};

export async function getServerSideProps(context) {
  return {
    props: {
      protected: null,
      locales: {
        ...require(`../locales/index/${context.locale}.json`),
      },
    },
  };
}

export default Sale;
