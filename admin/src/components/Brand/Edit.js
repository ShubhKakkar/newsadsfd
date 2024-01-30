import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import {
  Input,
  // RenderInputFields,
  SubmitButton,
  // AsyncReactSelectInput,
  SubTab,
  SubInput,
} from "../Form/Form";
// import { SubTab, SubInput } from "../LanguageForm/LanguageForm";

// import { debounce } from "../../util/fn";
// import useRequestTwo from "../../hooks/useRequestTwo";
import { createSlug } from "../../util/fn";

const Edit = (props) => {
  const { id: brandId } = props.match.params;

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    trigger,
    reset,
    clearErrors,
    control,
    setValue,
  } = useForm();

  const { languages } = useSelector((state) => state.setting);

  // const [subCategories, setSubCategories] = useState([]);
  // const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [langDataIds, setLangDataIds] = useState([]);
  const { response, request } = useRequest();
  const { response: responseGetOne, request: requestGetOne } = useRequest();

  // const { request: requestPromiseCategories } = useRequestTwo();

  const history = useHistory();

  useEffect(() => {
    if (brandId) {
      document.title = "Edit Brand - Noonmar";
    }
    // requestGetOne("GET", `brand/${id}`);
  }, [brandId]);

  useEffect(() => {
    if (languages) {
      requestGetOne("GET", `brand/${brandId}`);
    }
  }, [languages]);

  // useEffect(() => {
  //   if (responseGetOne) {
  //     const { name=[] } = responseGetOne.brand;
  //     reset({ name });
  //   }
  // }, [responseGetOne]);

  useEffect(() => {
    if (responseGetOne) {
      const {
        data: { name = [] },
        languageData,
      } = responseGetOne.brand;

      // const { variants } = responseGetOne;

      const subData = {};

      setLangDataIds(languageData);
      languageData.forEach((lang) => {
        const code = lang.languageCode;
        subData["name-" + code] = lang.name;
        subData["slug-" + code] = lang.slug;
      });

      reset({ name, ...subData });
    }
  }, [responseGetOne]);

  useEffect(() => {
    if (response) {
      toast.success("Brand has been updated successfully.");
      history.push("/brands");
    }
  }, [response]);

  const onSubmit = (data) => {
    // const { name } = data;

    const dataToSend = [];
    let name;

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;

      const lang = langDataIds.find((obj) => {
        if (obj.languageCode == code) {
          return obj.id;
        }
      });

      dataToSend.push({
        languageCode: code,
        name: data["name-" + code] ?? "",
        id: lang && lang.id ? lang.id : "",
        slug: data["slug-" + code] ?? "",
      });

      if (languages[i].default) {
        name = data["name-" + code];
      }
    }

    request("PUT", "brand", { name, id: brandId, data: dataToSend });
  };

  // const onSubmit = (data) => {
  //   // const { name } = data;

  //   const dataToSend = [];
  //   let name;

  //   for (let i = 0; i < languages.length; i++) {
  //     const code = languages[i].code;

  //     dataToSend.push({
  //       languageCode: code,
  //       name: data["name-" + code] ?? "",
  //     });

  //     if (languages[i].default) {
  //       name = data["name-" + code];
  //     }
  //   }

  //   request("PUT", "brand", { name, id });
  // };

  // const categoryChangeHandler = (e) => {
  //   setSelectedSubCategories(e);
  //   setValue("subCategories", e);
  // };

  // const loadOptionsDebounced = useCallback(
  //   debounce(async (inputValue, callback) => {
  //     const response = await requestPromiseCategories(
  //       "GET",
  //       `brand/sub-categories?name=${inputValue}`
  //     );
  //     callback(
  //       response.data.data.map((sc) => ({ value: sc._id, label: sc.name }))
  //     );
  //   }, 500),
  //   []
  // );

  // const InputFields = [
  //   [
  //     {
  //       Component: Input,
  //       label: "Brand Name",
  //       type: "text",
  //       name: "name",
  //       registerFields: {
  //         required: true,
  // pattern: /^[A-Za-z ]+$/,
  // },
  // registerFieldsFeedback: {
  //   pattern: "Brand Name can only contain letters.",
  // },
  // },

  // {
  //   Component: AsyncReactSelectInput,
  //   label: "Sub Categories",
  //   name: "subCategories",
  //   registerFields: {
  //     required: true,
  //   },
  //   control,
  //   promiseOptions: loadOptionsDebounced,
  //   handleChange: categoryChangeHandler,
  //   selectedOption: selectedSubCategories,
  //   defaultOptions: subCategories,
  //   isMultiple: true,
  // },
  //   ],
  // ];
  const InputFields = [[]];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Edit Brand"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/brands", name: "Back To Brands" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom">
            <div class="card-header">
              <h3 class="card-title">Edit Brand</h3>
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
                                code={lang.code}
                                tabName={`language_${index}`}
                                InputFields={[
                                  [
                                    {
                                      Component: Input,
                                      label: "Name",
                                      type: "text",
                                      name: "name",
                                      isRequired: true,
                                      registerFields: {
                                        onBlur: (e) => {
                                          setValue(
                                            `slug-${lang.code}`,
                                            createSlug(e.target.value)
                                          );
                                        },
                                      },
                                    },
                                    {
                                      Component: Input,
                                      label: "Link",
                                      type: "text",
                                      name: "slug",
                                      isRequired: true,
                                    },
                                  ],
                                ]}
                              />
                            ))}
                        </div>
                      </div>
                    </div>
                    {/* <RenderInputFields
                      InputFields={InputFields}
                      errors={errors}
                      register={register}
                    /> */}

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

      {/* <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Edit Brand</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-xl-12">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <RenderInputFields
                      InputFields={InputFields}
                      errors={errors}
                      register={register}
                    />

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
      </div> */}
    </div>
  );
};

export default Edit;
