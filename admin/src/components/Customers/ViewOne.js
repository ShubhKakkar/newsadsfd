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

  const [userData, setUserData] = useState([]);

  const { response: responseUserData, request: requestUserData } = useRequest();

  const { date_format } = useSelector((state) => state.setting);

  useEffect(() => {
    requestUserData("GET", `customer/${id}`);

    document.title = "View Customer - Noonmar";
  }, []);

  useEffect(() => {
    if (responseUserData) {
      const {
        firstName,
        lastName,
        email,
        contact,
        country,
        profilePic,
        zipCode,
        dob,
        isActive,
        createdAt,
      } = responseUserData.customer;
      setUserData([
        { title: "First Name", value: firstName },
        { title: "Last Name", value: lastName },
        { title: "Email", value: email },
        { title: "Contact", value: contact ? contact : "-" },
        { title: "Zip Code", value: zipCode ? zipCode : "-" },
        { title: "Country", value: country ? country.name : "-" },
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
          value: <Moment format={date_format}>{dob}</Moment>,
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
    }
  }, [responseUserData]);

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="View Customer"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/customers", name: "Back To Customers" },
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
                  {["Customer Information"].map((data, index) => (
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
                  {userData.length > 0 &&
                    userData.map((user, index) => (
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
