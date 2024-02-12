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

const Edit = (props) => {
  const { id } = props.match.params;

  const [langDataIds, setLangDataIds] = useState({});
  const [images, setImages] = useState(null);

  const { languages } = useSelector((state) => state.setting);
  const history = useHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  const { response: responseGetSection, request: requestGetSection } =
    useRequest();

  const { response, request } = useRequest();

  useEffect(() => {
    requestGetSection("GET", `master/home/section-two/${id}`);

    document.title = "Section 2 (Edit) - Noonmar";
  }, []);

  useEffect(() => {
    if (responseGetSection) {
      console.log("responseGetSection:::", responseGetSection);
      const { sectionData } = responseGetSection;

      if (!sectionData) {
        history.push("/section-two");
        return;
      }
      const { langData, link, colorPicker } = sectionData;

      //   setValue("link", link);

      const langDataIdsObj = {};
      const newImages = {};
      const resetObj = { link, colorPicker };

      langData.forEach((lang) => {
        const code = lang.languageCode;
        newImages[code] = lang.image;

        resetObj[`title-${code}`] = lang.title;
        resetObj[`heading-${code}`] = lang.heading;
        resetObj[`description-${code}`] = lang.description;
        resetObj[`buttonName-${code}`] = lang.buttonName;

        langDataIdsObj[code] = lang._id;
      });

      setImages(newImages);

      setLangDataIds(langDataIdsObj);
      reset(resetObj);
    }
  }, [responseGetSection]);

  useEffect(() => {
    if (response) {
      toast.success(response.message);
      history.push("/section-two");
    }
  }, [response]);

  const onSubmitNew = (data) => {
    const formData = new FormData();

    const fileIndexes = {};

    const subData = [];

    let index = 0;

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;

      let updates = {
        title: data[`title-${code}`],
        heading: data[`heading-${code}`],
        description: data[`description-${code}`],
        buttonName: data[`buttonName-${code}`],
      };

      if (data[`image-${code}`][0]) {
        formData.append("image", data[`image-${code}`][0]);
        fileIndexes[index] = `image-${code}`;
        index++;
      }

      updates.id = langDataIds[code];
      updates.languageCode = code;

      subData.push(updates);
    }

    formData.append("fileIndexes", JSON.stringify(fileIndexes));
    formData.append("subData", JSON.stringify(subData));
    formData.append("id", id);
    formData.append("link", data.link);
    formData.append("colorPicker", data.colorPicker);

    request("PUT", "master/home/section-two", formData);
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
      name: "colorPicker",
      registerFields: {
        required: true,
      },
      type: "color",
    },
  ];

  const InputFields = [
    {
      Component: Input,
      label: "Title",
      name: "title",
      registerFields: {
        required: true,
      },
      type: "text",
    },
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
      label: "Description",
      name: "description",
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
    // {
    //   Component: Input,
    //   label: "Image",
    //   type: "file",
    //   name: "image",
    //   inputData: {
    //     accept: "image/*",
    //   },
    //   registerFields: {
    //     required: true,
    //   },
    // },
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Section 2 (Slider - Edit)"
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
                          required={false}
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
                                tooltip: {
                                  show: true,
                                  title: `Required resolution is 1.62:1 (Width:Height)`,
                                },
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

export default Edit;
