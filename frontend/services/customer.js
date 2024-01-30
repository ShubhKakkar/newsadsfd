import { axiosInstance } from "../api";

export const getProfileData = async () => {
  let res;
  try {
    res = await axiosInstance.get("/v1/customer/profile");
  } catch (err) {
    // console.log(err);
    return false;
  }
  return res.data.customer ?? {};
};

export const getAddressData = async () => {
  let res;
  try {
    res = await axiosInstance.get("/v1/address");
  } catch (err) {
    // console.log(err);
    return false;
  }
  return res.data.address ?? [];
};

export const getSystemImage = async (slug) => {
  let res;

  try {
    res = await axiosInstance.get(`system-image/slug/${slug}`);
  } catch (err) {
    // console.log(err);
    return false;
  }
  return res.data.image?.image ?? {};
};

export const getCartItems = async () => {
  let res;

  try {
    res = await axiosInstance.get("v1/cart");
  } catch (error) {
    console.log(error);
    return {
      status: false,
      cartItems: [],
      currency: "$",
    };
  }

  return {
    status: true,
    cartItems: res.data.cartItems,
    currency: res.data.currency,
    checkoutData: res.data.checkoutData,
  };
};

export const getListItems = async ({
  listName = "savedForLater",
  perPage = 5,
}) => {
  let res;

  try {
    res = await axiosInstance.get(
      `v1/list?listName=${listName}&perPage=${perPage}`
    );
  } catch (error) {
    return {
      status: false,
      products: [],
      totalProducts: 0,
      currency: "$",
    };
  }

  return {
    status: true,
    products: res.data.products,
    totalProducts: res.data.totalProducts,
    currency: res.data.currency,
  };
};
