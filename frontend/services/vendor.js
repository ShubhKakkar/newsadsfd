import { axiosInstance } from "../api";

export const getProfileData = async () => {
  let res;
  try {
    res = await axiosInstance.get("v1/vendor/profile");
  } catch (err) {
    return false;
  }
  return res?.data?.data ?? {};
};

export const getSystemImage = async (slug) => {
  let res;
  try {
    res = await axiosInstance.get(`system-image/slug/${slug}`);
  } catch (err) {
    return false;
  }
  return res.data.image?.image ?? {};
};

export const getFeaturedVendors = async () => {
  let res;
  try {
    res = await axiosInstance.get("v1/vendor/featured");
  } catch (err) {
    return {
      vendors: [],
    };
  }
  return res?.data;
};

export const getVendorReels = async () => {
  let res;
  try {
    res = await axiosInstance.get("v1/vendor/reels");
  } catch (err) {
    return {
      reels: [],
      totalReels: 0,
    };
  }
  return res?.data;
};

export const getVendorReel = async (id) => {
  let res;
  try {
    res = await axiosInstance.get(`v1/vendor/reel/${id}`);
  } catch (err) {
    return {
      reel: null,
    };
  }
  return res?.data;
};

export const getVendorDetails = async (id) => {
  let res;
  try {
    res = await axiosInstance.get(`v1/vendor/details/${id}`);
  } catch (err) {
    return {
      status: false,
    };
  }

  return res?.data;
};
