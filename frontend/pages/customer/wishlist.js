import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import useTranslate from "@/hooks/useTranslate";

import { createAxiosCookies } from "@/fn";
import { getWishlistProducts } from "@/services/wishlist";
import Newsletter from "@/components/Newsletter";
import Layout from "@/components/Layout";
import BreadCrumb from "@/components/customer/BreadCrumb";
import Sidebar from "@/components/customer/Sidebar";
import { MEDIA_URL } from "@/api";
import useRequest from "@/hooks/useRequest";
import Pagination from "@/components/Pagination";
import { useDispatch } from "react-redux";
import { logout } from "@/store/auth/action";
import { Logout } from "@/components/Svg";
import { Modal } from "react-bootstrap";
import { useForm } from "react-hook-form";

const PER_PAGE = 6;

const Wishlist = ({ totalProductsCount, allProducts }) => {
  const t = useTranslate();

  const dispatch = useDispatch();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    setValue,
  } = useForm();

  const [products, setProducts] = useState(allProducts);
  const [isShareListModalOpen, setIsShareListModalOpen] = useState(false);

  const [totalProducts, setTotalProducts] = useState(totalProductsCount);

  const [name, setName] = useState("");
  const [page, setPage] = useState(1);
  const [isSearch, setIsSearch] = useState(false);

  const { request, response } = useRequest();
  const {
    request: removeProductWishlistRequest,
    response: removeProductWishlistResponse,
  } = useRequest();
  const { request: addToCartRequest, response: addToCartResponse } =
    useRequest();
  const { request: wishListShareRequest, response: wishListShareResponse } =
    useRequest();

  useEffect(() => {
    if (isSearch) {
      const getData = setTimeout(() => {
        request("GET", `v1/wishlist?name=${name}`);
      }, 1000);

      return () => clearTimeout(getData);
    }
  }, [name]);

  useEffect(() => {
    if (response) {
      if (response.status) {
        setProducts(response.products);
        setTotalProducts(response.totalProducts);
      }
    }
  }, [response]);

  useEffect(() => {
    if (removeProductWishlistResponse) {
      toast.success(removeProductWishlistResponse.message);
      setProducts(
        products.filter((p) => p.idForCart !== removeProductWishlistResponse.id)
      );
    }
  }, [removeProductWishlistResponse]);

  useEffect(() => {
    if (addToCartResponse) {
      toast.success("Product added to the cart successfully.");
    }
  }, [addToCartResponse]);

  useEffect(() => {
    if (wishListShareResponse) {
      toast.success(wishListShareResponse.message);
      setIsShareListModalOpen(false);
      setValue("emailOrPhone", "");
      setValue("via_email", "");
      // setValue("via_link", "");
    }
  }, [wishListShareResponse]);

  const removeProductWishlistHandler = (id) => {
    removeProductWishlistRequest("PUT", "v1/wishlist/remove", { id });
  };

  const fetchMoreData = ({ selected }) => {
    setPage(selected + 1);
    request("GET", `v1/wishlist?page=${selected + 1}`);
  };

  const addToCartHandler = (idForCart, typeForCart, buyNow = false) => {
    addToCartRequest("POST", "v1/cart/add-product", {
      id: idForCart,
      productType: typeForCart,
      quantity: 1,
    });

    if (buyNow) {
      router.push("/cart");
    }
  };

  const onSubmit = (data) => {
    const { emailOrPhone } = data;

    wishListShareRequest("POST", "v1/wishlist/share", {
      emailOrPhone,
    });
  };

  return (
    <Layout seoData={{ pageTitle: "My Wishlist - Noonmar" }}>
      <section className="product-search-listing">
        <div className="container">
          <BreadCrumb values={["My Wishlist"]} />

          <div className="row g-4 gx-md-5">
            <Sidebar />

            <div className="col-lg-9">
              <div className="Wishists_product_block">
                <div className="Wishists_product">
                  <h2 className="RightBlockTitle">{t("My Wishlist")}</h2>
                  <a
                    className="DashlogOutBtn cursor"
                    onClick={() => dispatch(logout())}
                  >
                    <Logout />
                    {t("Logout")}
                  </a>
                </div>
                <div className="wishists_Input_Btn_box">
                  <div className="Wishists_product_input">
                    <input
                      type="search"
                      className="form-control"
                      placeholder={t("Search")}
                      aria-label="Search"
                      onChange={(e) => {
                        setName(e.target.value), setIsSearch(true);
                      }}
                      value={name}
                    />
                    <button
                      className="searchIconBtn wishistsearchIconBtn"
                      type="submit"
                    >
                      {" "}
                      <svg
                        width={18}
                        height={18}
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M17 17L13.2223 13.2156M15.3158 8.15789C15.3158 10.0563 14.5617 11.8769 13.2193 13.2193C11.8769 14.5617 10.0563 15.3158 8.15789 15.3158C6.2595 15.3158 4.43886 14.5617 3.0965 13.2193C1.75413 11.8769 1 10.0563 1 8.15789C1 6.2595 1.75413 4.43886 3.0965 3.0965C4.43886 1.75413 6.2595 1 8.15789 1C10.0563 1 11.8769 1.75413 13.2193 3.0965C14.5617 4.43886 15.3158 6.2595 15.3158 8.15789V8.15789Z"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="shareBtnBox ">
                    <a
                      href="#!"
                      className="shareCartBtn"
                      onClick={() => {
                        // setIsShareListModalOpen(true);
                      }}
                    >
                      <i className="fal fa-share-alt" /> {t("Share list")}
                    </a>
                  </div>
                </div>
              </div>

              <div className="row g-4">
                {products.length > 0 ? (
                  products.map((p, i) => (
                    <div
                      className="col-md-12 col-sm-12 col-lg-12 col-xl-6"
                      key={p.idForCart}
                    >
                      <div className="wishistsImgCardBox">
                        <div
                          className="wishistsImgCard cursor"
                          onClick={() => router.push(`/product/${p.slug}`)}
                        >
                          <img
                            className=""
                            src={`${MEDIA_URL}/${p.media}`}
                            alt="Classified Plus"
                          />
                          {/* <span className="BSellerTag">Best Seller</span> */}
                        </div>
                        <div className="featured-text">
                          <div
                            className="text-top cursor"
                            onClick={() => router.push(`/product/${p.slug}`)}
                          >
                            <div className="proTitle">{p.name}</div>
                          </div>
                          <div className="proStars m-t-5">
                            {Array(p.ratings)
                              .fill(null)
                              .map((_, idx) => (
                                <svg
                                  width={17}
                                  height={16}
                                  viewBox="0 0 17 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  key={idx}
                                >
                                  <path
                                    d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                    fill="#FFAE5D"
                                  />
                                </svg>
                              ))}
                            {Array(5 - p.ratings)
                              .fill(null)
                              .map((_, idx) => (
                                <svg
                                  width={17}
                                  height={16}
                                  viewBox="0 0 17 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  key={idx}
                                >
                                  <path
                                    d="M8.5 0L10.4084 5.87336L16.584 5.87336L11.5878 9.50329L13.4962 15.3766L8.5 11.7467L3.50383 15.3766L5.41219 9.50329L0.416019 5.87336L6.59163 5.87336L8.5 0Z"
                                    fill="currentcolor"
                                  />
                                </svg>
                              ))}

                            <span className="StarCount">
                              ({p.reviewsCount})
                            </span>
                          </div>
                          <div className="proPriRow">
                            <span className="InnPriTag">
                              {/* <span className="ofrProPri">
                                {p.currency}
                                {p.price}
                              </span> */}
                              <span
                                className={`${
                                  p.discountPercentage !== 0
                                    ? "lineThrough proPri"
                                    : "ofrProPri"
                                }`}
                              >
                                {p.currency}
                                {p.price}
                              </span>
                              {p.discountPercentage !== 0 && (
                                <span className="ofrProPri">
                                  {p.currency}
                                  {p.discountedPrice}
                                </span>
                              )}
                            </span>
                            {p.discountPercentage > 0 && (
                              <span className="ofrTag">
                                -{p.discountPercentage}% off
                              </span>
                            )}
                          </div>
                          <div className="product-btnGroup wishists_Card_Btn">
                            <a
                              onClick={() =>
                                addToCartHandler(p.idForCart, p.typeForCart)
                              }
                              href="javascript:void(0)"
                              className="proCartBtnborder"
                            >
                              {t("Add to Cart")}
                            </a>
                            {/* <a
                              href="javascript:void(0)"
                              className="proCartBtn proBuyBtn"
                            >
                              {t("Buy Now")}
                            </a> */}
                            <a
                              onClick={() =>
                                addToCartHandler(
                                  p.idForCart,
                                  p.typeForCart,
                                  true
                                )
                              }
                              href="javascript:void(0)"
                              className="proCartBtn proBuyBtn"
                            >
                              {t("Buy Now")}
                            </a>
                          </div>
                          <div className="remove_product_item cursor">
                            <a
                              onClick={() =>
                                removeProductWishlistHandler(p.idForCart)
                              }
                              className="remove_product_red"
                            >
                              <i className="fas fa-times-circle" />{" "}
                              {t("Remove Product")}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="nofoundResult">
                    <div className="msgTitle">Sorry, no products found!</div>
                    <p>
                      Please check the spelling or try searching for something
                      else
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {products.length > 0 && (
          <Pagination
            currentPage={page}
            totalItems={totalProducts}
            perPage={PER_PAGE}
            fetchMoreItems={fetchMoreData}
          />
        )}
      </section>

      <Modal
        show={isShareListModalOpen}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        className="late_fee_rule_modal"
        onHide={() => setIsShareListModalOpen(false)}
      >
        <div className="modal-content">
          {/* <button type="button" className="btn" onClick={() => setIsShareListModalOpen(false)}>
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 39C30.45 39 39 30.45 39 20C39 9.55 30.45 1 20 1C9.55 1 1 9.55 1 20C1 30.45 9.55 39 20 39Z"
                stroke="#282342"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M14.6211 25.377L25.3751 14.623"
                stroke="#282342"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M25.3751 25.377L14.6211 14.623"
                stroke="#282342"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button> */}

          <div className="modal-header"></div>
          <div className="modal-body">
            <form>
              <div className="row">
                <div className="col-lg-12">
                  <div className="form-group">
                    <div className="form-input-box">
                      <label>{t("Email Or Phone")}</label>
                      <div className="form-group">
                        <input
                          type="text"
                          name="emailOrPhone"
                          placeholder={t("Enter email/phone number*")}
                          className="form-control dark-form-control"
                          defaultValue=""
                          {...register("emailOrPhone", {
                            required: true,
                            validate: (value) => {
                              const emailRegex =
                                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                              const phoneRegex = /^[0-9]{10}$/;

                              const emailCheck = emailRegex.test(value);
                              const phoneCheck = phoneRegex.test(value);
                              if (emailCheck) {
                                return true;
                              }
                              if (phoneCheck) {
                                return true;
                              }
                              return false;
                            },
                          })}
                        />

                        {errors.emailOrPhone?.type === "required" && (
                          <span className="text-danger">
                            {t("This field is required")}
                          </span>
                        )}
                        {errors.emailOrPhone &&
                          errors.emailOrPhone?.type === "validate" && (
                            <span className="text-danger ">
                              {t("Please enter a valid email")}
                            </span>
                          )}
                      </div>
                    </div>

                    {/* <div style={{ display: "flex" }}>
                      <div className="custom_checkbox check-type2">
                        <label>Via Email</label>
                        <input
                          style={{ margin: "0px 0px 0px 15px" }}
                          type="checkbox"
                          {...register("via_email")}
                        />
                      </div>
                      <div className="custom_checkbox check-type2">
                        <label style={{ marginLeft: "20px" }}>Via Link</label>
                        <input
                          style={{ margin: "0px 0px 0px 15px" }}
                          type="checkbox"
                          {...register("via_link")}
                        />
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            </form>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit(onSubmit)}
            >
              {t("Share")}
            </button>
          </div>
        </div>
      </Modal>

      <Newsletter />
    </Layout>
  );
};

export async function getServerSideProps(context) {
  await createAxiosCookies(context);

  const { products, totalProducts, status } = await getWishlistProducts();

  if (!status) {
    return {
      redirect: {
        permanent: false,
        destination: `/`,
      },
    };
  }

  return {
    props: {
      protected: true,
      userTypes: ["customer"],
      allProducts: products,
      totalProductsCount: totalProducts,
      locales: {
        ...require(`../../locales/index/${context.locale}.json`),
      },
    },
  };
}

export default Wishlist;
