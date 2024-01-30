import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import { SubTab } from "../../Cms/TabNInput";
import Breadcrumb from "../../Breadcrumb/Breadcrumb";

import CategoryPricing from "./Category/ViewAll";
import CustomerGroup from "./CustomerGroup/ViewAll";
import Product from "./Product/ViewAll";
import ProductGroup from "./ProductGroup/ViewAll";

const ViewOne = (props) => {
  const { id } = props.match.params;
  const [tabIndex, setTabIndex] = useState(0);
  const history = useHistory();

  useEffect(() => {
    document.title = "View Country Pricing - Noonmar";
    const query = new URLSearchParams(props.location.search);
    let tab = query.get("tab") ? +query.get("tab") : 0;
    if (tab && !isNaN(tab) && tab < 4) {
      tab = +tab;
      setTabIndex(tab);

      const ele = document.querySelector(
        `[href="#kt_apps_contacts_view_tab_${tab}"]`
      );
      if (ele) {
        ele.click();
      }
    }
  }, []);

  const currentTabIndexHandler = (idx) => {
    setTabIndex(idx);
    history.push(`/country-pricing/data/${id}?tab=${idx}`);
  };

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="View Country Pricingr"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/country-pricing", name: "Back To Country Pricing" },
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
                    "Category Pricing",
                    "Customers Group Pricing",
                    "Products Group Pricing",
                    "Product Pricing",
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
              <div className="tab-content">
                <div
                  className={`tab-pane ${tabIndex === 0 ? "active" : ""}`}
                  id={`kt_apps_contacts_view_tab_0`}
                  role="tabpanel"
                >
                  <CategoryPricing countryId={id} />

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
              <div className="tab-content">
                <div
                  className={`tab-pane ${tabIndex === 1 ? "active" : ""}`}
                  id={`kt_apps_contacts_view_tab_1`}
                  role="tabpanel"
                >
                  <CustomerGroup countryId={id} />
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
              <div className="tab-content">
                <div
                  className={`tab-pane ${tabIndex === 2 ? "active" : ""}`}
                  id={`kt_apps_contacts_view_tab_2`}
                  role="tabpanel"
                >
                  <ProductGroup countryId={id} />

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
              <div className="tab-content">
                <div
                  className={`tab-pane ${tabIndex === 3 ? "active" : ""}`}
                  id={`kt_apps_contacts_view_tab_3`}
                  role="tabpanel"
                >
                  <Product countryId={id} />

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
