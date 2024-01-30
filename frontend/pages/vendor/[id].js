import React, {
  useEffect,
  useState,
  useLayoutEffect,
  useCallback,
} from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import Layout from "@/components/Layout";
import { createAxiosCookies, isVideoPlaying } from "@/fn";
import { getProducts } from "@/services/product";
import PaginationComponent from "@/components/Pagination";
import ProductListing from "@/components/ProductListing";
import { getVendorDetails } from "@/services/vendor";
import SwiperReel from "@/components/SwiperReel";
import useRequest from "@/hooks/useRequest";

const PER_PAGE = 30;

const VendorDetails = ({
  vendorName,
  productsArr,
  totalProductsCount,
  reels,
  vendorId,
}) => {
  const [products, setProducts] = useState(productsArr);
  const [totalProducts, setTotalProducts] = useState(totalProductsCount);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [resizeElementsCount, setResizeElementsCount] = useState(0);

  const t = useTranslations("Index");

  const { register, watch, unregister, control } = useForm();

  const { request, response } = useRequest();

  useLayoutEffect(() => {
    const elements = document.querySelectorAll(".customPro-col-product");

    elements.forEach((ele) => {
      ele.classList.remove("col-md-6", "col-lg-4", "col-xxl-3");
      ele.classList.add("col-md-4", "col-lg-3", "col-xxl-2");
    });
  }, [resizeElementsCount]);

  useEffect(() => {
    const subscription = watch((values, { name, type }) => {
      setCurrentPage(1);
      fetchData(1);
    });
    return () => subscription.unsubscribe();
  }, [watch, searchTerm]);

  useEffect(() => {
    if (response) {
      setResizeElementsCount((prev) => prev + 1);
      setProducts(response.products);
      setTotalProducts(response.totalProducts);
    }
  }, [response]);

  const fetchData = useCallback(
    (page) => {
      const values = watch();
      const { sortBy } = values;

      request(
        "GET",
        `v1/vendor/details/${vendorId}?searchTerm=${searchTerm}&page=${page}&sortBy=${sortBy}&perPage=${PER_PAGE}`
      );
    },
    [searchTerm]
  );

  const fetchMoreData = ({ selected }) => {
    setProducts([]);

    setCurrentPage(selected + 1);
    fetchData(selected + 1);
  };

  const searchTermHandler = (e) => {
    e.preventDefault();

    const sortBy = watch("sortBy");
    setCurrentPage(1);
    request(
      "GET",
      `v1/vendor/details/${vendorId}?searchTerm=${searchTerm}&page=${1}&sortBy=${sortBy}&perPage=${PER_PAGE}`
    );
  };

  return (
    <Layout seoData={{ pageTitle: "Vendor Details" }}>
      <section className="VendorHeroBanner">
        <div className="container">
          <div className="col-12 VendorDetailscard">
            <h2 className="offerCardTitle">
              <span>{vendorName}</span> for your loved ones
            </h2>
          </div>
        </div>
      </section>

      {reels.length > 0 && (
        <section className="section-padding reels-section">
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

      <section className="selling-section vendorPage">
        <div className="container">
          <div className="vendorTitleRow section-heading">
            <h2 className="section-heading borderhide mb-0">Products</h2>
            <div className="vendorItemSearch">
              <form onSubmit={searchTermHandler} className="d-flex">
                <input
                  className="form-control"
                  type="text"
                  placeholder="Search.."
                  name="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit">
                  <i class="fa fa-search"></i>
                </button>
              </form>
            </div>
          </div>

          <ProductListing
            totalProducts={totalProducts}
            currentPage={currentPage}
            products={products}
            register={register}
          />
          <PaginationComponent
            currentPage={currentPage}
            totalItems={totalProducts}
            perPage={PER_PAGE}
            fetchMoreItems={fetchMoreData}
          />
        </div>
      </section>
    </Layout>
  );
};

export async function getServerSideProps(context) {
  await createAxiosCookies(context);

  const {
    query: { id },
  } = context;

  const { status, vendorName, products, totalProducts, currency, reels } =
    await getVendorDetails(id);

  if (!status) {
    return {
      redirect: {
        permanent: false,
        destination: `/${context.locale}`,
      },
    };
  }

  return {
    props: {
      protected: null,
      key: new Date().toString(),
      productsArr: products,
      totalProductsCount: totalProducts,
      currency,
      vendorName,
      reels,
      vendorId: id,
      locales: {
        ...require(`../../locales/index/${context.locale}.json`),
      },
    },
  };
}

export default VendorDetails;
