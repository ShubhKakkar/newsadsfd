import useTranslate from "@/hooks/useTranslate";


export const OnSale = ({ register }) => {

  const t = useTranslate();
  
  return (
    <div className="stock-checkBox stock-checkBox-spacing">
      <div className="form-check">
        <div className="custom_checkbox position-relative check-type2">
          <input
            className="form-check-input"
            type="checkbox"
            defaultValue=""
            id="saleCheckDefault"
            {...register("onSale")}
          />
        </div>
        <label className="form-check-label" htmlFor="saleCheckDefault">
        {t("On Sale")}
        </label>
      </div>
    </div>
  );
};
