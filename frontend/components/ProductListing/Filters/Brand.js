import React from "react";
import useTranslate from "@/hooks/useTranslate";

export const Brand = ({ brands, register }) => {

  const t = useTranslate();

  return (
    <>
      {brands.length > 0 ? (
        <div className="accordion-item">
          <h2 className="accordion-header" id="flush-headingTwo">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#flush-collapseTwo"
              aria-expanded="false"
              aria-controls="flush-collapseTwo"
            >
           {t("Brand")} 
            </button>
          </h2>
          <div
            id="flush-collapseTwo"
            className="accordion-collapse collapse"
            aria-labelledby="flush-headingTwo"
            data-bs-parent="#accordionFlushExample"
          >
            <div className="accordion-body">
              <div className="stock-checkBox">
                {brands.map((brand) => (
                  <div key={brand._id} className="form-check">
                    <div className="custom_checkbox position-relative check-type2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        defaultValue=""
                        id={brand._id}
                        {...register(`brands.${brand._id}`)}
                      />
                    </div>
                    <label className="form-check-label" htmlFor={brand._id}>
                      {brand.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
