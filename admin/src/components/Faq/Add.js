import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
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

const Add = () => {
  const { languages } = useSelector((state) => state.setting);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    getValues,
    clearErrors,
  } = useForm();

  const ckEditorRef = useRef();

  const { response, request } = useRequest();

  const history = useHistory();

  useEffect(() => {
    document.title = "Add Faq - Noonmar";
  }, []);

  useEffect(() => {
    if (languages) {
      ckEditorRef.current = {};

      languages.forEach((lang, index) => {
        register(`answer-${lang.code}`, { required: lang.default });

        ckEditorRef.current[lang.code] = null;
      });
    }
  }, [languages]);

  useEffect(() => {
    if (response) {
      toast.success("Faq has been added successfully.");
      history.push("/faq");
    }
  }, [response]);

  const onSubmit = (data) => {
    const dataToSend = [];
    const defaultData = {};

    for (let i = 0; i < languages.length; i++) {
      const code = languages[i].code;

      dataToSend.push({
        languageCode: code,
        question: data["question-" + code] ?? " ",
        answer: data["answer-" + code] ?? " ",
      });

      if (languages[i].default) {
        defaultData.question = data["question-" + code];
        defaultData.answer = data["answer-" + code];
      }
    }

    if (!defaultData.answer || defaultData.answer.trim().length === 0) {
      toast.error("Please add answer in english section.");
      return;
    }

    request("POST", "faq", { ...defaultData, subData: dataToSend });
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
      {
        Component: CKEditorInput,
        colClass: "col-xl-12",
        label: "Answer",
        name: "answer",
        registerFields: {
          required: true,
        },
        getValues,
        setValue,
        trigger,
        // inputData: {
        //   onInstanceReady: (editor) => {
        //     ckEditorRef.current = editor;
        //   },
        // },
        clearErrors,
        isEdit: false,
      },
    ],
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Add Faq"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/faq", name: "Back To FAQs" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Add New Faq</h3>
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
                      name="Submit"
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

export default Add;
