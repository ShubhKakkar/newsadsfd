import * as XLSX from "xlsx";

export function convertDate(inputFormat) {
  function pad(s) {
    return s < 10 ? "0" + s : s;
  }
  let d = new Date(inputFormat);
  return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join("/");
}

export const addOneToDate = (currDate) => {
  currDate.setDate(currDate.getDate() + 1);
  return (currDate = currDate.toISOString().split("T")[0]);
};

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function debounce(fn, delay = 250) {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

//credit - gourav
export const urlToObject = async (fileUrl) => {
  const response = await fetch(fileUrl);
  return await response.blob();
  // const blob = await response.blob();
  // const file = new File([blob], "image.jpg", { type: blob.type });
  // return file;
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

export const capitalizeWord = (string) => {
  const newString = string
    .split("_")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
  return newString;
};

export const downloadExcel = (data, name) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  //let buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
  //XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
  XLSX.writeFile(workbook, `${name}.xlsx`);
};

export function arrayMoveMutable(array, fromIndex, toIndex) {
  const startIndex = fromIndex < 0 ? array.length + fromIndex : fromIndex;

  if (startIndex >= 0 && startIndex < array.length) {
    const endIndex = toIndex < 0 ? array.length + toIndex : toIndex;

    const [item] = array.splice(fromIndex, 1);
    array.splice(endIndex, 0, item);
  }
}

export const fetchImageSize = async (imageUrl) => {
  try {
    // Load the image
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Calculate the size in MB
    const sizeInMB = blob.size / (1024 * 1024); // Bytes to MB

    // Update the state with the size
    return sizeInMB.toFixed(2); // Limit to 2 decimal places
  } catch (error) {
    console.error("Error fetching image:", error);
  }
};

//TODO: UPDATE THESE FUNCTIONS --- START.
export function getentityTypeKey(entityType) {
  return entityType === "vendor"
    ? "vendor"
    : entityType === "customer"
    ? "customers"
    : entityType === "country"
    ? "countries"
    : entityType === "product"
    ? "products"
    : "manufactures";
}

export function getEntity(entityType) {
  return entityType === "vendors"
    ? "vendor"
    : entityType === "customers"
    ? "customer"
    : entityType === "countries"
    ? "country"
    : entityType === "products"
    ? "product"
    : "supplier";
}

export function getEntityTitle(entityType) {
  return entityType === "vendors"
    ? "Vendor"
    : entityType === "customers"
    ? "Customer"
    : entityType === "countries"
    ? "Country"
    : entityType === "products"
    ? "Product"
    : "Supplier";
}

export function getEntityTextONE(entityType) {
  return entityType === "vendor"
    ? "vendors"
    : entityType === "customer"
    ? "customers"
    : entityType === "country"
    ? "countries"
    : entityType === "product"
    ? "products"
    : "suppliers";
}

export function getEntityTextTWO(entityType) {
  return entityType === "vendor"
    ? "Vendor"
    : entityType === "customer"
    ? "Customer"
    : entityType === "country"
    ? "Country"
    : entityType === "product"
    ? "Product"
    : "Supplier";
}

//TODO: UPDATE THESE FUNCTIONS --- END.

export const createSlug = (value) => value.toLowerCase().split(" ").join("-");

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
