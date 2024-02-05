import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { updateCartTotal } from "@/store/auth/action";
import useTranslate from "@/hooks/useTranslate";
import useRequest from "@/hooks/useRequest";
import { MEDIA_URL } from "@/api";
import Wishlist from "./Wishlist";
import { toast } from "react-toastify";

const HomePageProduct = ({ classes, product, addToCartFn }) => {


  const t = useTranslate();

  const router = useRouter();
  const dispatch = useDispatch();

  const { loggedIn, role,cartTotal } = useSelector((state) => state.auth);

  const routeToProduct = () => {
    console.log(`/product/${product.slug}`);
    console.log(product,"product");
    //return;
    //router.push(`/product/${product.slug}?vendor=${product.vendor}`);
    router.push(
      {
        pathname: `/product/${product.en_slug}`,
        query: { vendor: product.vendor },
      },
      `/product/${product.en_slug}`
    );
  };

  const { request: addToCartRequest, response: addToCartResponse } =
    useRequest();

  const addToCartHandler = () => {
    if (!loggedIn) {
      router.push("/customer/login");
      return;
    }

    if (role === "vendor") {
      toast.error(t("Switch to customer to buy products."));
      return;
    }

    if (addToCartFn) {
      addToCartFn({
        id: product.idForCart,
        productType: product.typeForCart,
        quantity: 1,
      });
      return;
    }

    addToCartRequest("POST", "v1/cart/add-product", {
      id: product.idForCart,
      productType: product.typeForCart,
      quantity: 1,
    });
  };

  useEffect(() => {
    if (addToCartResponse) {
      let cTotal = (addToCartResponse.data.cartTotal) ? addToCartResponse.data.cartTotal : 0;
      dispatch(updateCartTotal({ cartTotal: cTotal }));
      toast.success("Product added to the cart successfully.");
      console.log("classes",cartTotal);
    }
  }, [addToCartResponse]);

  return (
    <div className={classes}>
      <div className="productCard rounded m-t-30">
        <Wishlist
          isWishlistedProp={product.isWishlisted}
          id={product.idForCart}
          type="product"
          productType={product.typeForCart}
        />
        <a>
          <div onClick={routeToProduct} className="productImgCard cursor">
            <img
              className="img-fluid rounded-top"
              // src="/assets/img/products/p1.png"
              src={`${MEDIA_URL}/${product.media}`}
              alt="Classified Plus"
            />
            {product.isBestSeller && (
              <span className="BSellerTag">{t("Best Seller")}</span>
            )}
          </div>
          <div className="featured-text">
            <div
              onClick={routeToProduct}
              className="text-top d-flex justify-content-between cursor"
            >
              <div className="proTitle">{product.name}</div>
            </div>
            <div className="proPriRow">
              <span className="InnPriTag">
                <span
                  className={`${
                    product.discountPercentage !== 0
                      ? "lineThrough proPri"
                      : "ofrProPri"
                  }`}
                >
                  {product.currency}
                  {product.price}
                </span>
                {product.discountPercentage !== 0 && (
                  <span className="ofrProPri">
                    {product.currency}
                    {product.discountedPrice}
                  </span>
                )}
              </span>
              {product.discountPercentage > 0 && (
                <span className="ofrTag">
                  -{product.discountPercentage}% off
                </span>
              )}
            </div>
            <div className="proStars m-t-5">
              {Array(product.ratings)
                .fill(null)
                .map((_, idx) => (
                  <svg
                    key={idx}
                    width={17}
                    height={16}
                    viewBox="0 0 17 16"
                    // fill="none"
                    fill="currentcolor"
                    xmlns="http://www.w3.org/2000/svg"
                    className="star"
                  >
                    <path
                      d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                      fill="#FFAE5D"
                    />
                  </svg>
                ))}
              {Array(5 - product.ratings)
                .fill(null)
                .map((_, idx) => (
                  <svg
                    key={idx}
                    width={17}
                    height={16}
                    viewBox="0 0 17 16"
                    // fill="none"
                    fill="currentcolor"
                    xmlns="http://www.w3.org/2000/svg"
                    className="star"
                  >
                    <path d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z" />
                  </svg>
                ))}
              <span className="StarCount">
                ({product.reviewsCount}) {t("ratings")}
              </span>
            </div>
          </div>
        </a>
        {/* <a href="javascript:void(0)" className="proCartBtn">
          {t("Add to Cart")}
        </a> */}
        <a
          onClick={addToCartHandler}
          href="javascript:void(0)"
          className="proCartBtnborder"
        >
          {t("Add to Cart")}
        </a>
      </div>
    </div>
  );
};

export default HomePageProduct;
