import { axiosInstance } from "../api";

export const getCategories = async () => {
  let res;
  try {
    res = await axiosInstance.get("/v1/product-categories");
  } catch (err) {
    return false;
  }
  return res.data.data ?? {};
};
