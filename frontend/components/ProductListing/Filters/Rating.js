import React from "react";
import useTranslate from "@/hooks/useTranslate";


export const Rating = ({ register }) => {
  const t = useTranslate();
  return (
    <div className="accordion-item">
      <h2 className="accordion-header" id="flush-headingSaven">
        <button
          className="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#flush-collapseSaven"
          aria-expanded="false"
          aria-controls="flush-collapseSaven"
        >
        {t("Rating")}
        </button>
      </h2>
      <div
        id="flush-collapseSaven"
        className="accordion-collapse collapse"
        aria-labelledby="flush-headingSaven"
        data-bs-parent="#accordionFlushExample"
      >
        <div className="accordion-body">
          <div className="stock-checkBox">
            <div className="form-check">
              <div className="custom_checkbox position-relative check-type2">
                <input
                  className="form-check-input"
                  type="radio"
                  value={5}
                  defaultValue=""
                  id="fiveStarCheckDefault"
                  {...register("ratings")}
                />
              </div>
              <label
                className="form-check-label"
                htmlFor="fiveStarCheckDefault"
              >
                <span>
                  <i className="fas fa-star" />
                </span>
                <span>
                  <i className="fas fa-star" />
                </span>
                <span>
                  <i className="fas fa-star" />
                </span>
                <span>
                  <i className="fas fa-star" />
                </span>
                <span>
                  <i className="fas fa-star" />
                </span>
              </label>
            </div>
            <div className="form-check">
              <div className="custom_checkbox position-relative check-type2">
                <input
                  className="form-check-input"
                  type="radio"
                  value={4}
                  defaultValue=""
                  id="fourStarCheckDefault"
                  {...register("ratings")}
                />
              </div>
              <label
                className="form-check-label"
                htmlFor="fourStarCheckDefault"
              >
                <span>
                  <i className="fas fa-star" />
                </span>
                <span>
                  <i className="fas fa-star" />
                </span>
                <span>
                  <i className="fas fa-star" />
                </span>
                <span>
                  <i className="fas fa-star" />
                </span>
              </label>
            </div>
            <div className="form-check">
              <div className="custom_checkbox position-relative check-type2">
                <input
                  className="form-check-input"
                  type="radio"
                  value={3}
                  defaultValue=""
                  id="threeStarCheckDefault"
                  {...register("ratings")}
                />
              </div>
              <label
                className="form-check-label"
                htmlFor="threeStarCheckDefault"
              >
                <span>
                  <i className="fas fa-star" />
                </span>
                <span>
                  <i className="fas fa-star" />
                </span>
                <span>
                  <i className="fas fa-star" />
                </span>
              </label>
            </div>
            <div className="form-check">
              <div className="custom_checkbox position-relative check-type2">
                <input
                  className="form-check-input"
                  type="radio"
                  value={2}
                  defaultValue=""
                  id="twoStarCheckDefault"
                  {...register("ratings")}
                />
              </div>
              <label className="form-check-label" htmlFor="twoStarCheckDefault">
                <span>
                  <i className="fas fa-star" />
                </span>
                <span>
                  <i className="fas fa-star" />
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rating;
