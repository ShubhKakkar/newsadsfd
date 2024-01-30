import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function onlyLettersAndSpaces(str) {
  return /^[A-Za-z\s\-]*$/.test(str);
}

const AllLevelMenu = ({ menu, pathname, isChild = false }) => {
  const [active, setActive] = useState(false);

  const { name, Svg, subMenu, highlight, subHighlight, path } = menu;

  const paths = subMenu.map((sub) => sub.path);
  let newPaths = [];
  let newHighlight = [];
  let newSubHighlight = [];

  const getAllLevelPath = (subMenu) => {
    if (subMenu.length > 0) {
      subMenu.forEach((sub) => {
        if (sub.subMenu.length > 0) {
          getAllLevelPath(sub.subMenu);
        } else {
          newPaths.push(sub.path);
          newHighlight.push(...newHighlight, ...sub.highlight);
          newSubHighlight.push(...newSubHighlight, ...sub.subHighlight);
        }
      });
    } else {
      newHighlight.push(...highlight);
      newSubHighlight.push(...subHighlight);
    }
  };

  getAllLevelPath(subMenu);

  newHighlight = newHighlight.filter(
    (value, index, array) => array.indexOf(value) === index
  );
  newSubHighlight = newSubHighlight.filter(
    (value, index, array) => array.indexOf(value) === index
  );

  let filteredPath = pathname
    .split("/")
    .filter((path) => onlyLettersAndSpaces(path));
  filteredPath = filteredPath.join("/");

  // console.log("paths ===>", paths);
  // console.log("newSubHighlight ===>", newSubHighlight);
  // console.log("newPaths", newPaths);

  useEffect(() => {
    if (
      path == pathname ||
      newPaths.includes(pathname) ||
      newPaths.includes("/" + pathname.split("/")[1]) ||
      newHighlight.includes(pathname) ||
      newSubHighlight.includes(pathname.split("/").slice(0, 3).join("/")) ||
      newSubHighlight.includes(filteredPath)
    ) {
      setActive(true);
    } else {
      setActive(false);
    }
  }, [pathname]);

  const updateActive = () => {
    setActive((prev) => !prev);
  };

  return (
    <>
      {subMenu.length > 0 ? (
        <li
          id={`collapse-menu-main ${name}-toggle-7`}
          className={`menu-item menu-item-submenu ${
            active ? "menu-item-open" : ""
          } `}
          data-menu-toggle="hover"
          onClick={(e) => {
            if (isChild) {
              e.stopPropagation();
            }
            setActive((prev) => !prev);
          }}
        >
          <a className="menu-link menu-toggle">
            {Svg ? (
              <span className="svg-icon menu-icon">
                {" "}
                <Svg />
              </span>
            ) : (
              <i className="menu-bullet menu-bullet-line">
                <span></span>
              </i>
            )}
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
              {subMenu.map((child, index) => {
                if (child.subMenu.length > 0) {
                  return (
                    <AllLevelMenu
                      key={index}
                      menu={child}
                      pathname={pathname}
                      isChild={true}
                    />
                  );
                } else {
                  return (
                    <li
                      key={index}
                      className={`menu-item ${
                        (child.path == pathname ||
                          child.highlight.includes(pathname) ||
                          child.subHighlight.includes(filteredPath) ||
                          child.subHighlight.includes(
                            pathname.split("/").slice(0, 3).join("/")
                          )) &&
                        "menu-item-open"
                      }`}
                    >
                      <Link to={child.path} className="menu-link">
                        <i className="menu-bullet menu-bullet-line">
                          <span></span>
                        </i>
                        <span className="menu-text">{child.name}</span>
                      </Link>
                    </li>
                  );
                }
              })}
            </ul>
          </div>
        </li>
      ) : (
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
      )}
    </>
  );
};

export default AllLevelMenu;
