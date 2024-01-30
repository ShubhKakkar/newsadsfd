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
} from "../Form/Form";

const Add = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    control,
  } = useForm();

  const { response, request } = useRequest();
  const history = useHistory();

  useEffect(() => {
    document.title = "Add Reel/Product Promotional Video - Noonmar";
  }, []);

  useEffect(() => {
    if (response) {
      toast.success("Reel has been added successfully.");
      history.push("/product-promotional-videos");
    }
  }, [response]);

  const onSubmit = (data) => {
    const { status, video } = data;

    let fd = new FormData();
    fd.append("status", status);
    fd.append("type", "productPromotional");
    if (video) {
      fd.append("video", video[0]);
    }
    request("POST", "reel", fd);
  };

  const handleVideo = (event) => {
    event.preventDefault();
    setError("video", "");
  };

  const InputFields = [
    [
      {
        Component: Input,
        label: "Video",
        type: "file",
        name: "video",
        registerFields: {
          required: true,
        },
        handleMedia: handleVideo,
        isMedia: true,
        accept: ".mp4",
        control,
      },
      {
        Component: SelectInput,
        label: "Status",
        name: "status",
        registerFields: {
          required: true,
        },
        children: (
          <>
            <option value="">Select status</option>
            <option value="Draft">Draft</option>
            <option value="Published">Publish</option>
          </>
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
        title="Add Reel/Product Promotional Video"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: "/product-promotional-videos",
            name: "Back To Reels/Product Promotional Videos",
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
                    Add New Reel
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
