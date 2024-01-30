import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";

import Layout from "@/components/Layout";
import { getProductsBySubCategory } from "@/services/product";
import { createAxiosCookies } from "@/fn";
import useRequest from "@/hooks/useRequest";
import Pagination from "@/components/Pagination";
import ProductListing from "@/components/ProductListing";
import {
  Availability,
  Brand,
  Discount,
  PriceRange,
  Rating,
  OnSale,
  Dynamic,
  DynamicCategory,
} from "@/components/ProductListing/Filters";

const PER_PAGE = 30;

const SubCategory = ({
  productsArr,
  minPrice,
  maxPrice,
  totalProductsCount,
  currency,
  brands,
  filters,
  categoryData,
  categorySlug,
  subCategorySlug,
  childCategoriesData,
  specifications,
}) => {
  const [products, setProducts] = useState(productsArr);
  const [totalProducts, setTotalProducts] = useState(totalProductsCount);

  const [currentPage, setCurrentPage] = useState(1);
  const [priceObj, setPriceObj] = useState({ minPrice, maxPrice });

  const { register, watch, control, unregister } = useForm();

  const { request, response } = useRequest();

  useEffect(() => {
    $("#budget_slider").ionRangeSlider({
      type: "double",
      grid: false,
      min: minPrice,
      max: maxPrice,
      from: minPrice,
      to: maxPrice,
      onFinish: (data) => {
        setPriceObj({ minPrice: data.from, maxPrice: data.to });
        fetchData(1, data.from, data.to);
      },
    });
  }, []);

  useEffect(() => {
    const subscription = watch((values) => {
      setCurrentPage(1);
      fetchData(1);
    });
    return () => subscription.unsubscribe();
  }, [watch, priceObj]);

  useEffect(() => {
    if (response) {
      setProducts(response.products);
      setTotalProducts(response.totalProducts);
    }
  }, [response]);

  const fetchData = useCallback(
    (page, minPrice, maxPrice) => {
      const values = watch();
      const {
        onSale,
        sortBy,
        inStock,
        outOfStock,
        ratings,
        discount,
        dynamic,
        dynamicCategory,
        dynamicspecification,
      } = values;

      if (minPrice === undefined) {
        minPrice = priceObj.minPrice;
      }

      if (maxPrice === undefined) {
        maxPrice = priceObj.maxPrice;
      }

      const brands = [];
      const dynamicFilters = [];
      const childCategories = [];
      const dynamicSpecifications = [];

      for (let key in values.brands) {
        if (values.brands[key]) {
          brands.push(key);
        }
      }

      for (let key in dynamicCategory) {
        if (values.dynamicCategory[key]) {
          childCategories.push(key.split("_")[1]);
        }
      }

      let bodyObj = {};

      if (ratings !== null) {
        bodyObj.ratings = +ratings;
      }

      if (discount !== null) {
        switch (discount) {
          case "one": {
            bodyObj.minDiscount = 0;
            bodyObj.maxDiscount = 15;
            break;
          }
          case "two": {
            bodyObj.minDiscount = 15;
            bodyObj.maxDiscount = 30;
            break;
          }
          case "three": {
            bodyObj.minDiscount = 30;
            bodyObj.maxDiscount = 45;
            break;
          }
          default: {
          }
        }
      }

      for (let key in dynamic) {
        if (dynamic[key]) {
          const [id, value] = key.split("_");
          dynamicFilters.push({
            id,
            value,
          });
        }
      }

      for (let key in dynamicspecification) {
        if (dynamicspecification[key]) {
          const [id, value] = key.split("_");
          dynamicSpecifications.push({
            id,
            value,
          });
        }
      }

      request("POST", "v1/product/sub-category", {
        onSale,
        brands,
        minPrice: +minPrice,
        maxPrice: +maxPrice,
        inStock,
        outOfStock,
        page,
        sortBy,
        dynamicFilters,
        category: categorySlug,
        subCategory: subCategorySlug,
        childCategories,
        dynamicSpecifications,
        ...bodyObj,
      });
    },
    [priceObj]
  );

  const fetchMoreData = ({ selected }) => {
    setProducts([]);

    setCurrentPage(selected + 1);
    fetchData(selected + 1);
  };

  return (
    <Layout seoData={{ pageTitle: "Noonmar" }}>
      <section className="sale-section-banner">
        <div className="container-fluid">
          <div className="hero_banner_wrapper">
            <img src="/assets/img/hero.png" alt="" />
          </div>
        </div>
        <section className="product-search-listing">
          <div className="container">
            <div className="row gx-md-5">
              <div col-md-12="">
                <div className="breadcrumbBlock breadcrumbBlockListing">
                  <nav>
                    <ol className="breadcrumb">
                      <li className="breadcrumb-item">
                        <Link href="/" legacyBehavior>
                          <a>Home</a>
                        </Link>
                      </li>
                      <li
                        className="breadcrumb-item active"
                        aria-current="page"
                      >
                        {categoryData.name}
                      </li>
                    </ol>
                  </nav>
                  <div onclick="openNav()" className="sideTabicon">
                    <svg
                      className="svg-inline--fa fa-filter"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fas"
                      data-icon="filter"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                      data-fa-i2svg=""
                    >
                      <path
                        fill="currentColor"
                        d="M3.853 54.87C10.47 40.9 24.54 32 40 32H472C487.5 32 501.5 40.9 508.1 54.87C514.8 68.84 512.7 85.37 502.1 97.33L320 320.9V448C320 460.1 313.2 471.2 302.3 476.6C291.5 482 278.5 480.9 268.8 473.6L204.8 425.6C196.7 419.6 192 410.1 192 400V320.9L9.042 97.33C-.745 85.37-2.765 68.84 3.854 54.87L3.853 54.87z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 theia-sticky">
                <div id="portfolioDisc">
                  <h2 className="product-section-heading">
                    {categoryData.name}
                  </h2>
                  <a
                    href="javascript:void(0)"
                    onclick="closeNav()"
                    className="closebtn"
                  >
                    <i className="fas fa-times" />
                  </a>
                  <OnSale register={register} />
                  <div
                    className="accordion accordion-flush accordion-category"
                    id="accordionFlushExample"
                  >
                    {childCategoriesData.length > 0 && (
                      <DynamicCategory
                        register={register}
                        control={control}
                        unregister={unregister}
                        filter={{
                          _id: "categoryOne",
                          name: "Other Categories",
                          values: childCategoriesData,
                          key: 0,
                        }}
                      />
                    )}
                    <Brand brands={brands} register={register} />
                    <PriceRange maxPrice={maxPrice} />
                    <Discount register={register} />
                    <Availability register={register} />
                    <Rating register={register} />
                    <Dynamic filters={filters} register={register} />
                    <Dynamic
                      filters={specifications}
                      register={register}
                      name="specification"
                    />
                  </div>
                </div>
              </div>
              <div className="col-lg-9">
                <ProductListing
                  totalProducts={totalProducts}
                  currentPage={currentPage}
                  products={products}
                  register={register}
                />
                <Pagination
                  currentPage={currentPage}
                  totalItems={totalProducts}
                  perPage={PER_PAGE}
                  fetchMoreItems={fetchMoreData}
                />
              </div>
            </div>
          </div>
        </section>
      </section>
    </Layout>
  );
};

export async function getServerSideProps(context) {
  await createAxiosCookies(context);

  const {
    query: { slug, slug_two },
  } = context;

  const {
    products,
    minPrice,
    maxPrice,
    totalProducts,
    currency,
    brands,
    filters,
    status,
    categoryData,
    childCategoriesData,
    specifications,
  } = await getProductsBySubCategory(slug, slug_two);

  if (!status) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  if (categoryData.slug !== slug_two) {
    return {
      redirect: {
        permanent: false,
        destination: `/${context.locale}/category/${categoryData.main.slug}/sub-category/${categoryData.slug}`,
      },
    };
  }

  return {
    props: {
      protected: null,
      key: slug + slug_two,
      productsArr: products,
      minPrice,
      maxPrice,
      totalProductsCount: totalProducts,
      currency,
      brands,
      filters,
      categoryData,
      categorySlug: slug,
      subCategorySlug: slug_two,
      childCategoriesData,
      specifications,
      locales: {
        ...require(`../../../../locales/index/${context.locale}.json`),
      },
    },
  };
}

export default SubCategory;
