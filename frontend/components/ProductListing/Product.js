import useRequest from "@/hooks/useRequest";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { updateCartTotal } from "@/store/auth/action";
import { MEDIA_URL } from "@/api";
import useTranslate from "@/hooks/useTranslate";
import { toast } from "react-toastify";
import Share from "../Share";
import Wishlist from "../Wishlist";

const Product = ({ product }) => {
  const t = useTranslate();

  const router = useRouter();
  const dispatch = useDispatch();
  
  const { request: addToCartRequest, response: addToCartResponse } =
    useRequest();

  const { loggedIn, role } = useSelector((state) => state.auth);

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
      quantity: 1,
    });

    if (buyNow) {
      router.push("/cart");
    }
  };

  useEffect(() => {
     if (addToCartResponse) {
      let cTotal = (addToCartResponse.data.cartTotal) ? addToCartResponse.data.cartTotal : 0;
      dispatch(updateCartTotal({ cartTotal: cTotal }));
       toast.success("Product added to the cart.");
     }
  }, [addToCartResponse]);

  const routeToProduct = () => {
    router.push(
      {
        pathname: `/product/${product.slug}`,
        query: { vendor: product.vendor },
      },
      `/product/${product.slug}`
    );
  };

  return (
    <>
      <div className="col-md-6 col-sm-6 col-lg-4 col-xxl-3  customPro-col-product  ">
        <div className="productCard rounded m-t-30 ">
          <div className="product-listing_card">
            <Wishlist
              isWishlistedProp={product.isWishlisted}
              id={product.idForCart}
              type="product"
              productType={product.typeForCart}
            />
            <div className="RedemptionDropdown ProShareDropdown">
              <div className="dropdown">
                <button
                  className="btn-action-filter dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="fal fa-share-alt" />
                </button>
                <ul className="dropdown-menu" style={{ minWidth: "100px" }}>
                  <li>
                    <div className="action_radios">
                      <div className="shareBtn">
                        <Share data={product} />
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            {/* <a href="javascript:void(0)" className="likeProtow">
              <i className="fal fa-share-alt" />
            </a> */}
            <div onClick={routeToProduct} className="productImgCard cursor">
              <img
                className="img-fluid rounded-top"
                //   src="/assets/img/products/product-img01.png"
                src={`${MEDIA_URL}/${product.media}`}
                alt="Classified Plus"
              />
            </div>
          </div>
          <div className="featured-text">
            <div
              onClick={routeToProduct}
              className="text-top d-flex justify-content-between cursor"
            >
              <div className="proTitle" style={{ height: "40px" }}>
                {product.name}
              </div>
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
            {/* {product.reviewsCount !== 0 && ( */}
            <div className="proStars m-t-5">
              {Array(product.ratings)
                .fill(null)
                .map((_, idx) => (
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
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                      fill="currentcolor"
                    />
                  </svg>
                ))}
              <span className="StarCount">({product.reviewsCount})</span>
            </div>
            {/* )} */}
            <div className="product-btnGroup">
              <a
                onClick={() => addToCartHandler(false)}
                href="javascript:void(0)"
                className="proCartBtnborder"
              >
                {t("Add to Cart")}
              </a>
              <a
                onClick={() => addToCartHandler(true)}
                href="javascript:void(0)"
                className="proCartBtn proBuyBtn"
              >
                {t("Buy Now")}
              </a>
              {/* <a href="javascript:void(0)" className="proCartBtnborder">
                {t("Add to Cart")}
              </a>
              <a href="javascript:void(0)" className="proCartBtn proBuyBtn">
                {t("Buy Now")}
              </a> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Product;
