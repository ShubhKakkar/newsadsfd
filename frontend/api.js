import axios from "axios";

export const BASEURL =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_DEV_BACKEND_URI
    : process.env.NEXT_PUBLIC_PROD_BACKEND_URI;

export const MEDIA_URL = BASEURL;

export const axiosInstance = axios.create({ baseURL: `${BASEURL}/` });
