// import React from "react";
import Link from "next/link";
import React, { useState } from 'react';

import Layout from "@/components/Layout";

const GiftCards = () => {
  const [showBar, setShowBar] = useState(false);

  const handleButtonClick = () => {
    setShowBar(!showBar);
  };
  const handleClose = () => {
    setShowBar(false);
  };

  return (
    <Layout seoData={{ pageTitle: "Noonmar - Gift Cards" }}>
      <>
        <section className="lightBg">
          <div className="container">
            <div className="offerRow">
              <div className="offerText">
                <h2 className="offerCardTitle">
                  <span>Shop Gift Cards</span> for your loved ones
                </h2>
              </div>
              <div className="offerCardBanner">
                <img src="/assets/img/offer-banner.png" alt="" />
              </div>
            </div>
          </div>
        </section>
        <section className="sale-section-wrapper">
          <div className="container">
            <div className="row gx-md-5">
              <div className="col-md-12">
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
                        Gift cards
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
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="col-lg-3">
                <div  className={showBar ? 'showBar' : ''} id="portfolioDisc">
                  <h2 className="product-section-heading">Filter by</h2>
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
                <div className="ShopGiftCardBlock">
                  <h3 className="GiftShopTitle mt-0">
                    Shop Gift cards by Amount
                  </h3>
                  <div className="cardAmountBlocks">
                    <div className="cardAmountBox">
                      <span className="CardAmountBtn">$100</span>
                      <span className="CardAmountBtn">$250</span>
                      <span className="CardAmountBtn">$500</span>
                      <span className="CardAmountBtn">$1000</span>
                    </div>
                    <div className="cardProceedBox">
                      <div className="saleCardInput">
                        <input
                          type="text"
                          className="form-control"
                          id="inputPassword2"
                          placeholder="Add Custom Price"
                        />
                      </div>
                      <div className="saleCardButton">
                        <button type="submit" className="btn btn-primary mb-3">
                          Proceed
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="Shop_Gift_Cards1">
                  <h3 className="GiftShopTitle">Featured Gift cards</h3>
                  <div className="row g-4">
                    <div className="col-md-6 col-xl-4">
                      <a
                        href="javascript:void(0)"
                        data-bs-toggle="modal"
                        data-bs-target="#exampleModal"
                      >
                        <div className="Featured-Gift-box">
                          <img
                            src="/assets/img/Featured-Gift-img-1.png"
                            alt=""
                          />
                        </div>
                      </a>
                    </div>
                    <div className="col-md-6 col-xl-4">
                      <a
                        href="javascript:void(0)"
                        data-bs-toggle="modal"
                        data-bs-target="#exampleModal"
                      >
                        <div className="Featured-Gift-box">
                          <img
                            src="/assets/img/Featured-Gift-img-2.png"
                            alt=""
                          />
                        </div>
                      </a>
                    </div>
                    <div className="col-md-6 col-xl-4">
                      <a
                        href="javascript:void(0)"
                        data-bs-toggle="modal"
                        data-bs-target="#exampleModal"
                      >
                        <div className="Featured-Gift-box">
                          <img
                            src="/assets/img/Featured-Gift-img-3.png"
                            alt=""
                          />
                        </div>
                      </a>
                    </div>
                  </div>
                  {/* Gift Cart Popup */}
                  <div className="Gift-card-popup">
                    <div
                      className="modal fade all_reviews_modal"
                      id="exampleModal"
                      tabIndex={-1}
                      aria-labelledby="exampleModalLabel"
                      aria-hidden="true"
                    >
                      <div className="modal-dialog modal-xl">
                        <div className="modal-content Gift-card-block">
                          <img src="/assets/img/gift_popup_img.jpg" alt="" />
                          <div className="modal-header GiftCardDetailsBox">
                            <h5
                              className="modal-title GiftCardDetails"
                              id="exampleModal"
                            >
                              Enter your Gift Card Details
                            </h5>
                            <a href="#!" className="GiftCardEmail">
                              Email
                            </a>
                            {/* <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button> */}
                          </div>
                          <div className="modal-body GiftCartInputBox">
                            <div className="modal_inner_wrapper">
                              <div className="reviewsRow">
                                <div className="row gx-5 gy-2">
                                  <div className="col-md-12 col-lg-6">
                                    <div className="form-group">
                                      <input
                                        type="text"
                                        name="to"
                                        placeholder="To "
                                        className="form-control dark-form-control"
                                        defaultValue=""
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-12 col-lg-6">
                                    <div className="form-group">
                                      <input
                                        type="text"
                                        name="form"
                                        placeholder="From "
                                        className="form-control dark-form-control"
                                        defaultValue=""
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-12 col-lg-6">
                                    <div className="form-group">
                                      <input
                                        type="email"
                                        name="email"
                                        placeholder="Johndoe@johndoe.com"
                                        className="form-control dark-form-control"
                                        defaultValue=""
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-12 col-lg-6">
                                    <div className="form-group">
                                      <select
                                        className="form-select form-control dark-form-control"
                                        aria-label="Default select example"
                                      >
                                        <option selected="">Quantity</option>
                                        <option value={1}>One</option>
                                        <option value={2}>Two</option>
                                        <option value={3}>Three</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-12 col-lg-6">
                                    <div className="form-group">
                                      <input
                                        type="text"
                                        name="form"
                                        placeholder="12/12/2022 "
                                        className="form-control dark-form-control"
                                        defaultValue=""
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <textarea
                                      name=""
                                      id=""
                                      cols={30}
                                      rows={3}
                                      placeholder="Write Message"
                                      className="form-control dark-form-control"
                                      defaultValue={""}
                                    />
                                  </div>
                                </div>
                                <div className="popup_button_Box">
                                  <button
                                    type="submit"
                                    className="noonmar_popup_btn"
                                  >
                                    Add To Cart
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="button" class="btn btn-primary">Understood</button>
                              </div> */}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/*  */}
                </div>
                <div className="Shop_Gift_Cards2">
                  <h3 className="GiftShopTitle">Popular Gift Cards</h3>
                  <div className="row g-4">
                    <div className="col-md-6 col-xl-4">
                      <div className="Featured-Gift-box">
                        <img src="/assets/img/Featured-Gift-img-4.png" alt="" />
                      </div>
                    </div>
                    <div className="col-md-6 col-xl-4">
                      <div className="Featured-Gift-box">
                        <img src="/assets/img/Featured-Gift-img-5.png" alt="" />
                      </div>
                    </div>
                    <div className="col-md-6 col-xl-4">
                      <div className="Featured-Gift-box">
                        <img src="/assets/img/Featured-Gift-img-6.png" alt="" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="Gift_Categories_block">
                  <h3 className="GiftShopTitle">
                    Gift cards by GiftCards Categories
                  </h3>
                  <div className="row g-4">
                    <div className="Gift_Categories_box">
                      <a
                        href="javascript:void(0)"
                        className="Gift_Categories_img"
                      >
                        <img
                          src="/assets/img/Gift-Categories-img-1.png"
                          alt=""
                        />
                        <div className="Gift_Categorise_title">
                          <span>Clothing</span>
                        </div>
                      </a>
                    </div>
                    <div className="Gift_Categories_box">
                      <a
                        href="javascript:void(0)"
                        className="Gift_Categories_img"
                      >
                        <img
                          src="/assets/img/Gift-Categories-img-2.png"
                          alt=""
                        />
                        <div className="Gift_Categorise_title">
                          <span>Home &amp; kItchen</span>
                        </div>
                      </a>
                    </div>
                    <div className="Gift_Categories_box">
                      <a
                        href="javascript:void(0)"
                        className="Gift_Categories_img"
                      >
                        <img
                          src="/assets/img/Gift-Categories-img-3.png"
                          alt=""
                        />
                        <div className="Gift_Categorise_title">
                          <span>Laptops</span>
                        </div>
                      </a>
                    </div>
                    <div className="Gift_Categories_box">
                      <a
                        href="javascript:void(0)"
                        className="Gift_Categories_img"
                      >
                        <img
                          src="/assets/img/Gift-Categories-img-4.png"
                          alt=""
                        />
                        <div className="Gift_Categorise_title">
                          <span>Skincare</span>
                        </div>
                      </a>
                    </div>
                    <div className="Gift_Categories_box">
                      <a
                        href="javascript:void(0)"
                        className="Gift_Categories_img"
                      >
                        <img
                          src="/assets/img/Gift-Categories-img-5.png"
                          alt=""
                        />
                        <div className="Gift_Categorise_title">
                          <span>Accesories</span>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="Shop_Gift_Cards1">
                  <h3 className="GiftShopTitle">Season Greetings</h3>
                  <div className="row g-4">
                    <div className="col-md-6 col-xl-4">
                      <div className="Featured-Gift-box">
                        <img src="/assets/img/Featured-Gift-img-7.png" alt="" />
                      </div>
                    </div>
                    <div className="col-md-6 col-xl-4">
                      <div className="Featured-Gift-box">
                        <img src="/assets/img/Featured-Gift-img-8.png" alt="" />
                      </div>
                    </div>
                    <div className="col-md-6 col-xl-4">
                      <div className="Featured-Gift-box">
                        <img src="/assets/img/Featured-Gift-img-9.png" alt="" />
                      </div>
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

export default GiftCards;
