import { axiosInstance } from "../api";

export const getCurrencies = async () => {
  let res;
  try {
    res = await axiosInstance.get(`v1/currencies`);
  } catch (err) {
    // console.log(err);
  }
  return res?.data?.data;
};
