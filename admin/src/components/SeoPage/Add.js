import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import { API } from "../../constant/api";
import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { Input, SubmitButton, Textarea } from "../Form/Form";

const SubTab = ({ name, index, image }) => {
  return (
    <li className={`nav-item ${index > 0 ? "mr-3" : ""}`}>
      <a
        className={`nav-link ${index === 0 ? "active" : ""}`}
        data-toggle="tab"
        href={`#kt_apps_contacts_view_tab_${index}`}
      >
        <>
          {/* {image && (
            <span className="symbol symbol-20 mr-3">
              <img src={`${API.PORT}/${image}`} alt="" />
            </span>
          )} */}
          <span className="nav-text">{name}</span>
        </>
      </a>
    </li>
  );
};

const SubInput = ({ index, errors, register, langCode }) => {
  return (
    <div
      className={`tab-pane ${index === 0 ? "active" : ""}`}
      id={`kt_apps_contacts_view_tab_${index}`}
      role="tabpanel"
    >
      <div className="row">
        <Input
          label="Page Name"
          type="text"
          placeholder="Enter the text here"
          name={"pageName-" + langCode}
          errors={errors}
          register={register}
          registerFields={{ required: langCode === "en" ? true : false }}
        />
        <Input
          label="Title"
          type="text"
          placeholder="Enter the text here"
          name={"pageTitle-" + langCode}
          errors={errors}
          register={register}
          registerFields={{ required: langCode === "en" ? true : false }}
        />
        <Textarea
          label="Meta Description"
          type="text"
          placeholder="Enter the text here"
          name={"metaDescription-" + langCode}
          errors={errors}
          register={register}
          registerFields={{ required: false }}
        />
        <Textarea
          label="Meta Keywords"
          type="text"
          placeholder="Enter the text here"
          name={"metaKeywords-" + langCode}
          errors={errors}
          register={register}
          registerFields={{ required: false }}
        />
        <Input
          label="Meta Author"
          type="text"
          placeholder="Enter the text here"
          name={"metaAuthor-" + langCode}
          errors={errors}
          register={register}
          registerFields={{ required: false }}
        />
        <Textarea
          label="Twitter Card"
          type="text"
          placeholder="Enter the text here"
          name={"twitterCard-" + langCode}
          errors={errors}
          register={register}
          registerFields={{ required: false }}
        />
        <Textarea
          label="Og Title"
          type="text"
          placeholder="Enter the text here"
          name={"ogTitle-" + langCode}
          errors={errors}
          register={register}
          registerFields={{ required: false }}
        />
        <Textarea
          label="Og Description"
          type="text"
          placeholder="Enter the text here"
          name={"ogDescription-" + langCode}
          errors={errors}
          register={register}
          registerFields={{ required: false }}
        />
        <Input
          label="Og Tag"
          type="text"
          placeholder="Enter the text here"
          name={"ogTag-" + langCode}
          errors={errors}
          register={register}
          registerFields={{ required: false }}
        />
        <Input
          label="Og Alt Tag for Image"
          type="text"
          placeholder="Enter the text here"
          name={"ogAltTag-" + langCode}
          errors={errors}
          register={register}
          registerFields={{ required: false }}
        />
      </div>

      <div className="row"></div>
    </div>
  );
};

