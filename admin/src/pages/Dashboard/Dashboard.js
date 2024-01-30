import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Chart from "../../components/Chart/Chart";
import useRequest from "../../hooks/useRequest";

const Dashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);

  const [vendors, setVendors] = useState([]);
  const [totalVendor, setTotalVendors] = useState(0);

  const [products, setProducts] = useState([]);
  const [totalProduct, setTotalProducts] = useState(0);

  const { request, response } = useRequest();

  useEffect(() => {
    request("GET", "customer/latest");
    document.title = "Dashboard - Noonmar";
  }, []);

  useEffect(() => {
    if (response) {
      const {
        customers,
        vendors,
        products,
        totalCustomers,
        totalVendors,
        totalProducts,
      } = response;
      setCustomers(customers);
      setTotalCustomers(totalCustomers);
      setVendors(vendors);
      setTotalVendors(totalVendors);
      setTotalProducts(totalProducts);
      setProducts(products);
    }
  }, [response]);

  return (
    <>
      <div
        className="content  d-flex flex-column flex-column-fluid"
        id="kt_content"
      >
        <div
          className="subheader py-2 py-lg-4  subheader-solid "
          id="kt_subheader"
        >
          <div className=" container-fluid  d-flex align-items-center justify-content-between flex-wrap flex-sm-nowrap">
            <div className="d-flex align-items-center flex-wrap mr-1">
              <div className="d-flex align-items-baseline flex-wrap mr-5">
                <h5 className="text-dark font-weight-bold my-1 mr-5">
                  Dashboard{" "}
                </h5>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex flex-column-fluid">
          <div className=" container ">
            <div className="row">
              <div className="col-xl-4">
                <Link
                  to={"/customers"}
                  className="card card-custom bg-danger bg-hover-state-danger card-stretch gutter-b"
                >
                  <div className="card-body">
                    <span className="svg-icon svg-icon-white svg-icon-3x ml-n1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
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
                          <polygon points="0 0 24 0 24 24 0 24" />
                          <path
                            d="M12,11 C9.790861,11 8,9.209139 8,7 C8,4.790861 9.790861,3 12,3 C14.209139,3 16,4.790861 16,7 C16,9.209139 14.209139,11 12,11 Z"
                            fill="#000000"
                            fillRule="nonzero"
                            opacity="0.3"
                          />
                          <path
                            d="M3.00065168,20.1992055 C3.38825852,15.4265159 7.26191235,13 11.9833413,13 C16.7712164,13 20.7048837,15.2931929 20.9979143,20.2 C21.0095879,20.3954741 20.9979143,21 20.2466999,21 C16.541124,21 11.0347247,21 3.72750223,21 C3.47671215,21 2.97953825,20.45918 3.00065168,20.1992055 Z"
                            fill="#000000"
                            fillRule="nonzero"
                          />
                        </g>
                      </svg>
                    </span>

                    <div className="text-inverse-danger font-weight-bolder font-size-h3 mb-2 mt-5">
                      {totalCustomers}
                    </div>
                    <div className="font-weight-bold text-inverse-danger font-size-sm">
                      Customers
                    </div>
                  </div>
                </Link>
              </div>
              <div className="col-xl-4">
                <Link
                  to={"/vendors"}
                  className="card card-custom bg-primary bg-hover-state-primary card-stretch gutter-b"
                >
                  <div className="card-body">
                    <span className="svg-icon svg-icon-white svg-icon-3x ml-n1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
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
                          <polygon points="0 0 24 0 24 24 0 24" />
                          <path
                            d="M18,14 C16.3431458,14 15,12.6568542 15,11 C15,9.34314575 16.3431458,8 18,8 C19.6568542,8 21,9.34314575 21,11 C21,12.6568542 19.6568542,14 18,14 Z M9,11 C6.790861,11 5,9.209139 5,7 C5,4.790861 6.790861,3 9,3 C11.209139,3 13,4.790861 13,7 C13,9.209139 11.209139,11 9,11 Z"
                            fill="#000000"
                            fillRule="nonzero"
                            opacity="0.3"
                          />
                          <path
                            d="M17.6011961,15.0006174 C21.0077043,15.0378534 23.7891749,16.7601418 23.9984937,20.4 C24.0069246,20.5466056 23.9984937,21 23.4559499,21 L19.6,21 C19.6,18.7490654 18.8562935,16.6718327 17.6011961,15.0006174 Z M0.00065168429,20.1992055 C0.388258525,15.4265159 4.26191235,13 8.98334134,13 C13.7712164,13 17.7048837,15.2931929 17.9979143,20.2 C18.0095879,20.3954741 17.9979143,21 17.2466999,21 C13.541124,21 8.03472472,21 0.727502227,21 C0.476712155,21 -0.0204617505,20.45918 0.00065168429,20.1992055 Z"
                            fill="#000000"
                            fillRule="nonzero"
                          />
                        </g>
                      </svg>
                    </span>
                    {/* <span className="symbol symbol-light-success symbol-45 statsCount">
                      <span className="symbol-label font-weight-bolder font-size-h6">
                        +0
                      </span>
                    </span> */}
                    <div className="text-inverse-danger font-weight-bolder font-size-h3 mb-2 mt-5">
                      {totalVendor}
                    </div>
                    <div className="font-weight-bold text-inverse-primary font-size-sm">
                      Total Vendors
                    </div>
                  </div>
                </Link>
              </div>
              <div className="col-xl-4">
                <Link
                  to={"/products"}
                  className="card card-custom bg-success bg-hover-state-success card-stretch gutter-b"
                >
                  <div className="card-body">
                    <span className="svg-icon svg-icon-white svg-icon-3x ml-n1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
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
                          <rect x="0" y="0" width="24" height="24" />
                          <path
                            d="M4,9.67471899 L10.880262,13.6470401 C10.9543486,13.689814 11.0320333,13.7207107 11.1111111,13.740321 L11.1111111,21.4444444 L4.49070127,17.526473 C4.18655139,17.3464765 4,17.0193034 4,16.6658832 L4,9.67471899 Z M20,9.56911707 L20,16.6658832 C20,17.0193034 19.8134486,17.3464765 19.5092987,17.526473 L12.8888889,21.4444444 L12.8888889,13.6728275 C12.9050191,13.6647696 12.9210067,13.6561758 12.9368301,13.6470401 L20,9.56911707 Z"
                            fill="#000000"
                          />
                          <path
                            d="M4.21611835,7.74669402 C4.30015839,7.64056877 4.40623188,7.55087574 4.5299008,7.48500698 L11.5299008,3.75665466 C11.8237589,3.60013944 12.1762411,3.60013944 12.4700992,3.75665466 L19.4700992,7.48500698 C19.5654307,7.53578262 19.6503066,7.60071528 19.7226939,7.67641889 L12.0479413,12.1074394 C11.9974761,12.1365754 11.9509488,12.1699127 11.9085461,12.2067543 C11.8661433,12.1699127 11.819616,12.1365754 11.7691509,12.1074394 L4.21611835,7.74669402 Z"
                            fill="#000000"
                            opacity="0.3"
                          />
                        </g>
                      </svg>
                    </span>
                    {/* <span className="symbol symbol-light-success symbol-45 statsCount">
                      <span className="symbol-label font-weight-bolder font-size-h6">
                        +0
                      </span>
                    </span> */}
                    <div className="text-inverse-danger font-weight-bolder font-size-h3 mb-2 mt-5">
                      {totalProduct}
                    </div>
                    <div className="font-weight-bold text-inverse-success font-size-sm">
                      Total Products
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* <div className="row">
              <div className="col-xl-4">
                <a href="#!" className="card card-custom card-stretch gutter-b">
                  <div className="card-body">
                    <span className="svg-icon svg-icon-info svg-icon-3x ml-n1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
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
                          <rect x="0" y="0" width="24" height="24"></rect>
                          <path
                            d="M12,4.56204994 L7.76822128,9.6401844 C7.4146572,10.0644613 6.7840925,10.1217854 6.3598156,9.76822128 C5.9355387,9.4146572 5.87821464,8.7840925 6.23177872,8.3598156 L11.2317787,2.3598156 C11.6315738,1.88006147 12.3684262,1.88006147 12.7682213,2.3598156 L17.7682213,8.3598156 C18.1217854,8.7840925 18.0644613,9.4146572 17.6401844,9.76822128 C17.2159075,10.1217854 16.5853428,10.0644613 16.2317787,9.6401844 L12,4.56204994 Z"
                            fill="#000000"
                            fillRule="nonzero"
                            opacity="0.3"
                          ></path>
                          <path
                            d="M3.5,9 L20.5,9 C21.0522847,9 21.5,9.44771525 21.5,10 C21.5,10.132026 21.4738562,10.2627452 21.4230769,10.3846154 L17.7692308,19.1538462 C17.3034221,20.271787 16.2111026,21 15,21 L9,21 C7.78889745,21 6.6965779,20.271787 6.23076923,19.1538462 L2.57692308,10.3846154 C2.36450587,9.87481408 2.60558331,9.28934029 3.11538462,9.07692308 C3.23725479,9.02614384 3.36797398,9 3.5,9 Z M12,17 C13.1045695,17 14,16.1045695 14,15 C14,13.8954305 13.1045695,13 12,13 C10.8954305,13 10,13.8954305 10,15 C10,16.1045695 10.8954305,17 12,17 Z"
                            fill="#000000"
                          ></path>
                        </g>
                      </svg>
                    </span>
                    <span className="symbol symbol-light-success symbol-45 statsCount">
                      <span className="symbol-label font-weight-bolder font-size-h6">
                        +98
                      </span>
                    </span>
                    <div className="text-inverse-white font-weight-bolder font-size-h3 mb-2 mt-5">
                      35900
                    </div>
                    <div className="font-weight-bold text-inverse-white font-size-sm">
                      Total Shoppers
                    </div>
                  </div>
                </a>
              </div>
              <div className="col-xl-4">
                <a
                  href="#!"
                  className="card card-custom bg-info bg-hover-state-info card-stretch card-stretch gutter-b"
                >
                  <div className="card-body">
                    <span className="svg-icon svg-icon-white svg-icon-3x ml-n1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
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
                          <rect x="0" y="0" width="24" height="24" />
                          <path
                            d="M3.5,3 L5,3 L5,19.5 C5,20.3284271 4.32842712,21 3.5,21 L3.5,21 C2.67157288,21 2,20.3284271 2,19.5 L2,4.5 C2,3.67157288 2.67157288,3 3.5,3 Z"
                            fill="#000000"
                          />
                          <path
                            d="M6.99987583,2.99995344 L19.754647,2.99999303 C20.3069317,2.99999474 20.7546456,3.44771138 20.7546439,3.99999613 C20.7546431,4.24703684 20.6631995,4.48533385 20.497938,4.66895776 L17.5,8 L20.4979317,11.3310353 C20.8673908,11.7415453 20.8341123,12.3738351 20.4236023,12.7432941 C20.2399776,12.9085564 20.0016794,13 19.7546376,13 L6.99987583,13 L6.99987583,2.99995344 Z"
                            fill="#000000"
                            opacity="0.3"
                          />
                        </g>
                      </svg>
                    </span>
                    <span className="symbol symbol-light-success symbol-45 statsCount">
                      <span className="symbol-label font-weight-bolder font-size-h6">
                        +21
                      </span>
                    </span>
                    <div className="text-inverse-danger font-weight-bolder font-size-h3 mb-2 mt-5">
                      3800
                    </div>
                    <div className="font-weight-bold text-inverse-info font-size-sm">
                      Total Brands
                    </div>
                  </div>
                </a>
              </div>
              <div className="col-xl-4">
                <a
                  href="#!"
                  className="card card-custom bg-dark bg-hover-state-dark card-stretch gutter-b"
                >
                  <div className="card-body">
                    <span className="svg-icon svg-icon-white svg-icon-3x ml-n1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
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
                          <rect x="0" y="0" width="24" height="24" />
                          <path
                            d="M4,9.67471899 L10.880262,13.6470401 C10.9543486,13.689814 11.0320333,13.7207107 11.1111111,13.740321 L11.1111111,21.4444444 L4.49070127,17.526473 C4.18655139,17.3464765 4,17.0193034 4,16.6658832 L4,9.67471899 Z M20,9.56911707 L20,16.6658832 C20,17.0193034 19.8134486,17.3464765 19.5092987,17.526473 L12.8888889,21.4444444 L12.8888889,13.6728275 C12.9050191,13.6647696 12.9210067,13.6561758 12.9368301,13.6470401 L20,9.56911707 Z"
                            fill="#000000"
                          />
                          <path
                            d="M4.21611835,7.74669402 C4.30015839,7.64056877 4.40623188,7.55087574 4.5299008,7.48500698 L11.5299008,3.75665466 C11.8237589,3.60013944 12.1762411,3.60013944 12.4700992,3.75665466 L19.4700992,7.48500698 C19.5654307,7.53578262 19.6503066,7.60071528 19.7226939,7.67641889 L12.0479413,12.1074394 C11.9974761,12.1365754 11.9509488,12.1699127 11.9085461,12.2067543 C11.8661433,12.1699127 11.819616,12.1365754 11.7691509,12.1074394 L4.21611835,7.74669402 Z"
                            fill="#000000"
                            opacity="0.3"
                          />
                        </g>
                      </svg>
                    </span>
                    <span className="symbol symbol-light-success symbol-45 statsCount">
                      <span className="symbol-label font-weight-bolder font-size-h6">
                        +6
                      </span>
                    </span>
                    <div className="text-inverse-danger font-weight-bolder font-size-h3 mb-2 mt-5">
                      180
                    </div>
                    <div className="font-weight-bold text-inverse-dark font-size-sm">
                      Total Categories
                    </div>
                  </div>
                </a>
              </div>
            </div> */}

            <Chart />

            <div className="row">
              <div className="col-12">
                <div className="card card-custom gutter-b">
                  <div className="card-header border-0 py-5">
                    <h3 className="card-title align-items-start flex-column">
                      <span className="card-label font-weight-bolder text-dark">
                        Customers
                      </span>
                      {/* <span className="text-muted1 mt-3 font-weight-bold font-size-sm">
                        More than 40+ new customers
                      </span> */}
                    </h3>
                    <div className="card-toolbar">
                      <Link
                        to="/customers"
                        className="btn btn-info font-weight-bolder font-size-sm mr-3"
                      >
                        View All
                      </Link>
                    </div>
                  </div>
                  <div className="card-body pt-0 pb-3">
                    <div className="tab-content">
                      <div className="table-responsive">
                        <table className="table table-head-custom table-head-bg table-borderless table-vertical-center">
                          <thead>
                            <tr className="text-left text-uppercase">
                              <th>
                                <span className="text-dark-75">SN</span>
                              </th>
                              <th
                                style={{ minWidth: "250px" }}
                                className="pl-7"
                              >
                                <span className="text-dark-75">Name</span>
                              </th>

                              <th style={{ minWidth: "100px" }}>
                                <span className="text-dark-75">Email</span>
                              </th>

                              <th style={{ minWidth: "130px" }}>
                                <span className="text-dark-75">Status</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {customers.length > 0 &&
                              customers.map((customer, index) => (
                                <tr key={customer._id}>
                                  <td>
                                    <div className="symbol symbol-30 symbol-light mr-4">
                                      <span className="symbol-label font-weight-bold text-dark-75">
                                        {index + 1}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="pl-0 py-8">
                                    <div className="d-flex align-items-center">
                                      <div className="text-muted1 font-weight-bold d-block">
                                        {customer.name}
                                      </div>
                                    </div>
                                  </td>

                                  <td>
                                    <span className="text-muted1 font-weight-bold d-block">
                                      {customer.email}
                                    </span>
                                  </td>

                                  <td>
                                    <span
                                      className={`label label-lg label-light${
                                        customer.isActive
                                          ? "-success"
                                          : "-danger"
                                      }  label-inline`}
                                    >
                                      {customer.isActive
                                        ? "Active"
                                        : "Inactive"}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Creatotors div */}

            <div className="row">
              <div className="col-12">
                <div className="card card-custom gutter-b">
                  <div className="card-header border-0 py-5">
                    <h3 className="card-title align-items-start flex-column">
                      <span className="card-label font-weight-bolder text-dark">
                        Vendors
                      </span>
                      {/* <span className="text-muted1 mt-3 font-weight-bold font-size-sm">
                        More than 40+ new customers
                      </span> */}
                    </h3>
                    <div className="card-toolbar">
                      <Link
                        to="/vendors"
                        className="btn btn-info font-weight-bolder font-size-sm mr-3"
                      >
                        View All
                      </Link>
                    </div>
                  </div>
                  <div className="card-body pt-0 pb-3">
                    <div className="tab-content">
                      <div className="table-responsive">
                        <table className="table table-head-custom table-head-bg table-borderless table-vertical-center">
                          <thead>
                            <tr className="text-left text-uppercase">
                              <th>
                                <span className="text-dark-75">SN</span>
                              </th>
                              <th
                                style={{ minWidth: "250px" }}
                                className="pl-7"
                              >
                                <span className="text-dark-75">Name</span>
                              </th>

                              <th style={{ minWidth: "100px" }}>
                                <span className="text-dark-75">Email</span>
                              </th>

                              <th style={{ minWidth: "130px" }}>
                                <span className="text-dark-75">Status</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {vendors.length > 0 &&
                              vendors.map((vendor, index) => (
                                <tr key={vendor._id}>
                                  <td>
                                    <div className="symbol symbol-30 symbol-light mr-4">
                                      <span className="symbol-label font-weight-bold text-dark-75">
                                        {index + 1}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="pl-0 py-8">
                                    <div className="d-flex align-items-center">
                                      <div className="text-muted1 font-weight-bold d-block">
                                        {vendor.name}
                                      </div>
                                    </div>
                                  </td>

                                  <td>
                                    <span className="text-muted1 font-weight-bold d-block">
                                      {vendor.email}
                                    </span>
                                  </td>

                                  <td>
                                    <span
                                      className={`label label-lg label-light${
                                        vendor.isActive ? "-success" : "-danger"
                                      }  label-inline`}
                                    >
                                      {vendor.isActive ? "Active" : "Inactive"}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <div className="card card-custom gutter-b">
                  <div className="card-header border-0 py-5">
                    <h3 className="card-title align-items-start flex-column">
                      <span className="card-label font-weight-bolder text-dark">
                        Products
                      </span>
                      {/* <span className="text-muted1 mt-3 font-weight-bold font-size-sm">
                        More than 40+ new customers
                      </span> */}
                    </h3>
                    <div className="card-toolbar">
                      <Link
                        to="/products"
                        className="btn btn-info font-weight-bolder font-size-sm mr-3"
                      >
                        View All
                      </Link>
                    </div>
                  </div>
                  <div className="card-body pt-0 pb-3">
                    <div className="tab-content">
                      <div className="table-responsive">
                        <table className="table table-head-custom table-head-bg table-borderless table-vertical-center">
                          <thead>
                            <tr className="text-left text-uppercase">
                              <th>
                                <span className="text-dark-75">SN</span>
                              </th>
                              <th
                                style={{ minWidth: "250px" }}
                                className="pl-7"
                              >
                                <span className="text-dark-75">Product Id</span>
                              </th>
                              <th
                                style={{ minWidth: "250px" }}
                                className="pl-7"
                              >
                                <span className="text-dark-75">Name</span>
                              </th>

                              <th style={{ minWidth: "100px" }}>
                                <span className="text-dark-75">Price</span>
                              </th>
                              <th style={{ minWidth: "100px" }}>
                                <span className="text-dark-75">Quantity</span>
                              </th>

                              <th style={{ minWidth: "130px" }}>
                                <span className="text-dark-75">Status</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {products.length > 0 &&
                              products.map((product, index) => (
                                <tr key={product._id}>
                                  <td>
                                    <div className="symbol symbol-30 symbol-light mr-4">
                                      <span className="symbol-label font-weight-bold text-dark-75">
                                        {index + 1}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="pl-0 py-8">
                                    <div className="d-flex align-items-center">
                                      <div className="text-muted1 font-weight-bold d-block">
                                        {product.customId}
                                      </div>
                                    </div>
                                  </td>

                                  <td>
                                    <span className="text-muted1 font-weight-bold d-block">
                                      {product.name}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="text-muted1 font-weight-bold d-block">
                                      {product.price}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="text-muted1 font-weight-bold d-block">
                                      {product.quantity}
                                    </span>
                                  </td>

                                  <td>
                                    <span
                                      className={`label label-lg label-light${
                                        product.isActive
                                          ? "-success"
                                          : "-danger"
                                      }  label-inline`}
                                    >
                                      {product.isActive ? "Active" : "Inactive"}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <div id="kt_scrolltop" className="scrolltop">
        <span className="svg-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            //
            //xmlns:xlink="http://www.w3.org/1999/xlink"
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
            version="1.1"
          >
            <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
              <polygon points="0 0 24 0 24 24 0 24" />
              <rect
                fill="#000000"
                opacity="0.3"
                x="11"
                y="10"
                width="2"
                height="10"
                rx="1"
              />
              <path
                d="M6.70710678,12.7071068 C6.31658249,13.0976311 5.68341751,13.0976311 5.29289322,12.7071068 C4.90236893,12.3165825 4.90236893,11.6834175 5.29289322,11.2928932 L11.2928932,5.29289322 C11.6714722,4.91431428 12.2810586,4.90106866 12.6757246,5.26284586 L18.6757246,10.7628459 C19.0828436,11.1360383 19.1103465,11.7686056 18.7371541,12.1757246 C18.3639617,12.5828436 17.7313944,12.6103465 17.3242754,12.2371541 L12.0300757,7.38413782 L6.70710678,12.7071068 Z"
                fill="#000000"
                fillRule="nonzero"
              />
            </g>
          </svg>
        </span>
      </div> */}
    </>
  );
};

export default Dashboard;
