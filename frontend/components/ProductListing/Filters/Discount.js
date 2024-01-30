import React from "react";
import useTranslate from "@/hooks/useTranslate";

export const Discount = ({ register }) => {
  const t = useTranslate();

  return (
    <div className="accordion-item">
      <h2 className="accordion-header" id="flush-headingFive">
        <button
          className="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#flush-collapseFive"
          aria-expanded="false"
          aria-controls="flush-collapseFive"
        >
          {t("Discount")}
        </button>
      </h2>
      <div
        id="flush-collapseFive"
        className="accordion-collapse collapse"
        aria-labelledby="flush-headingFive"
        data-bs-parent="#accordionFlushExample"
      >
        <div className="accordion-body">
          <div className="stock-checkBox">
            <div className="form-check">
              <div className="custom_checkbox position-relative check-type2">
                <input
                  className="form-check-input"
                  type="radio"
                  value="one"
                  // defaultValue=""
                  id="partyCheckDefault"
                  {...register(`discount`)}
                />
              </div>
              <label className="form-check-label" htmlFor="partyCheckDefault">
                15{t("% off")}
              </label>
            </div>
            <div className="form-check">
              <div className="custom_checkbox position-relative check-type2">
                <input
                  className="form-check-input"
                  type="radio"
                  value="two"
                  // defaultValue=""
                  id="formalCheckDefault"
                  {...register(`discount`)}
                />
              </div>
              <label className="form-check-label" htmlFor="formalCheckDefault">
                15{t("% to")} 30{t("% off")}
              </label>
            </div>
            <div className="form-check">
              <div className="custom_checkbox position-relative check-type2">
                <input
                  className="form-check-input"
                  type="radio"
                  value="three"
                  // defaultValue=""
                  id="casualCheckDefault"
                  {...register(`discount`)}
                />
              </div>
              <label className="form-check-label" htmlFor="casualCheckDefault">
                30{t("% to")} 50{t("% off")}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
