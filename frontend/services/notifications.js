import { axiosInstance } from "../api";

export const getNotifications = async () => {
    let res;
    try {
        res = await axiosInstance.get(`v1/notification`);
      } catch (err) {
        return {
          status: false,
          notifications: [],
          totalNotifications: 0,
        };
      }
      return res.data;
  };