import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const TwoLevelMenu = ({ menu, pathname }) => {
  const [active, setActive] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState([]);
  console.log(openSubmenus);

  const { name, Svg, subMenu, highlight, subHighlight } = menu;
  console.log(menu, "menu", pathname, "pathname");
  //const paths = menu.subMenu.subItem.map((sub) => sub.path);
  const paths = menu.subMenu.flatMap((sub) =>
    sub.subItem.map((subItem) => subItem.path)
  );
  const subHighlightPaths = [];
  const highlightPaths = [];
  menu.subMenu.forEach((subMenu) => {
    subMenu.subItem.forEach((sub) => {
      if (sub.highlight) {
        sub.highlight.forEach((data) => highlightPaths.push(data));
      }

      if (sub.subHighlight) {
        sub.subHighlight.forEach((data) => subHighlightPaths.push(data));
      }
    });
  });

  let newPath = pathname.split("/");
  newPath.pop();
  let deepPath;
  if (newPath.length > 0) {
    deepPath = newPath.slice(0, -1);
  }
  useEffect(() => {}, [openSubmenus]);

  

  useEffect(() => {
    if (
      paths.includes(pathname) ||
      paths.includes("/" + pathname.split("/")[1]) ||
      highlight.includes(pathname) ||
      subHighlight.includes(pathname.split("/").slice(0, 3).join("/")) ||
      subHighlight.includes(newPath.join("/")) ||
      subHighlightPaths.includes(pathname) ||
      highlightPaths.includes(pathname)
    ) {
      setActive(true);
    } else {
      setActive(false);
    }
  }, [pathname]);

  

  const handleSubmenuClick = (index, event) => {
    event.stopPropagation();
    if (openSubmenus.includes(index)) {
      setOpenSubmenus((prev) => prev.filter((i) => i !== index));
    } else {
      setOpenSubmenus((prev) => [...prev, index]);
    }
  };

  return (
    <li
      className={`menu-item menu-item-submenu ${
        active ? "menu-item-open" : ""
      }`}
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
          {subMenu.map((submenu, index) => (
            <React.Fragment key={index}>
              <li
                className={`menu-item ${
                  active ? "menu-item-open" : ""
                  //submenu.subItem.path === pathname && "menu-item-open"
                }`}
                onClick={(event) => handleSubmenuClick(index, event)}
              >
                <a href="javascript:void(0);" className="menu-link">
                  <i className="menu-bullet menu-bullet-line">
                    <span></span>
                  </i>
                  <span className="menu-text">{submenu.name}</span>
                  {/* {submenu.subItem && (
                    <i
                      className={`menu-arrow ${
                        openSubmenus.includes(index)
                          ? "menu-arrow-open"
                          : "menu-arrow-closed"
                      }`}
                    ></i>
                  )} */}

                  {submenu.subItem && submenu.subItem.length > 0 && (
                    <i
                      className={`menu-arrow ${
                        openSubmenus.includes(index)
                          ? "menu-arrow-open"
                          : "menu-arrow-closed"
                      }`}
                    ></i>
                  )}
                  
                </a>

                {submenu.subItem && openSubmenus.includes(index) && (
                  <div className="menu-submenu">
                    <i className="menu-arrow"></i>
                    <ul className="menu-subnav">
                      {submenu.subItem.map((subsubmenu, subIndex) => (
                        <li
                          key={subIndex}
                          className={`menu-item ${
                            subsubmenu.path === pathname && "menu-item-open"
                          }`}
                        >
                          <Link to={subsubmenu.path} className="menu-link">
                            <i className="menu-bullet menu-bullet-dot">
                              <span></span>
                            </i>
                            <span className="menu-text">{subsubmenu.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            </React.Fragment>
          ))}
        </ul>
      </div>

    </li>
  );
};

export default TwoLevelMenu;
