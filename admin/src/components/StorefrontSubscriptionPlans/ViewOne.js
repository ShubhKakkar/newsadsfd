import React, { useState, useEffect } from "react";
import Moment from "react-moment";
import { useSelector } from "react-redux";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { SubTab, SubInputReadable } from "../LanguageForm/LanguageForm";

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
  const [data2, setData2] = useState([]);

  const { response: responseUserData, request: requestUserData } = useRequest();

  const { date_format, languages } = useSelector((state) => state.setting);

  useEffect(() => {
    document.title = "View Storefront Subscription Plan - Noonmar";
  }, []);

  useEffect(() => {
    if (languages) {
      requestUserData("GET", `subscription-plan/${seekerId}`);
    }
  }, [languages]);

  useEffect(() => {
    if (responseUserData) {
      const {
        data: { isActive, createdAt, monthlyPrice, yearlyPrice },
        activeSubscribers,
        productCategoriesData,
      } = responseUserData.data;
      let { languageData } = responseUserData.data;

      setData([
        // { title: "Name", value: name },
        { title: "Monthly Price", value: monthlyPrice },
        { title: "Yearly Price", value: yearlyPrice },
        // { title: "Features", value: <div
        // dangerouslySetInnerHTML={{__html: features}}
        // /> },
        {
          title: "Active Subscribers",
          value: activeSubscribers,
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
      languageData.sort(function (a, b) {
        const date1 = new Date(a.date).getTime();
        const date2 = new Date(b.date).getTime();
        return date1 - date2;
      });

      setData2({ langData: languageData });
    }
  }, [responseUserData]);

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="View Storefront Subscription Plan"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: "/storefront-subscription-plans",
            name: "Back To Storefront Subscription Plans",
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
                  {["Storefront Subscription Plan Information"].map(
                    (data, index) => (
                      <SubTab key={index} name={data} index={index} />
                    )
                  )}
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

            <div className="card card-custom gutter-b">
              <div className="card-header card-header-tabs-line">
                <div className="card-toolbar">
                  <ul
                    className="nav nav-tabs nav-tabs-space-lg nav-tabs-line nav-bold nav-tabs-line-3x"
                    role="tablist"
                  >
                    {languages.length > 0 &&
                      languages.map((lang, index) => (
                        <SubTab
                          key={index}
                          name={lang.name}
                          index={index}
                          image={lang?.image}
                        />
                      ))}
                  </ul>
                </div>
              </div>

              <div className="card-body px-0">
                <div className="tab-content px-10">
                  {data2?.langData?.length > 0 &&
                    data2.langData.map((lang, index) => (
                      <SubInputReadable
                        key={lang.id}
                        index={index}
                        lang={lang}
                      />
                    ))}
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
