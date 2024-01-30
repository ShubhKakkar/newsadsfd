import { axiosInstance } from "../api";

export const getCountries = async () => {
  let res;
  try {
    res = await axiosInstance.get(`v1/countries`);
  } catch (err) {
    return false;
  }
  return res?.data?.data;
};
