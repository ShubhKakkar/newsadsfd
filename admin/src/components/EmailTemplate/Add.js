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

const Add = () => {
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

  const [emailActions, setEmailActions] = useState([]);
  const [emailConstants, setEmailConstants] = useState([]);

  const { response, request } = useRequest();
  const { response: responseEmailActions, request: requestEmailActions } =
    useRequest();
  const { response: responseConstants, request: requestConstants } =
    useRequest();

  const history = useHistory();

  useEffect(() => {
    register("body", { required: true });
    requestEmailActions("GET", "email-action/all");
    document.title = "Add Email Template - Noonmar";
  }, []);

  useEffect(() => {
    if (responseEmailActions) {
      setEmailActions(responseEmailActions.emailActions || []);
    }
  }, [responseEmailActions]);

  useEffect(() => {
    if (responseConstants) {
      setEmailConstants(responseConstants.emailAction.constants);
    }
  }, [responseConstants]);

  useEffect(() => {
    if (response) {
      toast.success("Email Template has been added successfully.");
      history.push("/email-template");
    }
  }, [response]);

  const constantHandler = (id) => {
    if (!id) {
      return;
    }
    requestConstants("GET", `email-action/${id}`);
  };

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
    const { action, body, name, subject } = data;
    request("POST", "email-template", {
      action,
      body,
      name,
      subject,
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
        label: "Action",
        name: "action",
        registerFields: {
          required: true,
          minLength: 1,
        },
        onChange: constantHandler,
        children: (
          <>
            <option value="">{"Select Page Name"}</option>
            {emailActions.length > 0 &&
              emailActions.map((action) => (
                <option key={action._id} value={action._id}>
                  {action.action}
                </option>
              ))}
          </>
        ),
      },
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
        getValues,
        setValue,
        trigger,
        inputData: {
          onInstanceReady: (editor) => {
            ckEditorRef.current = editor;
          },
        },
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
        title="Add Email Template"
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
                    Add New Email Template
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
                      name="Submit"
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

export default Add;
