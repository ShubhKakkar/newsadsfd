import moment from "moment";
import Link from "next/link";
import React from "react";
import { useSelector } from "react-redux";

const Notification = () => {
  const { notifications, role } = useSelector((store) => store.auth);

  return (
    <>
      <div class="nav_right_notification dropdown mr-15_">
        <a
          href="javascript:void(0);"
          class="rightMenuBtn newNotiMsg iconLinks"
          data-bs-toggle="dropdown"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.6712 18.5536C21.0284 17.9805 20.4656 17.3235 19.9979 16.6003C19.4874 15.602 19.1814 14.5117 19.0979 13.3936V10.1003C19.1023 8.344 18.4653 6.64658 17.3064 5.32691C16.1476 4.00724 14.5467 3.15617 12.8046 2.93359V2.07359C12.8046 1.83755 12.7108 1.61118 12.5439 1.44427C12.377 1.27736 12.1506 1.18359 11.9146 1.18359C11.6785 1.18359 11.4522 1.27736 11.2853 1.44427C11.1184 1.61118 11.0246 1.83755 11.0246 2.07359V2.94693C9.29809 3.18555 7.71656 4.04176 6.57294 5.357C5.42931 6.67223 4.80107 8.35736 4.80458 10.1003V13.3936C4.72109 14.5117 4.4151 15.602 3.90458 16.6003C3.44517 17.3218 2.89138 17.9788 2.25792 18.5536C2.1868 18.6161 2.12981 18.693 2.09073 18.7792C2.05165 18.8654 2.03137 18.9589 2.03125 19.0536V19.9603C2.03125 20.1371 2.10149 20.3066 2.22651 20.4317C2.35154 20.5567 2.52111 20.6269 2.69792 20.6269H21.2313C21.4081 20.6269 21.5776 20.5567 21.7027 20.4317C21.8277 20.3066 21.8979 20.1371 21.8979 19.9603V19.0536C21.8978 18.9589 21.8775 18.8654 21.8384 18.7792C21.7994 18.693 21.7424 18.6161 21.6712 18.5536ZM3.41792 19.2936C4.03819 18.6944 4.58432 18.0229 5.04458 17.2936C5.68766 16.0879 6.06287 14.7576 6.14458 13.3936V10.1003C6.11814 9.31895 6.2492 8.54031 6.52995 7.81071C6.81069 7.0811 7.23539 6.41545 7.77875 5.85339C8.32211 5.29134 8.97301 4.84437 9.6927 4.53911C10.4124 4.23385 11.1862 4.07653 11.9679 4.07653C12.7497 4.07653 13.5234 4.23385 14.2431 4.53911C14.9628 4.84437 15.6137 5.29134 16.1571 5.85339C16.7004 6.41545 17.1251 7.0811 17.4059 7.81071C17.6866 8.54031 17.8177 9.31895 17.7913 10.1003V13.3936C17.873 14.7576 18.2482 16.0879 18.8913 17.2936C19.3515 18.0229 19.8976 18.6944 20.5179 19.2936H3.41792Z"
              fill="#FF6000"
            />
            <path
              d="M11.9976 22.854C12.4176 22.8443 12.8206 22.6864 13.1353 22.4083C13.4501 22.1301 13.6564 21.7496 13.7176 21.334H10.2109C10.2739 21.7609 10.4898 22.1503 10.8185 22.4299C11.1471 22.7095 11.5662 22.8602 11.9976 22.854Z"
              fill="#FF6000"
            />
          </svg>
        </a>
        <div class="dropdown-menu dropdown-menu-end">
          <div class="notiHeader_top">
            <div class="notiHeaderTopHeading">
              <i class="fal fa-bell"></i>
              <span class="">Notifications</span>
            </div>
            <Link
              class="viewOfrBtn mt-0"
              href={
                role === "vendor"
                  ? `/vendor/notifications`
                  : role === "customer"
                  ? `/customer/notifications`
                  : ""
              }
            >
              <small>View All</small>
            </Link>
          </div>

          <ul class="notificationListDrop">
            {notifications?.length > 0 ? (
              notifications?.map((val) => {
                return (
                  <li key={val._id}>
                    <a href="javascript:void(0);" class="dropdown-item">
                      <div class="notiListCard">
                        {/* <div class="notiListImg">
                      <img src="./img/dash-userimg.jpg" alt="" />
                    </div> */}
                        <div class="notiListContent">
                          <p style={{ textTransform: "capitalize" }}>
                            <span> {val.actionFor} : </span>
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
                {/* <p>
                Please check the spelling or try searching for something else
              </p> */}
              </div>
            )}
          </ul>

          {/* <li>
              <a href="javascript:void(0);" class="dropdown-item">
                <div class="notiListCard">
                  <div class="notiListImg">
                    <img src="./img/dash-userimg.jpg" alt="" />
                  </div>
                  <div class="notiListContent">
                    <p>
                      Channel: <span>Social Relationship</span> request to join
                      has be accepted.
                    </p>
                    <small>04 April, 2021 | 04:00 PM</small>
                  </div>
                </div>
              </a>
            </li>
            <li>
              <a href="javascript:void(0);" class="dropdown-item">
                <div class="notiListCard">
                  <div class="notiListImg">
                    <img src="./img/dash-userimg.jpg" alt="" />
                  </div>
                  <div class="notiListContent">
                    <p>
                      Channel: <span>Social Relationship</span> request to join
                      has be accepted.
                    </p>
                    <small>04 April, 2021 | 04:00 PM</small>
                  </div>
                </div>
              </a>
            </li>
            <li>
              <a href="javascript:void(0);" class="dropdown-item">
                <div class="notiListCard">
                  <div class="notiListImg">
                    <img src="./img/dash-userimg.jpg" alt="" />
                  </div>
                  <div class="notiListContent">
                    <p>
                      Channel: <span>Social Relationship</span> request to join
                      has be accepted.
                    </p>
                    <small>04 April, 2021 | 04:00 PM</small>
                  </div>
                </div>
              </a>
            </li>
            <li>
              <a href="javascript:void(0);" class="dropdown-item">
                <div class="notiListCard">
                  <div class="notiListImg">
                    <img src="./img/dash-userimg.jpg" alt="" />
                  </div>
                  <div class="notiListContent">
                    <p>
                      Channel: <span>Social Relationship</span> request to join
                      has be accepted.
                    </p>
                    <small>04 April, 2021 | 04:00 PM</small>
                  </div>
                </div>
              </a>
            </li>
            <li>
              <a href="javascript:void(0);" class="dropdown-item">
                <div class="notiListCard">
                  <div class="notiListImg">
                    <img src="./img/dash-userimg.jpg" alt="" />
                  </div>
                  <div class="notiListContent">
                    <p>
                      Channel: <span>Social Relationship</span> request to join
                      has be accepted.
                    </p>
                    <small>04 April, 2021 | 04:00 PM</small>
                  </div>
                </div>
              </a>
            </li>
            <li>
              <a href="javascript:void(0);" class="dropdown-item">
                <div class="notiListCard">
                  <div class="notiListImg">
                    <img src="./img/dash-userimg.jpg" alt="" />
                  </div>
                  <div class="notiListContent">
                    <p>
                      Channel: <span>Social Relationship</span> request to join
                      has be accepted.
                    </p>
                    <small>04 April, 2021 | 04:00 PM</small>
                  </div>
                </div>
              </a>
            </li>
            <li>
              <a href="javascript:void(0);" class="dropdown-item">
                <div class="notiListCard">
                  <div class="notiListImg">
                    <img src="./img/dash-userimg.jpg" alt="" />
                  </div>
                  <div class="notiListContent">
                    <p>
                      Channel: <span>Social Relationship</span> request to join
                      has be accepted.
                    </p>
                    <small>04 April, 2021 | 04:00 PM</small>
                  </div>
                </div>
              </a>
            </li> */}
        </div>
      </div>
    </>
  );
};

export default Notification;
