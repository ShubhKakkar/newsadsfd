import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import {
  Textarea,
  RenderInputFields,
  SubmitButton,
  Input,
  CKEditorInput,
  SubTab,
  SubInput,
} from "../Form/Form";

const Edit = (props) => {
  const { id: faqId } = props.match.params;

  const [langDataIds, setLangDataIds] = useState([]);
  const { languages } = useSelector((state) => state.setting);

  const history = useHistory();
  // const ckEditorRef = useRef();

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

  const { response: responseFetchFaq, request: requestFetchFaq } = useRequest();

  const { response, request } = useRequest();

  useEffect(() => {
    if (faqId) {
      document.title = "Edit Faq - Noonmar";
    }
  }, [faqId]);

  useEffect(() => {
    if (languages) {
      languages.forEach((lang, index) => {
        register(`answer-${lang.code}`, { required: lang.default });
        register(`answer-${lang.code}`);
      });

      requestFetchFaq("GET", `faq/${faqId}`);
    }
  }, [languages]);

  useEffect(() => {
    if (responseFetchFaq) {
      const { languageData } = responseFetchFaq.faq[0];

      const subData = {};

      languageData.forEach((lang) => {
        const code = lang.languageCode;
        subData["question-" + code] = lang.question;
        subData["answer-" + code] = lang.answer;
        setLangDataIds((prev) => [...prev, lang.id]);
      });

      reset(subData);
    }
  }, [responseFetchFaq]);

  useEffect(() => {
    if (response) {
      toast.success("FAQ has been updated successfully.");
      history.push("/faq");
    }
  }, [response]);

  const onSubmit = (data) => {
    const dataToSend = [];
    const defaultData = {};

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;
      dataToSend.push({
        question: data["question-" + code] ?? " ",
        answer: data["answer-" + code] ?? " ",
        id: langDataIds[i],
      });

      if (languages[i].default) {
        defaultData.question = data["question-" + code];
        defaultData.answer = data["answer-" + code];

        // if (data["answer-" + code].length === 0) {
        //   setError("answer-" + code, {
        //     type: "required",
        //   });
        //   return;
        // }
      }
    }

    request("PUT", "faq", {
      ...defaultData,
      subData: dataToSend,
      id: faqId,
    });
  };

  const InputFields = [
    [
      {
        Component: Input,
        type: "text",
        label: "Question",
        name: "question",
        colClass: "col-lg-12",
        registerFields: {
          required: true,
        },
      },
    ],
    [
      // {
      //   Component: Textarea,
      //   label: "Answer",
      //   name: "answer",
      //   colClass: "col-lg-12",
      //   registerFields: {
      //     required: true,
      //   },
      // },
      {
        Component: CKEditorInput,
        colClass: "col-xl-12",
        label: "Answer",
        name: "answer",
        registerFields: {
          required: true,
        },
        otherRegisterFields: {
          manual: true,
          feedback: "Answer is required",
        },

        // inputData: {
        //   onInstanceReady: (editor) => {
        //     ckEditorRef.current = editor;
        //   },
        // },
        getValues,
        setValue,
        trigger,
        clearErrors,
        isEdit: true,
      },
    ],
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Edit Faq"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: { pathname: "/faq" },
            name: "Back To FAQs",
          },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Edit Faq</h3>
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
                                  tabName={index + "one"}
                                  image={lang?.image}
                                />
                              ))}
                          </ul>
                        </div>
                      </div>

                      <div className="card-body px-0">
                        <div className="tab-content px-10">
                          {languages.length > 0 &&
                            languages.map((lang, index) => {
                              // const inputFields = [...InputFields];
                              // let ckEd = { ...inputFields[1][0] };
                              // ckEd.inputData = {
                              //   onInstanceReady: (editor) => {
                              //     ckEditorRef.current[lang.code] = editor;
                              //   },
                              // };

                              // inputFields[1][0] = ckEd;

                              return (
                                <SubInput
                                  key={index}
                                  index={index}
                                  errors={errors}
                                  register={register}
                                  required={lang.required}
                                  InputFields={InputFields}
                                  code={lang.code}
                                  tabName={index + "one"}
                                />
                              );
                            })}
                        </div>

                        <div className="row"></div>
                      </div>
                    </div>

                    <div className="row"></div>

                    <SubmitButton
                      handleSubmit={handleSubmit}
                      onSubmit={onSubmit}
                      name="Update"
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
