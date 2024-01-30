import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import {
  Input,
  RenderInputFields,
  SelectInput,
  SubmitButton,
} from "../Form/Form";

const Edit = (props) => {
  const { id: recordId } = props.match.params;
  const history = useHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    control,
  } = useForm();

  const { response: responseReel, request: requestReel } = useRequest();
  const { response, request } = useRequest();

  const [file, setFile] = useState();

  useEffect(() => {
    if (recordId) {
      requestReel("GET", `reel/${recordId}`);
      document.title = "Edit Reel/Product Promotional Video - Noonmar";
    }
  }, [recordId]);

  useEffect(() => {
    if (responseReel) {
      const { video } = responseReel.data;
      setFile(video);
      // setValue("video", video);
    }
  }, [responseReel]);

  useEffect(() => {
    if (response) {
      toast.success("Reel has been updated successfully.");
      history.push("/product-promotional-videos");
    }
  }, [response]);

  const onSubmit = (data) => {
    const { video } = data;

    let fd = new FormData();

    fd.append("id", recordId);

    if (video.length > 0) {
      fd.append("video", video[0]);
    }
    request("PUT", "reel", fd);
  };

  const handleVideo = (event) => {
    event.preventDefault();
    setError("video", "");
  };

  // const handleRemoveMedia = () => {
  //   setValue("video", "");
  //   setFile("");
  // };

  const InputFields = [
    [
      {
        Component: Input,
        label: "Video",
        type: "file",
        name: "video",
        registerFields: {
          required: false,
        },
        handleMedia: handleVideo,
        isMedia: true,
        accept: ".mp4",
        video: file,
        control,
        // handleRemoveMedia: handleRemoveMedia,
      },
    ],
  ];

  return (
    <div
      className="content  d-flex flex-column flex-column-fluid"
      id="kt_content"
    >
      <Breadcrumb
        title="Edit Reel/Product Promotional Video"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: {
              pathname: "/product-promotional-videos" /*backPageNum: page */,
            },
            name: "Back To Reels/Product Promotional Videos",
          },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card">
            <div className="card-body EditReel_Video">
              <div className="row">
                <div className="col-xl-1"></div>
                <div className="col-xl-10">
                  <h3 className="mb-10 font-weight-bold text-dark">
                    Edit Reel
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
