import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import moment from "moment";

import { createAxiosCookies } from "@/fn";
import Layout from "@/components/Vendor/Layout";
import useRequest from "@/hooks/useRequest";
import { getNotifications } from "@/services/notifications";
import Pagination from "@/components/Pagination";

const Notifications = ({ allNotificationList, totalNotificationCount }) => {
  const t = useTranslations("Index");

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
    <Layout seoData={{ pageTitle: "Notifications- Noonmar" }}>
      <div className="main_content">
        <div className="col-12">
          <div className="headpageTitle mobile-title-show">
            {t("Notifications")}
          </div>
        </div>

        <div className="col-lg-9">
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

        {allNotification.length > 0 && (
          <Pagination
            currentPage={page}
            totalItems={notificationCount}
            perPage={perPage}
            fetchMoreItems={fetchMoreData}
          />
        )}
      </div>
    </Layout>
  );
};

export async function getServerSideProps(context) {
  await createAxiosCookies(context);

  const { notifications, totalNotifications } = await getNotifications();

  return {
    props: {
      protected: true,
      userTypes: ["vendor"],
      allNotificationList: notifications,
      totalNotificationCount: totalNotifications,
      locales: {
        ...require(`../../locales/index/${context.locale}.json`),
      },
    },
  };
}

export default Notifications;
