import React from "react";
import { useSelector } from "react-redux";
import moment from "moment";

const Footer = () => {
  const { title } = useSelector((state) => state.setting);
  return (
    <div className="footer bg-white py-4 d-flex flex-lg-column " id="kt_footer">
      <div className=" container-fluid  d-flex flex-column flex-md-row align-items-center justify-content-between">
        <div className="text-dark order-2 order-md-1">
          <span className="text-muted font-weight-bold mr-2">
            {moment().format("yyyy")}&copy;
          </span>
          <a target="_blank" className="text-dark-75 text-hover-primary">
            {title}
          </a>
        </div>

        <div className="nav nav-dark"></div>
      </div>
    </div>
  );
};

export default Footer;
