import React, { Fragment, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import moment from "moment";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { Input, Textarea, SubmitButton } from "../Form/Form";
import { addSetting } from "../../store/setting/action";
import { API } from "../../constant/api";

const FilterKey = ["Reading.date_time_format", "Reading.date_format"];

const ViewPrefix = (props) => {
  const { prefix } = props.match.params;

  const [prefixSettings, setPrefixSettings] = useState([]);
  const [otherInputs, setOtherInputs] = useState([]);
  const [fileInputs, setFileInputs] = useState([]);

  const history = useHistory();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm();

  const { response: responseFetchSetting, request: requestFetchSetting } =
    useRequest();

  const { response, request } = useRequest();

  useEffect(() => {
    if (prefix) {
      requestFetchSetting("GET", `setting/all-prefix/${prefix}`);
      document.title = `${prefix} Setting - Noonmar`;
    }
  }, [prefix]);

  useEffect(() => {
    if (responseFetchSetting) {
      const { prefixSettings } = responseFetchSetting;

      if (prefixSettings.length == 0) {
        history.push("/");
        return;
      }

      setPrefixSettings(prefixSettings);

      const otherInputs = [];
      const fileInputs = [];

      prefixSettings.forEach((setting) => {
        if (setting.inputType == "checkbox") {
          setValue(setting.key, setting.selected);
        } else {
          setValue(setting.key, setting.selected || setting.value);
        }
        if (
          setting.inputType == "select" ||
          setting.inputType == "checkbox" ||
          setting.inputType == "radio"
        ) {
          otherInputs.push(setting.key.split(".")[1]);
        }

        if (setting.inputType == "file") {
          fileInputs.push(setting.key.split(".")[1]);
          // setValue(`${setting.key}-new`, setting.value);
        }
      });

      setOtherInputs(otherInputs);
      setFileInputs(fileInputs);
    }
  }, [responseFetchSetting]);

  useEffect(() => {
    if (response) {
      const { setting } = response;

      if (setting.length > 0) {
        const toRedux = {};
        setting.forEach((se) => {
          const k = se.key.split(".")[1];
          toRedux[k] = se.selected || se.value;
        });
        dispatch(addSetting(toRedux));
      }
      toast.success("Setting has been updated successfully.");
    }
  }, [response]);

  const onSubmit = (data) => {
    const dataSub = data[prefix];

    const dataToSubmit = [];
    const otherdataToSubmit = [];

    const formData = new FormData();
    let images = [];
    let imagesKey = [];

    for (let key in dataSub) {
      if (otherInputs.includes(key)) {
        otherdataToSubmit.push({
          key: `${prefix}.${key}`,
          selected: dataSub[key],
        });
      } else if (fileInputs.includes(key)) {
        if (dataSub[`${key}-new`] && dataSub[`${key}-new`].length > 0) {
          //upload file
          // images.push(dataSub[`${key}-new`][0]);
          formData.append("images", dataSub[`${key}-new`][0]);

          imagesKey.push(`${prefix}.${key}`);
        } else {
          dataToSubmit.push({ key: `${prefix}.${key}`, value: dataSub[key] });
        }
      } else {
        dataToSubmit.push({ key: `${prefix}.${key}`, value: dataSub[key] });
      }
    }

    // formData.append("images", images);
    formData.append("imagesKey", JSON.stringify(imagesKey));
    formData.append("data", JSON.stringify(dataToSubmit));
    formData.append("otherData", JSON.stringify(otherdataToSubmit));

    // request("PUT", "setting/all-prefix", {
    //   data: dataToSubmit,
    //   otherData: otherdataToSubmit,
    // });

    request("PUT", "setting/all-prefix", formData);
  };

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title={`${prefix} Setting`}
        links={[
          { to: "/", name: "Dashboard" },
          // { to: "/setting", name: "Back To Setting" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-xl-12">
                  {/* <h3 className="mb-10 font-weight-bold text-dark">
                    Update Setting
                  </h3> */}

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row">
                      {prefixSettings.length > 0 &&
                        prefixSettings.map((setting) => {
                          let name = setting.key;
                          let [k, v] = name.split(".");
                          let isKey = v
                            ? errors[k]
                              ? errors[k][v]
                              : errors[name]
                            : errors[name];

                          if (setting.inputType == "text") {
                            return (
                              <Input
                                key={setting._id}
                                label={setting.title}
                                type="text"
                                name={setting.key}
                                errors={errors}
                                register={register}
                                // registerFields={{ required: true }}
                                registerFields={{
                                  required: setting.isRequired,
                                }}
                                inputData={{ readOnly: !setting.isEditable }}
                              />
                            );
                          } else if (setting.inputType == "textarea") {
                            return (
                              <Textarea
                                key={setting._id}
                                label={setting.title}
                                name={setting.key}
                                errors={errors}
                                register={register}
                                registerFields={{
                                  required: setting.isRequired,
                                }}
                                inputData={{ readOnly: !setting.isEditable }}
                              />
                            );
                          } else if (setting.inputType == "select") {
                            return (
                              <div key={setting._id} className="col-xl-6">
                                <div className="form-group">
                                  <label>
                                    {setting.title}{" "}
                                    {setting.isRequired && (
                                      <span className="text-danger">*</span>
                                    )}
                                  </label>

                                  <select
                                    name={setting.key}
                                    className={`form-control form-control-solid form-control-lg ${
                                      isKey && "is-invalid"
                                    }`}
                                    {...register(name, {
                                      required: setting.isRequired,
                                      minLength: 1,
                                    })}
                                    disabled={!setting.isEditable}
                                  >
                                    <>
                                      <option value="">Select</option>
                                      {setting.value
                                        .split(",")
                                        .map((ops, index) => {
                                          return (
                                            <option key={index} value={ops}>
                                              {FilterKey.includes(setting.key)
                                                ? moment(new Date()).format(ops)
                                                : ops}
                                            </option>
                                          );
                                        })}
                                    </>
                                  </select>

                                  {isKey?.type === "required" && (
                                    <div className="invalid-feedback">
                                      {setting.title} is required
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          } else if (setting.inputType == "checkbox") {
                            return (
                              <div key={setting._id} className="col-xl-6">
                                <div className="form-group">
                                  <label>
                                    {setting.title}{" "}
                                    {/* <span className="text-danger">*</span> */}
                                  </label>
                                  <input
                                    className="ml-2"
                                    type="checkbox"
                                    name={name}
                                    {...register(name)}
                                    readOnly={!setting.isEditable}
                                  />
                                </div>
                              </div>
                            );
                          } else if (setting.inputType == "radio") {
                            return (
                              <div key={setting._id} className="col-xl-6">
                                <div className="form-group">
                                  <label>
                                    {setting.title}{" "}
                                    {setting.isRequired && (
                                      <span className="text-danger">*</span>
                                    )}
                                  </label>
                                  <div>
                                    {setting.value
                                      .split(",")
                                      .map((op, index) => (
                                        <div key={index}>
                                          <label>{op}</label>
                                          <input
                                            type="radio"
                                            // className={`form-control form-control-solid form-control-lg ${
                                            //   isKey && "is-invalid"
                                            // }`}
                                            className={` ml-2 ${
                                              isKey ? "is-invalid" : ""
                                            }`}
                                            name={name}
                                            value={op}
                                            // placeholder={`Enter ${name}`}
                                            {...register(name, {
                                              required: setting.isRequired,
                                            })}
                                            disabled={!setting.isEditable}
                                          />
                                        </div>
                                      ))}
                                  </div>
                                  {isKey?.type === "required" && (
                                    <div className="invalid-feedback">
                                      {setting.title} is required
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          } else if (setting.inputType == "file") {
                            let data = {};
                            if (setting.value) {
                              data.children = (
                                <div className="select_imageprefix">
                                  {" "}
                                  <img
                                    src={`${API.PORT}/${setting.value}`}
                                    alt=""
                                    style={{ cursor: "pointer" }}
                                    data-fancybox
                                  />
                                </div>
                              );
                            }
                            return (
                              <Input
                                key={setting._id}
                                label={setting.title}
                                type="file"
                                name={setting.key + "-new"}
                                errors={errors}
                                register={register}
                                registerFields={{
                                  required: false,
                                }}
                                inputData={{
                                  readOnly: !setting.isEditable,
                                  accept: "image/*",
                                }}
                                {...data}
                              />
                            );
                          }
                        })}
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

export default ViewPrefix;
