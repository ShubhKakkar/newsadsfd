import { axiosInstance } from "../api";

export const getWishlistProducts = async () => {
  let res;
  try {
    res = await axiosInstance.get(`v1/wishlist`);
  } catch (err) {
    return {
      status: false,
      products: [],
      totalProducts: 0,
    };
  }
  return res.data;
};