const Add = () => {
  const { languages } = useSelector((state) => state.setting);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    trigger,
    clearErrors,
    formState: { errors },
  } = useForm();

  const history = useHistory();

  const { response, request } = useRequest();

  useEffect(() => {
    document.title = "Add Seo Page - Noonmar";
  }, []);

  useEffect(() => {
    if (response) {
      toast.success("Seo Page has been added successfully.");
      history.push("/seo-pages");
    }
  }, [response]);

  const onSubmit = (data) => {

    const { pageId, seoTitle, twitterSite, ogUrl, ogType } = data;

    const dataToSend = [];

    const defaultData = {
      pageId,
      seoTitle,
      twitterSite,
      ogUrl,
      ogType,
    };

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;
      dataToSend.push({
        languageCode: code,
        pageName: data["pageName-" + code] ?? "",
        pageTitle: data["pageTitle-" + code] ?? "",
        metaDescription: data["metaDescription-" + code] ?? "",
        metaAuthor: data["metaAuthor-" + code] ?? "",
        metaKeywords: data["metaKeywords-" + code] ?? "",
        twitterCard: data["twitterCard-" + code] ?? "",
        ogTitle: data["ogTitle-" + code] ?? "",
        ogDescription: data["ogDescription-" + code] ?? "",
        ogTag: data["ogTag-" + code] ?? "",
        ogAltTag: data["ogAltTag-" + code] ?? "",
      });

      if (languages[i].default) {
        defaultData.pageName = data["pageName-" + code] ?? "";
        defaultData.pageTitle = data["pageTitle-" + code] ?? "";
        defaultData.metaDescription = data["metaDescription-" + code] ?? "";
        defaultData.metaAuthor = data["metaAuthor-" + code] ?? "";
        defaultData.metaKeywords = data["metaKeywords-" + code] ?? "";
        defaultData.twitterCard = data["twitterCard-" + code] ?? "";
        defaultData.ogTitle = data["ogTitle-" + code] ?? "";
        defaultData.ogDescription = data["ogDescription-" + code] ?? "";
        defaultData.ogTag = data["ogTag-" + code] ?? "";
        defaultData.ogAltTag = data["ogAltTag-" + code] ?? "";
      }
    }

    const formData = new FormData();

    if (data.ogImage && data.ogImage[0]) {
      formData.append("ogImage", data.ogImage[0]);
    }

    formData.append(
      "data",
      JSON.stringify({ subData: dataToSend, ...defaultData })
    );


    request("POST", "seo-page", formData);
  };

  const InputFields = [
    {
      Component: Input,
      label: "Page ID",
      name: "pageId",
      type: "text",
      registerFields: {
        required: true,
      },
    },
    // {
    //   Component: Input,
    //   label: "Page Name",
    //   name: "pageName",
    //   type: "text",
    //   registerFields: {
    //     required: true,
    //   },
    // },
    // {
    //   Component: Input,
    //   label: "Title",
    //   name: "pageTitle",
    //   type: "text",
    //   registerFields: {
    //     required: true,
    //   },
    // },
    // {
    //   Component: Textarea,
    //   label: "Meta Description",
    //   name: "metaDescription",
    //   registerFields: {
    //     // required: true,
    //   },
    // },
    // {
    //   Component: Textarea,
    //   label: "Meta Keywords",
    //   name: "metaKeywords",
    //   registerFields: {
    //     // required: true,
    //   },
    // },
    // {
    //   Component: Textarea,
    //   label: "Twitter Card",
    //   name: "twitterCard",
    //   registerFields: {
    //     // required: true,
    //   },
    // },
    {
      Component: Textarea,
      label: "Twitter Site",
      name: "twitterSite",
      registerFields: {
        // required: true,
      },
    },
    {
      Component: Textarea,
      label: "Og Url",
      name: "ogUrl",
      registerFields: {
        // required: true,
      },
    },
    {
      Component: Textarea,
      label: "Og Type",
      name: "ogType",
      registerFields: {
        // required: true,
      },
    },
    // {
    //   Component: Textarea,
    //   label: "Og Title",
    //   name: "ogTitle",
    //   registerFields: {
    //     // required: true,
    //   },
    // },
    // {
    //   Component: Textarea,
    //   label: "Og Description",
    //   name: "ogDescription",
    //   registerFields: {
    //     // required: true,
    //   },
    // },
    {
      Component: Input,
      label: "Og Image",
      name: "ogImage",
      registerFields: {
        // required: true,
      },
      type: "file",
      inputData: {
        accept: "image/*",
      },
    },
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Add Seo Page"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/seo-pages", name: "Back To Seo Pages" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="card card-custom gutter-b">
              <div className="card-body">
                <div className="row">
                  {InputFields.map((Input, index) => (
                    <Input.Component
                      key={index}
                      {...Input}
                      errors={errors}
                      register={register}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* edited-------------- */}
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
              <div className="card-body px-0">
                <div className="tab-content">
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
                        langCode={lang.code}
                        // testType={testType}
                        required={lang.required}
                        titleName={"title-" + lang.code}
                        questionName={"question-" + lang.code}
                        clearErrors={clearErrors}
                        isEdit={false}
                        labels={["Title", "Question (Text)"]}
                      />
                    ))}
                </div>
              </div>
              {/* edited-------------- */}

              <button
                onClick={handleSubmit(onSubmit)}
                style={{ display: "none" }}
              ></button>

              <SubmitButton
                handleSubmit={handleSubmit}
                onSubmit={onSubmit}
                name="Submit"
                pxClass="px-10"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Add;
