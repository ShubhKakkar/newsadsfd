export const NewVariantEdit = ({
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
                            : selectedMedia[index].map((media, idx) => (
                                <span
                                  key={idx}
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
                                                `subVariant.${sv.id}${sv2.id}_buyingPrice`,
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
                                              `${sv.id}${sv2.id}_buyingPrice`
                                            ] && (
                                              <div className="invalid-feedback2">
                                                {
                                                  errors.subVariant[
                                                    `${sv.id}${sv2.id}_buyingPrice`
                                                  ].message
                                                }
                                              </div>
                                            )}
                                          </div>
                                          <div>
                                            {" "}
                                            <span
                                              class="input-group-text currencySelect"
                                              id="basic-addon2"
                                            >
                                              <select
                                                class="form-select"
                                                aria-label="Default select example"
                                                {...register(
                                                  `subVariant.${sv.id}${sv2.id}_currency`,
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
                                              `${sv.id}${sv2.id}_currency`
                                            ] && (
                                              <div className="invalid-feedback2">
                                                {
                                                  errors.subVariant[
                                                    `${sv.id}${sv2.id}_currency`
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
                                            `subVariant.${sv.id}${sv2.id}_sellingPrice`,
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
                                          `${sv.id}${sv2.id}_sellingPrice`
                                        ] && (
                                          <div className="invalid-feedback2">
                                            {
                                              errors.subVariant[
                                                `${sv.id}${sv2.id}_sellingPrice`
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
                                            `subVariant.${sv.id}${sv2.id}_height`,
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
                                          `${sv.id}${sv2.id}_height`
                                        ] && (
                                          <div className="invalid-feedback2">
                                            {
                                              errors.subVariant[
                                                `${sv.id}${sv2.id}_height`
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
                                            `subVariant.${sv.id}${sv2.id}_weight`,
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
                                          `${sv.id}${sv2.id}_weight`
                                        ] && (
                                          <div className="invalid-feedback2">
                                            {
                                              errors.subVariant[
                                                `${sv.id}${sv2.id}_weight`
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
                                            `subVariant.${sv.id}${sv2.id}_width`,
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
                                          `${sv.id}${sv2.id}_width`
                                        ] && (
                                          <div className="invalid-feedback2">
                                            {
                                              errors.subVariant[
                                                `${sv.id}${sv2.id}_width`
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
                                            `subVariant.${sv.id}${sv2.id}_length`,
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
                                          `${sv.id}${sv2.id}_length`
                                        ] && (
                                          <div className="invalid-feedback2">
                                            {
                                              errors.subVariant[
                                                `${sv.id}${sv2.id}_length`
                                              ].message
                                            }
                                          </div>
                                        )}
                                      </div>
                                    </td>

                                    {/* DC */}

                                    <td>
                                      <div className="tableInput">
                                        <input
                                          type="text"
                                          class="form-control form-control-solid"
                                          id="exampleFormControlInput1"
                                          placeholder="DC"
                                          {...register(
                                            `subVariant.${sv.id}${sv2.id}_dc`,
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
                                          `${sv.id}${sv2.id}_dc`
                                        ] && (
                                          <div className="invalid-feedback2">
                                            {
                                              errors.subVariant[
                                                `${sv.id}${sv2.id}_dc`
                                              ].message
                                            }
                                          </div>
                                        )}
                                      </div>
                                    </td>

                                    {/* SHIPPING Company */}

                                    <td>
                                      <div className="tableInput">
                                        {/* <input
                                          type="text"
                                          class="form-control form-control-solid"
                                          id="exampleFormControlInput1"
                                          placeholder="Shipping Company"
                                          {...register(
                                            `subVariant.${sv.id}${sv2.id}_shippingCompany`,
                                            {
                                              required:
                                                "This field is required",
                                            }
                                          )}
                                        /> */}

                                        <select
                                          className="form-control form-control-solid"
                                          aria-label="Default select example"
                                          {...register(
                                            `subVariant.${sv.id}${sv2.id}_shippingCompany`,
                                            {
                                              required:
                                                "This field is required",
                                            }
                                          )}
                                        >
                                          <option value="">
                                            {" "}
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
                                          `${sv.id}${sv2.id}_shippingCompany`
                                        ] && (
                                          <div className="invalid-feedback2">
                                            {
                                              errors.subVariant[
                                                `${sv.id}${sv2.id}_shippingCompany`
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
                                            `subVariant.${sv.id}${sv2.id}_barCode`,
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
                                          `${sv.id}${sv2.id}_barCode`
                                        ] && (
                                          <div className="invalid-feedback2">
                                            {
                                              errors.subVariant[
                                                `${sv.id}${sv2.id}_barCode`
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
                                            `subVariant.${sv.id}${sv2.id}_productId`
                                            // {
                                            //   required:
                                            //     "This field is required",
                                            //   pattern: {
                                            //     value:
                                            //       /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/,
                                            //     message:
                                            //       "Please enter digits only.",
                                            //   },
                                            // }
                                          )}
                                        />
                                        {errors.subVariant?.[
                                          `${sv.id}${sv2.id}_productId`
                                        ] && (
                                          <div className="invalid-feedback2">
                                            {
                                              errors.subVariant[
                                                `${sv.id}${sv2.id}_productId`
                                              ].message
                                            }
                                          </div>
                                        )}
                                      </div>
                                    </td>

                                    {/* Status  */}

                                    <td>
                                      <div className="tableInput">
                                        <input
                                          type="checkbox"
                                          class="form-control form-control-solid"
                                          id="exampleFormControlInput1"
                                          placeholder="Status"
                                          {...register(
                                            `subVariant.${sv.id}${sv2.id}_status`
                                          )}
                                        />
                                        {errors.subVariant?.[
                                          `${sv.id}${sv2.id}_status`
                                        ] && (
                                          <div className="invalid-feedback2">
                                            {
                                              errors.subVariant[
                                                `${sv.id}${sv2.id}_status`
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
                            : selectedMedia[index].map((media, idx) => (
                                <span
                                  key={idx}
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
                                          `subVariant.${sv.id}_buyingPrice`,
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
                                        `${sv.id}_buyingPrice`
                                      ] && (
                                        <div className="invalid-feedback2">
                                          {
                                            errors.subVariant[
                                              `${sv.id}_buyingPrice`
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
                                            `subVariant.${sv.id}_currency`,
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
                                        `${sv.id}_currency`
                                      ] && (
                                        <div className="invalid-feedback2">
                                          {
                                            errors.subVariant[
                                              `${sv.id}_currency`
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
                                      `subVariant.${sv.id}_sellingPrice`,
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
                                    `${sv.id}_sellingPrice`
                                  ] && (
                                    <div className="invalid-feedback2">
                                      {
                                        errors.subVariant[
                                          `${sv.id}_sellingPrice`
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
                                    {...register(`subVariant.${sv.id}_height`, {
                                      required: "This field is required",
                                      pattern: {
                                        value:
                                          /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/,
                                        message: "Please enter digits only.",
                                      },
                                    })}
                                  />
                                  {errors.subVariant?.[`${sv.id}_height`] && (
                                    <div className="invalid-feedback2">
                                      {
                                        errors.subVariant[`${sv.id}_height`]
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
                                    {...register(`subVariant.${sv.id}_weight`, {
                                      required: "This field is required",
                                      pattern: {
                                        value:
                                          /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/,
                                        message: "Please enter digits only.",
                                      },
                                    })}
                                  />
                                  {errors.subVariant?.[`${sv.id}_weight`] && (
                                    <div className="invalid-feedback2">
                                      {
                                        errors.subVariant[`${sv.id}_weight`]
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
                                    {...register(`subVariant.${sv.id}_width`, {
                                      required: "This field is required",
                                      pattern: {
                                        value:
                                          /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/,
                                        message: "Please enter digits only.",
                                      },
                                    })}
                                  />
                                  {errors.subVariant?.[`${sv.id}_width`] && (
                                    <div className="invalid-feedback2">
                                      {
                                        errors.subVariant[`${sv.id}_width`]
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
                                    {...register(`subVariant.${sv.id}_length`, {
                                      required: "This field is required",
                                      pattern: {
                                        value:
                                          /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/,
                                        message: "Please enter digits only.",
                                      },
                                    })}
                                  />
                                  {errors.subVariant?.[`${sv.id}_length`] && (
                                    <div className="invalid-feedback2">
                                      {
                                        errors.subVariant[`${sv.id}_length`]
                                          .message
                                      }
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* DC */}

                              <td>
                                <div className="tableInput">
                                  <input
                                    type="text"
                                    class="form-control form-control-solid"
                                    id="exampleFormControlInput1"
                                    placeholder="DC"
                                    {...register(`subVariant.${sv.id}_dc`, {
                                      required: "This field is required",
                                      // pattern: {
                                      //   value:
                                      //     /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/,
                                      //   message: "Please enter digits only.",
                                      // },
                                    })}
                                  />
                                  {errors.subVariant?.[`${sv.id}_dc`] && (
                                    <div className="invalid-feedback2">
                                      {errors.subVariant[`${sv.id}_dc`].message}
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Shipping Company */}

                              <td>
                                <div className="tableInput">
                                  {/* <input
                                    type="text"
                                    class="form-control form-control-solid"
                                    id="exampleFormControlInput1"
                                    placeholder="Shipping Company"
                                    {...register(
                                      `subVariant.${sv.id}_shippingCompany`,
                                      {
                                        required: "This field is required",
                                      }
                                    )}
                                  /> */}

                                  <select
                                    className="form-control form-control-solid"
                                    aria-label="Default select example"
                                    {...register(
                                      `subVariant.${sv.id}_shippingCompany`,
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
                                    `${sv.id}_shippingCompany`
                                  ] && (
                                    <div className="invalid-feedback2">
                                      {
                                        errors.subVariant[
                                          `${sv.id}_shippingCompany`
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
                                      `subVariant.${sv.id}_barCode`,
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
                                  {errors.subVariant?.[`${sv.id}_barCode`] && (
                                    <div className="invalid-feedback2">
                                      {
                                        errors.subVariant[`${sv.id}_barCode`]
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
                                      `subVariant.${sv.id}_productId`,
                                      {
                                        // required: "This field is required",
                                        // pattern: {
                                        //   value:
                                        //     /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/,
                                        //   message: "Please enter digits only.",
                                        // },
                                      }
                                    )}
                                  />
                                  {errors.subVariant?.[
                                    `${sv.id}_productId`
                                  ] && (
                                    <div className="invalid-feedback2">
                                      {
                                        errors.subVariant[`${sv.id}_productId`]
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
                                    {...register(`subVariant.${sv.id}_status`)}
                                  />
                                  {errors.subVariant?.[`${sv.id}_status`] && (
                                    <div className="invalid-feedback2">
                                      {
                                        errors.subVariant[`${sv.id}_status`]
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
