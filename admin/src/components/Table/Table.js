import React, { Fragment, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Moment from "react-moment";
import { useSelector } from "react-redux";
import {
  sortableContainer,
  sortableElement,
  sortableHandle,
} from "react-sortable-hoc";

import {
  View,
  Edit,
  Delete,
  MakeDeactivate,
  MakeActivate,
  ChangePassword,
  SendCreds,
  Wallet,
  Login,
  Reports,
  Read,
  Building,
  Groups,
  Tax,
  Coin,
  Inventory,
  Logs,
  InventoryReports,
} from "../../util/Svg";
import { API } from "../../constant/api";
// import { convertDate } from "../../util/fn";
import { getFilteredLinks } from "../../util/permission";
import useRequest from "../../hooks/useRequest";

const SVG_OBJ = {
  MakeActivate: <MakeActivate />,
  MakeDeactivate: <MakeDeactivate />,
};

const truncate = (input) =>
  input.length > 200 ? `${input.substring(0, 200)}...` : input;

const DragHandle = sortableHandle(() => <span className="drag"></span>);
export const SortableContainer = sortableContainer(({ children }) => {
  return <tbody>{children}</tbody>;
});

export const SortableItem = sortableElement(
  ({
    data,
    tableData,
    links,
    onlyDate,
    page,
    date_format,
    date_time_format,
    renderAs = {},
    linksHelperFn = () => {},
  }) => {
    const { role } = useSelector((state) => state.auth);

    return (
      <>
        <tr
        // key={`item-${data}`} index={data}
        >
          <td className="pl-0 py-2">
            <DragHandle />
          </td>
          {tableData.map((tData, index) => {
            let value;
            if (tData == "description") {
              value = (
                <p
                  dangerouslySetInnerHTML={{
                    __html: truncate(data[tData]),
                  }}
                ></p>
              );
            } else if (Object.keys(onlyDate).includes(tData)) {
              if (onlyDate[tData] === "date") {
                value = <Moment format={date_format}>{data[tData]}</Moment>;
              } else if (onlyDate[tData] === "dateTime") {
                value = (
                  <Moment format={date_time_format}>{data[tData]}</Moment>
                );
              }
            } else if (Object.keys(renderAs).includes(tData)) {
              value = renderAs[tData](data[tData], data._id, data);
            } else if (tData === "isActive") {
              if (data[tData]) {
                value = (
                  <span className="label label-lg label-light-success label-inline">
                    Activated
                  </span>
                );
              } else {
                value = (
                  <span className="label label-lg label-light-danger label-inline">
                    Deactivated
                  </span>
                );
              }
            } else if (tData === "isVerified") {
              if (data[tData]) {
                value = (
                  <span className="label label-lg label-light-success label-inline">
                    verified
                  </span>
                );
              } else {
                value = (
                  <span className="label label-lg label-light-danger label-inline">
                    Not verified
                  </span>
                );
              }
            } else if (tData === "status") {
              if (
                data[tData] === "Published" ||
                data[tData] === "Publish" ||
                data[tData] === "Draft"
              ) {
                if (data[tData] === "Published" || data[tData] === "Publish") {
                  value = (
                    <span className="label label-lg label-light-success label-inline">
                      Published
                    </span>
                  );
                } else {
                  value = (
                    <span className="label label-lg label-light-danger label-inline">
                      Draft
                    </span>
                  );
                }
              } else {
                if (data[tData] == "Approved" || data[tData] == "Unapproved") {
                  if (data[tData] == "Approved") {
                    value = (
                      <span className="label label-lg label-light-success label-inline">
                        Approved
                      </span>
                    );
                  } else {
                    value = (
                      <span className="label label-lg label-light-danger label-inline">
                        Unapproved
                      </span>
                    );
                  }
                }
              }
            } else if (tData == "message") {
              value = truncate(data[tData]);
            } else if (tData == "amount") {
              value = `$${data[tData]}`;
            } else if (tData == "country") {
              // value = "131"
              if (data.countryId) {
                value = data.countryId.name;
              } else if (data.country) {
                let countries = "";
                if (data.country && data.country.length > 0) {
                  data.country.forEach((c) => {
                    countries += c.name + ", ";
                  });
                  if (countries != "") {
                    countries = countries.slice(0, -2);
                  }
                }
                value = countries;
              }
            } else if (
              (typeof data.vendor === "object" ||
                typeof data.user === "object") &&
              (tData == "vendor" || tData == "user")
            ) {
              if (data.vendor && data.vendor.businessName) {
                value = data.vendor.businessName;
              } else if (data.user && data.user.businessName) {
                value = data.user.businessName;
              } else if (data.user && data.user.name) {
                value = data.user.name;
              }
            } else if (tData == "category") {
              if (data.category && data.category.name) {
                value = data.category.name;
              } else {
                value = "-";
              }
            } else if (tData == "productCategories") {
              if (data.productCategoryId) {
                let pcategories = "";
                if (
                  data.productCategoryId &&
                  data.productCategoryId.length > 0
                ) {
                  data.productCategoryId.forEach((pc) => {
                    pcategories += pc.name + ", ";
                  });
                  if (pcategories != "") {
                    pcategories = pcategories.slice(0, -2);
                  }
                }
                value = pcategories;
              }
            } else if (tData == "to") {
              value = data && data.to && data.to.name ? data.to.name : data.to;
            } else if (tData == "image") {
              value = data[tData] ? (
                <img
                  src={`${API.PORT}/${data[tData]}`}
                  alt=""
                  data-fancybox
                  height={50}
                  width={80}
                  style={{ cursor: "pointer" }}
                />
              ) : (
                "-"
              );
            } else if (tData == "video") {
              value = data[tData] ? (
                <>
                  <video width="80" height="50" controls>
                    <source
                      style={{ cursor: "pointer" }}
                      src={`${API.PORT}/${data[tData]}`}
                      type="video/mp4"
                    />
                  </video>
                </>
              ) : (
                "-"
              );
            } else if (tData === "answer") {
              value = (
                <p
                  dangerouslySetInnerHTML={{
                    __html: truncate(data[tData]),
                  }}
                ></p>
              );
            }
            // else if (
            //   tData == "likes" ||
            //   tData == "shares" ||
            //   tData == "plays"
            // ) {
            //   value = "-";
            // }
            //  else if (tData === "options") {
            //   return (
            //     <>
            //       <td>
            //         <input
            //           type="checkbox"
            //           style={{ height: "20px" }}
            //           {...register(`filterrequired_${data.value}`)}
            //         />
            //       </td>
            //       <td style={{ paddingLeft: "60px" }}>
            //         <input
            //           type="checkbox"
            //           style={{ height: "20px" }}
            //           {...register(`filter_${data.value}`)}
            //         />
            //       </td>

            //       <td style={{ paddingLeft: "60px" }}>
            //         <span>{order}</span>
            //       </td>
            //       <td style={{ paddingLeft: "60px" }}>{data.label}</td>
            //     </>
            //   );
            // }
            else {
              value = data[tData];
            }

            return (
              <td key={index} className="py-5">
                <div className="d-flex align-items-center">
                  <div className="text-dark-75 mb-1  font-size-lg">
                    {value}
                    {/* <span className="False_text">False</span>  
                     <span className="true_text">True</span>   */}

                    {/* {tData === "description" ? (
                            <p
                              dangerouslySetInnerHTML={{
                                __html: truncate(data[tData]),
                              }}
                            ></p>
                          ) : tData === "createdAt" ? (
                            onlyDate ? (
                              <Moment format={date_format}>
                                {data[tData]}
                              </Moment>
                            ) : (
                              <Moment format={date_time_format}>
                                {data[tData]}
                              </Moment>
                            )
                          ) : tData === "isActive" ? (
                            data[tData] == "true" ? (
                              <span className="label label-lg label-light-success label-inline">
                                Activated
                              </span>
                            ) : (
                              <span className="label label-lg label-light-danger label-inline">
                                Deactivated
                              </span>
                            )
                          ) : (
                            data[tData]
                          )} */}
                  </div>
                </div>
              </td>
            );
          })}

          <td style={{ whiteSpace: "nowrap" }} className="text-left pr-2">
            {links?.map((link, index) => {
              let name = link.name;
              let svg;

              svg = SVG_OBJ[linksHelperFn(name, data)];

              if (name == "Edit" || name == "Add Offer") {
                svg = <Edit />;
              } else if (name == "Delete") {
                svg = <Delete />;
              } else if (name == "View") {
                svg = <View />;
              } else if (name == "Deactivate" && !data.isActive) {
                svg = <MakeActivate />;
              } else if (name == "Draft" && data.status != "Publish") {
                svg = <MakeActivate />;
              } else if (name == "Unapproved" && data.status != "Approved") {
                svg = <MakeActivate />;
              } else if (name == "Activate" && data.isActive) {
                svg = <MakeDeactivate />;
              }
              // else if (name == "DeactivateFeatued" && !data.isFeatured) {
              //   svg = <MakeActivate />;
              // } else if (name == "ActivateFeatued" && data.isFeatured) {
              //   svg = <MakeDeactivate />;
              // }
              else if (name == "Publish" && data.status != "Draft") {
                svg = <MakeDeactivate />;
              } else if (name == "Approved" && data.status != "Unapproved") {
                svg = <MakeDeactivate />;
              } else if (name == "ChangePassword") {
                svg = <ChangePassword />;
              } else if (name == "Add Comment") {
                svg = <Reports />;
              } else if (name == "SendCreds" || name == "Send Alert") {
                svg = <SendCreds />;
              } else if (name == "Wallet") {
                svg = <Wallet />;
              } else if (name == "Login") {
                svg = <Wallet />;
              } else if (name == "Read") {
                svg = <Read />;
              } else if (
                (name == "Approve" && data.approvalStatus == "pending") ||
                (name == "Approve" && data.approvalStatus == "rejected")
              ) {
                svg = <MakeActivate />;
              } else if (name == "Reject" && data.approvalStatus == "pending") {
                svg = <MakeDeactivate />;
              } else if (name == "Verified" && data.isApproved) {
                svg = <MakeDeactivate />;
              } else if (name == "Pending" && !data.isApproved) {
                svg = <MakeActivate />;
              }

              if (link.isLink) {
                return (
                  !data.comment && (
                    <Link
                      key={index}
                      to={
                        link.extraData
                          ? { pathname: `${link.to}/${data._id}`, page }
                          : `${link.to}/${data._id}`
                      }
                      className="btn btn-icon btn-light btn-hover-primary btn-sm mr-2"
                      data-toggle="tooltip"
                      data-placement="top"
                      data-container="body"
                      data-boundary="window"
                      title={link.title || name}
                      data-original-title={link.title || name}
                    >
                      <span className="svg-icon svg-icon-md svg-icon-primary">
                        {svg}
                      </span>
                    </Link>
                  )
                );
              } else {
                return (
                  <Fragment key={index}>
                    {svg && (
                      <a
                        key={index}
                        className={`btn btn-icon btn-light mr-2 ${
                          name === "Delete"
                            ? "btn-hover-danger confirmDelete"
                            : "btn-hover-primary"
                        }  btn-sm `}
                        data-toggle="tooltip"
                        data-placement="top"
                        data-container="body"
                        data-boundary="window"
                        title={link.title || name}
                        data-original-title={link.title || name}
                      >
                        <span
                          onClick={() => link.click(data._id, data)}
                          className={`svg-icon svg-icon-md ${
                            name === "Delete"
                              ? "svg-icon-danger"
                              : "svg-icon-primary"
                          }`}
                        >
                          {svg}
                        </span>
                      </a>
                    )}
                  </Fragment>
                );
              }
            })}
          </td>
        </tr>
      </>
    );
  }
);

const Table = ({
  mainData,
  tableHeading,
  tableData,
  links,
  sortingHandler,
  currentSort,
  onlyDate,
  page,
  dontShowSort = [],
  renderAs = {},
  linksHelperFn = () => {},
  sorting,
  orderHandler,
  sortObj,
  responseKey,
  per_page = 10,
  isCheckbox = false,
  // status,
  checkRegisterHandler,
}) => {
  const { date_format, date_time_format } = useSelector(
    (state) => state.setting
  );

  const [filteredLinks, setFilteredLinks] = useState(links);
  const [items, setItems] = useState([...mainData]);

  const { permission, roleId } = useSelector((state) => state.auth);

  const { request, response, clear } = useRequest();

  useEffect(() => {
    setItems(mainData);
  }, [mainData]);

  useEffect(() => {
    if (response?.status) {
      setItems(response[`${responseKey}`]);
      clear();
    }
  }, [response]);

  const onSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex == newIndex) {
      return;
    }

    request("post", `${sortObj.api}/sort?${orderHandler()}`, {
      oldOrder: oldIndex + 1 + (page - 1) * per_page,
      newOrder: newIndex + 1 + (page - 1) * per_page,
      ...sortObj.data,
    });
  };

  useEffect(() => {
    if (roleId === 2 && permission) {
      setFilteredLinks(getFilteredLinks(links, permission));
    } else {
      setFilteredLinks(links);
    }
  }, [roleId, permission, mainData]);

  return (
    <div className="table-responsive">
      <table
        className="table dataTable table-head-custom table-head-bg table-borderless table-vertical-center"
        id="taskTable"
      >
        <thead>
          <tr className="text-uppercase">
            {sorting && <th></th>}
            {isCheckbox && <th>{checkRegisterHandler("all")} </th>}
            {tableHeading.map((heading, index) => (
              <th
                onClick={() =>
                  dontShowSort.includes(heading)
                    ? null
                    : sortingHandler(heading)
                }
                key={index}
                className={`${
                  currentSort.sortBy == heading
                    ? `sorting_${currentSort.order}`
                    : dontShowSort.includes(heading)
                    ? ""
                    : "sorting"
                }`}
                style={{
                  width:
                    heading === "answer" || heading === "description"
                      ? "400px"
                      : "",
                }}
              >
                <a className="no_sort">{heading}</a>
              </th>
            ))}
            {filteredLinks && filteredLinks.length > 0 ? (
              <th
                // style={{ width: 38 * filteredLinks.length }}
                className="text-left ActionText"
              >
                Action
              </th>
            ) : null}
          </tr>
        </thead>
        {sorting ? (
          <SortableContainer useDragHandle onSortEnd={onSortEnd}>
            {items.map((data, i) => (
              <SortableItem
                key={`item-${i}`}
                index={i}
                data={data}
                tableData={tableData}
                onlyDate={onlyDate}
                links={links}
                page={page}
                date_format={date_format}
                date_time_format={date_time_format}
                renderAs={renderAs}
                linksHelperFn={linksHelperFn}
              />
            ))}
          </SortableContainer>
        ) : (
          <tbody>
            {mainData.length > 0 &&
              mainData.map((data) => (
                <tr key={data._id}>
                  {isCheckbox && (
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="text-dark-75 mb-1  font-size-lg">
                          {checkRegisterHandler(data._id)}
                        </div>
                      </div>
                    </td>
                  )}
                  {tableData.map((tData, index) => {
                    let value;
                    if (tData == "description") {
                      value = (
                        <p
                          dangerouslySetInnerHTML={{
                            __html: truncate(data[tData]),
                          }}
                        ></p>
                      );
                    } else if (Object.keys(onlyDate).includes(tData)) {
                      if (onlyDate[tData] === "date") {
                        value = (
                          <Moment format={date_format}>{data[tData]}</Moment>
                        );
                      } else if (onlyDate[tData] === "dateTime") {
                        value = (
                          <Moment format={date_time_format}>
                            {data[tData]}
                          </Moment>
                        );
                      }
                    } else if (Object.keys(renderAs).includes(tData)) {
                      value = renderAs[tData](data[tData], data._id, data);
                    } else if (tData === "isActive") {
                      if (data[tData]) {
                        value = (
                          <span className="label label-lg label-light-success label-inline">
                            Activated
                          </span>
                        );
                      } else {
                        value = (
                          <span className="label label-lg label-light-danger label-inline">
                            Deactivated
                          </span>
                        );
                      }
                    } else if (tData === "isVerified") {
                      if (data[tData]) {
                        value = (
                          <span className="label label-lg label-light-success label-inline">
                            verified
                          </span>
                        );
                      } else {
                        value = (
                          <span className="label label-lg label-light-danger label-inline">
                            Not verified
                          </span>
                        );
                      }
                    } else if (tData === "status") {
                      if (
                        data[tData] === "Published" ||
                        data[tData] === "Publish" ||
                        data[tData] === "Draft"
                      ) {
                        if (
                          data[tData] === "Published" ||
                          data[tData] === "Publish"
                        ) {
                          value = (
                            <span className="label label-lg label-light-success label-inline">
                              Published
                            </span>
                          );
                        } else {
                          value = (
                            <span className="label label-lg label-light-danger label-inline">
                              Draft
                            </span>
                          );
                        }
                      } else {
                        if (
                          data[tData] == "Approved" ||
                          data[tData] == "Unapproved"
                        ) {
                          if (data[tData] == "Approved") {
                            value = (
                              <span className="label label-lg label-light-success label-inline">
                                Approved
                              </span>
                            );
                          } else {
                            value = (
                              <span className="label label-lg label-light-danger label-inline">
                                Unapproved
                              </span>
                            );
                          }
                        }
                      }
                    } else if (tData == "message") {
                      value = truncate(data[tData]);
                    } else if (tData == "amount") {
                      value = `$${data[tData]}`;
                    } else if (tData == "country") {
                      if (data.countryId) {
                        value = data.countryId.name;
                      } else if (data.country) {
                        let countries = "";
                        if (data.country && data.country.length > 0) {
                          data.country.forEach((c) => {
                            countries += c.name + ", ";
                          });
                          if (countries != "") {
                            countries = countries.slice(0, -2);
                          }
                          value = countries;
                        } else {
                          value = data?.country?.name;
                        }
                      }
                    } else if (
                      (typeof data.vendor === "object" ||
                        typeof data.user === "object") &&
                      (tData == "vendor" || tData == "user")
                    ) {
                      if (data.vendor && data.vendor.businessName) {
                        value = data.vendor.businessName;
                      } else if (data.user && data.user.businessName) {
                        value = data.user.businessName;
                      } else if (data.user && data.user.name) {
                        value = data.user.name;
                      }
                    } else if (tData == "category") {
                      if (data.category && data.category.name) {
                        value = data.category.name;
                      } else {
                        value = "-";
                      }
                    } else if (tData == "productCategories") {
                      if (data.productCategoryId) {
                        let pcategories = "";
                        if (
                          data.productCategoryId &&
                          data.productCategoryId.length > 0
                        ) {
                          data.productCategoryId.forEach((pc) => {
                            pcategories += pc.name + ", ";
                          });
                          if (pcategories != "") {
                            pcategories = pcategories.slice(0, -2);
                          }
                        }
                        value = pcategories;
                      }
                    } else if (tData == "to") {
                      value =
                        data && data.to && data.to.name
                          ? data.to.name
                          : data.to;
                    } else if (tData == "image") {
                      value = data[tData] ? (
                        <img
                          src={`${API.PORT}/${data[tData]}`}
                          alt=""
                          data-fancybox
                          height={50}
                          width={80}
                          style={{ cursor: "pointer" }}
                        />
                      ) : (
                        "-"
                      );
                    } else if (tData == "video") {
                      value = data[tData] ? (
                        <>
                          <video width="80" height="50" controls>
                            <source
                              style={{ cursor: "pointer" }}
                              src={`${API.PORT}/${data[tData]}`}
                              type="video/mp4"
                            />
                          </video>
                        </>
                      ) : (
                        "-"
                      );
                    } else if (tData === "answer") {
                      value = (
                        <p
                          dangerouslySetInnerHTML={{
                            __html: truncate(data[tData]),
                          }}
                        ></p>
                      );
                    }
                    // else if (
                    //   tData == "likes" ||
                    //   tData == "shares" ||
                    //   tData == "plays"
                    // ) {
                    //   value = "-";
                    // }
                    else {
                      value = data[tData];
                    }

                    return (
                      <td key={index} className="py-5">
                        <div className="d-flex align-items-center">
                          <div className="text-dark-75 mb-1  font-size-lg">
                            {value}
                            {/* <span className="False_text">False</span>  
                     <span className="true_text">True</span>   */}

                            {/* {tData === "description" ? (
                            <p
                              dangerouslySetInnerHTML={{
                                __html: truncate(data[tData]),
                              }}
                            ></p>
                          ) : tData === "createdAt" ? (
                            onlyDate ? (
                              <Moment format={date_format}>
                                {data[tData]}
                              </Moment>
                            ) : (
                              <Moment format={date_time_format}>
                                {data[tData]}
                              </Moment>
                            )
                          ) : tData === "isActive" ? (
                            data[tData] == "true" ? (
                              <span className="label label-lg label-light-success label-inline">
                                Activated
                              </span>
                            ) : (
                              <span className="label label-lg label-light-danger label-inline">
                                Deactivated
                              </span>
                            )
                          ) : (
                            data[tData]
                          )} */}
                          </div>
                        </div>
                      </td>
                    );
                  })}

                  <td
                    style={{ whiteSpace: "nowrap" }}
                    className="text-left pr-2"
                  >
                    {links?.map((link, index) => {
                      let name = link.name;
                      let svg;

                      svg = SVG_OBJ[linksHelperFn(name, data)];

                      if (name == "Edit" || name == "Add Offer") {
                        svg = <Edit />;
                      } else if (name == "Delete") {
                        svg = <Delete />;
                      } else if (name == "View") {
                        svg = <View />;
                      } else if (name == "Deactivate" && !data.isActive) {
                        svg = <MakeActivate />;
                      } else if (
                        name == "Draft" &&
                        data.status != "Published"
                      ) {
                        svg = <MakeActivate />;
                      } else if (
                        name == "Unapproved" &&
                        data.status != "Approved"
                      ) {
                        svg = <MakeActivate />;
                      } else if (name == "Activate" && data.isActive) {
                        svg = <MakeDeactivate />;
                      }

                      // else if (name == "DeactivateFeatued" && !data.isFeatured) {
                      //   svg = <MakeActivate />;
                      // } else if (name == "ActivateFeatued" && data.isFeatured) {
                      //   svg = <MakeDeactivate />;
                      // }
                      else if (name == "Published" && data.status != "Draft") {
                        svg = <MakeDeactivate />;
                      } else if (
                        name == "Approved" &&
                        data.status != "Unapproved"
                      ) {
                        svg = <MakeDeactivate />;
                      } else if (name == "ChangePassword") {
                        svg = <ChangePassword />;
                      } else if (name == "Add Comment" || name == "Reports") {
                        svg = <Reports />;
                      } else if (name == "SendCreds" || name == "Send Alert") {
                        svg = <SendCreds />;
                      } else if (name == "Wallet") {
                        svg = <Wallet />;
                      } else if (name == "Login") {
                        svg = <Wallet />;
                      } else if (name == "Read") {
                        svg = <Read />;
                      } else if (
                        (name == "Approve" &&
                          data.approvalStatus == "pending") ||
                        (name == "Approve" && data.approvalStatus == "rejected")
                      ) {
                        svg = <MakeActivate />;
                      } else if (
                        name == "Reject" &&
                        data.approvalStatus == "pending"
                      ) {
                        svg = <MakeDeactivate />;
                      } else if (name == "Building") {
                        svg = <Building />;
                      } else if (name == "Tax") {
                        svg = <Tax />;
                      } else if (name == "Coin") {
                        svg = <Coin />;
                      } else if (name == "Inventory") {
                        svg = <Inventory />;
                      }
                      //   else if (name == "Inventory-Reports") {
                      //   svg = <InventoryReports />;
                      // }
                      else if (name == "Groups") {
                        svg = <Groups />;
                      } else if (name == "Pending" && !data.isApproved) {
                        svg = <MakeActivate />;
                      } else if (name == "Logs") {
                        svg = <Logs />;
                      }

                      if (link.isLink) {
                        return (
                          !data.comment && (
                            <Link
                              key={index}
                              to={
                                link.extraData
                                  ? { pathname: `${link.to}/${data._id}`, page }
                                  : `${link.to}/${data._id}`
                              }
                              className="btn btn-icon btn-light btn-hover-primary btn-sm mr-2"
                              data-toggle="tooltip"
                              data-placement="top"
                              data-container="body"
                              data-boundary="window"
                              title={link.title || name}
                              data-original-title={link.title || name}
                            >
                              <span className="svg-icon svg-icon-md svg-icon-primary">
                                {svg}
                              </span>
                            </Link>
                          )
                        );
                      } else {
                        return (
                          <Fragment key={index}>
                            {svg && (
                              <a
                                key={index}
                                className={`btn btn-icon btn-light mr-2 ${
                                  name === "Delete"
                                    ? "btn-hover-danger confirmDelete"
                                    : "btn-hover-primary"
                                }  btn-sm `}
                                data-toggle="tooltip"
                                data-placement="top"
                                data-container="body"
                                data-boundary="window"
                                title={link.title || name}
                                data-original-title={link.title || name}
                              >
                                <span
                                  onClick={() => link.click(data._id, data)}
                                  className={`svg-icon svg-icon-md ${
                                    name === "Delete"
                                      ? "svg-icon-danger"
                                      : "svg-icon-primary"
                                  }`}
                                >
                                  {svg}
                                </span>
                              </a>
                            )}
                          </Fragment>
                        );
                      }
                    })}
                  </td>
                </tr>
              ))}
          </tbody>
        )}

        {mainData.length == 0 && (
          <tbody>
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                {" "}
                Record not found.
              </td>
            </tr>
          </tbody>
        )}
      </table>
    </div>
  );
};

export default Table;
