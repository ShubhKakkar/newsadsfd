import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { useHistory, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

import { logout, updateLoading, updateToken } from "../store/auth/action";
import { BASEURL } from "../constant/api";

const BACKEND_URL = BASEURL.PORT;

const useRequest = (toNotLoad) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  // const [timeUrl,setTimeUrl] = useState('')

  const { token } = useSelector((state) => state.auth);
  const location = useLocation();

  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!toNotLoad) {
      dispatch(updateLoading({ loading }));
    }
  }, [loading]);

  const startFetching = () => {
    setResponse(null);
    setLoading(true);
    setError(null);
  };

  // useEffect(()=>{
  //    if(timeUrl){
  //     let timer1 = setTimeout(() => dispatch(logout()), 25 * 1000 * 60);

  //     // when component unmount like in willComponentUnmount
  //     // and show will not change to true
  //     return () => {
  //       clearTimeout(timer1);
  //     };
  //    }
  // },[timeUrl])

  const clear = () => {
    setResponse(null);
    setError(null);
  };

  const fetchedData = () => {
    setLoading(false);
    setError(null);
  };

  const requestData = (method, url, data) => {
    let config;
    if (token) {
      config = {
        method,
        url: `${BACKEND_URL}/${url}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data,
      };
    } else {
      config = {
        method,
        url: `${BACKEND_URL}/${url}`,
        data,
      };
    }

    startFetching();

    axios(config)
      .then((res) => {
        const token = res.headers["access-token"];

        if (token) {
          dispatch(updateToken({ token }));
        }

        const url = location.pathname;

        if (url !== "/login") {
          localStorage.setItem("url", url);
        }

        fetchedData();
        setResponse(res.data);
      })
      .catch((err) => {
        fetchedData();
        if (err.response) {
          if (err.response.status === 401) {
            dispatch(logout());
          } else if (err.response.status === 404) {
            history.push("/404");
          } else {
            toast.error(err.response.data.message);
          }
        } else if (err.request) {
          toast.error("Slow Network Speed. Try Again later.");
        } else {
          toast.error("Oops!! Unusual error occurred");
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
