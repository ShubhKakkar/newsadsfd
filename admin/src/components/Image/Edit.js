import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { API } from "../../constant/api";

import { Input, RenderInputFields, SubmitButton } from "../Form/Form";

const IMG_TITLE = {
  Successful: "570*530",
  Signup: "570*530",
  Verify: "570*530",
  "Reset Password": "570*530",
  "Forgot Password": "570*530",
  Login: "570*530",
};

const Edit = (props) => {
  const { id: systemImagesId } = props.match.params;
  const [titleImage, setTitleImage] = useState("");

  const [oldImg, setOldImg] = useState("");

  const history = useHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const { response: responseFetchSystemImg, request: requestFetchSystemImg } =
    useRequest();

  const { response, request } = useRequest();

  useEffect(() => {
    document.title = "Edit System Image - Noonmar";
  }, []);

  useEffect(() => {
    if (systemImagesId) {
      requestFetchSystemImg("GET", `system-image/${systemImagesId}`);
    }
  }, [systemImagesId]);

  useEffect(() => {
    if (responseFetchSystemImg) {
      const { title, image } = responseFetchSystemImg.systemImage;
      setValue("title", title);
      setTitleImage(title);
      setOldImg(image);
    }
  }, [responseFetchSystemImg]);

  useEffect(() => {
    if (response) {
      toast.success("System image has been updated successfully.");
      history.push("/system-images");
    }
  }, [response]);

  const onSubmit = (data) => {
    const { title, banner } = data;

    const formData = new FormData();

    if (banner.length !== 0) {
      formData.append("file", banner[0]);
    }

    formData.append("title", title);
    formData.append("oldImage", oldImg);
    formData.append("id", systemImagesId);

    request("PUT", "system-image", formData);
  };

  const InputFields = [
    [
      {
        Component: Input,
        label: "Title",
        type: "text",
        name: "title",
        inputData: { disabled: true },
        registerFields: {
          required: false,
        },
      },
      {
        Component: Input,
        label: "Image",
        name: "banner",
        type: "file",
        tooltip: {
          show: true,
          title: `Minimum required resolution ${IMG_TITLE[titleImage]}`,
        },
        registerFields: {
          // required: true,
        },
        inputData: {
          accept: "image/*",
        },
        children: oldImg && (
          <img
            src={`${API.PORT}/${oldImg}`}
            width={100}
            height={100}
            alt=""
            style={{ cursor: "pointer" }}
            data-fancybox
          />
        ),
      },
    ],
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Image"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: { pathname: "/system-images" },
            name: "Back To System Images",
          },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">System Images</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-xl-12">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Edit;
