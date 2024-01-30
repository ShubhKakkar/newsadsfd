import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import Link from "next/link";

import Layout from "@/components/Layout";
import { getProductsByBrand } from "@/services/product";
import { createAxiosCookies } from "@/fn";
import useRequest from "@/hooks/useRequest";
import Pagination from "@/components/Pagination";
import ProductListing from "@/components/ProductListing";
import {
  Availability,
  Discount,
  PriceRange,
  Rating,
  OnSale,
  SubCategory,
} from "@/components/ProductListing/Filters";

const PER_PAGE = 30;

const Products = ({
  productsArr,
  minPrice,
  maxPrice,
  totalProductsCount,
  currency,
  subCategories,
  brandData,
  brandSlug,
}) => {
  const [products, setProducts] = useState(productsArr);
  const [totalProducts, setTotalProducts] = useState(totalProductsCount);

  const [currentPage, setCurrentPage] = useState(1);
  const [priceObj, setPriceObj] = useState({ minPrice, maxPrice });

  const { register, watch, control, unregister } = useForm();

  const { request, response } = useRequest();

  const router = useRouter();

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
        dynamicCategory,
      } = values;

      if (minPrice === undefined) {
        minPrice = priceObj.minPrice;
      }

      if (maxPrice === undefined) {
        maxPrice = priceObj.maxPrice;
      }

      const subCategories = [];
      const childCategories = [];

      for (let key in values.subCategories) {
        if (values.subCategories[key]) {
          subCategories.push(key);
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

      request("POST", "v1/product/brand", {
        onSale,
        subCategories,
        minPrice: +minPrice,
        maxPrice: +maxPrice,
        inStock,
        outOfStock,
        page,
        sortBy,
        brand: brandSlug,
        childCategories,
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
                        {brandData.name}
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
                  <h2 className="product-section-heading">{brandData.name}</h2>
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
                    <SubCategory
                      subCategories={subCategories}
                      register={register}
                      control={control}
                      unregister={unregister}
                    />

                    <PriceRange maxPrice={maxPrice} />
                    <Discount register={register} />
                    <Availability register={register} />
                    <Rating register={register} />
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
    query: { slug },
  } = context;

  const {
    products,
    minPrice,
    maxPrice,
    totalProducts,
    currency,
    subCategories,
    status,
    brandData,
  } = await getProductsByBrand(slug);

  if (!status) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  return {
    props: {
      protected: null,
      key: new Date().toString(),
      productsArr: products,
      minPrice,
      maxPrice,
      totalProductsCount: totalProducts,
      currency,
      subCategories,
      brandData,
      brandSlug: slug,
      //   locales: {
      //     ...require(`../../locales/index/${context.locale}.json`),
      //   },
    },
  };
}

export default Products;
