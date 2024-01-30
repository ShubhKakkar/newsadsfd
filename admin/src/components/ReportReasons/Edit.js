import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { SubmitButton } from "../Form/Form";
import { SubTab, SubInput } from "../LanguageForm/LanguageForm";

const Edit = (props) => {
  const { id: recordId } = props.match.params;
  const [langDataIds, setLangDataIds] = useState([]);

  const history = useHistory();

  const { languages } = useSelector((state) => state.setting);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    trigger,
    clearErrors,
    reset,
  } = useForm();

  const { response: responseReason, request: requestReason } = useRequest();

  const { response, request } = useRequest();

  useEffect(() => {
    if (recordId) {
      document.title = "Edit Reason - Noonmar";
    }
  }, [recordId]);

  useEffect(() => {
    if (response) {
      toast.success("Reason has been updated successfully.");
      history.push("/report-reasons");
    }
  }, [response]);

  useEffect(() => {
    if (languages) {
      requestReason("GET", `report-reason/${recordId}`);
    }
  }, [languages]);

  useEffect(() => {
    if (responseReason) {
      const {
        data: { title },
        languageData,
      } = responseReason.data;
      const subData = {};

      setLangDataIds(languageData);
      languageData.forEach((lang) => {
        const code = lang.languageCode;
        subData["title-" + code] = lang.title;
      });

      reset({ title, ...subData });
    }
  }, [responseReason]);
  const onSubmit = (data) => {
    const dataToSend = [];
    const defaultData = { title: data["title"] };

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;

      const lang = langDataIds.find((obj) => {
        if (obj.languageCode == code) {
          return obj.id;
        }
      });

      dataToSend.push({
        title: data["title-" + code] ?? "",
        id: lang && lang.id ? lang.id : "",
      });

      if (languages[i].default) {
        defaultData.title = data["title-" + code];
      }
    }

    request("PUT", "report-reason", {
      id: recordId,
      ...defaultData,
      data: dataToSend,
    });
  };

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Edit Reason"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: { pathname: "/report-reasons" /*backPageNum: page */ },
            name: "Back To Report Reasons",
          },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-xl-1"></div>
                <div className="col-xl-10">
                  <h3 className="mb-10 font-weight-bold text-dark">
                    Edit Reason
                  </h3>

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
                                titleName={"title-" + lang.code}
                                titleLabel={"Title"}
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
                <div className="col-xl-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Edit;
