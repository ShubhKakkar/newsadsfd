import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { API } from "../../constant/api";
// import { SubTab, SubInput } from "./TabNInput";
// import { DevTool } from "@hookform/devtools";
import { useSelector } from "react-redux";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { Input, RenderMultiLangInputFields, SubmitButton } from "../Form/Form";

const SubTab = ({ name, index, image }) => {
  return (
    <li className={`nav-item ${index > 0 ? "mr-3" : ""}`}>
      <a
        className={`nav-link ${index === 0 ? "active" : ""}`}
        data-toggle="tab"
        href={`#kt_apps_contacts_view_tab_${index}`}
      >
        <>
          {false && image && (
            <span className="symbol symbol-20 mr-3">
              <img src={`${API.PORT}/${image}`} alt="" />
            </span>
          )}
          <span className="nav-text">{name}</span>
        </>
      </a>
    </li>
  );
};

const SubInput = ({ index, errors, register, required, InputFields, code }) => {
  return (
    <div
      className={`tab-pane ${index === 0 ? "active" : ""}`}
      id={`kt_apps_contacts_view_tab_${index}`}
      role="tabpanel"
    >
      <RenderMultiLangInputFields
        InputFields={InputFields}
        errors={errors}
        register={register}
        required={required}
        code={code}
      />

      <div className="row"></div>
    </div>
  );
};

const numObj = {
  0: "imageOne",
  1: "imageTwo",
  2: "imageThree",
};

