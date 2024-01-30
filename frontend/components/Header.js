import { useEffect, useRef, useState, useCallback, Fragment } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { setCookie } from "nookies";
import AsyncSelect from "react-select/async";
import { useForm } from "react-hook-form";
import { Controller } from "react-hook-form";

import { updateLanguage, logout, updateRedux } from "@/store/auth/action";
import useTranslate from "@/hooks/useTranslate";
import { DummyUser } from "./Svg";
import { MEDIA_URL } from "@/api";
import { debounce, axiosInstance } from "@/fn";
import useRequestTwo from "@/hooks/useRequestTwo";
import useRequest from "@/hooks/useRequest";
import NavLink from "./NavLink";
import MenuItem from "./Menu/Item";
import Notification from "./Notification";

const capitalizeWord = (word) => {
  return word.toUpperCase();
};

const Header = () => {
  const {
    socialSettings,
    languages,
    loggedIn,
    firstName,
    lastName,
    email,
    userId,
    role,
    profilePic,
    countries,
    currentCountry,
    categories,
  } = useSelector((state) => state.auth);

  const vijayData = useSelector((state) => state);

  const [selectedCountry, setSelectedCountry] = useState({
    id: null,
    name: null,
  });

  const [searchResults, setSearchResults] = useState([]);

  const { locale, locales, route, pathname, query, asPath, push, replace } =
    useRouter();

  const dispatch = useDispatch();

  const { request: requestCategories, response: responseCategories } =
    useRequest();

  const { request } = useRequestTwo();
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [isMobile, setIsMobile] = useState(false);
  const t = useTranslate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    trigger,
    clearErrors,
    unregister,
    control,
  } = useForm();

  useEffect(() => {
    if (currentCountry) {
      const country = countries.find((c) => c._id === currentCountry);

      if (country) {
        setSelectedCountry({ id: country._id, name: country.name });
      }
    }
  }, [currentCountry]);

  useEffect(() => {
    const handleResize = () => {
      const newScreenWidth = window.innerWidth;
      setScreenWidth(newScreenWidth);
      getViewType(newScreenWidth);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };

  }, []);

  function getViewType(width) {
    if (width < 768) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  }
  useEffect(() => {
    if (responseCategories) {
      if (responseCategories.status) {
        const { categories } = responseCategories;

        dispatch(
          updateRedux({
            categories,
          })
        );
      }
    }
  }, [responseCategories]);

  const updateLocale = (e) => {
    const lang = e.target.value;
    localStorage.setItem("i18nextLng", lang);
    dispatch(updateLanguage({ language: lang }));

    setCookie(null, "i18nextLng", lang, {
      maxAge: 30 * 24 * 60 * 60 * 100,
      path: "/",
    });

    push(asPath, asPath, { locale: lang });

    requestCategories(
      "GET",
      "v1/product-categories/by-country",
      {},
      {
        "Accept-Language": lang,
      }
    );
  };

  const searchTermClickHandler = (e) => {
    const data = searchResults.find((res) => res._id === e.value);

    if (data) {
      switch (data.searchType) {
        case "product": {
          push(`/product/${data.slug}?vendor=${data.vendor}`);
          break;
        }
        case "productCategory": {
          push(`/category/${data.slug}`);
          break;
        }
        // case "subProductCategory": {
        //   push(
        //     `/category/${data.masterCategorySlug}/sub-category/${data.slug}`
        //   );
        //   break;
        // }
        case "brand": {
          push(`/brand/${data.slug}`);
          break;
        }
        default: {
          break;
        }
      }
    }
  };

  const loadOptionsDebounced = useCallback(
    debounce(async (inputValue, callback) => {
      if (inputValue.trim().length < 1) {
        callback([]);
      } else {
        const response = await request(
          "GET",
          `v1/home/search?term=${inputValue}`
        );

        setSearchResults(response.data.results);

        callback(
          response.data.results.map((b) => ({ value: b._id, label: b.name }))
        );
      }
    }, 500),
    []
  );

  // const myProfileHandler = () => {
  //   console.log(`${role}/my-profile`);
  //   push(
  //     { pathname: `/${role}/my-profile`, query: { id: userId } },
  //     `/${role}/my-profile`
  //   );
  // };
  const menuOpen = () => {
    let ele = document.getElementById("menu-opened");
    let ele1 = document.getElementById("menu-show");
    let ele2 = document.getElementById("menuoverlay");
    var displayPropertyValue = window
      .getComputedStyle(ele2)
      .getPropertyValue("display");

    if (!ele.classList.contains("menu-opened")) {
      ele.classList.add("menu-opened");
    }
    if (!ele1.classList.contains("menu-show")) {
      ele1.classList.add("menu-show");
    }

    if (displayPropertyValue === "none") {
      ele2.style.display = "block";
    } else if (displayPropertyValue === "block") {
      ele2.style.display = "none";
    }
  };

  const menuClose = () => {
    let ele = document.getElementById("menu-opened");
    let ele1 = document.getElementById("menu-show");
    let ele2 = document.getElementById("menuoverlay");
    var displayPropertyValue = window
      .getComputedStyle(ele2)
      .getPropertyValue("display");

    if (ele.classList.contains("menu-opened")) {
      ele.classList.remove("menu-opened");
    }
    if (ele1.classList.contains("menu-show")) {
      ele1.classList.remove("menu-show");
      ele1.style.zIndex = 200000;
    }

    if (displayPropertyValue === "none") {
      ele2.style.display = "block";
    } else if (displayPropertyValue === "block") {
      ele2.style.display = "none";
    }
  };

  return (
    <header id="header">
      <div className="container">
        <div className="row_">
          <div className="col-12 topHeader">
            <nav className="navbar navbar-expand-lg">
              <Link href="/" legacyBehavior>
                <a className="navbar-brand">
                  <img src="/assets/img/logo.png" alt="" />
                </a>
              </Link>
              <button
                className="navbar-toggler"
                type="button"
                id="menu-opened"
                onClick={menuOpen}
              >
                <span className="navbar-toggler-icon" />
              </button>

              <div className="headerTopbar ms-auto">
                <div className="extra_nav">
                  <ul className="navbar-nav ms-auto">
                    <li className="nav-item langugae_filter for_desktop">
                      <div className="nav-item dropdown user_dropdown">
                        <a
                          className="nav-link dropdown-toggle userActionBtn"
                          href="javascript:void(0);"
                          id="lang-drop"
                          role="button"
                          data-bs-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="false"
                        >
                          {capitalizeWord(locale)}
                          <i className="far fa-chevron-down" />
                        </a>
                        <div
                          className="dropdown-menu"
                          aria-labelledby="lang-drop"
                        >
                          <div
                            onChange={updateLocale}
                            className="lang_dropdown"
                          >
                            {languages.map((lang) => (
                              <div
                                key={lang.code}
                                className="form-group custom_radio"
                              >
                                <input
                                  type="radio"
                                  id={lang.name}
                                  value={lang.code}
                                  name="radio-group"
                                  checked={locale === lang.code}
                                />
                                <label
                                  className={
                                    locale === lang.code
                                      ? "checked_radio_button_label"
                                      : ""
                                  }
                                  htmlFor={lang.name}
                                >
                                  {lang.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </li>

                    <li className="nav-item langugae_filter for_desktop">
                      <Link href="/help-&-support" legacyBehavior>
                        <a className="nav-link">
                          <svg
                            width={22}
                            height={22}
                            viewBox="0 0 22 22"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g clipPath="url(#clip0_101_238)">
                              <path
                                d="M22 14.8888C22 12.1587 20.4338 9.72227 18.0881 8.53711C18.0153 13.7716 13.7715 18.0154 8.53699 18.0883C9.72215 20.4339 12.1586 22.0001 14.8886 22.0001C16.1686 22.0001 17.4134 21.6592 18.5071 21.0115L21.9689 21.969L21.0114 18.5072C21.6591 17.4135 22 16.1688 22 14.8888Z"
                                fill="currentColor"
                              />
                              <path
                                d="M16.8008 8.40039C16.8008 3.76833 13.0325 0 8.40039 0C3.76833 0 0 3.76833 0 8.40039C0 9.91 0.401825 11.3798 1.16486 12.6702L0.0308838 16.7697L4.13054 15.6359C5.42094 16.399 6.89078 16.8008 8.40039 16.8008C13.0325 16.8008 16.8008 13.0325 16.8008 8.40039ZM7.11133 6.44531H5.82227C5.82227 5.02365 6.97873 3.86719 8.40039 3.86719C9.82205 3.86719 10.9785 5.02365 10.9785 6.44531C10.9785 7.16689 10.673 7.86043 10.1401 8.34785L9.04492 9.35023V10.3555H7.75586V8.78258L9.26984 7.39684C9.54041 7.14926 9.68945 6.81139 9.68945 6.44531C9.68945 5.73448 9.11122 5.15625 8.40039 5.15625C7.68956 5.15625 7.11133 5.73448 7.11133 6.44531ZM7.75586 11.6445H9.04492V12.9336H7.75586V11.6445Z"
                                fill="currentColor"
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_101_238">
                                <rect width={22} height={22} fill="white" />
                              </clipPath>
                            </defs>
                          </svg>
                          <span> {t("Support")}</span>
                          {/* <span> Support</span> */}
                        </a>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              {/* For Mobile */}
              <div className="extra_nav for_mobile">
                {loggedIn && (
                  <div className="userCartTab">
                    <a href="javascript:void(0)" className="iconLinks">
                      <svg
                        width={21}
                        height={25}
                        viewBox="0 0 21 25"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20.4993 21.6104L19.0678 5.4908C19.0371 5.13292 18.7354 4.86196 18.3827 4.86196H15.4379C15.397 2.1728 13.1986 0 10.4993 0C7.79987 0 5.6015 2.1728 5.5606 4.86196H2.61582C2.25794 4.86196 1.96142 5.13292 1.93075 5.4908L0.499253 21.6104C0.499253 21.6309 0.494141 21.6513 0.494141 21.6718C0.494141 23.5072 2.17614 25 4.2467 25H16.7518C18.8224 25 20.5044 23.5072 20.5044 21.6718C20.5044 21.6513 20.5044 21.6309 20.4993 21.6104ZM10.4993 1.38037C12.4369 1.38037 14.0166 2.93456 14.0575 4.86196H6.94097C6.98187 2.93456 8.56162 1.38037 10.4993 1.38037ZM16.7518 23.6196H4.2467C2.94813 23.6196 1.89496 22.7607 1.87451 21.7025L3.24465 6.24744H5.55549V8.34356C5.55549 8.72699 5.86224 9.03374 6.24567 9.03374C6.62911 9.03374 6.93586 8.72699 6.93586 8.34356V6.24744H14.0575V8.34356C14.0575 8.72699 14.3643 9.03374 14.7477 9.03374C15.1312 9.03374 15.4379 8.72699 15.4379 8.34356V6.24744H17.7487L19.124 21.7025C19.1035 22.7607 18.0453 23.6196 16.7518 23.6196Z"
                          fill="#FF6000"
                        />
                      </svg>
                    </a>
                    <Link href="/customer/wishlist" className="iconLinks">
                      <svg
                        width={27}
                        height={24}
                        viewBox="0 0 27 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M24.8191 2.33507C23.4053 0.921255 21.5336 0.14852 19.5359 0.14852C17.5383 0.14852 15.6608 0.926979 14.247 2.3408L13.5086 3.07919L12.7587 2.32935C11.3449 0.915531 9.46175 0.131348 7.46408 0.131348C5.47214 0.131348 3.59468 0.909807 2.18659 2.3179C0.772767 3.73172 -0.00569262 5.60918 3.13428e-05 7.60685C3.13428e-05 9.60451 0.784214 11.4762 2.19803 12.8901L12.9476 23.6397C13.0965 23.7885 13.2968 23.8686 13.4914 23.8686C13.686 23.8686 13.8864 23.7942 14.0352 23.6454L24.8077 12.913C26.2215 11.4991 27 9.62168 27 7.62402C27.0057 5.62635 26.233 3.74889 24.8191 2.33507ZM23.7201 11.8197L13.4914 22.0083L3.28559 11.8025C2.16369 10.6806 1.5455 9.19238 1.5455 7.60685C1.5455 6.02131 2.15797 4.53308 3.27986 3.4169C4.39604 2.30073 5.88427 1.68254 7.46408 1.68254C9.04962 1.68254 10.5436 2.30073 11.6655 3.42263L12.9591 4.71624C13.2625 5.01961 13.749 5.01961 14.0524 4.71624L15.3345 3.43408C16.4564 2.31218 17.9504 1.69399 19.5302 1.69399C21.11 1.69399 22.5982 2.31218 23.7201 3.42835C24.842 4.55025 25.4545 6.03848 25.4545 7.62402C25.4602 9.20956 24.842 10.6978 23.7201 11.8197Z"
                          fill="currentColor"
                        />
                      </svg>
                    </Link>
                    <Link href="/cart" className="iconLinks">
                      <svg
                        width={33}
                        height={34}
                        viewBox="0 0 33 34"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.90662 22.228H28.0897C30.1514 22.228 31.8334 20.546 31.8334 18.4842V10.8339C31.8334 10.8271 31.8334 10.8136 31.8334 10.8068C31.8334 10.7865 31.8334 10.7729 31.8334 10.7525C31.8334 10.739 31.8334 10.7254 31.8266 10.7118C31.8266 10.6983 31.8199 10.6779 31.8199 10.6644C31.8199 10.6508 31.8131 10.6372 31.8131 10.6237C31.8063 10.6101 31.8063 10.5966 31.7995 10.5762C31.7927 10.5626 31.7927 10.5491 31.7859 10.5355C31.7792 10.5219 31.7792 10.5084 31.7724 10.4948C31.7656 10.4813 31.7588 10.4677 31.752 10.4473C31.7452 10.4338 31.7385 10.4202 31.7317 10.4134C31.7249 10.3999 31.7181 10.3863 31.7113 10.3727C31.7046 10.3592 31.6978 10.3524 31.691 10.3388C31.6842 10.3253 31.6706 10.3117 31.6639 10.2981C31.6571 10.2846 31.6503 10.2778 31.6367 10.2642C31.6299 10.2507 31.6164 10.2439 31.6096 10.2303C31.6028 10.2167 31.5893 10.21 31.5825 10.1964C31.5757 10.1828 31.5621 10.1761 31.5553 10.1693C31.5418 10.1557 31.535 10.1489 31.5214 10.1354C31.5079 10.1286 31.5011 10.115 31.4875 10.1082C31.474 10.1015 31.4604 10.0879 31.4468 10.0811C31.4333 10.0743 31.4265 10.0675 31.4129 10.0608C31.3994 10.054 31.3858 10.0472 31.3722 10.0336C31.3587 10.0268 31.3451 10.0201 31.3315 10.0133C31.318 10.0065 31.3044 9.99972 31.2908 9.99294C31.2773 9.98615 31.2637 9.97937 31.2501 9.97259C31.2366 9.96581 31.223 9.96581 31.2095 9.95903C31.1959 9.95224 31.1755 9.94546 31.162 9.94546C31.1484 9.94546 31.1349 9.93868 31.1281 9.93868C31.1077 9.9319 31.0942 9.9319 31.0738 9.9319C31.067 9.9319 31.0602 9.92511 31.0467 9.92511L8.00083 6.74427V3.52952C8.00083 3.49561 8.00083 3.46169 7.99404 3.43457C7.99404 3.42778 7.99404 3.421 7.98726 3.40744C7.98726 3.38709 7.98048 3.36674 7.98048 3.3464C7.9737 3.32605 7.9737 3.31249 7.96691 3.29214C7.96691 3.27858 7.96013 3.27179 7.96013 3.25823C7.95335 3.23788 7.94657 3.21754 7.93979 3.19719C7.93979 3.19041 7.933 3.17684 7.933 3.17006C7.92622 3.14971 7.91944 3.13615 7.90587 3.1158C7.89909 3.10902 7.89909 3.09546 7.89231 3.08867C7.88553 3.07511 7.87875 3.06155 7.86518 3.04798C7.8584 3.03442 7.85162 3.02763 7.84483 3.01407C7.83805 3.00051 7.83127 2.99372 7.82449 2.98016C7.81771 2.9666 7.80414 2.95303 7.79736 2.93947C7.79058 2.93268 7.7838 2.9259 7.77701 2.91912C7.76345 2.90556 7.74988 2.89199 7.73632 2.87843C7.72954 2.87164 7.72276 2.86486 7.71597 2.85808C7.70241 2.84452 7.68884 2.83095 7.6685 2.81739C7.66172 2.8106 7.64815 2.80382 7.64137 2.79704C7.6278 2.78348 7.61424 2.77669 7.60068 2.76313C7.58033 2.74957 7.55998 2.736 7.54642 2.72922C7.53964 2.72244 7.53285 2.72244 7.52607 2.71565C7.49894 2.70209 7.46503 2.68853 7.4379 2.67496L2.43944 0.572485C1.97146 0.375801 1.43567 0.592831 1.23899 1.0608C1.04231 1.52877 1.25934 2.06456 1.72731 2.26125L6.16285 4.13313V8.28383V8.9417V13.9876V18.4978V24.1948C6.16285 26.0938 7.58711 27.6673 9.42508 27.9047C9.09276 28.4608 8.89607 29.1119 8.89607 29.8037C8.89607 31.8451 10.5577 33.5 12.5924 33.5C14.627 33.5 16.2887 31.8383 16.2887 29.8037C16.2887 29.1255 16.1055 28.4812 15.78 27.9386H24.0136C23.688 28.488 23.5049 29.1255 23.5049 29.8037C23.5049 31.8451 25.1665 33.5 27.2012 33.5C29.2358 33.5 30.8975 31.8383 30.8975 29.8037C30.8975 27.769 29.2358 26.1074 27.2012 26.1074H9.90662C8.8486 26.1074 7.99404 25.2461 7.99404 24.1948V21.7126C8.55018 22.0381 9.20805 22.228 9.90662 22.228ZM14.4642 29.7969C14.4642 30.8278 13.6233 31.662 12.5991 31.662C11.575 31.662 10.734 30.821 10.734 29.7969C10.734 28.7728 11.575 27.9318 12.5991 27.9318C13.6233 27.9318 14.4642 28.766 14.4642 29.7969ZM29.0731 29.7969C29.0731 30.8278 28.2321 31.662 27.208 31.662C26.1839 31.662 25.3429 30.821 25.3429 29.7969C25.3429 28.7728 26.1839 27.9318 27.208 27.9318C28.2321 27.9318 29.0731 28.766 29.0731 29.7969ZM28.0897 20.3968H9.90662C8.8486 20.3968 7.99404 19.5355 7.99404 18.4842V13.9741V8.92813V8.58902L30.0022 11.6207V18.4774C30.0022 19.5423 29.1409 20.3968 28.0897 20.3968Z"
                          fill="currentColor"
                        />
                      </svg>
                      {/* <span className="userCardCounter">5</span> */}
                    </Link>
                  </div>
                )}
              </div>

              {!loggedIn && (
                <div className="signIn">
                  <Link href="/customer/login" legacyBehavior>
                    <a className="nav-link">
                      <svg
                        width={24}
                        height={25}
                        viewBox="0 0 24 25"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 0.5C5.4948 0.5 0 5.9948 0 12.5C0 19.0052 5.4948 24.5 12 24.5C18.5052 24.5 24 19.0052 24 12.5C24 5.9948 18.5052 0.5 12 0.5ZM12 6.5C14.0724 6.5 15.6 8.0264 15.6 10.1C15.6 12.1736 14.0724 13.7 12 13.7C9.9288 13.7 8.4 12.1736 8.4 10.1C8.4 8.0264 9.9288 6.5 12 6.5ZM5.8728 18.2264C6.9492 16.6424 8.7444 15.5864 10.8 15.5864H13.2C15.2568 15.5864 17.0508 16.6424 18.1272 18.2264C16.5936 19.868 14.418 20.9 12 20.9C9.582 20.9 7.4064 19.868 5.8728 18.2264Z"
                          fill="currentColor"
                        />
                      </svg>{" "}
                      <span>{t("Sign In")}</span>
                    </a>
                  </Link>
                </div>
              )}
              {/*  ======= User DropDown =========  */}

              {loggedIn && (
                <>
                  {/* <div class="nav_right_notification">
                    <a
                      href="javascript:void(0);"
                      class="rightMenuBtn newNotiMsg"
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
                  </div> */}

                  <Notification />

                  <div class="nav-item dropdown user_dropdown">
                    <a
                      class="nav-link dropdown-toggle userActionBtn"
                      href="javascript:void(0);"
                      id="user-drop"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      {profilePic ? (
                        <img src={`${MEDIA_URL}/${profilePic}`} />
                      ) : (
                        <DummyUser />
                      )}
                    </a>
                    <div
                      class="dropdown-menu uInfoDropdown"
                      aria-labelledby="user-drop"
                    >
                      <div class="user_info lang_dropdown">
                        <div class="user_name">
                          <div>{`${firstName} ${lastName}`}</div>
                          <div class="user_email">
                            <small>{email}</small>
                          </div>
                        </div>
                        <ul>
                          <li>
                            <Link href={`/${role}/my-profile`}>
                              <i className="ion-android-person" />
                              {t("My Profile")}
                            </Link>
                          </li>
                          <li>
                            <a
                              href="javascript:void(0);"
                              onClick={() => {
                                dispatch(logout());
                                setTimeout(() => push(asPath, asPath), 0);
                              }}
                            >
                              <i class="ion-log-out"></i> {t("Logout")}
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </nav>
          </div>
          <div className="row align-items-center HeaderSearchBar">
            <div className="col-lg-6">
              <div className="topSearchBox">
                {/* <div className="locTab">
                  <svg
                    width={22}
                    height={26}
                    viewBox="0 0 22 26"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10.6 14.2C12.5882 14.2 14.2 12.5882 14.2 10.6C14.2 8.61177 12.5882 7 10.6 7C8.61177 7 7 8.61177 7 10.6C7 12.5882 8.61177 14.2 10.6 14.2Z"
                      stroke="white"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10.6 1C8.05392 1 5.61212 2.01143 3.81178 3.81178C2.01143 5.61212 1 8.05392 1 10.6C1 12.8704 1.4824 14.356 2.8 16L10.6 25L18.4 16C19.7176 14.356 20.2 12.8704 20.2 10.6C20.2 8.05392 19.1886 5.61212 17.3882 3.81178C15.5879 2.01143 13.1461 1 10.6 1V1Z"
                      stroke="white"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="LocName">{selectedCountry.name}</span>
                </div> */}
                {false && (
                  <div className="searchinput">
                    <input
                      type="search"
                      className="form-control"
                      placeholder={t("Search")}
                      aria-label="Search"
                    />
                    <button className="searchIconBtn" type="submit">
                      <svg
                        width={18}
                        height={18}
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M17 17L13.2223 13.2156M15.3158 8.15789C15.3158 10.0563 14.5617 11.8769 13.2193 13.2193C11.8769 14.5617 10.0563 15.3158 8.15789 15.3158C6.2595 15.3158 4.43886 14.5617 3.0965 13.2193C1.75413 11.8769 1 10.0563 1 8.15789C1 6.2595 1.75413 4.43886 3.0965 3.0965C4.43886 1.75413 6.2595 1 8.15789 1C10.0563 1 11.8769 1.75413 13.2193 3.0965C14.5617 4.43886 15.3158 6.2595 15.3158 8.15789V8.15789Z"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                )}
                <div className="searchinput">
                  <Controller
                    name="search"
                    control={control}
                    // rules={{ required: true }}
                    render={({ field }) => (
                      <AsyncSelect
                        {...field}
                        cacheOptions
                        loadOptions={loadOptionsDebounced}
                        className={`select-reactSelect form-control-solid`}
                        value={[]}
                        onChange={searchTermClickHandler}
                        placeholder={t("Search")}
                        // noOptionsMessage=""
                        // onInputChange={handleChange}
                        // styles={customStyles}
                        noOptionsMessage={() => t("No options")}
                        loadingMessage={() => t("Searching...")}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
            {loggedIn && role === "customer" && (
              <div className="col-lg-6 text-end">
                <div className="userCartTab for_desktop">
                  <Link href="/customer/my-orders" legacyBehavior>
                    <a class="iconLinks myOrderLink">
                      <svg
                        width="21"
                        height="25"
                        viewBox="0 0 21 25"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20.4993 21.6104L19.0678 5.4908C19.0371 5.13292 18.7354 4.86196 18.3827 4.86196H15.4379C15.397 2.1728 13.1986 0 10.4993 0C7.79987 0 5.6015 2.1728 5.5606 4.86196H2.61582C2.25794 4.86196 1.96142 5.13292 1.93075 5.4908L0.499253 21.6104C0.499253 21.6309 0.494141 21.6513 0.494141 21.6718C0.494141 23.5072 2.17614 25 4.2467 25H16.7518C18.8224 25 20.5044 23.5072 20.5044 21.6718C20.5044 21.6513 20.5044 21.6309 20.4993 21.6104ZM10.4993 1.38037C12.4369 1.38037 14.0166 2.93456 14.0575 4.86196H6.94097C6.98187 2.93456 8.56162 1.38037 10.4993 1.38037ZM16.7518 23.6196H4.2467C2.94813 23.6196 1.89496 22.7607 1.87451 21.7025L3.24465 6.24744H5.55549V8.34356C5.55549 8.72699 5.86224 9.03374 6.24567 9.03374C6.62911 9.03374 6.93586 8.72699 6.93586 8.34356V6.24744H14.0575V8.34356C14.0575 8.72699 14.3643 9.03374 14.7477 9.03374C15.1312 9.03374 15.4379 8.72699 15.4379 8.34356V6.24744H17.7487L19.124 21.7025C19.1035 22.7607 18.0453 23.6196 16.7518 23.6196Z"
                          fill="#FF6000"
                        />
                      </svg>
                      <span>{t("My Orders")}</span>
                    </a>
                  </Link>
                  <Link href="/customer/wishlist" legacyBehavior>
                    <a className="iconLinks">
                      <svg
                        width={27}
                        height={24}
                        viewBox="0 0 27 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M24.8191 2.33507C23.4053 0.921255 21.5336 0.14852 19.5359 0.14852C17.5383 0.14852 15.6608 0.926979 14.247 2.3408L13.5086 3.07919L12.7587 2.32935C11.3449 0.915531 9.46175 0.131348 7.46408 0.131348C5.47214 0.131348 3.59468 0.909807 2.18659 2.3179C0.772767 3.73172 -0.00569262 5.60918 3.13428e-05 7.60685C3.13428e-05 9.60451 0.784214 11.4762 2.19803 12.8901L12.9476 23.6397C13.0965 23.7885 13.2968 23.8686 13.4914 23.8686C13.686 23.8686 13.8864 23.7942 14.0352 23.6454L24.8077 12.913C26.2215 11.4991 27 9.62168 27 7.62402C27.0057 5.62635 26.233 3.74889 24.8191 2.33507ZM23.7201 11.8197L13.4914 22.0083L3.28559 11.8025C2.16369 10.6806 1.5455 9.19238 1.5455 7.60685C1.5455 6.02131 2.15797 4.53308 3.27986 3.4169C4.39604 2.30073 5.88427 1.68254 7.46408 1.68254C9.04962 1.68254 10.5436 2.30073 11.6655 3.42263L12.9591 4.71624C13.2625 5.01961 13.749 5.01961 14.0524 4.71624L15.3345 3.43408C16.4564 2.31218 17.9504 1.69399 19.5302 1.69399C21.11 1.69399 22.5982 2.31218 23.7201 3.42835C24.842 4.55025 25.4545 6.03848 25.4545 7.62402C25.4602 9.20956 24.842 10.6978 23.7201 11.8197Z"
                          fill="#FF6000"
                        />
                      </svg>
                    </a>
                  </Link>

                  <Link href="/cart" legacyBehavior>
                    <a className="iconLinks">
                      <svg
                        width={33}
                        height={34}
                        viewBox="0 0 33 34"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.90662 22.228H28.0897C30.1514 22.228 31.8334 20.546 31.8334 18.4842V10.8339C31.8334 10.8271 31.8334 10.8136 31.8334 10.8068C31.8334 10.7865 31.8334 10.7729 31.8334 10.7525C31.8334 10.739 31.8334 10.7254 31.8266 10.7118C31.8266 10.6983 31.8199 10.6779 31.8199 10.6644C31.8199 10.6508 31.8131 10.6372 31.8131 10.6237C31.8063 10.6101 31.8063 10.5966 31.7995 10.5762C31.7927 10.5626 31.7927 10.5491 31.7859 10.5355C31.7792 10.5219 31.7792 10.5084 31.7724 10.4948C31.7656 10.4813 31.7588 10.4677 31.752 10.4473C31.7452 10.4338 31.7385 10.4202 31.7317 10.4134C31.7249 10.3999 31.7181 10.3863 31.7113 10.3727C31.7046 10.3592 31.6978 10.3524 31.691 10.3388C31.6842 10.3253 31.6706 10.3117 31.6639 10.2981C31.6571 10.2846 31.6503 10.2778 31.6367 10.2642C31.6299 10.2507 31.6164 10.2439 31.6096 10.2303C31.6028 10.2167 31.5893 10.21 31.5825 10.1964C31.5757 10.1828 31.5621 10.1761 31.5553 10.1693C31.5418 10.1557 31.535 10.1489 31.5214 10.1354C31.5079 10.1286 31.5011 10.115 31.4875 10.1082C31.474 10.1015 31.4604 10.0879 31.4468 10.0811C31.4333 10.0743 31.4265 10.0675 31.4129 10.0608C31.3994 10.054 31.3858 10.0472 31.3722 10.0336C31.3587 10.0268 31.3451 10.0201 31.3315 10.0133C31.318 10.0065 31.3044 9.99972 31.2908 9.99294C31.2773 9.98615 31.2637 9.97937 31.2501 9.97259C31.2366 9.96581 31.223 9.96581 31.2095 9.95903C31.1959 9.95224 31.1755 9.94546 31.162 9.94546C31.1484 9.94546 31.1349 9.93868 31.1281 9.93868C31.1077 9.9319 31.0942 9.9319 31.0738 9.9319C31.067 9.9319 31.0602 9.92511 31.0467 9.92511L8.00083 6.74427V3.52952C8.00083 3.49561 8.00083 3.46169 7.99404 3.43457C7.99404 3.42778 7.99404 3.421 7.98726 3.40744C7.98726 3.38709 7.98048 3.36674 7.98048 3.3464C7.9737 3.32605 7.9737 3.31249 7.96691 3.29214C7.96691 3.27858 7.96013 3.27179 7.96013 3.25823C7.95335 3.23788 7.94657 3.21754 7.93979 3.19719C7.93979 3.19041 7.933 3.17684 7.933 3.17006C7.92622 3.14971 7.91944 3.13615 7.90587 3.1158C7.89909 3.10902 7.89909 3.09546 7.89231 3.08867C7.88553 3.07511 7.87875 3.06155 7.86518 3.04798C7.8584 3.03442 7.85162 3.02763 7.84483 3.01407C7.83805 3.00051 7.83127 2.99372 7.82449 2.98016C7.81771 2.9666 7.80414 2.95303 7.79736 2.93947C7.79058 2.93268 7.7838 2.9259 7.77701 2.91912C7.76345 2.90556 7.74988 2.89199 7.73632 2.87843C7.72954 2.87164 7.72276 2.86486 7.71597 2.85808C7.70241 2.84452 7.68884 2.83095 7.6685 2.81739C7.66172 2.8106 7.64815 2.80382 7.64137 2.79704C7.6278 2.78348 7.61424 2.77669 7.60068 2.76313C7.58033 2.74957 7.55998 2.736 7.54642 2.72922C7.53964 2.72244 7.53285 2.72244 7.52607 2.71565C7.49894 2.70209 7.46503 2.68853 7.4379 2.67496L2.43944 0.572485C1.97146 0.375801 1.43567 0.592831 1.23899 1.0608C1.04231 1.52877 1.25934 2.06456 1.72731 2.26125L6.16285 4.13313V8.28383V8.9417V13.9876V18.4978V24.1948C6.16285 26.0938 7.58711 27.6673 9.42508 27.9047C9.09276 28.4608 8.89607 29.1119 8.89607 29.8037C8.89607 31.8451 10.5577 33.5 12.5924 33.5C14.627 33.5 16.2887 31.8383 16.2887 29.8037C16.2887 29.1255 16.1055 28.4812 15.78 27.9386H24.0136C23.688 28.488 23.5049 29.1255 23.5049 29.8037C23.5049 31.8451 25.1665 33.5 27.2012 33.5C29.2358 33.5 30.8975 31.8383 30.8975 29.8037C30.8975 27.769 29.2358 26.1074 27.2012 26.1074H9.90662C8.8486 26.1074 7.99404 25.2461 7.99404 24.1948V21.7126C8.55018 22.0381 9.20805 22.228 9.90662 22.228ZM14.4642 29.7969C14.4642 30.8278 13.6233 31.662 12.5991 31.662C11.575 31.662 10.734 30.821 10.734 29.7969C10.734 28.7728 11.575 27.9318 12.5991 27.9318C13.6233 27.9318 14.4642 28.766 14.4642 29.7969ZM29.0731 29.7969C29.0731 30.8278 28.2321 31.662 27.208 31.662C26.1839 31.662 25.3429 30.821 25.3429 29.7969C25.3429 28.7728 26.1839 27.9318 27.208 27.9318C28.2321 27.9318 29.0731 28.766 29.0731 29.7969ZM28.0897 20.3968H9.90662C8.8486 20.3968 7.99404 19.5355 7.99404 18.4842V13.9741V8.92813V8.58902L30.0022 11.6207V18.4774C30.0022 19.5423 29.1409 20.3968 28.0897 20.3968Z"
                          fill="#FF6000"
                        />
                      </svg>
                    </a>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div
            class="menuoverlay"
            style={{ display: "none" }}
            id="menuoverlay"
            onClick={menuClose}
          ></div>
          <div className="col-12">
            <div className="navbar navbar-expand-lg headerMenuBar">
              <div className="collapse navbar-collapse" id="menu-show">
                <ul className="navbar-nav menus">
                  {/* <NavLink href="/">
                    <li className="nav-item">
                      <Link href="/" legacyBehavior>
                        <a className="nav-link">Home</a>
                      </Link>
                    </li>
                  </NavLink> */}
                  <NavLink href="/sale">
                    <li className="nav-item">
                      <Link href="/sale" legacyBehavior>
                        <a className="nav-link">{t("Today's Deals")}</a>
                      </Link>
                    </li>
                  </NavLink>
                  {/* <li className="nav-item">
                    <a className="nav-link" href="javascript:void(0);">
                      Mobiles
                    </a>
                  </li> */}
                  <NavLink href="/gift-cards">
                    <li className="nav-item">
                      <Link href="/gift-cards" legacyBehavior>
                        <a className="nav-link">{t("Gift Cards")}</a>
                      </Link>
                    </li>
                  </NavLink>
                  {false &&
                    categories.map((category) => (
                      <NavLink href={`/category/${category.slug}`}>
                        <li key={category._id} className="nav-item">
                          <Link
                            href={`/category/${category.slug}`}
                            legacyBehavior
                          >
                            <a className="nav-link">{category.name}</a>
                          </Link>
                        </li>
                      </NavLink>
                    ))}

                  {categories.map((category) => {
                    const depthLevel = 0;

                    return (
                      <MenuItem
                        item={category}
                        key={category._id}
                        depthLevel={depthLevel}
                        url={`/category/${category.slug}`}
                        isMobile={isMobile}
                      />
                    );
                  })}
                  {/* <li className="nav-item">
                    <a className="nav-link" href="javascript:void(0);">
                      Women Clothing
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="javascript:void(0);">
                      Men Clothing
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="javascript:void(0);">
                      Kids Clothing
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="javascript:void(0);">
                      Health
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="javascript:void(0);">
                      Pet corner
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="javascript:void(0);">
                      Books
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="javascript:void(0);">
                      Beauty
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="javascript:void(0);">
                      Kitchen
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="javascript:void(0);">
                      Bed Room
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="javascript:void(0);">
                      Sport
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="javascript:void(0);">
                      Bags
                    </a>
                  </li> */}
                </ul>
                <div className="extra_nav for_mobile sideBarMobile">
                  <div className="mobileSideBarSelect">
                    <label htmlFor="mobenglish">Language</label>
                    {languages.map((lang) => (
                      <div key={lang.code} className="form-group custom_radio">
                        <input
                          type="radio"
                          id={lang.name}
                          value={lang.code}
                          name="radio-group"
                          checked={locale === lang.code}
                        />
                        <label
                          className={
                            locale === lang.code
                              ? "checked_radio_button_label"
                              : ""
                          }
                          htmlFor={lang.name}
                        >
                          {lang.name}
                        </label>
                      </div>
                      // <div className="form-group custom_radio">
                      //   <input
                      //     type="radio"
                      //     id={lang.name}
                      //     value={lang.code}
                      //     name="radio-group"
                      //     defaultChecked={locale === lang.code}
                      //   />
                      //   <label htmlFor={lang.name}>{lang.name}</label>
                      // </div>
                    ))}
                    {/* <div className="form-group custom_radio">
                      <input type="radio" id="mobenglish" name="radio-group" />
                      <label htmlFor="mobenglish">English - EN</label>
                    </div>
                    <div className="form-group custom_radio">
                      <input type="radio" id="mobarabic" name="radio-group" />
                      <label htmlFor="mobarabic">Arabic</label>
                    </div>
                    <div className="form-group custom_radio">
                      <input type="radio" id="mobturkish" name="radio-group" />
                      <label htmlFor="mobturkish">Turkish</label>
                    </div> */}
                  </div>
                  <div class="mobile_logo">
                    <img src="/assets/img/logo.png" alt="" />
                  </div>
                  {/* <div className="mobileSideBarSelect">
                    <label htmlFor="mobenglish">Country</label>
                    {countries.map((country) => (
                      <Fragment key={country._id}>
                        <div
                          className="form-group custom_radio"
                          onClick={() => {
                            // setSelectedCountry({
                            //   id: country._id,
                            //   name: country.name,
                            // });
                            // dispatch(
                            //   updateRedux({ currentCountry: country._id })
                            // );
                            setCookie(null, "country", country._id, {
                              maxAge: 30 * 24 * 60 * 60 * 100,
                              path: "/",
                            });
                            // replace(asPath);
                            window.location.reload();
                          }}
                          key={country._id}
                        >
                          <input
                            type="radio" //     id={lang.name}
                            value={country.name}
                            id={country.name}
                            name="radio-group"
                            checked={selectedCountry.name === country.name}
                          />
                          <label
                            className={
                              selectedCountry.name === country.name
                                ? "checked_radio_button_label"
                                : ""
                            }
                            htmlFor={country.name}
                          >
                            {country.name}
                          </label>
                        </div>
                      </Fragment>
                    ))}
                  </div> */}
                  {/* <a href="javascript:void(0)" className="lang_country">
                      <span className="flag_ico">
                        <img src="/assets/img/americanflag.png" alt="" />
                      </span>
                      USD
                    </a>
                    <a href="javascript:void(0)" className="lang_country">
                      <span className="flag_ico">
                        <img src="/assets/img/americanflag.png" alt="" />
                      </span>
                      EURO
                    </a> */}

                  <div className="mobileSideBarSelect">
                    <a className="nav-link" href="javascript:void(0);">
                      <svg
                        width={22}
                        height={22}
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M22 14.8888C22 12.1587 20.4338 9.72227 18.0881 8.53711C18.0153 13.7716 13.7715 18.0154 8.53699 18.0883C9.72215 20.4339 12.1586 22.0001 14.8886 22.0001C16.1686 22.0001 17.4134 21.6592 18.5071 21.0115L21.9689 21.969L21.0114 18.5072C21.6591 17.4135 22 16.1688 22 14.8888Z"
                          fill="#697687"
                        />
                        <path
                          d="M16.8008 8.40039C16.8008 3.76833 13.0325 0 8.40039 0C3.76833 0 0 3.76833 0 8.40039C0 9.91 0.401825 11.3798 1.16486 12.6702L0.0308838 16.7697L4.13054 15.6359C5.42094 16.399 6.89078 16.8008 8.40039 16.8008C13.0325 16.8008 16.8008 13.0325 16.8008 8.40039ZM7.11133 6.44531H5.82227C5.82227 5.02365 6.97873 3.86719 8.40039 3.86719C9.82205 3.86719 10.9785 5.02365 10.9785 6.44531C10.9785 7.16689 10.673 7.86043 10.1401 8.34785L9.04492 9.35023V10.3555H7.75586V8.78258L9.26984 7.39684C9.54041 7.14926 9.68945 6.81139 9.68945 6.44531C9.68945 5.73448 9.11122 5.15625 8.40039 5.15625C7.68956 5.15625 7.11133 5.73448 7.11133 6.44531ZM7.75586 11.6445H9.04492V12.9336H7.75586V11.6445Z"
                          fill="#697687"
                        />
                      </svg>
                      Support
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
