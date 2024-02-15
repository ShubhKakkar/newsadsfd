import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import ReactImageMagnify from "react-image-magnify";
import { useSelector, useDispatch } from "react-redux";
import { updateCartTotal } from "@/store/auth/action";
import { toast } from "react-toastify";
import useTranslate from "@/hooks/useTranslate";
import Link from "next/link";
import Modal from "react-bootstrap/Modal";

// Import Swiper styles
// import "swiper/css";
// import "swiper/css/pagination";
// import "swiper/css/navigation"

import Share from "@/components/Share";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { Pagination, Navigation, FreeMode, Thumbs } from "swiper";

import Layout from "@/components/Layout";
import { createAxiosCookies, quantityOptions } from "@/fn";
import { getProduct } from "@/services/product";
import { MEDIA_URL } from "@/api";
import { Swiper, SwiperSlide } from "swiper/react";
import HomePageProduct from "@/components/HomePageProduct";
import useRequest from "@/hooks/useRequest";

const Product = ({
  product,
  firstFeaturesArr,
  secondFeaturesArr,
  variants,
  variantsValue,
  selectedVariant,
  recentlyViewedProducts,
  otherSellers,
  vendor,
}) => {
  const t = useTranslate();

  const [firstFeaturesObj, setFirstFeaturesObj] = useState({
    features: firstFeaturesArr,
    showAll: false,
  });
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const [secondFeaturesObj, setSecondFeaturesObj] = useState({
    features: secondFeaturesArr,
    showAll: false,
  });

  const [isWishlisted, setIsWishlisted] = useState(product.isWishlisted);

  const [quantity, setQuantity] = useState(1);
  const [showReviewsModal, setShowReviewsModal] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();

  const { loggedIn, role } = useSelector((state) => state.auth);

  const { request, response } = useRequest();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    clearErrors,
    getValues,
    watch,
  } = useForm();

  const { request: addToCartRequest, response: addToCartResponse } =
    useRequest();

  const addToCartHandler = (buyNow = false) => {
    if (!loggedIn) {
      router.push("/customer/login");
      return;
    }

    if (role === "vendor") {
      toast.error(t("Switch to customer to buy products."));
      return;
    }

    addToCartRequest("POST", "v1/cart/add-product", {
      id: product.idForCart,
      productType: product.typeForCart,
      quantity,
    });

    if (buyNow) {
      router.push("/cart");
    }
  };

  useEffect(() => {
    if (addToCartResponse) {
      setQuantity(1);
      let cTotal = addToCartResponse.data.cartTotal
        ? addToCartResponse.data.cartTotal
        : 0;
      dispatch(updateCartTotal({ cartTotal: cTotal }));
      toast.success("Product successfully added to the cart.");
    }
  }, [addToCartResponse]);

  useEffect(() => {
    if (selectedVariant) {
      if (selectedVariant.firstVariant) {
        setValue(
          `variant-0-${selectedVariant.firstVariant}`,
          selectedVariant.firstValue
        );
      }
      if (selectedVariant.secondVariant) {
        setValue(
          `variant-1-${selectedVariant.secondVariant}`,
          selectedVariant.secondValue
        );
      }
    }
  }, [selectedVariant]);

  useEffect(() => {
    const subscription = watch((values) => {
      if (Object.keys(values).length === 2) {
        let firstVariant, firstValue, secondVariant, secondValue;

        for (let key in values) {
          const value = values[key];
          const [_, id, name] = key.split("-");
          if (+id == 0) {
            firstVariant = name;
            firstValue = value;
          } else {
            secondVariant = name;
            secondValue = value;
          }
        }

        const variant = variants.find(
          (v) =>
            v.firstVariant === firstVariant &&
            v.firstValue === firstValue &&
            v.secondVariant === secondVariant &&
            v.secondValue === secondValue
        );

        routeToProduct(variant.slug, vendor);
      } else {
        let firstVariant, firstValue;
        for (let key in values) {
          const value = values[key];
          const [_, id, name] = key.split("-");
          if (+id === 0) {
            firstVariant = name;
            firstValue = value;
          }
        }

        const variant = variants.find(
          (v) => v.firstVariant === firstVariant && v.firstValue === firstValue
        );
        routeToProduct(variant.slug, vendor);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    if (response) {
      if (isWishlisted) {
        toast.success("Removed from wishlist successfully");
      } else {
        toast.success("Added to wishlist successfully");
      }
      setIsWishlisted((prev) => !prev);
    }
  }, [response]);

  const toggleWishlist = () => {
    if (!loggedIn) {
      router.push("/customer/login");
      return;
    }

    if (role === "vendor") {
      return;
    }

    if (isWishlisted) {
      request("PUT", "v1/wishlist/remove", { id: product.idForCart });
    } else {
      request("POST", "v1/wishlist/add", {
        id: product.idForCart,
        type: "product",
        productType: product.typeForCart,
      });
    }
  };

  useEffect(() => {
    $(".featured-text").matchHeight();
  }, []);

  const routeToProduct = (slug, vendor) => {
    router.push(
      {
        pathname: `/product/${slug}`,
        query: { vendor },
      },
      `/product/${slug}`
    );
  };

  return (
    <Layout seoData={{ pageTitle: "Noonmar" }}>
      {/* product-search-detail Start */}
      <section className="product-search-detail">
        <div className="container">
          <div className="row g-5">
            <div className="col-md-12 col-lg-5">
              <div className="productSliderImg">
                {/* product slider Start */}

                <Swiper
                  style={{
                    "--swiper-navigation-color": "#fff",
                    "--swiper-pagination-color": "#fff",
                  }}
                  loop={true}
                  spaceBetween={10}
                  navigation={false}
                  thumbs={{ swiper: thumbsSwiper }}
                  modules={[FreeMode, Navigation, Thumbs]}
                  className="mySwiper sliderTopImg"
                >
                  {product.media.map((media) => (
                    <SwiperSlide key={media._id}>
                      <div
                        className="swiper-slide product-slider-img"
                        // style={{ width: "400px", height: "360px" }}
                      >
                        {/* <ReactImageMagnify
                          {...{
                            smallImage: {
                              alt: "Wristwatch by Ted Baker London",
                              isFluidWidth: true,
                              src: `http://192.168.235.245:7008/${media.src}`,
                              sizes:
                              "(max-width: 480px) 100vw, (max-width: 1200px) 30vw, 360px",
                            },
                            largeImage: {
                              src: `http://192.168.235.245:7008/${media.src}`,
                              width: 1000,
                              height: 1800,
                            },
                              enlargedImageContainerStyle: {
                              zIndex: "1500",
                            },
                            enlargedImageContainerDimensions: {
                              width: "100%",
                              height: "100%",
                            },
                          }}
                           <div className="fluid">
                          <div className="fluid__image-container">
                            <ReactImageMagnify
                              {...{
                                smallImage: {
                                  alt: "Wristwatch by Ted Baker London",
                                  isFluidWidth: true,
                                  src: `${MEDIA_URL}/${media.src}`,
                                  srcSet: srcSet,
                                  sizes:
                                    "(max-width: 480px) 100vw, (max-width: 1200px) 30vw, 360px",
                                },
                                largeImage: {
                                  src: `${MEDIA_URL}/${media.src}`,
                                  width: 1200,
                                  height: 1800,
                                },
                              }}
                            />
                          </div>
                        </div> 
                        /> */}
                        <img src={`${MEDIA_URL}/${media.src}`} />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                <Swiper
                  onSwiper={setThumbsSwiper}
                  slidesPerView={4}
                  navigation={true}
                  watchSlidesProgress={true}
                  modules={[Navigation, Thumbs]}
                  className="mySwiper sliderBottomImg"
                >
                  {product.media.map((media) => (
                    <SwiperSlide key={media._id}>
                      <img
                        className="product-slider-tow"
                        src={`${MEDIA_URL}/${media.src}`}
                      />
                      {/* <ReactImageMagnify
                        {...{
                          smallImage: {
                            alt: "Wristwatch by Ted Baker London",
                            isFluidWidth: true,
                            src: "http://192.168.245.200:7008/uploads/images/product/2023-04-27T10-04-56.935Z-black.jpeg",
                          },
                          largeImage: {
                            src: "http://192.168.245.200:7008/uploads/images/product/2023-04-27T10-04-56.935Z-black.jpeg",
                            width: 1200,
                            height: 1800,
                          },
                        }}
                      /> */}
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
            {/* product slider End */}
            <div className="col-md-12 col-lg-7">
              <div className="product-search-block">
                <div className="row">
                  {/* Ratings  */}
                  <div className="col-md-7 col-sm-7">
                    <h1 className="OversizeBoxTitle">{product.name}</h1>
                    <h4 className="hmStoreSub">
                      {" "}
                      {product.vendorData?.businessName}{" "}
                    </h4>
                    <div className="proStars">
                      <a href="#!">
                        {new Array(product.ratings).fill(null).map((_, idx) => (
                          <svg
                            key={idx}
                            className="active"
                            width={25}
                            height={23}
                            viewBox="0 0 25 23"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12.4825 0L15.3007 8.67344H24.4205L17.0424 14.0339L19.8606 22.7074L12.4825 17.3469L5.10443 22.7074L7.9226 14.0339L0.54453 8.67344H9.66433L12.4825 0Z"
                              // fill="currentcolor"
                              fill="#FFAE5D"
                            />
                          </svg>
                        ))}

                        {new Array(5 - product.ratings)
                          .fill(null)
                          .map((_, idx) => (
                            <svg
                              key={idx}
                              className="active"
                              width={25}
                              height={23}
                              viewBox="0 0 25 23"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12.4825 0L15.3007 8.67344H24.4205L17.0424 14.0339L19.8606 22.7074L12.4825 17.3469L5.10443 22.7074L7.9226 14.0339L0.54453 8.67344H9.66433L12.4825 0Z"
                                fill="currentcolor"
                              />
                            </svg>
                          ))}
                      </a>
                      <span className="StarRatings">
                        ({product.reviewsCount}) {t("Ratings")}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-5 col-sm-5">
                    <div className="shareNameIcon">
                      <div className="socialIcon">{t("Share Via")}:</div>
                      <div className="socialShare">
                        <Share data={product} /> 
                      </div>
                    </div>
                    {/* <div className="CompareRightBtn">
                      <a href="#!" className="CompareBtn">
                        <i className="fal fa-exchange" />
                        {t("Compare")}
                      </a>
                    </div> */}
                  </div>
                </div>
                {/*product price  */}
                <div className="productOrderWishlist">
                  <div className="product_price">
                    {product.discountPercentage > 0 && (
                      <span className="product_price_title">
                        {product.discountedPrice}&nbsp;
                        {product.currency}
                      </span>
                    )}
                    {product.discountPercentage <= 0 ? (
                      <span className="product_price_title">
                        {product.price}&nbsp;
                        {product.currency}
                      </span>
                    ) : (
                      <span className="product_price_default">
                        {product.price}&nbsp;
                        {product.currency}
                      </span>
                    )}

                    {product.discountPercentage > 0 && (
                      <span className="product_price_off">
                        {product.discountPercentage}%OFF
                      </span>
                    )}
                  </div>
                  {role !== "vendor" && (
                    <div onClick={toggleWishlist} className="product_wishlist">
                      {isWishlisted ? (
                        <a className="addToWishlistBtn cursor">
                          <i className="fas fa-heart" /> Remove From Wishlist
                        </a>
                      ) : (
                        <a className="addToWishlistBtn cursor">
                          <i className="far fa-heart" /> {t("Add To Wishlist")}
                        </a>
                      )}
                    </div>
                  )}
                </div>
                {/* delivery date/pickup */}
                {/* <div className="productDetailsCheck">
                  <div className="row">
                    <div className="col-md-5">
                      <h4 className="productDetailsCheckTitle">
                        {t("Delivery Details")}
                      </h4>
                      <p className="productDetailsCheckDis">
                        {t("Check estimated delivery date/pickup option")}
                      </p>
                    </div>
                    <div className="col-md-7">
                      <div className="form-group pincode-product">
                        <input
                          type="text"
                          name="text"
                          placeholder={t("Apply Valid Pincode")}
                          className="form-control dark-form-control "
                          defaultValue=""
                        />
                        <button type="button" className="pincode-Check-product">
                          {t("CHECK")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div> */}
                {/* img color size */}
                {variantsValue.length > 0 && (
                  <div className="productSizeColor">
                    {false && (
                      <div className=" productColor">
                        <span>color</span>
                        <div>
                          <input
                            className="form-check-input size_input d-none"
                            type="radio"
                            name="flexRadioDefault33"
                            id="flexRadioDefault3"
                          />
                          <label
                            className="form-check-label productLabelImg"
                            htmlFor="flexRadioDefault3"
                          >
                            <figure>
                              <img
                                src="/assets/img/product-color-1.png"
                                alt=""
                              />
                              <figcaption className="productImg_title">
                                Happy Grey
                              </figcaption>
                            </figure>
                          </label>
                        </div>
                        <div>
                          <input
                            className="form-check-input size_input d-none"
                            type="radio"
                            name="flexRadioDefault33"
                            id="flexRadioDefault4"
                          />
                          <label
                            className="form-check-label productLabelImg"
                            htmlFor="flexRadioDefault4"
                          >
                            <figure>
                              <img
                                src="/assets/img/product-color-2.png"
                                alt=""
                              />
                              <figcaption className="productImg_title">
                                Olive Green
                              </figcaption>
                            </figure>
                          </label>
                        </div>
                        <div>
                          <input
                            className="form-check-input size_input d-none"
                            type="radio"
                            name="flexRadioDefault33"
                            id="flexRadioDefault5"
                          />
                          <label
                            className="form-check-label productLabelImg"
                            htmlFor="flexRadioDefault5"
                          >
                            <figure>
                              <img
                                src="/assets/img/product-color-3.png"
                                alt=""
                              />
                              <figcaption className="productImg_title">
                                Maroon
                              </figcaption>
                            </figure>
                          </label>
                        </div>
                        <div>
                          <input
                            className="form-check-input size_input d-none"
                            type="radio"
                            name="flexRadioDefault33"
                            id="flexRadioDefault6"
                          />
                          <label
                            className="form-check-label productLabelImg"
                            htmlFor="flexRadioDefault6"
                          >
                            <figure>
                              <img
                                src="/assets/img/product-color-4.png"
                                alt=""
                              />
                              <figcaption className="productImg_title">
                                Shadow Mint
                              </figcaption>
                            </figure>
                          </label>
                        </div>
                      </div>
                    )}
                    {console.log("variantsValue", variantsValue)}
                    {variantsValue.map((variant, index) => (
                      <div className="productSize">
                        <span>{variant.name}</span>
                        {variant.values.map((value, idx) => (
                          <div key={value} className="form-check">
                            <input
                              className="form-check-input size_input d-none"
                              type="radio"
                              value={value}
                              id={`flexRadioDefault${variant.name}-${value}`}
                              {...register(`variant-${index}-${variant.name}`)}
                            />
                            <label
                              className="form-check-label size_label"
                              htmlFor={`flexRadioDefault${variant.name}-${value}`}
                            >
                              {value}
                            </label>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
                {/*Use Card */}
                {/* <div className="productCheckblock position-relative">
                  <Swiper
                    spaceBetween={30}
                    slidesPerView="2"
                    loop={false}
                    navigation={false}
                    modules={[Pagination, Navigation]}
                    className="mySwiper proGetOffer"
                  >
                    <SwiperSlide>
                      <div className="swiper-slide">
                        <div className="productCheckCard">
                          <div className="productgetAbove">
                            <div className="productOffUpto">
                              <h4>
                                Get upto 30% Off on order value above $100
                              </h4>
                              <a href="#!">Terms &amp; Conditions</a>
                            </div>
                            <div className="productOffCode">
                              <div className="productCodeTitle">
                                <span className="useCodeProduct">
                                  Use Code{" "}
                                </span>
                                <span className="orderCodePro">ORDER100</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                    <SwiperSlide>
                      <div className="swiper-slide">
                        <div className="productCheckCard">
                          <div className="productgetAbove">
                            <div className="productOffUpto">
                              <h4>
                                Get upto 30% Off on order value above $100
                              </h4>
                              <a href="#!">Terms &amp; Conditions</a>
                            </div>
                            <div className="productOffCode">
                              <div className="productCodeTitle">
                                <span className="useCodeProduct">
                                  Use Code{" "}
                                </span>
                                <span className="orderCodePro">ORDER100</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                    <SwiperSlide>
                      <div className="swiper-slide">
                        <div className="productCheckCard">
                          <div className="productgetAbove">
                            <div className="productOffUpto">
                              <h4>
                                Get upto 30% Off on order value above $100
                              </h4>
                              <a href="#!">Terms &amp; Conditions</a>
                            </div>
                            <div className="productOffCode">
                              <div className="productCodeTitle">
                                <span className="useCodeProduct">
                                  Use Code{" "}
                                </span>
                                <span className="orderCodePro">ORDER100</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  </Swiper>
                </div> */}
                {/* Buy Btn */}
                <div className="productBuyCart">
                  <div className="form-group  productQuantityBox">
                    <label className="form-label productQuantitytitle">
                      {t("Quantity")}:
                    </label>
                    <select
                      className="form-select form-control"
                      aria-label="Default select example"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    >
                      {quantityOptions()}
                    </select>
                  </div>
                  <div className="productBuyAdd">
                    {/* <a
                      href="javascript:void(0)"
                      className="proCartBtn proBuyBtn"
                    >
                      {t("Buy Now")}
                    </a> */}
                    <a
                      onClick={() => addToCartHandler(true)}
                      href="javascript:void(0)"
                      className="proCartBtn proBuyBtn"
                    >
                      {t("Buy Now")}
                    </a>
                  </div>
                  <div className="productBuyAdd">
                    <a
                      onClick={() => addToCartHandler(false)}
                      href="javascript:void(0)"
                      className="proCartBtn"
                    >
                      <i className="far fa-shopping-bag" /> {t("Add to Cart")}
                    </a>
                  </div>
                </div>
                {/* Return Policy */}
                {/* <div>
                  <a href="#!" className="productReturn">
                    <i className="fal fa-clock" /> 15 {t("days Return Policy")}
                  </a>
                </div> */}
              </div>
            </div>
          </div>
          <div className="Product_Detail_page">
            <div className="Description_wrapper">
              <h3 className="Description_heading_Btn">
                {t("Product Description")}
              </h3>
              <div className="product_Vendor_Details_block">
                <div className="product_discrition_block">
                  <div
                    className="product_discrition_box"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />

                  <div className="Vendor_Details_Store">
                    <a href="#!" className="Vendor_Details_Store_btn">
                      {t("Vendor Details")}
                    </a>
                    <div className="productVendorStorebox">
                      <div className="hm-store-content">
                        <img
                          // src="/assets/img/HM-img-product.png"
                          src={`${MEDIA_URL}/${product.vendorData?.profilePic}`}
                          alt=""
                          style={{ width: "65px" }}
                        />
                        <div className="hm-store-contnent-title">
                          <span className="hm-store-title">
                            {product.vendorData?.businessName}
                          </span>
                          <span>
                            {/* product.vendorData?.ratings */}
                            {new Array(5).fill(null).map((_, idx) => (
                              <svg
                                key={idx}
                                width={17}
                                height={16}
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                  // fill="#FFAE5D"
                                  fill="currentcolor"
                                />
                              </svg>
                            ))}

                            <span className="StarRatings">
                              ({product.vendorData?.reviewsCount})
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="ProductContactVendor">
                      {console.log("product", product)}
                        <Link
                          href={`/vendor/${product.vendorData?._id}`}
                          legacyBehavior
                        >
                          <a className="ProductContactVendorBtn">
                            {t("Contact Vendor")}
                          </a>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {firstFeaturesObj.features.length > 0 && (
              <div className="features_wrapper">
                <h3 className="Description_heading_Btn">
                  {/* {product.featureTitle} */}
                  Feature or Specification
                </h3>
                <div className="Features_Specifications_box">
                  <div className="row g-4">
                    <div className="col-md-12 col-lg-6">
                      <div className="Material_spec_block">
                        <div className="MaterialSpecBox1">
                          <span className="materialBoxTitle1 p-2" />
                        </div>
                        {firstFeaturesObj.features
                          .filter((f, idx) => {
                            if (firstFeaturesObj.showAll) {
                              return f;
                            } else {
                              if (idx < 4) {
                                return f;
                              }
                            }
                          })
                          .map((feature, idx) => (
                            <div key={idx} className="MaterialSpecBox1">
                              <span className="materialBoxTitle1">
                                {feature.label}
                              </span>
                              <span className="materialBoxTitle2">
                                {feature.value}
                              </span>
                            </div>
                          ))}

                        <div className="MaterialSpecBox1">
                          <span className="materialBoxTitle1 p-2" />
                        </div>
                        {firstFeaturesObj.features.length > 4 && (
                          <div className="MaterialViewBox3">
                            <a href="#!" className="FeaturesViewAll">
                              View All{" "}
                              <svg
                                width={22}
                                height={11}
                                viewBox="0 0 22 11"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M0.371582 0.512451L10.7538 10.8946L21.1359 0.512451L0.371582 0.512451Z"
                                  fill="black"
                                />
                              </svg>
                            </a>
                          </div>
                        )}
                      </div>
                      <div />
                    </div>
                    {secondFeaturesObj.features.length > 0 && (
                      <div className="col-md-12 col-lg-6">
                        <div className="Material_spec_block">
                          <div className="MaterialSpecBox1">
                            <span className="materialBoxTitle1 p-2" />
                          </div>
                          {secondFeaturesObj.features
                            .filter((f, idx) => {
                              if (secondFeaturesObj.showAll) {
                                return f;
                              } else {
                                if (idx < 4) {
                                  return f;
                                }
                              }
                            })
                            .map((feature, idx) => (
                              <div key={idx} className="MaterialSpecBox1">
                                <span className="materialBoxTitle1">
                                  {feature.label}
                                </span>
                                <span className="materialBoxTitle2">
                                  {feature.value}
                                </span>
                              </div>
                            ))}
                          <div className="MaterialSpecBox1">
                            <span className="materialBoxTitle1 p-2" />
                          </div>
                          {secondFeaturesObj.features.length > 4 && (
                            <div className="MaterialViewBox3">
                              <a href="#!" className="FeaturesViewAll">
                                View All{" "}
                                <svg
                                  width={22}
                                  height={11}
                                  viewBox="0 0 22 11"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M0.371582 0.512451L10.7538 10.8946L21.1359 0.512451L0.371582 0.512451Z"
                                    fill="black"
                                  />
                                </svg>
                              </a>
                            </div>
                          )}
                        </div>
                        <div />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {product.reviews.length > 0 && (
              <>
                <div className="Ratings_wrapper">
                  <h3 className="Description_heading_Btn">
                    Ratings and Reviews{" "}
                  </h3>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="reviews-rating-box">
                        {false && (
                          <div className="reviewBar">
                            <div className="rating-boxes">
                              <div className="rating-titles">5</div>
                              <div className="progress">
                                <div
                                  className="progress-bar bg-warning"
                                  role="progressbar"
                                  style={{ width: "100%" }}
                                  aria-valuenow={30}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                />
                              </div>
                            </div>
                            <div className="rating-boxes">
                              <div className="rating-titles">4</div>
                              <div className="progress">
                                <div
                                  className="progress-bar bg-warning"
                                  role="progressbar"
                                  style={{ width: "70%" }}
                                  aria-valuenow={30}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                />
                              </div>
                            </div>
                            <div className="rating-boxes">
                              <div className="rating-titles">3</div>
                              <div className="progress">
                                <div
                                  className="progress-bar bg-warning"
                                  role="progressbar"
                                  style={{ width: "55%" }}
                                  aria-valuenow={30}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                />
                              </div>
                            </div>
                            <div className="rating-boxes">
                              <div className="rating-titles">2</div>
                              <div className="progress">
                                <div
                                  className="progress-bar bg-warning"
                                  role="progressbar"
                                  style={{ width: "30%" }}
                                  aria-valuenow={30}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                />
                              </div>
                            </div>
                            <div className="rating-boxes">
                              <div className="rating-titles">1</div>
                              <div className="progress">
                                <div
                                  className="progress-bar bg-warning"
                                  role="progressbar"
                                  style={{ width: "20%" }}
                                  aria-valuenow={30}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="reviewBar">
                          {[5, 4, 3, 2, 1].map((id) => (
                            <div key={id} className="rating-boxes">
                              <div className="rating-titles">{id}</div>
                              <div className="progress">
                                <div
                                  className="progress-bar bg-warning"
                                  role="progressbar"
                                  style={{
                                    width: `${product.reviewData[id]}%`,
                                  }}
                                  aria-valuenow={30}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="reviewCount">
                          <div className="reviewcountBlock">
                            <span className="reviewCountValue">
                              {product.ratings}
                              <svg
                                width={16}
                                height={16}
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M8.01135 0L10.3233 5.48516L16 6.12418L11.7497 10.1297L12.9255 16L7.98699 12.9902L3.037 15.9795L4.23497 10.1137L0 6.09081L5.67875 5.47543L8.01135 0Z"
                                  fill="#FFB400"
                                />
                              </svg>
                            </span>
                            <span className="totalReviews">
                              {product.reviewsCount} Reviews
                            </span>
                          </div>
                          <div className="reviewcountBlock">
                            <span className="reviewCountValue">
                              {product.reviewData.recommended}%
                            </span>
                            <span className="totalReviews">Recommended</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="reviewListing">
                  <div className="reviewListHeader">
                    <h3 className="reviewsListTitle">Reviews</h3>
                    <a
                      href="javascript:void(0)"
                      className="viewAllReview"
                      onClick={() => setShowReviewsModal(true)}
                      // data-bs-toggle="modal"
                      // data-bs-target="#exampleModal"
                    >
                      View All Reviews
                    </a>
                  </div>
                  <div className="reviewsRow">
                    <div className="row gx-15">
                      {product.reviewsFiltered.map((review) => (
                        <div key={review._id} className="col-md-6">
                          <div className="reviewInnCard">
                            <div className="reviewInnCardHead">
                              <div className="ReviewUserInfoTag">
                                <div className="ReviewsUImg">
                                  <img
                                    src={
                                      review.userData.profilePic
                                        ? `${MEDIA_URL}/${review.userData.profilePic}`
                                        : "/assets/img/review-avatar.png"
                                    }
                                    alt=""
                                  />
                                </div>
                                <div className="userIngoRow">
                                  <span className="ReviewNme">
                                    {review.userData.name}
                                    <span className="reviewUserFlag">
                                      <img
                                        src={
                                          review.countryFlag
                                            ? `${MEDIA_URL}/${review.countryFlag}`
                                            : "/assets/img/americanflag.png"
                                        }
                                        alt=""
                                      />
                                      {review.countryName}
                                    </span>
                                  </span>
                                  <span className="ReviewUserTag">
                                    Verified Buyer
                                  </span>
                                </div>
                              </div>
                              <div className="reviewStarCount">
                                <span>{review.rating}</span>
                                {Array(review.rating)
                                  .fill(null)
                                  .map((_, idx) => (
                                    <svg
                                      key={idx}
                                      width={16}
                                      height={16}
                                      viewBox="0 0 16 16"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M8.01135 0L10.3233 5.48516L16 6.12418L11.7497 10.1297L12.9255 16L7.98699 12.9902L3.037 15.9795L4.23497 10.1137L0 6.09081L5.67875 5.47543L8.01135 0Z"
                                        fill="#FFB400"
                                      />
                                    </svg>
                                  ))}
                                {Array(5 - review.rating)
                                  .fill(null)
                                  .map((_, idx) => (
                                    <svg
                                      key={idx}
                                      width={16}
                                      height={16}
                                      viewBox="0 0 16 16"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M8.01135 0L10.3233 5.48516L16 6.12418L11.7497 10.1297L12.9255 16L7.98699 12.9902L3.037 15.9795L4.23497 10.1137L0 6.09081L5.67875 5.47543L8.01135 0Z"
                                        fill="currentcolor"
                                      />
                                    </svg>
                                  ))}
                              </div>
                            </div>
                            <div className="reviewInnCardBody">
                              <p className="reviewTxt">{review.review}</p>
                              <div className="reviewContentImg">
                                {review.files.map((file, idx) => (
                                  <span
                                    className={
                                      idx == 3 && review.files.length - 4 > 0
                                        ? "lastReviewImg"
                                        : ""
                                    }
                                    key={idx}
                                    style={{
                                      display: idx > 3 ? "none" : "flex",
                                    }}
                                  >
                                    <a
                                      href={`${MEDIA_URL}/${file}`}
                                      data-fancybox={review._id}
                                    >
                                      <img
                                        src={`${MEDIA_URL}/${file}`}
                                        alt=""
                                      />
                                    </a>
                                    {idx == 3 &&
                                      review.files.length - 4 > 0 && (
                                        <span className="PlusImgCount">
                                          +{review.files.length - 4}
                                        </span>
                                      )}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="reviewInnCardFooter">
                              {/* <div className="reviewFooter">
                            <div className="d-flex">
                              Helpful ?{" "}
                              <span className="yesNoCount">
                                <span>Yes (2)</span> | <span>No (0)</span>
                              </span>
                            </div>
                            <div>Nov 09, 2022</div>
                          </div> */}
                              <div className="reviewFooter">
                                {/* <div className="d-flex textBlack">
                              Color：<span>Clnnamon | Size：6</span>
                            </div> */}
                                {review.isRecommended && (
                                  <div className="reviewRecommend">
                                    <svg
                                      width={12}
                                      height={9}
                                      viewBox="0 0 12 9"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M3.86339 7.08333L1.08339 4.30333L0.136719 5.24333L3.86339 8.97L11.8634 0.969999L10.9234 0.0299988L3.86339 7.08333Z"
                                        fill="#4CAF50"
                                      />
                                    </svg>
                                    Recommended
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {otherSellers.length > 0 && (
              <div class="OtherSellersBlock">
                <h3 class="Description_heading_Btn">Other sellers</h3>
                <div class="otherSellerCard">
                  <div class="row g-4">
                    {otherSellers.map((seller) => (
                      <div key={seller._id} class="col-md-6 col-lg-6 col-xl-3">
                        <div
                          onClick={() =>
                            routeToProduct(seller.slug, seller.vendorData._id)
                          }
                          class="productDateSeller cursor"
                        >
                          <div class="otherSellerImg">
                            <img src={`${MEDIA_URL}/${seller.media}`} alt="" />
                          </div>
                          <div class="otherSellerName">
                            <h3 class="myCartMainTilte">{seller.name}</h3>
                            <p class="myCartSellerName">
                              Seller name : {seller.vendorData?.businessName}
                            </p>
                            <div class="otherSellerAmount">
                              {seller.discountPercentage > 0 && (
                                <span class="otherSellerOf">
                                  -{seller.discountPercentage}% off
                                </span>
                              )}
                              {/* seller.discountedPrice */}
                              <span
                                class={
                                  seller.discountPercentage > 0
                                    ? `otherSellerPrice`
                                    : "otherSellerOf"
                                }
                              >
                                {seller.currency}
                                {seller.price}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="other_Details_Store">
                          <a href="#!" class="Vendor_Details_Store_btn">
                            Vendor Details
                          </a>
                          <div class="productVendorStorebox">
                            <div class="hm-store-content">
                              <img
                                src={`${MEDIA_URL}/${seller.vendorData?.profilePic}`}
                                alt=""
                              />
                              <div class="hm-store-contnent-title">
                                <span class="hm-store-title">
                                  {seller.vendorData?.businessName}
                                </span>
                                <span>
                                  {/* seller.vendorData?.ratings */}
                                  {Array(5)
                                    .fill(null)
                                    .map((_, idx) => (
                                      <svg
                                        key={idx}
                                        width="17"
                                        height="16"
                                        viewBox="0 0 17 16"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                          fill="#FFAE5D"
                                        ></path>
                                      </svg>
                                    ))}

                                  <span class="StarRatings">
                                    ({seller.vendorData?.reviewsCount})
                                  </span>
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
            )}
            {product.faqs?.length > 0 && (
              <div className="FAQ _wrapper">
                <h3 className="Description_heading_Btn">
                  Frequently Asked Questions (FAQs)
                </h3>
                <div className="QuestionBlock">
                  {product.faqs.map((faq, idx) => (
                    <div key={idx} className="questionCard">
                      <div className="questionNO">
                        <p className="QuesTitle">Question</p>
                        <p className="QuesText">{faq.question}</p>
                      </div>
                      <div className="questionNO">
                        <p className="QuesTitle">Answer</p>
                        <p className="QuesText">{faq.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      {/* Sponsored Items Section */}
      {product.similarProducts?.length > 0 && (
        <section className="sponsored-section">
          <div className="container">
            <div className="text-start">
              <h2 className="section-heading titleBtnRow">
                Similar Products
                {false && (
                  <a href="#!" className="ViewAllBtn">
                    View All{" "}
                    <svg
                      width={22}
                      height={11}
                      viewBox="0 0 22 11"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0.371582 0.512451L10.7538 10.8946L21.1359 0.512451L0.371582 0.512451Z"
                        fill="black"
                      />
                    </svg>
                  </a>
                )}
              </h2>
            </div>
            <div className="section">
              <div className="row align-items-center_">
                {product.similarProducts.map((sp) => (
                  <HomePageProduct
                    key={sp._id}
                    product={sp}
                    classes="customPro-col"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
      {/* Sponsored Items Section */}
      {/* Sponsored Items Section */}
      {recentlyViewedProducts.length > 0 && (
        <section className="sponsored-section">
          <div className="container">
            <div className="text-start">
              <h2 className="section-heading titleBtnRow">
                Recently Viewed Items
                {false && (
                  <a href="#!" className="ViewAllBtn">
                    View All{" "}
                    <svg
                      width={22}
                      height={11}
                      viewBox="0 0 22 11"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0.371582 0.512451L10.7538 10.8946L21.1359 0.512451L0.371582 0.512451Z"
                        fill="black"
                      />
                    </svg>
                  </a>
                )}
              </h2>
            </div>
            <div className="section">
              <div className="row align-items-center">
                {recentlyViewedProducts.map((product) => (
                  <HomePageProduct
                    key={product.idForCart}
                    product={product}
                    classes="customPro-col"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <Modal
        dialogClassName="modal-dialog-scrollable modal-xl"
        className="all_reviews_modal"
        show={showReviewsModal}
        onHide={() => {
          setShowReviewsModal(false);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title> All Reviews</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {" "}
          <div className="modal_inner_wrapper">
            <div className="reviewsRow">
              <div className="row gx-15">
                {product.reviews.map((review, ratingIndex) => (
                  <div
                    key={review._id}
                    className="col-sm-12 col-md-12 col-lg-6"
                  >
                    <div className="reviewInnCard">
                      <div className="reviewInnCardHead">
                        <div className="ReviewUserInfoTag">
                          <div className="ReviewsUImg">
                            <img
                              src={
                                review.userData.profilePic
                                  ? `${MEDIA_URL}/${review.userData.profilePic}`
                                  : "/assets/img/review-avatar.png"
                              }
                              alt=""
                            />
                          </div>
                          <div className="userIngoRow">
                            <span className="ReviewNme">
                              {review.userData.name}
                              <span className="reviewUserFlag">
                                <img
                                  src={
                                    review.countryFlag
                                      ? `${MEDIA_URL}/${review.countryFlag}`
                                      : "/assets/img/americanflag.png"
                                  }
                                  alt=""
                                />
                                {review.countryName}
                              </span>
                            </span>
                            <span className="ReviewUserTag">
                              Verified Buyer
                            </span>
                          </div>
                        </div>
                        <div className="reviewStarCount">
                          <span>{review.rating}</span>
                          {Array(review.rating)
                            .fill(null)
                            .map((_, idx) => (
                              <svg
                                key={idx}
                                width={16}
                                height={16}
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M8.01135 0L10.3233 5.48516L16 6.12418L11.7497 10.1297L12.9255 16L7.98699 12.9902L3.037 15.9795L4.23497 10.1137L0 6.09081L5.67875 5.47543L8.01135 0Z"
                                  fill="#FFB400"
                                />
                              </svg>
                            ))}
                          {Array(5 - review.rating)
                            .fill(null)
                            .map((_, idx) => (
                              <svg
                                key={idx}
                                width={16}
                                height={16}
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M8.01135 0L10.3233 5.48516L16 6.12418L11.7497 10.1297L12.9255 16L7.98699 12.9902L3.037 15.9795L4.23497 10.1137L0 6.09081L5.67875 5.47543L8.01135 0Z"
                                  fill="currentcolor"
                                />
                              </svg>
                            ))}
                        </div>
                      </div>
                      <div className="reviewInnCardBody">
                        <p className="reviewTxt">{review.review}</p>
                        <div className="reviewContentImg">
                          {review.files.map((file, idx) => (
                            <span
                              className={
                                idx == 3 && review.files.length - 4 > 0
                                  ? "lastReviewImg"
                                  : ""
                              }
                              key={idx}
                              style={{ display: idx > 3 ? "none" : "flex" }}
                            >
                              <a
                                href={`${MEDIA_URL}/${file}`}
                                data-fancybox={review._id + "_" + ratingIndex}
                              >
                                <img src={`${MEDIA_URL}/${file}`} alt="" />
                              </a>
                              {idx == 3 && review.files.length - 4 > 0 && (
                                <span className="PlusImgCount">
                                  +{review.files.length - 4}
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="reviewInnCardFooter">
                        {/* <div className="reviewFooter">
                          <div className="d-flex">
                            Helpful ?{" "}
                            <span className="yesNoCount">
                              <span>Yes (2)</span> | <span>No (0)</span>
                            </span>
                          </div>
                          <div>Nov 09, 2022</div>
                        </div> */}
                        <div className="reviewFooter">
                          {/* <div className="d-flex textBlack">
                            Color：<span>Clnnamon | Size：6</span>
                          </div> */}
                          {review.isRecommended && (
                            <div className="reviewRecommend">
                              <svg
                                width={12}
                                height={9}
                                viewBox="0 0 12 9"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M3.86339 7.08333L1.08339 4.30333L0.136719 5.24333L3.86339 8.97L11.8634 0.969999L10.9234 0.0299988L3.86339 7.08333Z"
                                  fill="#4CAF50"
                                />
                              </svg>
                              Recommended
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </Layout>
  );
};

//zebronics-zeb-reaper-2-4ghz-wireless-gaming-mouse

export async function getServerSideProps(context) {
  await createAxiosCookies(context);

  const {
    query: { slug, vendor },
  } = context;

  console.log("context,........", context);

  const {
    product,
    currency,
    variants,
    selectedVariant,
    variantsValue,
    recentlyViewedProducts,
    otherSellers,
  } = await getProduct(slug, vendor);

  console.log("product,........", product);

  if (!product || Object.keys(product).length == 0) {
    // console.log("no product", slug);
    return {
      redirect: {
        permanent: false,
        destination: `/${context.locale}`,
      },
    };
  }

  /* if (product.en_slug !== slug) {
    // console.log("different slug", product.slug, slug);
    return {
      redirect: {
        permanent: false,
        destination: `/${context.locale}/product/${product.en_slug}`,
      },
    };
  } */

  const firstFeaturesArr = product.features.slice(
    0,
    product.features.length / 2 + (product.features.length % 2 === 0 ? 0 : 1)
  );

  const secondFeaturesArr = product.features.slice(
    product.features.length / 2 + (product.features.length % 2 === 0 ? 0 : 1),
    product.features.length
  );

  const reviewsFiltered = product.reviews.slice(0, 2);
  product.reviewsFiltered = reviewsFiltered;

  return {
    props: {
      protected: null,
      locales: {
        ...require(`../../locales/index/${context.locale}.json`),
      },
      product,
      currency,
      firstFeaturesArr,
      secondFeaturesArr,
      variants,
      selectedVariant,
      variantsValue,
      recentlyViewedProducts,
      otherSellers,
      key: new Date().toString(),
      vendor: product.vendorData._id,
    },
  };
}

export default Product;
