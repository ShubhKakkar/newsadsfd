import { Controller } from "react-hook-form";
import Select from "react-select";

import useTranslate from "@/hooks/useTranslate";

const ShippingSpecifications = ({
  register,
  isEdit = false,
  errors,
  shippingCompanies,
  control,
}) => {
  const t = useTranslate();

  return (
    <div className="specifications">
      <div className="row">
        <div className="col-md-5 col-sm-6">
          <h3 className="subTitles">{t("Shipping Specifications")}</h3>
        </div>
      </div>
      <div className="specifications-row default-spec-row">
        <div className="row">
          <div className="col-md-3">
            <div className="form-group">
              <label>{t("Product Height")} </label>
              <input
                type="text"
                name=""
                className="form-control dark-form-control"
                placeholder={t("Product Height")}
                disabled={isEdit}
                {...register("height", {
                  required: "This field is required",
                  pattern: {
                    value: /^\d*[1-9]\d*$/,
                    message: "Please enter positive digits only",
                  },
                })}
              />
              {errors.height && (
                <span className="text-danger">{t(errors.height.message)}</span>
              )}
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group">
              <label>{t("Product Weight")}</label>
              <input
                type="text"
                name=""
                className="form-control dark-form-control"
                placeholder={t("Product Weight")}
                disabled={isEdit}
                {...register("weight", {
                  required: "This field is required",
                  pattern: {
                    value: /^\d*[1-9]\d*$/,
                    message: "Please enter positive digits only",
                  },
                })}
              />
              {errors.weight && (
                <span className="text-danger">{t(errors.weight.message)}</span>
              )}
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group">
              <label>{t("Product Width")}</label>
              <input
                type="text"
                name=""
                className="form-control dark-form-control"
                placeholder={t("Product Width")}
                disabled={isEdit}
                {...register("width", {
                  required: "This field is required",
                  pattern: {
                    value: /^\d*[1-9]\d*$/,
                    message: "Please enter positive digits only",
                  },
                })}
              />

              {errors.width && (
                <span className="text-danger">{t(errors.width.message)}</span>
              )}
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group">
              <label>{t("Product Length")}</label>
              <input
                type="text"
                name=""
                className="form-control dark-form-control"
                placeholder={t("Product Length")}
                disabled={isEdit}
                {...register("length", {
                  required: "This field is required",
                  pattern: {
                    value: /^\d*[1-9]\d*$/,
                    message: "Please enter positive digits only",
                  },
                })}
              />
              {errors.length && (
                <span className="text-danger">{t(errors.length.message)}</span>
              )}
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group">
              <label>DC</label>
              <input
                type="text"
                name=""
                className="form-control dark-form-control"
                disabled={isEdit}
                placeholder="DC"
                {...register("dc", {
                  required: "This field is required",
                  // pattern: {
                  //   value: /^\d*[1-9]\d*$/,
                  //   message: "Please enter positive digits only",
                  // },
                })}
              />
              {errors.dc && (
                <span className="text-danger">{t(errors.dc.message)}</span>
              )}
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group">
              <label>Shipping Company</label>
              {/* <input
                type="text"
                name=""
                className="form-control dark-form-control"
                disabled={isEdit}
                placeholder="Shipping Company"
                {...register("shippingCompany", {
                  required: "This field is required",
                })}
              /> */}

              {/* <select
                className="form-select form-control dark-form-control"
                {...register("shippingCompany", {
                  required: "This field is required",
                })}
              >
                <option value="">Shipping Company</option>
                {shippingCompanies &&
                  shippingCompanies.map((sc) => (
                    <option value={sc._id} key={sc._id}>
                      {sc.name}
                    </option>
                  ))}
              </select> */}

              <Controller
                className="form-control form-control-solid form-control-lg mb-10 col-4"
                control={control}
                name="shippingCompany"
                rules={{ required: "This field is required" }}
                render={({ field: { onChange, value, ref } }) => {
                  return (
                    <Select
                      onChange={onChange}
                      options={shippingCompanies}
                      placeholder={t("Select Shipping Company")}
                      defaultValue={[]}
                      value={value}
                      // value={selectedBrand}
                      className="form-select- form-control- dark-form-control libSelect"
                      isDisabled={isEdit}
                    />
                  );
                }}
              />

              {errors.shippingCompany && (
                <span className="text-danger">
                  {t(errors.shippingCompany.message)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* specifications-row END */}
      <div className="specifications-row">
        <div className="row"></div>
      </div>
      {/* specifications-row END */}
    </div>
  );
};

export default ShippingSpecifications;
