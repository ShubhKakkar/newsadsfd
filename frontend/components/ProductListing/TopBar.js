import React from "react";
import useTranslate from "@/hooks/useTranslate";

const TopBar = ({
  isGridView,
  setIsGridView,
  totalProducts,
  currentPage,
  products,
  register,
}) => {
  const t = useTranslate();

  return (
    <div className="product-listingOrder" id="order-scroll">
      <div className="showing_order">
        <div className="list-grid-toggle">
          <i
            onClick={() => setIsGridView(true)}
            className={`[ icon icon--grid ] fa fa-th ${
              isGridView ? "active" : ""
            }`}
          />
          <i
            onClick={() => setIsGridView(false)}
            className={`[ icon icon--list ] fa fa-list ${
              isGridView ? "" : "active"
            }`}
          />
        </div>
        <h5 className="showingTitle">
          {t("Showing")} {!totalProducts ? 0 : 1 + 30 * (currentPage - 1)} -{" "}
          {products.length < 30 ? totalProducts : 30 * currentPage} of{" "}
          {totalProducts} {t("Products")}
        </h5>
      </div>
      <div className="listingCategory">
        <div className="listingCategorySelect">
          <div className="row align-items-center">
            <label htmlFor="inputEmail3" className="col-md-3 col-3 col-form-label">
              {t("Sort by")}
            </label>
            <div className="col-md-9 col-9">
              <div className="form-group">
                <select
                  className="form-select form-control dark-form-control"
                  aria-label="Default select "
                  {...register("sortBy", {
                    required: true,
                  })}
                >
                  <option selected value="new">
                    {t("Newest Arrivals")}
                  </option>
                  <option value="priceAsc">{t("Price: Low to High")} </option>
                  <option value="priceDesc">{t("Price: High to Low")}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
