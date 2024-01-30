import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import { SubTab, SubInput } from "./TabNInput";
import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { Input, SubmitButton } from "../Form/Form";

const Edit = (props) => {
  const { id: cmsId } = props.match.params;

  const [langDataIds, setLangDataIds] = useState([]);
  const { languages } = useSelector((state) => state.setting);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    getValues,
    reset,
    setError,
    clearErrors,
  } = useForm();

  const history = useHistory();

  const { response, request } = useRequest();

  const { response: responseFetchCms, request: requestFetchCms } = useRequest();

  useRequest();

  useEffect(() => {
    document.title = "Edit CMS - Noonmar";
  }, []);

  useEffect(() => {
    if (languages) {
      languages.forEach((lang, index) => {
        if (lang.default) {
          register(`description-${lang.code}`, { required: true });
        } else {
          register(`description-${lang.code}`);
        }
      });

      requestFetchCms("GET", `cms/${cmsId}`);
    }
  }, [languages]);

  useEffect(() => {
    if (responseFetchCms) {
      const {
        data: { name },
        languageData,
      } = responseFetchCms.cms[0];
      const subData = {};

      languageData.forEach((lang) => {
        const code = lang.languageCode;
        subData["title-" + code] = lang.title;
        subData["description-" + code] = lang.description;
        setLangDataIds((prev) => [...prev, lang.id]);
      });

      reset({ name, ...subData });
    }
  }, [responseFetchCms]);

  useEffect(() => {
    if (response) {
      toast.success("CMS Page has been updated successfully.");
      history.push("/cms");
    }
  }, [response]);

  const onSubmit = (data) => {
    const dataToSend = [];
    const defaultData = { name: data["name"] };

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;
      dataToSend.push({
        title: data["title-" + code] ?? "",
        description: data["description-" + code] ?? "",
        id: langDataIds[i],
      });

      if (languages[i].default) {
        defaultData.title = data["title-" + code];
        defaultData.description = data["description-" + code];

        if (data["description-" + code].length === 0) {
          setError("description-" + code, {
            type: "required",
          });
          return;
        }
      }
    }

    request("PUT", "cms", { id: cmsId, ...defaultData, data: dataToSend });
  };

  const InputFields = [
    {
      Component: Input,
      label: "Page Name",
      type: "text",
      name: "name",
      registerFields: {
        required: true,
        // disabled: true,
      },
      inputData: { readOnly: true },
    },
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Edit CMS Page"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/cms", name: "Back To CMS Page" },
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
                        titleName={"title-" + lang.code}
                        descName={"description-" + lang.code}
                        clearErrors={clearErrors}
                        isEdit={true}
                      />
                    ))}
                </div>

                <SubmitButton
                  handleSubmit={handleSubmit}
                  onSubmit={onSubmit}
                  name="Update"
                  pxClass="px-10"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Edit;
