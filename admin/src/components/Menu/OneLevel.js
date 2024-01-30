import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function onlyLettersAndSpaces(str) {
  return /^[A-Za-z\s\-]*$/.test(str);
}

const OneLevelMenu = ({ menu, pathname }) => {
  const [active, setActive] = useState(false);

  const { name, Svg, subMenu, highlight, subHighlight } = menu;

  const paths = subMenu.map((sub) => sub.path);

  let filteredPath = pathname
    .split("/")
    .filter((path) => onlyLettersAndSpaces(path));
  filteredPath = filteredPath.join("/");

  useEffect(() => {
    if (
      paths.includes(pathname) ||
      paths.includes("/" + pathname.split("/")[1]) ||
      highlight.includes(pathname) ||
      subHighlight.includes(pathname.split("/").slice(0, 3).join("/")) ||
      subHighlight.includes(filteredPath)
    ) {
      setActive(true);
    } else {
      setActive(false);
    }
  }, [pathname]);

  return (
    <li
      id={`collapse-menu-main ${name}-toggle-7`}
      className={`menu-item menu-item-submenu ${
        active ? "menu-item-open" : ""
      } `}
      data-menu-toggle="hover"
      onClick={() => setActive((prev) => !prev)}
    >
      <a className="menu-link menu-toggle">
        <span className="svg-icon menu-icon">
          <Svg />
        </span>
        <span className="menu-text">{name}</span>
        <i className="menu-arrow"></i>
      </a>
      <div className="menu-submenu">
        <i className="menu-arrow"></i>
        <ul className="menu-subnav">
          <li className="menu-item menu-item-parent">
            <span className="menu-link">
              <span className="menu-text">{name}</span>
            </span>
          </li>
          {subMenu.map((menu, index) => (
            <li
              key={index}
              className={`menu-item ${
                (menu.path == pathname ||
                  menu.highlight.includes(pathname) ||
                  menu.subHighlight.includes(filteredPath) ||
                  menu.subHighlight.includes(
                    pathname.split("/").slice(0, 3).join("/")
                  )) &&
                "menu-item-open"
              }`}
            >
              <Link to={menu.path} className="menu-link">
                <i className="menu-bullet menu-bullet-line">
                  <span></span>
                </i>
                <span className="menu-text">{menu.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
};

export default OneLevelMenu;
