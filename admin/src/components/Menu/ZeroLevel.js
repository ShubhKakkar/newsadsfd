import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ZeroLevel = ({ menu, pathname }) => {
  const [active, setActive] = useState(false);

  const { name, Svg, path, highlight, subHighlight } = menu;

  const updateActive = () => {
    setActive((prev) => !prev);
  };

  useEffect(() => {
    if (
      path == pathname ||
      highlight.includes(pathname) ||
      subHighlight.includes(pathname.split("/").slice(0, 3).join("/"))
    ) {
      setActive(true);
    } else {
      setActive(false);
    }
  }, [pathname]);

  return (
    <li
      onClick={updateActive}
      className={`menu-item ${active ? "menu-item-active" : ""}`}
    >
      <Link to={path} className={`menu-link`}>
        <span className="svg-icon menu-icon">
          <Svg />
        </span>
        <span className="menu-text">{name}</span>
      </Link>
    </li>
  );
};

export default ZeroLevel;
