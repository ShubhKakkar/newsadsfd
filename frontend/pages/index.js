import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
// import "swiper/css";
// import "swiper/css/pagination";
// import "swiper/css/navigation";
import { Pagination, Navigation } from "swiper";
import Layout from "@/components/Layout";
import { verifyNewsletter, getHomePageData } from "@/services/home";
import {
  getMostViewedProducts,
  getLatestProducts,
  getSponsoredItems,
  getTopSellingItems,
} from "@/services/product";
import { getFeaturedVendors } from "@/services/vendor";
import Newsletter from "@/components/Newsletter";
import { createAxiosCookies, createAxiosNewCookies } from "@/fn";

import { MEDIA_URL } from "@/api";
import HomePageProduct from "@/components/HomePageProduct";
import SwiperReel from "@/components/SwiperReel";
import ProductSkeleton from "@/components/ProductSkeleton.js";
const Home = ({ verifyNews, homeData }) => {
  const {
    homePageSectionOne,
    homePageSectionOneSlider,
    homePageSectionTwo,
    homePageSectionThree,
    homePageSectionFour,
    homePageSectionFive,
    aboutUs,
    reels,
    locale,
    homePagePermission,
  } = homeData;

  const [mostViewedProducts, setMostViewedProducts] = useState([]);
  const [mostLatestProducts, setLatestProducts] = useState([]);
  const [sponsoredItems, setSponseredItemsList] = useState([]);
  const [featuredVendors, setFeaturedVendorList] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [loading, setLoading] = useState({
    mostViewedProducts: false,
    mostLatestProducts: false,
    sponsoredItems: false,
    featuredVendors: false,
    topSellingProducts: false,
  });

  const getProducts = async () => {
    await createAxiosNewCookies();
    setLoading({
      mostViewedProducts: true,
      mostLatestProducts: true,
      sponsoredItems: true,
      featuredVendors: true,
      topSellingProducts: true,
    });

    try {
      const mostViewedProductsData = await getMostViewedProducts();
      setMostViewedProducts(mostViewedProductsData.products);
    } finally {
      setLoading((prevLoading) => ({
        ...prevLoading,
        mostViewedProducts: false,
      }));
    }

    try {
      const mostLatestProductsData = await getLatestProducts();
      setLatestProducts(mostLatestProductsData.products);
    } finally {
      setLoading((prevLoading) => ({
        ...prevLoading,
        mostLatestProducts: false,
      }));
    }

    try {
      const sponsoredItemsList = await getSponsoredItems();
      setSponseredItemsList(sponsoredItemsList.products);
    } finally {
      setLoading((prevLoading) => ({
        ...prevLoading,
        sponsoredItems: false,
      }));
    }

    try {
      const featuredVendorsList = await getFeaturedVendors();
      setFeaturedVendorList(featuredVendorsList.vendors);
    } finally {
      setLoading((prevLoading) => ({
        ...prevLoading,
        featuredVendors: false,
      }));
    }

    try {
      const topSellingProductData = await getTopSellingItems();
      setTopSellingProducts(topSellingProductData.products);
    } finally {
      setLoading((prevLoading) => ({
        ...prevLoading,
        topSellingProducts: false,
      }));
    }
  };

  useEffect(() => {
    getProducts();
  }, [locale]);

  const t = useTranslations("Index");

  const router = useRouter();

  useEffect(() => {
    if (verifyNews && verifyNews.status) {
      toast.success(verifyNews.message);
      router.replace("/", undefined, { shallow: true });
    }
  }, []);

  useEffect(() => {
    $(".featured-text").matchHeight();
  }, []);

  return (
    <Layout seoData={{ pageTitle: "Noonmar" }}>
      <>
        {/* Hero Slider */}
        {/*Slider 1  */}
        {homePagePermission["slider-one"] && (
          <div className="hero-section lightBg">
            <div className="heroContainer">
              <div className="row">
                <div className="col-md-12">
                  <div className="heroSlider">
                    <div className="swiper heroSliderCart">
                      <Swiper
                        spaceBetween={10}
                        pagination={true}
                        // navigation={true}
                        modules={[Pagination, Navigation]}
                        className="mySwiper h-100"
                      >
                        {homePageSectionOneSlider &&
                          homePageSectionOneSlider?.map((s, i) => (
                            <SwiperSlide key={i}>
                              <div className="swiper-wrapper">
                                <div className="swiper-slide">
                                  <div className="SlideheroCard">
                                    <div className="heroSlider-Images text-center">
                                      <a href={s.link} target="_blank">
                                        <img
                                          src={`${MEDIA_URL}/${s.image}`}
                                          alt=""
                                          className="heroSliderBanner"
                                        />
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </SwiperSlide>
                          ))}

                        {/* <SwiperSlide>
                        <div className="swiper-wrapper">
                          <div className="swiper-slide">
                            <div className="SlideheroCard">
                              <div className="heroSlider-Images">
                                <a href="#!">
                                  <img
                                    src="/assets/img/project1.png"
                                    alt=""
                                    className="heroSliderBanner"
                                  />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                      <SwiperSlide>
                        <div className="swiper-wrapper">
                          <div className="swiper-slide">
                            <div className="SlideheroCard">
                              <div className="heroSlider-Images">
                                <a href="#!">
                                  <img
                                    src="/assets/img/project1.png"
                                    alt=""
                                    className="heroSliderBanner"
                                  />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </SwiperSlide> */}
                      </Swiper>

                      <div className="offerActionBtn">
                        <div className="swiper-pagination" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* <div className="col-md-3">
                <div className="heroBanner sameCardBanner">
                  <div className="herobanner1">
                    <a href={homePageSectionOne?.linkOne} target="_blank">
                      <img
                        src={`${MEDIA_URL}/${homePageSectionOne?.imageOne}`}
                        alt=""
                      />
                    </a>
                  </div>
                  <div className="herobanner1">
                    <a href={homePageSectionOne?.linkTwo} target="_blank">
                      <img
                        src={`${MEDIA_URL}/${homePageSectionOne?.imageTwo}`}
                        alt=""
                      />
                    </a>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="heroBanner">
                  <a href={homePageSectionOne?.linkThree} target="_blank">
                    {" "}
                    <img
                      src={`${MEDIA_URL}/${homePageSectionOne?.imageThree}`}
                      alt=""
                    />
                  </a>
                </div>
              </div> */}
              </div>
            </div>
          </div>
        )}
        {/* Hero Slider */}
        {/* Offer Slider Section */}
        {/*Slider 2  */}
        {homePagePermission["slider-two"] && (
          <div className="maxContainer section-margin">
            <Swiper
              pagination={{
                type: "fraction",
              }}
              breakpoints={{
                575: {
                  slidesPerView: 1.1,
                  spaceBetween: 5,
                },

                767: {
                  slidesPerView: 1.1,
                  spaceBetween: 5,
                },

                991: {
                  slidesPerView: 1.2,
                },

                1200: {
                  slidesPerView: 1.3,
                },
              }}
              centeredSlides={true}
              loop={true}
              spaceBetween={15}
              speed={800}
              autoplay={{
                delay: "4000",
                disableOnInteraction: "false",
                pauseOnMouseEnter: "true",
              }}
              navigation={true}
              modules={[Pagination, Navigation]}
              className="mySwiper offersSlider"
            >
              {homePageSectionTwo &&
                homePageSectionTwo?.map((s, i) => (
                  <SwiperSlide key={i}>
                    <div className="offers-section">
                      <div className="container-fluid p-0">
                        <div className="offerSlider">
                          <div className="swiper offerSliderCart">
                            <div className="swiper-wrapper">
                              <div className="swiper-slide">
                                <div className="SlideOfferCard">
                                  <div
                                    className="offeroverlay"
                                    style={{
                                      backgroundColor: `${s.backgroundColor}`,
                                    }}
                                  >
                                    <div className="overlaytext">
                                      <span className="smallLable">
                                        {s.title}
                                      </span>
                                      <span className="offerHeading">
                                        {s.heading}
                                      </span>
                                      <span className="offerDes">
                                        {s.description}
                                      </span>
                                      <a
                                        href={s.link}
                                        target="_blank"
                                        className="overlayBtn"
                                      >
                                        {s.buttonName}
                                      </a>
                                    </div>
                                  </div>
                                  <div className="offer-Images">
                                    <a href="javascript:void(0)">
                                      <img
                                        src={`${MEDIA_URL}/${s.image}`}
                                        alt=""
                                        className="offerBanner"
                                      />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
            </Swiper>
          </div>
        )}
        {/* Offer Slider Section */}
        {/* Top Selling Section */}
        {homePagePermission["top-selling-items"] && (
          <section className="selling-section section-margin">
            {loading.topSellingProducts ? (
              <div className="container my-2">
                <h1>Top Selling Products</h1>
                <div className="row mx-n2">
                  {[...Array(10)].map((_, index) => (
                    <div
                      key={index}
                      className="col-lg-2 col-md-4 col-sm-6 px-2"
                    >
                      <ProductSkeleton key={index} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              topSellingProducts.length > 0 && (
                <div className="container">
                  <div className="text-start">
                    <h2 className="section-heading">
                      {t("Top Selling Items")}
                    </h2>
                  </div>
                  <div className="section">
                    <div className="row align-items-center custom-row">
                      {topSellingProducts.map((product) => (
                        <HomePageProduct
                          key={product._id}
                          product={product}
                          classes="customPro-col"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )
            )}
          </section>
        )}

        {/* Offer Slider Section */}
        {homePagePermission["offers-section"] && (
          <div className="discount-section maxContainer section-margin">
            <div className="container-fluid p-0">
              <div className="offerSlider">
                <div className="swiper discountSlider">
                  <div className="swiper-wrapper">
                    <Swiper
                      // pagination={{
                      //   type: "fraction",
                      // }}
                      spaceBetween={15}
                      centeredSlides={true}
                      loop={true}
                      speed={800}
                      autoplay={{
                        delay: 4000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                      }}
                      breakpoints={{
                        0: {
                          slidesPerView: 1.3,
                          spaceBetween: 5,
                        },

                        767: {
                          slidesPerView: 2.5,
                          spaceBetween: 5,
                        },

                        991: {
                          slidesPerView: 2.8,
                        },

                        1200: {
                          slidesPerView: 3.2,
                        },
                      }}
                      pagination={false}
                      navigation={false}
                      modules={[Pagination, Navigation]}
                      className="mySwiper"
                    >
                      {homePageSectionThree &&
                        homePageSectionThree?.map((s, i) => (
                          <SwiperSlide key={i}>
                            <div className="swiper-slide">
                              <div className="discount-Images">
                                <a href={s.link} target="_blank">
                                  <img
                                    src={`${MEDIA_URL}/${s.image}`}
                                    alt=""
                                    className="offerBanner"
                                  />
                                </a>
                              </div>
                            </div>
                          </SwiperSlide>
                        ))}
                    </Swiper>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Most View Product */}
        {loading.mostViewedProducts ? (
          <div className="container my-2">
            <h1>Most Viewed Items</h1>
            <div className="row mx-n2">
              {[...Array(10)].map((_, index) => (
                <div key={index} className="col-lg-2 col-md-4 col-sm-6 px-2">
                  <ProductSkeleton key={index} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          mostViewedProducts.length > 0 && (
            <section className="most-views-section section-margin">
              <div className="container">
                <div className="row">
                  <div className="col-md-12 col-lg-12 view-col-1_">
                    <div className="text-start">
                      <h2 className="section-heading ">
                        {t("Most Viewed Items")}
                      </h2>
                    </div>
                    <div className="section">
                    <div className="row align-items-center">
                      {mostViewedProducts
                        // .filter((_, idx) => idx < 3)
                        .map((product) => (
                          <HomePageProduct
                            key={product._id}
                            product={product}
                            classes="customPro-col"
                          />
                        ))}
                    </div>
                    </div>
                  </div>
                  {/* <div className="col-md-12 col-lg-4 view-col-2">
                    <div
                      className={`viewedBanner ${
                        mostViewedProducts.length == 3 ? "smallBannerImage" : ""
                      }`}
                    >
                      {/* <img src="/assets/img/most-viewed-baner.png" alt="" /> */}
                  {/* <img
                        src={`${MEDIA_URL}/${homePageSectionFive.image}`}
                        alt=""
                      />
                    </div>
                  </div> */}
                </div>
              </div>
            </section>
          )
        )}

        {/* small-banner-section */}
        {homePagePermission["small-banner-section"] && (
          <section
            className="small-banner-section"
            style={{
              backgroundColor: `${homePageSectionFour?.backgroundColor}`,
            }}
          >
            <div className="container">
              <div className="watch-banner">
                <figure>
                  <img src={`${MEDIA_URL}/${homePageSectionFour?.image}`} />
                </figure>
                <div className="banner-contents">
                  <h2 className="banner-h2">{homePageSectionFour?.heading}</h2>
                  <a
                    href={homePageSectionFour?.link}
                    target="_blank"
                    className="offer-dtl"
                  >
                    {homePageSectionFour?.buttonName}
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Newly Launched Items */}
        {loading.mostLatestProducts ? (
          <div className="container my-2">
            <h1>Newly Launched Items</h1>
            <div className="row mx-n2">
              {[...Array(10)].map((_, index) => (
                <div key={index} className="col-lg-2 col-md-4 col-sm-6 px-2">
                  <ProductSkeleton key={index} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          mostLatestProducts.length > 0 && (
            <section className="sponsored-section section-margin">
              <div className="container">
                <div className="text-start">
                  <h2 className="section-heading">
                    {t("Newly Launched Items")}
                  </h2>
                </div>
                <div className="newlylaunchedCard section">
                  <div className="row align-items-center">
                    {mostLatestProducts.map((product) => (
                      <div key={product._id} className="customPro-col">
                        <div className="productCard rounded m-t-30">
                          <div className="newItemRow_">
                            
                          <a>
                            <div
                              onClick={() =>
                                router.push(`/product/${product.slug}`)
                              }
                              className="productImgCard cursor"
                            >
                                {/* <img
                                  src={`http://192.168.235.245:7009/uploads/images/product/product_220240215T132544246Z.jpg`}
                                  alt=""
                                  className="img-fluid rounded-top"
                                /> */}
                                <img
                                  src={`${MEDIA_URL}/${product.media}`}
                                  alt=""
                                  className="img-fluid rounded-top"
                                />
                                </div>
                              </a>
                            <div className="newItemDetail">
                              <a
                                onClick={() =>
                                  router.push(`/product/${product.slug}`)
                                }
                                className="proTitle cursor"
                              >
                                {product.name}
                              </a>
                              <div className="itemBoughtTitle">
                                {t("Buy it at the best price")}
                                <span className="proPriRow">
                                  {product.discountedPrice} {product.currency}
                                </span>
                              </div>
                              <div className="newItemStar">
                                {Array(product.reviewsCount)
                                  .fill(null)
                                  .map((_, idx) => (
                                    <svg
                                      key={idx}
                                      viewBox="0 0 35 32"
                                      // fill="currentcolor"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="star"
                                    >
                                      <path
                                        d="M26.7745 30.9928L26.7494 30.9916L26.7243 30.9917C26.6162 30.9922 26.5095 30.9669 26.413 30.9181L17.8324 26.4259L17.3686 26.1831L16.9048 26.4259L8.31938 30.9206L8.31778 30.9215C8.20459 30.981 8.07699 31.0076 7.94948 30.9982L7.87596 31.9954L7.94947 30.9981C7.82195 30.9888 7.69962 30.9438 7.59639 30.8683C7.49316 30.7928 7.41318 30.6899 7.36552 30.5713C7.31787 30.4526 7.30447 30.323 7.32683 30.1971L7.32684 30.197L9.01025 20.7194L9.10308 20.1968L8.72224 19.8271L1.7926 13.0993C1.70674 13.0122 1.64577 12.9037 1.61611 12.7851C1.58677 12.6677 1.58912 12.5447 1.62284 12.4286C1.66307 12.3108 1.73474 12.2061 1.83019 12.126C1.92803 12.0439 2.04695 11.9908 2.17344 11.9728L2.17681 11.9723L11.7723 10.5751L12.2945 10.4991L12.5264 10.025L16.7518 1.38913L16.7535 1.38552C16.8095 1.26997 16.8969 1.17253 17.0056 1.10435C17.1144 1.03616 17.2402 1 17.3686 1C17.497 1 17.6228 1.03616 17.7315 1.10435C17.8403 1.17253 17.9277 1.26997 17.9837 1.38552L17.9836 1.38554L17.9878 1.39404L22.2637 10.0131L22.4967 10.4827L23.0154 10.5583L32.6109 11.9555L32.6143 11.956C32.7407 11.974 32.8597 12.027 32.9575 12.1092C33.0529 12.1893 33.1246 12.2939 33.1648 12.4118C33.1986 12.5278 33.2009 12.6508 33.1716 12.7682C33.1419 12.8869 33.0809 12.9954 32.9951 13.0824L26.0654 19.8102L25.6846 20.18L25.7774 20.7026L27.4609 30.1802L27.4608 30.1802L27.4631 30.1924C27.4875 30.3205 27.4747 30.4529 27.4263 30.574C27.3785 30.6935 27.2979 30.797 27.1939 30.8727C27.071 30.9575 26.9237 30.9997 26.7745 30.9928Z"
                                        stroke="#FFAE5D"
                                        fill="#FFAE5D"
                                        strokeWidth={2}
                                      />
                                    </svg>
                                  ))}

                                {Array(5 - product.reviewsCount)
                                  .fill(null)
                                  .map((_, idx) => (
                                    <svg
                                      key={idx}
                                      viewBox="0 0 35 32"
                                      // fill="currentcolor"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="star"
                                    >
                                      <path
                                        d="M26.7745 30.9928L26.7494 30.9916L26.7243 30.9917C26.6162 30.9922 26.5095 30.9669 26.413 30.9181L17.8324 26.4259L17.3686 26.1831L16.9048 26.4259L8.31938 30.9206L8.31778 30.9215C8.20459 30.981 8.07699 31.0076 7.94948 30.9982L7.87596 31.9954L7.94947 30.9981C7.82195 30.9888 7.69962 30.9438 7.59639 30.8683C7.49316 30.7928 7.41318 30.6899 7.36552 30.5713C7.31787 30.4526 7.30447 30.323 7.32683 30.1971L7.32684 30.197L9.01025 20.7194L9.10308 20.1968L8.72224 19.8271L1.7926 13.0993C1.70674 13.0122 1.64577 12.9037 1.61611 12.7851C1.58677 12.6677 1.58912 12.5447 1.62284 12.4286C1.66307 12.3108 1.73474 12.2061 1.83019 12.126C1.92803 12.0439 2.04695 11.9908 2.17344 11.9728L2.17681 11.9723L11.7723 10.5751L12.2945 10.4991L12.5264 10.025L16.7518 1.38913L16.7535 1.38552C16.8095 1.26997 16.8969 1.17253 17.0056 1.10435C17.1144 1.03616 17.2402 1 17.3686 1C17.497 1 17.6228 1.03616 17.7315 1.10435C17.8403 1.17253 17.9277 1.26997 17.9837 1.38552L17.9836 1.38554L17.9878 1.39404L22.2637 10.0131L22.4967 10.4827L23.0154 10.5583L32.6109 11.9555L32.6143 11.956C32.7407 11.974 32.8597 12.027 32.9575 12.1092C33.0529 12.1893 33.1246 12.2939 33.1648 12.4118C33.1986 12.5278 33.2009 12.6508 33.1716 12.7682C33.1419 12.8869 33.0809 12.9954 32.9951 13.0824L26.0654 19.8102L25.6846 20.18L25.7774 20.7026L27.4609 30.1802L27.4608 30.1802L27.4631 30.1924C27.4875 30.3205 27.4747 30.4529 27.4263 30.574C27.3785 30.6935 27.2979 30.797 27.1939 30.8727C27.071 30.9575 26.9237 30.9997 26.7745 30.9928Z"
                                        stroke="#FFAE5D"
                                        strokeWidth={2}
                                      />
                                    </svg>
                                  ))}

                                <span className="newItemStarCounter">
                                  {product.reviewsCount} {t("ratings")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )
        )}

        {/* Newly Launched Items */}
        {/* Sponsored Items Section */}
        {homePagePermission["sponsored-items"] &&
          (loading.sponsoredItems ? (
            <div className="container my-2">
              <h1>Sponsored Items</h1>
              <div className="row mx-n2">
                {[...Array(10)].map((_, index) => (
                  <div key={index} className="col-lg-2 col-md-4 col-sm-6 px-2">
                    <ProductSkeleton key={index} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            sponsoredItems.length > 0 && (
              <section className="sponsored-section section-margin">
                <div className="container">
                  <div className="text-start">
                    <h2 className="section-heading">{t("Sponsored Items")}</h2>
                  </div>
                  <div className="section">
                    <div className="row align-items-center">
                      {sponsoredItems.map((product) => (
                        <HomePageProduct
                          key={product._id}
                          product={product}
                          classes="customPro-col"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )
          ))}

        {/* Shop by Vendors */}
        {homePagePermission["featured-vendors"] &&
          (loading.featuredVendors ? (
            <div className="container my-2">
              <h1>Shop by Vendors</h1>
              <div className="row mx-n2">
                {[...Array(10)].map((_, index) => (
                  <div key={index} className="col-lg-2 col-md-4 col-sm-6 px-2">
                    <ProductSkeleton key={index} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            featuredVendors.length > 0 && (
              <section className="section-margin features-section">
                <div className="container">
                  <div className="text-center">
                    <h2 className="section-heading borderhide">
                      Shop by Vendors
                    </h2>
                  </div>
                  <div className="vendorsRow">
                    <ul className="vindorList">
                      <li>
                        <div className="vindorCard">
                          <img src="/assets/img/zara_logo.png" alt="" />
                        </div>
                      </li>
                      <li>
                        <div className="vindorCard">
                          <img src="/assets/img/d&g_logo.png" alt="" />
                        </div>
                      </li>
                      <li>
                        <div className="vindorCard">
                          <img src="/assets/img/H&M-logo.png" alt="" />
                        </div>
                      </li>
                      <li>
                        <div className="vindorCard">
                          <img src="/assets/img/chanel_logo.png" alt="" />
                        </div>
                      </li>
                      <li>
                        <div className="vindorCard">
                          <img src="/assets/img/prada-logo.png" alt="" />
                        </div>
                      </li>
                      <li>
                        <div className="vindorCard">
                          <img src="/assets/img/biba_logo.png" alt="" />
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
            )
          ))}

        {/* Shop by Vendors */}
        {/* Gift Card */}
        {homePagePermission["gift-card"] && (
          <section className="lightBg section-margin">
            <div className="container">
              <div className="offerRow">
                <div className="offerText">
                  <h2 className="offerCardTitle">
                    <span>{t("Shop Gift Cards")}</span>
                    {t("for your loved ones")}
                  </h2>
                  <a href="javascript:void(0)" className="viewOfrBtn">
                    {t("View Offers")}
                  </a>
                </div>
                <div className="offerCardBanner">
                  <img src="/assets/img/offer-banner.png" alt="" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Gift Card */}
        {/* Reel Section */}
        {homePagePermission["reel-section"] && reels?.length > 0 && (
          <section className="section-margin reels-section">
            <div className="container">
              <div className="text-center">
                <h2 className="section-heading borderhide">
                  {t("Trending Reels")}
                </h2>
              </div>
              <SwiperReel reels={reels} />
            </div>
          </section>
        )}
        {/* Reel Section */}
        {/* Blog Section */}
        {homePagePermission["blog-section"] && (
          <section className="section-margin blog-section">
            <div className="container">
              <div className="text-start">
                <h2 className="section-heading">{t("From the blog")}</h2>
              </div>
              <div className="Blogsection">
                <div className="row">
                  <div className="col-md-3">
                    <a className="blogCard" href="javascript:void(0)">
                      <div className="blogImg">
                        <img src="/assets/img/banner-img.jpg" alt="" />
                        <span className="blogTag">{t("Digital")}</span>
                      </div>
                      <div className="blogDTL">
                        <p className="blogTitle">
                          {t(
                            "How mobile phones have changed people's lives in the word"
                          )}
                        </p>
                        <p className="blogPostBy">
                          {t("Posted By")}
                          <span className="postedNme">{t("adlop")}</span>
                        </p>
                      </div>
                    </a>
                  </div>
                  <div className="col-md-3">
                    <a className="blogCard" href="javascript:void(0)">
                      <div className="blogImg">
                        <img src="/assets/img/banner-img.jpg" alt="" />
                        <span className="blogTag">{t("new")}</span>
                      </div>
                      <div className="blogDTL">
                        <p className="blogTitle">
                          {t(
                            "How mobile phones have changed people's lives in the word"
                          )}
                        </p>
                        <p className="blogPostBy">
                          {t("Posted By")}
                          <span className="postedNme">{t("adlop")}</span>
                        </p>
                      </div>
                    </a>
                  </div>
                  <div className="col-md-3">
                    <a className="blogCard" href="javascript:void(0)">
                      <div className="blogImg">
                        <img src="/assets/img/banner-img.jpg" alt="" />
                        <span className="blogTag">{t("Update")}</span>
                      </div>
                      <div className="blogDTL">
                        <p className="blogTitle">
                          {t(
                            "How mobile phones have changed people's lives in the word"
                          )}
                        </p>
                        <p className="blogPostBy">
                          {t("Posted By")}
                          <span className="postedNme">{t("adlop")}</span>
                        </p>
                      </div>
                    </a>
                  </div>
                  <div className="col-md-3">
                    <a className="blogCard" href="javascript:void(0)">
                      <div className="blogImg">
                        <img src="/assets/img/offerslide1.jpg" alt="" />
                        <span className="blogTag">{t("offer")}</span>
                      </div>
                      <div className="blogDTL">
                        <p className="blogTitle">
                          {t(
                            "How mobile phones have changed people's lives in the word"
                          )}
                        </p>
                        <p className="blogPostBy">
                          {t("Posted By")}
                          <span className="postedNme">{t("adlop")}</span>
                        </p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        {/* Blog Section */}
        {homePagePermission["about-company"] && (
          <section className="section-margin aboutSection">
            <div className="container">
              <div className="text-start mb-22">
                <h2 className="sectionLast-heading">{aboutUs?.title}</h2>
              </div>
              <p
                className="aboutTExt"
                dangerouslySetInnerHTML={{ __html: aboutUs?.description }}
              />
            </div>
          </section>
        )}

        {/* Subscribe */}
        <Newsletter />
        {/* Subscribe */}
      </>
    </Layout>
  );
};

export async function getServerSideProps(context) {
  await createAxiosCookies(context);

  const {
    query: { verify },
    locale,
  } = context;

  let verifyNews = { status: false };

  if (verify) {
    verifyNews = await verifyNewsletter({ token: verify });
  }

  const [homeData] = await Promise.all([getHomePageData()]);

  return {
    props: {
      protected: null,
      key: new Date().toString(),
      verifyNews,
      homeData,
      locales: {
        ...require(`../locales/index/${context.locale}.json`),
      },
    },
  };
}

export default Home;