const Add = () => {
  const [langDataIds, setLangDataIds] = useState({});
  const [images, setImages] = useState(null);
  const [dataId, setDataId] = useState(null);

  const { languages } = useSelector((state) => state.setting);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  const { response, request } = useRequest();

  const { response: responseGetSection, request: requestGetSection } =
    useRequest();

  useEffect(() => {
    requestGetSection("GET", "master/home/section-one");

    // const imagesObj = {};
    // languages.forEach((lang) => {
    //   imagesObj[lang.code] = {
    //     imageOne: null,
    //     imageTwo: null,
    //     imageThree: null,
    //   };
    // });
    // setImages(imagesObj);
    document.title = "Section 1 - Noonmar";
  }, []);

  useEffect(() => {
    if (responseGetSection) {
      const { linkOne, linkTwo, linkThree, langData, _id } =
        responseGetSection.getHomeSectionOne;
      setValue("linkOne", linkOne);
      setValue("linkTwo", linkTwo);
      setValue("linkThree", linkThree);

      if (_id) {
        setDataId(_id);
      }

      // const subData = {};
      const langDataIdsObj = {};
      const newImages = {};

      langData.forEach((lang) => {
        const code = lang.languageCode;
        // setLangDataIds((prev) => {
        //   return { ...prev, [code]: lang.id };
        // });
        newImages[lang.languageCode] = {
          imageOne: lang.imageOne,
          imageTwo: lang.imageTwo,
          imageThree: lang.imageThree,
        };

        langDataIdsObj[code] = lang.id;
      });
      setImages(newImages);

      setLangDataIds(langDataIdsObj);
    }
  }, [responseGetSection]);

  //   const history = useHistory();

  useEffect(() => {
    if (response) {
      toast.success(response.message);
      requestGetSection("GET", "master/home/section-one");
    }
  }, [response]);

  const onSubmitNew = (data) => {
    const { linkOne, linkTwo, linkThree } = data;

    //data = imageOne, linkOne, imageTwo, linkTwo, imageThree linkThree
    //subData = languageCode, imageOne, imageTwo, imageThree

    const dataToSend = [];
    const formData = new FormData();

    const fileIndexes = {};

    let index = 0;

    const defaultData = {
      linkOne,
      linkTwo,
      linkThree,
    };

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;

      let updates = {};

      if (data[`imageOne-${code}`][0]) {
        formData.append("image", data[`imageOne-${code}`][0]);
        fileIndexes[index] = `imageOne-${code}`;
        index++;
      }

      if (data[`imageTwo-${code}`][0]) {
        formData.append("image", data[`imageTwo-${code}`][0]);
        fileIndexes[index] = `imageTwo-${code}`;
        index++;
      }

      if (data[`imageThree-${code}`][0]) {
        formData.append("image", data[`imageThree-${code}`][0]);
        fileIndexes[index] = `imageThree-${code}`;
        index++;
      }

      if (langDataIds[code]) {
        updates.id = langDataIds[code];
        updates.languageCode = code;
      } else {
        updates.languageCode = code;
      }

      dataToSend.push(updates);
    }

    formData.append("subData", JSON.stringify(dataToSend));
    formData.append("data", JSON.stringify(defaultData));
    formData.append("fileIndexes", JSON.stringify(fileIndexes));

    if (dataId) {
      formData.append("id", dataId);
    }

    // for (let [key, value] of formData) {
    //   console.log(`${key}: ${value}`);
    // }
    request("POST", "master/home/section-one", formData);
  };

  const onSubmit = (data) => {
    const { linkOne, linkTwo, linkThree } = data;

    //data = imageOne, linkOne, imageTwo, linkTwo, imageThree linkThree
    //subData = languageCode, imageOne, imageTwo, imageThree

    const dataToSend = [];
    const formData = new FormData();

    const fileIndexes = {
      0: "imageOne-en",
      1: "imageTwo-en",
      2: "imageThree-en",
    };

    let index = 3;

    formData.append("image", data["imageOne-en"][0]);
    formData.append("image", data["imageTwo-en"][0]);
    formData.append("image", data["imageThree-en"][0]);

    const defaultData = {
      linkOne,
      linkTwo,
      linkThree,
    };

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;

      let updates = {};

      if (!languages[i].default) {
        if (data[`imageOne-${code}`][0]) {
          formData.append("image", data[`imageOne-${code}`][0]);
          fileIndexes[index] = `imageOne-${code}`;
          index++;
        }

        if (data[`imageTwo-${code}`][0]) {
          formData.append("image", data[`imageTwo-${code}`][0]);
          fileIndexes[index] = `imageTwo-${code}`;
          index++;
        }

        if (data[`imageThree-${code}`][0]) {
          formData.append("image", data[`imageThree-${code}`][0]);
          fileIndexes[index] = `imageThree-${code}`;
          index++;
        }
      }

      if (langDataIds[code]) {
        updates.id = langDataIds[code];
      } else {
        updates.languageCode = code;
      }

      dataToSend.push({
        // languageCode: code,
        ...updates,
        // title: data["title-" + code] ?? "",
        // buttonName: data["buttonName-" + code] ?? "",
      });

      // if (languages[i].default) {
      //   defaultData.title = data["title-" + code];
      //   defaultData.buttonName = data["buttonName-" + code];
      // }
    }

    formData.append("subData", JSON.stringify(dataToSend));
    formData.append("data", JSON.stringify(defaultData));
    formData.append("fileIndexes", JSON.stringify(fileIndexes));

    request("POST", "master/home/section-one", formData);
  };

  const COMMON = [
    {
      Component: Input,
      label: "Link One",
      name: "linkOne",
      registerFields: {
        required: true,
      },
      type: "text",
    },
    {
      Component: Input,
      label: "Link Two",
      name: "linkTwo",
      registerFields: {
        required: true,
      },
      type: "text",
    },
    {
      Component: Input,
      label: "Link Three",
      name: "linkThree",
      registerFields: {
        required: true,
      },
      type: "text",
    },
  ];

  const InputFields = [
    {
      Component: Input,
      label: "Image One",
      type: "file",
      name: "imageOne",
      inputData: {
        accept: "image/*",
      },
      registerFields: {
        required: true,
      },
      tooltip: {
        show: true,
        title: `Required resolution is 1.42:1 (Width:Height)`,
      },
    },
    {
      Component: Input,
      label: "Image Two",
      type: "file",
      inputData: {
        accept: "image/*",
      },
      name: "imageTwo",
      registerFields: {
        required: true,
      },
      tooltip: {
        show: true,
        title: `Required resolution is 1.42:1 (Width:Height)`,
      },
    },
    {
      Component: Input,
      label: "Image Three",
      type: "file",
      inputData: {
        accept: "image/*",
      },
      name: "imageThree",
      registerFields: {
        required: true,
      },
      tooltip: {
        show: true,
        title: `Required resolution is 1:1.58 (Width:Height)`,
      },
    },
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Section 1"
        links={[
          { to: "/", name: "Dashboard" },
          //   { to: "/section-2", name: "Section 2" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <form onSubmit={handleSubmit(onSubmitNew)}>
            <div className="card card-custom gutter-b">
              <div className="card-body">
                <div className="row">
                  {COMMON.map((Input, index) => (
                    <Input.Component
                      key={index}
                      {...Input}
                      errors={errors}
                      register={register}
                      setValue={setValue}
                    />
                  ))}
                </div>
              </div>
            </div>

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
                      <>
                        <SubInput
                          key={index}
                          index={index}
                          errors={errors}
                          register={register}
                          // required={lang.default}
                          required={false}
                          InputFields={[
                            InputFields.map((ip, idx) => ({
                              ...ip,
                              children: images?.[lang.code][numObj[idx]] && (
                                <img
                                  src={`${API.PORT}/${
                                    images?.[lang.code][numObj[idx]]
                                  }`}
                                  width={100}
                                  height={100}
                                  alt=""
                                  style={{ cursor: "pointer" }}
                                  data-fancybox
                                />
                              ),
                            })),
                          ]}
                          code={lang.code}
                        />
                      </>
                    ))}
                </div>
                <button
                  onClick={handleSubmit(onSubmitNew)}
                  style={{ display: "none" }}
                ></button>

                <SubmitButton
                  handleSubmit={handleSubmit}
                  onSubmit={onSubmitNew}
                  name="Update"
                  pxClass="px-10"
                />

                <div className="row"></div>
              </div>
            </div>
          </form>
        </div>
      </div>
      {/* <DevTool control={control} /> */}
    </div>
  );
};

export default Add;
