import { Fragment } from "react";
import useTranslate from "@/hooks/useTranslate";

const Faqs = ({
  addFaqHandler,
  faqs,
  register,
  errors,
  faqDeleteHandler,
  isEdit = false,
}) => {
  const t = useTranslate();

  return (
    <div className="col-md-12">
      <div className="row">
        <div className="col-md-5 col-sm-6">
          <h3 className="subTitles">{t("Add FAQ")}s</h3>
        </div>
        <div className="col-md-7 col-sm-6">
          {!isEdit && (
            <div className="addSpecificationsbtn">
              <a
                onClick={addFaqHandler}
                className="sms_alert_btn sms_active_btns"
              >
                {t("Add FAQ")}
              </a>
            </div>
          )}
        </div>
      </div>
      {faqs &&
        faqs.map((faq) => (
          <Fragment key={faq.id}>
            <div className="form-group">
              <div className="row">
                <div className="col-md-10">
                  <input
                    type="text"
                    name=""
                    className="form-control dark-form-control"
                    placeholder="Question"
                    disabled={isEdit}
                    {...register(`faqQuestion${faq.id}`, {
                      required: "This field is required",
                      setValueAs: (v) => v.trim(),
                    })}
                  />
                  {errors[`faqQuestion${faq.id}`] && (
                    <span className="text-danger">
                      {t(errors[`faqQuestion${faq.id}`].message)}
                    </span>
                  )}
                </div>

                <div className="col-md-2">
                  <div className="form-group">
                    <label className="d-block"> </label>
                    {!isEdit && (
                      <button
                        type="button"
                        className="btn btn-bg-danger ml-2 mt-1"
                        onClick={() => faqDeleteHandler(faq.id)}
                      >
                        <i className="fas fa-trash-alt" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="form-group">
              <textarea
                name=""
                id=""
                cols={30}
                rows={4}
                className="form-control dark-form-control"
                disabled={isEdit}
                placeholder="Answer"
                {...register(`faqAnswer${faq.id}`, {
                  required: "This field is required",
                  setValueAs: (v) => v.trim(),
                })}
              />
              {errors[`faqAnswer${faq.id}`] && (
                <span className="text-danger">
                  {t(errors[`faqAnswer${faq.id}`].message)}
                </span>
              )}
            </div>
          </Fragment>
        ))}
    </div>
  );
};

export default Faqs;
