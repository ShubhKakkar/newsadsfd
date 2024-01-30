import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import {
  Input,
  SelectInput,
  Textarea,
  RenderInputFields,
  SubmitButton,
} from "../Form/Form";

const validInputType = [
  "text",
  "textarea",
  "select",
  "checkbox",
  "radio",
  "file",
];

const Add = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    // resetField,
  } = useForm();

  const { response, request } = useRequest();

  const history = useHistory();

  useEffect(() => {
    document.title = "Add Setting - Noonmar";
  }, []);

  useEffect(() => {
    if (response) {
      toast.success("Setting has been added successfully.");
      // resetField("title");
      // resetField("key");
      // resetField("value");
      // resetField("inputType");
      // resetField("isEditable");

      history.push("/setting");
    }
  }, [response]);

  const onSubmit = (data) => {
    const { title, key, value, inputType, isEditable, isRequired } = data;

    if (!validInputType.includes(inputType.toLowerCase())) {
      alert("Invalid input type");
      return;
    }
    request("POST", "setting", {
      title,
      key,
      value,
      inputType: inputType.toLowerCase(),
      isEditable,
      isRequired,
    });
  };

  const InputFields = [
    [
      {
        Component: Input,
        label: "Title",
        type: "text",
        name: "title",
        registerFields: {
          required: true,
        },
      },
      {
        Component: Input,
        label: "Key",
        type: "text",
        name: "key",
        registerFields: {
          required: true,
        },
      },
    ],
    [
      {
        Component: Textarea,
        label: "Value",
        name: "value",
        registerFields: {
          required: true,
        },
      },
      {
        Component: Input,
        label: "Input Type",
        name: "inputType",
        registerFields: {
          required: true,
        },
      },
      // {
      //   Component: SelectInput,
      //   label: "Input Type",
      //   name: "inputType",
      //   registerFields: {
      //     required: true,
      //     minLength: 1,
      //   },
      //   children: (
      //     <>
      //       <option value="">Select Input</option>
      //       <option value="input">Text</option>
      //       <option value="textarea">Text Area</option>
      //     </>
      //   ),
      // },
    ],
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Add Setting"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/setting", name: "Back To Setting" },
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
                    Add New Setting
                  </h3>

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <RenderInputFields
                      InputFields={InputFields}
                      errors={errors}
                      register={register}
                    />

                    <div className="row">
                      <div className="col-xl-6">
                        <div className="form-group">
                          <label>
                            Editable <span className="text-danger">*</span>
                          </label>
                          <input
                            type="checkbox"
                            name="editable"
                            {...register("isEditable")}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-xl-6">
                        <div className="form-group">
                          <label>
                            Required <span className="text-danger">*</span>
                          </label>
                          <input
                            type="checkbox"
                            name="editable"
                            {...register("isRequired")}
                          />
                        </div>
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
