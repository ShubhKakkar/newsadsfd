import { axiosInstance } from "../api";

export const verifyNewsletter = async (data) => {
  let res;
  try {
    res = await axiosInstance.put(`v1/home/newsletter`, data);
  } catch (err) {
    return false;
  }
  return res.data;
};

export const getHomePageData = async () => {
  let res;
  try {
    res = await axiosInstance.get("v1/home");
  } catch (err) {
    // console.log("home", err);
    return {};
  }


  return res.data.data;
};

export const getCurrentCountry = async () => {
  let res;
  try {
    res = await axiosInstance.get(`v1/countries/current`);
  } catch (err) {
    // console.log("getCurrentCountry", err);
    return null;
  }
  return res.data.country;
};
