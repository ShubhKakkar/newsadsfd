import React, { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import {
  RenderInputFields,
  SubmitButton,
  MutliInput,
  SubTab as SubTabForm,
  SubInput as SubInputForm,
  ButtonComp,
} from "../Form/Form";
import { SubTab, SubInput } from "../LanguageForm/LanguageForm";

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
    setError,
    control,
  } = useForm();

  const { languages } = useSelector((state) => state.setting);

  const { response, request } = useRequest();
  // const { response: responseCategories, request: requestCategories } =
  //   useRequest();

  // const [allCategory, setAllCategory] = useState([]);
  const [features, setFeatures] = useState([{ id: 0 }]);
  const [nextId, setNextId] = useState(1);
  // const [selectedCategory, setSelectedCategory] = useState({});

  const history = useHistory();

  useEffect(() => {
    document.title = "Add Sub Specification - Noonmar";
    // requestCategories("GET", `product-category/all?page=1&isActive=${true}`);
  }, []);

  useEffect(() => {
    if (response) {
      toast.success("Sub specification has been added successfully.");
      history.push(
        `/specification-groups/sub-specification-groups/${recordId}`
      );
    }
  }, [response]);

  // useEffect(() => {
  //   if (responseCategories) {
  //     if (responseCategories.status && responseCategories.data) {
  //       setAllCategory(responseCategories.data);
  //     }
  //   }
  // }, [responseCategories]);

  const onSubmit = (data) => {
    const dataToSend = [];
    const defaultData = {};

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;
      dataToSend.push({
        languageCode: code,
        name: data["name-" + code] ?? "",
      });

      if (languages[i].default) {
        defaultData.name = data["name-" + code];
        // defaultData.category = data["category"];
        defaultData.specificationId = recordId;
      }
    }

    // const featuresObj = { main: [] };

    // languages.forEach((lang) => {
    //     featuresObj[lang.code] = [];
    //   });

    // for (let i = 0; i < features.length; i++) {
    //   const id = features[i].id;

    //   for (let j = 0; j < languages.length; j++) {
    //     const code = languages[j].code;

    //     if (languages[j].default) {
    //       if (data[`feature${id}-${code}`].trim().length === 0) {
    //         setError(`feature${id}-${code}`, {
    //           type: "required",
    //         });
    //         return;
    //       }

    //       featuresObj.main = [
    //         ...featuresObj.main,
    //         data[`feature${id}-${code}`] ?? "",
    //       ];
    //     }
    //   }
    // }

    const featuresObj = { main: [] };

    languages.forEach((lang) => {
      featuresObj[lang.code] = [];
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
    request("POST", "sub-specification-groups", {
      ...defaultData,
      subData: dataToSend,
      values: featuresObj,
      toCreateVariant: data.toCreateVariant,
    });
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

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Add New Sub Specification"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: `/specification-groups/sub-specification-groups/${recordId}`,
            name: "Back To Sub Specification",
          },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom">
            <div class="card-header">
              <h3 class="card-title">Add New Sub Specification</h3>
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
                                titleLabel={"Sub Specification"}
                                clearErrors={clearErrors}
                                isEdit={false}
                              />
                            ))}
                        </div>
                      </div>
                    </div>

                    <div class="modal-content">
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
                                    <label className="mr-5">
                                      Sub Specification Values
                                    </label>
                                    <button
                                      onClick={addFeatures}
                                      className="btn btn-primary mr-2 fixedButtonAdd"
                                      type="button"
                                    >
                                      Add
                                    </button>
                                  </div>

                                  {features.length > 0 &&
                                    features.map((feature, fIndex) => (
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
                                                    tabName={
                                                      index + "_" + feature.id
                                                    }
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
                                                          label:
                                                            "Sub Specification",
                                                          name: `feature${feature.id}`,
                                                          placeholder: `Enter Sub Specification Value (${lang.name})`,
                                                        },
                                                        {
                                                          Component: ButtonComp,
                                                          show: fIndex !== 0,
                                                          children: (
                                                            <i class="fas fa-trash-alt"></i>
                                                          ),
                                                          onClick: () =>
                                                            deleteFeatureHandler(
                                                              feature.id
                                                            ),
                                                          classes:
                                                            "btn btn-bg-danger ml-2",
                                                        },
                                                      ],
                                                    ]}
                                                    code={lang.code}
                                                    tabName={
                                                      index + "_" + feature.id
                                                    }
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

                    <div className="row card-body">
                      <div className="ProVariantList">
                        <label class="checkbox checkbox-square">
                          <input
                            type="checkbox"
                            style={{ height: "20px" }}
                            {...register("toCreateVariant")}
                          ></input>
                          <span></span>
                          Do you want to add this as a variant?
                        </label>
                      </div>
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

      {/* Features Customization */}
    </div>
  );
};

export default Add;
