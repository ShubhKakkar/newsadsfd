import React from "react";
import { Link } from "react-router-dom";

const Breadcrumb = ({ title, links }) => {
  return (
    <div className="subheader py-2 py-lg-4  subheader-solid " id="kt_subheader">
      <div className=" container-fluid  d-flex align-items-center justify-content-between flex-wrap flex-sm-nowrap">
        <div className="d-flex align-items-center flex-wrap mr-1">
          <div className="d-flex align-items-baseline flex-wrap mr-5">
            <h5 className="text-dark font-weight-bold my-1 mr-5">{title} </h5>

            <ul className="breadcrumb breadcrumb-transparent breadcrumb-dot font-weight-bold p-0 my-2 font-size-sm">
              {links.length > 0 &&
                links.map((link, index) => (
                  <li key={index} className="breadcrumb-item">
                    <Link to={link.to} className="text-muted">
                      {link.name}{" "}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumb;
