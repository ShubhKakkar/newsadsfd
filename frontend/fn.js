import nookies from "nookies";
import { axiosInstance } from "./api";
import { getCurrentCountry } from "@/services/home";

import EnTranslate from "/locales/index/en.json";
import ArTranslate from "/locales/index/ar.json";
import TrTranslate from "/locales/index/tr.json";

const langObj = {
  en: EnTranslate.Index,
  ar: ArTranslate.Index,
  tr: TrTranslate.Index,
};

export const createAxiosCookies = async (context) => {
  const cookies = nookies.get(context);
  axiosInstance.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${cookies.token} `;
  axiosInstance.defaults.headers.common["Accept-Language"] =
    cookies.i18nextLng ?? "en";
  if (cookies.country) {
    axiosInstance.defaults.headers.common["Accept-Country"] = cookies.country;
  } else {
    const countryData = await getCurrentCountry();
    if (countryData) {
      updateAxiosCookies(countryData.id);
    }
  }

  return cookies.country;
};

export const updateAxiosCookies = (country) => {
  axiosInstance.defaults.headers.common["Accept-Country"] = country;
};

export const translate = (language, text) => {
  return langObj[language][text] ?? text;
};

export const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// export function debounce(fn, delay = 250) {
//   let timeout;

//   return (...args) => {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => {
//       fn(...args);
//     }, delay);
//   };
// }

export const FRONTEND_URL =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_DEV_FRONTEND_URL
    : process.env.NEXT_PUBLIC_PROD_FRONTEND_URL;

export const capitalizeWord = (word) => {
  return word.toUpperCase();
};

export const urlToObject = async (fileUrl) => {
  const response = await fetch(fileUrl);
  return await response.blob();
  // const blob = await response.blob();
  // const file = new File([blob], "image.jpg", { type: blob.type });
  // return file;
};

export const debounce = (func, ms = 1000) => {
  let timer;
  return function (...args) {
    const context = this;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      func.apply(context, args);
    }, ms);
  };
};

export const isValidUrl = (urlString) => {
  var urlPattern = new RegExp(
    "^(https?:\\/\\/)?" + // validate protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // validate fragment locator
  return !!urlPattern.test(urlString);
};

export const capitalizeWordTwo = (string) => {
  const newString = string
    .split("_")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
  return newString;
};

export const formatBytes = (bytes, decimals = 2) => {
  let units = ["B", "KB", "MB", "GB", "TB", "PB"];

  let i = 0;

  for (i; bytes > 1024; i++) {
    bytes /= 1024;
  }

  return parseFloat(bytes.toFixed(decimals)) + " " + units[i];
};

export function arrayMoveMutable(array, fromIndex, toIndex) {
  const startIndex = fromIndex < 0 ? array.length + fromIndex : fromIndex;

  if (startIndex >= 0 && startIndex < array.length) {
    const endIndex = toIndex < 0 ? array.length + toIndex : toIndex;

    const [item] = array.splice(fromIndex, 1);
    array.splice(endIndex, 0, item);
  }
}

export const quantityOptions = () => {
  const options = [];

  new Array(100)
    .fill(null)
    .forEach((_, idx) => options.push(<option key={idx}>{idx + 1}</option>));

  return options;
};

const keyObj = {
  product: "NMP",
  productVariant: "NMPV",
};

export const createCustomId = (table, value, increment) => {
  let num = value + increment;
  let len = num.toString().length;
  let str = "";
  for (let i = 1; i <= 8 - len; i++) {
    str += "0";
  }
  str += num;
  return `${keyObj[table]}${str}`;
};

export const isVideoPlaying = (video) =>
  !!(
    video.currentTime > 0 &&
    !video.paused &&
    !video.ended &&
    video.readyState > 2
  );
