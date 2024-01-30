import React, { useEffect, useState, Fragment } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { DevTool } from "@hookform/devtools";
import { useSelector } from "react-redux";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import {
  Input,
  RenderInputFields,
  SubmitButton,
  ReactSelectInput,
  SubTab,
  SubInput,
  MutliInput,
  MultiReactSelectInput,
} from "../Form/Form";

const Edit = (props) => {
  const { id: variantId } = props.match.params;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    control,
    unregister,
    reset,
  } = useForm();

  const { response, request } = useRequest();
  const { response: responseCategories, request: requestCategories } =
    useRequest();
  const { response: responseGet, request: requestGet } = useRequest();

  const { languages } = useSelector((state) => state.setting);

  const [allCategory, setAllCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState({});

  const [variants, setVariants] = useState([{ id: 0 }]);
  const [nextId, setNextId] = useState(1);
  const [langDataIds, setLangDataIds] = useState([]);
  const [langDataSVIds, setLangDataSVIds] = useState([]);
  const [deleteIds, setDeleteIds] = useState([]);

  const history = useHistory();

  useEffect(() => {
    document.title = "Edit Variant - Noonmar";
    // requestCategories("GET", `product-category/all-group`);
    requestGet("GET", `variant/${variantId}`);
  }, []);

  useEffect(() => {
    if (response) {
      toast.success("Variant has been updated successfully.");
      history.push("/variants");
    }
  }, [response]);

  useEffect(() => {
    if (responseCategories) {
      setAllCategory(responseCategories.categories);
    }
  }, [responseCategories]);

  useEffect(() => {
    if (responseGet) {
      const { variant, variantSubData } = responseGet;

      if (!variant) {
        history.push("/variants");

        return;
      }

      const subData = {};

      const langArr = [];
      const subVariantLangArr = {};

      const categoriesArr = {};

      variant.languageData.forEach((lang) => {
        const code = lang.languageCode;

        langArr.push({
          id: lang.id,
          code,
        });

        subData["name-" + code] = lang.name;
      });

      variant.subVariants.forEach((lang, idx) => {
        subVariantLangArr[lang._id] = lang.languageData.map((sv) => ({
          id: sv.id,
          code: sv.languageCode,
        }));

        if (variantSubData?.subVariants) {
          lang.languageData.forEach((variant) => {
            const code = variant.languageCode;
            subData[`variantName${idx}-` + code] = variant.name;
            subData[`productCategories${idx}`] = variantSubData?.subVariants[
              idx
            ].categoriesId.map((a) => a.value);

            categoriesArr[idx] = variantSubData?.subVariants[idx].categoriesId;
          });
        }
      });

      if (variantSubData?.subVariants) {
        setNextId(variantSubData.subVariants.length);
        setVariants(
          variantSubData?.subVariants.map((_, idx) => ({
            id: idx,
            mongoId: _._id,
          }))
        );
      }

      setLangDataIds(langArr);
      setLangDataSVIds(subVariantLangArr);

      setSelectedCategory(categoriesArr);
      reset(subData);
    }
  }, [responseGet]);

  const onSubmit = (data) => {
    let defaultData = {}; //variant
    let defaultDataSV = [];
    const defaultDataDataNewSv = [];

    const dataToSend = []; //variant : langauge data
    const dataToSendSV = [];
    const dataToSendNewSV = [];

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;

      const lang = langDataIds.find((obj) => obj.code === code);

      const obj = {
        id: lang.id,
        name: data["name-" + code] ?? "",
      };

      let vObj = [];

      for (let j = 0; j < variants.length; j++) {
        const id = variants[j].id;
        const mongoId = variants[j].mongoId;

        if (mongoId) {
          dataToSendSV.push({
            id: langDataSVIds[mongoId].find((a) => a.code === code).id,
            name: data[`variantName${id}-` + code] ?? "",
          });

          if (languages[i].default) {
            vObj.push({
              id: mongoId,
              name: data[`variantName${id}-` + code] ?? "",
              categoriesId: data[`productCategories${id}`],
            });
          }
        } else {
          dataToSendNewSV.push({
            name: data[`variantName${id}-` + code] ?? "",
            code,
          });
          if (languages[i].default) {
            defaultDataDataNewSv.push({
              name: data[`variantName${id}-` + code] ?? "",
              categoriesId: data[`productCategories${id}`],
            });
          }
        }
      }

      if (languages[i].default) {
        defaultData = { ...obj, id: variantId };
        defaultDataSV = vObj;
      }

      dataToSend.push(obj);
    }

    request("PUT", "variant", {
      ...defaultData,
      defaultDataSV,
      defaultDataDataNewSv,
      dataToSend,
      dataToSendSV,
      dataToSendNewSV,
      deleteIds,
    });
  };

  const handleChange = (event, variantId) => {
    setSelectedCategory((prev) => ({ ...prev, [variantId]: event }));

    if (event && event.length > 0) {
      // setError("productCategories", "");
      setValue(
        `productCategories${variantId}`,
        event.map((e) => e.value)
      );
    } else {
      setValue(`productCategories${variantId}`, null);
    }
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, { id: nextId }]);
    setNextId((prev) => prev + 1);
  };

  const deleteVariant = (id) => {
    const variant = variants.find((f) => f.id === id);
    if (variant.mongoId) {
      setDeleteIds((prev) => [...prev, variant.mongoId]);
    }
    const newVariants = [...variants].filter((f) => f.id !== id);
    setVariants(newVariants);

    // unregister(`variantName${id}`);
    unregister(`productCategories${id}`);

    languages.forEach((lang) => {
      unregister(`variantName${id}-${lang.code}`);
    });
    // unregister(`featureAvailable${id}`);
  };

  const InputFields = [
    [
      {
        Component: Input,
        label: "Variant Name",
        type: "text",
        name: "name",
        registerFields: {
          required: true,
          // pattern: /^[A-Za-z ]+$/,
        },
        // registerFieldsFeedback: {
        //   pattern: "Name can only contain letters.",
        // },
      },
      // {
      //   Component: ReactSelectInput,
      //   label: "Product Categories",
      //   name: "productCategories",
      //   registerFields: {
      //     required: true,
      //   },
      //   control,
      //   options: allCategory,
      //   handleChange: handleChange,
      //   selectedOption: selectedCategory,
      //   isMultiple: true,
      // },
    ],
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Edit Variant"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/variants", name: "Back To Variants" },
        ]}
      />

      {langDataIds.length > 0 && (
        <div className="d-flex flex-column-fluid">
          <div className=" container ">
            <div className="card card-custom ">
              <div class="card-header">
                <h3 class="card-title">Edit New Variant</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-xl-12">
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="card card-custom gutter-b">
                        <div className="card-header card-header-tabs-line">
                          <div className="card-toolbar">
                            <ul
                              className="nav nav-tabs nav-tabs-space-lg nav-tabs-line nav-bold nav-tabs-line-3x"
                              role="tablist"
                            >
                              {languages.length > 0 &&
                                languages.map((lang, index) => (
                                  <SubTab
                                    key={index}
                                    name={lang.name}
                                    index={index}
                                    tabName={index + "one"}
                                    image={lang?.image}
                                  />
                                ))}
                            </ul>
                          </div>
                        </div>

                        <div className="card-body px-0">
                          <div className="tab-content px-10">
                            {languages.length > 0 &&
                              languages.map((lang, index) => (
                                <SubInput
                                  key={index}
                                  index={index}
                                  errors={errors}
                                  register={register}
                                  required={lang.required}
                                  InputFields={InputFields}
                                  code={lang.code}
                                  tabName={index + "one"}
                                />
                              ))}
                          </div>

                          <div className="row"></div>
                        </div>
                      </div>

                      <div className="col-xl-12">
                        <div className="form-group">
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <label className="mr-5">Variant Values</label>
                            <button
                              onClick={addVariant}
                              className="btn btn-primary mr-2 fixedButtonAdd"
                              type="button"
                            >
                              Add
                            </button>
                          </div>
                          {variants.length > 0 &&
                            variants.map((variant) => (
                              <Fragment key={variant.id}>
                                <div className="card-header card-header-tabs-line">
                                  <div className="card-toolbar">
                                    <ul
                                      className="nav nav-tabs nav-tabs-space-lg nav-tabs-line nav-bold nav-tabs-line-3x"
                                      role="tablist"
                                    >
                                      {variants.length > 0 &&
                                        languages.length > 0 &&
                                        languages.map((lang, index) => (
                                          <SubTab
                                            key={index}
                                            name={lang.name}
                                            index={index}
                                            tabName={index + "_" + variant.id}
                                            image={lang?.image}
                                          />
                                        ))}
                                    </ul>
                                  </div>
                                </div>
                                <div className="mt-5">
                                  <div className="card-body px-0">
                                    <div className="tab-content px-15">
                                      {languages.length > 0 &&
                                        languages.map((lang, index) => (
                                          <SubInput
                                            key={index}
                                            index={index}
                                            errors={errors}
                                            register={register}
                                            required={lang.required}
                                            InputFields={[
                                              [
                                                {
                                                  Component: MutliInput,
                                                  type: "text",
                                                  label: "Variant Name",
                                                  name: `variantName${variant.id}`,
                                                  placeholder: `Enter Variant Values (${lang.name})`,
                                                },
                                              ],
                                            ]}
                                            code={lang.code}
                                            tabName={index + "_" + variant.id}
                                          />
                                        ))}
                                    </div>

                                    <div className="row"></div>
                                    <div className="addMoreRow addMoreRow px-11 mt-5">
                                      {/* <RenderInputFields
                                        InputFields={[
                                          [
                                            {
                                              Component: ReactSelectInput,
                                              label: "Product Categories",
                                              name: `productCategories${variant.id}`,
                                              registerFields: {
                                                required: true,
                                              },
                                              control,
                                              options: allCategory,
                                              handleChange: (event) => {
                                                handleChange(event, variant.id);
                                              },
                                              selectedOption:
                                                selectedCategory[variant.id] ??
                                                [],
                                              isMultiple: true,
                                            },
                                          ],
                                        ]}
                                        errors={errors}
                                        register={register}
                                      /> */}

                                      <button
                                        onClick={() =>
                                          deleteVariant(variant.id)
                                        }
                                        className="btn btn-bg-danger ml-2"
                                        type="button"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </Fragment>
                            ))}
                        </div>
                      </div>

                      <div className="row"></div>

                      <SubmitButton
                        handleSubmit={handleSubmit}
                        onSubmit={onSubmit}
                        name="Submit"
                      />
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* <DevTool control={control} /> */}
    </div>
  );
};

export default Edit;
