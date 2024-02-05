import { axiosInstance } from "../api";

export const getProducts = async (slug) => {
  let res;
  try {
    res = await axiosInstance.post(`v1/product`, {
      category: slug,
    });
  } catch (err) {
    return {
      status: false,
      products: [],
      minPrice: 0,
      maxPrice: 1000,
      totalProducts: 0,
      currency: "$",
      brands: [],
      subCategories: [],
      filters: [],
      categoryData: {},
    };
  }

  return res.data;
};

export const getProductsBySubCategory = async (slug, slug_two) => {
  let res;
  try {
    res = await axiosInstance.post(`v1/product/sub-category`, {
      category: slug,
      subCategory: slug_two,
    });
  } catch (err) {
    return {
      status: false,
      products: [],
      minPrice: 0,
      maxPrice: 1000,
      totalProducts: 0,
      currency: "$",
      brands: [],
      filters: [],
      childCategoriesData: [],
    };
  }
  return res.data;
};

export const getProductsByBrand = async (slug) => {
  let res;
  try {
    res = await axiosInstance.post(`v1/product/brand`, {
      brand: slug,
    });
  } catch (err) {
    return {
      status: false,
      products: [],
      minPrice: 0,
      maxPrice: 1000,
      totalProducts: 0,
      currency: "$",
    };
  }
  return res.data;
};

export const getInitialAddProductData = async () => {
  let res;
  try {
    res = await axiosInstance.get(`v1/product/init`);
  } catch (err) {
    return {
      data: [],
      customId: [],
      units: [],
      similarProducts: [],
      maximumImagesCount: 5,
    };
  }

  return res.data;
};
export const getEditProduct = async (id) => {
  let res;
  try {
    res = await axiosInstance.get(`v1/product/edit/${id}`);
  } catch (err) {
    console.log(err);
    return {};
  }
  return res.data;
};

export const getProduct = async (slug, vendor) => {
  let res;
  try {
    res = await axiosInstance.get(`v1/product/${slug}?vendor=${vendor}`);
  } catch (err) {
    // console.log("getProduct", err);
    return {
      product: {},
      currency: "$",
      variants: [],
      selectedVariant: {},
      variantsValue: [],
      recentlyViewedProducts: [],
    };
  }
  return res.data;
};

//for vendor listing
export const getAllProducts = async () => {
  let res;
  try {
    res = await axiosInstance.post("v1/product/all", {
      page: 1,
      per_page: 10,
      order: "asc",
    });
  } catch (err) {
    return {
      totalProducts: 0,
      products: [],
      warehouses: [],
      masterCategories: [],
      allBrands: [],
    };
  }
  return {
    totalProducts: res.data.totalProducts,
    products: res.data.products,
    warehouses: res.data.warehouses,
    masterCategories: res.data.masterCategories,
    allBrands: res.data.allBrands,
  };
};

export const getMostViewedProducts = async () => {
  let res;
  try {
    res = await axiosInstance.get(`v1/product/most-viewed`);
  } catch (err) {
    // console.log("err getMostViewedProducts", err.response.data.message);
    console.log("err", err);
    return {
      status: false,
      products: [],
      currency: "$",
    };
  }
  return res.data;
};

export const getLatestProducts = async () => {
  let res;
  try {
    res = await axiosInstance.get(`v1/product/latest`);
  } catch (err) {
    return {
      status: false,
      products: [],
      currency: "$",
    };
  }
  return res.data;
};

export const getSponsoredItems = async () => {
  let res;
  try {
    res = await axiosInstance.get(`v1/product/sponsored`);
  } catch (err) {
    return {
      status: false,
      products: [],
      currency: "$",
    };
  }
  return res.data;
};

export const getTopSellingItems = async () => {
  let res;
  try {
    res = await axiosInstance.get(`v1/product/top-selling`);
  } catch (err) {
    return {
      status: false,
      products: [],
      currency: "$",
    };
  }
  return res.data;
};

export const getAlternateProducts = async () => {
  let res;
  try {
    res = await axiosInstance.get(`v1/product/alternate`);
  } catch (err) {
    return {
      status: false,
      similarProducts: [],
    };
  }

  return res.data.similarProducts;
};
