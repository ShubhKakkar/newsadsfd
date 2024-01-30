import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import {
  Input,
  SelectInput,
  RenderInputFields,
  SubmitButton,
  Textarea,
} from "../Form/Form";

const Add = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm();

  const [actions, setActions] = useState([]);
  const [constants, setConstants] = useState([]);

  const { response, request } = useRequest();
  const { response: responseActions, request: requestActions } = useRequest();
  const { response: responseConstants, request: requestConstants } =
    useRequest();

  const history = useHistory();

  useEffect(() => {
    requestActions("GET", "notification-action/all");
    document.title = "Add Notification Template - Noonmar";
  }, []);

  useEffect(() => {
    if (responseActions) {
      setActions(responseActions.actions || []);
    }
  }, [responseActions]);

  useEffect(() => {
    if (responseConstants) {
      setConstants(responseConstants.action.constants);
    }
  }, [responseConstants]);

  useEffect(() => {
    if (response) {
      toast.success("Notification Template has been added successfully.");
      history.push("/notification-templates");
    }
  }, [response]);

  const constantHandler = (id) => {
    if (!id) {
      return;
    }
    requestConstants("GET", `notification-action/${id}`);
  };

  const insertConstantHandlerInNotification = () => {
    let constant = getValues("constant");

    if (!constant) {
      return;
    }

    constant = `{${constant}}`;

    const textareas = document.getElementsByName(`template_body`);

    if (textareas.length == 0) {
      return;
    }
    const textarea = textareas[0];

    let cursorPosition = textarea.selectionStart;
    let textBeforeCursorPosition = textarea.value.substring(0, cursorPosition);
    let textAfterCursorPosition = textarea.value.substring(
      cursorPosition,
      textarea.value.length
    );
    setValue(
      `template_body`,
      textBeforeCursorPosition + constant + textAfterCursorPosition
    );
  };

  const onSubmit = (data) => {
    let { name, subject, action, template_body } = data;

    request("POST", "notification-template", {
      name,
      subject,
      action,
      body: template_body,
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
            {actions.length > 0 &&
              actions.map((action) => (
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
            {constants.length > 0 &&
              constants.map((constant, index) => (
                <option key={index} value={constant}>
                  {constant}
                </option>
              ))}
          </>
        ),
        moreData: (
          <button
            onClick={insertConstantHandlerInNotification}
            type="button"
            className="btn btn-success font-weight-bold text-uppercase px-9 py-4"
          >
            Insert
          </button>
        ),
      },
      {
        Component: Textarea,
        label: "Body",
        type: "text",
        name: `template_body`,
        inputData: {
          placeholder: "Enter the notification body",
        },
        registerFields: {
          required: true,
        },
      },
    ],
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Add Notification Template"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: "/notification-templates",
            name: "Back To Notification Template",
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
                    Add New Notification Template
                  </h3>

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <RenderInputFields
                      InputFields={InputFields}
                      errors={errors}
                      register={register}
                    />

                    <div className="row"></div>

                    <button
                      onClick={handleSubmit(onSubmit)}
                      style={{ display: "none" }}
                    ></button>

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
