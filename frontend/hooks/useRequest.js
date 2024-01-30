import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
// import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { logout, updateLoading } from "../store/auth/action";
import { BASEURL } from "../api";

const useRequest = (notShowLoading) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  // const { t, i18n } = useTranslation();
  const { token, language, currentCountry } = useSelector(
    (state) => state.auth
  );

  const t = (a) => a;

  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!notShowLoading) {
      dispatch(updateLoading({ loading }));
    }
  }, [loading]);

  const startFetching = () => {
    setResponse(null);
    setLoading(true);
    setError(null);
  };

  const clear = () => {
    setResponse(null);
    setError(null);
  };

  const fetchedData = () => {
    setLoading(false);
    setError(null);
  };

  const requestData = (method, url, data, headers = {}) => {
    let config;

    if (token) {
      config = {
        method,
        url: `${BASEURL}/${url}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept-Language": language ?? "en",
          "Accept-Country": currentCountry ?? "",
          ...headers,
        },
        data,
      };
    } else {
      config = {
        method,
        url: `${BASEURL}/${url}`,
        headers: {
          "Accept-Language": language ?? "en",
          "Accept-Country": currentCountry ?? "",
          ...headers,
        },
        data,
      };
    }

    startFetching();

    axios(config)
      .then((res) => {
        fetchedData();
        setResponse(res.data);
      })
      .catch((err) => {
        fetchedData();
        if (err.response) {
          if (err.response.status === 401) {
            dispatch(logout());
          } else if (err.response.status === 404) {
            router.push("/404");
          } else {
            // console.log("err.response.data", err.response.data);
            toast.error(err.response.data.message, {
              autoClose: 5000,
            });
          }
        } else if (err.request) {
          toast.error(t("Slow Network Speed. Try Again later."));
        } else {
          toast.error(t("Oops!! Unusual error occurred"));
        }
      });
  };

  return {
    loading,
    error,
    request: requestData,
    clear,
    response,
    setError,
  };
};

export default useRequest;
