import React from "react";

import "./Loading.css";

const Loading = () => {
  return (
    <div className="loader-wrapper1" id="loader_img">
      <div className="loader1">
        {/* <img src="/loader-logo.png" alt="" /> */}
        <img src="/loader-logo.png" alt="" />
        <div className="material-spinner1"></div>
      </div>
    </div>
  );
};

export default Loading;
