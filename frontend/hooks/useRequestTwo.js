import { useSelector } from "react-redux";
import axios from "axios";
import { BASEURL } from "../api";

const useRequestTwo = () => {
  const { token, language, currentCountry } = useSelector(
    (state) => state.auth
  );

  const request = async (method, url, data) => {
    let config;

    if (token) {
      config = {
        method,
        url: `${BASEURL}/${url}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept-Language": language ?? "en",
          "Accept-Country": currentCountry,
        },
        data,
      };
    } else {
      config = {
        method,
        url: `${BASEURL}/${url}`,
        headers: {
          "Accept-Language": language ?? "en",
          "Accept-Country": currentCountry,
        },
        data,
      };
    }

    try {
      const response = await axios(config);
      return {
        status: true,
        data: response.data,
      };
    } catch (err) {
      return {
        status: false,
        data: [],
      };
    }
  };

  return {
    request,
  };
};

export default useRequestTwo;
