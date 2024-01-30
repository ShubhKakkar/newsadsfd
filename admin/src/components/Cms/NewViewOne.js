import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { SubTab, SubInputReadable } from "./TabNInput";
import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";

const ViewOne = (props) => {
  const { id: cmsId } = props.match.params;

  const [cmsDetails, setCmsDetails] = useState({});

  const { response: responseFetchCms, request: requestFetchCms } = useRequest();

  const { languages } = useSelector((state) => state.setting);

  useEffect(() => {
    document.title = "View Cms - Noonmar";
  }, []);

  useEffect(() => {
    if (languages) {
      requestFetchCms("GET", `cms/${cmsId}`);
    }
  }, [languages]);

  useEffect(() => {
    if (responseFetchCms) {
      const {
        data: { name },
        languageData,
      } = responseFetchCms.cms[0];

      setCmsDetails({ name, langData: languageData });
    }
  }, [responseFetchCms]);

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="View CMS Page"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/cms", name: "Back To CMS Page" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom gutter-b">
            <div className="card-body">
              <div className="form-group row my-2">
                <label className="col-4 col-form-label">Page Name:</label>
                <div className="col-8">
                  <span className="form-control-plaintext font-weight-bolder">
                    {cmsDetails?.name}
                  </span>
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
                {cmsDetails?.langData?.length > 0 &&
                  cmsDetails.langData.map((lang, index) => (
                    <SubInputReadable key={lang.id} index={index} lang={lang} />
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
