import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useHistory, useParams } from "react-router-dom";
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

const Edit = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm();

  const { id } = useParams();


  const [emailConstants, setEmailConstants] = useState([]);

  const { response, request } = useRequest();
  const { response: getDataRes, request: getDataReq } = useRequest();  

  const history = useHistory();

  useEffect(() => {
    getDataReq('GET', `notification-template/${id}`)
    document.title = "Edit Notification Template - Noonmar";
  }, []);

  useEffect(() => {
    if (getDataRes) {
      const { name, subject, constants, body } = getDataRes.notificationTemplate
      setValue('name', name);
      setValue('subject', subject);
      setValue('email_template_body', body);

      setEmailConstants(constants)
    }
  }, [getDataRes]);



 

  useEffect(() => {
    if (response) {
      toast.success("Notification Template has been added successfully.");
      history.push("/notification-templates");
    }
  }, [response]);

  const insertConstantHandlerInNotification = () => {
    let constant = getValues("constant");

    if (!constant) {
      return;
    }

    constant = `{${constant}}`;

    const textareas = document.getElementsByName(`email_template_body`);

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
      `email_template_body`,
      textBeforeCursorPosition + constant + textAfterCursorPosition
    );
  };

  const onSubmit = (data) => {

    let { name, subject, action, email_template_body } = data;

    request("PUT", "notification-template", {
      id,
      name,
      subject,
      body: email_template_body,
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
        name: `email_template_body`,
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
        title="Edit Notification Template"
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
                    Edit Notification Template
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

export default Edit;
