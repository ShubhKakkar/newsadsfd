import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import {
  Input,
  CKEditorInput,
  SelectInput,
  RenderInputFields,
  SubmitButton,
} from "../Form/Form";

const Edit = (props) => {
  const { id: emailTemplateId } = props.match.params;

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

  const ckEditorRef = useRef();

  const [emailConstants, setEmailConstants] = useState([]);

  const { response, request } = useRequest();

  const { response: responseFetchTemplate, request: requestFetchTemplate } =
    useRequest();

  const history = useHistory();

  useEffect(() => {
    register("body", { required: true });
    requestFetchTemplate("GET", `email-template/${emailTemplateId}`);
    document.title = "Edit Email Template - Noonmar";
  }, []);

  useEffect(() => {
    if (responseFetchTemplate) {
      const { body, constants, name, subject } =
        responseFetchTemplate.emailTemplate[0];
      reset({ body, name, subject });
      setEmailConstants(constants);
    }
  }, [responseFetchTemplate]);

  useEffect(() => {
    if (response) {
      toast.success("Email Template has been updated successfully.");
      history.push("/email-template");
    }
  }, [response]);

  const insertConstantHandler = () => {
    const constant = getValues("constant");
    if (constant.length == 0) {
      return;
    }

    // ckEditorRef.current.model.change((writer) => {
    //   writer.insertText(
    //     `{${constant}}`,
    //     ckEditorRef.current.model.document.selection.getFirstPosition()
    //   );
    // });
    ckEditorRef.current.editor.insertText(`{${constant}}`);
  };

  const onSubmit = (data) => {
    const { body, name, subject } = data;
    if (body.length === 0) {
      setError("body", {
        type: "manual",
      });
      return;
    }
    request("PUT", "email-template", {
      body,
      name,
      subject,
      id: emailTemplateId,
    });
  };

  const InputFields = [
    [
      {
        Component: Input,
        label: "Name",
        type: "text",
        name: "name",
        registerFields: {
          required: true,
          disabled: true,
        },
      },
      {
        Component: Input,
        label: "Subject",
        type: "text",
        name: "subject",
        registerFields: {
          required: true,
        },
      },
    ],
    [
      {
        Component: SelectInput,
        label: "Constants",
        name: "constant",
        registerFields: {},
        children: (
          <>
            <option value="">{"Select Constant"}</option>
            {emailConstants.length > 0 &&
              emailConstants.map((constant, index) => (
                <option key={index} value={constant}>
                  {constant}
                </option>
              ))}
          </>
        ),
        moreData: (
          <button
            onClick={insertConstantHandler}
            type="button"
            className="btn btn-success font-weight-bold text-uppercase px-9 py-4"
          >
            Insert
          </button>
        ),
      },
    ],
    [
      {
        Component: CKEditorInput,
        colClass: "col-xl-12",
        label: "Email Body",
        name: "body",
        registerFields: {
          required: true,
        },
        otherRegisterFields: {
          manual: true,
          feedback: "Email Body is required",
        },

        inputData: {
          onInstanceReady: (editor) => {
            ckEditorRef.current = editor;
          },
        },
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
        title="Edit Email Template"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/email-template", name: "Back To Email Template" },
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
                    Update Email Template
                  </h3>

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
                      name="Update"
                    />
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
