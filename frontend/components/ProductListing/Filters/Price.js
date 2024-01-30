import React from "react";
import useTranslate from "@/hooks/useTranslate";


export const PriceRange = ({ maxPrice }) => {
  const t = useTranslate();

  return (
    <>
      {maxPrice > 0 ? (
        <div className="accordion-item">
          <h2 className="accordion-header" id="flush-headingFour">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#flush-collapseFour"
              aria-expanded="false"
              aria-controls="flush-collapseFour"
            >
              {t("Price Range")}
            </button>
          </h2>
          <div
            id="flush-collapseFour"
            className="accordion-collapse collapse"
            aria-labelledby="flush-headingFour"
            data-bs-parent="#accordionFlushExample"
          >
            <div className="accordion-body">
              <div className="stock-checkBox">
                <div className="pf-Bx">
                  <label className="form-check-label mb-3 ms-0">
                   {t("Filter By Price")}
                  </label>
                  <div className="pf-inbx">
                    <div className="budget-slider">
                      <input
                        type="text"
                        id="budget_slider"
                        name="budget_sler"
                        defaultValue=""
                      />
                      <span className="Min">{t("Min")}</span>
                      <span className="Max">{t("Max")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
