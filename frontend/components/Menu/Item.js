import { useState, useEffect, useRef, Fragment } from "react";
import Link from "next/link";

import NavLink from "../NavLink";

/*
  TODO: REMOVE url from parameters, arguments and props
*/

const Dropdown = ({ submenus, dropdown, depthLevel, url }) => {
  depthLevel = depthLevel + 1;
  const dropdownClass = depthLevel > 1 ? "dropdown-submenu" : "";

  return (
    <ul className={`dropdown ${dropdownClass} ${dropdown ? "show" : ""}`}>
      {submenus.map((submenu) => (
        <MenuItem
          item={submenu}
          key={submenu._id}
          depthLevel={depthLevel}
          // url={`${url}/sub-category/${submenu.slug}`}
          url={`/category/${submenu.slug}`}
        />
      ))}
    </ul>
  );
};

const MenuItem = ({ item, depthLevel, url, isMobile }) => {
  const [dropdown, setDropdown] = useState(false);

  let ref = useRef();

  useEffect(() => {
    const handler = (event) => {
      if (dropdown && ref.current && !ref.current.contains(event.target)) {
        setDropdown(false);
      }
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [dropdown]);

  const onMouseEnter = () => {
    window.innerWidth > 960 && setDropdown(true);
  };

  const onMouseLeave = () => {
    window.innerWidth > 960 && setDropdown(false);
  };

  const closeDropdown = () => {
    dropdown && setDropdown(false);
  };

  let NavLinkElement, LinkElement;

  if (item.slug) {
    NavLinkElement = NavLink;
    LinkElement = Link;
  } else {
    NavLinkElement = Fragment;
    LinkElement = Fragment;
  }

  return (
    <NavLinkElement href={url}>
      <li
        className="nav-item menu-items"
        ref={ref}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={closeDropdown}
      >
        {!isMobile && item.subCategories?.length > 0 ? (
          <>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={dropdown ? "true" : "false"}
              onClick={() => setDropdown((prev) => !prev)}
            >
              <LinkElement href={url} legacyBehavior>
                <a className="nav-link">{item.name}</a>
              </LinkElement>

              {depthLevel > 0 ? (
                <span>&raquo;</span>
              ) : (
                <span className="arrow" />
              )}
            </button>
            <Dropdown
              depthLevel={depthLevel}
              submenus={item.subCategories}
              dropdown={dropdown}
              url={url}
            />
          </>
        ) : item.slug ? (
          <Link href={url} legacyBehavior>
            <a className="nav-link">{item.name}</a>
          </Link>
        ) : (
          <>{item.name}</>
        )}
      </li>
    </NavLinkElement>
  );
};

export default MenuItem;
