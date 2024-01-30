import Select from "react-select";
import { Controller } from "react-hook-form";

import useTranslate from "@/hooks/useTranslate";

const Variants = ({
  isEdit = false,
  firstVariant,
  secondVariant,
  variantTh,
  selectedMedia,
  variantModalShowHandle,
  unselectMediaHandler,
  errors,
  register,
  currencies,
  control = { control },
  shippingCompanies,
}) => {
  const t = useTranslate();

  return (
    <div className="specifications">
      <div className="row">
        <div className="col-md-5 col-sm-6">
          <h3 className="subTitles">Variant</h3>
        </div>
        <div className="col-md-7 col-sm-6">
          {!isEdit && (
            <div className="addSpecificationsbtn">
              <a
                onClick={variantModalShowHandle}
                className="sms_alert_btn sms_active_btns"
              >
                Variant Customization
              </a>
            </div>
          )}
        </div>
      </div>
      <div className="specifications-row default-spec-row">
        {firstVariant && (
          <div class="accordion" id="accordionExampleVariant">
            {firstVariant.subVariants.map((sv, index) => (
              <div key={sv.id} class="accordion-item">
                <h2 class="accordion-header" id={`headingOne${sv.id}`}>
                  <button
                    class="accordion-button"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapseOne${sv.id}`}
                    aria-expanded="true"
                    aria-controls={`collapseOne${sv.id}`}
                  >
                    {`${variantTh[0]}: ${sv.name}`}
                  </button>
                </h2>

                <div
                  id={`collapseOne${sv.id}`}
                  class="accordion-collapse collapse"
                  aria-labelledby={`headingOne${sv.id}`}
                  data-bs-parent="#accordionExampleVariant"
                >
                  <div class="accordion-body">
                    {/* Media Start */}

                    <div class="accordion" id="accordionExampleVariantMedia">
                      <div class="accordion-item">
                        <h2
                          class="accordion-header"
                          id={`headingOneMedia${sv.id}`}
                        >
                          <button
                            class="accordion-button"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#collapseOneMedia${sv.id}`}
                            aria-expanded="true"
                            aria-controls={`collapseOneMedia${sv.id}`}
                          >
                            Media
                          </button>
                        </h2>
                        <div
                          id={`collapseOneMedia${sv.id}`}
                          class="accordion-collapse collapse"
                          aria-labelledby={`headingOneMedia${sv.id}`}
                          data-bs-parent="#accordionExampleVariantMedia"
                        >
                          <div class="accordion-body">
                            <div className="variantBody">
                              <div className="form_input_area">
                                <div className="row">
                                  {selectedMedia[index]?.length === 0
                                    ? "No Media Uploaded"
                                    : selectedMedia[index]?.map((media) => (
                                        <div className="col-2 px-2 px-md-3 col-md-2">
                                          <div
                                            className="meCard"
                                            onClick={() =>
                                              !isEdit &&
                                              unselectMediaHandler(
                                                index,
                                                media.id,
                                                media.isSelected
                                                  ? "remove"
                                                  : "add"
                                              )
                                            }
                                          >
                                            <a
                                              href="javascript:void(0);"
                                              className={
                                                media.isSelected ? "active" : ""
                                              }
                                            >
                                              <img src={media.media} alt="" />
                                            </a>
                                          </div>
                                        </div>
                                      ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Media End */}

                    {secondVariant && (
                      <div class="accordion" id="accordionExampleVariantSv">
                        {secondVariant.subVariants.map((sv2, idx) => (
                          <div key={sv2.id} class="accordion-item">
                            <h2
                              class="accordion-header"
                              id={`headingOneSv${sv2.id}`}
                            >
                              <button
                                class="accordion-button"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#collapseOneSv${sv2.id}`}
                                aria-expanded="true"
                                aria-controls={`collapseOneSv${sv2.id}`}
                              >
                                {`${variantTh[1]}: ${sv2.name}`}
                              </button>
                            </h2>
                            <div
                              id={`collapseOneSv${sv2.id}`}
                              class="accordion-collapse collapse"
                              aria-labelledby={`headingOneSv${sv2.id}`}
                              data-bs-parent="#accordionExampleVariantSv"
                            >
                              <div class="accordion-body">
                                <div
                                  class="accordion"
                                  id="accordionExampleVariantSvDetails"
                                >
                                  <div class="accordion-item">
                                    <h2
                                      class="accordion-header"
                                      id={`headingOneSvDetails${sv2.id}`}
                                    >
                                      <button
                                        class="accordion-button"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target={`#collapseOneSvDetails${sv2.id}`}
                                        aria-expanded="true"
                                        aria-controls={`collapseOneSvDetails${sv2.id}`}
                                      >
                                        Details
                                      </button>
                                    </h2>
                                    <div
                                      id={`collapseOneSvDetails${sv2.id}`}
                                      class="accordion-collapse collapse"
                                      aria-labelledby={`headingOneSvDetails${sv2.id}`}
                                      data-bs-parent="#accordionExampleVariantSvDetails"
                                    >
                                      <div class="accordion-body">
                                        <div className="row">
                                          <div className="col-md-6">
                                            <div className="form-group">
                                              <label>Bar Code *</label>
                                              <input
                                                type="text"
                                                className="form-control dark-form-control"
                                                disabled={isEdit}
                                                {...register(
                                                  `subVariant.${
                                                    isEdit
                                                      ? `${sv.id}${sv2.id}`
                                                      : `${2 * index + idx}`
                                                  }_barCode`,
                                                  {
                                                    required:
                                                      "This field is required",
                                                    setValueAs: (v) => v.trim(),
                                                  }
                                                )}
                                              />
                                              {errors.subVariant?.[
                                                `${
                                                  isEdit
                                                    ? `${sv.id}${sv2.id}`
                                                    : `${2 * index + idx}`
                                                }_barCode`
                                              ] && (
                                                <span className="text-danger">
                                                  {t(
                                                    errors.subVariant?.[
                                                      `${
                                                        isEdit
                                                          ? `${sv.id}${sv2.id}`
                                                          : `${2 * index + idx}`
                                                      }_barCode`
                                                    ].message
                                                  )}
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          <div className="col-md-6">
                                            <div className="form-group">
                                              <label>Product ID *</label>
                                              <input
                                                type="text"
                                                className="form-control dark-form-control"
                                                disabled
                                                {...register(
                                                  `subVariant.${
                                                    isEdit
                                                      ? `${sv.id}${sv2.id}`
                                                      : `${2 * index + idx}`
                                                  }_productId`,
                                                  {
                                                    required:
                                                      "This field is required",
                                                    setValueAs: (v) => v.trim(),
                                                  }
                                                )}
                                              />
                                              {errors.subVariant?.[
                                                `${
                                                  isEdit
                                                    ? `${sv.id}${sv2.id}`
                                                    : `${2 * index + idx}`
                                                }_productId`
                                              ] && (
                                                <span className="text-danger">
                                                  {t(
                                                    errors.subVariant?.[
                                                      `${
                                                        isEdit
                                                          ? `${sv.id}${sv2.id}`
                                                          : `${2 * index + idx}`
                                                      }_productId`
                                                    ].message
                                                  )}
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          <div className="col-md-6">
                                            <div className="form-group">
                                              <label>Status</label>
                                              <input
                                                type="checkbox"
                                                className="dark-form-control"
                                                // defaultValue={
                                                //   false
                                                // }
                                                {...register(
                                                  `subVariant.${
                                                    isEdit
                                                      ? `${sv.id}${sv2.id}`
                                                      : `${2 * index + idx}`
                                                  }_status`
                                                  // {
                                                  //   onChange:
                                                  //     (
                                                  //       e
                                                  //     ) => {
                                                  //       document.querySelector(
                                                  //         `input[name='subVariant.${sv.id}${sv2.id}_productId']`
                                                  //       ).disabled =
                                                  //         !e.target.value;

                                                  //       document.querySelector(
                                                  //         `input[name='subVariant.${sv.id}${sv2.id}_barCode']`
                                                  //       ).disabled =
                                                  //         !e.target.value;
                                                  //     },
                                                  // }
                                                )}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div
                                  class="accordion"
                                  id="accordionExampleVariantSvShipping"
                                >
                                  <div class="accordion-item">
                                    <h2
                                      class="accordion-header"
                                      id={`headingOneSvShipping${sv2.id}`}
                                    >
                                      <button
                                        class="accordion-button"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target={`#collapseOneSvShipping${sv2.id}`}
                                        aria-expanded="true"
                                        aria-controls={`collapseOneSvShipping${sv2.id}`}
                                      >
                                        {t("Shipping Specifications")}
                                      </button>
                                    </h2>
                                    <div
                                      id={`collapseOneSvShipping${sv2.id}`}
                                      class="accordion-collapse collapse"
                                      aria-labelledby={`headingOneSvShipping${sv2.id}`}
                                      data-bs-parent="#accordionExampleVariantSvShipping"
                                    >
                                      <div class="accordion-body">
                                        <div className="variantBody">
                                          <div className="row">
                                            <div className="col-md-3">
                                              <div className="form-group">
                                                <label>Height </label>
                                                <input
                                                  type="text"
                                                  name=""
                                                  className="form-control dark-form-control"
                                                  defaultValue=""
                                                  disabled={isEdit}
                                                  {...register(
                                                    `subVariant.${
                                                      isEdit
                                                        ? `${sv.id}${sv2.id}`
                                                        : `${2 * index + idx}`
                                                    }_height`,
                                                    {
                                                      required:
                                                        "This field is required",
                                                      pattern: {
                                                        value: /^\d*[1-9]\d*$/,
                                                        message:
                                                          "Please enter positive digits only",
                                                      },
                                                    }
                                                  )}
                                                />
                                                {errors.subVariant?.[
                                                  `${
                                                    isEdit
                                                      ? `${sv.id}${sv2.id}`
                                                      : 2 * index + idx
                                                  }_height`
                                                ] && (
                                                  <span className="text-danger">
                                                    {t(
                                                      errors.subVariant[
                                                        `${
                                                          isEdit
                                                            ? `${sv.id}${sv2.id}`
                                                            : 2 * index + idx
                                                        }_height`
                                                      ].message
                                                    )}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                            <div className="col-md-3">
                                              <div className="form-group">
                                                <label>Weight</label>
                                                <input
                                                  type="text"
                                                  name=""
                                                  className="form-control dark-form-control"
                                                  defaultValue=""
                                                  disabled={isEdit}
                                                  {...register(
                                                    `subVariant.${
                                                      isEdit
                                                        ? `${sv.id}${sv2.id}`
                                                        : `${2 * index + idx}`
                                                    }_weight`,
                                                    {
                                                      required:
                                                        "This field is required",
                                                      pattern: {
                                                        value: /^\d*[0-9]\d*$/,
                                                        message:
                                                          "Please enter positive digits only",
                                                      },
                                                    }
                                                  )}
                                                />
                                                {errors.subVariant?.[
                                                  `${
                                                    isEdit
                                                      ? `${sv.id}${sv2.id}`
                                                      : `${2 * index + idx}`
                                                  }_weight`
                                                ] && (
                                                  <span className="text-danger">
                                                    {t(
                                                      errors.subVariant[
                                                        `${
                                                          isEdit
                                                            ? `${sv.id}${sv2.id}`
                                                            : `${
                                                                2 * index + idx
                                                              }`
                                                        }_weight`
                                                      ].message
                                                    )}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                            <div className="col-md-3">
                                              <div className="form-group">
                                                <label>Width</label>
                                                <input
                                                  type="text"
                                                  name=""
                                                  className="form-control dark-form-control"
                                                  defaultValue=""
                                                  disabled={isEdit}
                                                  {...register(
                                                    `subVariant.${
                                                      isEdit
                                                        ? `${sv.id}${sv2.id}`
                                                        : `${2 * index + idx}`
                                                    }_width`,
                                                    {
                                                      required:
                                                        "This field is required",
                                                      pattern: {
                                                        value: /^\d*[0-9]\d*$/,
                                                        message:
                                                          "Please enter positive digits only",
                                                      },
                                                    }
                                                  )}
                                                />
                                                {errors.subVariant?.[
                                                  `${
                                                    isEdit
                                                      ? `${sv.id}${sv2.id}`
                                                      : `${2 * index + idx}`
                                                  }_width`
                                                ] && (
                                                  <span className="text-danger">
                                                    {t(
                                                      errors.subVariant[
                                                        `${
                                                          isEdit
                                                            ? `${sv.id}${sv2.id}`
                                                            : `${
                                                                2 * index + idx
                                                              }`
                                                        }_width`
                                                      ].message
                                                    )}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                            <div className="col-md-3">
                                              <div className="form-group">
                                                <label>Length</label>
                                                <input
                                                  type="text"
                                                  name=""
                                                  className="form-control dark-form-control"
                                                  defaultValue=""
                                                  disabled={isEdit}
                                                  {...register(
                                                    `subVariant.${
                                                      isEdit
                                                        ? `${sv.id}${sv2.id}`
                                                        : `${2 * index + idx}`
                                                    }_length`,
                                                    {
                                                      required:
                                                        "This field is required",
                                                      pattern: {
                                                        value: /^\d*[0-9]\d*$/,
                                                        message:
                                                          "Please enter positive digits only",
                                                      },
                                                    }
                                                  )}
                                                />
                                                {errors.subVariant?.[
                                                  `${
                                                    isEdit
                                                      ? `${sv.id}${sv2.id}`
                                                      : `${2 * index + idx}`
                                                  }_length`
                                                ] && (
                                                  <span className="text-danger">
                                                    {t(
                                                      errors.subVariant[
                                                        `${
                                                          isEdit
                                                            ? `${sv.id}${sv2.id}`
                                                            : `${
                                                                2 * index + idx
                                                              }`
                                                        }_length`
                                                      ].message
                                                    )}
                                                  </span>
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
                                                  defaultValue=""
                                                  disabled={isEdit}
                                                  {...register(
                                                    `subVariant.${
                                                      isEdit
                                                        ? `${sv.id}${sv2.id}`
                                                        : `${2 * index + idx}`
                                                    }_dc`,
                                                    {
                                                      required:
                                                        "This field is required",
                                                    }
                                                  )}
                                                />
                                                {errors.subVariant?.[
                                                  `${
                                                    isEdit
                                                      ? `${sv.id}${sv2.id}`
                                                      : `${2 * index + idx}`
                                                  }_dc`
                                                ] && (
                                                  <span className="text-danger">
                                                    {t(
                                                      errors.subVariant[
                                                        `${
                                                          isEdit
                                                            ? `${sv.id}${sv2.id}`
                                                            : `${
                                                                2 * index + idx
                                                              }`
                                                        }_dc`
                                                      ].message
                                                    )}
                                                  </span>
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
                                                  defaultValue=""
                                                  disabled={isEdit}
                                                  {...register(
                                                    `subVariant.${
                                                      isEdit
                                                        ? `${sv.id}${sv2.id}`
                                                        : `${2 * index + idx}`
                                                    }_shippingCompany`,
                                                    {
                                                      required:
                                                        "This field is required",
                                                    }
                                                  )}
                                                /> */}
                                                <select
                                                  className="form-select form-control dark-form-control"
                                                  disabled={isEdit}
                                                  {...register(
                                                    `subVariant.${
                                                      isEdit
                                                        ? `${sv.id}${sv2.id}`
                                                        : `${2 * index + idx}`
                                                    }_shippingCompany`,
                                                    {
                                                      required:
                                                        "This field is required",
                                                    }
                                                  )}
                                                >
                                                  <option value="">
                                                    Shipping Company
                                                  </option>
                                                  {shippingCompanies &&
                                                    shippingCompanies.map(
                                                      (sc) => (
                                                        <option
                                                          value={sc.value}
                                                          key={sc.value}
                                                        >
                                                          {sc.label}
                                                        </option>
                                                      )
                                                    )}
                                                </select>
                                                {errors.subVariant?.[
                                                  `${
                                                    isEdit
                                                      ? `${sv.id}${sv2.id}`
                                                      : `${2 * index + idx}`
                                                  }_shippingCompany`
                                                ] && (
                                                  <span className="text-danger">
                                                    {t(
                                                      errors.subVariant[
                                                        `${
                                                          isEdit
                                                            ? `${sv.id}${sv2.id}`
                                                            : `${
                                                                2 * index + idx
                                                              }`
                                                        }_shippingCompany`
                                                      ].message
                                                    )}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div
                                  class="accordion"
                                  id="accordionExampleVariantSvPrice"
                                >
                                  <div class="accordion-item">
                                    <h2
                                      class="accordion-header"
                                      id={`headingOneSvPrice${sv2.id}`}
                                    >
                                      <button
                                        class="accordion-button"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target={`#collapseOneSvPrice${sv2.id}`}
                                        aria-expanded="true"
                                        aria-controls={`collapseOneSvPrice${sv2.id}`}
                                      >
                                        Price
                                      </button>
                                    </h2>
                                    <div
                                      id={`collapseOneSvPrice${sv2.id}`}
                                      class="accordion-collapse collapse"
                                      aria-labelledby={`headingOneSvPrice${sv2.id}`}
                                      data-bs-parent="#accordionExampleVariantSvPrice"
                                    >
                                      <div class="accordion-body">
                                        <>
                                          <div className="col-md-6">
                                            <div className="form-group">
                                              <label>Buying Price *</label>
                                              <input
                                                type="text"
                                                name=""
                                                className="form-control dark-form-control"
                                                defaultValue=""
                                                {...register(
                                                  `subVariant.${
                                                    isEdit
                                                      ? `${sv.id}${sv2.id}`
                                                      : `${2 * index + idx}`
                                                  }_buyingPrice`,
                                                  {
                                                    required:
                                                      "This field is required",
                                                    pattern: {
                                                      value: /^\d*[0-9]\d*$/,
                                                      message:
                                                        "Please enter positive digits only",
                                                    },
                                                  }
                                                )}
                                              />
                                              {errors.subVariant?.[
                                                `${
                                                  isEdit
                                                    ? `${sv.id}${sv2.id}`
                                                    : `${2 * index + idx}`
                                                }_buyingPrice`
                                              ] && (
                                                <span className="text-danger">
                                                  {t(
                                                    errors.subVariant?.[
                                                      `${
                                                        isEdit
                                                          ? `${sv.id}${sv2.id}`
                                                          : `${2 * index + idx}`
                                                      }_buyingPrice`
                                                    ].message
                                                  )}
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          <div className="col-md-6">
                                            <div className="form-group">
                                              <label>
                                                Currency (Buying Price)
                                              </label>
                                              <Controller
                                                className="form-control form-control-solid form-control-lg mb-10 col-4"
                                                control={control}
                                                name={`subVariant.${
                                                  isEdit
                                                    ? `${sv.id}${sv2.id}`
                                                    : `${2 * index + idx}`
                                                }_currency`}
                                                rules={{
                                                  required: t(
                                                    "This field is required"
                                                  ),
                                                }}
                                                render={({
                                                  field: {
                                                    onChange,
                                                    value,
                                                    ref,
                                                  },
                                                }) => {
                                                  return (
                                                    <Select
                                                      onChange={(val) => {
                                                        onChange(val);
                                                      }}
                                                      options={currencies.map(
                                                        (c) => ({
                                                          label: c.sign,
                                                          value: c._id,
                                                        })
                                                      )}
                                                      placeholder="Currency (Buying Price)"
                                                      defaultValue={[]}
                                                      value={value}
                                                      className="form-select- form-control- dark-form-control libSelect"
                                                    />
                                                  );
                                                }}
                                              />
                                              {errors.subVariant?.[
                                                `${
                                                  isEdit
                                                    ? `${sv.id}${sv2.id}`
                                                    : `${2 * index + idx}`
                                                }_currency`
                                              ] && (
                                                <span className="text-danger">
                                                  {t(
                                                    errors.subVariant?.[
                                                      `${
                                                        isEdit
                                                          ? `${sv.id}${sv2.id}`
                                                          : `${2 * index + idx}`
                                                      }_currency`
                                                    ].message
                                                  )}
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          <div className="col-md-6">
                                            <div className="form-group">
                                              <label>Selling Price *</label>
                                              <input
                                                type="text"
                                                name=""
                                                className="form-control dark-form-control"
                                                defaultValue=""
                                                {...register(
                                                  `subVariant.${
                                                    isEdit
                                                      ? `${sv.id}${sv2.id}`
                                                      : `${2 * index + idx}`
                                                  }_sellingPrice`,
                                                  {
                                                    required:
                                                      "This field is required",
                                                    pattern: {
                                                      value: /^\d*[0-9]\d*$/,
                                                      message:
                                                        "Please enter positive digits only",
                                                    },
                                                  }
                                                )}
                                              />
                                              {errors.subVariant?.[
                                                `${
                                                  isEdit
                                                    ? `${sv.id}${sv2.id}`
                                                    : `${2 * index + idx}`
                                                }_sellingPrice`
                                              ] && (
                                                <span className="text-danger">
                                                  {t(
                                                    errors.subVariant?.[
                                                      `${
                                                        isEdit
                                                          ? `${sv.id}${sv2.id}`
                                                          : `${2 * index + idx}`
                                                      }_sellingPrice`
                                                    ].message
                                                  )}
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          <div className="col-md-6">
                                            <div className="form-group">
                                              <label>Discounted Price *</label>
                                              <input
                                                type="text"
                                                name=""
                                                className="form-control dark-form-control"
                                                defaultValue=""
                                                {...register(
                                                  `subVariant.${
                                                    isEdit
                                                      ? `${sv.id}${sv2.id}`
                                                      : `${2 * index + idx}`
                                                  }_discountedPrice`,
                                                  {
                                                    required:
                                                      "This field is required",
                                                    pattern: {
                                                      value: /^\d*[0-9]\d*$/,
                                                      message:
                                                        "Please enter positive digits only",
                                                    },
                                                  }
                                                )}
                                              />
                                              {errors.subVariant?.[
                                                `${
                                                  isEdit
                                                    ? `${sv.id}${sv2.id}`
                                                    : `${2 * index + idx}`
                                                }_discountedPrice`
                                              ] && (
                                                <span className="text-danger">
                                                  {t(
                                                    errors.subVariant?.[
                                                      `${
                                                        isEdit
                                                          ? `${sv.id}${sv2.id}`
                                                          : `${2 * index + idx}`
                                                      }_discountedPrice`
                                                    ].message
                                                  )}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {!secondVariant && (
                      <>
                        <div
                          class="accordion"
                          id="accordionExampleVariantSvDetails"
                        >
                          <div class="accordion-item">
                            <h2
                              class="accordion-header"
                              id={`headingOneSvDetails${sv.id}`}
                            >
                              <button
                                class="accordion-button"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#collapseOneSvDetails${sv.id}`}
                                aria-expanded="true"
                                aria-controls={`collapseOneSvDetails${sv.id}`}
                              >
                                Details
                              </button>
                            </h2>
                            <div
                              id={`collapseOneSvDetails${sv.id}`}
                              class="accordion-collapse collapse"
                              aria-labelledby={`headingOneSvDetails${sv.id}`}
                              data-bs-parent="#accordionExampleVariantSvDetails"
                            >
                              <div class="accordion-body">
                                <div className="row">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Bar Code *</label>
                                      <input
                                        type="text"
                                        className="form-control dark-form-control"
                                        disabled={isEdit}
                                        {...register(
                                          `subVariant.${
                                            isEdit ? sv.id : index
                                          }_barCode`,
                                          {
                                            required: "This field is required",
                                            setValueAs: (v) => v.trim(),
                                          }
                                        )}
                                      />
                                      {errors.subVariant?.[
                                        `${isEdit ? sv.id : index}_barCode`
                                      ] && (
                                        <span className="text-danger">
                                          {t(
                                            errors.subVariant?.[
                                              `${
                                                isEdit ? sv.id : index
                                              }_barCode`
                                            ].message
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Product ID *</label>
                                      <input
                                        type="text"
                                        className="form-control dark-form-control"
                                        disabled
                                        {...register(
                                          `subVariant.${
                                            isEdit ? sv.id : index
                                          }_productId`,
                                          {
                                            required: "This field is required",
                                            setValueAs: (v) => v.trim(),
                                          }
                                        )}
                                      />
                                      {errors.subVariant?.[
                                        `${isEdit ? sv.id : index}_productId`
                                      ] && (
                                        <span className="text-danger">
                                          {t(
                                            errors.subVariant?.[
                                              `${
                                                isEdit ? sv.id : index
                                              }_productId`
                                            ].message
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Status</label>
                                      <input
                                        type="checkbox"
                                        className="dark-form-control"
                                        style={{
                                          height: "20px",
                                        }}
                                        // defaultValue={false}
                                        {...register(
                                          `subVariant.${
                                            isEdit ? sv.id : index
                                          }_status`
                                          // {
                                          //   onChange: (e) => {
                                          //     document.querySelector(
                                          //       `input[name='subVariant.${sv.id}_productId']`
                                          //     ).disabled =
                                          //       !e.target.value;

                                          //     document.querySelector(
                                          //       `input[name='subVariant.${sv.id}_barCode']`
                                          //     ).disabled =
                                          //       !e.target.value;
                                          //   },
                                          // }
                                        )}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          class="accordion"
                          id="accordionExampleVariantSvShipping"
                        >
                          <div class="accordion-item">
                            <h2
                              class="accordion-header"
                              id={`headingOneSvShipping${sv.id}`}
                            >
                              <button
                                class="accordion-button"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#collapseOneSvShipping${sv.id}`}
                                aria-expanded="true"
                                aria-controls={`collapseOneSvShipping${sv.id}`}
                              >
                                {t("Shipping Specifications")}
                              </button>
                            </h2>
                            <div
                              id={`collapseOneSvShipping${sv.id}`}
                              class="accordion-collapse collapse"
                              aria-labelledby={`headingOneSvShipping${sv.id}`}
                              data-bs-parent="#accordionExampleVariantSvShipping"
                            >
                              <div class="accordion-body">
                                {" "}
                                <div className="variantBody">
                                  <div className="row">
                                    <div className="col-md-3">
                                      <div className="form-group">
                                        <label>Height </label>
                                        <input
                                          type="text"
                                          name=""
                                          className="form-control dark-form-control"
                                          defaultValue=""
                                          disabled={isEdit}
                                          {...register(
                                            `subVariant.${
                                              isEdit ? sv.id : index
                                            }_height`,
                                            {
                                              required:
                                                "This field is required",
                                              pattern: {
                                                value: /^\d*[1-9]\d*$/,
                                                message:
                                                  "Please enter positive digits only",
                                              },
                                            }
                                          )}
                                        />
                                        {errors.subVariant?.[
                                          `${isEdit ? sv.id : index}_height`
                                        ] && (
                                          <span className="text-danger">
                                            {t(
                                              errors.subVariant[
                                                `${
                                                  isEdit ? sv.id : index
                                                }_height`
                                              ].message
                                            )}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="col-md-3">
                                      <div className="form-group">
                                        <label>Weight</label>
                                        <input
                                          type="text"
                                          name=""
                                          className="form-control dark-form-control"
                                          defaultValue=""
                                          disabled={isEdit}
                                          {...register(
                                            `subVariant.${
                                              isEdit ? sv.id : index
                                            }_weight`,
                                            {
                                              required:
                                                "This field is required",
                                              pattern: {
                                                value: /^\d*[0-9]\d*$/,
                                                message:
                                                  "Please enter positive digits only",
                                              },
                                            }
                                          )}
                                        />
                                        {errors.subVariant?.[
                                          `${isEdit ? sv.id : index}_weight`
                                        ] && (
                                          <span className="text-danger">
                                            {t(
                                              errors.subVariant[
                                                `${
                                                  isEdit ? sv.id : index
                                                }_weight`
                                              ].message
                                            )}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="col-md-3">
                                      <div className="form-group">
                                        <label>Width</label>
                                        <input
                                          type="text"
                                          name=""
                                          className="form-control dark-form-control"
                                          defaultValue=""
                                          disabled={isEdit}
                                          {...register(
                                            `subVariant.${
                                              isEdit ? sv.id : index
                                            }_width`,
                                            {
                                              required:
                                                "This field is required",
                                              pattern: {
                                                value: /^\d*[0-9]\d*$/,
                                                message:
                                                  "Please enter positive digits only",
                                              },
                                            }
                                          )}
                                        />
                                        {errors.subVariant?.[
                                          `${isEdit ? sv.id : index}_width`
                                        ] && (
                                          <span className="text-danger">
                                            {t(
                                              errors.subVariant[
                                                `${
                                                  isEdit ? sv.id : index
                                                }_width`
                                              ].message
                                            )}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="col-md-3">
                                      <div className="form-group">
                                        <label>Length</label>
                                        <input
                                          type="text"
                                          name=""
                                          className="form-control dark-form-control"
                                          defaultValue=""
                                          disabled={isEdit}
                                          {...register(
                                            `subVariant.${
                                              isEdit ? sv.id : index
                                            }_length`,
                                            {
                                              required:
                                                "This field is required",
                                              pattern: {
                                                value: /^\d*[0-9]\d*$/,
                                                message:
                                                  "Please enter positive digits only",
                                              },
                                            }
                                          )}
                                        />
                                        {errors.subVariant?.[
                                          `${isEdit ? sv.id : index}_length`
                                        ] && (
                                          <span className="text-danger">
                                            {t(
                                              errors.subVariant[
                                                `${
                                                  isEdit ? sv.id : index
                                                }_length`
                                              ].message
                                            )}
                                          </span>
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
                                          defaultValue=""
                                          disabled={isEdit}
                                          {...register(
                                            `subVariant.${
                                              isEdit ? sv.id : index
                                            }_dc`,
                                            {
                                              required:
                                                "This field is required",
                                            }
                                          )}
                                        />
                                        {errors.subVariant?.[
                                          `${isEdit ? sv.id : index}_dc`
                                        ] && (
                                          <span className="text-danger">
                                            {t(
                                              errors.subVariant[
                                                `${isEdit ? sv.id : index}_dc`
                                              ].message
                                            )}
                                          </span>
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
                                          defaultValue=""
                                          disabled={isEdit}
                                          {...register(
                                            `subVariant.${
                                              isEdit ? sv.id : index
                                            }_shippingCompany`,
                                            {
                                              required:
                                                "This field is required",
                                            }
                                          )}
                                        /> */}
                                        <select
                                          className="form-select form-control dark-form-control"
                                          disabled={isEdit}
                                          {...register(
                                            `subVariant.${
                                              isEdit ? sv.id : index
                                            }_shippingCompany`,
                                            {
                                              required:
                                                "This field is required",
                                            }
                                          )}
                                        >
                                          <option value="">
                                            Shipping Company
                                          </option>
                                          {shippingCompanies &&
                                            shippingCompanies.map((sc) => (
                                              <option
                                                value={sc.value}
                                                key={sc.value}
                                              >
                                                {sc.label}
                                              </option>
                                            ))}
                                        </select>
                                        {errors.subVariant?.[
                                          `${
                                            isEdit ? sv.id : index
                                          }_shippingCompany`
                                        ] && (
                                          <span className="text-danger">
                                            {t(
                                              errors.subVariant[
                                                `${
                                                  isEdit ? sv.id : index
                                                }_shippingCompany`
                                              ].message
                                            )}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>{" "}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          class="accordion"
                          id="accordionExampleVariantSvPrice"
                        >
                          <div class="accordion-item">
                            <h2
                              class="accordion-header"
                              id={`headingOneSvPrice${sv.id}`}
                            >
                              <button
                                class="accordion-button"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#collapseOneSvPrice${sv.id}`}
                                aria-expanded="true"
                                aria-controls={`collapseOneSvPrice${sv.id}`}
                              >
                                Price
                              </button>
                            </h2>
                            <div
                              id={`collapseOneSvPrice${sv.id}`}
                              class="accordion-collapse collapse"
                              aria-labelledby={`headingOneSvPrice${sv.id}`}
                              data-bs-parent="#accordionExampleVariantSvPrice"
                            >
                              <div class="accordion-body">
                                <>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Buying Price *</label>
                                      <input
                                        type="text"
                                        name=""
                                        className="form-control dark-form-control"
                                        defaultValue=""
                                        {...register(
                                          `subVariant.${
                                            isEdit ? sv.id : index
                                          }_buyingPrice`,
                                          {
                                            required: "This field is required",
                                            pattern: {
                                              value: /^\d*[0-9]\d*$/,
                                              message:
                                                "Please enter positive digits only",
                                            },
                                          }
                                        )}
                                      />
                                      {errors.subVariant?.[
                                        `${isEdit ? sv.id : index}_buyingPrice`
                                      ] && (
                                        <span className="text-danger">
                                          {t(
                                            errors.subVariant?.[
                                              `${
                                                isEdit ? sv.id : index
                                              }_buyingPrice`
                                            ].message
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Currency (Buying Price)</label>
                                      <Controller
                                        className="form-control form-control-solid form-control-lg mb-10 col-4"
                                        control={control}
                                        name={`subVariant.${
                                          isEdit ? sv.id : index
                                        }_currency`}
                                        rules={{
                                          required: t("This field is required"),
                                        }}
                                        render={({
                                          field: { onChange, value, ref },
                                        }) => {
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
                                      {errors.subVariant?.[
                                        `${isEdit ? sv.id : index}_currency`
                                      ] && (
                                        <span className="text-danger">
                                          {t(
                                            errors.subVariant?.[
                                              `${
                                                isEdit ? sv.id : index
                                              }_currency`
                                            ].message
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Selling Price *</label>
                                      <input
                                        type="text"
                                        name=""
                                        className="form-control dark-form-control"
                                        defaultValue=""
                                        {...register(
                                          `subVariant.${
                                            isEdit ? sv.id : index
                                          }_sellingPrice`,
                                          {
                                            required: "This field is required",
                                            pattern: {
                                              value: /^\d*[0-9]\d*$/,
                                              message:
                                                "Please enter positive digits only",
                                            },
                                          }
                                        )}
                                      />
                                      {errors.subVariant?.[
                                        `${isEdit ? sv.id : index}_sellingPrice`
                                      ] && (
                                        <span className="text-danger">
                                          {t(
                                            errors.subVariant?.[
                                              `${
                                                isEdit ? sv.id : index
                                              }_sellingPrice`
                                            ].message
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label>Discounted Price *</label>
                                      <input
                                        type="text"
                                        name=""
                                        className="form-control dark-form-control"
                                        defaultValue=""
                                        {...register(
                                          `subVariant.${
                                            isEdit ? sv.id : index
                                          }_discountedPrice`,
                                          {
                                            required: "This field is required",
                                            pattern: {
                                              value: /^\d*[0-9]\d*$/,
                                              message:
                                                "Please enter positive digits only",
                                            },
                                          }
                                        )}
                                      />
                                      {errors.subVariant?.[
                                        `${
                                          isEdit ? sv.id : index
                                        }_discountedPrice`
                                      ] && (
                                        <span className="text-danger">
                                          {t(
                                            errors.subVariant?.[
                                              `${
                                                isEdit ? sv.id : index
                                              }_discountedPrice`
                                            ].message
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* specifications-row END */}
    </div>
  );
};

export default Variants;
