import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
// import { SubTab, SubInput } from "./TabNInput";
// import { DevTool } from "@hookform/devtools";
import { useSelector } from "react-redux";

import { API } from "../../../constant/api";
import useRequest from "../../../hooks/useRequest";
import Breadcrumb from "../../Breadcrumb/Breadcrumb";
import {
  Input,
  RenderMultiLangInputFields,
  SubmitButton,
} from "../../Form/Form";

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
    requestGetSection("GET", "master/home/section-four");
    document.title = "Section 4 - Noonmar";
  }, []);

  useEffect(() => {
    if (responseGetSection) {
      if (!responseGetSection?.sectionData) {
        return;
      }

      const { link, backgroundColor, langData, _id } =
        responseGetSection.sectionData;

      if (_id) {
        setDataId(_id);
      } else {
        return;
      }

      const subData = { link, backgroundColor };

      const langDataIdsObj = {};
      const newImages = {};

      langData.forEach((lang) => {
        const code = lang.languageCode;

        newImages[code] = lang.image;

        langDataIdsObj[code] = lang._id;

        subData[`heading-${code}`] = lang.heading;
        subData[`buttonName-${code}`] = lang.buttonName;
      });

      setImages(newImages);

      setLangDataIds(langDataIdsObj);
      reset(subData);
    }
  }, [responseGetSection]);

  //   const history = useHistory();

  useEffect(() => {
    if (response) {
      toast.success(response.message);
      requestGetSection("GET", "master/home/section-four");
    }
  }, [response]);

  const onSubmitNew = (data) => {
    const { link, backgroundColor } = data;

    //data = imageOne, linkOne, imageTwo, linkTwo, imageThree linkThree
    //subData = languageCode, imageOne, imageTwo, imageThree

    const dataToSend = [];
    const formData = new FormData();

    const fileIndexes = {};

    let index = 0;

    let defaultData = {
      link,
      backgroundColor,
    };

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;

      let updates = {
        heading: data[`heading-${code}`],
        buttonName: data[`buttonName-${code}`],
      };

      if (data[`image-${code}`][0]) {
        formData.append("image", data[`image-${code}`][0]);
        fileIndexes[index] = `image-${code}`;
        index++;
      }

      if (languages[i].default) {
        defaultData = { ...defaultData, ...updates };
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

    request("POST", "master/home/section-four", formData);
  };

  const COMMON = [
    {
      Component: Input,
      label: "Link",
      name: "link",
      registerFields: {
        required: true,
      },
      type: "text",
    },
    {
      Component: Input,
      label: "Background Color",
      name: "backgroundColor",
      registerFields: {
        required: true,
      },
      type: "color",
    },
  ];

  const InputFields = [
    {
      Component: Input,
      label: "Heading",
      name: "heading",
      registerFields: {
        required: true,
      },
      type: "text",
    },
    {
      Component: Input,
      label: "Button Name",
      name: "buttonName",
      registerFields: {
        required: true,
      },
      type: "text",
    },
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Section 4"
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
                          //   required={lang.default}
                          required={dataId ? false : lang.required}
                          InputFields={[
                            [
                              ...InputFields,
                              {
                                Component: Input,
                                label: "Image",
                                type: "file",
                                name: "image",
                                inputData: {
                                  accept: "image/*",
                                },
                                registerFields: {
                                  required: true,
                                },
                                tooltip: {
                                  show: true,
                                  title: `Required resolution is 1.04:1 (Width:Height)`,
                                },
                                children: images?.[lang.code] && (
                                  <img
                                    src={`${API.PORT}/${images?.[lang.code]}`}
                                    width={100}
                                    height={100}
                                    alt=""
                                    style={{ cursor: "pointer" }}
                                    data-fancybox
                                  />
                                ),
                              },
                            ],
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
