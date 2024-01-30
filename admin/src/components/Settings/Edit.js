import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { Input, Textarea, RenderInputFields, SubmitButton } from "../Form/Form";

const Edit = (props) => {
  const { id: settingId } = props.match.params;
  const { page } = props.location;
  const history = useHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const { response: responseFetchSetting, request: requestFetchSetting } =
    useRequest();

  const { response, request } = useRequest();

  useEffect(() => {
    if (settingId) {
      requestFetchSetting("GET", `setting/${settingId}`);
      document.title = "Edit Setting - Noonmar";
    }

    return history.listen((location) => {
      if (history.action === "PUSH") {
      } else if (history.action === "POP") {
        if (location.pathname === "/setting") {
          history.push({ pathname: "/setting", backPageNum: page });
        }
      }
    });
  }, [settingId]);

  useEffect(() => {
    if (responseFetchSetting) {
      const { title, key, value, inputType, isEditable, isRequired } =
        responseFetchSetting.setting;
      setValue("title", title);
      setValue("key", key);
      setValue("value", value);
      setValue("inputType", inputType);
      setValue("isEditable", isEditable);
      setValue("isRequired", isRequired);
    }
  }, [responseFetchSetting]);

  useEffect(() => {
    if (response) {
      toast.success("Setting has been updated successfully.");
      history.push("/setting");
    }
  }, [response]);

  const onSubmit = (data) => {
    const { title, key, value, inputType, isEditable, isRequired } = data;
    request("PUT", "setting", {
      title,
      key,
      value,
      inputType,
      isEditable,
      settingId,
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
        title="Edit Setting"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: { pathname: "/setting", backPageNum: page },
            name: "Back To Setting",
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
                    Update Setting
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
