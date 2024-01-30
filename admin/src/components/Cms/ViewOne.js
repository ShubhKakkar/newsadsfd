import React, { useState, useEffect } from "react";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";

const ViewOne = (props) => {
  const { id: cmsId } = props.match.params;

  const [cmsDetails, setCmsDetails] = useState({});

  const { response, request } = useRequest();

  useEffect(() => {
    if (cmsId) {
      request("GET", `cms/${cmsId}`);
    }
  }, [cmsId]);

  useEffect(() => {
    if (response) {
      const { name, title, description } = response.cms;
      setCmsDetails({ name, title, description });
    }
  }, [response]);

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
            <div className="card-header card-header-tabs-line">
              <div className="card-toolbar">
                <ul
                  className="nav nav-tabs nav-tabs-space-lg nav-tabs-line nav-bold nav-tabs-line-3x"
                  role="tablist"
                >
                  <li className="nav-item">
                    <a
                      className="nav-link active"
                      data-toggle="tab"
                      href="#kt_apps_contacts_view_tab_1"
                    >
                      <span className="nav-text">Cms Page Details</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="card-body px-0">
              <div className="tab-content px-10">
                <div
                  className="tab-pane active"
                  id="kt_apps_contacts_view_tab_1"
                  role="tabpanel"
                >
                  <div className="form-group row my-2">
                    <label className="col-4 col-form-label">Page Name:</label>
                    <div className="col-8">
                      <span className="form-control-plaintext font-weight-bolder">
                        {cmsDetails?.name}
                      </span>
                    </div>
                  </div>
                  <div className="form-group row my-2">
                    <label className="col-4 col-form-label">Page Title:</label>
                    <div className="col-8">
                      <span className="form-control-plaintext font-weight-bolder">
                        {cmsDetails?.title}
                      </span>
                    </div>
                  </div>
                  <div className="form-group row my-2">
                    <label className="col-4 col-form-label">
                      Page Description:
                    </label>
                    <div className="col-8">
                      <span
                        dangerouslySetInnerHTML={{
                          __html: cmsDetails?.description,
                        }}
                        className="form-control-plaintext font-weight-bolder"
                      ></span>
                    </div>
                  </div>
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
