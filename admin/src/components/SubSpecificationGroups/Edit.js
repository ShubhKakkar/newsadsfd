import React, {
  Fragment,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { FixedSizeList as List } from "react-window";

import useRequest from "../../hooks/useRequest";

import {
  Input,
  SelectInput,
  RenderInputFields,
  ReactSelectInput,
  SubmitButton,
  MutliInput,
  SubTab as SubTabForm,
  SubInput as SubInputForm,
  AsyncReactSelectInput,
  ButtonComp,
} from "../Form/Form";
import { SubTab, SubInput } from "../LanguageForm/LanguageForm";

const Edit = (props) => {
  const { id: recordId, sid } = props.match.params;
  const history = useHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    getValues,
    trigger,
    unregister,
    clearErrors,
    reset,
    setError,
  } = useForm();

  const { languages } = useSelector((state) => state.setting);

  const { response: responseFetchData, request: requestFetchData } =
    useRequest();

  const { response, request } = useRequest();

  const [langDataIds, setLangDataIds] = useState([]);
  const [langDataValueIds, setLangDataValueIds] = useState({});

  const [features, setFeatures] = useState([{ id: 0 }]);
  const [nextId, setNextId] = useState(1);
  const [deleteIds, setDeleteIds] = useState([]);

  const updatedIdsRef = useRef(new Set());

  useEffect(() => {
    document.title = "Edit Sub Specification - Noonmar";
    requestFetchData("GET", `sub-specification-groups/${recordId}`);
  }, []);

  useEffect(() => {
    if (responseFetchData) {
      const {
        data: { name },
        languageData,
        values,
      } = responseFetchData.data;

      const subData = {};

      const langValuesData = {};

      setLangDataIds(
        languageData.map((lang) => ({
          id: lang.id,
          languageCode: lang.languageCode,
        }))
      );

      languageData.forEach((lang) => {
        const code = lang.languageCode;
        subData["name-" + code] = lang.name;
      });

      setFeatures(values.map((_, idx) => ({ id: idx, mongoId: _._id })));

      setNextId(values.length);

      values.forEach((value, idx) => {
        langValuesData[value._id] = value.languageData.map((sv) => ({
          id: sv.id,
          code: sv.languageCode,
        }));

        value.languageData.forEach((val) => {
          const code = val.languageCode;
          subData[`feature${idx}-` + code] = val.name;
        });
      });

      setLangDataValueIds(langValuesData);

      // setFeatures(responseVariant?.languageData?.features);
      reset({ name, ...subData });

      //   setSelectedCategory(productCategoryId);
      //   setValue("category", productCategoryId);
    }
  }, [responseFetchData]);

  useEffect(() => {
    if (response) {
      toast.success("Sub specification has been updated successfully.");
      history.push(`/specification-groups/sub-specification-groups/${sid}`);
    }
  }, [response]);

  const onSubmit = (data) => {
    const defaultData = { id: recordId };
    const namesArr = [];

    const defaultDataValues = [];
    const valuesArr = [];

    const newValuesArr = []; //name, values{}

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;

      const lang = langDataIds.find((obj) => obj.languageCode === code);

      const obj = {
        id: lang.id,
        name: data["name-" + code] ?? "",
      };

      if (languages[i].default) {
        defaultData.name = data["name-" + code] ?? "";
      }

      namesArr.push(obj);
    }

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;

      for (let j = 0; j < features.length; j++) {
        const id = features[j].id;
        const mongoId = features[j].mongoId;

        if (mongoId && updatedIdsRef.current.has(mongoId)) {
          valuesArr.push({
            id: langDataValueIds[mongoId].find((a) => a.code === code).id,
            name: data[`feature${id}-` + code] ?? "",
          });

          if (languages[i].default) {
            defaultDataValues.push({
              id: mongoId,
              name: data[`feature${id}-` + code] ?? "",
            });
          }
        }
        // else {
        //   newValuesArr.push({
        //     name: data[`feature${id}-` + code] ?? "",
        //     code,
        //   });

        //   if (languages[i].default) {
        //     defaultDataNewValues.push({
        //       name: data[`feature${id}-` + code] ?? "",
        //     });
        //   }
        // }
      }
    }

    for (let j = 0; j < features.length; j++) {
      const id = features[j].id;
      const mongoId = features[j].mongoId;

      let name;
      const values = {};

      if (!mongoId) {
        for (let i = 0; i < languages.length; i++) {
          const code = languages[i].code;

          values[code] = data[`feature${id}-` + code] ?? "";

          if (languages[i].default) {
            name = data[`feature${id}-` + code] ?? "";
          }
        }
        newValuesArr.push({ name, values });
      }
    }

    request("PUT", "sub-specification-groups", {
      ...defaultData,
      namesArr,
      defaultDataValues,
      valuesArr,
      newValuesArr,
      deleteIds,
    });
  };

  const onSubmitOld = (data) => {
    const dataToSend = [];

    const defaultData = {
      //  data["category"]
      // specificationId: recordId,
    };

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;

      const lang = langDataIds.find((obj) => {
        if (obj.languageCode == code) {
          return obj.id;
        }
      });

      dataToSend.push({
        name: data["name-" + code] ?? "",
        id: lang && lang.id ? lang.id : "",
        code,
      });

      if (languages[i].default) {
        defaultData.name = data["name-" + code];
      }
    }
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
    request("PUT", "sub-specification-groups", {
      // specificationId: sid,
      id: recordId,
      ...defaultData,
      data: dataToSend,
      values: featuresObj,
    });
  };

  const addFeatures = () => {
    setFeatures((prev) => [...prev, { id: nextId }]);
    setNextId((prev) => prev + 1);
  };

  const deleteFeatureHandler = (id) => {
    const feature = features.find((f) => f.id === id);

    if (feature.mongoId) {
      setDeleteIds((prev) => [...prev, feature.mongoId]);
    }

    const newFeatures = [...features].filter((f) => f.id !== id);
    setFeatures(newFeatures);

    // unregister(`featuresName${id}`);

    languages.forEach((lang) => {
      unregister(`feature${id}-${lang.code}`);
    });
    // unregister(`featureAvailable${id}`);
  };

  const CommonFields = [[]];

  const InputFields = [[]];

  const updatedIdsHandler = (id) => {
    updatedIdsRef.current.add(id);
  };

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Edit Sub Specification"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: {
              pathname: `/specification-groups/sub-specification-groups/${sid}` /*backPageNum: page */,
            },
            name: "Back To Specification Groups",
          },
        ]}
      />
      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom">
            <div class="card-header">
              <h3 class="card-title">Edit Sub Specification</h3>
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

                    <RenderInputFields
                      InputFields={CommonFields}
                      errors={errors}
                      register={register}
                    />

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

                                  <List
                                    height={1000}
                                    itemCount={features.length}
                                    itemSize={150}
                                  >
                                    {({ index, style }) => (
                                      <div style={style}>
                                        {" "}
                                        <Fragment key={features[index].id}>
                                          <div className="card-header card-header-tabs-line pl-0 pr-0 pt-2">
                                            <div className="card-toolbar">
                                              <ul
                                                className="nav nav-tabs nav-tabs-space-lg nav-tabs-line nav-bold nav-tabs-line-3x"
                                                role="tablist"
                                              >
                                                {languages.length > 0 &&
                                                  languages.map((lang, idx) => (
                                                    <SubTabForm
                                                      key={idx}
                                                      name={lang.name}
                                                      index={idx}
                                                      tabName={
                                                        idx +
                                                        "_" +
                                                        features[index].id
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
                                                  languages.map((lang, idx) => (
                                                    <SubInputForm
                                                      key={idx}
                                                      index={idx}
                                                      errors={errors}
                                                      register={register}
                                                      required={lang.required}
                                                      InputFields={[
                                                        [
                                                          {
                                                            Component:
                                                              MutliInput,
                                                            type: "text",
                                                            label:
                                                              "Sub Specification",
                                                            name: `feature${features[index].id}`,
                                                            placeholder: `Enter Sub Specification Value (${lang.name})`,
                                                            onChange: () =>
                                                              features[index]
                                                                .mongoId &&
                                                              updatedIdsHandler(
                                                                features[index]
                                                                  .mongoId
                                                              ),
                                                          },
                                                          {
                                                            Component:
                                                              ButtonComp,
                                                            show: index !== 0,
                                                            children: (
                                                              <i class="fas fa-trash-alt"></i>
                                                            ),
                                                            onClick: () =>
                                                              deleteFeatureHandler(
                                                                features[index]
                                                                  .id
                                                              ),
                                                            classes:
                                                              "btn btn-bg-danger ml-2",
                                                          },
                                                        ],
                                                      ]}
                                                      code={lang.code}
                                                      tabName={
                                                        idx +
                                                        "_" +
                                                        features[index].id
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
                                      </div>
                                    )}
                                  </List>

                                  {false &&
                                    features.length > 0 &&
                                    features.map((feature, fIndex) => (
                                      <Fragment key={feature.id}>
                                        <div className="card-header card-header-tabs-line pl-0 pr-0 pt-2">
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

                    <SubmitButton
                      handleSubmit={handleSubmit}
                      onSubmit={onSubmit}
                      name="Update"
                      pxClass="px-10"
                    />
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Edit;
