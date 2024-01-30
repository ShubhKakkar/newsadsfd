import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import useRequest from "../../hooks/useRequest";
import Breadcrumb from "../Breadcrumb/Breadcrumb";

import { Input, RenderInputFields, SubmitButton } from "../Form/Form";
import { useHistory } from "react-router-dom";

const Add = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { response, request } = useRequest();
  const history = useHistory();

  useEffect(() => {
    document.title = "Add System Image- Noonmar";
  }, []);

  useEffect(() => {
    if (response) {
      toast.success("System image has been added successfully.");
      history.push("/system-images");
    }
  }, [response]);

  const onSubmit = (data) => {
    const { title, image } = data;

    const formData = new FormData();

    if (image.length !== 0) {
      formData.append("title", title);
      formData.append("file", image[0]);
    }

    // formData.append("oldPageBanner", oldBanner);

    request("POST", "system-image", formData);
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
        label: "System Image",
        name: "image",
        type: "file",
        registerFields: {
          required: true,
        },
        inputData: {
          accept: "image/*",
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
        title="System Image"
        links={[
          { to: "/", name: "Dashboard" },
          { to: "/system-images", name: "Back To System Images" },
        ]}
      />

      <div className="d-flex flex-column-fluid">
        <div className=" container ">
          <div className="card card-custom ">
            <div class="card-header">
              <h3 class="card-title">Add New System Image</h3>
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
                      name="Submit"
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
