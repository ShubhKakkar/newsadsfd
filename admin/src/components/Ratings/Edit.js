import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { Input, RenderInputFields, SubmitButton, Textarea } from "../Form/Form";
import { API } from "../../constant/api";

const apiName = "review";
const titleSingular = "Reviews";

const Edit = (props) => {
  const { id } = props.match.params;
  const history = useHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm();

  const { response: responseFetch, request: requestFetch } = useRequest();

  const { response, request } = useRequest();

  const [files, setFiles] = useState([]);
  const [isActive, setIsActive] = useState();

  useEffect(() => {
    if (id) {
      requestFetch("GET", `review/${id}`);
      document.title = `Edit ${titleSingular} - Noonmar`;
    }
  }, [id]);

  useEffect(() => {
    if (responseFetch) {
      const { rating, review, files, isActive } = responseFetch.review;
      setFiles(files);
      setValue("rating", rating);
      setValue("review", review);
      setIsActive(isActive);
    }
  }, [responseFetch]);

  useEffect(() => {
    if (response) {
      toast.success(response.message);
      history.push("/reviews");
    }
  }, [response]);

  const handleRemoveMedia = (index) => {
    const updatedImages = [...files];
    updatedImages.splice(index, 1);
    setFiles(updatedImages);
  };

  const onSubmit = (data) => {
    const { rating, review } = data;

    request("PUT", apiName, {
      id: id,
      rating: rating,
      review: review,
      files: files,
      isActive: isActive,
    });
  };

  const InputFields = [
    [
      {
        Component: Input,
        label: "Rating",
        type: "number",
        name: "rating",
        registerFields: {
          required: true,
          min: 1,
          max: 5,
          validate: (value) =>
            !isNaN(Number(value)) || "Please give valid rating",
        },
      },
      {
        Component: Textarea,
        label: "Review",
        type: "text",
        name: "review",
        registerFields: {
          required: true,
        },
      },
      {
        Component: Input,
        label: "Images",
        type: "hidden",
        name: "profilePic",
        registerFields: {
          required: false,
          setValueAs: (v) => v.trim(),
        },
        handleMedia: () => {},
        isMedia: true,
        accept: ".png, .jpg, .jpeg",
        control,
        children:
          files && files.length > 0 ? (
            <>
              <div className="row">
                {files.map((obj, index) => (
                  <>
                    <div className="col-sm-3 m-2">
                      <img
                        src={`${API.PORT}/${obj}`}
                        width={110}
                        height={75}
                        alt=""
                        style={{ cursor: "pointer", marginBottom: "10px" }}
                        data-fancybox
                      />
                      <Link
                        to="#"
                        onClick={() => handleRemoveMedia(index)}
                        className="mx-3"
                      >
                        Remove
                      </Link>
                    </div>
                  </>
                ))}
              </div>
            </>
          ) : (
            <p>No Review Image Uploaded</p>
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
        title="Edit Reviews"
        links={[
          { to: "/", name: "Dashboard" },
          {
            to: { pathname: "/reviews" /*backPageNum: page */ },
            name: "Back To Reviews",
          },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom">
            <div class="card-header">
              <h3 class="card-title">Edit Reviews</h3>
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
