import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import { useRouter } from "next/router";
import { setCookie } from "nookies";

import { capitalizeFirstLetter, capitalizeWord } from "@/fn";
import { MEDIA_URL } from "@/api";
// import "@/public/assets/css/dashboard.css";
// import "@/public/assets/css/dashboard-responsive.css";
import useTranslate from "@/hooks/useTranslate";
import { updateLanguage, logout } from "@/store/auth/action";
import Notification from "../Notification";

const Header = () => {
  const t = useTranslate();

  var parts = window.location.href.split("/");
  var lastSegment = parts.pop() || parts.pop(); // handle potential trailing slash

  const {
    businessName,
    email,
    profilePic,
    role,
    languages,
    firstName,
    lastName,
  } = useSelector((state) => state.auth);

  const titleObj = {
    "my-profile": t("My Profile"),
    products: t("Product Listing"),
    dashboard: t("Dashboard"),
    "add-product": t("Add Product"),
    "order-management": t("Order Management"),
    notifications: t("Notifications"),
  };

  const dispatch = useDispatch();

  const router = useRouter();
  const { locale, asPath } = router;

  const updateLocale = (e) => {
    const lang = e.target.value;
    localStorage.setItem("i18nextLng", lang);
    dispatch(updateLanguage({ language: lang }));

    setCookie(null, "i18nextLng", lang, {
      maxAge: 30 * 24 * 60 * 60 * 100,
      path: "/",
    });

    router.push(asPath, asPath, { locale: lang });
  };

  return (
    <div className="dash_header">
      <div className="dash_logo">
        <Link href="/" legacyBehavior>
          <a>
            <span className="logo-box-hide">
              <img src="/assets/img/logo-icon.png" alt="" />
              <span className="logo-titel">
                <img src="/assets/img/logo-text.png" alt="" />
              </span>
            </span>
          </a>
        </Link>
        <div className="expanded-btn onlymobileView">
          <a href="javascript:void(0);" className="dashIconFold" id="foldBtn">
            <div className="notFolded">
              <i className="fal fa-bars" />
            </div>
            <div className="folded ">
              <i className="far fa-times" />
            </div>
          </a>
        </div>
      </div>
      <div className="nav_dash_wrap">
        <div className="nav_dash_wrpLeft">
          <div className="headpageTitle mobile-title-none">
            {t(titleObj[lastSegment])}
          </div>
          <div className="form-group subject-search deshbord-search">
            <div className="subject-search-icon">
              <input
                type="search"
                className="form-control search-icon-input"
                placeholder={t("Search...")}
              />
              <span className="dashboardSearchIcon">
                <svg
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M23.414 20.586L18.337 15.509C19.386 13.928 20 12.035 20 10C20 4.486 15.514 0 10 0C4.486 0 0 4.486 0 10C0 15.514 4.486 20 10 20C12.035 20 13.928 19.386 15.509 18.337L20.586 23.414C21.366 24.195 22.634 24.195 23.414 23.414C24.195 22.633 24.195 21.367 23.414 20.586ZM3 10C3 6.14 6.14 3 10 3C13.86 3 17 6.14 17 10C17 13.86 13.86 17 10 17C6.14 17 3 13.86 3 10Z"
                    fill="#F7CB50"
                  />
                </svg>
              </span>
            </div>
          </div>
          <div className="dekstop-search-btn-none">
            <a href="#" className="toggle_search">
              {" "}
              <i className="fas fa-search" />
            </a>
          </div>
        </div>
        <div className="navbar_ nav_dash_wrpRight">
          <div className="nav_right_notification nav_right_langugae">
            <div className="nav-item langugae_filter for_desktop">
              <div className="nav-item dropdown user_dropdown">
                <a
                  className="nav-link dropdown-toggle userActionBtn"
                  // href="javascript:void(0);"
                  id="lang-drop"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  {capitalizeWord(locale)} <i className="far fa-chevron-down" />
                </a>
                <div className="dropdown-menu" aria-labelledby="lang-drop">
                  <div onChange={updateLocale} className="lang_dropdown">
                    {languages.map((lang) => (
                      <div className="form-group custom_radio">
                        <input
                          type="radio"
                          id={lang.name}
                          value={lang.code}
                          name="radio-group"
                          defaultChecked={locale === lang.code}
                        />
                        <label htmlFor={lang.name}>{lang.name}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* <div className="nav_right_notification">
            <a href="javascript:void(0);" className="rightMenuBtn newNotiMsg">
              <svg
                width={24}
                height={24}
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
          </div> */}
          <Notification />
          <div className="nav_right_notification landDropDown dropdown">
            <div className="nav-item dropdown user_dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="javascript:void(0);"
                id="user-drop"
                role="button"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                {profilePic ? (
                  <img src={`${MEDIA_URL}/${profilePic}`} alt="" />
                ) : (
                  <img src="/assets/img/profile-img.jpg" alt="" />
                )}
                <span className="logUserNme">
                  {`${firstName + " " + lastName} `}
                  {role && <span>{capitalizeFirstLetter(role)}</span>}
                  <i className="far fa-chevron-down" />
                </span>
              </a>
              <div
                className="dropdown-menu vendor-user-drop"
                aria-labelledby="user-drop"
              >
                <div className="lang_dropdown user_info">
                  <div className="user_name">
                    <div>{`${firstName + " " + lastName} `}</div>
                    {email && (
                      <div className="user_email">
                        <small>{email}</small>
                      </div>
                    )}
                  </div>
                  <ul>
                    <li>
                      <Link href="/vendor/my-profile">
                        <i className="ion-android-person" />
                        {t("My Profile")}
                      </Link>
                    </li>
                    <li>
                      <a
                        href="javascript:void(0);"
                        onClick={() => {
                          dispatch(logout());
                          router.push("/vendor/login");
                        }}
                      >
                        <i class="ion-log-out"></i> {t("Logout")}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
