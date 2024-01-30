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
  const { id: recordId } = props.match.params;

  const [record, setRecord] = useState([]);
  const [record2, setRecord2] = useState([]);

  const { response: responseData, request: requestData } = useRequest();

  const { date_format, languages } = useSelector((state) => state.setting);

  useEffect(() => {
    document.title = "View Promotion Package - Noonmar";
  }, []);

  useEffect(() => {
    if (languages) {
      requestData("GET", `promotion-package/${recordId}`);
    }
  }, [languages]);

  useEffect(() => {
    if (responseData) {
      const {
        data: { duration, country, amount, isActive, createdAt },
        countriesData,
        languageData,
      } = responseData.data;

      let countries = "";
      if (countriesData && countriesData.length > 0) {
        countriesData.forEach((obj) => {
          countries += obj.name + ", ";
        });
        if (countries != "") {
          countries = countries.slice(0, -2);
        }
      }

      const view = [
        { title: "Duration (in months)", value: duration },
        { title: "Amount", value: amount ? "$" + amount : "-" },
        { title: "Country", value: countries ? countries : "-" },
        {
          title: "Created At",
          value: <Moment format={date_format}>{createdAt}</Moment>,
        },
        {
          title: "Status",
          value: isActive ? <Activated /> : <Deactivated />,
        },
      ];
      setRecord(view);

      languageData.sort(function (a, b) {
        const date1 = new Date(a.date).getTime();
        const date2 = new Date(b.date).getTime();
        return date1 - date2;
      });
      setRecord2({ langData: languageData });
    }
  }, [responseData]);

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="View Promotion Package"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/promotion-packages", name: "Back To Promotion Packages" },
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
                  {["Promotion Package Information"].map((data, index) => (
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
                  {record.length > 0 &&
                    record.map((data, index) => (
                      <div key={index} className="form-group row my-2">
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
                  <div className="row"></div>
                </div>
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
                {record2?.langData?.length > 0 &&
                  record2.langData.map((lang, index) => (
                    <SubInputReadable
                      key={lang.id}
                      label={"Title:"}
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
  );
};

export default ViewOne;
