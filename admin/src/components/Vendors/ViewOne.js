import React, { useState, useEffect } from "react";
import Moment from "react-moment";
import { useSelector } from "react-redux";

import { SubTab } from "../Cms/TabNInput";
import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { API } from "../../constant/api";

const Activated = () => (
  <span className="label label-lg label-light-success label-inline">
    Activated
  </span>
);

const Deactivated = () => (
  <span className="label label-lg label-light-danger label-inline">
    Deactivated
  </span>
);

const ViewOne = (props) => {
  const { id } = props.match.params;

  const [businessDetails, setBusinessDetails] = useState([]);
  const [warehouseDetails, setWarehouseDetails] = useState([]);
  const [otherDetails, setOtherDetails] = useState([]);
  const [personalDetails, setPersonalDetails] = useState([]);
  const [bussinessDetails, setBussinessDetails] = useState([]);

  
  const [tabIndex, setTabIndex] = useState(0);

  const { response: responseWarehouseData, request: requestWarehouseData } =
    useRequest();

  const { date_format } = useSelector((state) => state.setting);

  useEffect(() => {
    requestWarehouseData("GET", `vendor/${id}`);

    document.title = "View Vendor - Noonmar";
  }, []);

  useEffect(() => {
    if (responseWarehouseData) {
      const {
        businessName,
        businessEmail,
        isActive,
        createdAt,
        businessContact,
        businessCountryViewOne,
        warehouseData,
        productCategories,
        serveCountries,
        currencyViewOne,
        businessDoc,
        storefrontSubscription,
        language,
        email,
        ibaNumber,
        firstName,
        lastName,
        dob,
        countryCode,
        contact,
        address,
        profilePic,
      } = responseWarehouseData.vendor;
      setBusinessDetails([
        { title: "Business Name", value: businessName },
        { title: "Phone Number", value: countryCode + ' ' + businessContact },
        { title: "Email", value: businessEmail },
        // { title: "Product Categories you deal with", value: productCategories },
        {
          title: "Country",
          value: businessCountryViewOne ? businessCountryViewOne : "-",
        },
        {
          title: "Registered On",
          value: <Moment format={date_format}>{createdAt}</Moment>,
        },

        {
          title: "Status",
          value: isActive ? <Activated /> : <Deactivated />,
        },
      ]);

      if (warehouseData.length > 0) {
        let warehouseArray = warehouseData.map((data) => [
          { title: "Warehouse Name / Label", value: data.name },
          { title: "Address", value: data.address ? data.address : "-" },
          { title: "City", value: data.city ? data.city : "-" },
          { title: "State", value: data.state ? data.state : "-" },
          { title: "Street", value: data.street ? data.street : "-" },
          {
            title: "Country",
            value: data.countryData?.name ? data.countryData?.name : "-",
          },
          {
            title: "Status",
            value: data.isActive ? <Activated /> : <Deactivated />,
          },
        ]);
        setWarehouseDetails(warehouseArray);
      }

      let newProductCategories = "";
      let newServeCountries = "";

      if (productCategories.length > 0) {
        newProductCategories = productCategories
          .map((data) => data.label)
          .join(",");
      }
      if (serveCountries.length > 0) {
        newServeCountries = serveCountries.map((data) => data.label).join(",");
      }
      setOtherDetails([
        {
          title: "Product Categories you deal with",
          value: newProductCategories ? newProductCategories : "-",
        },
        {
          title: "Select countries you want to serve",
          value: newServeCountries ? newServeCountries : "-",
        },
        {
          title: "Select Native Currency",
          value: currencyViewOne ? currencyViewOne : "-",
        },
        {
          title: "Upload Business Document",
          value: businessDoc
            ? businessDoc?.map((item) => {
                return (
                  <a
                    style={{ cursor: "pointer" }}
                    onClick={(e) => window.open(`${API.PORT}/${item}`)}
                  >
                    <img src="/assets/img/pdf-img.png" width="30px" />
                  </a>
                );
              })
            : "-",
        },
        {
          title: "Storefront Subscription Needed",
          value: storefrontSubscription ? "Yes" : "No",
        },
        {
          title: "Language",
          value: language ? language : "-",
        },
      ]);
      setPersonalDetails([
        { title: "Email", value: email },
        { title: "First Name", value: firstName },
        { title: "Last Name", value: lastName },
        { title: "Country Code", value: countryCode },
        { title: "Contact Number", value: contact },
        { title: "Address", value: address },
        {
          title: "Profile Pic",
          value: profilePic ? (
            <img
              src={`${API.PORT}/${profilePic}`}
              width={150}
              height={100}
              alt=""
              style={{ cursor: "pointer", marginBottom: "10px" }}
              data-fancybox
            />
          ) : (
            "-"
          ),
        },
        {
          title: "DOB",
          value: dob?<Moment format={date_format}>{dob}</Moment>:'-',
        },
      ]);
      setBussinessDetails([
        { title: "IBA Number", value: ibaNumber },
      ]);
    }
  }, [responseWarehouseData]);

  const currentTabIndexHandler = (idx) => {
    setTabIndex(idx);
  };

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="View Vendor"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/vendors", name: "Back To Vendors" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom gutter-b">
            <div className="card-header card-header-tabs-line">
              <div className="card-toolbar">
                <ul
                  className="nav nav-tabs nav-tabs-space-lg nav-tabs-line nav-bold nav-tabs-line-3x"
                  role="tablist"
                >
                  {[
                    "Business Details",
                    "Warehouse Details",
                    "Other Details",
                    "Personal Details",
                    "Banking Information"
                  ].map((data, index) => (
                    <SubTab
                      key={index}
                      name={data}
                      index={index}
                      onClick={currentTabIndexHandler}
                    />
                  ))}
                </ul>
              </div>
            </div>

            <div
              style={{
                display: tabIndex === 0 ? "block" : "none",
              }}
              className="card-body px-0"
            >
              <div className="tab-content px-10">
                <div
                  className={`tab-pane ${tabIndex === 0 ? "active" : ""}`}
                  id={`kt_apps_contacts_view_tab_0`}
                  role="tabpanel"
                >
                  {businessDetails.length > 0 &&
                    businessDetails.map((user, index) => (
                      <div key={index} className="form-group row my-2">
                        <label className="col-4 col-form-label">
                          {user.title}
                        </label>
                        <div className="col-8">
                          <span className="form-control-plaintext font-weight-bolder">
                            {user.value}
                          </span>
                        </div>
                      </div>
                    ))}

                  <div className="row"></div>
                </div>
              </div>
            </div>
            <div
              style={{
                display: tabIndex === 1 ? "block" : "none",
              }}
              className="card-body px-0"
            >
              <div className="tab-content px-10">
                <div
                  className={`tab-pane ${tabIndex === 1 ? "active" : ""}`}
                  id={`kt_apps_contacts_view_tab_1`}
                  role="tabpanel"
                >
                  {warehouseDetails.length > 0 &&
                    warehouseDetails.map((user, index) => (
                      <>
                        {user.map((data, i) => (
                          <div key={i} className="form-group row my-2">
                            <label className="col-4 col-form-label">
                              {data.title}
                            </label>
                            <div className="col-8">
                              <span className="form-control-plaintext font-weight-bolder">
                                {data.value}
                              </span>
                            </div>
                          </div>
                        ))}
                        <hr />
                      </>
                    ))}

                  <div className="row"></div>
                </div>
              </div>
            </div>
            <div
              style={{
                display: tabIndex === 2 ? "block" : "none",
              }}
              className="card-body px-0"
            >
              <div className="tab-content px-10">
                <div
                  className={`tab-pane ${tabIndex === 2 ? "active" : ""}`}
                  id={`kt_apps_contacts_view_tab_2`}
                  role="tabpanel"
                >
                  {otherDetails.length > 0 &&
                    otherDetails.map((user, index) => (
                      <div key={index} className="form-group row my-2">
                        <label className="col-4 col-form-label">
                          {user.title}
                        </label>
                        <div className="col-8">
                          <span className="form-control-plaintext font-weight-bolder">
                            {user.value}
                          </span>
                        </div>
                      </div>
                    ))}

                  <div className="row"></div>
                </div>
              </div>
            </div>
            <div
              style={{
                display: tabIndex === 3 ? "block" : "none",
              }}
              className="card-body px-0"
            >
              <div className="tab-content px-10">
                <div
                  className={`tab-pane ${tabIndex === 3 ? "active" : ""}`}
                  id={`kt_apps_contacts_view_tab_3`}
                  role="tabpanel"
                >
                  {personalDetails.length > 0 &&
                    personalDetails.map((user, index) => (
                      <div key={index} className="form-group row my-2">
                        <label className="col-4 col-form-label">
                          {user.title}
                        </label>
                        <div className="col-8">
                          <span className="form-control-plaintext font-weight-bolder">
                            {user.value}
                          </span>
                        </div>
                      </div>
                    ))}

                  <div className="row"></div>
                </div>
              </div>
            </div>
            <div
              style={{
                display: tabIndex === 4 ? "block" : "none",
              }}
              className="card-body px-0"
            >
              <div className="tab-content px-10">
                <div
                  className={`tab-pane ${tabIndex === 4 ? "active" : ""}`}
                  id={`kt_apps_contacts_view_tab_4`}
                  role="tabpanel"
                >
                  {bussinessDetails.length > 0 &&
                    bussinessDetails.map((user, index) => (
                      <div key={index} className="form-group row my-2">
                        <label className="col-4 col-form-label">
                          {user.title}
                        </label>
                        <div className="col-8">
                          <span className="form-control-plaintext font-weight-bolder">
                            {user.value}
                          </span>
                        </div>
                      </div>
                    ))}

                  <div className="row"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOne;
