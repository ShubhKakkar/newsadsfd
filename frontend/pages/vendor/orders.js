import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import moment from "moment";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useDropzone } from "react-dropzone";
import { useTranslations } from "next-intl";
import { Button, Modal } from "react-bootstrap";
import Select from "react-select";
import { useRouter } from "next/router";

import Layout from "@/components/Vendor/Layout";
import { createAxiosCookies } from "@/fn";
import useRequest from "@/hooks/useRequest";
import { getProfileData } from "@/services/vendor";
import { MEDIA_URL } from "@/api";
import { authSuccess } from "@/store/auth/action";
import { getCountries } from "@/services/countries";
import { getCurrencies } from "@/services/currencies";

const imgArray = ["image/png", "image/jpeg", "image/jpg"];

const langObj = {
  en: "English",
  tr: "Turkish",
  ar: "Arabic",
};

const Orders = ({ vendor, countries, currencies }) => {
  const t = useTranslations("Index");

  return (
    <Layout seoData={{ pageTitle: "My Profile - Noonmar" }}>
      <div className="main_content">
        <div className="col-12">
          <div className="headpageTitle mobile-title-show">
            {t("My Profile")}
          </div>
        </div>
        {/* <div class="detail_listing_section">
                <div class="row">
                  <div class="col-lg-12 col-xl-12 col-xxl-8 ">
                      <div class="OrderNumberDetail">
                          <div class="orderNumberli">Order Number <span>#743648 </span></div>
                          <div class="orderDateli">Order Date <span>12 Sept 2022 - 12:55 pm </span></div>
                          <div class="orderIdli">Tracking ID <span>9348fjr73 <i class="far fa-copy"></i></span></div>
                      </div>
                  </div>
                  <div class="col-lg-12 col-xl-12 col-xxl-4">
                      <div class="markDropBtn">
                          <div class="btn-group">
                          <button type="button" class="btn btn-success MarkAsComplete">Mark as Complete</button>
                          <button type="button" class="btn btn-success dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">

                          </button>
                          <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#">Action</a></li>
                            <li><a class="dropdown-item" href="#">Another action</a></li>
                            <li><a class="dropdown-item" href="#">Something else here</a></li>
                          </ul>
                        </div>
                        <div class="cancelBtn">Cancel Order</div>
                      </div>
                  </div>
                </div>
              </div> */}
        <div className="offre_listing_section listingCategoryInput ">
          <div className="showing_order">
            <div className="list-grid-toggle">
              <i className="[ icon icon--grid ] fa fa-th active" />
              <i className="[ icon icon--list ] fa fa-list" />
            </div>
            <h5 className="showingTitle">Showing 1 - 40 of 145 Orders</h5>
          </div>
          <div className="order_listing_block">
            <div className="row">
              <div className="col-lg-6 col-xl-3">
                <div className="form-group">
                  <div className="listingSearchblock">
                    <input
                      type="search"
                      className="form-control orderSearchInput"
                      placeholder=""
                      defaultValue="Tshirts"
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
              <div className="col-lg-6 col-xl-3 col-6">
                <div className="form-group">
                  <select
                    className="form-select form-control dark-form-control"
                    aria-label="Default select "
                  >
                    <option selected="">Product in stock</option>
                    <option value={1}>One</option>
                    <option value={2}>Two</option>
                    <option value={3}>Three</option>
                  </select>
                </div>
              </div>
              <div className="col-lg-6 col-xl-3 col-6">
                <div className="form-group">
                  <select
                    className="form-select form-control dark-form-control"
                    aria-label="Default select "
                  >
                    <option selected="">Filter by Warehouse</option>
                    <option value={1}>One</option>
                    <option value={2}>Two</option>
                    <option value={3}>Three</option>
                  </select>
                </div>
              </div>
              <div className="col-lg-6 col-xl-3">
                <div className="form-group">
                  <select
                    className="form-select form-control dark-form-control"
                    aria-label="Default select "
                  >
                    <option selected="">Price more than 4000</option>
                    <option value={1}>One</option>
                    <option value={2}>Two</option>
                    <option value={3}>Three</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* listing tabel */}
        <div className="OfferDetailsBlock products">
          <div className="table-responsive">
            <table className="table align-middle table-borderless table-border-spacing">
              <thead>
                <tr>
                  <th className="check-col" scope="col">
                    <div className="custom_checkbox position-relative d-flex check-type2">
                      <input type="checkbox" id="check1" defaultChecked="" />
                    </div>
                  </th>
                  <th scope="col">Offer Details</th>
                  <th scope="col">Order number</th>
                  <th scope="col" className="text-center">
                    Date
                  </th>
                  <th scope="col" className="text-center">
                    Price
                  </th>
                  <th scope="col" className="text-center">
                    Seller Name
                  </th>
                  <th scope="col" className="text-center">
                    Payment Method
                  </th>
                  <th scope="col" className="text-center">
                    Order Status
                  </th>
                  <th scope="col" className="text-center" />
                </tr>
              </thead>
              <tbody>
                <tr className="shadow-effect">
                  <td className="select-row">
                    <div className="custom_checkbox position-relative check-type2">
                      <input type="checkbox" id="check1" />
                    </div>
                  </td>
                  <td className="offer-dtl-col" data-name="Offer Details">
                    <div className="PlatformMarketplace">
                      <div className="blackFridayImg">
                        <img src="img/order-listing-Img-1.jpg" alt="" />
                      </div>
                      <div className="blackFridaySale">
                        <h3 className="fridaySaleTitle">
                          Zipper Jacket - Brown
                        </h3>
                        <p className="platformdes">
                          Brand Name: <span>Tori </span>
                        </p>
                        <div className="minQtyDes">
                          <span>3 QTY </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td data-name="Category">#874522648</td>
                  <td className="text-center" data-name="Starting Date">
                    30th Jan 2023
                  </td>
                  <td className="text-center" data-name="End Date">
                    $4,500 USD
                  </td>
                  <td className="text-center" data-name="Discount">
                    Electromaxx
                  </td>
                  <td className="text-center" data-name="Discount">
                    Credit Card
                  </td>
                  <td className="text-center" data-name="Redemption">
                    <div className="product_status_type bg-success text-success">
                      <span>Completed</span>
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
                  <td className="offer-dtl-col" data-name="Offer Details">
                    <div className="PlatformMarketplace">
                      <div className="blackFridayImg">
                        <img src="img/order-listing-Img-2.jpg" alt="" />
                      </div>
                      <div className="blackFridaySale">
                        <h3 className="fridaySaleTitle">
                          Zipper Jacket - Brown
                        </h3>
                        <p className="platformdes">
                          Brand Name: <span>Tori </span>
                        </p>
                        <div className="minQtyDes">
                          <span>3 QTY </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td data-name="Category">#874522648</td>
                  <td className="text-center" data-name="Starting Date">
                    30th Jan 2023
                  </td>
                  <td className="text-center" data-name="End Date">
                    $4,500 USD
                  </td>
                  <td className="text-center" data-name="Discount">
                    Electromaxx
                  </td>
                  <td className="text-center" data-name="Discount">
                    Credit Card
                  </td>
                  <td className="text-center" data-name="Redemption">
                    <div className="product_status_type bg-danger text-danger">
                      <span>Cancelled</span>
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
                  <td className="offer-dtl-col" data-name="Offer Details">
                    <div className="PlatformMarketplace">
                      <div className="blackFridayImg">
                        <img src="img/order-listing-Img-3.jpg" alt="" />
                      </div>
                      <div className="blackFridaySale">
                        <h3 className="fridaySaleTitle">
                          Zipper Jacket - Brown
                        </h3>
                        <p className="platformdes">
                          Brand Name: <span>Tori </span>
                        </p>
                        <span className="minQtyDes">3 QTY</span>
                      </div>
                    </div>
                  </td>
                  <td data-name="Category">#874522648</td>
                  <td className="text-center" data-name="Starting Date">
                    30th Jan 2023
                  </td>
                  <td className="text-center" data-name="End Date">
                    $4,500 USD
                  </td>
                  <td className="text-center" data-name="Discount">
                    Electromaxx
                  </td>
                  <td className="text-center" data-name="Discount">
                    Credit Card
                  </td>
                  <td className="text-center" data-name="Redemption">
                    <div className="product_status_type bg-primary text-primary">
                      <span>In Progress</span>
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
                  <td className="offer-dtl-col" data-name="Offer Details">
                    <div className="PlatformMarketplace">
                      <div className="blackFridayImg">
                        <img src="img/order-listing-Img-4.jpg" alt="" />
                      </div>
                      <div className="blackFridaySale">
                        <h3 className="fridaySaleTitle">
                          Zipper Jacket - Brown
                        </h3>
                        <p className="platformdes">
                          Brand Name: <span>Tori </span>
                        </p>
                        <div className="minQtyDes">
                          <span>3 QTY </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td data-name="Category">#874522648</td>
                  <td className="text-center" data-name="Starting Date">
                    30th Jan 2023
                  </td>
                  <td className="text-center" data-name="End Date">
                    $4,500 USD
                  </td>
                  <td className="text-center" data-name="Discount">
                    Electromaxx
                  </td>
                  <td className="text-center" data-name="Discount">
                    Credit Card
                  </td>
                  <td className="text-center" data-name="Redemption">
                    <div className="product_status_type bg-success text-success">
                      <span>Completed</span>
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
                  <td className="offer-dtl-col" data-name="Offer Details">
                    <div className="PlatformMarketplace">
                      <div className="blackFridayImg">
                        <img src="img/order-listing-Img-5.jpg" alt="" />
                      </div>
                      <div className="blackFridaySale">
                        <h3 className="fridaySaleTitle">
                          Zipper Jacket - Brown
                        </h3>
                        <p className="platformdes">
                          Brand Name: <span>Tori </span>
                        </p>
                        <div className="minQtyDes">
                          <span>3 QTY </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td data-name="Category">#874522648</td>
                  <td className="text-center" data-name="Starting Date">
                    30th Jan 2023
                  </td>
                  <td className="text-center" data-name="End Date">
                    $4,500 USD
                  </td>
                  <td className="text-center" data-name="Discount">
                    Electromaxx
                  </td>
                  <td className="text-center" data-name="Discount">
                    Credit Card
                  </td>
                  <td className="text-center" data-name="Redemption">
                    <div className="product_status_type bg-success text-success">
                      <span>Completed</span>
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
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export async function getServerSideProps(context) {
  await createAxiosCookies(context);
  // const vendor = await getProfileData();
  // const countries = await getCountries();
  // const currencies = await getCurrencies();

  const [vendor, countries, currencies] = await Promise.all([
    getProfileData(),
    getCountries(),
    getCurrencies(),
  ]);

  return {
    props: {
      protected: true,
      userTypes: ["vendor"],
      vendor,
      countries,
      currencies,
      locales: {
        ...require(`../../locales/index/${context.locale}.json`),
      },
    },
  };
}

export default Orders;
