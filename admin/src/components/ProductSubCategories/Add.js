import React, { Fragment, useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Modal from "react-modal";

import useRequest from "../../hooks/useRequest";
import useRequestTwo from "../../hooks/useRequestTwo";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import {
  Input,
  SelectInput,
  ReactSelectInput,
  RenderInputFields,
  SubmitButton,
  MutliInput,
  SubTab as SubTabForm,
  SubInput as SubInputForm,
  AsyncReactSelectInput,
  ButtonComp,
} from "../Form/Form";
import { SubTab, SubInput } from "../LanguageForm/LanguageForm";
import { debounce } from "../../util/fn";

const Add = (props) => {
  const { id: recordId } = props.match.params;
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    trigger,
    clearErrors,
    unregister,
    control,
  } = useForm();

  const {
    register: registerAddVariant,
    handleSubmit: handleSubmitAddVariant,
    formState: { errors: errorsAddVariant },
    getValues: getValuesVariant,
    setValue: setValueVariant,
    control: controlVariant,
    setError,
    trigger: triggerVariant,
    clearErrors: clearErrorsVariant,
  } = useForm();

  const { languages } = useSelector((state) => state.setting);

  const { response, request } = useRequest();
  // const { response: responseCategories, request: requestCategories } =
  //   useRequest();
  const { response: responseVariant, request: requestVariant } = useRequest();
  const { response: responseBrand, request: requestBrand } = useRequest();

  const { request: requestPromiseBrand } = useRequestTwo();
  const { response: responSpecification, request: requestSpecification } =
    useRequest();

  // const [allCategory, setAllCategory] = useState([]);
  const [variants, setVariants] = useState([]);
  const [masterVariant, setMasterVariant] = useState([]);
  const [isAddVariantModalOpen, setIsAddVariantModalOpen] = useState(false);
  const [addVariantId, setAddVariantId] = useState("");
  const [addSubVariant, setAddSubVariant] = useState([]);
  const [isVariantModalOpen, setIsVaraintModalOpen] = useState(false);
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [selectedVariantIds, setSelectedVariantIds] = useState([]);
  const [features, setFeatures] = useState([]);
  const [nextId, setNextId] = useState(0);
  // const [selectedCategory, setSelectedCategory] = useState({});
  const [selectedVariant, setSelectedVariant] = useState("");
  const [selectedSpecification, setSelectedSpecification] = useState([]);

  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [allSpecification, setAllSpecification] = useState([]);

  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [faqs, setFaqs] = useState([{ id: 0 }]);
  const [nextFaqId, setNextFaqId] = useState(1);

  const history = useHistory();

  useEffect(() => {
    document.title = "Add Product Sub Category - Noonmar";
    // requestCategories("GET", `product-category/all?page=1&isActive=${true}`);
    requestSpecification(
      "GET",
      `specification-groups/all?page=1&isActive=${true}`
    );

    requestVariant("GET", `variant/category`);
    requestBrand("GET", `brand/all?page=1&isActive=true`);
  }, []);

  useEffect(() => {
    if (response) {
      toast.success("Product sub category has been added successfully.");
      history.push(`/product/sub-categories/${recordId}`);
    }
  }, [response]);

  useEffect(() => {
    if (responseBrand) {
      const { brands } = responseBrand;
      setBrands(brands.map((b) => ({ value: b._id, label: b.name })));
    }
  }, [responseBrand]);

  useEffect(() => {
    if (responSpecification) {
      if (responSpecification.status && responSpecification.data) {
        let specification = [];
        if (responSpecification.data.length > 0) {
          responSpecification.data.forEach((obj) => {
            specification.push({
              label: obj.name,
              value: obj._id,
            });
          });
        }
        setAllSpecification(specification);
      }
    }
  }, [responSpecification]);

  // useEffect(() => {
  //   if (responseCategories) {
  //     if (responseCategories.status && responseCategories.data) {
  //       setAllCategory(responseCategories.data);
  //     }
  //   }
  // }, [responseCategories]);

  useEffect(() => {
    if (responseVariant) {
      setVariants(
        responseVariant.variants.map((v) => ({
          ...v,
          show: true,
          isChecked: false,
        }))
      );

      setMasterVariant(
        responseVariant.variants.map((v) => ({ label: v.name, value: v._id }))
      );
    }
  }, [responseVariant]);

  const onSubmit = (data) => {
    const dataToSend = [];
    const defaultData = {
      masterVariant: selectedVariant.value,
      brands: data.brands.map((b) => b.value),
      specification: data.specification.map((b) => b),
    };

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;
      dataToSend.push({
        languageCode: code,
        name: data["name-" + code] ?? "",
      });

      if (languages[i].default) {
        defaultData.name = data["name-" + code];
        // defaultData.category = data["category"];
        defaultData.category = recordId;
      }
    }

    const add = [];
    const addVariant = [];
    let isError = false;

    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];

      if (!variant.isChecked) {
        continue;
      }
      let count = 0;

      for (let j = 0; j < variant.variants.length; j++) {
        const v = variant.variants[j];
        if (data[`check-${v._id}`]) {
          count++;
          add.push({ _id: variant._id, vId: v._id });
          if (typeof v._id === "number") {
            addVariant.push(addSubVariant.find((subV) => subV._id === v._id));
          }
        }
      }
      if (count === 0) {
        toast.error(`Please select variant from ${variant.name}`);
        isError = true;
      }
    }

    if (isError) {
      return;
    }

    if (!selectedVariant.value && (add.length > 0 || addVariant.length > 0)) {
      toast.error("Please select Master Variant");
      return;
    }

    const featuresObj = { main: [] };
    const faqsObj = { main: [] };

    languages.forEach((lang) => {
      featuresObj[lang.code] = [];
      faqsObj[lang.code] = [];
    });

    for (let i = 0; i < features.length; i++) {
      const id = features[i].id;

      for (let j = 0; j < languages.length; j++) {
        const code = languages[j].code;

        featuresObj[code] = [
          ...featuresObj[code],
          data[`feature${id}-${code}`] ?? "",
        ];

        if (languages[j].default) {
          if (data[`feature${id}-${code}`].trim().length === 0) {
            setIsFeatureModalOpen(true);
            setError(`feature${id}-${code}`, {
              type: "required",
            });
            return;
          }

          featuresObj.main = [
            ...featuresObj.main,
            data[`feature${id}-${code}`] ?? "",
          ];
        }
      }
    }

    for (let i = 0; i < faqs.length; i++) {
      const id = faqs[i].id;

      for (let j = 0; j < languages.length; j++) {
        const code = languages[j].code;

        faqsObj[code] = [...faqsObj[code], data[`faq${id}-${code}`] ?? ""];

        if (languages[j].default) {
          if (data[`faq${id}-${code}`].trim().length === 0) {
            setIsFaqModalOpen(true);
            setError(`faq${id}-${code}`, {
              type: "required",
            });
            return;
          }

          faqsObj.main = [...faqsObj.main, data[`faq${id}-${code}`] ?? ""];
        }
      }
    }

    request("POST", "product-sub-category", {
      ...defaultData,
      subData: dataToSend,
      add,
      addVariant,
      featuresObj,
      faqsObj,
    });
  };

  const addVariantModalHandler = (id) => {
    setAddVariantId(id);
    setIsAddVariantModalOpen(true);

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;
      setValueVariant("newVariantName-" + code, "");
    }
  };

  const handleChangeSpecification = (event) => {
    setSelectedSpecification(event);

    if (event && event.length > 0) {
      let specificationids = [];
      event.forEach((obj) => {
        specificationids.push(obj.value);
      });
      setError("specification", "");
      setValue("specification", specificationids);
    } else {
      setValue("specification", null);
    }
  };

  const addVariantSubmit = (data) => {
    const defaultData = { name: "", languages: [] };

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;
      defaultData.languages.push({
        languageCode: code,
        name: data["newVariantName-" + code] ?? "",
      });

      if (languages[i].default) {
        defaultData.name = data["newVariantName-" + code];
        if (data["newVariantName-" + code].trim().length === 0) {
          return;
        }
      }
    }

    let newVariants = [...variants];

    const idx = newVariants.findIndex((v) => v._id === addVariantId);

    const id = Date.now();

    newVariants[idx] = {
      ...newVariants[idx],
      variants: [
        ...newVariants[idx].variants,
        {
          name: defaultData.name,
          _id: id,
          isChecked: true,
          // languageData: defaultData.languages,
        },
      ],
    };

    setAddSubVariant((prev) => [
      ...prev,
      {
        name: defaultData.name,
        _id: id,
        languageData: defaultData.languages,
      },
    ]);

    setValue(`check-${id}`, true);

    setVariants(newVariants);
    setIsAddVariantModalOpen(false);
  };

  const searchHandler = (e) => {
    if (e) {
      e.preventDefault();
    }
    const regex = new RegExp(searchValue, "i");
    const variantsFiltered = variants.map((v) => {
      const { name } = v;
      if (name.match(regex)) {
        return { ...v, show: true };
      } else {
        return { ...v, show: false };
      }
    });
    setVariants(variantsFiltered);
  };

  const variantCheckedHandler = (id, value) => {
    const idx = variants.findIndex((v) => v._id === id);
    const newVariants = [...variants];
    newVariants[idx] = { ...newVariants[idx], isChecked: value };
    setVariants(newVariants);
  };

  const saveSelectedVariantIdsHandler = () => {
    setSelectedVariantIds(
      variants.filter((v) => v.isChecked).map((v) => v._id)
    );
    setIsVaraintModalOpen(false);
  };

  const handleChangeVariant = (event) => {
    setSelectedVariant(event);

    if (event) {
      setError("varientId", "");
      setValue("varientId", event.value);
    } else {
      setValue("varientId", null);
    }
  };

  const addFeatures = () => {
    setFeatures((prev) => [...prev, { id: nextId }]);
    setNextId((prev) => prev + 1);
  };

  const deleteFeatureHandler = (id) => {
    const newFeatures = [...features].filter((f) => f.id !== id);
    setFeatures(newFeatures);

    // unregister(`featuresName${id}`);

    languages.forEach((lang) => {
      unregister(`feature${id}-${lang.code}`);
    });
    // unregister(`featureAvailable${id}`);
  };

  const addFaqs = () => {
    setFaqs((prev) => [...prev, { id: nextFaqId }]);
    setNextFaqId((prev) => prev + 1);
  };

  const deleteFaqHandler = (id) => {
    const newFaqs = [...faqs].filter((f) => f.id !== id);
    setFaqs(newFaqs);

    // unregister(`featuresName${id}`);

    languages.forEach((lang) => {
      unregister(`faq${id}-${lang.code}`);
    });
    // unregister(`featureAvailable${id}`);
  };

  const brandChangeHandler = (e) => {
    setSelectedBrands(e);
    setValue("brands", e);
  };

  const loadOptionsDebounced = useCallback(
    debounce(async (inputValue, callback) => {
      const response = await requestPromiseBrand(
        "GET",
        `brand/all?page=1&isActive=true&name=${inputValue}`
      );
      callback(
        response.data.brands.map((b) => ({ value: b._id, label: b.name }))
      );
    }, 500),
    []
  );

  const CommonFields = [
    [
      {
        Component: AsyncReactSelectInput,
        label: "Brands",
        name: "brands",
        registerFields: {
          required: true,
        },
        control,
        promiseOptions: loadOptionsDebounced,
        handleChange: brandChangeHandler,
        selectedOption: selectedBrands,
        defaultOptions: brands,
        isMultiple: true,
      },
      {
        Component: ReactSelectInput,
        label: "Specification",
        name: "specification",
        registerFields: {
          required: true,
        },
        control,
        options: allSpecification,
        handleChange: handleChangeSpecification,
        selectedOption: selectedSpecification,
        isMultiple: true,
      },
    ],
  ];

  const InputFields = [
    [
      {
        Component: ReactSelectInput,
        label: "Master Variant",
        name: "masterVariant",
        registerFields: {
          required: false,
        },
        controlVariant,
        options: masterVariant,
        handleChange: handleChangeVariant,
        // selectedOption: masterVariant?.find(
        //   (item) => item.value == selectedVariant
        // ),
        selectedOption: selectedVariant,
        // children: masterVariant && masterVariant.length > 0 && (
        //   <>
        //     <option value="">Select Master Variant</option>
        //     {masterVariant.map((obj) => (
        //       <option key={obj._id} value={obj._id}>
        //         {obj.name}
        //       </option>
        //     ))}
        //   </>
        // ),
      },
    ],
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Add Product Sub Category"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: `/product/sub-categories/${recordId}`,
            name: "Back To Product Sub Categories",
          },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom">
            <div class="card-header">
              <h3 class="card-title">Add New Product Sub Category</h3>
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
                                getValues={getValues}
                                setValue={setValue}
                                trigger={trigger}
                                required={lang.required}
                                titleName={"name-" + lang.code}
                                titleLabel={"Sub Category"}
                                clearErrors={clearErrors}
                                isEdit={false}
                              />
                            ))}
                        </div>
                      </div>
                    </div>

                    <RenderInputFields
                      InputFields={CommonFields}
                      errors={errors}
                      register={register}
                    />

                    <div className="BtnLine text-center p-5">
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() => {
                          setIsVaraintModalOpen(true);
                        }}
                      >
                        Variant Customization
                      </button>
                    </div>

                    <div className="row"></div>

                    <div class="accordion" id="accordionExample">
                      {variants
                        .filter((v) => selectedVariantIds.includes(v._id))
                        .map((variant) => (
                          <div key={variant._id} class="card mb-4">
                            <div
                              class="card-header"
                              id={`heading-${variant._id}`}
                            >
                              <h2 class="mb-0" style={{ display: "flex" }}>
                                <button
                                  class="btn btn-link btn-block text-left"
                                  type="button"
                                  data-toggle="collapse"
                                  data-target={`#collapseOne-${variant._id}`}
                                  aria-expanded="true"
                                  aria-controls={`collapseOne-${variant._id}`}
                                >
                                  {variant.name}
                                </button>
                              </h2>

                              <button
                                className="btn btn-primary"
                                type="button"
                                onClick={() => {
                                  addVariantModalHandler(variant._id);
                                }}
                              >
                                Add
                              </button>
                            </div>

                            <div
                              id={`collapseOne-${variant._id}`}
                              class="collapse"
                              // show
                              aria-labelledby={`heading-${variant._id}`}
                              data-parent="#accordionExample"
                            >
                              <div class="card-body">
                                <div class="checkbox-inline">
                                  {variant.variants.map((v) => (
                                    <label
                                      class="checkbox checkbox-square"
                                      key={v._id}
                                    >
                                      {/* <MutliInput
                                    type="checkbox"
                                    label=""
                                    name={`check-${v._id}`}
                                    errors={errors}
                                    placeholder=""
                                    register={register}
                                    registerFields={{ required: false }}
                                    inputData={{ style: { height: "20px" } }}
                                  /> */}
                                      <input
                                        type="checkbox"
                                        // className={`form-control form-control-solid form-control-lg`}
                                        name={`check-${v._id}`}
                                        {...register(`check-${v._id}`, {
                                          required: false,
                                        })}
                                        style={{ height: "20px" }}
                                      />
                                      <span></span>
                                      {v.name}
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* <div className="BtnLine text-center p-5">
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() => {
                          setIsFeatureModalOpen(true);
                        }}
                      >
                        Features Customization
                      </button>
                    </div> */}

                    <div className="BtnLine text-center p-5">
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() => {
                          setIsFaqModalOpen(true);
                        }}
                      >
                        FAQs Customization
                      </button>
                    </div>

                    <SubmitButton
                      handleSubmit={handleSubmit}
                      onSubmit={onSubmit}
                      name="Submit"
                      pxClass="px-10"
                    />
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isVariantModalOpen}
        onRequestClose={() => setIsVaraintModalOpen(false)}
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
        className="react_modal_custom small_popup react_Custom_modal"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              Variant Customization
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={() => setIsVaraintModalOpen(false)}
            >
              <i aria-hidden="true" class="ki ki-close"></i>
            </button>
          </div>
          <div className="modal-body">
            <div className="full-xl-6">
              <RenderInputFields
                InputFields={InputFields}
                errors={errors}
                register={register}
              />
              <div class="form-group">
                <label>Search</label>
                <form onSubmit={searchHandler}>
                  <div className="position-relative">
                    <input
                      type="text"
                      class="form-control form-control-solid form-control-lg undefined"
                      name="name-ar"
                      placeholder="Search..."
                      onChange={(e) => setSearchValue(e.target.value)}
                      value={searchValue}
                    ></input>
                    <button onClick={searchHandler} className="searchIconBtn">
                      <i class="fas fa-search"></i>
                    </button>
                  </div>
                </form>
              </div>

              <div className="ProVariantList">
                {variants.filter((v) => v.show).length > 0 ? (
                  variants
                    .filter((v) => v.show)
                    .map((v) => (
                      <label key={v._id} class="checkbox checkbox-square">
                        <input
                          type="checkbox"
                          // name="check-64228a26fd9ea88f1b1a40e9"
                          style={{ height: "20px" }}
                          checked={v.isChecked}
                          onChange={(e) =>
                            variantCheckedHandler(v._id, e.target.checked)
                          }
                        ></input>
                        <span></span>
                        {v.name}
                      </label>
                    ))
                ) : (
                  <div className="notFoundData">No Result found</div>
                )}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              className="btn btn-primary w-50"
              onClick={saveSelectedVariantIdsHandler}
            >
              Save
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isAddVariantModalOpen}
        onRequestClose={() => setIsAddVariantModalOpen(false)}
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
        className="react_modal_custom small_popup react_Custom_modal"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              Add Variant
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={() => setIsAddVariantModalOpen(false)}
            >
              <i aria-hidden="true" class="ki ki-close"></i>
            </button>
          </div>
          <div className="modal-body">
            <div className="full-xl-6">
              <div className="card-toolbar">
                <ul
                  className="nav nav-tabs nav-tabs-space-lg nav-tabs-line nav-bold nav-tabs-line-3x"
                  role="tablist"
                >
                  {variants.length > 0 &&
                    languages.length > 0 &&
                    languages.map((lang, index) => (
                      <SubTabForm
                        key={index}
                        name={lang.name}
                        index={index}
                        tabName={index + "_fifth"}
                        image={lang?.image}
                      />
                    ))}
                </ul>
              </div>
              <form onSubmit={handleSubmitAddVariant(addVariantSubmit)}>
                <div className="mt-5">
                  <div className="card-body px-0">
                    <div className="tab-content px-4">
                      {languages.length > 0 &&
                        languages.map((lang, index) => (
                          <SubInputForm
                            key={index}
                            index={index}
                            errors={errorsAddVariant}
                            register={registerAddVariant}
                            required={lang.required}
                            InputFields={[
                              [
                                {
                                  Component: MutliInput,
                                  type: "text",
                                  label: "Variant Name",
                                  name: `newVariantName`,
                                  placeholder: `Enter Variant (${lang.name})`,
                                },
                              ],
                            ]}
                            code={lang.code}
                            tabName={index + "_fifth"}
                          />
                        ))}
                    </div>

                    <div className="row"></div>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div class="modal-footer">
            <button
              className="btn btn-primary w-50"
              onClick={handleSubmitAddVariant(addVariantSubmit)}
            >
              Save
            </button>
          </div>
        </div>
      </Modal>

      {/* Features Customization */}

      <Modal
        isOpen={isFeatureModalOpen}
        onRequestClose={() => setIsFeatureModalOpen(false)}
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
        className="modal-dialog-scrollable react_modal_custom small_popup react_Custom_modal"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              Features Customization
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={() => setIsFeatureModalOpen(false)}
            >
              <i aria-hidden="true" class="ki ki-close"></i>
            </button>
          </div>
          <div className="modal-body">
            <div className="full-xl-6">
              <div class="form-group">
                <form>
                  <div className="col-xl-12">
                    <div className="form-group">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <label className="mr-5">Features Values</label>
                        <button
                          onClick={addFeatures}
                          className="btn btn-primary mr-2"
                          type="button"
                        >
                          Add
                        </button>
                      </div>

                      {features.length > 0 &&
                        features.map((feature) => (
                          <Fragment key={feature.id}>
                            <div className="card-header card-header-tabs-line pl-0 pr-0 pt-2">
                              <div className="card-toolbar">
                                <ul
                                  className="nav nav-tabs nav-tabs-space-lg nav-tabs-line nav-bold nav-tabs-line-3x"
                                  role="tablist"
                                >
                                  {features.length > 0 &&
                                    languages.length > 0 &&
                                    languages.map((lang, index) => (
                                      <SubTabForm
                                        key={index}
                                        name={lang.name}
                                        index={index}
                                        tabName={index + "_" + feature.id}
                                        image={lang?.image}
                                      />
                                    ))}
                                </ul>
                              </div>
                            </div>
                            <div className="mt-5">
                              <div className="card-body px-0 pt-0">
                                <div className="tab-content sameRowInput">
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
                                              Component: MutliInput,
                                              type: "text",
                                              label: "Feature Name",
                                              name: `feature${feature.id}`,
                                              placeholder: `Enter Features Value (${lang.name})`,
                                            },
                                            {
                                              Component: ButtonComp,
                                              children: (
                                                <i class="fas fa-trash-alt"></i>
                                              ),
                                              onClick: () =>
                                                deleteFeatureHandler(
                                                  feature.id
                                                ),
                                              classes: "btn btn-bg-danger ml-2",
                                            },
                                          ],
                                        ]}
                                        code={lang.code}
                                        tabName={index + "_" + feature.id}
                                      />
                                    ))}
                                </div>
                                {/* <button
                                  onClick={() =>
                                    deleteFeatureHandler(feature.id)
                                  }
                                  className="btn btn-bg-danger ml-2"
                                  type="button"
                                >
                                  Delete
                                </button> */}
                              </div>
                            </div>
                          </Fragment>
                        ))}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          {/* <div class="modal-footer">
            <button
              className="btn btn-primary w-50"
              onClick={saveSelectedVariantIdsHandler}
            >
              Save
            </button>
          </div> */}
        </div>
      </Modal>

      <Modal
        isOpen={isFaqModalOpen}
        onRequestClose={() => setIsFaqModalOpen(false)}
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
        className="modal-dialog-scrollable react_modal_custom small_popup react_Custom_modal"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              FAQs Customization
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={() => setIsFaqModalOpen(false)}
            >
              <i aria-hidden="true" class="ki ki-close"></i>
            </button>
          </div>
          <div className="modal-body">
            <div className="full-xl-6">
              <div class="form-group">
                <form>
                  <div className="col-xl-12">
                    <div className="form-group">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <label className="mr-5">FAQs Questions</label>
                        <button
                          onClick={addFaqs}
                          className="btn btn-primary mr-2"
                          type="button"
                        >
                          Add
                        </button>
                      </div>

                      {faqs.length > 0 &&
                        faqs.map((faq) => (
                          <Fragment key={faq.id}>
                            <div className="card-header card-header-tabs-line pl-0 pr-0 pt-2">
                              <div className="card-toolbar">
                                <ul
                                  className="nav nav-tabs nav-tabs-space-lg nav-tabs-line nav-bold nav-tabs-line-3x"
                                  role="tablist"
                                >
                                  {faqs.length > 0 &&
                                    languages.length > 0 &&
                                    languages.map((lang, index) => (
                                      <SubTabForm
                                        key={index}
                                        name={lang.name}
                                        index={index}
                                        tabName={index + "_" + faq.id}
                                        image={lang?.image}
                                      />
                                    ))}
                                </ul>
                              </div>
                            </div>
                            <div className="mt-5">
                              <div className="card-body px-0 pt-0">
                                <div className="tab-content sameRowInput">
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
                                              Component: MutliInput,
                                              type: "text",
                                              label: "Question",
                                              name: `faq${faq.id}`,
                                              placeholder: `Enter Question (${lang.name})`,
                                            },
                                            {
                                              Component: ButtonComp,
                                              children: (
                                                <i class="fas fa-trash-alt"></i>
                                              ),
                                              onClick: () =>
                                                deleteFaqHandler(faq.id),
                                              classes: "btn btn-bg-danger ml-2",
                                            },
                                          ],
                                        ]}
                                        code={lang.code}
                                        tabName={index + "_" + faq.id}
                                      />
                                    ))}
                                </div>
                                {/* <button
                                  onClick={() =>
                                    deleteFeatureHandler(feature.id)
                                  }
                                  className="btn btn-bg-danger ml-2"
                                  type="button"
                                >
                                  Delete
                                </button> */}
                              </div>
                            </div>
                          </Fragment>
                        ))}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          {/* <div class="modal-footer">
            <button
              className="btn btn-primary w-50"
              onClick={saveSelectedVariantIdsHandler}
            >
              Save
            </button>
          </div> */}
        </div>
      </Modal>
    </div>
  );
};

export default Add;
