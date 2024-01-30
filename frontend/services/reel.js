import { axiosInstance } from "../api";

export const getReel = async (id) => {
  let res;
  
  try {
    res = await axiosInstance.get(`v1/reel/${id}`);
  } catch (err) {
    return { status: false };
  }

  return res.data;
};
