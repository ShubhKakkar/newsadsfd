import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import moment from "moment";

import useRequest from "@/hooks/useRequest";
import { createAxiosCookies } from "@/fn";
import { getNotifications } from "@/services/notifications";
import { logout } from "@/store/auth/action";
import Layout from "@/components/Layout";
import Newsletter from "@/components/Newsletter";
import Sidebar from "@/components/customer/Sidebar";
import BreadCrumb from "@/components/customer/BreadCrumb";
import Pagination from "@/components/Pagination";

const Notification = ({ allNotificationList, totalNotificationCount }) => {
  const dispatch = useDispatch();

  const [allNotification, setAllNotification] = useState(allNotificationList);
  const [notificationCount, setNotificationCount] = useState(
    totalNotificationCount
  );
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { request, response } = useRequest();

  const fetchMoreData = ({ selected }) => {
    setPage(selected + 1);
    request("GET", `v1/notification?page=${selected + 1}&perPage=${perPage}`);
  };

  useEffect(() => {
    if (response) {
      setAllNotification(response.notifications);
      setNotificationCount(response.totalNotifications);
    }
  }, [response]);

  return (
    <Layout seoData={{ pageTitle: "Notifications - Noonmar" }}>
      <section className="product-search-listing">
        <div className="container">
          <BreadCrumb values={["Notifications"]} />

          <div className="row g-4 gx-md-5">
            <Sidebar />

            <div className="col-lg-9">
              <div className="Wishists_product_block">
                <div className="Wishists_product">
                  <div className="heading_input">
                    <h2 className="RightBlockTitle">Notifications</h2>
                  </div>
                  <button
                    className="DashlogOutBtn"
                    onClick={() => dispatch(logout())}
                  >
                    <svg
                      width={25}
                      height={24}
                      viewBox="0 0 25 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M16.8125 8.0625L20.75 12L16.8125 15.9375"
                        stroke="white"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10.25 12H20.75"
                        stroke="white"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10.25 20.25H5C4.80109 20.25 4.61032 20.171 4.46967 20.0303C4.32902 19.8897 4.25 19.6989 4.25 19.5V4.5C4.25 4.30109 4.32902 4.11032 4.46967 3.96967C4.61032 3.82902 4.80109 3.75 5 3.75H10.25"
                        stroke="white"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
              <ul style={{ maxHeight: "unset" }} class="notificationListDrop">
                {allNotification.length > 0 ? (
                  allNotification.map((val) => {
                    return (
                      <li key={val._id}>
                        <a href="#!" class="dropdown-item">
                          <div class="notiListCard">
                            {/* <div class="notiListImg">
                              <img src="./img/dash-userimg.jpg" alt="" />
                            </div> */}
                            <div class="notiListContent">
                              <p>
                                <span style={{ textTransform: "capitalize" }}>
                                  {val.actionFor}:{" "}
                                </span>{" "}
                                {val.text}
                              </p>
                              <small>
                                {moment(val.createdAt).format(
                                  "DD MMMM, YYYY | hh:mm A"
                                )}
                              </small>
                            </div>
                          </div>
                        </a>
                      </li>
                    );
                  })
                ) : (
                  <div className="nofoundResult">
                    <div className="msgTitle">No notification found!</div>
                  </div>
                )}
              </ul>
            </div>
          </div>

          {allNotification.length > 0 && (
            <Pagination
              currentPage={page}
              totalItems={notificationCount}
              perPage={perPage}
              fetchMoreItems={fetchMoreData}
            />
          )}
        </div>
      </section>
      <Newsletter />
    </Layout>
  );
};

export async function getServerSideProps(context) {
  await createAxiosCookies(context);

  const { notifications, totalNotifications } = await getNotifications();

  return {
    props: {
      protected: true,
      userTypes: ["customer"],
      allNotificationList: notifications,
      totalNotificationCount: totalNotifications,
      locales: {
        ...require(`../../locales/index/${context.locale}.json`),
      },
    },
  };
}

export default Notification;
