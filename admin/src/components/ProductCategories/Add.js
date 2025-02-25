import React, { useEffect, useState, Fragment } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Modal from "react-modal";
import { Controller } from "react-hook-form";
import Select from "react-select";
import { SortableContainer, SortableItem } from "../Table/Table";
// import arrayMove from 'array-move';
import { arrayMoveMutable } from "../../util/fn";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import {
  Input,
  SelectInput,
  RenderInputFields,
  SubmitButton,
  SubTab,
  SubInput,
  ReactSelectInput,
  ReactSelectInputTwo,
} from "../Form/Form";
import { SEOInputFields } from "../Products/Components/ProductMeta";
import { createSlug } from "../../util/fn";

const SEOInputFieldsWithoutOgImage = SEOInputFields[0]
  .filter((c) => c.name !== "ogImage")
  .map((c) => ({ ...c, isRequired: false }));

const Add = (props) => {
  const { id: parentId } = props.match.params;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    getValues,
    trigger,
    clearErrors,
    control,
    unregister,
    watch,
  } = useForm();

  const { languages } = useSelector((state) => state.setting);

  const names = watch(languages.map((lang) => `name-${lang.code}`));

  const { response, request } = useRequest();

  // const { response: responseCountries, request: requestCountries } =
  //   useRequest();
  const { response: responseVariant, request: requestVariant } = useRequest();
  const { response: responeSpecification, request: requestSpecification } =
    useRequest();
  const { response: responseOrder, request: requestOrder } = useRequest();
  const { response: responseParent, request: requestParent } = useRequest();

  // const { response: responseFirstLevel, request: requestFirstLevel } =
  //   useRequest();

  // const { response: responseSecondLevel, request: requestSecondLevel } =
  //   useRequest();

  const { response: responseLevelWise, request: requestLevelWise } =
    useRequest();

  // const [allCountry, setAllCountry] = useState([]);
  // const [selectedCountry, setSelectedCountry] = useState([]);
  const [allSpecifications, setAllSpecifications] = useState([]);
  const [selectedSpecifications, setSelectedSpecifications] = useState([]);

  const [image, setImage] = useState();

  const [isDynamicFilterModalOpen, setIsDynamicFilterModalOpen] =
    useState(false);
  // const [searchValue, setSearchValue] = useState("");
  // const [variants, setVariants] = useState([]);
  // const [selectedVariantIds, setSelectedVariantIds] = useState([]);

  const [allVariants, setAllVariants] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [masterVariant, setMasterVariant] = useState(null);

  const [allFilters, setAllFilters] = useState([
    { label: "Specification Groups", options: [] },
    {
      label: "Variant Groups",
      options: [],
    },
  ]);

  const [filterIds, setFilterIds] = useState([]);
  const [filterId, setFilterId] = useState(0);

  // const [firstLevelCategories, setFirstLevelCategories] = useState([]);
  // const [selectedFirstLevelCategory, setSelectedFirstLevelCategory] =
  //   useState(null);

  // const [secondLevelCategories, setSecondLevelCategories] = useState([]);
  // const [selectedSecondLevelCategory, setSelectedSecondLevelCategory] =
  //   useState(null);

  const [levelWiseCategories, setLevelWiseCategories] = useState([]);

  const history = useHistory();

  useEffect(() => {
    document.title = "Add Product Category - Noonmar";
    // requestCountries("GET", `country/all?page=1&isActive=${true}`);
    // requestSpecification("GET", `specification-groups/all?page=1&isActive=${true}`);
    requestSpecification("GET", `product-category/groups`);
    requestVariant("GET", `variant/category`);
    requestOrder(
      "GET",
      `product-category/next-order?parentId=${parentId ?? ""}`
    );

    if (parentId) {
      requestParent("GET", `product-category/${parentId}`);
    } else {
      // requestFirstLevel("GET", "product-category/all-two");
      requestLevelWise("GET", "product-category/by-level");
    }
  }, []);

  useEffect(() => {
    if (languages) {
      languages.forEach((lang, index) => {
        if (lang.default) {
          register(`name-${lang.code}`, { required: true });
        } else {
          register(`name-${lang.code}`);
        }
      });
    }
  }, [languages]);

  useEffect(() => {
    if (names) {
      languages.forEach((lang, idx) => {
        setValue(`slug-${lang.code}`, names[idx] ? createSlug(names[idx]) : "");
      });
    }
  }, [names]);

  // useEffect(() => {
  //   if (responseFirstLevel) {
  //     setFirstLevelCategories(responseFirstLevel.data);
  //   }
  // }, [responseFirstLevel]);

  // useEffect(() => {
  //   if (responseSecondLevel) {
  //     setSecondLevelCategories(responseSecondLevel.data);
  //   }
  // }, [responseSecondLevel]);

  useEffect(() => {
    if (responseLevelWise) {
      setLevelWiseCategories(responseLevelWise.categories);
    }
  }, [responseLevelWise]);

  useEffect(() => {
    if (responseParent) {
      const {
        specificationFilterIds,
        variantFilterIds,
        specificationData,
        variantData,
        masterVariantData,
      } = responseParent.data;

      const newFilters = [...allFilters];

      setSelectedSpecifications(specificationData);

      if (specificationData.length > 0) {
        setValue(
          "specifications",
          specificationData.map((obj) => obj.value)
        );
        newFilters[0].options = specificationData;
      }

      setSelectedVariants(variantData);

      if (variantData.length > 0) {
        setValue(
          "variants",
          variantData.map((obj) => obj.value)
        );
        newFilters[1].options = variantData;
      }

      specificationFilterIds.forEach((id) => {
        setValue(`filter_${id}`, true);
      });

      variantFilterIds.forEach((id) => {
        setValue(`filter_${id}`, true);
      });

      if (masterVariantData) {
        setMasterVariant(masterVariantData);
        setValue("masterVariant", masterVariantData.value);
      }

      setAllFilters(newFilters);
    }
  }, [responseParent]);

  // useEffect(() => {
  //   if (responseVariant) {
  //     setVariants(
  //       responseVariant.variants.map((v) => ({
  //         ...v,
  //         show: true,
  //         isChecked: false,
  //       }))
  //     );
  //   }
  // }, [responseVariant]);

  useEffect(() => {
    if (responseVariant) {
      setAllVariants(
        responseVariant.variants.map((obj) => ({
          label: obj.name,
          value: obj._id,
        }))
      );
    }
  }, [responseVariant]);

  useEffect(() => {
    if (responseOrder) {
      setValue("sortOrder", responseOrder.nextOrder);
    }
  }, [responseOrder]);

  useEffect(() => {
    if (response) {
      toast.success("Product category has been added successfully.");
      if (parentId) {
        history.push(`/product/categories/${parentId}`);
      } else {
        history.push("/product/categories");
      }
    }
  }, [response]);

  // useEffect(() => {
  //   if (responseCountries) {
  //     if (responseCountries.status && responseCountries.data) {
  //       let countries = [];
  //       if (responseCountries.data.length > 0) {
  //         responseCountries.data.forEach((obj) => {
  //           countries.push({
  //             label: obj.name,
  //             value: obj._id,
  //           });
  //         });
  //       }
  //       setAllCountry(countries);
  //     }
  //   }
  // }, [responseCountries]);

  useEffect(() => {
    if (responeSpecification) {
      let specification = responeSpecification.groups.map((obj) => ({
        label: obj.name,
        value: obj._id,
        parentName: obj.parentName,
        childName: obj.childName,
      }));

      setAllSpecifications(specification);
    }
  }, [responeSpecification]);

  const onSubmit = (data) => {
    const languageData = [];

    const mainData = {};
    const metaDatas = {};

    if (parentId) {
      mainData.parentId = parentId;
    } else {
      // if (data.level2) {
      //   mainData.parentId = data.level2;
      // } else if (data.level1) {
      //   mainData.parentId = data.level1;
      // }
      if (data.parentCategory) {
        mainData.parentId = data.parentCategory.value;
      }
    }

    for (let i = 0; i < languages.length; i++) {
      metaDatas[languages[i].code] = {};
    }

    for (let key in data.metaData) {
      const [title, code] = key.split("-");
      metaDatas[code][title] = data.metaData[key];

      if (title === "keywords") {
        metaDatas[code][title] =
          data.metaData[key] !== undefined
            ? data.metaData[key].toString()
            : null;
      }
    }

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;

      const langUpdates = {};

      if (data["slug-" + code]) {
        langUpdates.slug = data["slug-" + code];
      }

      languageData.push({
        languageCode: code,
        name: data["name-" + code] ?? "",
        ...langUpdates,
        metaData: metaDatas[code],
      });

      if (languages[i].default) {
        mainData.name = data["name-" + code];
      }
    }

    const specifications = data.specifications ?? [];
    const variantIds = data.variants ?? [];

    mainData.specificationIds = specifications;
    mainData.variantIds = variantIds;

    if (selectedVariants.length > 0) {
      if (selectedVariants.length === 1) {
        mainData.masterVariantId = selectedVariants[0].value;
      } else {
        if (!data.masterVariant) {
          //throw error
        } else {
          if (selectedVariants.find((v) => v.value === data.masterVariant)) {
            mainData.masterVariantId = data.masterVariant;
          } else {
            //throw error
            toast.error("Please select master varaint.");
            setValue("masterVariant", null);
            setMasterVariant(null);
            return;
          }
        }
      }
    }

    mainData.isActive = data.isActive;

    const specificationFilterIds = [];
    const requiredSpecificationIds = [];
    const variantFilterIds = [];

    for (let i = 0; i < allFilters[0].options.length; i++) {
      const id = allFilters[0].options[i];
      if (data[`filter_${id.value}`]) {
        specificationFilterIds.push(id.value);
      }

      if (data[`filterrequired_${id.value}`]) {
        requiredSpecificationIds.push(id.value);
      }
    }

    for (let i = 0; i < allFilters[1].options.length; i++) {
      const id = allFilters[1].options[i];

      if (data[`filter_${id.value}`]) {
        variantFilterIds.push(id.value);
      }
    }
    // for (let i = 0; i < filterIds.length; i++) {
    //   const id = filterIds[i];
    //   const filterData = data[`filter-${id}`];
    //   if (filterData) {
    //     const value = filterData.value;

    //     if (
    //       specifications.includes(value) &&
    //       !specificationFilterIds.includes(value)
    //     ) {
    //       specificationFilterIds.push(value);
    //     } else if (
    //       variantIds.includes(value) &&
    //       !variantFilterIds.includes(value)
    //     ) {
    //       variantFilterIds.push(value);
    //     }
    //   }
    // }

    mainData.specificationFilterIds = specificationFilterIds;
    mainData.requiredSpecificationIds = requiredSpecificationIds;
    mainData.variantFilterIds = variantFilterIds;

    let formData = new FormData();

    if (image) {
      formData.append("image", data.image[0]);
    }

    formData.append("mainData", JSON.stringify(mainData));
    formData.append("languageData", JSON.stringify(languageData));

    request("POST", "product-category", formData);
    return;
  };

  const handleImage = (event) => {
    event.preventDefault();
    setImage(event.target.files);
  };

  // const handleChange = (event) => {
  //   setSelectedCountry(event);

  //   if (event && event.length > 0) {
  //     let countryids = [];
  //     event.forEach((obj) => {
  //       countryids.push(obj.value);
  //     });
  //     setError("country", "");
  //     setValue("country", countryids);
  //   } else {
  //     setValue("country", null);
  //   }
  // };

  const handleChangeSpecification = (event, current) => {
    setSelectedSpecifications(event);

    const newFilters = [...allFilters];
    newFilters[0].options = event;
    setAllFilters(newFilters);

    if (event && event.length > 0) {
      const specificationids = event.map((obj) => obj.value);
      setError("specifications", "");
      setValue("specifications", specificationids);
    } else {
      setValue("specifications", null);
    }
  };

  const handleChangeVariant = (event) => {
    setSelectedVariants(event);

    const newFilters = [...allFilters];
    newFilters[1].options = event;
    setAllFilters(newFilters);

    if (event && event.length > 0) {
      const variantIds = event.map((obj) => obj.value);
      setError("variants", "");
      setValue("variants", variantIds);
    } else {
      setValue("variants", null);
    }

    if (event.length < 2) {
      setMasterVariant(null);
      setValue("masterVariant", null);
    }
  };

  const handleChangeMasterVariant = (event) => {
    setMasterVariant(event);

    if (event) {
      setError("masterVariant", "");
      setValue("masterVariant", event.value);
    } else {
      setValue("masterVariant", null);
    }
  };

  const addFilterHandler = () => {
    setFilterIds((prev) => [...prev, filterId]);
    setFilterId((prev) => prev + 1);
  };

  const deleteFilterHandler = (id) => {
    const newFaqs = [...filterIds].filter((f) => f !== id);
    setFilterIds(newFaqs);

    // unregister(`featuresName${id}`);

    unregister(`filter-${id}`);
  };

  /*
  const handleChangeFirstLevel = (event) => {
    setSelectedFirstLevelCategory(event);

    if (event) {
      setError("level1", "");
      setValue("level1", event.value);
      requestSecondLevel(
        "GET",
        `product-category/all-two?parentId=${event.value}`
      );
    } else {
      setValue("level1", null);
    }

    setValue("level2", null);
    setSecondLevelCategories([]);
    setSelectedSecondLevelCategory(null);
  };
  */

  /*
  const handleChangeSecondLevel = (event) => {
    setSelectedSecondLevelCategory(event);

    if (event) {
      setError("level2", "");
      setValue("level2", event.value);
    } else {
      setValue("level2", null);
    }
  };
  */

  // const saveSelectedVariantIdsHandler = () => {
  //   setSelectedVariantIds(
  //     variants.filter((v) => v.isChecked).map((v) => v._id)
  //   );
  //   setIsDynamicFilterModalOpen(false);
  // };

  // const searchHandler = (e) => {
  //   if (e) {
  //     e.preventDefault();
  //   }
  //   const regex = new RegExp(searchValue, "i");
  //   const variantsFiltered = variants.map((v) => {
  //     const { name } = v;
  //     if (name.match(regex)) {
  //       return { ...v, show: true };
  //     } else {
  //       return { ...v, show: false };
  //     }
  //   });
  //   setVariants(variantsFiltered);
  // };

  // const variantCheckedHandler = (id, value) => {
  //   const idx = variants.findIndex((v) => v._id === id);
  //   const newVariants = [...variants];
  //   newVariants[idx] = { ...newVariants[idx], isChecked: value };
  //   setVariants(newVariants);
  // };

  const InputFields = [
    [
      // {
      //   Component: ReactSelectInput,
      //   label: "Country",
      //   name: "country",
      //   registerFields: {
      //     required: true,
      //   },
      //   control,
      //   options: allCountry,
      //   handleChange: handleChange,
      //   selectedOption: selectedCountry,
      //   isMultiple: true,
      // },
      // {
      //   Component: ReactSelectInput,
      //   label: "Specification",
      //   name: "specification",
      //   registerFields: {
      //     required: true,
      //   },
      //   control,
      //   options: allSpecifications,
      //   handleChange: handleChangeSpecification,
      //   selectedOption: selectedSpecifications,
      //   isMultiple: true,
      // },

      // {
      //   Component: Input,
      //   label: "Commission Rate (%)",
      //   type: "text",
      //   name: "commissionRate",
      //   registerFields: {
      //     required: true,
      //     pattern: /^\d{1,3}(,\d{3})*(\,|.\d+)?$/i,
      //   },
      //   registerFieldsFeedback: {
      //     pattern: "Commission rate can only contain numbers.",
      //   },
      // },
      {
        Component: Input,
        label: "Status",
        name: "isActive",
        type: "checkbox",
        registerFields: {
          required: false,
        },
      },
      // {
      //   Component: SelectInput,
      //   label: "Status",
      //   name: "isActive",
      //   registerFields: {
      //     required: true,
      //   },
      //   children: (
      //     <>
      //       <option value="">Select Status</option>
      //       <option value={true}>Active</option>
      //       <option value={false}>Inactive</option>
      //     </>
      //   ),
      // },
      {
        Component: Input,
        label: "Order",
        type: "text",
        name: "sortOrder",
        registerFields: {
          required: true,
        },
        inputData: {
          disabled: true,
        },
      },
      {
        Component: Input,
        label: "Image",
        type: "file",
        name: "image",
        registerFields: {
          required: true,
        },
        handleMedia: handleImage,
        isMedia: true,
        accept: ".png, .jpg, .jpeg",
        control,
        tooltip: {
          show: true,
          title: `Required resolution is 1:1.45 (Width:Height)`,
        },
      },
      {
        Component: ReactSelectInput,
        label: "Specification Groups",
        name: "specifications",
        registerFields: {
          required: false,
        },
        control,
        options: allSpecifications,
        handleChange: handleChangeSpecification,
        selectedOption: selectedSpecifications,
        isMultiple: true,
      },
      {
        Component: ReactSelectInput,
        label: "Variant Groups",
        name: "variants",
        registerFields: {
          required: false,
        },
        control,
        options: allVariants,
        handleChange: handleChangeVariant,
        selectedOption: selectedVariants,
        isMultiple: true,
      },
      {
        Component: ReactSelectInput,
        label: "Master Variant",
        name: "masterVariant",
        registerFields: {
          required: selectedVariants.length > 1,
        },
        control,
        options: selectedVariants,
        handleChange: handleChangeMasterVariant,
        selectedOption: masterVariant,
        isMultiple: false,
        colClass: selectedVariants.length > 1 ? "col-xl-6" : "d-none",
      },
    ],
  ];

  const LevelInputFields = [
    [
      {
        Component: ReactSelectInputTwo,
        colClass: "col-xl-12",
        label: "Parent Category",
        name: "parentCategory",
        registerFields: {
          required: false,
        },
        control,
        options: levelWiseCategories,
        isMultiple: false,
        isClearable: true,
        errors,
      },
      // {
      //   Component: ReactSelectInput,
      //   label: "Level 1",
      //   name: "level1",
      //   registerFields: {
      //     required: false,
      //   },
      //   control,
      //   options: firstLevelCategories,
      //   handleChange: handleChangeFirstLevel,
      //   selectedOption: selectedFirstLevelCategory,
      //   isMultiple: false,
      //   isClearable: true,
      // },
      // {
      //   Component: ReactSelectInput,
      //   label: "Level 2",
      //   name: "level2",
      //   registerFields: {
      //     required: false,
      //   },
      //   control,
      //   options: secondLevelCategories,
      //   handleChange: handleChangeSecondLevel,
      //   selectedOption: selectedSecondLevelCategory,
      //   isMultiple: false,
      //   isClearable: true,
      // },
    ],
  ];

  const onSortEnd = ({ oldIndex, newIndex }, name) => {
    if (oldIndex == newIndex) {
      return;
    }
    const oldOrder = oldIndex;
    const newOrder = newIndex;
    let newVariableVariant;
    let idsWithOrder = [...allFilters];

    const sortableData = idsWithOrder.find((item) => {
      return item.label == name;
    });

    if (sortableData.label == name) {
      // if (oldOrder < newOrder) {
      //   const indexes = [];

      //   for (let i = newOrder; i >= oldOrder; i--) {
      //     indexes.push(i);
      //   }

      //   arrayMoveMutable(sortableData.options, oldOrder, newOrder );
      // } else if (oldOrder > newOrder) {
      //   const indexes = [];

      //   for (let i = oldOrder; i >= newOrder; i--) {
      //     indexes.push(i);
      //   }

      //   arrayMoveMutable(sortableData.options, oldOrder , newOrder);
      // }
      arrayMoveMutable(sortableData.options, oldOrder, newOrder);

      const variantData = sortableData.options.map((v, idx) => ({
        ...v,
        order: idx + 1,
      }));
      newVariableVariant = { ...sortableData, options: variantData };
      //  setAllFilters([VariantData,newVariable])
    }
    const newData = idsWithOrder.map((item) => {
      if (item.label == name) {
        return newVariableVariant;
      }
      return item;
    });
    // if(SpecificationData){
    //   if (oldOrder < newOrder) {
    //     const indexes = [];

    //     for (let i = newOrder; i >= oldOrder; i--) {
    //       indexes.push(i);
    //     }

    //     arrayMoveMutable(SpecificationData.options, 0, newOrder - oldOrder);
    //   } else if (oldOrder > newOrder) {
    //     const indexes = [];

    //     for (let i = oldOrder; i >= newOrder; i--) {
    //       indexes.push(i);
    //     }

    //     arrayMoveMutable(SpecificationData.options, oldOrder - newOrder, 0);
    //   }
    //   const specificationDatas = SpecificationData.options.map((v, idx) => ({ ...v, order: idx + 1 }))
    //    newVariableSpecification = {...SpecificationData,options:specificationDatas}
    //   //  setAllFilters([SpecificationData,newVariable])
    // }

    setAllFilters(newData);

    //  setAllFilters(
    //   idsWithOrder[1].options.map((v, idx) => ({ ...v, order: idx + 1 }))
    // );
  };

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Add Product Category"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: parentId
              ? `/product/categories/${parentId}`
              : "/product/categories",
            name: "Back To Product Categories",
          },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom">
            <div class="card-header">
              <h3 class="card-title">Add New Product Category</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-xl-12">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    {!parentId && (
                      <div class="accordion" id="accordionExample">
                        <div class="card">
                          {/* <div class="card-header" id="headingOne">
                            <h2 class="mb-0">
                              <button
                                class="btn btn-link btn-block text-left"
                                type="button"
                                data-toggle="collapse"
                                data-target="#collapseOne"
                                aria-expanded="true"
                                aria-controls="collapseOne"
                              >
                                Levels
                              </button>
                            </h2>
                          </div>   */}

                          <div
                            id="collapseOne"
                            class="collapse show"
                            aria-labelledby="headingOne"
                            data-parent="#accordionExample"
                          >
                            <div class="card-body">
                              <RenderInputFields
                                InputFields={LevelInputFields}
                                errors={errors}
                                register={register}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

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
                                  tabName={`language_${index}`}
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
                                control={control}
                                InputFields={[
                                  [
                                    {
                                      Component: Input,
                                      label: "Name",
                                      type: "text",
                                      name: "name",
                                      isRequired: true,
                                    },
                                    {
                                      Component: Input,
                                      label: "Link",
                                      type: "text",
                                      name: "slug",
                                      isRequired: true,
                                    },
                                  ],
                                  [
                                    {
                                      Component: Input,
                                      label: "Category Meta: ",
                                      type: "hidden",
                                      name: "hidden",
                                      isRequired: false,
                                    },
                                  ],
                                  SEOInputFieldsWithoutOgImage,
                                ]}
                                // getValues={getValues}
                                // setValue={setValue}
                                // trigger={trigger}
                                // required={lang.default}
                                // titleName={"name-" + lang.code}
                                // titleLabel={"Name"}
                                // clearErrors={clearErrors}
                                // isEdit={false}
                                code={lang.code}
                                tabName={`language_${index}`}
                              />
                            ))}
                        </div>
                      </div>
                    </div>
                    <RenderInputFields
                      InputFields={InputFields}
                      errors={errors}
                      register={register}
                    />

                    {/* {(selectedVariants.length > 0 ||
                      selectedSpecifications.length > 0) && (
                      <div className="BtnLine text-center p-5">
                        <button
                          className="btn btn-primary"
                          type="button"
                          onClick={() => {
                            setIsDynamicFilterModalOpen(true);
                          }}
                        >
                          Dynamic Filters
                        </button>
                      </div>
                    )} */}

                    {(selectedVariants.length > 0 ||
                      selectedSpecifications.length > 0) && (
                      <div className="card-body px-0">
                        <h3>Dynamic Filters</h3>
                        {["Specification Groups", "Variant Groups"].map(
                          (name, idx) => (
                            <Fragment key={idx}>
                              <table
                                className="table dataTable table-head-custom table-head-bg table-borderless table-vertical-center"
                                id="taskTable"
                              >
                                {allFilters[idx].options.length > 0 && (
                                  <div className="form-group">
                                    <thead>
                                      <tr className="text-uppercase">
                                        <th></th>
                                        <th>
                                          <a className="no_sort">Selected</a>
                                        </th>
                                        {idx === 0 && (
                                          <th>
                                            <a className="no_sort">Required</a>
                                          </th>
                                        )}
                                        <th>
                                          <a className="no_sort">Order</a>
                                        </th>
                                        <th>
                                          <a className="no_sort">{name}</a>
                                        </th>
                                      </tr>
                                    </thead>

                                    {/* <h5>{name}</h5> */}
                                    <div>
                                      {/*  className="ProVariantList" */}
                                      <SortableContainer
                                        useDragHandle
                                        onSortEnd={(e) => onSortEnd(e, name)}
                                      >
                                        {allFilters[idx].options.map((v, i) => (
                                          <SortableItem
                                            key={`item-${v.value}`}
                                            index={i}
                                            order={i + 1}
                                            data={v}
                                            tableData={[
                                              "selected",
                                              "required",
                                              "order",
                                              "name",
                                            ]}
                                            onlyDate={{}}
                                            links={[]}
                                            page={1}
                                            date_format={null}
                                            date_time_format={null}
                                            renderAs={{
                                              selected: (_, ignore, data) => (
                                                <td>
                                                  <input
                                                    type="checkbox"
                                                    style={{ height: "20px" }}
                                                    {...register(
                                                      `filter_${data.value}`
                                                    )}
                                                  />
                                                </td>
                                              ),
                                              required: (_, ignore, data) =>
                                                idx === 0 ? (
                                                  <td>
                                                    <input
                                                      type="checkbox"
                                                      style={{ height: "20px" }}
                                                      {...register(
                                                        `filterrequired_${data.value}`
                                                      )}
                                                    />
                                                  </td>
                                                ) : (
                                                  <></>
                                                ),
                                              order: () => (
                                                <td
                                                  style={{
                                                    paddingLeft:
                                                      idx === 0 ? "60px" : 0,
                                                  }}
                                                >
                                                  <span>{i + 1}</span>
                                                </td>
                                              ),
                                              name: (_, ignore, data) => (
                                                <td
                                                // style={{
                                                //   paddingLeft:
                                                //     idx === 0 ? "60px" : 0,
                                                // }}
                                                >
                                                  {data.label}
                                                </td>
                                              ),
                                            }}
                                            linksHelperFn={() => {}}
                                            register={register}
                                          />
                                          // <label
                                          //   key={v.value}
                                          //   class="checkbox checkbox-square"
                                          // >
                                          //   <input
                                          //     type="checkbox"
                                          //     style={{ height: "20px" }}
                                          //     {...register(`filter_${v.value}`)}
                                          //   ></input>
                                          //   <span></span>
                                          //   {v.label}
                                          // </label>
                                        ))}
                                      </SortableContainer>
                                    </div>
                                  </div>
                                )}
                              </table>
                            </Fragment>
                          )
                        )}
                      </div>
                    )}

                    <div className="row"></div>

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
        isOpen={isDynamicFilterModalOpen}
        onRequestClose={() => setIsDynamicFilterModalOpen(false)}
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
        className="modal-dialog-scrollable react_modal_custom small_popup react_Custom_modal"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              Filters
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={() => setIsDynamicFilterModalOpen(false)}
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
                        <label className="mr-5">Filters</label>
                        <button
                          onClick={addFilterHandler}
                          className="btn btn-primary mr-2"
                          type="button"
                        >
                          Add
                        </button>
                      </div>

                      {filterIds.length > 0 &&
                        filterIds.map((id) => (
                          <Fragment key={id}>
                            <div className="mt-5">
                              <div className="card-body px-0 pt-0">
                                <div className="tab-content sameRowInput d-flex">
                                  <Controller
                                    className={`select-reactSelect  select-style  form-control-solid ${
                                      errors[`filter-${id}`] && "is-invalid"
                                    }`}
                                    control={control}
                                    name={`filter-${id}`}
                                    rules={{ required: true }}
                                    render={({
                                      field: { onChange, value, ref },
                                    }) => {
                                      return (
                                        <Select
                                          onChange={(val) => {
                                            onChange(val);
                                            // handleChangeHandler(val);
                                          }}
                                          options={allFilters}
                                          isMulti={false}
                                          value={value}
                                          className={`select-reactSelect select-style   form-control-solid ${
                                            errors[`filter-${id}`] &&
                                            "is-invalid"
                                          }`}
                                        />
                                      );
                                    }}
                                  />
                                  <button
                                    onClick={() => deleteFilterHandler(id)}
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
        isOpen={false}
        onRequestClose={() => setIsDynamicFilterModalOpen(false)}
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
        className="react_modal_custom small_popup react_Custom_modal"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              Dynamic Filters
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={() => setIsDynamicFilterModalOpen(false)}
            >
              <i aria-hidden="true" class="ki ki-close"></i>
            </button>
          </div>
          <div className="modal-body">
            <div className="full-xl-6">
              {/* <div class="form-group">
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
              </div> */}

              <div className="ProVariantList">
                {/* {variants.filter((v) => v.show).length > 0 ? (
                  variants
                    .filter((v) => v.show)
                    .map((v) => (
                      <label key={v._id} class="checkbox checkbox-square">
                        <input
                          type="checkbox"
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
                )} */}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            {/* <button
              className="btn btn-primary w-50"
              onClick={saveSelectedVariantIdsHandler}
            >
              Save
            </button> */}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Add;

/*
ML
name D
slug D
metaTags D

NML
isActive D
image D
specificationGroups
variantGroups
sortOrder D
mainVariant
filters modal (with +,detele icon, specification/variant: select group)

manufacture name
industry
employees
location
vendor
*/
