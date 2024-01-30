import { useRouter } from "next/router";
import React, { Children } from "react";

const NavLink = ({ children, ...props }) => {
  const { asPath } = useRouter();
  const child = Children.only(children);
  const childClassName = child.props.className || "";
  // pages/index.js will be matched via props.href
  // pages/about.js will be matched via props.href
  // pages/[slug].js will be matched via props.as

  const as = props.as ? props.as.includes(asPath) : false;

  // const className =
  //   asPath === props.href || asPath === props.as
  //     ? `${childClassName} active`.trim()
  //     : childClassName;

  const className =
    asPath === props.href || as
      ? `${childClassName} active`.trim()
      : childClassName;

  return React.cloneElement(child, {
    className: className || null,
  });
};

export default NavLink;
