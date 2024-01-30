import { Fragment } from "react";
import { useSelector } from "react-redux";

import {
  SubTab as SubTabForm,
  SubInput as SubInputForm,
  MutliInput,
  ButtonComp,
} from "../../Form/Form";

export const Faq = ({
  addFaq,
  faqs,
  errors,
  register,
  deleteFaq,
  isOptional = false,
}) => {
  const { languages } = useSelector((state) => state.setting);

  return (
    <div
      className="tab-pane fade"
      id="kt_tab_pane_12"
      role="tabpanel"
      aria-labelledby="kt_tab_pane_12"
      style={{ minHeight: 490 }}
    >
      <div>
        <h3 className="mb-10 font-weight-bold text-dark">
          Frequently Asked Questions (FAQs)
        </h3>
      </div>

      <div className="col-xl-12 p-0">
        <div className="form-group">
          <label className="mr-5">FAQ</label>
          <button
            onClick={addFaq}
            className="btn btn-primary mr-2"
            type="button"
          >
            <i class="fas fa-plus p-0"></i>
          </button>

          {faqs.map((faq) => (
            <Fragment key={faq.id}>
              <div className="card-header card-header-tabs-line pl-0 pr-0">
                <div className="card-toolbar">
                  <ul
                    className="nav nav-tabs nav-tabs-space-lg nav-tabs-line nav-bold nav-tabs-line-3x"
                    role="tablist"
                  >
                    {languages.length > 0 &&
                      languages.map((lang, index) => (
                        <SubTabForm
                          key={index}
                          name={lang.name}
                          index={index}
                          tabName={"faq_" + index + "_" + faq.id}
                          image={lang?.image}
                        />
                      ))}
                  </ul>
                </div>
              </div>
              <div className="mt-5">
                <div className="card-body pl-0 pr-0 p-0">
                  <div className="tab-content sameRowInput">
                    {languages.length > 0 &&
                      languages.map((lang, index) => (
                        <SubInputForm
                          key={index}
                          index={index}
                          errors={errors}
                          register={register}
                          required={lang.required ? !isOptional : false}
                          InputFields={[
                            [
                              {
                                Component: MutliInput,
                                type: "text",
                                label: "Question",
                                name: `faqQuestion${faq.id}`,
                                placeholder: `Enter Question (${lang.name})`,
                              },
                              {
                                Component: MutliInput,
                                type: "text",
                                label: "Answer",
                                name: `faqAnswer${faq.id}`,
                                placeholder: `Enter Answer (${lang.name})`,
                              },
                              {
                                Component: ButtonComp,
                                children: <i class="fas fa-trash-alt"></i>,
                                onClick: () => deleteFaq(faq.id),
                                classes: "btn btn-bg-danger ml-2",
                              },
                            ],
                          ]}
                          code={lang.code}
                          tabName={"faq_" + index + "_" + faq.id}
                        />
                      ))}
                  </div>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
