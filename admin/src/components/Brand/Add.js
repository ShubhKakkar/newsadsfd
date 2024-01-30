import React, { useEffect } from "react";
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

// import { debounce } from "../../util/fn";
// import useRequestTwo from "../../hooks/useRequestTwo";
import { createSlug } from "../../util/fn";

const Add = ({ isAnotherComponent, setModelOpen, setBrands }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    getValues,
    trigger,
    clearErrors,
    watch,
  } = useForm();

  const { languages } = useSelector((state) => state.setting);

  // const names = watch(languages.map((lang) => `name-${lang.code}`));

  // const languages = [];

  // const [subCategories, setSubCategories] = useState([]);
  // const [selectedSubCategories, setSelectedSubCategories] = useState([]);

  const { response, request } = useRequest();
  // const { response: responseSubCategories, request: requestSubCategories } =
  // useRequest();

  // const { request: requestPromiseBrand } = useRequestTwo();

  const history = useHistory();

  useEffect(() => {
    if (!isAnotherComponent) {
      document.title = "Add Brand - Noonmar";
    }
    // requestSubCategories("GET", "brand/sub-categories");
  }, []);

  // useEffect(() => {
  //   if (names) {
  //     languages.forEach((lang, idx) => {
  //       setValue(`slug-${lang.code}`, names[idx] ? createSlug(names[idx]) : "");
  //     });
  //   }
  // }, [names]);

  // useEffect(() => {
  //   if (responseSubCategories) {
  //     setSubCategories(
  //       responseSubCategories.data.map((sc) => ({
  //         value: sc._id,
  //         label: sc.name,
  //       }))
  //     );
  //   }
  // }, [responseSubCategories]);

  useEffect(() => {
    if (response) {
      toast.success("Brand has been added successfully.");
      history.push("/brands");
    }
  }, [response]);

  const onSubmit = (data) => {
    const dataToSend = [];
    const checkData = {
      label: "",
      value: "",
      langData: [],
    };

    let name;

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;

      dataToSend.push({
        languageCode: code,
        name: data["name-" + code] ?? "",
        slug: data["slug-" + code] ?? "",
      });

      if (languages[i].default) {
        name = data["name-" + code];
        checkData.label = name;
        checkData.value = name;
      }

      checkData.langData.push({
        languageCode: code,
        value: data["name-" + code] ?? "",
        slug: data["slug-" + code] ?? "",
      });
    }

    if (isAnotherComponent) {
      setModelOpen(false);
      setBrands(checkData);
    } else {
      request("POST", "brand", {
        name,
        subData: dataToSend,
      });
    }
  };

  // const InputFields = [[]];

  return (
    <div
      className={`${
        isAnotherComponent ? "" : "content"
      } d-flex flex-column flex-column-fluid`}
      id="kt_content"
    >
      {!isAnotherComponent && (
        <Breadcrumb
          title="Add Brand"
          links={[
            { to: "/", name: "Dashboard" },
            { to: "/brands", name: "Back To Brands" },
          ]}
        />
      )}

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom">
            {!isAnotherComponent && (
              <div class="card-header">
                <h3 class="card-title">Add New Brand</h3>
              </div>
            )}
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
                                      colClass: isAnotherComponent ? " " : null,
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
                                      colClass: isAnotherComponent ? " " : null,
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
              <h3 class="card-title">Add New Brand</h3>
              
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

export default Add;
