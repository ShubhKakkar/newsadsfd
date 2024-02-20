import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { createAxiosCookies, quantityOptions } from "@/fn";
import { getCartItems, getListItems } from "@/services/customer";
import { updateCartTotal } from "@/store/auth/action";
import Newsletter from "@/components/Newsletter";
import Layout from "@/components/Layout";
import BreadCrumb from "@/components/customer/BreadCrumb";
import { MEDIA_URL } from "@/api";
import useRequest from "@/hooks/useRequest";
import HomePageProduct from "@/components/HomePageProduct";

const PER_PAGE = 6;

const Cart = ({ initialCartItems, currency, list }) => {
  const { cartTotal } = useSelector((state) => state.auth);

  const [cartItems, setCartItems] = useState(initialCartItems);

  const { request, response } = useRequest();

  const { request: requestRemove, response: responseRemove } = useRequest();

  const { request: requestSavedForLater, response: responseSavedForLater } =
    useRequest();

  const { request: requestMoveToCart, response: responseMoveToCart } =
    useRequest();

  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (response) {
      const { id, quantity } = response.data;
      setCartItems((prev) =>
        prev.map((p) => {
          if (p.idForCart == id) {
            p.quantity = quantity;
            p.totalPrice = +(p.discountedPrice * quantity).toFixed(2);
          }
          return p;
        })
      );
    }
  }, [response]);

  useEffect(() => {
    if (responseRemove) {
      const id = responseRemove.data.id;
      setCartItems((prev) => prev.filter((p) => p.idForCart !== id));
      let cTotal = responseRemove.data.cartTotal
        ? responseRemove.data.cartTotal
        : 0;
      dispatch(updateCartTotal({ cartTotal: cTotal }));
    }
  }, [responseRemove]);

  useEffect(() => {
    if (responseSavedForLater) {
      router.replace(router.asPath);
    }
  }, [responseSavedForLater]);

  // useEffect(() => {
  //   if (responseSavedForLater) {
  //     const id = responseSavedForLater.data.id;
  //     setCartItems((prev) => prev.filter((p) => p.idForCart !== id));
  //   }
  // }, [responseSavedForLater]);

  useEffect(() => {
    if (responseMoveToCart) {
      router.replace(router.asPath);
    }
  }, [responseMoveToCart]);

  const updateQuantityHandler = (id, quantity) => {
    request("POST", "v1/cart/update-quantity", {
      id,
      quantity,
    });
  };

  const removeItemHandler = (id) => {
    requestRemove("POST", "v1/cart/remove", { id });
  };

  const pushToProductDetailPage = (slug) => {
    router.push(`/product/${slug}`);
  };

  const savedForLaterHandler = (id, productType) => {
    requestSavedForLater("POST", "v1/cart/saved-for-later", {
      id,
      productType,
    });
  };

  const addToCartFnHandler = (data) => {
    requestMoveToCart("POST", "v1/list/move-to-cart", data);
  };

  const orderAmount = useMemo(() => {
    return +cartItems.reduce((acc, cv) => acc + cv.totalPrice, 0).toFixed(2);
  }, [cartItems]);

  console.log("cartItems", cartItems);

  return (
    <>
      <Layout seoData={{ pageTitle: "My Cart - Noonmar" }}>
        <section className="Checkout_Process_wrapper">
          <div className="container">
            <BreadCrumb values={["My Cart"]} />

            <div className="Checkout_main_block">
              <h1 className="LeftBlockTitle">My Cart </h1>
              <div className="row gx-5">
                {cartItems.length > 0 ? (
                  <div className="col-md-12 col-lg-8 col-xl-9">
                    <div className="Checkout_Process_box">
                      <div className="personal_info_page TabelCartSection table-responsive">
                        {/* card section */}

                        <table className="table align-middle table-borderless table-border-spacing">
                          <thead>
                            <tr>
                              <th scope="col">Product</th>
                              <th scope="col">Price</th>
                              <th scope="col" className="text-center">
                                Quantity
                              </th>
                              <th scope="col" className="text-center">
                                Total{" "}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {cartItems.map((item) => (
                              <tr
                                className="my_Cart_product my_Cart_border"
                                key={item.idForCart}
                              >
                                <td className="offer-dtl-col">
                                  <div className="MyCartBlock">
                                    <div
                                      onClick={() =>
                                        pushToProductDetailPage(item.engSlug)
                                      }
                                      className="myCartImg cursor"
                                    >
                                      <img
                                        src={`${MEDIA_URL}/${item.media}`}
                                        alt={item.name}
                                      />
                                    </div>
                                    <div className="myCartTitle">
                                      <h3
                                        onClick={() =>
                                          pushToProductDetailPage(item.engSlug)
                                        }
                                        className="myCartMainTilte cursor"
                                      >
                                        {item.name}
                                      </h3>
                                      <span className="myCartColorSizeBox">
                                        {item.variants &&
                                          item.variants.map(
                                            (variant, variantIndex) => (
                                              <p
                                                className="myCartColorSize"
                                                key={variantIndex}
                                              >
                                                {variant.label}: {variant.value}
                                              </p>
                                            )
                                          )}
                                      </span>
                                      <p className="myCartSellerName">
                                        Seller name: {item.vendorName}
                                      </p>
                                      <a
                                        href="#!"
                                        className="myCartSaveRemoveBox"
                                      >
                                        <span
                                          onClick={() =>
                                            savedForLaterHandler(
                                              item.idForCart,
                                              item.typeForCart
                                            )
                                          }
                                          className="myCartSaveBox"
                                        >
                                          <i className="far fa-heart" /> Save it
                                          for Later
                                        </span>
                                        <span
                                          onClick={() =>
                                            removeItemHandler(item.idForCart)
                                          }
                                          className="myCartremoveBox"
                                        >
                                          <i className="fas fa-times-circle" />{" "}
                                          Remove
                                        </span>
                                      </a>
                                    </div>
                                  </div>
                                  <div className="EstimatedDelivery">
                                    <a href="#!" className="CartproductReturn">
                                      <i className="fal fa-clock" /> Estimated
                                      Delivery: <span>22nd , Saturday </span>
                                    </a>
                                  </div>
                                </td>
                                <td>
                                  {item.discountedPrice} &nbsp;
                                  {item.currency}
                                </td>
                                <td>
                                  <div className="form-group productQuantityBox CartproductQuantityBox">
                                    <select
                                      className="form-select form-control"
                                      aria-label="Default select example"
                                      defaultValue={item.quantity}
                                      onChange={(e) =>
                                        updateQuantityHandler(
                                          item.idForCart,
                                          e.target.value
                                        )
                                      }
                                    >
                                      {/* <option selected="">{item.quantity}</option> */}
                                      {quantityOptions()}
                                    </select>
                                  </div>
                                </td>
                                <td className="text-center">
                                  {item.totalPrice} &nbsp;
                                  {item.currency}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="col-md-12 col-lg-8 col-xl-9">
                    <div className="nofoundResult">
                      <div className="msgTitle">No product in the cart.</div>
                    </div>
                  </div>
                )}
                <div className="col-md-12 col-lg-4 col-xl-3">
                  <div className="my_address Check_my_address" id="addressBook">
                    <div className="infomation_title_banner">
                      {false && (
                        <h3 className="Checkout_info_title  Checkout_info_totals">
                          Cart Totals
                        </h3>
                      )}
                      <div>
                        {/* className="Cart_Totals_block" */}
                        {false && (
                          <>
                            <div className="Cart_Total_title">
                              <h3>Order Amount: </h3>
                              <span>
                                {currency} {orderAmount}
                              </span>
                            </div>
                            <div className="Cart_Total_title CartTotalTitle2">
                              <h3>Delivery Fee: </h3>
                              <span>{currency} 0.00</span>
                            </div>
                            <div className="Cart_Total_title CartTotalTitle3">
                              <h3>Applicable Taxes: </h3>
                              <span>{currency} 0.00</span>
                            </div>
                            <div className="Cart_Total_title CartTotalTitleThree">
                              <h3>Custom Fees</h3>
                              <span>{currency} 0.00</span>
                            </div>
                          </>
                        )}

                        {cartItems.length > 0 && (
                          <div
                            style={{ paddingTop: 0 }}
                            className="TotalPriceCart "
                          >
                            <h3>Total Price:</h3>
                            <span>
                              {orderAmount} {currency}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="checkPaymentCartBtn">
                        {cartItems.length > 0 && (
                          <Link href="/checkout" legacyBehavior>
                            <a className="payment_Make_Btn">Place an order</a>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {list.totalProducts > 0 && (
                  <div className="col-lg-12 ">
                    <section className="sponsored-section">
                      <div className="container p-0">
                        <div className="text-start">
                          <h2 className="section-heading titleBtnRow">
                            Saved for Later{" "}
                          </h2>
                        </div>
                        <div className="section">
                          <div className="row align-items-center">
                            {list.products.map((product) => (
                              <HomePageProduct
                                classes="customPro-col"
                                key={product.idForCart}
                                product={product}
                                addToCartFn={addToCartFnHandler}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        <Newsletter />
      </Layout>
    </>
  );
};

export async function getServerSideProps(context) {
  await createAxiosCookies(context);

  const [cartData, listData] = await Promise.all([
    getCartItems(),
    getListItems({}),
  ]);

  const { cartItems, currency, status } = cartData;

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
      initialCartItems: cartItems,
      currency,
      list: listData,
      key: new Date().toISOString(),
      locales: {
        ...require(`../locales/index/${context.locale}.json`),
      },
    },
  };
}

export default Cart;
