import React, { useState, useEffect } from "react";
import Moment from "react-moment";
import { useSelector } from "react-redux";

import { SubTab } from "../Cms/TabNInput";
import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";

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
  const { id: seekerId } = props.match.params;

  const [data, setData] = useState([]);

  const { response: responseUserData, request: requestUserData } = useRequest();

  const { date_format } = useSelector((state) => state.setting);

  useEffect(() => {
    requestUserData("GET", `subscription-offer/${seekerId}`);

    document.title = "View Subscription Offer - Noonmar";
  }, []);

  useEffect(() => {
    if (responseUserData) {
      const { tenure, discountPrice, startDate, endDate, isActive, createdAt } =
        responseUserData.data;
      setData([
        { title: "Tenure", value: tenure },
        { title: "Discount Price", value: discountPrice },
        {
          title: "Start Date",
          value: <Moment format={date_format}>{startDate}</Moment>,
        },
        {
          title: "End Date",
          value: <Moment format={date_format}>{endDate}</Moment>,
        },
        {
          title: "Created At",
          value: <Moment format={date_format}>{createdAt}</Moment>,
        },
        {
          title: "Status",
          value: isActive ? <Activated /> : <Deactivated />,
        },
      ]);
    }
  }, [responseUserData]);

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="View Subscription Offer"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/subscription-offers", name: "Back To Subscription Offers" },
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
                  {["Subscription Offer Information"].map((data, index) => (
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
                  {data.length > 0 &&
                    data.map((obj, index) => (
                      <div key={index} className="form-group row my-2">
                        <label className="col-4 col-form-label">
                          {obj.title}
                        </label>
                        <div className="col-8">
                          <span className="form-control-plaintext font-weight-bolder">
                            {obj.value}
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
