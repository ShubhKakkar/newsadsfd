import React from "react";
import useTranslate from "@/hooks/useTranslate";

export const Availability = ({ register }) => {
  const t = useTranslate();
  return (
    <div className="accordion-item">
      <h2 className="accordion-header" id="flush-headingSix">
        <button
          className="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#flush-collapseSix"
          aria-expanded="false"
          aria-controls="flush-collapseSix"
        >
          {t("Availability")}
        </button>
      </h2>
      <div
        id="flush-collapseSix"
        className="accordion-collapse collapse"
        aria-labelledby="flush-headingSix"
        data-bs-parent="#accordionFlushExample"
      >
        <div className="accordion-body">
          <div className="stock-checkBox">
            <div className="form-check">
              <div className="custom_checkbox position-relative check-type2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  defaultValue=""
                  id="partyCheckDefault"
                  {...register("inStock")}
                />
              </div>
              <label className="form-check-label" htmlFor="partyCheckDefault">
                {t("In Stock")}
              </label>
            </div>
            <div className="form-check">
              <div className="custom_checkbox position-relative check-type2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  defaultValue=""
                  id="formalCheckDefault"
                  {...register("outOfStock")}
                />
              </div>
              <label className="form-check-label" htmlFor="formalCheckDefault">
                {t("Out of Stock")}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
