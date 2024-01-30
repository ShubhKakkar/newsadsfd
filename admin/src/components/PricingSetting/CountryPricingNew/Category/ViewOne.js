import React, { useState, useEffect } from "react";

import { SubTab } from "../../../Cms/TabNInput";
import useRequest from "../../../../hooks/useRequest";
import Breadcrumb from "../../../Breadcrumb/Breadcrumb";

const ViewOne = (props) => {
  const { id: recordId, parentId, countryId } = props.match.params;
  const [groupData, setGroupData] = useState([]);

  const { response: responsePricingData, request: requestPricingData } =
    useRequest();

  useEffect(() => {
    requestPricingData("GET", `pricing-new/country/category/${recordId}`);

    document.title = "View Pricing - Noonmar";
  }, []);

  useEffect(() => {
    if (responsePricingData) {
      const { value, category, country } = responsePricingData.pricing;

      setGroupData([
        {
          title: "Category",
          value: category.label ? category.label : "-",
        },
        {
          title: "Country",
          value: country.label ? country.label : "-",
        },
        {
          title: "Value",
          value: value,
        },
      ]);
    }
  }, [responsePricingData]);

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="View Country Pricing"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: `/country-pricing/data/${countryId}?tab=0`,
            name: "Back To Country Pricing",
          },
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
                  {["Country Pricing Information"].map((data, index) => (
                    <SubTab key={index} name={data} index={index} />
                  ))}
                </ul>
              </div>
            </div>

            <div className="card-body px-0">
              <div className="tab-content px-10">
                <div
                  className={`tab-pane active`}
                  id={`kt_apps_contacts_view_tab_3`}
                  role="tabpanel"
                >
                  {groupData.length > 0 &&
                    groupData.map((user, index) => (
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
