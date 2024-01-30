import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import TwoLevelMenu from "../Menu/TwoLevel";
import OneLevelMenu from "../Menu/OneLevel";
import ZeroLevelMenu from "../Menu/ZeroLevel";
import { menu } from "../../util/data";
import { Arrow } from "../../util/Svg";
import { sidebarToggle } from "../../store/auth/action";
import { getFilteredData } from "../../util/permission";
import AllLevelMenu from "../Menu/AllLevel";

const Sidebar = () => {
  const [fullSidebar, setFullSidebar] = useState(true);
  const [filteredMenu, setFilteredMenu] = useState(menu);
  const { isMobileSidebarOpen, roleId, permission } = useSelector(
    (state) => state.auth
  );

  const { pathname } = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (roleId === 2 && permission) {
      setFilteredMenu(getFilteredData(filteredMenu, permission));
    }
  }, [roleId, permission]);

  //classList.toggle
  const onClickSidebarHandler = () => {
    if (fullSidebar) {
      document.body.classList.add("aside-minimize");
      document.querySelector("#kt_aside_toggle").classList.add("active");
    } else {
      document.body.classList.remove("aside-minimize");
      document.querySelector("#kt_aside_toggle").classList.remove("active");
    }

    setFullSidebar((prev) => !prev);
    document.body.classList.remove("aside-minimize-hover");
  };

  const onHoverSidebarHandler = () => {
    if (!fullSidebar) {
      document.body.classList.remove("aside-minimize");
      document.body.classList.add("aside-minimize-hover");
    }
  };

  const onMouseLeaveHandler = () => {
    if (!fullSidebar) {
      document.body.classList.add("aside-minimize");
      document.body.classList.remove("aside-minimize-hover");
    }
  };

  return (
    <>
      <div
        className={`aside aside-left  aside-fixed  d-flex flex-column flex-row-auto ${
          isMobileSidebarOpen ? "aside-on" : ""
        }`}
        id="kt_aside"
        onMouseOver={onHoverSidebarHandler}
        onMouseLeave={onMouseLeaveHandler}
      >
        <div className="brand flex-column-auto " id="kt_brand">
          <Link to="/" className="brand-logo">
            <img alt="Logo" src="./logo.png" style={{ width: "64px" }} />
          </Link>

          <button
            onClick={onClickSidebarHandler}
            // className={`brand-toggle btn btn-sm px-0 ${
            //   fullSidebar ? "" : "active"
            // }`}
            className={`brand-toggle btn btn-sm px-0`}
            id="kt_aside_toggle"
          >
            <span className="svg-icon svg-icon svg-icon-xl">
              <Arrow />
            </span>{" "}
          </button>
        </div>

        <div
          className="aside-menu-wrapper flex-column-fluid"
          id="kt_aside_menu_wrapper"
        >
          <div
            id="kt_aside_menu"
            className="aside-menu my-4 "
            data-menu-vertical="1"
            data-menu-scroll="1"
            data-menu-dropdown-timeout="500"
          >
            {/* <ul className="menu-nav ">
              {filteredMenu.map((menu, index) =>
                menu.subMenu.length > 0 ? (
                  <OneLevelMenu key={index} menu={menu} pathname={pathname} />
                ) : (
                  <ZeroLevelMenu key={index} menu={menu} pathname={pathname} />
                )
              )}
            </ul> */}

            <ul className="menu-nav ">
              {/* {filteredMenu.map((menu, index) => {
                if (
                  menu.subMenu.some(
                    (subItem) => subItem.subItem && subItem.subItem.length > 0
                  )
                ) {
                  return (
                    <TwoLevelMenu key={index} menu={menu} pathname={pathname} />
                  );
                }

                if (menu.subMenu.length > 0) {
                  return (
                    <OneLevelMenu key={index} menu={menu} pathname={pathname} />
                  );
                }
                return (
                  <ZeroLevelMenu key={index} menu={menu} pathname={pathname} />
                );
              })} */}

              {filteredMenu.map((menu, index) => (
                <AllLevelMenu key={index} menu={menu} pathname={pathname} />
              ))}
            </ul>
          </div>
        </div>
      </div>
      {isMobileSidebarOpen && (
        <div
          onClick={() =>
            dispatch(sidebarToggle({ isMobileSidebarOpen: false }))
          }
          className="aside-overlay"
        ></div>
      )}
    </>
  );
};

export default Sidebar;
