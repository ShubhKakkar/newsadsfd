import useTranslate from "@/hooks/useTranslate";

const Details = ({ register, errors, isEdit = false }) => {
  const t = useTranslate();

  return (
    <>
      <div className="col-md-12">
        <div className="form-group">
          <label>Product Name</label>
          <input
            type="text"
            disabled={isEdit}
            className="form-control dark-form-control"
            {...register("name", {
              required: "This field is required",
              setValueAs: (v) => v.trim(),
            })}
            placeholder={t("Product Name")}
          />
          {errors.name && (
            <span className="text-danger">{t(errors.name.message)}</span>
          )}
        </div>
      </div>
      <div className="col-md-6">
        <div className="form-group">
          <label>{t("Product ID")}</label>
          <input
            type="text"
            className="form-control dark-form-control"
            {...register("customId", { required: true })}
            placeholder="Product Id"
            disabled
          />
        </div>
      </div>
      <div className="col-md-6">
        <div className="form-group">
          <label>Bar Code</label>
          <input
            type="text"
            className="form-control dark-form-control"
            disabled={isEdit}
            {...register("barCode", {
              required: "This field is required",
              setValueAs: (v) => v.trim(),
            })}
            placeholder="Bar Code"
          />
          {errors.barCode && (
            <span className="text-danger">{t(errors.barCode.message)}</span>
          )}
        </div>
      </div>
      <div className="col-md-6">
        <div className="form-group">
          <label>HS Code</label>
          <input
            type="text"
            className="form-control dark-form-control"
            disabled={isEdit}
            {...register("hsCode", {
              required: "This field is required",
              setValueAs: (v) => v.trim(),
            })}
            placeholder="HS Code"
          />
          {errors.hsCode && (
            <span className="text-danger">{t(errors.hsCode.message)}</span>
          )}
        </div>
      </div>
    </>
  );
};

export default Details;
