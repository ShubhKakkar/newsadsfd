import React, { Fragment, useEffect, useState } from "react";
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

const Add = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    control,
    unregister,
  } = useForm();

  const { response, request } = useRequest();
  const { response: responseCategories, request: requestCategories } =
    useRequest();

  const { languages } = useSelector((state) => state.setting);

  const [allCategory, setAllCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState({});

  const [variants, setVariants] = useState([{ id: 0 }]);
  const [nextId, setNextId] = useState(1);

  const history = useHistory();

  useEffect(() => {
    document.title = "Add Variant - Noonmar";
    // requestCategories("GET", `product-category/all-group`);
  }, []);

  useEffect(() => {
    if (response) {
      toast.success("Variant has been added successfully.");
      history.push("/variants");
    }
  }, [response]);

  useEffect(() => {
    if (responseCategories) {
      setAllCategory(responseCategories.categories);
    }
  }, [responseCategories]);

  const onSubmit = (data) => {
    let defaultData = {};
    const dataToSend = [];

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;
      const obj = {
        languageCode: code,
        name: data["name-" + code] ?? "",
        variants: [],
      };

      for (let i = 0; i < variants.length; i++) {
        const id = variants[i].id;
        obj.variants.push({
          name: data[`variantName${id}-` + code] ?? "",
          // categoriesId: data[`productCategories${id}`],
        });
      }

      if (languages[i].default) {
        defaultData = obj;
      }

      dataToSend.push(obj);
    }

    request("POST", "variant", {
      mainData: defaultData,
      subData: dataToSend,
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
    const newVariants = [...variants].filter((f) => f.id !== id);
    setVariants(newVariants);

    unregister(`variantName${id}`);
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
        title="Add Variant"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/variants", name: "Back To Variants" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Add New Variant</h3>
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
                                    {languages.length > 0 &&
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
                                                placeholder: `Enter Variant Value (${lang.name})`,
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
                                      onClick={() => deleteVariant(variant.id)}
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
      {/* <DevTool control={control} /> */}
    </div>
  );
};

export default Add;
