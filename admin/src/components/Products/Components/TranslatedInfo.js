import { Fragment, useEffect } from "react";
import { useSelector } from "react-redux";

import {
  SubTab as SubTabForm,
  SubInput as SubInputForm,
  MutliInput,
  ButtonComp,
  Input,
} from "../../Form/Form";
import { SEOInputFields } from "./ProductMeta";
import useRequest from "../../../hooks/useRequest";
import { createSlug } from "../../../util/fn";

export const TranslatedInfo = ({
  errors,
  register,
  DescInputFields,
  isOptional = false,
  addFaq,
  faqs,
  deleteFaq,
  control,
  watch,
  setSlugValidation,
  setError,
  clearErrors,
  id,
  setValue,
  setProductNameValidation,
}) => {
  const { languages } = useSelector((state) => state.setting);

  const { response: responseSlugValidation, request: requestSlugValidation } =
    useRequest();

  const {
    response: responseProductNameValidation,
    request: requestProductNameValidation,
  } = useRequest();

  const slugEn = watch("slug-en");
  const slugAr = watch("slug-ar");
  const slugTr = watch("slug-tr");

  useEffect(() => {
    if (slugEn) {
      const slug = slugEn;

      let slugTimer = setTimeout(() => {
        requestSlugValidation("POST", "product/slug-validation", {
          slug,
          languageCode: "en",
          id,
        });
      }, 500);

      return () => {
        clearTimeout(slugTimer);
      };
    } else {
      setSlugValidation((prev) => ({ ...prev, en: null }));
    }
  }, [slugEn]);

  useEffect(() => {
    if (slugAr) {
      const slug = slugAr;

      let slugTimer = setTimeout(() => {
        requestSlugValidation("POST", "product/slug-validation", {
          slug,
          languageCode: "ar",
          id,
        });
      }, 500);

      return () => {
        clearTimeout(slugTimer);
      };
    } else {
      setSlugValidation((prev) => ({ ...prev, ar: null }));
    }
  }, [slugAr]);

  useEffect(() => {
    if (slugTr) {
      const slug = slugTr;

      let slugTimer = setTimeout(() => {
        requestSlugValidation("POST", "product/slug-validation", {
          slug,
          languageCode: "tr",
          id,
        });
      }, 500);

      return () => {
        clearTimeout(slugTimer);
      };
    } else {
      setSlugValidation((prev) => ({ ...prev, tr: null }));
    }
  }, [slugTr]);

  useEffect(() => {
    if (responseSlugValidation) {
      const { isSlugExist, languageCode } = responseSlugValidation;

      setSlugValidation((prev) => ({ ...prev, [languageCode]: isSlugExist }));

      if (isSlugExist) {
        setError(`slug-${languageCode}`, {
          type: "manual",
        });
      } else {
        clearErrors(`slug-${languageCode}`);
      }
    }
  }, [responseSlugValidation]);

  useEffect(() => {
    if (responseProductNameValidation) {
      const { isProductNameExist, languageCode } =
        responseProductNameValidation;

      setProductNameValidation((prev) => ({
        ...prev,
        [languageCode]: isProductNameExist,
      }));

      if (isProductNameExist) {
        setError(`name-${languageCode}`, {
          type: "manual",
        });
      } else {
        clearErrors(`name-${languageCode}`);
      }
    }
  }, [responseProductNameValidation]);

  return (
    <div
      className="tab-pane fade"
      id="kt_tab_pane_11"
      role="tabpanel"
      aria-labelledby="kt_tab_pane_11"
      style={{ minHeight: 490 }}
    >
      <Fragment>
        {/* className="card card-custom gutter-b" */}
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
                    image={lang?.image}
                    tabName={`language_${index}`}
                    onClick={(idx) => {
                      ["about", "meta"].forEach((id) => {
                        const ele = document.querySelector(
                          `[href="#kt_apps_contacts_view_tab_${id}_${idx}"]`
                        );
                        if (ele) {
                          ele.click();
                        }
                      });

                      // faqs.forEach((faq) => {
                      //   const ele = document.querySelector(
                      //     `[href="#kt_apps_contacts_view_tab_faq_${idx}_${faq.id}"]`
                      //   );

                      //   if (ele) {
                      //     ele.click();
                      //   }
                      // });
                    }}
                  />
                ))}
            </ul>
          </div>
        </div>

        <div className="mt-5">
          <div className="card-body pl-0 pr-0 p-0">
            <div className="tab-content">
              {languages.length > 0 &&
                languages.map((lang, index) => (
                  <SubInputForm
                    key={index}
                    index={index}
                    errors={errors}
                    register={register}
                    required={lang.required}
                    InputFields={[
                      [
                        {
                          Component: Input,
                          label: "Name",
                          type: "text",
                          name: "name",
                          isRequired: true,
                          registerFields: {
                            onBlur: (e) => {
                              if (setValue) {
                                setValue(
                                  `slug-${lang.code}`,
                                  e.target.value
                                    ? createSlug(e.target.value)
                                    : ""
                                );

                                if (lang.code === "en" && e.target.value) {
                                  requestProductNameValidation(
                                    "POST",
                                    "product/product-name-validation",
                                    {
                                      languageCode: lang.code,
                                      name: e.target.value,
                                    }
                                  );
                                }
                              }
                            },
                          },
                          otherRegisterFields: {
                            manual: true,
                            feedback: "Product Name is already used.",
                          },
                        },
                        {
                          Component: Input,
                          label: "Product Link",
                          type: "text",
                          name: "slug",
                          isRequired: true,
                          otherRegisterFields: {
                            manual: true,
                            feedback: "Product link is already used.",
                          },
                        },
                      ],
                    ]}
                    code={lang.code}
                    tabName={`language_${index}`}
                  />
                ))}
            </div>
          </div>
        </div>
      </Fragment>
      {/* ABOUT STARTS */}
      <div>
        {/* mb-10  */}
        <h3 className="font-weight-bold text-dark">About</h3>
      </div>{" "}
      <>
        <div className="card-header card-header-tabs-line pl-0 pr-0 pt-0 d-none">
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
                    tabName={`about_${index}`}
                    image={lang?.image}
                  />
                ))}
            </ul>
          </div>
        </div>
        <div className="mt-5">
          <div className="card-body px-0">
            <div className="tab-content ">
              {languages.length > 0 &&
                languages.map((lang, index) => (
                  <SubInputForm
                    key={index}
                    index={index}
                    errors={errors}
                    register={register}
                    required={lang.required ? !isOptional : false}
                    InputFields={DescInputFields}
                    code={lang.code}
                    tabName={`about_${index}`}
                    // tabName={`language_${index}`}
                  />
                ))}
            </div>
          </div>
        </div>
      </>
      {/* PRODUCT META STARTS */}
      <div>
        <h3 className="mb-10 font-weight-bold text-dark">Product Meta</h3>
      </div>
      {/* <RenderInputFields
        InputFields={SEOInputFields}
        errors={errors}
        register={register}
      /> */}
      <Fragment>
        {/* className="card card-custom gutter-b" */}
        <div className="card-header card-header-tabs-line pl-0 pr-0 d-none">
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
                    image={lang?.image}
                    tabName={`meta_${index}`}
                  />
                ))}
            </ul>
          </div>
        </div>

        <div className="mt-5">
          <div className="card-body pl-0 pr-0 p-0">
            <div className="tab-content">
              {languages.length > 0 &&
                languages.map((lang, index) => (
                  <SubInputForm
                    key={index}
                    index={index}
                    errors={errors}
                    register={register}
                    required={false}
                    InputFields={SEOInputFields}
                    code={lang.code}
                    tabName={`meta_${index}`}
                    // tabName={`language_${index}`}
                    control={control}
                  />
                ))}
            </div>
          </div>
        </div>
      </Fragment>
      {/* FAQ STARTS */}
      <div className="mt-10">
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

          {faqs?.map((faq) => (
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
                          // tabName={`language_${index}`}
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
