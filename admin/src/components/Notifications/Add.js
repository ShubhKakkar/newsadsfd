import React, { useEffect, useState, useRef } from "react";
import { useForm,Controller } from "react-hook-form";
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
import Select from "react-select";

const Add = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm();

  const [users, setUsers]                                                   = useState([]);
  const [toUser, setToUser]                                                 = useState([]);

  const { response: responseUsers, request: requestUsers }                  = useRequest();
  const { response: responseNotification, request: requestNotification }    = useRequest();

  const history = useHistory();

  useEffect(() => {
    document.title = "Send Notification - Noonmar";
    requestUsers("GET", "notification-log/user-list");

    register('toUser', {
          required: true
        });
  }, []);

 

  useEffect(() => {
    if(responseUsers){
        setUsers(responseUsers.data);
    }
  },[responseUsers])

  const onSubmit = (data) => {
    requestNotification("POST", "notification-log", data);
  };


  useEffect(() => {
    if (responseNotification) {
      toast.success("Notifications sent successfully");
      history.push("/notifications");
    }
  }, [responseNotification]);

  const InputFields = [
    [
      
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
        title="Send Notification"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: "/notifications",
            name: "Back To Notifications",
          },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Send Notification</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-xl-12">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row">
                      <div className="col-xl-6">
                        <div className="form-group">
                          <label>
                            To User
                            <span className="text-danger">*</span>
                          </label>

                          <Controller
                            control={control}
                            name="toUser"
                            // {...register("toUser", {
                            //   required: true,
                            // })}
                            render={({ field: { onChange, value, ref } }) => (
                              <Select
                                isMulti
                                onChange={(val) => {
                                  const isSelectAllAvailable = val.find(
                                    (v) => v.value == "all"
                                  );

                                  if (isSelectAllAvailable) {
                                    onChange([
                                      { value: "all", label: "Select All" },
                                    ]);
                                  } else {
                                    return onChange(val);
                                  }
                                }}
                                defaultValue={toUser}
                                value={value}
                                // inputRef={ref}

                                options={[
                                  { value: "all", label: "Select All" },
                                  ...users.map((val) => {
                                    return {
                                      value: val._id,
                                      label: val.name || val.userId,
                                    };
                                  }),
                                ]}
                                className={`basic-multi-select ${
                                  errors.toUser ? "is-invalid" : ""
                                }`}
                                classNamePrefix="select"
                                menuPosition="fixed"
                              />
                            )}
                          />
                          {errors.toUser?.type === "required" && (
                            <div className="invalid-feedback">
                              The to user field is required.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>



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
                      name="Send"
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
