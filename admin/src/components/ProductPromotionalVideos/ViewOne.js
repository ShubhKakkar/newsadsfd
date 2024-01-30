import React, { useState, useEffect } from "react";
import Moment from "react-moment";
import { useSelector } from "react-redux";

import { SubTab } from "../Cms/TabNInput";
import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { API } from "../../constant/api";

const Activated = () => (
  <span className="label label-lg label-light-success label-inline">
    Publish
  </span>
);

const Deactivated = () => (
  <span className="label label-lg label-light-danger label-inline">
    Draft
  </span>
);

const ViewOne = (props) => {
  const { id: recordId } = props.match.params;

  const [record, setRecord] = useState([]);
  const { response: responseData, request: requestData } = useRequest();

  const { date_format } = useSelector((state) => state.setting);
  useEffect(() => {
    requestData("GET", `reel/${recordId}`);

    document.title = "View Reel/Product Promotional Video - Noonmar";
  }, []);

  useEffect(() => {
    if (responseData) {
      const { video, status, createdAt } =  responseData.data;
      setRecord([
        { title: "Video", value:  video ? (
          <video className="videoMedia" controls>
            <source src={`${API.PORT}/${video}`} type="video/mp4" />
          </video>
        ) :'-'},
        {
          title: "Created At",
          value: <Moment format={date_format}>{createdAt}</Moment>,
        },
        {
          title: "Status",
          value: status == "Publish" ? <Activated /> : <Deactivated />,
        },
      ]);
    }
  }, [responseData]);

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="View Reel/Product Promotional Video"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/product-promotional-videos", name: "Back To Reels/Product Promotional Videos" },
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
                  {["Reel/Product Promotional Video Information"].map((data, index) => (
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
        </div>
      </div>
    </div>
  );
};

export default ViewOne;
