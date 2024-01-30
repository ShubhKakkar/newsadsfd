import { axiosInstance } from "../api";

export const getCmsData = async (slug) => {
  let res;
  try {
    res = await axiosInstance.get(`/cms/slug/${slug}`);
  } catch (err) {
    // console.log(err);
    return false;
  }
  return res.data.cms ?? {};
};

export const getAllFaqs = async () => {
  let res;
  try {
    res = await axiosInstance.get("faq/all-faqs");
  } catch (err) {
    // console.log(err);
    return false;
  }
  return res.data.faqs ?? [];
};
