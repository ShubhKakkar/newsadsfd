// import "../styles/globals.css";
import { useSelector, useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
// import { gapi } from "gapi-script";

import { setCookie, destroyCookie, parseCookies } from "nookies";
import { NextIntlProvider } from "next-intl";
import NextNProgress from "nextjs-progressbar";

import "react-toastify/dist/ReactToastify.css";
import useRequest from "@/hooks/useRequest";

import {
  authSuccess,
  init,
  updateLanguage,
  updateRedux,
  updateLoading,
  updateNotification,
} from "@/store/auth/action";
import Loader from "@/components/Loader";
import { wrapper } from "@/store";
import { FRONTEND_URL } from "@/fn";

const SUPPORTED_LANGUAGES = ["en", "ar", "tr"];

function MyApp({ Component, pageProps }) {
  const [isCookiesSet, setIsCookiesSet] = useState(false);
  const [count, setCount] = useState(0);

  const { loggedIn, loading, role, token, currentCountry, countries } =
    useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const { locale } = router;
  const { token: loginToken } = router.query;

  const { request, response } = useRequest();
  const { request: requestReduxData, response: responseReduxData } =
    useRequest();
  const { request: requestCurrentCountry, response: responseCurrentCountry } =
    useRequest();
  const { request: requestCategories, response: responseCategories } =
    useRequest();
  const { request: requestNotification, response: responseNotification } =
    useRequest();

  useEffect(() => {
    dispatch(updateLanguage({ language: locale }));
    let langLocale = (locale) ? locale : "ar";
    localStorage.setItem("i18nextLng", langLocale);
    setCookie(null, "i18nextLng", langLocale, {
      maxAge: 30 * 24 * 60 * 60 * 100,
      path: "/",
    });
    // if (!SUPPORTED_LANGUAGES.includes(locale)) {
    //   localStorage.setItem("i18nextLng", "ar");
    //   setCookie(null, "i18nextLng", "ar", {
    //     maxAge: 30 * 24 * 60 * 60 * 100,
    //     path: "/",
    //   });
    // } else {
    //   dispatch(updateLanguage({ language: locale }));
    //   setCookie(null, "i18nextLng", locale, {
    //     maxAge: 30 * 24 * 60 * 60 * 100,
    //     path: "/",
    //   });
    // }
  }, []);

  useEffect(() => {
    requestReduxData("GET", "admin/frontend");
    (async () => {
      const gapi = await import("gapi-script").then((pack) => pack.gapi);
      gapi.load("client:auth2", () => {
        gapi.client.init({
          clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          plugin_name: "chat",
        });
      });
    })();
  }, []);

  useEffect(() => {
    if (responseCurrentCountry) {
      const { country } = responseCurrentCountry;
      setCookie(null, "country", country.id, {
        maxAge: 30 * 24 * 60 * 60 * 100,
        path: "/",
      });

      dispatch(updateRedux({ currentCountry: country.id }));

      let token;

      if (loginToken) {
        token = loginToken;
      } else {
        token = localStorage.getItem("token");
      }

      if (token) {
        request("POST", "v1/user/verify-token", { token });
      } else {
        dispatch(init());
      }
    }
  }, [responseCurrentCountry]);

  useEffect(() => {
    if (currentCountry) {
      requestCategories("GET", "v1/product-categories/by-country");
    }
  }, [currentCountry]);

  useEffect(() => {
    if (loggedIn) {
      requestNotification("GET", "v1/notification");
    }
  }, [loggedIn]);

  useEffect(() => {
    if (responseNotification) {
      if (responseNotification.status) {
        const { notifications, totalNotifications } = responseNotification;
        dispatch(
          updateNotification({
            notifications,
            totalNotificationsCount: totalNotifications,
          })
        );
      }
    }
  }, [responseNotification]);

  useEffect(() => {
    console.log("lodfdfd",responseCategories)
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

  useEffect(() => {
    if (response) {
      console.log("response",response)
      if (response.status) {
        const {
          cartTotal,
          email,
          firstName,
          lastName,
          contact,
          profilePic,
          role,
          token,
          _id,
        } = response;

        if (loginToken) {
          window.location.replace(
            `${FRONTEND_URL}/${router.pathname}?webview=true`
          );
        }

        dispatch(
          authSuccess({
            cartTotal,
            email,
            firstName,
            lastName,
            contact,
            profilePic,
            role,
            token,
            userId: _id,
          })
        );
      } else {
        dispatch(init());
      }
    }
  }, [response]);

  useEffect(() => {
    if (responseReduxData) {
      const {
        socialSettings,
        languages,
        currencies,
        appLinks,
        contactUsSettings,
        countries,
      } = responseReduxData;

      {
        let token;

        if (loginToken) {
          token = loginToken;
        } else {
          token = localStorage.getItem("token");
        }

        const cookies = parseCookies();

        let isCountryAvailable = false;

        if (cookies.country) {
          if (countries.find((c) => c._id === cookies.country)) {
            isCountryAvailable = true;
            dispatch(updateRedux({ currentCountry: cookies.country }));
          }
        }

        if (!token) {
          dispatch(init());
          if (!isCountryAvailable) {
            requestCurrentCountry("GET", "v1/countries/current");
          }
        } else {
          if (!isCountryAvailable) {
            requestCurrentCountry("GET", "v1/countries/current");
          } else {
            request("POST", "v1/user/verify-token", { token });
          }
        }
      }

      dispatch(
        updateRedux({
          socialSettings,
          languages,
          currencies,
          appLinks,
          contactUsSettings,
          countries,
        })
      );
    }
  }, [responseReduxData]);

  useEffect(() => {
    if (currentCountry && !isCookiesSet) {
      let timer;

      const cookies = parseCookies();
      if (cookies.country) {
        setIsCookiesSet(true);
      } else {
        timer = setTimeout(() => {
          setCount((prev) => prev + 1);
        }, 100);
      }

      return () => {
        clearTimeout(timer);
      };
    }
  }, [currentCountry, count]);

  useEffect(() => {
    const handleRouteChangeStart = (url, { shallow }) => {
      console.log(
        `routing to ${url}`,
        `is shallow routing: ${shallow}`,
        router.asPath
      );
    };

    const handleRouteChangeStop = (url, { shallow }) => {
      console.log(`completely routed to ${url} => ${shallow}`, router.asPath);
    };
  }, [router]);

  useEffect(() => {
    let dir =locale == "ar" ? "rtl" : "ltr";
    document.querySelector("html").setAttribute("dir", dir);
  }, [locale]);

  if (
    !currentCountry ||
    loggedIn === null ||
    countries.length == 0 ||
    !isCookiesSet
  ) {
    // console.log(
    //   "in null",
    //   currentCountry,
    //   loggedIn,
    //   countries.length,
    //   isCookiesSet
    // );
    return false;
  }

  if (pageProps.protected === true && loggedIn == false) {
    router.replace("/");
    return null;
  }

  if (pageProps.protected === false && loggedIn == true) {
    router.replace(`/${role}/my-profile`);
    return null;
  }

  if (pageProps.role && role != pageProps.role) {
    router.replace("/");
    return null;
  }

  if (
    pageProps.protected &&
    pageProps.userTypes &&
    pageProps.userTypes.indexOf(role) === -1
  ) {
    router.replace(`/${role}/my-profile`);

    return null;
  }

  return (
    <>
      {loading && <Loader />}
      <NextNProgress
        color="#ff6000"
        options={{ showSpinner: false }}
        stopDelayMs={50}
      />
      <NextIntlProvider
        messages={pageProps.locales}
        now={new Date(pageProps.now)}
      >
        <Component {...pageProps} />
        <ToastContainer autoClose={5000} />
      </NextIntlProvider>
    </>
  );
}

export default wrapper.withRedux(MyApp);
