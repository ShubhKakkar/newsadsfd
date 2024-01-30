import { Fragment, useCallback } from "react";
import { useSelector } from "react-redux";
import { debounce } from "../../../util/fn";
import useRequestTwo from "../../../hooks/useRequestTwo";

import {
  RenderInputFields,
  Input,
  SubTab as SubTabForm,
  SubInput as SubInputForm,
  MutliInput,
  ButtonComp,
  MultiReactSelectInput,
  MultiAsyncReactSelectInput,
} from "../../Form/Form";

const languages = [
  {
    name: "English",
    code: "en",
    default: true,
    image: "uploads/images/language_images/english.svg",
  },
];

export const Feature = ({
  errors,
  register,
  addFeature,
  features,
  deleteFeature,
  setValue,
  control,
}) => {
  // const { languages } = useSelector((state) => state.setting);
  const { request: requestSpecificationOptions } = useRequestTwo();

  const loadOptionsDebounced = useCallback(
    debounce(async (inputValue, callback, specificationId) => {
      const response = await requestSpecificationOptions(
        "GET",
        `product/features/${specificationId}?term=${inputValue}`
      );

      callback(response.data.options);
    }, 500),

    []
  );

  return (
    <div
      className="tab-pane fade"
      id="kt_tab_pane_5"
      role="tabpanel"
      aria-labelledby="kt_tab_pane_5"
      style={{ minHeight: 490 }}
    >
      <div>
        <h3 className="mb-10 font-weight-bold text-dark">
          Feature or Specification
        </h3>
      </div>
      {/* <RenderInputFields
        InputFields={[
          [
            {
              Component: Input,
              label: "Feature or Specification Title",
              type: "text",
              name: "featureTitle",
              registerFields: {
                required: true,
              },
            },
          ],
        ]}
        errors={errors}
        register={register}
      /> */}

      <div className="col-xl-12 p-0">
        <div className="form-group">
          {/* <label className="mr-5">Features or Specifications</label> */}
          {/* <button
            onClick={addFeature}
            className="btn btn-primary mr-2"
            type="button"
          >
            <i class="fas fa-plus p-0"></i>
          </button> */}

          {features.map((feature) => (
            <Fragment key={feature.id}>
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
                          tabName={"feature_" + index + "_" + feature.id}
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
                          required={lang.required}
                          control={control}
                          InputFields={[
                            [
                              {
                                Component: MutliInput,
                                type: "text",
                                label: "Feature Label",
                                name: `featureLabel${feature.id}`,
                                placeholder: `Enter Feature Label (${lang.name})`,
                                inputData: {
                                  disabled: true,
                                },
                              },
                              {
                                Component: feature.isMultiSelect
                                  ? MultiAsyncReactSelectInput
                                  : MutliInput,
                                type: "text",
                                label: "Feature Value",
                                name: `featureValue${feature.id}`,
                                placeholder: `Enter Feature Value (${lang.name})`,
                                handleChange: (e) => {
                                  // const { value } = e;
                                  // for (let key in feature.options) {
                                  //   const op = feature.options[key];
                                  //   const langData = op.find(
                                  //     (d) => d.value === value
                                  //   );
                                  //   setValue(
                                  //     `featureValue${feature.id}-${key}`,
                                  //     langData
                                  //   );
                                  // }
                                },
                                options: feature.options[lang.code],
                                promiseOptions: (...args) =>
                                  loadOptionsDebounced(...args, feature.spId),
                              },
                              {
                                Component: ButtonComp,
                                children: <i class="fas fa-trash-alt"></i>,
                                onClick: () => deleteFeature(feature.id),
                                classes: "btn btn-bg-danger ml-2",
                                show: !feature.isRequired,
                              },
                            ],
                          ]}
                          code={lang.code}
                          tabName={"feature_" + index + "_" + feature.id}
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
