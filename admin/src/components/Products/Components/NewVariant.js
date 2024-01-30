import { MultiReactSelectInput } from "../../Form/Form";

export const NewVariant = ({
  selectedVariant,
  register,
  currencies,
  selectedMedia,
  unselectMediaHandler,
  children,
  errors,
  shippingCompanies,
}) => {
  return (
    <div
      className="tab-pane fade"
      id="kt_tab_pane_12"
      role="tabpanel"
      aria-labelledby="kt_tab_pane_12"
      style={{ minHeight: 490 }}
    >
      <div>
        <h3 className="mb-10 font-weight-bold text-dark">Variant</h3>
      </div>
      <div className="variantView">
        {children}

        <div className="table-responsive">
          {selectedVariant.variant1 && selectedVariant.variant2 && (
            <table className="table variantTable table-bordered">
              <thead>
                <tr>
                  <th scope="col">Image</th>
                  <th scope="col">{selectedVariant.variant1.name}</th>
                  <th scope="col" className="text-left">
                    {selectedVariant.variant2.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedVariant.variant1.subVariants.map((sv, index) => {
                  return (
                    <tr key={sv.id}>
                      <td>
                        <div className="tableVariantImg">
                          {selectedMedia[index]?.length == 0
                            ? "No Media Uploaded"
                            : selectedMedia[index].map((media) => (
                                <span
                                  onClick={() => {
                                    if (media.isSelected) {
                                      unselectMediaHandler(
                                        index,
                                        media.id,
                                        "remove"
                                      );
                                    } else {
                                      unselectMediaHandler(
                                        index,
                                        media.id,
                                        "add"
                                      );
                                    }
                                  }}
                                  className={`VariantImgCard cursor ${
                                    media.isSelected ? "active" : ""
                                  }`}
                                >
                                  <img src={media.media} alt="" />
                                </span>
                              ))}
                        </div>
                      </td>
                      <td>{sv.name}</td>
                      <td className="p-0">
                        <table className="innerVarientTable">
                          <thead>
                            <tr>
                              <th scope="col">Variant</th>
                              <th scope="col">Buying Price *</th>
                              <th scope="col">Selling Price *</th>
                              <th scope="col">Height *</th>
                              <th scope="col">Weight *</th>
                              <th scope="col">Width *</th>
                              <th scope="col">Length *</th>
                              <th scope="col">DC *</th>
                              <th scope="col">Shipping Company *</th>
                              <th scope="col">Bar Code *</th>
                              <th scope="col">Product Id *</th>
                              <th scope="col">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedVariant.variant2.subVariants.map(
                              (sv2, idx) => {
                                let uniqueId =
                                  selectedVariant.variant2.subVariants
                                    .length === 1
                                    ? index
                                    : 2 * index + idx;

                                return (
                                  <tr key={sv2.id}>
                                    <td>{sv2.name}</td>
                                    <td>
                                      <div className="tableInput">
                                        <div class="input-group flex-nowrap">
                                          <div>
                                            <input
                                              type="text"
                                              class="form-control form-control-solid"
                                              id="exampleFormControlInput1"
                                              placeholder="Buying Price"
                                              {...register(
                                                `subVariant.${uniqueId}_buyingPrice`,
                                                {
                                                  required:
                                                    "This field is required",
                                                  pattern: {
                                                    value:
                                                      /^\d{1,3}(,\d{3})*(\,|.\d+)?$/i,
                                                    message:
                                                      "Price can only contain numbers.",
                                                  },
                                                }
                                              )}
                                            />
                                            {errors.subVariant?.[
                                              `${
                                                selectedVariant.variant2
                                                  .subVariants.length === 1
                                                  ? index
                                                  : 2 * index + idx
                                              }_buyingPrice`
                                            ] && (
                                              <div className="invalid-feedback2">
                                                {
                                                  errors.subVariant[
                                                    `${
                                                      selectedVariant.variant2
                                                        .subVariants.length ===
                                                      1
                                                        ? index
                                                        : 2 * index + idx
                                                    }_buyingPrice`
                                                  ].message
                                                }
                                              </div>
                                            )}
                                          </div>
                                          <div>
                                            <span
                                              class="input-group-text currencySelect"
                                              id="basic-addon2"
                                            >
                                              <select
                                                class="form-select"
                                                aria-label="Default select example"
                                                {...register(
                                                  `subVariant.${
                                                    selectedVariant.variant2
                                                      .subVariants.length === 1
                                                      ? index
                                                      : 2 * index + idx
                                                  }_currency`,
                                                  {
                                                    required:
                                                      "This field is required",
                                                  }
                                                )}
                                              >
                                                <option value="">
                                                  Currency
                                                </option>
                                                {currencies.map((c) => (
                                                  <option
                                                    key={c._id}
                                                    value={c._id}
                                                  >
                                                    {c.sign}
                                                  </option>
                                                ))}
                                              </select>
                                            </span>
                                            {errors.subVariant?.[
                                              `${
                                                selectedVariant.variant2
                                                  .subVariants.length === 1
                                                  ? index
                                                  : 2 * index + idx
                                              }_currency`
                                            ] && (
                                              <div className="invalid-feedback2">
                                                {
                                                  errors.subVariant[
                                                    `${
                                                      selectedVariant.variant2
                                                        .subVariants.length ===
                                                      1
                                                        ? index
                                                        : 2 * index + idx
                                                    }_currency`
                                                  ].message
                                                }
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="tableInput">
                                        <input
                                          type="text"
                                          class="form-control form-control-solid"
                                          id="exampleFormControlInput1"
                                          placeholder="Selling Price"
                                          {...register(
                                            `subVariant.${
                                              selectedVariant.variant2
                                                .subVariants.length === 1
                                                ? index
                                                : 2 * index + idx
                                            }_sellingPrice`,
                                            {
                                              required:
                                                "This field is required",
                                              pattern: {
                                                value:
                                                  /^\d{1,3}(,\d{3})*(\,|.\d+)?$/i,
                                                message:
                                                  "Price can only contain numbers.",
                                              },
                                            }
                                          )}
                                        />
                                        {errors.subVariant?.[
                                          `${
                                            selectedVariant.variant2.subVariants
                                              .length === 1
                                              ? index
                                              : 2 * index + idx
                                          }_sellingPrice`
                                        ] && (
                                          <div className="invalid-feedback2">
                                            {
                                              errors.subVariant[
                                                `${uniqueId}_sellingPrice`
                                              ].message
                                            }
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                    <td>
                                      <div className="tableInput">
                                        <input
                                          type="text"
                                          class="form-control form-control-solid"
                                          id="exampleFormControlInput1"
                                          placeholder="Height"
                                          {...register(
                                            `subVariant.${
                                              selectedVariant.variant2
                                                .subVariants.length === 1
                                                ? index
                                                : 2 * index + idx
                                            }_height`,
                                            {
                                              required:
                                                "This field is required",
                                              pattern: {
                                                value:
                                                  /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/,
                                                message:
                                                  "Please enter digits only.",
                                              },
                                            }
                                          )}
                                        />
                                        {errors.subVariant?.[
                                          `${
                                            selectedVariant.variant2.subVariants
                                              .length === 1
                                              ? index
                                              : 2 * index + idx
                                          }_height`
                                        ] && (
                                          <div className="invalid-feedback2">
                                            {
                                              errors.subVariant[
                                                `${uniqueId}_height`
                                              ].message
                                            }
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                    <td>
                                      <div className="tableInput">
                                        <input
                                          type="text"
                                          class="form-control form-control-solid"
                                          id="exampleFormControlInput1"
                                          placeholder="Weight"
                                          {...register(
                                            `subVariant.${
                                              selectedVariant.variant2
                                                .subVariants.length === 1
                                                ? index
                                                : 2 * index + idx
                                            }_weight`,
                                            {
                                              required:
                                                "This field is required",
                                              pattern: {
                                                value:
                                                  /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/,
                                                message:
                                                  "Please enter digits only.",
                                              },
                                            }
                                          )}
                                        />
                                        {errors.subVariant?.[
                                          `${
                                            selectedVariant.variant2.subVariants
                                              .length === 1
                                              ? index
                                              : 2 * index + idx
                                          }_weight`
                                        ] && (
                                          <div className="invalid-feedback2">
                                            {
                                              errors.subVariant[
                                                `${uniqueId}_weight`
                                              ].message
                                            }
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                    <td>
                                      <div className="tableInput">
                                        <input
                                          type="text"
                                          class="form-control form-control-solid"
                                          id="exampleFormControlInput1"
                                          placeholder="Width"
                                          {...register(
                                            `subVariant.${
                                              selectedVariant.variant2
                                                .subVariants.length === 1
                                                ? index
                                                : 2 * index + idx
                                            }_width`,
                                            {
                                              required:
                                                "This field is required",
                                              pattern: {
                                                value:
                                                  /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/,
                                                message:
                                                  "Please enter digits only.",
                                              },
                                            }
                                          )}
                                        />
                                        {errors.subVariant?.[
                                          `${
                                            selectedVariant.variant2.subVariants
                                              .length === 1
                                              ? index
                                              : 2 * index + idx
                                          }_width`
                                        ] && (
                                          <div className="invalid-feedback2">
                                            {
                                              errors.subVariant[
                                                `${uniqueId}_width`
                                              ].message
                                            }
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                    <td>
                                      <div className="tableInput">
                                        <input
                                          type="text"
                                          class="form-control form-control-solid"
                                          id="exampleFormControlInput1"
                                          placeholder="Length"
                                          {...register(
                                            `subVariant.${
                                              selectedVariant.variant2
                                                .subVariants.length === 1
                                                ? index
                                                : 2 * index + idx
                                            }_length`,
                                            {
                                              required:
                                                "This field is required",
                                              pattern: {
                                                value:
                                                  /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/,
                                                message:
                                                  "Please enter digits only.",
                                              },
                                            }
                                          )}
                                        />
                                        {errors.subVariant?.[
                                          `${
                                            selectedVariant.variant2.subVariants
                                              .length === 1
                                              ? index
                                              : 2 * index + idx
                                          }_length`
                                        ] && (
                                          <div className="invalid-feedback2">
                                            {
                                              errors.subVariant[
                                                `${uniqueId}_length`
                                              ].message
                                            }
                                          </div>
                                        )}
                                      </div>
                                    </td>

                                    {/* DESI  */}

                                    <td>
                                      <div className="tableInput">
                                        <input
                                          type="text"
                                          class="form-control form-control-solid"
                                          id="exampleFormControlInput1"
                                          placeholder="DC"
                                          {...register(
                                            `subVariant.${
                                              selectedVariant.variant2
                                                .subVariants.length === 1
                                                ? index
                                                : 2 * index + idx
                                            }_dc`,
                                            {
                                              required:
                                                "This field is required",
                                              // pattern: {
                                              //   value:
                                              //     /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/,
                                              //   message:
                                              //     "Please enter digits only.",
                                              // },
                                            }
                                          )}
                                        />
                                        {errors.subVariant?.[
                                          `${
                                            selectedVariant.variant2.subVariants
                                              .length === 1
                                              ? index
                                              : 2 * index + idx
                                          }_dc`
                                        ] && (
                                          <div className="invalid-feedback2">
                                            {
                                              errors.subVariant[
                                                `${uniqueId}_dc`
                                              ].message
                                            }
                                          </div>
                                        )}
                                      </div>
                                    </td>

                                    <td>
                                      <div className="tableInput">
                                        {false && (
                                          <input
                                            type="text"
                                            class="form-control form-control-solid"
                                            id="exampleFormControlInput1"
                                            placeholder="Shipping Company"
                                            {...register(
                                              `subVariant.${
                                                selectedVariant.variant2
                                                  .subVariants.length === 1
                                                  ? index
                                                  : 2 * index + idx
                                              }_shippingCompany`,
                                              {
                                                required:
                                                  "This field is required",
                                              }
                                            )}
                                          />
                                        )}

                                        <select
                                          className="form-control form-control-solid"
                                          aria-label="Default select example"
                                          {...register(
                                            `subVariant.${
                                              selectedVariant.variant2
                                                .subVariants.length === 1
                                                ? index
                                                : 2 * index + idx
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
                                          {shippingCompanies.map((c) => (
                                            <option
                                              key={c.value}
                                              value={c.value}
                                            >
                                              {c.label}
                                            </option>
                                          ))}
                                        </select>

                                        {errors.subVariant?.[
                                          `${
                                            selectedVariant.variant2.subVariants
                                              .length === 1
                                              ? index
                                              : 2 * index + idx
                                          }_shippingCompany`
                                        ] && (
                                          <div className="invalid-feedback2">
                                            {
                                              errors.subVariant[
                                                `${uniqueId}_shippingCompany`
                                              ].message
                                            }
                                          </div>
                                        )}
                                      </div>
                                    </td>

                                    {/* Bar Code */}

                                    <td>
                                      <div className="tableInput">
                                        <input
                                          type="text"
                                          class="form-control form-control-solid"
                                          id="exampleFormControlInput1"
                                          placeholder="Bar Code"
                                          {...register(
                                            `subVariant.${
                                              selectedVariant.variant2
                                                .subVariants.length === 1
                                                ? index
                                                : 2 * index + idx
                                            }_barCode`,
                                            {
                                              required:
                                                "This field is required",
                                            }
                                          )}
                                        />
                                        {errors.subVariant?.[
                                          `${
                                            selectedVariant.variant2.subVariants
                                              .length === 1
                                              ? index
                                              : 2 * index + idx
                                          }_barCode`
                                        ] && (
                                          <div className="invalid-feedback2">
                                            {
                                              errors.subVariant[
                                                `${uniqueId}_barCode`
                                              ].message
                                            }
                                          </div>
                                        )}
                                      </div>
                                    </td>

                                    {/* Product Id */}

                                    <td>
                                      <div className="tableInput">
                                        <input
                                          type="text"
                                          class="form-control form-control-solid"
                                          id="exampleFormControlInput1"
                                          placeholder="Product Id"
                                          disabled
                                          {...register(
                                            `subVariant.${
                                              selectedVariant.variant2
                                                .subVariants.length === 1
                                                ? index
                                                : 2 * index + idx
                                            }_productId`
                                            // {
                                            //   required:
                                            //     "This field is required",
                                            // }
                                          )}
                                        />
                                        {errors.subVariant?.[
                                          `${
                                            selectedVariant.variant2.subVariants
                                              .length === 1
                                              ? index
                                              : 2 * index + idx
                                          }_productId`
                                        ] && (
                                          <div className="invalid-feedback2">
                                            {
                                              errors.subVariant[
                                                `${uniqueId}_productId`
                                              ].message
                                            }
                                          </div>
                                        )}
                                      </div>
                                    </td>

                                    {/* Status */}

                                    <td>
                                      <div className="tableInput">
                                        <input
                                          type="checkbox"
                                          class="form-control form-control-solid"
                                          id="exampleFormControlInput1"
                                          placeholder="Status"
                                          {...register(
                                            `subVariant.${
                                              selectedVariant.variant2
                                                .subVariants.length === 1
                                                ? index
                                                : 2 * index + idx
                                            }_status`
                                          )}
                                        />
                                        {errors.subVariant?.[
                                          `${
                                            selectedVariant.variant2.subVariants
                                              .length === 1
                                              ? index
                                              : 2 * index + idx
                                          }_status`
                                        ] && (
                                          <div className="invalid-feedback2">
                                            {
                                              errors.subVariant[
                                                `${uniqueId}_status`
                                              ].message
                                            }
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              }
                            )}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {selectedVariant.variant1 && !selectedVariant.variant2 && (
            <table className="table variantTable table-bordered">
              <thead>
                <tr>
                  <th scope="col">Image</th>
                  <th scope="col" className="text-left">
                    {selectedVariant.variant1.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedVariant.variant1.subVariants.map((sv, index) => {
                  return (
                    <tr key={sv.id}>
                      <td>
                        <div className="tableVariantImg">
                          {selectedMedia[index]?.length == 0
                            ? "No Media Uploaded"
                            : selectedMedia[index].map((media) => (
                                <span
                                  onClick={() => {
                                    if (media.isSelected) {
                                      unselectMediaHandler(
                                        index,
                                        media.id,
                                        "remove"
                                      );
                                    } else {
                                      unselectMediaHandler(
                                        index,
                                        media.id,
                                        "add"
                                      );
                                    }
                                  }}
                                  className={`VariantImgCard cursor ${
                                    media.isSelected ? "active" : ""
                                  }`}
                                >
                                  <img src={media.media} alt="" />
                                </span>
                              ))}
                        </div>
                      </td>
                      <td className="p-0">
                        <table className="innerVarientTable">
                          <thead>
                            <tr>
                              <th scope="col">Variant</th>
                              <th scope="col">Buying Price *</th>
                              <th scope="col">Selling Price *</th>
                              <th scope="col">Height *</th>
                              <th scope="col">Weight *</th>
                              <th scope="col">Width *</th>
                              <th scope="col">Length *</th>
                              <th scope="col">DC *</th>
                              <th scope="col">Shipping Company *</th>
                              <th scope="col">Bar Code *</th>
                              <th scope="col">Product Id *</th>
                              <th scope="col">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>{sv.name}</td>
                              <td>
                                <div className="tableInput">
                                  <div class="input-group flex-nowrap">
                                    <div>
                                      <input
                                        type="text"
                                        class="form-control form-control-solid"
                                        id="exampleFormControlInput1"
                                        placeholder="Buying Price"
                                        {...register(
                                          `subVariant.${index}_buyingPrice`,
                                          {
                                            required: "This field is required",
                                            pattern: {
                                              value:
                                                /^\d{1,3}(,\d{3})*(\,|.\d+)?$/i,
                                              message:
                                                "Price can only contain numbers.",
                                            },
                                          }
                                        )}
                                      />
                                      {errors.subVariant?.[
                                        `${index}_buyingPrice`
                                      ] && (
                                        <div className="invalid-feedback2">
                                          {
                                            errors.subVariant[
                                              `${index}_buyingPrice`
                                            ].message
                                          }
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <span
                                        class="input-group-text currencySelect"
                                        id="basic-addon2"
                                      >
                                        <select
                                          class="form-select"
                                          aria-label="Default select example"
                                          {...register(
                                            `subVariant.${index}_currency`,
                                            {
                                              required:
                                                "This field is required",
                                            }
                                          )}
                                        >
                                          <option value="">Currency</option>
                                          {currencies.map((c) => (
                                            <option key={c._id} value={c._id}>
                                              {c.sign}
                                            </option>
                                          ))}
                                        </select>
                                      </span>
                                      {errors.subVariant?.[
                                        `${index}_currency`
                                      ] && (
                                        <div className="invalid-feedback2">
                                          {
                                            errors.subVariant[
                                              `${index}_currency`
                                            ].message
                                          }
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="tableInput">
                                  <input
                                    type="text"
                                    class="form-control form-control-solid"
                                    id="exampleFormControlInput1"
                                    placeholder="Selling Price"
                                    {...register(
                                      `subVariant.${index}_sellingPrice`,
                                      {
                                        required: "This field is required",
                                        pattern: {
                                          value:
                                            /^\d{1,3}(,\d{3})*(\,|.\d+)?$/i,
                                          message:
                                            "Price can only contain numbers.",
                                        },
                                      }
                                    )}
                                  />
                                  {errors.subVariant?.[
                                    `${index}_sellingPrice`
                                  ] && (
                                    <div className="invalid-feedback2">
                                      {
                                        errors.subVariant[
                                          `${index}_sellingPrice`
                                        ].message
                                      }
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="tableInput">
                                  <input
                                    type="text"
                                    class="form-control form-control-solid"
                                    id="exampleFormControlInput1"
                                    placeholder="Height"
                                    {...register(`subVariant.${index}_height`, {
                                      required: "This field is required",
                                      pattern: {
                                        value:
                                          /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/,
                                        message: "Please enter digits only.",
                                      },
                                    })}
                                  />
                                  {errors.subVariant?.[`${index}_height`] && (
                                    <div className="invalid-feedback2">
                                      {
                                        errors.subVariant[`${index}_height`]
                                          .message
                                      }
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="tableInput">
                                  <input
                                    type="text"
                                    class="form-control form-control-solid"
                                    id="exampleFormControlInput1"
                                    placeholder="Weight"
                                    {...register(`subVariant.${index}_weight`, {
                                      required: "This field is required",
                                      pattern: {
                                        value:
                                          /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/,
                                        message: "Please enter digits only.",
                                      },
                                    })}
                                  />
                                  {errors.subVariant?.[`${index}_weight`] && (
                                    <div className="invalid-feedback2">
                                      {
                                        errors.subVariant[`${index}_weight`]
                                          .message
                                      }
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="tableInput">
                                  <input
                                    type="text"
                                    class="form-control form-control-solid"
                                    id="exampleFormControlInput1"
                                    placeholder="Width"
                                    {...register(`subVariant.${index}_width`, {
                                      required: "This field is required",
                                      pattern: {
                                        value:
                                          /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/,
                                        message: "Please enter digits only.",
                                      },
                                    })}
                                  />
                                  {errors.subVariant?.[`${index}_width`] && (
                                    <div className="invalid-feedback2">
                                      {
                                        errors.subVariant[`${index}_width`]
                                          .message
                                      }
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="tableInput">
                                  <input
                                    type="text"
                                    class="form-control form-control-solid"
                                    id="exampleFormControlInput1"
                                    placeholder="Length"
                                    {...register(`subVariant.${index}_length`, {
                                      required: "This field is required",
                                      pattern: {
                                        value:
                                          /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/,
                                        message: "Please enter digits only.",
                                      },
                                    })}
                                  />
                                  {errors.subVariant?.[`${index}_length`] && (
                                    <div className="invalid-feedback2">
                                      {
                                        errors.subVariant[`${index}_length`]
                                          .message
                                      }
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* DC + Shipping Company */}

                              <td>
                                <div className="tableInput">
                                  <input
                                    type="text"
                                    class="form-control form-control-solid"
                                    id="exampleFormControlInput1"
                                    placeholder="DC"
                                    {...register(`subVariant.${index}_dc`, {
                                      required: "This field is required",
                                      // pattern: {
                                      //   value:
                                      //     /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/,
                                      //   message: "Please enter digits only.",
                                      // },
                                    })}
                                  />
                                  {errors.subVariant?.[`${index}_dc`] && (
                                    <div className="invalid-feedback2">
                                      {errors.subVariant[`${index}_dc`].message}
                                    </div>
                                  )}
                                </div>
                              </td>

                              <td>
                                <div className="tableInput">
                                  {false && (
                                    <input
                                      type="text"
                                      class="form-control form-control-solid"
                                      id="exampleFormControlInput1"
                                      placeholder="Shipping Company"
                                      {...register(
                                        `subVariant.${index}_shippingCompany`,
                                        {
                                          required: "This field is required",
                                        }
                                      )}
                                    />
                                  )}

                                  <select
                                    className="form-control form-control-solid"
                                    aria-label="Default select example"
                                    {...register(
                                      `subVariant.${index}_shippingCompany`,
                                      {
                                        required: "This field is required",
                                      }
                                    )}
                                  >
                                    <option value="">Shipping Company</option>
                                    {shippingCompanies.map((c) => (
                                      <option key={c.value} value={c.value}>
                                        {c.label}
                                      </option>
                                    ))}
                                  </select>

                                  {errors.subVariant?.[
                                    `${index}_shippingCompany`
                                  ] && (
                                    <div className="invalid-feedback2">
                                      {
                                        errors.subVariant[
                                          `${index}_shippingCompany`
                                        ].message
                                      }
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Bar Code */}

                              <td>
                                <div className="tableInput">
                                  <input
                                    type="text"
                                    class="form-control form-control-solid"
                                    id="exampleFormControlInput1"
                                    placeholder="Bar Code"
                                    {...register(
                                      `subVariant.${index}_barCode`,
                                      {
                                        required: "This field is required",
                                        // pattern: {
                                        //   value:
                                        //     /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/,
                                        //   message: "Please enter digits only.",
                                        // },
                                      }
                                    )}
                                  />
                                  {errors.subVariant?.[`${index}_barCode`] && (
                                    <div className="invalid-feedback2">
                                      {
                                        errors.subVariant[`${index}_barCode`]
                                          .message
                                      }
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Product Id */}

                              <td>
                                <div className="tableInput">
                                  <input
                                    type="text"
                                    class="form-control form-control-solid"
                                    id="exampleFormControlInput1"
                                    placeholder="Product Id"
                                    disabled
                                    {...register(
                                      `subVariant.${index}_productId`
                                      // {
                                      //   required: "This field is required",
                                      //   pattern: {
                                      //     value:
                                      //       /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/,
                                      //     message: "Please enter digits only.",
                                      //   },
                                      // }
                                    )}
                                  />
                                  {errors.subVariant?.[
                                    `${index}_productId`
                                  ] && (
                                    <div className="invalid-feedback2">
                                      {
                                        errors.subVariant[`${index}_productId`]
                                          .message
                                      }
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Status */}

                              <td>
                                <div className="tableInput">
                                  <input
                                    type="checkbox"
                                    class="form-control form-control-solid"
                                    id="exampleFormControlInput1"
                                    placeholder="Status"
                                    {...register(`subVariant.${index}_status`)}
                                  />
                                  {errors.subVariant?.[`${index}_status`] && (
                                    <div className="invalid-feedback2">
                                      {
                                        errors.subVariant[`${index}_status`]
                                          .message
                                      }
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

/*
   return (
    <div
      className="tab-pane fade active show"
      id="kt_tab_pane_12"
      role="tabpanel"
      aria-labelledby="kt_tab_pane_12"
      style={{ minHeight: 490 }}
    >
      <div>
        <h3 className="mb-10 font-weight-bold text-dark">New Variant</h3>
      </div>
      <div className="variantView">
        <div className="table-responsive">
          <table className="table variantTable table-bordered">
            <thead>
              <tr>
                <th scope="col">Image</th>
                <th scope="col">Colour</th>
                <th scope="col" className="text-left">
                  Size
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="tableVariantImg">
                    <span className="VariantImgCard">
                      <img src="http://192.168.235.245:7008/uploads/images/product/2023-07-07T10-13-59.512Z-image.jpg" />
                    </span>
                    <span className="VariantImgCard">
                      <img src="http://192.168.235.245:7008/uploads/images/product/2023-07-07T10-13-59.512Z-image.jpg" />
                    </span>
                    <span className="VariantImgCard">
                      <img src="http://192.168.235.245:7008/uploads/images/product/2023-07-07T10-13-59.512Z-image.jpg" />
                    </span>
                    <span className="VariantImgCard">
                      <img src="http://192.168.235.245:7008/uploads/images/product/2023-07-07T10-13-59.512Z-image.jpg" />
                    </span>
                    <span className="VariantImgCard">
                      <img src="http://192.168.235.245:7008/uploads/images/product/2023-07-07T10-13-59.512Z-image.jpg" />
                    </span>
                    <span className="VariantImgCard">
                      <img src="http://192.168.235.245:7008/uploads/images/product/2023-07-07T10-13-59.512Z-image.jpg" />
                    </span>
                    <span className="VariantImgCard">
                      <img src="http://192.168.235.245:7008/uploads/images/product/2023-07-07T10-13-59.512Z-image.jpg" />
                    </span>
                    <span className="VariantImgCard">
                      <img src="http://192.168.235.245:7008/uploads/images/product/2023-07-07T10-13-59.512Z-image.jpg" />
                    </span>
                    <span className="VariantImgCard">
                      <img src="http://192.168.235.245:7008/uploads/images/product/2023-07-07T10-13-59.512Z-image.jpg" />
                    </span>
                    <span className="VariantImgCard">
                      <img src="http://192.168.235.245:7008/uploads/images/product/2023-07-07T10-13-59.512Z-image.jpg" />
                    </span>
                    <span className="VariantImgCard">
                      <img src="http://192.168.235.245:7008/uploads/images/product/2023-07-07T10-13-59.512Z-image.jpg" />
                    </span>
                    <span className="VariantImgCard">
                      <img src="http://192.168.235.245:7008/uploads/images/product/2023-07-07T10-13-59.512Z-image.jpg" />
                    </span>
                    <span className="VariantImgCard">
                      <img src="http://192.168.235.245:7008/uploads/images/product/2023-07-07T10-13-59.512Z-image.jpg" />
                    </span>
                    <span className="VariantImgCard">
                      <img src="http://192.168.235.245:7008/uploads/images/product/2023-07-07T10-13-59.512Z-image.jpg" />
                    </span>
                    <span className="VariantImgCard active">
                      <img src="http://192.168.235.245:7008/uploads/images/product/2023-07-07T10-13-59.512Z-image.jpg" />
                    </span>
                  </div>
                </td>
                <td>Black</td>
                <td className="p-0">
                  <table className="innerVarientTable">
                    <thead>
                      <tr>
                        <th scope="col">Variant</th>
                        <th scope="col">Height *</th>
                        <th scope="col">Weight *</th>
                        <th scope="col">Width *</th>
                        <th scope="col">Length *</th>
                        <th scope="col">Buying Price *</th>
                        <th scope="col">Selling Price *</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Xl</td>
                        <td>
                          <div className="tableInput">
                            <input
                              type="email"
                              class="form-control form-control-solid"
                              id="exampleFormControlInput1"
                              placeholder="Height"
                            />
                          </div>
                        </td>
                        <td>
                          <div className="tableInput">
                            <input
                              type="email"
                              class="form-control form-control-solid"
                              id="exampleFormControlInput1"
                              placeholder="Weight"
                            />
                          </div>
                        </td>
                        <td>
                          <div className="tableInput">
                            <input
                              type="email"
                              class="form-control form-control-solid"
                              id="exampleFormControlInput1"
                              placeholder="Width"
                            />
                          </div>
                        </td>
                        <td>
                          <div className="tableInput">
                            <input
                              type="email"
                              class="form-control form-control-solid"
                              id="exampleFormControlInput1"
                              placeholder="Length"
                            />
                          </div>
                        </td>
                        <td>
                          <div className="tableInput">
                            <div class="input-group flex-nowrap">
                              <input
                                type="email"
                                class="form-control form-control-solid"
                                id="exampleFormControlInput1"
                                placeholder="Buying Price"
                              />
                              <span
                                class="input-group-text currencySelect"
                                id="basic-addon2"
                              >
                                <select
                                  class="form-select"
                                  aria-label="Default select example"
                                >
                                  <option selected>Currency</option>
                                  <option value="1">One</option>
                                  <option value="2">Two</option>
                                  <option value="3">Three</option>
                                </select>
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="tableInput">
                            <input
                              type="email"
                              class="form-control form-control-solid"
                              id="exampleFormControlInput1"
                              placeholder="Selling Price"
                            />
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>L</td>
                        <td>
                          <div className="tableInput">
                            <input
                              type="email"
                              class="form-control form-control-solid"
                              id="exampleFormControlInput1"
                              placeholder="Height"
                            />
                          </div>
                        </td>
                        <td>
                          <div className="tableInput">
                            <input
                              type="email"
                              class="form-control form-control-solid"
                              id="exampleFormControlInput1"
                              placeholder="Weight"
                            />
                          </div>
                        </td>
                        <td>
                          <div className="tableInput">
                            <input
                              type="email"
                              class="form-control form-control-solid"
                              id="exampleFormControlInput1"
                              placeholder="Width"
                            />
                          </div>
                        </td>
                        <td>
                          <div className="tableInput">
                            <input
                              type="email"
                              class="form-control form-control-solid"
                              id="exampleFormControlInput1"
                              placeholder="Length"
                            />
                          </div>
                        </td>
                        <td>
                          <div className="tableInput">
                            <input
                              type="email"
                              class="form-control form-control-solid"
                              id="exampleFormControlInput1"
                              placeholder="Buying Price"
                            />
                          </div>
                        </td>
                        <td>
                          <div className="tableInput">
                            <input
                              type="email"
                              class="form-control form-control-solid"
                              id="exampleFormControlInput1"
                              placeholder="Selling Price"
                            />
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>M</td>
                        <td>
                          <div className="tableInput">
                            <input
                              type="email"
                              class="form-control form-control-solid"
                              id="exampleFormControlInput1"
                              placeholder="Height"
                            />
                          </div>
                        </td>
                        <td>
                          <div className="tableInput">
                            <input
                              type="email"
                              class="form-control form-control-solid"
                              id="exampleFormControlInput1"
                              placeholder="Weight"
                            />
                          </div>
                        </td>
                        <td>
                          <div className="tableInput">
                            <input
                              type="email"
                              class="form-control form-control-solid"
                              id="exampleFormControlInput1"
                              placeholder="Width"
                            />
                          </div>
                        </td>
                        <td>
                          <div className="tableInput">
                            <input
                              type="email"
                              class="form-control form-control-solid"
                              id="exampleFormControlInput1"
                              placeholder="Length"
                            />
                          </div>
                        </td>
                        <td>
                          <div className="tableInput">
                            <input
                              type="email"
                              class="form-control form-control-solid"
                              id="exampleFormControlInput1"
                              placeholder="Buying Price"
                            />
                          </div>
                        </td>
                        <td>
                          <div className="tableInput">
                            <input
                              type="email"
                              class="form-control form-control-solid"
                              id="exampleFormControlInput1"
                              placeholder="Selling Price"
                            />
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
*/
