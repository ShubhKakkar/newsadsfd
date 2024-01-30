import { axiosInstance } from "../api";

export const getOrders = async () => {
  let res;
  try {
    res = await axiosInstance.get(`v1/order?status=success`);
  } catch (err) {
    return {
      status: false,
      orders: [],
      totalOrders: 0,
    };
  }
  return res.data;
};

//for order listing
export const getAllOrder = async () => {
  let res;
  try {
    res = await axiosInstance.get("v1/order/all");
  } catch (err) {
    return {
      status: false,
      orders: [],
      totalOrders: 0,
    };
  }
  return res.data;
};

export const getOrderDetails = async (id) => {
  let res;
  try {
    res = await axiosInstance.get(`v1/order/${id}`);
  } catch (err) {
    return {
      status: false,
      orders: [],
      totalOrders: 0,
    };
  }
  return res.data;
};

export const getReviewFileLimit = async () => {
  let res;
  try {
    res = await axiosInstance.get(`v1/home/review-file-limit`);
  } catch (err) {
    return null
  }
  return res.data.fileLimit;
};
