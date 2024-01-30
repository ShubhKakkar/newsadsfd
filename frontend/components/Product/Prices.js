import Select from "react-select";
import { Controller } from "react-hook-form";

import useTranslate from "@/hooks/useTranslate";

const Prices = ({ register, errors, control, currencies }) => {
  const t = useTranslate();

  return (
    <>
      <div className="col-md-6">
        <div className="form-group">
          <label>{t("Buying Price")}</label>
          <input
            type="text"
            name=""
            className="form-control dark-form-control"
            defaultValue=""
            {...register("buyingPrice", {
              required: "This field is required",
              pattern: {
                value: /^\d*[1-9]\d*$/,
                message: "Please enter positive digits only",
              },
            })}
            placeholder={t("Buying Price")}
          />
          {errors.buyingPrice && (
            <span className="text-danger">{t(errors.buyingPrice.message)}</span>
          )}
        </div>
      </div>
      <div className="col-md-6">
        <div className="form-group">
          <label>Currency (Buying Price)</label>
          <Controller
            className="form-control form-control-solid form-control-lg mb-10 col-4"
            control={control}
            name="currency"
            rules={{ required: true }}
            render={({ field: { onChange, value, ref } }) => {
              return (
                <Select
                  onChange={(val) => {
                    onChange(val);
                  }}
                  options={currencies.map((c) => ({
                    label: c.sign,
                    value: c._id,
                  }))}
                  placeholder="Currency (Buying Price)"
                  defaultValue={[]}
                  value={value}
                  className="form-select- form-control- dark-form-control libSelect"
                />
              );
            }}
          />
          {errors.currency && errors.currency.type === "required" && (
            <span className="text-danger">{t("This field is required")}</span>
          )}
        </div>
      </div>
      <div className="col-md-6">
        <div className="form-group">
          <label>Selling Price</label>
          <input
            type="text"
            name=""
            className="form-control dark-form-control"
            defaultValue=""
            {...register("sellingPrice", {
              required: "This field is required",
              pattern: {
                value: /^\d*[1-9]\d*$/,
                message: "Please enter positive digits only",
              },
            })}
            placeholder="Selling Price"
          />
          {errors.sellingPrice && (
            <span className="text-danger">
              {t(errors.sellingPrice.message)}
            </span>
          )}
        </div>
      </div>
      <div className="col-md-6">
        <div className="form-group">
          <label>Discounted Price</label>
          <input
            type="text"
            name=""
            className="form-control dark-form-control"
            defaultValue=""
            {...register("discountedPrice", {
              required: "This field is required",
              pattern: {
                value: /^\d*[1-9]\d*$/,
                message: "Please enter positive digits only",
              },
            })}
            placeholder="Discounted Price"
          />
          {errors.discountedPrice && (
            <span className="text-danger">
              {t(errors.discountedPrice.message)}
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default Prices;
